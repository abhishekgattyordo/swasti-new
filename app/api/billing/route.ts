// import { NextRequest, NextResponse } from 'next/server';
// import { query } from '@/lib/db';


// export async function GET(req: NextRequest) {
//   try {
        
//     const url = new URL(req.url);
//     const patientId = url.searchParams.get('patientId');
//     const admissionId = url.searchParams.get('admissionId');

//     // Case 1: Only patientId provided → return all admissions for that patient
//     if (patientId && !admissionId) {
//       const admissionsRes = await query(
//         `SELECT 
//           a.id as admission_id,
//           a.admission_date,
//           a.discharge_date,
//           a.status as admission_status,
//           w.name as ward_name,
//           b.bed_number
//          FROM admissions a
//          LEFT JOIN wards w ON a.ward_id = w.id
//          LEFT JOIN beds b ON a.bed_id = b.id
//          WHERE a.patient_id = $1
//          ORDER BY a.admission_date DESC`,
//         [patientId]
//       );
//       const admissions = admissionsRes.rows;
//       if (admissions.length === 0) {
//         return NextResponse.json(
//           { success: false, message: 'No admissions found for this patient' },
//           { status: 404 }
//         );
//       }

//       const result = [];
//       for (const admission of admissions) {
//         const admissionIdNum = admission.admission_id;
//         const billsRes = await query(
//           `SELECT id, bill_number, total_amount, paid_amount, status, created_at
//            FROM ip_bills WHERE admission_id = $1 ORDER BY created_at ASC`,
//           [admissionIdNum]
//         );
//         const bills = billsRes.rows;

//         let total = 0, paid = 0;
//         let items: any[] = [];
//         if (bills.length > 0) {
//           const billIds = bills.map(b => b.id);
//           const itemsRes = await query(
//             `SELECT 
//               bi.bill_id, bi.medicine_name, bi.quantity, bi.unit_price, bi.total_price,
//               b.created_at as bill_created_at
//              FROM ip_bill_items bi
//              JOIN ip_bills b ON bi.bill_id = b.id
//              WHERE bi.bill_id = ANY($1::int[])
//              ORDER BY b.created_at ASC, bi.id ASC`,
//             [billIds]
//           );
//           items = itemsRes.rows;
//           for (const bill of bills) {
//             total += parseFloat(bill.total_amount);
//             paid += parseFloat(bill.paid_amount);
//           }
//         }
//         const remaining = total - paid;
//         const status = remaining <= 0 ? 'PAID' : paid > 0 ? 'PARTIAL' : 'UNPAID';

//         result.push({
//           admission_id: admissionIdNum,
//           admission_date: admission.admission_date,
//           discharge_date: admission.discharge_date,
//           admission_status: admission.admission_status,
//           ward_name: admission.ward_name,
//           bed_number: admission.bed_number,
//           bill_summary: { totalAmount: total, paidAmount: paid, remainingAmount: remaining, status },
//           bills: bills.map(b => ({ id: b.id, bill_number: b.bill_number })),
//           items: items.map(i => ({
//             medicine_name: i.medicine_name,
//             quantity: i.quantity,
//             unit_price: parseFloat(i.unit_price),
//             total_price: parseFloat(i.total_price),
//             bill_id: i.bill_id,
//             bill_created_at: i.bill_created_at,
//           })),
//         });
//       }
//       return NextResponse.json({ success: true, data: result });
//     }

//     // Case 2: admissionId provided (with optional patientId)
//     if (admissionId) {
//       const admissionIdNum = parseInt(admissionId);
//       // Optionally verify patient if given
//       if (patientId) {
//         const check = await query(
//           `SELECT id FROM admissions WHERE id = $1 AND patient_id = $2`,
//           [admissionIdNum, patientId]
//         );
//         if (check.rows.length === 0) {
//           return NextResponse.json(
//             { success: false, message: 'Admission not found for this patient' },
//             { status: 404 }
//           );
//         }
//       }

//       // Get admission details
//       const admissionRes = await query(
//         `SELECT 
//           a.id as admission_id,
//           a.admission_date,
//           a.discharge_date,
//           a.status as admission_status,
//           w.name as ward_name,
//           b.bed_number
//          FROM admissions a
//          LEFT JOIN wards w ON a.ward_id = w.id
//          LEFT JOIN beds b ON a.bed_id = b.id
//          WHERE a.id = $1`,
//         [admissionIdNum]
//       );
//       if (admissionRes.rows.length === 0) {
//         return NextResponse.json(
//           { success: false, message: 'Admission not found' },
//           { status: 404 }
//         );
//       }
//       const admission = admissionRes.rows[0];

//       // Get bills and items for this admission
//       const billsRes = await query(
//         `SELECT id, bill_number, total_amount, paid_amount, status, created_at
//          FROM ip_bills WHERE admission_id = $1 ORDER BY created_at ASC`,
//         [admissionIdNum]
//       );
//       const bills = billsRes.rows;

//       let total = 0, paid = 0;
//       let items: any[] = [];
//       if (bills.length > 0) {
//         const billIds = bills.map(b => b.id);
//         const itemsRes = await query(
//           `SELECT 
//             bi.bill_id, bi.medicine_name, bi.quantity, bi.unit_price, bi.total_price,
//             b.created_at as bill_created_at
//            FROM ip_bill_items bi
//            JOIN ip_bills b ON bi.bill_id = b.id
//            WHERE bi.bill_id = ANY($1::int[])
//            ORDER BY b.created_at ASC, bi.id ASC`,
//           [billIds]
//         );
//         items = itemsRes.rows;
//         for (const bill of bills) {
//           total += parseFloat(bill.total_amount);
//           paid += parseFloat(bill.paid_amount);
//         }
//       }
//       const remaining = total - paid;
//       const status = remaining <= 0 ? 'PAID' : paid > 0 ? 'PARTIAL' : 'UNPAID';

//       const result = {
//         admission: {
//           id: admission.admission_id,
//           date: admission.admission_date,
//           discharge_date: admission.discharge_date,
//           status: admission.admission_status,
//           ward: admission.ward_name,
//           bed: admission.bed_number,
//         },
//         bill_summary: { totalAmount: total, paidAmount: paid, remainingAmount: remaining, status },
//         bills: bills.map(b => ({ id: b.id, bill_number: b.bill_number })),
//         items: items.map(i => ({
//           medicine_name: i.medicine_name,
//           quantity: i.quantity,
//           unit_price: parseFloat(i.unit_price),
//           total_price: parseFloat(i.total_price),
//           bill_id: i.bill_id,
//           bill_created_at: i.bill_created_at,
//         })),
//       };
//       return NextResponse.json({ success: true, data: result });
//     }

//     // Case 3: No parameters – return all inpatient bills (like original GET /api/billing/bills)
//     const sql = `
//       SELECT 
//         b.id, b.bill_number, b.sale_id, b.patient_id, p.full_name_en as patient_name,
//         b.admission_id, b.total_amount, b.paid_amount, b.status, b.created_at
//       FROM ip_bills b
//       LEFT JOIN patients p ON b.patient_id::TEXT = p.patient_id::TEXT
//       WHERE b.admission_id IS NOT NULL
//       ORDER BY b.created_at DESC
//     `;
//     const billsResult = await query(sql);
//     const bills = billsResult.rows;

//     for (const bill of bills) {
//       const itemsRes = await query(
//         `SELECT id, medicine_name, quantity, unit_price, total_price
//          FROM ip_bill_items WHERE bill_id = $1 ORDER BY id`,
//         [bill.id]
//       );
//       bill.items = itemsRes.rows;
//     }
//     return NextResponse.json({ success: true, data: bills });
//   } catch (error: any) {
//     console.error('Billing API error:', error);
    

//     return NextResponse.json(
//       { success: false, message: error.message },
//       { status: 500 }
//     );
//   }
// }




// import { NextRequest, NextResponse } from 'next/server';
// import { query } from '@/lib/db';
// import { authErrorResponse,requireRole } from '@/lib/auth/guards';

// export async function GET(req: NextRequest) {
//   try {
//     requireRole(req, ['billing']);
//     const url = new URL(req.url);
//     const patientId = url.searchParams.get('patientId');
//     const admissionId = url.searchParams.get('admissionId');

//     // ✅ Helper function to get transfer details for an admission
//     async function getTransferDetails(admissionIdNum: number) {
//       const transfersRes = await query(
//         `SELECT 
//            wt.id,
//            wt.from_date,
//            COALESCE(wt.to_date, CURRENT_DATE) as to_date,
//            w.name as ward_name,
//            w.daily_rate
//          FROM ward_transfers wt
//          JOIN wards w ON wt.ward_id = w.id
//          WHERE wt.admission_id = $1
//          ORDER BY wt.from_date ASC`,
//         [admissionIdNum]
//       );

//       return transfersRes.rows.map((transfer: any) => {
//         const fromDate = new Date(transfer.from_date);
//         const toDate = new Date(transfer.to_date);
//         const days = Math.max(1, Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)));
//         const rate = parseFloat(transfer.daily_rate || 0);
        
//         return {
//           id: transfer.id,
//           from_date: transfer.from_date,
//           to_date: transfer.to_date === null ? null : transfer.to_date,
//           ward_name: transfer.ward_name,
//           days: days,
//           daily_rate: rate,
//           total: days * rate
//         };
//       });
//     }

//     // Case 1: Only patientId provided → return all admissions for that patient
//     if (patientId && !admissionId) {
//       const admissionsRes = await query(
//         `SELECT 
//           a.id as admission_id,
//           a.admission_date,
//           a.discharge_date,
//           a.status as admission_status,
//           w.name as ward_name,
//           b.bed_number
//          FROM admissions a
//          LEFT JOIN wards w ON a.ward_id = w.id
//          LEFT JOIN beds b ON a.bed_id = b.id
//          WHERE a.patient_id = $1
//          ORDER BY a.admission_date DESC`,
//         [patientId]
//       );
//       const admissions = admissionsRes.rows;
//       if (admissions.length === 0) {
//         return NextResponse.json(
//           { success: false, message: 'No admissions found for this patient' },
//           { status: 404 }
//         );
//       }

//       const result = [];
//       for (const admission of admissions) {
//         const admissionIdNum = admission.admission_id;
//         const billsRes = await query(
//           `SELECT id, bill_number, total_amount, paid_amount, status, created_at
//            FROM ip_bills WHERE admission_id = $1 ORDER BY created_at ASC`,
//           [admissionIdNum]
//         );
//         const bills = billsRes.rows;

//         let total = 0, paid = 0;
//         let items: any[] = [];
//         if (bills.length > 0) {
//           const billIds = bills.map(b => b.id);
//           const itemsRes = await query(
//             `SELECT 
//               bi.bill_id, bi.medicine_name, bi.quantity, bi.unit_price, bi.total_price,
//               b.created_at as bill_created_at
//              FROM ip_bill_items bi
//              JOIN ip_bills b ON bi.bill_id = b.id
//              WHERE bi.bill_id = ANY($1::int[])
//              ORDER BY b.created_at ASC, bi.id ASC`,
//             [billIds]
//           );
//           items = itemsRes.rows;
//           for (const bill of bills) {
//             total += parseFloat(bill.total_amount);
//             paid += parseFloat(bill.paid_amount);
//           }
//         }
//         const remaining = total - paid;
//         const status = remaining <= 0 ? 'PAID' : paid > 0 ? 'PARTIAL' : 'UNPAID';

//         // ✅ Get transfer details
//         const transfers = await getTransferDetails(admissionIdNum);
//         const totalTransferDays = transfers.reduce((sum, t) => sum + t.days, 0);
//         const totalTransferAmount = transfers.reduce((sum, t) => sum + t.total, 0);

//         result.push({
//           admission_id: admissionIdNum,
//           admission_date: admission.admission_date,
//           discharge_date: admission.discharge_date,
//           admission_status: admission.admission_status,
//           ward_name: admission.ward_name,
//           bed_number: admission.bed_number,
//           bill_summary: { totalAmount: total, paidAmount: paid, remainingAmount: remaining, status },
//           bills: bills.map(b => ({ id: b.id, bill_number: b.bill_number })),
//           items: items.map(i => ({
//             medicine_name: i.medicine_name,
//             quantity: i.quantity,
//             unit_price: parseFloat(i.unit_price),
//             total_price: parseFloat(i.total_price),
//             bill_id: i.bill_id,
//             bill_created_at: i.bill_created_at,
//           })),
//           transfers: transfers,
//           transfer_summary: {
//             total_transfers: transfers.length,
//             total_days: totalTransferDays,
//             total_room_rent: totalTransferAmount
//           }
//         });
//       }
//       return NextResponse.json({ success: true, data: result });
//     }

//     // Case 2: admissionId provided (with optional patientId)
//     if (admissionId) {
//       const admissionIdNum = parseInt(admissionId);
//       if (patientId) {
//         const check = await query(
//           `SELECT id FROM admissions WHERE id = $1 AND patient_id = $2`,
//           [admissionIdNum, patientId]
//         );
//         if (check.rows.length === 0) {
//           return NextResponse.json(
//             { success: false, message: 'Admission not found for this patient' },
//             { status: 404 }
//           );
//         }
//       }

//       // Get admission details
//       const admissionRes = await query(
//         `SELECT 
//           a.id as admission_id,
//           a.admission_date,
//           a.discharge_date,
//           a.status as admission_status,
//           w.name as ward_name,
//           b.bed_number
//          FROM admissions a
//          LEFT JOIN wards w ON a.ward_id = w.id
//          LEFT JOIN beds b ON a.bed_id = b.id
//          WHERE a.id = $1`,
//         [admissionIdNum]
//       );
//       if (admissionRes.rows.length === 0) {
//         return NextResponse.json(
//           { success: false, message: 'Admission not found' },
//           { status: 404 }
//         );
//       }
//       const admission = admissionRes.rows[0];

//       // Get bills and items for this admission
//       const billsRes = await query(
//         `SELECT id, bill_number, total_amount, paid_amount, status, created_at
//          FROM ip_bills WHERE admission_id = $1 ORDER BY created_at ASC`,
//         [admissionIdNum]
//       );
//       const bills = billsRes.rows;

//       let total = 0, paid = 0;
//       let items: any[] = [];
//       if (bills.length > 0) {
//         const billIds = bills.map(b => b.id);
//         const itemsRes = await query(
//           `SELECT 
//             bi.bill_id, bi.medicine_name, bi.quantity, bi.unit_price, bi.total_price,
//             b.created_at as bill_created_at
//            FROM ip_bill_items bi
//            JOIN ip_bills b ON bi.bill_id = b.id
//            WHERE bi.bill_id = ANY($1::int[])
//            ORDER BY b.created_at ASC, bi.id ASC`,
//           [billIds]
//         );
//         items = itemsRes.rows;
//         for (const bill of bills) {
//           total += parseFloat(bill.total_amount);
//           paid += parseFloat(bill.paid_amount);
//         }
//       }
//       const remaining = total - paid;
//       const status = remaining <= 0 ? 'PAID' : paid > 0 ? 'PARTIAL' : 'UNPAID';

//       // ✅ Get transfer details
//       const transfers = await getTransferDetails(admissionIdNum);
//       const totalTransferDays = transfers.reduce((sum, t) => sum + t.days, 0);
//       const totalTransferAmount = transfers.reduce((sum, t) => sum + t.total, 0);

//       const result = {
//         admission: {
//           id: admission.admission_id,
//           date: admission.admission_date,
//           discharge_date: admission.discharge_date,
//           status: admission.admission_status,
//           ward: admission.ward_name,
//           bed: admission.bed_number,
//         },
//         bill_summary: { totalAmount: total, paidAmount: paid, remainingAmount: remaining, status },
//         bills: bills.map(b => ({ id: b.id, bill_number: b.bill_number })),
//         items: items.map(i => ({
//           medicine_name: i.medicine_name,
//           quantity: i.quantity,
//           unit_price: parseFloat(i.unit_price),
//           total_price: parseFloat(i.total_price),
//           bill_id: i.bill_id,
//           bill_created_at: i.bill_created_at,
//         })),
//         transfers: transfers,
//         transfer_summary: {
//           total_transfers: transfers.length,
//           total_days: totalTransferDays,
//           total_room_rent: totalTransferAmount
//         }
//       };
//       return NextResponse.json({ success: true, data: result });
//     }

//     // Case 3: No parameters – return all inpatient bills
//     const sql = `
//       SELECT 
//         b.id, b.bill_number, b.sale_id, b.patient_id, p.full_name_en as patient_name,
//         b.admission_id, b.total_amount, b.paid_amount, b.status, b.created_at
//       FROM ip_bills b
//       LEFT JOIN patients p ON b.patient_id::TEXT = p.patient_id::TEXT
//       WHERE b.admission_id IS NOT NULL
//       ORDER BY b.created_at DESC
//     `;
//     const billsResult = await query(sql);
//     const bills = billsResult.rows;

//     for (const bill of bills) {
//       const itemsRes = await query(
//         `SELECT id, medicine_name, quantity, unit_price, total_price
//          FROM ip_bill_items WHERE bill_id = $1 ORDER BY id`,
//         [bill.id]
//       );
//       bill.items = itemsRes.rows;
//     }
//     return NextResponse.json({ success: true, data: bills });
//   } catch (error: any) {
//     console.error('Billing API error:', error);
//     const authResponse = authErrorResponse(error);
//     if (authResponse) {
//       return authResponse;
//     }
//     return NextResponse.json(
//       { success: false, message: error.message },
//       { status: 500 }
//     );
//   }
// }




import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authErrorResponse, requireRole } from '@/lib/auth/guards';

export async function GET(req: NextRequest) {
  try {
    requireRole(req, ['billing']);
    const url = new URL(req.url);
    const patientId = url.searchParams.get('patientId');
    const admissionId = url.searchParams.get('admissionId');

    // ✅ Helper function to get transfer details for an admission
    async function getTransferDetails(admissionIdNum: number) {
      const transfersRes = await query(
        `SELECT 
           wt.id,
           wt.from_date,
           COALESCE(wt.to_date, CURRENT_DATE) as to_date,
           w.name as ward_name,
           w.daily_rate
         FROM ward_transfers wt
         JOIN wards w ON wt.ward_id = w.id
         WHERE wt.admission_id = $1
         ORDER BY wt.from_date ASC`,
        [admissionIdNum]
      );

      return transfersRes.rows.map((transfer: any) => {
        const fromDate = new Date(transfer.from_date);
        const toDate = new Date(transfer.to_date);
        const days = Math.max(1, Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)));
        const rate = parseFloat(transfer.daily_rate || 0);
        
        return {
          id: transfer.id,
          from_date: transfer.from_date,
          to_date: transfer.to_date === null ? null : transfer.to_date,
          ward_name: transfer.ward_name,
          days: days,
          daily_rate: rate,
          total: days * rate
        };
      });
    }

    // ✅ Helper function to get OT bill for an admission
    async function getOTBill(admissionIdNum: number) {
      const otBillRes = await query(
        `SELECT 
           ob.id as ot_bill_id,
           ob.case_id,
           ob.patient_id,
           ob.admission_id,
           ob.surgeon_fee,
           ob.assistant_fee,
           ob.ot_usage_fee,
           ob.anesthesia_fee,
           ob.nursing_fee,
           ob.consumables_fee,
           ob.implants_fee,
           ob.recovery_room_fee,
           ob.medicines_fee,
           ob.equipment_fee,
           ob.total_ot_charges,
           ob.status as ot_status,
           ob.created_at as ot_created_at,
           s.surgery_name,
           s.diagnosis,
           s.surgery_type,
           s.status as case_status
         FROM ip_ot_bills ob
         LEFT JOIN surgery_cases s ON ob.case_id = s.id
         WHERE ob.admission_id = $1
         ORDER BY ob.created_at DESC
         LIMIT 1`,
        [admissionIdNum]
      );

      if (otBillRes.rows.length === 0) {
        return null;
      }

      const ot = otBillRes.rows[0];

      // Get OT bill items
      const itemsRes = await query(
        `SELECT 
           id, description, quantity, unit_price, total_price, bill_id, case_id
         FROM ip_ot_bill_items
         WHERE bill_id = (
           SELECT bill_id FROM ip_ot_bills WHERE admission_id = $1 ORDER BY created_at DESC LIMIT 1
         )
         ORDER BY id`,
        [admissionIdNum]
      );

      return {
        otBillId: ot.ot_bill_id,
        caseId: ot.case_id,
        patientId: ot.patient_id,
        admissionId: ot.admission_id,
        totalOTCharges: parseFloat(ot.total_ot_charges) || 0,
        status: ot.ot_status || 'UNPAID',
        createdAt: ot.ot_created_at,
        surgeryName: ot.surgery_name,
        diagnosis: ot.diagnosis,
        surgeryType: ot.surgery_type,
        caseStatus: ot.case_status,
        items: itemsRes.rows.map((item: any) => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: parseFloat(item.unit_price) || 0,
          total_price: parseFloat(item.total_price) || 0,
          bill_id: item.bill_id,
          case_id: item.case_id,
        })),
        breakdown: {
          surgeonFee: parseFloat(ot.surgeon_fee) || 0,
          assistantFee: parseFloat(ot.assistant_fee) || 0,
          otUsageFee: parseFloat(ot.ot_usage_fee) || 0,
          anesthesiaFee: parseFloat(ot.anesthesia_fee) || 0,
          nursingFee: parseFloat(ot.nursing_fee) || 0,
          consumablesFee: parseFloat(ot.consumables_fee) || 0,
          implantsFee: parseFloat(ot.implants_fee) || 0,
          recoveryRoomFee: parseFloat(ot.recovery_room_fee) || 0,
          medicinesFee: parseFloat(ot.medicines_fee) || 0,
          equipmentFee: parseFloat(ot.equipment_fee) || 0,
        }
      };
    }

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

        // ✅ Get transfer details
        const transfers = await getTransferDetails(admissionIdNum);
        const totalTransferDays = transfers.reduce((sum, t) => sum + t.days, 0);
        const totalTransferAmount = transfers.reduce((sum, t) => sum + t.total, 0);

        // ✅ Get OT bill
        const otBill = await getOTBill(admissionIdNum);

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
          transfers: transfers,
          transfer_summary: {
            total_transfers: transfers.length,
            total_days: totalTransferDays,
            total_room_rent: totalTransferAmount
          },
          ot_bill: otBill // ✅ Add OT bill
        });
      }
      return NextResponse.json({ success: true, data: result });
    }

    // Case 2: admissionId provided (with optional patientId)
    if (admissionId) {
      const admissionIdNum = parseInt(admissionId);
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

      // ✅ Get transfer details
      const transfers = await getTransferDetails(admissionIdNum);
      const totalTransferDays = transfers.reduce((sum, t) => sum + t.days, 0);
      const totalTransferAmount = transfers.reduce((sum, t) => sum + t.total, 0);

      // ✅ Get OT bill
      const otBill = await getOTBill(admissionIdNum);

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
        transfers: transfers,
        transfer_summary: {
          total_transfers: transfers.length,
          total_days: totalTransferDays,
          total_room_rent: totalTransferAmount
        },
        ot_bill: otBill // ✅ Add OT bill
      };
      return NextResponse.json({ success: true, data: result });
    }

    // Case 3: No parameters – return all inpatient bills with OT info
    const sql = `
      SELECT 
        b.id, b.bill_number, b.sale_id, b.patient_id, p.full_name_en as patient_name,
        b.admission_id, b.total_amount, b.paid_amount, b.status, b.created_at,
        b.ot_charges
      FROM ip_bills b
      LEFT JOIN patients p ON b.patient_id::TEXT = p.patient_id::TEXT
      WHERE b.admission_id IS NOT NULL
      ORDER BY b.created_at DESC
    `;
    const billsResult = await query(sql);
    const bills = billsResult.rows;

    for (const bill of bills) {
      // Get regular bill items
      const itemsRes = await query(
        `SELECT id, medicine_name, quantity, unit_price, total_price
         FROM ip_bill_items WHERE bill_id = $1 ORDER BY id`,
        [bill.id]
      );
      bill.items = itemsRes.rows;

      // ✅ Get OT bill for this bill
      const otBillRes = await query(
        `SELECT 
           id as ot_bill_id,
           case_id,
           total_ot_charges,
           status as ot_status,
           created_at as ot_created_at
         FROM ip_ot_bills
         WHERE bill_id = $1
         ORDER BY created_at DESC
         LIMIT 1`,
        [bill.id]
      );
      
      if (otBillRes.rows.length > 0) {
        const ot = otBillRes.rows[0];
        bill.ot_bill = {
          otBillId: ot.ot_bill_id,
          caseId: ot.case_id,
          totalOTCharges: parseFloat(ot.total_ot_charges) || 0,
          status: ot.ot_status,
          createdAt: ot.ot_created_at
        };
        
        // Get OT bill items
        const otItemsRes = await query(
          `SELECT id, description, quantity, unit_price, total_price
           FROM ip_ot_bill_items
           WHERE bill_id = $1
           ORDER BY id`,
          [bill.id]
        );
        bill.ot_items = otItemsRes.rows;
      } else {
        bill.ot_bill = null;
        bill.ot_items = [];
      }
    }
    return NextResponse.json({ success: true, data: bills });
  } catch (error: any) {
    console.error('Billing API error:', error);
    const authResponse = authErrorResponse(error);
    if (authResponse) {
      return authResponse;
    }
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}