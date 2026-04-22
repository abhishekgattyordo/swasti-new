import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { authErrorResponse, requireAuth } from "@/lib/auth/guards";

export async function GET(req: Request) {
  try {
    const { userId } = requireAuth(req);

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
    const authResponse = authErrorResponse(error);
    if (authResponse) {
      return authResponse;
    }
    console.error("❌ /api/me error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}