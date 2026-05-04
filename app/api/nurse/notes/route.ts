// app/api/nurse/notes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// ============================================
// GET - Fetch nursing notes for a patient
// ============================================
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const patientId = searchParams.get('patientId');
    const noteType = searchParams.get('noteType');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');

    if (!patientId) {
      return NextResponse.json(
        { success: false, message: 'Patient ID is required' },
        { status: 400 }
      );
    }

    let queryText = `
      SELECT 
        nn.id,
        nn.patient_id,
        nn.patient_name,
        nn.bed,
        nn.note_type,
        nn.title,
        nn.content,
        nn.priority,
        nn.tags,
        nn.assessment_findings,
        nn.interventions,
        nn.patient_response,
        nn.follow_up_required,
        nn.created_by,
        nn.created_at,
        nn.updated_at
      FROM nursing_notes nn
      WHERE nn.patient_id = $1
    `;
    
    const params: any[] = [patientId];
    let paramIndex = 2;

    if (noteType && noteType !== 'all') {
      queryText += ` AND nn.note_type = $${paramIndex}`;
      params.push(noteType);
      paramIndex++;
    }

    if (priority && priority !== 'all') {
      queryText += ` AND nn.priority = $${paramIndex}`;
      params.push(priority);
      paramIndex++;
    }

    if (search) {
      queryText += ` AND (nn.title ILIKE $${paramIndex} OR nn.content ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    queryText += ` ORDER BY nn.created_at DESC`;

    console.log('Fetching notes with params:', { patientId, noteType, priority, search });

    const result = await query(queryText, params);

    console.log('Notes found:', result.rows.length);

    const notes = result.rows.map((row: any) => ({
      id: row.id.toString(),
      patientId: row.patient_id,
      patientName: row.patient_name || 'Unknown',
      bed: row.bed || 'N/A',
      noteType: row.note_type,
      title: row.title,
      content: row.content,
      priority: row.priority,
      createdBy: row.created_by,
      createdAt: new Date(row.created_at).toLocaleString(),
      updatedAt: row.updated_at ? new Date(row.updated_at).toLocaleString() : undefined,
      tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : (row.tags || []),
      assessmentFindings: row.assessment_findings,
      interventions: row.interventions,
      patientResponse: row.patient_response,
      followUpRequired: row.follow_up_required,
    }));

    return NextResponse.json({
      success: true,
      data: notes,
      count: notes.length,
    });

  } catch (error) {
    console.error('Error fetching nursing notes:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch nursing notes',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// ============================================
// POST - Create new nursing note
// ============================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      patientId,
      patientName,
      bed,
      noteType,
      title,
      content,
      priority,
      tags,
      assessmentFindings,
      interventions,
      patientResponse,
      followUpRequired,
      createdBy,
      nurseId,
      nurseName,
    } = body;

    console.log('========================================');
    console.log('Creating Nursing Note');
    console.log('Patient ID:', patientId);
    console.log('Note Type:', noteType);
    console.log('Priority:', priority);
    console.log('Title:', title);
    console.log('========================================');

    // Validate required fields
    if (!patientId) {
      return NextResponse.json(
        { success: false, message: 'Patient ID is required' },
        { status: 400 }
      );
    }

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, message: 'Title is required' },
        { status: 400 }
      );
    }

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, message: 'Content is required' },
        { status: 400 }
      );
    }

    // Build created_by string with nurse info
    let createdByFull = 'Nurse';
    if (nurseName && nurseId) {
      createdByFull = `${nurseName} (Nurse ID: ${nurseId})`;
    } else if (nurseName) {
      createdByFull = nurseName;
    } else if (createdBy) {
      createdByFull = createdBy;
    }

    // Ensure tags is an array
    const tagsArray = Array.isArray(tags) ? tags : [];

    const result = await query(
      `INSERT INTO nursing_notes (
        patient_id,
        patient_name,
        bed,
        note_type,
        title,
        content,
        priority,
        tags,
        assessment_findings,
        interventions,
        patient_response,
        follow_up_required,
        created_by,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
      RETURNING *`,
      [
        patientId,
        patientName || null,
        bed || null,
        noteType || 'progress',
        title.trim(),
        content.trim(),
        priority || 'routine',
        JSON.stringify(tagsArray),
        assessmentFindings || null,
        interventions || null,
        patientResponse || null,
        followUpRequired || false,
        createdByFull,
      ]
    );

    const newNote = result.rows[0];

    console.log('✅ Nursing note created successfully!');
    console.log('Note ID:', newNote.id);

    return NextResponse.json({
      success: true,
      message: 'Nursing note created successfully',
      data: {
        id: newNote.id.toString(),
        patientId: newNote.patient_id,
        patientName: newNote.patient_name,
        bed: newNote.bed,
        noteType: newNote.note_type,
        title: newNote.title,
        content: newNote.content,
        priority: newNote.priority,
        tags: typeof newNote.tags === 'string' ? JSON.parse(newNote.tags) : newNote.tags,
        assessmentFindings: newNote.assessment_findings,
        interventions: newNote.interventions,
        patientResponse: newNote.patient_response,
        followUpRequired: newNote.follow_up_required,
        createdBy: newNote.created_by,
        createdAt: new Date(newNote.created_at).toLocaleString(),
      },
    });

  } catch (error) {
    console.error('❌ Error creating nursing note:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create nursing note',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// ============================================
// PUT - Update nursing note
// ============================================
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Note ID is required' },
        { status: 400 }
      );
    }

    // Check if note exists
    const existing = await query(
      'SELECT id FROM nursing_notes WHERE id = $1',
      [parseInt(id)]
    );

    if (existing.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Note not found' },
        { status: 404 }
      );
    }

    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    const fieldMapping: Record<string, string> = {
      patientId: 'patient_id',
      patientName: 'patient_name',
      noteType: 'note_type',
      assessmentFindings: 'assessment_findings',
      patientResponse: 'patient_response',
      followUpRequired: 'follow_up_required',
      createdBy: 'created_by',
    };

    const allowedFields = [
      'patientId', 'patientName', 'bed', 'noteType', 'title', 'content',
      'priority', 'tags', 'assessmentFindings', 'interventions',
      'patientResponse', 'followUpRequired', 'createdBy'
    ];

    for (const field of allowedFields) {
      const value = updateData[field];
      if (value !== undefined && value !== null) {
        const dbField = fieldMapping[field] || field;
        updateFields.push(`${dbField} = $${paramIndex}`);
        updateValues.push(field === 'tags' ? JSON.stringify(value) : value);
        paramIndex++;
      }
    }

    if (updateFields.length > 0) {
      updateValues.push(parseInt(id));
      await query(
        `UPDATE nursing_notes 
         SET ${updateFields.join(', ')}, updated_at = NOW() 
         WHERE id = $${paramIndex}`,
        updateValues
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Nursing note updated successfully',
    });

  } catch (error) {
    console.error('Error updating nursing note:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update nursing note' },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE - Delete nursing note
// ============================================
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const noteId = searchParams.get('id');

    if (!noteId) {
      return NextResponse.json(
        { success: false, message: 'Note ID is required' },
        { status: 400 }
      );
    }

    const id = parseInt(noteId);

    // Check if note exists
    const existing = await query(
      'SELECT id, title FROM nursing_notes WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Note not found' },
        { status: 404 }
      );
    }

    await query('DELETE FROM nursing_notes WHERE id = $1', [id]);

    console.log('✅ Note deleted:', existing.rows[0].title);

    return NextResponse.json({
      success: true,
      message: 'Nursing note deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting nursing note:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete nursing note' },
      { status: 500 }
    );
  }
}