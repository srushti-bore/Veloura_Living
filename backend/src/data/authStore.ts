/**
 * 🏛️ Veloura Living — In-Memory & Database-Ready Auth Store
 * Initialized with canonical seeded accounts from Phase 1 Foundation.
 */

import { DbUser, DbProfile, DbAddress, UserRoleEnum } from '@/types';
import { hashPassword } from '../auth/password';
import { queryPostgres, isPostgresAvailable, getPostgresClient } from '../db/postgres';

export class UserPersistenceError extends Error {
  statusCode: number;
  code: string;

  constructor(message = 'User persistence failed', code = 'USER_PERSISTENCE_FAILED', statusCode = 500) {
    super(message);
    this.name = 'UserPersistenceError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export interface SaveUserOptions {
  requirePostgres?: boolean;
  isNewUser?: boolean;
}

export interface UserRecord {
  user: DbUser;
  roles: UserRoleEnum[];
  profile: DbProfile;
  addresses: DbAddress[];
  resetToken?: string;
  resetTokenExpires?: number; // 30 minutes (SRS AUTH-005)
  verificationToken?: string;
  verificationTokenExpires?: number; // 24 hours (SRS AUTH-003)
  failedAttempts?: number; // Counter for failed attempts (SRS AUTH-007)
  firstFailedAt?: number;
  lockoutUntil?: number; // Timestamp until which account is locked (15 mins)
}

// Global in-memory storage singleton for fast runtime & testing
const globalUsers: Map<string, UserRecord> = new Map();

// Initialize seeded accounts
let isInitialized = false;

export async function initAuthStore() {
  if (isInitialized) return;
  isInitialized = true;

  const defaultPasswordHash = await hashPassword('VelouraAdmin2026!');

  // 1. Admin Account
  globalUsers.set('admin@velouraliving.com', {
    user: {
      id: '33333333-3333-3333-3333-333333333301',
      email: 'admin@velouraliving.com',
      password_hash: defaultPasswordHash,
      status: 'ACTIVE',
      is_email_verified: true,
      created_at: '2026-10-01T00:00:00Z',
      updated_at: '2026-10-01T00:00:00Z',
    },
    roles: ['ADMIN'],
    profile: {
      user_id: '33333333-3333-3333-3333-333333333301',
      first_name: 'Eleanor',
      last_name: 'Vance',
      phone: '+91 98200 12345',
      avatar_url: '/images/team/eleanor.jpg',
      preferred_currency: 'INR',
      interior_style_preference: 'Warm Minimalist',
      created_at: '2026-10-01T00:00:00Z',
      updated_at: '2026-10-01T00:00:00Z',
    },
    addresses: [],
  });

  // 2. Concierge / Manager Account
  globalUsers.set('concierge@velouraliving.com', {
    user: {
      id: '33333333-3333-3333-3333-333333333302',
      email: 'concierge@velouraliving.com',
      password_hash: defaultPasswordHash,
      status: 'ACTIVE',
      is_email_verified: true,
      created_at: '2026-10-01T00:00:00Z',
      updated_at: '2026-10-01T00:00:00Z',
    },
    roles: ['MANAGER'],
    profile: {
      user_id: '33333333-3333-3333-3333-333333333302',
      first_name: 'Julian',
      last_name: 'Mercer',
      phone: '+91 98200 67890',
      preferred_currency: 'INR',
      interior_style_preference: 'Japandi Quietude',
      created_at: '2026-10-01T00:00:00Z',
      updated_at: '2026-10-01T00:00:00Z',
    },
    addresses: [],
  });

  // 3. Verified Client Account
  globalUsers.set('client@example.com', {
    user: {
      id: '33333333-3333-3333-3333-333333333303',
      email: 'client@example.com',
      password_hash: defaultPasswordHash,
      status: 'ACTIVE',
      is_email_verified: true,
      created_at: '2026-10-01T00:00:00Z',
      updated_at: '2026-10-01T00:00:00Z',
    },
    roles: ['CUSTOMER'],
    profile: {
      user_id: '33333333-3333-3333-3333-333333333303',
      first_name: 'Aarav',
      last_name: 'Mehta',
      phone: '+91 98111 22334',
      preferred_currency: 'INR',
      interior_style_preference: 'Modern Organic',
      created_at: '2026-10-01T00:00:00Z',
      updated_at: '2026-10-01T00:00:00Z',
    },
    addresses: [
      {
        id: '44444444-4444-4444-4444-444444444401',
        user_id: '33333333-3333-3333-3333-333333333303',
        full_name: 'Aarav Mehta',
        phone: '+91 98111 22334',
        address_line1: 'Penthouse 42B, The Imperial Towers',
        address_line2: 'Tardeo Main Road',
        landmark: 'Near Altamount Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        postal_code: '400034',
        country: 'India',
        is_default_shipping: true,
        is_default_billing: true,
        created_at: '2026-10-01T00:00:00Z',
        updated_at: '2026-10-01T00:00:00Z',
      },
    ],
  });
}

export function findUserByEmail(email: string): UserRecord | undefined {
  return globalUsers.get(email.toLowerCase().trim());
}

/**
 * Reset memory cache for testing verification.
 */
export function clearUsersCacheForTesting(): void {
  globalUsers.clear();
}

/**
 * Find user by email with real-time authoritative PostgreSQL database synchronization.
 * Guarantees cross-instance lookup and persistence durability across process restarts.
 */
export async function findUserByEmailAuthoritative(
  email: string,
  options?: { requirePostgres?: boolean }
): Promise<UserRecord | undefined> {
  if (!email) return undefined;
  const normalized = email.toLowerCase().trim();
  const isProd = process.env.NODE_ENV === 'production' || options?.requirePostgres === true;
  let cached = globalUsers.get(normalized);

  const hasPg = await isPostgresAvailable();

  if (isProd && !hasPg) {
    throw new UserPersistenceError(
      'User database is unavailable. Account lookup failed.',
      'DB_UNAVAILABLE',
      503
    );
  }

  if (hasPg) {
    try {
      const res = await queryPostgres<{
        id: string;
        email: string;
        password_hash: string;
        status: string;
        is_email_verified: boolean;
        created_at: string;
        updated_at: string;
      }>(
        'SELECT id, email, password_hash, status, is_email_verified, created_at, updated_at FROM users WHERE LOWER(TRIM(email)) = $1',
        [normalized]
      );

      if (res === null) {
        if (isProd) {
          throw new UserPersistenceError(
            'Database query failed during authoritative account lookup.',
            'DB_UNAVAILABLE',
            503
          );
        }
        return cached;
      }

      if (res.rows.length === 0) {
        globalUsers.delete(normalized);
        return undefined;
      }

      const row = res.rows[0];

      // Roles lookup
      const rolesRes = await queryPostgres<{ role_name: string }>(
        'SELECT r.name as role_name FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = $1',
        [row.id]
      );
      if (rolesRes === null && isProd) {
        throw new UserPersistenceError(
          'Database query failed during roles lookup.',
          'DB_UNAVAILABLE',
          503
        );
      }
      const roles: UserRoleEnum[] =
        rolesRes && rolesRes.rows.length > 0
          ? (rolesRes.rows.map((r) => r.role_name as any) as UserRoleEnum[])
          : ['CUSTOMER'];

      // Profiles lookup
      const profRes = await queryPostgres<{
        user_id: string;
        first_name: string;
        last_name: string;
        phone: string;
        avatar_url: string;
        preferred_currency: string;
        interior_style_preference: string;
        created_at: string;
        updated_at: string;
      }>(
        'SELECT user_id, first_name, last_name, phone, avatar_url, preferred_currency, interior_style_preference, created_at, updated_at FROM profiles WHERE user_id = $1',
        [row.id]
      );
      if (profRes === null && isProd) {
        throw new UserPersistenceError(
          'Database query failed during profile lookup.',
          'DB_UNAVAILABLE',
          503
        );
      }
      const pRow = profRes?.rows[0];
      const profile: DbProfile = {
        user_id: row.id,
        first_name: pRow?.first_name || '',
        last_name: pRow?.last_name || '',
        phone: pRow?.phone || '',
        avatar_url: pRow?.avatar_url || cached?.profile?.avatar_url,
        preferred_currency: pRow?.preferred_currency || 'INR',
        interior_style_preference: pRow?.interior_style_preference || 'Warm Minimalist',
        created_at: pRow?.created_at || row.created_at,
        updated_at: pRow?.updated_at || row.updated_at,
      };

      const authoritativeRecord: UserRecord = {
        user: {
          id: row.id,
          email: row.email,
          password_hash: row.password_hash,
          status: row.status as any,
          is_email_verified: row.is_email_verified,
          created_at: row.created_at,
          updated_at: row.updated_at,
        },
        roles,
        profile,
        addresses: cached?.addresses || [],
        failedAttempts: cached?.failedAttempts,
        firstFailedAt: cached?.firstFailedAt,
        lockoutUntil: cached?.lockoutUntil,
      };

      globalUsers.set(normalized, authoritativeRecord);
      return authoritativeRecord;
    } catch (err: any) {
      if (err instanceof UserPersistenceError) throw err;
      if (isProd) {
        throw new UserPersistenceError(
          'Database operation failed during authoritative account lookup.',
          'DB_UNAVAILABLE',
          503
        );
      }
      console.warn('⚠️ [PostgreSQL findUserByEmail Authoritative Error (Backend)]:', err.message);
      return cached;
    }
  }

  return cached;
}

export function findUserById(id: string): UserRecord | undefined {
  for (const record of globalUsers.values()) {
    if (record.user.id === id) {
      return record;
    }
  }
  return undefined;
}

export async function findUserByIdAuthoritative(
  id: string,
  options?: { requirePostgres?: boolean }
): Promise<UserRecord | undefined> {
  const local = findUserById(id);
  const isProd = process.env.NODE_ENV === 'production' || options?.requirePostgres === true;
  const hasPg = await isPostgresAvailable();

  if (isProd && !hasPg) {
    throw new UserPersistenceError(
      'User database is unavailable. Account lookup failed.',
      'DB_UNAVAILABLE',
      503
    );
  }

  if (hasPg) {
    try {
      const res = await queryPostgres<{
        id: string;
        email: string;
        password_hash: string;
        status: string;
        is_email_verified: boolean;
        created_at: string;
        updated_at: string;
      }>(
        'SELECT id, email, password_hash, status, is_email_verified, created_at, updated_at FROM users WHERE id = $1',
        [id]
      );

      if (res === null) {
        if (isProd) {
          throw new UserPersistenceError(
            'Database query failed during authoritative account lookup.',
            'DB_UNAVAILABLE',
            503
          );
        }
        return local;
      }

      if (res.rows.length === 0) {
        if (local) {
          globalUsers.delete(local.user.email.toLowerCase().trim());
        }
        return undefined;
      }

      const row = res.rows[0];
      const rolesRes = await queryPostgres<{ role_name: string }>(
        'SELECT r.name as role_name FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = $1',
        [id]
      );
      if (rolesRes === null && isProd) {
        throw new UserPersistenceError(
          'Database query failed during roles lookup.',
          'DB_UNAVAILABLE',
          503
        );
      }
      const roles =
        rolesRes && rolesRes.rows.length > 0
          ? rolesRes.rows.map((r) => r.role_name as any)
          : ['CUSTOMER'];

      const profRes = await queryPostgres<{
        user_id: string;
        first_name: string;
        last_name: string;
        phone: string;
        avatar_url: string;
        preferred_currency: string;
        interior_style_preference: string;
        created_at: string;
        updated_at: string;
      }>(
        'SELECT user_id, first_name, last_name, phone, avatar_url, preferred_currency, interior_style_preference, created_at, updated_at FROM profiles WHERE user_id = $1',
        [id]
      );
      if (profRes === null && isProd) {
        throw new UserPersistenceError(
          'Database query failed during profile lookup.',
          'DB_UNAVAILABLE',
          503
        );
      }
      const pRow = profRes?.rows[0];
      const fresh: UserRecord = {
        user: {
          id: row.id,
          email: row.email,
          password_hash: row.password_hash,
          status: row.status as any,
          is_email_verified: row.is_email_verified,
          created_at: row.created_at || new Date().toISOString(),
          updated_at: row.updated_at || new Date().toISOString(),
        },
        roles,
        profile: {
          user_id: row.id,
          first_name: pRow?.first_name || '',
          last_name: pRow?.last_name || '',
          phone: pRow?.phone || '',
          avatar_url: pRow?.avatar_url,
          preferred_currency: pRow?.preferred_currency || 'INR',
          interior_style_preference: pRow?.interior_style_preference || 'Warm Minimalist',
          created_at: pRow?.created_at || new Date().toISOString(),
          updated_at: pRow?.updated_at || new Date().toISOString(),
        },
        addresses: [],
      };
      globalUsers.set(row.email.toLowerCase().trim(), fresh);
      return fresh;
    } catch (err: any) {
      if (err instanceof UserPersistenceError) throw err;
      if (isProd) {
        throw new UserPersistenceError(
          'Database operation failed during authoritative account lookup.',
          'DB_UNAVAILABLE',
          503
        );
      }
      console.warn('⚠️ [PostgreSQL findUserById Authoritative Error (Backend)]:', err.message);
      return local;
    }
  }
  return local;
}

/**
 * Asynchronously and durably persists user record, roles, and profile into PostgreSQL.
 * In production: strictly requires working PostgreSQL; throws UserPersistenceError on failure.
 * Concurrency-safe: respects unique email constraints to prevent duplicate account creation.
 */
export async function saveUserRecordAsync(
  record: UserRecord,
  options?: SaveUserOptions
): Promise<UserRecord> {
  const isProd = process.env.NODE_ENV === 'production' || options?.requirePostgres === true;
  const isNewUser = options?.isNewUser === true;
  const email = record.user.email.toLowerCase().trim();

  if (!record.user.id) {
    record.user.id = crypto.randomUUID();
  }
  if (record.profile && !record.profile.user_id) {
    record.profile.user_id = record.user.id;
  }

  // Pre-check for duplicate new user registration in cache (for fast rejection and offline non-prod)
  if (isNewUser) {
    // Strictly enforce CUSTOMER role for new user registration — prevent privilege escalation across all environments
    record.roles = ['CUSTOMER'];

    const existingCached = globalUsers.get(email);
    if (existingCached && existingCached.user.is_email_verified) {
      throw new UserPersistenceError(
        'An account with this email address already exists. Please sign in instead.',
        'CONFLICT',
        409
      );
    }
  }

  const hasPg = await isPostgresAvailable();

  if (isProd && !hasPg) {
    throw new UserPersistenceError(
      'User database is unavailable. Account persistence failed.',
      'DB_UNAVAILABLE',
      503
    );
  }

  if (hasPg) {
    const client = await getPostgresClient();
    if (!client) {
      // Must fail closed; do NOT fall back to a users-only write
      throw new UserPersistenceError(
        'Failed to acquire dedicated transaction client for account persistence.',
        'DB_CLIENT_UNAVAILABLE',
        503
      );
    }

    try {
      await client.query('BEGIN');

      if (isNewUser) {
        // Enforce CUSTOMER role strictly for new registration — prevent privilege escalation
        record.roles = ['CUSTOMER'];

        // 1. Users Table Insert strictly (no generic upsert)
        try {
          await client.query(
            `INSERT INTO users (id, email, password_hash, status, is_email_verified, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              record.user.id,
              email,
              record.user.password_hash,
              record.user.status || 'ACTIVE',
              record.user.is_email_verified ?? true,
              record.user.created_at || new Date().toISOString(),
              record.user.updated_at || new Date().toISOString(),
            ]
          );
        } catch (insertErr: any) {
          if (insertErr.code === '23505') {
            throw new UserPersistenceError(
              'An account with this email address already exists. Please sign in instead.',
              'CONFLICT',
              409
            );
          }
          throw insertErr;
        }

        // 2. Profile Table Insert
        if (record.profile) {
          await client.query(
            `INSERT INTO profiles (user_id, first_name, last_name, phone, avatar_url, preferred_currency, interior_style_preference, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              record.user.id,
              record.profile.first_name || '',
              record.profile.last_name || '',
              record.profile.phone || '',
              record.profile.avatar_url || null,
              record.profile.preferred_currency || 'INR',
              record.profile.interior_style_preference || 'Warm Minimalist',
              record.profile.created_at || new Date().toISOString(),
              record.profile.updated_at || new Date().toISOString(),
            ]
          );
        }

        // 3. Role Assignment (ensure CUSTOMER role exists, link in user_roles)
        await client.query(
          `INSERT INTO roles (id, name, description)
           VALUES (gen_random_uuid(), 'CUSTOMER', 'Customer role')
           ON CONFLICT (name) DO NOTHING`
        );
        await client.query(
          `INSERT INTO user_roles (user_id, role_id)
           SELECT $1, id FROM roles WHERE name = 'CUSTOMER'
           ON CONFLICT DO NOTHING`,
          [record.user.id]
        );
      } else {
        // EXPLICITLY AUTHORIZED UPDATE: target existing user by ID (or email fallback)
        const existingRes = await client.query(
          'SELECT id, password_hash, status, is_email_verified FROM users WHERE id = $1',
          [record.user.id]
        );
        if (existingRes.rows.length === 0) {
          const existingByEmail = await client.query(
            'SELECT id, password_hash, status, is_email_verified FROM users WHERE LOWER(TRIM(email)) = $1',
            [email]
          );
          if (existingByEmail.rows.length === 0) {
            throw new UserPersistenceError('User account not found for update.', 'NOT_FOUND', 404);
          }
          record.user.id = existingByEmail.rows[0].id;
        }

        // Update users table without overwriting password_hash unless explicitly changed
        await client.query(
          `UPDATE users
           SET status = COALESCE($2, status),
               is_email_verified = COALESCE($3, is_email_verified),
               password_hash = COALESCE($4, password_hash),
               updated_at = $5
           WHERE id = $1`,
          [
            record.user.id,
            record.user.status,
            record.user.is_email_verified,
            record.user.password_hash,
            record.user.updated_at || new Date().toISOString(),
          ]
        );

        // Update profile table
        if (record.profile) {
          await client.query(
            `INSERT INTO profiles (user_id, first_name, last_name, phone, avatar_url, preferred_currency, interior_style_preference, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             ON CONFLICT (user_id) DO UPDATE 
             SET first_name = EXCLUDED.first_name,
                 last_name = EXCLUDED.last_name,
                 phone = EXCLUDED.phone,
                 avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
                 preferred_currency = COALESCE(EXCLUDED.preferred_currency, profiles.preferred_currency),
                 interior_style_preference = COALESCE(EXCLUDED.interior_style_preference, profiles.interior_style_preference),
                 updated_at = EXCLUDED.updated_at`,
            [
              record.user.id,
              record.profile.first_name || '',
              record.profile.last_name || '',
              record.profile.phone || '',
              record.profile.avatar_url || null,
              record.profile.preferred_currency || 'INR',
              record.profile.interior_style_preference || 'Warm Minimalist',
              record.profile.created_at || new Date().toISOString(),
              record.profile.updated_at || new Date().toISOString(),
            ]
          );
        }
      }

      await client.query('COMMIT');
    } catch (err: any) {
      await client.query('ROLLBACK').catch(() => {});
      if (err instanceof UserPersistenceError) throw err;
      throw new UserPersistenceError(
        `Database persistence failed for user account: ${err.message}`,
        'DB_PERSISTENCE_FAILED',
        500
      );
    } finally {
      client.release();
    }
  }

  // ONLY update the cache and return registration success after complete transaction commits
  globalUsers.set(email, record);
  return record;
}

export function saveUserRecord(record: UserRecord): void {
  globalUsers.set(record.user.email.toLowerCase().trim(), record);
  saveUserRecordAsync(record).catch(() => {});
}

/**
 * Check if account is locked out (SRS AUTH-007: 5 failed attempts in 15 mins -> 15 mins lockout).
 */
export function checkAccountLockout(email: string): { isLocked: boolean; remainingMinutes?: number } {
  const record = findUserByEmail(email);
  if (!record || !record.lockoutUntil) {
    return { isLocked: false };
  }

  const now = Date.now();
  if (record.lockoutUntil > now) {
    const remainingMinutes = Math.ceil((record.lockoutUntil - now) / (60 * 1000));
    return { isLocked: true, remainingMinutes };
  }

  // Lockout expired, reset counters
  record.lockoutUntil = undefined;
  record.failedAttempts = 0;
  record.firstFailedAt = undefined;
  saveUserRecord(record);
  return { isLocked: false };
}

/**
 * Record a failed login attempt and apply 15-minute lock on 5th attempt (SRS AUTH-007).
 */
export function recordFailedLogin(email: string): { isLocked: boolean; remainingMinutes?: number; attempts: number } {
  const record = findUserByEmail(email);
  if (!record) {
    return { isLocked: false, attempts: 1 };
  }

  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes window

  if (!record.firstFailedAt || now - record.firstFailedAt > windowMs) {
    record.firstFailedAt = now;
    record.failedAttempts = 1;
  } else {
    record.failedAttempts = (record.failedAttempts || 0) + 1;
  }

  if (record.failedAttempts >= 5) {
    record.lockoutUntil = now + (15 * 60 * 1000); // Lock for 15 minutes
    saveUserRecord(record);
    return { isLocked: true, remainingMinutes: 15, attempts: record.failedAttempts };
  }

  saveUserRecord(record);
  return { isLocked: false, attempts: record.failedAttempts };
}

/**
 * Reset failed login counters on successful login.
 */
export function resetFailedLogin(email: string): void {
  const record = findUserByEmail(email);
  if (record) {
    record.failedAttempts = 0;
    record.firstFailedAt = undefined;
    record.lockoutUntil = undefined;
    saveUserRecord(record);
  }
}

/**
 * Generate a single-use password reset token expiring in 30 minutes (SRS AUTH-005).
 */
export function createPasswordResetToken(email: string): string | undefined {
  const record = findUserByEmail(email);
  if (!record) return undefined;

  const token = `reset_${crypto.randomUUID().replace(/-/g, '')}`;
  record.resetToken = token;
  record.resetTokenExpires = Date.now() + (30 * 60 * 1000); // 30 minutes
  saveUserRecord(record);
  return token;
}

/**
 * Generate email verification token expiring in 24 hours (SRS AUTH-003).
 */
export function createEmailVerificationToken(email: string): string | undefined {
  const record = findUserByEmail(email);
  if (!record) return undefined;

  const token = `verify_${crypto.randomUUID().replace(/-/g, '')}`;
  record.verificationToken = token;
  record.verificationTokenExpires = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
  saveUserRecord(record);
  return token;
}
