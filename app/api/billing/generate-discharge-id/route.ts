import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { admissionId } = await req.json();

  if (!admissionId) {
    return NextResponse.json({ success: false, message: 'Admission ID required' }, { status: 400 });
  }

  try {
    // 1. Verify admission exists and is active
    const admissionRes = await query(
      `SELECT id, discharge_id FROM admissions WHERE id = $1 AND status = 'active'`,
      [admissionId]
    );
    if (admissionRes.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Active admission not found' }, { status: 404 });
    }
    const admission = admissionRes.rows[0];

    // 2. Check if bill is fully paid
    const billRes = await query(
      `SELECT total_amount, paid_amount FROM ip_bills WHERE admission_id = $1`,
      [admissionId]
    );
    if (billRes.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'No bill found for this admission' }, { status: 404 });
    }
    const bill = billRes.rows[0];
    const total = parseFloat(bill.total_amount);
    const paid = parseFloat(bill.paid_amount);
    if (paid < total) {
      return NextResponse.json({ success: false, message: 'Bill not fully paid' }, { status: 400 });
    }

    // 3. Generate or return existing discharge ID
    let dischargeId = admission.discharge_id;
    if (!dischargeId) {
      dischargeId = `DISC-${Date.now()}-${admissionId}`;
      await query(
        `UPDATE admissions SET discharge_id = $1 WHERE id = $2`,
        [dischargeId, admissionId]
      );
    }

    return NextResponse.json({ success: true, data: { dischargeId } });
  } catch (error: any) {
    console.error('Error generating discharge ID:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}