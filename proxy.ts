

// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// export function proxy(request: NextRequest) {
//   const response = NextResponse.next();
//   const { pathname } = request.nextUrl;
  
//   // Skip proxy for the tenant config API to avoid infinite loop
//   if (pathname === '/api/tenant/config') {
//     return response;
//   }
  
//   const hostname = request.headers.get('host') || '';
//   const domain = hostname.split(':')[0];
  
//   console.log(`🌐 Request from domain: ${domain} - ${pathname}`);
  
//   return response;
// }

// export const config = {
//   matcher: '/api/:path*',
// };

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { setTenantDatabaseUrl } from '@/lib/domainManager';
import { verifyAccessToken, ACCESS_TOKEN_COOKIE } from '@/lib/auth/jwt';

// Simple cache for tenant configs
const tenantCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;
  
  const skipPaths = [
    '/_next/',
    '/favicon.ico',
    'icon',
    '.css',
    '.js',
    '.png',
    '.jpg',
    '.svg',
    '.woff',
    '.woff2',
  ];
  
  const shouldSkip = skipPaths.some(path => pathname.includes(path));
  
  if (shouldSkip) {
    return response;
  }
  
  const hostname = request.headers.get('host') || '';
  const domain = hostname.split(':')[0];
  
  // Only log API requests
  if (pathname.startsWith('/api/')) {
    console.log(`🌐 API Request: ${domain} - ${pathname}`);
  }
  
  // Auth Check for protected API routes
  if (pathname.startsWith('/api/')) {
    const publicPaths = [
      '/api/login',
      '/api/auth', 
      '/api/registration',
      '/api/tenant/config',
      '/api/check-db',
      '/api/test-db',
      '/api/test-domain'
    ];
    
    // Check if current path does not start with any of the public paths
    const isPublicPath = 
      publicPaths.some(publicPath => pathname.startsWith(publicPath)) ||
      (pathname === '/api/doctors' && request.method === 'GET');
    
    if (!isPublicPath) {
      try {
        const authHeader = request.headers.get("authorization");
        const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
        const token = bearerToken || request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
        
        if (!token) {
          return NextResponse.json({ success: false, message: "Unauthorized: Access token missing" }, { status: 401 });
        }
        
        // Let verifyAccessToken validate expiration/signature
        const decoded = verifyAccessToken(token);
        if (!decoded || !decoded.sub) {
          return NextResponse.json({ success: false, message: "Unauthorized: Invalid token payload" }, { status: 401 });
        }
      } catch (error) {
        console.error(`❌ Auth Error in proxy for ${pathname}:`, error);
        return NextResponse.json({ success: false, message: "Unauthorized: Invalid or expired access token" }, { status: 401 });
      }
    }
  }
  
  // ✅ Auth Check for protected Frontend routes
  const protectedFrontendPaths = [
    '/patient/dashboard',
    '/doctor',
    '/admin',
    '/billing',
    '/billings',
    '/helpdesk',
    '/laboratory',
    '/pharmacy'
  ];

  const isProtectedFrontend = protectedFrontendPaths.some(path => pathname.startsWith(path));

  if (isProtectedFrontend) {
    try {
      const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value || '';

      if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      // Validate the token signature and expiration
      const decoded = verifyAccessToken(token);
      if (!decoded || !decoded.sub) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    } catch (error) {
      console.error(`❌ Frontend Auth Error in proxy for ${pathname}:`, error);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // ✅ Only fetch tenant config for actual API routes (not static files)
  if (pathname.startsWith('/api/') && !pathname.includes('/api/tenant/config')) {
    try {
      // Check cache first
      const cached = tenantCache.get(domain);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        const tenantConfig = cached.data;
        if (tenantConfig.tenant?.databaseUrl) {
          setTenantDatabaseUrl(tenantConfig.tenant.databaseUrl);
        }
        return response;
      }
      
      // Fetch tenant config
      const url = new URL('/api/tenant/config', request.url);
      const tenantConfigRes = await fetch(url.toString(), {
        headers: { 'host': hostname },
      });
      
      const tenantConfig = await tenantConfigRes.json();
      
      // Cache the result
      tenantCache.set(domain, { data: tenantConfig, timestamp: Date.now() });
      
      if (tenantConfig.tenant?.databaseUrl) {
        setTenantDatabaseUrl(tenantConfig.tenant.databaseUrl);
        console.log(`✅ Tenant set: ${tenantConfig.tenant.name} - DB: ${tenantConfig.tenant.databaseUrl.split('/').pop()?.split('?')[0]}`);
      }
    } catch (error) {
      console.error(`❌ Error fetching tenant config:`, error);
    }
  }
  
  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/patient/:path*',
    '/doctor/:path*',
    '/admin/:path*',
    '/billing/:path*',
    '/billings/:path*',
    '/helpdesk/:path*',
    '/laboratory/:path*',
    '/pharmacy/:path*',
  ],
};