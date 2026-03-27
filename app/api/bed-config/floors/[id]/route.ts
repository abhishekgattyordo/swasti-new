import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { z } from 'zod';

const FloorUpdateSchema = z.object({
  floor_number: z.number().int().positive().optional(),
  name: z.string().max(100).optional().nullable()
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('📥 GET /api/bed-config/floors/[id] - Starting request');
  
  try {
    // AWAIT the params - this is the critical fix
    const { id } = await params;
    console.log('📦 Received params:', { id });
    
    const floorId = parseInt(id);
    console.log('🔢 Parsed floor ID:', floorId, 'Type:', typeof floorId);
    
    if (isNaN(floorId)) {
      console.log('❌ Invalid floor ID - not a number');
      return NextResponse.json(
        { success: false, message: 'Invalid floor ID' },
        { status: 400 }
      );
    }

    console.log('🔍 Querying database for floor ID:', floorId);
    const result = await query(
      'SELECT * FROM floors WHERE id = $1',
      [floorId]
    );

    console.log('📊 Query result rows:', result.rows.length);
    if (result.rows.length > 0) {
      console.log('✅ Floor found:', result.rows[0]);
    } else {
      console.log('❌ Floor not found in database');
    }

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Floor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error fetching floor:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch floor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('📥 PUT /api/bed-config/floors/[id] - Starting request');
  
  try {
    // AWAIT the params - this is the critical fix
    const { id } = await params;
    console.log('📦 Received params:', { id });
    
    const floorId = parseInt(id);
    console.log('🔢 Parsed floor ID:', floorId, 'Type:', typeof floorId);
    
    if (isNaN(floorId)) {
      console.log('❌ Invalid floor ID - not a number');
      return NextResponse.json(
        { success: false, message: 'Invalid floor ID' },
        { status: 400 }
      );
    }

    const body = await req.json();
    console.log('📦 Request body:', JSON.stringify(body, null, 2));

    const validation = FloorUpdateSchema.safeParse(body);
    console.log('✅ Validation result:', validation.success);

    if (!validation.success) {
      console.log('❌ Validation failed:', validation.error.flatten().fieldErrors);
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { floor_number, name } = validation.data;
    console.log('📝 Update data:', { floor_number, name });

    // Check if floor exists
    console.log('🔍 Checking if floor exists with ID:', floorId);
    const existing = await query(
      'SELECT id FROM floors WHERE id = $1',
      [floorId]
    );
    console.log('✅ Existing floor check rows:', existing.rows.length);

    if (existing.rows.length === 0) {
      console.log('❌ Floor not found with ID:', floorId);
      return NextResponse.json(
        { success: false, message: 'Floor not found' },
        { status: 404 }
      );
    }
    console.log('✅ Floor exists, proceeding with update');

    // Check for duplicate floor number
    if (floor_number) {
      console.log('🔍 Checking for duplicate floor number:', floor_number);
      const duplicate = await query(
        'SELECT id FROM floors WHERE floor_number = $1 AND id != $2',
        [floor_number, floorId]
      );
      console.log('✅ Duplicate check rows:', duplicate.rows.length);
      
      if (duplicate.rows.length > 0) {
        console.log('❌ Floor number already exists:', floor_number);
        return NextResponse.json(
          { success: false, message: `Floor ${floor_number} already exists` },
          { status: 409 }
        );
      }
      console.log('✅ Floor number is unique');
    }

    console.log('📝 Updating floor in database...');
    const result = await query(
      `UPDATE floors 
       SET floor_number = COALESCE($1, floor_number),
           name = COALESCE($2, name),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [floor_number, name, floorId]
    );

    console.log('📊 Update result rows:', result.rows.length);
    if (result.rows.length > 0) {
      console.log('✅ Floor updated successfully:', result.rows[0]);
    }

    return NextResponse.json({
      success: true,
      message: 'Floor updated successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error updating floor:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update floor' },
      { status: 500 }
    );
  }
}



export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('📥 DELETE /api/bed-config/floors/[id] - Starting request');
  
  try {
    // AWAIT the params - this is the critical fix
    const { id } = await params;
    console.log('📦 Received params:', { id });
    
    const floorId = parseInt(id);
    console.log('🔢 Parsed floor ID:', floorId, 'Type:', typeof floorId);
    
    if (isNaN(floorId)) {
      console.log('❌ Invalid floor ID - not a number');
      return NextResponse.json(
        { success: false, message: 'Invalid floor ID' },
        { status: 400 }
      );
    }

    // Check if floor has wards
    console.log('🔍 Checking if floor has wards, ID:', floorId);
   const wards = await query(
  'SELECT id FROM wards WHERE floor_id = $1 AND is_active = true LIMIT 1',
  [floorId]
);
    console.log('📊 Wards check result rows:', wards.rows.length);

    if (wards.rows.length > 0) {
      console.log('❌ Floor has wards, cannot delete');
      return NextResponse.json(
        { success: false, message: 'Cannot delete floor with existing wards. Delete wards first.' },
        { status: 400 }
      );
    }

    // Check if floor exists before deleting
    console.log('🔍 Checking if floor exists, ID:', floorId);
    const floor = await query(
      'SELECT id FROM floors WHERE id = $1',
      [floorId]
    );
    console.log('📊 Floor exists check:', floor.rows.length > 0);

    if (floor.rows.length === 0) {
      console.log('❌ Floor not found with ID:', floorId);
      return NextResponse.json(
        { success: false, message: 'Floor not found' },
        { status: 404 }
      );
    }

    console.log('🗑️ Deleting floor from database...');
    await query('DELETE FROM floors WHERE id = $1', [floorId]);
    console.log('✅ Floor deleted successfully');

    return NextResponse.json({
      success: true,
      message: 'Floor deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting floor:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete floor' },
      { status: 500 }
    );
  }
}