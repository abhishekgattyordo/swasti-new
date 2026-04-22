

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

// Simple cache for tenant configs
const tenantCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;
  
  // ✅ Skip static assets and Next.js internal files
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
  
  // ✅ Only log API requests
  if (pathname.startsWith('/api/')) {
    console.log(`🌐 API Request: ${domain} - ${pathname}`);
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
  matcher: '/api/:path*',
};