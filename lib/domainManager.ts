
import { Pool } from 'pg';

interface Tenant {
  id?: string;
  slug?: string;
  name?: string;
  databaseUrl?: string;
  schemaName?: string | null;
  isActive?: boolean;
  [key: string]: unknown;  // Allow other properties if needed
}

const pools: Map<string, Pool> = new Map();

// Cache for tenant database URLs
let tenantDatabaseUrl: string | null = null;

export function setTenantDatabaseUrl(url: string) {
  tenantDatabaseUrl = url;
  console.log('✅ Tenant database URL set:', url);
}

export function getDbFromDomain(_xxdbName?: string): Pool {
  // Only use tenant database URL - NO FALLBACK to env
  const connectionString = tenantDatabaseUrl;
  
  if (!connectionString) {
    throw new Error(`❌ No tenant database URL set. Please set tenant database URL first.`);
  }
  
  if (pools.has(connectionString)) {
    return pools.get(connectionString)!;
  }
  
  const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false },
    max: 20,
    idleTimeoutMillis: 30000,
  });
  
  pools.set(connectionString, pool);
  return pool;
}

// Get DB from tenant object directly
export function getDbFromTenant(tenant: Tenant): Pool {
  if (!tenant?.databaseUrl) {
    throw new Error('❌ Tenant database URL not available in tenant object');
  }
  
  const connectionString = tenant.databaseUrl;
  
  if (pools.has(connectionString)) {
    return pools.get(connectionString)!;
  }
  
  const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false },
    max: 20,
    idleTimeoutMillis: 30000,
  });
  
  pools.set(connectionString, pool);
  return pool;
}

// Check if tenant database URL is set
export function isTenantDatabaseSet(): boolean {
  return tenantDatabaseUrl !== null;
}

// Get current tenant database URL (for debugging)
export function getCurrentTenantDatabaseUrl(): string | null {
  return tenantDatabaseUrl;
}