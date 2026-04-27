

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';


export async function POST(req: NextRequest) {
  const { admissionId } = await req.json();

  if (!admissionId) {
    return NextResponse.json({ success: false, message: 'Admission ID required' }, { status: 400 });
  }

  try {
    // 1. Get admission details
        
    const admissionRes = await query(
      `SELECT a.*, p.patient_id, p.full_name_en
       FROM admissions a
       JOIN patients p ON a.patient_id = p.patient_id
       WHERE a.id = $1`,
      [admissionId]
    );

    if (admissionRes.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Admission not found' }, { status: 404 });
    }

    const admission = admissionRes.rows[0];
    const dischargeDate = admission.discharge_date ? new Date(admission.discharge_date) : new Date();

    // Exclusive end date for billing (day after last occupied day)
    const billEndDate = new Date(dischargeDate);
    billEndDate.setDate(billEndDate.getDate() + 1);
    const billEndDateStr = billEndDate.toISOString().split('T')[0];

    // 2. Get ward periods (transfers) – treat to_date as exclusive
    const transfers = await query(
      `SELECT 
         wt.ward_id,
         w.daily_rate,
         w.type as ward_type,
         wt.from_date,
         COALESCE(wt.to_date, $1::date) AS to_date
       FROM ward_transfers wt
       JOIN wards w ON wt.ward_id = w.id
       WHERE wt.admission_id = $2
       ORDER BY wt.from_date`,
      [billEndDateStr, admissionId]
    );

    // 3. Build room rent items using exclusive intervals
    const roomItems = [];

    if (transfers.rows.length > 0) {
      for (const period of transfers.rows) {
        const from = new Date(period.from_date);
        const to = new Date(period.to_date);
        const days = Math.max(0, Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)));
        if (days === 0) continue;
        const rate = parseFloat(period.daily_rate);
        const total = days * rate;
        roomItems.push({
          medicine_name: `Room Rent – ${period.ward_type}`,
          quantity: days,
          unit_price: rate,
          total_price: total,
        });
      }
    } else {
      // No transfers – single ward
      const wardRes = await query(
        `SELECT w.daily_rate, w.type as ward_type
         FROM wards w
         WHERE w.id = $1`,
        [admission.ward_id]
      );
      if (wardRes.rows.length === 0) {
        throw new Error('Ward not found');
      }
      const ward = wardRes.rows[0];
      const dailyRate = parseFloat(ward.daily_rate);
      const start = new Date(admission.admission_date);
      const end = billEndDate;
      const days = Math.max(0, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      if (days > 0) {
        roomItems.push({
          medicine_name: `Room Rent – ${ward.ward_type}`,
          quantity: days,
          unit_price: dailyRate,
          total_price: days * dailyRate,
        });
      }
    }

    // 4. Fetch lab orders for this admission
    const labOrders = await query(
      `SELECT 
         id,
         tests,
         total_amount,
         order_date
       FROM lab_orders
       WHERE admission_id = $1 AND status = 'Completed'
       ORDER BY order_date ASC`,
      [admissionId]
    );

    // 5. Convert lab orders to bill items
    const labItems: any[] = [];
    for (const order of labOrders.rows) {
      const tests = order.tests;
      if (Array.isArray(tests)) {
        for (const test of tests) {
          labItems.push({
            medicine_name: test.name,
            quantity: 1,
            unit_price: test.price,
            total_price: test.price,
            lab_order_id: order.id,
          });
        }
      }
    }

    // =====================================================
    // 6. Fetch pharmacy items (medicines) for this admission
    // =====================================================
    const pharmacyItems = await query(
      `SELECT 
         si.id as sale_item_id,
         m.name as medicine_name,
         si.quantity,
         si.unit_price,
         si.total as total_price,
         s.sale_date
       FROM sale_items si
       JOIN sales s ON si.sale_id = s.id
       JOIN medicines m ON si.medicine_id = m.id
       WHERE s.patient_id::text = $1::text
         AND s.sale_date >= $2
         AND s.sale_date <= $3
       ORDER BY s.sale_date ASC`,
      [admission.patient_id, admission.admission_date, dischargeDate]
    );

    // Convert pharmacy items to bill items
    const pharmacyBillItems: any[] = [];
    for (const item of pharmacyItems.rows) {
      pharmacyBillItems.push({
        medicine_name: item.medicine_name,
        quantity: item.quantity,
        unit_price: parseFloat(item.unit_price),
        total_price: parseFloat(item.total_price),
        sale_item_id: item.sale_item_id,
      });
    }

    // 7. Get or create the bill record
    const billNumber = `IP-${Date.now()}-${admissionId}`;
    const insertBill = await query(
      `INSERT INTO ip_bills (sale_id, patient_id, admission_id, bill_number, total_amount, status)
       VALUES (NULL, $1, $2, $3, 0, 'UNPAID')
       ON CONFLICT (admission_id) DO NOTHING
       RETURNING id`,
      [admission.patient_id, admissionId, billNumber]
    );

    let billId: number;
    if (insertBill.rows.length === 0) {
      const existing = await query(
        `SELECT id FROM ip_bills WHERE admission_id = $1`,
        [admissionId]
      );
      billId = existing.rows[0].id;
    } else {
      billId = insertBill.rows[0].id;
    }

    // 8. Delete existing items
    await query(`DELETE FROM ip_bill_items WHERE bill_id = $1`, [billId]);

    // 9. DEDUPLICATE AND INSERT ROOM ITEMS
    const uniqueRoomItems = new Map();
    for (const item of roomItems) {
      const key = item.medicine_name;
      if (uniqueRoomItems.has(key)) {
        const existing = uniqueRoomItems.get(key);
        existing.quantity += item.quantity;
        existing.total_price += item.total_price;
      } else {
        uniqueRoomItems.set(key, { ...item });
      }
    }

    for (const item of uniqueRoomItems.values()) {
      await query(
        `INSERT INTO ip_bill_items (bill_id, medicine_name, quantity, unit_price, total_price)
         VALUES ($1, $2, $3, $4, $5)`,
        [billId, item.medicine_name, item.quantity, item.unit_price, item.total_price]
      );
    }

    // 10. DEDUPLICATE AND INSERT LAB ITEMS
    const uniqueLabItems = new Map();
    for (const item of labItems) {
      const key = item.medicine_name;
      if (uniqueLabItems.has(key)) {
        const existing = uniqueLabItems.get(key);
        existing.quantity += item.quantity;
        existing.total_price += item.total_price;
      } else {
        uniqueLabItems.set(key, { ...item });
      }
    }

    for (const item of uniqueLabItems.values()) {
      await query(
        `INSERT INTO ip_bill_items (bill_id, medicine_name, quantity, unit_price, total_price)
         VALUES ($1, $2, $3, $4, $5)`,
        [billId, item.medicine_name, item.quantity, item.unit_price, item.total_price]
      );
    }

    // 11. DEDUPLICATE AND INSERT PHARMACY ITEMS
    const uniquePharmacyItems = new Map();
    for (const item of pharmacyBillItems) {
      const key = item.medicine_name;
      if (uniquePharmacyItems.has(key)) {
        const existing = uniquePharmacyItems.get(key);
        existing.quantity += item.quantity;
        existing.total_price += item.total_price;
      } else {
        uniquePharmacyItems.set(key, { ...item });
      }
    }

    for (const item of uniquePharmacyItems.values()) {
      await query(
        `INSERT INTO ip_bill_items (bill_id, medicine_name, quantity, unit_price, total_price, sale_item_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [billId, item.medicine_name, item.quantity, item.unit_price, item.total_price, item.sale_item_id]
      );
    }

    // 12. Recalculate total amount
    const totalAmountRes = await query(
      `SELECT SUM(total_price) as total FROM ip_bill_items WHERE bill_id = $1`,
      [billId]
    );
    const newTotal = totalAmountRes.rows[0]?.total || 0;

    // 13. Get current paid amount and determine status
    const billPaidRes = await query(
      `SELECT paid_amount FROM ip_bills WHERE id = $1`,
      [billId]
    );
    const currentPaid = parseFloat(billPaidRes.rows[0]?.paid_amount || 0);
    const newStatus = newTotal <= currentPaid ? 'PAID' : currentPaid > 0 ? 'PARTIAL' : 'UNPAID';

    // 14. Update bill totals and status
    await query(
      `UPDATE ip_bills
       SET total_amount = $1, status = $2, updated_at = NOW()
       WHERE id = $3`,
      [newTotal, newStatus, billId]
    );

    // 15. Return the updated bill summary
    const finalBillRes = await query(
      `SELECT id, total_amount, paid_amount, status FROM ip_bills WHERE id = $1`,
      [billId]
    );
    const bill = finalBillRes.rows[0];
    const total = parseFloat(bill.total_amount);
    const paid = parseFloat(bill.paid_amount);
    const remaining = total - paid;

    return NextResponse.json({
      success: true,
      message: 'Bill generated/updated successfully with room, lab, and pharmacy items',
      data: {
        billId: bill.id,
        totalAmount: total,
        paidAmount: paid,
        status: bill.status,
        remainingAmount: remaining,
      },
    });
  } catch (error: unknown) {
    console.error('Bill generation error:', error);
  


    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}