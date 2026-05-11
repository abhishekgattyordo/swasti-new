import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// ============================================
// Helper functions
// ============================================

function generatePatientId(): number {
  const timestamp = Date.now() * 1000;
  const random = Math.floor(Math.random() * 10000);
  return timestamp + random;
}

function ageToDob(age: number): string {
  const today = new Date();
  const year = today.getFullYear() - age;
  return `${year}-01-01`;
}

function mapGender(gender: string): string {
  switch (gender?.toLowerCase()) {
    case 'male': return 'male';
    case 'female': return 'female';
    case 'other': return 'other';
    default: return 'other';
  }
}

function cleanRequestBody(body: any) {
  const numericFields = [
    'age', 'systolic', 'diastolic', 'heartRate',
    'respiratoryRate', 'temperature', 'spo2', 'painScore', 'gcs', 'rbs'
  ];
  for (const field of numericFields) {
    if (body[field] === '') {
      body[field] = null;
    }
  }

  const stringEnumFields = [
    'decision', 'triage', 'gender', 'status', 'ecgDone', 'cxrDone',
    'usgDone', 'upt', 'mainDoctor', 'referral', 'dutyDoctorName',
    'chiefComplaints', 'complaintDuration', 'pastHistory',
    'provisionalDiagnosis', 'examFindings', 'intervention', 'linkedAdmissionId'
  ];
  for (const field of stringEnumFields) {
    if (body[field] === '') {
      body[field] = null;
    }
  }
  return body;
}

async function createPatient(patientData: {
  patientName: string;
  age?: number | null;
  gender?: string | null;
}) {
  const { patientName, age, gender } = patientData;
  const patientId = generatePatientId();
  const dob = age ? ageToDob(Number(age)) : '2000-01-01';
  const dbGender = mapGender(gender || 'other');
  const result = await query(
    `INSERT INTO patients (
      patient_id, full_name_en, full_name_hi, dob, gender,
      address, city, state, country, pincode,
      phone, email, blood_group, registration_step, created_at
    ) VALUES (
      $1, $2, $3, $4, $5,
      $6, $7, $8, $9, $10,
      $11, $12, $13, $14, NOW()
    ) RETURNING patient_id`,
    [
      patientId, patientName, null, dob, dbGender,
      'Emergency Address', 'Unknown', 'Unknown', 'India', '000000',
      null, null, 'Unknown', 1,
    ]
  );
  return { patient_id: result.rows[0].patient_id };
}

// ============================================
// GET /api/emergency/assessments
// ============================================

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const triage = searchParams.get('triage');
    const search = searchParams.get('search');
    const assessmentId = searchParams.get('id');
    const linked = searchParams.get('linked');   // 👈 new

    // Single assessment by ID (unchanged)
    if (assessmentId) {
      const result = await query(
        `SELECT 
          assessment_id as id,
          patient_id,
          uhid,
          patient_name as "patientName",
          age,
          gender,
          arrival_at as "arrivalAt",
          triage_category as triage,
          status,
          linked_admission_id as "linkedAdmissionId",
          completed_at as "completedAt",
          systolic,
          diastolic,
          heart_rate as "heartRate",
          respiratory_rate as "respiratoryRate",
          temperature,
          temp_unit as "tempUnit",
          spo2,
          pain_score as "painScore",
          gcs,
          rbs,
          upt,
          ecg_done as "ecgDone",
          ecg_report_attached as "ecgReportAttached",
          cxr_done as "cxrDone",
          cxr_report_attached as "cxrReportAttached",
          usg_done as "usgDone",
          usg_findings as "usgFindings",
          labs,
          chief_complaints as "chiefComplaints",
          complaint_duration as "complaintDuration",
          past_history as "pastHistory",
          provisional_diagnosis as "provisionalDiagnosis",
          exam_findings as "examFindings",
          er_interventions as "intervention",
          disposition_decision as "decision",
          main_doctor as "mainDoctor",
          referral,
          duty_doctor_name as "dutyDoctorName",
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM emergency_assessments 
        WHERE assessment_id = $1`,
        [assessmentId]
      );
      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, message: 'Assessment not found' },
          { status: 404 }
        );
      }
      const assessment = result.rows[0];
      if (assessment.labs && typeof assessment.labs === 'string') {
        assessment.labs = JSON.parse(assessment.labs);
      }
      return NextResponse.json({ success: true, data: assessment });
    }

    // List assessments with filters
    let queryText = `
      SELECT 
        assessment_id as id,
        patient_name as "patientName",
        uhid,
        triage_category as triage,
        status,
        duty_doctor_name as "dutyDoctorName",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM emergency_assessments
      WHERE 1=1
    `;
    const params: any[] = [];
    let idx = 1;

    if (status && status !== 'all') {
      queryText += ` AND status = $${idx++}`;
      params.push(status);
    }
    if (triage && triage !== 'all') {
      queryText += ` AND triage_category = $${idx++}`;
      params.push(triage);
    }
    // 👇 New: filter out assessments that already have a linked admission
    if (linked === 'null') {
      queryText += ` AND linked_admission_id IS NULL`;
    }
    if (search) {
      queryText += ` AND (uhid ILIKE $${idx++} OR patient_name ILIKE $${idx++} OR assessment_id ILIKE $${idx++})`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    queryText += ` ORDER BY created_at DESC`;

    const result = await query(queryText, params);
    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch assessments' },
      { status: 500 }
    );
  }
}

// ============================================
// POST /api/emergency/assessments
// ============================================



export async function POST(request: NextRequest) {
  try {
    let body = await request.json();
    body = cleanRequestBody(body);

    const isDraft = body.status === 'Draft';

    // 1. Validate required fields based on mode
    const missingFields: string[] = [];

    // Always required (even for draft) – only identification fields
    const alwaysRequired = ['id', 'uhid', 'patientName'];
    for (const field of alwaysRequired) {
      const value = body[field];
      if (value === undefined || value === null || value === '') {
        missingFields.push(field);
      }
    }

    if (!isDraft) {
      // For completed assessments, require age, gender, and clinical fields
      const completeRequired = [
        'age', 'gender', 'triage', 'systolic', 'diastolic',
        'heartRate', 'respiratoryRate', 'temperature', 'spo2',
        'chiefComplaints', 'dutyDoctorName'
      ];
      for (const field of completeRequired) {
        const value = body[field];
        if (value === undefined || value === null || value === '') {
          missingFields.push(field);
        }
      }

      // Numeric range checks for complete
      if (body.age !== undefined && body.age !== null && Number(body.age) <= 0) {
        missingFields.push('age (must be > 0)');
      }
      if (body.systolic !== undefined && body.systolic !== null && Number(body.systolic) < 50) {
        missingFields.push('systolic (must be >= 50)');
      }
      if (body.diastolic !== undefined && body.diastolic !== null && Number(body.diastolic) < 30) {
        missingFields.push('diastolic (must be >= 30)');
      }
      if (body.heartRate !== undefined && body.heartRate !== null && (Number(body.heartRate) < 30 || Number(body.heartRate) > 200)) {
        missingFields.push('heartRate (30-200 bpm)');
      }
      if (body.spo2 !== undefined && body.spo2 !== null && (Number(body.spo2) < 0 || Number(body.spo2) > 100)) {
        missingFields.push('spo2 (0-100%)');
      }
    } else {
      // For draft: if age is provided, validate positivity; otherwise, allow null
      if (body.age !== undefined && body.age !== null && body.age !== '') {
        if (Number(body.age) <= 0) {
          missingFields.push('age (must be > 0)');
        }
      }
      // gender is completely optional for draft – no validation
    }

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: isDraft
            ? 'Missing required patient information for draft'
            : 'Missing required fields for completion',
          missingFields,
        },
        { status: 400 }
      );
    }

    // 2. Check uniqueness of assessment_id
    const existing = await query(
      'SELECT assessment_id FROM emergency_assessments WHERE assessment_id = $1',
      [body.id]
    );
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Assessment ID already exists', assessmentId: body.id },
        { status: 409 }
      );
    }

    // 3. Create a new patient (always use provided name; age/gender may be null for draft)
    const patient = await createPatient({
      patientName: body.patientName,
      age: body.age,
      gender: body.gender,
    });

    // 4. Insert assessment
    const result = await query(
      `INSERT INTO emergency_assessments (
        assessment_id, patient_id, uhid, patient_name, age, gender, arrival_at,
        triage_category, status, linked_admission_id, completed_at,
        systolic, diastolic, heart_rate, respiratory_rate, temperature, temp_unit,
        spo2, pain_score, gcs, rbs, upt,
        ecg_done, ecg_report_attached, cxr_done, cxr_report_attached,
        usg_done, usg_findings, labs,
        chief_complaints, complaint_duration, past_history,
        provisional_diagnosis, exam_findings, er_interventions,
        disposition_decision, main_doctor, referral, duty_doctor_name,
        created_by_name, ip_address, user_agent
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11,
        $12, $13, $14, $15, $16, $17,
        $18, $19, $20, $21, $22,
        $23, $24, $25, $26,
        $27, $28, $29,
        $30, $31, $32,
        $33, $34, $35,
        $36, $37, $38, $39,
        $40, $41, $42
      ) RETURNING assessment_id`,
      [
        body.id,
        patient.patient_id,
        body.uhid,
        body.patientName,
        body.age,
        body.gender,
        body.arrivalAt ?? new Date().toISOString(),
        body.triage,
        body.status ?? 'Draft',
        body.linkedAdmissionId,
        body.completedAt,
        body.systolic,
        body.diastolic,
        body.heartRate,
        body.respiratoryRate,
        body.temperature,
        body.tempUnit ?? 'C',
        body.spo2,
        body.painScore ?? 0,
        body.gcs,
        body.rbs,
        body.upt,
        body.ecgDone,
        body.ecgReportAttached ?? false,
        body.cxrDone,
        body.cxrReportAttached ?? false,
        body.usgDone,
        body.usgFindings,
        JSON.stringify(body.labs ?? []),
        body.chiefComplaints,
        body.complaintDuration,
        body.pastHistory,
        body.provisionalDiagnosis,
        body.examFindings,
        body.intervention,
        body.decision,
        body.mainDoctor,
        body.referral,
        body.dutyDoctorName,
        'System',
        request.headers.get('x-forwarded-for') || 'unknown',
        request.headers.get('user-agent') || 'unknown',
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message: isDraft ? 'Draft saved successfully' : 'Assessment completed successfully',
        data: {
          assessment_id: result.rows[0].assessment_id,
          patient_id: patient.patient_id,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating assessment:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create assessment',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}