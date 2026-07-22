


// import { NextResponse } from 'next/server';
// import { query } from '@/lib/db';
// import { z } from 'zod';

// import { 
//   Step1Schema, 
//   Step2Schema, 
//   Step3Schema,
//   patientIdSchema 
// } from '@/lib/validations/registration';
// import { authErrorResponse,requireRole } from '@/lib/auth/guards';

// function generatePatientId(): string {
//   const timestamp = Date.now(); // 13 digits
//   const random = Math.floor(Math.random() * 10000); // 0-9999
//   const patientId = `${timestamp}${random.toString().padStart(4, '0')}`;
//   console.log('✅ Generated patient ID:', patientId);
//   return patientId;
// }

// function isErrorWithProperties(error: unknown): error is {
//   name?: string;
//   message?: string;
//   stack?: string;
//   code?: string | number;
//   detail?: string;
// } {
//   return error !== null && typeof error === 'object';
// }

// // ==================== COMPOSE ADMIN SCHEMAS ====================
// const adminCreateSchema = z.object({
//   fullNameEn: Step1Schema.shape.fullNameEn,
//   fullNameHi: Step1Schema.shape.fullNameHi,
//   dob: Step1Schema.shape.dob,
//   gender: Step1Schema.shape.gender,
//   address: Step1Schema.shape.address,
//   city: Step1Schema.shape.city,
//   state: Step1Schema.shape.state,
//   country: Step1Schema.shape.country,
//   pincode: Step1Schema.shape.pincode,
//   phone: Step1Schema.shape.phone,
//   email: Step1Schema.shape.email,
//   blood_group: Step1Schema.shape.blood_group,
//   allergies: Step2Schema.shape.allergies.default([]),
//   chronicConditions: Step2Schema.shape.chronicConditions.default([]),
//   medications: Step2Schema.shape.medications.default(''),
//   insuranceProvider: Step3Schema.shape.insuranceProvider,
//   policyNumber: Step3Schema.shape.policyNumber,
//   validUntil: Step3Schema.shape.validUntil,
//   groupId: Step3Schema.shape.groupId,
// });

// const adminUpdateSchema = adminCreateSchema.extend({
//   patientId: patientIdSchema,
// });

// type AdminCreateInput = z.infer<typeof adminCreateSchema>;
// type AdminUpdateInput = z.infer<typeof adminUpdateSchema>;

// type ValidationResult = 
//   | { success: true; data: AdminCreateInput | AdminUpdateInput }
//   | { success: false; errors: Record<string, string> };

// function validateAdminData(data: any, isUpdate = false): ValidationResult {
//   const schema = isUpdate ? adminUpdateSchema : adminCreateSchema;
//   const result = schema.safeParse(data);
//   if (!result.success) {
//     const errors: Record<string, string> = {};
//     result.error.issues.forEach(err => {
//       const path = err.path.join('.');
//       errors[path] = err.message;
//     });
//     return { success: false, errors };
//   }
//   return { success: true, data: result.data };
// }

// // ==================== GET ====================

// // ==================== GET ====================

// export async function GET(req: Request) {
//   try {
//     requireRole(req, ['admin', "doctor"]);
//     const { searchParams } = new URL(req.url);
//     const patientId = searchParams.get('patientId');
//     const listAll = searchParams.get('list') === 'true';
//     const addedByDoctorId = searchParams.get('added_by_doctor_id');

//     // Base query with correct insurance columns
//     const baseSelect = `
//       SELECT 
//         p.*,
//         mh.allergy,
//         mh.chronic_condition,
//         mh.medications,
//         ins.insurance_company,
//         ins.tpa_name,
//         ins.requested_amount,
//         ins.approved_amount,
//         ins.documents,
//         ins.status as insurance_status,
//         ins.created_at as insurance_created_at,
//         ins.updated_at as insurance_updated_at
//       FROM patients p
//       LEFT JOIN medical_history mh ON p.patient_id = mh.patient_id
//       LEFT JOIN insurance_details ins ON p.patient_id = ins.patient_id
//     `;

//     if (patientId) {
//       const patientQuery = await query(
//         baseSelect + ' WHERE p.patient_id = $1',
//         [patientId]
//       );

//       if (patientQuery.rows.length === 0) {
//         return NextResponse.json(
//           { success: false, message: 'Patient not found' },
//           { status: 404 }
//         );
//       }

//       return NextResponse.json({
//         success: true,
//         data: patientQuery.rows[0]
//       });
//     }

//     if (addedByDoctorId) {
//       const doctorIdNum = parseInt(addedByDoctorId);
//       if (isNaN(doctorIdNum)) {
//         return NextResponse.json(
//           { success: false, message: 'Invalid doctor ID' },
//           { status: 400 }
//         );
//       }

//       const patientsQuery = await query(
//         baseSelect + ' WHERE p.added_by_doctor_id = $1 ORDER BY p.created_at DESC',
//         [doctorIdNum]
//       );

//       return NextResponse.json({
//         success: true,
//         data: patientsQuery.rows
//       });
//     }

//     if (listAll) {
//       const patientsQuery = await query(
//         baseSelect + ' ORDER BY p.created_at DESC'
//       );

//       return NextResponse.json({
//         success: true,
//         data: patientsQuery.rows
//       });
//     }

//     // Fallback: minimal list without insurance
//     const patientsQuery = await query(
//       'SELECT patient_id, full_name_en, dob, phone, email, created_at FROM patients ORDER BY created_at DESC'
//     );

//     return NextResponse.json({
//       success: true,
//       data: patientsQuery.rows
//     });
//   } catch (error) {
//     console.error('Error fetching patients:', error);
//     const authResponse = authErrorResponse(error);
//     if (authResponse) return authResponse;
//     return NextResponse.json(
//       { success: false, message: 'Failed to fetch patients' },
//       { status: 500 }
//     );
//   }
// }

// // ==================== POST ====================

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//         requireRole(req, ['admin']);

//     const validation = validateAdminData(body, false);
//     if (!validation.success) {
//       return NextResponse.json(
//         { success: false, message: 'Validation failed', errors: validation.errors },
//         { status: 400 }
//       );
//     }

//     const data = validation.data as AdminCreateInput;
//     const patientId = generatePatientId();

//     // Insert patient
//     await query(
//       `INSERT INTO patients (
//         patient_id, full_name_en, full_name_hi, dob, gender, address, city, state, country, pincode,
//         phone, email, blood_group, registration_step, created_at, updated_at
//       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())`,
//       [
//         patientId,
//         data.fullNameEn,
//         data.fullNameHi || null,
//         data.dob,
//         data.gender,
//         data.address,
//         data.city || null,
//         data.state,
//         data.country || 'India',
//         data.pincode,
//         data.phone,
//         data.email,
//         data.blood_group || null,
//         3
//       ]
//     );

//     // Medical history
//     const firstAllergy = data.allergies[0] || '';
//     const firstCondition = data.chronicConditions[0] || '';

//     if (firstAllergy || firstCondition || data.medications) {
//       await query(
//         `INSERT INTO medical_history (patient_id, allergy, chronic_condition, medications)
//          VALUES ($1, $2, $3, $4)`,
//         [patientId, firstAllergy, firstCondition, data.medications || null]
//       );
//     }

//     // Insurance details
//     if (data.insuranceProvider || data.policyNumber || data.validUntil || data.groupId) {
//       await query(
//         `INSERT INTO insurance_details (patient_id, insurance_provider, policy_number, valid_until, group_id)
//          VALUES ($1, $2, $3, $4, $5)`,
//         [patientId, data.insuranceProvider || null, data.policyNumber || null, data.validUntil || null, data.groupId || null]
//       );
//     }

//     return NextResponse.json({
//       success: true,
//       message: 'Patient created successfully',
//       data: { patientId }
//     });
//   } catch (error) {
//     console.error('Error creating patient:', error);
//        const authResponse=authErrorResponse(error);
//     if(authResponse){
//   return authResponse
// }
//     const errorMessage = isErrorWithProperties(error) ? error.message : 'Unknown error';
//     return NextResponse.json(
//       { success: false, message: 'Failed to save patient', error: errorMessage },
//       { status: 500 }
//     );
//   }
// }

// // ==================== PUT ====================

// export async function PUT(req: Request) {
//   try {
//     const body = await req.json();
//     requireRole(req, ['admin']);

//     const validation = validateAdminData(body, true);
//     if (!validation.success) {
//       return NextResponse.json(
//         { success: false, message: 'Validation failed', errors: validation.errors },
//         { status: 400 }
//       );
//     }

//     const data = validation.data as AdminUpdateInput;

//     // Update patient
//     await query(
//       `UPDATE patients SET
//         full_name_en = $1,
//         full_name_hi = $2,
//         dob = $3,
//         gender = $4,
//         address = $5,
//         city = $6,
//         state = $7,
//         country = $8,
//         pincode = $9,
//         phone = $10,
//         email = $11,
//         blood_group = $12,
//         updated_at = NOW()
//        WHERE patient_id = $13`,
//       [
//         data.fullNameEn,
//         data.fullNameHi || null,
//         data.dob,
//         data.gender,
//         data.address,
//         data.city || null,
//         data.state,
//         data.country || 'India',
//         data.pincode,
//         data.phone,
//         data.email,
//         data.blood_group || null,
//         data.patientId
//       ]
//     );

//     const firstAllergy = data.allergies[0] || '';
//     const firstCondition = data.chronicConditions[0] || '';

//     // Upsert medical_history
//     const medHistoryExists = await query(
//       'SELECT 1 FROM medical_history WHERE patient_id = $1',
//       [data.patientId]
//     );

//     if (medHistoryExists.rows.length > 0) {
//       await query(
//         `UPDATE medical_history SET
//           allergy = $1,
//           chronic_condition = $2,
//           medications = $3
//          WHERE patient_id = $4`,
//         [firstAllergy, firstCondition, data.medications || null, data.patientId]
//       );
//     } else if (firstAllergy || firstCondition || data.medications) {
//       await query(
//         `INSERT INTO medical_history (patient_id, allergy, chronic_condition, medications)
//          VALUES ($1, $2, $3, $4)`,
//         [data.patientId, firstAllergy, firstCondition, data.medications || null]
//       );
//     }

//     // Upsert insurance_details
//     const insuranceExists = await query(
//       'SELECT 1 FROM insurance_details WHERE patient_id = $1',
//       [data.patientId]
//     );

//     if (insuranceExists.rows.length > 0) {
//       await query(
//         `UPDATE insurance_details SET
//           insurance_provider = $1,
//           policy_number = $2,
//           valid_until = $3,
//           group_id = $4
//          WHERE patient_id = $5`,
//         [data.insuranceProvider || null, data.policyNumber || null, data.validUntil || null, data.groupId || null, data.patientId]
//       );
//     } else if (data.insuranceProvider || data.policyNumber || data.validUntil || data.groupId) {
//       await query(
//         `INSERT INTO insurance_details (patient_id, insurance_provider, policy_number, valid_until, group_id)
//          VALUES ($1, $2, $3, $4, $5)`,
//         [data.patientId, data.insuranceProvider || null, data.policyNumber || null, data.validUntil || null, data.groupId || null]
//       );
//     }

//     return NextResponse.json({
//       success: true,
//       message: 'Patient updated successfully'
//     });
//   } catch (error) {
//     console.error('Error updating patient:', error);
//     const authResponse = authErrorResponse(error);
//     if (authResponse) {
//       return authResponse;
//     }
//     return NextResponse.json(
//       { success: false, message: 'Failed to update patient' },
//       { status: 500 }
//     );
//   }
// }

// // ==================== DELETE ====================


// export async function DELETE(req: Request) {
//   try {
//     requireRole(req, ['admin']);
//     const { searchParams } = new URL(req.url);
//     const patientId = searchParams.get('patientId');

//     if (!patientId) {
//       return NextResponse.json(
//         { success: false, message: 'Patient ID is required' },
//         { status: 400 }
//       );
//     }

//     const idValidation = patientIdSchema.safeParse(patientId);
//     if (!idValidation.success) {
//       return NextResponse.json(
//         { success: false, message: 'Invalid patient ID format' },
//         { status: 400 }
//       );
//     }

//     const check = await query('SELECT 1 FROM patients WHERE patient_id = $1', [patientId]);
//     if (check.rows.length === 0) {
//       return NextResponse.json(
//         { success: false, message: 'Patient not found' },
//         { status: 404 }
//       );
//     }

//     // Delete from dependent tables
//     await query('DELETE FROM medical_history WHERE patient_id = $1', [patientId]);
//     await query('DELETE FROM insurance_details WHERE patient_id = $1', [patientId]);
//     await query('DELETE FROM registrations WHERE patient_id = $1', [patientId]);
//     await query('DELETE FROM patients WHERE patient_id = $1', [patientId]);

//     return NextResponse.json({
//       success: true,
//       message: 'Patient deleted successfully'
//     });
//   } catch (error) {
//     console.error('Error deleting patient:', error);
    
//     const authResponse = authErrorResponse(error);
//     if (authResponse) {
//       return authResponse;
//     }
    
//     const err = error as { message?: string; detail?: string; code?: string };
    
//     // ✅ CHANGE THIS PART - Return the original database error
//     return NextResponse.json(
//       { 
//         success: false, 
//         message: err.message || 'Failed to delete patient',  // ← Original error message
//         error: err.message || 'Unknown error',
//         detail: err.detail || null,      // ← Key (patient_id)=... still referenced from table...
//         code: err.code || null,          // ← 23503 for foreign key violation
//         constraint: (err as any).constraint || null  // ← emergency_assessments_patient_id_fkey
//       },
//       { status: 500 }
//     );
//   }
// }




import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { z } from 'zod';
import { authErrorResponse, requireRole } from '@/lib/auth/guards';

// ============================================================
// Helpers
// ============================================================
function generatePatientId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${timestamp}${random.toString().padStart(4, '0')}`;
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

// ============================================================
// Validation Schemas (updated to match actual columns)
// ============================================================
const patientBaseSchema = z.object({
  fullNameEn: z.string().min(1, 'Full name is required'),
  fullNameHi: z.string().optional(),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  address: z.string().min(1, 'Address is required'),
  city: z.string().optional(),
  state: z.string().min(1, 'State is required'),
  country: z.string().default('India'),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional(),
  blood_group: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown']).optional(),
  allergies: z.array(z.string()).default([]),
  chronicConditions: z.array(z.string()).default([]),
  medications: z.string().default(''),
  // Insurance fields (match actual table)
  insuranceCompany: z.string().optional(),
  tpaName: z.string().optional(),
  requestedAmount: z.number().optional().default(0),
  approvedAmount: z.number().optional().default(0),
  documents: z.any().default('[]'),
  insuranceStatus: z.string().default('Pending'),
});

const adminCreateSchema = patientBaseSchema;
const adminUpdateSchema = patientBaseSchema.extend({
  patientId: z.string().regex(/^\d+$/, 'Patient ID must be numeric'),
});

type AdminCreateInput = z.infer<typeof adminCreateSchema>;
type AdminUpdateInput = z.infer<typeof adminUpdateSchema>;

function validateAdminData(data: any, isUpdate = false): { success: true; data: any } | { success: false; errors: Record<string, string> } {
  const schema = isUpdate ? adminUpdateSchema : adminCreateSchema;
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors: Record<string, string> = {};
    result.error.issues.forEach(err => {
      errors[err.path.join('.')] = err.message;
    });
    return { success: false, errors };
  }
  return { success: true, data: result.data };
}

// ============================================================
// Helper: Ensure a surgery case exists for a patient
// ============================================================
async function ensureSurgeryCase(patientId: string): Promise<string | null> {
  // Check for existing case
  const existing = await query(
    'SELECT id FROM surgery_cases WHERE patient_id = $1 LIMIT 1',
    [patientId]
  );
  if (existing.rows.length > 0) {
    return existing.rows[0].id;
  }

  // Create a dummy case (minimal required fields)
  const caseId = `CASE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const admissionId = `ADM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  try {
    await query(
      `INSERT INTO surgery_cases (
        id, patient_id, admission_id, status, current_step,
        surgery_name, diagnosis, surgery_type, expected_date,
        priority_level, estimated_duration, clinical_notes,
        recommended_by, recommended_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        caseId,
        patientId,
        admissionId,
        'Recommended',
        1,
        'Dummy surgery (auto-created)',
        'Dummy diagnosis',
        'Elective',
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        'Medium',
        60,
        'Auto-created for insurance',
        'System',
        new Date().toISOString().split('T')[0]
      ]
    );
    return caseId;
  } catch {
    return null;
  }
}

// ============================================================
// GET
// ============================================================
export async function GET(req: Request) {
  try {
    requireRole(req, ['admin', 'doctor']);
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');
    const listAll = searchParams.get('list') === 'true';
    const addedByDoctorId = searchParams.get('added_by_doctor_id');

    const baseSelect = `
      SELECT 
        p.*,
        mh.allergy,
        mh.chronic_condition,
        mh.medications,
        ins.insurance_company,
        ins.tpa_name,
        ins.requested_amount,
        ins.approved_amount,
        ins.documents,
        ins.status AS insurance_status
      FROM patients p
      LEFT JOIN medical_history mh ON p.patient_id = mh.patient_id
      LEFT JOIN insurance_details ins ON p.patient_id = ins.patient_id
    `;

    if (patientId) {
      const result = await query(baseSelect + ' WHERE p.patient_id = $1', [patientId]);
      if (result.rows.length === 0) {
        return NextResponse.json({ success: false, message: 'Patient not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: result.rows[0] });
    }

    if (addedByDoctorId) {
      const doctorIdNum = parseInt(addedByDoctorId);
      if (isNaN(doctorIdNum)) {
        return NextResponse.json({ success: false, message: 'Invalid doctor ID' }, { status: 400 });
      }
      const result = await query(
        baseSelect + ' WHERE p.added_by_doctor_id = $1 ORDER BY p.created_at DESC',
        [doctorIdNum]
      );
      return NextResponse.json({ success: true, data: result.rows });
    }

    if (listAll) {
      const result = await query(baseSelect + ' ORDER BY p.created_at DESC');
      return NextResponse.json({ success: true, data: result.rows });
    }

    // Fallback minimal list
    const result = await query(
      'SELECT patient_id, full_name_en, dob, phone, email, created_at FROM patients ORDER BY created_at DESC'
    );
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching patients:', error);
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ success: false, message: 'Failed to fetch patients' }, { status: 500 });
  }
}

// ============================================================
// POST
// ============================================================
export async function POST(req: Request) {
  try {
    const body = await req.json();
    requireRole(req, ['admin']);

    const validation = validateAdminData(body);
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
        data.phone || null,
        data.email || null,
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

    // Insurance – only if we have a surgery case
    if (data.insuranceCompany || data.tpaName) {
      const caseId = await ensureSurgeryCase(patientId);
      if (caseId) {
        await query(
          `INSERT INTO insurance_details (
            id, case_id, has_insurance, insurance_company, tpa_name,
            requested_amount, approved_amount, documents, status, patient_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            'ins_' + Math.random().toString(36).substring(2, 10),
            caseId,
            true,
            data.insuranceCompany || null,
            data.tpaName || null,
            data.requestedAmount || 0,
            data.approvedAmount || 0,
            data.documents || '[]',
            data.insuranceStatus || 'Pending',
            patientId
          ]
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Patient created successfully',
      data: { patientId }
    });
  } catch (error) {
    console.error('Error creating patient:', error);
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json(
      { success: false, message: 'Failed to save patient' },
      { status: 500 }
    );
  }
}

// ============================================================
// PUT
// ============================================================
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
        data.phone || null,
        data.email || null,
        data.blood_group || null,
        data.patientId
      ]
    );

    // Upsert medical_history
    const firstAllergy = data.allergies[0] || '';
    const firstCondition = data.chronicConditions[0] || '';
    const medExists = await query('SELECT 1 FROM medical_history WHERE patient_id = $1', [data.patientId]);
    if (medExists.rows.length > 0) {
      await query(
        `UPDATE medical_history SET allergy = $1, chronic_condition = $2, medications = $3 WHERE patient_id = $4`,
        [firstAllergy, firstCondition, data.medications || null, data.patientId]
      );
    } else if (firstAllergy || firstCondition || data.medications) {
      await query(
        `INSERT INTO medical_history (patient_id, allergy, chronic_condition, medications) VALUES ($1, $2, $3, $4)`,
        [data.patientId, firstAllergy, firstCondition, data.medications || null]
      );
    }

    // Upsert insurance
    if (data.insuranceCompany || data.tpaName) {
      const caseId = await ensureSurgeryCase(data.patientId);
      if (caseId) {
        const insExists = await query('SELECT 1 FROM insurance_details WHERE patient_id = $1', [data.patientId]);
        if (insExists.rows.length > 0) {
          await query(
            `UPDATE insurance_details SET
              insurance_company = $1,
              tpa_name = $2,
              requested_amount = $3,
              approved_amount = $4,
              documents = $5,
              status = $6
             WHERE patient_id = $7`,
            [
              data.insuranceCompany || null,
              data.tpaName || null,
              data.requestedAmount || 0,
              data.approvedAmount || 0,
              data.documents || '[]',
              data.insuranceStatus || 'Pending',
              data.patientId
            ]
          );
        } else {
          await query(
            `INSERT INTO insurance_details (
              id, case_id, has_insurance, insurance_company, tpa_name,
              requested_amount, approved_amount, documents, status, patient_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
              'ins_' + Math.random().toString(36).substring(2, 10),
              caseId,
              true,
              data.insuranceCompany || null,
              data.tpaName || null,
              data.requestedAmount || 0,
              data.approvedAmount || 0,
              data.documents || '[]',
              data.insuranceStatus || 'Pending',
              data.patientId
            ]
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Patient updated successfully'
    });
  } catch (error) {
    console.error('Error updating patient:', error);
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json(
      { success: false, message: 'Failed to update patient' },
      { status: 500 }
    );
  }
}

// ============================================================
// DELETE
// ============================================================
export async function DELETE(req: Request) {
  try {
    requireRole(req, ['admin']);
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');

    if (!patientId) {
      return NextResponse.json({ success: false, message: 'Patient ID is required' }, { status: 400 });
    }

    const check = await query('SELECT 1 FROM patients WHERE patient_id = $1', [patientId]);
    if (check.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Patient not found' }, { status: 404 });
    }

    // Delete in correct order
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
    if (authResponse) return authResponse;
    return NextResponse.json(
      { success: false, message: 'Failed to delete patient' },
      { status: 500 }
    );
  }
}