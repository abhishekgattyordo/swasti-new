

// import { NextRequest, NextResponse } from "next/server";
// import { query } from "@/lib/db";
// import { authErrorResponse,requireRole } from '@/lib/auth/guards';

// export async function POST(req: NextRequest) {
//   try {
//      requireRole(req, ['laboratory']);
//     const body = await req.json();
    
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

//     // Build dynamic INSERT query
//     const insertData: any = {
//       order_id,
//       patient_id,
//       patient_name,
//       visit_type: visit_type || "OP",
//       visit_id: visit_id || `OP-${Date.now()}`,
//       tests: JSON.stringify(tests), // Convert tests array to JSON for PostgreSQL
//       total_amount,
//       status: status || "Ordered",
//       order_date: order_date || new Date().toISOString().split("T")[0],
//       billing_entry_id: billing_entry_id || `BILL-${Date.now()}`,
//     };

//     // Add optional fields if present
//     if (admission_id && admission_id !== "") insertData.admission_id = admission_id;
//     if (admission_date && admission_date !== "") insertData.admission_date = admission_date;
//     if (ward_id && ward_id !== "") insertData.ward_id = parseInt(ward_id);
//     if (bed_id && bed_id !== "") insertData.bed_id = parseInt(bed_id);

//     // Build SQL dynamically
//     const columns = Object.keys(insertData);
//     const values = Object.values(insertData);
//     const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
    
//     const sql = `
//       INSERT INTO lab_orders (${columns.join(", ")})
//       VALUES (${placeholders})
//       RETURNING *
//     `;
    
//     const result = await query(sql, values);
//     const newOrder = result.rows[0];

//     return NextResponse.json({ success: true, data: newOrder }, { status: 201 });
//   } catch (error: any) {
//     console.error("POST error:", error);
//       const authResponse=authErrorResponse(error);
// if(authResponse){
//   return authResponse
// }
//     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//   }
// }

// export async function GET(request: NextRequest) {
//   try {
//     const result = await query(`
//       SELECT * FROM lab_orders 
//       ORDER BY created_at DESC
//     `);
    
//     return NextResponse.json({ success: true, data: result.rows });
//   } catch (error: any) {
//     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//   }
// }


import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { authErrorResponse, requireRole } from '@/lib/auth/guards';

export async function POST(req: NextRequest) {
  try {
    requireRole(req, ['laboratory']);
    const body = await req.json();
    
    console.log("=== POST /api/laboratory/orders ===");
    console.log("Received body:", JSON.stringify(body, null, 2));
    
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
      tests: JSON.stringify(tests),
      total_amount: typeof total_amount === 'number' ? total_amount : parseFloat(total_amount) || 0,
      status: status || "Ordered",
      order_date: order_date || new Date().toISOString().split("T")[0],
      billing_entry_id: billing_entry_id || `BILL-${Date.now()}`,
    };

    // Add optional fields if present and valid
    if (admission_id && admission_id !== "" && admission_id !== "null" && admission_id !== null) {
      insertData.admission_id = admission_id;
      console.log("Adding admission_id:", admission_id);
    }
    
    if (admission_date && admission_date !== "" && admission_date !== "null" && admission_date !== null) {
      insertData.admission_date = admission_date;
      console.log("Adding admission_date:", admission_date);
    }
    
    if (ward_id && ward_id !== "" && ward_id !== "null" && ward_id !== null && ward_id !== 0) {
      insertData.ward_id = typeof ward_id === 'number' ? ward_id : parseInt(ward_id);
      console.log("Adding ward_id:", insertData.ward_id);
    }
    
    if (bed_id && bed_id !== "" && bed_id !== "null" && bed_id !== null && bed_id !== 0) {
      insertData.bed_id = typeof bed_id === 'number' ? bed_id : parseInt(bed_id);
      console.log("Adding bed_id:", insertData.bed_id);
    }

    console.log("Final insertData:", JSON.stringify(insertData, null, 2));

    // Build SQL dynamically
    const columns = Object.keys(insertData);
    const values = Object.values(insertData);
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
    
    const sql = `
      INSERT INTO lab_orders (${columns.join(", ")})
      VALUES (${placeholders})
      RETURNING *
    `;
    
    console.log("SQL Query:", sql);
    
    const result = await query(sql, values);
    const newOrder = result.rows[0];

    console.log("Order created successfully:", newOrder);

    return NextResponse.json({ success: true, data: newOrder }, { status: 201 });
  } catch (error: any) {
    console.error("POST error:", error);
    const authResponse = authErrorResponse(error);
    if (authResponse) {
      return authResponse;
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    requireRole(request, ['laboratory']);
    const result = await query(`
      SELECT * FROM lab_orders 
      ORDER BY created_at DESC
    `);
    
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error: any) {
    console.error("GET error:", error);
    const authResponse = authErrorResponse(error);
    if (authResponse) {
      return authResponse;
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    requireRole(req, ['laboratory']);
    const body = await req.json();
    
    console.log("=== PUT /api/laboratory/orders ===");
    console.log("Received body:", JSON.stringify(body, null, 2));
    
    const { id, status, collected_date, completed_date, results } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Order ID is required" }, { status: 400 });
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramCounter = 1;

    if (status !== undefined) {
      updates.push(`status = $${paramCounter++}`);
      values.push(status);
      console.log(`Updating status to: ${status}`);
    }
    
    if (collected_date !== undefined) {
      updates.push(`collected_date = $${paramCounter++}`);
      values.push(collected_date);
      console.log(`Updating collected_date to: ${collected_date}`);
    }
    
    if (completed_date !== undefined) {
      updates.push(`completed_date = $${paramCounter++}`);
      values.push(completed_date);
      console.log(`Updating completed_date to: ${completed_date}`);
    }
    
    if (results !== undefined) {
      updates.push(`results = $${paramCounter++}`);
      values.push(JSON.stringify(results));
      console.log(`Updating results`);
    }

    if (updates.length === 0) {
      return NextResponse.json({ success: false, error: "No fields to update" }, { status: 400 });
    }

    values.push(id);
    const sql = `
      UPDATE lab_orders 
      SET ${updates.join(", ")} 
      WHERE id = $${paramCounter}
      RETURNING *
    `;
    
    console.log("SQL Query:", sql);
    console.log("Values:", values);
    
    const result = await query(sql, values);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    console.log("Order updated successfully:", result.rows[0]);

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error("PUT error:", error);
    const authResponse = authErrorResponse(error);
    if (authResponse) {
      return authResponse;
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    requireRole(req, ['laboratory']);
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    console.log("=== DELETE /api/laboratory/orders ===");
    console.log("Order ID to delete:", id);
    
    if (!id) {
      return NextResponse.json({ success: false, error: "Order ID is required" }, { status: 400 });
    }
    
    const result = await query("DELETE FROM lab_orders WHERE id = $1 RETURNING id", [id]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }
    
    console.log("Order deleted successfully");
    
    return NextResponse.json({ success: true, message: "Order deleted successfully" });
  } catch (error: any) {
    console.error("DELETE error:", error);
    const authResponse = authErrorResponse(error);
    if (authResponse) {
      return authResponse;
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}