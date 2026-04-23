

import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db';
import { SaleSchema } from '@/lib/validations/sale';
import { authErrorResponse,requireRole } from '@/lib/auth/guards';

export async function POST(req: NextRequest) {
  try {
      requireRole(req, ['pharmacy']);
    const body = await req.json();
    const validation = SaleSchema.safeParse(body);
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
    const saleId = await transaction(async (client) => {
      // 1. Insert sale header – fixed VALUES clause
      const saleInsert = await client.query(
        `INSERT INTO sales 
         (patient_id, walkin_name, walkin_phone, walkin_address, sale_date, subtotal, tax_total, discount_total, grand_total, payment_mode, doctor_name, stock_updated)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, false)
         RETURNING id`,
        [
          data.patientId || null,
          data.walkinName || null,
          data.walkinPhone || null,
          data.walkinAddress || null,
          data.saleDate,
          data.subtotal,
          data.taxTotal,
          data.discountTotal,
          data.grandTotal,
          data.paymentMode,
          data.doctorName,  // now mapped to $11
        ]
      );
      const newSaleId = saleInsert.rows[0].id;

      // 2. Insert sale items (unchanged)
      for (const item of data.items) {
        await client.query(
          `INSERT INTO sale_items (sale_id, medicine_id, batch_no, quantity, unit_price, tax_percent, total)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            newSaleId,
            item.medicineId,
            null, // batch assigned later on delivery
            item.quantity,
            item.unitPrice,
            item.taxPercent,
            item.quantity * item.unitPrice * (1 + item.taxPercent / 100),
          ]
        );
      }

      return newSaleId;
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Sale recorded. Stock will be updated when marked as delivered.',
        data: { id: saleId },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating sale:', error);
        const authResponse=authErrorResponse(error);
if(authResponse){
  return authResponse
}
    return NextResponse.json(
      { success: false, message: 'Failed to create sale' },
      { status: 500 }
    );
  }
}


export async function GET(req: NextRequest) {
  try {
      requireRole(req, ['pharmacy']);
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const delivered = searchParams.get('delivered'); // "true" or "false"

    const offset = (page - 1) * limit;
    const values: any[] = [];
    let whereClause = '';
    let paramIndex = 1;

    if (delivered !== null) {
      whereClause = ` WHERE s.stock_updated = $${paramIndex}`;
      values.push(delivered === 'true');
      paramIndex++;
    }

    const result = await query(
      `SELECT 
         s.id,
         s.patient_id,
         s.walkin_name,
         s.walkin_phone,
         s.walkin_address,
         s.sale_date,
         s.subtotal,
         s.tax_total,
         s.discount_total,
         s.grand_total,
         s.payment_mode,
         s.doctor_name,
         s.stock_updated,
         s.created_at,
         COALESCE(p.full_name_en, s.walkin_name) as patient_name,
         COALESCE(
           json_agg(
             json_build_object(
               'id', si.id,
               'medicineId', si.medicine_id,
               'medicineName', m.name,
               'quantity', si.quantity,
               'unitPrice', si.unit_price,
               'taxPercent', si.tax_percent,
               'total', si.total,
               'batchNo', si.batch_no
             )
           ) FILTER (WHERE si.id IS NOT NULL),
           '[]'::json
         ) as items
       FROM sales s
       LEFT JOIN patients p ON s.patient_id = p.patient_id
       LEFT JOIN sale_items si ON s.id = si.sale_id
       LEFT JOIN medicines m ON si.medicine_id = m.id
       ${whereClause}
       GROUP BY s.id, p.full_name_en, s.walkin_name
       ORDER BY s.sale_date DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...values, limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) FROM sales s ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].count);

    return NextResponse.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching sales:', error);
        const authResponse=authErrorResponse(error);
if(authResponse){
  return authResponse
}
    return NextResponse.json(
      { success: false, message: 'Failed to fetch sales' },
      { status: 500 }
    );
  }
}