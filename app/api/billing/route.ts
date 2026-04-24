import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authErrorResponse,requireRole } from '@/lib/auth/guards';

export async function GET(req: NextRequest) {
  try {
           requireRole(req, ['billing']);
    const url = new URL(req.url);
    const patientId = url.searchParams.get('patientId');
    const admissionId = url.searchParams.get('admissionId');

    // Case 1: Only patientId provided → return all admissions for that patient
    if (patientId && !admissionId) {
      const admissionsRes = await query(
        `SELECT 
          a.id as admission_id,
          a.admission_date,
          a.discharge_date,
          a.status as admission_status,
          w.name as ward_name,
          b.bed_number
         FROM admissions a
         LEFT JOIN wards w ON a.ward_id = w.id
         LEFT JOIN beds b ON a.bed_id = b.id
         WHERE a.patient_id = $1
         ORDER BY a.admission_date DESC`,
        [patientId]
      );
      const admissions = admissionsRes.rows;
      if (admissions.length === 0) {
        return NextResponse.json(
          { success: false, message: 'No admissions found for this patient' },
          { status: 404 }
        );
      }

      const result = [];
      for (const admission of admissions) {
        const admissionIdNum = admission.admission_id;
        const billsRes = await query(
          `SELECT id, bill_number, total_amount, paid_amount, status, created_at
           FROM ip_bills WHERE admission_id = $1 ORDER BY created_at ASC`,
          [admissionIdNum]
        );
        const bills = billsRes.rows;

        let total = 0, paid = 0;
        let items: any[] = [];
        if (bills.length > 0) {
          const billIds = bills.map(b => b.id);
          const itemsRes = await query(
            `SELECT 
              bi.bill_id, bi.medicine_name, bi.quantity, bi.unit_price, bi.total_price,
              b.created_at as bill_created_at
             FROM ip_bill_items bi
             JOIN ip_bills b ON bi.bill_id = b.id
             WHERE bi.bill_id = ANY($1::int[])
             ORDER BY b.created_at ASC, bi.id ASC`,
            [billIds]
          );
          items = itemsRes.rows;
          for (const bill of bills) {
            total += parseFloat(bill.total_amount);
            paid += parseFloat(bill.paid_amount);
          }
        }
        const remaining = total - paid;
        const status = remaining <= 0 ? 'PAID' : paid > 0 ? 'PARTIAL' : 'UNPAID';

        result.push({
          admission_id: admissionIdNum,
          admission_date: admission.admission_date,
          discharge_date: admission.discharge_date,
          admission_status: admission.admission_status,
          ward_name: admission.ward_name,
          bed_number: admission.bed_number,
          bill_summary: { totalAmount: total, paidAmount: paid, remainingAmount: remaining, status },
          bills: bills.map(b => ({ id: b.id, bill_number: b.bill_number })),
          items: items.map(i => ({
            medicine_name: i.medicine_name,
            quantity: i.quantity,
            unit_price: parseFloat(i.unit_price),
            total_price: parseFloat(i.total_price),
            bill_id: i.bill_id,
            bill_created_at: i.bill_created_at,
          })),
        });
      }
      return NextResponse.json({ success: true, data: result });
    }

    // Case 2: admissionId provided (with optional patientId)
    if (admissionId) {
      const admissionIdNum = parseInt(admissionId);
      // Optionally verify patient if given
      if (patientId) {
        const check = await query(
          `SELECT id FROM admissions WHERE id = $1 AND patient_id = $2`,
          [admissionIdNum, patientId]
        );
        if (check.rows.length === 0) {
          return NextResponse.json(
            { success: false, message: 'Admission not found for this patient' },
            { status: 404 }
          );
        }
      }

      // Get admission details
      const admissionRes = await query(
        `SELECT 
          a.id as admission_id,
          a.admission_date,
          a.discharge_date,
          a.status as admission_status,
          w.name as ward_name,
          b.bed_number
         FROM admissions a
         LEFT JOIN wards w ON a.ward_id = w.id
         LEFT JOIN beds b ON a.bed_id = b.id
         WHERE a.id = $1`,
        [admissionIdNum]
      );
      if (admissionRes.rows.length === 0) {
        return NextResponse.json(
          { success: false, message: 'Admission not found' },
          { status: 404 }
        );
      }
      const admission = admissionRes.rows[0];

      // Get bills and items for this admission
      const billsRes = await query(
        `SELECT id, bill_number, total_amount, paid_amount, status, created_at
         FROM ip_bills WHERE admission_id = $1 ORDER BY created_at ASC`,
        [admissionIdNum]
      );
      const bills = billsRes.rows;

      let total = 0, paid = 0;
      let items: any[] = [];
      if (bills.length > 0) {
        const billIds = bills.map(b => b.id);
        const itemsRes = await query(
          `SELECT 
            bi.bill_id, bi.medicine_name, bi.quantity, bi.unit_price, bi.total_price,
            b.created_at as bill_created_at
           FROM ip_bill_items bi
           JOIN ip_bills b ON bi.bill_id = b.id
           WHERE bi.bill_id = ANY($1::int[])
           ORDER BY b.created_at ASC, bi.id ASC`,
          [billIds]
        );
        items = itemsRes.rows;
        for (const bill of bills) {
          total += parseFloat(bill.total_amount);
          paid += parseFloat(bill.paid_amount);
        }
      }
      const remaining = total - paid;
      const status = remaining <= 0 ? 'PAID' : paid > 0 ? 'PARTIAL' : 'UNPAID';

      const result = {
        admission: {
          id: admission.admission_id,
          date: admission.admission_date,
          discharge_date: admission.discharge_date,
          status: admission.admission_status,
          ward: admission.ward_name,
          bed: admission.bed_number,
        },
        bill_summary: { totalAmount: total, paidAmount: paid, remainingAmount: remaining, status },
        bills: bills.map(b => ({ id: b.id, bill_number: b.bill_number })),
        items: items.map(i => ({
          medicine_name: i.medicine_name,
          quantity: i.quantity,
          unit_price: parseFloat(i.unit_price),
          total_price: parseFloat(i.total_price),
          bill_id: i.bill_id,
          bill_created_at: i.bill_created_at,
        })),
      };
      return NextResponse.json({ success: true, data: result });
    }

    // Case 3: No parameters – return all inpatient bills (like original GET /api/billing/bills)
    const sql = `
      SELECT 
        b.id, b.bill_number, b.sale_id, b.patient_id, p.full_name_en as patient_name,
        b.admission_id, b.total_amount, b.paid_amount, b.status, b.created_at
      FROM ip_bills b
      LEFT JOIN patients p ON b.patient_id::TEXT = p.patient_id::TEXT
      WHERE b.admission_id IS NOT NULL
      ORDER BY b.created_at DESC
    `;
    const billsResult = await query(sql);
    const bills = billsResult.rows;

    for (const bill of bills) {
      const itemsRes = await query(
        `SELECT id, medicine_name, quantity, unit_price, total_price
         FROM ip_bill_items WHERE bill_id = $1 ORDER BY id`,
        [bill.id]
      );
      bill.items = itemsRes.rows;
    }
    return NextResponse.json({ success: true, data: bills });
  } catch (error: any) {
    console.error('Billing API error:', error);
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