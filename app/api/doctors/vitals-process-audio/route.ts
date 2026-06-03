// import { GoogleGenAI, Type } from "@google/genai";
// import { NextResponse } from "next/server";

// export async function POST(request: Request) {
//   try {
//     const apiKey = process.env.GEMINI_API_KEY;
//     if (!apiKey) {
//       return NextResponse.json(
//         { error: "Gemini API key is not configured." },
//         { status: 503 }
//       );
//     }

//     const ai = new GoogleGenAI({
//       apiKey,
//       httpOptions: {
//         headers: { 'User-Agent': 'aistudio-build' },
//       },
//     });

//     const body = await request.json();
//     const { audio, mimeType } = body;

//     if (!audio) {
//       return NextResponse.json(
//         { error: "Missing 'audio' base64 data in request body." },
//         { status: 400 }
//       );
//     }

//     const systemInstruction = `You are an expert AI clinical transcriptionist and medical assistant.
// Your goal is to analyze the provided nurse or doctor audio memo, transcribe it, and map clinical details into structured JSON.

// MANDATORY SAFETY PROCEDURES:
// 1. NO DUPLICATION OF NUMBERS: Never duplicate, clone, or copy a single mentioned number to fill multiple different vital sign fields. 
// 2. EXPLICIT MENTION REQUIRED: Only populate a vital field (bp, hr, temp, weight, rr, spo2) if its specific metric was explicitly and separately spoken in association with that specific label inside the audio.
// 3. DEFAULT TO NULL: If a vital metric is not explicitly stated for a field, set it to null. For instance, if the voice says only "temperature is 120", then ONLY set 'temp' to 120. Set all others to null.

// Follow these strict parsing instructions:
// 1. "transcription": Write down the exact word-for-word text spoken in the audio recording. Correct spelling of medical terms if necessary.
// 2. Extract standard patient vitals:
//    - Blood Pressure (bp): String format like "120/80". If they say "one hundred twenty over eighty", extract "120/80".
//    - Heart Rate (hr): Integer pulse beats/min (e.g., 76).
//    - Temperature (temp): Float body temperature. If Fahrenheit is explicitly spoken (e.g. "ninety eight point six degrees" or "ninety nine fahrenheit"), automatically convert it to Celsius (1 decimal point, e.g., 98.6°F -> 37.0°C). If they say a raw number like "120" explicitly as temp, use it without conversion.
//    - Weight (weight): Float weight in kilograms. If spoken in pounds/lbs (e.g. "one hundred fifty pounds"), automatically convert to kilograms (divide by 2.20462, 1 decimal point, e.g., 150 lbs -> 68.0 kg).
//    - Respiratory Rate (rr): Integer breaths/min (e.g., 16).
//    - Oxygen Saturation (spo2): Integer percentage level (e.g., 98).
// 3. "summaryOfSpeech": Generate a warm, concise human clinical narrative summarizing what was recorded.
// 4. "unrecognizedDetails": Extract any extra symptoms, statements, patient complaints or nursing observations that are NOT standard vitals. If none, return "".

// Output valid JSON matching the schema.`;

//     const response = await ai.models.generateContent({
//       model: "gemini-3.1-flash-lite",  // or gemini-1.5-flash
//       contents: [
//         {
//           inlineData: {
//             mimeType: mimeType || "audio/webm",
//             data: audio,
//           },
//         },
//         "Transcribe the attached clinical audio memo and extract vitals in structured JSON."
//       ],
//       config: {
//         systemInstruction,
//         responseMimeType: "application/json",
//         responseSchema: {
//           type: Type.OBJECT,
//           required: ["transcription", "summaryOfSpeech", "unrecognizedDetails"],
//           properties: {
//             transcription: { type: Type.STRING },
//             bp: { type: Type.STRING, nullable: true },
//             hr: { type: Type.INTEGER, nullable: true },
//             temp: { type: Type.NUMBER, nullable: true },
//             weight: { type: Type.NUMBER, nullable: true },
//             rr: { type: Type.INTEGER, nullable: true },
//             spo2: { type: Type.INTEGER, nullable: true },
//             summaryOfSpeech: { type: Type.STRING },
//             unrecognizedDetails: { type: Type.STRING },
//           },
//         },
//       },
//     });

//     const textOutput = response.text;
//     if (!textOutput) {
//       throw new Error("Empty response from Gemini.");
//     }

//     const data = JSON.parse(textOutput.trim());
//     return NextResponse.json(data);
//   } catch (err: any) {
//     console.error("Audio processing error:", err);
//     return NextResponse.json(
//       { error: err.toString() || "Server error processing audio." },
//       { status: 500 }
//     );
//   }
// }



import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

// Helper to delay execution
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Attempts to generate content with the primary model.
 * If it fails with 503 (overload), retries up to `retries` times with exponential backoff.
 * After exhausting retries, tries the fallback model once.
 */
async function generateWithFallback(
  ai: GoogleGenAI,
  primaryModel: string,
  fallbackModel: string,
  contents: any[],
  config: any,
  retries: number = 2
) {
  // Try primary model with retries
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await ai.models.generateContent({
        model: primaryModel,
        contents,
        config,
      });
    } catch (error: any) {
      const is503 = error.status === 503 || error.message?.includes("503");
      if (is503 && attempt < retries) {
        const delay = Math.pow(2, attempt) * 500; // 1s, 2s
        console.warn(`Primary model ${primaryModel} busy (attempt ${attempt}), retrying in ${delay}ms...`);
        await sleep(delay);
        continue;
      }
      if (is503) {
        console.warn(`Primary model ${primaryModel} still unavailable after ${retries} retries. Falling back to ${fallbackModel}...`);
        try {
          return await ai.models.generateContent({
            model: fallbackModel,
            contents,
            config,
          });
        } catch (fbError: any) {
          console.error(`Fallback model ${fallbackModel} also failed:`, fbError);
          throw fbError;
        }
      }
      throw error; // non‑503 error
    }
  }
  throw new Error(`Primary model ${primaryModel} failed after ${retries} retries and no fallback attempted.`);
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is not configured." },
        { status: 503 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' },
      },
    });

    const body = await request.json();
    const { audio, mimeType } = body;

    if (!audio) {
      return NextResponse.json(
        { error: "Missing 'audio' base64 data in request body." },
        { status: 400 }
      );
    }

    const systemInstruction = `You are an expert AI clinical transcriptionist and medical assistant.
Your goal is to analyze the provided nurse or doctor audio memo, transcribe it, and map clinical details into structured JSON.

MANDATORY SAFETY PROCEDURES:
1. NO DUPLICATION OF NUMBERS: Never duplicate, clone, or copy a single mentioned number to fill multiple different vital sign fields. 
2. EXPLICIT MENTION REQUIRED: Only populate a vital field (bp, hr, temp, weight, rr, spo2) if its specific metric was explicitly and separately spoken in association with that specific label inside the audio.
3. DEFAULT TO NULL: If a vital metric is not explicitly stated for a field, set it to null. For instance, if the voice says only "temperature is 120", then ONLY set 'temp' to 120. Set all others to null.

Follow these strict parsing instructions:
1. "transcription": Write down the exact word-for-word text spoken in the audio recording. Correct spelling of medical terms if necessary.
2. Extract standard patient vitals:
   - Blood Pressure (bp): String format like "120/80". If they say "one hundred twenty over eighty", extract "120/80".
   - Heart Rate (hr): Integer pulse beats/min (e.g., 76).
   - Temperature (temp): Float body temperature. If Fahrenheit is explicitly spoken (e.g. "ninety eight point six degrees" or "ninety nine fahrenheit"), automatically convert it to Celsius (1 decimal point, e.g., 98.6°F -> 37.0°C). If they say a raw number like "120" explicitly as temp, use it without conversion.
   - Weight (weight): Float weight in kilograms. If spoken in pounds/lbs (e.g. "one hundred fifty pounds"), automatically convert to kilograms (divide by 2.20462, 1 decimal point, e.g., 150 lbs -> 68.0 kg).
   - Respiratory Rate (rr): Integer breaths/min (e.g., 16).
   - Oxygen Saturation (spo2): Integer percentage level (e.g., 98).
3. "summaryOfSpeech": Generate a warm, concise human clinical narrative summarizing what was recorded.
4. "unrecognizedDetails": Extract any extra symptoms, statements, patient complaints or nursing observations that are NOT standard vitals. If none, return "".

Output valid JSON matching the schema.`;

    const contents = [
      {
        inlineData: {
          mimeType: mimeType || "audio/webm",
          data: audio,
        },
      },
      "Transcribe the attached clinical audio memo and extract vitals in structured JSON."
    ];

    const config = {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        required: ["transcription", "summaryOfSpeech", "unrecognizedDetails"],
        properties: {
          transcription: { type: Type.STRING },
          bp: { type: Type.STRING, nullable: true },
          hr: { type: Type.INTEGER, nullable: true },
          temp: { type: Type.NUMBER, nullable: true },
          weight: { type: Type.NUMBER, nullable: true },
          rr: { type: Type.INTEGER, nullable: true },
          spo2: { type: Type.INTEGER, nullable: true },
          summaryOfSpeech: { type: Type.STRING },
          unrecognizedDetails: { type: Type.STRING },
        },
      },
    };

    // Use valid model names:
    // Primary: gemini-1.5-flash (fast, good quality)
    // Fallback: gemini-1.5-flash-lite (even faster, lower resource)
    const response = await generateWithFallback(
      ai,
      "gemini-3.1-flash-lite",
      "gemini-3.5-flash",
      contents,
      config,
      2   // retry primary up to 2 times before fallback
    );

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("Empty response from Gemini.");
    }

    const data = JSON.parse(textOutput.trim());
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Audio processing error:", err);
    return NextResponse.json(
      { error: err.toString() || "Server error processing audio." },
      { status: 500 }
    );
  }
}