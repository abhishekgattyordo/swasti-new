// app/api/nurse/vitals/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
// GET - Fetch vitals for a patient
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const patientId = searchParams.get('patientId');
    const hours = searchParams.get('hours') || '24';
    const date = searchParams.get('date');
    const context = searchParams.get('context') || 'admission'; // NEW: 'admission' or 'consultation'

    if (!patientId) {
      return NextResponse.json(
        { success: false, message: 'Patient ID is required' },
        { status: 400 }
      );
    }

    let timeFilter: string;
    let queryParams: any[];

    if (date) {
      timeFilter = `v.recorded_at::date = $1`;
      queryParams = [date];
    } else {
      timeFilter = `v.recorded_at >= NOW() - INTERVAL '1 hour' * $1`;
      queryParams = [parseInt(hours)];
    }

    // Build the query based on context
    let sql = `
      SELECT 
        v.id,
        v.bp,
        v.hr,
        v.temp,
        v.weight,
        v.rr,
        v.spo2,
        v.recorded_by,
        v.clinical_notes,
        v.status,
        v.recorded_at as timestamp,
        v.appointment_id,
        v.patient_id
      FROM vitals v
      WHERE ${timeFilter}
    `;

    if (context === 'admission') {
      // Only vitals recorded during hospital stay (nurse vitals)
      // These have patient_id set and appointment_id IS NULL
      sql += ` AND v.patient_id = $${queryParams.length + 1}`;
      sql += ` AND v.appointment_id IS NULL`;
      queryParams.push(patientId);
    } else if (context === 'consultation') {
      // Only vitals recorded during doctor consultation (before admission)
      // These have appointment_id set
      sql += ` AND v.appointment_id IN (
        SELECT id FROM appointments WHERE patient_id::text = $${queryParams.length + 1}
      )`;
      queryParams.push(patientId);
    } else {
      // All vitals (both consultation and admission)
      sql += ` AND (
        v.patient_id = $${queryParams.length + 1}
        OR v.appointment_id IN (
          SELECT id FROM appointments WHERE patient_id::text = $${queryParams.length + 1}
        )
      )`;
      queryParams.push(patientId);
    }

    sql += ` ORDER BY v.recorded_at ASC`;

    const result = await query(sql, queryParams);

    console.log(`Vitals found (${context}):`, result.rows.length);

    const vitals = result.rows.map((row: any) => ({
      id: row.id,
      timestamp: new Date(row.timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      fullTimestamp: row.timestamp,
      systolic: row.bp ? parseInt(row.bp.split('/')[0]) : 0,
      diastolic: row.bp ? parseInt(row.bp.split('/')[1]) : 0,
      heartRate: row.hr || 0,
      temperature: row.temp || 0,
      respiratoryRate: row.rr || 0,
      spO2: row.spo2 || 0,
      clinicalNotes: row.clinical_notes || '',
      status: row.status || 'stable',
      recordedBy: row.recorded_by || '',
      context: row.appointment_id ? 'consultation' : 'admission',
    }));

    return NextResponse.json({
      success: true,
      data: vitals,
      count: vitals.length,
      context: context,
    });

  } catch (error) {
    console.error('Error fetching vitals:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch vitals' },
      { status: 500 }
    );
  }
}

// POST - Record new vitals for a patient
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { 
      patientId, 
      systolic, 
      diastolic, 
      heartRate, 
      temperature, 
      respiratoryRate, 
      spO2,
      clinicalNotes,
      status,
      recordedBy,
      nurseId,
      nurseName
    } = body;

    console.log('========================================');
    console.log('Recording Vitals');
    console.log('Patient ID:', patientId);
    console.log('Nurse ID:', nurseId);
    console.log('Nurse Name:', nurseName);
    console.log('Vitals:', { systolic, diastolic, heartRate, temperature, respiratoryRate, spO2 });
    console.log('Status:', status);
    console.log('Clinical Notes:', clinicalNotes);
    console.log('========================================');

    // Validate required fields
    if (!patientId) {
      return NextResponse.json(
        { success: false, message: 'Patient ID is required' },
        { status: 400 }
      );
    }

    // Auto-determine status based on vitals if not provided
    let vitalStatus = status || 'stable';
    if (!status) {
      const isCritical = 
        (systolic && (systolic > 180 || systolic < 80)) ||
        (diastolic && (diastolic > 120 || diastolic < 50)) ||
        (heartRate && (heartRate > 130 || heartRate < 40)) ||
        (spO2 && spO2 < 90) ||
        (temperature && (temperature > 39.5 || temperature < 35));

      if (isCritical) {
        vitalStatus = 'critical';
      }
    }

    // Build recorded_by string with nurse info
    let recordedByFull = 'Nurse';
    if (nurseName && nurseId) {
      recordedByFull = `${nurseName} (Nurse ID: ${nurseId})`;
    } else if (nurseName) {
      recordedByFull = nurseName;
    } else if (recordedBy) {
      recordedByFull = recordedBy;
    }

    // Format BP as "systolic/diastolic"
    const bp = systolic && diastolic ? `${systolic}/${diastolic}` : null;

    // Try to find an appointment for this patient (optional)
    const appointmentResult = await query(
      `SELECT id FROM appointments 
       WHERE patient_id = $1 
       ORDER BY appointment_date DESC, created_at DESC
       LIMIT 1`,
      [patientId]
    );

    const appointmentId = appointmentResult.rows[0]?.id || null;

    // Insert vitals record WITH patient_id
    const result = await query(
      `INSERT INTO vitals (
        appointment_id, patient_id, bp, hr, temp, rr, spo2, recorded_by, clinical_notes, status, recorded_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      RETURNING id, bp, hr, temp, rr, spo2, recorded_by, clinical_notes, status, recorded_at, patient_id`,
      [
        appointmentId,
        patientId,  // ✅ ADDED: patient_id
        bp,
        heartRate || null,
        temperature || null,
        respiratoryRate || null,
        spO2 || null,
        recordedByFull,
        clinicalNotes || null,
        vitalStatus,
      ]
    );

    const newVital = result.rows[0];

    console.log('✅ Vitals recorded successfully!');
    console.log('Record ID:', newVital.id);
    console.log('Patient ID:', newVital.patient_id);
    console.log('Status:', newVital.status);
    console.log('Recorded by:', newVital.recorded_by);

    return NextResponse.json({
      success: true,
      message: 'Vitals recorded successfully',
      data: {
        id: newVital.id,
        patientId: newVital.patient_id,
        bp: newVital.bp,
        heartRate: newVital.hr,
        temperature: newVital.temp,
        respiratoryRate: newVital.rr,
        spO2: newVital.spo2,
        clinicalNotes: newVital.clinical_notes,
        status: newVital.status,
        recordedBy: newVital.recorded_by,
        recordedAt: newVital.recorded_at,
        nurseId,
        nurseName,
      },
    });

  } catch (error) {
    console.error('❌ Error recording vitals:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to record vitals', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}