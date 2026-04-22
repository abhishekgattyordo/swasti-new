import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { createHash, createHmac } from 'crypto';

function hashPasswordResetToken(token: string): string {
  const secret = process.env.INVITE_TOKEN_SECRET?.trim();
  if (secret) {
    return createHmac("sha256", secret).update(token, "utf8").digest("hex");
  }
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Token and new password are required' },
        { status: 400 }
      );
    }

    const tokenHash = hashPasswordResetToken(token);

    // Validate token
    const tokenResult = await query(
      `SELECT id, user_id, expires_at, used_at
       FROM password_resets
       WHERE token = $1 AND (used_at IS NULL)`,
      [tokenHash]
    );

    if (tokenResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    const reset = tokenResult.rows[0];
    const now = new Date();

    if (new Date(reset.expires_at) < now) {
      return NextResponse.json(
        { success: false, message: 'Token has expired' },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and mark token as used in a transaction
    await transaction(async (client) => {
      await client.query(
        'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
        [hashedPassword, reset.user_id]
      );
      await client.query(
        'UPDATE password_resets SET used_at = NOW() WHERE id = $1',
        [reset.id]
      );
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}