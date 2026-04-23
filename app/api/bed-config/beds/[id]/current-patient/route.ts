import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authErrorResponse,requireRole } from '@/lib/auth/guards';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: bedId } = await params;

  const bedIdNum = parseInt(bedId);
  if (isNaN(bedIdNum)) {
    return NextResponse.json(
      { success: false, message: "Invalid bed ID" },
      { status: 400 }
    );
  }

  try {
        requireRole(req, ['admin','helpdesk']);
    const result = await query(
      `SELECT 
         p.full_name_en,
         p.patient_id,
         p.gender,
         p.dob,
         p.phone,
         a.id AS admission_id,
         a.admission_date,
         a.diagnosis
       FROM admissions a
       INNER JOIN patients p ON a.patient_id = p.patient_id
       WHERE a.bed_id = $1 AND a.status = 'active'
       LIMIT 1`,
      [bedIdNum]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "No active patient on this bed" },
        { status: 404 }
      );
    }

    const row = result.rows[0];
    let age = null;
    if (row.dob) {
      const today = new Date();
      const birthDate = new Date(row.dob);
      let ageYears = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        ageYears--;
      }
      age = ageYears;
    }

    return NextResponse.json({
      success: true,
      data: {
        full_name_en: row.full_name_en,
        patient_id: row.patient_id,
        gender: row.gender || 'Unknown',
        phone: row.phone || '',
        age: age,
        admission_id: row.admission_id,
        admission_date: row.admission_date,
        diagnosis: row.diagnosis,
      }
    });
  } catch (error: any) {
    console.error("Database error:", error);
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