// app/api/patients/bulk/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { z } from 'zod';

// Validation schema matching the fields sent from the PatientImport component
const BulkPatientSchema = z.object({
  fullNameEn: z.string().min(1, 'Full name is required'),
  fullNameHi: z.string().optional(),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  gender: z.string().min(1, 'Gender is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().default('India'),
  pincode: z.string().min(1, 'Pincode is required'),
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Invalid email format'),
  blood_group: z.string().optional(),
  allergies: z.array(z.string()).default([]),
  chronicConditions: z.array(z.string()).default([]),
  medications: z.string().optional(),
  insuranceProvider: z.string().optional(),
  policyNumber: z.string().optional(),
  validUntil: z.string().optional(),
  groupId: z.string().optional(),
});

type BulkPatient = z.infer<typeof BulkPatientSchema>;

// Generate a numeric patient ID (17 digits: timestamp + random)
function generatePatientId(): string {
  const timestamp = Date.now(); // 13 digits
  const random = Math.floor(Math.random() * 10000); // 0-9999
  return `${timestamp}${random.toString().padStart(4, '0')}`;
}

export async function POST(req: NextRequest) {
  try {
    const { patients } = await req.json();

    if (!Array.isArray(patients) || patients.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid or empty patients array' },
        { status: 400 }
      );
    }

    // Validate each patient
    const validated: BulkPatient[] = [];
    for (let i = 0; i < patients.length; i++) {
      const result = BulkPatientSchema.safeParse(patients[i]);
      if (!result.success) {
        const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        return NextResponse.json(
          {
            success: false,
            message: `Validation error at row ${i + 1}: ${errors}`,
          },
          { status: 400 }
        );
      }
      validated.push(result.data);
    }

    // Check duplicate emails in DB
    const emails = validated.map(p => p.email);
    const existing = await query(
      'SELECT email FROM patients WHERE email = ANY($1::text[])',
      [emails]
    );
    if (existing.rows.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Duplicate emails found: ${existing.rows.map(r => r.email).join(', ')}`,
        },
        { status: 409 }
      );
    }

    // Insert in transaction
    await query('BEGIN');
    const inserted: { patientId: string; name: string }[] = [];

    try {
      for (const data of validated) {
        const patientId = generatePatientId();

        // 1. Insert patient
        await query(
          `INSERT INTO patients (
            patient_id, full_name_en, full_name_hi, dob, gender, address, city, state, country, pincode,
            phone, email, blood_group, registration_step, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())`,
          [
            patientId,
            data.fullNameEn,
            data.fullNameHi || null,
            data.dob,
            data.gender,
            data.address,
            data.city || null,
            data.state,
            data.country || 'India',
            data.pincode,
            data.phone,
            data.email,
            data.blood_group || null,
            3, // registration_step = completed
          ]
        );

        // 2. Insert medical history (if provided)
        const firstAllergy = data.allergies?.[0] || '';
        const firstCondition = data.chronicConditions?.[0] || '';
        if (firstAllergy || firstCondition || data.medications) {
          await query(
            `INSERT INTO medical_history (patient_id, allergy, chronic_condition, medications)
             VALUES ($1, $2, $3, $4)`,
            [patientId, firstAllergy, firstCondition, data.medications || null]
          );
        }

        // 3. Insert insurance details (if provided)
        if (data.insuranceProvider || data.policyNumber || data.validUntil || data.groupId) {
          await query(
            `INSERT INTO insurance_details (patient_id, insurance_provider, policy_number, valid_until, group_id)
             VALUES ($1, $2, $3, $4, $5)`,
            [
              patientId,
              data.insuranceProvider || null,
              data.policyNumber || null,
              data.validUntil || null,
              data.groupId || null,
            ]
          );
        }

        // 4. Create placeholder user record in `users` table
        await query(
          `INSERT INTO users (email, full_name_en, role, patient_id, created_at, updated_at)
           VALUES ($1, $2, $3, $4, NOW(), NOW())`,
          [data.email, data.fullNameEn, 'patient', patientId]
        );

        // 5. Send Supabase invitation
        const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
          data.email,
          {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/set-password`,
            data: {
              full_name: data.fullNameEn,
              patient_id: patientId,
              role: 'patient',
            },
          }
        );

        if (inviteError) {
          throw new Error(`Invitation failed for ${data.email}: ${inviteError.message}`);
        }

        // 6. Update user record with auth_user_id
        await query(
          `UPDATE users SET auth_user_id = $1 WHERE email = $2`,
          [inviteData.user.id, data.email]
        );

        inserted.push({ patientId, name: data.fullNameEn });
      }

      await query('COMMIT');
      return NextResponse.json({
        success: true,
        message: `Successfully imported ${inserted.length} patients`,
        data: inserted,
      });
    } catch (err) {
      await query('ROLLBACK');
      throw err;
    }
  } catch (error: any) {
    console.error('Bulk import error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}