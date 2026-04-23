
// }

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { authErrorResponse,requireRole } from '@/lib/auth/guards';

export async function POST(req: NextRequest) {
  try {
     requireRole(req, ['laboratory']);
    const body = await req.json();
    
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
      const authResponse=authErrorResponse(error);
if(authResponse){
  return authResponse
}
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