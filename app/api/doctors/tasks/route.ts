// app/api/doctor/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Fetch tasks for a patient
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const patientId = searchParams.get('patientId');
    const status = searchParams.get('status');
    const assignedTo = searchParams.get('assignedTo');

    if (!patientId) {
      return NextResponse.json(
        { success: false, message: 'Patient ID is required' },
        { status: 400 }
      );
    }

    let sql = `
      SELECT * FROM nurse_tasks 
      WHERE patient_id = $1
    `;
    const params: any[] = [patientId];
    let paramIndex = 2;

    if (status && status !== 'all') {
      sql += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    if (assignedTo) {
      sql += ` AND assigned_to ILIKE $${paramIndex++}`;
      params.push(`%${assignedTo}%`);
    }

    sql += ` ORDER BY 
      CASE status 
        WHEN 'pending' THEN 1 
        WHEN 'in-progress' THEN 2 
        WHEN 'overdue' THEN 3 
        ELSE 4 
      END,
      due_date ASC, due_time ASC`;

    const result = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });

  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST - Create new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      patientId,
      taskType,
      title,
      description,
      priority,
      dueDate,
      dueTime,
      assignedTo,
      assignedBy,
      notes,
    } = body;

    if (!patientId || !title || !dueDate || !dueTime || !assignedTo) {
      return NextResponse.json(
        { success: false, message: 'Required fields are missing' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO nurse_tasks (
        patient_id, task_type, title, description, priority,
        due_date, due_time, assigned_to, assigned_by, notes, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending', NOW())
      RETURNING *`,
      [
        patientId,
        taskType === 'other' ? body.customTaskType || 'other' : taskType,
        title,
        description || null,
        priority || 'medium',
        dueDate,
        dueTime,
        assignedTo,
        assignedBy || null,
        notes || null,
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Task created successfully',
      data: result.rows[0],
    });

  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create task' },
      { status: 500 }
    );
  }
}

// PUT - Update task (complete, add result)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, result, completedBy, notes } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Task ID is required' },
        { status: 400 }
      );
    }

    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    if (status) {
      updateFields.push(`status = $${paramIndex++}`);
      updateValues.push(status);
    }

    if (result) {
      updateFields.push(`result = $${paramIndex++}`);
      updateValues.push(result);
    }

    if (completedBy) {
      updateFields.push(`completed_by = $${paramIndex++}`);
      updateValues.push(completedBy);
    }

    if (status === 'completed') {
      updateFields.push(`completed_at = NOW()`);
    }

    if (notes) {
      updateFields.push(`notes = $${paramIndex++}`);
      updateValues.push(notes);
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No fields to update' },
        { status: 400 }
      );
    }

    updateFields.push(`updated_at = NOW()`);
    updateValues.push(parseInt(id));

    const result_query = await query(
      `UPDATE nurse_tasks SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      updateValues
    );

    return NextResponse.json({
      success: true,
      message: 'Task updated successfully',
      data: result_query.rows[0],
    });

  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE - Delete task
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Task ID is required' },
        { status: 400 }
      );
    }

    await query('DELETE FROM nurse_tasks WHERE id = $1', [parseInt(id)]);

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete task' },
      { status: 500 }
    );
  }
}