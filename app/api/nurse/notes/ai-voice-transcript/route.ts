import { GoogleGenAI, Type } from '@google/genai';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { transcript, patientName, patientBed } = await request.json();
    if (!transcript || typeof transcript !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid transcript' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 503 });
    }

    const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });

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

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
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

    const textOutput = response.text;
    if (!textOutput) throw new Error('Gemini returned empty response');
    const parsed = JSON.parse(textOutput.trim());
    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error('Voice parse error:', err);
    return NextResponse.json({ error: err.message || 'Failed to parse voice' }, { status: 500 });
  }
}