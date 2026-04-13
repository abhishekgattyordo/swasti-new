// import { NextResponse } from 'next/server';
// import { supabaseAdmin } from '@/lib/supabaseServer';

// export async function GET() {
//   try {
//     const { data, error } = await supabaseAdmin.auth.admin.listUsers();
//     if (error) {
//       return NextResponse.json({ error: error.message }, { status: 500 });
//     }
//     return NextResponse.json({ success: true, userCount: data.users.length });
//   } catch (err) {
//     return NextResponse.json({ error: 'Network error', details: String(err) }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    // Test 1: Check connection
    const connectionTest = await query("SELECT NOW() as current_time");
    
    // Test 2: Count lab_orders
    const countResult = await query("SELECT COUNT(*) FROM lab_orders");
    
    // Test 3: Get latest order (if any)
    const latestOrder = await query(`
      SELECT id, order_id, patient_name, status, created_at 
      FROM lab_orders 
      ORDER BY created_at DESC 
      LIMIT 1
    `);
    
    return NextResponse.json({
      success: true,
      database: "PostgreSQL Connected",
      currentTime: connectionTest.rows[0].current_time,
      totalOrders: parseInt(countResult.rows[0].count),
      latestOrder: latestOrder.rows[0] || null,
      message: "✅ Database is ready for migration!"
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      hint: "Check DATABASE_URL and network connectivity"
    }, { status: 500 });
  }
}