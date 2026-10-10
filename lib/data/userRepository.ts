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
import { queryPostgres, isPostgresAvailable } from '@/lib/db/postgres';

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
 * Save user record to memory and persistent disk/PostgreSQL.
 */
export function saveUserRecord(record: UserRecord): void {
  const email = record.user.email.toLowerCase().trim();
  usersCache.set(email, record);
  saveToDisk();

  // Async push to PostgreSQL if connected
  queryPostgres(
    `INSERT INTO users (id, email, password_hash, status, is_email_verified, updated_at)
     VALUES ($1, $2, $3, $4, $5, NOW())
     ON CONFLICT (email) DO UPDATE 
     SET password_hash = EXCLUDED.password_hash,
         status = EXCLUDED.status,
         is_email_verified = EXCLUDED.is_email_verified,
         updated_at = NOW()`,
    [
      record.user.id,
      record.user.email,
      record.user.password_hash,
      record.user.status,
      record.user.is_email_verified,
    ]
  ).catch(() => {});
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
