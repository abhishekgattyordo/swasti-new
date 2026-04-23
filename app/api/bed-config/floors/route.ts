import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { z } from 'zod';
import { authErrorResponse,requireRole } from '@/lib/auth/guards';

const FloorSchema = z.object({
  floor_number: z.number().int().positive(),
  name: z.string().max(100).optional().nullable()
});

export async function GET(req: NextRequest){
  try {
    requireRole(req, ['admin','helpdesk']);
    const result = await query(
      'SELECT * FROM floors ORDER BY floor_number'
    );
    return NextResponse.json({ 
      success: true, 
      data: result.rows 
    });
  } catch (error) {
    console.error('Error fetching floors:', error);
        const authResponse=authErrorResponse(error);

if(authResponse){
  return authResponse
}

    return NextResponse.json(
      { success: false, message: 'Failed to fetch floors' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
        requireRole(req, ['admin','helpdesk']);
    const body = await req.json();
    const validation = FloorSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { floor_number, name } = validation.data;

    // Check if floor already exists
    const existing = await query(
      'SELECT id FROM floors WHERE floor_number = $1',
      [floor_number]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: `Floor ${floor_number} already exists` },
        { status: 409 }
      );
    }

    const result = await query(
      `INSERT INTO floors (floor_number, name) 
       VALUES ($1, $2) 
       RETURNING *`,
      [floor_number, name || null]
    );

    return NextResponse.json({
      success: true,
      message: 'Floor created successfully',
      data: result.rows[0]
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating floor:', error);
        const authResponse=authErrorResponse(error);

if(authResponse){
  return authResponse
}
    return NextResponse.json(
      { success: false, message: 'Failed to create floor' },
      { status: 500 }
    );
  }
}