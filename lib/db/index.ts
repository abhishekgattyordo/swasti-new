

// import { Pool, types } from 'pg';
// import { headers } from 'next/headers';

// // Override DATE type to return as string
// types.setTypeParser(1082, (val: string) => val);

// // Database configurations for different domains (with fallback)
// const domainDatabaseMap: Record<string, string> = {
//   'his-app.com': process.env.DATABASE_URL_HIS_APP || process.env.DATABASE_URL || '',
//   'his-apollo.com': process.env.DATABASE_URL_HIS_APOLLO || process.env.DATABASE_URL || '',
//   'his-hospital.com': process.env.DATABASE_URL_HIS_HOSPITAL || process.env.DATABASE_URL || '',
//   'localhost': process.env.DATABASE_URL || '',
// };

// // Cache for different database connections
// const pools: Map<string, Pool> = new Map();

// // Get the current domain from request headers
// async function getCurrentDomain(): Promise<string> {
//   try {
//     const headersList = await headers();
//     const hostname = headersList.get('host') || '';
//     const domain = hostname.split(':')[0];
    
//     console.log(`🔍 Detected domain: ${domain}`);
    
//     // Check if we have a specific database for this domain
//     if (domainDatabaseMap[domain]) {
//       return domain;
//     }
    
//     // Default domain
//     return 'localhost';
//   } catch (error) {
//     console.warn('Could not detect domain, using default');
//     return 'localhost';
//   }
// }

// // Get the correct database connection for the current domain
// async function getPool(): Promise<Pool> {
//   const domain = await getCurrentDomain();
//   const connectionString = domainDatabaseMap[domain] || process.env.DATABASE_URL || '';
  
//   if (!connectionString) {
//     throw new Error('⚠️ DATABASE_URL is not set. Please check your environment variables.');
//   }
  
//   // Return cached pool if exists
//   if (pools.has(connectionString)) {
//     return pools.get(connectionString)!;
//   }
  
//   // Create new pool for this domain
//   console.log(`🔄 Creating new database pool for domain: ${domain}`);
  
//   const pool = new Pool({
//     connectionString: connectionString,
//     ssl: { rejectUnauthorized: false },
//     max: 30,
//     idleTimeoutMillis: 30000,
//     connectionTimeoutMillis: 10000,
//     statement_timeout: 30000,
//   });
  
//   pool.on('connect', () => {
//     console.log(`✅ Connected to PostgreSQL database for domain: ${domain}`);
//   });
  
//   pool.on('error', (err) => {
//     console.error(`❌ PostgreSQL error for domain ${domain}:`, err);
//   });
  
//   pools.set(connectionString, pool);
//   return pool;
// }

// // YOUR EXISTING QUERY FUNCTION - NO CHANGES NEEDED IN API ROUTES!
// export async function query(text: string, params?: any[]) {
//   const start = Date.now();
//   const pool = await getPool();
  
//   try {
//     const res = await pool.query(text, params);
//     const duration = Date.now() - start;
//     console.log('✅ Executed query:', { text: text.substring(0, 100), duration, rows: res.rowCount });
//     return res;
//   } catch (error) {
//     console.error('❌ Database query error:', error);
//     throw error;
//   }
// }

// // YOUR EXISTING TRANSACTION FUNCTION - NO CHANGES NEEDED!
// export async function transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
//   const pool = await getPool();
//   const client = await pool.connect();
  
//   try {
//     await client.query('BEGIN');
//     const result = await callback(client);
//     await client.query('COMMIT');
//     return result;
//   } catch (error) {
//     await client.query('ROLLBACK');
//     throw error;
//   } finally {
//     client.release();
//   }
// }

// export default { query, transaction };



import { Pool, types } from 'pg';
import { headers } from 'next/headers';

types.setTypeParser(1082, (val: string) => val);

const pools: Map<string, Pool> = new Map();
const tenantDbCache = new Map();

async function getTenantDatabaseUrl(): Promise<string> {
  const headersList = await headers();

  const host = headersList.get('host');
  const protocol = headersList.get('x-forwarded-proto') || 'http';

  if (!host) {
    throw new Error('❌ Host not found');
  }

  // ✅ STEP 1: CHECK CACHE FIRST
  if (tenantDbCache.has(host)) {
    console.log('⚡ Using cached DB for host:', host);
    return tenantDbCache.get(host)!;
  }

  console.log('🌐 Fetching tenant config for host:', host);

  const response = await fetch(`${protocol}://${host}/api/tenant/config`, {
   next: { revalidate: 300 }
  });

  if (!response.ok) {
    throw new Error(`❌ Tenant config failed for host: ${host}`);
  }

  const data = await response.json();

  const dbUrl = data?.tenant?.databaseUrl;

  if (!dbUrl) {
    throw new Error(`❌ No DB URL found for host: ${host}`);
  }

  // ✅ STEP 2: STORE IN CACHE
  tenantDbCache.set(host, dbUrl);

  console.log('✅ Cached DB for host:', host);

  return dbUrl;
}

async function getPool(): Promise<Pool> {
  const connectionString = await getTenantDatabaseUrl();
  
  if (!connectionString) {
    throw new Error('⚠️ DATABASE_URL is not set');
  }
  
  // Return cached pool if exists
  if (pools.has(connectionString)) {
    return pools.get(connectionString)!;
  }
  
  const dbName = connectionString.split('/').pop()?.split('?')[0];
  console.log(`🆕 Creating new database pool for: ${dbName}`);
  
  const pool = new Pool({
    connectionString: connectionString,
    ssl: connectionString.includes('sslmode=require') ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
  
  pool.on('connect', () => {
    console.log(`✅ Connected to database: ${dbName}`);
  });
  
  pool.on('error', (err) => {
    console.error(`❌ Database error for ${dbName}:`, err);
  });
  
  pools.set(connectionString, pool);
  return pool;
}

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const pool = await getPool();
  
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`✅ Query (${duration}ms): ${text.substring(0, 50)}`);
    return res;
  } catch (error) {
    console.error('❌ Query error:', error);
    throw error;
  }
}

export async function transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
  const pool = await getPool();
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function getCurrentDatabaseInfo() {
  try {
    const result = await query('SELECT current_database() as db_name, current_user as db_user, NOW() as server_time');
    return {
      success: true,
      database: result.rows[0].db_name,
      user: result.rows[0].db_user,
      serverTime: result.rows[0].server_time,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export default { query, transaction, getCurrentDatabaseInfo };