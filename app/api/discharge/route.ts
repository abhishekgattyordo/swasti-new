import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authErrorResponse,requireRole } from '@/lib/auth/guards';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const admissionId = url.searchParams.get('admissionId');

  if (!admissionId) {
    return NextResponse.json({ success: false, message: 'Admission ID required' }, { status: 400 });
  }

  try {
           requireRole(req, ['admin','helpdesk']);
    const result = await query(
      `SELECT discharge_id, status FROM admissions WHERE id = $1`,
      [admissionId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Admission not found' }, { status: 404 });
    }

    const { discharge_id, status } = result.rows[0];
    return NextResponse.json({
      success: true,
      data: {
        dischargeId: discharge_id || null,
        isDischarged: status === 'discharged'
      }
    });
  } catch (error: any) {
    console.error('Discharge fetch error:', error);
        const authResponse=authErrorResponse(error);

if(authResponse){
  return authResponse
}
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}