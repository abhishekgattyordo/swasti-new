// import { NextRequest, NextResponse } from 'next/server';
// import pool from '@/lib/db';

// export async function GET(
//   req: NextRequest,
//   { params }: { params: Promise<{ patientId: string }> }
// ) {
//   const client = await pool.connect();
//   try {
//     const { patientId } = await params;

//     const result = await client.query(
//       `SELECT 
//         a.id as appointment_id,
//         a.appointment_date,
//         a.appointment_time,
//         a.consultation_type,
//         a.status,
//         a.notes,
//         d.first_name || ' ' || d.last_name as doctor_name,
//         d.specialty as doctor_specialty,
//         vd.diagnosis,
//         vd.icd10_code,
//         vd.clinical_notes,
//         vd.follow_up_date,
//         vd.patient_instructions,
//         vd.created_at as visit_created_at,
//         vd.updated_at as visit_updated_at
//        FROM visit_details vd
//        JOIN appointments a ON vd.appointment_id = a.id
//        JOIN doctors d ON a.doctor_id = d.id
//        WHERE a.patient_id = $1
//        ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
//       [patientId]
//     );

//     return NextResponse.json({
//       success: true,
//       data: result.rows
//     });
//   } catch (error) {
//     console.error('Error fetching completed visits:', error);
//     return NextResponse.json(
//       { success: false, message: 'Internal server error' },
//       { status: 500 }
//     );
//   } finally {
//     client.release();
//   }
// }


import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await params;

    const result = await query(
      `SELECT 
        a.id as appointment_id,
        a.appointment_date,
        a.appointment_time,
        a.consultation_type,
        a.status,
        a.notes,
        d.first_name || ' ' || d.last_name as doctor_name,
        d.specialty as doctor_specialty,
        vd.diagnosis,
        vd.icd10_code,
        vd.clinical_notes,
        vd.follow_up_date,
        vd.patient_instructions,
        vd.created_at as visit_created_at,
        vd.updated_at as visit_updated_at
       FROM visit_details vd
       JOIN appointments a ON vd.appointment_id = a.id
       JOIN doctors d ON a.doctor_id = d.id
       WHERE a.patient_id = $1
       ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
      [patientId]
    );

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching completed visits:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}