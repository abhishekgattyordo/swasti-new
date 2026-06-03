import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { transcript, patientId } = await request.json();
    if (!transcript || typeof transcript !== "string") {
      return NextResponse.json({ error: "Valid transcript is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 503 });
    }

    const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });

    const systemPrompt = `You are an AI clinical assistant. Parse the doctor's spoken command and extract task details. 
Current patient ID (for reference only, do not force): ${patientId}. 
If the command mentions a bed number (e.g., "Bed 3"), you may output patientId as "pat-1","pat-2", etc. based on your knowledge, but it's optional.

Output a JSON object with these fields:
- taskType: one of "vitals","medication","lab","dressing","procedure","documentation","other"
- customTaskType: string (only if taskType is "other")
- title: string (the main task headline)
- description: string (detailed instructions)
- priority: "high","medium","low"
- dueDate: YYYY-MM-DD (if "today" -> current date; if "tomorrow" -> next day; if "in X days" -> calculate)
- dueTime: HH:MM (24-hour format)
- assignedTo: nurse name (match from common names like Sarah Jenkins, Marcus Vance, Emily Carter, Julie Taylor, David Zhang – use the one mentioned)
- notes: string (extra warnings or remarks)

If a field is not mentioned, infer sensibly (e.g., priority "medium" if not specified). Return only valid JSON, no extra text.`;

    const userPrompt = `Clinical command: "${transcript}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "user", parts: [{ text: userPrompt }] }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            taskType: { type: Type.STRING },
            customTaskType: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            priority: { type: Type.STRING },
            dueDate: { type: Type.STRING },
            dueTime: { type: Type.STRING },
            assignedTo: { type: Type.STRING },
            notes: { type: Type.STRING }
          },
          required: ["title", "priority", "dueDate", "dueTime", "assignedTo"]
        }
      }
    });

    const result = JSON.parse(response.text?.trim() || "{}");
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("AI parse error:", err);
    return NextResponse.json(
      { error: "Failed to parse speech. Please try again or fill manually." },
      { status: 500 }
    );
  }
}