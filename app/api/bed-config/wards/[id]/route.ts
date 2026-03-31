// import { NextRequest, NextResponse } from 'next/server';
// import { query } from '@/lib/db';
// import { z } from 'zod';

// const WardUpdateSchema = z.object({
//   name: z.string().min(1).max(100).optional(),
//   type: z.enum(['General', 'Semi-Special', 'Special', 'VIP', 'ICU', 'Pediatric']).optional(),
//   patient_category: z.enum(['Male', 'Female', 'Children', 'Mixed']).optional(),
//   description: z.string().optional().nullable(),
//   is_active: z.boolean().optional()
// });

// export async function GET(
//   req: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   // Await the params
//   const { id } = await params;
//   console.log('📥 GET /api/bed-config/wards/[id] - ID:', id);
  
//   try {
//     const wardId = parseInt(id);
//     console.log('Parsed ID:', wardId, 'Type:', typeof wardId);
    
//     if (isNaN(wardId)) {
//       console.log('❌ Invalid ward ID - not a number');
//       return NextResponse.json(
//         { success: false, message: 'Invalid ward ID' },
//         { status: 400 }
//       );
//     }

//     console.log('🔍 Querying database for ward ID:', wardId);
//     const result = await query(
//       `SELECT w.*, f.floor_number 
//        FROM wards w
//        JOIN floors f ON w.floor_id = f.id
//        WHERE w.id = $1`,
//       [wardId]
//     );

//     console.log('📊 Query result rows:', result.rows.length);
//     if (result.rows.length > 0) {
//       console.log('✅ Ward found:', result.rows[0]);
//     } else {
//       console.log('❌ Ward not found in database');
//     }

//     if (result.rows.length === 0) {
//       return NextResponse.json(
//         { success: false, message: 'Ward not found' },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({
//       success: true,
//       data: result.rows[0]
//     });

//   } catch (error) {
//     console.error('❌ Error fetching ward:', error);
//     return NextResponse.json(
//       { success: false, message: 'Failed to fetch ward' },
//       { status: 500 }
//     );
//   }
// }

// export async function PUT(
//   req: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   // Await the params
//   const { id } = await params;
//   console.log('📥 PUT /api/bed-config/wards/[id] - ID:', id);
  
//   try {
//     const wardId = parseInt(id);
//     console.log('Parsed ID:', wardId, 'Type:', typeof wardId);
    
//     if (isNaN(wardId)) {
//       console.log('❌ Invalid ward ID - not a number');
//       return NextResponse.json(
//         { success: false, message: 'Invalid ward ID' },
//         { status: 400 }
//       );
//     }

//     const body = await req.json();
//     console.log('📦 Request body:', JSON.stringify(body, null, 2));

//     const validation = WardUpdateSchema.safeParse(body);
//     console.log('✅ Validation result:', validation.success);

//     if (!validation.success) {
//       console.log('❌ Validation failed:', validation.error.flatten().fieldErrors);
//       return NextResponse.json(
//         { success: false, message: 'Validation failed', errors: validation.error.flatten().fieldErrors },
//         { status: 400 }
//       );
//     }

//     const { name, type, patient_category, description, is_active } = validation.data;
//     console.log('📝 Update data:', { name, type, patient_category, description, is_active });

//     // First check if ward exists
//     console.log('🔍 Checking if ward exists with ID:', wardId);
//     const checkResult = await query('SELECT id FROM wards WHERE id = $1', [wardId]);
//     console.log('✅ Check result rows:', checkResult.rows.length);

//     if (checkResult.rows.length === 0) {
//       console.log('❌ Ward not found with ID:', wardId);
//       return NextResponse.json(
//         { success: false, message: `Ward with ID ${wardId} not found` },
//         { status: 404 }
//       );
//     }
//     console.log('✅ Ward exists, proceeding with update');

//     const result = await query(
//       `UPDATE wards 
//        SET name = COALESCE($1, name),
//            type = COALESCE($2, type),
//            patient_category = COALESCE($3, patient_category),
//            description = COALESCE($4, description),
//            is_active = COALESCE($5, is_active),
//            updated_at = CURRENT_TIMESTAMP
//        WHERE id = $6
//        RETURNING *`,
//       [name, type, patient_category, description, is_active, wardId]
//     );

//     console.log('📊 Update result rows:', result.rows.length);
//     if (result.rows.length > 0) {
//       console.log('✅ Ward updated successfully:', result.rows[0]);
//     }

//     if (result.rows.length === 0) {
//       console.log('❌ Ward not found after update check');
//       return NextResponse.json(
//         { success: false, message: 'Ward not found' },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({
//       success: true,
//       message: 'Ward updated successfully',
//       data: result.rows[0]
//     });

//   } catch (error) {
//     console.error('❌ Error updating ward:', error);
//     return NextResponse.json(
//       { success: false, message: 'Failed to update ward' },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(
//   req: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   // Await the params
//   const { id } = await params;
//   console.log('📥 DELETE /api/bed-config/wards/[id] - ID:', id);
  
//   try {
//     const wardId = parseInt(id);
//     console.log('Parsed ID:', wardId, 'Type:', typeof wardId);
    
//     if (isNaN(wardId)) {
//       console.log('❌ Invalid ward ID - not a number');
//       return NextResponse.json(
//         { success: false, message: 'Invalid ward ID' },
//         { status: 400 }
//       );
//     }

//     // Check if ward has beds
//     console.log('🔍 Checking if ward has beds, ID:', wardId);
//     const beds = await query(
//       'SELECT id FROM beds WHERE ward_id = $1 AND is_active = true LIMIT 1',
//       [wardId]
//     );
//     console.log('📊 Beds check result rows:', beds.rows.length);

//     if (beds.rows.length > 0) {
//       console.log('❌ Ward has active beds, cannot delete');
//       return NextResponse.json(
//         { success: false, message: 'Cannot delete ward with active beds. Deactivate beds first.' },
//         { status: 400 }
//       );
//     }

//     // Soft delete
//     console.log('🔍 Soft deleting ward, ID:', wardId);
//     const result = await query(
//       'UPDATE wards SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id',
//       [wardId]
//     );
//     console.log('📊 Delete result rows:', result.rows.length);

//     if (result.rows.length === 0) {
//       console.log('❌ Ward not found for deletion');
//       return NextResponse.json(
//         { success: false, message: 'Ward not found' },
//         { status: 404 }
//       );
//     }

//     console.log('✅ Ward deactivated successfully');
//     return NextResponse.json({
//       success: true,
//       message: 'Ward deactivated successfully'
//     });

//   } catch (error) {
//     console.error('❌ Error deleting ward:', error);
//     return NextResponse.json(
//       { success: false, message: 'Failed to delete ward' },
//       { status: 500 }
//     );
//   }
// }


import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { z } from 'zod';

const WardUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum(['General', 'Semi-Special', 'Special', 'VIP', 'ICU', 'Pediatric']).optional(),
  patient_category: z.enum(['Male', 'Female', 'Children', 'Mixed']).optional(),
  description: z.string().optional().nullable(),
  is_active: z.boolean().optional(),
  daily_rate: z.number().min(0).optional(),          // ✅ added
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log('📥 GET /api/bed-config/wards/[id] - ID:', id);
  
  try {
    const wardId = parseInt(id);
    if (isNaN(wardId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid ward ID' },
        { status: 400 }
      );
    }

    const result = await query(
      `SELECT w.*, f.floor_number 
       FROM wards w
       JOIN floors f ON w.floor_id = f.id
       WHERE w.id = $1`,
      [wardId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Ward not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error fetching ward:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch ward' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log('📥 PUT /api/bed-config/wards/[id] - ID:', id);
  
  try {
    const wardId = parseInt(id);
    if (isNaN(wardId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid ward ID' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const validation = WardUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, type, patient_category, description, is_active, daily_rate } = validation.data;

    // Check if ward exists
    const checkResult = await query('SELECT id FROM wards WHERE id = $1', [wardId]);
    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: `Ward with ID ${wardId} not found` },
        { status: 404 }
      );
    }

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (name !== undefined) {
      updates.push(`name = $${idx++}`);
      values.push(name);
    }
    if (type !== undefined) {
      updates.push(`type = $${idx++}`);
      values.push(type);
    }
    if (patient_category !== undefined) {
      updates.push(`patient_category = $${idx++}`);
      values.push(patient_category);
    }
    if (description !== undefined) {
      updates.push(`description = $${idx++}`);
      values.push(description);
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${idx++}`);
      values.push(is_active);
    }
    if (daily_rate !== undefined) {
      updates.push(`daily_rate = $${idx++}`);
      values.push(daily_rate);
    }

    if (updates.length === 0) {
      return NextResponse.json({ success: false, message: 'No fields to update' }, { status: 400 });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(wardId);

    const result = await query(
      `UPDATE wards SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );

    return NextResponse.json({
      success: true,
      message: 'Ward updated successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error updating ward:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update ward' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log('📥 DELETE /api/bed-config/wards/[id] - ID:', id);
  
  try {
    const wardId = parseInt(id);
    if (isNaN(wardId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid ward ID' },
        { status: 400 }
      );
    }

    // Check if ward has active beds
    const beds = await query(
      'SELECT id FROM beds WHERE ward_id = $1 AND is_active = true LIMIT 1',
      [wardId]
    );
    if (beds.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete ward with active beds. Deactivate beds first.' },
        { status: 400 }
      );
    }

    // Soft delete
    const result = await query(
      'UPDATE wards SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id',
      [wardId]
    );
    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Ward not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Ward deactivated successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting ward:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete ward' },
      { status: 500 }
    );
  }
}