import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authErrorResponse,requireRole } from '@/lib/auth/guards';

export async function GET(req: NextRequest) {
  console.log('📥 GET /api/doctors/specialties - Starting request');
  
  try {
      requireRole(req, ['admin']);
    const { searchParams } = new URL(req.url);
    const department = searchParams.get('department');

    let sql = 'SELECT id, name, description, department FROM specialties';
    const params: any[] = [];

    if (department) {
      sql += ' WHERE department = $1 OR department IS NULL';
      params.push(department);
    }

   sql += ' ORDER BY id';

    const result = await query(sql, params);
    
    console.log(`✅ Found ${result.rows.length} specialties`);
    
    return NextResponse.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Error fetching specialties:', error);
       const authResponse=authErrorResponse(error);

if(authResponse){
  return authResponse
}
    return NextResponse.json(
      { success: false, message: 'Failed to fetch specialties' },
      { status: 500 }
    );
  }
}