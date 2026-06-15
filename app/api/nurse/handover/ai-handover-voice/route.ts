// // app/api/nurse/parse-handover-voice/route.ts
// import { GoogleGenAI, Type } from '@google/genai';
// import { NextResponse } from 'next/server';

// export async function POST(request: Request) {
//   try {
//     const { transcript, patients } = await request.json();
//     if (!transcript) return NextResponse.json({ error: 'Missing transcript' }, { status: 400 });

//     const apiKey = process.env.GEMINI_API_KEY;
//     if (!apiKey) return NextResponse.json({ error: 'Gemini API key missing' }, { status: 503 });

//     const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });

//     const patientsList = patients?.map((p: any) => `- ${p.patientName} (Bed ${p.bed})`).join('\n') || 'None.';

//     const systemPrompt = `You are a nursing handover assistant. Parse the following handover dictation and extract structured information.

// Extract:
// - toNurse: name of the receiving nurse (string)
// - generalNotes: overall shift summary (string)
// - equipmentStatus: status of medical equipment (string)
// - emergencySupplies: status of emergency supplies (string)
// - patientNotes: an object mapping patient names or bed numbers to additional notes (object). Use patient names as keys if mentioned.

// Return a JSON object with these fields. Use empty strings if not mentioned.`;

//     const userPrompt = `Dictation: "${transcript}"\nPatients on the ward:\n${patientsList}`;

//     const response = await ai.models.generateContent({
//       model: 'gemini-3.5-flash',
//       contents: [
//         { role: 'user', parts: [{ text: systemPrompt }] },
//         { role: 'user', parts: [{ text: userPrompt }] },
//       ],
//       config: {
//         responseMimeType: 'application/json',
//         responseSchema: {
//           type: Type.OBJECT,
//           properties: {
//             toNurse: { type: Type.STRING },
//             generalNotes: { type: Type.STRING },
//             equipmentStatus: { type: Type.STRING },
//             emergencySupplies: { type: Type.STRING },
//             patientNotes: { type: Type.OBJECT, additionalProperties: { type: Type.STRING } },
//           },
//           required: ['toNurse', 'generalNotes', 'equipmentStatus', 'emergencySupplies', 'patientNotes'],
//         },
//       },
//     });

//     const parsed = JSON.parse(response.text || '{}');
//     return NextResponse.json(parsed);
//   } catch (err: any) {
//     console.error('Handover voice parse error:', err);
//     return NextResponse.json({ error: err.message || 'Failed to parse handover' }, { status: 500 });
//   }
// }



// app/api/nurse/parse-handover-voice/route.ts
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
    const { transcript, patients } = await request.json();
    if (!transcript) {
      return NextResponse.json({ error: 'Missing transcript' }, { status: 400 });
    }

    // 1. Fetch API key from billing server
    const billingRes = await fetch(BILLING_URL);
    if (!billingRes.ok) throw new Error(`Billing server error: ${billingRes.status}`);
    const configData = await billingRes.json();
    activeToken = configData.apiKey || configData.customApiKey || configData.token;
    if (!activeToken) throw new Error("No API key returned from billing server");

    // 2. Build patients list for context
    const patientsList = patients?.map((p: any) => `- ${p.patientName} (Bed ${p.bed})`).join('\n') || 'None.';

    // 3. Build a single prompt (system + user + patients)
    const prompt = `You are a nursing handover assistant. Parse the following handover dictation and extract structured information.

Dictation: "${transcript}"

Patients on the ward:
${patientsList}

Extract the following fields as a JSON object:
- toNurse: name of the receiving nurse (string)
- generalNotes: overall shift summary (string)
- equipmentStatus: status of medical equipment (string)
- emergencySupplies: status of emergency supplies (string)
- patientNotes: an object mapping patient names or bed numbers to additional notes (object). Use patient names as keys if mentioned.

Return **only** valid JSON, no extra text. Use empty strings for missing fields. Example:
{
  "toNurse": "Nurse Jane",
  "generalNotes": "All patients stable...",
  "equipmentStatus": "All working",
  "emergencySupplies": "Fully stocked",
  "patientNotes": { "John Doe": "Pain managed", "Bed 3": "Needs dressing change" }
}`;

    // 4. Call Gemini with retry & fallback (handled inside generateContentWithDynamicKey)
    const result = await generateContentWithDynamicKey(activeToken, targetModel, prompt);
    const responseTimeMs = Date.now() - startTime;

    const usage = result.usageMetadata || {};
    inputTokens = usage.promptTokenCount || 0;
    outputTokens = usage.candidatesTokenCount || 0;

    const textOutput = result.text;
    if (!textOutput) throw new Error("AI response empty");
    const parsedData = JSON.parse(textOutput.trim());

    // 5. Send telemetry (nurse role)
    fetch(TELEMETRY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${activeToken}`,
      },
      body: JSON.stringify({
        projectName: "Handover Voice Parser (Nurse)",
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
    console.error("Handover voice parse error:", err);

    if (activeToken) {
      fetch(TELEMETRY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${activeToken}`,
        },
        body: JSON.stringify({
          projectName: "Handover Voice Parser (Nurse)",
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
      { error: err.message || "Failed to parse handover voice" },
      { status: 500 }
    );
  }
}