import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

// ✅ Billing & Telemetry URLs (same as SOAP API)
const BILLING_URL = "https://his-ai-billing.onrender.com/api/ai/billing";
const TELEMETRY_URL = "https://his-ai-billing.onrender.com/api/ai/log-usage";

export async function POST(request: Request) {
  const startTime = Date.now();
  let inputTokens = 0, outputTokens = 0;
  let activeToken = "";
  const targetModel = "gemini-3.5-flash";

  try {
    const body = await request.json();
    const { transcript } = body;

    if (!transcript || typeof transcript !== "string") {
      return NextResponse.json(
        { error: "Valid transcript text is required." },
        { status: 400 }
      );
    }

    // 1. Fetch API key from billing server (with fallback)
    let apiKey = "";
    try {
      const billingRes = await fetch(BILLING_URL);
      if (billingRes.ok) {
        const configData = await billingRes.json();
        apiKey = configData.apiKey || configData.customApiKey || configData.token || configData.apiToken || configData.envApiKey;
        activeToken = apiKey;
        console.log("✅ Billing server API key retrieved.");
      } else {
        console.warn(`Billing server responded with ${billingRes.status}, falling back to env.`);
      }
    } catch (fetchErr: any) {
      console.warn("Failed to fetch from billing server, falling back to env:", fetchErr.message);
    }

    // Fallback to environment variable
    if (!apiKey) {
      apiKey = process.env.GEMINI_API_KEY || "";
      activeToken = apiKey;
      console.log("Using fallback GEMINI_API_KEY from environment.");
    }

    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      return NextResponse.json(
        { error: "Gemini API key is not configured. Please set a valid GEMINI_API_KEY in your environment or ensure the billing server provides one." },
        { status: 503 }
      );
    }

    // 2. Initialize Gemini client
    const ai = new GoogleGenAI({
      apiKey: apiKey,
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
            model: targetModel,
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

          const usage = response.usageMetadata || {};
          inputTokens = usage.promptTokenCount || 0;
          outputTokens = usage.candidatesTokenCount || 0;

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
            const delay = Math.pow(2, attempt) * 500;
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
    const responseTimeMs = Date.now() - startTime;

    // 3. Send telemetry (success)
    fetch(TELEMETRY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${activeToken}`,
      },
      body: JSON.stringify({
        projectName: "Health Plan Prescription Parser",
        model: targetModel,
        inputTokens,
        outputTokens,
        responseTimeMs,
        status: "success",
        userRole: "patient",
      }),
    }).catch(err => console.error("Telemetry error:", err));

    return NextResponse.json(medications);

  } catch (err: any) {
    const errorDuration = Date.now() - startTime;
    console.error("Gemini API error:", err);

    // Send error telemetry if token available
    if (activeToken) {
      fetch(TELEMETRY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${activeToken}`,
        },
        body: JSON.stringify({
          projectName: "Health Plan Prescription Parser",
          model: targetModel,
          inputTokens: 0,
          outputTokens: 0,
          responseTimeMs: errorDuration,
          status: "error",
          errorDetails: err.message || "Unknown error",
          userRole: "patient",
        }),
      }).catch(() => {});
    }

    return NextResponse.json(
      { error: "AI prescription extraction failed. Please check your Gemini API key and try again. Details: " + (err.message || "Unknown error") },
      { status: 500 }
    );
  }
}