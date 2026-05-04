// app/api/doctor/ward-nurses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const patientId = url.searchParams.get('patientId');

    if (!patientId) {
      return NextResponse.json(
        { success: false, message: 'Patient ID is required' },
        { status: 400 }
      );
    }

    // Step 1: Find which ward the patient is admitted to
    const admissionResult = await query(
      `SELECT a.ward_id, w.name as ward_name, w.type as ward_type
       FROM admissions a
       LEFT JOIN wards w ON a.ward_id = w.id
       WHERE a.patient_id = $1 AND a.status = 'active'
       LIMIT 1`,
      [patientId]
    );

    if (admissionResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Patient is not currently admitted' },
        { status: 404 }
      );
    }

    const wardId = admissionResult.rows[0].ward_id;
    const wardName = admissionResult.rows[0].ward_name;
    const wardType = admissionResult.rows[0].ward_type;

    if (!wardId) {
      return NextResponse.json(
        { success: false, message: 'Patient is not assigned to any ward' },
        { status: 404 }
      );
    }

    // Step 2: Get ward details
    const wardInfo = {
      id: wardId,
      name: wardName,
      type: wardType,
    };

    // Step 3: Get nurses assigned to this ward
    const nursesResult = await query(
      `SELECT 
        id, 
        first_name, 
        last_name, 
        email, 
        phone, 
        role, 
        department, 
        status,
        employee_id,
        ward_id
       FROM staff 
       WHERE ward_id = $1 
         AND LOWER(role) = 'nurse'
         AND status = 'active'
       ORDER BY first_name ASC`,
      [wardId]
    );

    // Step 4: Get ward stats
    const wardStats = await query(
      `SELECT 
        COUNT(*) as total_nurses,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_nurses
       FROM staff 
       WHERE ward_id = $1 
         AND LOWER(role) = 'nurse'
         AND status = 'active'`,
      [wardId]
    );

    return NextResponse.json({ 
      success: true,
      patient: {
        id: patientId,
        ward: wardInfo,
      },
      ward: wardInfo,
      stats: wardStats.rows[0],
      data: nursesResult.rows,
      count: nursesResult.rows.length,
    });

  } catch (error: any) {
    console.error('Error fetching ward nurses:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}