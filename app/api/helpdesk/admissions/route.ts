// import { NextRequest, NextResponse } from 'next/server';
// import { query } from '@/lib/db';
// import bcrypt from 'bcrypt';
// import { randomBytes } from 'crypto';

// function generatePatientId(): string {
//   const timestamp = Date.now();
//   const random = Math.floor(Math.random() * 10000);
//   return `${timestamp}${random.toString().padStart(4, '0')}`;
// }

// function generateRandomPassword(length = 12): string {
//   const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
//   return Array.from(randomBytes(length))
//     .map(byte => chars[byte % chars.length])
//     .join('');
// }

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const { mode, patientId, patient, admission, emergency } = body;

//     let actualPatientId: string;
//     let plainPassword: string | undefined;

//     await query('BEGIN');

//     try {
//       if (mode === 'existing') {
//         if (!patientId) throw new Error('Patient ID required for existing patient');
//         const check = await query('SELECT patient_id FROM patients WHERE patient_id = $1', [patientId]);
//         if (check.rows.length === 0) throw new Error('Patient not found');
//         actualPatientId = patientId;
//       } else {
//         const newPatientId = generatePatientId();
//         await query(
//           `INSERT INTO patients (
//             patient_id, full_name_en, dob, gender, phone, email, address, city, pincode, state, registration_step
//           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
//           [
//             newPatientId,
//             patient.fullName,
//             patient.dob,
//             patient.gender,
//             patient.phone,
//             patient.email,
//             patient.address,
//             patient.city,
//             patient.pincode,
//             patient.state,
//             3,
//           ]
//         );
//         actualPatientId = newPatientId;

//         if (emergency.name || emergency.relation || emergency.phone) {
//           await query(
//             `INSERT INTO emergency_contacts (patient_id, name, relation, phone)
//              VALUES ($1, $2, $3, $4)`,
//             [actualPatientId, emergency.name, emergency.relation, emergency.phone]
//           );
//         }

//         plainPassword = generateRandomPassword(12);
//         const hashedPassword = await bcrypt.hash(plainPassword, 10);

//         const existingUser = await query('SELECT id FROM users WHERE email = $1', [patient.email]);
//         if (existingUser.rows.length > 0) {
//           await query(
//             `UPDATE users 
//              SET password = $1, full_name_en = $2, role = 'patient', patient_id = $3, updated_at = NOW()
//              WHERE email = $4`,
//             [hashedPassword, patient.fullName, actualPatientId, patient.email]
//           );
//         } else {
//           await query(
//             `INSERT INTO users (email, password, full_name_en, role, patient_id, created_at, updated_at)
//              VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
//             [patient.email, hashedPassword, patient.fullName, 'patient', actualPatientId]
//           );
//         }
//         console.log(`🔑 Generated password for ${patient.email}: ${plainPassword}`);
//       }

//       const admissionResult = await query(
//         `INSERT INTO admissions (
//           patient_id, admission_date, ward_id, room_id, bed_id, reason, diagnosis, status, created_at, updated_at
//         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
//         RETURNING id`,
//         [
//           actualPatientId,
//           admission.admissionDate,
//           admission.wardId || null,
//           admission.roomId || null,
//           admission.bedId || null,
//           admission.reason || null,
//           admission.diagnosis || null,
//           'active',
//         ]
//       );

//       if (admission.bedId) {
//         await query(
//           `UPDATE beds SET status = 'occupied', occupied_by = $1, occupied_at = NOW() WHERE id = $2`,
//           [actualPatientId, admission.bedId]
//         );
//       }

//       await query('COMMIT');

//       const response: any = {
//         success: true,
//         message: 'Patient admitted successfully',
//         data: { admissionId: admissionResult.rows[0].id, patientId: actualPatientId },
//       };
//       if (process.env.NODE_ENV !== 'production' && plainPassword) {
//         response.data.generatedPassword = plainPassword;
//       }
//       return NextResponse.json(response);
//     } catch (err) {
//       await query('ROLLBACK');
//       throw err;
//     }
//   } catch (error: any) {
//     console.error('Admission error:', error);
//     return NextResponse.json(
//       { success: false, message: error.message || 'Failed to admit patient' },
//       { status: 500 }
//     );
//   }
// }


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