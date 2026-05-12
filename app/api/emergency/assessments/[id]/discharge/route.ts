// app/api/emergency/assessments/[id]/discharge/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params to get the id
    const { id: assessmentId } = await params;
    const body = await request.json();
    
    const {
      dischargeDate,
      dischargeTime,
      dischargeReason,
      dischargeNotes,
      dischargeType
    } = body;

    if (!dischargeReason) {
      return NextResponse.json(
        { success: false, message: 'Discharge reason is required' },
        { status: 400 }
      );
    }

    // Combine date and time
    const dischargeDateTime = new Date(`${dischargeDate}T${dischargeTime}`);

    // Prepare discharge details as JSON
    const dischargeDetails = {
      dischargeDate,
      dischargeTime,
      dischargeReason,
      dischargeNotes: dischargeNotes || '',
      dischargeType,
      dischargedAt: dischargeDateTime.toISOString()
    };

    // Update the assessment with discharge details
    const result = await query(
      `UPDATE emergency_assessments 
       SET 
         status = 'Completed',
         completed_at = $1,
         discharge_details = $2,
         discharge_status = $3,
         discharged_by = $4,
         updated_at = NOW()
       WHERE assessment_id = $5
       RETURNING assessment_id, status`,
      [
        dischargeDateTime.toISOString(),
        JSON.stringify(dischargeDetails),
        dischargeType,
        'System',
        assessmentId
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Assessment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Patient discharged successfully',
      data: {
        assessment_id: result.rows[0].assessment_id,
        status: result.rows[0].status,
        dischargeDetails: body
      }
    });

  } catch (error) {
    console.error('Error processing discharge:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process discharge' },
      { status: 500 }
    );
  }
}

// GET discharge details for an assessment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params to get the id
    const { id: assessmentId } = await params;

    const result = await query(
      `SELECT 
        assessment_id,
        status,
        completed_at as "completedAt",
        discharge_details as "dischargeDetails",
        discharge_status as "dischargeStatus",
        discharged_by as "dischargedBy"
       FROM emergency_assessments 
       WHERE assessment_id = $1`,
      [assessmentId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Assessment not found' },
        { status: 404 }
      );
    }

    const assessment = result.rows[0];
    let dischargeDetails = null;
    
    if (assessment.dischargeDetails) {
      dischargeDetails = typeof assessment.dischargeDetails === 'string'
        ? JSON.parse(assessment.dischargeDetails)
        : assessment.dischargeDetails;
    }

    return NextResponse.json({
      success: true,
      data: {
        assessmentId: assessment.assessment_id,
        status: assessment.status,
        completedAt: assessment.completedAt,
        dischargeDetails,
        dischargeStatus: assessment.dischargeStatus,
        dischargedBy: assessment.dischargedBy
      }
    });

  } catch (error) {
    console.error('Error fetching discharge details:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch discharge details' },
      { status: 500 }
    );
  }
}