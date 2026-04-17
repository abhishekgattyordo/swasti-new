// import { NextRequest, NextResponse } from 'next/server';
// import pool from '@/lib/db';

// // Helper to get appointment ID from patient ID and date
// async function getAppointmentIdByDate(patientId: string, date: string): Promise<string | null> {
//   const client = await pool.connect();
//   try {
//     const result = await client.query(
//       `SELECT id FROM appointments 
//        WHERE patient_id = $1 AND appointment_date = $2::date
//        ORDER BY appointment_time DESC
//        LIMIT 1`,
//       [patientId, date]
//     );
//     return result.rows[0]?.id || null;
//   } finally {
//     client.release();
//   }
// }

// // Helper to get the latest appointment ID for a patient
// async function getLatestAppointmentId(patientId: string): Promise<string | null> {
//   const client = await pool.connect();
//   try {
//     const result = await client.query(
//       `SELECT id FROM appointments 
//        WHERE patient_id = $1 
//        ORDER BY appointment_date DESC, appointment_time DESC 
//        LIMIT 1`,
//       [patientId]
//     );
//     return result.rows[0]?.id || null;
//   } finally {
//     client.release();
//   }
// }

// // GET /api/ehr/[patientId]/vitals?appointmentId=xxx&date=yyyy-mm-dd
// export async function GET(
//   req: NextRequest,
//   { params }: { params: Promise<{ patientId: string }> }
// ) {
//   const client = await pool.connect();
//   try {
//     const { patientId } = await params;
//     const url = new URL(req.url);
//     const appointmentId = url.searchParams.get('appointmentId');
//     const date = url.searchParams.get('date');

//     let targetAppointmentId = appointmentId;
//     if (!targetAppointmentId) {
//       if (date) {
//         targetAppointmentId = await getAppointmentIdByDate(patientId, date);
//         if (!targetAppointmentId) {
//           return NextResponse.json(
//             { success: false, message: 'No appointment found on this date' },
//             { status: 404 }
//           );
//         }
//       } else {
//         return NextResponse.json(
//           { success: false, message: 'Either appointmentId or date is required' },
//           { status: 400 }
//         );
//       }
//     }

//     // Fetch vitals for this appointment
//     const vitalsResult = await client.query(
//       `SELECT 
//         id,
//         bp,
//         hr,
//         temp,
//         weight,
//         rr,
//         spo2,
//         recorded_by as "recordedBy",
//         recorded_at as "recordedAt"
//        FROM vitals
//        WHERE appointment_id = $1
//        ORDER BY recorded_at DESC`,
//       [targetAppointmentId]
//     );

//     return NextResponse.json({
//       success: true,
//       data: vitalsResult.rows
//     });
//   } catch (error) {
//     console.error('Error fetching vitals:', error);
//     return NextResponse.json(
//       { success: false, message: 'Internal server error' },
//       { status: 500 }
//     );
//   } finally {
//     client.release();
//   }
// }

// // POST /api/ehr/[patientId]/vitals
// export async function POST(
//   req: NextRequest,
//   { params }: { params: Promise<{ patientId: string }> }
// ) {
//   const client = await pool.connect();
//   try {
//     const { patientId } = await params;
//     const body = await req.json();

//     let appointmentId = body.appointmentId;
//     const date = body.date;

//     // If no appointmentId or date, fallback to latest appointment
//     if (!appointmentId && !date) {
//       appointmentId = await getLatestAppointmentId(patientId);
//       if (!appointmentId) {
//         return NextResponse.json(
//           { success: false, message: 'No appointments found for this patient' },
//           { status: 404 }
//         );
//       }
//     } else if (!appointmentId && date) {
//       appointmentId = await getAppointmentIdByDate(patientId, date);
//       if (!appointmentId) {
//         return NextResponse.json(
//           { success: false, message: 'No appointment found on this date' },
//           { status: 404 }
//         );
//       }
//     }

//     const { bp, hr, temp, weight, rr, spo2, recordedBy } = body;

//     // Helper: convert empty string, undefined, or null to null for numeric fields
//     const toNumberOrNull = (val: any): number | null => {
//       if (val === undefined || val === null || val === '') return null;
//       const num = Number(val);
//       return isNaN(num) ? null : num;
//     };

//     // Sanitize numeric fields
//     const sanitizedHr = toNumberOrNull(hr);
//     const sanitizedTemp = toNumberOrNull(temp);
//     const sanitizedWeight = toNumberOrNull(weight);
//     const sanitizedRr = toNumberOrNull(rr);
//     const sanitizedSpo2 = toNumberOrNull(spo2);

//     // BP is text, but we still convert empty string to null
//     const sanitizedBp = bp === '' ? null : bp;

//     // Insert vitals record
//     await client.query(
//       `INSERT INTO vitals
//         (appointment_id, bp, hr, temp, weight, rr, spo2, recorded_by, recorded_at)
//        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
//       [
//         appointmentId,
//         sanitizedBp,
//         sanitizedHr,
//         sanitizedTemp,
//         sanitizedWeight,
//         sanitizedRr,
//         sanitizedSpo2,
//         recordedBy || null, // allow recordedBy to be null if not provided
//       ]
//     );

//     return NextResponse.json({
//       success: true,
//       message: 'Vitals saved successfully',
//       appointmentId
//     });
//   } catch (error) {
//     console.error('Error saving vitals:', error);
//     return NextResponse.json(
//       { success: false, message: 'Internal server error' },
//       { status: 500 }
//     );
//   } finally {
//     client.release();
//   }
// }



// // PUT /api/ehr/[patientId]/vitals?vitalId=xxx
// export async function PUT(
//   req: NextRequest,
//   { params }: { params: Promise<{ patientId: string }> }
// ) {
//   const client = await pool.connect();
//   try {
//     const { patientId } = await params;
//     const url = new URL(req.url);
//     const vitalId = url.searchParams.get('vitalId');

//     if (!vitalId) {
//       return NextResponse.json(
//         { success: false, message: 'vitalId query parameter is required' },
//         { status: 400 }
//       );
//     }

//     const body = await req.json();
//     const { bp, hr, temp, weight, rr, spo2, recordedBy } = body;

//     // Verify that this vital belongs to the patient
//     const verify = await client.query(
//       `SELECT v.id FROM vitals v
//        JOIN appointments a ON v.appointment_id = a.id
//        WHERE v.id = $1 AND a.patient_id = $2`,
//       [vitalId, patientId]
//     );

//     if (verify.rows.length === 0) {
//       return NextResponse.json(
//         { success: false, message: 'Vital not found or does not belong to patient' },
//         { status: 404 }
//       );
//     }

//     // Update the vital record
//     const result = await client.query(
//       `UPDATE vitals
//        SET bp = $1, hr = $2, temp = $3, weight = $4, rr = $5, spo2 = $6, recorded_by = $7
//        WHERE id = $8
//        RETURNING 
//          id,
//          bp,
//          hr,
//          temp,
//          weight,
//          rr,
//          spo2,
//          recorded_by as "recordedBy",
//          recorded_at as "recordedAt"`,
//       [bp, hr, temp, weight, rr, spo2, recordedBy, vitalId]
//     );

//     return NextResponse.json({
//       success: true,
//       data: result.rows[0],
//       message: 'Vitals updated successfully'
//     });
//   } catch (error) {
//     console.error('Error updating vitals:', error);
//     return NextResponse.json(
//       { success: false, message: 'Internal server error' },
//       { status: 500 }
//     );
//   } finally {
//     client.release();
//   }
// }


// // DELETE /api/ehr/[patientId]/vitals?vitalId=xxx
// export async function DELETE(
//   req: NextRequest,
//   { params }: { params: Promise<{ patientId: string }> }
// ) {
//   const client = await pool.connect();
//   try {
//     const { patientId } = await params;
//     const url = new URL(req.url);
//     const vitalId = url.searchParams.get('vitalId');

//     if (!vitalId) {
//       return NextResponse.json(
//         { success: false, message: 'vitalId query parameter is required' },
//         { status: 400 }
//       );
//     }

//     // Verify that this vital belongs to the patient
//     const verify = await client.query(
//       `SELECT v.id FROM vitals v
//        JOIN appointments a ON v.appointment_id = a.id
//        WHERE v.id = $1 AND a.patient_id = $2`,
//       [vitalId, patientId]
//     );

//     if (verify.rows.length === 0) {
//       return NextResponse.json(
//         { success: false, message: 'Vital not found or does not belong to patient' },
//         { status: 404 }
//       );
//     }

//     // Delete the vital record
//     await client.query(`DELETE FROM vitals WHERE id = $1`, [vitalId]);

//     return NextResponse.json({
//       success: true,
//       message: 'Vital record deleted successfully'
//     });
//   } catch (error) {
//     console.error('Error deleting vitals:', error);
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

// Helper to get appointment ID from patient ID and date
async function getAppointmentIdByDate(patientId: string, date: string): Promise<string | null> {
  try {
    const result = await query(
      `SELECT id FROM appointments 
       WHERE patient_id = $1 AND appointment_date = $2::date
       ORDER BY appointment_time DESC
       LIMIT 1`,
      [patientId, date]
    );
    return result.rows[0]?.id || null;
  } catch (error) {
    console.error('Error getting appointment ID by date:', error);
    return null;
  }
}

// Helper to get the latest appointment ID for a patient
async function getLatestAppointmentId(patientId: string): Promise<string | null> {
  try {
    const result = await query(
      `SELECT id FROM appointments 
       WHERE patient_id = $1 
       ORDER BY appointment_date DESC, appointment_time DESC 
       LIMIT 1`,
      [patientId]
    );
    return result.rows[0]?.id || null;
  } catch (error) {
    console.error('Error getting latest appointment ID:', error);
    return null;
  }
}

// GET /api/ehr/[patientId]/vitals?appointmentId=xxx&date=yyyy-mm-dd
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await params;
    const url = new URL(req.url);
    const appointmentId = url.searchParams.get('appointmentId');
    const date = url.searchParams.get('date');

    let targetAppointmentId = appointmentId;
    if (!targetAppointmentId) {
      if (date) {
        targetAppointmentId = await getAppointmentIdByDate(patientId, date);
        if (!targetAppointmentId) {
          return NextResponse.json(
            { success: false, message: 'No appointment found on this date' },
            { status: 404 }
          );
        }
      } else {
        return NextResponse.json(
          { success: false, message: 'Either appointmentId or date is required' },
          { status: 400 }
        );
      }
    }

    // Fetch vitals for this appointment
    const vitalsResult = await query(
      `SELECT 
        id,
        bp,
        hr,
        temp,
        weight,
        rr,
        spo2,
        recorded_by as recordedBy,
        recorded_at as recordedAt
       FROM vitals
       WHERE appointment_id = $1
       ORDER BY recorded_at DESC`,
      [targetAppointmentId]
    );

    return NextResponse.json({
      success: true,
      data: vitalsResult.rows
    });
  } catch (error) {
    console.error('Error fetching vitals:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/ehr/[patientId]/vitals
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await params;
    const body = await req.json();

    let appointmentId = body.appointmentId;
    const date = body.date;

    // If no appointmentId or date, fallback to latest appointment
    if (!appointmentId && !date) {
      appointmentId = await getLatestAppointmentId(patientId);
      if (!appointmentId) {
        return NextResponse.json(
          { success: false, message: 'No appointments found for this patient' },
          { status: 404 }
        );
      }
    } else if (!appointmentId && date) {
      appointmentId = await getAppointmentIdByDate(patientId, date);
      if (!appointmentId) {
        return NextResponse.json(
          { success: false, message: 'No appointment found on this date' },
          { status: 404 }
        );
      }
    }

    const { bp, hr, temp, weight, rr, spo2, recordedBy } = body;

    // Helper: convert empty string, undefined, or null to null for numeric fields
    const toNumberOrNull = (val: any): number | null => {
      if (val === undefined || val === null || val === '') return null;
      const num = Number(val);
      return isNaN(num) ? null : num;
    };

    // Sanitize numeric fields
    const sanitizedHr = toNumberOrNull(hr);
    const sanitizedTemp = toNumberOrNull(temp);
    const sanitizedWeight = toNumberOrNull(weight);
    const sanitizedRr = toNumberOrNull(rr);
    const sanitizedSpo2 = toNumberOrNull(spo2);

    // BP is text, but we still convert empty string to null
    const sanitizedBp = bp === '' ? null : bp;

    // Insert vitals record
    await query(
      `INSERT INTO vitals
        (appointment_id, bp, hr, temp, weight, rr, spo2, recorded_by, recorded_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [
        appointmentId,
        sanitizedBp,
        sanitizedHr,
        sanitizedTemp,
        sanitizedWeight,
        sanitizedRr,
        sanitizedSpo2,
        recordedBy || null,
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Vitals saved successfully',
      appointmentId
    });
  } catch (error) {
    console.error('Error saving vitals:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/ehr/[patientId]/vitals?vitalId=xxx
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await params;
    const url = new URL(req.url);
    const vitalId = url.searchParams.get('vitalId');

    if (!vitalId) {
      return NextResponse.json(
        { success: false, message: 'vitalId query parameter is required' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { bp, hr, temp, weight, rr, spo2, recordedBy } = body;

    // Verify that this vital belongs to the patient
    const verify = await query(
      `SELECT v.id FROM vitals v
       JOIN appointments a ON v.appointment_id = a.id
       WHERE v.id = $1 AND a.patient_id = $2`,
      [vitalId, patientId]
    );

    if (verify.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Vital not found or does not belong to patient' },
        { status: 404 }
      );
    }

    // Update the vital record
    const result = await query(
      `UPDATE vitals
       SET bp = $1, hr = $2, temp = $3, weight = $4, rr = $5, spo2 = $6, recorded_by = $7
       WHERE id = $8
       RETURNING 
         id,
         bp,
         hr,
         temp,
         weight,
         rr,
         spo2,
         recorded_by as recordedBy,
         recorded_at as recordedAt`,
      [bp, hr, temp, weight, rr, spo2, recordedBy, vitalId]
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Vitals updated successfully'
    });
  } catch (error) {
    console.error('Error updating vitals:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/ehr/[patientId]/vitals?vitalId=xxx
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await params;
    const url = new URL(req.url);
    const vitalId = url.searchParams.get('vitalId');

    if (!vitalId) {
      return NextResponse.json(
        { success: false, message: 'vitalId query parameter is required' },
        { status: 400 }
      );
    }

    // Verify that this vital belongs to the patient
    const verify = await query(
      `SELECT v.id FROM vitals v
       JOIN appointments a ON v.appointment_id = a.id
       WHERE v.id = $1 AND a.patient_id = $2`,
      [vitalId, patientId]
    );

    if (verify.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Vital not found or does not belong to patient' },
        { status: 404 }
      );
    }

    // Delete the vital record
    await query('DELETE FROM vitals WHERE id = $1', [vitalId]);

    return NextResponse.json({
      success: true,
      message: 'Vital record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting vitals:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}