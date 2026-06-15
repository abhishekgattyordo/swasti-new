// import { GoogleGenAI, Type } from '@google/genai';
// import { NextResponse } from 'next/server';

// export async function POST(request: Request) {
//   try {
//     const { transcript, patientName, patientBed } = await request.json();
//     if (!transcript || typeof transcript !== 'string') {
//       return NextResponse.json({ error: 'Missing or invalid transcript' }, { status: 400 });
//     }

//     const apiKey = process.env.GEMINI_API_KEY;
//     if (!apiKey) {
//       return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 503 });
//     }

//     const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });

//     const systemPrompt = `You are a nursing documentation AI. Parse the following dictation for patient "${patientName}" (Bed ${patientBed}) into structured clinical note fields.

// Return a JSON object with these exact fields:
// - title: a short professional title
// - noteType: one of 'admission', 'progress', 'critical', 'discharge', 'post-op', 'intervention'
// - priority: one of 'routine', 'urgent', 'critical'
// - assessmentFindings: objective and subjective findings (vitals, exam, symptoms)
// - interventions: nursing actions taken
// - patientResponse: how the patient reacted
// - content: a complete, professional nursing note narrative
// - tags: an array of 3-5 relevant keywords

// If a field is not mentioned, use sensible defaults based on the context.`;

//     const userPrompt = `Dictation: "${transcript}"`;

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
//             title: { type: Type.STRING },
//             noteType: { type: Type.STRING, enum: ['admission', 'progress', 'critical', 'discharge', 'post-op', 'intervention'] },
//             priority: { type: Type.STRING, enum: ['routine', 'urgent', 'critical'] },
//             assessmentFindings: { type: Type.STRING },
//             interventions: { type: Type.STRING },
//             patientResponse: { type: Type.STRING },
//             content: { type: Type.STRING },
//             tags: { type: Type.ARRAY, items: { type: Type.STRING } },
//           },
//           required: ['title', 'noteType', 'priority', 'assessmentFindings', 'interventions', 'patientResponse', 'content', 'tags'],
//         },
//       },
//     });

//     const textOutput = response.text;
//     if (!textOutput) throw new Error('Gemini returned empty response');
//     const parsed = JSON.parse(textOutput.trim());
//     return NextResponse.json(parsed);
//   } catch (err: any) {
//     console.error('Voice parse error:', err);
//     return NextResponse.json({ error: err.message || 'Failed to parse voice' }, { status: 500 });
//   }
// }





// app/api/nurse/notes/ai-voice-transcript/route.ts
import { GoogleGenAI, Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { models } from '@/lib/gemini'; // ✅ import same model enum

const BILLING_URL = "https://his-ai-billing.onrender.com/api/ai/billing";
const TELEMETRY_URL = "https://his-ai-billing.onrender.com/api/ai/log-usage";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const targetModel = models.FLASH; // e.g., "gemini-1.5-flash"
  let inputTokens = 0, outputTokens = 0;
  let activeToken = "";

  try {
    const { transcript, patientName, patientBed } = await request.json();
    if (!transcript || typeof transcript !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid transcript' }, { status: 400 });
    }

    // 1. Fetch API key from billing server
    const billingRes = await fetch(BILLING_URL);
    if (!billingRes.ok) throw new Error(`Billing server error: ${billingRes.status}`);
    const configData = await billingRes.json();
    activeToken = configData.apiKey || configData.customApiKey || configData.token;
    if (!activeToken) throw new Error("No API key returned from billing server");

    // 2. Initialize Gemini client with dynamic key
    const ai = new GoogleGenAI({
      apiKey: activeToken,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });

    const systemPrompt = `You are a nursing documentation AI. Parse the following dictation for patient "${patientName}" (Bed ${patientBed}) into structured clinical note fields.

Return a JSON object with these exact fields:
- title: a short professional title
- noteType: one of 'admission', 'progress', 'critical', 'discharge', 'post-op', 'intervention'
- priority: one of 'routine', 'urgent', 'critical'
- assessmentFindings: objective and subjective findings (vitals, exam, symptoms)
- interventions: nursing actions taken
- patientResponse: how the patient reacted
- content: a complete, professional nursing note narrative
- tags: an array of 3-5 relevant keywords

If a field is not mentioned, use sensible defaults based on the context.`;

    const userPrompt = `Dictation: "${transcript}"`;

    // 3. Call Gemini (with structured output schema)
    const response = await ai.models.generateContent({
      model: targetModel,
      contents: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'user', parts: [{ text: userPrompt }] },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            noteType: { type: Type.STRING, enum: ['admission', 'progress', 'critical', 'discharge', 'post-op', 'intervention'] },
            priority: { type: Type.STRING, enum: ['routine', 'urgent', 'critical'] },
            assessmentFindings: { type: Type.STRING },
            interventions: { type: Type.STRING },
            patientResponse: { type: Type.STRING },
            content: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['title', 'noteType', 'priority', 'assessmentFindings', 'interventions', 'patientResponse', 'content', 'tags'],
        },
      },
    });

    const responseTimeMs = Date.now() - startTime;
    const usage = response.usageMetadata || {};
    inputTokens = usage.promptTokenCount || 0;
    outputTokens = usage.candidatesTokenCount || 0;

    const textOutput = response.text;
    if (!textOutput) throw new Error('Gemini returned empty response');
    const parsed = JSON.parse(textOutput.trim());

    // 4. Send telemetry (nurse role)
    fetch(TELEMETRY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${activeToken}`,
      },
      body: JSON.stringify({
        projectName: "Nurse Voice Transcript",
        model: targetModel,
        inputTokens,
        outputTokens,
        responseTimeMs,
        status: "success",
        userRole: "nurse",
      }),
    }).catch(err => console.error("Telemetry error:", err));

    return NextResponse.json(parsed);
  } catch (err: any) {
    const errorDuration = Date.now() - startTime;
    console.error('Voice parse error:', err);

    // Send error telemetry if we have a token
    if (activeToken) {
      fetch(TELEMETRY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${activeToken}`,
        },
        body: JSON.stringify({
          projectName: "Nurse Voice Transcript",
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
      { error: err.message || 'Failed to parse voice transcript' },
      { status: 500 }
    );
  }
}