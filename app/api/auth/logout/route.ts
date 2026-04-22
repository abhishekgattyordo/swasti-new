import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { query } from "@/lib/db";

const ACCESS_TOKEN_COOKIE = "his_access_token";
const REFRESH_TOKEN_COOKIE = "his_refresh_token";

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const refreshToken =
      (typeof body.refreshToken === "string" ? body.refreshToken : "") ||
      req.cookies.get(REFRESH_TOKEN_COOKIE)?.value ||
      "";

    if (refreshToken) {
      const tokenHash = sha256(refreshToken);
      await query(`UPDATE auth_refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1`, [tokenHash]);
    }

    const response = NextResponse.json({ success: true, message: "Logged out" });
    response.cookies.set(ACCESS_TOKEN_COOKIE, "", { path: "/", maxAge: 0 });
    response.cookies.set(REFRESH_TOKEN_COOKIE, "", { path: "/", maxAge: 0 });
    return response;
  } catch {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
