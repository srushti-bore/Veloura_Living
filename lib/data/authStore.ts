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
  resetTokenExpires?: number;
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
