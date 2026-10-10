/**
 * 🏛️ Veloura Living — Mandatory Authentication OTP Engine
 * Manages 6-digit unpredictable OTP generation, challenge tokens, Brevo email dispatch,
 * 10-minute expiry lifecycles, 5-attempt brute-force protection, 30s resend cooldowns, and single-use verification.
 * Reference: docs/Veloura_Living_SRS.md (AUTH-001, AUTH-003, AUTH-007, SEC-002)
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { brevoEmailService } from '@/lib/services/brevoEmailService';

export interface OtpChallenge {
  challengeId: string;
  challengeToken: string;
  email: string;
  userId?: string;
  otp: string; // Cryptographically random 6-digit numeric OTP (in-memory accessor)
  otpHash: string; // SHA-256 hash of salt + OTP
  salt: string; // 16-byte random salt
  type: 'LOGIN' | 'REGISTER';
  attempts: number;
  maxAttempts: number;
  resends: number;
  maxResends: number;
  createdAt: number;
  expiresAt: number;
  lastSentAt: number;
  isVerified: boolean;
  metadata?: Record<string, any>;
}

export interface CreateChallengeResult {
  challengeToken: string;
  email: string;
  expiresInSeconds: number;
  cooldownSeconds: number;
  emailDispatched: boolean;
  message: string;
}

export interface VerifyOtpResult {
  success: boolean;
  error?: string;
  code?: 'INVALID_CHALLENGE' | 'EXPIRED_OTP' | 'TOO_MANY_ATTEMPTS' | 'INVALID_OTP' | 'ALREADY_USED';
  userId?: string;
  email?: string;
  type?: 'LOGIN' | 'REGISTER';
  remainingAttempts?: number;
  metadata?: Record<string, any>;
}

export interface ResendOtpResult {
  success: boolean;
  error?: string;
  cooldownSeconds?: number;
  challengeToken?: string;
  message?: string;
}

// In-memory challenge store (keyed by challengeToken and email)
const activeChallenges = new Map<string, OtpChallenge>();
const emailToChallengeMap = new Map<string, string>(); // normalized email -> challengeToken

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const RESEND_COOLDOWN_MS = 30 * 1000; // 30 seconds
const MAX_ATTEMPTS = 5;
const MAX_RESENDS = 3;

const DATA_DIR = path.join(process.cwd(), '.data');
const CHALLENGES_FILE = path.join(DATA_DIR, 'otp_challenges.json');

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {
      // Ignore if directory creation fails in restricted environment
    }
  }
}

function loadChallengesFromDisk(): void {
  try {
    if (fs.existsSync(CHALLENGES_FILE)) {
      const raw = fs.readFileSync(CHALLENGES_FILE, 'utf-8');
      const records: OtpChallenge[] = JSON.parse(raw);
      const now = Date.now();
      records.forEach((c) => {
        if (c.expiresAt > now && !c.isVerified) {
          if (!activeChallenges.has(c.challengeToken)) {
            activeChallenges.set(c.challengeToken, c);
            emailToChallengeMap.set(c.email.toLowerCase().trim(), c.challengeToken);
          }
        }
      });
    }
  } catch (err: any) {
    console.warn('⚠️ [OTP Disk Load Error]:', err.message);
  }
}

function saveChallengesToDisk(): void {
  try {
    ensureDataDir();
    const now = Date.now();
    const records = Array.from(activeChallenges.values()).filter(
      (c) => c.expiresAt > now && !c.isVerified
    );
    // Persist records to disk without exposing plaintext OTP
    const diskRecords = records.map((r) => ({
      ...r,
      otp: '', // Plaintext OTP stripped from disk persistence
    }));
    fs.writeFileSync(CHALLENGES_FILE, JSON.stringify(diskRecords, null, 2), 'utf-8');
  } catch (err: any) {
    console.warn('⚠️ [OTP Disk Save Error]:', err.message);
  }
}

// Initial load on module initialization
loadChallengesFromDisk();

/**
 * Generates an unpredictable cryptographically secure 6-digit numeric string
 */
function generateSecureOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Computes salted cryptographic SHA-256 hash of OTP code
 */
function hashOtp(otp: string, salt: string): string {
  return crypto.createHash('sha256').update(`${salt}:${otp.trim()}`).digest('hex');
}

/**
 * Creates and dispatches a new OTP challenge
 */
export async function createOtpChallenge(params: {
  email: string;
  type: 'LOGIN' | 'REGISTER';
  userId?: string;
  name?: string;
  metadata?: Record<string, any>;
}): Promise<CreateChallengeResult> {
  const normalizedEmail = params.email.toLowerCase().trim();
  const now = Date.now();

  // Invalidate any existing active challenge for this email
  const existingToken = emailToChallengeMap.get(normalizedEmail);
  if (existingToken) {
    activeChallenges.delete(existingToken);
  }

  const otp = generateSecureOtp();
  const salt = crypto.randomBytes(16).toString('hex');
  const otpHash = hashOtp(otp, salt);
  const challengeId = crypto.randomUUID();
  const challengeToken = `chal_${crypto.randomUUID().replace(/-/g, '')}`;

  const challenge: OtpChallenge = {
    challengeId,
    challengeToken,
    email: normalizedEmail,
    userId: params.userId,
    otp, // Stored in memory for testing/session validation
    otpHash,
    salt,
    type: params.type,
    attempts: 0,
    maxAttempts: MAX_ATTEMPTS,
    resends: 0,
    maxResends: MAX_RESENDS,
    createdAt: now,
    expiresAt: now + OTP_EXPIRY_MS,
    lastSentAt: now,
    isVerified: false,
    metadata: params.metadata,
  };

  activeChallenges.set(challengeToken, challenge);
  emailToChallengeMap.set(normalizedEmail, challengeToken);
  saveChallengesToDisk();

  // Dispatch OTP email via Brevo transactional engine
  const dispatchResult = await brevoEmailService.sendOtpEmail(normalizedEmail, otp, {
    name: params.name,
    type: params.type,
  });

  if (!dispatchResult.success) {
    // If dispatch failed, clean up unusable challenge
    activeChallenges.delete(challengeToken);
    emailToChallengeMap.delete(normalizedEmail);
    saveChallengesToDisk();
    return {
      challengeToken: '',
      email: normalizedEmail,
      expiresInSeconds: 0,
      cooldownSeconds: 0,
      emailDispatched: false,
      message: dispatchResult.error || 'Failed to dispatch verification email.',
    };
  }

  return {
    challengeToken,
    email: normalizedEmail,
    expiresInSeconds: Math.floor(OTP_EXPIRY_MS / 1000),
    cooldownSeconds: Math.floor(RESEND_COOLDOWN_MS / 1000),
    emailDispatched: dispatchResult.success,
    message: `Verification code dispatched to ${normalizedEmail}. Valid for 10 minutes.`,
  };
}

/**
 * Validates a submitted OTP code against the active challenge
 */
export async function verifyOtpChallenge(params: {
  email: string;
  challengeToken: string;
  otp: string;
  expectedType?: 'LOGIN' | 'REGISTER';
}): Promise<VerifyOtpResult> {
  loadChallengesFromDisk();
  const normalizedEmail = params.email.toLowerCase().trim();
  const challenge = activeChallenges.get(params.challengeToken);

  if (!challenge || challenge.email !== normalizedEmail) {
    return {
      success: false,
      error: 'Invalid or expired verification session. Please initiate login again.',
      code: 'INVALID_CHALLENGE',
    };
  }

  // Enforce challenge type boundary (LOGIN vs REGISTER isolation)
  if (params.expectedType && challenge.type !== params.expectedType) {
    return {
      success: false,
      error: 'Challenge type mismatch. Please initiate the correct authentication flow.',
      code: 'INVALID_CHALLENGE',
    };
  }

  if (challenge.isVerified) {
    return {
      success: false,
      error: 'This verification code has already been consumed. Replay is not permitted.',
      code: 'ALREADY_USED',
    };
  }

  const now = Date.now();
  if (now > challenge.expiresAt) {
    activeChallenges.delete(params.challengeToken);
    emailToChallengeMap.delete(normalizedEmail);
    saveChallengesToDisk();
    return {
      success: false,
      error: 'Verification code has expired. Please request a new code.',
      code: 'EXPIRED_OTP',
    };
  }

  challenge.attempts += 1;

  if (challenge.attempts > challenge.maxAttempts) {
    activeChallenges.delete(params.challengeToken);
    emailToChallengeMap.delete(normalizedEmail);
    saveChallengesToDisk();
    return {
      success: false,
      error: 'Maximum verification attempts exceeded (5). Session terminated for security.',
      code: 'TOO_MANY_ATTEMPTS',
    };
  }

  saveChallengesToDisk();

  // Constant-time cryptographic comparison using salted hash
  const submittedHash = hashOtp(params.otp, challenge.salt);
  const submittedHashBuf = Buffer.from(submittedHash, 'utf-8');
  const expectedHashBuf = Buffer.from(challenge.otpHash, 'utf-8');

  const isMatch =
    submittedHashBuf.length === expectedHashBuf.length &&
    crypto.timingSafeEqual(submittedHashBuf, expectedHashBuf);

  if (!isMatch) {
    const remaining = challenge.maxAttempts - challenge.attempts;
    return {
      success: false,
      error: `Invalid verification code. ${remaining} attempt(s) remaining before session lock.`,
      code: 'INVALID_OTP',
      remainingAttempts: remaining,
    };
  }

  // Success: Mark verified & consume challenge (single-use guarantee)
  challenge.isVerified = true;
  activeChallenges.delete(params.challengeToken);
  emailToChallengeMap.delete(normalizedEmail);
  saveChallengesToDisk();

  return {
    success: true,
    userId: challenge.userId,
    email: challenge.email,
    type: challenge.type,
    metadata: challenge.metadata,
  };
}

/**
 * Resends a fresh OTP code to the user, respecting cooldown and security constraints
 */
export async function resendOtpChallenge(params: {
  email: string;
  challengeToken: string;
}): Promise<ResendOtpResult> {
  loadChallengesFromDisk();
  const normalizedEmail = params.email.toLowerCase().trim();
  const challenge = activeChallenges.get(params.challengeToken);

  // VULNERABILITY FIX: Never silently create a new challenge for unknown/mismatched tokens!
  if (!challenge || challenge.email !== normalizedEmail) {
    return {
      success: false,
      error: 'Invalid or expired verification session. Please initiate authentication again.',
    };
  }

  if (challenge.isVerified) {
    return {
      success: false,
      error: 'This verification session has already been completed.',
    };
  }

  const now = Date.now();
  if (now > challenge.expiresAt) {
    activeChallenges.delete(params.challengeToken);
    emailToChallengeMap.delete(normalizedEmail);
    saveChallengesToDisk();
    return {
      success: false,
      error: 'Verification session has expired. Please initiate authentication again.',
    };
  }

  if (challenge.attempts >= challenge.maxAttempts) {
    activeChallenges.delete(params.challengeToken);
    emailToChallengeMap.delete(normalizedEmail);
    saveChallengesToDisk();
    return {
      success: false,
      error: 'Maximum verification attempts exceeded. Session locked for security.',
    };
  }

  // Enforce resend limit per challenge session
  const currentResends = challenge.resends || 0;
  if (currentResends >= (challenge.maxResends || MAX_RESENDS)) {
    return {
      success: false,
      error: 'Maximum resend limit reached for this session. Please initiate a new login or registration.',
    };
  }

  const elapsed = now - challenge.lastSentAt;
  if (elapsed < RESEND_COOLDOWN_MS) {
    const remainingSec = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
    return {
      success: false,
      error: `Please wait ${remainingSec} second(s) before requesting another code.`,
      cooldownSeconds: remainingSec,
    };
  }

  // Generate new OTP, fresh salt and update challenge state
  const newOtp = generateSecureOtp();
  const newSalt = crypto.randomBytes(16).toString('hex');
  challenge.salt = newSalt;
  challenge.otpHash = hashOtp(newOtp, newSalt);
  challenge.otp = newOtp;
  challenge.lastSentAt = now;
  challenge.expiresAt = now + OTP_EXPIRY_MS;
  challenge.resends = currentResends + 1;
  // Note: Do NOT reset challenge.attempts to 0, preventing brute force reset cycles

  saveChallengesToDisk();

  const dispatchResult = await brevoEmailService.sendOtpEmail(normalizedEmail, newOtp, {
    type: challenge.type,
  });

  if (!dispatchResult.success) {
    return {
      success: false,
      error: dispatchResult.error || 'Failed to dispatch verification email.',
    };
  }

  return {
    success: true,
    challengeToken: challenge.challengeToken,
    cooldownSeconds: 30,
    message: 'New verification code dispatched to your email.',
  };
}

/**
 * Helper for tests only to inspect challenge state without exposing raw secret in logs
 */
export function getChallengeForTesting(challengeToken: string): OtpChallenge | undefined {
  return activeChallenges.get(challengeToken);
}
