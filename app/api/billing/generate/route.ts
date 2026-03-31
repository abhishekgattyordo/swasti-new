import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { admissionId } = await req.json();

  if (!admissionId) {
    return NextResponse.json({ success: false, message: 'Admission ID required' }, { status: 400 });
  }

  try {
    // 1. Get admission details with ward and patient info
    const admissionRes = await query(
      `SELECT a.*, w.daily_rate, p.patient_id, p.full_name_en
       FROM admissions a
       JOIN wards w ON a.ward_id = w.id
       JOIN patients p ON a.patient_id = p.patient_id
       WHERE a.id = $1`,
      [admissionId]
    );

    if (admissionRes.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Admission not found' }, { status: 404 });
    }

    const admission = admissionRes.rows[0];
    const startDate = new Date(admission.admission_date);
    const endDate = admission.discharge_date ? new Date(admission.discharge_date) : new Date();
    const days = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

    const dailyRate = parseFloat(admission.daily_rate);
    const roomTotal = dailyRate * days;

    // 2. Generate a unique bill number if not exists
    const existingBill = await query(
      `SELECT id FROM ip_bills WHERE admission_id = $1`,
      [admissionId]
    );

    let billId: number;
    if (existingBill.rows.length === 0) {
      const billNumber = `IP-${Date.now()}-${admissionId}`;
      const insertRes = await query(
        `INSERT INTO ip_bills (sale_id, patient_id, admission_id, bill_number, total_amount, status)
         VALUES (NULL, $1, $2, $3, $4, 'UNPAID') RETURNING id`,
        [admission.patient_id, admissionId, billNumber, roomTotal]
      );
      billId = insertRes.rows[0].id;

      // Insert room rent item
      await query(
        `INSERT INTO ip_bill_items (bill_id, medicine_name, quantity, unit_price, total_price)
         VALUES ($1, $2, $3, $4, $5)`,
        [billId, `Room Rent – ${admission.ward_type || 'Ward'} (${days} days)`, days, dailyRate, roomTotal]
      );
    } else {
      billId = existingBill.rows[0].id;
      // Check if a room rent item already exists
      const existingRoomItem = await query(
        `SELECT id FROM ip_bill_items WHERE bill_id = $1 AND medicine_name LIKE 'Room Rent%' LIMIT 1`,
        [billId]
      );
      if (existingRoomItem.rows.length === 0) {
        // Add room rent
        await query(
          `INSERT INTO ip_bill_items (bill_id, medicine_name, quantity, unit_price, total_price)
           VALUES ($1, $2, $3, $4, $5)`,
          [billId, `Room Rent – ${admission.ward_type || 'Ward'} (${days} days)`, days, dailyRate, roomTotal]
        );
      }
      // Recalculate total amount by summing all items
      const totalAmountRes = await query(
        `SELECT SUM(total_price) as total FROM ip_bill_items WHERE bill_id = $1`,
        [billId]
      );
      const newTotal = totalAmountRes.rows[0]?.total || 0;
      await query(
        `UPDATE ip_bills SET total_amount = $1, updated_at = NOW() WHERE id = $2`,
        [newTotal, billId]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Bill generated/updated successfully',
      data: { billId, totalAmount: roomTotal }
    });
  } catch (error: unknown) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}