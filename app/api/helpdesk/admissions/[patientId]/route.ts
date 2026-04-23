import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authErrorResponse,requireRole } from '@/lib/auth/guards';





// ✅ Keep ONLY this GET handler (with Promise params)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
         requireRole(req, ['helpdesk','admin']);
    const { patientId } = await params;

    const result = await query(
      `SELECT 
        patient_id, full_name_en, full_name_hi, dob, gender, 
        phone, email, address, city, state, pincode, blood_group,
        registration_step, created_at
       FROM patients 
       WHERE patient_id = $1`,
      [patientId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Patient not found' },
        { status: 404 }
      );
    }

    const emergency = await query(
      `SELECT name, relation, phone FROM emergency_contacts WHERE patient_id = $1`,
      [patientId]
    );

    return NextResponse.json({
      success: true,
      data: {
        ...result.rows[0],
        emergencyContact: emergency.rows[0] || null,
      },
    });
  } catch (error: any) {
    console.error('Fetch patient error:', error);
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