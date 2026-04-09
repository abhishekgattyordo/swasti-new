import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(request: NextRequest) {
  try {
    // Fetch all orders
    const { data: orders, error } = await supabase
      .from("lab_orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const today = new Date().toISOString().split("T")[0];

    const totalOrders = orders?.length || 0;
    const pendingCollection = orders?.filter((o: any) => o.status === "Ordered").length || 0;
    const pendingResults = orders?.filter((o: any) => o.status === "Collected").length || 0;
    const completedToday = orders?.filter(
      (o: any) => o.status === "Completed" && o.completed_date === today
    ).length || 0;

    // Recent Orders (last 5)
    const recentOrders = (orders || []).slice(0, 5);

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
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}