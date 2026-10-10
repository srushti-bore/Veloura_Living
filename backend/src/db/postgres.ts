/**
 * 🏛️ Veloura Living — PostgreSQL Database Connection Pool (Backend Standalone)
 * Supports: Local PostgreSQL, Supabase PostgreSQL, and cloud relational databases.
 * Reference: docs/Veloura_Living_SRS.md
 */

import { Pool, PoolConfig, QueryResult, QueryResultRow, PoolClient } from 'pg';

let pool: Pool | null = null;
let isPoolInitialized = false;

function getDatabaseConfig(): PoolConfig | null {
  const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL;

  if (databaseUrl && !databaseUrl.includes('placeholder')) {
    return {
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === 'production' || databaseUrl.includes('supabase')
        ? { rejectUnauthorized: false }
        : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    };
  }

  // Individual parameters fallback
  if (process.env.PGHOST && process.env.PGDATABASE) {
    return {
      host: process.env.PGHOST,
      port: Number(process.env.PGPORT) || 5432,
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    };
  }

  return null;
}

export function getPostgresPool(): Pool | null {
  if (isPoolInitialized) {
    return pool;
  }

  isPoolInitialized = true;
  const config = getDatabaseConfig();

  if (!config) {
    return null;
  }

  try {
    pool = new Pool(config);

    pool.on('error', (err) => {
      console.warn('⚠️ [PostgreSQL Pool Error (Backend)]:', err.message);
    });

    return pool;
  } catch (err: any) {
    console.warn('⚠️ [PostgreSQL Init Failed (Backend)]:', err.message);
    pool = null;
    return null;
  }
}

export async function queryPostgres<T extends QueryResultRow = any>(
  text: string,
  params: any[] = []
): Promise<QueryResult<T> | null> {
  const activePool = getPostgresPool();
  if (!activePool) {
    return null;
  }

  try {
    const result = await activePool.query<T>(text, params);
    return result;
  } catch (error: any) {
    console.warn('⚠️ [PostgreSQL Query Error (Backend)]:', error.message);
    return null;
  }
}

export async function getPostgresClient(): Promise<PoolClient | null> {
  const activePool = getPostgresPool();
  if (!activePool) return null;
  try {
    return await activePool.connect();
  } catch (err: any) {
    console.warn('⚠️ [PostgreSQL Client Checkout Failed (Backend)]:', err.message);
    return null;
  }
}

export async function isPostgresAvailable(): Promise<boolean> {
  const activePool = getPostgresPool();
  if (!activePool) return false;

  try {
    const res = await activePool.query('SELECT 1 as health');
    return Boolean(res && res.rows && res.rows[0]?.health === 1);
  } catch {
    return false;
  }
}
