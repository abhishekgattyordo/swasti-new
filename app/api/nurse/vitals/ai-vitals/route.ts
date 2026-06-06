// app/api/vitals/extract/route.ts
import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { transcript } = await request.json();
    if (!transcript || typeof transcript !== "string" || !transcript.trim()) {
      return NextResponse.json(
        { success: false, message: "Transcript text is required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: "GEMINI_API_KEY not configured." },
        { status: 503 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    const prompt = `You are a professional medical assistant. Extract patient vitals measurements and clinical status assessment from the following dictated voice transcript.

Spoken voice text: "${transcript}"

Conversion Rules:
- TEMPERATURE: Return body temperature in Celsius. If the user pronounced the temperature in Fahrenheit (e.g. "98.6 degrees"), convert it to Celsius (e.g., 37.0).
- BLOOD PRESSURE: Extract systolic and diastolic blood pressure values. For instance, "120 over 80" means systolic is 120, diastolic is 80.
- MISSING VALUES: If a specific measurement is not mentioned in the text, leave it as null or 0.
- NOTES: Generate a polished, highly professional clinical note summarizing what the physician said. Tidy up standard speech disfluencies.
- STATUS: Extrapolate standard clinical status ("stable", "improving", "deteriorating", "critical", or "normal") strictly from the tone or specific metrics mentioned. Default to "stable" if inconclusive.

Output a JSON object with the following schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",  // or gemini-2.0-flash if available
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            systolic: { type: Type.NUMBER, description: "Systolic BP reading in mmHg" },
            diastolic: { type: Type.NUMBER, description: "Diastolic BP reading in mmHg" },
            heartRate: { type: Type.NUMBER, description: "Heart rate in beats per minute" },
            temperature: { type: Type.NUMBER, description: "Body temperature in Celsius" },
            respiratoryRate: { type: Type.NUMBER, description: "Breathing rate in breaths per minute" },
            spO2: { type: Type.NUMBER, description: "Oxygen saturation percentage" },
            clinicalNotes: { type: Type.STRING, description: "Structured clinical summary" },
            status: {
              type: Type.STRING,
              enum: ["stable", "improving", "deteriorating", "critical", "normal"],
              description: "Extrapolated clinical status",
            },
          },
        },
      },
    });

    const textOutput = response.text;
    if (!textOutput) {
      return NextResponse.json(
        { success: false, message: "AI response empty." },
        { status: 500 }
      );
    }

    const parsedData = JSON.parse(textOutput.trim());
    return NextResponse.json({ success: true, data: parsedData });
  } catch (err: any) {
    console.error("Gemini extraction error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}