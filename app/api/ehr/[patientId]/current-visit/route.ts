

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authErrorResponse,requireRole } from '@/lib/auth/guards';

// Helper to get the latest appointment ID for a patient
async function getLatestAppointmentId(patientId: string): Promise<string | null> {
  try {
    const result = await query(
      `SELECT id FROM appointments 
       WHERE patient_id = $1 
       ORDER BY appointment_date DESC, appointment_time DESC 
       LIMIT 1`,
      [patientId]
    );
    return result.rows[0]?.id || null;
  } catch (error) {
    console.error('Error getting latest appointment ID:', error);
    return null;
  }
}

// Helper to get appointment ID by patient ID and date
async function getAppointmentIdByDate(patientId: string, date: string): Promise<string | null> {
  try {
    const result = await query(
      `SELECT id FROM appointments 
       WHERE patient_id = $1 AND appointment_date = $2::date
       ORDER BY appointment_time DESC
       LIMIT 1`,
      [patientId, date]
    );
    return result.rows[0]?.id || null;
  } catch (error) {
    console.error('Error getting appointment ID by date:', error);
    return null;
  }
}

// GET /api/ehr/[patientId]/current-visit?appointmentId=xxx&date=yyyy-mm-dd

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
       requireRole(req, ['doctor']);
    const { patientId } = await params;

    const url = new URL(req.url);
    const appointmentId = url.searchParams.get('appointmentId');
    const dateParam = url.searchParams.get('date');

    let targetAppointmentId = appointmentId;
    if (!targetAppointmentId) {
      if (dateParam) {
        targetAppointmentId = await getAppointmentIdByDate(patientId, dateParam);
        if (!targetAppointmentId) {
          return NextResponse.json(
            { success: false, message: 'No appointment found on this date' },
            { status: 404 }
          );
        }
      } else {
        targetAppointmentId = await getLatestAppointmentId(patientId);
        if (!targetAppointmentId) {
          return NextResponse.json(
            { success: false, message: 'No appointments found for this patient' },
            { status: 404 }
          );
        }
      }
    }

    // Fetch visit details including consultation fee from appointments table
    const visitResult = await query(
      `SELECT 
        vd.diagnosis,
        vd.icd10_code,
        vd.clinical_notes,
        to_char(vd.follow_up_date, 'YYYY-MM-DD') as follow_up_date,
        vd.patient_instructions,
        vd.created_at,
        vd.updated_at,
        a.appointment_date,
        a.appointment_time,
        a.doctor_id,
        d.first_name || ' ' || d.last_name as doctor_name,
        a.consultation_fee
       FROM visit_details vd
       JOIN appointments a ON vd.appointment_id = a.id
       JOIN doctors d ON a.doctor_id = d.id
       WHERE vd.appointment_id = $1`,
      [targetAppointmentId]
    );

    if (visitResult.rows.length === 0) {
      // No visit details yet, but we can still return appointment data (including fee)
      const apptResult = await query(
        `SELECT a.consultation_fee, a.appointment_date, a.appointment_time, a.doctor_id
         FROM appointments a
         WHERE a.id = $1`,
        [targetAppointmentId]
      );
      const apptData = apptResult.rows[0];
      return NextResponse.json({
        success: true,
        data: {
          consultation_fee: apptData?.consultation_fee || 0,
          appointment_date: apptData?.appointment_date,
          appointment_time: apptData?.appointment_time,
          doctor_id: apptData?.doctor_id,
        },
        appointmentId: targetAppointmentId
      });
    }

    return NextResponse.json({
      success: true,
      data: visitResult.rows[0]
    });
  } catch (error) {
    console.error('Error fetching current visit:', error);
        const authResponse=authErrorResponse(error);
if(authResponse){
  return authResponse
}
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/ehr/[patientId]/current-visit
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
       requireRole(req, ['doctor']);
    const { patientId } = await params;
    const body = await req.json();

    let appointmentId = body.appointmentId;
    const date = body.date;
    const consultationFee = body.consultation_fee;

    // Resolve appointmentId if not provided but date is given
    if (!appointmentId) {
      if (date) {
        appointmentId = await getAppointmentIdByDate(patientId, date);
        if (!appointmentId) {
          return NextResponse.json(
            { success: false, message: 'No appointment found on this date' },
            { status: 404 }
          );
        }
      } else {
        appointmentId = await getLatestAppointmentId(patientId);
        if (!appointmentId) {
          return NextResponse.json(
            { success: false, message: 'No appointments found for this patient' },
            { status: 404 }
          );
        }
      }
    }

    const { diagnosis, icd10_code, clinical_notes, follow_up_date, patient_instructions } = body;

    // Update consultation fee in appointments table
    if (consultationFee !== undefined) {
      await query(
        `UPDATE appointments SET consultation_fee = $1 WHERE id = $2`,
        [consultationFee, appointmentId]
      );
    }

    // Check if a record already exists for this appointment in visit_details
    const existing = await query(
      'SELECT id FROM visit_details WHERE appointment_id = $1',
      [appointmentId]
    );

    if (existing.rows.length > 0) {
      // Update visit_details
      await query(
        `UPDATE visit_details SET
          diagnosis = $1,
          icd10_code = $2,
          clinical_notes = $3,
          follow_up_date = $4,
          patient_instructions = $5,
          updated_at = NOW()
         WHERE appointment_id = $6`,
        [diagnosis, icd10_code, clinical_notes, follow_up_date, patient_instructions, appointmentId]
      );
    } else {
      // Insert into visit_details
      await query(
        `INSERT INTO visit_details
          (appointment_id, diagnosis, icd10_code, clinical_notes, follow_up_date, patient_instructions, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
        [appointmentId, diagnosis, icd10_code, clinical_notes, follow_up_date, patient_instructions]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Current visit saved successfully',
      appointmentId
    });
  } catch (error) {
    console.error('Error saving current visit:', error);
        const authResponse=authErrorResponse(error);
if(authResponse){
  return authResponse
}
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}