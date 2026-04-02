import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db';
import { z } from 'zod';

const TransferSchema = z.object({
  destinationBedId: z.number().int().positive(),
  reason: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('📥 POST /api/bed-config/beds/[id]/transfer - Starting request');
  
  try {
    const { id } = await params;
    const sourceBedId = parseInt(id);
    
    if (isNaN(sourceBedId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid source bed ID' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const validation = TransferSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { destinationBedId, reason } = validation.data;

    let admissionId = 0;

    await transaction(async (client) => {
      // 1. Source bed details
      const sourceRes = await client.query(
        `SELECT id, ward_id, status, occupied_by, attributes
         FROM beds 
         WHERE id = $1`,
        [sourceBedId]
      );
      if (sourceRes.rows.length === 0) throw new Error('Source bed not found');
      const sourceBed = sourceRes.rows[0];
      if (sourceBed.status !== 'occupied') throw new Error('Source bed is not occupied');
      if (!sourceBed.occupied_by) throw new Error('No patient assigned to source bed');

      const patientId = sourceBed.occupied_by;

      // 2. Destination bed details
      const destRes = await client.query(
        `SELECT id, ward_id, status, attributes
         FROM beds 
         WHERE id = $1`,
        [destinationBedId]
      );
      if (destRes.rows.length === 0) throw new Error('Destination bed not found');
      const destBed = destRes.rows[0];
      if (destBed.status !== 'available') throw new Error('Destination bed is not available');

      // 3. Active admission
      const admissionRes = await client.query(
        `SELECT id, ward_id, bed_id 
         FROM admissions 
         WHERE patient_id = $1 AND status = 'active'`,
        [patientId]
      );
      if (admissionRes.rows.length === 0) throw new Error('No active admission found for this patient');
      const admission = admissionRes.rows[0];
      admissionId = admission.id;

      const currentDate = new Date().toISOString().split('T')[0];

      // 4. Close previous ward period
      await client.query(
        `UPDATE ward_transfers 
         SET to_date = $1
         WHERE admission_id = $2 AND to_date IS NULL`,
        [currentDate, admission.id]
      );

      // 5. Insert new ward period
      await client.query(
        `INSERT INTO ward_transfers (admission_id, ward_id, from_date)
         VALUES ($1, $2, $3)`,
        [admission.id, destBed.ward_id, currentDate]
      );

      // 6. Update admission record
      await client.query(
        `UPDATE admissions 
         SET bed_id = $1, ward_id = $2, updated_at = NOW()
         WHERE id = $3`,
        [destinationBedId, destBed.ward_id, admission.id]
      );

      // 7. Update beds
      const destAttributes = destBed.attributes || {};
      const sourceAttributes = sourceBed.attributes || {};

      const updatedDestAttributes = {
        ...destAttributes,
        currentPatient: {
          id: patientId,
          name: sourceAttributes.currentPatient?.name || 'Unknown',
          admissionDate: admission.admission_date,
          transferDate: currentDate,
          transferReason: reason || 'Clinical transfer',
          transferredFrom: sourceBedId
        },
        patientHistory: [
          ...(destAttributes.patientHistory || []),
          {
            patientId,
            name: sourceAttributes.currentPatient?.name || 'Unknown',
            admissionDate: admission.admission_date,
            transferDate: currentDate,
            transferredFrom: sourceBedId
          }
        ]
      };

      const updatedSourceAttributes = {
        ...sourceAttributes,
        currentPatient: null,
        patientHistory: [
          ...(sourceAttributes.patientHistory || []),
          {
            patientId,
            name: sourceAttributes.currentPatient?.name || 'Unknown',
            admissionDate: admission.admission_date,
            transferDate: currentDate,
            transferredTo: destinationBedId,
            reason: reason || 'Clinical transfer'
          }
        ]
      };

      await client.query(
        `UPDATE beds 
         SET status = 'cleaning',
             attributes = $1::jsonb,
             occupied_by = NULL,
             occupied_at = NULL,
             updated_at = NOW()
         WHERE id = $2`,
        [JSON.stringify(updatedSourceAttributes), sourceBedId]
      );

      await client.query(
        `UPDATE beds 
         SET status = 'occupied',
             attributes = $1::jsonb,
             occupied_by = $2,
             occupied_at = NOW(),
             updated_at = NOW()
         WHERE id = $3`,
        [JSON.stringify(updatedDestAttributes), patientId, destinationBedId]
      );
    });

    if (admissionId === 0) {
      throw new Error('Admission ID not set after transaction');
    }

    // Automatically regenerate the bill after transfer
    const baseUrl = req.nextUrl.origin;
    fetch(`${baseUrl}/api/billing/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admissionId }),
    }).catch(err => console.error('Bill generation after transfer failed:', err));

    return NextResponse.json({
      success: true,
      message: 'Patient transferred and admission updated. Bill regenerated.',
      data: { admissionId },
    });
  } catch (error: any) {
    console.error('Error transferring patient:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to transfer patient' },
      { status: 500 }
    );
  }
}