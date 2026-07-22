


import { NextRequest, NextResponse } from 'next/server';
import { getAuditLogs } from '@/lib/surgery-db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const logs = await getAuditLogs();
    return NextResponse.json(logs);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch database audit logs.' }, { status: 500 });
  }
}
