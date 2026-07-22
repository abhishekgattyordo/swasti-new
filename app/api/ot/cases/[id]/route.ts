// import { NextRequest, NextResponse } from 'next/server';
// import { getCaseById, updateCase } from '@/lib/surgery-db';

// export const dynamic = 'force-dynamic';

// interface RouteParams {
//   params: Promise<{ id: string }>;
// }

// export async function GET(req: NextRequest, { params }: RouteParams) {
//   try {
//     const resolvedParams = await params;
//     const caseId = resolvedParams.id;
//     const item = getCaseById(caseId);

//     if (!item) {
//       return NextResponse.json({ error: `Surgery Case ${caseId} not found in the relational database.` }, { status: 404 });
//     }

//     return NextResponse.json(item);
//   } catch (err: any) {
//     return NextResponse.json({ error: err.message || 'Failed to fetch case detail.' }, { status: 500 });
//   }
// }

// export async function PUT(req: NextRequest, { params }: RouteParams) {
//   try {
//     const resolvedParams = await params;
//     const caseId = resolvedParams.id;
//     const body = await req.json();

//     const userEmail = req.headers.get('x-user-email') || 'abhishekgatty0@gmail.com';
//     const userRole = req.headers.get('x-user-role') || 'Admin';

//     if (!userRole) {
//       return NextResponse.json({ error: 'Unauthorized: Missing clinical user role header.' }, { status: 401 });
//     }

//     if (body.id !== caseId) {
//       return NextResponse.json({ error: 'Bad Request: URL ID and Body ID mismatch.' }, { status: 400 });
//     }

//     const updated = updateCase(body, userEmail, userRole);
//     return NextResponse.json(updated);
//   } catch (err: any) {
//     return NextResponse.json({ error: err.message || 'Failed to update case.' }, { status: 500 });
//   }
// }





// app/api/ot/cases/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCaseById, updateCase } from '@/lib/surgery-db';
import { authErrorResponse, requireRole } from '@/lib/auth/guards';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const caseId = resolvedParams.id;

    if (!caseId) {
      return NextResponse.json(
        { success: false, error: 'Case ID is required' },
        { status: 400 }
      );
    }

    // ✅ FIX: Await the promise
    const caseData = await getCaseById(caseId);

    if (!caseData) {
      return NextResponse.json(
        { success: false, error: `Surgery Case ${caseId} not found in the relational database.` },
        { status: 404 }
      );
    }

    // ✅ Log for debugging
    console.log('🔍 GET /api/ot/cases/[id] - Case data retrieved:', caseData.id);
    console.log('🔍 Patient data:', caseData.patient);

    // ✅ Return consistent response format
    return NextResponse.json({
      success: true,
      data: caseData,
    });
  } catch (err: any) {
    console.error('Error fetching case:', err);
    return NextResponse.json(
      { 
        success: false, 
        error: err.message || 'Failed to fetch case detail.' 
      }, 
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const caseId = resolvedParams.id;
    const body = await req.json();

    const userEmail = req.headers.get('x-user-email') || 'abhishekgatty0@gmail.com';
    const userRole = req.headers.get('x-user-role') || 'Admin';

    if (body.id !== caseId) {
      return NextResponse.json(
        { success: false, error: 'Bad Request: URL ID and Body ID mismatch.' },
        { status: 400 }
      );
    }

    // ✅ FIX: Await the promise
    const updated = await updateCase(body, userEmail, userRole);

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Case updated successfully.',
    });
  } catch (err: any) {
    console.error('Error updating case:', err);
    return NextResponse.json(
      { 
        success: false, 
        error: err.message || 'Failed to update case.' 
      }, 
      { status: 500 }
    );
  }
}