// app/api/doctor/my-patients/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const doctorId = url.searchParams.get('doctorId');
    const doctorName = url.searchParams.get('doctorName');
    const status = url.searchParams.get('status') || 'active';
    const search = url.searchParams.get('search');

    if (!doctorId && !doctorName) {
      return NextResponse.json(
        { success: false, message: 'Doctor ID or name is required' },
        { status: 400 }
      );
    }

    let sql = `
      SELECT 
        a.id,
        a.patient_id,
        a.admission_date,
        a.discharge_date,
        a.status,
        a.reason,
        a.diagnosis,
        a.primary_consultant,
        a.consultant_dept,
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
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramIndex = 1;

    // Filter by doctor ID or name
    if (doctorId) {
      // If doctorId is provided, find doctor's name first
      const doctorResult = await query(
        `SELECT first_name, last_name FROM doctors WHERE id = $1`,
        [parseInt(doctorId)]
      );
      
      if (doctorResult.rows.length > 0) {
        const doctorFullName = `Dr. ${doctorResult.rows[0].first_name} ${doctorResult.rows[0].last_name}`;
        sql += ` AND a.primary_consultant ILIKE $${paramIndex++}`;
        params.push(`%${doctorFullName}%`);
      }
    } else if (doctorName) {
      sql += ` AND a.primary_consultant ILIKE $${paramIndex++}`;
      params.push(`%${doctorName}%`);
    }

    // Filter by status
    if (status && status !== 'all') {
      sql += ` AND a.status = $${paramIndex++}`;
      params.push(status);
    }

    // Search by patient name or ID
    if (search) {
      sql += ` AND (p.full_name_en ILIKE $${paramIndex} OR a.patient_id::text ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    sql += ` ORDER BY 
      CASE WHEN a.status = 'active' THEN 1 ELSE 2 END,
      a.admission_date DESC`;

    const result = await query(sql, params);

    // Get stats
    const statsSql = `
      SELECT 
        COUNT(*) as total_patients,
        COUNT(CASE WHEN a.status = 'active' THEN 1 END) as active_patients,
        COUNT(CASE WHEN a.status = 'discharged' THEN 1 END) as discharged_patients
      FROM admissions a
      WHERE a.primary_consultant ILIKE $1
    `;
    
    const doctorNameForStats = doctorName || '';
    const statsResult = await query(statsSql, [`%${doctorNameForStats}%`]);

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
      stats: statsResult.rows[0] || { total_patients: 0, active_patients: 0, discharged_patients: 0 },
    });

  } catch (error: any) {
    console.error('Error fetching doctor patients:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}