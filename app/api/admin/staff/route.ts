

// app/api/admin/staff/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from "@/lib/db";
import bcrypt from 'bcrypt';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import fs from 'fs';

// Helper function to generate employee ID
function generateEmployeeId(role: string, department: string): string {
  const prefix = role.substring(0, 2).toUpperCase();
  const deptCode = department.substring(0, 2).toUpperCase();
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const timestamp = Date.now().toString().slice(-4);
  return `${prefix}${deptCode}${timestamp}${randomNum}`;
}

// Helper function to generate default password
function generateDefaultPassword(firstName: string, lastName: string): string {
  return `${firstName}${lastName}@${Math.floor(Math.random() * 100)}`;
}

// GET - Fetch all staff members
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get('role');
    const department = searchParams.get('department');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let queryText = `
      SELECT 
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
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramIndex = 1;

    if (role && role !== 'all') {
      queryText += ` AND s.role = $${paramIndex}`;
      params.push(role);
      paramIndex++;
    }

    if (department && department !== 'all') {
      queryText += ` AND s.department = $${paramIndex}`;
      params.push(department);
      paramIndex++;
    }

    if (status && status !== 'all') {
      queryText += ` AND s.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (search) {
      queryText += ` AND (s.first_name ILIKE $${paramIndex} OR s.last_name ILIKE $${paramIndex} OR s.email ILIKE $${paramIndex} OR s.employee_id ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    queryText += ` ORDER BY s.created_at DESC`;

    const result = await query(queryText, params);

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });

  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new staff member (handles both JSON and FormData)
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    
    let body: any = {};
    let avatarFile: File | null = null;
    let avatarUrl: string | null = null;
    let wardId: number | null = null;

    // Check if request is FormData (with file) or JSON
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      
      // Extract all text fields from FormData
      body.firstName = formData.get('firstName') as string;
      body.lastName = formData.get('lastName') as string;
      body.email = formData.get('email') as string;
      body.phone = formData.get('phone') as string;
      body.role = formData.get('role') as string;
      body.department = formData.get('department') as string;
      body.employeeId = formData.get('employeeId') as string;
      body.dateOfBirth = formData.get('dateOfBirth') as string;
      body.dateJoined = formData.get('dateJoined') as string;
      body.address = formData.get('address') as string;
      body.city = formData.get('city') as string;
      body.state = formData.get('state') as string;
      body.zipCode = formData.get('zipCode') as string;
      body.country = formData.get('country') as string;
      body.experience = formData.get('experience') as string;
      body.bio = formData.get('bio') as string;
      body.status = formData.get('status') as string;
      
      // Parse wardId
      const wardIdStr = formData.get('wardId') as string;
      wardId = wardIdStr && wardIdStr !== '' ? parseInt(wardIdStr) : null;
      
      // Parse qualifications from JSON string
      const qualificationsStr = formData.get('qualifications') as string;
      body.qualifications = qualificationsStr ? JSON.parse(qualificationsStr) : [];
      
      // Get avatar file if present
      avatarFile = formData.get('avatar') as File;
      
      // Save avatar file if present
      if (avatarFile && avatarFile.size > 0) {
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars');
        if (!fs.existsSync(uploadDir)) {
          await mkdir(uploadDir, { recursive: true });
        }
        
        const timestamp = Date.now();
        const extension = avatarFile.name.split('.').pop() || 'jpg';
        const fileName = `avatar-${timestamp}.${extension}`;
        
        const bytes = await avatarFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filePath = join(uploadDir, fileName);
        await writeFile(filePath, buffer);
        
        avatarUrl = `/uploads/avatars/${fileName}`;
      }
    } else {
      // JSON request (no file)
      body = await request.json();
      wardId = body.wardId && body.wardId !== '' ? parseInt(body.wardId) : null;
    }
    
    console.log('Processed body:', { 
      ...body, 
      wardId,
      avatarFile: avatarFile ? `${avatarFile.name} (${avatarFile.size} bytes)` : 'none',
      avatarUrl 
    });
    
    // Validate input
    if (!body.firstName || !body.lastName || !body.email) {
      return NextResponse.json(
        { success: false, message: 'Required fields are missing' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEmail = await query(
      'SELECT id FROM staff WHERE email = $1',
      [body.email]
    );

    if (existingEmail.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Email already exists' },
        { status: 409 }
      );
    }

    // Check if employee ID already exists (if provided)
    if (body.employeeId) {
      const existingEmpId = await query(
        'SELECT id FROM staff WHERE employee_id = $1',
        [body.employeeId]
      );
      if (existingEmpId.rows.length > 0) {
        return NextResponse.json(
          { success: false, message: 'Employee ID already exists' },
          { status: 409 }
        );
      }
    }

    // Generate employee ID if not provided
    const employeeId = body.employeeId || generateEmployeeId(body.role, body.department);
    
    // Generate default password
    const defaultPassword = generateDefaultPassword(body.firstName, body.lastName);
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Handle qualifications
    const qualifications = Array.isArray(body.qualifications) 
      ? body.qualifications.filter((q: string) => q.trim() !== '') 
      : [];
    
    // Handle experience
    const experience = body.experience !== undefined && body.experience !== null && body.experience !== '' 
      ? Number(body.experience) 
      : null;

    // Start transaction
    await query('BEGIN');

    try {
      // Insert into users table
      const userResult = await query(
        `INSERT INTO users (email, password, full_name_en, role, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         RETURNING id`,
        [body.email, hashedPassword, `${body.firstName} ${body.lastName}`, body.role.toLowerCase()]
      );

      const userId = userResult.rows[0].id;

      // Insert into staff table WITH ward_id and avatar_url
      const staffResult = await query(
        `INSERT INTO staff (
          user_id, first_name, last_name, email, phone, role, department,
          employee_id, date_of_birth, date_joined, address, city, state,
          zip_code, country, qualifications, experience, bio, status, 
          ward_id, avatar_url, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, NOW(), NOW())
        RETURNING *`,
        [
          userId, 
          body.firstName, 
          body.lastName, 
          body.email, 
          body.phone,
          body.role, 
          body.department, 
          employeeId, 
          body.dateOfBirth || null,
          body.dateJoined, 
          body.address || null, 
          body.city || null,
          body.state || null, 
          body.zipCode || null, 
          body.country || null,
          JSON.stringify(qualifications), 
          experience,
          body.bio || null, 
          body.status || 'active',
          wardId,  // ✅ ADDED: ward_id
          avatarUrl
        ]
      );

      const staffId = staffResult.rows[0].id;

      // Commit transaction
      await query('COMMIT');

      console.log('Staff created successfully:', {
        id: staffId,
        ward_id: wardId,
        avatar_url: avatarUrl,
      });

      return NextResponse.json({
        success: true,
        message: 'Staff member added successfully',
        data: {
          id: staffId,
          userId,
          employeeId,
          email: body.email,
          defaultPassword,
          fullName: `${body.firstName} ${body.lastName}`,
          role: body.role,
          department: body.department,
          status: body.status || 'active',
          experience: experience,
          qualifications: qualifications,
          wardId: wardId,
          avatarUrl: avatarUrl,
        },
      });

    } catch (error) {
      await query('ROLLBACK');
      console.error('Transaction error:', error);
      throw error;
    }

  } catch (error) {
    console.error('Error adding staff member:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}