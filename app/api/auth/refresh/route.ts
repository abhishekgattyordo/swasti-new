import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";
import { query, transaction } from "@/lib/db";
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_TTL_SECONDS,
  RefreshTokenPayload,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "@/lib/auth/jwt";

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

async function ensureRefreshTokensTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS auth_refresh_tokens (
      id UUID PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      revoked_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await query(`CREATE INDEX IF NOT EXISTS idx_auth_refresh_tokens_user_id ON auth_refresh_tokens(user_id)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_auth_refresh_tokens_expires_at ON auth_refresh_tokens(expires_at)`);
}

function setTokenCookies(response: NextResponse, accessToken: string, refreshToken: string) {
  const isProd = process.env.NODE_ENV === "production";
  response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_TOKEN_TTL_SECONDS,
  });
  response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_TOKEN_TTL_SECONDS,
  });
}

export async function POST(req: NextRequest) {
  try {
    await ensureRefreshTokensTable();
    const body = await req.json().catch(() => ({}));
    const incomingToken =
      (typeof body.refreshToken === "string" ? body.refreshToken : "") ||
      req.cookies.get(REFRESH_TOKEN_COOKIE)?.value ||
      "";

    if (!incomingToken) {
      return NextResponse.json({ success: false, message: "Refresh token required" }, { status: 400 });
    }

    let decoded: RefreshTokenPayload;
    try {
      decoded = verifyRefreshToken(incomingToken);
    } catch {
      return NextResponse.json({ success: false, message: "Invalid refresh token" }, { status: 401 });
    }

    if (decoded.type !== "refresh" || !decoded.userId || !decoded.tokenId) {
      return NextResponse.json({ success: false, message: "Invalid refresh token payload" }, { status: 401 });
    }

    const tokenHash = sha256(incomingToken);
    const tokenRow = await query(
      `
      SELECT id, user_id, expires_at, revoked_at
      FROM auth_refresh_tokens
      WHERE token_hash = $1
      LIMIT 1
      `,
      [tokenHash]
    );

    if (tokenRow.rows.length === 0) {
      return NextResponse.json({ success: false, message: "Refresh token not recognized" }, { status: 401 });
    }

    const row = tokenRow.rows[0];
    if (row.revoked_at || new Date(row.expires_at) <= new Date()) {
      return NextResponse.json({ success: false, message: "Refresh token expired or revoked" }, { status: 401 });
    }

    const userResult = await query(
      `SELECT id, email, role, doctor_id, patient_id FROM users WHERE id = $1 LIMIT 1`,
      [row.user_id]
    );
    if (userResult.rows.length === 0) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const user = userResult.rows[0];
    const newTokenId = randomBytes(16).toString("hex");
    const newRefreshToken = signRefreshToken(user.id, newTokenId);
    const newRefreshHash = sha256(newRefreshToken);
    const newAccessToken = signAccessToken(user);
    const newExpiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000);

    await transaction(async (client) => {
      await client.query(`UPDATE auth_refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1`, [tokenHash]);
      await client.query(
        `
        INSERT INTO auth_refresh_tokens (id, user_id, token_hash, expires_at)
        VALUES ($1::uuid, $2, $3, $4)
        `,
        [newTokenId, user.id, newRefreshHash, newExpiresAt]
      );
    });

    const response = NextResponse.json({
      success: true,
      accessToken: newAccessToken,
      tokenType: "Bearer",
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    });
    setTokenCookies(response, newAccessToken, newRefreshToken);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
