import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    let patientId = url.searchParams.get('patientId');
    if (!patientId) {
      return NextResponse.json({ success: false, message: 'Patient ID required' }, { status: 400 });
    }
    patientId = patientId.trim();

    // 1. Fetch inpatient bills
    const inpatientRes = await query(
      `SELECT 
        b.id, b.bill_number, b.total_amount, b.paid_amount, b.status, b.created_at,
        a.admission_date, a.discharge_date,
        COALESCE(json_agg(
          json_build_object(
            'medicine_name', bi.medicine_name,
            'quantity', bi.quantity,
            'unit_price', bi.unit_price,
            'total_price', bi.total_price
          )
        ), '[]') as items
       FROM ip_bills b
       LEFT JOIN admissions a ON b.admission_id = a.id
       LEFT JOIN ip_bill_items bi ON b.id = bi.bill_id
       WHERE (b.patient_id::text = $1 OR a.patient_id::text = $1)
       GROUP BY b.id, a.id
       ORDER BY b.created_at DESC`,
      [patientId]
    );
    const inpatientBills = inpatientRes.rows;

    // 2. Fetch pharmacy purchases - filter out those already in inpatient bills
    const pharmacyRes = await query(
      `SELECT 
        s.id, 
        s.created_at as date, 
        s.grand_total as total_amount,
        0 as paid_amount,
        COALESCE(json_agg(
          json_build_object(
            'medicine_name', m.name,
            'quantity', si.quantity,
            'unit_price', si.unit_price,
            'total_price', si.total
          )
        ), '[]') as items
       FROM sales s
       JOIN sale_items si ON s.id = si.sale_id
       JOIN medicines m ON si.medicine_id = m.id
       WHERE s.patient_id::text = $1 
         AND s.walkin_name IS NULL
         AND NOT EXISTS (
           SELECT 1 FROM ip_bill_items ibi 
           WHERE ibi.medicine_name = m.name 
           AND ibi.bill_id IN (SELECT id FROM ip_bills WHERE patient_id::text = $1)
         )
       GROUP BY s.id
       ORDER BY s.created_at DESC`,
      [patientId]
    );
    const pharmacyPurchases = pharmacyRes.rows;

    // 3. Combine into transactions
    const transactions: any[] = [];

    inpatientBills.forEach((bill: any) => {
      transactions.push({
        id: `INP-${bill.id}`,
        type: 'inpatient',
        date: new Date(bill.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        serviceDate: bill.admission_date ? new Date(bill.admission_date).toLocaleDateString() : '',
        description: `Hospital Stay – ${bill.items?.length || 0} items`,
        provider: 'Inpatient Services',
        department: 'Inpatient',
        amount: parseFloat(bill.total_amount),
        insurancePaid: 0,
        patientPaid: parseFloat(bill.paid_amount),
        balance: parseFloat(bill.total_amount) - parseFloat(bill.paid_amount),
        status: bill.status.toLowerCase(),
        statusText: bill.status === 'PAID' ? 'Paid in Full' : bill.status === 'PARTIAL' ? 'Partial Payment' : 'Unpaid',
        pdf: true,
        items: bill.items,
      });
    });

    pharmacyPurchases.forEach((purchase: any) => {
      transactions.push({
        id: `PH-${purchase.id}`,
        type: 'pharmacy',
        date: new Date(purchase.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        serviceDate: new Date(purchase.date).toLocaleDateString(),
        description: `Pharmacy Purchase – ${purchase.items?.length || 0} items`,
        provider: 'Pharmacy',
        department: 'Pharmacy',
        amount: parseFloat(purchase.total_amount),
        insurancePaid: 0,
        patientPaid: parseFloat(purchase.paid_amount),
        balance: parseFloat(purchase.total_amount) - parseFloat(purchase.paid_amount),
        status: parseFloat(purchase.paid_amount) >= parseFloat(purchase.total_amount) ? 'paid' : 'pending',
        statusText: parseFloat(purchase.paid_amount) >= parseFloat(purchase.total_amount) ? 'Paid in Full' : 'Pending',
        pdf: false,
        items: purchase.items,
      });
    });

    // Sort by date (newest first)
    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Compute summary
    let totalBilled = 0, totalPaid = 0, outstanding = 0;
    transactions.forEach(t => {
      totalBilled += t.amount;
      totalPaid += t.patientPaid;
    });
    outstanding = totalBilled - totalPaid;

    const upcomingPayments = transactions.filter(t => t.balance > 0).map(t => ({
      id: t.id,
      description: t.description,
      amount: t.balance,
      dueDate: '--',
      status: 'pending',
    }));

    return NextResponse.json({
      success: true,
      data: {
        transactions,
        billingSummary: {
          totalBilled,
          insuranceCovered: 0,
          patientResponsibility: totalBilled,
          pendingAmount: outstanding,
          dueDate: '',
          outstanding,
        },
        upcomingPayments,
      },
    });
  } catch (error: any) {
    console.error('Patient billing API error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}