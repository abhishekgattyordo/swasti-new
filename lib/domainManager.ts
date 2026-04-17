




import { Pool } from 'pg';

const pools: Map<string, Pool> = new Map();

export function getDbFromDomain(dbName: string): Pool {
  const configs: Record<string, string> = {
    'his_app_db': process.env.DATABASE_URL_HIS_APP || '',
    'his_apollo_db': process.env.DATABASE_URL_HIS_APOLLO || '',
    'his_hospital_db': process.env.DATABASE_URL_HIS_HOSPITAL || '',
  };
  
  const connectionString = configs[dbName] || process.env.DATABASE_URL || '';
  
  if (!connectionString) {
    throw new Error(`No connection string for ${dbName}`);
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