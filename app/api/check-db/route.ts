import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { headers } from 'next/headers';

export async function GET() {
  try {
    const headersList = await headers();
    const host = headersList.get('host');

    const result = await query(`
      SELECT 
        current_database() as db_name, 
        current_user as db_user, 
        NOW() as server_time
    `);

    return NextResponse.json({
      success: true,

      // 🔍 DEBUG INFO
      host: host,
      database: result.rows[0].db_name,
      user: result.rows[0].db_user,
      serverTime: result.rows[0].server_time,

      // ✅ Helpful message
      message: `Connected to DB: ${result.rows[0].db_name} for host: ${host}`
    });

  } catch (error) {
    console.error('❌ Debug DB error:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Connection failed',
    }, { status: 500 });
  }
}