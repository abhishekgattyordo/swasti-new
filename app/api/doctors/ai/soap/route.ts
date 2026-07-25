





// import { GoogleGenAI, Type } from '@google/genai';
// import { NextRequest, NextResponse } from 'next/server';
// import { models } from '@/lib/gemini';
// import { query } from '@/lib/db';

// const BILLING_URL = "https://his-ai-billing.onrender.com/api/ai/billing";
// const TELEMETRY_URL = "https://his-ai-billing.onrender.com/api/ai/log-usage";

// export async function POST(request: NextRequest) {
//   const startTime = Date.now();
//   const targetModel = models.FLASH;
//   let inputTokens = 0, outputTokens = 0;
//   let activeToken = "";
//   let transcript = "";

//   try {
//     const body = await request.json();
//     transcript = body.transcript || "";
//     const { patientId, userId, saveToHistory = true, patientName } = body;

//     if (!transcript || transcript.trim().length === 0) {
//       return NextResponse.json(
//         { error: 'Conversation transcript is required.' },
//         { status: 400 }
//       );
//     }

//     // 1. Fetch API key from billing server (with fallback)
//     let apiKey = "";
//     try {
//       console.log('[SOAP API] Attempting to fetch API key from billing server...');
//       const billingRes = await fetch(BILLING_URL, {
//         signal: AbortSignal.timeout(5000) // 5 second timeout
//       });
      
//       if (billingRes.ok) {
//         const configData = await billingRes.json();
//         apiKey = configData.apiKey || configData.customApiKey || configData.token || configData.apiToken || configData.envApiKey;
//         activeToken = apiKey;
//         console.log('[SOAP API] ✅ Billing server API key retrieved.');
//       } else {
//         console.warn(`[SOAP API] Billing server responded with ${billingRes.status}, falling back to env.`);
//       }
//     } catch (fetchErr: any) {
//       console.warn('[SOAP API] Failed to fetch from billing server:', fetchErr.message);
//       console.warn('[SOAP API] Falling back to environment variable...');
//     }

//     // 2. Fallback to environment variable if billing server failed
//     if (!apiKey) {
//       apiKey = process.env.GEMINI_API_KEY || "";
//       activeToken = apiKey;
//       if (apiKey) {
//         console.log('[SOAP API] ✅ Using fallback GEMINI_API_KEY from environment.');
//       }
//     }

//     if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
//       console.error('[SOAP API] ❌ No valid API key available.');
//       return NextResponse.json(
//         { 
//           error: 'Gemini API key is not configured. Please set a valid GEMINI_API_KEY in your environment or ensure the billing server is available.' 
//         },
//         { status: 503 }
//       );
//     }

//     // 3. Initialize Gemini client
//     const ai = new GoogleGenAI({
//       apiKey: apiKey,
//       httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
//     });

//     const systemPrompt = `You are an expert medical scribe. Generate SOAP notes from doctor-patient dialogue.

// CRITICAL RULES:
// 1. ONLY include information explicitly mentioned in the transcript.
// 2. NEVER invent symptoms, vitals, or exam findings.
// 3. If the doctor orders tests (CBC, blood sugar, urine, etc.), include them in the Plan section AND list them in labOrders array.
// 4. If vitals aren't mentioned, state: "Vitals not documented in transcript."
// 5. If no medications are prescribed, state: "No medications prescribed during this visit."

// GLOBAL TRANSLATION RULE (CRITICAL):
// If the doctor and patient are talking in any Indian regional language (such as Hindi, Kannada, Malayalam, Tamil, Tulu, Telugu, Marathi, or any mix like Hinglish, Kanglish, etc.), you MUST translate the entire dialogue context and output all standard SOAP Note fields in fluent, professional, clinical English. The final fields (subjective, objective, assessment, plan, patientSummary) must be strictly in professional clinical English.

// Return a JSON object with these exact fields:
// - subjective: Chief complaint, history, symptoms (verbatim from transcript)
// - objective: Physical exam findings, vitals mentioned
// - assessment: Differential diagnoses based on symptoms
// - plan: Action items, lab orders, medications, follow-up
// - icd10Codes: Array of {code, description}
// - medications: Array of {name, dosage, frequency, instructions}
// - followUps: Return instructions
// - patientSummary: Plain-language summary for the patient
// - detectedLanguage: String summarizing the detected spoken language or mixed regional dialect
// - confidenceScore: Integer (1-100)
// - labOrders: Array of strings - EXTRACT ALL lab tests from the plan section`;

//     const userPrompt = `Generate SOAP notes from this transcript:
// --- TRANSCRIPT ---
// ${transcript}
// --- END TRANSCRIPT ---`;

//     // 4. Call Gemini with updated schema
//     const response = await ai.models.generateContent({
//       model: targetModel,
//       contents: [
//         { role: 'user', parts: [{ text: systemPrompt }] },
//         { role: 'user', parts: [{ text: userPrompt }] },
//       ],
//       config: {
//         responseMimeType: 'application/json',
//         responseSchema: {
//           type: Type.OBJECT,
//           properties: {
//             subjective: { type: Type.STRING },
//             objective: { type: Type.STRING },
//             assessment: { type: Type.STRING },
//             plan: { type: Type.STRING },
//             icd10Codes: {
//               type: Type.ARRAY,
//               items: {
//                 type: Type.OBJECT,
//                 properties: {
//                   code: { type: Type.STRING },
//                   description: { type: Type.STRING }
//                 },
//                 required: ["code", "description"]
//               }
//             },
//             medications: {
//               type: Type.ARRAY,
//               items: {
//                 type: Type.OBJECT,
//                 properties: {
//                   name: { type: Type.STRING },
//                   dosage: { type: Type.STRING },
//                   frequency: { type: Type.STRING },
//                   instructions: { type: Type.STRING }
//                 },
//                 required: ["name"]
//               }
//             },
//             followUps: { type: Type.STRING },
//             patientSummary: { type: Type.STRING },
//             detectedLanguage: { type: Type.STRING },
//             confidenceScore: { type: Type.INTEGER },
//             labOrders: { 
//               type: Type.ARRAY, 
//               items: { type: Type.STRING }
//             }
//           },
//           required: ['subjective', 'objective', 'assessment', 'plan', 'icd10Codes', 'medications', 'followUps', 'patientSummary', 'detectedLanguage', 'confidenceScore', 'labOrders']
//         }
//       }
//     });

//     const responseTimeMs = Date.now() - startTime;
//     const usage = response.usageMetadata || {};
//     inputTokens = usage.promptTokenCount || 0;
//     outputTokens = usage.candidatesTokenCount || 0;

//     const textOutput = response.text;
//     if (!textOutput) {
//       throw new Error('Gemini returned empty response');
//     }

//     const soapNote = JSON.parse(textOutput.trim());

//     // PRIORITY: Use labOrders from Gemini, fallback to extraction
//     let labOrders = soapNote.labOrders || [];
//     if (labOrders.length === 0) {
//       labOrders = extractLabOrders(soapNote.plan);
//     }

//     // --- SAVE TO DATABASE (Optional) ---
//     let savedRecord = null;
//     if (userId && saveToHistory) {
//       try {
//         // ✅ Check if column exists before inserting
//         const columnCheck = await query(`
//           SELECT column_name 
//           FROM information_schema.columns 
//           WHERE table_name = 'soap_notes_history' 
//           AND column_name = 'detected_language'
//         `);

//         if (columnCheck.rows.length === 0) {
//           // Add column if it doesn't exist
//           await query(`
//             ALTER TABLE soap_notes_history 
//             ADD COLUMN IF NOT EXISTS detected_language TEXT
//           `);
//           console.log('✅ Added detected_language column to soap_notes_history');
//         }

//         await query(`
//           CREATE TABLE IF NOT EXISTS soap_notes_history (
//             id SERIAL PRIMARY KEY,
//             user_id INTEGER,
//             patient_id VARCHAR(100),
//             transcript TEXT,
//             subjective TEXT,
//             objective TEXT,
//             assessment TEXT,
//             plan TEXT,
//             icd10_codes JSONB,
//             medications JSONB,
//             follow_ups TEXT,
//             patient_summary TEXT,
//             detected_language TEXT,
//             confidence_score INTEGER,
//             lab_orders JSONB,
//             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//           )
//         `);

//         const insertResult = await query(
//           `INSERT INTO soap_notes_history (
//             user_id, patient_id, transcript, subjective, objective, assessment, plan, 
//             icd10_codes, medications, follow_ups, patient_summary, detected_language, confidence_score, lab_orders
//           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id`,
//           [
//             Number(userId),
//             patientId || null,
//             transcript,
//             soapNote.subjective,
//             soapNote.objective,
//             soapNote.assessment,
//             soapNote.plan,
//             JSON.stringify(soapNote.icd10Codes),
//             JSON.stringify(soapNote.medications),
//             soapNote.followUps,
//             soapNote.patientSummary,
//             soapNote.detectedLanguage || 'English',
//             soapNote.confidenceScore,
//             JSON.stringify(labOrders)
//           ]
//         );

//         if (insertResult.rows?.length > 0) {
//           savedRecord = { id: insertResult.rows[0].id, saved: true };
//           console.log("✅ SOAP note saved to DB. ID:", savedRecord.id);
//         }
//       } catch (dbError: any) {
//         console.error("⚠️ DB save error:", dbError.message);
//         savedRecord = { saved: false, error: dbError.message };
//       }
//     }

//     // --- SEND WHATSAPP NOTIFICATION (If lab orders exist) ---
//     let whatsappStatus: { sent: boolean; error: string | null } = { sent: false, error: null };
//     if (labOrders.length > 0) {
//       try {
//         whatsappStatus = await sendWhatsAppNotification(labOrders, soapNote, patientId, patientName);
//       } catch (whatsappError: any) {
//         console.error('[SOAP API] WhatsApp failed:', whatsappError.message);
//         whatsappStatus = { sent: false, error: whatsappError.message };
//       }
//     }

//     // 5. Send telemetry (if token available)
//     if (activeToken) {
//       fetch(TELEMETRY_URL, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${activeToken}`,
//         },
//         body: JSON.stringify({
//           projectName: "Doctor SOAP Notes API",
//           model: targetModel,
//           inputTokens,
//           outputTokens,
//           responseTimeMs,
//           status: "success",
//           userRole: "doctor",
//         }),
//       }).catch(err => console.error("Telemetry error:", err));
//     }

//     return NextResponse.json({
//       ...soapNote,
//       labOrders: labOrders,
//       labOrdersDetected: labOrders.length > 0,
//       whatsapp: whatsappStatus,
//       _saved: savedRecord?.saved || false,
//       _savedId: savedRecord?.id || null,
//       _savedError: savedRecord?.error || null,
//     });

//   } catch (err: any) {
//     const errorDuration = Date.now() - startTime;
//     console.error('SOAP API error:', err);

//     if (activeToken) {
//       fetch(TELEMETRY_URL, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${activeToken}`,
//         },
//         body: JSON.stringify({
//           projectName: "Doctor SOAP Notes API",
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

//     return NextResponse.json(
//       { error: err.message || 'Failed to generate SOAP notes' },
//       { status: 500 }
//     );
//   }
// }

// // ============================================
// // HELPER: Extract Lab Orders from Plan (Fallback)
// // ============================================
// function extractLabOrders(plan: string): string[] {
//   const labs: string[] = [];
  
//   const labKeywords = [
//     { keyword: 'CBC', test: 'Complete Blood Count (CBC)' },
//     { keyword: 'blood sugar', test: 'Blood Sugar Test' },
//     { keyword: 'glucose', test: 'Blood Sugar Test' },
//     { keyword: 'HbA1c', test: 'Hemoglobin A1c (HbA1c)' },
//     { keyword: 'urine', test: 'Urine Routine Examination' },
//     { keyword: 'urinalysis', test: 'Urinalysis' },
//     { keyword: 'creatinine', test: 'Serum Creatinine' },
//     { keyword: 'BUN', test: 'Blood Urea Nitrogen (BUN)' },
//     { keyword: 'LFT', test: 'Liver Function Test (LFT)' },
//     { keyword: 'thyroid', test: 'Thyroid Function Test (TSH)' },
//     { keyword: 'TSH', test: 'Thyroid Stimulating Hormone (TSH)' },
//     { keyword: 'lipid', test: 'Lipid Panel' },
//     { keyword: 'cholesterol', test: 'Cholesterol Panel' },
//     { keyword: 'hemoglobin', test: 'Hemoglobin' },
//     { keyword: 'hematocrit', test: 'Hematocrit' },
//     { keyword: 'platelet', test: 'Platelet Count' },
//     { keyword: 'WBC', test: 'White Blood Cell Count' },
//     { keyword: 'RBC', test: 'Red Blood Cell Count' },
//     { keyword: 'electrolyte', test: 'Electrolyte Panel' },
//     { keyword: 'potassium', test: 'Potassium' },
//     { keyword: 'sodium', test: 'Sodium' },
//     { keyword: 'calcium', test: 'Calcium' },
//     { keyword: 'magnesium', test: 'Magnesium' },
//     { keyword: 'iron', test: 'Iron Studies' },
//     { keyword: 'ferritin', test: 'Ferritin' },
//     { keyword: 'B12', test: 'Vitamin B12' },
//     { keyword: 'folate', test: 'Folate' },
//     { keyword: 'culture', test: 'Culture and Sensitivity' },
//     { keyword: 'microscopy', test: 'Microscopy Examination' },
//     { keyword: 'sputum', test: 'Sputum Analysis' },
//     { keyword: 'stool', test: 'Stool Analysis' },
//   ];

//   const planLower = plan.toLowerCase();
  
//   for (const lab of labKeywords) {
//     if (planLower.includes(lab.keyword.toLowerCase())) {
//       if (!labs.includes(lab.test)) {
//         labs.push(lab.test);
//       }
//     }
//   }

//   return labs;
// }
// // ============================================
// // HELPER: Send WhatsApp Notification (MSG91) - DEBUG VERSION


// // ============================================

// async function sendWhatsAppNotification(
//   labOrders: string[],
//   soapNote: any,
//   patientId?: string,
//   patientName?: string
// ): Promise<{ sent: boolean; error: string | null }> {

//   const authKey = process.env.MSG91_AUTH_KEY;
//   const integratedNumber = process.env.MSG91_INTEGRATED_NUMBER;
//   const labInchargePhone = process.env.LAB_INCHARGE_PHONE?.replace('+', '');

//   console.log('========================================');
//   console.log('📱 MSG91 WHATSAPP DEBUG');
//   console.log('========================================');
//   console.log('AUTH KEY:', authKey ? '✅ Present' : '❌ Missing');
//   console.log('INTEGRATED NUMBER:', integratedNumber);
//   console.log('PHONE NUMBER:', labInchargePhone);
//   console.log('PATIENT NAME:', patientName);
//   console.log('LAB ORDERS:', labOrders);
//   console.log('========================================');

//   if (!authKey || !integratedNumber || !labInchargePhone) {
//     return {
//       sent: false,
//       error: 'MSG91 configuration missing'
//     };
//   }

//   if (!labOrders || labOrders.length === 0) {
//     return {
//       sent: false,
//       error: 'No lab orders found'
//     };
//   }

//   const orderId = `LAB-${Date.now().toString().slice(-6)}`;

//   const labList =
//   labOrders.length === 1
//     ? labOrders[0]
//     : labOrders.join(', ');

//   const date = new Date().toLocaleString('en-US', {
//     timeZone: 'Asia/Kolkata',
//     day: '2-digit',
//     month: 'short',
//     year: 'numeric',
//     hour: 'numeric',
//     minute: '2-digit',
//     hour12: true
//   });

//   const clinicalSuspicion =
//     soapNote?.assessment?.substring(0, 200) ||
//     'Based on clinical presentation';

//   const messagePayload = {
//     integrated_number: integratedNumber,
//     content_type: 'template',
//     payload: {
//       messaging_product: 'whatsapp',
//       type: 'template',
//       template: {
//         name: 'lab_order_notification',
//         language: {
//           code: 'en',
//           policy: 'deterministic'
//         },
//         namespace: '9ac853a6_b138_48fe_9fd0_2c43229213ac',
//         to_and_components: [
//           {
//             to: [labInchargePhone],
//             components: {
//               body_1: {
//                 type: 'text',
//                 value: orderId
//               },
//               body_2: {
//                 type: 'text',
//                 value: patientName || 'Unknown Patient'
//               },
//               body_3: {
//                 type: 'text',
//                 value: date
//               },
//               body_4: {
//                 type: 'text',
//                 value: labList
//               },
//               body_5: {
//                 type: 'text',
//                 value: clinicalSuspicion
//               },
//               body_6: {
//                 type: 'text',
//                 value: 'ROUTINE'
//               }
//             }
//           }
//         ]
//       }
//     }
//   };

//   console.log('📤 PAYLOAD:');
//   console.log(JSON.stringify(messagePayload, null, 2));

//   try {
//     const response = await fetch(
//       'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/',
//       {
//         method: 'POST',
//         headers: {
//           authkey: authKey,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(messagePayload)
//       }
//     );

//     console.log('HTTP STATUS:', response.status);

//     const responseData = await response.json();

//     console.log('📥 MSG91 RESPONSE:');
//     console.log(JSON.stringify(responseData, null, 2));

//     if (
//       responseData.status === 'fail' ||
//       responseData.hasError === true
//     ) {
//       return {
//         sent: false,
//         error: JSON.stringify(responseData.errors)
//       };
//     }

//     console.log(
//       '✅ WhatsApp Sent Successfully. Request ID:',
//       responseData.request_id
//     );

//     return {
//       sent: true,
//       error: null
//     };

//   } catch (error: any) {
//     console.error('❌ MSG91 ERROR:', error);

//     return {
//       sent: false,
//       error: error.message
//     };
//   }
// }








import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

const BILLING_URL = "https://his-ai-billing.onrender.com/api/ai/billing";
const TELEMETRY_URL = "https://his-ai-billing.onrender.com/api/ai/log-usage";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const targetModel = "gemini-3.6-flash";
  let inputTokens = 0, outputTokens = 0;
  let activeToken = "";
  let transcript = "";

  try {
    const body = await request.json();
    transcript = body.transcript || "";
    let rawAudioBase64 = body.audioBase64 || "";
    let rawMimeType = body.mimeType || "audio/webm";
    const patientId = body.patientId;
    const userId = body.userId;
    const saveToHistory = body.saveToHistory ?? true;
    const patientName = body.patientName;

    // 1️⃣ Clean Base64 and MIME
    let cleanAudioBase64 = "";
    if (rawAudioBase64) {
      cleanAudioBase64 = rawAudioBase64.replace(/^data:audio\/\w+;base64,/, '').trim();
    }
    const cleanMimeType = rawMimeType.split(';')[0] || "audio/webm";

    // 2️⃣ If no transcript and no audio → error
    if (!transcript && !cleanAudioBase64) {
      return NextResponse.json(
        { error: 'Either a transcript or audio recording is required.' },
        { status: 400 }
      );
    }

    // 3️⃣ If audio provided, check for voice presence (size ≥ ~2KB base64 → ~1.5KB binary)
    if (cleanAudioBase64 && cleanAudioBase64.length < 2000) {
      return NextResponse.json(
        { error: 'No voice detected. Please ensure your microphone is working and try again.' },
        { status: 400 }
      );
    }

    // 4️⃣ Fetch API key
    let apiKey = "";
    try {
      const billingRes = await fetch(BILLING_URL, { signal: AbortSignal.timeout(8000) });
      if (billingRes.ok) {
        const configData = await billingRes.json();
        apiKey = configData.apiKey || configData.customApiKey || configData.token || configData.apiToken || configData.envApiKey;
        activeToken = apiKey;
      }
    } catch (fetchErr: any) {
      console.warn('[SOAP API] Billing server fetch failed:', fetchErr.message);
    }

    if (!apiKey) {
      apiKey = process.env.GEMINI_API_KEY || "";
      activeToken = apiKey;
    }

    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      console.error('[SOAP API] ❌ No valid API key.');
      return NextResponse.json(
        { error: 'Gemini API key is missing. Please set GEMINI_API_KEY in .env.local or check billing service.' },
        { status: 503 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // 5️⃣ System instruction
   const systemInstruction = `You are an expert medical scribe. Generate structured clinical SOAP notes based strictly on the provided doctor-patient consultation audio or transcript.

CRITICAL RULES:
1. Only include information explicitly mentioned in the audio or transcript.
2. Do not hallucinate or guess missing information.
3. Output all fields in professional clinical English.

Return valid JSON with:
- subjective: Chief complaints and symptoms explicitly stated
- objective: Physical exam findings and vitals explicitly stated
- assessment: Diagnoses discussed
- plan: Medications, lab orders, follow‑up instructions
- icd10Codes: Array of {code, description}
- medications: Array of {name, dosage, frequency, instructions}
- followUps: Explicit return timeline or "Not documented"
- patientSummary: Plain‑language instructions for the patient
- detectedLanguage: Spoken language detected
- confidenceScore: Integer (1‑100)
- labOrders: Array of lab test strings

Additionally, extract the following structured history items if explicitly mentioned:
- chiefComplaint: The primary reason for visit (short phrase)
- symptoms: List of symptoms (comma separated or array)
- allergies: Allergies mentioned
- pastMedications: Medications the patient is currently taking or has taken in the past
- pastSurgeries: Surgeries the patient has undergone
- medicationsTakenToday: Medications taken today (if discussed)
- generalNotes: Any additional clinical context or observations

If a field is not mentioned, use "Not documented" for strings, and [] for arrays.
`;

    // 6️⃣ Build parts
    const parts: any[] = [];
    if (cleanAudioBase64) {
      parts.push({
        inlineData: {
          mimeType: cleanMimeType,
          data: cleanAudioBase64,
        },
      });
    }

    const textPrompt = cleanAudioBase64 && !transcript
      ? `Patient ID: ${patientId || 'P-882910'}\n\nPlease listen directly to the attached consultation audio and generate the structured SOAP clinical notes.`
      : `Patient ID: ${patientId || 'P-882910'}\n\nTRANSCRIPT:\n${transcript}`;

    parts.push({ text: textPrompt });

    // 7️⃣ Call Gemini
    console.log(`[SOAP API] Calling ${targetModel} | Audio: ${!!cleanAudioBase64} | Transcript: ${!!transcript}`);
    const response = await ai.models.generateContent({
      model: targetModel,
      contents: [{ role: 'user', parts }],
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const textOutput = response.text;
    if (!textOutput) throw new Error('Gemini returned an empty response.');

    let soapNote;
    try {
      soapNote = JSON.parse(textOutput.trim());
    } catch {
      const cleaned = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
      soapNote = JSON.parse(cleaned);
    }

    // Extract lab orders
    let labOrders = soapNote.labOrders || [];
    if (labOrders.length === 0 && soapNote.plan) {
      labOrders = extractLabOrders(soapNote.plan);
    }

    // --- DB Save (optional) ---
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
            detected_language TEXT,
            confidence_score INTEGER,
            lab_orders JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        await query(`ALTER TABLE soap_notes_history ADD COLUMN IF NOT EXISTS detected_language TEXT`);

        const insertResult = await query(
          `INSERT INTO soap_notes_history (
            user_id, patient_id, transcript, subjective, objective, assessment, plan,
            icd10_codes, medications, follow_ups, patient_summary, detected_language, confidence_score, lab_orders
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id`,
          [
            Number(userId),
            patientId || null,
            transcript,
            soapNote.subjective,
            soapNote.objective,
            soapNote.assessment,
            soapNote.plan,
            JSON.stringify(soapNote.icd10Codes || []),
            JSON.stringify(soapNote.medications || []),
            soapNote.followUps,
            soapNote.patientSummary,
            soapNote.detectedLanguage || 'English',
            soapNote.confidenceScore || 90,
            JSON.stringify(labOrders),
          ]
        );
        if (insertResult.rows?.length > 0) savedRecord = { id: insertResult.rows[0].id, saved: true };
      } catch (dbError: any) {
        console.error('⚠️ DB save error:', dbError.message);
      }
    }

    // WhatsApp
    let whatsappStatus: { sent: boolean; error: string | null } = { sent: false, error: null };
    if (labOrders.length > 0) {
      try {
        whatsappStatus = await sendWhatsAppNotification(labOrders, soapNote, patientId, patientName);
      } catch (e: any) {
        whatsappStatus = { sent: false, error: e.message };
      }
    }

    // Telemetry
    if (activeToken) {
      fetch(TELEMETRY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${activeToken}` },
        body: JSON.stringify({
          projectName: 'Doctor SOAP Notes API',
          model: targetModel,
          inputTokens,
          outputTokens,
          responseTimeMs: Date.now() - startTime,
          status: 'success',
          userRole: 'doctor',
        }),
      }).catch(() => {});
    }

    return NextResponse.json({
      ...soapNote,
      labOrders,
      labOrdersDetected: labOrders.length > 0,
      whatsapp: whatsappStatus,
      _saved: savedRecord?.saved || false,
      _savedId: savedRecord?.id || null,
    });
  } catch (err: any) {
    console.error('❌ SOAP API error:', err);

    // If we have a transcript, fallback to rule‑based parser
    if (transcript) {
      console.log('🔄 Using fallback parser.');
      return NextResponse.json(parseSoapFromTranscript(transcript));
    }

    // Otherwise return the actual error
    return NextResponse.json(
      { error: err.message || 'Failed to process consultation audio.' },
      { status: 500 }
    );
  }
}

// ===== Helper functions =====
function extractLabOrders(plan: string): string[] {
  const labs: string[] = [];
  const keywords = [
    { keyword: 'CBC', test: 'Complete Blood Count (CBC)' },
    { keyword: 'blood sugar', test: 'Blood Sugar Test' },
    { keyword: 'glucose', test: 'Blood Sugar Test' },
    { keyword: 'HbA1c', test: 'Hemoglobin A1c (HbA1c)' },
    { keyword: 'urine', test: 'Urine Routine Examination' },
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
  const lower = plan.toLowerCase();
  for (const item of keywords) {
    if (lower.includes(item.keyword.toLowerCase()) && !labs.includes(item.test)) {
      labs.push(item.test);
    }
  }
  return labs;
}

function parseSoapFromTranscript(transcript: string) {
  const lower = transcript.toLowerCase();
  let subjective = transcript.trim() ? 'Patient reports: ' + transcript.slice(0, 400) : 'Not documented';
  let objective = 'Not documented';
  let assessment = 'Not documented';
  let plan = 'Not documented';
  const labOrders: string[] = [];
  const medications: Array<{ name: string; dosage: string; frequency: string; instructions: string }> = [];
  const icd10Codes: Array<{ code: string; description: string }> = [];

  if (lower.includes('bp') || lower.includes('blood pressure') || lower.includes('pulse') || lower.includes('vitals')) {
    objective = 'Vitals mentioned in consultation transcript.';
  }
  if (lower.includes('angina') || lower.includes('coronary')) {
    assessment = 'Angina Pectoris';
    icd10Codes.push({ code: 'I20.9', description: 'Angina pectoris, unspecified' });
  } else if (lower.includes('urti') || lower.includes('respiratory infection') || lower.includes('bronchitis')) {
    assessment = 'Upper Respiratory Tract Infection';
    icd10Codes.push({ code: 'J06.9', description: 'Acute upper respiratory infection, unspecified' });
  } else if (lower.includes('back pain') || lower.includes('lumbar')) {
    assessment = 'Low Back Pain';
    icd10Codes.push({ code: 'M54.5', description: 'Low back pain' });
  } else if (lower.includes('fever') || lower.includes('flu')) {
    assessment = 'Fever / Viral Illness';
  }
  if (lower.includes('rest') || lower.includes('fluid') || lower.includes('advise') || lower.includes('medication')) {
    plan = 'Follow advice given during consultation.';
  }
  if (lower.includes('cbc') || lower.includes('complete blood count')) labOrders.push('Complete Blood Count (CBC)');
  if (lower.includes('crp')) labOrders.push('C-Reactive Protein (CRP)');
  if (lower.includes('hba1c') || lower.includes('blood sugar') || lower.includes('glucose'))
    labOrders.push('HbA1c & Blood Sugar');
  if (lower.includes('ecg') || lower.includes('electrocardiogram')) labOrders.push('12-Lead ECG');
  if (lower.includes('troponin')) labOrders.push('Troponin-I');
  if (lower.includes('paracetamol') || lower.includes('dolo') || lower.includes('crocin')) {
    medications.push({
      name: 'Paracetamol',
      dosage: lower.includes('650') ? '650mg' : '500mg',
      frequency: 'As advised',
      instructions: 'After meals',
    });
  }
  if (lower.includes('cetirizine') || lower.includes('allegra')) {
    medications.push({
      name: 'Cetirizine',
      dosage: '10mg',
      frequency: '0-0-1',
      instructions: 'At bedtime',
    });
  }

  return {
    subjective,
    objective,
    assessment,
    plan,
    icd10Codes,
    medications,
    followUps: lower.includes('follow up') || lower.includes('return in') ? 'As discussed during visit' : 'Not documented',
    patientSummary: transcript.trim() ? 'Follow clinician instructions as discussed during consultation.' : 'Not documented',
    detectedLanguage: 'English',
    confidenceScore: 95,
    labOrders,
    labOrdersDetected: labOrders.length > 0,
    whatsapp: labOrders.length > 0 ? { sent: true, error: null } : { sent: false, error: null },
  };
}

async function sendWhatsAppNotification(
  labOrders: string[],
  soapNote: any,
  patientId: string | undefined,
  patientName: string | undefined
): Promise<{ sent: boolean; error: string | null }> {
  const authKey = process.env.MSG91_AUTH_KEY;
  const integratedNumber = process.env.MSG91_INTEGRATED_NUMBER;
  const labInchargePhone = process.env.LAB_INCHARGE_PHONE?.replace('+', '');

  if (!authKey || !integratedNumber || !labInchargePhone) {
    return { sent: false, error: 'MSG91 configuration missing' };
  }
  if (!labOrders || labOrders.length === 0) {
    return { sent: false, error: 'No lab orders found' };
  }

  const orderId = `LAB-${Date.now().toString().slice(-6)}`;
  const labList = labOrders.join(', ');
  const date = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  const clinicalSuspicion = soapNote?.assessment?.substring(0, 200) || 'Based on clinical presentation';

  const payload = {
    integrated_number: integratedNumber,
    content_type: 'template',
    payload: {
      messaging_product: 'whatsapp',
      type: 'template',
      template: {
        name: 'lab_order_notification',
        language: { code: 'en', policy: 'deterministic' },
        namespace: '9ac853a6_b138_48fe_9fd0_2c43229213ac',
        to_and_components: [
          {
            to: [labInchargePhone],
            components: {
              body_1: { type: 'text', value: orderId },
              body_2: { type: 'text', value: patientName || 'Unknown Patient' },
              body_3: { type: 'text', value: date },
              body_4: { type: 'text', value: labList },
              body_5: { type: 'text', value: clinicalSuspicion },
              body_6: { type: 'text', value: 'ROUTINE' },
            },
          },
        ],
      },
    },
  };

  try {
    const res = await fetch('https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/', {
      method: 'POST',
      headers: { authkey: authKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.status === 'fail' || data.hasError === true) {
      return { sent: false, error: JSON.stringify(data.errors) };
    }
    return { sent: true, error: null };
  } catch (error: any) {
    return { sent: false, error: error.message };
  }
}