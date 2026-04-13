
// import { NextRequest, NextResponse } from "next/server";
// import { supabase } from "@/lib/supabaseClient";

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
    
//     // Log the entire request body
//     console.log("=== FULL REQUEST BODY ===");
//     console.log(JSON.stringify(body, null, 2));
    
//     // Check specifically for admission fields
//     console.log("=== ADMISSION FIELDS CHECK ===");
//     console.log("admission_id:", body.admission_id);
//     console.log("admission_date:", body.admission_date);
//     console.log("ward_id:", body.ward_id);
//     console.log("bed_id:", body.bed_id);
    
//     const {
//       order_id,
//       patient_id,
//       patient_name,
//       visit_type,
//       visit_id,
//       tests,
//       total_amount,
//       status,
//       order_date,
//       billing_entry_id,
//       admission_id,
//       admission_date,
//       ward_id,
//       bed_id,
//     } = body;

//     // Build the order data
//     const orderData: any = {
//       order_id,
//       patient_id,
//       patient_name,
//       visit_type: visit_type || "OP",
//       visit_id: visit_id || `OP-${Date.now()}`,
//       tests,
//       total_amount,
//       status: status || "Ordered",
//       order_date: order_date || new Date().toISOString().split("T")[0],
//       billing_entry_id: billing_entry_id || `BILL-${Date.now()}`,
//     };

//     // Add admission fields if they exist and have values
//     if (admission_id && admission_id !== null && admission_id !== "") {
//       orderData.admission_id = String(admission_id);
//       console.log("✅ Added admission_id:", orderData.admission_id);
//     }
    
//     if (admission_date && admission_date !== null && admission_date !== "") {
//       orderData.admission_date = admission_date;
//       console.log("✅ Added admission_date:", orderData.admission_date);
//     }
    
//     if (ward_id && ward_id !== null && ward_id !== "") {
//       orderData.ward_id = Number(ward_id);
//       console.log("✅ Added ward_id:", orderData.ward_id);
//     }
    
//     if (bed_id && bed_id !== null && bed_id !== "") {
//       orderData.bed_id = Number(bed_id);
//       console.log("✅ Added bed_id:", orderData.bed_id);
//     }

//     console.log("=== FINAL ORDER DATA FOR SUPABASE ===");
//     console.log(JSON.stringify(orderData, null, 2));

//     const { data, error } = await supabase
//       .from("lab_orders")
//       .insert([orderData])
//       .select();

//     if (error) {
//       console.error("❌ Supabase insert error:", error);
//       return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//     }

//     console.log("✅ Order created. Saved data:", data[0]);
//     return NextResponse.json({ success: true, data: data[0] }, { status: 201 });
//   } catch (error) {
//     console.error("❌ API POST error:", error);
//     return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      order_id,
      patient_id,
      patient_name,
      visit_type,
      visit_id,
      tests,
      total_amount,
      status,
      order_date,
      billing_entry_id,
      admission_id,
      admission_date,
      ward_id,
      bed_id,
    } = body;

    // Build dynamic INSERT query
    const insertData: any = {
      order_id,
      patient_id,
      patient_name,
      visit_type: visit_type || "OP",
      visit_id: visit_id || `OP-${Date.now()}`,
      tests: JSON.stringify(tests), // Convert tests array to JSON for PostgreSQL
      total_amount,
      status: status || "Ordered",
      order_date: order_date || new Date().toISOString().split("T")[0],
      billing_entry_id: billing_entry_id || `BILL-${Date.now()}`,
    };

    // Add optional fields if present
    if (admission_id && admission_id !== "") insertData.admission_id = admission_id;
    if (admission_date && admission_date !== "") insertData.admission_date = admission_date;
    if (ward_id && ward_id !== "") insertData.ward_id = parseInt(ward_id);
    if (bed_id && bed_id !== "") insertData.bed_id = parseInt(bed_id);

    // Build SQL dynamically
    const columns = Object.keys(insertData);
    const values = Object.values(insertData);
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
    
    const sql = `
      INSERT INTO lab_orders (${columns.join(", ")})
      VALUES (${placeholders})
      RETURNING *
    `;
    
    const result = await query(sql, values);
    const newOrder = result.rows[0];

    return NextResponse.json({ success: true, data: newOrder }, { status: 201 });
  } catch (error: any) {
    console.error("POST error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const result = await query(`
      SELECT * FROM lab_orders 
      ORDER BY created_at DESC
    `);
    
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}