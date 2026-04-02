// import { NextRequest, NextResponse } from 'next/server';
// import { query } from '@/lib/db';
// import { z } from 'zod';

// const DischargeSchema = z.object({
//   dischargeNotes: z.string().optional(),
// });

// export async function POST(
//   req: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   console.log('📥 POST /api/bed-config/beds/[id]/discharge - Starting request');
  
//   try {
//     const { id } = await params;
//     const bedId = parseInt(id);
    
//     if (isNaN(bedId)) {
//       return NextResponse.json(
//         { success: false, message: 'Invalid bed ID' },
//         { status: 400 }
//       );
//     }

//     const body = await req.json();
//     console.log('📦 Request body:', JSON.stringify(body, null, 2));

//     const validation = DischargeSchema.safeParse(body);

//     if (!validation.success) {
//       return NextResponse.json(
//         { success: false, message: 'Validation failed', errors: validation.error.flatten().fieldErrors },
//         { status: 400 }
//       );
//     }

//     const { dischargeNotes } = validation.data;

//     // Check if bed exists and is occupied
//     const bedCheck = await query(
//       'SELECT status, attributes FROM beds WHERE id = $1',
//       [bedId]
//     );

//     if (bedCheck.rows.length === 0) {
//       return NextResponse.json(
//         { success: false, message: 'Bed not found' },
//         { status: 404 }
//       );
//     }

//     if (bedCheck.rows[0].status !== 'occupied') {
//       return NextResponse.json(
//         { success: false, message: 'Bed is not occupied' },
//         { status: 400 }
//       );
//     }

//     const bed = bedCheck.rows[0];
//     const currentAttributes = bed.attributes || {};
    
//     // Get current patient info before clearing
//     const dischargedPatient = currentAttributes.currentPatient;
    
//     // Update patient history
//     const updatedPatientHistory = [
//       ...(currentAttributes.patientHistory || []).map((p: any) => 
//         p.patientId === dischargedPatient?.id 
//           ? { ...p, dischargeDate: new Date().toISOString().split('T')[0], notes: dischargeNotes }
//           : p
//       )
//     ];

//     // Update bed - clear current patient and set to cleaning
//     const updatedAttributes = {
//       ...currentAttributes,
//       currentPatient: null,
//       patientHistory: updatedPatientHistory,
//       lastDischarge: {
//         date: new Date().toISOString().split('T')[0],
//         patient: dischargedPatient,
//         notes: dischargeNotes
//       }
//     };

//     const updateResult = await query(
//       `UPDATE beds 
//        SET status = 'cleaning',
//            attributes = $1::jsonb,
//            updated_at = CURRENT_TIMESTAMP
//        WHERE id = $2
//        RETURNING *`,
//       [JSON.stringify(updatedAttributes), bedId]
//     );

//     return NextResponse.json({
//       success: true,
//       message: 'Patient discharged successfully',
//       data: updateResult.rows[0]
//     });

//   } catch (error) {
//     console.error('Error discharging patient:', error);
//     return NextResponse.json(
//       { success: false, message: 'Failed to discharge patient' },
//       { status: 500 }
//     );
//   }
// }



import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db';
import { z } from 'zod';

const DischargeSchema = z.object({
  admissionId: z.union([z.number(), z.string()]).transform(val => Number(val)),
  dischargeId: z.string().min(1, 'Discharge ID is required'),
  dischargeNotes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  console.log('📥 POST /api/helpdesk/admissions/discharge - Starting request');

  try {
    const body = await req.json();
    console.log('📦 Request body:', JSON.stringify(body, null, 2));

    const validation = DischargeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { admissionId, dischargeId, dischargeNotes } = validation.data;
    const today = new Date().toISOString().split('T')[0];

    await transaction(async (client) => {
      // 1. Get admission details (must be active)
      const admissionRes = await client.query(
        `SELECT a.*, b.id as bed_id, b.attributes as bed_attributes
         FROM admissions a
         LEFT JOIN beds b ON a.bed_id = b.id
         WHERE a.id = $1 AND a.status = 'active'`,
        [admissionId]
      );
      if (admissionRes.rows.length === 0) {
        throw new Error('Active admission not found');
      }
      const admission = admissionRes.rows[0];

      // 2. Already discharged?
      if (admission.discharge_id) {
        throw new Error('Admission already discharged');
      }

      // 3. Ensure dischargeId is unique
      const existing = await client.query(
        `SELECT id FROM admissions WHERE discharge_id = $1`,
        [dischargeId]
      );
      if (existing.rows.length > 0) {
        throw new Error('Discharge ID already exists');
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

      // 5. Update admission record
      await client.query(
        `UPDATE admissions
         SET discharge_date = $1, status = 'discharged', discharge_id = $2, updated_at = NOW()
         WHERE id = $3`,
        [today, dischargeId, admissionId]
      );

      // 6. Free the bed and update its attributes (if a bed is assigned)
      if (admission.bed_id) {
        const bedAttributes = admission.bed_attributes || {};
        const currentPatient = bedAttributes.currentPatient || null;

        const updatedBedAttributes = {
          ...bedAttributes,
          currentPatient: null,
          patientHistory: [
            ...(bedAttributes.patientHistory || []),
            {
              patientId: admission.patient_id,
              name: currentPatient?.name || admission.patient_name,
              admissionDate: admission.admission_date,
              dischargeDate: today,
              notes: dischargeNotes,
            },
          ],
          lastDischarge: {
            date: today,
            patient: currentPatient,
            notes: dischargeNotes,
          },
        };

        await client.query(
          `UPDATE beds
           SET status = 'cleaning',
               attributes = $1::jsonb,
               occupied_by = NULL,
               occupied_at = NULL,
               updated_at = NOW()
           WHERE id = $2`,
          [JSON.stringify(updatedBedAttributes), admission.bed_id]
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