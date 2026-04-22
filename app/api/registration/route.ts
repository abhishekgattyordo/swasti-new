





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
import { createHash, createHmac, randomBytes } from 'crypto';
import { sendPatientRegistrationEmail } from '@/lib/api/email';
import { createPatientUser } from '@/lib/auth/user-provisioning';
import { requireTenant } from '@/lib/tenant';


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

function hashPasswordResetToken(token: string): string {
  const secret = process.env.INVITE_TOKEN_SECRET?.trim();
  if (secret) {
    return createHmac("sha256", secret).update(token, "utf8").digest("hex");
  }
  return createHash("sha256").update(token, "utf8").digest("hex");
}

/**
 * Generate a registration ID (REG-XXXXXX format)
 */
function generateRegistrationId(): string {
  return `REG-${Date.now().toString(36).toUpperCase()}`;
}

function buildSetupPasswordLink(token: string): string {
  const baseUrl =
    process.env.NEXTAUTH_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    "http://localhost:3000";
  return `${baseUrl.replace(/\/+$/, "")}/reset-password?token=${encodeURIComponent(token)}`;
}

function buildTenantSetupPasswordLink(token: string, tenantHost?: string | null): string {
  const host = (tenantHost || "").trim();
  if (!host) return buildSetupPasswordLink(token);

  if (host.startsWith("http://") || host.startsWith("https://")) {
    return `${host.replace(/\/+$/, "")}/reset-password?token=${encodeURIComponent(token)}`;
  }

  const isLocal = /^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(host);
  const protocol = isLocal ? "http" : "https";
  return `${protocol}://${host.replace(/\/+$/, "")}/reset-password?token=${encodeURIComponent(token)}`;
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

  // Create a bootstrap password hash; patient must set final password via emailed link.
  const bootstrapPassword = generateRandomPassword(32);
  const setupToken = randomBytes(32).toString('hex');
  const setupTokenHash = hashPasswordResetToken(setupToken);
  const setupTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

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

    // Create/update user account for patient using shared provisioning helper.
    await createPatientUser({
      email: patient.email,
      fullNameEn: patient.full_name_en,
      patientId: String(patientId),
      plainPassword: bootstrapPassword,
    });

    // Invalidate older unused reset/setup tokens, then create a fresh one.
    await client.query(
      `UPDATE password_resets
       SET used_at = NOW()
       WHERE user_id = (SELECT id FROM users WHERE email = $1 LIMIT 1)
         AND used_at IS NULL`,
      [patient.email]
    );

    await client.query(
      `INSERT INTO password_resets (user_id, token, expires_at)
       VALUES ((SELECT id FROM users WHERE email = $1 LIMIT 1), $2, $3)`,
      [patient.email, setupTokenHash, setupTokenExpiresAt]
    );
  });

  const tenantContext = await requireTenant();
  const setupPasswordLink = buildTenantSetupPasswordLink(setupToken, tenantContext.host);
  const organizationName = tenantContext.tenant.name?.trim() || 'Ordo HIS';
  await sendPatientRegistrationEmail(
    patient.email,
    setupPasswordLink,
    patient.full_name_en,
    organizationName
  );

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
      "Open the password setup link sent to your email.",
      "Set your password securely before first login.",
      "Download your digital health card",
      "Schedule your first appointment",
      "Access your health records",
    ],
    setupEmailSent: true,
  };

  // In development, return link for easier local verification.
  if (process.env.NODE_ENV !== 'production') {
    responseData.setupPasswordLink = setupPasswordLink;
  }

  return NextResponse.json(
    {
      success: true,
      message: "Registration completed successfully! A secure password setup link has been sent.",
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