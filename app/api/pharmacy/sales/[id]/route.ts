import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db';
import { authErrorResponse,requireRole } from '@/lib/auth/guards';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
      requireRole(req, ['pharmacy']);
    const { id } = await params;
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 });
    }

    // Get sale header
    const saleResult = await query(
      `SELECT s.*, 
        COALESCE(p.full_name_en, s.walkin_name) as patient_name
       FROM sales s
       LEFT JOIN patients p ON s.patient_id = p.patient_id
       WHERE s.id = $1`,
      [parsedId]
    );

    if (saleResult.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Sale not found' }, { status: 404 });
    }

    // Get items
    const itemsResult = await query(
      `SELECT si.*, m.name as medicine_name
       FROM sale_items si
       JOIN medicines m ON si.medicine_id = m.id
       WHERE si.sale_id = $1`,
      [parsedId]
    );

    return NextResponse.json({
      success: true,
      data: {
        ...saleResult.rows[0],
        items: itemsResult.rows,
      },
    });
  } catch (error) {
    console.error('Error fetching sale:', error);
        const authResponse=authErrorResponse(error);
if(authResponse){
  return authResponse
}

    return NextResponse.json(
      { success: false, message: 'Failed to fetch sale' },
      { status: 500 }
    );
  }
}


export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
      requireRole(req, ['pharmacy']);
    const { id } = await params;
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 });
    }

    const body = await req.json();
    const { stockUpdated } = body; // true = delivered, false = not delivered

    if (typeof stockUpdated !== 'boolean') {
      return NextResponse.json({ success: false, message: 'stockUpdated must be a boolean' }, { status: 400 });
    }

    // Get current sale state
    const saleCheck = await query(
      'SELECT stock_updated FROM sales WHERE id = $1',
      [parsedId]
    );
    if (saleCheck.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Sale not found' }, { status: 404 });
    }
    const wasStockUpdated = saleCheck.rows[0].stock_updated;

    // If we are setting stockUpdated = true and it wasn't already updated
    if (stockUpdated && !wasStockUpdated) {
      await transaction(async (client) => {
        // Get sale items
        const items = await client.query(
          `SELECT si.medicine_id, si.quantity 
           FROM sale_items si
           WHERE si.sale_id = $1`,
          [parsedId]
        );

        for (const item of items.rows) {
          // Find a suitable batch (FEFO) and reduce stock
          const batchResult = await client.query(
            `SELECT id, quantity 
             FROM stock 
             WHERE medicine_id = $1 AND quantity >= $2 AND expiry_date > CURRENT_DATE
             ORDER BY expiry_date
             LIMIT 1`,
            [item.medicine_id, item.quantity]
          );

          if (batchResult.rows.length === 0) {
            throw new Error(`Insufficient stock for medicine ID ${item.medicine_id}`);
          }

          const batch = batchResult.rows[0];
          await client.query(
            `UPDATE stock SET quantity = quantity - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
            [item.quantity, batch.id]
          );
        }

        // Mark sale as stock_updated
        await client.query(
          `UPDATE sales SET stock_updated = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
          [parsedId]
        );
      });
    }
    // If we are setting stockUpdated = false and it was previously updated – revert stock (if possible)
    else if (!stockUpdated && wasStockUpdated) {
      await transaction(async (client) => {
        // Get items
        const items = await client.query(
          `SELECT si.medicine_id, si.quantity 
           FROM sale_items si
           WHERE si.sale_id = $1`,
          [parsedId]
        );

        for (const item of items.rows) {
          // We need to add back the quantity to the same batch(es) – but we don't know which batches were used.
          // This is complex; for simplicity, we could disallow reverting, or we could store batch info in sale_items.
          // To keep it simple, we'll just throw an error – reverting a sale after delivery is not allowed.
          throw new Error('Cannot revert a delivered sale');
        }

        // If we ever implement batch tracking, we would add stock back here.
      });
      // If you decide not to support revert, just return an error.
      return NextResponse.json({ success: false, message: 'Cannot undo delivered sale' }, { status: 400 });
    } else {
      // Just update the flag without stock change (e.g., marking not delivered when it was never updated)
      await query(
        'UPDATE sales SET stock_updated = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [stockUpdated, parsedId]
      );
    }

    return NextResponse.json({ success: true, message: 'Sale delivery status updated' });
  } catch (error: any) {
    console.error('Error updating sale delivery:', error);
        const authResponse=authErrorResponse(error);
if(authResponse){
  return authResponse
}
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update' },
      { status: 500 }
    );
  }
}