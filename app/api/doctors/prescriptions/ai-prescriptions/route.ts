import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { transcript } = await request.json();
    if (!transcript || typeof transcript !== "string") {
      return NextResponse.json({ error: "Valid transcript is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 503 });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' }
      }
    });

    const systemPrompt = `You are an AI clinical assistant for medication administration. Parse the nurse's spoken command and extract medication administration details.

Output a JSON object with these fields:
- medicationName: string (the drug name, capitalized, e.g., "Paracetamol", "Furosemide")
- dosage: string (e.g., "500mg", "2 tablets", "5ml")
- route: one of "Oral", "IV", "IM", "SC", "Topical", "Inhalation", "Sublingual", "Rectal"
- scheduledTime: string in HH:MM 24-hour format. If "now" use current time (e.g., "14:30"), if "in X hours" calculate accordingly.
- duration: number (days of treatment, optional, e.g., 7)
- frequency: one of "OD", "BD", "TID", "QID", "SOS", "STAT" (OD=once daily, BD=twice, TID=three times, QID=four times, SOS=as needed, STAT=immediate)
- notes: string (any observations, patient response, or special instructions)

If a field is not mentioned, use reasonable defaults: route "Oral", frequency "OD". Return only valid JSON, no extra text.`;

    const userPrompt = `Medication command: "${transcript}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash", // or "gemini-2.0-flash" if available
      contents: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "user", parts: [{ text: userPrompt }] }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            medicationName: { type: Type.STRING },
            dosage: { type: Type.STRING },
            route: { type: Type.STRING },
            scheduledTime: { type: Type.STRING },
            duration: { type: Type.NUMBER, nullable: true },
            frequency: { type: Type.STRING, nullable: true },
            notes: { type: Type.STRING, nullable: true }
          },
          required: ["medicationName", "dosage", "scheduledTime"]
        }
      }
    });

    const result = JSON.parse(response.text?.trim() || "{}");
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("AI medication parse error:", err);
    return NextResponse.json(
      { error: "Failed to parse medication speech. Please try again or fill manually." },
      { status: 500 }
    );
  }
}