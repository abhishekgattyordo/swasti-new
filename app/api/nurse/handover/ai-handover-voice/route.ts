// app/api/nurse/parse-handover-voice/route.ts
import { GoogleGenAI, Type } from '@google/genai';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { transcript, patients } = await request.json();
    if (!transcript) return NextResponse.json({ error: 'Missing transcript' }, { status: 400 });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'Gemini API key missing' }, { status: 503 });

    const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });

    const patientsList = patients?.map((p: any) => `- ${p.patientName} (Bed ${p.bed})`).join('\n') || 'None.';

    const systemPrompt = `You are a nursing handover assistant. Parse the following handover dictation and extract structured information.

Extract:
- toNurse: name of the receiving nurse (string)
- generalNotes: overall shift summary (string)
- equipmentStatus: status of medical equipment (string)
- emergencySupplies: status of emergency supplies (string)
- patientNotes: an object mapping patient names or bed numbers to additional notes (object). Use patient names as keys if mentioned.

Return a JSON object with these fields. Use empty strings if not mentioned.`;

    const userPrompt = `Dictation: "${transcript}"\nPatients on the ward:\n${patientsList}`;

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
            toNurse: { type: Type.STRING },
            generalNotes: { type: Type.STRING },
            equipmentStatus: { type: Type.STRING },
            emergencySupplies: { type: Type.STRING },
            patientNotes: { type: Type.OBJECT, additionalProperties: { type: Type.STRING } },
          },
          required: ['toNurse', 'generalNotes', 'equipmentStatus', 'emergencySupplies', 'patientNotes'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error('Handover voice parse error:', err);
    return NextResponse.json({ error: err.message || 'Failed to parse handover' }, { status: 500 });
  }
}