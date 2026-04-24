import { NextRequest, NextResponse } from 'next/server';
import {  transaction } from '@/lib/db';
import { z } from 'zod';
import { authErrorResponse,requireRole } from '@/lib/auth/guards';

// Validation schema for the request body
const AdjustmentSchema = z.object({
  medicineId: z.number(),
  batch: z.string().min(1),
  adjustmentType: z.enum(['Damage', 'Expired', 'Correction']),
  quantity: z.number().positive(),
  reason: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
      requireRole(req, ['pharmacy']);
    const body = await req.json();
    const validation = AdjustmentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { medicineId, batch, adjustmentType, quantity, reason } = validation.data;

    // Start a database transaction
    await transaction(async (client) => {
      // 1. Get current stock for the specified batch
      const stockResult = await client.query(
        `SELECT id, quantity FROM stock WHERE medicine_id = $1 AND batch_no = $2`,
        [medicineId, batch]
      );
      if (stockResult.rows.length === 0) {
        throw new Error('Batch not found in stock');
      }
      const stockId = stockResult.rows[0].id;
      const currentQty = parseInt(stockResult.rows[0].quantity);

      // 2. Check if enough stock is available
      if (currentQty < quantity) {
        throw new Error(`Insufficient stock. Available: ${currentQty}, requested: ${quantity}`);
      }

      const newQty = currentQty - quantity;

      // 3. Update the stock table
      await client.query(
        `UPDATE stock SET quantity = $1 WHERE id = $2`,
        [newQty, stockId]
      );

      // 4. Insert a record into stock_adjustments
      await client.query(
        `INSERT INTO stock_adjustments 
         (medicine_id, batch_no, adjustment_type, quantity, reason, previous_quantity, new_quantity)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [medicineId, batch, adjustmentType, quantity, reason, currentQty, newQty]
      );
    });

    return NextResponse.json(
      { success: true, message: 'Stock adjustment recorded successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Stock adjustment error:', error);
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