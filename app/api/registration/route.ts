


// import { NextRequest, NextResponse } from 'next/server';
// import { query, transaction } from '../../../lib/db';
// import { 
//   Step1Schema, 
//   Step2Schema, 
//   Step3Schema,
//   Step1Input,
//   Step2Input,
//   Step3Input 
// } from '../../../lib/validations/registration';
// import bcrypt from 'bcrypt';
// import { randomBytes } from 'crypto';
// import { sendPasswordEmail } from '@/lib/api/email';
// import { supabaseAdmin } from '@/lib/supabaseServer';

// // ==================== HELPER FUNCTIONS ====================

// /**
//  * Generate a numeric patient ID (17 digits: timestamp + random)
//  * Returns as string to handle large numbers
//  */
// function generatePatientId(): string {
//   const timestamp = Date.now(); // 13 digits
//   const random = Math.floor(Math.random() * 10000); // 0-9999
//   const patientId = `${timestamp}${random.toString().padStart(4, '0')}`;
//   console.log('✅ Generated patient ID:', patientId);
//   return patientId;
// }

// function generateRandomPassword(length = 12): string {
//   const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
//   return Array.from(randomBytes(length))
//     .map(byte => chars[byte % chars.length])
//     .join('');
// }

// /**
//  * Generate a registration ID (REG-XXXXXX format)
//  */
// function generateRegistrationId(): string {
//   return `REG-${Date.now().toString(36).toUpperCase()}`;
// }

// // ==================== POST ENDPOINT ====================

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const step: number = body.step;

//     // Validate based on step
//     if (step === 1) {
//       const validation = Step1Schema.safeParse(body);
//       if (!validation.success) {
//         return NextResponse.json(
//           { 
//             success: false, 
//             message: "Validation failed", 
//             errors: validation.error.flatten().fieldErrors 
//           },
//           { status: 400 }
//         );
//       }
//       return handleStep1(validation.data);
//     } 
//     else if (step === 2) {
//       const validation = Step2Schema.safeParse(body);
//       if (!validation.success) {
//         return NextResponse.json(
//           { 
//             success: false, 
//             message: "Validation failed", 
//             errors: validation.error.flatten().fieldErrors 
//           },
//           { status: 400 }
//         );
//       }
//       return handleStep2(validation.data);
//     } 
//     else if (step === 3) {
//       const validation = Step3Schema.safeParse(body);
//       if (!validation.success) {
//         return NextResponse.json(
//           { 
//             success: false, 
//             message: "Validation failed", 
//             errors: validation.error.flatten().fieldErrors 
//           },
//           { status: 400 }
//         );
//       }
//       return handleStep3(validation.data);
//     } 
//     else {
//       return NextResponse.json(
//         { success: false, message: "Invalid step. Must be 1, 2, or 3" },
//         { status: 400 }
//       );
//     }
//   } catch (error) {
//     console.error("❌ Registration error:", error);
    
//     // Handle database errors
//     if (error instanceof Error && 'code' in error) {
//       if (error.code === '23505') {
//         return NextResponse.json(
//           {
//             success: false,
//             message: "Duplicate entry. This record already exists.",
//           },
//           { status: 409 }
//         );
//       }
//       if (error.code === '23503') {
//         return NextResponse.json(
//           {
//             success: false,
//             message: "Referenced record not found.",
//           },
//           { status: 400 }
//         );
//       }
//     }

//     return NextResponse.json(
//       {
//         success: false,
//         message: "An error occurred during registration",
//       },
//       { status: 500 }
//     );
//   }
// }

// // ==================== STEP HANDLERS ====================

// /**
//  * Step 1: Save personal details (including new fields)
//  */
// async function handleStep1(data: Step1Input) {
//   const { 
//     fullNameEn, 
//     fullNameHi, 
//     dob, 
//     gender, 
//     address, 
//     pincode, 
//     state,
//     city,
//     country,
//     phone,
//     email,
//     blood_group
//   } = data;

//   const patientId = generatePatientId();

//   // Insert patient data including new fields
//   await query(
//     `INSERT INTO patients 
//      (patient_id, full_name_en, full_name_hi, dob, gender, address, city, state, country, pincode, phone, email, blood_group, registration_step) 
//      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
//     [
//       patientId, 
//       fullNameEn, 
//       fullNameHi || null, 
//       dob, 
//       gender, 
//       address, 
//       city || null, 
//       state, 
//       country || 'India', 
//       pincode, 
//       phone, 
//       email, 
//       blood_group || null, 
//       1
//     ]
//   );

//   // Get the inserted patient data (including new columns)
//   const patientResult = await query(
//     `SELECT 
//       patient_id, 
//       full_name_en, 
//       full_name_hi, 
//       dob, 
//       gender, 
//       address, 
//       city,
//       state,
//       country,
//       pincode,
//       phone,
//       email,
//       blood_group,
//       registration_step, 
//       created_at, 
//       updated_at 
//      FROM patients 
//      WHERE patient_id = $1`,
//     [patientId]
//   );
  
//   const patient = patientResult.rows[0];

//   return NextResponse.json(
//     {
//       success: true,
//       message: "Personal details saved successfully",
//       data: patient
//     },
//     { status: 200 }
//   );
// }

// async function handleStep2(data: Step2Input) {
//   const { patientId, allergies, chronicConditions, medications } = data;

//   console.log('🔍 Processing Step 2 for patient:', patientId);

//   // Verify patient exists
//   const patientResult = await query(
//     'SELECT patient_id, registration_step FROM patients WHERE patient_id = $1',
//     [patientId]
//   );

//   if (patientResult.rows.length === 0) {
//     return NextResponse.json(
//       { 
//         success: false, 
//         message: `Patient with ID ${patientId} not found. Please complete step 1 first.` 
//       },
//       { status: 404 }
//     );
//   }

//   const patient = patientResult.rows[0];

//   // Check if step 1 is completed
//   if (patient.registration_step < 1) {
//     return NextResponse.json(
//       { 
//         success: false, 
//         message: "Please complete step 1 (Personal Details) first" 
//       },
//       { status: 400 }
//     );
//   }

//   // Use transaction for inserting multiple records
//   await transaction(async (client) => {
//     // Delete existing medical history for this patient (if any)
//     await client.query(
//       'DELETE FROM medical_history WHERE patient_id = $1',
//       [patientId]
//     );

//     // Insert allergies
//     for (const allergy of allergies) {
//       if (allergy?.trim()) {
//         await client.query(
//           'INSERT INTO medical_history (patient_id, allergy, chronic_condition, medications) VALUES ($1, $2, $3, $4)',
//           [patientId, allergy, '', medications || null]
//         );
//       }
//     }

//     // Insert chronic conditions
//     for (const condition of chronicConditions) {
//       if (condition?.trim()) {
//         await client.query(
//           'INSERT INTO medical_history (patient_id, allergy, chronic_condition, medications) VALUES ($1, $2, $3, $4)',
//           [patientId, '', condition, medications || null]
//         );
//       }
//     }

//     // Update patient registration step
//     await client.query(
//       'UPDATE patients SET registration_step = $1 WHERE patient_id = $2',
//       [2, patientId]
//     );
//   });

//   // Get the inserted medical history
//   const medicalHistoryResult = await query(
//     'SELECT * FROM medical_history WHERE patient_id = $1 ORDER BY id',
//     [patientId]
//   );

//   return NextResponse.json(
//     {
//       success: true,
//       message: "Medical history saved successfully",
//       data: {
//         patientId,
//         medicalHistory: medicalHistoryResult.rows,
//         updatedAt: new Date().toISOString(),
//         registrationStep: 2,
//       },
//     },
//     { status: 200 }
//   );
// }

// async function handleStep3(data: Step3Input) {
//   const { patientId, insuranceProvider, policyNumber, validUntil, groupId } = data;

//   console.log('🔍 Processing Step 3 for patient:', patientId);

//   // Verify patient exists and get current step & email
//   const patientResult = await query(
//     'SELECT patient_id, registration_step, email, full_name_en FROM patients WHERE patient_id = $1',
//     [patientId]
//   );

//   if (patientResult.rows.length === 0) {
//     return NextResponse.json(
//       { success: false, message: `Patient with ID ${patientId} not found. Please complete steps 1 and 2 first.` },
//       { status: 404 }
//     );
//   }

//   const patient = patientResult.rows[0];

//   if (patient.registration_step < 2) {
//     return NextResponse.json(
//       { success: false, message: "Please complete steps 1 (Personal Details) and 2 (Medical History) first" },
//       { status: 400 }
//     );
//   }

//   const registrationId = generateRegistrationId();

//   // Use transaction for final registration
//   await transaction(async (client) => {
//     // Delete existing insurance details for this patient (if any)
//     await client.query(
//       'DELETE FROM insurance_details WHERE patient_id = $1',
//       [patientId]
//     );

//     await client.query(
//       `INSERT INTO insurance_details 
//        (patient_id, insurance_provider, policy_number, valid_until, group_id) 
//        VALUES ($1, $2, $3, $4, $5)`,
//       [patientId, insuranceProvider || null, policyNumber || null, validUntil || null, groupId || null]
//     );

//     // Update patient registration step to completed
//     await client.query(
//       'UPDATE patients SET registration_step = $1 WHERE patient_id = $2',
//       [3, patientId]
//     );

//     // Delete existing registration for this patient (if any)
//     await client.query(
//       'DELETE FROM registrations WHERE patient_id = $1',
//       [patientId]
//     );

//     // Insert into completed registrations
//     await client.query(
//       `INSERT INTO registrations 
//        (patient_id, registration_id, status, completed_at) 
//        VALUES ($1, $2, $3, NOW())`,
//       [patientId, registrationId, 'ACTIVE']
//     );

//     // --- Supabase Auth: Create/update user via invite ---
//     // First, check if a user already exists in our `users` table (maybe from a previous attempt)
//     const existingUser = await client.query(
//       'SELECT id, auth_user_id FROM users WHERE email = $1',
//       [patient.email]
//     );

//     let authUserId: string | null = null;

//     if (existingUser.rows.length > 0) {
//       // If user exists, we may need to re‑send invite if they haven't set a password yet.
//       // We'll just update the record and send a new invite.
//       authUserId = existingUser.rows[0].auth_user_id;
//       // We'll update the user's full name and link to patient.
//       await client.query(
//         `UPDATE users 
//          SET full_name_en = $1, patient_id = $2, role = 'patient', updated_at = NOW()
//          WHERE email = $3`,
//         [patient.full_name_en, patientId, patient.email]
//       );
//     } else {
//       // Create a placeholder record in our users table with auth_user_id NULL for now.
//       await client.query(
//         `INSERT INTO users (email, full_name_en, role, patient_id, created_at, updated_at)
//          VALUES ($1, $2, $3, $4, NOW(), NOW())`,
//         [patient.email, patient.full_name_en, 'patient', patientId]
//       );
//     }

//     // Now, send an invitation via Supabase Auth
//     // This will send an email to the user with a link to set a password.
//   const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
//   patient.email,
//   {
//     redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
//     data: {
//       full_name: patient.full_name_en,
//       patient_id: patientId,
//     },
//   }
// );

//     if (inviteError) {
//       console.error('Supabase invite error:', inviteError);
//       throw new Error(`Failed to send invitation: ${inviteError.message}`);
//     }

//     // The invite returns the user object with the auth user id.
//     const invitedUser = inviteData.user;
//     authUserId = invitedUser.id;

//     // Update our users table with the auth_user_id
//     await client.query(
//       `UPDATE users SET auth_user_id = $1 WHERE email = $2`,
//       [authUserId, patient.email]
//     );
//   });

//   // Fetch complete registration data (same as before)
//   const registrationResult = await query(
//     `SELECT 
//       p.patient_id,
//       p.full_name_en,
//       p.full_name_hi,
//       p.dob,
//       p.gender,
//       p.address,
//       p.city,
//       p.state,
//       p.country,
//       p.pincode,
//       p.phone,
//       p.email,
//       p.blood_group,
//       p.registration_step,
//       p.created_at,
//       p.updated_at,
//       i.insurance_provider,
//       i.policy_number,
//       i.valid_until,
//       i.group_id,
//       r.registration_id,
//       r.status as registration_status,
//       r.completed_at
//      FROM patients p
//      LEFT JOIN insurance_details i ON p.patient_id = i.patient_id
//      LEFT JOIN registrations r ON p.patient_id = r.patient_id
//      WHERE p.patient_id = $1`,
//     [patientId]
//   );
  
//   const registration = registrationResult.rows[0];

//   const responseData = {
//     ...registration,
//     registrationStep: 3,
//     completed: true,
//     nextSteps: [
//       "Check your email for a magic link to set your password.",
//       "After setting your password, log in to access your account.",
//       "Download your digital health card",
//       "Schedule your first appointment",
//       "Access your health records",
//     ],
//   };

//   return NextResponse.json(
//     {
//       success: true,
//       message: "Registration completed successfully! A magic link has been sent to your email to set your password.",
//       data: responseData,
//     },
//     { status: 200 }
//   );
// }

// // ==================== GET ENDPOINT ====================

// export async function GET(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const patientId = searchParams.get('patientId');
//     const phone = searchParams.get('phone');
//     const listAll = searchParams.get('list') === 'true';

//     // 1. List all patients
//     if (listAll) {
//       const result = await query(`
//         SELECT jsonb_agg(
//           jsonb_build_object(
//             'patient_id', p.patient_id::text,
//             'full_name_en', p.full_name_en,
//             'full_name_hi', p.full_name_hi,
//             'dob', p.dob,
//             'gender', p.gender,
//             'address', p.address,
//             'city', p.city,
//             'state', p.state,
//             'country', p.country,
//             'pincode', p.pincode,
//             'phone', p.phone,
//             'email', p.email,
//             'blood_group', p.blood_group,
//             'registration_step', p.registration_step,
//             'created_at', p.created_at,
//             'updated_at', p.updated_at,
//             'insurance_provider', i.insurance_provider,
//             'policy_number', i.policy_number,
//             'valid_until', i.valid_until,
//             'group_id', i.group_id,
//             'registration_id', r.registration_id,
//             'registration_status', r.status,
//             'completed_at', r.completed_at,
//             'medical_history', COALESCE((
//               SELECT jsonb_agg(
//                 jsonb_build_object(
//                   'allergy', mh.allergy,
//                   'chronic_condition', mh.chronic_condition,
//                   'medications', mh.medications,
//                   'recorded_at', mh.created_at
//                 )
//               )
//               FROM medical_history mh
//               WHERE mh.patient_id = p.patient_id
//             ), '[]'::jsonb)
//           )
//           ORDER BY r.created_at DESC
//         ) as data
//         FROM patients p
//         LEFT JOIN insurance_details i ON p.patient_id = i.patient_id
//         LEFT JOIN registrations r ON p.patient_id = r.patient_id
//       `);

//       return NextResponse.json({
//         success: true,
//         data: result.rows[0]?.data || [],
//       });
//     }

//     // 2. Search by phone number
//     if (phone) {
//       const trimmedPhone = phone.trim();
//       // Extract only digits from the input
//       const digitsOnly = trimmedPhone.replace(/[^0-9]/g, '');

//       if (digitsOnly.length === 0) {
//         return NextResponse.json(
//           { success: false, message: "Invalid phone number" },
//           { status: 400 }
//         );
//       }

//       console.log("Searching for phone (exact):", trimmedPhone);
//       console.log("Searching for phone (digits):", digitsOnly);

//       // First try exact match (fast)
//       let result = await query(`
//         SELECT jsonb_agg(
//           jsonb_build_object(
//             'patient_id', p.patient_id::text,
//             'full_name_en', p.full_name_en,
//             'full_name_hi', p.full_name_hi,
//             'dob', p.dob,
//             'gender', p.gender,
//             'address', p.address,
//             'city', p.city,
//             'state', p.state,
//             'country', p.country,
//             'pincode', p.pincode,
//             'phone', p.phone,
//             'email', p.email,
//             'blood_group', p.blood_group,
//             'registration_step', p.registration_step,
//             'created_at', p.created_at,
//             'updated_at', p.updated_at,
//             'insurance_provider', i.insurance_provider,
//             'policy_number', i.policy_number,
//             'valid_until', i.valid_until,
//             'group_id', i.group_id,
//             'registration_id', r.registration_id,
//             'registration_status', r.status,
//             'completed_at', r.completed_at,
//             'medical_history', COALESCE((
//               SELECT jsonb_agg(
//                 jsonb_build_object(
//                   'allergy', mh.allergy,
//                   'chronic_condition', mh.chronic_condition,
//                   'medications', mh.medications,
//                   'recorded_at', mh.created_at
//                 )
//               )
//               FROM medical_history mh
//               WHERE mh.patient_id = p.patient_id
//             ), '[]'::jsonb)
//           )
//         ) as data
//         FROM patients p
//         LEFT JOIN insurance_details i ON p.patient_id = i.patient_id
//         LEFT JOIN registrations r ON p.patient_id = r.patient_id
//         WHERE p.phone = $1
//       `, [trimmedPhone]);

//       // If no exact match, try matching by digits only
//       if (!result.rows.length || !result.rows[0].data) {
//         result = await query(`
//           SELECT jsonb_agg(
//             jsonb_build_object(
//               'patient_id', p.patient_id::text,
//               'full_name_en', p.full_name_en,
//               'full_name_hi', p.full_name_hi,
//               'dob', p.dob,
//               'gender', p.gender,
//               'address', p.address,
//               'city', p.city,
//               'state', p.state,
//               'country', p.country,
//               'pincode', p.pincode,
//               'phone', p.phone,
//               'email', p.email,
//               'blood_group', p.blood_group,
//               'registration_step', p.registration_step,
//               'created_at', p.created_at,
//               'updated_at', p.updated_at,
//               'insurance_provider', i.insurance_provider,
//               'policy_number', i.policy_number,
//               'valid_until', i.valid_until,
//               'group_id', i.group_id,
//               'registration_id', r.registration_id,
//               'registration_status', r.status,
//               'completed_at', r.completed_at,
//               'medical_history', COALESCE((
//                 SELECT jsonb_agg(
//                   jsonb_build_object(
//                     'allergy', mh.allergy,
//                     'chronic_condition', mh.chronic_condition,
//                     'medications', mh.medications,
//                     'recorded_at', mh.created_at
//                   )
//                 )
//                 FROM medical_history mh
//                 WHERE mh.patient_id = p.patient_id
//               ), '[]'::jsonb)
//             )
//           ) as data
//           FROM patients p
//           LEFT JOIN insurance_details i ON p.patient_id = i.patient_id
//           LEFT JOIN registrations r ON p.patient_id = r.patient_id
//           WHERE regexp_replace(p.phone, '[^0-9]', '', 'g') = $1
//         `, [digitsOnly]);
//       }

//       if (result.rows.length === 0 || !result.rows[0].data) {
//         return NextResponse.json(
//           { success: false, message: `No patients found with phone: ${trimmedPhone}` },
//           { status: 404 }
//         );
//       }

//       return NextResponse.json({
//         success: true,
//         data: result.rows[0].data,
//       });
//     }

//     // 3. Get by patient ID (existing logic)
//     if (!patientId) {
//       return NextResponse.json(
//         { success: false, message: "patientId or phone is required." },
//         { status: 400 }
//       );
//     }

//     if (!/^\d+$/.test(patientId)) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid patientId format. Patient ID must contain only digits (0-9)."
//         },
//         { status: 400 }
//       );
//     }

//     const queryStr = `
//       SELECT 
//         jsonb_build_object(
//           'patient_id', p.patient_id::text,
//           'full_name_en', p.full_name_en,
//           'full_name_hi', p.full_name_hi,
//           'dob', p.dob,
//           'gender', p.gender,
//           'address', p.address,
//           'city', p.city,
//           'state', p.state,
//           'country', p.country,
//           'pincode', p.pincode,
//           'phone', p.phone,
//           'email', p.email,
//           'blood_group', p.blood_group,
//           'registration_step', p.registration_step,
//           'created_at', p.created_at,
//           'updated_at', p.updated_at,
//           'insurance_provider', i.insurance_provider,
//           'policy_number', i.policy_number,
//           'valid_until', i.valid_until,
//           'group_id', i.group_id,
//           'registration_id', r.registration_id,
//           'registration_status', r.status,
//           'completed_at', r.completed_at,
//           'medical_history', COALESCE(
//             (
//               SELECT jsonb_agg(
//                 jsonb_build_object(
//                   'allergy', mh.allergy,
//                   'chronic_condition', mh.chronic_condition,
//                   'medications', mh.medications,
//                   'recorded_at', mh.created_at
//                 )
//               )
//               FROM medical_history mh
//               WHERE mh.patient_id = p.patient_id
//             ),
//             '[]'::jsonb
//           )
//         ) as data
//       FROM patients p
//       LEFT JOIN insurance_details i ON p.patient_id = i.patient_id
//       LEFT JOIN registrations r ON p.patient_id = r.patient_id
//       WHERE p.patient_id = $1`;

//     const registrationResult = await query(queryStr, [patientId]);

//     if (registrationResult.rows.length === 0) {
//       return NextResponse.json(
//         { success: false, message: `No registration found with patient ID: ${patientId}` },
//         { status: 404 }
//       );
//     }

//     const patientData = registrationResult.rows[0].data;

//     return NextResponse.json({
//       success: true,
//       data: patientData
//     });

//   } catch (error) {
//     console.error("❌ Error fetching registration:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         message: "An error occurred while fetching registration",
//       },
//       { status: 500 }
//     );
//   }
// }





import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '../../../lib/db';
import { 
  Step1Schema, 
  Step2Schema, 
  Step3Schema,
  Step1Input,
  Step2Input,
  Step3Input 
} from '../../../lib/validations/registration';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { sendPasswordEmail } from '@/lib/api/email';
import { supabaseAdmin } from '@/lib/supabaseServer';

// ==================== HELPER FUNCTIONS ====================

/**
 * Generate a numeric patient ID (17 digits: timestamp + random)
 * Returns as string to handle large numbers
 */
function generatePatientId(): string {
  const timestamp = Date.now(); // 13 digits
  const random = Math.floor(Math.random() * 10000); // 0-9999
  const patientId = `${timestamp}${random.toString().padStart(4, '0')}`;
  console.log('✅ Generated patient ID:', patientId);
  return patientId;
}

function generateRandomPassword(length = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  return Array.from(randomBytes(length))
    .map(byte => chars[byte % chars.length])
    .join('');
}

/**
 * Generate a registration ID (REG-XXXXXX format)
 */
function generateRegistrationId(): string {
  return `REG-${Date.now().toString(36).toUpperCase()}`;
}

// ==================== POST ENDPOINT ====================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const step: number = body.step;

    // Validate based on step
    if (step === 1) {
      const validation = Step1Schema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Validation failed", 
            errors: validation.error.flatten().fieldErrors 
          },
          { status: 400 }
        );
      }
      return handleStep1(validation.data);
    } 
    else if (step === 2) {
      const validation = Step2Schema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Validation failed", 
            errors: validation.error.flatten().fieldErrors 
          },
          { status: 400 }
        );
      }
      return handleStep2(validation.data);
    } 
    else if (step === 3) {
      const validation = Step3Schema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Validation failed", 
            errors: validation.error.flatten().fieldErrors 
          },
          { status: 400 }
        );
      }
      return handleStep3(validation.data);
    } 
    else {
      return NextResponse.json(
        { success: false, message: "Invalid step. Must be 1, 2, or 3" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("❌ Registration error:", error);
    
    // Handle database errors
    if (error instanceof Error && 'code' in error) {
      if (error.code === '23505') {
        return NextResponse.json(
          {
            success: false,
            message: "Duplicate entry. This record already exists.",
          },
          { status: 409 }
        );
      }
      if (error.code === '23503') {
        return NextResponse.json(
          {
            success: false,
            message: "Referenced record not found.",
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "An error occurred during registration",
      },
      { status: 500 }
    );
  }
}

// ==================== STEP HANDLERS ====================

/**
 * Step 1: Save personal details (including new fields)
 */
async function handleStep1(data: Step1Input) {
  const { 
    fullNameEn, 
    fullNameHi, 
    dob, 
    gender, 
    address, 
    pincode, 
    state,
    city,
    country,
    phone,
    email,
    blood_group
  } = data;

  const patientId = generatePatientId();

  // Insert patient data including new fields
  await query(
    `INSERT INTO patients 
     (patient_id, full_name_en, full_name_hi, dob, gender, address, city, state, country, pincode, phone, email, blood_group, registration_step) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
    [
      patientId, 
      fullNameEn, 
      fullNameHi || null, 
      dob, 
      gender, 
      address, 
      city || null, 
      state, 
      country || 'India', 
      pincode, 
      phone, 
      email, 
      blood_group || null, 
      1
    ]
  );

  // Get the inserted patient data (including new columns)
  const patientResult = await query(
    `SELECT 
      patient_id, 
      full_name_en, 
      full_name_hi, 
      dob, 
      gender, 
      address, 
      city,
      state,
      country,
      pincode,
      phone,
      email,
      blood_group,
      registration_step, 
      created_at, 
      updated_at 
     FROM patients 
     WHERE patient_id = $1`,
    [patientId]
  );
  
  const patient = patientResult.rows[0];

  return NextResponse.json(
    {
      success: true,
      message: "Personal details saved successfully",
      data: patient
    },
    { status: 200 }
  );
}

async function handleStep2(data: Step2Input) {
  const { patientId, allergies, chronicConditions, medications } = data;

  console.log('🔍 Processing Step 2 for patient:', patientId);

  // Verify patient exists
  const patientResult = await query(
    'SELECT patient_id, registration_step FROM patients WHERE patient_id = $1',
    [patientId]
  );

  if (patientResult.rows.length === 0) {
    return NextResponse.json(
      { 
        success: false, 
        message: `Patient with ID ${patientId} not found. Please complete step 1 first.` 
      },
      { status: 404 }
    );
  }

  const patient = patientResult.rows[0];

  // Check if step 1 is completed
  if (patient.registration_step < 1) {
    return NextResponse.json(
      { 
        success: false, 
        message: "Please complete step 1 (Personal Details) first" 
      },
      { status: 400 }
    );
  }

  // Use transaction for inserting multiple records
  await transaction(async (client) => {
    // Delete existing medical history for this patient (if any)
    await client.query(
      'DELETE FROM medical_history WHERE patient_id = $1',
      [patientId]
    );

    // Insert allergies
    for (const allergy of allergies) {
      if (allergy?.trim()) {
        await client.query(
          'INSERT INTO medical_history (patient_id, allergy, chronic_condition, medications) VALUES ($1, $2, $3, $4)',
          [patientId, allergy, '', medications || null]
        );
      }
    }

    // Insert chronic conditions
    for (const condition of chronicConditions) {
      if (condition?.trim()) {
        await client.query(
          'INSERT INTO medical_history (patient_id, allergy, chronic_condition, medications) VALUES ($1, $2, $3, $4)',
          [patientId, '', condition, medications || null]
        );
      }
    }

    // Update patient registration step
    await client.query(
      'UPDATE patients SET registration_step = $1 WHERE patient_id = $2',
      [2, patientId]
    );
  });

  // Get the inserted medical history
  const medicalHistoryResult = await query(
    'SELECT * FROM medical_history WHERE patient_id = $1 ORDER BY id',
    [patientId]
  );

  return NextResponse.json(
    {
      success: true,
      message: "Medical history saved successfully",
      data: {
        patientId,
        medicalHistory: medicalHistoryResult.rows,
        updatedAt: new Date().toISOString(),
        registrationStep: 2,
      },
    },
    { status: 200 }
  );
}

async function handleStep3(data: Step3Input) {
  const { patientId, insuranceProvider, policyNumber, validUntil, groupId } = data;

  console.log('🔍 Processing Step 3 for patient:', patientId);

  // Verify patient exists and get current step & email
  const patientResult = await query(
    'SELECT patient_id, registration_step, email, full_name_en FROM patients WHERE patient_id = $1',
    [patientId]
  );

  if (patientResult.rows.length === 0) {
    return NextResponse.json(
      { success: false, message: `Patient with ID ${patientId} not found. Please complete steps 1 and 2 first.` },
      { status: 404 }
    );
  }

  const patient = patientResult.rows[0];

  if (patient.registration_step < 2) {
    return NextResponse.json(
      { success: false, message: "Please complete steps 1 (Personal Details) and 2 (Medical History) first" },
      { status: 400 }
    );
  }

  const registrationId = generateRegistrationId();

  // Generate a random password
  const plainPassword = generateRandomPassword(12);
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // Log the password to the terminal (for testing)
  console.log('🔑 Generated password for', patient.email, ':', plainPassword);

  // Use transaction for final registration
  await transaction(async (client) => {
    // Delete existing insurance details for this patient (if any)
    await client.query(
      'DELETE FROM insurance_details WHERE patient_id = $1',
      [patientId]
    );

    await client.query(
      `INSERT INTO insurance_details 
       (patient_id, insurance_provider, policy_number, valid_until, group_id) 
       VALUES ($1, $2, $3, $4, $5)`,
      [patientId, insuranceProvider || null, policyNumber || null, validUntil || null, groupId || null]
    );

    // Update patient registration step to completed
    await client.query(
      'UPDATE patients SET registration_step = $1 WHERE patient_id = $2',
      [3, patientId]
    );

    // Delete existing registration for this patient (if any)
    await client.query(
      'DELETE FROM registrations WHERE patient_id = $1',
      [patientId]
    );

    // Insert into completed registrations
    await client.query(
      `INSERT INTO registrations 
       (patient_id, registration_id, status, completed_at) 
       VALUES ($1, $2, $3, NOW())`,
      [patientId, registrationId, 'ACTIVE']
    );

    // Create/update user account for the patient with the generated password
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [patient.email]
    );

    if (existingUser.rows.length > 0) {
      // Update existing user with the new password and link to patient
      await client.query(
        `UPDATE users 
         SET password = $1, patient_id = $2, full_name_en = $3, role = 'patient', updated_at = NOW()
         WHERE email = $4`,
        [hashedPassword, patientId, patient.full_name_en, patient.email]
      );
    } else {
      await client.query(
        `INSERT INTO users (email, password, full_name_en, role, patient_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
        [patient.email, hashedPassword, patient.full_name_en, 'patient', patientId]
      );
    }
  });

  // Fetch complete registration data (same as before)
  const registrationResult = await query(
    `SELECT 
      p.patient_id,
      p.full_name_en,
      p.full_name_hi,
      p.dob,
      p.gender,
      p.address,
      p.city,
      p.state,
      p.country,
      p.pincode,
      p.phone,
      p.email,
      p.blood_group,
      p.registration_step,
      p.created_at,
      p.updated_at,
      i.insurance_provider,
      i.policy_number,
      i.valid_until,
      i.group_id,
      r.registration_id,
      r.status as registration_status,
      r.completed_at
     FROM patients p
     LEFT JOIN insurance_details i ON p.patient_id = i.patient_id
     LEFT JOIN registrations r ON p.patient_id = r.patient_id
     WHERE p.patient_id = $1`,
    [patientId]
  );
  
  const registration = registrationResult.rows[0];

  const responseData = {
    ...registration,
    registrationStep: 3,
    completed: true,
    nextSteps: [
      "Check the terminal for your password.",
      "Log in using your email and the password shown in the console.",
      "Download your digital health card",
      "Schedule your first appointment",
      "Access your health records",
    ],
  };

  // In development, include the plain password in the response
  if (process.env.NODE_ENV !== 'production') {
    responseData.generatedPassword = plainPassword;
  }

  return NextResponse.json(
    {
      success: true,
      message: "Registration completed successfully! A password has been generated. Check the terminal or response.",
      data: responseData,
    },
    { status: 200 }
  );
}

// ==================== GET ENDPOINT ====================

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');
    const phone = searchParams.get('phone');
    const listAll = searchParams.get('list') === 'true';

    // 1. List all patients
    if (listAll) {
      const result = await query(`
        SELECT jsonb_agg(
          jsonb_build_object(
            'patient_id', p.patient_id::text,
            'full_name_en', p.full_name_en,
            'full_name_hi', p.full_name_hi,
            'dob', p.dob,
            'gender', p.gender,
            'address', p.address,
            'city', p.city,
            'state', p.state,
            'country', p.country,
            'pincode', p.pincode,
            'phone', p.phone,
            'email', p.email,
            'blood_group', p.blood_group,
            'registration_step', p.registration_step,
            'created_at', p.created_at,
            'updated_at', p.updated_at,
            'insurance_provider', i.insurance_provider,
            'policy_number', i.policy_number,
            'valid_until', i.valid_until,
            'group_id', i.group_id,
            'registration_id', r.registration_id,
            'registration_status', r.status,
            'completed_at', r.completed_at,
            'medical_history', COALESCE((
              SELECT jsonb_agg(
                jsonb_build_object(
                  'allergy', mh.allergy,
                  'chronic_condition', mh.chronic_condition,
                  'medications', mh.medications,
                  'recorded_at', mh.created_at
                )
              )
              FROM medical_history mh
              WHERE mh.patient_id = p.patient_id
            ), '[]'::jsonb)
          )
          ORDER BY r.created_at DESC
        ) as data
        FROM patients p
        LEFT JOIN insurance_details i ON p.patient_id = i.patient_id
        LEFT JOIN registrations r ON p.patient_id = r.patient_id
      `);

      return NextResponse.json({
        success: true,
        data: result.rows[0]?.data || [],
      });
    }

    // 2. Search by phone number
    if (phone) {
      const trimmedPhone = phone.trim();
      // Extract only digits from the input
      const digitsOnly = trimmedPhone.replace(/[^0-9]/g, '');

      if (digitsOnly.length === 0) {
        return NextResponse.json(
          { success: false, message: "Invalid phone number" },
          { status: 400 }
        );
      }

      console.log("Searching for phone (exact):", trimmedPhone);
      console.log("Searching for phone (digits):", digitsOnly);

      // First try exact match (fast)
      let result = await query(`
        SELECT jsonb_agg(
          jsonb_build_object(
            'patient_id', p.patient_id::text,
            'full_name_en', p.full_name_en,
            'full_name_hi', p.full_name_hi,
            'dob', p.dob,
            'gender', p.gender,
            'address', p.address,
            'city', p.city,
            'state', p.state,
            'country', p.country,
            'pincode', p.pincode,
            'phone', p.phone,
            'email', p.email,
            'blood_group', p.blood_group,
            'registration_step', p.registration_step,
            'created_at', p.created_at,
            'updated_at', p.updated_at,
            'insurance_provider', i.insurance_provider,
            'policy_number', i.policy_number,
            'valid_until', i.valid_until,
            'group_id', i.group_id,
            'registration_id', r.registration_id,
            'registration_status', r.status,
            'completed_at', r.completed_at,
            'medical_history', COALESCE((
              SELECT jsonb_agg(
                jsonb_build_object(
                  'allergy', mh.allergy,
                  'chronic_condition', mh.chronic_condition,
                  'medications', mh.medications,
                  'recorded_at', mh.created_at
                )
              )
              FROM medical_history mh
              WHERE mh.patient_id = p.patient_id
            ), '[]'::jsonb)
          )
        ) as data
        FROM patients p
        LEFT JOIN insurance_details i ON p.patient_id = i.patient_id
        LEFT JOIN registrations r ON p.patient_id = r.patient_id
        WHERE p.phone = $1
      `, [trimmedPhone]);

      // If no exact match, try matching by digits only
      if (!result.rows.length || !result.rows[0].data) {
        result = await query(`
          SELECT jsonb_agg(
            jsonb_build_object(
              'patient_id', p.patient_id::text,
              'full_name_en', p.full_name_en,
              'full_name_hi', p.full_name_hi,
              'dob', p.dob,
              'gender', p.gender,
              'address', p.address,
              'city', p.city,
              'state', p.state,
              'country', p.country,
              'pincode', p.pincode,
              'phone', p.phone,
              'email', p.email,
              'blood_group', p.blood_group,
              'registration_step', p.registration_step,
              'created_at', p.created_at,
              'updated_at', p.updated_at,
              'insurance_provider', i.insurance_provider,
              'policy_number', i.policy_number,
              'valid_until', i.valid_until,
              'group_id', i.group_id,
              'registration_id', r.registration_id,
              'registration_status', r.status,
              'completed_at', r.completed_at,
              'medical_history', COALESCE((
                SELECT jsonb_agg(
                  jsonb_build_object(
                    'allergy', mh.allergy,
                    'chronic_condition', mh.chronic_condition,
                    'medications', mh.medications,
                    'recorded_at', mh.created_at
                  )
                )
                FROM medical_history mh
                WHERE mh.patient_id = p.patient_id
              ), '[]'::jsonb)
            )
          ) as data
          FROM patients p
          LEFT JOIN insurance_details i ON p.patient_id = i.patient_id
          LEFT JOIN registrations r ON p.patient_id = r.patient_id
          WHERE regexp_replace(p.phone, '[^0-9]', '', 'g') = $1
        `, [digitsOnly]);
      }

      if (result.rows.length === 0 || !result.rows[0].data) {
        return NextResponse.json(
          { success: false, message: `No patients found with phone: ${trimmedPhone}` },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: result.rows[0].data,
      });
    }

    // 3. Get by patient ID (existing logic)
    if (!patientId) {
      return NextResponse.json(
        { success: false, message: "patientId or phone is required." },
        { status: 400 }
      );
    }

    if (!/^\d+$/.test(patientId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid patientId format. Patient ID must contain only digits (0-9)."
        },
        { status: 400 }
      );
    }

    const queryStr = `
      SELECT 
        jsonb_build_object(
          'patient_id', p.patient_id::text,
          'full_name_en', p.full_name_en,
          'full_name_hi', p.full_name_hi,
          'dob', p.dob,
          'gender', p.gender,
          'address', p.address,
          'city', p.city,
          'state', p.state,
          'country', p.country,
          'pincode', p.pincode,
          'phone', p.phone,
          'email', p.email,
          'blood_group', p.blood_group,
          'registration_step', p.registration_step,
          'created_at', p.created_at,
          'updated_at', p.updated_at,
          'insurance_provider', i.insurance_provider,
          'policy_number', i.policy_number,
          'valid_until', i.valid_until,
          'group_id', i.group_id,
          'registration_id', r.registration_id,
          'registration_status', r.status,
          'completed_at', r.completed_at,
          'medical_history', COALESCE(
            (
              SELECT jsonb_agg(
                jsonb_build_object(
                  'allergy', mh.allergy,
                  'chronic_condition', mh.chronic_condition,
                  'medications', mh.medications,
                  'recorded_at', mh.created_at
                )
              )
              FROM medical_history mh
              WHERE mh.patient_id = p.patient_id
            ),
            '[]'::jsonb
          )
        ) as data
      FROM patients p
      LEFT JOIN insurance_details i ON p.patient_id = i.patient_id
      LEFT JOIN registrations r ON p.patient_id = r.patient_id
      WHERE p.patient_id = $1`;

    const registrationResult = await query(queryStr, [patientId]);

    if (registrationResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: `No registration found with patient ID: ${patientId}` },
        { status: 404 }
      );
    }

    const patientData = registrationResult.rows[0].data;

    return NextResponse.json({
      success: true,
      data: patientData
    });

  } catch (error) {
    console.error("❌ Error fetching registration:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while fetching registration",
      },
      { status: 500 }
    );
  }
}