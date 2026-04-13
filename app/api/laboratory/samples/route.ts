// import { NextRequest, NextResponse } from "next/server";
// import { supabase } from "@/lib/supabaseClient";

// // GET - Fetch pending orders (Ordered & Collected)
// export async function GET(request: NextRequest) {
//   try {
//     const searchParams = request.nextUrl.searchParams;
//     const status = searchParams.get("status");
    
//     let query = supabase
//       .from("lab_orders")
//       .select("*")
//       .in("status", ["Ordered", "Collected"])
//       .order("created_at", { ascending: false });
    
//     if (status === "ordered") {
//       query = supabase
//         .from("lab_orders")
//         .select("*")
//         .eq("status", "Ordered")
//         .order("created_at", { ascending: false });
//     }
    
//     if (status === "collected") {
//       query = supabase
//         .from("lab_orders")
//         .select("*")
//         .eq("status", "Collected")
//         .order("created_at", { ascending: false });
//     }

//     const { data, error } = await query;

//     if (error) {
//       return NextResponse.json({ error: error.message }, { status: 500 });
//     }

//     return NextResponse.json({ success: true, data });
//   } catch (error) {
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// }

// // PUT - Update order status (collect sample or complete with results)
// export async function PUT(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { id, status, collected_date, completed_date, results } = body;

//     const updateData: any = {};
//     if (status) updateData.status = status;
//     if (collected_date) updateData.collected_date = collected_date;
//     if (completed_date) updateData.completed_date = completed_date;
//     if (results) updateData.results = results;

//     const { data, error } = await supabase
//       .from("lab_orders")
//       .update(updateData)
//       .eq("id", id)
//       .select();

//     if (error) {
//       return NextResponse.json({ error: error.message }, { status: 500 });
//     }

//     return NextResponse.json({ success: true, data: data[0] });
//   } catch (error) {
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    
    let sql = `
      SELECT * FROM lab_orders 
      WHERE status IN ('Ordered', 'Collected')
      ORDER BY created_at DESC
    `;
    let params: any[] = [];
    
    if (status === "ordered") {
      sql = `
        SELECT * FROM lab_orders 
        WHERE status = 'Ordered'
        ORDER BY created_at DESC
      `;
    }
    
    if (status === "collected") {
      sql = `
        SELECT * FROM lab_orders 
        WHERE status = 'Collected'
        ORDER BY created_at DESC
      `;
    }

    const result = await query(sql, params);
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, collected_date, completed_date, results } = body;

    // Build dynamic UPDATE
    const updates: string[] = [];
    const values: any[] = [];
    let paramCounter = 1;

    if (status !== undefined) {
      updates.push(`status = $${paramCounter++}`);
      values.push(status);
    }
    if (collected_date !== undefined) {
      updates.push(`collected_date = $${paramCounter++}`);
      values.push(collected_date);
    }
    if (completed_date !== undefined) {
      updates.push(`completed_date = $${paramCounter++}`);
      values.push(completed_date);
    }
    if (results !== undefined) {
      updates.push(`results = $${paramCounter++}`);
      values.push(JSON.stringify(results));
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    values.push(id);
    const sql = `
      UPDATE lab_orders 
      SET ${updates.join(", ")} 
      WHERE id = $${paramCounter}
      RETURNING *
    `;
    
    const result = await query(sql, values);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error("PUT error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}