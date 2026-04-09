

// import { NextRequest, NextResponse } from "next/server";
// import { supabase } from "@/lib/supabaseClient";

// // GET - Fetch orders
// export async function GET(request: NextRequest) {
//   try {
//     const searchParams = request.nextUrl.searchParams;
//     const status = searchParams.get("status");
//     const pending = searchParams.get("pending");
    
//     let query = supabase.from("lab_orders").select("*");
    
//     if (status) {
//       query = query.eq("status", status);
//     }
    
//     if (pending === "true") {
//       query = query.in("status", ["Ordered", "Collected"]);
//     }
    
//     const { data, error } = await query.order("created_at", { ascending: false });

//     if (error) {
//       console.error("Supabase GET error:", error);
//       return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//     }

//     return NextResponse.json({ success: true, data });
//   } catch (error) {
//     console.error("API error:", error);
//     return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
//   }
// }

// // POST - Create new order
// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     console.log("Received order data:", body);
    
//     const {
//       order_id,
//       patient_id,
//       patient_name,
//       visit_type,
//       visit_id,
//       tests,
//       total_amount,
//       status,
//       order_date,
//       billing_entry_id,
//       admission_id,
//       admission_date,
//       ward_id,
//       bed_id,
//     } = body;

//     // Validation
//     if (!order_id || !patient_id || !patient_name || !tests || !total_amount) {
//       return NextResponse.json({ 
//         success: false, 
//         error: "Missing required fields" 
//       }, { status: 400 });
//     }

//     const orderData: any = {
//       order_id,
//       patient_id,
//       patient_name,
//       visit_type: visit_type || "OP",
//       visit_id: visit_id || `OP-${Date.now()}`,
//       tests,
//       total_amount,
//       status: status || "Ordered",
//       order_date: order_date || new Date().toISOString().split("T")[0],
//       billing_entry_id: billing_entry_id || `BILL-${Date.now()}`,
//     };

//     // Add admission fields if provided (for IP visits)
//     if (admission_id) orderData.admission_id = admission_id;
//     if (admission_date) orderData.admission_date = admission_date;
//     if (ward_id) orderData.ward_id = ward_id;
//     if (bed_id) orderData.bed_id = bed_id;

//     const { data, error } = await supabase
//       .from("lab_orders")
//       .insert([orderData])
//       .select();

//     if (error) {
//       console.error("Supabase insert error:", error);
//       return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//     }

//     console.log("Order created successfully:", data);
//     return NextResponse.json({ success: true, data: data[0] }, { status: 201 });
//   } catch (error) {
//     console.error("API POST error:", error);
//     return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
//   }
// }

// // PUT - Update order (cancel, collect, complete)
// export async function PUT(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { id, status, collected_date, completed_date, results } = body;

//     if (!id) {
//       return NextResponse.json({ success: false, error: "Order ID is required" }, { status: 400 });
//     }

//     const updateData: any = {};
//     if (status) updateData.status = status;
//     if (collected_date) updateData.collected_date = collected_date;
//     if (completed_date) updateData.completed_date = completed_date;
//     if (results) updateData.results = results;

//     const { data, error } = await supabase
//       .from("lab_orders")
//       .update(updateData)
//       .eq("id", id)
//       .select();

//     if (error) {
//       console.error("Supabase update error:", error);
//       return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//     }

//     return NextResponse.json({ success: true, data: data[0] });
//   } catch (error) {
//     console.error("API PUT error:", error);
//     return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
//   }
// }

// // DELETE - Delete order
// export async function DELETE(request: NextRequest) {
//   try {
//     const searchParams = request.nextUrl.searchParams;
//     const id = searchParams.get("id");

//     if (!id) {
//       return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
//     }

//     const { error } = await supabase.from("lab_orders").delete().eq("id", id);

//     if (error) {
//       console.error("Supabase delete error:", error);
//       return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//     }

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error("API DELETE error:", error);
//     return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
//   }
// }



// import { NextRequest, NextResponse } from "next/server";
// import { supabase } from "@/lib/supabaseClient";

// // GET - Fetch orders
// export async function GET(request: NextRequest) {
//   try {
//     const searchParams = request.nextUrl.searchParams;
//     const status = searchParams.get("status");
//     const pending = searchParams.get("pending");
    
//     let query = supabase.from("lab_orders").select("*");
    
//     if (status) {
//       query = query.eq("status", status);
//     }
    
//     if (pending === "true") {
//       query = query.in("status", ["Ordered", "Collected"]);
//     }
    
//     const { data, error } = await query.order("created_at", { ascending: false });

//     if (error) {
//       return NextResponse.json({ error: error.message }, { status: 500 });
//     }

//     return NextResponse.json({ success: true, data });
//   } catch (error) {
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// }

// // POST - Create new order
// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const {
//       order_id,
//       patient_id,
//       patient_name,
//       visit_type,
//       visit_id,
//       tests,
//       total_amount,
//       status,
//       order_date,
//       billing_entry_id,
//     } = body;

//     const { data, error } = await supabase
//       .from("lab_orders")
//       .insert([{
//         order_id,
//         patient_id,
//         patient_name,
//         visit_type,
//         visit_id,
//         tests,
//         total_amount,
//         status: status || "Ordered",
//         order_date,
//         billing_entry_id,
//       }])
//       .select();

//     if (error) {
//       return NextResponse.json({ error: error.message }, { status: 500 });
//     }

//     return NextResponse.json({ success: true, data: data[0] }, { status: 201 });
//   } catch (error) {
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// }

// // PUT - Update order (cancel, update status)
// export async function PUT(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { id, status, collected_date, completed_date, results } = body;

//     const updateData: any = {};
//     if (status) updateData.status = status;
//     if (collected_date) updateData.collected_date = collected_date;
//     if (completed_date) updateData.completed_date = completed_date;
//     if (results) updateData.results = results;

//     const { data, error } = await supabase
//       .from("lab_orders")
//       .update(updateData)
//       .eq("id", id)
//       .select();

//     if (error) {
//       return NextResponse.json({ error: error.message }, { status: 500 });
//     }

//     return NextResponse.json({ success: true, data: data[0] });
//   } catch (error) {
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// }

// // DELETE - Delete order
// export async function DELETE(request: NextRequest) {
//   try {
//     const searchParams = request.nextUrl.searchParams;
//     const id = searchParams.get("id");

//     if (!id) {
//       return NextResponse.json({ error: "ID is required" }, { status: 400 });
//     }

//     const { error } = await supabase.from("lab_orders").delete().eq("id", id);

//     if (error) {
//       return NextResponse.json({ error: error.message }, { status: 500 });
//     }

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log the entire request body
    console.log("=== FULL REQUEST BODY ===");
    console.log(JSON.stringify(body, null, 2));
    
    // Check specifically for admission fields
    console.log("=== ADMISSION FIELDS CHECK ===");
    console.log("admission_id:", body.admission_id);
    console.log("admission_date:", body.admission_date);
    console.log("ward_id:", body.ward_id);
    console.log("bed_id:", body.bed_id);
    
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
      admission_id,
      admission_date,
      ward_id,
      bed_id,
    } = body;

    // Build the order data
    const orderData: any = {
      order_id,
      patient_id,
      patient_name,
      visit_type: visit_type || "OP",
      visit_id: visit_id || `OP-${Date.now()}`,
      tests,
      total_amount,
      status: status || "Ordered",
      order_date: order_date || new Date().toISOString().split("T")[0],
      billing_entry_id: billing_entry_id || `BILL-${Date.now()}`,
    };

    // Add admission fields if they exist and have values
    if (admission_id && admission_id !== null && admission_id !== "") {
      orderData.admission_id = String(admission_id);
      console.log("✅ Added admission_id:", orderData.admission_id);
    }
    
    if (admission_date && admission_date !== null && admission_date !== "") {
      orderData.admission_date = admission_date;
      console.log("✅ Added admission_date:", orderData.admission_date);
    }
    
    if (ward_id && ward_id !== null && ward_id !== "") {
      orderData.ward_id = Number(ward_id);
      console.log("✅ Added ward_id:", orderData.ward_id);
    }
    
    if (bed_id && bed_id !== null && bed_id !== "") {
      orderData.bed_id = Number(bed_id);
      console.log("✅ Added bed_id:", orderData.bed_id);
    }

    console.log("=== FINAL ORDER DATA FOR SUPABASE ===");
    console.log(JSON.stringify(orderData, null, 2));

    const { data, error } = await supabase
      .from("lab_orders")
      .insert([orderData])
      .select();

    if (error) {
      console.error("❌ Supabase insert error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    console.log("✅ Order created. Saved data:", data[0]);
    return NextResponse.json({ success: true, data: data[0] }, { status: 201 });
  } catch (error) {
    console.error("❌ API POST error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}