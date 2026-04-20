// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// export function proxy(request: NextRequest) {
//   const response = NextResponse.next();
//   const hostname = request.headers.get('host') || '';
//   const domain = hostname.split(':')[0];
  
//   console.log(`🌐 Request from domain: ${domain}`);
  
//   return response;
// }

// export const config = {
//   matcher: '/api/:path*',
// };


import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;
  
  // Skip proxy for the tenant config API to avoid infinite loop
  if (pathname === '/api/tenant/config') {
    return response;
  }
  
  const hostname = request.headers.get('host') || '';
  const domain = hostname.split(':')[0];
  
  console.log(`🌐 Request from domain: ${domain} - ${pathname}`);
  
  return response;
}

export const config = {
  matcher: '/api/:path*',
};