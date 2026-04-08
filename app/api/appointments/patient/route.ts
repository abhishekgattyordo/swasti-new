

// import { NextResponse } from "next/server";
// import { query } from "@/lib/db";


// export async function POST(req: Request) {
//   try {
//     // ✅ Safe body parse
//     let body;
//     try {
//       body = await req.json();
//     } catch (err) {
//       return NextResponse.json(
//         { success: false, message: "Invalid JSON body" },
//         { status: 400 }
//       );
//     }

//     const {
//       doctor_id,
//       patient_id,
//       appointment_date,
//       appointment_time,
//       consultation_type,
//       notes,
//     } = body;

//     console.log("📝 Creating appointment:", { doctor_id, patient_id, appointment_date, appointment_time, consultation_type });

//     // ✅ Basic validation
//     if (!doctor_id || !appointment_date || !appointment_time) {
//       return NextResponse.json(
//         { success: false, message: "Missing required fields" },
//         { status: 400 }
//       );
//     }

//     // 🔒 Prevent double booking
//     const existing = await query(
//       `SELECT id FROM appointments
//        WHERE doctor_id = $1
//        AND appointment_date = $2
//        AND appointment_time = $3
//        AND status != 'CANCELLED'`,
//       [doctor_id, appointment_date, appointment_time]
//     );

//     if (existing.rows.length > 0) {
//       return NextResponse.json(
//         { success: false, message: "Slot already booked" },
//         { status: 400 }
//       );
//     }

//     // ✅ Insert appointment
//     const result = await query(
//       `INSERT INTO appointments 
//        (doctor_id, patient_id, appointment_date, appointment_time, consultation_type, notes, status)
//        VALUES ($1, $2, $3, $4, $5, $6, 'BOOKED')
//        RETURNING *`,
//       [
//         doctor_id,
//         patient_id,
//         appointment_date,
//         appointment_time,
//         consultation_type || 'in-person',
//         notes || '',
//       ]
//     );

//     console.log("✅ Appointment created successfully:", result.rows[0].id);

//     return NextResponse.json({
//       success: true,
//       data: result.rows[0],
//       message: "Appointment booked successfully"
//     });
//   } catch (error) {
//     console.error("❌ Create appointment error:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to create appointment",
//       },
//       { status: 500 }
//     );
//   }
// }

// /* =====================================================
//    📌 GET ALL APPOINTMENTS (GET)
// ===================================================== */

// export async function GET() {
//   try {
//     const result = await query(`
//       SELECT 
//         a.id AS appointment_id,
//         a.appointment_date,
//         a.appointment_time,
//         a.consultation_type,
//         a.status,
//         a.notes,
//         a.patient_id,
//         p.full_name_en AS patient_name,
//         p.dob AS patient_dob,
//         p.gender AS patient_gender,
//         p.phone AS patient_phone,
//         p.email AS patient_email,
//         p.blood_group,
//         CONCAT('Dr. ', d.first_name, ' ', d.last_name) as doctor_name,
//         d.specialty as doctor_specialty
//       FROM appointments a
//       LEFT JOIN patients p ON a.patient_id = p.patient_id
//       JOIN doctors d ON a.doctor_id = d.id
//       ORDER BY a.created_at DESC
//     `);

//     return NextResponse.json({
//       success: true,
//       data: result.rows,
//     });
//   } catch (error) {
//     console.error("❌ Fetch appointments error:", error);
//     return NextResponse.json(
//       { success: false, message: "Failed to fetch appointments" },
//       { status: 500 }
//     );
//   }
// }




import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    let body;
    try {
      body = await req.json();
    } catch (err) {
      return NextResponse.json(
        { success: false, message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const {
      doctor_id,
      patient_id,
      appointment_date,
      appointment_time,
      consultation_type,
      notes,
    } = body;

    console.log("📝 Creating appointment:", { doctor_id, patient_id, appointment_date, appointment_time, consultation_type });

    if (!doctor_id || !appointment_date || !appointment_time) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // 🔒 Prevent double booking
    const existing = await query(
      `SELECT id FROM appointments
       WHERE doctor_id = $1
       AND appointment_date = $2
       AND appointment_time = $3
       AND status != 'CANCELLED'`,
      [doctor_id, appointment_date, appointment_time]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: "Slot already booked" },
        { status: 400 }
      );
    }

    // ✅ Convert patient_id to number (if present)
    const numericPatientId = patient_id ? Number(patient_id) : null;

   const result = await query(
  `INSERT INTO appointments 
   (doctor_id, patient_id, appointment_date, appointment_time, consultation_type, notes, status)
   VALUES ($1, $2, $3, $4, $5, $6, 'BOOKED')
   RETURNING *`,
  [
    doctor_id,
    numericPatientId,
    appointment_date,
    appointment_time,
    // Fixed mapping: keep 'teleconsultation' as is, map 'video' to 'teleconsultation', default to 'in-person'
    (consultation_type === 'video' || consultation_type === 'teleconsultation') ? 'teleconsultation' : 'in-person',
    notes || '',
  ]
);

    console.log("✅ Appointment created successfully:", result.rows[0].id);

    // 🟢 FIX DATE: Convert PostgreSQL date to YYYY-MM-DD string
    const newAppointment = result.rows[0];
    if (newAppointment.appointment_date instanceof Date) {
      newAppointment.appointment_date = newAppointment.appointment_date.toISOString().split('T')[0];
    }

    return NextResponse.json({
      success: true,
      data: newAppointment,   // <-- use the modified object
      message: "Appointment booked successfully"
    });
  } catch (error) {
    console.error("❌ Create appointment error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create appointment",
      },
      { status: 500 }
    );
  }
}