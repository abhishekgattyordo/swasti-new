// // app/api/vitals/extract/route.ts
// import { GoogleGenAI, Type } from "@google/genai";
// import { NextResponse } from "next/server";

// export async function POST(request: Request) {
//   try {
//     const { transcript } = await request.json();
//     if (!transcript || typeof transcript !== "string" || !transcript.trim()) {
//       return NextResponse.json(
//         { success: false, message: "Transcript text is required." },
//         { status: 400 }
//       );
//     }

//     const apiKey = process.env.GEMINI_API_KEY;
//     if (!apiKey) {
//       return NextResponse.json(
//         { success: false, message: "GEMINI_API_KEY not configured." },
//         { status: 503 }
//       );
//     }

//     const ai = new GoogleGenAI({
//       apiKey,
//       httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
//     });

//     const prompt = `You are a professional medical assistant. Extract patient vitals measurements and clinical status assessment from the following dictated voice transcript.

// Spoken voice text: "${transcript}"

// Conversion Rules:
// - TEMPERATURE: Return body temperature in Celsius. If the user pronounced the temperature in Fahrenheit (e.g. "98.6 degrees"), convert it to Celsius (e.g., 37.0).
// - BLOOD PRESSURE: Extract systolic and diastolic blood pressure values. For instance, "120 over 80" means systolic is 120, diastolic is 80.
// - MISSING VALUES: If a specific measurement is not mentioned in the text, leave it as null or 0.
// - NOTES: Generate a polished, highly professional clinical note summarizing what the physician said. Tidy up standard speech disfluencies.
// - STATUS: Extrapolate standard clinical status ("stable", "improving", "deteriorating", "critical", or "normal") strictly from the tone or specific metrics mentioned. Default to "stable" if inconclusive.

// Output a JSON object with the following schema.`;

//     const response = await ai.models.generateContent({
//       model: "gemini-3.5-flash",  // or gemini-2.0-flash if available
//       contents: prompt,
//       config: {
//         responseMimeType: "application/json",
//         responseSchema: {
//           type: Type.OBJECT,
//           properties: {
//             systolic: { type: Type.NUMBER, description: "Systolic BP reading in mmHg" },
//             diastolic: { type: Type.NUMBER, description: "Diastolic BP reading in mmHg" },
//             heartRate: { type: Type.NUMBER, description: "Heart rate in beats per minute" },
//             temperature: { type: Type.NUMBER, description: "Body temperature in Celsius" },
//             respiratoryRate: { type: Type.NUMBER, description: "Breathing rate in breaths per minute" },
//             spO2: { type: Type.NUMBER, description: "Oxygen saturation percentage" },
//             clinicalNotes: { type: Type.STRING, description: "Structured clinical summary" },
//             status: {
//               type: Type.STRING,
//               enum: ["stable", "improving", "deteriorating", "critical", "normal"],
//               description: "Extrapolated clinical status",
//             },
//           },
//         },
//       },
//     });

//     const textOutput = response.text;
//     if (!textOutput) {
//       return NextResponse.json(
//         { success: false, message: "AI response empty." },
//         { status: 500 }
//       );
//     }

//     const parsedData = JSON.parse(textOutput.trim());
//     return NextResponse.json({ success: true, data: parsedData });
//   } catch (err: any) {
//     console.error("Gemini extraction error:", err);
//     return NextResponse.json(
//       { success: false, message: err.message || "Internal server error" },
//       { status: 500 }
//     );
//   }
// }


import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const BILLING_URL = "https://his-ai-billing.onrender.com/api/ai/billing";
const TELEMETRY_URL = "https://his-ai-billing.onrender.com/api/ai/log-usage";
const targetModel = "gemini-3.6-flash"; // same as Express

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
        { success: false, message: "Transcript text or audio recording is required." },
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
        console.log("✅ Billing server API key retrieved for vitals.");
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

    // If no valid key, return error (no fallback)
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      return NextResponse.json(
        { success: false, message: "Gemini API key is not configured." },
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

    const systemPrompt = `You are a professional medical assistant. Extract patient vitals measurements and clinical status assessment from the following dictated voice transcript or audio recording.

Conversion Rules:
- TEMPERATURE: Return body temperature in Celsius. If the user pronounced temperature in Fahrenheit (e.g. "98.6 degrees" or "101.4 Fahrenheit"), convert it to Celsius (e.g., 37.0 or 38.6).
- BLOOD PRESSURE: Extract systolic and diastolic blood pressure values. E.g. "120 over 80" means systolic is 120, diastolic is 80.
- NOTES: Generate a polished, highly professional clinical note summarizing what was said. Tidy up standard speech disfluencies.
- STATUS: Extrapolate standard clinical status ("stable", "improving", "deteriorating", "critical", or "normal") strictly from the tone or specific metrics mentioned. If inconclusive, set to "stable".

Important: Do NOT invent values. If a measurement is not mentioned, leave it out of the JSON or set it to null.`;

    // Build the user content parts (multimodal if audio present)
    const parts: any[] = [];
    if (audioBase64) {
      parts.push({
        inlineData: {
          mimeType: mimeType || "audio/webm",
          data: audioBase64,
        },
      });
      parts.push({
        text: `Please listen to the voice recording and extract vitals into JSON.${
          transcript ? ` Transcript: "${transcript}"` : ""
        }`,
      });
    } else {
      parts.push({
        text: `Spoken voice text: "${transcript}"`,
      });
    }

    // 3. Retry helper for 503 (overload) errors
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
                  systolic: { type: Type.NUMBER },
                  diastolic: { type: Type.NUMBER },
                  heartRate: { type: Type.NUMBER },
                  temperature: { type: Type.NUMBER },
                  respiratoryRate: { type: Type.NUMBER },
                  spO2: { type: Type.NUMBER },
                  clinicalNotes: { type: Type.STRING },
                  status: {
                    type: Type.STRING,
                    enum: ["stable", "improving", "deteriorating", "critical", "normal"],
                  },
                },
                // No `required` – all fields are optional
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
        projectName: "Vitals Extractor (Nurse)",
        model: targetModel,
        inputTokens,
        outputTokens,
        responseTimeMs,
        status: "success",
        userRole: "nurse",
      }),
    }).catch((err) => console.error("Telemetry error:", err));

    return NextResponse.json({ success: true, data: parsedData });
  } catch (err: any) {
    const errorDuration = Date.now() - startTime;
    console.error("Gemini vitals extraction error:", err);

    // Send error telemetry if token available
    if (activeToken) {
      fetch(TELEMETRY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${activeToken}`,
        },
        body: JSON.stringify({
          projectName: "Vitals Extractor (Nurse)",
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

    // No fallback – return error
    return NextResponse.json(
      { success: false, message: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}