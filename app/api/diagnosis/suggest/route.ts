import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { query } from '@/lib/db';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

// Helper: fetch patient data
async function fetchPatientData(patientId: string) {
  const result = await query(
    `SELECT full_name_en, gender, dob, phone, email FROM patients WHERE patient_id = $1`,
    [patientId]
  );
  if (result.rows.length === 0) throw new Error('Patient not found');
  const row = result.rows[0];
  // calculate age from dob
  let age = null;
  if (row.dob) {
    const today = new Date();
    const birthDate = new Date(row.dob);
    let ageYears = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      ageYears--;
    }
    age = ageYears;
  }
  return {
    name: row.full_name_en,
    age,
    gender: row.gender || 'Unknown',
    phone: row.phone,
    email: row.email,
  };
}

// Helper: fetch recent lab results (last 30 days)
async function fetchRecentLabResults(patientId: string) {
  const result = await query(
    `SELECT 
       lo.order_id, 
       lo.order_date, 
       lo.tests, 
       lo.results
     FROM lab_orders lo
     WHERE lo.patient_id = $1 AND lo.order_date >= NOW() - INTERVAL '30 days'
     ORDER BY lo.order_date DESC
     LIMIT 5`,
    [patientId]
  );
  return result.rows;
}

// Helper: fetch active admission
async function fetchAdmission(patientId: string) {
  const result = await query(
    `SELECT id, admission_date, reason, diagnosis, status
     FROM admissions
     WHERE patient_id = $1 AND status = 'active'
     ORDER BY admission_date DESC
     LIMIT 1`,
    [patientId]
  );
  if (result.rows.length === 0) return null;
  return result.rows[0];
}

// Helper: fetch medical history (allergies, chronic conditions)
async function fetchMedicalHistory(patientId: string) {
  const result = await query(
    `SELECT allergy, chronic_condition, medications
     FROM medical_history
     WHERE patient_id = $1`,
    [patientId]
  );
  return result.rows;
}

export async function POST(req: NextRequest) {
  try {
    const { patientId, symptoms, additionalNotes } = await req.json();

    if (!patientId) {
      return NextResponse.json(
        { success: false, message: 'Patient ID is required' },
        { status: 400 }
      );
    }

    // Fetch all patient data
    const patient = await fetchPatientData(patientId);
    const admission = await fetchAdmission(patientId);
    const labResults = await fetchRecentLabResults(patientId);
    const medicalHistory = await fetchMedicalHistory(patientId);

    // Build a comprehensive prompt
    const prompt = `
You are a medical diagnosis assistant. Use the following patient data to suggest possible diagnoses, next steps, and red flags.

**Patient:** ${patient.age}-year-old ${patient.gender}
**Reason for admission:** ${admission?.reason || 'Not specified'}
**Symptoms (provided):** ${symptoms || admission?.reason || 'None'}
**Lab results (recent):** ${JSON.stringify(labResults, null, 2)}
**Medical history (allergies/chronic conditions):** ${JSON.stringify(medicalHistory, null, 2)}
**Additional notes:** ${additionalNotes || 'None'}

Please output in clear sections:
1. **Possible diagnoses** (top 3, with approximate confidence %)
2. **Recommended next tests or treatments**
3. **Red flags to watch for**

Keep the answer concise and clinically relevant.
`;

    // Call Gemini API
    const result = await model.generateContent(prompt);
    const suggestion = result.response.text();

    return NextResponse.json({
      success: true,
      suggestion,
    });
  } catch (error: any) {
    console.error('Diagnosis API error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}