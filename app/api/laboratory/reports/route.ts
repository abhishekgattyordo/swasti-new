import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    
    let query = supabase
      .from("lab_orders")
      .select("*")
      .eq("status", "Completed")
      .order("completed_date", { ascending: false });

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Format reports
    const formattedReports = (data || []).map((order: any) => ({
      id: order.id,
      order_id: order.order_id,
      patient_name: order.patient_name,
      patient_id: order.patient_id,
      tests: order.tests.map((test: any) => ({
        id: test.id,
        name: test.name,
        price: test.price,
        result: order.results?.find((r: any) => r.test_id === test.id)?.result || "Result not available",
      })),
      total_amount: order.total_amount,
      completed_date: order.completed_date,
      collected_date: order.collected_date,
      billing_entry_id: order.billing_entry_id,
    }));

    // Filter by search if provided
    let filteredReports = formattedReports;
    if (search) {
      filteredReports = formattedReports.filter(
        (r) =>
          r.patient_name.toLowerCase().includes(search.toLowerCase()) ||
          r.order_id.toLowerCase().includes(search.toLowerCase()) ||
          r.patient_id.toLowerCase().includes(search.toLowerCase())
      );
    }

    return NextResponse.json({ success: true, data: filteredReports });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}