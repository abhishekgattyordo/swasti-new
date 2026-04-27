import { NextRequest, NextResponse } from "next/server";
import { authErrorResponse, requireRole } from '@/lib/auth/guards';

export async function GET(request: NextRequest) {
  try {
    // ✅ Add role check for laboratory
    requireRole(request, ['laboratory', 'admin']);
    
    const searchParams = request.nextUrl.searchParams;
    const patientId = searchParams.get("patientId");

    if (!patientId) {
      return NextResponse.json({ 
        success: false, 
        message: 'patientId is required' 
      }, { status: 400 });
    }

    // ✅ Forward the authorization token
    const authHeader = request.headers.get('authorization');
    
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/patient/admission-status?patientId=${patientId}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader || '',  // ✅ Forward the token
      },
    });

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in lab admission-status proxy:', error);
    
    // ✅ Handle auth errors properly
    const authResponse = authErrorResponse(error);
    if (authResponse) {
      return authResponse;
    }
    
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}