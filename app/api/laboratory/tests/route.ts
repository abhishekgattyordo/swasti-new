

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { authErrorResponse,requireRole } from '@/lib/auth/guards';

export async function GET(req: NextRequest) {
  try {
       requireRole(req, ['laboratory']);
    const searchParams = req.nextUrl.searchParams;
    const active = searchParams.get("active");
    
    let sql = `SELECT * FROM lab_tests ORDER BY created_at DESC`;
    const params: any[] = [];
    
    if (active === "true") {
      sql = `SELECT * FROM lab_tests WHERE active = true ORDER BY created_at DESC`;
    }
    
    const result = await query(sql, params);
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error: any) {
    console.error("GET tests error:", error);
      const authResponse=authErrorResponse(error);
if(authResponse){
  return authResponse
}
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
       requireRole(req, ['laboratory']);
    const body = await req.json();
    const { test_name, test_code, category, price, active } = body;

    if (!test_name || !test_code || !price) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing required fields: test_name, test_code, price" 
      }, { status: 400 });
    }

    const sql = `
      INSERT INTO lab_tests (test_name, test_code, category, price, active)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const result = await query(sql, [
      test_name,
      test_code,
      category || "Other",
      parseFloat(price),
      active !== undefined ? active : true
    ]);

    return NextResponse.json({ success: true, data: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    console.error("POST test error:", error);
      const authResponse=authErrorResponse(error);
if(authResponse){
  return authResponse
}
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
       requireRole(req, ['laboratory']);
    const body = await req.json();
    const { id, test_name, test_code, category, price, active } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Test ID is required" }, { status: 400 });
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramCounter = 1;

    if (test_name !== undefined) {
      updates.push(`test_name = $${paramCounter++}`);
      values.push(test_name);
    }
    if (test_code !== undefined) {
      updates.push(`test_code = $${paramCounter++}`);
      values.push(test_code);
    }
    if (category !== undefined) {
      updates.push(`category = $${paramCounter++}`);
      values.push(category);
    }
    if (price !== undefined) {
      updates.push(`price = $${paramCounter++}`);
      values.push(parseFloat(price));
    }
    if (active !== undefined) {
      updates.push(`active = $${paramCounter++}`);
      values.push(active);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    values.push(id);
    const sql = `
      UPDATE lab_tests 
      SET ${updates.join(", ")} 
      WHERE id = $${paramCounter}
      RETURNING *
    `;
    
    const result = await query(sql, values);
    
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error("PUT test error:", error);
        const authResponse=authErrorResponse(error);
if(authResponse){
  return authResponse
}

    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
       requireRole(req, ['laboratory']);
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
    }

    const sql = `DELETE FROM lab_tests WHERE id = $1 RETURNING id`;
    const result = await query(sql, [parseInt(id)]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Test not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE test error:", error);
        const authResponse=authErrorResponse(error);
if(authResponse){
  return authResponse
}

    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}