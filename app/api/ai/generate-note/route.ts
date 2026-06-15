// // app/api/generate-note/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { ai } from '@/lib/gemini';

// export async function POST(request: NextRequest) {
//   try {
//     const { rawText, noteType, language = "English" } = await request.json();

//     if (!rawText) {
//       return NextResponse.json(
//         { error: "No input text provided" },
//         { status: 400 }
//       );
//     }

//     const systemInstruction = `
//       You are a professional medical scribe assistant. 
//       Your task is to transform raw patient observations into structured clinical documentation.
      
//       Note Type Requested: ${noteType}
//       Target Language: ${language}

//       Guidelines:
//       - Use professional medical terminology.
//       - Ensure clear grammar and formatting.
//       - Structure based on standard formats:
//         - SOAP: Subjective, Objective, Assessment, Plan.
//         - Nursing Note: Assessment, Intervention, Response.
//         - Handover: Summary of status, critical changes, pending items.
      
//       Critical Feature: Identify missing important information (e.g., vitals, dosages, specific times) and provide a "Suggestions" section at the end.
      
//       Output format:
//       {
//         "content": "The formatted note in markdown...",
//         "suggestions": ["suggestion 1", "suggestion 2"],
//         "summary": "One sentence summary of the patient status"
//       }
//     `;

//     const response = await ai.models.generateContent({
//       model: "gemini-3-flash-preview",
//       contents: [{ parts: [{ text: rawText }] }],
//       config: {
//         systemInstruction,
//         responseMimeType: "application/json",
//       },
//     });

//     const result = JSON.parse(response.text || "{}");
//     return NextResponse.json(result);
    
//   } catch (error: any) {
//     console.error("Gemini Error:", error);
//     return NextResponse.json(
//       { error: error.message || "Failed to generate note" },
//       { status: 500 }
//     );
//   }
// }


// app/api/ai/generate-note/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Your hosted Render billing server
const DYNAMIC_BILLING_URL = "https://his-ai-billing.onrender.com/api/ai/billing";
const TELEMETRY_URL = "https://his-ai-billing.onrender.com/api/ai/log-usage";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const targetModel = "gemini-1.5-flash"; // or models.FLASH if exported
  let inputTokens = 0, outputTokens = 0;
  let activeToken = "";

  try {
    const { rawText, noteType, language = "English" } = await request.json();

    if (!rawText) {
      return NextResponse.json(
        { error: "No input text provided" },
        { status: 400 }
      );
    }

    // 1. Fetch API key from Render billing server
    const billingRes = await fetch(DYNAMIC_BILLING_URL);
    if (!billingRes.ok) throw new Error(`Billing server error: ${billingRes.status}`);
    const configData = await billingRes.json();
    activeToken = configData.apiKey || configData.customApiKey || configData.token;
    if (!activeToken) throw new Error("No API key returned from billing server");

    // 2. Build system instruction and prompt
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
      
      Output format (JSON only, no markdown):
      {
        "content": "The formatted note in markdown...",
        "suggestions": ["suggestion 1", "suggestion 2"],
        "summary": "One sentence summary of the patient status"
      }
    `;

    const prompt = `Raw observations: ${rawText}`;

    // 3. Create Gemini client with dynamic token
    const aiClient = new GoogleGenAI({ apiKey: activeToken });
    const response = await aiClient.models.generateContent({
      model: targetModel,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const responseTimeMs = Date.now() - startTime;
    const usage = response.usageMetadata || {};
    inputTokens = usage.promptTokenCount || 0;
    outputTokens = usage.candidatesTokenCount || 0;

    // 4. Parse JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(response.text || "{}");
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr);
      return NextResponse.json(
        { error: "Invalid response format from AI" },
        { status: 500 }
      );
    }

    // 5. Send telemetry (doctor role)
    fetch(TELEMETRY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${activeToken}`,
      },
      body: JSON.stringify({
        projectName: "Doctor Note Generator",
        model: targetModel,
        inputTokens,
        outputTokens,
        responseTimeMs,
        status: "success",
        userRole: "doctor",
      }),
    }).catch(err => console.error("Telemetry error:", err));

    return NextResponse.json(parsedResponse);
  } catch (error: any) {
    const errorDuration = Date.now() - startTime;
    console.error("Gemini Error:", error);

    if (activeToken) {
      fetch(TELEMETRY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${activeToken}`,
        },
        body: JSON.stringify({
          projectName: "Doctor Note Generator",
          model: targetModel,
          inputTokens: 0,
          outputTokens: 0,
          responseTimeMs: errorDuration,
          status: "error",
          errorDetails: error.message || "Unknown error",
          userRole: "doctor",
        }),
      }).catch(() => {});
    }

    return NextResponse.json(
      { error: error.message || "Failed to generate note" },
      { status: 500 }
    );
  }
}