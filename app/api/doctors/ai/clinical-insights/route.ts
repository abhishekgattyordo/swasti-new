// app/api/ai/clinical-insights/route.ts
import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { models } from "@/lib/gemini";

const BILLING_URL = "https://his-ai-billing.onrender.com/api/ai/billing";
const TELEMETRY_URL = "https://his-ai-billing.onrender.com/api/ai/log-usage";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const targetModel = models.FLASH;
  let inputTokens = 0, outputTokens = 0;
  let activeToken = "";

  try {
    const { diagnosis, clinicalNotes, vitals } = await request.json();

    if (!diagnosis && !clinicalNotes) {
      return NextResponse.json(
        { error: "At least diagnosis or clinical notes are required." },
        { status: 400 }
      );
    }

    // 1. Fetch API key from billing server
    const billingRes = await fetch(BILLING_URL);
    if (!billingRes.ok) {
      throw new Error(`Billing server error: ${billingRes.status}`);
    }
    const configData = await billingRes.json();
    activeToken = configData.apiKey || configData.customApiKey || configData.token;
    if (!activeToken) {
      throw new Error("No API key returned from billing server");
    }

    // 2. Initialize Gemini client
    const ai = new GoogleGenAI({
      apiKey: activeToken,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } },
    });

    const systemPrompt = `You are an expert clinical AI assistant. Based on the doctor's diagnosis, clinical notes, and patient vitals, produce:
1. A single‑paragraph **deep analysis** that explains the clinical reasoning, pathophysiology, and key takeaways.
2. A list of **precautions** (bullet points) that the patient should follow, considering the diagnosis and vitals.

Be concise, medically accurate, and patient‑friendly for the precautions.

Return a JSON object with fields:
- deepAnalysis (string)
- precautions (array of strings)`;

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
`;

    // 3. Call Gemini
    const response = await ai.models.generateContent({
      model: targetModel,
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

    const responseTimeMs = Date.now() - startTime;
    const usage = response.usageMetadata || {};
    inputTokens = usage.promptTokenCount || 0;
    outputTokens = usage.candidatesTokenCount || 0;

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("Gemini returned empty response");
    }

    const result = JSON.parse(textOutput.trim());

    // 4. Send telemetry
    fetch(TELEMETRY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${activeToken}`,
      },
      body: JSON.stringify({
        projectName: "Clinical Insights API",
        model: targetModel,
        inputTokens,
        outputTokens,
        responseTimeMs,
        status: "success",
        userRole: "doctor",
      }),
    }).catch(err => console.error("Telemetry error:", err));

    return NextResponse.json(result);

  } catch (err: any) {
    const errorDuration = Date.now() - startTime;
    console.error("Clinical insights error:", err);

    // Send error telemetry
    if (activeToken) {
      fetch(TELEMETRY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${activeToken}`,
        },
        body: JSON.stringify({
          projectName: "Clinical Insights API",
          model: targetModel,
          inputTokens: 0,
          outputTokens: 0,
          responseTimeMs: errorDuration,
          status: "error",
          errorDetails: err.message || "Unknown error",
          userRole: "doctor",
        }),
      }).catch(() => {});
    }

    return NextResponse.json(
      { error: "Failed to generate clinical insights.", details: err.message },
      { status: 500 }
    );
  }
}