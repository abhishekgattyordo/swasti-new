



// // app/api/nurse/medication/parse/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { generateContentWithDynamicKey, models } from "@/lib/gemini";

// const BILLING_URL = "https://his-ai-billing.onrender.com/api/ai/billing";
// const TELEMETRY_URL = "https://his-ai-billing.onrender.com/api/ai/log-usage";

// export async function POST(request: NextRequest) {
//   const startTime = Date.now();
//   const targetModel = models.FLASH;
//   let inputTokens = 0, outputTokens = 0;
//   let activeToken = "";

//   try {
//     const { transcript } = await request.json();
//     if (!transcript || typeof transcript !== "string") {
//       return NextResponse.json({ error: "Valid transcript is required" }, { status: 400 });
//     }

//     // 1. Fetch API key from billing server
//     const billingRes = await fetch(BILLING_URL);
//     if (!billingRes.ok) throw new Error(`Billing server error: ${billingRes.status}`);
//     const configData = await billingRes.json();
//     activeToken = configData.apiKey || configData.customApiKey || configData.token;
//     if (!activeToken) throw new Error("No API key returned from billing server");

//     // 2. Build a single prompt (system + user)
//     const prompt = `You are an AI clinical assistant for medication administration. Parse the nurse's spoken command and extract medication administration details.

// Medication command: "${transcript}"

// Output a JSON object with these exact fields:
// - medicationName: string (the drug name, capitalized, e.g., "Paracetamol", "Furosemide")
// - dosage: string (e.g., "500mg", "2 tablets", "5ml")
// - route: one of "Oral", "IV", "IM", "SC", "Topical", "Inhalation", "Sublingual", "Rectal"
// - scheduledTime: string in HH:MM 24-hour format. If "now" use current time (e.g., "14:30"), if "in X hours" calculate accordingly.
// - duration: number (days of treatment, optional, e.g., 7) – if not mentioned, use null.
// - frequency: one of "OD", "BD", "TID", "QID", "SOS", "STAT" (OD=once daily, BD=twice, TID=three times, QID=four times, SOS=as needed, STAT=immediate) – default "OD".
// - notes: string (any observations, patient response, or special instructions) – default empty string.

// If a field is not mentioned, use reasonable defaults: route "Oral", frequency "OD". Return **only** valid JSON, no extra text.`;

//     // 3. Call Gemini with retry & fallback (handled inside generateContentWithDynamicKey)
//     const result = await generateContentWithDynamicKey(activeToken, targetModel, prompt);
//     const responseTimeMs = Date.now() - startTime;

//     const usage = result.usageMetadata || {};
//     inputTokens = usage.promptTokenCount || 0;
//     outputTokens = usage.candidatesTokenCount || 0;

//     const textOutput = result.text;
//     if (!textOutput) throw new Error("AI response empty");
//     const parsedData = JSON.parse(textOutput.trim());

//     // 4. Send telemetry (nurse role)
//     fetch(TELEMETRY_URL, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${activeToken}`,
//       },
//       body: JSON.stringify({
//         projectName: "Medication Parser (Nurse)",
//         model: targetModel,
//         inputTokens,
//         outputTokens,
//         responseTimeMs,
//         status: "success",
//         userRole: "nurse",
//       }),
//     }).catch(err => console.error("Telemetry error:", err));

//     return NextResponse.json(parsedData);
//   } catch (err: any) {
//     const errorDuration = Date.now() - startTime;
//     console.error("Medication parse error:", err);

//     if (activeToken) {
//       fetch(TELEMETRY_URL, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${activeToken}`,
//         },
//         body: JSON.stringify({
//           projectName: "Medication Parser (Nurse)",
//           model: targetModel,
//           inputTokens: 0,
//           outputTokens: 0,
//           responseTimeMs: errorDuration,
//           status: "error",
//           errorDetails: err.message || "Unknown error",
//           userRole: "nurse",
//         }),
//       }).catch(() => {});
//     }

//     return NextResponse.json(
//       { error: "Failed to parse medication speech. Please try again or fill manually." },
//       { status: 500 }
//     );
//   }
// }


import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const BILLING_URL = "https://his-ai-billing.onrender.com/api/ai/billing";
const TELEMETRY_URL = "https://his-ai-billing.onrender.com/api/ai/log-usage";
const targetModel = "gemini-3.6-flash";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let inputTokens = 0,
    outputTokens = 0;
  let activeToken = "";

  try {
    const { transcript, audioBase64, mimeType } = await request.json();

    // At least one input required
    if (!transcript && !audioBase64) {
      return NextResponse.json(
        { error: "Transcript text or audio recording is required." },
        { status: 400 }
      );
    }

    // 1. Fetch API key from billing server (with fallback to env)
    let apiKey = "";
    try {
      const billingRes = await fetch(BILLING_URL);
      if (billingRes.ok) {
        const configData = await billingRes.json();
        apiKey =
          configData.apiKey ||
          configData.customApiKey ||
          configData.token ||
          configData.apiToken ||
          configData.envApiKey;
        activeToken = apiKey;
        console.log("✅ Billing server API key retrieved for medication parser.");
      } else {
        console.warn(`Billing server responded with ${billingRes.status}, falling back to env.`);
      }
    } catch (fetchErr: any) {
      console.warn("Failed to fetch from billing server, falling back to env:", fetchErr.message);
    }

    if (!apiKey) {
      apiKey = process.env.GEMINI_API_KEY || "";
      activeToken = apiKey;
    }

    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      return NextResponse.json(
        { error: "Gemini API key is not configured." },
        { status: 503 }
      );
    }

    // 2. Initialize Gemini client
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: { "User-Agent": "aistudio-build" },
      },
    });

    // Current time for "now" scheduling
    const nowTimeStr = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });

    const systemPrompt = `You are an AI clinical assistant for medication administration. Parse the nurse's spoken command and extract medication administration details.

Conversion Rules:
- MEDICATION NAME: Extract the drug name, capitalize it (e.g., "paracetamol" → "Paracetamol", "furosemide" → "Furosemide").
- DOSAGE: Include the amount and unit (e.g., "500mg", "2 tablets", "5ml").
- ROUTE: Choose from "Oral", "IV", "IM", "SC", "Topical", "Inhalation", "Sublingual", "Rectal". Default to "Oral" if not mentioned.
- SCHEDULED TIME: Return in HH:MM 24‑hour format. If the command says "now", use current time ("${nowTimeStr}"). If it says "in X hours", calculate appropriately.
- DURATION: Number of days (integer) if mentioned; otherwise set to null.
- FREQUENCY: One of "OD" (once daily), "BD" (twice daily), "TID" (three times), "QID" (four times), "SOS" (as needed), "STAT" (immediate). Default "OD" if missing.
- NOTES: Any observations or special instructions; default empty string.

Important: Do NOT invent values. Output valid JSON according to schema.`;

    const parts: any[] = [];
    if (audioBase64) {
      parts.push({
        inlineData: {
          mimeType: mimeType || "audio/webm",
          data: audioBase64,
        },
      });
      parts.push({
        text: `Please listen to the voice recording and extract medication details into JSON.${
          transcript ? ` Transcript: "${transcript}"` : ""
        }`,
      });
    } else {
      parts.push({
        text: `Medication command: "${transcript}"`,
      });
    }

    // 3. Call Gemini with retry logic
    async function generateWithRetry(maxRetries = 3) {
      let lastError: any;
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model: targetModel,
            contents: [{ role: "user", parts }],
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  medicationName: { type: Type.STRING },
                  dosage: { type: Type.STRING },
                  route: {
                    type: Type.STRING,
                    enum: ["Oral", "IV", "IM", "SC", "Topical", "Inhalation", "Sublingual", "Rectal"],
                  },
                  scheduledTime: { type: Type.STRING },
                  duration: { type: Type.NUMBER },
                  frequency: {
                    type: Type.STRING,
                    enum: ["OD", "BD", "TID", "QID", "SOS", "STAT"],
                  },
                  notes: { type: Type.STRING },
                },
                // No `required` – all fields optional
              },
              temperature: 0.1,
            },
          });

          const usage = response.usageMetadata || {};
          inputTokens = usage.promptTokenCount || 0;
          outputTokens = usage.candidatesTokenCount || 0;

          const textOutput = response.text?.trim() || "";
          if (!textOutput) throw new Error("Empty response from Gemini.");
          return JSON.parse(textOutput);
        } catch (err: any) {
          lastError = err;
          const isRetryable =
            err.status === 503 || err.message?.includes("503") || err.message?.includes("overloaded");
          if (isRetryable && attempt < maxRetries) {
            const delay = Math.pow(2, attempt) * 500;
            console.warn(`Gemini API busy (attempt ${attempt}), retrying in ${delay}ms...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }
          throw err;
        }
      }
      throw lastError;
    }

    const parsedData = await generateWithRetry(3);
    const responseTimeMs = Date.now() - startTime;

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
    }).catch((err) => console.error("Telemetry error:", err));

    return NextResponse.json(parsedData);
  } catch (err: any) {
    const errorDuration = Date.now() - startTime;
    console.error("Medication parse error:", err);

    // Send error telemetry if token available
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