// import { NextResponse } from "next/server";

// export const revalidate = 0; // Disable caching to fetch fresh token

// export async function GET() {
//   try {
//     const TARGET_URL = "https://aarogya-clinic-portal-645731351165.asia-southeast1.run.app/api/ai/billing";
    
//     // Read the session cookie you got from your browser DevTools
//     const sessionCookie = process.env.AISTUDIO_SESSION_COOKIE;

//     if (!sessionCookie) {
//       throw new Error("AISTUDIO_SESSION_COOKIE is not configured in your .env.local file");
//     }

//     const response = await fetch(TARGET_URL, {
//       method: "GET",
//       headers: {
//         "Accept": "application/json",
//         // Forward the GAESA cookie so the Google sandbox permits the request
//         "Cookie": `GAESA=${sessionCookie}`,
//       },
//       cache: "no-store",
//     });

//     if (!response.ok) {
//       throw new Error(`Fetch failed with status ${response.status}: ${response.statusText}`);
//     }

//     const data = await response.json();
//     return NextResponse.json(data);
//   } catch (error) {
//     return NextResponse.json(
//       {
//         success: false,
//         error: error instanceof Error ? error.message : "Failed to fetch from Aarogya Portal gateway",
//       },
//       { status: 500 }
//     );
//   }
// }


// app/api/ai/billing/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const TARGET_URL = "https://aarogya-clinic-portal-645731351165.asia-southeast1.run.app/api/ai/billing";
  const sessionCookie = process.env.AISTUDIO_SESSION_COOKIE;
  if (!sessionCookie) {
    return NextResponse.json({ error: "Missing cookie" }, { status: 500 });
  }
  const res = await fetch(TARGET_URL, {
    headers: { Cookie: `GAESA=${sessionCookie}`, Accept: "application/json" },
  });
  const data = await res.json();
  return NextResponse.json(data);
}