import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const TARGET_URL = "https://aarogya-clinic-portal-645731351165.asia-southeast1.run.app/api/external-log";
    
    const sessionCookie = process.env.AISTUDIO_SESSION_COOKIE;
    if (!sessionCookie) {
      throw new Error("AISTUDIO_SESSION_COOKIE is not configured.");
    }

    // Proxy the log payload to Aarogya external logging endpoint
    const response = await fetch(TARGET_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": `GAESA=${sessionCookie}`,
      },
      body: JSON.stringify({
        projectName: body.projectName || "My Personal Hospital App",
        model: body.model || "gemini-1.5-flash",
        inputTokens: body.inputTokens || 0,
        outputTokens: body.outputTokens || 0,
        responseTimeMs: body.responseTimeMs || 0,
        status: body.status || "success",
        userRole: body.userRole || "external",
        errorDetails: body.errorDetails || ""
      }),
    });

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Failed to forward telemetry logs:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}





// import { NextRequest, NextResponse } from "next/server";

// const EXPRESS_BILLING_URL = "http://localhost:3001/api/external-log";
// const CUSTOM_API_KEY = process.env.BILLING_API_KEY || "my-secret-key-2025";

// export async function POST(request: NextRequest) {
//   try {
//     const payload = await request.json();
//     const response = await fetch(EXPRESS_BILLING_URL, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${CUSTOM_API_KEY}`,
//       },
//       body: JSON.stringify(payload),
//     });
//     const data = await response.json();
//     return NextResponse.json(data);
//   } catch (err: any) {
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }