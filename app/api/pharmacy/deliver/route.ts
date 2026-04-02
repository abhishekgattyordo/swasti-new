// import { NextRequest, NextResponse } from 'next/server';
// import { query, transaction } from '@/lib/db';
// import { z } from 'zod';

// const DeliverItemSchema = z.object({
//   saleItemId: z.number(),          // ID from sale_items table
//   medicineId: z.number(),
//   quantity: z.number().positive(),
//   batchNo: z.string().optional(),  // optional – if not provided, FIFO will be used
// });

// const DeliverSchema = z.object({
//   saleId: z.number(),
//   items: z.array(DeliverItemSchema),
// });

// // Helper: deduct stock using FIFO (oldest expiry first)
// async function deductStockFIFO(
//   medicineId: number,
//   requiredQty: number,
//   client: any
// ): Promise<{ batchNo: string; quantity: number }[]> {
//   const batches = await client.query(
//     `SELECT id, batch_no, quantity FROM stock 
//      WHERE medicine_id = $1 AND quantity > 0 
//      ORDER BY expiry_date ASC`,
//     [medicineId]
//   );

//   let remaining = requiredQty;
//   const allocations: { batchNo: string; quantity: number }[] = [];

//   for (const batch of batches.rows) {
//     if (remaining <= 0) break;
//     const deduct = Math.min(batch.quantity, remaining);
//     await client.query(
//       `UPDATE stock SET quantity = quantity - $1 WHERE id = $2`,
//       [deduct, batch.id]
//     );
//     allocations.push({ batchNo: batch.batch_no, quantity: deduct });
//     remaining -= deduct;
//   }

//   if (remaining > 0) {
//     throw new Error(`Insufficient stock for medicine ID ${medicineId}. Needed ${requiredQty}, available ${requiredQty - remaining}`);
//   }

//   return allocations;
// }

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const validation = DeliverSchema.safeParse(body);
//     if (!validation.success) {
//       return NextResponse.json(
//         { success: false, errors: validation.error.flatten().fieldErrors },
//         { status: 400 }
//       );
//     }

//     const { saleId, items } = validation.data;

//     // Start transaction
//     await transaction(async (client) => {
//       // 1. Verify sale exists and is not already delivered
//       const saleCheck = await client.query(
//         `SELECT stock_updated FROM sales WHERE id = $1`,
//         [saleId]
//       );
//       if (saleCheck.rows.length === 0) {
//         throw new Error('Sale not found');
//       }
//       if (saleCheck.rows[0].stock_updated) {
//         throw new Error('Sale already delivered');
//       }

//       // 2. Process each item
//       for (const item of items) {
//         let allocations: { batchNo: string; quantity: number }[];

//         if (item.batchNo) {
//           // Deduct from specified batch
//           const batch = await client.query(
//             `SELECT quantity FROM stock WHERE medicine_id = $1 AND batch_no = $2`,
//             [item.medicineId, item.batchNo]
//           );
//           if (batch.rows.length === 0 || batch.rows[0].quantity < item.quantity) {
//             throw new Error(`Insufficient stock in batch ${item.batchNo} for medicine ID ${item.medicineId}`);
//           }
//           await client.query(
//             `UPDATE stock SET quantity = quantity - $1 WHERE medicine_id = $2 AND batch_no = $3`,
//             [item.quantity, item.medicineId, item.batchNo]
//           );
//           allocations = [{ batchNo: item.batchNo, quantity: item.quantity }];
//         } else {
//           // FIFO
//           allocations = await deductStockFIFO(item.medicineId, item.quantity, client);
//         }

//         // Update the corresponding sale_item(s)
//         // If multiple batches were used, we may need to split the sale_item into multiple rows.
//         // For simplicity, we'll update the existing sale_item with the first batch and insert additional rows if needed.
//         // Here we assume one sale_item per medicine (as created initially). If FIFO splits across batches,
//         // we need to create new sale_item rows for each batch.
//         // This implementation handles splitting by deleting the original and inserting per batch.

//         // First, get the original sale_item(s) for this medicine (there could be multiple if already split)
//         const existingItems = await client.query(
//           `SELECT id, quantity, unit_price, tax_percent FROM sale_items 
//            WHERE sale_id = $1 AND medicine_id = $2`,
//           [saleId, item.medicineId]
//         );

//         if (existingItems.rows.length === 0) {
//           throw new Error(`No sale item found for medicine ID ${item.medicineId}`);
//         }

//         // We'll delete the existing items and recreate with batch info
//         await client.query(
//           `DELETE FROM sale_items WHERE sale_id = $1 AND medicine_id = $2`,
//           [saleId, item.medicineId]
//         );

//         // Insert new rows per batch allocation
//         for (const alloc of allocations) {
//           const unitPrice = existingItems.rows[0].unit_price; // assume same price
//           const taxPercent = existingItems.rows[0].tax_percent;
//           const total = alloc.quantity * unitPrice * (1 + taxPercent / 100);
//           await client.query(
//             `INSERT INTO sale_items (sale_id, medicine_id, batch_no, quantity, unit_price, tax_percent, total)
//              VALUES ($1, $2, $3, $4, $5, $6, $7)`,
//             [saleId, item.medicineId, alloc.batchNo, alloc.quantity, unitPrice, taxPercent, total]
//           );
//         }
//       }

//       // 3. Mark sale as delivered
//       await client.query(
//         `UPDATE sales SET stock_updated = true WHERE id = $1`,
//         [saleId]
//       );
//     });

//     return NextResponse.json({
//       success: true,
//       message: 'Sale delivered and stock updated',
//     });
//   } catch (error: any) {
//     console.error('Delivery error:', error);
//     return NextResponse.json(
//       { success: false, message: error.message || 'Failed to deliver sale' },
//       { status: 500 }
//     );
//   }
// }

import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db';
import { z } from 'zod';

const DeliverItemSchema = z.object({
  saleItemId: z.number(),
  medicineId: z.number(),
  quantity: z.number().positive(),
  batchNo: z.string().optional(),
});

const DeliverSchema = z.object({
  saleId: z.number(),
  items: z.array(DeliverItemSchema),
});

async function deductStockFIFO(
  medicineId: number,
  requiredQty: number,
  client: any
): Promise<{ batchNo: string; quantity: number; mrp: number }[]> {
  const batches = await client.query(
    `SELECT id, batch_no, quantity, mrp FROM stock 
     WHERE medicine_id = $1 AND quantity > 0 
     ORDER BY expiry_date ASC`,
    [medicineId]
  );

  let remaining = requiredQty;
  const allocations: { batchNo: string; quantity: number; mrp: number }[] = [];

  for (const batch of batches.rows) {
    if (remaining <= 0) break;
    const deduct = Math.min(batch.quantity, remaining);
    await client.query(
      `UPDATE stock SET quantity = quantity - $1 WHERE id = $2`,
      [deduct, batch.id]
    );
    allocations.push({
      batchNo: batch.batch_no,
      quantity: deduct,
      mrp: parseFloat(batch.mrp),
    });
    remaining -= deduct;
  }

  if (remaining > 0) {
    throw new Error(`Insufficient stock for medicine ID ${medicineId}.`);
  }
  return allocations;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = DeliverSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { saleId, items } = validation.data;

    await transaction(async (client) => {
      // 1. Verify sale exists and is not already delivered
      const saleCheck = await client.query(
        `SELECT stock_updated, patient_id, walkin_name FROM sales WHERE id = $1`,
        [saleId]
      );
      if (saleCheck.rows.length === 0) throw new Error('Sale not found');
      if (saleCheck.rows[0].stock_updated) throw new Error('Sale already delivered');
      const sale = saleCheck.rows[0];

      // 2. Get active admission ID for registered patients
      let admissionId = null;
      if (sale.patient_id) {
        const admissionRes = await client.query(
          `SELECT id FROM admissions WHERE patient_id = $1 AND status = 'active' LIMIT 1`,
          [sale.patient_id]
        );
        if (admissionRes.rows.length > 0) {
          admissionId = admissionRes.rows[0].id;
        }
      }

      let totalBillAmount = 0;
      const billItemsData: {
        medicineName: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
        saleItemId: number;
      }[] = [];

      // 3. Process each item (stock deduction, sale_items update)
      for (const item of items) {
        const medRes = await client.query(
          `SELECT name FROM medicines WHERE id = $1`,
          [item.medicineId]
        );
        if (medRes.rows.length === 0) throw new Error(`Medicine ID ${item.medicineId} not found`);
        const medicineName = medRes.rows[0].name;

        let allocations: { batchNo: string; quantity: number; mrp: number }[];

        if (item.batchNo) {
          const batch = await client.query(
            `SELECT quantity, mrp FROM stock WHERE medicine_id = $1 AND batch_no = $2`,
            [item.medicineId, item.batchNo]
          );
          if (batch.rows.length === 0 || batch.rows[0].quantity < item.quantity) {
            throw new Error(`Insufficient stock in batch ${item.batchNo}`);
          }
          await client.query(
            `UPDATE stock SET quantity = quantity - $1 WHERE medicine_id = $2 AND batch_no = $3`,
            [item.quantity, item.medicineId, item.batchNo]
          );
          allocations = [{
            batchNo: item.batchNo,
            quantity: item.quantity,
            mrp: parseFloat(batch.rows[0].mrp),
          }];
        } else {
          allocations = await deductStockFIFO(item.medicineId, item.quantity, client);
        }

        const existingItems = await client.query(
          `SELECT id, quantity, unit_price, tax_percent FROM sale_items 
           WHERE sale_id = $1 AND medicine_id = $2`,
          [saleId, item.medicineId]
        );
        if (existingItems.rows.length === 0) {
          throw new Error(`No sale item found for medicine ID ${item.medicineId}`);
        }

        await client.query(
          `DELETE FROM sale_items WHERE sale_id = $1 AND medicine_id = $2`,
          [saleId, item.medicineId]
        );

        for (const alloc of allocations) {
          const unitPrice = existingItems.rows[0].unit_price;
          const taxPercent = existingItems.rows[0].tax_percent;
          const total = alloc.quantity * unitPrice * (1 + taxPercent / 100);
          const insertRes = await client.query(
            `INSERT INTO sale_items (sale_id, medicine_id, batch_no, quantity, unit_price, tax_percent, total)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id`,
            [saleId, item.medicineId, alloc.batchNo, alloc.quantity, unitPrice, taxPercent, total]
          );
          const newSaleItemId = insertRes.rows[0].id;

          const batchUnitPrice = alloc.mrp;
          const billItemTotal = alloc.quantity * batchUnitPrice;
          totalBillAmount += billItemTotal;

          billItemsData.push({
            medicineName,
            quantity: alloc.quantity,
            unitPrice: batchUnitPrice,
            totalPrice: billItemTotal,
            saleItemId: newSaleItemId,
          });
        }
      }

      // 4. Create or update the bill header (ip_bills) – FIXED
      let billId: number;
      if (admissionId) {
        // Registered patient: find bill by admission_id
        const existingBill = await client.query(
          `SELECT id FROM ip_bills WHERE admission_id = $1`,
          [admissionId]
        );
        if (existingBill.rows.length > 0) {
          billId = existingBill.rows[0].id;
          await client.query(
            `UPDATE ip_bills SET total_amount = total_amount + $1, updated_at = NOW() WHERE id = $2`,
            [totalBillAmount, billId]
          );
        } else {
          const billNumber = `IP-${Date.now()}-${saleId}`;
          const insertBill = await client.query(
            `INSERT INTO ip_bills (sale_id, patient_id, admission_id, bill_number, total_amount, status)
             VALUES ($1, $2, $3, $4, $5, 'UNPAID')
             RETURNING id`,
            [saleId, sale.patient_id, admissionId, billNumber, totalBillAmount]
          );
          billId = insertBill.rows[0].id;
        }
      } else {
        // Walk‑in patient: create a bill without admission_id (no unique constraint violation)
        const billNumber = `OP-${Date.now()}-${saleId}`;
        const insertBill = await client.query(
          `INSERT INTO ip_bills (sale_id, patient_id, admission_id, bill_number, total_amount, status)
           VALUES ($1, $2, NULL, $3, $4, 'UNPAID')
           RETURNING id`,
          [saleId, sale.patient_id, billNumber, totalBillAmount]
        );
        billId = insertBill.rows[0].id;
      }

      // 5. Insert bill items
      for (const bi of billItemsData) {
        await client.query(
          `INSERT INTO ip_bill_items (bill_id, medicine_name, quantity, unit_price, total_price, sale_item_id)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [billId, bi.medicineName, bi.quantity, bi.unitPrice, bi.totalPrice, bi.saleItemId]
        );
      }

      // 6. Mark sale as delivered
      await client.query(
        `UPDATE sales SET stock_updated = true WHERE id = $1`,
        [saleId]
      );
    });

    return NextResponse.json({
      success: true,
      message: 'Sale delivered, stock updated, and billing recorded',
    });
  } catch (error: any) {
    console.error('Delivery error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to deliver sale' },
      { status: 500 }
    );
  }
}