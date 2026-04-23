

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { authErrorResponse,requireRole } from '@/lib/auth/guards';

export async function GET(req: NextRequest) {
  try {
    // Fetch all orders
      requireRole(req, ['laboratory']);
    const result = await query(`
      SELECT * FROM lab_orders 
      ORDER BY created_at DESC
    `);
    
    const orders = result.rows;
    const today = new Date().toISOString().split("T")[0];

    const totalOrders = orders.length;
    const pendingCollection = orders.filter((o: any) => o.status === "Ordered").length;
    const pendingResults = orders.filter((o: any) => o.status === "Collected").length;
    const completedToday = orders.filter(
      (o: any) => o.status === "Completed" && o.completed_date === today
    ).length;

    const recentOrders = orders.slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalOrders,
          pendingCollection,
          pendingResults,
          completedToday,
        },
        recentOrders,
      },
    });
  } catch (error: any) {
    console.error("Dashboard API error:", error);
      const authResponse=authErrorResponse(error);
if(authResponse){
  return authResponse
}
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}