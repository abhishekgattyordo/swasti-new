import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// GET - Fetch pending orders (Ordered & Collected)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    
    let query = supabase
      .from("lab_orders")
      .select("*")
      .in("status", ["Ordered", "Collected"])
      .order("created_at", { ascending: false });
    
    if (status === "ordered") {
      query = supabase
        .from("lab_orders")
        .select("*")
        .eq("status", "Ordered")
        .order("created_at", { ascending: false });
    }
    
    if (status === "collected") {
      query = supabase
        .from("lab_orders")
        .select("*")
        .eq("status", "Collected")
        .order("created_at", { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update order status (collect sample or complete with results)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, collected_date, completed_date, results } = body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (collected_date) updateData.collected_date = collected_date;
    if (completed_date) updateData.completed_date = completed_date;
    if (results) updateData.results = results;

    const { data, error } = await supabase
      .from("lab_orders")
      .update(updateData)
      .eq("id", id)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data[0] });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}