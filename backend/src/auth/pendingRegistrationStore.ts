/**
 * 🏛️ Veloura Living — Protected Shared Pending Registration Store (Backend Standalone)
 * Securely isolates pending user credentials (password hashes, profile info)
 * backed by PostgreSQL/Supabase with atomic single-use consumption and persistent local fallback.
 * Reference: docs/Veloura_Living_SRS.md (AUTH-001, AUTH-003, SEC-002)
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { queryPostgres, isPostgresAvailable } from '../db/postgres';

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

const pendingStore = new Map<string, PendingRegistration>();
const EXPIRY_MS = 10 * 60 * 1000; // 10 minutes (strictly matches OTP challenge lifespan)

const DATA_DIR = path.join(process.cwd(), '.data');
const PENDING_FILE = path.join(DATA_DIR, 'pending_registrations.json');

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {
      // Ignore directory creation failure in restricted environment
    }
  }
}

function loadFromDisk(): void {
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
  try {
    ensureDataDir();
    const now = Date.now();
    const active = Array.from(pendingStore.values()).filter((r) => r.expiresAt > now);
    fs.writeFileSync(PENDING_FILE, JSON.stringify(active, null, 2), 'utf-8');
  } catch {
    // Graceful disk save fallback
  }
}

// Initial load
loadFromDisk();

/**
 * Stores a pending registration safely in PostgreSQL / shared store, returning an opaque identifier.
 */
export async function savePendingRegistration(data: {
  email: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}): Promise<PendingRegistration> {
  await cleanupExpired();
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
  if (hasPg) {
    try {
      await queryPostgres(
        `INSERT INTO pending_registrations 
         (id, email, password_hash, first_name, last_name, phone, created_at, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO NOTHING;`,
        [id, record.email, record.passwordHash, record.firstName, record.lastName, record.phone, now, expiresAt]
      );
    } catch (err: any) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Database persistence failed for pending registration.');
      }
    }
  }

  // Also cache locally
  pendingStore.set(id, record);
  saveToDisk();
  return record;
}

/**
 * Retrieves an active pending registration by opaque ID from PostgreSQL or shared store.
 */
export async function getPendingRegistration(id: string): Promise<PendingRegistration | null> {
  await cleanupExpired();
  const now = Date.now();

  const hasPg = await isPostgresAvailable();
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
    } catch {
      // Fallback to local store if query fails in dev
    }
  }

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
 * Prevents replay attacks across multi-instance environments.
 */
export async function consumePendingRegistration(id: string): Promise<PendingRegistration | null> {
  const now = Date.now();
  const hasPg = await isPostgresAvailable();

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
        pendingStore.delete(id);
        saveToDisk();
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

      // If Postgres returned 0 rows, it was already consumed or expired
      pendingStore.delete(id);
      saveToDisk();
      return null;
    } catch {
      // Fallback to local store if query fails in dev
    }
  }

  // Local fallback
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
