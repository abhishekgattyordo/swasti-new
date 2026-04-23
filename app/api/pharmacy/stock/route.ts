import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authErrorResponse,requireRole } from '@/lib/auth/guards';

export async function GET(req: NextRequest) {
  try {
     requireRole(req, ['pharmacy']);
    const { searchParams } = new URL(req.url);
    const lowStockOnly = searchParams.get('lowStock') === 'true';
    const search = searchParams.get('search') || '';

   let sql = `
  SELECT 
    s.id,
    s.medicine_id,   -- add this
    m.name as "medicineName",
    s.batch_no as batch,
    s.expiry_date as "expiryDate",
    s.quantity as "availableQty",
    m.reorder_level as "reorderLevel",
    s.purchase_price as "purchasePrice",
    s.mrp,
    COALESCE(s.delivered_manual, (
      SELECT SUM(pi.quantity)
      FROM purchase_items pi
      WHERE pi.medicine_id = s.medicine_id AND pi.batch_no = s.batch_no
    ), 0) as "delivered"
  FROM stock s
  JOIN medicines m ON s.medicine_id = m.id
  WHERE 1=1
`;
    const values: any[] = [];
    let paramIndex = 1;

    if (search) {
      sql += ` AND m.name ILIKE $${paramIndex}`;
      values.push(`%${search}%`);
      paramIndex++;
    }

    if (lowStockOnly) {
      sql += ` AND s.quantity <= COALESCE(m.reorder_level, 0)`;
    }

    sql += ` ORDER BY m.name, s.batch_no`;

    const result = await query(sql, values);
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching stock:', error);
        const authResponse=authErrorResponse(error);
if(authResponse){
  return authResponse
}
    return NextResponse.json(
      { success: false, message: 'Failed to fetch stock' },
      { status: 500 }
    );
  }
}
