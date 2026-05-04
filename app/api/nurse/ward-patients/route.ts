// app/api/nurse/ward-patients/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const nurseId = url.searchParams.get('nurseId');
    const status = url.searchParams.get('status') || 'active';
    const search = url.searchParams.get('search');

    if (!nurseId) {
      return NextResponse.json(
        { success: false, message: 'Nurse ID is required' },
        { status: 400 }
      );
    }

    // Step 1: Get the nurse's assigned ward from staff table
    const nurseResult = await query(
      `SELECT ward_id, first_name, last_name 
       FROM staff 
       WHERE id = $1 AND role ILIKE '%nurse%'`,
      [parseInt(nurseId)]
    );

    if (nurseResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Nurse not found or not assigned to a ward' },
        { status: 404 }
      );
    }

    const wardId = nurseResult.rows[0].ward_id;
    const nurseName = `${nurseResult.rows[0].first_name} ${nurseResult.rows[0].last_name}`;

    if (!wardId) {
      return NextResponse.json(
        { success: false, message: 'Nurse is not assigned to any ward' },
        { status: 400 }
      );
    }

    // Step 2: Get ward details
    const wardResult = await query(
      `SELECT id, name, type FROM wards WHERE id = $1`,
      [wardId]
    );

    const wardInfo = wardResult.rows[0] || null;

    // Step 3: Get patients in this ward
    let sql = `
      SELECT 
        a.id,
        a.patient_id,
        a.admission_date,
        a.discharge_date,
        a.status,
        a.reason,
        a.diagnosis,
        p.full_name_en as patient_name,
        p.phone as patient_phone,
        p.dob,
        p.gender,
        p.blood_group,
        w.name as ward_name,
        w.type as ward_type,
        b.bed_number,
        b.id as bed_id
      FROM admissions a
      LEFT JOIN patients p ON a.patient_id = p.patient_id
      LEFT JOIN wards w ON a.ward_id = w.id
      LEFT JOIN beds b ON a.bed_id = b.id
      WHERE a.ward_id = $1
    `;
    
    const params: any[] = [wardId];
    let paramIndex = 2;

    if (status && status !== 'all') {
      sql += ` AND a.status = $${paramIndex++}`;
      params.push(status);
    }

    if (search) {
      sql += ` AND (p.full_name_en ILIKE $${paramIndex} OR a.patient_id::text ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    sql += ` ORDER BY 
      CASE WHEN a.status = 'active' THEN 1 ELSE 2 END,
      a.admission_date DESC`;

    const result = await query(sql, params);

    // Step 4: Get bed statistics for this ward
    const bedStats = await query(
      `SELECT 
        COUNT(*) as total_beds,
        COUNT(CASE WHEN status = 'occupied' THEN 1 END) as occupied_beds,
        COUNT(CASE WHEN status = 'available' THEN 1 END) as available_beds
      FROM beds 
      WHERE ward_id = $1`,
      [wardId]
    );

    return NextResponse.json({ 
      success: true,
      nurse: {
        id: parseInt(nurseId),
        name: nurseName,
      },
      ward: wardInfo,
      bedStats: bedStats.rows[0],
      data: result.rows,
      count: result.rows.length,
    });

  } catch (error: any) {
    console.error('Error fetching ward patients:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}