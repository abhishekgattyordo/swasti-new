// app/api/nurse/medications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Fetch medication administrations for a patient
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const patientId = searchParams.get('patientId');
    const status = searchParams.get('status');
    const active = searchParams.get('active');

    if (!patientId) {
      return NextResponse.json(
        { success: false, message: 'Patient ID is required' },
        { status: 400 }
      );
    }

    let sql = `
      SELECT 
        id,
        patient_id,
        medication_name,
        dosage,
        route,
        frequency,
        scheduled_time,
        duration_days,
        administered_time,
        administered_by,
        administered_by_id,
        prescribed_by,
        prescribed_by_id,
        status,
        notes,
        created_at,
        updated_at,
        created_at::date + COALESCE(duration_days, 0) * INTERVAL '1 day' as end_date,
        CASE 
          WHEN duration_days IS NULL THEN true
          WHEN created_at::date + (duration_days || ' days')::interval >= CURRENT_DATE THEN true
          ELSE false
        END as is_active
      FROM medication_administrations 
      WHERE patient_id = $1
    `;
    const params: any[] = [patientId];
    let paramIndex = 2;

    if (status && status !== 'all') {
      sql += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    if (active === 'true') {
      sql += ` AND (
        duration_days IS NULL 
        OR created_at::date + (duration_days || ' days')::interval >= CURRENT_DATE
      )`;
    }

    sql += ` ORDER BY created_at DESC`;

    const result = await query(sql, params);

    const administrations = result.rows.map((row: any) => ({
      id: row.id,
      patientId: row.patient_id,
      medicationName: row.medication_name,
      dosage: row.dosage,
      route: row.route,
      frequency: row.frequency,
      scheduledTime: row.scheduled_time,
      durationDays: row.duration_days,
      endDate: row.end_date ? new Date(row.end_date).toLocaleDateString() : null,
      isActive: row.is_active,
      administeredTime: row.administered_time 
        ? new Date(row.administered_time).toLocaleString() 
        : null,
      administeredBy: row.administered_by,
      administeredById: row.administered_by_id,
      prescribedBy: row.prescribed_by,
      prescribedById: row.prescribed_by_id,
      status: row.status,
      notes: row.notes,
      createdAt: row.created_at,
    }));

    return NextResponse.json({
      success: true,
      data: administrations,
      count: administrations.length,
    });

  } catch (error) {
    console.error('Error fetching medications:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch medications' },
      { status: 500 }
    );
  }
}

// POST - Record medication administration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      patientId,
      medicationName,
      dosage,
      route,
      frequency,
      scheduledTime,
      duration,
      notes,
      administeredBy,
      nurseId,
      nurseName,
      prescribedBy,
      prescribedById,
      status,
    } = body;

    console.log('========================================');
    console.log('Recording Medication Administration');
    console.log('Patient ID:', patientId);
    console.log('Medication:', medicationName, dosage, route);
    console.log('Frequency:', frequency);
    console.log('Duration:', duration, 'days');
    console.log('Status:', status || 'pending');
    console.log('Prescribed by:', prescribedBy, '(ID:', prescribedById, ')');
    console.log('Administered by:', nurseName, '(ID:', nurseId, ')');
    console.log('========================================');

    if (!patientId || !medicationName || !dosage || !route) {
      return NextResponse.json(
        { success: false, message: 'Patient ID, medication name, dosage, and route are required' },
        { status: 400 }
      );
    }

    // Build administered_by string (Nurse) - NAME ONLY
    const administeredByFull = nurseName || administeredBy || 'Nurse';

    // Build prescribed_by string (Doctor) - NAME ONLY
    const prescribedByFull = prescribedBy || null;

    // ✅ DEFAULT TO 'pending' - nurse must confirm to mark as administered
    const recordStatus = status || 'pending';

    const result = await query(
      `INSERT INTO medication_administrations (
        patient_id, medication_name, dosage, route, frequency,
        scheduled_time, duration_days, administered_time, 
        administered_by, administered_by_id,
        prescribed_by, prescribed_by_id,
        status, notes, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8, $9, $10, $11, $12, $13, NOW())
      RETURNING *`,
      [
        patientId,
        medicationName,
        dosage,
        route,
        frequency || null,
        scheduledTime || null,
        duration ? parseInt(duration) : null,
        administeredByFull,
        nurseId || null,
        prescribedByFull,
        prescribedById || null,
        recordStatus,
        notes || null,
      ]
    );

    const newRecord = result.rows[0];

    console.log('✅ Medication administration recorded!');
    console.log('Record ID:', newRecord.id);
    console.log('Status:', newRecord.status);
    console.log('Administered by:', newRecord.administered_by);
    console.log('Prescribed by:', newRecord.prescribed_by);

    return NextResponse.json({
      success: true,
      message: 'Medication administration recorded successfully',
      data: {
        id: newRecord.id,
        patientId: newRecord.patient_id,
        medicationName: newRecord.medication_name,
        dosage: newRecord.dosage,
        route: newRecord.route,
        frequency: newRecord.frequency,
        scheduledTime: newRecord.scheduled_time,
        durationDays: newRecord.duration_days,
        administeredBy: newRecord.administered_by,
        administeredById: newRecord.administered_by_id,
        prescribedBy: newRecord.prescribed_by,
        prescribedById: newRecord.prescribed_by_id,
        status: newRecord.status,
        notes: newRecord.notes,
      },
    });

  } catch (error) {
    console.error('❌ Error recording medication:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to record medication administration',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
// PUT - Update medication administration status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, notes, administeredBy, nurseId, nurseName } = body;

    console.log('PUT request body:', body);

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Record ID is required' },
        { status: 400 }
      );
    }

    const administeredByFull = nurseName || administeredBy || 'Nurse';
    const recordId = parseInt(id);
    const newStatus = String(status);  // ✅ Ensure status is a string
    const newNotes = notes ? String(notes) : null;  // ✅ Ensure notes is string or null
    const adminById = nurseId ? String(nurseId) : null;  // ✅ Ensure string

    console.log('PUT params:', { recordId, newStatus, newNotes, administeredByFull, adminById });

    const result = await query(
      `UPDATE medication_administrations 
       SET status = $1::varchar, 
           notes = $2::text, 
           administered_by = $3::varchar,
           administered_by_id = $4::varchar,
           administered_time = CASE WHEN $1 = 'administered' THEN NOW() ELSE administered_time END,
           updated_at = NOW()
       WHERE id = $5::integer
       RETURNING *`,
      [newStatus, newNotes, administeredByFull, adminById, recordId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Medication status updated successfully',
      data: result.rows[0],
    });

  } catch (error) {
    console.error('Error updating medication:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update medication' },
      { status: 500 }
    );
  }
}