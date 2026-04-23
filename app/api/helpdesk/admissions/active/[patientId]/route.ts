import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authErrorResponse,requireRole } from '@/lib/auth/guards';

export async function GET(req: NextRequest) {
  try {
    // Extract patientId from URL path or query parameter
        requireRole(req, ['helpdesk','admin']);
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    let patientId = pathParts[pathParts.length - 1];
    
    if (!patientId || patientId === 'active') {
      patientId = url.searchParams.get('patientId') || '';
    }

    console.log('Extracted patientId:', patientId);

    if (!patientId) {
      return NextResponse.json(
        { success: false, message: 'Patient ID is required' },
        { status: 400 }
      );
    }

    // Include admission_date in the SELECT
    const result = await query(
      `SELECT 
        a.id as admission_id,
        a.admission_date,
        w.name as ward_name,
        b.bed_number
       FROM admissions a
       LEFT JOIN wards w ON a.ward_id = w.id
       LEFT JOIN beds b ON a.bed_id = b.id
       WHERE a.patient_id = $1 AND a.status = $2
       ORDER BY a.admission_date DESC
       LIMIT 1`,
      [patientId, 'active']
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No active admission found' },
        { status: 404 }
      );
    }

    // Return the row as-is; date will be in ISO format
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error('API error:', error);
      const authResponse=authErrorResponse(error);
if(authResponse){
  return authResponse
}
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}