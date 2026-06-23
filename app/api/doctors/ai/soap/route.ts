


// // app/api/soap/route.ts
// import { GoogleGenAI, Type } from '@google/genai';
// import { NextRequest, NextResponse } from 'next/server';
// import { models } from '@/lib/gemini'; // ✅ Use the same model enum
// import { query } from '@/lib/db';

// const BILLING_URL = "https://his-ai-billing.onrender.com/api/ai/billing";
// const TELEMETRY_URL = "https://his-ai-billing.onrender.com/api/ai/log-usage";

// export async function POST(request: NextRequest) {
//   const startTime = Date.now();
//   const targetModel = models.FLASH; // ✅ Same as nurse route
//   let inputTokens = 0, outputTokens = 0;
//   let activeToken = "";
//   let transcript = "";

//   try {
//     const body = await request.json();
//     transcript = body.transcript || "";
//     const { patientId, userId, saveToHistory = true } = body;

//     if (!transcript || transcript.trim().length === 0) {
//       return NextResponse.json(
//         { error: 'Conversation transcript is required.' },
//         { status: 400 }
//       );
//     }

//     // 1. Fetch API key from billing server (same as nurse route)
//     const billingRes = await fetch(BILLING_URL);
//     if (!billingRes.ok) {
//       throw new Error(`Billing server error: ${billingRes.status}`);
//     }
//     const configData = await billingRes.json();
//     activeToken = configData.apiKey || configData.customApiKey || configData.token;
//     if (!activeToken) {
//       throw new Error("No API key returned from billing server");
//     }

//     // 2. Initialize Gemini client (EXACT same pattern as nurse route)
//     const ai = new GoogleGenAI({
//       apiKey: activeToken,
//       httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
//     });

//     const systemPrompt = `You are an expert medical scribe. Generate SOAP notes from doctor-patient dialogue.

// CRITICAL RULES:
// 1. ONLY include information explicitly mentioned in the transcript.
// 2. NEVER invent symptoms, vitals, or exam findings.
// 3. If the doctor orders tests (CBC, blood sugar, urine, etc.), include them in the Plan section.
// 4. If vitals aren't mentioned, state: "Vitals not documented in transcript."
// 5. If no medications are prescribed, state: "No medications prescribed during this visit."

// Return a JSON object with these exact fields:
// - subjective: Chief complaint, history, symptoms (verbatim from transcript)
// - objective: Physical exam findings, vitals mentioned
// - assessment: Differential diagnoses based on symptoms
// - plan: Action items, lab orders, medications, follow-up
// - icd10Codes: Array of {code, description}
// - medications: Array of {name, dosage, frequency, instructions}
// - followUps: Return instructions
// - patientSummary: Plain-language summary for the patient
// - confidenceScore: Integer (1-100)`;

//     const userPrompt = `Generate SOAP notes from this transcript:
// --- TRANSCRIPT ---
// ${transcript}
// --- END TRANSCRIPT ---`;

//     // 3. Call Gemini (EXACT same structured output pattern as nurse route)
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
//             confidenceScore: { type: Type.INTEGER }
//           },
//           required: ['subjective', 'objective', 'assessment', 'plan', 'icd10Codes', 'medications', 'followUps', 'patientSummary', 'confidenceScore']
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

//     // --- EXTRACT LAB ORDERS FROM PLAN ---
//     const labOrders = extractLabOrders(soapNote.plan);

//     // --- SAVE TO DATABASE (Optional) ---
//     let savedRecord = null;
//     if (userId && saveToHistory) {
//       try {
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
//             confidence_score INTEGER,
//             lab_orders JSONB,
//             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//           )
//         `);

//         const insertResult = await query(
//           `INSERT INTO soap_notes_history (
//             user_id, patient_id, transcript, subjective, objective, assessment, plan, 
//             icd10_codes, medications, follow_ups, patient_summary, confidence_score, lab_orders
//           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id`,
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
//     let whatsappStatus = { sent: false, error: null };
//     if (labOrders.length > 0) {
//       try {
//         whatsappStatus = await sendWhatsAppNotification(labOrders, soapNote, patientId);
//       } catch (whatsappError: any) {
//         console.error('[SOAP API] WhatsApp failed:', whatsappError.message);
//         whatsappStatus = { sent: false, error: whatsappError.message };
//       }
//     }

//     // 4. Send telemetry (doctor role - same as nurse route)
//     fetch(TELEMETRY_URL, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${activeToken}`,
//       },
//       body: JSON.stringify({
//         projectName: "Doctor SOAP Notes API",
//         model: targetModel,
//         inputTokens,
//         outputTokens,
//         responseTimeMs,
//         status: "success",
//         userRole: "doctor",
//       }),
//     }).catch(err => console.error("Telemetry error:", err));

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

//     // Send error telemetry (same as nurse route)
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
// // HELPER: Extract Lab Orders from Plan
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
// // HELPER: Send WhatsApp Notification
// // ============================================
// async function sendWhatsAppNotification(
//   labOrders: string[], 
//   soapNote: any, 
//   patientId?: string
// ): Promise<{ sent: boolean; error: string | null }> {
//   const whatsappToken = process.env.WHATSAPP_ACCESS_TOKEN;
//   const fromPhoneNumberId = process.env.FROM_PHONE_NUMBER_ID;
//   const labInchargePhone = process.env.LAB_INCHARGE_PHONE;

//   if (!whatsappToken || !fromPhoneNumberId || !labInchargePhone) {
//     console.warn('[SOAP API] WhatsApp credentials not configured. Skipping.');
//     return { sent: false, error: 'WhatsApp not configured' };
//   }

//   const labList = labOrders.map((lab, index) => `${index + 1}. ${lab}`).join('\n');
//   const orderId = `LAB-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
  
//   const message = `🔬 *NEW LAB ORDER RECEIVED* 🔬

// *Order ID:* #${orderId}
// *Patient ID:* ${patientId || 'Not provided'}
// *Date:* ${new Date().toLocaleString()}

// *Tests Required:*
// ${labList}

// *Clinical Suspicion:*
// ${soapNote.assessment ? soapNote.assessment.substring(0, 300) : 'Based on clinical presentation'}

// *Doctor Notes:*
// ${soapNote.subjective ? soapNote.subjective.substring(0, 200) : 'N/A'}

// *Priority:* ROUTINE

// *Please reply with 'RECEIVED' to confirm.*`;

//   try {
//     const response = await fetch(
//       `https://graph.facebook.com/v18.0/${fromPhoneNumberId}/messages`,
//       {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${whatsappToken}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           messaging_product: 'whatsapp',
//           to: labInchargePhone,
//           type: 'text',
//           text: { body: message }
//         })
//       }
//     );

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(`WhatsApp API error: ${JSON.stringify(errorData)}`);
//     }

//     console.log('[SOAP API] ✅ WhatsApp notification sent successfully.');
//     return { sent: true, error: null };
//   } catch (error: any) {
//     console.error('[SOAP API] ❌ WhatsApp failed:', error.message);
//     return { sent: false, error: error.message };
//   }
// }




// // app/api/soap/route.ts
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

//     // 1. Fetch API key from billing server
//     const billingRes = await fetch(BILLING_URL);
//     if (!billingRes.ok) {
//       throw new Error(`Billing server error: ${billingRes.status}`);
//     }
//     const configData = await billingRes.json();
//     activeToken = configData.apiKey || configData.customApiKey || configData.token || configData.apiToken || configData.envApiKey;
//     if (!activeToken) {
//       throw new Error("No API key returned from billing server");
//     }

//     // 2. Initialize Gemini client
//     const ai = new GoogleGenAI({
//       apiKey: activeToken,
//       httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
//     });

//     const systemPrompt = `You are an expert medical scribe. Generate SOAP notes from doctor-patient dialogue.

// CRITICAL RULES:
// 1. ONLY include information explicitly mentioned in the transcript.
// 2. NEVER invent symptoms, vitals, or exam findings.
// 3. If the doctor orders tests (CBC, blood sugar, urine, etc.), include them in the Plan section AND list them in labOrders array.
// 4. If vitals aren't mentioned, state: "Vitals not documented in transcript."
// 5. If no medications are prescribed, state: "No medications prescribed during this visit."

// Return a JSON object with these exact fields:
// - subjective: Chief complaint, history, symptoms (verbatim from transcript)
// - objective: Physical exam findings, vitals mentioned
// - assessment: Differential diagnoses based on symptoms
// - plan: Action items, lab orders, medications, follow-up
// - icd10Codes: Array of {code, description}
// - medications: Array of {name, dosage, frequency, instructions}
// - followUps: Return instructions
// - patientSummary: Plain-language summary for the patient
// - confidenceScore: Integer (1-100)
// - labOrders: Array of strings - EXTRACT ALL lab tests from the plan section`;

//     const userPrompt = `Generate SOAP notes from this transcript:
// --- TRANSCRIPT ---
// ${transcript}
// --- END TRANSCRIPT ---`;

//     // 3. Call Gemini with updated schema
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
//             confidenceScore: { type: Type.INTEGER },
//             labOrders: { 
//               type: Type.ARRAY, 
//               items: { type: Type.STRING }
//             }
//           },
//           required: ['subjective', 'objective', 'assessment', 'plan', 'icd10Codes', 'medications', 'followUps', 'patientSummary', 'confidenceScore', 'labOrders']
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
//             confidence_score INTEGER,
//             lab_orders JSONB,
//             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//           )
//         `);

//         const insertResult = await query(
//           `INSERT INTO soap_notes_history (
//             user_id, patient_id, transcript, subjective, objective, assessment, plan, 
//             icd10_codes, medications, follow_ups, patient_summary, confidence_score, lab_orders
//           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id`,
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
//     let whatsappStatus = { sent: false, error: null };
//     if (labOrders.length > 0) {
//       try {
//         whatsappStatus = await sendWhatsAppNotification(labOrders, soapNote, patientId, patientName);
//       } catch (whatsappError: any) {
//         console.error('[SOAP API] WhatsApp failed:', whatsappError.message);
//         whatsappStatus = { sent: false, error: whatsappError.message };
//       }
//     }

//     // 4. Send telemetry
//     fetch(TELEMETRY_URL, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${activeToken}`,
//       },
//       body: JSON.stringify({
//         projectName: "Doctor SOAP Notes API",
//         model: targetModel,
//         inputTokens,
//         outputTokens,
//         responseTimeMs,
//         status: "success",
//         userRole: "doctor",
//       }),
//     }).catch(err => console.error("Telemetry error:", err));

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
// // HELPER: Send WhatsApp Notification (UPDATED)
// // ============================================
// async function sendWhatsAppNotification(
//   labOrders: string[], 
//   soapNote: any, 
//   patientId?: string,
//   patientName?: string
// ): Promise<{ sent: boolean; error: string | null }> {
//   const whatsappToken = process.env.WHATSAPP_ACCESS_TOKEN;
//   const fromPhoneNumberId = process.env.FROM_PHONE_NUMBER_ID;
//   const labInchargePhone = process.env.LAB_INCHARGE_PHONE?.replace('+', '');

//   if (!whatsappToken || !fromPhoneNumberId || !labInchargePhone) {
//     console.warn('[SOAP API] WhatsApp credentials not configured. Skipping.');
//     return { sent: false, error: 'WhatsApp not configured' };
//   }

//   // ✅ TEST: Use hello_world with NO parameters
//   const messagePayload = {
//     messaging_product: 'whatsapp',
//     to: labInchargePhone, // e.g., "918088197955"
//     type: 'template',
//     template: {
//       name: 'hello_world', // ✅ Using the default template for testing
//       language: {
//         code: 'en_US',
//       },
//       // ✅ NO components array for hello_world
//     },
//   };

//   try {
//     const response = await fetch(
//       `https://graph.facebook.com/v25.0/${fromPhoneNumberId}/messages`,
//       {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${whatsappToken}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(messagePayload),
//       }
//     );

//     const responseData = await response.json();

//     if (!response.ok) {
//       console.error('[SOAP API] WhatsApp API Error Response:', responseData);
//       throw new Error(responseData.error?.message || 'WhatsApp API request failed');
//     }

//     console.log('[SOAP API] ✅ WhatsApp notification sent successfully. Message ID:', responseData.messages?.[0]?.id);
//     return { sent: true, error: null };
//   } catch (error: any) {
//     console.error('[SOAP API] ❌ WhatsApp failed:', error.message);
//     return { sent: false, error: error.message };
//   }
// }





// // app/api/soap/route.ts
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

//     // 1. Fetch API key from billing server
//     const billingRes = await fetch(BILLING_URL);
//     if (!billingRes.ok) {
//       throw new Error(`Billing server error: ${billingRes.status}`);
//     }
//     const configData = await billingRes.json();
//     activeToken = configData.apiKey || configData.customApiKey || configData.token || configData.apiToken || configData.envApiKey;
//     if (!activeToken) {
//       throw new Error("No API key returned from billing server");
//     }

//     // 2. Initialize Gemini client
//     const ai = new GoogleGenAI({
//       apiKey: activeToken,
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

//     // 3. Call Gemini with updated schema
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
//    let whatsappStatus: { sent: boolean; error: string | null } = { sent: false, error: null };
//     if (labOrders.length > 0) {
//       try {
//         whatsappStatus = await sendWhatsAppNotification(labOrders, soapNote, patientId, patientName);
//       } catch (whatsappError: any) {
//         console.error('[SOAP API] WhatsApp failed:', whatsappError.message);
//         whatsappStatus = { sent: false, error: whatsappError.message };
//       }
//     }

//     // 4. Send telemetry
//     fetch(TELEMETRY_URL, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${activeToken}`,
//       },
//       body: JSON.stringify({
//         projectName: "Doctor SOAP Notes API",
//         model: targetModel,
//         inputTokens,
//         outputTokens,
//         responseTimeMs,
//         status: "success",
//         userRole: "doctor",
//       }),
//     }).catch(err => console.error("Telemetry error:", err));

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

// // ============================================
// async function sendWhatsAppNotification(
//   labOrders: string[], 
//   soapNote: any, 
//   patientId?: string,
//   patientName?: string
// ): Promise<{ sent: boolean; error: string | null }> {
//   const whatsappToken = process.env.WHATSAPP_ACCESS_TOKEN;
//   const fromPhoneNumberId = process.env.FROM_PHONE_NUMBER_ID;
//   const labInchargePhone = process.env.LAB_INCHARGE_PHONE?.replace('+', '');

//   if (!whatsappToken || !fromPhoneNumberId || !labInchargePhone) {
//     console.warn('[SOAP API] WhatsApp credentials not configured. Skipping.');
//     return { sent: false, error: 'WhatsApp not configured' };
//   }

//   const orderId = `LAB-${Date.now().toString().slice(-6)}`;
//   const labList = labOrders.map((lab) => `• ${lab}`).join('\n');
//   const date = new Date().toLocaleString();
//   const priority = 'ROUTINE';
//   const clinicalSuspicion = soapNote.assessment?.substring(0, 200) || 'Based on clinical presentation';

//   const messagePayload = {
//     messaging_product: 'whatsapp',
//     to: labInchargePhone,
//     type: 'template',
//     template: {
//       name: 'lab_order_notification', // ✅ Exact name from Meta
//       language: {
//         code: 'en', // ✅ Changed from en_US to en
//       },
//       components: [
//         {
//           type: 'body',
//           parameters: [
//             { type: 'text', text: orderId },
//             { type: 'text', text: patientName || 'Unknown Patient' },
//             { type: 'text', text: date },
//             { type: 'text', text: labList },
//             { type: 'text', text: clinicalSuspicion },
//             { type: 'text', text: priority },
//           ],
//         },
//       ],
//     },
//   };

//   // ✅ DEBUG: Log the payload
//   console.log("🔍 TEMPLATE DEBUG:");
//   console.log("Template Name:", messagePayload.template.name);
//   console.log("Language Code:", messagePayload.template.language.code);
//   console.log("Full Payload:", JSON.stringify(messagePayload, null, 2));

//   try {
//     const response = await fetch(
//       `https://graph.facebook.com/v25.0/${fromPhoneNumberId}/messages`,
//       {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${whatsappToken}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(messagePayload),
//       }
//     );

//     const responseData = await response.json();

//     if (!response.ok) {
//       console.error('[SOAP API] WhatsApp API Error Response:', responseData);
//       throw new Error(responseData.error?.message || 'WhatsApp API request failed');
//     }

//     console.log('[SOAP API] ✅ WhatsApp sent. Message ID:', responseData.messages?.[0]?.id);
//     return { sent: true, error: null };
//   } catch (error: any) {
//     console.error('[SOAP API] ❌ WhatsApp failed:', error.message);
//     return { sent: false, error: error.message };
//   }
// }





// app/api/soap/route.ts
import { GoogleGenAI, Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { models } from '@/lib/gemini';
import { query } from '@/lib/db';

const BILLING_URL = "https://his-ai-billing.onrender.com/api/ai/billing";
const TELEMETRY_URL = "https://his-ai-billing.onrender.com/api/ai/log-usage";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const targetModel = models.FLASH;
  let inputTokens = 0, outputTokens = 0;
  let activeToken = "";
  let transcript = "";

  try {
    const body = await request.json();
    transcript = body.transcript || "";
    const { patientId, userId, saveToHistory = true, patientName } = body;

    if (!transcript || transcript.trim().length === 0) {
      return NextResponse.json(
        { error: 'Conversation transcript is required.' },
        { status: 400 }
      );
    }

    // 1. Fetch API key from billing server (with fallback)
    let apiKey = "";
    try {
      console.log('[SOAP API] Attempting to fetch API key from billing server...');
      const billingRes = await fetch(BILLING_URL, {
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      if (billingRes.ok) {
        const configData = await billingRes.json();
        apiKey = configData.apiKey || configData.customApiKey || configData.token || configData.apiToken || configData.envApiKey;
        activeToken = apiKey;
        console.log('[SOAP API] ✅ Billing server API key retrieved.');
      } else {
        console.warn(`[SOAP API] Billing server responded with ${billingRes.status}, falling back to env.`);
      }
    } catch (fetchErr: any) {
      console.warn('[SOAP API] Failed to fetch from billing server:', fetchErr.message);
      console.warn('[SOAP API] Falling back to environment variable...');
    }

    // 2. Fallback to environment variable if billing server failed
    if (!apiKey) {
      apiKey = process.env.GEMINI_API_KEY || "";
      activeToken = apiKey;
      if (apiKey) {
        console.log('[SOAP API] ✅ Using fallback GEMINI_API_KEY from environment.');
      }
    }

    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      console.error('[SOAP API] ❌ No valid API key available.');
      return NextResponse.json(
        { 
          error: 'Gemini API key is not configured. Please set a valid GEMINI_API_KEY in your environment or ensure the billing server is available.' 
        },
        { status: 503 }
      );
    }

    // 3. Initialize Gemini client
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });

    const systemPrompt = `You are an expert medical scribe. Generate SOAP notes from doctor-patient dialogue.

CRITICAL RULES:
1. ONLY include information explicitly mentioned in the transcript.
2. NEVER invent symptoms, vitals, or exam findings.
3. If the doctor orders tests (CBC, blood sugar, urine, etc.), include them in the Plan section AND list them in labOrders array.
4. If vitals aren't mentioned, state: "Vitals not documented in transcript."
5. If no medications are prescribed, state: "No medications prescribed during this visit."

GLOBAL TRANSLATION RULE (CRITICAL):
If the doctor and patient are talking in any Indian regional language (such as Hindi, Kannada, Malayalam, Tamil, Tulu, Telugu, Marathi, or any mix like Hinglish, Kanglish, etc.), you MUST translate the entire dialogue context and output all standard SOAP Note fields in fluent, professional, clinical English. The final fields (subjective, objective, assessment, plan, patientSummary) must be strictly in professional clinical English.

Return a JSON object with these exact fields:
- subjective: Chief complaint, history, symptoms (verbatim from transcript)
- objective: Physical exam findings, vitals mentioned
- assessment: Differential diagnoses based on symptoms
- plan: Action items, lab orders, medications, follow-up
- icd10Codes: Array of {code, description}
- medications: Array of {name, dosage, frequency, instructions}
- followUps: Return instructions
- patientSummary: Plain-language summary for the patient
- detectedLanguage: String summarizing the detected spoken language or mixed regional dialect
- confidenceScore: Integer (1-100)
- labOrders: Array of strings - EXTRACT ALL lab tests from the plan section`;

    const userPrompt = `Generate SOAP notes from this transcript:
--- TRANSCRIPT ---
${transcript}
--- END TRANSCRIPT ---`;

    // 4. Call Gemini with updated schema
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
            detectedLanguage: { type: Type.STRING },
            confidenceScore: { type: Type.INTEGER },
            labOrders: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }
            }
          },
          required: ['subjective', 'objective', 'assessment', 'plan', 'icd10Codes', 'medications', 'followUps', 'patientSummary', 'detectedLanguage', 'confidenceScore', 'labOrders']
        }
      }
    });

    const responseTimeMs = Date.now() - startTime;
    const usage = response.usageMetadata || {};
    inputTokens = usage.promptTokenCount || 0;
    outputTokens = usage.candidatesTokenCount || 0;

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error('Gemini returned empty response');
    }

    const soapNote = JSON.parse(textOutput.trim());

    // PRIORITY: Use labOrders from Gemini, fallback to extraction
    let labOrders = soapNote.labOrders || [];
    if (labOrders.length === 0) {
      labOrders = extractLabOrders(soapNote.plan);
    }

    // --- SAVE TO DATABASE (Optional) ---
    let savedRecord = null;
    if (userId && saveToHistory) {
      try {
        // ✅ Check if column exists before inserting
        const columnCheck = await query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'soap_notes_history' 
          AND column_name = 'detected_language'
        `);

        if (columnCheck.rows.length === 0) {
          // Add column if it doesn't exist
          await query(`
            ALTER TABLE soap_notes_history 
            ADD COLUMN IF NOT EXISTS detected_language TEXT
          `);
          console.log('✅ Added detected_language column to soap_notes_history');
        }

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
            JSON.stringify(soapNote.icd10Codes),
            JSON.stringify(soapNote.medications),
            soapNote.followUps,
            soapNote.patientSummary,
            soapNote.detectedLanguage || 'English',
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
        whatsappStatus = await sendWhatsAppNotification(labOrders, soapNote, patientId, patientName);
      } catch (whatsappError: any) {
        console.error('[SOAP API] WhatsApp failed:', whatsappError.message);
        whatsappStatus = { sent: false, error: whatsappError.message };
      }
    }

    // 5. Send telemetry (if token available)
    if (activeToken) {
      fetch(TELEMETRY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${activeToken}`,
        },
        body: JSON.stringify({
          projectName: "Doctor SOAP Notes API",
          model: targetModel,
          inputTokens,
          outputTokens,
          responseTimeMs,
          status: "success",
          userRole: "doctor",
        }),
      }).catch(err => console.error("Telemetry error:", err));
    }

    return NextResponse.json({
      ...soapNote,
      labOrders: labOrders,
      labOrdersDetected: labOrders.length > 0,
      whatsapp: whatsappStatus,
      _saved: savedRecord?.saved || false,
      _savedId: savedRecord?.id || null,
      _savedError: savedRecord?.error || null,
    });

  } catch (err: any) {
    const errorDuration = Date.now() - startTime;
    console.error('SOAP API error:', err);

    if (activeToken) {
      fetch(TELEMETRY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${activeToken}`,
        },
        body: JSON.stringify({
          projectName: "Doctor SOAP Notes API",
          model: targetModel,
          inputTokens: 0,
          outputTokens: 0,
          responseTimeMs: errorDuration,
          status: "error",
          errorDetails: err.message || "Unknown error",
          userRole: "doctor",
        }),
      }).catch(() => {});
    }

    return NextResponse.json(
      { error: err.message || 'Failed to generate SOAP notes' },
      { status: 500 }
    );
  }
}

// ============================================
// HELPER: Extract Lab Orders from Plan (Fallback)
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
// HELPER: Send WhatsApp Notification (UPDATED)
// ============================================
async function sendWhatsAppNotification(
  labOrders: string[], 
  soapNote: any, 
  patientId?: string,
  patientName?: string
): Promise<{ sent: boolean; error: string | null }> {
  const whatsappToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const fromPhoneNumberId = process.env.FROM_PHONE_NUMBER_ID;
  const labInchargePhone = process.env.LAB_INCHARGE_PHONE?.replace('+', '');

  if (!whatsappToken || !fromPhoneNumberId || !labInchargePhone) {
    console.warn('[SOAP API] WhatsApp credentials not configured. Skipping.');
    return { sent: false, error: 'WhatsApp not configured' };
  }

  const orderId = `LAB-${Date.now().toString().slice(-6)}`;
  const labList = labOrders.map((lab) => `• ${lab}`).join('\n');
  const date = new Date().toLocaleString();
  const priority = 'ROUTINE';
  const clinicalSuspicion = soapNote.assessment?.substring(0, 200) || 'Based on clinical presentation';

  // Try the template with the correct name from Meta
  const messagePayload = {
    messaging_product: 'whatsapp',
    to: labInchargePhone,
    type: 'template',
    template: {
      name: 'lab_order_notification_utility', // ✅ Your actual template name
      language: {
        code: 'en_US', // ✅ Try en_US (most common)
      },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: orderId },
            { type: 'text', text: patientName || 'Unknown Patient' },
            { type: 'text', text: date },
            { type: 'text', text: labList },
            { type: 'text', text: clinicalSuspicion },
            { type: 'text', text: priority },
          ],
        },
      ],
    },
  };

  console.log("🔍 TEMPLATE DEBUG:");
  console.log("Template Name:", messagePayload.template.name);
  console.log("Language Code:", messagePayload.template.language.code);

  try {
    const response = await fetch(
      `https://graph.facebook.com/v25.0/${fromPhoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${whatsappToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messagePayload),
      }
    );

    const responseData = await response.json();

    if (!response.ok) {
      console.error('[SOAP API] WhatsApp API Error Response:', responseData);
      throw new Error(responseData.error?.message || 'WhatsApp API request failed');
    }

    console.log('[SOAP API] ✅ WhatsApp sent. Message ID:', responseData.messages?.[0]?.id);
    return { sent: true, error: null };
  } catch (error: any) {
    console.error('[SOAP API] ❌ WhatsApp failed:', error.message);
    return { sent: false, error: error.message };
  }
}