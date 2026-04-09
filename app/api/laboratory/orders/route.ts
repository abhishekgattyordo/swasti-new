import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// GET - Fetch orders
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const pending = searchParams.get("pending");
    
    let query = supabase.from("lab_orders").select("*");
    
    if (status) {
      query = query.eq("status", status);
    }
    
    if (pending === "true") {
      query = query.in("status", ["Ordered", "Collected"]);
    }
    
    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      order_id,
      patient_id,
      patient_name,
      visit_type,
      visit_id,
      tests,
      total_amount,
      status,
      order_date,
      billing_entry_id,
    } = body;

    const { data, error } = await supabase
      .from("lab_orders")
      .insert([{
        order_id,
        patient_id,
        patient_name,
        visit_type,
        visit_id,
        tests,
        total_amount,
        status: status || "Ordered",
        order_date,
        billing_entry_id,
      }])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data[0] }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update order (cancel, update status)
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

// DELETE - Delete order
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const { error } = await supabase.from("lab_orders").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}