import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authErrorResponse,requireRole } from '@/lib/auth/guards';

export async function GET(req: NextRequest) {
  try {
      requireRole(req, ['pharmacy']);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'pending';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const offset = (page - 1) * limit;

    // Get prescriptions with patient and doctor details
    const result = await query(
      `SELECT 
         p.id,
         p.patient_id,
         pt.full_name_en as patient_name,
         pt.age,
         pt.gender,
         p.doctor_id,
         d.first_name || ' ' || d.last_name as doctor_name,
         p.consultation_id,
         p.prescription_date,
         p.status,
         p.notes,
         p.created_at,
         p.updated_at
       FROM prescriptions p
       LEFT JOIN patients pt ON p.patient_id = pt.patient_id
       LEFT JOIN doctors d ON p.doctor_id = d.id
       WHERE p.status = $1
       ORDER BY p.prescription_date DESC
       LIMIT $2 OFFSET $3`,
      [status, limit, offset]
    );

    // For each prescription, fetch its items with current stock
    const prescriptions = [];
    for (const row of result.rows) {
      const itemsResult = await query(
        `SELECT 
           pi.id,
           pi.medicine_id,
           m.name as medicine_name,
           pi.prescribed_qty,
           pi.dispensed_qty,
           pi.instructions,
           COALESCE((SELECT SUM(quantity) FROM stock WHERE medicine_id = pi.medicine_id), 0) as available_qty
         FROM prescription_items pi
         JOIN medicines m ON pi.medicine_id = m.id
         WHERE pi.prescription_id = $1`,
        [row.id]
      );
      prescriptions.push({
        ...row,
        items: itemsResult.rows,
      });
    }

    // Count total for pagination
    const countResult = await query('SELECT COUNT(*) FROM prescriptions WHERE status = $1', [status]);
    const total = parseInt(countResult.rows[0].count);

    return NextResponse.json({
      success: true,
      data: prescriptions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
        const authResponse=authErrorResponse(error);
if(authResponse){
  return authResponse
}
    return NextResponse.json(
      { success: false, message: 'Failed to fetch prescriptions' },
      { status: 500 }
    );
  }
}