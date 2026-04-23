import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authErrorResponse,requireRole } from '@/lib/auth/guards';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireRole(req, ['doctor','helpdesk','admin']);
    const { id } = await params;
    const doctorId = parseInt(id);

    if (isNaN(doctorId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid doctor ID' },
        { status: 400 }
      );
    }

    const result = await query(
      `SELECT 
        id,
        doctor_id as "doctorId",
        day_of_week as "dayOfWeek",
        start_time as "startTime",
        end_time as "endTime",
        slot_duration_minutes as "duration"
      FROM doctor_availability
      WHERE doctor_id = $1
      ORDER BY day_of_week, start_time`,
      [doctorId]
    );

    return NextResponse.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Error fetching availability:', error);
      const authResponse=authErrorResponse(error);

if(authResponse){
  return authResponse
}
    return NextResponse.json(
      { success: false, message: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
         requireRole(req, ['helpdesk']);
    const { id } = await params;
    const doctorId = parseInt(id);
    const body = await req.json();
    const { slots } = body;

    if (isNaN(doctorId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid doctor ID' },
        { status: 400 }
      );
    }

    // Start a transaction
    await query('BEGIN');

    try {
      // Delete existing availability
      await query(
        'DELETE FROM doctor_availability WHERE doctor_id = $1',
        [doctorId]
      );

      // Insert new slots
      for (const slot of slots) {
        await query(
          `INSERT INTO doctor_availability 
           (doctor_id, day_of_week, start_time, end_time, slot_duration_minutes)
           VALUES ($1, $2, $3, $4, $5)`,
          [doctorId, slot.dayOfWeek, slot.startTime, slot.endTime, slot.duration]
        );
      }

      await query('COMMIT');

      return NextResponse.json({
        success: true,
        message: 'Availability updated successfully'
      });

    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Error saving availability:', error);
      const authResponse=authErrorResponse(error);

if(authResponse){
  return authResponse
}
    return NextResponse.json(
      { success: false, message: 'Failed to save availability' },
      { status: 500 }
    );
  }
}