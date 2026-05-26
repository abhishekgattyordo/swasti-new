

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