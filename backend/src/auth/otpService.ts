/**
 * 🏛️ Veloura Living — Mandatory Authentication OTP Engine (Backend Standalone)
 * Manages 6-digit unpredictable OTP generation, challenge tokens, Brevo email dispatch,
 * 10-minute expiry lifecycles, 5-attempt brute-force protection, 30s resend cooldowns, and atomic single-use verification.
 * Dual Persistence: PostgreSQL shared authoritative store with resilient local cache for offline dev.
 * Reference: docs/Veloura_Living_SRS.md (AUTH-001, AUTH-003, AUTH-007, SEC-002)
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { brevoEmailService } from '../services/brevoEmailService';
import { queryPostgres, isPostgresAvailable } from '../db/postgres';

export const ALLOWED_OTP_PURPOSES = ['LOGIN', 'REGISTER'] as const;
export type OtpChallengeType = (typeof ALLOWED_OTP_PURPOSES)[number];

export function isValidOtpPurpose(purpose: any): purpose is OtpChallengeType {
  return typeof purpose === 'string' && (ALLOWED_OTP_PURPOSES as readonly string[]).includes(purpose);
}

export interface OtpChallenge {
  challengeId: string;
  challengeToken: string;
  email: string;
  userId?: string;
  otp: string;
  otpHash: string;
  salt: string;
  type: OtpChallengeType;
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
  type?: OtpChallengeType;
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

const activeChallenges = new Map<string, OtpChallenge>();
const emailToChallengeMap = new Map<string, string>();
const inFlightVerifications = new Set<string>();

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 30 * 1000;
const MAX_ATTEMPTS = 5;
const MAX_RESENDS = 3;

const DATA_DIR = path.join(process.cwd(), '.data');
const CHALLENGES_FILE = path.join(DATA_DIR, 'otp_challenges.json');

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {}
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
    console.warn('⚠️ [OTP Disk Load Error (Backend)]:', err.message);
  }
}

function saveChallengesToDisk(): void {
  try {
    ensureDataDir();
    const now = Date.now();
    const records = Array.from(activeChallenges.values()).filter(
      (c) => c.expiresAt > now && !c.isVerified
    );
    const diskRecords = records.map((r) => ({
      ...r,
      otp: '',
      metadata: sanitizeMetadata(r.metadata),
    }));
    fs.writeFileSync(CHALLENGES_FILE, JSON.stringify(diskRecords, null, 2), 'utf-8');
  } catch (err: any) {
    console.warn('⚠️ [OTP Disk Save Error (Backend)]:', err.message);
  }
}

loadChallengesFromDisk();

function sanitizeMetadata(metadata?: Record<string, any>): Record<string, any> | undefined {
  if (!metadata) return undefined;
  const clean = { ...metadata };
  delete clean.password;
  delete clean.password_hash;
  delete clean.passwordHash;
  delete clean.token;
  delete clean.accessToken;
  delete clean.secret;
  if (clean.pendingRecord && typeof clean.pendingRecord === 'object') {
    const pr = { ...clean.pendingRecord };
    if (pr.user) {
      pr.user = { ...pr.user };
      delete pr.user.password_hash;
      delete pr.user.password;
    }
    clean.pendingRecord = pr;
  }
  return clean;
}

async function saveChallengeToPostgres(challenge: OtpChallenge): Promise<boolean> {
  try {
    const isAvail = await isPostgresAvailable();
    if (!isAvail) return false;

    const res = await queryPostgres(
      `INSERT INTO otp_challenges (
        challenge_token, challenge_id, email, user_id, otp_hash, salt, type,
        attempts, max_attempts, resends, max_resends, created_at, expires_at,
        last_sent_at, is_verified, metadata, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())
      ON CONFLICT (challenge_token) DO UPDATE SET
        otp_hash = EXCLUDED.otp_hash,
        salt = EXCLUDED.salt,
        attempts = EXCLUDED.attempts,
        resends = EXCLUDED.resends,
        expires_at = EXCLUDED.expires_at,
        last_sent_at = EXCLUDED.last_sent_at,
        is_verified = EXCLUDED.is_verified,
        metadata = EXCLUDED.metadata,
        updated_at = NOW()
      RETURNING challenge_token`,
      [
        challenge.challengeToken,
        challenge.challengeId,
        challenge.email,
        challenge.userId || null,
        challenge.otpHash,
        challenge.salt,
        challenge.type,
        challenge.attempts,
        challenge.maxAttempts,
        challenge.resends,
        challenge.maxResends,
        challenge.createdAt,
        challenge.expiresAt,
        challenge.lastSentAt,
        challenge.isVerified,
        challenge.metadata ? JSON.stringify(sanitizeMetadata(challenge.metadata)) : null,
      ]
    );

    return Boolean(res && res.rows && res.rows.length > 0);
  } catch (err: any) {
    console.warn('⚠️ [OTP Postgres Save Warning (Backend)]:', err.message);
    return false;
  }
}

async function loadChallengeFromPostgres(challengeToken: string): Promise<OtpChallenge | null> {
  try {
    const isAvail = await isPostgresAvailable();
    if (!isAvail) return null;

    const res = await queryPostgres(
      `SELECT challenge_token, challenge_id, email, user_id, otp_hash, salt, type,
              attempts, max_attempts, resends, max_resends, created_at, expires_at,
              last_sent_at, is_verified, metadata
       FROM otp_challenges
       WHERE challenge_token = $1`,
      [challengeToken]
    );

    if (res && res.rows && res.rows.length > 0) {
      const row = res.rows[0];
      return {
        challengeId: row.challenge_id,
        challengeToken: row.challenge_token,
        email: row.email,
        userId: row.user_id,
        otp: '',
        otpHash: row.otp_hash,
        salt: row.salt,
        type: row.type,
        attempts: Number(row.attempts),
        maxAttempts: Number(row.max_attempts),
        resends: Number(row.resends),
        maxResends: Number(row.max_resends),
        createdAt: Number(row.created_at),
        expiresAt: Number(row.expires_at),
        lastSentAt: Number(row.last_sent_at),
        isVerified: Boolean(row.is_verified),
        metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata || undefined,
      };
    }
  } catch (err: any) {
    console.warn('⚠️ [OTP Postgres Load Warning (Backend)]:', err.message);
  }
  return null;
}

function generateSecureOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

export function hashOtp(otp: string, salt: string): string {
  return crypto.createHash('sha256').update(`${salt}:${otp.trim()}`).digest('hex');
}

export async function createOtpChallenge(params: {
  email: string;
  type: OtpChallengeType;
  userId?: string;
  name?: string;
  metadata?: Record<string, any>;
  requirePostgres?: boolean;
}): Promise<CreateChallengeResult> {
  const normalizedEmail = params.email.toLowerCase().trim();
  const now = Date.now();

  if (!isValidOtpPurpose(params.type)) {
    return {
      challengeToken: '',
      email: normalizedEmail,
      expiresInSeconds: 0,
      cooldownSeconds: 0,
      emailDispatched: false,
      message: `Invalid challenge purpose: ${params.type}. Expected LOGIN or REGISTER.`,
    };
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const requireDb = isProduction || params.requirePostgres === true;

  if (requireDb) {
    const isAvail = await isPostgresAvailable();
    if (!isAvail) {
      return {
        challengeToken: '',
        email: normalizedEmail,
        expiresInSeconds: 0,
        cooldownSeconds: 0,
        emailDispatched: false,
        message: 'Authentication persistence unavailable. Please try again shortly.',
      };
    }
  }

  const existingToken = emailToChallengeMap.get(normalizedEmail);
  if (existingToken) {
    activeChallenges.delete(existingToken);
  }

  const otp = generateSecureOtp();
  const salt = crypto.randomBytes(16).toString('hex');
  const otpHash = hashOtp(otp, salt);
  const challengeId = crypto.randomUUID();
  const challengeToken = `chal_${crypto.randomUUID().replace(/-/g, '')}`;

  const cleanMetadata = sanitizeMetadata(params.metadata);

  const challenge: OtpChallenge = {
    challengeId,
    challengeToken,
    email: normalizedEmail,
    userId: params.userId,
    otp,
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
    metadata: cleanMetadata,
  };

  const dispatchResult = await brevoEmailService.sendOtpEmail(normalizedEmail, otp, {
    name: params.name,
    type: params.type,
  });

  if (!dispatchResult.success || dispatchResult.deliveryStatus === 'TIMEOUT_UNKNOWN' || dispatchResult.deliveryStatus === 'REJECTED' || dispatchResult.deliveryStatus === 'FAILED_PRECHECK') {
    activeChallenges.delete(challengeToken);
    emailToChallengeMap.delete(normalizedEmail);
    saveChallengesToDisk();
    return {
      challengeToken: '',
      email: normalizedEmail,
      expiresInSeconds: 0,
      cooldownSeconds: 0,
      emailDispatched: false,
      message: 'Unable to deliver verification code. Please check your email or try again shortly.',
    };
  }

  const pgSaved = await saveChallengeToPostgres(challenge);
  if (requireDb && !pgSaved) {
    activeChallenges.delete(challengeToken);
    emailToChallengeMap.delete(normalizedEmail);
    return {
      challengeToken: '',
      email: normalizedEmail,
      expiresInSeconds: 0,
      cooldownSeconds: 0,
      emailDispatched: false,
      message: 'Failed to persist authentication session in secure storage.',
    };
  }

  activeChallenges.set(challengeToken, challenge);
  emailToChallengeMap.set(normalizedEmail, challengeToken);
  saveChallengesToDisk();

  const isSimulated = dispatchResult.deliveryStatus === 'SIMULATED' || dispatchResult.isMock;

  return {
    challengeToken,
    email: normalizedEmail,
    expiresInSeconds: Math.floor(OTP_EXPIRY_MS / 1000),
    cooldownSeconds: Math.floor(RESEND_COOLDOWN_MS / 1000),
    emailDispatched: true,
    message: isSimulated
      ? `[Development Simulation] Verification code dispatched to ${normalizedEmail}. Valid for 10 minutes.`
      : `Verification code dispatched to ${normalizedEmail}. Valid for 10 minutes.`,
  };
}

export async function verifyOtpChallenge(params: {
  email: string;
  challengeToken: string;
  otp: string;
  expectedType?: 'LOGIN' | 'REGISTER';
  requirePostgres?: boolean;
}): Promise<VerifyOtpResult> {
  const normalizedEmail = params.email.toLowerCase().trim();
  const isProduction = process.env.NODE_ENV === 'production';
  const requireDb = isProduction || params.requirePostgres === true;
  const isPgAvail = await isPostgresAvailable();

  if (requireDb && !isPgAvail) {
    return {
      success: false,
      error: 'Authentication database unavailable. Please try again shortly.',
      code: 'INVALID_CHALLENGE',
    };
  }

  // 1. PostgreSQL Atomic Verification
  if (isPgAvail) {
    try {
      const rowRes = await queryPostgres(
        `SELECT challenge_token, challenge_id, email, user_id, otp_hash, salt, type,
                attempts, max_attempts, resends, max_resends, created_at, expires_at,
                last_sent_at, is_verified, metadata
         FROM otp_challenges
         WHERE challenge_token = $1`,
        [params.challengeToken]
      );

      if (!rowRes || rowRes.rows.length === 0) {
        return {
          success: false,
          error: 'Invalid or expired verification session. Please initiate login again.',
          code: 'INVALID_CHALLENGE',
        };
      }

      const row = rowRes.rows[0];

      if (row.email.toLowerCase().trim() !== normalizedEmail) {
        return {
          success: false,
          error: 'Invalid or expired verification session. Please initiate login again.',
          code: 'INVALID_CHALLENGE',
        };
      }

      // Enforce authoritative purpose policy on stored challenge
      if (!row.type || !isValidOtpPurpose(row.type)) {
        return {
          success: false,
          error: 'Invalid or missing challenge purpose. Session terminated for security.',
          code: 'INVALID_CHALLENGE',
        };
      }

      // If client supplied expectedType, strictly validate against stored authoritative purpose
      if (params.expectedType !== undefined) {
        if (!isValidOtpPurpose(params.expectedType) || row.type !== params.expectedType) {
          return {
            success: false,
            error: 'Challenge purpose mismatch. This verification code cannot be used for this purpose.',
            code: 'INVALID_CHALLENGE',
          };
        }
      }

      if (row.is_verified) {
        return {
          success: false,
          error: 'This verification code has already been consumed. Replay is not permitted.',
          code: 'ALREADY_USED',
        };
      }

      const now = Date.now();
      if (now > Number(row.expires_at)) {
        return {
          success: false,
          error: 'Verification code has expired. Please request a new code.',
          code: 'EXPIRED_OTP',
        };
      }

      const currentAttempts = Number(row.attempts);
      const maxAttempts = Number(row.max_attempts) || MAX_ATTEMPTS;

      if (currentAttempts >= maxAttempts) {
        return {
          success: false,
          error: 'Maximum verification attempts exceeded (5). Session terminated for security.',
          code: 'TOO_MANY_ATTEMPTS',
          remainingAttempts: 0,
        };
      }

      const submittedHash = hashOtp(params.otp, row.salt);
      const submittedBuf = Buffer.from(submittedHash, 'utf-8');
      const expectedBuf = Buffer.from(row.otp_hash, 'utf-8');

      const isMatch =
        submittedBuf.length === expectedBuf.length &&
        crypto.timingSafeEqual(submittedBuf, expectedBuf);

      if (!isMatch) {
        const updRes = await queryPostgres(
          `UPDATE otp_challenges
           SET attempts = attempts + 1, updated_at = NOW()
           WHERE challenge_token = $1 AND is_verified = FALSE AND attempts < max_attempts
           RETURNING attempts, max_attempts`,
          [params.challengeToken]
        );

        if (!updRes || updRes.rows.length === 0) {
          return {
            success: false,
            error: 'Maximum verification attempts exceeded (5). Session terminated for security.',
            code: 'TOO_MANY_ATTEMPTS',
            remainingAttempts: 0,
          };
        }

        const newAttempts = Number(updRes.rows[0].attempts);
        const maxAtt = Number(updRes.rows[0].max_attempts) || maxAttempts;
        const remaining = Math.max(0, maxAtt - newAttempts);

        if (remaining === 0) {
          return {
            success: false,
            error: 'Maximum verification attempts exceeded (5). Session terminated for security.',
            code: 'TOO_MANY_ATTEMPTS',
            remainingAttempts: 0,
          };
        }

        return {
          success: false,
          error: `Invalid verification code. ${remaining} attempt(s) remaining before session lock.`,
          code: 'INVALID_OTP',
          remainingAttempts: remaining,
        };
      }

      const consumeRes = await queryPostgres(
        `UPDATE otp_challenges
         SET is_verified = TRUE, attempts = attempts + 1, updated_at = NOW()
         WHERE challenge_token = $1 AND is_verified = FALSE AND attempts < max_attempts
         RETURNING challenge_token, user_id, email, type, metadata`,
        [params.challengeToken]
      );

      if (!consumeRes || consumeRes.rows.length === 0) {
        const checkRes = await queryPostgres(
          `SELECT is_verified, attempts, max_attempts FROM otp_challenges WHERE challenge_token = $1`,
          [params.challengeToken]
        );
        if (checkRes && checkRes.rows.length > 0 && Number(checkRes.rows[0].attempts) >= Number(checkRes.rows[0].max_attempts)) {
          return {
            success: false,
            error: 'Maximum verification attempts exceeded (5). Session terminated for security.',
            code: 'TOO_MANY_ATTEMPTS',
            remainingAttempts: 0,
          };
        }
        return {
          success: false,
          error: 'This verification code has already been consumed. Replay is not permitted.',
          code: 'ALREADY_USED',
        };
      }

      activeChallenges.delete(params.challengeToken);
      emailToChallengeMap.delete(normalizedEmail);
      saveChallengesToDisk();

      const consumed = consumeRes.rows[0];
      const parsedMetadata =
        typeof consumed.metadata === 'string'
          ? JSON.parse(consumed.metadata)
          : consumed.metadata || undefined;

      return {
        success: true,
        userId: consumed.user_id,
        email: consumed.email,
        type: consumed.type,
        metadata: parsedMetadata,
      };
    } catch (err: any) {
      console.warn('⚠️ [OTP Database Atomic Verify Error (Backend)]:', err.message);
      if (requireDb) {
        return {
          success: false,
          error: 'Database error during verification. Authentication aborted.',
          code: 'INVALID_CHALLENGE',
        };
      }
    }
  }

  // 2. Local Memory / Disk Verification
  loadChallengesFromDisk();
  let challenge = activeChallenges.get(params.challengeToken);

  if (!challenge || challenge.email !== normalizedEmail) {
    return {
      success: false,
      error: 'Invalid or expired verification session. Please initiate login again.',
      code: 'INVALID_CHALLENGE',
    };
  }

  // Enforce authoritative purpose policy on stored challenge
  if (!challenge.type || !isValidOtpPurpose(challenge.type)) {
    return {
      success: false,
      error: 'Invalid or missing challenge purpose. Session terminated for security.',
      code: 'INVALID_CHALLENGE',
    };
  }

  // If client supplied expectedType, strictly validate against stored authoritative purpose
  if (params.expectedType !== undefined) {
    if (!isValidOtpPurpose(params.expectedType) || challenge.type !== params.expectedType) {
      return {
        success: false,
        error: 'Challenge purpose mismatch. This verification code cannot be used for this purpose.',
        code: 'INVALID_CHALLENGE',
      };
    }
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

  if (challenge.attempts >= challenge.maxAttempts) {
    return {
      success: false,
      error: 'Maximum verification attempts exceeded (5). Session terminated for security.',
      code: 'TOO_MANY_ATTEMPTS',
      remainingAttempts: 0,
    };
  }

  if (inFlightVerifications.has(params.challengeToken) || (challenge as any)._isVerifying) {
    return {
      success: false,
      error: 'Verification already in progress for this session. Replay is not permitted.',
      code: 'ALREADY_USED',
    };
  }
  inFlightVerifications.add(params.challengeToken);
  (challenge as any)._isVerifying = true;

  try {
    challenge.attempts += 1;

    if (challenge.attempts > challenge.maxAttempts) {
      saveChallengesToDisk();
      return {
        success: false,
        error: 'Maximum verification attempts exceeded (5). Session terminated for security.',
        code: 'TOO_MANY_ATTEMPTS',
        remainingAttempts: 0,
      };
    }

    saveChallengesToDisk();

    const submittedHash = hashOtp(params.otp, challenge.salt);
    const submittedHashBuf = Buffer.from(submittedHash, 'utf-8');
    const expectedHashBuf = Buffer.from(challenge.otpHash, 'utf-8');

    const isMatch =
      submittedHashBuf.length === expectedHashBuf.length &&
      crypto.timingSafeEqual(submittedHashBuf, expectedHashBuf);

    if (!isMatch) {
      (challenge as any)._isVerifying = false;
      const remaining = Math.max(0, challenge.maxAttempts - challenge.attempts);
      saveChallengesToDisk();
      if (remaining === 0) {
        return {
          success: false,
          error: 'Maximum verification attempts exceeded (5). Session terminated for security.',
          code: 'TOO_MANY_ATTEMPTS',
          remainingAttempts: 0,
        };
      }
      return {
        success: false,
        error: `Invalid verification code. ${remaining} attempt(s) remaining before session lock.`,
        code: 'INVALID_OTP',
        remainingAttempts: remaining,
      };
    }

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
  } finally {
    inFlightVerifications.delete(params.challengeToken);
  }
}

export async function resendOtpChallenge(params: {
  email: string;
  challengeToken: string;
}): Promise<ResendOtpResult> {
  const normalizedEmail = params.email.toLowerCase().trim();
  const isPgAvail = await isPostgresAvailable();

  let challenge: OtpChallenge | null = null;

  if (isPgAvail) {
    challenge = await loadChallengeFromPostgres(params.challengeToken);
  }

  if (!challenge) {
    loadChallengesFromDisk();
    challenge = activeChallenges.get(params.challengeToken) || null;
  }

  if (!challenge || challenge.email.toLowerCase().trim() !== normalizedEmail) {
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

  const candidateOtp = generateSecureOtp();
  const candidateSalt = crypto.randomBytes(16).toString('hex');
  const candidateHash = hashOtp(candidateOtp, candidateSalt);

  const dispatchResult = await brevoEmailService.sendOtpEmail(normalizedEmail, candidateOtp, {
    type: challenge.type,
  });

  if (!dispatchResult.success || dispatchResult.deliveryStatus === 'TIMEOUT_UNKNOWN' || dispatchResult.deliveryStatus === 'REJECTED' || dispatchResult.deliveryStatus === 'FAILED_PRECHECK') {
    return {
      success: false,
      error: 'Failed to deliver verification email. Your previous verification code remains valid.',
      cooldownSeconds: Math.ceil(RESEND_COOLDOWN_MS / 1000),
    };
  }

  const updatedChallenge: OtpChallenge = {
    ...challenge,
    salt: candidateSalt,
    otpHash: candidateHash,
    otp: candidateOtp,
    lastSentAt: now,
    expiresAt: now + OTP_EXPIRY_MS,
    resends: currentResends + 1,
  };

  const isProduction = process.env.NODE_ENV === 'production';
  const hasPg = await isPostgresAvailable();

  if (hasPg) {
    const pgSaved = await saveChallengeToPostgres(updatedChallenge);
    if (!pgSaved) {
      return {
        success: false,
        error: 'Failed to update verification challenge in database. Your previous verification code remains valid.',
        cooldownSeconds: Math.ceil(RESEND_COOLDOWN_MS / 1000),
      };
    }
  } else if (isProduction) {
    return {
      success: false,
      error: 'Authentication persistence unavailable. Please try again shortly.',
      cooldownSeconds: Math.ceil(RESEND_COOLDOWN_MS / 1000),
    };
  }

  activeChallenges.set(challenge.challengeToken, updatedChallenge);
  saveChallengesToDisk();

  const isSimulated = dispatchResult.deliveryStatus === 'SIMULATED' || dispatchResult.isMock;

  return {
    success: true,
    challengeToken: challenge.challengeToken,
    cooldownSeconds: 30,
    message: isSimulated
      ? `[Development Simulation] New verification code dispatched to ${normalizedEmail}.`
      : 'New verification code dispatched to your email.',
  };
}

export function getChallengeForTesting(challengeToken: string): OtpChallenge | undefined {
  return activeChallenges.get(challengeToken);
}
