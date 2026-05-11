import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const patientId = searchParams.get('patientId');

    if (!patientId) {
      return NextResponse.json(
        { success: false, message: 'Patient ID is required' },
        { status: 400 }
      );
    }

    // Query for pending tasks from nurse_tasks table for specific patient
    const tasksQuery = `
      SELECT 
        id, 
        'task' as type, 
        task_type as category, 
        title as name,
        description,
        priority,
        status,
        due_date,
        due_time,
        assigned_to,
        assigned_by,
        notes,
        created_at,
        patient_id,
        CASE 
          WHEN due_date < CURRENT_DATE AND status IN ('pending', 'in-progress') THEN 'overdue'
          ELSE status
        END as current_status
      FROM nurse_tasks
      WHERE patient_id = $1 AND status IN ('pending', 'in-progress')
      ORDER BY due_date ASC, due_time ASC
    `;
    
    // Query for pending medications from medication_administrations table for specific patient
    const medsQuery = `
      SELECT 
        id, 
        'medication' as type, 
        'medication' as category, 
        medication_name as name,
        CONCAT(dosage, ' ', route) as description,
        'medium' as priority,
        status,
        CURRENT_DATE as due_date,
        scheduled_time as due_time,
        prescribed_by as assigned_by,
        prescribed_by as assigned_to,
        notes,
        created_at,
        patient_id,
        CASE 
          WHEN scheduled_time < CURRENT_TIME AND status = 'pending' THEN 'overdue'
          ELSE status
        END as current_status
      FROM medication_administrations
      WHERE patient_id = $1 AND status = 'pending'
      ORDER BY scheduled_time ASC
    `;

    // Execute both queries
    const tasksResult = await query(tasksQuery, [patientId]);
    const medsResult = await query(medsQuery, [patientId]);

    const pendingTasks = tasksResult.rows || [];
    const pendingMeds = medsResult.rows || [];
    const allPending = [...pendingTasks, ...pendingMeds];
    
    // Sort by due date
    allPending.sort((a, b) => {
      if (a.due_date < b.due_date) return -1;
      if (a.due_date > b.due_date) return 1;
      return 0;
    });

    const overdueItems = allPending.filter((item: any) => item.current_status === 'overdue');
    
    const priorityCount = {
      high: pendingTasks.filter((t: any) => t.priority === 'high').length,
      medium: pendingTasks.filter((t: any) => t.priority === 'medium').length + pendingMeds.length,
      low: pendingTasks.filter((t: any) => t.priority === 'low').length,
    };

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          total_pending: allPending.length,
          pending_tasks: pendingTasks.length,
          pending_medications: pendingMeds.length,
          overdue: overdueItems.length,
          priority: priorityCount,
        },
        pending_items: allPending,
        overdue_items: overdueItems,
        patient_id: patientId,
      }
    });

  } catch (error) {
    console.error('Error fetching pending items:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}