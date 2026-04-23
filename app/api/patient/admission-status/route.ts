import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authErrorResponse,requireRole } from '@/lib/auth/guards';

export async function GET(req: NextRequest) {
  try {
       requireRole(req, ['patient']);
    const url = new URL(req.url);
    const patientId = url.searchParams.get('patientId');

    if (!patientId) {
      return NextResponse.json(
        { success: false, message: 'patientId is required' },
        { status: 400 }
      );
    }

    // Query the admissions table for an active admission (status = 'active')
    const result = await query(
      `SELECT 
         id, 
         admission_date, 
         ward_id, 
         bed_id, 
         reason, 
         diagnosis,
         status
       FROM admissions 
       WHERE patient_id = $1 AND status = 'active'
       ORDER BY admission_date DESC
       LIMIT 1`,
      [patientId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          isAdmitted: false,
          admission: null,
        },
      });
    }

    const admission = result.rows[0];

    return NextResponse.json({
      success: true,
      data: {
        isAdmitted: true,
        admission: {
          id: admission.id,
          admissionDate: admission.admission_date,
          wardId: admission.ward_id,
          bedId: admission.bed_id,
          reason: admission.reason,
          diagnosis: admission.diagnosis,
          status: admission.status,
        },
      },
    });
  } catch (error: any) {
    console.error('Error checking admission status:', error);
        const authResponse=authErrorResponse(error);
if(authResponse){
  return authResponse
}
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}