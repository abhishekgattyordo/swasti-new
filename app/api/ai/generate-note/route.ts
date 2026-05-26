// app/api/generate-note/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { rawText, noteType, language = "English" } = await request.json();

    if (!rawText) {
      return NextResponse.json(
        { error: "No input text provided" },
        { status: 400 }
      );
    }

    const systemInstruction = `
      You are a professional medical scribe assistant. 
      Your task is to transform raw patient observations into structured clinical documentation.
      
      Note Type Requested: ${noteType}
      Target Language: ${language}

      Guidelines:
      - Use professional medical terminology.
      - Ensure clear grammar and formatting.
      - Structure based on standard formats:
        - SOAP: Subjective, Objective, Assessment, Plan.
        - Nursing Note: Assessment, Intervention, Response.
        - Handover: Summary of status, critical changes, pending items.
      
      Critical Feature: Identify missing important information (e.g., vitals, dosages, specific times) and provide a "Suggestions" section at the end.
      
      Output format:
      {
        "content": "The formatted note in markdown...",
        "suggestions": ["suggestion 1", "suggestion 2"],
        "summary": "One sentence summary of the patient status"
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: rawText }] }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const result = JSON.parse(response.text || "{}");
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate note" },
      { status: 500 }
    );
  }
}