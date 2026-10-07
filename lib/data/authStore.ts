/**
 * 🏛️ Veloura Living — In-Memory & Database-Ready Auth Store
 * Initialized with canonical seeded accounts from Phase 1 Foundation.
 */

import { DbUser, DbProfile, DbAddress, UserRoleEnum } from '@/types';
import { hashPassword } from '@/lib/auth/password';

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

// ... rest of methods below ...

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

export function findUserById(id: string): UserRecord | undefined {
  for (const record of globalUsers.values()) {
    if (record.user.id === id) {
      return record;
    }
  }
  return undefined;
}

export function saveUserRecord(record: UserRecord): void {
  globalUsers.set(record.user.email.toLowerCase().trim(), record);
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

export interface GoogleUserProfile {
  googleId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

/**
 * Find or create a user via Google OAuth 2.0.
 */
export async function findOrCreateGoogleUser(profile: GoogleUserProfile): Promise<UserRecord> {
  await initAuthStore();
  const email = profile.email.toLowerCase().trim();
  let record = findUserByEmail(email);

  if (record) {
    // If user exists, sync profile avatar and verify email if needed
    if (profile.avatarUrl && (!record.profile.avatar_url || record.profile.avatar_url.includes('placeholder'))) {
      record.profile.avatar_url = profile.avatarUrl;
    }
    if (!record.user.is_email_verified) {
      record.user.is_email_verified = true;
    }
    saveUserRecord(record);
    return record;
  }

  // Create brand new Google User
  const userId = crypto.randomUUID();
  const dummyHash = await hashPassword(crypto.randomUUID() + '_google_oauth_auth_2026');

  record = {
    user: {
      id: userId,
      email,
      password_hash: dummyHash,
      status: 'ACTIVE',
      is_email_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    addresses: [],
  };

  saveUserRecord(record);
  return record;
}

