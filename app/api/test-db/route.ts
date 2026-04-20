// import { NextResponse } from 'next/server';
// import { supabaseAdmin } from '@/lib/supabaseServer';

// export async function GET() {
//   try {
//     const { data, error } = await supabaseAdmin.auth.admin.listUsers();
//     if (error) {
//       return NextResponse.json({ error: error.message }, { status: 500 });
//     }
//     return NextResponse.json({ success: true, userCount: data.users.length });
//   } catch (err) {
//     return NextResponse.json({ error: 'Network error', details: String(err) }, { status: 500 });
//   }
// }
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  const start = Date.now();
  
  try {
    // Test basic connection
    const result = await query('SELECT NOW() as server_time, current_database() as db_name, version() as pg_version');
    
    const duration = Date.now() - start;
    
    return NextResponse.json({
      success: true,
      message: '✅ Database connected successfully!',
      database: result.rows[0].db_name,
      serverTime: result.rows[0].server_time,
      responseTime: `${duration}ms`,
      postgresVersion: result.rows[0].pg_version?.substring(0, 50),
    });
  } catch (error) {
    const duration = Date.now() - start;
    console.error('Database connection error:', error);
    
    return NextResponse.json({
      success: false,
      message: '❌ Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: `${duration}ms`,
    }, { status: 500 });
  }
}