import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const result = await query(
      `SELECT 
        a.id as appointment_id,
        p.patient_id,
        p.full_name_en as patient_name,
        a.appointment_date as date,
        a.consultation_fee as amount,
        COALESCE(a.payment_status, 'pending') as status,
        a.payment_method as method,
        ROW_NUMBER() OVER (ORDER BY a.appointment_date DESC) as rn
       FROM appointments a
       JOIN patients p ON a.patient_id = p.patient_id
       WHERE a.consultation_fee IS NOT NULL AND a.consultation_fee > 0
       ORDER BY a.appointment_date DESC`
    );

    const invoices = result.rows.map(row => {
      const dateStr = row.date.replace(/-/g, '');
      const invoiceNumber = `INV-${dateStr}-${String(row.rn).padStart(4, '0')}`;
      return {
        id: invoiceNumber,                // display ID
        appointmentId: row.appointment_id, // original UUID – IMPORTANT
        patientName: row.patient_name,
        patientId: row.patient_id,
        date: row.date,
        amount: parseFloat(row.amount),
        status: row.status,
        method: row.method || null,
      };
    });

    return NextResponse.json({ success: true, data: invoices });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}