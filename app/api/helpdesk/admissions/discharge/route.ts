import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { admissionId, dischargeId, dischargeNotes } = await req.json();

  if (!admissionId) {
    return NextResponse.json({ success: false, message: 'Admission ID required' }, { status: 400 });
  }
  if (!dischargeId || !dischargeId.trim()) {
    return NextResponse.json({ success: false, message: 'Discharge ID required' }, { status: 400 });
  }

  const today = new Date().toISOString().split('T')[0];

  try {
    await transaction(async (client) => {
      // 1. Get admission details
      const admissionRes = await client.query(
        `SELECT * FROM admissions WHERE id = $1`,
        [admissionId]
      );
      if (admissionRes.rows.length === 0) {
        throw new Error('Admission not found');
      }
      const admission = admissionRes.rows[0];

      // If already discharged, reject
      if (admission.status === 'discharged') {
        throw new Error('Admission already discharged');
      }

      // 2. If a discharge ID already exists (from billing), it must match the provided one
      if (admission.discharge_id && admission.discharge_id !== dischargeId) {
        throw new Error('Invalid discharge ID. Please use the correct ID generated after payment.');
      }

      // 3. If no discharge ID exists (shouldn't happen if billing generated it), ensure the provided ID is unique
      if (!admission.discharge_id) {
        const existing = await client.query(
          `SELECT id FROM admissions WHERE discharge_id = $1`,
          [dischargeId]
        );
        if (existing.rows.length > 0) {
          throw new Error('Discharge ID already exists');
        }
      }

      // 4. Get bill and check full payment
      const billRes = await client.query(
        `SELECT id, total_amount, paid_amount, status FROM ip_bills WHERE admission_id = $1`,
        [admissionId]
      );
      if (billRes.rows.length === 0) {
        throw new Error('No bill found for this admission');
      }
      const bill = billRes.rows[0];
      const total = parseFloat(bill.total_amount);
      const paid = parseFloat(bill.paid_amount);
      const remaining = total - paid;

      if (remaining > 0) {
        throw new Error(`Cannot discharge: Outstanding balance of ₹${remaining.toFixed(2)}`);
      }

      // 5. Update admission record (store the provided ID, which should match existing or be new)
      await client.query(
        `UPDATE admissions
         SET discharge_date = $1, status = 'discharged', discharge_id = $2, updated_at = NOW()
         WHERE id = $3`,
        [today, dischargeId, admissionId]
      );

      // 6. Free the bed (set to cleaning)
      if (admission.bed_id) {
        const bedRes = await client.query(
          `SELECT attributes FROM beds WHERE id = $1`,
          [admission.bed_id]
        );
        const bedAttributes = bedRes.rows[0]?.attributes || {};
        const updatedAttributes = {
          ...bedAttributes,
          lastDischarge: {
            date: today,
            notes: dischargeNotes,
            patientId: admission.patient_id,
          },
        };
        await client.query(
          `UPDATE beds
           SET status = 'cleaning',
               occupied_by = NULL,
               occupied_at = NULL,
               attributes = $1::jsonb,
               updated_at = NOW()
           WHERE id = $2`,
          [JSON.stringify(updatedAttributes), admission.bed_id]
        );
      }

      // 7. Mark bill as PAID if not already
      if (bill.status !== 'PAID') {
        await client.query(
          `UPDATE ip_bills SET status = 'PAID', updated_at = NOW() WHERE id = $1`,
          [bill.id]
        );
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Patient discharged successfully',
      data: { dischargeId },
    });
  } catch (error: unknown) {
    console.error('Discharge error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}

// GET handler remains unchanged
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const admissionId = url.searchParams.get('admissionId');

  if (!admissionId) {
    return NextResponse.json(
      { success: false, message: 'Admission ID required' },
      { status: 400 }
    );
  }

  try {
    const result = await query(
      `SELECT 
        id,
        admission_date,
        discharge_date,
        discharge_id,
        status,
        patient_id,
        ward_id,
        bed_id
       FROM admissions
       WHERE id = $1`,
      [admissionId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Admission not found' },
        { status: 404 }
      );
    }

    const admission = result.rows[0];
    return NextResponse.json({
      success: true,
      data: {
        admissionId: admission.id,
        admissionDate: admission.admission_date,
        dischargeDate: admission.discharge_date,
        dischargeId: admission.discharge_id,
        status: admission.status,
        isDischarged: admission.status === 'discharged',
      },
    });
  } catch (error: any) {
    console.error('Error fetching discharge details:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}