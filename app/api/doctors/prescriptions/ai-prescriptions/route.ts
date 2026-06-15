// import { GoogleGenAI, Type } from "@google/genai";
// import { NextResponse } from "next/server";

// export async function POST(request: Request) {
//   try {
//     const { transcript } = await request.json();
//     if (!transcript || typeof transcript !== "string") {
//       return NextResponse.json({ error: "Valid transcript is required" }, { status: 400 });
//     }

//     const apiKey = process.env.GEMINI_API_KEY;
//     if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
//       return NextResponse.json({ error: "Gemini API key not configured" }, { status: 503 });
//     }

//     const ai = new GoogleGenAI({
//       apiKey,
//       httpOptions: {
//         headers: { 'User-Agent': 'aistudio-build' }
//       }
//     });

//     const systemPrompt = `You are an AI clinical assistant for medication administration. Parse the nurse's spoken command and extract medication administration details.

// Output a JSON object with these fields:
// - medicationName: string (the drug name, capitalized, e.g., "Paracetamol", "Furosemide")
// - dosage: string (e.g., "500mg", "2 tablets", "5ml")
// - route: one of "Oral", "IV", "IM", "SC", "Topical", "Inhalation", "Sublingual", "Rectal"
// - scheduledTime: string in HH:MM 24-hour format. If "now" use current time (e.g., "14:30"), if "in X hours" calculate accordingly.
// - duration: number (days of treatment, optional, e.g., 7)
// - frequency: one of "OD", "BD", "TID", "QID", "SOS", "STAT" (OD=once daily, BD=twice, TID=three times, QID=four times, SOS=as needed, STAT=immediate)
// - notes: string (any observations, patient response, or special instructions)

// If a field is not mentioned, use reasonable defaults: route "Oral", frequency "OD". Return only valid JSON, no extra text.`;

//     const userPrompt = `Medication command: "${transcript}"`;

//     const response = await ai.models.generateContent({
//       model: "gemini-3.5-flash", // or "gemini-2.0-flash" if available
//       contents: [
//         { role: "user", parts: [{ text: systemPrompt }] },
//         { role: "user", parts: [{ text: userPrompt }] }
//       ],
//       config: {
//         responseMimeType: "application/json",
//         responseSchema: {
//           type: Type.OBJECT,
//           properties: {
//             medicationName: { type: Type.STRING },
//             dosage: { type: Type.STRING },
//             route: { type: Type.STRING },
//             scheduledTime: { type: Type.STRING },
//             duration: { type: Type.NUMBER, nullable: true },
//             frequency: { type: Type.STRING, nullable: true },
//             notes: { type: Type.STRING, nullable: true }
//           },
//           required: ["medicationName", "dosage", "scheduledTime"]
//         }
//       }
//     });

//     const result = JSON.parse(response.text?.trim() || "{}");
//     return NextResponse.json(result);
//   } catch (err: any) {
//     console.error("AI medication parse error:", err);
//     return NextResponse.json(
//       { error: "Failed to parse medication speech. Please try again or fill manually." },
//       { status: 500 }
//     );
//   }
// }



// app/api/nurse/medication/parse/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateContentWithDynamicKey, models } from "@/lib/gemini";

const BILLING_URL = "https://his-ai-billing.onrender.com/api/ai/billing";
const TELEMETRY_URL = "https://his-ai-billing.onrender.com/api/ai/log-usage";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const targetModel = models.FLASH;
  let inputTokens = 0, outputTokens = 0;
  let activeToken = "";

  try {
    const { transcript } = await request.json();
    if (!transcript || typeof transcript !== "string") {
      return NextResponse.json({ error: "Valid transcript is required" }, { status: 400 });
    }

    // 1. Fetch API key from billing server
    const billingRes = await fetch(BILLING_URL);
    if (!billingRes.ok) throw new Error(`Billing server error: ${billingRes.status}`);
    const configData = await billingRes.json();
    activeToken = configData.apiKey || configData.customApiKey || configData.token;
    if (!activeToken) throw new Error("No API key returned from billing server");

    // 2. Build a single prompt (system + user)
    const prompt = `You are an AI clinical assistant for medication administration. Parse the nurse's spoken command and extract medication administration details.

Medication command: "${transcript}"

Output a JSON object with these exact fields:
- medicationName: string (the drug name, capitalized, e.g., "Paracetamol", "Furosemide")
- dosage: string (e.g., "500mg", "2 tablets", "5ml")
- route: one of "Oral", "IV", "IM", "SC", "Topical", "Inhalation", "Sublingual", "Rectal"
- scheduledTime: string in HH:MM 24-hour format. If "now" use current time (e.g., "14:30"), if "in X hours" calculate accordingly.
- duration: number (days of treatment, optional, e.g., 7) – if not mentioned, use null.
- frequency: one of "OD", "BD", "TID", "QID", "SOS", "STAT" (OD=once daily, BD=twice, TID=three times, QID=four times, SOS=as needed, STAT=immediate) – default "OD".
- notes: string (any observations, patient response, or special instructions) – default empty string.

If a field is not mentioned, use reasonable defaults: route "Oral", frequency "OD". Return **only** valid JSON, no extra text.`;

    // 3. Call Gemini with retry & fallback (handled inside generateContentWithDynamicKey)
    const result = await generateContentWithDynamicKey(activeToken, targetModel, prompt);
    const responseTimeMs = Date.now() - startTime;

    const usage = result.usageMetadata || {};
    inputTokens = usage.promptTokenCount || 0;
    outputTokens = usage.candidatesTokenCount || 0;

    const textOutput = result.text;
    if (!textOutput) throw new Error("AI response empty");
    const parsedData = JSON.parse(textOutput.trim());

    // 4. Send telemetry (nurse role)
    fetch(TELEMETRY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${activeToken}`,
      },
      body: JSON.stringify({
        projectName: "Medication Parser (Nurse)",
        model: targetModel,
        inputTokens,
        outputTokens,
        responseTimeMs,
        status: "success",
        userRole: "nurse",
      }),
    }).catch(err => console.error("Telemetry error:", err));

    return NextResponse.json(parsedData);
  } catch (err: any) {
    const errorDuration = Date.now() - startTime;
    console.error("Medication parse error:", err);

    if (activeToken) {
      fetch(TELEMETRY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${activeToken}`,
        },
        body: JSON.stringify({
          projectName: "Medication Parser (Nurse)",
          model: targetModel,
          inputTokens: 0,
          outputTokens: 0,
          responseTimeMs: errorDuration,
          status: "error",
          errorDetails: err.message || "Unknown error",
          userRole: "nurse",
        }),
      }).catch(() => {});
    }

    return NextResponse.json(
      { error: "Failed to parse medication speech. Please try again or fill manually." },
      { status: 500 }
    );
  }
}