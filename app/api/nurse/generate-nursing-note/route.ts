// // app/api/nurse/generate-nursing-note/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { ai } from '@/lib/gemini';  // Use the same ai instance from your working API

// interface GenerateNoteRequest {
//   patientName: string;
//   patientBed: string;
//   noteType: 'admission' | 'progress' | 'critical' | 'discharge' | 'post-op' | 'intervention';
//   title: string;
//   assessmentFindings?: string;
//   interventions?: string;
//   patientResponse?: string;
//   priority: 'routine' | 'urgent' | 'critical';
// }

// export async function POST(request: NextRequest) {
//   try {
//     const body: GenerateNoteRequest = await request.json();
    
//     const { 
//       patientName, 
//       patientBed, 
//       noteType, 
//       title, 
//       assessmentFindings, 
//       interventions, 
//       patientResponse, 
//       priority
//     } = body;

//     if (!patientName) {
//       return NextResponse.json(
//         { error: 'Missing patient information' },
//         { status: 400 }
//       );
//     }

//     console.log(`📝 Generating ${noteType} note for ${patientName} (Bed: ${patientBed})...`);

//     const now = new Date();
//     const formattedDate = now.toLocaleDateString();
//     const formattedTime = now.toLocaleTimeString();

//     const systemInstruction = `
//       You are a professional nursing documentation assistant.
//       Transform raw clinical observations into structured nursing notes.

//       Note Type: ${noteType}
//       Priority: ${priority}
//       Patient: ${patientName} (Bed ${patientBed})

//       Guidelines:
//       - Use professional medical terminology
//       - Structure based on note type:
//         - Progress: Assessment, Interventions, Response, Plan
//         - Admission: Initial assessment, history, plan
//         - Critical: Event description, actions taken, response
//         - Discharge: Final status, instructions, follow-up
//         - Post-op: Surgical recovery, pain management, vital signs
//         - Intervention: Pre-assessment, procedure, post-assessment
      
//       Critical Feature: If clinical information is minimal, expand it professionally with appropriate medical terminology.
//       Use [brackets] for specific values that would need to be filled in.
      
//       Output format (JSON):
//       {
//         "content": "The formatted nursing note in markdown...",
//         "summary": "One sentence summary of the patient status (max 80 chars)"
//       }
//     `;

//     const userPrompt = `
//       Generate a ${noteType} nursing note for patient ${patientName} (Bed ${patientBed}).

//       Clinical Information:
//       - Assessment Findings: ${assessmentFindings || "Not specified - routine assessment"}
//       - Interventions: ${interventions || "Not specified - standard nursing care"}
//       - Patient Response: ${patientResponse || "Not specified - tolerating well"}

//       Date/Time: ${formattedDate} ${formattedTime}
//       Priority: ${priority}

//       Please generate a professional nursing note following the structure for ${noteType}.
//       Use markdown formatting with bold headers.
//     `;

//     // ✅ Use the SAME model that works in your other API
//     const response = await ai.models.generateContent({
//       model: "gemini-3-flash-preview",  // Same model that works!
//       contents: [{ parts: [{ text: userPrompt }] }],
//       config: {
//         systemInstruction,
//         temperature: 0.3,
//         maxOutputTokens: 1500,
//         responseMimeType: "application/json",
//       },
//     });

//     const result = JSON.parse(response.text || "{}");
    
//     console.log('✅ Nursing note generated successfully');

//     return NextResponse.json({
//       success: true,
//       content: result.content,
//       summary: result.summary || `${noteType} note generated`,
//       timestamp: now.toISOString(),
//     });

//   } catch (error: any) {
//     console.error('Gemini API Error:', error);
    
//     return NextResponse.json(
//       { 
//         error: error.message || 'AI service error. Please try again.',
//       },
//       { status: 500 }
//     );
//   }
// }

// // GET endpoint to check API status
// export async function GET() {
//   return NextResponse.json({
//     status: "healthy",
//     service: "Nursing Note Generator",
//     model: "gemini-3-flash-preview",
//     gemini_available: !!process.env.GEMINI_API_KEY,
//     endpoints: {
//       generate: "POST /api/nurse/generate-nursing-note"
//     }
//   });
// }





// app/api/ai/generate-note/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { models } from "@/lib/gemini";

// Your hosted Render billing server
const DYNAMIC_BILLING_URL = "https://his-ai-billing.onrender.com/api/ai/billing";
const TELEMETRY_URL = "https://his-ai-billing.onrender.com/api/ai/log-usage";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
 const targetModel = models.FLASH; // or models.FLASH if exported
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