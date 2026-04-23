import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db';
import { PurchaseSchema } from '@/lib/validations/purchase';
import { authErrorResponse,requireRole } from '@/lib/auth/guards';

// GET /api/pharmacy/purchases – list all purchases (with pagination)
export async function GET(req: NextRequest) {
  try {
      requireRole(req, ['pharmacy']);
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const offset = (page - 1) * limit;
    const result = await query(
      `SELECT p.*, s.name as supplier_name 
       FROM purchases p
       LEFT JOIN suppliers s ON p.supplier_id = s.id
       ORDER BY p.invoice_date DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await query('SELECT COUNT(*) FROM purchases');
    const total = parseInt(countResult.rows[0].count);

    return NextResponse.json({
      success: true,
      data: result.rows,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching purchases:', error);
        const authResponse=authErrorResponse(error);
if(authResponse){
  return authResponse
}
    return NextResponse.json(
      { success: false, message: 'Failed to fetch purchases' },
      { status: 500 }
    );
  }
}

// POST /api/pharmacy/purchases – create a new purchase
export async function POST(req: NextRequest) {
  try {
      requireRole(req, ['pharmacy']);
    const body = await req.json();
    const validation = PurchaseSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Start a transaction
    const purchaseResult = await transaction(async (client) => {
      // 1. Insert purchase header with is_delivered = false, stock_updated = false
      const purchaseInsert = await client.query(
        `INSERT INTO purchases 
         (supplier_id, invoice_no, invoice_date, gst_no, payment_mode, subtotal, tax_total, grand_total, is_delivered, stock_updated)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false, false)
         RETURNING id`,
        [
          data.supplierId,
          data.invoiceNo,
          data.invoiceDate,
          data.gstNo || null,
          data.paymentMode,
          data.subtotal,
          data.taxTotal,
          data.grandTotal,
        ]
      );
      const purchaseId = purchaseInsert.rows[0].id;

      // 2. Insert items – stock NOT updated now; will be updated later when delivered
      for (const item of data.items) {
        await client.query(
          `INSERT INTO purchase_items 
           (purchase_id, medicine_id, batch_no, expiry_date, quantity, purchase_price, mrp, tax_percent, total)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            purchaseId,
            item.medicineId,
            item.batch,
            item.expiryDate,
            item.qty,
            item.purchasePrice,
            item.mrp,
            item.taxPercent,
            item.total,
          ]
        );
      }

      return purchaseId;
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Purchase saved successfully. Stock will be updated when delivered.',
        data: { id: purchaseResult },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating purchase:', error);
        const authResponse=authErrorResponse(error);
if(authResponse){
  return authResponse
}
    return NextResponse.json(
      { success: false, message: 'Failed to create purchase' },
      { status: 500 }
    );
  }
}