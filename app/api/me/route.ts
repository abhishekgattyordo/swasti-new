import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { query } from "@/lib/db";

export async function GET(req: Request) {
  try {
    // 1. Get token from Authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];

    // 2. Verify token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET is not set");
      return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      console.error("Token verification failed:", err);
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    // 3. Extract user id from decoded token
    const userId = decoded.id; // or decoded.user_id, depending on your payload
    if (!userId) {
      console.error("Token missing user id");
      return NextResponse.json({ success: false, message: "Invalid token payload" }, { status: 401 });
    }

    // 4. Query the database – include patient_id
    const result = await query(
      `SELECT id, email, role, doctor_id, patient_id FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const user = result.rows[0];

    // 5. Return the user data (including doctor_id and patient_id)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        doctor_id: user.doctor_id,
        patient_id: user.patient_id,
      },
    });
  } catch (error) {
    console.error("❌ /api/me error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}