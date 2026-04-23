import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db';
import { z } from 'zod';
import { authErrorResponse,requireRole } from '@/lib/auth/guards';

const BulkBedSchema = z.object({
  ward_id: z.number().int().positive(),
  bed_number: z.string().min(1),
  type: z.enum(['General', 'Semi-Special', 'Special', 'VIP', 'ICU', 'Pediatric']),
  floor_number: z.number().int(),
  patient_category: z.enum(['Male', 'Female', 'Children', 'Mixed']),
  room_number: z.string().optional(),
  status: z.enum(['available', 'occupied', 'cleaning', 'maintenance', 'reserved']).default('available'),
});

type BulkBedInput = z.infer<typeof BulkBedSchema>;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { beds } = body;
     requireRole(req, ['admin']);

    if (!Array.isArray(beds) || beds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid or empty beds array' },
        { status: 400 }
      );
    }

    // Validate each bed – explicit type annotation
    const validated: BulkBedInput[] = [];
    for (let i = 0; i < beds.length; i++) {
      const result = BulkBedSchema.safeParse(beds[i]);
      if (!result.success) {
        return NextResponse.json(
          { success: false, message: `Row ${i + 1}: ${result.error.message}` },
          { status: 400 }
        );
      }
      validated.push(result.data);
    }

    const inserted: { id: number; bed_number: string }[] = [];
    await transaction(async (client) => {
      for (const bed of validated) {
        // Check for duplicate bed number in the same ward
        const existing = await client.query(
          `SELECT id FROM beds WHERE ward_id = $1 AND bed_number = $2`,
          [bed.ward_id, bed.bed_number]
        );
        if (existing.rows.length > 0) {
          throw new Error(`Bed number ${bed.bed_number} already exists in this ward`);
        }

        // Prepare attributes JSON (store room number if provided)
        const attributes: Record<string, unknown> = {};
        if (bed.room_number) attributes.room_number = bed.room_number;

        const result = await client.query(
          `INSERT INTO beds 
           (ward_id, bed_number, type, floor_number, patient_category, status, attributes, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, true)
           RETURNING id, bed_number`,
          [
            bed.ward_id,
            bed.bed_number,
            bed.type,
            bed.floor_number,
            bed.patient_category,
            bed.status,
            JSON.stringify(attributes)
          ]
        );
        inserted.push(result.rows[0]);
      }
    });

    return NextResponse.json({
      success: true,
      message: `${inserted.length} beds created`,
      data: inserted,
    });
  } catch (error: unknown) {
    console.error('Bulk import error:', error);
        const authResponse=authErrorResponse(error);

if(authResponse){
  return authResponse
}

    const message = error instanceof Error ? error.message : 'Import failed';
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}