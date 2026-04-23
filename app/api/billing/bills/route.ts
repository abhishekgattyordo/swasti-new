import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authErrorResponse,requireRole } from '@/lib/auth/guards';

export async function GET(req: NextRequest) {
  try {
     requireRole(req, ['billing']);
    const url = new URL(req.url);
    const status = url.searchParams.get('status');

    let sql = `
      SELECT 
        b.id, 
        b.bill_number, 
        b.sale_id, 
        b.patient_id, 
        p.full_name_en as patient_name,
        b.admission_id, 
        b.total_amount, 
        b.paid_amount, 
        b.status, 
        b.created_at
      FROM ip_bills b
      LEFT JOIN patients p ON b.patient_id::TEXT = p.patient_id::TEXT
      WHERE b.admission_id IS NOT NULL   -- only inpatient bills
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      sql += ` AND b.status = $${paramIndex++}`;
      params.push(status);
    }
    sql += ` ORDER BY b.created_at DESC`;

    const billsResult = await query(sql, params);
    const bills = billsResult.rows;

    // Fetch items for each bill
    for (const bill of bills) {
      const itemsRes = await query(
        `SELECT 
          id, medicine_name, quantity, unit_price, total_price
         FROM ip_bill_items
         WHERE bill_id = $1
         ORDER BY id`,
        [bill.id]
      );
      bill.items = itemsRes.rows;
    }

    return NextResponse.json({ success: true, data: bills });
  } catch (error: any) {
    console.error('Fetch bills error:', error);
      const authResponse=authErrorResponse(error);

if(authResponse){
  return authResponse
}

    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}