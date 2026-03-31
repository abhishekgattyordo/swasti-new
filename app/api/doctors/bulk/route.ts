// import { NextRequest, NextResponse } from 'next/server';
// import { query } from '@/lib/db';
// import { supabaseAdmin } from '@/lib/supabaseServer';
// import { CreateDoctorSchema } from '@/lib/validations/doctor'; 

// export async function POST(req: NextRequest) {
//   try {
//     const { doctors } = await req.json();

//     if (!Array.isArray(doctors) || doctors.length === 0) {
//       return NextResponse.json(
//         { success: false, message: 'Invalid or empty doctors array' },
//         { status: 400 }
//       );
//     }

//     // Validate each doctor against the same schema used for single creation
//     const validated = [];
//     for (let i = 0; i < doctors.length; i++) {
//       const doc = doctors[i];
//       const result = CreateDoctorSchema.safeParse(doc);
//       if (!result.success) {
//         return NextResponse.json(
//           {
//             success: false,
//             message: `Validation error at row ${i + 1}: ${result.error.message}`,
//           },
//           { status: 400 }
//         );
//       }
//       validated.push(result.data);
//     }

//     // Check for duplicate emails in the existing database
//     const emails = validated.map(d => d.email);
//     const existing = await query(
//       'SELECT email FROM doctors WHERE email = ANY($1::text[])',
//       [emails]
//     );
//     const existingEmails = existing.rows.map(r => r.email);
//     if (existingEmails.length > 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: `Duplicate emails found: ${existingEmails.join(', ')}`,
//         },
//         { status: 409 }
//       );
//     }

//     // Insert each doctor and create user + invitation
//     await query('BEGIN');
//     const inserted = [];
//     try {
//       for (const data of validated) {
//         // 1. Insert doctor
//         const doctorResult = await query(
//           `INSERT INTO doctors (
//             first_name, last_name, email, phone, specialty, department,
//             license_number, date_of_birth, date_joined, address, city,
//             state, zip_code, country, qualifications, experience, bio,
//             status
//           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
//           RETURNING id`,
//           [
//             data.firstName,
//             data.lastName,
//             data.email,
//             data.phone,
//             data.specialty,
//             data.department,
//             data.licenseNumber,
//             data.dateOfBirth || null,
//             data.dateJoined,
//             data.address || null,
//             data.city || null,
//             data.state || null,
//             data.zipCode || null,
//             data.country || null,
//             JSON.stringify(data.qualifications),
//             data.experience || null,
//             data.bio || null,
//             data.status,
//           ]
//         );
//         const doctorId = doctorResult.rows[0].id;

//         // 2. Create placeholder user record
//         await query(
//           `INSERT INTO users (email, full_name_en, role, doctor_id, created_at, updated_at)
//            VALUES ($1, $2, $3, $4, NOW(), NOW())`,
//           [data.email, `${data.firstName} ${data.lastName}`, 'doctor', doctorId]
//         );

//         // 3. Send invitation via Supabase
//         const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
//           data.email,
//           {
//             redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/set-password`,
//             data: {
//               full_name: `${data.firstName} ${data.lastName}`,
//               doctor_id: doctorId,
//               role: 'doctor',
//             },
//           }
//         );

//         if (inviteError) {
//           throw new Error(`Invitation failed for ${data.email}: ${inviteError.message}`);
//         }

//         // 4. Update user record with auth_user_id
//         const authUserId = inviteData.user.id;
//         await query(
//           `UPDATE users SET auth_user_id = $1 WHERE email = $2`,
//           [authUserId, data.email]
//         );

//         inserted.push({ id: doctorId, name: `${data.firstName} ${data.lastName}` });
//       }
//       await query('COMMIT');
//       return NextResponse.json({
//         success: true,
//         message: `Successfully imported ${inserted.length} doctors`,
//         data: inserted,
//       });
//     } catch (err) {
//       await query('ROLLBACK');
//       throw err;
//     }
//  } catch (error) {
//   console.error('Bulk import error:', error);
//   const errorMessage = error instanceof Error ? error.message : 'Internal server error';
//   return NextResponse.json(
//     { success: false, message: errorMessage },
//     { status: 500 }
//   );
// }
// }


import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { CreateDoctorSchema } from '@/lib/validations/doctor'; 

export async function POST(req: NextRequest) {
  try {
    const { doctors } = await req.json();

    if (!Array.isArray(doctors) || doctors.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid or empty doctors array' },
        { status: 400 }
      );
    }

    // Validate each doctor against the same schema used for single creation
    const validated = [];
    for (let i = 0; i < doctors.length; i++) {
      const doc = doctors[i];
      const result = CreateDoctorSchema.safeParse(doc);
      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            message: `Validation error at row ${i + 1}: ${result.error.message}`,
          },
          { status: 400 }
        );
      }
      validated.push(result.data);
    }

    // Check for duplicate emails in the existing database
    const emails = validated.map(d => d.email);
    const existing = await query(
      'SELECT email FROM doctors WHERE email = ANY($1::text[])',
      [emails]
    );
    const existingEmails = existing.rows.map(r => r.email);
    if (existingEmails.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Duplicate emails found: ${existingEmails.join(', ')}`,
        },
        { status: 409 }
      );
    }

    // Insert each doctor and create user record
    await query('BEGIN');
    const inserted = [];
    try {
      for (const data of validated) {
        // 1. Insert doctor
        const doctorResult = await query(
          `INSERT INTO doctors (
            first_name, last_name, email, phone, specialty, department,
            license_number, date_of_birth, date_joined, address, city,
            state, zip_code, country, qualifications, experience, bio,
            status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
          RETURNING id`,
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
          ]
        );
        const doctorId = doctorResult.rows[0].id;

        // 2. Create user record (no auth_user_id or invitation)
        await query(
          `INSERT INTO users (email, full_name_en, role, doctor_id, created_at, updated_at)
           VALUES ($1, $2, $3, $4, NOW(), NOW())`,
          [data.email, `${data.firstName} ${data.lastName}`, 'doctor', doctorId]
        );

        inserted.push({ id: doctorId, name: `${data.firstName} ${data.lastName}` });
      }
      await query('COMMIT');
      return NextResponse.json({
        success: true,
        message: `Successfully imported ${inserted.length} doctors`,
        data: inserted,
      });
    } catch (err) {
      await query('ROLLBACK');
      throw err;
    }
  } catch (error) {
    console.error('Bulk import error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}