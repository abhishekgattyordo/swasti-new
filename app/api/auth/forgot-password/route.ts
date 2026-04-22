import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/api/email';
import { createHash, createHmac, randomBytes } from 'crypto';

function hashPasswordResetToken(token: string): string {
  const secret = process.env.INVITE_TOKEN_SECRET?.trim();
  if (secret) {
    return createHmac("sha256", secret).update(token, "utf8").digest("hex");
  }
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const userResult = await query(
      'SELECT id, full_name_en FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      // For security, don't reveal that email doesn't exist
      return NextResponse.json(
        { success: true, message: 'If that email is registered, you will receive a reset link.' },
        { status: 200 }
      );
    }

    const user = userResult.rows[0];

    // Generate a unique token
    const token = randomBytes(32).toString('hex');
    const tokenHash = hashPasswordResetToken(token);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    // Store token in password_resets table
    await query(
      `INSERT INTO password_resets (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, tokenHash, expiresAt]
    );
const baseURL = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_API_URL;
    // Create reset link (adjust domain as needed)
   const resetLink = `${baseURL}/reset-password?token=${token}`;
    await sendPasswordResetEmail(email, resetLink, user.full_name_en);

    return NextResponse.json({
      success: true,
      message: 'If that email is registered, you will receive a reset link.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}