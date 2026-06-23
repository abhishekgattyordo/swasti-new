


// import { NextRequest, NextResponse } from 'next/server';
// import { query } from '@/lib/db';
// import { authErrorResponse,requireRole } from '@/lib/auth/guards';

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
//        requireRole(req, ['doctor','patient']);

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

//     // ✅ Updated to use doctor_prescriptions table
//     const result = await query(
//       `SELECT 
//         id,
//         medication_name as name,
//         category,
//         dosage,
//         frequency,
//         duration,
//         instructions,
//         recorded_by as "recordedBy",
//         created_at as "createdAt"
//        FROM doctor_prescriptions
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
//         const authResponse=authErrorResponse(error);

// if(authResponse){
//   return authResponse
// }
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
//        requireRole(req, ['doctor']);

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
//       // ✅ Updated to use doctor_prescriptions table
//       await query(
//         `INSERT INTO doctor_prescriptions
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
//         const authResponse=authErrorResponse(error);

// if(authResponse){
//   return authResponse
// }
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
//     requireRole(req, ['doctor']);
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
//     // ✅ Updated to use doctor_prescriptions table
//     const verify = await query(
//       `SELECT dp.id FROM doctor_prescriptions dp
//        JOIN appointments a ON dp.appointment_id = a.id
//        WHERE dp.id = $1 AND a.patient_id = $2`,
//       [prescriptionId, patientId]
//     );

//     if (verify.rows.length === 0) {
//       return NextResponse.json(
//         { success: false, message: 'Prescription not found or does not belong to patient' },
//         { status: 404 }
//       );
//     }

//     // Update the prescription
//     // ✅ Updated to use doctor_prescriptions table
//     const result = await query(
//       `UPDATE doctor_prescriptions
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
//          recorded_by as "recordedBy",
//          created_at as "createdAt"`,
//       [name, category || '', dosage, frequency || '', duration || '', instructions || '', recordedBy || 'Doctor', prescriptionId]
//     );

//     return NextResponse.json({
//       success: true,
//       data: result.rows[0],
//       message: 'Prescription updated successfully'
//     });
//   } catch (error) {
//     console.error('Error updating prescription:', error);
//         const authResponse=authErrorResponse(error);

// if(authResponse){
//   return authResponse
// }
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
//     requireRole(req, ['doctor']);
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
//     // ✅ Updated to use doctor_prescriptions table
//     const verify = await query(
//       `SELECT dp.id FROM doctor_prescriptions dp
//        JOIN appointments a ON dp.appointment_id = a.id
//        WHERE dp.id = $1 AND a.patient_id = $2`,
//       [prescriptionId, patientId]
//     );

//     if (verify.rows.length === 0) {
//       return NextResponse.json(
//         { success: false, message: 'Prescription not found or does not belong to patient' },
//         { status: 404 }
//       );
//     }

//     // Delete the prescription
//     // ✅ Updated to use doctor_prescriptions table
//     await query('DELETE FROM doctor_prescriptions WHERE id = $1', [prescriptionId]);

//     return NextResponse.json({
//       success: true,
//       message: 'Prescription deleted successfully'
//     });
//   } catch (error) {
//     console.error('Error deleting prescription:', error);
//      const authResponse=authErrorResponse(error);
// if(authResponse){
//   return authResponse
// }
//     return NextResponse.json(
//       { success: false, message: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }



// app/api/ehr/[patientId]/prescriptions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authErrorResponse, requireRole } from '@/lib/auth/guards';

// ============================================
// Helper: Get patient and doctor details
// ============================================
async function getPatientAndDoctorDetails(appointmentId: string) {
  try {
    const result = await query(
      `SELECT 
        p.patient_id,
        p.full_name_en as patient_name,
        p.phone as patient_phone,
        p.email as patient_email,
        d.id as doctor_id,
        d.first_name || ' ' || d.last_name as doctor_name,
        d.specialty as doctor_specialty
       FROM appointments a
       JOIN patients p ON a.patient_id = p.patient_id
       JOIN doctors d ON a.doctor_id = d.id
       WHERE a.id = $1`,
      [appointmentId]
    );
    
    console.log('📱 Query Result:', result.rows[0]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting patient/doctor details:', error);
    return null;
  }
}

// ============================================
// Helper: Send WhatsApp to Patient (Using hello_world Template)
// ============================================
async function sendWhatsAppToPatient(patientData: any, appointmentId: string) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const fromId = process.env.FROM_PHONE_NUMBER_ID;
  
  console.log('📱 sendWhatsAppToPatient - Token:', token ? '✅ Set' : '❌ Missing');
  console.log('📱 sendWhatsAppToPatient - From ID:', fromId ? '✅ Set' : '❌ Missing');
  
  if (!token || !fromId) {
    return { sent: false, error: 'WhatsApp not configured' };
  }

  const patientPhone = patientData.patient_phone?.replace('+', '').trim();
  console.log('📱 sendWhatsAppToPatient - Phone:', patientPhone);
  
  if (!patientPhone) {
    return { sent: false, error: 'Patient phone not available' };
  }

  // ✅ SEND hello_world TEMPLATE
  const payload = {
    messaging_product: 'whatsapp',
    to: patientPhone,
    type: 'template',
    template: {
      name: 'hello_world',
      language: {
        code: 'en_US',
      },
    },
  };

  console.log('📤 Sending hello_world template to patient:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(
      `https://graph.facebook.com/v25.0/${fromId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    const responseData = await response.json();
    console.log('📱 Patient WhatsApp Response:', JSON.stringify(responseData, null, 2));
    
    if (!response.ok) {
      throw new Error(responseData.error?.message || 'WhatsApp API failed');
    }
    
    return { sent: true, messageId: responseData.messages?.[0]?.id };
  } catch (error: any) {
    console.error('WhatsApp to patient failed:', error.message);
    return { sent: false, error: error.message };
  }
}

// ============================================
// Helper: Send WhatsApp to Pharmacy (Using hello_world Template)
// ============================================
async function sendWhatsAppToPharmacy(patientData: any, appointmentId: string) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const fromId = process.env.FROM_PHONE_NUMBER_ID;
  const pharmacyPhone = process.env.PHARMACY_WHATSAPP?.replace('+', '').trim();
  
  console.log('📱 sendWhatsAppToPharmacy - Token:', token ? '✅ Set' : '❌ Missing');
  console.log('📱 sendWhatsAppToPharmacy - Pharmacy Phone:', pharmacyPhone);
  
  if (!token || !fromId || !pharmacyPhone) {
    return { sent: false, error: 'Pharmacy WhatsApp not configured' };
  }

  // ✅ SEND hello_world TEMPLATE
  const payload = {
    messaging_product: 'whatsapp',
    to: pharmacyPhone,
    type: 'template',
    template: {
      name: 'hello_world',
      language: {
        code: 'en_US',
      },
    },
  };

  console.log('📤 Sending hello_world template to pharmacy:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(
      `https://graph.facebook.com/v25.0/${fromId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    const responseData = await response.json();
    console.log('📱 Pharmacy WhatsApp Response:', JSON.stringify(responseData, null, 2));
    
    if (!response.ok) {
      throw new Error(responseData.error?.message || 'WhatsApp API failed');
    }
    
    return { sent: true, messageId: responseData.messages?.[0]?.id };
  } catch (error: any) {
    console.error('WhatsApp to pharmacy failed:', error.message);
    return { sent: false, error: error.message };
  }
}

// ============================================
// GET /api/ehr/[patientId]/prescriptions
// ============================================
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    requireRole(req, ['doctor', 'patient']);

    const { patientId } = await params;
    const url = new URL(req.url);
    const appointmentId = url.searchParams.get('appointmentId');
    const date = url.searchParams.get('date');

    let targetAppointmentId = appointmentId;
    if (!targetAppointmentId) {
      if (date) {
        const result = await query(
          `SELECT id FROM appointments 
           WHERE patient_id = $1 AND appointment_date = $2::date
           ORDER BY appointment_time DESC
           LIMIT 1`,
          [patientId, date]
        );
        targetAppointmentId = result.rows[0]?.id || null;
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
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================
// POST /api/ehr/[patientId]/prescriptions - Sends ONLY hello_world
// ============================================
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    requireRole(req, ['doctor']);

    const { patientId } = await params;
    const body = await req.json();

    console.log('📝 Received body:', JSON.stringify(body, null, 2));

    const appointmentId = body.appointmentId;
    const date = body.date;
    const { sendWhatsApp = true } = body;

    // Get appointment ID if not provided
    let targetAppointmentId = appointmentId;
    if (!targetAppointmentId && date) {
      const result = await query(
        `SELECT id FROM appointments 
         WHERE patient_id = $1 AND appointment_date = $2::date
         ORDER BY appointment_time DESC
         LIMIT 1`,
        [patientId, date]
      );
      targetAppointmentId = result.rows[0]?.id || null;
    }

    if (!targetAppointmentId) {
      return NextResponse.json(
        { success: false, message: 'Appointment ID or date is required' },
        { status: 400 }
      );
    }

    // ✅ Send WhatsApp notifications only (SKIP DATABASE)
   let whatsappStatus: { patient: { sent: boolean; messageId?: string; error?: string } | null; pharmacy: { sent: boolean; messageId?: string; error?: string } | null } = {
  patient: null,
  pharmacy: null
};
    
    if (sendWhatsApp === true) {
      console.log('📱 WhatsApp is ENABLED, attempting to send hello_world...');
      
      try {
        // Get patient and doctor details
        const patientData = await getPatientAndDoctorDetails(targetAppointmentId);
        console.log('📱 Patient Data:', JSON.stringify(patientData, null, 2));
        
        if (patientData) {
          if (patientData.patient_phone) {
            // Send to patient
            const patientResult = await sendWhatsAppToPatient(patientData, targetAppointmentId);
            console.log('📱 Patient Result:', patientResult);
            
            // Send to pharmacy
            const pharmacyResult = await sendWhatsAppToPharmacy(patientData, targetAppointmentId);
            console.log('📱 Pharmacy Result:', pharmacyResult);
            
            whatsappStatus = {
              patient: patientResult,
              pharmacy: pharmacyResult
            };
          } else {
            console.error('❌ Patient phone is missing!');
            whatsappStatus = {
              patient: { sent: false, error: 'Patient phone not found' },
              pharmacy: { sent: false, error: 'Patient phone not found' }
            };
          }
        } else {
          console.error('❌ No patient data found for appointment:', targetAppointmentId);
          whatsappStatus = {
            patient: { sent: false, error: 'Patient data not found' },
            pharmacy: { sent: false, error: 'Patient data not found' }
          };
        }
      } catch (whatsappError: any) {
        console.error('❌ WhatsApp notification error:', whatsappError.message);
        whatsappStatus = {
          patient: { sent: false, error: whatsappError.message },
          pharmacy: { sent: false, error: whatsappError.message }
        };
      }
    } else {
      console.log('📱 WhatsApp is DISABLED by user');
    }

    return NextResponse.json({
      success: true,
      message: 'WhatsApp hello_world templates sent successfully (database skipped)',
      appointmentId: targetAppointmentId,
      whatsapp: whatsappStatus
    });
  } catch (error) {
    console.error('Error:', error);
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================
// PUT /api/ehr/[patientId]/prescriptions
// ============================================
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    requireRole(req, ['doctor']);
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
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE /api/ehr/[patientId]/prescriptions
// ============================================
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    requireRole(req, ['doctor']);
    const { patientId } = await params;
    const url = new URL(req.url);
    const prescriptionId = url.searchParams.get('prescriptionId');

    if (!prescriptionId) {
      return NextResponse.json(
        { success: false, message: 'prescriptionId query parameter is required' },
        { status: 400 }
      );
    }

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

    await query('DELETE FROM doctor_prescriptions WHERE id = $1', [prescriptionId]);

    return NextResponse.json({
      success: true,
      message: 'Prescription deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting prescription:', error);
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}