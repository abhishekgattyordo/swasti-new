// app/api/doctor/prescriptions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const patientId = searchParams.get('patientId');

    if (!patientId) {
      return NextResponse.json(
        { success: false, message: 'Patient ID is required' },
        { status: 400 }
      );
    }

    const result = await query(
      `SELECT 
        dp.id,
        dp.medication_name,
        dp.dosage,
        dp.frequency,
        dp.duration,
        dp.route,
        dp.instructions,
        dp.recorded_by as prescriber,
        dp.created_at,
        a.patient_id,
        a.doctor_id
      FROM doctor_prescriptions dp
      JOIN appointments a ON dp.appointment_id = a.id
      WHERE a.patient_id = $1
      ORDER BY dp.created_at DESC`,
      [patientId]
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });

  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch prescriptions' },
      { status: 500 }
    );
  }
}