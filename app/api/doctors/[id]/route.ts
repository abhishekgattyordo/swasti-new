import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { z } from 'zod';
import { authErrorResponse,requireRole } from '@/lib/auth/guards';

const UpdateDoctorSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(1).optional(),
  specialty: z.string().min(1).optional(),
  department: z.string().min(1).optional(),
  licenseNumber: z.string().min(1).optional(),
  dateOfBirth: z.string().optional(),
  dateJoined: z.string().optional(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zipCode: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  qualifications: z.array(z.string()).optional(),
  experience: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return undefined;
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    },
    z.number().int().positive().optional().nullable()
  ),
  bio: z.string().optional().nullable(),
  status: z.enum(['active', 'on-leave', 'inactive']).optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('📥 GET /api/doctors/[id] - Starting request');
  
  try {
         requireRole(req, ['patient']);
    const { id } = await params;
    console.log('📦 Received ID:', id);
    
    // Check if it's a valid number
    if (!/^\d+$/.test(id)) {
      console.log('❌ Invalid ID format - not a number');
      return NextResponse.json(
        { success: false, message: 'Invalid doctor ID format' },
        { status: 400 }
      );
    }
    
    const doctorId = parseInt(id);

    const result = await query(
      `SELECT 
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
      WHERE id = $1`,
      [doctorId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Doctor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error fetching doctor:', error);
       const authResponse=authErrorResponse(error);

if(authResponse){
  return authResponse
}

    return NextResponse.json(
      { success: false, message: 'Failed to fetch doctor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
       requireRole(req, ['admin']);
    const { id } = await params;
    const doctorId = parseInt(id);

    if (isNaN(doctorId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid doctor ID' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const validation = UpdateDoctorSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed', 
          errors: validation.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check if doctor exists
    const existing = await query(
      'SELECT id FROM doctors WHERE id = $1',
      [doctorId]
    );

    if (existing.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Doctor not found' },
        { status: 404 }
      );
    }

    // Check email uniqueness if updating
    if (data.email) {
      const emailCheck = await query(
        'SELECT id FROM doctors WHERE email = $1 AND id != $2',
        [data.email, doctorId]
      );
      if (emailCheck.rows.length > 0) {
        return NextResponse.json(
          { success: false, message: 'Email already exists' },
          { status: 409 }
        );
      }
    }

    // Check license number uniqueness if updating
    if (data.licenseNumber) {
      const licenseCheck = await query(
        'SELECT id FROM doctors WHERE license_number = $1 AND id != $2',
        [data.licenseNumber, doctorId]
      );
      if (licenseCheck.rows.length > 0) {
        return NextResponse.json(
          { success: false, message: 'License number already exists' },
          { status: 409 }
        );
      }
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramIndex = 1;

    const fieldMap: Record<string, string> = {
      firstName: 'first_name',
      lastName: 'last_name',
      email: 'email',
      phone: 'phone',
      specialty: 'specialty',
      department: 'department',
      licenseNumber: 'license_number',
      dateOfBirth: 'date_of_birth',
      dateJoined: 'date_joined',
      address: 'address',
      city: 'city',
      state: 'state',
      zipCode: 'zip_code',
      country: 'country',
      qualifications: 'qualifications',
      experience: 'experience',
      bio: 'bio',
      status: 'status',
    };

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && fieldMap[key]) {
        updates.push(`${fieldMap[key]} = $${paramIndex}`);
        if (key === 'qualifications') {
          values.push(JSON.stringify(value));
        } else {
          values.push(value);
        }
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No fields to update' },
        { status: 400 }
      );
    }

    values.push(doctorId);
    const result = await query(
      `UPDATE doctors 
       SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramIndex}
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
        created_at as "createdAt",
        updated_at as "updatedAt"`,
      values
    );

    return NextResponse.json({
      success: true,
      message: 'Doctor updated successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating doctor:', error);
        const authResponse=authErrorResponse(error);

if(authResponse){
  return authResponse
}

    return NextResponse.json(
      { success: false, message: 'Failed to update doctor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
         requireRole(req, ['admin']);
    const { id } = await params;
    const doctorId = parseInt(id);

    if (isNaN(doctorId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid doctor ID' },
        { status: 400 }
      );
    }

    const result = await query(
      'DELETE FROM doctors WHERE id = $1 RETURNING id',
      [doctorId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Doctor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Doctor deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting doctor:', error);
       const authResponse=authErrorResponse(error);

if(authResponse){
  return authResponse
}
    return NextResponse.json(
      { success: false, message: 'Failed to delete doctor' },
      { status: 500 }
    );
  }
}