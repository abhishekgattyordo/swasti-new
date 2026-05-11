// app/api/patient/emergency-summary/route.ts



import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const patientId = searchParams.get('patientId');

    if (!patientId) {
      return NextResponse.json(
        { success: false, message: 'Patient ID is required' },
        { status: 400 }
      );
    }

    const result = await query(
      `SELECT 
        -- Assessment Info
        assessment_id as "assessmentId",
        patient_id as "patientId",
        uhid,
        patient_name as "patientName",
        age,
        gender,
        triage_category as "triage",
        status,
        linked_admission_id as "linkedAdmissionId",
        created_at as "arrivalAt",
        completed_at as "completedAt",
        
        -- Doctors (who treated vs who wrote)
        main_doctor as "treatingDoctor",
        duty_doctor_name as "assessmentWrittenBy",
        referral as "referredTo",
        
        -- Decision
        disposition_decision as "decision",
        
        -- Clinical
        chief_complaints as "chiefComplaints",
        provisional_diagnosis as "diagnosis",
        
        -- Vitals
        systolic, diastolic, heart_rate as "heartRate",
        respiratory_rate as "respiratoryRate", 
        temperature, temp_unit as "tempUnit", spo2,
        pain_score as "painScore", gcs,
        
        -- Investigations
        rbs, upt, ecg_done as "ecgDone",
        usg_done as "usgDone", usg_findings as "usgFindings",
        labs
        
      FROM emergency_assessments 
      WHERE patient_id = $1
      ORDER BY created_at DESC`,
      [patientId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No emergency records found for this patient' },
        { status: 404 }
      );
    }

    const latest = result.rows[0];
    
    return NextResponse.json({
      success: true,
      data: {
        patient: {
          id: latest.patientId,
          uhid: latest.uhid,
          name: latest.patientName,
          age: latest.age,
          gender: latest.gender
        },
        doctors: {
          treatingDoctor: latest.treatingDoctor || 'Not assigned',
          assessmentWrittenBy: latest.assessmentWrittenBy || 'Not assigned',
          referredTo: latest.referredTo || 'None'
        },
        latestAssessment: {
          id: latest.assessmentId,
          date: latest.arrivalAt,
          triage: latest.triage,
          status: latest.status,
          decision: latest.decision,
          diagnosis: latest.diagnosis,
          chiefComplaints: latest.chiefComplaints,
          vitals: {
            bp: `${latest.systolic}/${latest.diastolic}`,
            heartRate: latest.heartRate,
            temperature: `${latest.temperature}°${latest.tempUnit}`,
            spo2: latest.spo2
          },
          convertedToAdmission: !!latest.linkedAdmissionId,
          admissionId: latest.linkedAdmissionId
        },
        allVisits: result.rows.map(row => ({
          id: row.assessmentId,
          date: row.arrivalAt,
          triage: row.triage,
          decision: row.decision,
          treatingDoctor: row.treatingDoctor,
          writtenBy: row.assessmentWrittenBy
        })),
        summary: {
          totalVisits: result.rows.length,
          completed: result.rows.filter(r => r.status === 'Completed').length,
          convertedToAdmission: result.rows.filter(r => r.linkedAdmissionId).length
        }
      }
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch patient summary' },
      { status: 500 }
    );
  }
}