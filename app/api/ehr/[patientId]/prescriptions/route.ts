


// import { NextRequest, NextResponse } from 'next/server';
// import { query } from '@/lib/db';

// // Helper to get appointment ID from patient ID and date
// async function getAppointmentIdByDate(patientId: string, date: string): Promise<string | null> {
//   try {
//     const result = await query(
//       `SELECT id FROM appointments 
//        WHERE patient_id = $1 AND appointment_date = $2::date
//        ORDER BY appointment_time DESC
//        LIMIT 1`,
//       [patientId, date]
//     );
//     return result.rows[0]?.id || null;
//   } catch (error) {
//     console.error('Error getting appointment ID by date:', error);
//     return null;
//   }
// }

// // Helper to get the latest appointment ID for a patient
// async function getLatestAppointmentId(patientId: string): Promise<string | null> {
//   try {
//     const result = await query(
//       `SELECT id FROM appointments 
//        WHERE patient_id = $1 
//        ORDER BY appointment_date DESC, appointment_time DESC 
//        LIMIT 1`,
//       [patientId]
//     );
//     return result.rows[0]?.id || null;
//   } catch (error) {
//     console.error('Error getting latest appointment ID:', error);
//     return null;
//   }
// }

// // GET /api/ehr/[patientId]/prescriptions?appointmentId=xxx&date=yyyy-mm-dd
// export async function GET(
//   req: NextRequest,
//   { params }: { params: Promise<{ patientId: string }> }
// ) {
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

//     // Fetch prescriptions for this appointment
//     const result = await query(
//       `SELECT 
//         id,
//         medication_name as name,
//         category,
//         dosage,
//         frequency,
//         duration,
//         instructions,
//         recorded_by as recordedBy,
//         created_at as createdAt
//        FROM prescriptions
//        WHERE appointment_id = $1
//        ORDER BY created_at DESC`,
//       [targetAppointmentId]
//     );

//     return NextResponse.json({
//       success: true,
//       data: result.rows
//     });
//   } catch (error) {
//     console.error('Error fetching prescriptions:', error);
//     return NextResponse.json(
//       { success: false, message: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

// // POST /api/ehr/[patientId]/prescriptions
// export async function POST(
//   req: NextRequest,
//   { params }: { params: Promise<{ patientId: string }> }
// ) {
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

//     const { medications, recordedBy } = body;
//     if (!Array.isArray(medications) || medications.length === 0) {
//       return NextResponse.json(
//         { success: false, message: 'Medications array is required' },
//         { status: 400 }
//       );
//     }

//     for (const med of medications) {
//       const { name, category, dosage, frequency, duration, instructions } = med;
//       if (!name || !dosage) {
//         return NextResponse.json(
//           { success: false, message: 'Each medication must have name and dosage' },
//           { status: 400 }
//         );
//       }
//       await query(
//         `INSERT INTO prescriptions
//           (appointment_id, medication_name, category, dosage, frequency, duration, instructions, recorded_by)
//          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
//         [appointmentId, name, category || '', dosage, frequency || '', duration || '', instructions || '', recordedBy || 'Doctor']
//       );
//     }

//     return NextResponse.json({
//       success: true,
//       message: 'Prescriptions saved successfully',
//       appointmentId
//     });
//   } catch (error) {
//     console.error('Error saving prescriptions:', error);
//     return NextResponse.json(
//       { success: false, message: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

// // PUT /api/ehr/[patientId]/prescriptions?prescriptionId=xxx
// export async function PUT(
//   req: NextRequest,
//   { params }: { params: Promise<{ patientId: string }> }
// ) {
//   try {
//     const { patientId } = await params;
//     const url = new URL(req.url);
//     const prescriptionId = url.searchParams.get('prescriptionId');

//     if (!prescriptionId) {
//       return NextResponse.json(
//         { success: false, message: 'prescriptionId query parameter is required' },
//         { status: 400 }
//       );
//     }

//     const body = await req.json();
//     const { name, category, dosage, frequency, duration, instructions, recordedBy } = body;

//     // Verify that this prescription belongs to the patient
//     const verify = await query(
//       `SELECT p.id FROM prescriptions p
//        JOIN appointments a ON p.appointment_id = a.id
//        WHERE p.id = $1 AND a.patient_id = $2`,
//       [prescriptionId, patientId]
//     );

//     if (verify.rows.length === 0) {
//       return NextResponse.json(
//         { success: false, message: 'Prescription not found or does not belong to patient' },
//         { status: 404 }
//       );
//     }

//     // Update the prescription
//     const result = await query(
//       `UPDATE prescriptions
//        SET medication_name = $1, category = $2, dosage = $3, frequency = $4, duration = $5, instructions = $6, recorded_by = $7
//        WHERE id = $8
//        RETURNING 
//          id,
//          medication_name as name,
//          category,
//          dosage,
//          frequency,
//          duration,
//          instructions,
//          recorded_by as recordedBy,
//          created_at as createdAt`,
//       [name, category || '', dosage, frequency || '', duration || '', instructions || '', recordedBy || 'Doctor', prescriptionId]
//     );

//     return NextResponse.json({
//       success: true,
//       data: result.rows[0],
//       message: 'Prescription updated successfully'
//     });
//   } catch (error) {
//     console.error('Error updating prescription:', error);
//     return NextResponse.json(
//       { success: false, message: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

// // DELETE /api/ehr/[patientId]/prescriptions?prescriptionId=xxx
// export async function DELETE(
//   req: NextRequest,
//   { params }: { params: Promise<{ patientId: string }> }
// ) {
//   try {
//     const { patientId } = await params;
//     const url = new URL(req.url);
//     const prescriptionId = url.searchParams.get('prescriptionId');

//     if (!prescriptionId) {
//       return NextResponse.json(
//         { success: false, message: 'prescriptionId query parameter is required' },
//         { status: 400 }
//       );
//     }

//     // Verify the prescription belongs to the patient
//     const verify = await query(
//       `SELECT p.id FROM prescriptions p
//        JOIN appointments a ON p.appointment_id = a.id
//        WHERE p.id = $1 AND a.patient_id = $2`,
//       [prescriptionId, patientId]
//     );

//     if (verify.rows.length === 0) {
//       return NextResponse.json(
//         { success: false, message: 'Prescription not found or does not belong to patient' },
//         { status: 404 }
//       );
//     }

//     // Delete the prescription
//     await query('DELETE FROM prescriptions WHERE id = $1', [prescriptionId]);

//     return NextResponse.json({
//       success: true,
//       message: 'Prescription deleted successfully'
//     });
//   } catch (error) {
//     console.error('Error deleting prescription:', error);
//     return NextResponse.json(
//       { success: false, message: 'Internal server error' },
//       { status: 500 }
//     );
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

// GET /api/ehr/[patientId]/prescriptions?appointmentId=xxx&date=yyyy-mm-dd
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

    // ✅ Updated to use doctor_prescriptions table
    const result = await query(
      `SELECT 
        id,
        medication_name as name,
        category,
        dosage,
        frequency,
        duration,
        instructions,
        recorded_by as "recordedBy",
        created_at as "createdAt"
       FROM doctor_prescriptions
       WHERE appointment_id = $1
       ORDER BY created_at DESC`,
      [targetAppointmentId]
    );

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/ehr/[patientId]/prescriptions
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

    const { medications, recordedBy } = body;
    if (!Array.isArray(medications) || medications.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Medications array is required' },
        { status: 400 }
      );
    }

    for (const med of medications) {
      const { name, category, dosage, frequency, duration, instructions } = med;
      if (!name || !dosage) {
        return NextResponse.json(
          { success: false, message: 'Each medication must have name and dosage' },
          { status: 400 }
        );
      }
      // ✅ Updated to use doctor_prescriptions table
      await query(
        `INSERT INTO doctor_prescriptions
          (appointment_id, medication_name, category, dosage, frequency, duration, instructions, recorded_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [appointmentId, name, category || '', dosage, frequency || '', duration || '', instructions || '', recordedBy || 'Doctor']
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Prescriptions saved successfully',
      appointmentId
    });
  } catch (error) {
    console.error('Error saving prescriptions:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/ehr/[patientId]/prescriptions?prescriptionId=xxx
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await params;
    const url = new URL(req.url);
    const prescriptionId = url.searchParams.get('prescriptionId');

    if (!prescriptionId) {
      return NextResponse.json(
        { success: false, message: 'prescriptionId query parameter is required' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { name, category, dosage, frequency, duration, instructions, recordedBy } = body;

    // Verify that this prescription belongs to the patient
    // ✅ Updated to use doctor_prescriptions table
    const verify = await query(
      `SELECT dp.id FROM doctor_prescriptions dp
       JOIN appointments a ON dp.appointment_id = a.id
       WHERE dp.id = $1 AND a.patient_id = $2`,
      [prescriptionId, patientId]
    );

    if (verify.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Prescription not found or does not belong to patient' },
        { status: 404 }
      );
    }

    // Update the prescription
    // ✅ Updated to use doctor_prescriptions table
    const result = await query(
      `UPDATE doctor_prescriptions
       SET medication_name = $1, category = $2, dosage = $3, frequency = $4, duration = $5, instructions = $6, recorded_by = $7
       WHERE id = $8
       RETURNING 
         id,
         medication_name as name,
         category,
         dosage,
         frequency,
         duration,
         instructions,
         recorded_by as "recordedBy",
         created_at as "createdAt"`,
      [name, category || '', dosage, frequency || '', duration || '', instructions || '', recordedBy || 'Doctor', prescriptionId]
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Prescription updated successfully'
    });
  } catch (error) {
    console.error('Error updating prescription:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/ehr/[patientId]/prescriptions?prescriptionId=xxx
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await params;
    const url = new URL(req.url);
    const prescriptionId = url.searchParams.get('prescriptionId');

    if (!prescriptionId) {
      return NextResponse.json(
        { success: false, message: 'prescriptionId query parameter is required' },
        { status: 400 }
      );
    }

    // Verify the prescription belongs to the patient
    // ✅ Updated to use doctor_prescriptions table
    const verify = await query(
      `SELECT dp.id FROM doctor_prescriptions dp
       JOIN appointments a ON dp.appointment_id = a.id
       WHERE dp.id = $1 AND a.patient_id = $2`,
      [prescriptionId, patientId]
    );

    if (verify.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Prescription not found or does not belong to patient' },
        { status: 404 }
      );
    }

    // Delete the prescription
    // ✅ Updated to use doctor_prescriptions table
    await query('DELETE FROM doctor_prescriptions WHERE id = $1', [prescriptionId]);

    return NextResponse.json({
      success: true,
      message: 'Prescription deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting prescription:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}