


import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

function generatePatientId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${timestamp}${random.toString().padStart(4, '0')}`;
}

function generateRandomPassword(length = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  return Array.from(randomBytes(length))
    .map(byte => chars[byte % chars.length])
    .join('');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode, patientId, patient, admission, emergency } = body;

    let actualPatientId: string;
    let plainPassword: string | undefined;

    await query('BEGIN');

    try {
      // Existing patient or new patient
      if (mode === 'existing') {
        if (!patientId) throw new Error('Patient ID required for existing patient');
        const check = await query('SELECT patient_id FROM patients WHERE patient_id = $1', [patientId]);
        if (check.rows.length === 0) throw new Error('Patient not found');
        actualPatientId = patientId;
      } else {
        const newPatientId = generatePatientId();
        await query(
          `INSERT INTO patients (
            patient_id, full_name_en, dob, gender, phone, email, address, city, pincode, state, registration_step
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            newPatientId,
            patient.fullName,
            patient.dob,
            patient.gender,
            patient.phone,
            patient.email,
            patient.address,
            patient.city,
            patient.pincode,
            patient.state,
            3,
          ]
        );
        actualPatientId = newPatientId;

        if (emergency.name || emergency.relation || emergency.phone) {
          await query(
            `INSERT INTO emergency_contacts (patient_id, name, relation, phone)
             VALUES ($1, $2, $3, $4)`,
            [actualPatientId, emergency.name, emergency.relation, emergency.phone]
          );
        }

        plainPassword = generateRandomPassword(12);
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        const existingUser = await query('SELECT id FROM users WHERE email = $1', [patient.email]);
        if (existingUser.rows.length > 0) {
          await query(
            `UPDATE users 
             SET password = $1, full_name_en = $2, role = 'patient', patient_id = $3, updated_at = NOW()
             WHERE email = $4`,
            [hashedPassword, patient.fullName, actualPatientId, patient.email]
          );
        } else {
          await query(
            `INSERT INTO users (email, password, full_name_en, role, patient_id, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
            [patient.email, hashedPassword, patient.fullName, 'patient', actualPatientId]
          );
        }
        console.log(`🔑 Generated password for ${patient.email}: ${plainPassword}`);
      }

      // Insert admission
      const admissionResult = await query(
        `INSERT INTO admissions (
          patient_id, admission_date, ward_id, room_id, bed_id, reason, diagnosis, status, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        RETURNING id`,
        [
          actualPatientId,
          admission.admissionDate,
          admission.wardId || null,
          admission.roomId || null,
          admission.bedId || null,
          admission.reason || null,
          admission.diagnosis || null,
          'active',
        ]
      );

      const admissionId = admissionResult.rows[0].id;

      // 🆕 Insert initial ward_transfers record (so room rent starts from admission date)
      if (admission.wardId) {
        await query(
          `INSERT INTO ward_transfers (admission_id, ward_id, from_date)
           VALUES ($1, $2, $3)`,
          [admissionId, admission.wardId, admission.admissionDate]
        );
      }

      // Update bed occupancy
      if (admission.bedId) {
        await query(
          `UPDATE beds SET status = 'occupied', occupied_by = $1, occupied_at = NOW() WHERE id = $2`,
          [actualPatientId, admission.bedId]
        );
      }

      await query('COMMIT');

      const response: any = {
        success: true,
        message: 'Patient admitted successfully',
        data: { admissionId, patientId: actualPatientId },
      };
      if (process.env.NODE_ENV !== 'production' && plainPassword) {
        response.data.generatedPassword = plainPassword;
      }

      // 🔥 Generate bill automatically in the background (fire and forget)
      const baseUrl = req.nextUrl.origin; // e.g., http://localhost:3000
      fetch(`${baseUrl}/api/billing/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admissionId }),
      }).catch(err => console.error('Bill generation failed:', err));

      return NextResponse.json(response);
    } catch (err) {
      await query('ROLLBACK');
      throw err;
    }
  } catch (error: any) {
    console.error('Admission error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to admit patient' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const patientId = url.searchParams.get('patientId');
    const wardId = url.searchParams.get('wardId');
    const bedId = url.searchParams.get('bedId');
    const admissionId = url.searchParams.get('admissionId'); // ✅ new

    let sql = `
      SELECT 
        a.id,
        a.patient_id,
        a.admission_date,
        a.discharge_date,
        a.status,
        a.reason,
        a.diagnosis,
        p.full_name_en as patient_name,
        p.phone as patient_phone,
        w.name as ward_name,
        b.bed_number
      FROM admissions a
      LEFT JOIN patients p ON a.patient_id = p.patient_id
      LEFT JOIN wards w ON a.ward_id = w.id
      LEFT JOIN beds b ON a.bed_id = b.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      sql += ` AND a.status = $${paramIndex++}`;
      params.push(status);
    }
    if (patientId) {
      sql += ` AND a.patient_id::text = $${paramIndex++}`;
      params.push(patientId);
    }
    if (wardId) {
      sql += ` AND a.ward_id = $${paramIndex++}`;
      params.push(parseInt(wardId));
    }
    if (bedId) {
      sql += ` AND a.bed_id = $${paramIndex++}`;
      params.push(parseInt(bedId));
    }
    if (admissionId) {
      sql += ` AND a.id = $${paramIndex++}`;
      params.push(parseInt(admissionId));
    }
    sql += ` ORDER BY a.admission_date DESC`;

    const result = await query(sql, params);
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error: any) {
    console.error('Error fetching admissions:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}