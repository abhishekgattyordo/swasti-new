import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { z } from 'zod';
import { authErrorResponse,requireRole } from '@/lib/auth/guards';

const BedUpdateSchema = z.object({
  bed_number: z.string().min(1).max(50).optional(),
  room_id: z.number().int().positive().optional().nullable(),
  status: z.enum(['available', 'occupied', 'cleaning', 'maintenance', 'reserved']).optional(),
  patient_category: z.enum(['Male', 'Female', 'Children', 'Mixed']).optional(),
attributes: z.record(z.string(), z.any()).optional(),
  is_active: z.boolean().optional()
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('📥 GET /api/bed-config/beds/[id] - Starting request');
  
  try {
      requireRole(req, ['admin','helpdesk']);
    const { id } = await params;
    console.log('📦 Received params:', { id });
    
    const bedId = parseInt(id);
    console.log('🔢 Parsed bed ID:', bedId, 'Type:', typeof bedId);
    
    if (isNaN(bedId)) {
      console.log('❌ Invalid bed ID - not a number');
      return NextResponse.json(
        { success: false, message: 'Invalid bed ID' },
        { status: 400 }
      );
    }

    console.log('🔍 Querying database for bed ID:', bedId);
    const result = await query(
      `SELECT b.*, 
              w.name as ward_name, 
              w.type as ward_type,
              r.room_number,
              f.floor_number
       FROM beds b
       JOIN wards w ON b.ward_id = w.id
       JOIN floors f ON w.floor_id = f.id
       LEFT JOIN rooms r ON b.room_id = r.id
       WHERE b.id = $1`,
      [bedId]
    );

    console.log('📊 Query result rows:', result.rows.length);
    if (result.rows.length > 0) {
      console.log('✅ Bed found:', result.rows[0]);
    } else {
      console.log('❌ Bed not found in database');
    }

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Bed not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error fetching bed:', error);
      const authResponse=authErrorResponse(error);

if(authResponse){
  return authResponse
}
    return NextResponse.json(
      { success: false, message: 'Failed to fetch bed' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('📥 PUT /api/bed-config/beds/[id] - Starting request');
  
  try {
      requireRole(req, ['admin','helpdesk']);
    const { id } = await params;
    console.log('📦 Received params:', { id });
    
    
    const bedId = parseInt(id);
    console.log('🔢 Parsed bed ID:', bedId, 'Type:', typeof bedId);
    
    if (isNaN(bedId)) {
      console.log('❌ Invalid bed ID - not a number');
      return NextResponse.json(
        { success: false, message: 'Invalid bed ID' },
        { status: 400 }
      );
    }

    const body = await req.json();
    console.log('📦 Request body:', JSON.stringify(body, null, 2));

    const validation = BedUpdateSchema.safeParse(body);
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

    const { bed_number, room_id, status, patient_category, attributes, is_active } = validation.data;
    console.log('📝 Update data:', { bed_number, room_id, status, patient_category, is_active });

    // Check if bed exists
    console.log('🔍 Checking if bed exists with ID:', bedId);
    const existingBed = await query(
      'SELECT ward_id FROM beds WHERE id = $1',
      [bedId]
    );

    if (existingBed.rows.length === 0) {
      console.log('❌ Bed not found with ID:', bedId);
      return NextResponse.json(
        { success: false, message: 'Bed not found' },
        { status: 404 }
      );
    }

    const ward_id = existingBed.rows[0].ward_id;
    console.log('✅ Bed exists in ward:', ward_id);

    // Check for duplicate bed number in same ward (if bed_number is being updated)
    if (bed_number) {
      console.log('🔍 Checking for duplicate bed number:', bed_number);
      const duplicate = await query(
        'SELECT id FROM beds WHERE ward_id = $1 AND bed_number = $2 AND id != $3',
        [ward_id, bed_number, bedId]
      );

      if (duplicate.rows.length > 0) {
        console.log('❌ Bed number already exists in this ward');
        return NextResponse.json(
          { success: false, message: `Bed ${bed_number} already exists in this ward` },
          { status: 409 }
        );
      }
      console.log('✅ Bed number is unique');
    }

    // If room_id is provided, verify it belongs to the same ward
    if (room_id) {
      console.log('🔍 Verifying room belongs to ward:', room_id, ward_id);
      const roomCheck = await query(
        'SELECT id FROM rooms WHERE id = $1 AND ward_id = $2',
        [room_id, ward_id]
      );

      if (roomCheck.rows.length === 0) {
        console.log('❌ Room does not belong to this ward');
        return NextResponse.json(
          { success: false, message: 'Room does not belong to this ward' },
          { status: 400 }
        );
      }
      console.log('✅ Room verified');
    }

    console.log('📝 Updating bed in database...');
    const result = await query(
      `UPDATE beds 
       SET bed_number = COALESCE($1, bed_number),
           room_id = COALESCE($2, room_id),
           status = COALESCE($3, status),
           patient_category = COALESCE($4, patient_category),
           attributes = COALESCE($5, attributes),
           is_active = COALESCE($6, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [bed_number, room_id, status, patient_category, attributes, is_active, bedId]
    );

    console.log('📊 Update result rows:', result.rows.length);
    if (result.rows.length > 0) {
      console.log('✅ Bed updated successfully:', result.rows[0]);
    }

    return NextResponse.json({
      success: true,
      message: 'Bed updated successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error updating bed:', error);
      const authResponse=authErrorResponse(error);

if(authResponse){
  return authResponse
}
    return NextResponse.json(
      { success: false, message: 'Failed to update bed' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('📥 DELETE /api/bed-config/beds/[id] - Starting request');
  
  try {
      requireRole(req, ['admin','helpdesk']);
    const { id } = await params;
    console.log('📦 Received params:', { id });
    
    const bedId = parseInt(id);
    console.log('🔢 Parsed bed ID:', bedId, 'Type:', typeof bedId);
    
    if (isNaN(bedId)) {
      console.log('❌ Invalid bed ID - not a number');
      return NextResponse.json(
        { success: false, message: 'Invalid bed ID' },
        { status: 400 }
      );
    }

    // Check if bed exists
    console.log('🔍 Checking if bed exists with ID:', bedId);
    const bedCheck = await query(
      'SELECT status, is_active FROM beds WHERE id = $1',
      [bedId]
    );

    if (bedCheck.rows.length === 0) {
      console.log('❌ Bed not found with ID:', bedId);
      return NextResponse.json(
        { success: false, message: 'Bed not found' },
        { status: 404 }
      );
    }

    const bed = bedCheck.rows[0];
    console.log('✅ Bed found:', bed);

    // Check if bed is occupied
    if (bed.status === 'occupied') {
      console.log('❌ Cannot delete occupied bed');
      return NextResponse.json(
        { 
          success: false, 
          message: 'Cannot delete an occupied bed. Transfer patient first.' 
        },
        { status: 400 }
      );
    }

    // Option 1: Hard delete
    console.log('🗑️ Hard deleting bed from database...');
    await query('DELETE FROM beds WHERE id = $1', [bedId]);
    console.log('✅ Bed hard deleted successfully');

    // Option 2: Soft delete (uncomment if you prefer soft delete)
    // console.log('🗑️ Soft deleting bed...');
    // await query(
    //   'UPDATE beds SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
    //   [bedId]
    // );
    // console.log('✅ Bed soft deleted successfully');

    return NextResponse.json({
      success: true,
      message: 'Bed deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting bed:', error);
        const authResponse=authErrorResponse(error);

if(authResponse){
  return authResponse
}
    return NextResponse.json(
      { success: false, message: 'Failed to delete bed' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('📥 PATCH /api/bed-config/beds/[id] - Starting request');
  
  try {
      requireRole(req, ['admin','helpdesk']);
    const { id } = await params;
    console.log('📦 Received params:', { id });
    
    const bedId = parseInt(id);
    console.log('🔢 Parsed bed ID:', bedId, 'Type:', typeof bedId);
    
    if (isNaN(bedId)) {
      console.log('❌ Invalid bed ID - not a number');
      return NextResponse.json(
        { success: false, message: 'Invalid bed ID' },
        { status: 400 }
      );
    }

    const body = await req.json();
    console.log('📦 Request body:', JSON.stringify(body, null, 2));
    
    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramIndex = 1;

    // Allowed fields for PATCH
    const allowedFields = ['status', 'patient_category', 'attributes', 'room_id'];

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

    values.push(bedId);
    const result = await query(
      `UPDATE beds 
       SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      console.log('❌ Bed not found after update');
      return NextResponse.json(
        { success: false, message: 'Bed not found' },
        { status: 404 }
      );
    }

    console.log('✅ Bed updated successfully:', result.rows[0]);
    return NextResponse.json({
      success: true,
      message: 'Bed updated successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error updating bed:', error);
        const authResponse=authErrorResponse(error);

if(authResponse){
  return authResponse
}
    return NextResponse.json(
      { success: false, message: 'Failed to update bed' },
      { status: 500 }
    );
  }
}

// Special endpoint for transferring bed
// export async function POST(
//   req: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   console.log('📥 POST /api/bed-config/beds/[id]/transfer - Starting request');
  
//   try {
//     const { id } = await params;
//     console.log('📦 Received params:', { id });
    
//     const bedId = parseInt(id);
//     console.log('🔢 Parsed bed ID:', bedId, 'Type:', typeof bedId);
    
//     if (isNaN(bedId)) {
//       console.log('❌ Invalid bed ID - not a number');
//       return NextResponse.json(
//         { success: false, message: 'Invalid bed ID' },
//         { status: 400 }
//       );
//     }

//     const body = await req.json();
//     console.log('📦 Request body:', JSON.stringify(body, null, 2));
    
//     const { action } = body;

//     if (action === 'transfer') {
//       const { new_room_id } = body;

//       if (!new_room_id) {
//         console.log('❌ New room ID required');
//         return NextResponse.json(
//           { success: false, message: 'New room ID required' },
//           { status: 400 }
//         );
//       }

//       // Verify bed exists and get its ward
//       console.log('🔍 Checking if bed exists with ID:', bedId);
//       const bed = await query(
//         'SELECT ward_id FROM beds WHERE id = $1',
//         [bedId]
//       );

//       if (bed.rows.length === 0) {
//         console.log('❌ Bed not found with ID:', bedId);
//         return NextResponse.json(
//           { success: false, message: 'Bed not found' },
//           { status: 404 }
//         );
//       }

//       const ward_id = bed.rows[0].ward_id;
//       console.log('✅ Bed found in ward:', ward_id);

//       // Verify new room belongs to same ward
//       console.log('🔍 Verifying room belongs to ward:', new_room_id, ward_id);
//       const room = await query(
//         'SELECT id FROM rooms WHERE id = $1 AND ward_id = $2',
//         [new_room_id, ward_id]
//       );

//       if (room.rows.length === 0) {
//         console.log('❌ Room does not belong to this ward');
//         return NextResponse.json(
//           { success: false, message: 'Room does not belong to this ward' },
//           { status: 400 }
//         );
//       }
//       console.log('✅ Room verified');

//       console.log('📝 Transferring bed to new room...');
//       const result = await query(
//         `UPDATE beds 
//          SET room_id = $1, updated_at = CURRENT_TIMESTAMP
//          WHERE id = $2
//          RETURNING *`,
//         [new_room_id, bedId]
//       );

//       console.log('✅ Bed transferred successfully:', result.rows[0]);
//       return NextResponse.json({
//         success: true,
//         message: 'Bed transferred successfully',
//         data: result.rows[0]
//       });
//     }

//     console.log('❌ Invalid action:', action);
//     return NextResponse.json(
//       { success: false, message: 'Invalid action' },
//       { status: 400 }
//     );

//   } catch (error) {
//     console.error('❌ Error transferring bed:', error);
//     return NextResponse.json(
//       { success: false, message: 'Failed to transfer bed' },
//       { status: 500 }
//     );
//   }
// }