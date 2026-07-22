import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authErrorResponse, requireRole } from '@/lib/auth/guards';

export async function GET(req: NextRequest) {
  try {
    requireRole(req, ['patient','doctor']);

    const url = new URL(req.url);
    const patientId = url.searchParams.get('patientId');

    if (!patientId) {
      return NextResponse.json(
        { success: false, message: 'patientId is required' },
        { status: 400 }
      );
    }

    // 1. Fetch patient details
    const patientResult = await query(
      `SELECT 
         patient_id,
         full_name_en,
         full_name_hi,
         dob,
         gender,
         address,
         city,
         state,
         country,
         pincode,
         phone,
         email,
         blood_group,
         registration_step,
         created_at,
         updated_at,
         added_by_doctor_id
       FROM patients
       WHERE patient_id = $1`,
      [patientId]
    );

    if (patientResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Patient not found' },
        { status: 404 }
      );
    }

    const patient = patientResult.rows[0];

    // 2. Fetch active admission (if any)
    const admissionResult = await query(
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

    const isAdmitted = admissionResult.rows.length > 0;
    const admission = isAdmitted ? admissionResult.rows[0] : null;

    return NextResponse.json({
      success: true,
      data: {
        patient: {
          patientId: patient.patient_id,
          fullNameEn: patient.full_name_en,
          fullNameHi: patient.full_name_hi,
          dob: patient.dob,
          gender: patient.gender,
          address: patient.address,
          city: patient.city,
          state: patient.state,
          country: patient.country,
          pincode: patient.pincode,
          phone: patient.phone,
          email: patient.email,
          bloodGroup: patient.blood_group,
          registrationStep: patient.registration_step,
          addedByDoctorId: patient.added_by_doctor_id,
          createdAt: patient.created_at,
          updatedAt: patient.updated_at,
        },
        isAdmitted,
        admission: admission
          ? {
              id: admission.id,
              admissionDate: admission.admission_date,
              wardId: admission.ward_id,
              bedId: admission.bed_id,
              reason: admission.reason,
              diagnosis: admission.diagnosis,
              status: admission.status,
            }
          : null,
      },
    });
  } catch (error: any) {
    console.error('Error fetching patient/admission status:', error);
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;

    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}