

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { authErrorResponse,requireRole } from '@/lib/auth/guards';

export async function GET(req: NextRequest) {
  try {
       requireRole(req, ['laboratory']);
    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    
    let sql = `
      SELECT * FROM lab_orders 
      WHERE status = 'Completed'
      ORDER BY completed_date DESC
    `;
    
    let params: any[] = [];
    
    if (search) {
      sql = `
        SELECT * FROM lab_orders 
        WHERE status = 'Completed' 
        AND (patient_name ILIKE $1 OR order_id ILIKE $1 OR patient_id ILIKE $1)
        ORDER BY completed_date DESC
      `;
      params = [`%${search}%`];
    }
    
    const result = await query(sql, params);
    const orders = result.rows;

    // Format reports with test results
    const formattedReports = orders.map((order: any) => ({
      id: order.id,
      order_id: order.order_id,
      patient_name: order.patient_name,
      patient_id: order.patient_id,
      tests: Array.isArray(order.tests) ? order.tests.map((test: any) => ({
        id: test.id,
        name: test.name,
        price: test.price,
        result: order.results?.find((r: any) => r.test_id === test.id)?.result || "Result not available",
      })) : [],
      total_amount: order.total_amount,
      completed_date: order.completed_date,
      collected_date: order.collected_date,
      billing_entry_id: order.billing_entry_id,
    }));

    return NextResponse.json({ success: true, data: formattedReports });
  } catch (error: any) {
    console.error("Reports API error:", error);
      const authResponse=authErrorResponse(error);
if(authResponse){
  return authResponse
}
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}