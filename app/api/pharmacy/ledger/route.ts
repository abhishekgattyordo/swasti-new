import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authErrorResponse,requireRole } from '@/lib/auth/guards';

export async function GET(req: NextRequest) {
  try {
    requireRole(req, ['pharmacy']);
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'OP', 'IP', or null
    const search = searchParams.get('search') || '';
    const patientId = searchParams.get('patientId');

    let sql = `
      SELECT 
        s.id,
        s.sale_date as date,
        COALESCE(p.full_name_en, s.walkin_name, 'Unknown Patient') as patientName,
        CASE 
          WHEN s.patient_id IS NOT NULL THEN 'IP' 
          ELSE 'OP' 
        END as type,
        COALESCE(
          json_agg(
            json_build_object(
              'medicine', m.name,
              'batch', si.batch_no,
              'qty', si.quantity,
              'unitPrice', si.unit_price,
              'tax', (si.tax_percent * si.unit_price * si.quantity / 100),
              'total', si.total
            )
          ) FILTER (WHERE si.id IS NOT NULL),
          '[]'::json
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

    console.log("Executing SQL:", sql);
    console.log("With values:", values);

    const result = await query(sql, values);
    
    console.log("Raw result rows:", JSON.stringify(result.rows, null, 2));

    // Flatten items into individual ledger entries
    const ledgerEntries = [];
    for (const row of result.rows) {
      console.log(`Processing row ${row.id}:`, row);
      
      // Handle case where items might be null or not an array
      const items = Array.isArray(row.items) ? row.items : [];
      
      if (items.length === 0) {
        // If no items, still create an entry with empty data
        ledgerEntries.push({
          id: `${row.id}`,
          date: row.date,
          patientName: row.patientname || row.patientName || 'Unknown Patient',
          type: row.type,
          medicine: 'No items',
          batch: 'N/A',
          qty: 0,
          unitPrice: 0,
          tax: 0,
          total: 0,
          refId: row.id,
          status: row.status ? 'Billed' : 'Pending',
        });
      } else {
        for (const item of items) {
          ledgerEntries.push({
            id: `${row.id}-${item.batch || 'N/A'}`,
            date: row.date,
            patientName: row.patientname || row.patientName || 'Unknown Patient',
            type: row.type,
            medicine: item.medicine || 'Unknown',
            batch: item.batch || 'N/A',
            qty: item.qty || 0,
            unitPrice: item.unitPrice || 0,
            tax: item.tax || 0,
            total: item.total || 0,
            refId: row.id,
            status: row.status ? 'Billed' : 'Pending',
          });
        }
      }
    }

    console.log("Final ledger entries:", JSON.stringify(ledgerEntries, null, 2));

    return NextResponse.json({ success: true, data: ledgerEntries });
  } catch (error) {
    console.error('Error fetching ledger:', error);
    const authResponse = authErrorResponse(error);
    if (authResponse) {
      return authResponse;
    }
    return NextResponse.json(
      { success: false, message: 'Failed to fetch ledger' },
      { status: 500 }
    );
  }
}