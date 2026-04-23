import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { z } from 'zod';
import { authErrorResponse,requireRole } from '@/lib/auth/guards';

const AdmitSchema = z.object({
  patientName: z.string().min(1),
  mrn: z.string().min(1),
  gender: z.enum(['M', 'F']).optional(),
  age: z.number().int().positive().optional(),
  diagnosis: z.string().optional(),
  estimatedDischarge: z.string().optional(),
  contact: z.string().optional(),
  specialRequirements: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('📥 POST /api/bed-config/beds/[id]/admit - Starting request');
  
  try {
    const { id } = await params;
    console.log('📦 Bed ID from params:', id);
    
    const bedId = parseInt(id);
        requireRole(req, ['admin','helpdesk']);
    console.log('🔢 Parsed bed ID:', bedId, 'Type:', typeof bedId);
    
    if (isNaN(bedId)) {
      console.log('❌ Invalid bed ID - not a number');
      return NextResponse.json(
        { success: false, message: 'Invalid bed ID' },
        { status: 400 }
      );
    }

    const body = await req.json();
    console.log('📦 Request body:', JSON.stringify(body, null, 2));

    const validation = AdmitSchema.safeParse(body);
    console.log('✅ Validation result:', validation.success);

    if (!validation.success) {
      console.log('❌ Validation failed:', validation.error.flatten().fieldErrors);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed', 
          errors: validation.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const data = validation.data;
    console.log('📝 Validated data:', data);

    // Step 1: Check if bed exists
    console.log('🔍 Step 1: Checking if bed exists with ID:', bedId);
    const bedCheck = await query(
      'SELECT id, status, ward_id, attributes FROM beds WHERE id = $1',
      [bedId]
    );
    console.log('📊 Bed check result rows:', bedCheck.rows.length);

    if (bedCheck.rows.length === 0) {
      console.log('❌ Bed not found with ID:', bedId);
      return NextResponse.json(
        { success: false, message: `Bed with ID ${bedId} not found` },
        { status: 404 }
      );
    }

    const bed = bedCheck.rows[0];
    console.log('✅ Bed found:', bed);

    // Step 2: Check if bed is available
    console.log('🔍 Step 2: Checking bed status:', bed.status);
    if (bed.status !== 'available') {
      console.log('❌ Bed is not available. Current status:', bed.status);
      return NextResponse.json(
        { 
          success: false, 
          message: `Bed is not available for admission. Current status: ${bed.status}` 
        },
        { status: 400 }
      );
    }
    console.log('✅ Bed is available');

    // Step 3: Since patients table uses patient_id (bigint) and is for registration,
    // we'll store patient data in the bed's attributes JSONB field
    console.log('🔍 Step 3: Preparing patient data for bed attributes');
    
    // Generate a unique patient ID for this admission
    const admissionPatientId = `ADM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Prepare patient data to store in attributes
    const patientData = {
      id: admissionPatientId,
      name: data.patientName,
      mrn: data.mrn,
      gender: data.gender || 'M',
      age: data.age || null,
      contact: data.contact || null,
      specialRequirements: data.specialRequirements || null,
      admissionDate: new Date().toISOString().split('T')[0],
      diagnosis: data.diagnosis || 'Pending evaluation',
      estimatedDischarge: data.estimatedDischarge || 
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };

    console.log('Patient data to store:', patientData);

    // Step 4: Get current attributes or create new
    const currentAttributes = bed.attributes || {};
    const updatedAttributes = {
      ...currentAttributes,
      currentPatient: patientData,
      patientHistory: [
        ...(currentAttributes.patientHistory || []),
        {
          patientId: admissionPatientId,
          name: data.patientName,
          mrn: data.mrn,
          admissionDate: new Date().toISOString().split('T')[0],
          dischargeDate: null
        }
      ]
    };

    console.log('🔍 Step 4: Updating bed with patient information');

    const updateResult = await query(
      `UPDATE beds 
       SET status = 'occupied',
           attributes = $1::jsonb,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [JSON.stringify(updatedAttributes), bedId]
    );

    console.log('📊 Update result rows:', updateResult.rows.length);
    if (updateResult.rows.length > 0) {
      console.log('✅ Bed updated successfully:', updateResult.rows[0]);
    }

    return NextResponse.json({
      success: true,
      message: 'Patient admitted successfully',
      data: {
        bed: updateResult.rows[0],
        patient: patientData
      }
    });

  } catch (error: any) {
    console.error('❌ Error admitting patient:');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error detail:', error.detail);
    console.error('Error stack:', error.stack);
        const authResponse=authErrorResponse(error);

if(authResponse){
  return authResponse
}
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to admit patient',
        error: error.message 
      },
      { status: 500 }
    );
  }
}