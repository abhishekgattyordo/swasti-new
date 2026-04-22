import { NextRequest, NextResponse } from "next/server";
import { createHash, createHmac } from "crypto";
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { requireTenant } from "@/lib/tenant";

const BCRYPT_ROUNDS = 12;
const MIN_PASSWORD_LENGTH = 8;

function hashInviteToken(token: string): string {
  const secret = process.env.INVITE_TOKEN_SECRET?.trim();
  if (secret) {
    return createHmac("sha256", secret).update(token, "utf8").digest("hex");
  }
  return createHash("sha256").update(token, "utf8").digest("hex");
}

async function hasUsersColumn(
  client: import("pg").PoolClient,
  columnName: string,
  schemaName?: string | null
): Promise<boolean> {
  const schemaCandidates = schemaName ? [schemaName, "public"] : ["public"];
  const result = await client.query<{ exists: boolean }>(
    `
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users'
          AND column_name = $2
          AND table_schema = ANY($1::text[])
      ) AS exists
    `,
    [schemaCandidates, columnName]
  );
  return Boolean(result.rows[0]?.exists);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const token = typeof body.token === "string" ? body.token.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !token || !password) {
      return NextResponse.json(
        { success: false, message: "email, token, and password are required" },
        { status: 400 }
      );
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { success: false, message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` },
        { status: 400 }
      );
    }

    const tenantContext = await requireTenant();
    const pool = new Pool({
      connectionString: tenantContext.tenant.databaseUrl,
      connectionTimeoutMillis: 10000,
    });

    try {
      const client = await pool.connect();
      try {
        await client.query("SET statement_timeout = 15000");
        if (tenantContext.tenant.schemaName) {
          await client.query(
            `SET search_path = "${tenantContext.tenant.schemaName.replace(/"/g, '""')}", public`
          );
        }

        const tokenHash = hashInviteToken(token);
        const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
        const hasPasswordHash = await hasUsersColumn(
          client,
          "password_hash",
          tenantContext.tenant.schemaName
        );
        const passwordColumn = hasPasswordHash ? "password_hash" : "password";

        const result = await client.query<{ id: string }>(
          `
            UPDATE users
            SET
              ${passwordColumn} = $1,
              password_reset_token = NULL,
              password_reset_expires = NULL,
              password_changed_at = NOW(),
              failed_login_attempts = 0,
              locked_until = NULL,
              updated_at = NOW()
            WHERE email = $2
              AND role = 'ADMIN'
              AND password_reset_token = $3
              AND password_reset_expires IS NOT NULL
              AND password_reset_expires > NOW()
            RETURNING id
          `,
          [passwordHash, email, tokenHash]
        );

        if (result.rows.length === 0) {
          return NextResponse.json(
            { success: false, message: "Invalid or expired setup link" },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "Password set successfully. You can now log in.",
        });
      } finally {
        client.release();
      }
    } finally {
      await pool.end();
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { success: false, message: `Failed to set password: ${message}` },
      { status: 500 }
    );
  }
}
