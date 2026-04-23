import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { z } from 'zod';
import { authErrorResponse,requireRole } from '@/lib/auth/guards';

const RoomUpdateSchema = z.object({
  room_number: z.string().min(1).max(50).optional(),
  name: z.string().max(100).optional().nullable(),
  description: z.string().optional().nullable()
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('📥 GET /api/bed-config/rooms/[id] - Starting request');
  
  try {
        requireRole(req, ['admin','helpdesk']);
    const { id } = await params;
    console.log('📦 Received params:', { id });
    
    const roomId = parseInt(id);
    console.log('🔢 Parsed room ID:', roomId, 'Type:', typeof roomId);
    
    if (isNaN(roomId)) {
      console.log('❌ Invalid room ID - not a number');
      return NextResponse.json(
        { success: false, message: 'Invalid room ID' },
        { status: 400 }
      );
    }

    console.log('🔍 Querying database for room ID:', roomId);
    const result = await query(
      `SELECT r.*, w.name as ward_name, w.type as ward_type 
       FROM rooms r
       JOIN wards w ON r.ward_id = w.id
       WHERE r.id = $1`,
      [roomId]
    );

    console.log('📊 Query result rows:', result.rows.length);
    if (result.rows.length > 0) {
      console.log('✅ Room found:', result.rows[0]);
    } else {
      console.log('❌ Room not found in database');
    }

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Room not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error fetching room:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch room' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('📥 PUT /api/bed-config/rooms/[id] - Starting request');
  
  try {
         requireRole(req, ['admin','helpdesk']);
    const { id } = await params;
    console.log('📦 Received params:', { id });
    
    const roomId = parseInt(id);
    console.log('🔢 Parsed room ID:', roomId, 'Type:', typeof roomId);
    
    if (isNaN(roomId)) {
      console.log('❌ Invalid room ID - not a number');
      return NextResponse.json(
        { success: false, message: 'Invalid room ID' },
        { status: 400 }
      );
    }

    const body = await req.json();
    console.log('📦 Request body:', JSON.stringify(body, null, 2));

    const validation = RoomUpdateSchema.safeParse(body);
    console.log('✅ Validation result:', validation.success);

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

    const { room_number, name, description } = validation.data;
    console.log('📝 Update data:', { room_number, name, description });

    // Check if room exists
    console.log('🔍 Checking if room exists with ID:', roomId);
    const existingRoom = await query(
      'SELECT ward_id FROM rooms WHERE id = $1',
      [roomId]
    );

    if (existingRoom.rows.length === 0) {
      console.log('❌ Room not found with ID:', roomId);
      return NextResponse.json(
        { success: false, message: 'Room not found' },
        { status: 404 }
      );
    }

    const ward_id = existingRoom.rows[0].ward_id;
    console.log('✅ Room exists in ward:', ward_id);

    // Check for duplicate room number in same ward (if room_number is being updated)
    if (room_number) {
      console.log('🔍 Checking for duplicate room number:', room_number);
      const duplicate = await query(
        'SELECT id FROM rooms WHERE ward_id = $1 AND room_number = $2 AND id != $3',
        [ward_id, room_number, roomId]
      );

      if (duplicate.rows.length > 0) {
        console.log('❌ Room number already exists in this ward');
        return NextResponse.json(
          { success: false, message: `Room ${room_number} already exists in this ward` },
          { status: 409 }
        );
      }
      console.log('✅ Room number is unique');
    }

    console.log('📝 Updating room in database...');
    const result = await query(
      `UPDATE rooms 
       SET room_number = COALESCE($1, room_number),
           name = COALESCE($2, name),
           description = COALESCE($3, description),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [room_number, name, description, roomId]
    );

    console.log('📊 Update result rows:', result.rows.length);
    if (result.rows.length > 0) {
      console.log('✅ Room updated successfully:', result.rows[0]);
    }

    return NextResponse.json({
      success: true,
      message: 'Room updated successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error updating room:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update room' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('📥 DELETE /api/bed-config/rooms/[id] - Starting request');
  
  try {
         requireRole(req, ['admin','helpdesk']);
    const { id } = await params;
    console.log('📦 Received params:', { id });
    
    const roomId = parseInt(id);
    console.log('🔢 Parsed room ID:', roomId, 'Type:', typeof roomId);
    
    if (isNaN(roomId)) {
      console.log('❌ Invalid room ID - not a number');
      return NextResponse.json(
        { success: false, message: 'Invalid room ID' },
        { status: 400 }
      );
    }

    // Check if room exists
    console.log('🔍 Checking if room exists with ID:', roomId);
    const roomCheck = await query(
      'SELECT id FROM rooms WHERE id = $1',
      [roomId]
    );

    if (roomCheck.rows.length === 0) {
      console.log('❌ Room not found with ID:', roomId);
      return NextResponse.json(
        { success: false, message: 'Room not found' },
        { status: 404 }
      );
    }
    console.log('✅ Room exists');

    // IMPORTANT FIX: Check if room has ANY beds (active OR inactive)
    // Remove the AND is_active = true condition
    console.log('🔍 Checking if room has any beds, ID:', roomId);
    const beds = await query(
      'SELECT id, is_active FROM beds WHERE room_id = $1 LIMIT 1',
      [roomId]
    );
    console.log('📊 Beds check result rows:', beds.rows.length);

    if (beds.rows.length > 0) {
      const bedStatus = beds.rows[0].is_active ? 'active' : 'inactive';
      console.log(`❌ Room has ${bedStatus} beds, cannot delete`);
      return NextResponse.json(
        { 
          success: false, 
          message: `Cannot delete room because it has ${bedStatus} beds. Delete or move the beds first.` 
        },
        { status: 400 }
      );
    }

    // Hard delete the room
    console.log('🗑️ Deleting room from database...');
    await query('DELETE FROM rooms WHERE id = $1', [roomId]);
    console.log('✅ Room deleted successfully');

    return NextResponse.json({
      success: true,
      message: 'Room deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting room:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete room' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('📥 PATCH /api/bed-config/rooms/[id] - Starting request');
  
  try {
         requireRole(req, ['admin','helpdesk']);
    const { id } = await params;
    console.log('📦 Received params:', { id });
    
    const roomId = parseInt(id);
    console.log('🔢 Parsed room ID:', roomId, 'Type:', typeof roomId);
    
    if (isNaN(roomId)) {
      console.log('❌ Invalid room ID - not a number');
      return NextResponse.json(
        { success: false, message: 'Invalid room ID' },
        { status: 400 }
      );
    }

    const body = await req.json();
    console.log('📦 Request body:', JSON.stringify(body, null, 2));
    
    // Check if room exists first
    console.log('🔍 Checking if room exists with ID:', roomId);
    const roomCheck = await query(
      'SELECT id FROM rooms WHERE id = $1',
      [roomId]
    );

    if (roomCheck.rows.length === 0) {
      console.log('❌ Room not found with ID:', roomId);
      return NextResponse.json(
        { success: false, message: 'Room not found' },
        { status: 404 }
      );
    }
    
    // Build dynamic update query for partial updates
    const updates = [];
    const values = [];
    let paramIndex = 1;

    // Allowed fields for PATCH
    const allowedFields = ['room_number', 'name', 'description'];

    for (const [key, value] of Object.entries(body)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
        console.log(`✅ Adding field to update: ${key} =`, value);
      }
    }

    if (updates.length === 0) {
      console.log('❌ No valid fields to update');
      return NextResponse.json(
        { success: false, message: 'No valid fields to update' },
        { status: 400 }
      );
    }

    values.push(roomId);
    const result = await query(
      `UPDATE rooms 
       SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );

    console.log('📊 Update result rows:', result.rows.length);
    if (result.rows.length > 0) {
      console.log('✅ Room updated successfully:', result.rows[0]);
    }

    return NextResponse.json({
      success: true,
      message: 'Room updated successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error updating room:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update room' },
      { status: 500 }
    );
  }
}