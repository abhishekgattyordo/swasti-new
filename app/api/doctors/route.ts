import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { z } from 'zod';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { CreateDoctorSchema } from '@/lib/validations/doctor'; 
import { supabaseAdmin } from '@/lib/supabaseServer';


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const specialty = searchParams.get('specialty');
    const department = searchParams.get('department');
    const search = searchParams.get('search');

    let sql = `
      SELECT 
        id, 
        first_name as "firstName", 
        last_name as "lastName", 
        email, 
        phone, 
        specialty, 
        department, 
        license_number as "licenseNumber",
        date_of_birth as "dateOfBirth",
        date_joined as "dateJoined",
        address,
        city,
        state,
        zip_code as "zipCode",
        country,
        qualifications,
        experience,
        bio,
        status,
        avatar,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM doctors 
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      sql += ` AND status = $${params.length + 1}`;
      params.push(status);
    }

    if (specialty) {
      sql += ` AND specialty = $${params.length + 1}`;
      params.push(specialty);
    }

    if (department) {
      sql += ` AND department = $${params.length + 1}`;
      params.push(department);
    }

    if (search) {
      sql += ` AND (
        first_name ILIKE $${params.length + 1} OR 
        last_name ILIKE $${params.length + 1} OR 
        email ILIKE $${params.length + 1} OR
        license_number ILIKE $${params.length + 1}
      )`;
      params.push(`%${search}%`);
    }

    sql += ` ORDER BY first_name, last_name`;

    const result = await query(sql, params);
    
    return NextResponse.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Error fetching doctors:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch doctors' },
      { status: 500 }
    );
  }
}




// export async function POST(req: NextRequest) {
//   console.log('📥 POST /api/doctors - Starting request');
//   console.log('Content-Type:', req.headers.get('content-type'));

//   // Try to read raw body for debugging
//   try {
//     const clone = req.clone();
//     const rawText = await clone.text();
//     console.log('Raw request body:', rawText);
//   } catch (e) {
//     console.log('Could not read raw body');
//   }

//   try {
//     let doctorData: any = {};
//     let avatarPath: string | null = null;
//     const contentType = req.headers.get('content-type') || '';

//     if (contentType.includes('multipart/form-data')) {
//       const formData = await req.formData();
//       console.log('Received formData keys:', Array.from(formData.keys()));

//       const qualifications: string[] = [];
      
//       for (const [key, value] of formData.entries()) {
//         if (key === 'qualifications[]') {
//           qualifications.push(value.toString());
//         } else if (key !== 'avatar') {
//           doctorData[key] = value;
//         }
//       }
      
//       doctorData.qualifications = qualifications;

//       // Handle file upload
//       const avatarFile = formData.get('avatar') as File | null;
//       if (avatarFile) {
//         try {
//           const bytes = await avatarFile.arrayBuffer();
//           const buffer = Buffer.from(bytes);
          
//           const timestamp = Date.now();
//           const filename = `${timestamp}-${avatarFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
          
//           const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'doctors');
//           if (!existsSync(uploadDir)) {
//             await mkdir(uploadDir, { recursive: true });
//           }
          
//           const filePath = path.join(uploadDir, filename);
//           await writeFile(filePath, buffer);
          
//           avatarPath = `/uploads/doctors/${filename}`;
//         } catch (fileError) {
//           console.error('Error saving avatar:', fileError);
//         }
//       }
//     } else {
//       // Assume JSON
//       try {
//         doctorData = await req.json();
//         console.log('Parsed JSON:', doctorData);
//       } catch (jsonError) {
//         console.error('JSON parsing error:', jsonError);
//         return NextResponse.json(
//           { success: false, message: 'Invalid JSON payload' },
//           { status: 400 }
//         );
//       }
//     }

//     // Ensure qualifications is an array
//     if (!doctorData.qualifications) {
//       doctorData.qualifications = [];
//     } else if (typeof doctorData.qualifications === 'string') {
//       doctorData.qualifications = [doctorData.qualifications];
//     }

//     // Validate with Zod
//     const validation = CreateDoctorSchema.safeParse(doctorData);
    
//     if (!validation.success) {
//       console.log('Validation errors:', validation.error.flatten().fieldErrors);
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: 'Validation failed', 
//           errors: validation.error.flatten().fieldErrors 
//         },
//         { status: 400 }
//       );
//     }

//     const data = validation.data;
//     console.log('Validated data:', data);

//     // Check if email already exists
//     const emailCheck = await query(
//       'SELECT id FROM doctors WHERE email = $1',
//       [data.email]
//     );

//     if (emailCheck.rows.length > 0) {
//       return NextResponse.json(
//         { success: false, message: 'Email already exists' },
//         { status: 409 }
//       );
//     }

//     // Check if license number already exists
//     const licenseCheck = await query(
//       'SELECT id FROM doctors WHERE license_number = $1',
//       [data.licenseNumber]
//     );

//     if (licenseCheck.rows.length > 0) {
//       return NextResponse.json(
//         { success: false, message: 'License number already exists' },
//         { status: 409 }
//       );
//     }

//     // Insert doctor
//     const result = await query(
//       `INSERT INTO doctors (
//         first_name, last_name, email, phone, specialty, department,
//         license_number, date_of_birth, date_joined, address, city,
//         state, zip_code, country, qualifications, experience, bio,
//         status, avatar
//       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
//       RETURNING 
//         id, 
//         first_name as "firstName", 
//         last_name as "lastName", 
//         email, 
//         phone, 
//         specialty, 
//         department, 
//         license_number as "licenseNumber",
//         date_of_birth as "dateOfBirth",
//         date_joined as "dateJoined",
//         address,
//         city,
//         state,
//         zip_code as "zipCode",
//         country,
//         qualifications,
//         experience,
//         bio,
//         status,
//         avatar,
//         created_at as "createdAt"`,
//       [
//         data.firstName,
//         data.lastName,
//         data.email,
//         data.phone,
//         data.specialty,
//         data.department,
//         data.licenseNumber,
//         data.dateOfBirth || null,
//         data.dateJoined,
//         data.address || null,
//         data.city || null,
//         data.state || null,
//         data.zipCode || null,
//         data.country || null,
//         JSON.stringify(data.qualifications),
//         data.experience || null,
//         data.bio || null,
//         data.status,
//         avatarPath
//       ]
//     );

//     console.log('Doctor created successfully, ID:', result.rows[0].id);
//     return NextResponse.json({
//       success: true,
//       message: 'Doctor added successfully',
//       data: result.rows[0]
//     }, { status: 201 });

//   } catch (error: any) {
//     console.error('❌ Error creating doctor:');
//     console.error('Message:', error.message);
//     console.error('Stack:', error.stack);
//     if (error.code) console.error('Code:', error.code);
//     if (error.detail) console.error('Detail:', error.detail);
    
//     const isDev = process.env.NODE_ENV === 'development';
//     return NextResponse.json(
//       { 
//         success: false, 
//         message: 'Failed to create doctor',
//         ...(isDev && { error: error.message, stack: error.stack })
//       },
//       { status: 500 }
//     );
//   }
// }





// ==================== POST ====================

export async function POST(req: NextRequest) {
  console.log('📥 POST /api/doctors - Starting request');
  console.log('Content-Type:', req.headers.get('content-type'));

  // Optional: log raw body for debugging
  try {
    const clone = req.clone();
    const rawText = await clone.text();
    console.log('Raw request body:', rawText);
  } catch (e) {
    console.log('Could not read raw body');
  }

  try {
    let doctorData: any = {};
    let avatarPath: string | null = null;
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      console.log('Received formData keys:', Array.from(formData.keys()));

      const qualifications: string[] = [];
      for (const [key, value] of formData.entries()) {
        if (key === 'qualifications[]') {
          qualifications.push(value.toString());
        } else if (key !== 'avatar') {
          doctorData[key] = value;
        }
      }
      doctorData.qualifications = qualifications;

      // Handle file upload
      const avatarFile = formData.get('avatar') as File | null;
      if (avatarFile) {
        try {
          const bytes = await avatarFile.arrayBuffer();
          const buffer = Buffer.from(bytes);

          const timestamp = Date.now();
          const filename = `${timestamp}-${avatarFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;

          const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'doctors');
          if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
          }

          const filePath = path.join(uploadDir, filename);
          await writeFile(filePath, buffer);

          avatarPath = `/uploads/doctors/${filename}`;
        } catch (fileError) {
          console.error('Error saving avatar:', fileError);
        }
      }
    } else {
      // Assume JSON
      try {
        doctorData = await req.json();
        console.log('Parsed JSON:', doctorData);
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError);
        return NextResponse.json(
          { success: false, message: 'Invalid JSON payload' },
          { status: 400 }
        );
      }
    }

    // Ensure qualifications is an array
    if (!doctorData.qualifications) {
      doctorData.qualifications = [];
    } else if (typeof doctorData.qualifications === 'string') {
      doctorData.qualifications = [doctorData.qualifications];
    }

    // Validate with Zod
    const validation = CreateDoctorSchema.safeParse(doctorData);
    if (!validation.success) {
      console.log('Validation errors:', validation.error.flatten().fieldErrors);
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validation.data;
    console.log('Validated data:', data);

    // Check if email already exists in doctors table
    const emailCheck = await query(
      'SELECT id FROM doctors WHERE email = $1',
      [data.email]
    );
    if (emailCheck.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Email already exists' },
        { status: 409 }
      );
    }

    // Check if license number already exists
    const licenseCheck = await query(
      'SELECT id FROM doctors WHERE license_number = $1',
      [data.licenseNumber]
    );
    if (licenseCheck.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: 'License number already exists' },
        { status: 409 }
      );
    }

    // 1. Insert the doctor into the doctors table
    const result = await query(
      `INSERT INTO doctors (
        first_name, last_name, email, phone, specialty, department,
        license_number, date_of_birth, date_joined, address, city,
        state, zip_code, country, qualifications, experience, bio,
        status, avatar
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING 
        id, 
        first_name as "firstName", 
        last_name as "lastName", 
        email, 
        phone, 
        specialty, 
        department, 
        license_number as "licenseNumber",
        date_of_birth as "dateOfBirth",
        date_joined as "dateJoined",
        address,
        city,
        state,
        zip_code as "zipCode",
        country,
        qualifications,
        experience,
        bio,
        status,
        avatar,
        created_at as "createdAt"`,
      [
        data.firstName,
        data.lastName,
        data.email,
        data.phone,
        data.specialty,
        data.department,
        data.licenseNumber,
        data.dateOfBirth || null,
        data.dateJoined,
        data.address || null,
        data.city || null,
        data.state || null,
        data.zipCode || null,
        data.country || null,
        JSON.stringify(data.qualifications),
        data.experience || null,
        data.bio || null,
        data.status,
        avatarPath,
      ]
    );

    const newDoctor = result.rows[0];
    const doctorId = newDoctor.id;

    // 2. Create a placeholder record in the custom users table (without auth_user_id yet)
    await query(
      `INSERT INTO users (email, full_name_en, role, doctor_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())`,
      [data.email, `${data.firstName} ${data.lastName}`, 'doctor', doctorId]
    );

    // 3. Send invitation via Supabase Auth
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      data.email,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/set-password`, // where the doctor will set a password
        data: {
          full_name: `${data.firstName} ${data.lastName}`,
          doctor_id: doctorId,
          role: 'doctor',
        },
      }
    );

    if (inviteError) {
      console.error('Supabase invite error:', inviteError);
      // Invitation failed – you could optionally delete the inserted doctor and user rows
      // For now, return an error to the admin
      return NextResponse.json(
        { success: false, message: `Failed to send invitation: ${inviteError.message}` },
        { status: 500 }
      );
    }

    // 4. Update the custom user record with the auth_user_id returned by Supabase
    const authUserId = inviteData.user.id;
    await query(
      `UPDATE users SET auth_user_id = $1 WHERE email = $2`,
      [authUserId, data.email]
    );

    console.log('Doctor created successfully and invitation sent, ID:', doctorId);
    return NextResponse.json(
      {
        success: true,
        message: 'Doctor added successfully! An invitation email has been sent to set up their account.',
        data: newDoctor,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('❌ Error creating doctor:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    if (error.code) console.error('Code:', error.code);
    if (error.detail) console.error('Detail:', error.detail);

    const isDev = process.env.NODE_ENV === 'development';
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create doctor',
        ...(isDev && { error: error.message, stack: error.stack }),
      },
      { status: 500 }
    );
  }
}

// ==================== GET ====================

// (If you have a GET handler, keep it unchanged – not shown here for brevity)