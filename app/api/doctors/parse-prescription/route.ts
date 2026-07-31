// import { GoogleGenAI, Type } from "@google/genai";
// import { NextResponse } from "next/server";

// // Billing & Telemetry URLs
// const BILLING_URL = "https://his-ai-billing.onrender.com/api/ai/billing";
// const TELEMETRY_URL = "https://his-ai-billing.onrender.com/api/ai/log-usage";

// // ---------- Rule‑based fallback parser ----------
// function parsePrescriptionFromTextOrAudio(transcript: string): any[] {
//   // Very simple fallback: extract common drug names via regex
//   const drugRegex = /\b(?:amoxicillin|ibuprofen|lisinopril|metformin|omeprazole|atorvastatin|albuterol|levothyroxine|amlodipine|metoprolol)\b/gi;
//   const matches = transcript.match(drugRegex) || [];
//   // Deduplicate and return minimal objects
//   const unique = [...new Set(matches.map(m => m.toLowerCase()))];
//   return unique.map(name => ({
//     name: name.charAt(0).toUpperCase() + name.slice(1),
//     category: "Other",
//     dosage: "Unknown",
//     frequency: "As directed",
//     duration: "Ongoing",
//     instructions: "Take as prescribed"
//   }));
// }

// export async function POST(request: Request) {
//   const startTime = Date.now();
//   let inputTokens = 0, outputTokens = 0;
//   let activeToken = "";
//   const targetModel = "gemini-3.6-flash";

//   try {
//     const body = await request.json();
//     const { transcript, audioBase64, mimeType } = body || {};

//     // Validate input: at least one of transcript or audioBase64
//     if (!transcript && !audioBase64) {
//       return NextResponse.json(
//         { error: "Either audioBase64 recording or transcript text is required." },
//         { status: 400 }
//       );
//     }

//     // 1. Fetch API key from billing server (with fallback)
//     let apiKey = "";
//     try {
//       const billingRes = await fetch(BILLING_URL);
//       if (billingRes.ok) {
//         const configData = await billingRes.json();
//         apiKey = configData.apiKey || configData.customApiKey || configData.token || configData.apiToken || configData.envApiKey;
//         activeToken = apiKey;
//         console.log("✅ Billing server API key retrieved.");
//       } else {
//         console.warn(`Billing server responded with ${billingRes.status}, falling back to env.`);
//       }
//     } catch (fetchErr: any) {
//       console.warn("Failed to fetch from billing server, falling back to env:", fetchErr.message);
//     }

//     // Fallback to environment variable
//     if (!apiKey) {
//       apiKey = process.env.GEMINI_API_KEY || "";
//       activeToken = apiKey;
//       console.log("Using fallback GEMINI_API_KEY from environment.");
//     }

//     // If no valid API key, immediately return fallback results
//     if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
//       console.warn("No valid Gemini API key found, returning rule-based extraction fallback.");
//       const fallbackMeds = parsePrescriptionFromTextOrAudio(transcript || "");
//       return NextResponse.json(fallbackMeds);
//     }

//     // 2. Initialize Gemini client
//     const ai = new GoogleGenAI({
//       apiKey: apiKey,
//       httpOptions: {
//         headers: { 'User-Agent': 'aistudio-build' }
//       }
//     });

//     const systemPrompt = `You are an AI EHR clinical transcription assistant. Analyze the spoken or written medication order by a physician. Extract all named medications being prescribed. For each medication, determine:
// - name (brand or generic, capitalized)
// - category: one of 'Antibiotic', 'Analgesic', 'Antihypertensive', 'Antidiabetic', 'Other'
// - dosage (e.g., '500mg', '2 puffs', '10ml')
// - frequency (e.g., 'Twice daily', 'Once daily', '1-0-1', 'Every 4 hours as needed')
// - duration (e.g., '7 days', '30 days', 'Ongoing')
// - instructions (e.g., 'Take with meals', 'After food', 'At bedtime')

// If a field is not explicitly mentioned, infer a reasonable default based on common medical practice, but never leave fields empty. Output a JSON array of objects matching the schema. Do not include any explanatory text outside JSON.`;

//     // Build the user content parts
//     const parts: any[] = [];
//     if (audioBase64) {
//       parts.push({
//         inlineData: {
//           mimeType: mimeType || "audio/webm",
//           data: audioBase64,
//         },
//       });
//       // Add transcript as accompanying text if provided
//       parts.push({
//         text: `Please listen directly to the attached voice audio recording of the doctor prescribing medications and extract all medication details as a JSON array.${transcript ? `\n\nAccompanying speech transcript: ${transcript}` : ""}`,
//       });
//     } else {
//       // transcript only
//       parts.push({
//         text: `Clinical Transcript: "${transcript}"`,
//       });
//     }

//     // 3. Retry helper for 503 (overload) errors
//     async function generateWithRetry(maxRetries = 3) {
//       let lastError: any;
//       for (let attempt = 1; attempt <= maxRetries; attempt++) {
//         try {
//           const response = await ai.models.generateContent({
//             model: targetModel,
//             contents: [
//               {
//                 role: "user",
//                 parts: parts,
//               },
//             ],
//             config: {
//               systemInstruction: systemPrompt,
//               responseMimeType: "application/json",
//               responseSchema: {
//                 type: Type.ARRAY,
//                 items: {
//                   type: Type.OBJECT,
//                   properties: {
//                     name: { type: Type.STRING },
//                     category: { type: Type.STRING, enum: ["Antibiotic", "Analgesic", "Antihypertensive", "Antidiabetic", "Other"] },
//                     dosage: { type: Type.STRING },
//                     frequency: { type: Type.STRING },
//                     duration: { type: Type.STRING },
//                     instructions: { type: Type.STRING },
//                   },
//                   required: ["name", "dosage"],
//                 },
//               },
//               temperature: 0.1,
//             },
//           });

//           const usage = response.usageMetadata || {};
//           inputTokens = usage.promptTokenCount || 0;
//           outputTokens = usage.candidatesTokenCount || 0;

//           const textOutput = response.text?.trim() || "";
//           if (!textOutput) throw new Error("Empty response from Gemini.");
//           const parsed = JSON.parse(textOutput);
//           if (Array.isArray(parsed)) {
//             return parsed;
//           } else if (parsed && Array.isArray(parsed.medications)) {
//             return parsed.medications;
//           } else {
//             throw new Error("Gemini returned non‑array payload.");
//           }
//         } catch (err: any) {
//           lastError = err;
//           const isRetryable = err.status === 503 || err.message?.includes("503") || err.message?.includes("overloaded");
//           if (isRetryable && attempt < maxRetries) {
//             const delay = Math.pow(2, attempt) * 500;
//             console.warn(`Gemini API busy (attempt ${attempt}), retrying in ${delay}ms...`);
//             await new Promise(resolve => setTimeout(resolve, delay));
//             continue;
//           }
//           throw err;
//         }
//       }
//       throw lastError;
//     }

//     const medications = await generateWithRetry(3);
//     const responseTimeMs = Date.now() - startTime;

//     // 4. Send telemetry (success)
//     fetch(TELEMETRY_URL, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${activeToken}`,
//       },
//       body: JSON.stringify({
//         projectName: "Health Plan Prescription Parser",
//         model: targetModel,
//         inputTokens,
//         outputTokens,
//         responseTimeMs,
//         status: "success",
//         userRole: "doctor",
//       }),
//     }).catch(err => console.error("Telemetry error:", err));

//     return NextResponse.json(medications);

//   } catch (err: any) {
//     const errorDuration = Date.now() - startTime;
//     console.error("Gemini API error, using rule‑based fallback:", err);

//     // Send error telemetry if token available
//     if (activeToken) {
//       fetch(TELEMETRY_URL, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${activeToken}`,
//         },
//         body: JSON.stringify({
//           projectName: "Health Plan Prescription Parser",
//           model: targetModel,
//           inputTokens: 0,
//           outputTokens: 0,
//           responseTimeMs: errorDuration,
//           status: "error",
//           errorDetails: err.message || "Unknown error",
//           userRole: "doctor",
//         }),
//       }).catch(() => {});
//     }

//     // Fallback to rule‑based extraction
//     const fallbackMeds = parsePrescriptionFromTextOrAudio(
//       (await request.json().catch(() => ({})))?.transcript || ""
//     );
//     return NextResponse.json(fallbackMeds);
//   }
// }




import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

// Billing & Telemetry URLs
const BILLING_URL = "https://his-ai-billing.onrender.com/api/ai/billing";
const TELEMETRY_URL = "https://his-ai-billing.onrender.com/api/ai/log-usage";

// ---------- Rule‑based fallback parser ----------
function parsePrescriptionFromTextOrAudio(transcript: string): any[] {
  const drugRegex = /\b(?:amoxicillin|ibuprofen|lisinopril|metformin|omeprazole|atorvastatin|albuterol|levothyroxine|amlodipine|metoprolol)\b/gi;
  const matches = transcript.match(drugRegex) || [];
  const unique = [...new Set(matches.map(m => m.toLowerCase()))];
  return unique.map(name => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    category: "Other",
    dosage: "Unknown",
    frequency: "As directed",
    duration: "Ongoing",
    instructions: "Take as prescribed"
  }));
}

export async function POST(request: Request) {
  const startTime = Date.now();
  let inputTokens = 0, outputTokens = 0;
  let activeToken = "";
  const targetModel = "gemini-3.6-flash"; // unchanged

  try {
    const body = await request.json();
    const { transcript, audioBase64, mimeType } = body || {};

    if (!transcript && !audioBase64) {
      return NextResponse.json(
        { error: "Either audioBase64 recording or transcript text is required." },
        { status: 400 }
      );
    }

    // ---------- 1. Get keys from billing & environment ----------
    let billingKey = "";
    try {
      const billingRes = await fetch(BILLING_URL);
      if (billingRes.ok) {
        const configData = await billingRes.json();
        billingKey = configData.apiKey || configData.customApiKey || configData.token || configData.apiToken || configData.envApiKey;
        console.log("✅ Billing server API key retrieved.");
      } else {
        console.warn(`Billing server responded with ${billingRes.status}, no key from billing.`);
      }
    } catch (fetchErr: any) {
      console.warn("Failed to fetch from billing server:", fetchErr.message);
    }

    const envKey = process.env.GEMINI_API_KEY || "";

    // ---------- 2. Helper to call Gemini with a given key ----------
    async function callGemini(apiKey: string) {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const systemPrompt = `You are an AI EHR clinical transcription assistant. Analyze the spoken or written medication order by a physician. Extract all named medications being prescribed. For each medication, determine:
- name (brand or generic, capitalized)
- category: one of 'Antibiotic', 'Analgesic', 'Antihypertensive', 'Antidiabetic', 'Other'
- dosage (e.g., '500mg', '2 puffs', '10ml')
- frequency (e.g., 'Twice daily', 'Once daily', '1-0-1', 'Every 4 hours as needed')
- duration (e.g., '7 days', '30 days', 'Ongoing')
- instructions (e.g., 'Take with meals', 'After food', 'At bedtime')

If a field is not explicitly mentioned, infer a reasonable default based on common medical practice, but never leave fields empty. Output a JSON array of objects matching the schema. Do not include any explanatory text outside JSON.`;

      const parts: any[] = [];
      if (audioBase64) {
        parts.push({
          inlineData: {
            mimeType: mimeType || "audio/webm",
            data: audioBase64,
          },
        });
        parts.push({
          text: `Please listen directly to the attached voice audio recording of the doctor prescribing medications and extract all medication details as a JSON array.${transcript ? `\n\nAccompanying speech transcript: ${transcript}` : ""}`,
        });
      } else {
        parts.push({ text: `Clinical Transcript: "${transcript}"` });
      }

      // Retry logic inside
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
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      category: { type: Type.STRING, enum: ["Antibiotic", "Analgesic", "Antihypertensive", "Antidiabetic", "Other"] },
                      dosage: { type: Type.STRING },
                      frequency: { type: Type.STRING },
                      duration: { type: Type.STRING },
                      instructions: { type: Type.STRING },
                    },
                    required: ["name", "dosage"],
                  },
                },
                temperature: 0.1,
              },
            });

            const usage = response.usageMetadata || {};
            inputTokens = usage.promptTokenCount || 0;
            outputTokens = usage.candidatesTokenCount || 0;

            const textOutput = response.text?.trim() || "";
            if (!textOutput) throw new Error("Empty response from Gemini.");
            const parsed = JSON.parse(textOutput);
            if (Array.isArray(parsed)) return parsed;
            if (parsed && Array.isArray(parsed.medications)) return parsed.medications;
            throw new Error("Gemini returned non‑array payload.");
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

      return await generateWithRetry(3);
    }

    // ---------- 3. Try keys in order: billing first, then env ----------
    let medications: any[] | null = null;
    let usedKey = "";

    // Try billing key if available
    if (billingKey && billingKey !== "MY_GEMINI_API_KEY") {
      try {
        console.log("🔄 Attempting with billing key...");
        medications = await callGemini(billingKey);
        usedKey = billingKey;
        console.log("✅ Success with billing key.");
      } catch (err: any) {
        console.warn("❌ Billing key failed:", err.message);
      }
    }

    // If billing failed (or no key), try environment key (if different and valid)
    if (!medications && envKey && envKey !== billingKey && envKey !== "MY_GEMINI_API_KEY") {
      try {
        console.log("🔄 Attempting with environment key as fallback...");
        medications = await callGemini(envKey);
        usedKey = envKey;
        console.log("✅ Success with environment key.");
      } catch (err: any) {
        console.warn("❌ Environment key also failed:", err.message);
      }
    }

    // If both keys failed, fall back to rule‑based parser
    if (!medications) {
      console.warn("⚠️ Both keys failed or unavailable. Using rule‑based fallback.");
      const fallbackMeds = parsePrescriptionFromTextOrAudio(transcript || "");
      return NextResponse.json(fallbackMeds);
    }

    // ---------- 4. Success: send telemetry and return result ----------
    activeToken = usedKey;
    const responseTimeMs = Date.now() - startTime;

    // ⚠️ Important: To avoid leaking your API key, do NOT send it to telemetry.
    // The telemetry endpoint may log the Authorization header.
    // Consider using a separate static token for telemetry, or remove the header.
    fetch(TELEMETRY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // ⚠️ Remove or replace this line to avoid sending the Gemini key:
        // Authorization: `Bearer ${activeToken}`,
      },
      body: JSON.stringify({
        projectName: "Health Plan Prescription Parser",
        model: targetModel,
        inputTokens,
        outputTokens,
        responseTimeMs,
        status: "success",
        userRole: "doctor",
      }),
    }).catch(err => console.error("Telemetry error:", err));

    return NextResponse.json(medications);

  } catch (err: any) {
    // ---------- Global error handler (fallback to rule‑based) ----------
    const errorDuration = Date.now() - startTime;
    console.error("Gemini API error, using rule‑based fallback:", err);

    // Telemetry (without exposing key)
    fetch(TELEMETRY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectName: "Health Plan Prescription Parser",
        model: targetModel,
        inputTokens: 0,
        outputTokens: 0,
        responseTimeMs: errorDuration,
        status: "error",
        errorDetails: err.message || "Unknown error",
        userRole: "doctor",
      }),
    }).catch(() => {});

    const fallbackMeds = parsePrescriptionFromTextOrAudio(
      (await request.json().catch(() => ({})))?.transcript || ""
    );
    return NextResponse.json(fallbackMeds);
  }
}