import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { diagnosis, clinicalNotes, vitals } = await request.json();

    if (!diagnosis && !clinicalNotes) {
      return NextResponse.json(
        { error: "At least diagnosis or clinical notes are required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      return NextResponse.json(
        { error: "Gemini API key not configured." },
        { status: 503 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } },
    });

    const systemPrompt = `You are an expert clinical AI assistant. Based on the doctor's diagnosis, clinical notes, and patient vitals, produce:
1. A single‑paragraph **deep analysis** that explains the clinical reasoning, pathophysiology, and key takeaways.
2. A list of **precautions** (bullet points) that the patient should follow, considering the diagnosis and vitals.

Be concise, medically accurate, and patient‑friendly for the precautions.`;

    const userPrompt = `
Diagnosis: ${diagnosis || "Not specified"}
Clinical Notes: ${clinicalNotes || "Not provided"}
Vitals (if available):
- BP: ${vitals?.bp || "N/A"}
- HR: ${vitals?.hr || "N/A"} bpm
- Temp: ${vitals?.temp || "N/A"} °C
- Weight: ${vitals?.weight || "N/A"} kg
- RR: ${vitals?.rr || "N/A"} /min
- SpO₂: ${vitals?.spo2 || "N/A"} %

Generate a JSON object with fields:
- deepAnalysis (string)
- precautions (array of strings)
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "user", parts: [{ text: userPrompt }] },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            deepAnalysis: { type: Type.STRING },
            precautions: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["deepAnalysis", "precautions"],
        },
      },
    });

    const result = JSON.parse(response.text?.trim() || "{}");
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("AI insights error:", err);
    return NextResponse.json(
      { error: "Failed to generate clinical insights." },
      { status: 500 }
    );
  }
}