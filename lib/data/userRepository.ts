/**
 * 🏛️ Veloura Living — Production User & Identity Repository
 * Primary Source of Truth: PostgreSQL / Supabase Relational Database.
 * Resilient Persistence: Automatic disk persistence fallback (.data/users_store.json) for offline dev.
 * Reference: docs/Veloura_Living_SRS.md (Section 2, 4, 31, 43, 71)
 */

import fs from 'fs';
import path from 'path';
import { DbUser, DbProfile, DbAddress, UserRoleEnum } from '@/types';
import { hashPassword } from '@/lib/auth/password';
import { queryPostgres, isPostgresAvailable, getPostgresClient } from '@/lib/db/postgres';
import { AppError } from '@/lib/api/errorHandler';

export class UserPersistenceError extends AppError {
  constructor(message = 'User persistence failed', code = 'USER_PERSISTENCE_FAILED', statusCode = 500) {
    super(message, statusCode, code);
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
  oauthProviders?: {
    provider: 'google';
    providerId: string;
    connectedAt: string;
  }[];
}

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  roles?: UserRoleEnum[];
  avatarUrl?: string;
  preferredCurrency?: string;
  interiorStylePreference?: string;
  isEmailVerified?: boolean;
}

export interface GoogleUserProfileInput {
  googleId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

// Persistent disk storage path for local persistence
const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'users_store.json');

// Memory cache synchronized with database / disk
const usersCache: Map<string, UserRecord> = new Map();
let isInitialized = false;

function ensureDataDirectory(): void {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {
      // Ignore if directory exists or fails in read-only environment
    }
  }
}

export function loadFromDisk(): void {
  if (process.env.NODE_ENV === 'production') return;
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const records: UserRecord[] = JSON.parse(raw);
      usersCache.clear();
      records.forEach((r) => {
        usersCache.set(r.user.email.toLowerCase().trim(), r);
      });
    }
  } catch (err: any) {
    console.warn('⚠️ [UserRepo Disk Load Error]:', err.message);
  }
}

function saveToDisk(): void {
  if (process.env.NODE_ENV === 'production') return;
  try {
    ensureDataDirectory();
    const records = Array.from(usersCache.values());
    fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2), 'utf-8');
  } catch (err: any) {
    console.warn('⚠️ [UserRepo Disk Save Error]:', err.message);
  }
}

/**
 * Seed canonical foundational accounts if database is empty.
 */
async function seedDefaultAccounts(): Promise<void> {
  const adminPasswordHash = await hashPassword(process.env.ADMIN_INITIAL_PASSWORD || 'VelouraAdmin2026!');
  const clientPasswordHash = await hashPassword('VelouraClient2026!');

  // 1. Master Admin
  if (!usersCache.has('admin@velouraliving.com')) {
    const adminRecord: UserRecord = {
      user: {
        id: '33333333-3333-3333-3333-333333333301',
        email: 'admin@velouraliving.com',
        password_hash: adminPasswordHash,
        status: 'ACTIVE',
        is_email_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      addresses: [],
    };
    usersCache.set('admin@velouraliving.com', adminRecord);
  }

  // 2. Manager Account
  if (!usersCache.has('concierge@velouraliving.com')) {
    const managerRecord: UserRecord = {
      user: {
        id: '33333333-3333-3333-3333-333333333302',
        email: 'concierge@velouraliving.com',
        password_hash: adminPasswordHash,
        status: 'ACTIVE',
        is_email_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      roles: ['MANAGER'],
      profile: {
        user_id: '33333333-3333-3333-3333-333333333302',
        first_name: 'Julian',
        last_name: 'Mercer',
        phone: '+91 98200 67890',
        preferred_currency: 'INR',
        interior_style_preference: 'Japandi Quietude',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      addresses: [],
    };
    usersCache.set('concierge@velouraliving.com', managerRecord);
  }

  // 3. Client Account
  if (!usersCache.has('client@example.com')) {
    const clientRecord: UserRecord = {
      user: {
        id: '33333333-3333-3333-3333-333333333303',
        email: 'client@example.com',
        password_hash: clientPasswordHash,
        status: 'ACTIVE',
        is_email_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      roles: ['CUSTOMER'],
      profile: {
        user_id: '33333333-3333-3333-3333-333333333303',
        first_name: 'Aarav',
        last_name: 'Mehta',
        phone: '+91 98111 22334',
        preferred_currency: 'INR',
        interior_style_preference: 'Modern Organic',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
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
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
    };
    usersCache.set('client@example.com', clientRecord);
  }

  saveToDisk();
}

/**
 * Initialize repository, load disk cache, and synchronize with PostgreSQL if available.
 */
export async function initUserRepository(): Promise<void> {
  if (isInitialized) return;
  isInitialized = true;

  // 1. Load persistent disk cache
  loadFromDisk();

  // 2. Seed initial baseline accounts if missing
  await seedDefaultAccounts();

  // 3. If PostgreSQL is reachable, attempt to sync/verify tables
  const hasPg = await isPostgresAvailable();
  if (hasPg) {
    try {
      const res = await queryPostgres<{ id: string; email: string; password_hash: string; status: string; is_email_verified: boolean }>(
        'SELECT id, email, password_hash, status, is_email_verified, created_at, updated_at FROM users'
      );
      if (res && res.rows.length > 0) {
        for (const row of res.rows) {
          const email = row.email.toLowerCase().trim();
          if (!usersCache.has(email)) {
            usersCache.set(email, {
              user: {
                id: row.id,
                email: row.email,
                password_hash: row.password_hash,
                status: row.status as any,
                is_email_verified: row.is_email_verified,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              roles: ['CUSTOMER'],
              profile: {
                user_id: row.id,
                first_name: 'Client',
                last_name: '',
                phone: '',
                preferred_currency: 'INR',
                interior_style_preference: 'Warm Minimalist',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              addresses: [],
            });
          }
        }
      }
    } catch (e: any) {
      console.warn('⚠️ [PostgreSQL Sync]:', e.message);
    }
  }
}

/**
 * Find user by email (normalized).
 */
export function findUserByEmail(email: string): UserRecord | undefined {
  if (!email) return undefined;
  loadFromDisk();
  return usersCache.get(email.toLowerCase().trim());
}

/**
 * Reset memory cache for testing verification.
 */
export function clearUsersCacheForTesting(): void {
  usersCache.clear();
}

/**
 * Find user by email with real-time authoritative PostgreSQL database synchronization.
 * Guarantees cross-instance lookup and persistence durability across process restarts.
 */
export async function findUserByEmailAuthoritative(email: string): Promise<UserRecord | undefined> {
  if (!email) return undefined;
  const normalized = email.toLowerCase().trim();
  if (process.env.NODE_ENV !== 'production') {
    loadFromDisk();
  }
  let cached = usersCache.get(normalized);

  const hasPg = await isPostgresAvailable();
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

      if (res && res.rows.length > 0) {
        const row = res.rows[0];

        // Roles lookup
        const rolesRes = await queryPostgres<{ role_name: string }>(
          'SELECT r.name as role_name FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = $1',
          [row.id]
        );
        const roles: UserRoleEnum[] =
          rolesRes && rolesRes.rows.length > 0
            ? (rolesRes.rows.map((r) => r.role_name as any) as UserRoleEnum[])
            : (cached?.roles || ['CUSTOMER']);

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
        const pRow = profRes?.rows[0];
        const profile: DbProfile = {
          user_id: row.id,
          first_name: pRow?.first_name || cached?.profile?.first_name || '',
          last_name: pRow?.last_name || cached?.profile?.last_name || '',
          phone: pRow?.phone || cached?.profile?.phone || '',
          avatar_url: pRow?.avatar_url || cached?.profile?.avatar_url,
          preferred_currency: pRow?.preferred_currency || cached?.profile?.preferred_currency || 'INR',
          interior_style_preference: pRow?.interior_style_preference || cached?.profile?.interior_style_preference || 'Warm Minimalist',
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

        usersCache.set(normalized, authoritativeRecord);
        return authoritativeRecord;
      } else if (res && res.rows.length === 0) {
        if (process.env.NODE_ENV === 'production') {
          usersCache.delete(normalized);
          return undefined;
        }
      }
    } catch (err: any) {
      console.warn('⚠️ [PostgreSQL findUserByEmail Authoritative Error]:', err.message);
    }
  }

  return cached;
}

/**
 * Find user by immutable UUID.
 */
export function findUserById(id: string): UserRecord | undefined {
  if (!id) return undefined;
  loadFromDisk();
  for (const record of usersCache.values()) {
    if (record.user.id === id) {
      return record;
    }
  }
  return undefined;
}

/**
 * Find user by immutable UUID with real-time PostgreSQL synchronization.
 * Verifies cross-process role and status updates.
 */
export async function findUserByIdAuthoritative(id: string): Promise<UserRecord | undefined> {
  if (!id) return undefined;
  loadFromDisk();

  let cachedRecord: UserRecord | undefined;
  for (const record of usersCache.values()) {
    if (record.user.id === id) {
      cachedRecord = record;
      break;
    }
  }

  const hasPg = await isPostgresAvailable();
  if (hasPg) {
    try {
      const res = await queryPostgres<{ id: string; email: string; password_hash: string; status: string; is_email_verified: boolean }>(
        'SELECT id, email, password_hash, status, is_email_verified FROM users WHERE id = $1',
        [id]
      );
      if (res && res.rows.length > 0) {
        const row = res.rows[0];
        const rolesRes = await queryPostgres<{ role_name: string }>(
          'SELECT r.name as role_name FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = $1',
          [id]
        );
        const roles = rolesRes && rolesRes.rows.length > 0
          ? rolesRes.rows.map((r) => r.role_name as any)
          : (cachedRecord?.roles || ['CUSTOMER']);

        if (cachedRecord) {
          cachedRecord.user.status = row.status as any;
          cachedRecord.user.is_email_verified = row.is_email_verified;
          cachedRecord.roles = roles;
          return cachedRecord;
        } else {
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
          const pRow = profRes?.rows[0];
          const freshRecord: UserRecord = {
            user: {
              id: row.id,
              email: row.email,
              password_hash: row.password_hash,
              status: row.status as any,
              is_email_verified: row.is_email_verified,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
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
          usersCache.set(row.email.toLowerCase().trim(), freshRecord);
          return freshRecord;
        }
      } else if (res && res.rows.length === 0) {
        // User does not exist in authoritative database
        if (cachedRecord) {
          usersCache.delete(cachedRecord.user.email.toLowerCase().trim());
          saveToDisk();
        }
        return undefined;
      }
    } catch {
      // In dev or on DB error, fall back to cached record
    }
  }

  return cachedRecord;
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
  const email = record.user.email.toLowerCase().trim();
  if (!record.user.id) {
    record.user.id = crypto.randomUUID();
  }
  if (record.profile && !record.profile.user_id) {
    record.profile.user_id = record.user.id;
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
    if (client) {
      try {
        await client.query('BEGIN');

        // 1. Users Table Insert / Update
        if (options?.isNewUser) {
          try {
            await client.query(
              `INSERT INTO users (id, email, password_hash, status, is_email_verified, created_at, updated_at)
               VALUES ($1, $2, $3, $4, $5, $6, $7)`,
              [
                record.user.id,
                email,
                record.user.password_hash,
                record.user.status,
                record.user.is_email_verified,
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
        } else {
          await client.query(
            `INSERT INTO users (id, email, password_hash, status, is_email_verified, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (email) DO UPDATE 
             SET password_hash = EXCLUDED.password_hash,
                 status = EXCLUDED.status,
                 is_email_verified = EXCLUDED.is_email_verified,
                 updated_at = EXCLUDED.updated_at`,
            [
              record.user.id,
              email,
              record.user.password_hash,
              record.user.status,
              record.user.is_email_verified,
              record.user.created_at || new Date().toISOString(),
              record.user.updated_at || new Date().toISOString(),
            ]
          );
        }

        // 2. Profile Table Insert / Update
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

        // 3. Roles and User_Roles Table Insert
        if (record.roles && record.roles.length > 0) {
          for (const role of record.roles) {
            await client.query(
              `INSERT INTO roles (id, name, description)
               VALUES (gen_random_uuid(), $1, $2)
               ON CONFLICT (name) DO NOTHING`,
              [role, `${role} role`]
            );
            await client.query(
              `INSERT INTO user_roles (user_id, role_id)
               SELECT $1, id FROM roles WHERE name = $2
               ON CONFLICT DO NOTHING`,
              [record.user.id, role]
            );
          }
        }

        await client.query('COMMIT');
      } catch (err: any) {
        await client.query('ROLLBACK').catch(() => {});
        if (err instanceof UserPersistenceError) throw err;
        if (isProd) {
          throw new UserPersistenceError(
            `Database persistence failed for user account: ${err.message}`,
            'DB_PERSISTENCE_FAILED',
            500
          );
        }
        console.warn('⚠️ [PostgreSQL User Persistence Fallback]:', err.message);
      } finally {
        client.release();
      }
    } else {
      // Fallback to queryPostgres without dedicated pool client
      try {
        const queryRes = await queryPostgres(
          `INSERT INTO users (id, email, password_hash, status, is_email_verified, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (email) DO UPDATE 
           SET password_hash = EXCLUDED.password_hash,
               status = EXCLUDED.status,
               is_email_verified = EXCLUDED.is_email_verified,
               updated_at = EXCLUDED.updated_at`,
          [
            record.user.id,
            email,
            record.user.password_hash,
            record.user.status,
            record.user.is_email_verified,
            record.user.created_at || new Date().toISOString(),
            record.user.updated_at || new Date().toISOString(),
          ]
        );
        if (!queryRes && isProd) {
          throw new UserPersistenceError('Database operation failed during user persistence.', 'DB_PERSISTENCE_FAILED', 500);
        }
      } catch (err: any) {
        if (err instanceof UserPersistenceError) throw err;
        if (isProd) {
          throw new UserPersistenceError(`Database operation failed during user persistence: ${err.message}`, 'DB_PERSISTENCE_FAILED', 500);
        }
      }
    }
  }

  // Application memory cache & non-production disk persistence
  if (!hasPg && options?.isNewUser && usersCache.has(email) && usersCache.get(email)?.user.is_email_verified) {
    throw new UserPersistenceError(
      'An account with this email address already exists. Please sign in instead.',
      'CONFLICT',
      409
    );
  }

  usersCache.set(email, record);
  if (!isProd) {
    saveToDisk();
  }
  return record;
}

/**
 * Save user record to memory and persistent disk/PostgreSQL.
 */
export function saveUserRecord(record: UserRecord): void {
  const email = record.user.email.toLowerCase().trim();
  usersCache.set(email, record);
  if (process.env.NODE_ENV !== 'production') {
    saveToDisk();
  }
  saveUserRecordAsync(record).catch(() => {});
}

/**
 * Create a new user with CUSTOMER role and profile.
 */
export async function createUser(input: CreateUserInput): Promise<UserRecord> {
  await initUserRepository();
  const email = input.email.toLowerCase().trim();

  if (usersCache.has(email)) {
    throw new Error('An account with this email address already exists.');
  }

  const userId = crypto.randomUUID();
  const now = new Date().toISOString();

  const record: UserRecord = {
    user: {
      id: userId,
      email,
      password_hash: input.passwordHash,
      status: 'ACTIVE',
      is_email_verified: input.isEmailVerified || false,
      created_at: now,
      updated_at: now,
    },
    roles: input.roles || ['CUSTOMER'],
    profile: {
      user_id: userId,
      first_name: input.firstName || '',
      last_name: input.lastName || '',
      phone: input.phone || '',
      avatar_url: input.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      preferred_currency: input.preferredCurrency || 'INR',
      interior_style_preference: input.interiorStylePreference || 'Warm Minimalist',
      created_at: now,
      updated_at: now,
    },
    addresses: [],
  };

  saveUserRecord(record);
  return record;
}

/**
 * Update user profile.
 */
export function updateUserProfile(userId: string, updates: Partial<DbProfile>): DbProfile | null {
  const record = findUserById(userId);
  if (!record) return null;

  record.profile = {
    ...record.profile,
    ...updates,
    updated_at: new Date().toISOString(),
  };

  saveUserRecord(record);
  return record.profile;
}

/**
 * Get all addresses for a specific user.
 */
export function getUserAddresses(userId: string): DbAddress[] {
  const record = findUserById(userId);
  return record ? record.addresses || [] : [];
}

/**
 * Add a new address scoped to user.
 */
export function addUserAddress(userId: string, address: Omit<DbAddress, 'id' | 'user_id' | 'created_at' | 'updated_at'>): DbAddress {
  const record = findUserById(userId);
  if (!record) throw new Error('User not found.');

  const addressId = crypto.randomUUID();
  const now = new Date().toISOString();

  if (address.is_default_shipping) {
    record.addresses.forEach((a) => (a.is_default_shipping = false));
  }
  if (address.is_default_billing) {
    record.addresses.forEach((a) => (a.is_default_billing = false));
  }

  const newAddress: DbAddress = {
    id: addressId,
    user_id: userId,
    full_name: address.full_name,
    phone: address.phone,
    address_line1: address.address_line1,
    address_line2: address.address_line2 || '',
    landmark: address.landmark || '',
    city: address.city,
    state: address.state,
    postal_code: address.postal_code,
    country: address.country || 'India',
    is_default_shipping: address.is_default_shipping || record.addresses.length === 0,
    is_default_billing: address.is_default_billing || record.addresses.length === 0,
    created_at: now,
    updated_at: now,
  };

  record.addresses.push(newAddress);
  saveUserRecord(record);
  return newAddress;
}

/**
 * Delete an address belonging to user.
 */
export function deleteUserAddress(userId: string, addressId: string): boolean {
  const record = findUserById(userId);
  if (!record) return false;

  const initialLen = record.addresses.length;
  record.addresses = record.addresses.filter((a) => a.id !== addressId);

  if (record.addresses.length !== initialLen) {
    saveUserRecord(record);
    return true;
  }
  return false;
}

/**
 * Account Lockout (SRS AUTH-007: 5 attempts in 15 mins -> 15 min lock).
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

  // Expired lockout
  record.lockoutUntil = undefined;
  record.failedAttempts = 0;
  record.firstFailedAt = undefined;
  saveUserRecord(record);
  return { isLocked: false };
}

export function recordFailedLogin(email: string): { isLocked: boolean; remainingMinutes?: number; attempts: number } {
  const record = findUserByEmail(email);
  if (!record) {
    return { isLocked: false, attempts: 1 };
  }

  const now = Date.now();
  const windowMs = 15 * 60 * 1000;

  if (!record.firstFailedAt || now - record.firstFailedAt > windowMs) {
    record.firstFailedAt = now;
    record.failedAttempts = 1;
  } else {
    record.failedAttempts = (record.failedAttempts || 0) + 1;
  }

  if (record.failedAttempts >= 5) {
    record.lockoutUntil = now + 15 * 60 * 1000; // 15 mins
    saveUserRecord(record);
    return { isLocked: true, remainingMinutes: 15, attempts: record.failedAttempts };
  }

  saveUserRecord(record);
  return { isLocked: false, attempts: record.failedAttempts };
}

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
 * Password Reset Token (30 mins single-use).
 */
export function createPasswordResetToken(email: string): string | undefined {
  const record = findUserByEmail(email);
  if (!record) return undefined;

  const token = `reset_${crypto.randomUUID().replace(/-/g, '')}`;
  record.resetToken = token;
  record.resetTokenExpires = Date.now() + 30 * 60 * 1000;
  saveUserRecord(record);
  return token;
}

export async function consumePasswordResetToken(token: string, newPassword: string): Promise<boolean> {
  for (const record of usersCache.values()) {
    if (record.resetToken === token) {
      if (record.resetTokenExpires && record.resetTokenExpires < Date.now()) {
        record.resetToken = undefined;
        record.resetTokenExpires = undefined;
        saveUserRecord(record);
        return false; // Expired
      }

      record.user.password_hash = await hashPassword(newPassword);
      record.resetToken = undefined;
      record.resetTokenExpires = undefined;
      record.user.updated_at = new Date().toISOString();
      saveUserRecord(record);
      return true;
    }
  }
  return false;
}

/**
 * Email Verification Token (24 hours single-use).
 */
export function createEmailVerificationToken(email: string): string | undefined {
  const record = findUserByEmail(email);
  if (!record) return undefined;

  const token = `verify_${crypto.randomUUID().replace(/-/g, '')}`;
  record.verificationToken = token;
  record.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
  saveUserRecord(record);
  return token;
}

export function consumeEmailVerificationToken(token: string): boolean {
  for (const record of usersCache.values()) {
    if (record.verificationToken === token) {
      if (record.verificationTokenExpires && record.verificationTokenExpires < Date.now()) {
        record.verificationToken = undefined;
        record.verificationTokenExpires = undefined;
        saveUserRecord(record);
        return false; // Expired
      }

      record.user.is_email_verified = true;
      record.verificationToken = undefined;
      record.verificationTokenExpires = undefined;
      record.user.updated_at = new Date().toISOString();
      saveUserRecord(record);
      return true;
    }
  }
  return false;
}

/**
 * Find or create user via Google OAuth 2.0.
 */
export async function findOrCreateGoogleUser(profile: GoogleUserProfileInput): Promise<UserRecord> {
  await initUserRepository();
  const email = profile.email.toLowerCase().trim();
  let record = findUserByEmail(email);

  if (record) {
    // If account exists, connect Google OAuth identity
    if (!record.oauthProviders) record.oauthProviders = [];
    const hasGoogle = record.oauthProviders.some((p) => p.provider === 'google');
    if (!hasGoogle) {
      record.oauthProviders.push({
        provider: 'google',
        providerId: profile.googleId,
        connectedAt: new Date().toISOString(),
      });
    }

    if (profile.avatarUrl && (!record.profile.avatar_url || record.profile.avatar_url.includes('placeholder'))) {
      record.profile.avatar_url = profile.avatarUrl;
    }
    if (!record.user.is_email_verified) {
      record.user.is_email_verified = true;
    }
    record.user.updated_at = new Date().toISOString();
    saveUserRecord(record);
    return record;
  }

  // Create brand-new customer account
  const userId = crypto.randomUUID();
  const dummyHash = await hashPassword(`${crypto.randomUUID()}_google_oauth_auth_2026`);
  const now = new Date().toISOString();

  record = {
    user: {
      id: userId,
      email,
      password_hash: dummyHash,
      status: 'ACTIVE',
      is_email_verified: true,
      created_at: now,
      updated_at: now,
    },
    roles: ['CUSTOMER'],
    profile: {
      user_id: userId,
      first_name: profile.firstName || 'Client',
      last_name: profile.lastName || '',
      phone: '',
      avatar_url: profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      preferred_currency: 'INR',
      interior_style_preference: 'Warm Minimalist',
      created_at: now,
      updated_at: now,
    },
    addresses: [],
    oauthProviders: [
      {
        provider: 'google',
        providerId: profile.googleId,
        connectedAt: now,
      },
    ],
  };

  saveUserRecord(record);
  return record;
}
