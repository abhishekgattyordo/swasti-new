import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { authErrorResponse, requireRole } from '@/lib/auth/guards';

export async function GET(req: NextRequest) {
  try {
    requireRole(req, ['laboratory']);
    
    const result = await query(`
      SELECT * FROM mri_orders 
      ORDER BY created_at DESC
    `);
    
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error: any) {
    console.error("GET MRI error:", error);
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    requireRole(req, ['laboratory']);
    const body = await req.json();
    
    const {
      order_id,
      patient_id,
      patient_name,
      body_part,
      mri_type,
      with_contrast,
      visit_type,
      visit_id,
      status,
      order_date,
      doctor_name,
      notes,
    } = body;

    const result = await query(`
      INSERT INTO mri_orders (
        order_id, patient_id, patient_name, body_part, mri_type, with_contrast,
        visit_type, visit_id, status, order_date, doctor_name, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [order_id, patient_id, patient_name, body_part, mri_type, with_contrast, visit_type, visit_id, status, order_date, doctor_name, notes]);

    return NextResponse.json({ success: true, data: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    console.error("POST MRI error:", error);
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    requireRole(req, ['laboratory']);
    const body = await req.json();
    const { id, status, completed_date, result } = body;

    const updates: string[] = [];
    const values: any[] = [];
    let paramCounter = 1;

    if (status !== undefined) {
      updates.push(`status = $${paramCounter++}`);
      values.push(status);
    }
    if (completed_date !== undefined) {
      updates.push(`completed_date = $${paramCounter++}`);
      values.push(completed_date);
    }
    if (result !== undefined) {
      updates.push(`result = $${paramCounter++}`);
      values.push(result);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    values.push(id);
    const sql = `
      UPDATE mri_orders 
      SET ${updates.join(", ")} 
      WHERE id = $${paramCounter}
      RETURNING *
    `;
    
    const resultQuery = await query(sql, values);
    
    if (resultQuery.rows.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: resultQuery.rows[0] });
  } catch (error: any) {
    console.error("PUT MRI error:", error);
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}