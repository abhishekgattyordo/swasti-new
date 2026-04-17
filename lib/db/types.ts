// lib/db/types.ts

// Tenant configuration interface
export interface TenantConfig {
  id: string;           // Unique tenant identifier (e.g., 'apollo')
  name: string;         // Display name (e.g., 'Apollo Hospital')
  database: {
    host: string;
    port: number;
    databaseName: string;
    user: string;
    password: string;
    ssl?: boolean;      // Enable SSL for production
  };
  rateLimit: {
    maxRequests: number;   // Max requests per window
    windowMs: number;      // Time window in milliseconds
  };
  isActive: boolean;    // Can tenant access the system
}

// Database connection pool interface
export interface TenantPool {
  tenantId: string;
  pool: any;            // PostgreSQL connection pool
  createdAt: Date;
  lastUsedAt: Date;
}