import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authErrorResponse,requireRole } from '@/lib/auth/guards';

export async function POST(req: NextRequest) {
  try {
      requireRole(req, ['pharmacy']);
    const body = await req.json();

    const {
      full_name_en,
      phone,
      email,
      dob,
      gender,
      blood_group,
      added_by_doctor_id,
      doctor_id,
      appointment_date,
      appointment_time,
      consultation_type,
      notes,
      allergies,
    } = body;

    if (!full_name_en || !phone || !added_by_doctor_id || !doctor_id || !appointment_date || !appointment_time) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // ----- Blood group normalization -----
    const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];
    const bloodGroupMap: Record<string, string> = {
      '0+': 'O+',
      '0-': 'O-',
      'o+': 'O+',
      'o-': 'O-',
      // Add other common misspellings if needed
    };

    let bloodGroupValue = 'Unknown';
    if (blood_group) {
      const trimmed = blood_group.trim();
      // Apply mapping if it exists, otherwise use the original
      const normalized = bloodGroupMap[trimmed] || trimmed;
      const upper = normalized.toUpperCase();
      if (validBloodGroups.includes(upper)) {
        bloodGroupValue = upper;
      }
    }
    // ------------------------------------

    // Generate a unique patient_id
    const patientId = Number(`${Date.now()}${Math.floor(Math.random() * 1000)}`);

    await query('BEGIN');

    // Insert patient with placeholders for required fields not provided by the form
    const patientResult = await query(
      `INSERT INTO patients (
        patient_id, full_name_en, phone, email, dob, gender, blood_group, added_by_doctor_id,
        address, state, pincode, city, country
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING patient_id`,
      [
        patientId,
        full_name_en,
        phone,
        email || null,
        dob || '1900-01-01',          // fallback if DOB not provided
        gender || 'other',             // fallback
        bloodGroupValue,               // use normalized value
        added_by_doctor_id,
        'Not provided',                 // address placeholder
        'Unknown',                      // state placeholder
        '000000',                        // pincode placeholder
        null,                            // city (optional)
        'India',                          // country (or use default)
      ]
    );

    const newPatientId = patientResult.rows[0].patient_id;

    // Insert allergy into medical_history if provided
    if (allergies && allergies.trim()) {
      await query(
        `INSERT INTO medical_history (patient_id, allergy, chronic_condition, medications)
         VALUES ($1, $2, '', '')`,
        [newPatientId, allergies.trim()]
      );
    }

    // Insert appointment
    const appointmentResult = await query(
      `INSERT INTO appointments (
        doctor_id, patient_id, appointment_date, appointment_time, consultation_type, notes, status
      ) VALUES ($1, $2, $3, $4, $5, $6, 'BOOKED') RETURNING *`,
      [
        doctor_id,
        newPatientId,
        appointment_date,
        appointment_time,
        consultation_type || 'in-person',
        notes || '',
      ]
    );

    await query('COMMIT');

    return NextResponse.json({
      success: true,
      data: {
        patient: { patient_id: newPatientId, ...body, blood_group: bloodGroupValue },
        appointment: appointmentResult.rows[0],
      },
      message: 'Patient created and appointment booked successfully',
    });
  } catch (error) {
    await query('ROLLBACK').catch(() => {});
    console.error('Quick add error:', error);
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