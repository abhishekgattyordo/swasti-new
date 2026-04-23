import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { z } from 'zod';
import { authErrorResponse,requireRole } from '@/lib/auth/guards';

// Define schema directly in the file to avoid import issues
const BulkBedSchema = z.object({
  ward_id: z.number().int().positive(),
  room_id: z.number().int().positive().optional(),
  count: z.number().int().min(1).max(50),
  prefix: z.string().optional(),
  patient_category: z.enum(['Male', 'Female', 'Children', 'Mixed']).optional(),
 attributes: z.record(z.string(), z.any()).optional()
});

export async function GET(req: NextRequest) {
  
  try {
    const { searchParams } = new URL(req.url);
    const wardId = searchParams.get('wardId');
    const roomId = searchParams.get('roomId');
    const status = searchParams.get('status');
     requireRole(req, ['admin','helpdesk']);


    let queryStr = `
      SELECT b.*, w.name as ward_name, w.type as ward_type, r.room_number 
      FROM beds b
      JOIN wards w ON b.ward_id = w.id
      LEFT JOIN rooms r ON b.room_id = r.id
      WHERE b.is_active = true
    `;
    const params: any[] = [];

    if (wardId) {
      queryStr += ` AND b.ward_id = $${params.length + 1}`;
      params.push(parseInt(wardId));
    }
    if (roomId) {
      queryStr += ` AND b.room_id = $${params.length + 1}`;
      params.push(parseInt(roomId));
    }
    if (status) {
      queryStr += ` AND b.status = $${params.length + 1}`;
      params.push(status);
    }

    queryStr += ' ORDER BY b.floor_number, b.bed_number';

    const result = await query(queryStr, params);
    return NextResponse.json({ success: true, data: result.rows });

  } catch (error) {
    console.error('Error fetching beds:', error);
       const authResponse=authErrorResponse(error);

if(authResponse){
  return authResponse
}

    return NextResponse.json(
      { success: false, message: 'Failed to fetch beds' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('📥 POST /api/bed-config/beds - Creating beds');
    
    const body = await req.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    requireRole(req, ['admin','helpdesk']);
    
    // Manual validation as fallback
    if (!body.ward_id) {
      return NextResponse.json(
        { success: false, message: 'ward_id is required' },
        { status: 400 }
      );
    }
    
    if (!body.count || body.count < 1) {
      return NextResponse.json(
        { success: false, message: 'count must be at least 1' },
        { status: 400 }
      );
    }

    // Try Zod validation
    try {
      const validation = BulkBedSchema.safeParse(body);
    
      if (!validation.success) {
        console.log('❌ Validation failed:', validation.error.flatten().fieldErrors);
        return NextResponse.json(
          { 
            success: false, 
            message: 'Validation failed', 
            errors: validation.error.flatten().fieldErrors 
          },
          { status: 400 }
        );
      }
      var { ward_id, room_id, count, prefix, patient_category, attributes } = validation.data;
  } catch (validationError) {
  console.error('Zod validation error:', validationError);
  // Fallback to manual extraction – assign, don't redeclare
  ward_id = body.ward_id;
  room_id = body.room_id;
  count = body.count;
  prefix = body.prefix;
  patient_category = body.patient_category;
  attributes = body.attributes;
}
    console.log(`Creating ${count} beds in ward ${ward_id}${room_id ? `, room ${room_id}` : ''}`);

    // Step 1: Check if ward exists and get its details
    console.log(`Checking if ward ${ward_id} exists...`);
    const wardResult = await query(
      'SELECT w.*, f.floor_number FROM wards w JOIN floors f ON w.floor_id = f.id WHERE w.id = $1 AND w.is_active = true',
      [ward_id]
    );

    if (wardResult.rows.length === 0) {
      console.log(`❌ Ward ${ward_id} not found or inactive`);
      return NextResponse.json(
        { success: false, message: `Ward with ID ${ward_id} not found or inactive` },
        { status: 404 }
      );
    }

    const ward = wardResult.rows[0];
    console.log('✅ Ward found:', { id: ward.id, name: ward.name, type: ward.type, floor: ward.floor_number });

    // Step 2: If room_id provided, verify it belongs to the ward
    let roomNumber = '';
    if (room_id) {
      console.log(`Checking if room ${room_id} belongs to ward ${ward_id}...`);
      const roomResult = await query(
        'SELECT room_number FROM rooms WHERE id = $1 AND ward_id = $2',
        [room_id, ward_id]
      );

      if (roomResult.rows.length === 0) {
        console.log(`❌ Room ${room_id} not found in ward ${ward_id}`);
        return NextResponse.json(
          { success: false, message: `Room with ID ${room_id} does not belong to this ward` },
          { status: 400 }
        );
      }
      roomNumber = roomResult.rows[0].room_number;
      console.log(`✅ Room found: ${roomNumber}`);
    }

    // Step 3: Get current bed count in this ward for numbering
    const countResult = await query(
      'SELECT COUNT(*) as bed_count FROM beds WHERE ward_id = $1',
      [ward_id]
    );
    const startIndex = parseInt(countResult.rows[0].bed_count);
    console.log(`Current beds in ward: ${startIndex}`);

    // Step 4: Create beds
    const beds = [];
    for (let i = 0; i < count; i++) {
      // Generate bed number
      const bedNumber = prefix
        ? `${prefix}-${startIndex + i + 1}`
        : roomNumber
        ? `${roomNumber}-${startIndex + i + 1}`
        : `Bed-${startIndex + i + 1}`;

      console.log(`Creating bed ${i + 1}/${count}: ${bedNumber}`);

      try {
        const result = await query(
          `INSERT INTO beds 
           (ward_id, room_id, bed_number, type, floor_number, status, patient_category, attributes) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING *`,
          [
            ward_id,
            room_id || null,
            bedNumber,
            ward.type,
            ward.floor_number,
            'available',
            patient_category || ward.patient_category,
            attributes ? JSON.stringify(attributes) : null
          ]
        );
        beds.push(result.rows[0]);
        console.log(`✅ Bed ${bedNumber} created successfully`);
      } catch (insertError: any) {
        console.error(`❌ Error creating bed ${bedNumber}:`, {
          message: insertError.message,
          code: insertError.code,
          detail: insertError.detail
        });
        throw insertError;
      }
    }

    console.log(`✅ Successfully created ${beds.length} beds`);
    return NextResponse.json({
      success: true,
      message: `${beds.length} beds created successfully`,
      data: beds
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Error creating beds:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      stack: error.stack
    });
       const authResponse=authErrorResponse(error);

if(authResponse){
  return authResponse
}

    
    // Handle specific database errors
    if (error.code === '42P01') {
      return NextResponse.json(
        { success: false, message: 'Beds table does not exist. Please run database migrations.' },
        { status: 500 }
      );
    }
    
    if (error.code === '23503') {
      return NextResponse.json(
        { success: false, message: 'Foreign key violation. Ward or Room ID does not exist.' },
        { status: 400 }
      );
    }
    
    if (error.code === '23505') {
      return NextResponse.json(
        { success: false, message: 'Duplicate bed number. A bed with this number already exists.' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'Failed to create beds', error: error.message },
      { status: 500 }
    );
  }
}