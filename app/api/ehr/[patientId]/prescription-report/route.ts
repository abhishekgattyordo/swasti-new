// import { NextRequest, NextResponse } from 'next/server';
// import { query } from '@/lib/db';
// import { authErrorResponse, requireRole } from '@/lib/auth/guards';
// import { requireTenant } from '@/lib/tenant'; // ✅ import tenant helper

// async function getAppointmentIdByDate(patientId: string, date: string): Promise<string | null> {
//   const result = await query(
//     `SELECT id FROM appointments 
//      WHERE patient_id = $1 AND appointment_date = $2::date
//      ORDER BY appointment_time DESC
//      LIMIT 1`,
//     [patientId, date]
//   );
//   return result.rows[0]?.id || null;
// }

// async function getLatestAppointmentId(patientId: string): Promise<string | null> {
//   const result = await query(
//     `SELECT id FROM appointments 
//      WHERE patient_id = $1 
//      ORDER BY appointment_date DESC, appointment_time DESC 
//      LIMIT 1`,
//     [patientId]
//   );
//   return result.rows[0]?.id || null;
// }

// export async function GET(
//   req: NextRequest,
//   { params }: { params: Promise<{ patientId: string }> }
// ) {
//   try {
//     requireRole(req, ['doctor', 'patient']);
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
//         targetAppointmentId = await getLatestAppointmentId(patientId);
//         if (!targetAppointmentId) {
//           return NextResponse.json(
//             { success: false, message: 'No appointments found for this patient' },
//             { status: 404 }
//           );
//         }
//       }
//     }

//     // Fetch tenant configuration to get hospital name
//     const tenant = await requireTenant();
//     const hospitalName = tenant?.name || "St. Mary Advanced Medical Center";
//     const hospitalTagline = process.env.HOSPITAL_TAGLINE || "Primary & Specialist Care Center • HIPAA Encrypted Clinical Storage";
//     const hospitalPhone = process.env.HOSPITAL_PHONE || "+1 (555) 300-4720";

//     // Query appointment and related data
//     const data = await query(
//       `SELECT 
//         a.id as appointment_id,
//         a.consultation_fee,
//         a.appointment_date,
//         a.appointment_time,
//         p.patient_id,
//         p.full_name_en as patient_name,
//         p.dob as patient_dob,
//         p.gender as patient_gender,
//         p.phone as patient_phone,
//         d.id as doctor_id,
//         CONCAT(d.first_name, ' ', d.last_name) as doctor_name,
//         d.specialty as doctor_specialty,
//         d.license_number as doctor_license,
//         vd.diagnosis,
//         vd.clinical_notes,
//         vd.follow_up_date,
//         vd.patient_instructions,
//         COALESCE(json_agg(DISTINCT dp.*) FILTER (WHERE dp.id IS NOT NULL), '[]') as prescriptions,
//         COALESCE(json_agg(DISTINCT vit.*) FILTER (WHERE vit.id IS NOT NULL), '[]') as vitals
//        FROM appointments a
//        JOIN patients p ON a.patient_id = p.patient_id
//        JOIN doctors d ON a.doctor_id = d.id
//        LEFT JOIN visit_details vd ON vd.appointment_id = a.id
//        LEFT JOIN doctor_prescriptions dp ON dp.appointment_id = a.id
//        LEFT JOIN vitals vit ON vit.appointment_id = a.id
//        WHERE a.id = $1
//        GROUP BY a.id, p.patient_id, d.id, vd.id`,
//       [targetAppointmentId]
//     );

//     if (data.rows.length === 0) {
//       return NextResponse.json(
//         { success: false, message: 'Appointment not found' },
//         { status: 404 }
//       );
//     }

//     const row = data.rows[0];
//     const prescriptions = row.prescriptions || [];
//     const vitals = row.vitals || [];

//     // Calculate age from dob
//     let age = null;
//     if (row.patient_dob) {
//       const today = new Date();
//       const birthDate = new Date(row.patient_dob);
//       let calculatedAge = today.getFullYear() - birthDate.getFullYear();
//       const monthDiff = today.getMonth() - birthDate.getMonth();
//       if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
//         calculatedAge--;
//       }
//       age = calculatedAge;
//     }

//     const report = {
//       success: true,
//       data: {
//         hospital: {
//           name: hospitalName,
//           tagline: hospitalTagline,
//           phone: hospitalPhone,
//         },
//         document: {
//           ref: `REP-${row.appointment_id?.slice(-4) || '0000'}`,
//           type: "PRESCRIPTION",
//           sealedDateTime: new Date().toISOString(),
//         },
//         patient: {
//           name: row.patient_name || null,
//           id: row.patient_id || null,
//           age: age,
//           gender: row.patient_gender || null,
//           phone: row.patient_phone || null,
//         },
//         doctor: {
//           name: row.doctor_name || null,
//           specialty: row.doctor_specialty || null,
//           licenseNo: row.doctor_license || null,
//         },
//         clinicalFindings: {
//           diagnosis: row.diagnosis || null,
//           notes: row.clinical_notes || null,
//         },
//         medications: prescriptions.map((med: any) => ({
//           name: med.medication_name || null,
//           dosage: med.dosage || null,
//           quantity: med.duration || null,
//           frequency: med.frequency || null,
//           instructions: med.instructions || null,
//         })),
//         vitals: vitals.map((v: any) => ({
//           bp: v.bp || null,
//           hr: v.hr || null,
//           temp: v.temp || null,
//           weight: v.weight || null,
//           spo2: v.spo2 || null,
//           recordedAt: v.recorded_at || null,
//         })),
//         signature: {
//           sealed: true,
//           hash: `sha256-${row.appointment_id}-${Date.now()}`,
//         },
//         followUp: row.follow_up_date || null,
//         patientInstructions: row.patient_instructions || null,
//       },
//     };

//     return NextResponse.json(report);
//   } catch (error) {
//     console.error('Error generating prescription report:', error);
//     const authResponse = authErrorResponse(error);
//     if (authResponse) return authResponse;
//     return NextResponse.json(
//       { success: false, message: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }




import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authErrorResponse, requireRole } from '@/lib/auth/guards';
import { requireTenant } from '@/lib/tenant';

async function getAppointmentIdByDate(patientId: string, date: string): Promise<string | null> {
  const result = await query(
    `SELECT id FROM appointments 
     WHERE patient_id = $1 AND appointment_date = $2::date
     ORDER BY appointment_time DESC
     LIMIT 1`,
    [patientId, date]
  );
  return result.rows[0]?.id || null;
}

async function getLatestAppointmentId(patientId: string): Promise<string | null> {
  const result = await query(
    `SELECT id FROM appointments 
     WHERE patient_id = $1 
     ORDER BY appointment_date DESC, appointment_time DESC 
     LIMIT 1`,
    [patientId]
  );
  return result.rows[0]?.id || null;
}

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
        targetAppointmentId = await getAppointmentIdByDate(patientId, date);
        if (!targetAppointmentId) {
          return NextResponse.json(
            { success: false, message: 'No appointment found on this date' },
            { status: 404 }
          );
        }
      } else {
        targetAppointmentId = await getLatestAppointmentId(patientId);
        if (!targetAppointmentId) {
          return NextResponse.json(
            { success: false, message: 'No appointments found for this patient' },
            { status: 404 }
          );
        }
      }
    }

    // ✅ Fetch tenant config – the object contains a `tenant` property with the hospital details
    const tenantConfig = await requireTenant();
    // Extract hospital name from tenant.tenant.name (matches the /api/tenant/config response)
    const hospitalName = tenantConfig?.tenant?.name;
    const hospitalTagline = process.env.HOSPITAL_TAGLINE || "Primary & Specialist Care Center • HIPAA Encrypted Clinical Storage";
    const hospitalPhone = process.env.HOSPITAL_PHONE || "+1 (555) 300-4720";

    // Query appointment and related data
    const data = await query(
      `SELECT 
        a.id as appointment_id,
        a.consultation_fee,
        a.appointment_date,
        a.appointment_time,
        p.patient_id,
        p.full_name_en as patient_name,
        p.dob as patient_dob,
        p.gender as patient_gender,
        p.phone as patient_phone,
        d.id as doctor_id,
        CONCAT(d.first_name, ' ', d.last_name) as doctor_name,
        d.specialty as doctor_specialty,
        d.license_number as doctor_license,
        vd.diagnosis,
        vd.clinical_notes,
        vd.follow_up_date,
        vd.patient_instructions,
        COALESCE(json_agg(DISTINCT dp.*) FILTER (WHERE dp.id IS NOT NULL), '[]') as prescriptions,
        COALESCE(json_agg(DISTINCT vit.*) FILTER (WHERE vit.id IS NOT NULL), '[]') as vitals
       FROM appointments a
       JOIN patients p ON a.patient_id = p.patient_id
       JOIN doctors d ON a.doctor_id = d.id
       LEFT JOIN visit_details vd ON vd.appointment_id = a.id
       LEFT JOIN doctor_prescriptions dp ON dp.appointment_id = a.id
       LEFT JOIN vitals vit ON vit.appointment_id = a.id
       WHERE a.id = $1
       GROUP BY a.id, p.patient_id, d.id, vd.id`,
      [targetAppointmentId]
    );

    if (data.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Appointment not found' },
        { status: 404 }
      );
    }

    const row = data.rows[0];
    const prescriptions = row.prescriptions || [];
    const vitals = row.vitals || [];

    // Calculate age from dob
    let age = null;
    if (row.patient_dob) {
      const today = new Date();
      const birthDate = new Date(row.patient_dob);
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      age = calculatedAge;
    }

    const report = {
      success: true,
      data: {
        hospital: {
          name: hospitalName,
          tagline: hospitalTagline,
          phone: hospitalPhone,
        },
        document: {
          ref: `REP-${row.appointment_id?.slice(-4) || '0000'}`,
          type: "PRESCRIPTION",
          sealedDateTime: new Date().toISOString(),
        },
        patient: {
          name: row.patient_name || null,
          id: row.patient_id || null,
          age: age,
          gender: row.patient_gender || null,
          phone: row.patient_phone || null,
        },
        doctor: {
          name: row.doctor_name || null,
          specialty: row.doctor_specialty || null,
          licenseNo: row.doctor_license || null,
        },
        clinicalFindings: {
          diagnosis: row.diagnosis || null,
          notes: row.clinical_notes || null,
        },
        medications: prescriptions.map((med: any) => ({
          name: med.medication_name || null,
          dosage: med.dosage || null,
          quantity: med.duration || null,
          frequency: med.frequency || null,
          instructions: med.instructions || null,
        })),
        vitals: vitals.map((v: any) => ({
          bp: v.bp || null,
          hr: v.hr || null,
          temp: v.temp || null,
          weight: v.weight || null,
          spo2: v.spo2 || null,
          recordedAt: v.recorded_at || null,
        })),
        signature: {
          sealed: true,
          hash: `sha256-${row.appointment_id}-${Date.now()}`,
        },
        followUp: row.follow_up_date || null,
        patientInstructions: row.patient_instructions || null,
      },
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error generating prescription report:', error);
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}