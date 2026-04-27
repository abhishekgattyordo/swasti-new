

// import { NextRequest, NextResponse } from "next/server";
// import { query } from "@/lib/db";
// import { authErrorResponse,requireRole } from '@/lib/auth/guards';

// export async function GET(req: NextRequest) {
//   try {
//       requireRole(req, ['laboratory']);
//     const searchParams = req.nextUrl.searchParams;
//     const status = searchParams.get("status");
    
//     let sql = `
//       SELECT * FROM lab_orders 
//       WHERE status IN ('Ordered', 'Collected')
//       ORDER BY created_at DESC
//     `;
//     const params: any[] = [];
    
//     if (status === "ordered") {
//       sql = `
//         SELECT * FROM lab_orders 
//         WHERE status = 'Ordered'
//         ORDER BY created_at DESC
//       `;
//     }
    
//     if (status === "collected") {
//       sql = `
//         SELECT * FROM lab_orders 
//         WHERE status = 'Collected'
//         ORDER BY created_at DESC
//       `;
//     }

//     const result = await query(sql, params);
//     return NextResponse.json({ success: true, data: result.rows });
//   } catch (error: any) {
//       const authResponse=authErrorResponse(error);
// if(authResponse){
//   return authResponse
// }
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

// export async function PUT(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { id, status, collected_date, completed_date, results } = body;

//     // Build dynamic UPDATE
//     const updates: string[] = [];
//     const values: any[] = [];
//     let paramCounter = 1;

//     if (status !== undefined) {
//       updates.push(`status = $${paramCounter++}`);
//       values.push(status);
//     }
//     if (collected_date !== undefined) {
//       updates.push(`collected_date = $${paramCounter++}`);
//       values.push(collected_date);
//     }
//     if (completed_date !== undefined) {
//       updates.push(`completed_date = $${paramCounter++}`);
//       values.push(completed_date);
//     }
//     if (results !== undefined) {
//       updates.push(`results = $${paramCounter++}`);
//       values.push(JSON.stringify(results));
//     }

//     if (updates.length === 0) {
//       return NextResponse.json({ error: "No fields to update" }, { status: 400 });
//     }

//     values.push(id);
//     const sql = `
//       UPDATE lab_orders 
//       SET ${updates.join(", ")} 
//       WHERE id = $${paramCounter}
//       RETURNING *
//     `;
    
//     const result = await query(sql, values);
    
//     if (result.rows.length === 0) {
//       return NextResponse.json({ error: "Order not found" }, { status: 404 });
//     }

//     return NextResponse.json({ success: true, data: result.rows[0] });
//   } catch (error: any) {
//     console.error("PUT error:", error);
//       const authResponse=authErrorResponse(error);
// if(authResponse){
//   return authResponse
// }
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { authErrorResponse, requireRole } from '@/lib/auth/guards';

export async function GET(req: NextRequest) {
  try {
    requireRole(req, ['laboratory']);
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");
    
    let sql = `
      SELECT * FROM lab_orders 
      WHERE status IN ('Ordered', 'Collected')
      ORDER BY created_at DESC
    `;
    const params: any[] = [];
    
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
    console.error("GET samples error:", error);
    const authResponse = authErrorResponse(error);
    if (authResponse) {
      return authResponse;
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    requireRole(request, ['laboratory']);
    const body = await request.json();
    const { id, status, collected_date, completed_date, results } = body;

    console.log("=== PUT /api/laboratory/samples ===");
    console.log("Received body:", JSON.stringify(body, null, 2));

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
    
    console.log("SQL Query:", sql);
    console.log("Values:", values);
    
    const result = await query(sql, values);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    console.log("Order updated successfully:", result.rows[0]);

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error("PUT error:", error);
    const authResponse = authErrorResponse(error);
    if (authResponse) {
      return authResponse;
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}