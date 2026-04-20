import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  // Get tenant ID from header
  const tenantId = request.headers.get('X-Tenant-ID');
  
  console.log(`🔍 Check-DB called with tenant: ${tenantId || 'none'}`);
  
  try {
    const result = await query('SELECT current_database() as db_name, current_user as db_user');
    
    return NextResponse.json({
      success: true,
      currentDatabase: result.rows[0].db_name,
      currentUser: result.rows[0].db_user,
      requestedTenant: tenantId || 'default',
      message: `Connected to ${result.rows[0].db_name}`,
      expectedDatabase: tenantId === 'kmc' ? 'ordo_tenant_kmc' : 'ordo-his-dev'
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}