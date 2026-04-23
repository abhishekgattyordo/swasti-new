import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db';
import { DispenseSchema } from '@/lib/validations/dispense';
import { authErrorResponse,requireRole } from '@/lib/auth/guards';

// Validation schema


// Helper to deduct stock from batches (FIFO) and return batch allocations
async function deductStock(
  medicineId: number,
  requiredQty: number,
  client: any
): Promise<{ batchNo: string; quantity: number }[]> {
  // Get batches with stock, ordered by expiry (oldest first)
  const batches = await client.query(
    `SELECT id, batch_no, quantity FROM stock 
     WHERE medicine_id = $1 AND quantity > 0 
     ORDER BY expiry_date ASC`,
    [medicineId]
  );

  let remaining = requiredQty;
  const allocations: { batchNo: string; quantity: number }[] = [];

  for (const batch of batches.rows) {
    if (remaining <= 0) break;
    const deduct = Math.min(batch.quantity, remaining);
    // Update stock quantity
    await client.query(
      `UPDATE stock SET quantity = quantity - $1 WHERE id = $2`,
      [deduct, batch.id]
    );
    allocations.push({ batchNo: batch.batch_no, quantity: deduct });
    remaining -= deduct;
  }

  if (remaining > 0) {
    throw new Error(`Insufficient stock for medicine ID ${medicineId}. Required: ${requiredQty}, Available: ${requiredQty - remaining}`);
  }

  return allocations;
}

export async function POST(req: NextRequest) {
  try {
     requireRole(req, ['pharmacy']);
    const body = await req.json();
    const validation = DispenseSchema.safeParse(body);
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
    const prescriptionId = parseInt(data.prescriptionId);

    // Start transaction
    const saleId = await transaction(async (client) => {
      // 1. Verify prescription exists and is not fully dispensed
      const presCheck = await client.query(
        `SELECT status FROM prescriptions WHERE id = $1`,
        [prescriptionId]
      );
      if (presCheck.rows.length === 0) {
        throw new Error('Prescription not found');
      }
      if (presCheck.rows[0].status === 'dispensed') {
        throw new Error('Prescription already fully dispensed');
      }

      // 2. For each item, validate and deduct stock, collect batch allocations
      const saleItemsToInsert: any[] = [];

      for (const item of data.items) {
        // Get prescribed item details
        const presItem = await client.query(
          `SELECT prescribed_qty, dispensed_qty 
           FROM prescription_items 
           WHERE prescription_id = $1 AND medicine_id = $2`,
          [prescriptionId, item.medicineId]
        );
        if (presItem.rows.length === 0) {
          throw new Error(`Medicine ID ${item.medicineId} not in prescription`);
        }

        const remaining = presItem.rows[0].prescribed_qty - presItem.rows[0].dispensed_qty;
        if (item.quantity > remaining) {
          throw new Error(`Dispense quantity (${item.quantity}) exceeds remaining prescribed (${remaining}) for medicine ID ${item.medicineId}`);
        }

        // Update prescription_items dispensed_qty
        await client.query(
          `UPDATE prescription_items 
           SET dispensed_qty = dispensed_qty + $1 
           WHERE prescription_id = $2 AND medicine_id = $3`,
          [item.quantity, prescriptionId, item.medicineId]
        );

        // Deduct stock and get batch allocations
        const allocations = await deductStock(item.medicineId, item.quantity, client);
        // For each allocated batch, create a sale item row
        for (const alloc of allocations) {
          saleItemsToInsert.push({
            saleId: null, // will set after sale is created
            medicineId: item.medicineId,
            batchNo: alloc.batchNo,
            quantity: alloc.quantity,
            unitPrice: item.unitPrice,
            taxPercent: item.taxPercent,
            total: alloc.quantity * item.unitPrice * (1 + item.taxPercent / 100),
          });
        }
      }

      // 3. Update prescription status
      const remainingItems = await client.query(
        `SELECT COUNT(*) as count 
         FROM prescription_items 
         WHERE prescription_id = $1 AND dispensed_qty < prescribed_qty`,
        [prescriptionId]
      );
      const newStatus = remainingItems.rows[0].count === 0 ? 'dispensed' : 'partial';
      await client.query(
        `UPDATE prescriptions SET status = $1 WHERE id = $2`,
        [newStatus, prescriptionId]
      );

      // 4. Insert sale header with stock_updated = true (immediate deduction)
      const saleInsert = await client.query(
        `INSERT INTO sales 
         (patient_id, walkin_name, walkin_phone, walkin_address, sale_date, subtotal, tax_total, discount_total, grand_total, payment_mode, doctor_name, prescription_id, stock_updated)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true)
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
          data.doctorName,
          prescriptionId,
        ]
      );
      const newSaleId = saleInsert.rows[0].id;

      // 5. Insert sale items (one per batch allocation)
      for (const si of saleItemsToInsert) {
        await client.query(
          `INSERT INTO sale_items (sale_id, medicine_id, batch_no, quantity, unit_price, tax_percent, total)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            newSaleId,
            si.medicineId,
            si.batchNo,
            si.quantity,
            si.unitPrice,
            si.taxPercent,
            si.total,
          ]
        );
      }

      return newSaleId;
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Prescription dispensed successfully',
        data: { saleId },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Dispense error:', error);
        const authResponse=authErrorResponse(error);
if(authResponse){
  return authResponse
}
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to dispense' },
      { status: 500 }
    );
  }
}