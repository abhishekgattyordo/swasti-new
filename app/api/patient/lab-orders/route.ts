import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authErrorResponse,requireRole } from '@/lib/auth/guards';

export async function GET(req: NextRequest) {
  try {
       requireRole(req, ['patient']);
    const url = new URL(req.url);
    const patientId = url.searchParams.get('patientId');
    const status = url.searchParams.get('status');      
    const orderId = url.searchParams.get('orderId');    
    const fromDate = url.searchParams.get('fromDate');  
    const toDate = url.searchParams.get('toDate');      

    // Base SQL – always filter by patient_id if provided
    let sql = `
      SELECT 
        id,
        order_id,
        patient_id,
        patient_name,
        visit_type,
        visit_id,
        tests,
        total_amount,
        status,
        order_date,
        collected_date,
        completed_date,
        billing_entry_id,
        results,
        created_at
      FROM lab_orders
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    // Mandatory: patient ID (if you want to require it)
    if (!patientId) {
      return NextResponse.json(
        { success: false, message: 'patientId is required' },
        { status: 400 }
      );
    }
    sql += ` AND patient_id = $${paramIndex++}`;
    params.push(patientId);

    // Optional filters
    if (status) {
      sql += ` AND status = $${paramIndex++}`;
      params.push(status);
    }
    if (orderId) {
      sql += ` AND order_id = $${paramIndex++}`;
      params.push(orderId);
    }
    if (fromDate) {
      sql += ` AND order_date >= $${paramIndex++}`;
      params.push(fromDate);
    }
    if (toDate) {
      sql += ` AND order_date <= $${paramIndex++}`;
      params.push(toDate);
    }

    sql += ` ORDER BY order_date DESC, created_at DESC`;

    const result = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error: any) {
    console.error('Error fetching lab orders:', error);
        const authResponse=authErrorResponse(error);
if(authResponse){
  return authResponse
}
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}