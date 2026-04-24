import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { z } from 'zod';
import { authErrorResponse,requireRole } from '@/lib/auth/guards';

const RoomSchema = z.object({
  ward_id: z.number().int().positive(),
  room_number: z.string().min(1).max(50),
  name: z.string().max(100).optional().nullable(),
  description: z.string().optional().nullable()
});

export async function GET(req: NextRequest) {
  try {
        requireRole(req, ['admin','helpdesk']);
    const { searchParams } = new URL(req.url);
    const wardId = searchParams.get('wardId');

    let queryStr = 'SELECT * FROM rooms';
    const params: any[] = [];

    if (wardId) {
      queryStr += ' WHERE ward_id = $1 ORDER BY room_number';
      params.push(parseInt(wardId));
    } else {
      queryStr += ' ORDER BY ward_id, room_number';
    }

    const result = await query(queryStr, params);
    return NextResponse.json({ success: true, data: result.rows });

  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch rooms' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = RoomSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { ward_id, room_number, name, description } = validation.data;

    // Check if ward exists
    const ward = await query('SELECT id FROM wards WHERE id = $1', [ward_id]);
    if (ward.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Ward not found' },
        { status: 404 }
      );
    }

    // Check for duplicate room number in same ward
    const duplicate = await query(
      'SELECT id FROM rooms WHERE ward_id = $1 AND room_number = $2',
      [ward_id, room_number]
    );

    if (duplicate.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: `Room ${room_number} already exists in this ward` },
        { status: 409 }
      );
    }

    const result = await query(
      `INSERT INTO rooms (ward_id, room_number, name, description) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [ward_id, room_number, name || null, description || null]
    );

    return NextResponse.json({
      success: true,
      message: 'Room created successfully',
      data: result.rows[0]
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating room:', error);
        const authResponse=authErrorResponse(error);

if(authResponse){
  return authResponse
}

    return NextResponse.json(
      { success: false, message: 'Failed to create room' },
      { status: 500 }
    );
  }
}