// app/api/doctors/ai/insurance/route.ts
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
      console.log('[Insurance API] Fetching API key from billing server...');
      const billingRes = await fetch(BILLING_URL, {
        signal: AbortSignal.timeout(5000)
      });
      
      if (billingRes.ok) {
        const configData = await billingRes.json();
        apiKey = configData.apiKey || configData.customApiKey || configData.token || configData.apiToken || configData.envApiKey;
        activeToken = apiKey;
        console.log('[Insurance API] ✅ Billing server API key retrieved.');
      } else {
        console.warn(`[Insurance API] Billing server responded with ${billingRes.status}, falling back to env.`);
      }
    } catch (fetchErr: any) {
      console.warn('[Insurance API] Failed to fetch from billing server:', fetchErr.message);
    }

    // 2. Fallback to environment variable
    if (!apiKey) {
      apiKey = process.env.GEMINI_API_KEY || "";
      activeToken = apiKey;
      if (apiKey) {
        console.log('[Insurance API] ✅ Using fallback GEMINI_API_KEY from environment.');
      }
    }

    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      return NextResponse.json(
        { error: 'Gemini API key is not configured. Please set a valid GEMINI_API_KEY.' },
        { status: 503 }
      );
    }

    // 3. Initialize Gemini client
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });

    const systemPrompt = `You are an expert AI-powered healthcare insurance pre-authorization assistant specialized in Indian hospitals, Third Party Administrators (TPAs), and IRDAI standards.

Analyze the clinical doctor-patient conversation and extract all information into a structured JSON schema.

CRITICAL RULES:
1. ONLY include information explicitly mentioned in the transcript.
2. NEVER invent symptoms, vitals, or exam findings.
3. Translate raw statements into formal, professional medical terminology.
4. Follow Indian healthcare standards (ROHINI ID, room categories like 'General', 'Semi-Private', 'Private', Indian Rupee costs).
5. Extract realistic ICD-10 codes based on diagnosis and symptoms.
6. DO NOT invent patient information if absent - mark fields as "Requires Review".
7. If partial information is present, populate it cleanly.

Return a JSON object with these exact fields:
- patientSummary: Professional clinical summary
- soapNote: { subjective, objective, assessment, plan }
- icd10Codes: Array of { code, description, category }
- procedureCodes: Array of { code, description, category }
- laboratoryOrders: Array of strings
- hospitalizationRecommend: { isHospitalizationRequired, admissionType, expectedLengthOfStay, justification }
- preAuthForm: {
    patientInfo: { name, age, gender, address, phone, policyNumber, tpaName, insurerName },
    diagnosisDetails: { primaryDiagnosis, icd10Codes, clinicalFindings, durationOfIllness, pastMedicalHistory },
    proposedTreatment: { procedureName, procedureCode, treatmentType, clinicalJustification },
    hospitalizationDetails: { hospitalName, providerId, roomCategoryRequested, proposedAdmissionDate, expectedLengthOfStay },
    costEstimation: { roomRentPerDay, icuCharges, investigationCosts, surgeryCharges, professionalFees, medicinesCost, totalEstimatedCost },
    investigationDetails: { labTests, radiologyFindings },
    treatingDoctor: { physicianName, registrationNumber, specialization, contact }
  }
- billingChecklist: Array of strings`;

    const userPrompt = `Generate Insurance Pre-Authorization data from this transcript:
--- TRANSCRIPT ---
${transcript}
--- END TRANSCRIPT ---`;

    // 4. Call Gemini with insurance schema
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
            patientSummary: { type: Type.STRING },
            soapNote: {
              type: Type.OBJECT,
              properties: {
                subjective: { type: Type.STRING },
                objective: { type: Type.STRING },
                assessment: { type: Type.STRING },
                plan: { type: Type.STRING }
              },
              required: ["subjective", "objective", "assessment", "plan"]
            },
            icd10Codes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  code: { type: Type.STRING },
                  description: { type: Type.STRING },
                  category: { type: Type.STRING }
                },
                required: ["code", "description", "category"]
              }
            },
            procedureCodes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  code: { type: Type.STRING },
                  description: { type: Type.STRING },
                  category: { type: Type.STRING }
                },
                required: ["code", "description", "category"]
              }
            },
            laboratoryOrders: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            hospitalizationRecommend: {
              type: Type.OBJECT,
              properties: {
                isHospitalizationRequired: { type: Type.BOOLEAN },
                admissionType: { type: Type.STRING },
                expectedLengthOfStay: { type: Type.STRING },
                justification: { type: Type.STRING }
              },
              required: ["isHospitalizationRequired", "admissionType", "expectedLengthOfStay", "justification"]
            },
            preAuthForm: {
              type: Type.OBJECT,
              properties: {
                patientInfo: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    age: { type: Type.STRING },
                    gender: { type: Type.STRING },
                    address: { type: Type.STRING },
                    phone: { type: Type.STRING },
                    policyNumber: { type: Type.STRING },
                    tpaName: { type: Type.STRING },
                    insurerName: { type: Type.STRING }
                  },
                  required: ["name", "age", "gender", "address", "phone", "policyNumber", "tpaName", "insurerName"]
                },
                diagnosisDetails: {
                  type: Type.OBJECT,
                  properties: {
                    primaryDiagnosis: { type: Type.STRING },
                    icd10Codes: { type: Type.STRING },
                    clinicalFindings: { type: Type.STRING },
                    durationOfIllness: { type: Type.STRING },
                    pastMedicalHistory: { type: Type.STRING }
                  },
                  required: ["primaryDiagnosis", "icd10Codes", "clinicalFindings", "durationOfIllness", "pastMedicalHistory"]
                },
                proposedTreatment: {
                  type: Type.OBJECT,
                  properties: {
                    procedureName: { type: Type.STRING },
                    procedureCode: { type: Type.STRING },
                    treatmentType: { type: Type.STRING },
                    clinicalJustification: { type: Type.STRING }
                  },
                  required: ["procedureName", "procedureCode", "treatmentType", "clinicalJustification"]
                },
                hospitalizationDetails: {
                  type: Type.OBJECT,
                  properties: {
                    hospitalName: { type: Type.STRING },
                    providerId: { type: Type.STRING },
                    roomCategoryRequested: { type: Type.STRING },
                    proposedAdmissionDate: { type: Type.STRING },
                    expectedLengthOfStay: { type: Type.STRING }
                  },
                  required: ["hospitalName", "providerId", "roomCategoryRequested", "proposedAdmissionDate", "expectedLengthOfStay"]
                },
                costEstimation: {
                  type: Type.OBJECT,
                  properties: {
                    roomRentPerDay: { type: Type.STRING },
                    icuCharges: { type: Type.STRING },
                    investigationCosts: { type: Type.STRING },
                    surgeryCharges: { type: Type.STRING },
                    professionalFees: { type: Type.STRING },
                    medicinesCost: { type: Type.STRING },
                    totalEstimatedCost: { type: Type.STRING }
                  },
                  required: ["roomRentPerDay", "icuCharges", "investigationCosts", "surgeryCharges", "professionalFees", "medicinesCost", "totalEstimatedCost"]
                },
                investigationDetails: {
                  type: Type.OBJECT,
                  properties: {
                    labTests: { type: Type.STRING },
                    radiologyFindings: { type: Type.STRING }
                  },
                  required: ["labTests", "radiologyFindings"]
                },
                treatingDoctor: {
                  type: Type.OBJECT,
                  properties: {
                    physicianName: { type: Type.STRING },
                    registrationNumber: { type: Type.STRING },
                    specialization: { type: Type.STRING },
                    contact: { type: Type.STRING }
                  },
                  required: ["physicianName", "registrationNumber", "specialization", "contact"]
                }
              },
              required: ["patientInfo", "diagnosisDetails", "proposedTreatment", "hospitalizationDetails", "costEstimation", "investigationDetails", "treatingDoctor"]
            },
            billingChecklist: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["patientSummary", "soapNote", "icd10Codes", "procedureCodes", "laboratoryOrders", "hospitalizationRecommend", "preAuthForm", "billingChecklist"]
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

    const insuranceData = JSON.parse(textOutput.trim());

    // 5. Save to database (optional)
    let savedRecord = null;
    if (userId && saveToHistory) {
      try {
        const insertResult = await query(
          `INSERT INTO insurance_pre_auth_history (
            user_id, patient_id, transcript, patient_summary, soap_note, 
            icd10_codes, procedure_codes, laboratory_orders, 
            hospitalization_recommend, pre_auth_form, billing_checklist
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
          [
            Number(userId),
            patientId || null,
            transcript,
            insuranceData.patientSummary,
            JSON.stringify(insuranceData.soapNote),
            JSON.stringify(insuranceData.icd10Codes),
            JSON.stringify(insuranceData.procedureCodes),
            JSON.stringify(insuranceData.laboratoryOrders),
            JSON.stringify(insuranceData.hospitalizationRecommend),
            JSON.stringify(insuranceData.preAuthForm),
            JSON.stringify(insuranceData.billingChecklist)
          ]
        );

        if (insertResult.rows?.length > 0) {
          savedRecord = { id: insertResult.rows[0].id, saved: true };
          console.log("✅ Insurance pre-auth saved to DB. ID:", savedRecord.id);
        }
      } catch (dbError: any) {
        console.error("⚠️ DB save error:", dbError.message);
        savedRecord = { saved: false, error: dbError.message };
      }
    }

    // 6. Send telemetry
    if (activeToken) {
      fetch(TELEMETRY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${activeToken}`,
        },
        body: JSON.stringify({
          projectName: "Insurance Pre-Authorization API",
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
      ...insuranceData,
      _saved: savedRecord?.saved || false,
      _savedId: savedRecord?.id || null,
      _generatedAt: new Date().toISOString()
    });

  } catch (err: any) {
    const errorDuration = Date.now() - startTime;
    console.error('Insurance API error:', err);

    if (activeToken) {
      fetch(TELEMETRY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${activeToken}`,
        },
        body: JSON.stringify({
          projectName: "Insurance Pre-Authorization API",
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
      { error: err.message || 'Failed to generate insurance data' },
      { status: 500 }
    );
  }
}