/**
 * 🏛️ Veloura Living — Protected Shared Pending Registration Store
 * Securely isolates pending user credentials (password hashes, profile info)
 * backed by PostgreSQL/Supabase with atomic single-use consumption.
 * 
 * Strict Production Safety Policy:
 * In production (or when requirePostgres is true), a shared, durable PostgreSQL store
 * is MANDATORY. If PostgreSQL is unavailable or an error occurs in production, it FAILS CLOSED
 * and NEVER falls back to process-local Map or JSON files.
 * Local Map and JSON persistence are strictly isolated to non-production dev and testing environments.
 * 
 * Reference: docs/Veloura_Living_SRS.md (AUTH-001, AUTH-003, SEC-002)
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { queryPostgres, isPostgresAvailable } from '@/lib/db/postgres';

export interface PendingRegistration {
  id: string;
  email: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  createdAt: number;
  expiresAt: number;
}

export interface PendingStoreOptions {
  requirePostgres?: boolean;
}

export class PendingRegistrationStoreError extends Error {
  code: string;
  statusCode: number;

  constructor(message: string, code = 'PENDING_REGISTRATION_STORE_ERROR', statusCode = 500) {
    super(message);
    this.name = 'PendingRegistrationStoreError';
    this.code = code;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

const pendingStore = new Map<string, PendingRegistration>();
const EXPIRY_MS = 10 * 60 * 1000; // 10 minutes (strictly matches OTP challenge lifespan)

const DATA_DIR = path.join(process.cwd(), '.data');
const PENDING_FILE = path.join(DATA_DIR, 'pending_registrations.json');

function isProductionMode(options?: PendingStoreOptions): boolean {
  return process.env.NODE_ENV === 'production' || options?.requirePostgres === true;
}

function ensureDataDir(): void {
  if (process.env.NODE_ENV === 'production') return;
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {
      // Ignore directory creation failure in restricted environment
    }
  }
}

function loadFromDisk(): void {
  if (process.env.NODE_ENV === 'production') return;
  try {
    if (fs.existsSync(PENDING_FILE)) {
      const raw = fs.readFileSync(PENDING_FILE, 'utf-8');
      const records: PendingRegistration[] = JSON.parse(raw);
      const now = Date.now();
      records.forEach((r) => {
        if (r.expiresAt > now) {
          pendingStore.set(r.id, r);
        }
      });
    }
  } catch {
    // Graceful disk load fallback
  }
}

function saveToDisk(): void {
  if (process.env.NODE_ENV === 'production') return;
  try {
    ensureDataDir();
    const now = Date.now();
    const active = Array.from(pendingStore.values()).filter((r) => r.expiresAt > now);
    fs.writeFileSync(PENDING_FILE, JSON.stringify(active, null, 2), 'utf-8');
  } catch {
    // Graceful disk save fallback
  }
}

// Initial load for dev/test environments only
loadFromDisk();

/**
 * Stores a pending registration safely in PostgreSQL / shared store, returning an opaque identifier.
 * In production: strictly requires PostgreSQL; throws PendingRegistrationStoreError on failure.
 */
export async function savePendingRegistration(
  data: {
    email: string;
    passwordHash: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  },
  options?: PendingStoreOptions
): Promise<PendingRegistration> {
  const isProd = isProductionMode(options);
  const id = crypto.randomUUID();
  const now = Date.now();
  const expiresAt = now + EXPIRY_MS;

  const record: PendingRegistration = {
    id,
    email: data.email.toLowerCase().trim(),
    passwordHash: data.passwordHash,
    firstName: data.firstName ? data.firstName.trim() : '',
    lastName: data.lastName ? data.lastName.trim() : '',
    phone: data.phone ? data.phone.trim() : '',
    createdAt: now,
    expiresAt,
  };

  const hasPg = await isPostgresAvailable();

  if (isProd && !hasPg) {
    throw new PendingRegistrationStoreError(
      'Registration database is unavailable. Registration aborted for security.',
      'DB_UNAVAILABLE',
      503
    );
  }

  if (hasPg) {
    try {
      const res = await queryPostgres(
        `INSERT INTO pending_registrations 
         (id, email, password_hash, first_name, last_name, phone, created_at, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO NOTHING;`,
        [id, record.email, record.passwordHash, record.firstName, record.lastName, record.phone, now, expiresAt]
      );

      if (!res && isProd) {
        throw new PendingRegistrationStoreError(
          'Failed to persist registration record to database.',
          'DB_PERSISTENCE_FAILED',
          500
        );
      }
    } catch (err: any) {
      if (err instanceof PendingRegistrationStoreError) throw err;
      if (isProd) {
        throw new PendingRegistrationStoreError(
          'Database operation failed during registration persistence.',
          'DB_PERSISTENCE_FAILED',
          500
        );
      }
    }
  }

  if (isProd) {
    // In production, PostgreSQL is the sole durable store. Local fallback is strictly prohibited.
    return record;
  }

  // Development and test local store ONLY
  pendingStore.set(id, record);
  saveToDisk();
  return record;
}

/**
 * Retrieves an active pending registration by opaque ID from PostgreSQL or shared store.
 * In production: strictly queries PostgreSQL; never falls back to local storage.
 */
export async function getPendingRegistration(
  id: string,
  options?: PendingStoreOptions
): Promise<PendingRegistration | null> {
  const isProd = isProductionMode(options);
  const now = Date.now();
  const hasPg = await isPostgresAvailable();

  if (isProd && !hasPg) {
    throw new PendingRegistrationStoreError(
      'Registration database is unavailable.',
      'DB_UNAVAILABLE',
      503
    );
  }

  if (hasPg) {
    try {
      const res = await queryPostgres(
        `SELECT id, email, password_hash, first_name, last_name, phone, created_at, expires_at
         FROM pending_registrations
         WHERE id = $1 AND expires_at > $2;`,
        [id, now]
      );

      if (res && res.rows.length > 0) {
        const row = res.rows[0];
        return {
          id: row.id,
          email: row.email,
          passwordHash: row.password_hash,
          firstName: row.first_name || '',
          lastName: row.last_name || '',
          phone: row.phone || '',
          createdAt: Number(row.created_at),
          expiresAt: Number(row.expires_at),
        };
      }
      return null;
    } catch (err: any) {
      if (err instanceof PendingRegistrationStoreError) throw err;
      if (isProd) {
        throw new PendingRegistrationStoreError(
          'Database query failed while retrieving pending registration.',
          'DB_QUERY_FAILED',
          500
        );
      }
    }
  }

  if (isProd) {
    return null;
  }

  // Local fallback for development and testing only
  const record = pendingStore.get(id);
  if (!record) return null;
  if (now > record.expiresAt) {
    pendingStore.delete(id);
    saveToDisk();
    return null;
  }
  return record;
}

/**
 * Atomically consumes and removes a pending registration (single-use upon OTP verification).
 * Concurrency-safe: uses atomic database DELETE ... WHERE id = $1 AND expires_at > $2 RETURNING *
 * In production: strictly queries PostgreSQL; never falls back to local storage.
 */
export async function consumePendingRegistration(
  id: string,
  options?: PendingStoreOptions
): Promise<PendingRegistration | null> {
  const isProd = isProductionMode(options);
  const now = Date.now();
  const hasPg = await isPostgresAvailable();

  if (isProd && !hasPg) {
    throw new PendingRegistrationStoreError(
      'Registration database is unavailable.',
      'DB_UNAVAILABLE',
      503
    );
  }

  if (hasPg) {
    try {
      // ATOMIC SINGLE-USE CONSUMPTION: DELETE WHERE id = $1 AND expires_at > $2 RETURNING *
      const res = await queryPostgres(
        `DELETE FROM pending_registrations
         WHERE id = $1 AND expires_at > $2
         RETURNING id, email, password_hash, first_name, last_name, phone, created_at, expires_at;`,
        [id, now]
      );

      if (res && res.rows.length > 0) {
        const row = res.rows[0];
        if (!isProd) {
          pendingStore.delete(id);
          saveToDisk();
        }
        return {
          id: row.id,
          email: row.email,
          passwordHash: row.password_hash,
          firstName: row.first_name || '',
          lastName: row.last_name || '',
          phone: row.phone || '',
          createdAt: Number(row.created_at),
          expiresAt: Number(row.expires_at),
        };
      } else if (res && res.rows.length === 0) {
        // If Postgres explicitly returned 0 rows, it was already consumed or expired
        if (!isProd) {
          pendingStore.delete(id);
          saveToDisk();
        }
        return null;
      }
      if (res && isProd) {
        return null;
      }
    } catch (err: any) {
      if (err instanceof PendingRegistrationStoreError) throw err;
      if (isProd) {
        throw new PendingRegistrationStoreError(
          'Database query failed while consuming pending registration.',
          'DB_CONSUME_FAILED',
          500
        );
      }
    }
  }

  if (isProd) {
    return null;
  }

  // Local fallback for development and testing only
  const record = pendingStore.get(id);
  if (record) {
    pendingStore.delete(id);
    saveToDisk();
    if (now <= record.expiresAt) {
      return record;
    }
  }
  return null;
}

/**
 * Removes all expired pending registrations to prevent memory and database leakage.
 */
export async function cleanupExpired(): Promise<void> {
  const now = Date.now();
  const hasPg = await isPostgresAvailable();

  if (hasPg) {
    try {
      await queryPostgres(
        `DELETE FROM pending_registrations WHERE expires_at <= $1;`,
        [now]
      );
    } catch {
      // Non-blocking cleanup error
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    let modified = false;
    for (const [id, r] of pendingStore.entries()) {
      if (r.expiresAt <= now) {
        pendingStore.delete(id);
        modified = true;
      }
    }
    if (modified) {
      saveToDisk();
    }
  }
}

/**
 * Restores a consumed pending registration if user account persistence fails.
 * Ensures registration retry capability and avoids losing user registration state on transient DB errors.
 */
export async function restorePendingRegistration(
  record: PendingRegistration,
  options?: PendingStoreOptions
): Promise<void> {
  const isProd = isProductionMode(options);
  const now = Date.now();
  if (record.expiresAt <= now) return;

  const hasPg = await isPostgresAvailable();
  if (hasPg) {
    try {
      await queryPostgres(
        `INSERT INTO pending_registrations 
         (id, email, password_hash, first_name, last_name, phone, created_at, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE SET expires_at = EXCLUDED.expires_at;`,
        [record.id, record.email, record.passwordHash, record.firstName, record.lastName, record.phone, record.createdAt, record.expiresAt]
      );
    } catch {
      // Best-effort rollback
    }
  }

  if (!isProd) {
    pendingStore.set(record.id, record);
    saveToDisk();
  }
}
