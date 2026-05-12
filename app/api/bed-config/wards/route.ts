


import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { z } from 'zod';
import { authErrorResponse,requireRole } from '@/lib/auth/guards';

const WardSchema = z.object({
  floor_id: z.number().int().positive(),
  name: z.string().min(1).max(100),
  type: z.enum(['General', 'Semi-Special', 'Special', 'VIP', 'ICU', 'Pediatric','Emergency']),
  patient_category: z.enum(['Male', 'Female', 'Children', 'Mixed']),
  description: z.string().optional().nullable(),
  daily_rate: z.number().min(0).optional().default(0),  // <-- added
});

export async function GET(req: NextRequest) {
  try {
        requireRole(req, ['admin','helpdesk']);
    const { searchParams } = new URL(req.url);
    const floorId = searchParams.get('floorId');

    let queryStr = `
      SELECT w.*, f.floor_number 
      FROM wards w
      JOIN floors f ON w.floor_id = f.id
      WHERE w.is_active = true
    `;
    const params: any[] = [];

    if (floorId) {
      queryStr += ' AND w.floor_id = $1 ORDER BY w.name';
      params.push(parseInt(floorId));
    } else {
      queryStr += ' ORDER BY f.floor_number, w.name';
    }

    const result = await query(queryStr, params);
    return NextResponse.json({ success: true, data: result.rows });

  } catch (error) {
    console.error('Error fetching wards:', error);
       const authResponse=authErrorResponse(error);

if(authResponse){
  return authResponse
}
    return NextResponse.json(
      { success: false, message: 'Failed to fetch wards' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
        requireRole(req, ['admin','helpdesk']);
    const body = await req.json();
    const validation = WardSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { floor_id, name, type, patient_category, description, daily_rate } = validation.data;

    // Check if floor exists
    const floor = await query('SELECT id FROM floors WHERE id = $1', [floor_id]);
    if (floor.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Floor not found' },
        { status: 404 }
      );
    }

    const result = await query(
      `INSERT INTO wards (floor_id, name, type, patient_category, description, daily_rate) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [floor_id, name, type, patient_category, description || null, daily_rate]
    );

    return NextResponse.json({
      success: true,
      message: 'Ward created successfully',
      data: result.rows[0]
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating ward:', error);
       const authResponse=authErrorResponse(error);

if(authResponse){
  return authResponse
}
    return NextResponse.json(
      { success: false, message: 'Failed to create ward' },
      { status: 500 }
    );
  }
}