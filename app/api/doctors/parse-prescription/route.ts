import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { transcript } = body;

    if (!transcript || typeof transcript !== "string") {
      return NextResponse.json(
        { error: "Valid transcript text is required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      return NextResponse.json(
        { error: "Gemini API key is not configured. Please set a valid GEMINI_API_KEY in your environment." },
        { status: 503 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' }
      }
    });

    const systemPrompt = `You are an AI EHR clinical transcription assistant. Analyze the spoken medication order transcript by a physician. Extract all named medications being prescribed. For each medication, determine:
- name (brand or generic, capitalized)
- category: one of 'Antibiotic', 'Analgesic', 'Antihypertensive', 'Antidiabetic', 'Other'
- dosage (e.g., '500mg', '2 puffs', '10ml')
- frequency (e.g., 'Twice daily', 'Once daily', 'Every 4 hours as needed')
- duration (e.g., '7 days', '30 days', 'Ongoing')
- instructions (e.g., 'Take with meals', 'Rinse mouth after use')

If a field is not mentioned, you may infer a reasonable default based on common medical practice, but never leave fields empty. Output a JSON array of objects matching the schema. Do not include any explanatory text.`;

    const userPrompt = `Clinical Transcript: "${transcript}"`;

    // Retry helper for 503 (overload) errors
    async function generateWithRetry(maxRetries = 3) {
      let lastError: any;
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash", // Use a stable model; you can change to gemini-2.0-flash if available
            contents: [
              { role: "user", parts: [{ text: systemPrompt }] },
              { role: "user", parts: [{ text: userPrompt }] }
            ],
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    category: { type: Type.STRING, enum: ["Antibiotic", "Analgesic", "Antihypertensive", "Antidiabetic", "Other"] },
                    dosage: { type: Type.STRING },
                    frequency: { type: Type.STRING },
                    duration: { type: Type.STRING },
                    instructions: { type: Type.STRING }
                  },
                  required: ["name", "dosage"]
                }
              }
            }
          });

          const textOutput = response.text?.trim();
          if (!textOutput) throw new Error("Empty response from Gemini.");
          const parsed = JSON.parse(textOutput);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          } else {
            throw new Error("Gemini returned empty or invalid array.");
          }
        } catch (err: any) {
          lastError = err;
          const isRetryable = err.status === 503 || err.message?.includes("503") || err.message?.includes("overloaded");
          if (isRetryable && attempt < maxRetries) {
            const delay = Math.pow(2, attempt) * 500; // 1s, 2s, 4s
            console.warn(`Gemini API busy (attempt ${attempt}), retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          throw err;
        }
      }
      throw lastError;
    }

    const medications = await generateWithRetry(3);
    return NextResponse.json(medications);
  } catch (err: any) {
    console.error("Gemini API error:", err);
    return NextResponse.json(
      { error: "AI prescription extraction failed. Please check your Gemini API key and try again. Details: " + (err.message || "Unknown error") },
      { status: 500 }
    );
  }
}