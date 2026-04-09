import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// GET - Fetch all tests
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const active = searchParams.get("active");
    
    let query = supabase.from("lab_tests").select("*");
    
    if (active === "true") {
      query = query.eq("active", true);
    }
    
    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase GET error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create new test
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Received test data:", body);
    
    const { test_name, test_code, category, price, active } = body;

    // Validation
    if (!test_name || !test_code || !price) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing required fields: test_name, test_code, price" 
      }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("lab_tests")
      .insert([{ 
        test_name, 
        test_code, 
        category: category || "Other", 
        price: parseFloat(price), 
        active: active !== undefined ? active : true 
      }])
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    console.log("Test created successfully:", data);
    return NextResponse.json({ success: true, data: data[0] }, { status: 201 });
  } catch (error) {
    console.error("API POST error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update test
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Update test data:", body);
    
    const { id, test_name, test_code, category, price, active } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Test ID is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (test_name !== undefined) updateData.test_name = test_name;
    if (test_code !== undefined) updateData.test_code = test_code;
    if (category !== undefined) updateData.category = category;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (active !== undefined) updateData.active = active;

    const { data, error } = await supabase
      .from("lab_tests")
      .update(updateData)
      .eq("id", id)
      .select();

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    console.log("Test updated successfully:", data);
    return NextResponse.json({ success: true, data: data[0] });
  } catch (error) {
    console.error("API PUT error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Delete test
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
    }

    const { error } = await supabase.from("lab_tests").delete().eq("id", id);

    if (error) {
      console.error("Supabase delete error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API DELETE error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}