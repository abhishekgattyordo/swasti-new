import { NextRequest, NextResponse } from 'next/server';
import {  transaction } from '@/lib/db';
import { authErrorResponse,requireRole } from '@/lib/auth/guards';

export async function POST(req: NextRequest) {
  const { billId, amount, paymentMethod, transactionId } = await req.json();

  if (!billId || !amount || amount <= 0) {
    return NextResponse.json({ success: false, message: 'Invalid payment data' }, { status: 400 });
  }

  try {
           requireRole(req, ['billing']);
    await transaction(async (client) => {
      // Lock bill row
      const billRes = await client.query(
        `SELECT total_amount, paid_amount FROM ip_bills WHERE id = $1 FOR UPDATE`,
        [billId]
      );
      if (billRes.rows.length === 0) throw new Error('Bill not found');
      const bill = billRes.rows[0];
      const newPaidAmount = parseFloat(bill.paid_amount) + amount;
      const newStatus = newPaidAmount >= parseFloat(bill.total_amount) ? 'PAID' : 'PARTIAL';

      // Insert payment
      await client.query(
        `INSERT INTO ip_payments (bill_id, amount, payment_method, transaction_id)
         VALUES ($1, $2, $3, $4)`,
        [billId, amount, paymentMethod, transactionId || null]
      );

      // Update bill
      await client.query(
        `UPDATE ip_bills SET paid_amount = $1, status = $2, updated_at = NOW() WHERE id = $3`,
        [newPaidAmount, newStatus, billId]
      );
    });
    return NextResponse.json({ success: true, message: 'Payment recorded' });
  } catch (error: any) {
    console.error('Payment error:', error);
      const authResponse=authErrorResponse(error);

if(authResponse){
  return authResponse
}
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}