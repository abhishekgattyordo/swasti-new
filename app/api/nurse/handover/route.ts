// app/api/nurse/handover/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// ============================================
// GET - Fetch handover(s)
// ============================================
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const handoverId = searchParams.get('id');
    const date = searchParams.get('date');
    const status = searchParams.get('status');

    let handoverResult;

    if (handoverId) {
      // Get specific handover
      handoverResult = await query(
        `SELECT * FROM shift_handovers WHERE id = $1`,
        [parseInt(handoverId)]
      );
    } else if (date) {
      // Get handovers for a date
      handoverResult = await query(
        `SELECT * FROM shift_handovers WHERE handover_date = $1 ORDER BY created_at DESC`,
        [date]
      );
    } else {
      // Get latest handover
      handoverResult = await query(
        `SELECT * FROM shift_handovers ORDER BY created_at DESC LIMIT 1`
      );
    }

    // Also filter by status if provided
    let handovers = handoverResult.rows;
    if (status && status !== 'all') {
      handovers = handovers.filter((h: any) => h.status === status);
    }

    if (handovers.length === 0) {
      return NextResponse.json({ success: true, data: null, message: 'No handovers found' });
    }

    // Get patients for each handover
    const handoversWithPatients = await Promise.all(
      handovers.map(async (handover: any) => {
        const patientsResult = await query(
          `SELECT * FROM handover_patients WHERE handover_id = $1`,
          [handover.id]
        );

        return {
          ...handover,
          checklist: typeof handover.checklist === 'string' ? JSON.parse(handover.checklist) : handover.checklist,
          patients: patientsResult.rows.map((p: any) => ({
            ...p,
            pendingTasks: typeof p.pending_tasks === 'string' ? JSON.parse(p.pending_tasks) : p.pending_tasks,
            medicationsDue: typeof p.medications_due === 'string' ? JSON.parse(p.medications_due) : p.medications_due,
            labTestsPending: typeof p.lab_tests_pending === 'string' ? JSON.parse(p.lab_tests_pending) : p.lab_tests_pending,
          })),
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: handoverId ? handoversWithPatients[0] : handoversWithPatients,
      count: handoversWithPatients.length,
    });

  } catch (error) {
    console.error('Error fetching handover:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch handover' },
      { status: 500 }
    );
  }
}

// ============================================
// POST - Create new handover
// ============================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      fromNurse,
      toNurse,
      fromShift,
      toShift,
      generalNotes,
      equipmentStatus,
      emergencySupplies,
      checklist,
      patients,
      nurseId,
      nurseName,
    } = body;

    console.log('Creating handover:', { fromNurse, toNurse, fromShift, toShift, patientCount: patients?.length });

    if (!fromNurse || !toNurse || !patients || patients.length === 0) {
      return NextResponse.json(
        { success: false, message: 'From nurse, to nurse, and patients are required' },
        { status: 400 }
      );
    }

    const createdBy = nurseName || fromNurse || 'Nurse';

    // Start transaction
    await query('BEGIN');

    try {
      // Insert handover
      const handoverResult = await query(
        `INSERT INTO shift_handovers (
          from_nurse, to_nurse, from_shift, to_shift,
          handover_date, handover_time, general_notes,
          equipment_status, emergency_supplies, checklist,
          status, created_by, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, CURRENT_DATE, CURRENT_TIME, $5, $6, $7, $8, 'completed', $9, NOW(), NOW())
        RETURNING *`,
        [
          fromNurse,
          toNurse,
          fromShift,
          toShift,
          generalNotes || null,
          equipmentStatus || null,
          emergencySupplies || null,
          JSON.stringify(checklist || []),
          createdBy,
        ]
      );

      const handoverId = handoverResult.rows[0].id;

      // Insert patients
      for (const patient of patients) {
        await query(
          `INSERT INTO handover_patients (
            handover_id, patient_id, patient_name, bed,
            current_status, pending_tasks, medications_due,
            lab_tests_pending, doctor_instructions,
            family_communication, special_notes, additional_notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            handoverId,
            patient.patientId,
            patient.patientName,
            patient.bed,
            patient.currentStatus,
            JSON.stringify(patient.pendingTasks || []),
            JSON.stringify(patient.medicationsDue || []),
            JSON.stringify(patient.labTestsPending || []),
            patient.doctorInstructions || null,
            patient.familyCommunication || null,
            patient.specialNotes || null,
            patient.additionalNotes || null,
          ]
        );
      }

      await query('COMMIT');

      console.log('✅ Handover created! ID:', handoverId);

      return NextResponse.json({
        success: true,
        message: 'Handover created successfully',
        data: { id: handoverId, ...handoverResult.rows[0] },
      });

    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Error creating handover:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create handover' },
      { status: 500 }
    );
  }
}

// ============================================
// PUT - Acknowledge handover
// ============================================
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { handoverId, acknowledgedBy } = body;

    if (!handoverId) {
      return NextResponse.json(
        { success: false, message: 'Handover ID is required' },
        { status: 400 }
      );
    }

    const result = await query(
      `UPDATE shift_handovers 
       SET status = 'acknowledged', 
           acknowledged_by = $1, 
           acknowledged_at = NOW(),
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [acknowledgedBy || 'Unknown', parseInt(handoverId)]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Handover not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Handover acknowledged successfully',
      data: result.rows[0],
    });

  } catch (error) {
    console.error('Error acknowledging handover:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to acknowledge handover' },
      { status: 500 }
    );
  }
}