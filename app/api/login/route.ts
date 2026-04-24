import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_TTL_SECONDS,
  signAccessToken,
  signRefreshToken,
} from '@/lib/auth/jwt';


function sha256(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
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
  const isProd = process.env.NODE_ENV === 'production';
  response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: ACCESS_TOKEN_TTL_SECONDS,
  });
  response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: REFRESH_TOKEN_TTL_SECONDS,
  });
}

export async function POST(req: NextRequest) {
  try {

    await ensureRefreshTokensTable();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password required' },
        { status: 400 }
      );
    }

    // Find user by email (or patient ID fallback)
    const result = await query(
      `SELECT id, email, full_name_en, role, patient_id, doctor_id, password, is_active
       FROM users 
       WHERE lower(email) = $1 OR patient_id = $2
       LIMIT 1`,
      [email.toLowerCase(), email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = result.rows[0];
    if (user.is_active === false) {
      return NextResponse.json(
        { success: false, message: 'Account is inactive' },
        { status: 403 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT tokens
    const accessToken = signAccessToken(user);
    const refreshTokenId = randomBytes(16).toString('hex');
    const refreshToken = signRefreshToken(user.id, refreshTokenId);
    const refreshHash = sha256(refreshToken);
    const refreshExpiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000);
    await query(
      `
      INSERT INTO auth_refresh_tokens (id, user_id, token_hash, expires_at)
      VALUES ($1::uuid, $2, $3, $4)
      `,
      [refreshTokenId, user.id, refreshHash, refreshExpiresAt]
    );

    // Return user data (without password)
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userWithoutPassword,
      token: accessToken, // backward compatibility
      accessToken,
      tokenType: 'Bearer',
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    });
    setTokenCookies(response, accessToken, refreshToken);
    return response;
  } catch (error: unknown) {
    console.error('Login error:', error);
 
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}