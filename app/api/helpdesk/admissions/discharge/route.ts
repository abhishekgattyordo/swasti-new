import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// POST /api/admissions/discharge
// Request: { admissionId, dischargeDate }
export async function POST(req: NextRequest) {
  const { admissionId, dischargeDate } = await req.json();

  try {
    await query('BEGIN');

    // 1. Update admission with discharge date
    const updateRes = await query(
      `UPDATE admissions SET discharge_date = $1, status = 'discharged'
       WHERE id = $2 RETURNING patient_id, ward_id, admission_date`,
      [dischargeDate, admissionId]
    );
    if (updateRes.rows.length === 0) {
      throw new Error('Admission not found');
    }
    const admission = updateRes.rows[0];

    // 2. Get ward daily rate
    const wardRes = await query(
      `SELECT daily_rate FROM wards WHERE id = $1`,
      [admission.ward_id]
    );
    const dailyRate = wardRes.rows[0]?.daily_rate || 0;

    // 3. Calculate days (inclusive)
    const start = new Date(admission.admission_date);
    const end = new Date(dischargeDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const roomTotal = dailyRate * days;

    // 4. Get or create bill for this admission
    let bill = await query(
      `SELECT id FROM ip_bills WHERE admission_id = $1`,
      [admissionId]
    );
    let billId: number;
    if (bill.rows.length === 0) {
      // Create a new bill
      const billNumber = `IP-${Date.now()}-${admissionId}`;
      const insertBill = await query(
        `INSERT INTO ip_bills (admission_id, patient_id, bill_number, status)
         VALUES ($1, $2, $3, 'UNPAID')
         RETURNING id`,
        [admissionId, admission.patient_id, billNumber]
      );
      billId = insertBill.rows[0].id;
    } else {
      billId = bill.rows[0].id;
    }

    // 5. Insert or update room rent line item
    const existingRoom = await query(
      `SELECT id FROM ip_bill_items WHERE bill_id = $1 AND medicine_name ILIKE 'Room Rent%'`,
      [billId]
    );
    if (existingRoom.rows.length === 0) {
      await query(
        `INSERT INTO ip_bill_items (bill_id, medicine_name, quantity, unit_price, total_price)
         VALUES ($1, $2, $3, $4, $5)`,
        [billId, `Room Rent – ${days} days @ ₹${dailyRate}/day`, days, dailyRate, roomTotal]
      );
    } else {
      // Update existing room rent line
      await query(
        `UPDATE ip_bill_items
         SET quantity = $1, unit_price = $2, total_price = $3
         WHERE id = $4`,
        [days, dailyRate, roomTotal, existingRoom.rows[0].id]
      );
    }

    // 6. Mark bill as FINAL (or update total amount if needed)
    // Recalculate total amount from items
    const totalRes = await query(
      `SELECT SUM(total_price) as total FROM ip_bill_items WHERE bill_id = $1`,
      [billId]
    );
    const newTotal = totalRes.rows[0]?.total || 0;
    await query(
      `UPDATE ip_bills SET total_amount = $1, status = 'FINAL', updated_at = NOW() WHERE id = $2`,
      [newTotal, billId]
    );

    await query('COMMIT');
    return NextResponse.json({ success: true, message: 'Discharged and bill updated' });
  } catch (error: unknown) {
    await query('ROLLBACK');
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}