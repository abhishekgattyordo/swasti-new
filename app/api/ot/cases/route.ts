

// import { NextRequest, NextResponse } from 'next/server';
// import { getCases, insertCase } from '@/lib/surgery-db';

// export const dynamic = 'force-dynamic';

// export async function GET(req: NextRequest) {
//   try {
//     const cases = await getCases();
//     return NextResponse.json(cases);
//   } catch (err: any) {
//     return NextResponse.json({ error: err.message || 'Failed to fetch cases.' }, { status: 500 });
//   }
// }

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const userEmail = req.headers.get('x-user-email') || 'abhishekgatty0@gmail.com';
//     const userRole = req.headers.get('x-user-role') || 'Admin';

//     if (!body.patient?.name || !body.recommendation?.surgeryName) {
//       return NextResponse.json({ error: 'Patient Name and Surgery Name are required fields.' }, { status: 400 });
//     }

//     const createdCase = await insertCase(body, userEmail, userRole);
//     return NextResponse.json(createdCase, { status: 201 });
//   } catch (err: any) {
//     return NextResponse.json({ error: err.message || 'Failed to create surgery case.' }, { status: 500 });
//   }
// }



// app/api/ot/cases/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCases, insertCase } from '@/lib/surgery-db';
import { authErrorResponse, requireRole } from '@/lib/auth/guards';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Optional: require role for GET if needed
    // requireRole(req, ['admin', 'doctor', 'nurse']);
    
    const cases = await getCases();
    
    // Add pagination support if needed
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    
    const paginatedCases = cases.slice(offset, offset + limit);
    
    return NextResponse.json({
      success: true,
      data: paginatedCases,
      total: cases.length,
      limit,
      offset,
    });
  } catch (err: any) {
    console.error('Error fetching surgery cases:', err);
    const authResponse = authErrorResponse(err);
    if (authResponse) return authResponse;
    
    return NextResponse.json(
      { 
        success: false, 
        error: err.message || 'Failed to fetch cases.' 
      }, 
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Require admin role for creating cases
   
    
    const body = await req.json();
    
    // Get user info from auth or headers
    const userEmail = req.headers.get('x-user-email') || '';
    const userRole = req.headers.get('x-user-role') || '';

    // Validate required fields
    if (!body.patient?.name || !body.recommendation?.surgeryName) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Patient Name and Surgery Name are required fields.' 
        }, 
        { status: 400 }
      );
    }

    // Additional validation
    if (!body.patient?.id && !body.patient?.admissionId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Patient ID or Admission ID is required.' 
        }, 
        { status: 400 }
      );
    }

    const createdCase = await insertCase(body, userEmail, userRole);
    
    return NextResponse.json(
      { 
        success: true, 
        data: createdCase,
        message: 'Surgery case created successfully.' 
      }, 
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Error creating surgery case:', err);
    const authResponse = authErrorResponse(err);
    if (authResponse) return authResponse;
    
    return NextResponse.json(
      { 
        success: false, 
        error: err.message || 'Failed to create surgery case.' 
      }, 
      { status: 500 }
    );
  }
}