// // app/api/admin/staff/[id]/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { query } from "@/lib/db";
// import { writeFile, mkdir } from 'fs/promises';
// import { join } from 'path';
// import fs from 'fs';

// // GET - Fetch single staff member
// export async function GET(
//   request: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id: idParam } = await params;
//     const id = parseInt(idParam);

//     if (isNaN(id)) {
//       return NextResponse.json(
//         { success: false, message: 'Invalid staff ID' },
//         { status: 400 }
//       );
//     }

//     const result = await query(
//       `SELECT 
//         s.id, s.first_name, s.last_name, s.email, s.phone, s.role, 
//         s.department, s.employee_id, s.date_of_birth, s.date_joined, 
//         s.address, s.city, s.state, s.zip_code, s.country,
//         s.qualifications, s.experience, s.bio, s.status, s.avatar_url,
//         s.created_at, s.updated_at,
//         u.id as user_id
//       FROM staff s
//       LEFT JOIN users u ON s.user_id = u.id
//       WHERE s.id = $1`,
//       [id]
//     );

//     if (result.rows.length === 0) {
//       return NextResponse.json(
//         { success: false, message: 'Staff member not found' },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({
//       success: true,
//       data: result.rows[0],
//     });

//   } catch (error) {
//     console.error('Error fetching staff member:', error);
//     return NextResponse.json(
//       { success: false, message: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

// // PUT - Update staff member (handles both JSON and FormData)
// export async function PUT(
//   request: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id: idParam } = await params;
//     const id = parseInt(idParam);

//     if (isNaN(id)) {
//       return NextResponse.json(
//         { success: false, message: 'Invalid staff ID' },
//         { status: 400 }
//       );
//     }

//     // Check if staff exists
//     const existingStaff = await query(
//       'SELECT id, user_id, first_name, last_name, avatar_url FROM staff WHERE id = $1',
//       [id]
//     );

//     if (existingStaff.rows.length === 0) {
//       return NextResponse.json(
//         { success: false, message: 'Staff member not found' },
//         { status: 404 }
//       );
//     }

//     const contentType = request.headers.get('content-type') || '';
//     let body: any = {};
//     let avatarUrl: string | null = existingStaff.rows[0].avatar_url; // Keep existing avatar

//     // Check if request is FormData (with file) or JSON
//     if (contentType.includes('multipart/form-data')) {
//       const formData = await request.formData();
      
//       // Extract text fields
//       for (const [key, value] of formData.entries()) {
//         if (key !== 'avatar') {
//           body[key] = value;
//         }
//       }
      
//       // Parse qualifications if it's a JSON string
//       if (body.qualifications && typeof body.qualifications === 'string') {
//         try {
//           body.qualifications = JSON.parse(body.qualifications);
//         } catch (e) {
//           // Keep as string if not valid JSON
//         }
//       }
      
//       // Handle avatar file upload
//       const avatarFile = formData.get('avatar') as File;
//       if (avatarFile && avatarFile.size > 0) {
//         // Delete old avatar file if exists
//         if (existingStaff.rows[0].avatar_url) {
//           const oldFilePath = join(process.cwd(), 'public', existingStaff.rows[0].avatar_url);
//           if (fs.existsSync(oldFilePath)) {
//             try {
//               await fs.promises.unlink(oldFilePath);
//               console.log('Deleted old avatar:', oldFilePath);
//             } catch (e) {
//               console.warn('Could not delete old avatar:', e);
//             }
//           }
//         }

//         // Save new avatar
//         const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars');
//         if (!fs.existsSync(uploadDir)) {
//           await mkdir(uploadDir, { recursive: true });
//         }
        
//         const timestamp = Date.now();
//         const extension = avatarFile.name.split('.').pop() || 'jpg';
//         const fileName = `avatar-${id}-${timestamp}.${extension}`;
        
//         const bytes = await avatarFile.arrayBuffer();
//         const buffer = Buffer.from(bytes);
//         const filePath = join(uploadDir, fileName);
//         await writeFile(filePath, buffer);
        
//         avatarUrl = `/uploads/avatars/${fileName}`;
//         console.log('New avatar saved:', avatarUrl);
//       }
//     } else {
//       // JSON request (no file)
//       body = await request.json();
//     }

//     console.log('Update body:', { ...body, avatarUrl });

//     // Check email uniqueness (if changing email)
//     if (body.email) {
//       const emailCheck = await query(
//         'SELECT id FROM staff WHERE email = $1 AND id != $2',
//         [body.email, id]
//       );
//       if (emailCheck.rows.length > 0) {
//         return NextResponse.json(
//           { success: false, message: 'Email already exists' },
//           { status: 409 }
//         );
//       }
//     }

//     // Start transaction
//     await query('BEGIN');

//     try {
//       // Update staff table
//       const updateFields: string[] = [];
//       const updateValues: any[] = [];
//       let paramIndex = 1;

//       const fieldMapping: Record<string, string> = {
//         firstName: 'first_name',
//         lastName: 'last_name',
//         employeeId: 'employee_id',
//         dateOfBirth: 'date_of_birth',
//         dateJoined: 'date_joined',
//         zipCode: 'zip_code',
//         avatarUrl: 'avatar_url',
//       };

//       const allowedFields = [
//         'firstName', 'lastName', 'email', 'phone', 'role', 'department',
//         'employeeId', 'dateOfBirth', 'dateJoined', 'address', 'city',
//         'state', 'zipCode', 'country', 'qualifications', 'experience',
//         'bio', 'status'
//       ];

//       for (const field of allowedFields) {
//         const value = body[field];
//         if (value !== undefined && value !== '') {
//           const dbField = fieldMapping[field] || field;
//           updateFields.push(`${dbField} = $${paramIndex}`);
//           updateValues.push(
//             field === 'qualifications' ? JSON.stringify(value) : value
//           );
//           paramIndex++;
//         }
//       }

//       // Always update avatar_url if it changed
//       if (avatarUrl !== existingStaff.rows[0].avatar_url) {
//         updateFields.push(`avatar_url = $${paramIndex}`);
//         updateValues.push(avatarUrl);
//         paramIndex++;
//       }

//       if (updateFields.length > 0) {
//         updateValues.push(id);
//         const updateQuery = `
//           UPDATE staff 
//           SET ${updateFields.join(', ')}, updated_at = NOW()
//           WHERE id = $${paramIndex}
//           RETURNING *
//         `;
//         const result = await query(updateQuery, updateValues);
//         console.log('Staff updated:', result.rows[0]?.id);
//       }

//       // Update users table if email or name changed
//       if (body.email || body.firstName || body.lastName) {
//         const userId = existingStaff.rows[0].user_id;
//         if (userId) {
//           const userUpdateFields: string[] = [];
//           const userUpdateValues: any[] = [];
//           let userParamIndex = 1;

//           if (body.email) {
//             userUpdateFields.push(`email = $${userParamIndex}`);
//             userUpdateValues.push(body.email);
//             userParamIndex++;
//           }

//           if (body.firstName || body.lastName) {
//             const fullName = `${body.firstName || existingStaff.rows[0].first_name} ${body.lastName || existingStaff.rows[0].last_name}`;
//             userUpdateFields.push(`full_name_en = $${userParamIndex}`);
//             userUpdateValues.push(fullName);
//             userParamIndex++;
//           }

//           if (userUpdateFields.length > 0) {
//             userUpdateValues.push(userId);
//             await query(
//               `UPDATE users SET ${userUpdateFields.join(', ')}, updated_at = NOW() WHERE id = $${userParamIndex}`,
//               userUpdateValues
//             );
//           }
//         }
//       }

//       // Commit transaction
//       await query('COMMIT');

//       return NextResponse.json({
//         success: true,
//         message: 'Staff member updated successfully',
//         data: {
//           id,
//           avatarUrl,
//         },
//       });

//     } catch (error) {
//       await query('ROLLBACK');
//       throw error;
//     }

//   } catch (error) {
//     console.error('Error updating staff member:', error);
//     return NextResponse.json(
//       { success: false, message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' },
//       { status: 500 }
//     );
//   }
// }

// // DELETE - Delete staff member
// export async function DELETE(
//   request: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id: idParam } = await params;
//     const id = parseInt(idParam);

//     console.log('DELETE request received for ID:', id);

//     if (isNaN(id)) {
//       return NextResponse.json(
//         { success: false, message: 'Invalid staff ID' },
//         { status: 400 }
//       );
//     }

//     // Check if staff exists
//     const existingStaff = await query(
//       'SELECT id, user_id, first_name, last_name, avatar_url FROM staff WHERE id = $1',
//       [id]
//     );

//     if (existingStaff.rows.length === 0) {
//       return NextResponse.json(
//         { success: false, message: 'Staff member not found' },
//         { status: 404 }
//       );
//     }

//     const staffMember = existingStaff.rows[0];

//     // Start transaction
//     await query('BEGIN');

//     try {
//       // Delete avatar file if exists
//       if (staffMember.avatar_url) {
//         const filePath = join(process.cwd(), 'public', staffMember.avatar_url);
//         if (fs.existsSync(filePath)) {
//           await fs.promises.unlink(filePath);
//           console.log('Deleted avatar file:', filePath);
//         }
//       }

//       // Delete from staff table
//       await query('DELETE FROM staff WHERE id = $1', [id]);

//       // Delete associated user account
//       if (staffMember.user_id) {
//         await query('DELETE FROM users WHERE id = $1', [staffMember.user_id]);
//       }

//       // Commit transaction
//       await query('COMMIT');

//       console.log(`Successfully deleted staff member: ${staffMember.first_name} ${staffMember.last_name}`);

//       return NextResponse.json({
//         success: true,
//         message: `Staff member ${staffMember.first_name} ${staffMember.last_name} deleted successfully`,
//         data: {
//           id,
//           name: `${staffMember.first_name} ${staffMember.last_name}`,
//         }
//       });

//     } catch (error) {
//       await query('ROLLBACK');
//       throw error;
//     }

//   } catch (error) {
//     console.error('Error deleting staff member:', error);
//     return NextResponse.json(
//       { 
//         success: false, 
//         message: 'Failed to delete staff member',
//         error: error instanceof Error ? error.message : 'Unknown error'
//       },
//       { status: 500 }
//     );
//   }
// }



// app/api/admin/staff/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from "@/lib/db";
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import fs from 'fs';

// GET - Fetch single staff member
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid staff ID' },
        { status: 400 }
      );
    }

    const result = await query(
      `SELECT 
        s.id, s.first_name, s.last_name, s.email, s.phone, s.role, 
        s.department, s.employee_id, s.date_of_birth, s.date_joined, 
        s.address, s.city, s.state, s.zip_code, s.country,
        s.qualifications, s.experience, s.bio, s.status, s.avatar_url,
        s.ward_id, w.name as ward_name,
        s.created_at, s.updated_at,
        u.id as user_id
      FROM staff s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN wards w ON s.ward_id = w.id
      WHERE s.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Staff member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });

  } catch (error) {
    console.error('Error fetching staff member:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update staff member (handles both JSON and FormData)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid staff ID' },
        { status: 400 }
      );
    }

    // Check if staff exists
    const existingStaff = await query(
      'SELECT id, user_id, first_name, last_name, avatar_url, ward_id FROM staff WHERE id = $1',
      [id]
    );

    if (existingStaff.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Staff member not found' },
        { status: 404 }
      );
    }

    const contentType = request.headers.get('content-type') || '';
    let body: any = {};
    let avatarUrl: string | null = existingStaff.rows[0].avatar_url;
    let wardId: number | null = existingStaff.rows[0].ward_id;

    // Check if request is FormData (with file) or JSON
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      
      // Extract text fields
      for (const [key, value] of formData.entries()) {
        if (key !== 'avatar') {
          body[key] = value;
        }
      }
      
      // Parse qualifications if it's a JSON string
      if (body.qualifications && typeof body.qualifications === 'string') {
        try {
          body.qualifications = JSON.parse(body.qualifications);
        } catch (e) {
          // Keep as string if not valid JSON
        }
      }
      
      // Parse wardId from FormData
      if (body.wardId !== undefined) {
        wardId = body.wardId && body.wardId !== '' ? parseInt(body.wardId) : null;
      }
      
      // Handle avatar file upload
      const avatarFile = formData.get('avatar') as File;
      if (avatarFile && avatarFile.size > 0) {
        // Delete old avatar file if exists
        if (existingStaff.rows[0].avatar_url) {
          const oldFilePath = join(process.cwd(), 'public', existingStaff.rows[0].avatar_url);
          if (fs.existsSync(oldFilePath)) {
            try {
              await fs.promises.unlink(oldFilePath);
              console.log('Deleted old avatar:', oldFilePath);
            } catch (e) {
              console.warn('Could not delete old avatar:', e);
            }
          }
        }

        // Save new avatar
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars');
        if (!fs.existsSync(uploadDir)) {
          await mkdir(uploadDir, { recursive: true });
        }
        
        const timestamp = Date.now();
        const extension = avatarFile.name.split('.').pop() || 'jpg';
        const fileName = `avatar-${id}-${timestamp}.${extension}`;
        
        const bytes = await avatarFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filePath = join(uploadDir, fileName);
        await writeFile(filePath, buffer);
        
        avatarUrl = `/uploads/avatars/${fileName}`;
        console.log('New avatar saved:', avatarUrl);
      }
    } else {
      // JSON request (no file)
      body = await request.json();
      
      // Parse wardId from JSON
      if (body.wardId !== undefined) {
        wardId = body.wardId && body.wardId !== '' ? parseInt(body.wardId) : null;
      }
    }

    console.log('Update body:', { ...body, avatarUrl, wardId });

    // Check email uniqueness (if changing email)
    if (body.email) {
      const emailCheck = await query(
        'SELECT id FROM staff WHERE email = $1 AND id != $2',
        [body.email, id]
      );
      if (emailCheck.rows.length > 0) {
        return NextResponse.json(
          { success: false, message: 'Email already exists' },
          { status: 409 }
        );
      }
    }

    // Start transaction
    await query('BEGIN');

    try {
      // Update staff table
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      let paramIndex = 1;

      const fieldMapping: Record<string, string> = {
        firstName: 'first_name',
        lastName: 'last_name',
        employeeId: 'employee_id',
        dateOfBirth: 'date_of_birth',
        dateJoined: 'date_joined',
        zipCode: 'zip_code',
        avatarUrl: 'avatar_url',
        wardId: 'ward_id',
      };

      const allowedFields = [
        'firstName', 'lastName', 'email', 'phone', 'role', 'department',
        'employeeId', 'dateOfBirth', 'dateJoined', 'address', 'city',
        'state', 'zipCode', 'country', 'qualifications', 'experience',
        'bio', 'status', 'wardId'
      ];

      for (const field of allowedFields) {
        const value = body[field];
        if (value !== undefined && value !== '') {
          const dbField = fieldMapping[field] || field;
          updateFields.push(`${dbField} = $${paramIndex}`);
          updateValues.push(
            field === 'qualifications' ? JSON.stringify(value) : value
          );
          paramIndex++;
        }
      }

      // Always update ward_id if it changed
      if (wardId !== existingStaff.rows[0].ward_id) {
        // Only add if not already added in the loop above
        if (!body.wardId && body.wardId !== '') {
          updateFields.push(`ward_id = $${paramIndex}`);
          updateValues.push(wardId);
          paramIndex++;
        }
      }

      // Always update avatar_url if it changed
      if (avatarUrl !== existingStaff.rows[0].avatar_url) {
        updateFields.push(`avatar_url = $${paramIndex}`);
        updateValues.push(avatarUrl);
        paramIndex++;
      }

      if (updateFields.length > 0) {
        updateValues.push(id);
        const updateQuery = `
          UPDATE staff 
          SET ${updateFields.join(', ')}, updated_at = NOW()
          WHERE id = $${paramIndex}
          RETURNING *
        `;
        const result = await query(updateQuery, updateValues);
        console.log('Staff updated:', result.rows[0]?.id);
      }

      // Update users table if email or name changed
      if (body.email || body.firstName || body.lastName) {
        const userId = existingStaff.rows[0].user_id;
        if (userId) {
          const userUpdateFields: string[] = [];
          const userUpdateValues: any[] = [];
          let userParamIndex = 1;

          if (body.email) {
            userUpdateFields.push(`email = $${userParamIndex}`);
            userUpdateValues.push(body.email);
            userParamIndex++;
          }

          if (body.firstName || body.lastName) {
            const fullName = `${body.firstName || existingStaff.rows[0].first_name} ${body.lastName || existingStaff.rows[0].last_name}`;
            userUpdateFields.push(`full_name_en = $${userParamIndex}`);
            userUpdateValues.push(fullName);
            userParamIndex++;
          }

          if (userUpdateFields.length > 0) {
            userUpdateValues.push(userId);
            await query(
              `UPDATE users SET ${userUpdateFields.join(', ')}, updated_at = NOW() WHERE id = $${userParamIndex}`,
              userUpdateValues
            );
          }
        }
      }

      // Commit transaction
      await query('COMMIT');

      return NextResponse.json({
        success: true,
        message: 'Staff member updated successfully',
        data: {
          id,
          avatarUrl,
          wardId,
        },
      });

    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Error updating staff member:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete staff member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    console.log('DELETE request received for ID:', id);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid staff ID' },
        { status: 400 }
      );
    }

    // Check if staff exists
    const existingStaff = await query(
      'SELECT id, user_id, first_name, last_name, avatar_url FROM staff WHERE id = $1',
      [id]
    );

    if (existingStaff.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Staff member not found' },
        { status: 404 }
      );
    }

    const staffMember = existingStaff.rows[0];

    // Start transaction
    await query('BEGIN');

    try {
      // Delete avatar file if exists
      if (staffMember.avatar_url) {
        const filePath = join(process.cwd(), 'public', staffMember.avatar_url);
        if (fs.existsSync(filePath)) {
          await fs.promises.unlink(filePath);
          console.log('Deleted avatar file:', filePath);
        }
      }

      // Delete from staff table
      await query('DELETE FROM staff WHERE id = $1', [id]);

      // Delete associated user account
      if (staffMember.user_id) {
        await query('DELETE FROM users WHERE id = $1', [staffMember.user_id]);
      }

      // Commit transaction
      await query('COMMIT');

      console.log(`Successfully deleted staff member: ${staffMember.first_name} ${staffMember.last_name}`);

      return NextResponse.json({
        success: true,
        message: `Staff member ${staffMember.first_name} ${staffMember.last_name} deleted successfully`,
        data: {
          id,
          name: `${staffMember.first_name} ${staffMember.last_name}`,
        }
      });

    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Error deleting staff member:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete staff member',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}