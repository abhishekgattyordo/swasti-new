

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authErrorResponse,requireRole } from '@/lib/auth/guards';

export async function GET(req: NextRequest) {
  try {
      requireRole(req, ['pharmacy']);
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'OP', 'IP', or null
    const search = searchParams.get('search') || '';
    const patientId = searchParams.get('patientId'); // ✅ NEW: filter by patient

    let sql = `
      SELECT 
        s.id,
        s.sale_date as date,
        COALESCE(p.full_name_en, s.walkin_name) as patientName,
        CASE WHEN s.patient_id IS NOT NULL THEN 'IP' ELSE 'OP' END as type,
        json_agg(
          json_build_object(
            'medicine', m.name,
            'batch', si.batch_no,
            'qty', si.quantity,
            'unitPrice', si.unit_price,
            'tax', si.tax_percent * si.unit_price * si.quantity / 100,
            'total', si.total
          )
        ) as items,
        s.grand_total as total,
        s.payment_mode,
        s.stock_updated as status
      FROM sales s
      LEFT JOIN patients p ON s.patient_id = p.patient_id
      LEFT JOIN sale_items si ON s.id = si.sale_id
      LEFT JOIN medicines m ON si.medicine_id = m.id
      WHERE 1=1
    `;
    const values: any[] = [];
    let paramIndex = 1;

    // ✅ Filter by patientId if provided
    if (patientId) {
      sql += ` AND s.patient_id = $${paramIndex}`;
      values.push(patientId);
      paramIndex++;
    }

    if (type === 'OP') {
      sql += ` AND s.walkin_name IS NOT NULL`;
    } else if (type === 'IP') {
      sql += ` AND s.patient_id IS NOT NULL`;
    }

    if (search) {
      sql += ` AND (COALESCE(p.full_name_en, s.walkin_name) ILIKE $${paramIndex} OR m.name ILIKE $${paramIndex})`;
      values.push(`%${search}%`);
      paramIndex++;
    }

    sql += ` GROUP BY s.id, p.full_name_en, s.walkin_name ORDER BY s.sale_date DESC`;

    const result = await query(sql, values);

    // Flatten items into individual ledger entries
    const ledgerEntries = [];
    for (const row of result.rows) {
      for (const item of row.items || []) {
        ledgerEntries.push({
          id: `${row.id}-${item.batch}`,
          date: row.date,
          patientName: row.patientName,
          type: row.type,
          medicine: item.medicine,
          batch: item.batch,
          qty: item.qty,
          unitPrice: item.unitPrice,
          tax: item.tax,
          total: item.total,
          refId: row.id,
          status: row.status ? 'Billed' : 'Pending',
        });
      }
    }

    return NextResponse.json({ success: true, data: ledgerEntries });
  } catch (error) {
    console.error('Error fetching ledger:', error);
       const authResponse=authErrorResponse(error);
if(authResponse){
  return authResponse
}
    return NextResponse.json(
      { success: false, message: 'Failed to fetch ledger' },
      { status: 500 }
    );
  }
}