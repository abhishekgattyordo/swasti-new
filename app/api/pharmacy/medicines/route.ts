import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { MedicineSchema } from '@/lib/validations/medicine';
import { authErrorResponse,requireRole } from '@/lib/auth/guards';

// GET /api/pharmacy/medicines – list all medicines (with optional filters & pagination)
export async function GET(req: NextRequest) {
  try {
    requireRole(req, ['pharmacy']);
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';

    let sql = `SELECT * FROM medicines`;
    const values: any[] = [];
    let paramIndex = 1;

    if (search) {
      sql += ` WHERE (name ILIKE $${paramIndex} OR generic_name ILIKE $${paramIndex} OR brand_name ILIKE $${paramIndex})`;
      values.push(`%${search}%`);
      paramIndex++;
    }

    if (category) {
      sql += (search ? ' AND' : ' WHERE') + ` category = $${paramIndex}`;
      values.push(category);
      paramIndex++;
    }

    const countResult = await query(`SELECT COUNT(*) FROM (${sql}) as count`, values);
    const total = parseInt(countResult.rows[0].count);

    const offset = (page - 1) * limit;
    sql += ` ORDER BY name LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(limit, offset);

    const result = await query(sql, values);

    return NextResponse.json({
      success: true,
      data: result.rows,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching medicines:', error);
       const authResponse=authErrorResponse(error);
if(authResponse){
  return authResponse
}
    return NextResponse.json(
      { success: false, message: 'Failed to fetch medicines' },
      { status: 500 }
    );
  }
}

// POST /api/pharmacy/medicines – create a new medicine
export async function POST(req: NextRequest) {
  try {
    requireRole(req, ['pharmacy']);
    const body = await req.json();
    const validation = MedicineSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validation.data;
    const result = await query(
      `INSERT INTO medicines 
       (name, generic_name, brand_name, category, unit, purchase_price, selling_price, mrp, tax_percent, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        data.name,
        data.genericName || null,
        data.brandName || null,
        data.category,
        data.unit,
        data.purchasePrice,
        data.sellingPrice,
        data.mrp || null,
        data.taxPercent || 0,
        data.isActive ?? true,
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Medicine created successfully',
        data: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating medicine:', error);
       const authResponse=authErrorResponse(error);
if(authResponse){
  return authResponse
}
    return NextResponse.json(
      { success: false, message: 'Failed to create medicine' },
      { status: 500 }
    );
  }
}