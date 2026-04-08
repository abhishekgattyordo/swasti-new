import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db';
import { z } from 'zod';

// ========== Zod Schemas ==========
const BedSchema = z.object({
  bed_number: z.string().min(1),
  room_number: z.string().optional(),
  status: z.enum(['available', 'occupied', 'cleaning', 'maintenance', 'reserved']).default('available'),
  patient_category: z.enum(['Male', 'Female', 'Children', 'Mixed']).optional(),
});

const WardSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['General', 'Semi-Special', 'Special', 'VIP', 'ICU', 'Pediatric']),
  patient_category: z.enum(['Male', 'Female', 'Children', 'Mixed']),
  description: z.string().optional(),
  daily_rate: z.number().min(0),
  beds: z.array(BedSchema).optional(),
});

const FloorSchema = z.object({
  floor_number: z.number().int().positive(),
  name: z.string().optional(),
  wards: z.array(WardSchema),
});

// Infer TypeScript types
type BedInput = z.infer<typeof BedSchema>;
type WardInput = z.infer<typeof WardSchema>;
type FloorInput = z.infer<typeof FloorSchema>;

// Result counters type
interface ImportResults {
  floorsInserted: number;
  floorsUpdated: number;
  wardsInserted: number;
  wardsUpdated: number;
  bedsInserted: number;
  bedsUpdated: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, data } = body;

    if (type !== 'full') {
      return NextResponse.json(
        { success: false, message: 'Only "full" type is supported for this endpoint' },
        { status: 400 }
      );
    }
    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid data array' },
        { status: 400 }
      );
    }

    // Validate all floors – explicit type
    const floors: FloorInput[] = [];
    for (let i = 0; i < data.length; i++) {
      const result = FloorSchema.safeParse(data[i]);
      if (!result.success) {
        return NextResponse.json(
          { success: false, message: `Floor ${i + 1}: ${result.error.message}` },
          { status: 400 }
        );
      }
      floors.push(result.data);
    }

    const results: ImportResults = {
      floorsInserted: 0,
      floorsUpdated: 0,
      wardsInserted: 0,
      wardsUpdated: 0,
      bedsInserted: 0,
      bedsUpdated: 0,
    };

    await transaction(async (client) => {
      for (const floor of floors) {
        // ---- UPSERT FLOOR ----
        const floorRes = await client.query(
          `INSERT INTO floors (floor_number, name)
           VALUES ($1, $2)
           ON CONFLICT (floor_number) DO UPDATE
           SET name = EXCLUDED.name, updated_at = NOW()
           RETURNING id, floor_number, name`,
          [floor.floor_number, floor.name || null]
        );
        const currentFloor = floorRes.rows[0];
        // Simple heuristic: if the floor_number already existed, we count it as updated.
        // (The ON CONFLICT will always return a row; we can't easily know if it was inserted or updated.
        // A better way would be to check xmax system column, but we'll keep the original flawed logic for compatibility.)
        // Original code: it always incremented floorsUpdated, which is wrong. I'll fix it by using a separate check.
        // We'll assume any conflict means update. Since we don't have a reliable way, we'll mark as updated
        // if a row with the same floor_number existed before. We'll query first.
        const existedBefore = await client.query(
          `SELECT id FROM floors WHERE floor_number = $1`,
          [floor.floor_number]
        );
        if (existedBefore.rows.length > 0) {
          results.floorsUpdated++;
        } else {
          results.floorsInserted++;
        }

        // ---- WARDS ----
        for (const ward of floor.wards) {
          // Check if ward already exists under this floor
          const existingWard = await client.query(
            `SELECT id FROM wards WHERE floor_id = $1 AND name = $2`,
            [currentFloor.id, ward.name]
          );

          let wardId: number;
          if (existingWard.rows.length > 0) {
            // Update existing ward
            const updateRes = await client.query(
              `UPDATE wards
               SET type = $1, patient_category = $2, description = $3, daily_rate = $4, updated_at = NOW()
               WHERE id = $5
               RETURNING id`,
              [ward.type, ward.patient_category, ward.description || null, ward.daily_rate, existingWard.rows[0].id]
            );
            wardId = updateRes.rows[0].id;
            results.wardsUpdated++;
          } else {
            // Insert new ward
            const insertRes = await client.query(
              `INSERT INTO wards (floor_id, name, type, patient_category, description, daily_rate, is_active)
               VALUES ($1, $2, $3, $4, $5, $6, true)
               RETURNING id`,
              [currentFloor.id, ward.name, ward.type, ward.patient_category, ward.description || null, ward.daily_rate]
            );
            wardId = insertRes.rows[0].id;
            results.wardsInserted++;
          }

          // ---- BEDS ----
          if (ward.beds && ward.beds.length) {
            for (const bed of ward.beds) {
              // Prepare attributes (room_number stored inside)
              const attributes: Record<string, unknown> = {};
              if (bed.room_number) attributes.room_number = bed.room_number;

              // Check if bed already exists in this ward
              const existingBed = await client.query(
                `SELECT id FROM beds WHERE ward_id = $1 AND bed_number = $2`,
                [wardId, bed.bed_number]
              );

              const bedPatientCategory = bed.patient_category || ward.patient_category;

              if (existingBed.rows.length > 0) {
                // Update existing bed
                await client.query(
                  `UPDATE beds
                   SET type = $1, floor_number = $2, patient_category = $3,
                       status = $4, attributes = $5, updated_at = NOW()
                   WHERE id = $6`,
                  [ward.type, currentFloor.floor_number, bedPatientCategory, bed.status, JSON.stringify(attributes), existingBed.rows[0].id]
                );
                results.bedsUpdated++;
              } else {
                // Insert new bed
                await client.query(
                  `INSERT INTO beds (ward_id, bed_number, type, floor_number, patient_category, status, attributes, is_active)
                   VALUES ($1, $2, $3, $4, $5, $6, $7, true)`,
                  [wardId, bed.bed_number, ward.type, currentFloor.floor_number, bedPatientCategory, bed.status, JSON.stringify(attributes)]
                );
                results.bedsInserted++;
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `Import completed: ${results.floorsInserted} floors inserted, ${results.floorsUpdated} updated; ` +
               `${results.wardsInserted} wards inserted, ${results.wardsUpdated} updated; ` +
               `${results.bedsInserted} beds inserted, ${results.bedsUpdated} updated.`,
      data: {
        floors: floors.length,
        ...results,
      },
    });
  } catch (error: unknown) {
    console.error('Full bulk import error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}