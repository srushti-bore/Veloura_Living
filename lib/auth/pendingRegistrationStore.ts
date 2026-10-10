/**
 * 🏛️ Veloura Living — Protected Pending Registration Store
 * Securely isolates pending user credentials (password hashes, profile info)
 * away from generic OTP challenge metadata.
 * Reference: docs/Veloura_Living_SRS.md (AUTH-001, AUTH-003, SEC-002)
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

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
 * Stores a pending registration safely, returning an opaque identifier.
 */
export function savePendingRegistration(data: {
  email: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}): PendingRegistration {
  cleanupExpired();
  const id = crypto.randomUUID();
  const now = Date.now();
  const record: PendingRegistration = {
    id,
    email: data.email.toLowerCase().trim(),
    passwordHash: data.passwordHash,
    firstName: data.firstName ? data.firstName.trim() : '',
    lastName: data.lastName ? data.lastName.trim() : '',
    phone: data.phone ? data.phone.trim() : '',
    createdAt: now,
    expiresAt: now + EXPIRY_MS,
  };

  pendingStore.set(id, record);
  saveToDisk();
  return record;
}

/**
 * Retrieves an active pending registration by opaque ID.
 */
export function getPendingRegistration(id: string): PendingRegistration | null {
  cleanupExpired();
  const record = pendingStore.get(id);
  if (!record) return null;
  if (Date.now() > record.expiresAt) {
    pendingStore.delete(id);
    saveToDisk();
    return null;
  }
  return record;
}

/**
 * Atomically consumes and removes a pending registration (single-use upon OTP verification).
 */
export function consumePendingRegistration(id: string): PendingRegistration | null {
  const record = getPendingRegistration(id);
  if (record) {
    pendingStore.delete(id);
    saveToDisk();
  }
  return record;
}

/**
 * Removes all expired pending registrations to prevent memory and disk leakage.
 */
export function cleanupExpired(): void {
  const now = Date.now();
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
