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
    const userId = decoded.id;
    if (!userId) {
      console.error("Token missing user id");
      return NextResponse.json({ success: false, message: "Invalid token payload" }, { status: 401 });
    }

    // 4. ✅ Updated query with JOIN to get doctor_id from doctors table
    const result = await query(
      `SELECT 
        u.id,
        u.email,
        u.role,
        u.patient_id,
        d.id AS doctor_id
      FROM users u
      LEFT JOIN doctors d ON u.email = d.email
      WHERE u.id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const user = result.rows[0];

    // 5. Return the user data (including doctor_id from doctors table)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        patient_id: user.patient_id,
        doctor_id: user.doctor_id  // ✅ This will now be 1 (from doctors table)
      },
    });
  } catch (error) {
    console.error("❌ /api/me error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}