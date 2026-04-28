


import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { z } from 'zod';

import { 
  Step1Schema, 
  Step2Schema, 
  Step3Schema,
  patientIdSchema 
} from '@/lib/validations/registration';
import { authErrorResponse,requireRole } from '@/lib/auth/guards';

function generatePatientId(): string {
  const timestamp = Date.now(); // 13 digits
  const random = Math.floor(Math.random() * 10000); // 0-9999
  const patientId = `${timestamp}${random.toString().padStart(4, '0')}`;
  console.log('✅ Generated patient ID:', patientId);
  return patientId;
}

function isErrorWithProperties(error: unknown): error is {
  name?: string;
  message?: string;
  stack?: string;
  code?: string | number;
  detail?: string;
} {
  return error !== null && typeof error === 'object';
}

// ==================== COMPOSE ADMIN SCHEMAS ====================
const adminCreateSchema = z.object({
  fullNameEn: Step1Schema.shape.fullNameEn,
  fullNameHi: Step1Schema.shape.fullNameHi,
  dob: Step1Schema.shape.dob,
  gender: Step1Schema.shape.gender,
  address: Step1Schema.shape.address,
  city: Step1Schema.shape.city,
  state: Step1Schema.shape.state,
  country: Step1Schema.shape.country,
  pincode: Step1Schema.shape.pincode,
  phone: Step1Schema.shape.phone,
  email: Step1Schema.shape.email,
  blood_group: Step1Schema.shape.blood_group,
  allergies: Step2Schema.shape.allergies.default([]),
  chronicConditions: Step2Schema.shape.chronicConditions.default([]),
  medications: Step2Schema.shape.medications.default(''),
  insuranceProvider: Step3Schema.shape.insuranceProvider,
  policyNumber: Step3Schema.shape.policyNumber,
  validUntil: Step3Schema.shape.validUntil,
  groupId: Step3Schema.shape.groupId,
});

const adminUpdateSchema = adminCreateSchema.extend({
  patientId: patientIdSchema,
});

type AdminCreateInput = z.infer<typeof adminCreateSchema>;
type AdminUpdateInput = z.infer<typeof adminUpdateSchema>;

type ValidationResult = 
  | { success: true; data: AdminCreateInput | AdminUpdateInput }
  | { success: false; errors: Record<string, string> };

function validateAdminData(data: any, isUpdate = false): ValidationResult {
  const schema = isUpdate ? adminUpdateSchema : adminCreateSchema;
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors: Record<string, string> = {};
    result.error.issues.forEach(err => {
      const path = err.path.join('.');
      errors[path] = err.message;
    });
    return { success: false, errors };
  }
  return { success: true, data: result.data };
}

// ==================== GET ====================

export async function GET(req: Request) {
  try {
        requireRole(req, ['admin',"doctor"]);
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');
    const listAll = searchParams.get('list') === 'true';
    const addedByDoctorId = searchParams.get('added_by_doctor_id');

    if (patientId) {
      const patientQuery = await query(
        `SELECT 
          p.*,
          mh.allergy,
          mh.chronic_condition,
          mh.medications,
          id.insurance_provider,
          id.policy_number,
          id.valid_until,
          id.group_id
         FROM patients p
         LEFT JOIN medical_history mh ON p.patient_id = mh.patient_id
         LEFT JOIN insurance_details id ON p.patient_id = id.patient_id
         WHERE p.patient_id = $1`,
        [patientId]
      );

      if (patientQuery.rows.length === 0) {
        return NextResponse.json(
          { success: false, message: 'Patient not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: patientQuery.rows[0]
      });
    }

    if (addedByDoctorId) {
      const doctorIdNum = parseInt(addedByDoctorId);
      if (isNaN(doctorIdNum)) {
        return NextResponse.json(
          { success: false, message: 'Invalid doctor ID' },
          { status: 400 }
        );
      }

      const patientsQuery = await query(
        `SELECT 
          p.*,
          mh.allergy,
          mh.chronic_condition,
          mh.medications,
          id.insurance_provider,
          id.policy_number,
          id.valid_until,
          id.group_id
         FROM patients p
         LEFT JOIN medical_history mh ON p.patient_id = mh.patient_id
         LEFT JOIN insurance_details id ON p.patient_id = id.patient_id
         WHERE p.added_by_doctor_id = $1
         ORDER BY p.created_at DESC`,
        [doctorIdNum]
      );

      return NextResponse.json({
        success: true,
        data: patientsQuery.rows
      });
    }

    if (listAll) {
      const patientsQuery = await query(
        `SELECT 
          p.*,
          mh.allergy,
          mh.chronic_condition,
          mh.medications,
          id.insurance_provider,
          id.policy_number,
          id.valid_until,
          id.group_id
         FROM patients p
         LEFT JOIN medical_history mh ON p.patient_id = mh.patient_id
         LEFT JOIN insurance_details id ON p.patient_id = id.patient_id
         ORDER BY p.created_at DESC`
      );

      return NextResponse.json({
        success: true,
        data: patientsQuery.rows
      });
    }

    const patientsQuery = await query(
      'SELECT patient_id, full_name_en, dob, phone, email, created_at FROM patients ORDER BY created_at DESC'
    );

    return NextResponse.json({
      success: true,
      data: patientsQuery.rows
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
        const authResponse=authErrorResponse(error);

if(authResponse){
  return authResponse
}
    return NextResponse.json(
      { success: false, message: 'Failed to fetch patients' },
      { status: 500 }
    );
  }
}

// ==================== POST ====================

export async function POST(req: Request) {
  try {
    const body = await req.json();
        requireRole(req, ['admin']);

    const validation = validateAdminData(body, false);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: validation.errors },
        { status: 400 }
      );
    }

    const data = validation.data as AdminCreateInput;
    const patientId = generatePatientId();

    // Insert patient
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
        3
      ]
    );

    // Medical history
    const firstAllergy = data.allergies[0] || '';
    const firstCondition = data.chronicConditions[0] || '';

    if (firstAllergy || firstCondition || data.medications) {
      await query(
        `INSERT INTO medical_history (patient_id, allergy, chronic_condition, medications)
         VALUES ($1, $2, $3, $4)`,
        [patientId, firstAllergy, firstCondition, data.medications || null]
      );
    }

    // Insurance details
    if (data.insuranceProvider || data.policyNumber || data.validUntil || data.groupId) {
      await query(
        `INSERT INTO insurance_details (patient_id, insurance_provider, policy_number, valid_until, group_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [patientId, data.insuranceProvider || null, data.policyNumber || null, data.validUntil || null, data.groupId || null]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Patient created successfully',
      data: { patientId }
    });
  } catch (error) {
    console.error('Error creating patient:', error);
       const authResponse=authErrorResponse(error);
    if(authResponse){
  return authResponse
}
    const errorMessage = isErrorWithProperties(error) ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, message: 'Failed to save patient', error: errorMessage },
      { status: 500 }
    );
  }
}

// ==================== PUT ====================

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    requireRole(req, ['admin']);

    const validation = validateAdminData(body, true);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: validation.errors },
        { status: 400 }
      );
    }

    const data = validation.data as AdminUpdateInput;

    // Update patient
    await query(
      `UPDATE patients SET
        full_name_en = $1,
        full_name_hi = $2,
        dob = $3,
        gender = $4,
        address = $5,
        city = $6,
        state = $7,
        country = $8,
        pincode = $9,
        phone = $10,
        email = $11,
        blood_group = $12,
        updated_at = NOW()
       WHERE patient_id = $13`,
      [
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
        data.patientId
      ]
    );

    const firstAllergy = data.allergies[0] || '';
    const firstCondition = data.chronicConditions[0] || '';

    // Upsert medical_history
    const medHistoryExists = await query(
      'SELECT 1 FROM medical_history WHERE patient_id = $1',
      [data.patientId]
    );

    if (medHistoryExists.rows.length > 0) {
      await query(
        `UPDATE medical_history SET
          allergy = $1,
          chronic_condition = $2,
          medications = $3
         WHERE patient_id = $4`,
        [firstAllergy, firstCondition, data.medications || null, data.patientId]
      );
    } else if (firstAllergy || firstCondition || data.medications) {
      await query(
        `INSERT INTO medical_history (patient_id, allergy, chronic_condition, medications)
         VALUES ($1, $2, $3, $4)`,
        [data.patientId, firstAllergy, firstCondition, data.medications || null]
      );
    }

    // Upsert insurance_details
    const insuranceExists = await query(
      'SELECT 1 FROM insurance_details WHERE patient_id = $1',
      [data.patientId]
    );

    if (insuranceExists.rows.length > 0) {
      await query(
        `UPDATE insurance_details SET
          insurance_provider = $1,
          policy_number = $2,
          valid_until = $3,
          group_id = $4
         WHERE patient_id = $5`,
        [data.insuranceProvider || null, data.policyNumber || null, data.validUntil || null, data.groupId || null, data.patientId]
      );
    } else if (data.insuranceProvider || data.policyNumber || data.validUntil || data.groupId) {
      await query(
        `INSERT INTO insurance_details (patient_id, insurance_provider, policy_number, valid_until, group_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [data.patientId, data.insuranceProvider || null, data.policyNumber || null, data.validUntil || null, data.groupId || null]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Patient updated successfully'
    });
  } catch (error) {
    console.error('Error updating patient:', error);
    const authResponse = authErrorResponse(error);
    if (authResponse) {
      return authResponse;
    }
    return NextResponse.json(
      { success: false, message: 'Failed to update patient' },
      { status: 500 }
    );
  }
}

// ==================== DELETE ====================

export async function DELETE(req: Request) {
  try {
    requireRole(req, ['admin']);
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');

    if (!patientId) {
      return NextResponse.json(
        { success: false, message: 'Patient ID is required' },
        { status: 400 }
      );
    }

    const idValidation = patientIdSchema.safeParse(patientId);
    if (!idValidation.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid patient ID format' },
        { status: 400 }
      );
    }

    const check = await query('SELECT 1 FROM patients WHERE patient_id = $1', [patientId]);
    if (check.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Patient not found' },
        { status: 404 }
      );
    }

    // Delete from dependent tables
    await query('DELETE FROM medical_history WHERE patient_id = $1', [patientId]);
    await query('DELETE FROM insurance_details WHERE patient_id = $1', [patientId]);
    await query('DELETE FROM registrations WHERE patient_id = $1', [patientId]);
    await query('DELETE FROM patients WHERE patient_id = $1', [patientId]);

    return NextResponse.json({
      success: true,
      message: 'Patient deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting patient:', error);
      const authResponse = authErrorResponse(error);
    if (authResponse) {
      return authResponse;
    }
    const err = error as { message?: string; detail?: string; code?: string };
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete patient',
        error: err.message || 'Unknown error',
        detail: err.detail || null,
        code: err.code || null
      },
      { status: 500 }
    );
  }
}