import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { MedicineSchema } from '@/lib/validations/medicine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { medicines } = body;

    if (!Array.isArray(medicines) || medicines.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid or empty medicines array' },
        { status: 400 }
      );
    }

    // Validate each medicine using the same schema as the single create endpoint
    const validated = [];
    for (let i = 0; i < medicines.length; i++) {
      const med = medicines[i];
      const result = MedicineSchema.safeParse(med);
      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            message: `Validation error at row ${i + 1}: ${result.error.message}`,
          },
          { status: 400 }
        );
      }
      validated.push(result.data);
    }

    // Insert in a transaction
    await query('BEGIN');
    try {
      const inserted = [];
      for (const med of validated) {
        const res = await query(
          `INSERT INTO medicines 
           (name, generic_name, brand_name, category, unit, purchase_price, selling_price, mrp, tax_percent, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           RETURNING id`,
          [
            med.name,
            med.genericName || null,
            med.brandName || null,
            med.category,
            med.unit,
            med.purchasePrice,
            med.sellingPrice,
            med.mrp || null,
            med.taxPercent || 0,
            med.isActive ?? true,
          ]
        );
        inserted.push({ id: res.rows[0].id, name: med.name });
      }
      await query('COMMIT');
      return NextResponse.json({
        success: true,
        message: `Successfully imported ${inserted.length} medicines`,
        data: inserted,
      });
    } catch (err) {
      await query('ROLLBACK');
      throw err;
    }
  } catch (error) {
    console.error('Bulk import error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}