





// // app/api/analyze/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { generateContentWithDynamicKey, models } from "@/lib/gemini";
// import { query } from "@/lib/db";

// // ✅ Your hosted Render billing server
// const DYNAMIC_BILLING_URL = "https://his-ai-billing.onrender.com/api/ai/billing";
// const TELEMETRY_URL = "https://his-ai-billing.onrender.com/api/ai/log-usage";

// export async function POST(request: NextRequest) {
//   const startTime = Date.now();
//   const targetModel = models.FLASH; // e.g., "gemini-1.5-flash"
//   let inputTokens = 0, outputTokens = 0;
//   let userIdVal = "anonymous";
//   let activeToken = "";

//   try {
//     const { patientData, userId, saveToHistory = true } = await request.json();
//     if (userId) userIdVal = String(userId);
//     if (!patientData) {
//       return NextResponse.json({ error: "Missing patient data" }, { status: 400 });
//     }

//     // 1. Fetch API key from your Render billing server
//     const billingRes = await fetch(DYNAMIC_BILLING_URL);
//     if (!billingRes.ok) throw new Error(`Billing server error: ${billingRes.status}`);
//     const configData = await billingRes.json();
//     activeToken = configData.apiKey || configData.customApiKey || configData.token;
//     if (!activeToken) throw new Error("No API key returned from billing server");

//     // 2. Build the prompt (strict JSON format)
//     const prompt = `
//       You are an advanced AI Personalized Health Recommendations Engine.
//       Analyze the following patient data and provide comprehensive, deep wellness recommendations.
      
//       Patient Profile:
//       ${JSON.stringify(patientData, null, 2)}
      
//       You MUST respond with **only** valid JSON (no markdown, no extra text) in this exact format:
//       {
//         "status": "success",
//         "summary": "Deep overall health summary explaining the 'why' behind current status",
//         "deepAnalysis": "A detailed scientific and physiological exploration...",
//         "riskAssessment": [
//           { "condition": "Diabetes", "riskLevel": "Low/Medium/High", "reason": "...", "prevention": "..." }
//         ],
//         "dietRecommendations": {
//           "focus": "Main dietary goal",
//           "recommendations": ["Rec 1", "Rec 2"],
//           "foodsToAvoid": ["Food 1", "Food 2"]
//         },
//         "exercisePlan": {
//           "type": "...",
//           "frequency": "...",
//           "routine": ["Ex 1", "Ex 2"],
//           "safetyPrecautions": ["Prec 1", "Prec 2"]
//         },
//         "mentalWellness": {
//           "assessment": "...",
//           "advice": ["Advice 1", "Advice 2"]
//         },
//         "preventiveCare": ["Care 1", "Care 2"],
//         "criticalAlert": "Only if emergency symptoms are detected, otherwise null"
//       }
      
//       Safety Rules:
//       1. Always state you are an AI, not a doctor.
//       2. If emergency symptoms (chest pain, stroke signs) are detected, set "criticalAlert" to a strong warning.
//       3. Pay close attention to "currentProblems" or "symptoms".
//       4. Use medically aware, safe, professional language.
//     `;

//     // 3. Call Gemini
//     const result = await generateContentWithDynamicKey(activeToken, targetModel, prompt);
//     const responseTimeMs = Date.now() - startTime;
//     const usage = result.usageMetadata || {};
//     inputTokens = usage.promptTokenCount || 0;
//     outputTokens = usage.candidatesTokenCount || 0;

//     // 4. Parse JSON and add fallbacks to prevent frontend crashes
//     let parsedResponse;
//     try {
//       parsedResponse = JSON.parse(result.text || "{}");
//     } catch (parseErr) {
//       console.error("JSON parse error, using fallback");
//       parsedResponse = {};
//     }

//     // Ensure every expected section exists
//     parsedResponse.status = parsedResponse.status || "success";
//     parsedResponse.summary = parsedResponse.summary || "Analysis complete. Please consult a healthcare provider.";
//     parsedResponse.deepAnalysis = parsedResponse.deepAnalysis || "No deep analysis available.";
//     parsedResponse.riskAssessment = Array.isArray(parsedResponse.riskAssessment) ? parsedResponse.riskAssessment : [];
//     parsedResponse.dietRecommendations = {
//       focus: parsedResponse.dietRecommendations?.focus || "Balanced nutrition",
//       recommendations: Array.isArray(parsedResponse.dietRecommendations?.recommendations) ? parsedResponse.dietRecommendations.recommendations : [],
//       foodsToAvoid: Array.isArray(parsedResponse.dietRecommendations?.foodsToAvoid) ? parsedResponse.dietRecommendations.foodsToAvoid : [],
//     };
//     parsedResponse.exercisePlan = {
//       type: parsedResponse.exercisePlan?.type || "Moderate physical activity",
//       frequency: parsedResponse.exercisePlan?.frequency || "3-5 times per week",
//       routine: Array.isArray(parsedResponse.exercisePlan?.routine) ? parsedResponse.exercisePlan.routine : [],
//       safetyPrecautions: Array.isArray(parsedResponse.exercisePlan?.safetyPrecautions) ? parsedResponse.exercisePlan.safetyPrecautions : [],
//     };
//     parsedResponse.mentalWellness = {
//       assessment: parsedResponse.mentalWellness?.assessment || "No specific mental wellness assessment.",
//       advice: Array.isArray(parsedResponse.mentalWellness?.advice) ? parsedResponse.mentalWellness.advice : [],
//     };
//     parsedResponse.preventiveCare = Array.isArray(parsedResponse.preventiveCare) ? parsedResponse.preventiveCare : [];
//     parsedResponse.criticalAlert = parsedResponse.criticalAlert || null;

//     // 5. Save to database (your existing code)
//     let savedRecord = null;
//     if (userId && saveToHistory) {
//       try {
//         let riskLevel = "Low";
//         if (parsedResponse.riskAssessment.length > 0) {
//           const hasHigh = parsedResponse.riskAssessment.some((r: any) => String(r.riskLevel).toLowerCase() === "high");
//           const hasMed = parsedResponse.riskAssessment.some((r: any) => String(r.riskLevel).toLowerCase() === "medium");
//           riskLevel = hasHigh ? "High" : hasMed ? "Medium" : "Low";
//         }

//         await query(`
//           CREATE TABLE IF NOT EXISTS health_analysis_history (
//             id SERIAL PRIMARY KEY,
//             user_id INTEGER,
//             patient_name VARCHAR(100),
//             patient_age INTEGER,
//             patient_gender VARCHAR(20),
//             patient_data JSONB,
//             analysis_report JSONB,
//             summary TEXT,
//             risk_level VARCHAR(20),
//             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//           )
//         `);

//         const insertResult = await query(
//           `INSERT INTO health_analysis_history (
//             user_id, patient_name, patient_age, patient_gender, patient_data, analysis_report, summary, risk_level
//           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
//           [
//             Number(userId),
//             patientData.name || "Unknown",
//             patientData.age ? Number(patientData.age) : null,
//             patientData.gender || null,
//             JSON.stringify(patientData),
//             JSON.stringify(parsedResponse),
//             parsedResponse.summary || "",
//             riskLevel,
//           ]
//         );

//         if (insertResult.rows?.length > 0) {
//           savedRecord = { id: insertResult.rows[0].id, saved: true };
//           console.log("✅ Analysis saved to DB. ID:", savedRecord.id);
//         }
//       } catch (dbError: any) {
//         console.error("⚠️ DB save error:", dbError.message);
//         savedRecord = { saved: false, error: dbError.message };
//       }
//     }

//     // 6. Send telemetry WITH authentication (Bearer token)
//     //    The billing server expects the same API key for non‑localhost requests.
//     fetch(TELEMETRY_URL, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${activeToken}`, // ✅ critical fix
//       },
//       body: JSON.stringify({
//         projectName: "Hospital CRM (Next.js)",
//         model: targetModel,
//         inputTokens,
//         outputTokens,
//         responseTimeMs,
//         status: "success",
//         userRole: "doctor",
//       }),
//     }).catch(err => console.error("Telemetry error:", err));

//     // 7. Return response to frontend
//     return NextResponse.json({
//       ...parsedResponse,
//       _saved: savedRecord?.saved || false,
//       _savedId: savedRecord?.id || null,
//       _savedError: savedRecord?.error || null,
//     });
//   } catch (err: any) {
//     const errorDuration = Date.now() - startTime;
//     console.error("❌ Analysis error:", err);

//     // Send error telemetry (also with Bearer token)
//     if (activeToken) {
//       fetch(TELEMETRY_URL, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${activeToken}`,
//         },
//         body: JSON.stringify({
//           projectName: "Hospital CRM (Next.js)",
//           model: targetModel,
//           inputTokens: 0,
//           outputTokens: 0,
//           responseTimeMs: errorDuration,
//           status: "error",
//           errorDetails: err.message,
//           userRole: "doctor",
//         }),
//       }).catch(() => {});
//     }

//     return NextResponse.json(
//       { error: "Health analysis failed", details: err.message },
//       { status: 500 }
//     );
//   }
// }






// app/api/soap/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { query } from "@/lib/db";

// ✅ Your hosted Render billing server
const DYNAMIC_BILLING_URL = "https://his-ai-billing.onrender.com/api/ai/billing";
const TELEMETRY_URL = "https://his-ai-billing.onrender.com/api/ai/log-usage";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let inputTokens = 0, outputTokens = 0;
  let userIdVal = "anonymous";
  let activeToken = "";
  let transcript = "";

  try {
    const body = await request.json();
    transcript = body.transcript || "";
    const { patientId, userId, saveToHistory = true } = body;
    
    if (userId) userIdVal = String(userId);

    // --- VALIDATE INPUT ---
    if (!transcript || transcript.trim().length === 0) {
      return NextResponse.json(
        { error: 'Conversation transcript is required.' },
        { status: 400 }
      );
    }

    // --- FETCH API KEY FROM BILLING SERVER (ONLY SOURCE OF TRUTH) ---
    console.log('[SOAP API] Fetching API key from billing server...');
    const billingRes = await fetch(DYNAMIC_BILLING_URL);
    if (!billingRes.ok) {
      throw new Error(`Billing server error: ${billingRes.status}`);
    }
    const configData = await billingRes.json();
    
    // Extract API key from the response (matches your billing server format)
    activeToken = configData.apiKey || configData.token || configData.customApiKey || configData.apiToken;
    
    if (!activeToken) {
      throw new Error("No API key returned from billing server");
    }
    
    console.log('[SOAP API] ✅ API key retrieved successfully from billing server');

    // --- INITIALIZE GEMINI ---
    const ai = new GoogleGenAI({
      apiKey: activeToken,
      httpOptions: {
        headers: {
          'User-Agent': 'clinical-soap-api'
        }
      }
    });

    const targetModel = "gemini-3.5-flash";

    // --- SYSTEM PROMPT ---
    const systemPrompt = `You are an expert medical scribe. Generate SOAP notes from doctor-patient dialogue.

CRITICAL RULES:
1. ONLY include information explicitly mentioned in the transcript.
2. NEVER invent symptoms, vitals, or exam findings.
3. If the doctor orders tests (CBC, blood sugar, urine, etc.), include them in the Plan section.
4. If vitals aren't mentioned, state: "Vitals not documented in transcript."
5. If no medications are prescribed, state: "No medications prescribed during this visit."

Structure your response as JSON with:
- subjective: Chief complaint, history, symptoms (verbatim from transcript)
- objective: Physical exam findings, vitals mentioned
- assessment: Differential diagnoses based on symptoms
- plan: Action items, lab orders, medications, follow-up
- icd10Codes: Array of {code, description}
- medications: Array of {name, dosage, frequency, instructions}
- followUps: Return instructions
- patientSummary: Plain-language summary for the patient
- confidenceScore: Integer (1-100) based on transcript clarity`;

    const userPrompt = `Generate SOAP notes from this transcript:
--- TRANSCRIPT ---
${transcript}
--- END TRANSCRIPT ---`;

    // --- CALL GEMINI API ---
    console.log(`[SOAP API] Calling Gemini model: ${targetModel}`);
    const response = await ai.models.generateContent({
      model: targetModel,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subjective: { type: Type.STRING },
            objective: { type: Type.STRING },
            assessment: { type: Type.STRING },
            plan: { type: Type.STRING },
            icd10Codes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  code: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["code", "description"]
              }
            },
            medications: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  dosage: { type: Type.STRING },
                  frequency: { type: Type.STRING },
                  instructions: { type: Type.STRING }
                },
                required: ["name"]
              }
            },
            followUps: { type: Type.STRING },
            patientSummary: { type: Type.STRING },
            confidenceScore: { type: Type.INTEGER }
          },
          required: ["subjective", "objective", "assessment", "plan", "icd10Codes", "medications", "followUps", "patientSummary", "confidenceScore"]
        }
      }
    });

    const result = response.text;
    if (!result) {
      throw new Error("Gemini returned an empty response.");
    }

    // --- EXTRACT TOKEN USAGE ---
    const usage = response.usageMetadata || {};
    inputTokens = usage.promptTokenCount || 0;
    outputTokens = usage.candidatesTokenCount || 0;

    // --- CLEAN AND PARSE JSON ---
    let cleanedText = result.trim();
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.substring(7);
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.substring(3);
    }
    if (cleanedText.endsWith("```")) {
      cleanedText = cleanedText.substring(0, cleanedText.length - 3);
    }
    cleanedText = cleanedText.trim();

    const soapNote = JSON.parse(cleanedText);
    
    // --- VALIDATE RESPONSE STRUCTURE ---
    const requiredFields = ['subjective', 'objective', 'assessment', 'plan', 'icd10Codes', 'medications', 'followUps', 'patientSummary', 'confidenceScore'];
    for (const field of requiredFields) {
      if (!soapNote[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // --- EXTRACT LAB ORDERS FROM PLAN ---
    const labOrders = extractLabOrders(soapNote.plan);

    // --- SAVE TO DATABASE (Optional) ---
    let savedRecord = null;
    if (userId && saveToHistory) {
      try {
        await query(`
          CREATE TABLE IF NOT EXISTS soap_notes_history (
            id SERIAL PRIMARY KEY,
            user_id INTEGER,
            patient_id VARCHAR(100),
            transcript TEXT,
            subjective TEXT,
            objective TEXT,
            assessment TEXT,
            plan TEXT,
            icd10_codes JSONB,
            medications JSONB,
            follow_ups TEXT,
            patient_summary TEXT,
            confidence_score INTEGER,
            lab_orders JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);

        const insertResult = await query(
          `INSERT INTO soap_notes_history (
            user_id, patient_id, transcript, subjective, objective, assessment, plan, 
            icd10_codes, medications, follow_ups, patient_summary, confidence_score, lab_orders
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id`,
          [
            Number(userId),
            patientId || null,
            transcript,
            soapNote.subjective,
            soapNote.objective,
            soapNote.assessment,
            soapNote.plan,
            JSON.stringify(soapNote.icd10Codes),
            JSON.stringify(soapNote.medications),
            soapNote.followUps,
            soapNote.patientSummary,
            soapNote.confidenceScore,
            JSON.stringify(labOrders)
          ]
        );

        if (insertResult.rows?.length > 0) {
          savedRecord = { id: insertResult.rows[0].id, saved: true };
          console.log("✅ SOAP note saved to DB. ID:", savedRecord.id);
        }
      } catch (dbError: any) {
        console.error("⚠️ DB save error:", dbError.message);
        savedRecord = { saved: false, error: dbError.message };
      }
    }

    // --- SEND WHATSAPP NOTIFICATION (If lab orders exist) ---
  let whatsappStatus: { sent: boolean; error: string | null } = { sent: false, error: null };
    if (labOrders.length > 0) {
      try {
        whatsappStatus = await sendWhatsAppNotification(labOrders, soapNote, patientId);
      } catch (whatsappError: any) {
        console.error('[SOAP API] WhatsApp failed:', whatsappError.message);
        whatsappStatus = { sent: false, error: whatsappError.message };
      }
    }

    // --- SEND TELEMETRY ---
    const responseTimeMs = Date.now() - startTime;
    fetch(TELEMETRY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${activeToken}`,
      },
      body: JSON.stringify({
        projectName: "Hospital CRM (Next.js) - SOAP API",
        model: targetModel,
        inputTokens,
        outputTokens,
        responseTimeMs,
        status: "success",
        userRole: "doctor",
        endpoint: "/api/soap"
      }),
    }).catch(err => console.error("Telemetry error:", err));

    // --- RETURN RESPONSE ---
    return NextResponse.json({
      ...soapNote,
      labOrders: labOrders,
      labOrdersDetected: labOrders.length > 0,
      whatsapp: whatsappStatus,
      _saved: savedRecord?.saved || false,
      _savedId: savedRecord?.id || null,
      _savedError: savedRecord?.error || null,
    });

  } catch (error: any) {
    const errorDuration = Date.now() - startTime;
    console.error('[SOAP API] Error:', error);

    // Send error telemetry
    if (activeToken) {
      fetch(TELEMETRY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${activeToken}`,
        },
        body: JSON.stringify({
          projectName: "Hospital CRM (Next.js) - SOAP API",
          model: "gemini-3.5-flash",
          inputTokens: 0,
          outputTokens: 0,
          responseTimeMs: errorDuration,
          status: "error",
          errorDetails: error.message,
          userRole: "doctor",
          endpoint: "/api/soap"
        }),
      }).catch(() => {});
    }

    return NextResponse.json(
      { 
        error: 'Failed to generate SOAP notes.',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// ============================================
// HELPER: Extract Lab Orders from Plan
// ============================================
function extractLabOrders(plan: string): string[] {
  const labs: string[] = [];
  
  const labKeywords = [
    { keyword: 'CBC', test: 'Complete Blood Count (CBC)' },
    { keyword: 'blood sugar', test: 'Blood Sugar Test' },
    { keyword: 'glucose', test: 'Blood Sugar Test' },
    { keyword: 'HbA1c', test: 'Hemoglobin A1c (HbA1c)' },
    { keyword: 'urine', test: 'Urine Routine Examination' },
    { keyword: 'urinalysis', test: 'Urinalysis' },
    { keyword: 'creatinine', test: 'Serum Creatinine' },
    { keyword: 'BUN', test: 'Blood Urea Nitrogen (BUN)' },
    { keyword: 'LFT', test: 'Liver Function Test (LFT)' },
    { keyword: 'thyroid', test: 'Thyroid Function Test (TSH)' },
    { keyword: 'TSH', test: 'Thyroid Stimulating Hormone (TSH)' },
    { keyword: 'lipid', test: 'Lipid Panel' },
    { keyword: 'cholesterol', test: 'Cholesterol Panel' },
    { keyword: 'hemoglobin', test: 'Hemoglobin' },
    { keyword: 'hematocrit', test: 'Hematocrit' },
    { keyword: 'platelet', test: 'Platelet Count' },
    { keyword: 'WBC', test: 'White Blood Cell Count' },
    { keyword: 'RBC', test: 'Red Blood Cell Count' },
    { keyword: 'electrolyte', test: 'Electrolyte Panel' },
    { keyword: 'potassium', test: 'Potassium' },
    { keyword: 'sodium', test: 'Sodium' },
    { keyword: 'calcium', test: 'Calcium' },
    { keyword: 'magnesium', test: 'Magnesium' },
    { keyword: 'iron', test: 'Iron Studies' },
    { keyword: 'ferritin', test: 'Ferritin' },
    { keyword: 'B12', test: 'Vitamin B12' },
    { keyword: 'folate', test: 'Folate' },
    { keyword: 'culture', test: 'Culture and Sensitivity' },
    { keyword: 'microscopy', test: 'Microscopy Examination' },
    { keyword: 'sputum', test: 'Sputum Analysis' },
    { keyword: 'stool', test: 'Stool Analysis' },
  ];

  const planLower = plan.toLowerCase();
  
  for (const lab of labKeywords) {
    if (planLower.includes(lab.keyword.toLowerCase())) {
      if (!labs.includes(lab.test)) {
        labs.push(lab.test);
      }
    }
  }

  return labs;
}

// ============================================
// HELPER: Send WhatsApp Notification
// ============================================
async function sendWhatsAppNotification(
  labOrders: string[], 
  soapNote: any, 
  patientId?: string
): Promise<{ sent: boolean; error: string | null }> {
  const whatsappToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const fromPhoneNumberId = process.env.FROM_PHONE_NUMBER_ID;
  const labInchargePhone = process.env.LAB_INCHARGE_PHONE;

  // Check if WhatsApp is configured
  if (!whatsappToken || !fromPhoneNumberId || !labInchargePhone) {
    console.warn('[SOAP API] WhatsApp credentials not configured. Skipping.');
    return { sent: false, error: 'WhatsApp not configured' };
  }

  // Build the message
  const labList = labOrders.map((lab, index) => `${index + 1}. ${lab}`).join('\n');
  const orderId = `LAB-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
  
  const message = `🔬 *NEW LAB ORDER RECEIVED* 🔬

*Order ID:* #${orderId}
*Patient ID:* ${patientId || 'Not provided'}
*Date:* ${new Date().toLocaleString()}

*Tests Required:*
${labList}

*Clinical Suspicion:*
${soapNote.assessment ? soapNote.assessment.substring(0, 300) : 'Based on clinical presentation'}

*Doctor Notes:*
${soapNote.subjective ? soapNote.subjective.substring(0, 200) : 'N/A'}

*Priority:* ROUTINE

*Instructions:*
Please process samples and return results within 24-48 hours.

*Please reply with 'RECEIVED' to confirm.*`;

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${fromPhoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${whatsappToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: labInchargePhone,
          type: 'text',
          text: { body: message }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`WhatsApp API error: ${JSON.stringify(errorData)}`);
    }

    console.log('[SOAP API] ✅ WhatsApp notification sent successfully.');
    return { sent: true, error: null };
  } catch (error: any) {
    console.error('[SOAP API] ❌ WhatsApp failed:', error.message);
    return { sent: false, error: error.message };
  }
}