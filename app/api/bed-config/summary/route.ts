import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authErrorResponse,requireRole } from '@/lib/auth/guards';

export async function GET(req: NextRequest) {
  try {
       requireRole(req, ['admin']);
    console.log('📥 GET /api/bed-config/summary - Fetching bed summary');

    // Get counts by status
    const statusCounts = await query(`
      SELECT status, COUNT(*) as count 
      FROM beds 
      WHERE is_active = true 
      GROUP BY status
    `);

    // Get counts by floor
    const floorCounts = await query(`
      SELECT f.id, f.floor_number, f.name, 
             COUNT(b.id) as total_beds,
             SUM(CASE WHEN b.status = 'occupied' THEN 1 ELSE 0 END) as occupied
      FROM floors f
      LEFT JOIN wards w ON f.id = w.floor_id AND w.is_active = true
      LEFT JOIN beds b ON w.id = b.ward_id AND b.is_active = true
      GROUP BY f.id, f.floor_number, f.name
      ORDER BY f.floor_number
    `);

    // Get counts by ward type
    const wardTypeCounts = await query(`
      SELECT w.type, 
             COUNT(b.id) as total_beds,
             SUM(CASE WHEN b.status = 'occupied' THEN 1 ELSE 0 END) as occupied
      FROM wards w
      LEFT JOIN beds b ON w.id = b.ward_id AND b.is_active = true
      WHERE w.is_active = true
      GROUP BY w.type
    `);

    // Get counts by patient category
    const categoryCounts = await query(`
      SELECT patient_category, 
             COUNT(*) as count
      FROM beds
      WHERE is_active = true
      GROUP BY patient_category
    `);

    // Get recent activity (last 10 bed updates)
    const recentActivity = await query(`
      SELECT 'bed' as type, 
             b.bed_number, 
             b.status, 
             w.name as ward_name,
             r.room_number,
             b.updated_at
      FROM beds b
      JOIN wards w ON b.ward_id = w.id
      LEFT JOIN rooms r ON b.room_id = r.id
      WHERE b.is_active = true
      ORDER BY b.updated_at DESC
      LIMIT 10
    `);

    // Calculate total beds
    const totalBedsResult = await query(`
      SELECT COUNT(*) as total FROM beds WHERE is_active = true
    `);
    const totalBeds = parseInt(totalBedsResult.rows[0].total);

    // Calculate occupancy rate
    const occupiedBeds = statusCounts.rows.find(s => s.status === 'occupied')?.count || 0;
    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalBeds,
          occupiedBeds: parseInt(occupiedBeds),
          availableBeds: totalBeds - parseInt(occupiedBeds),
          occupancyRate: `${occupancyRate}%`
        },
        statusCounts: statusCounts.rows.map(row => ({
          status: row.status,
          count: parseInt(row.count)
        })),
        floorCounts: floorCounts.rows.map(row => ({
          floor_id: row.id,
          floor_number: row.floor_number,
          name: row.name,
          total_beds: parseInt(row.total_beds),
          occupied: parseInt(row.occupied || 0)
        })),
        wardTypeCounts: wardTypeCounts.rows.map(row => ({
          type: row.type,
          total_beds: parseInt(row.total_beds),
          occupied: parseInt(row.occupied || 0)
        })),
        categoryCounts: categoryCounts.rows.map(row => ({
          category: row.patient_category,
          count: parseInt(row.count)
        })),
        recentActivity: recentActivity.rows.map(row => ({
          type: row.type,
          bed_number: row.bed_number,
          status: row.status,
          ward_name: row.ward_name,
          room_number: row.room_number,
          updated_at: row.updated_at
        }))
      }
    });

  } catch (error) {
    console.error('❌ Error fetching bed summary:', error);
       const authResponse=authErrorResponse(error);

if(authResponse){
  return authResponse
}
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch bed summary',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}