


// import { Pool } from 'pg';

// const pools: Map<string, Pool> = new Map();

// // Cache for tenant database URLs
// let tenantDatabaseUrl: string | null = null;

// export function setTenantDatabaseUrl(url: string) {
//   tenantDatabaseUrl = url;
//   console.log('✅ Tenant database URL set:', url);
// }

// export function getDbFromDomain(dbName?: string): Pool {
//   // Use tenant database URL if available
//   let connectionString = tenantDatabaseUrl;
  
//   // Fallback to old configs if tenant URL not set
//   if (!connectionString) {
//     const configs: Record<string, string> = {
//       'his_app_db': process.env.DATABASE_URL_HIS_APP || '',
//       'his_apollo_db': process.env.DATABASE_URL_HIS_APOLLO || '',
//       'his_hospital_db': process.env.DATABASE_URL_HIS_HOSPITAL || '',
//     };
    
//     connectionString = (dbName && configs[dbName]) || process.env.DATABASE_URL || '';
//   }
  
//   if (!connectionString) {
//     throw new Error(`No database connection string available`);
//   }
  
//   if (pools.has(connectionString)) {
//     return pools.get(connectionString)!;
//   }
  
//   const pool = new Pool({
//     connectionString: connectionString,
//     ssl: { rejectUnauthorized: false },
//     max: 20,
//     idleTimeoutMillis: 30000,
//   });
  
//   pools.set(connectionString, pool);
//   return pool;
// }

// // Alternative: Get DB from tenant object directly
// export function getDbFromTenant(tenant: any): Pool {
//   if (!tenant?.databaseUrl) {
//     throw new Error('Tenant database URL not available');
//   }
  
//   const connectionString = tenant.databaseUrl;
  
//   if (pools.has(connectionString)) {
//     return pools.get(connectionString)!;
//   }
  
//   const pool = new Pool({
//     connectionString: connectionString,
//     ssl: { rejectUnauthorized: false },
//     max: 20,
//     idleTimeoutMillis: 30000,
//   });
  
//   pools.set(connectionString, pool);
//   return pool;
// }

import { Pool } from 'pg';

const pools: Map<string, Pool> = new Map();

// Cache for tenant database URLs
let tenantDatabaseUrl: string | null = null;

export function setTenantDatabaseUrl(url: string) {
  tenantDatabaseUrl = url;
  console.log('✅ Tenant database URL set:', url);
}

export function getDbFromDomain(dbName?: string): Pool {
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
export function getDbFromTenant(tenant: any): Pool {
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