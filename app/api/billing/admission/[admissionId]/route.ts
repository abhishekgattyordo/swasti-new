import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authErrorResponse,requireRole } from '@/lib/auth/guards';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ admissionId: string }> }
) {
  try {
       requireRole(req, ['billing']);
    const { admissionId } = await params;
    const admissionIdNum = parseInt(admissionId);

    // 1. Get all bills for this admission
    const billsRes = await query(
      `SELECT id, bill_number, patient_id, total_amount, paid_amount, status, created_at
       FROM ip_bills
       WHERE admission_id = $1
       ORDER BY created_at ASC`,
      [admissionIdNum]
    );
    const bills = billsRes.rows;

    if (bills.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No bills found for this admission' },
        { status: 404 }
      );
    }

    // 2. Fetch all items from all these bills
    const billIds = bills.map(b => b.id);
    let items: any[] = [];
    if (billIds.length > 0) {
      const itemsRes = await query(
        `SELECT 
          bi.bill_id, 
          bi.medicine_name, 
          bi.quantity, 
          bi.unit_price, 
          bi.total_price,
          b.created_at as bill_created_at
         FROM ip_bill_items bi
         JOIN ip_bills b ON bi.bill_id = b.id
         WHERE bi.bill_id = ANY($1::int[])
         ORDER BY b.created_at ASC, bi.id ASC`,
        [billIds]
      );
      items = itemsRes.rows;
    }

    // 3. Calculate totals
    let totalAmount = 0;
    let paidAmount = 0;
    for (const bill of bills) {
      totalAmount += parseFloat(bill.total_amount);
      paidAmount += parseFloat(bill.paid_amount);
    }

    // 4. Prepare consolidated bill object
    const consolidatedBill = {
      admissionId: admissionIdNum,
      bills: bills.map(b => ({ id: b.id, bill_number: b.bill_number })),
      consolidated: true,
      totalAmount,
      paidAmount,
      remainingAmount: totalAmount - paidAmount,
      status: totalAmount - paidAmount <= 0 ? 'PAID' : paidAmount > 0 ? 'PARTIAL' : 'UNPAID',
      items: items.map(i => ({
        medicine_name: i.medicine_name,
        quantity: i.quantity,
        unit_price: parseFloat(i.unit_price),
        total_price: parseFloat(i.total_price),
        bill_id: i.bill_id,
        bill_created_at: i.bill_created_at,
      })),
    };

    return NextResponse.json({ success: true, data: consolidatedBill });
  } catch (error: any) {
    console.error('Error fetching consolidated bill:', error);
        const authResponse=authErrorResponse(error);

if(authResponse){
  return authResponse
}
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}