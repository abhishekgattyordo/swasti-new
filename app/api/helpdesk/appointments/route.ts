import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authErrorResponse,requireRole } from '@/lib/auth/guards';

// Helper to generate a numeric patient ID (same as quick-add)
function generatePatientId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${timestamp}${random.toString().padStart(3, '0')}`;
}

export async function POST(req: NextRequest) {
  try {
      requireRole(req, ['helpdesk','admin']);
    const body = await req.json();

    const {
      // Patient fields (new patient)
      full_name_en,
      phone,
      email,
      dob,
      gender,
      blood_group,
      allergies,
      // Existing patient ID
      patientId,
      // Appointment fields
      doctorId,
      appointmentDate,
      appointmentTime,
      consultationType,
      notes,
    } = body;

    // Basic validation
    if (!doctorId || !appointmentDate || !appointmentTime || !consultationType) {
      return NextResponse.json(
        { success: false, message: 'Missing required appointment fields' },
        { status: 400 }
      );
    }

    // ----- Blood group normalization (same as quick-add) -----
    const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];
    const bloodGroupMap: Record<string, string> = {
      '0+': 'O+',
      '0-': 'O-',
      'o+': 'O+',
      'o-': 'O-',
    };
    let bloodGroupValue = 'Unknown';
    if (blood_group) {
      const trimmed = blood_group.trim();
      const normalized = bloodGroupMap[trimmed] || trimmed;
      const upper = normalized.toUpperCase();
      if (validBloodGroups.includes(upper)) {
        bloodGroupValue = upper;
      }
    }
    // ------------------------------------

    // Check for double booking
    const existing = await query(
      `SELECT id FROM appointments
       WHERE doctor_id = $1
       AND appointment_date = $2
       AND appointment_time = $3
       AND status != 'CANCELLED'`,
      [doctorId, appointmentDate, appointmentTime]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Slot already booked' },
        { status: 400 }
      );
    }

    let finalPatientId: string;

    // Start transaction
    await query('BEGIN');

    try {
      // Case 1: Existing patient
      if (patientId) {
        finalPatientId = patientId;
      }
      // Case 2: New patient
      else if (full_name_en && phone) {
        const newPatientId = generatePatientId();

        // Insert patient with placeholders for required fields
        await query(
          `INSERT INTO patients (
            patient_id, full_name_en, phone, email, dob, gender, blood_group,
            address, state, pincode, city, country
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            newPatientId,
            full_name_en,
            phone,
            email || null,
            dob || '1900-01-01',      // fallback DOB
            gender || 'other',         // fallback gender
            bloodGroupValue,            // normalized
            'Not provided',             // address placeholder
            'Unknown',                  // state placeholder
            '000000',                    // pincode placeholder
            null,                        // city (optional)
            'India',                      // country
          ]
        );

        // Insert allergies into medical_history if provided
        if (allergies && allergies.trim()) {
          await query(
            `INSERT INTO medical_history (patient_id, allergy, chronic_condition, medications)
             VALUES ($1, $2, '', '')`,
            [newPatientId, allergies.trim()]
          );
        }

        finalPatientId = newPatientId;
      } else {
        throw new Error('Either patientId or new patient details (name & phone) are required');
      }

      // Insert appointment – no id provided, let DB generate (UUID default)
      const appointmentResult = await query(
        `INSERT INTO appointments (
          doctor_id, patient_id, appointment_date, appointment_time, consultation_type, notes, status
        ) VALUES ($1, $2, $3, $4, $5, $6, 'BOOKED') RETURNING *`,
        [
          doctorId,
          finalPatientId,
          appointmentDate,
          appointmentTime,
          consultationType,
          notes || '',
        ]
      );

      await query('COMMIT');

      return NextResponse.json({
        success: true,
        data: {
          patient: { patient_id: finalPatientId, ...(patientId ? {} : { full_name_en, phone, email, dob, gender, blood_group: bloodGroupValue, allergies }) },
          appointment: appointmentResult.rows[0],
        },
        message: 'Appointment created successfully',
      });
    } catch (err) {
      await query('ROLLBACK');
      throw err;
    }
  } catch (error) {
    console.error('Error creating appointment:', error);
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