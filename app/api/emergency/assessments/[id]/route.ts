import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/emergency/assessments/[id]
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = params.id;

  try {
    const result = await query(
      `SELECT 
        assessment_id as id,
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
        duty_doctor_name as "dutyDoctorName"
      FROM emergency_assessments 
      WHERE assessment_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    const assessment = result.rows[0];
    if (assessment.labs && typeof assessment.labs === 'string') {
      assessment.labs = JSON.parse(assessment.labs);
    }

    return NextResponse.json(assessment);
  } catch (error) {
    console.error('Error fetching assessment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessment' },
      { status: 500 }
    );
  }
}

// PUT /api/emergency/assessments/[id]

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = params.id;

  try {
    const body = await request.json();

    // Check existence
    const existing = await query(
      'SELECT assessment_id FROM emergency_assessments WHERE assessment_id = $1',
      [id]
    );
    if (existing.rows.length === 0) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Update all columns
    await query(
      `UPDATE emergency_assessments SET
        uhid = $1,
        patient_name = $2,
        age = $3,
        gender = $4,
        arrival_at = $5,
        triage_category = $6,
        status = $7,
        linked_admission_id = $8,
        completed_at = $9,
        systolic = $10,
        diastolic = $11,
        heart_rate = $12,
        respiratory_rate = $13,
        temperature = $14,
        temp_unit = $15,
        spo2 = $16,
        pain_score = $17,
        gcs = $18,
        rbs = $19,
        upt = $20,
        ecg_done = $21,
        ecg_report_attached = $22,
        cxr_done = $23,
        cxr_report_attached = $24,
        usg_done = $25,
        usg_findings = $26,
        labs = $27,
        chief_complaints = $28,
        complaint_duration = $29,
        past_history = $30,
        provisional_diagnosis = $31,
        exam_findings = $32,
        er_interventions = $33,
        disposition_decision = $34,
        main_doctor = $35,
        referral = $36,
        duty_doctor_name = $37,
        updated_at = NOW()
      WHERE assessment_id = $38`,
      [
        body.uhid,
        body.patientName,
        body.age,
        body.gender,
        body.arrivalAt,
        body.triage,
        body.status,
        body.linkedAdmissionId,
        body.completedAt,
        body.systolic,
        body.diastolic,
        body.heartRate,
        body.respiratoryRate,
        body.temperature,
        body.tempUnit,
        body.spo2,
        body.painScore,
        body.gcs,
        body.rbs,
        body.upt,
        body.ecgDone,
        body.ecgReportAttached,
        body.cxrDone,
        body.cxrReportAttached,
        body.usgDone,
        body.usgFindings,
        JSON.stringify(body.labs || []),
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
        id
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Assessment updated successfully'
    });
  } catch (error) {
    console.error('Error updating assessment:', error);
    return NextResponse.json(
      { error: 'Failed to update assessment' },
      { status: 500 }
    );
  }
}

// DELETE /api/emergency/assessments/[id]
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = params.id;

  try {
    const existing = await query(
      'SELECT assessment_id FROM emergency_assessments WHERE assessment_id = $1',
      [id]
    );
    if (existing.rows.length === 0) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    await query(
      'DELETE FROM emergency_assessments WHERE assessment_id = $1',
      [id]
    );

    return NextResponse.json({
      success: true,
      message: 'Assessment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting assessment:', error);
    return NextResponse.json(
      { error: 'Failed to delete assessment' },
      { status: 500 }
    );
  }
}