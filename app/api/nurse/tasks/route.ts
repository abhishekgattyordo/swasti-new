// app/api/nurse/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Fetch nurse tasks with optional filters
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const taskType = url.searchParams.get('taskType');
    const patientId = url.searchParams.get('patientId');
    const status = url.searchParams.get('status') || 'pending';

    let sql = `
      SELECT 
        nt.id,
        nt.patient_id,
        nt.task_type,
        nt.title,
        nt.description,
        nt.priority,
        nt.status,
        nt.due_date,
        nt.due_time,
        nt.assigned_to,
        nt.assigned_by,
        nt.result,
        nt.notes,
        nt.completed_at,
        nt.completed_by,
        nt.created_at,
        nt.updated_at,
        p.full_name_en as patient_name,
        p.patient_id as patient_uhid
      FROM nurse_tasks nt
      LEFT JOIN patients p ON nt.patient_id::TEXT = p.patient_id::TEXT
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (taskType) {
      sql += ` AND nt.task_type = $${paramIndex++}`;
      params.push(taskType);
    }

    if (patientId) {
      sql += ` AND nt.patient_id = $${paramIndex++}`;
      params.push(patientId);
    }

    if (status && status !== 'all') {
      sql += ` AND nt.status = $${paramIndex++}`;
      params.push(status);
    }

    sql += ` ORDER BY nt.created_at DESC`;

    const result = await query(sql, params);
    
    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });

  } catch (error: any) {
    console.error('Error fetching nurse tasks:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Failed to fetch tasks',
        data: []
      },
      { status: 500 }
    );
  }
}

// POST - Create a new nurse task
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      patient_id, 
      task_type, 
      title, 
      description, 
      priority, 
      due_date, 
      due_time, 
      assigned_to, 
      assigned_by, 
      notes,
      custom_task_type 
    } = body;

    // Validate required fields
    if (!patient_id || !title || !due_date || !due_time || !assigned_to) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const finalTaskType = task_type === 'other' ? custom_task_type : task_type;

    const sql = `
      INSERT INTO nurse_tasks (
        patient_id,
        task_type,
        title,
        description,
        priority,
        due_date,
        due_time,
        assigned_to,
        assigned_by,
        notes,
        status,
        custom_task_type
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const result = await query(sql, [
      patient_id,
      finalTaskType,
      title,
      description || '',
      priority || 'medium',
      due_date,
      due_time,
      assigned_to,
      assigned_by || 'System',
      notes || '',
      'pending',
      task_type === 'other' ? custom_task_type : null
    ]);

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Task created successfully'
    });

  } catch (error: any) {
    console.error('Error creating nurse task:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create task' },
      { status: 500 }
    );
  }
}

// PUT - Update a nurse task (complete, update status, etc.)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { taskId, status, result, completedBy } = body;

    if (!taskId) {
      return NextResponse.json(
        { success: false, message: 'Task ID required' },
        { status: 400 }
      );
    }

    let sql = 'UPDATE nurse_tasks SET ';
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      sql += `status = $${paramIndex++}, `;
      params.push(status);
    }

    if (result !== undefined) {
      sql += `result = $${paramIndex++}, `;
      params.push(result);
    }

    if (status === 'completed') {
      sql += `completed_at = NOW(), completed_by = $${paramIndex++}, `;
      params.push(completedBy || 'Nurse');
    }

    // Remove trailing comma and space
    sql = sql.slice(0, -2);
    
    sql += ` WHERE id = $${paramIndex} RETURNING *`;
    params.push(taskId);

    const resultQuery = await query(sql, params);

    if (resultQuery.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: resultQuery.rows[0],
      message: 'Task updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating nurse task:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a nurse task
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const taskId = url.searchParams.get('id');

    if (!taskId) {
      return NextResponse.json(
        { success: false, message: 'Task ID required' },
        { status: 400 }
      );
    }

    await query('DELETE FROM nurse_tasks WHERE id = $1', [taskId]);

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting nurse task:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete task' },
      { status: 500 }
    );
  }
}