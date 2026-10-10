/**
 * 🏛️ Veloura Living — Mandatory Authentication OTP Engine
 * Manages 6-digit unpredictable OTP generation, challenge tokens, Brevo email dispatch,
 * 10-minute expiry lifecycles, 5-attempt brute-force protection, 30s resend cooldowns, and single-use verification.
 * Reference: docs/Veloura_Living_SRS.md (AUTH-001, AUTH-003, AUTH-007, SEC-002)
 */

import crypto from 'crypto';
import { brevoEmailService } from '@/lib/services/brevoEmailService';

export interface OtpChallenge {
  challengeId: string;
  challengeToken: string;
  email: string;
  userId?: string;
  otp: string; // Cryptographically random 6-digit numeric OTP
  type: 'LOGIN' | 'REGISTER';
  attempts: number;
  maxAttempts: number;
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

/**
 * Generates an unpredictable cryptographically secure 6-digit numeric string
 */
function generateSecureOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
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
  const challengeId = crypto.randomUUID();
  const challengeToken = `chal_${crypto.randomUUID().replace(/-/g, '')}`;

  const challenge: OtpChallenge = {
    challengeId,
    challengeToken,
    email: normalizedEmail,
    userId: params.userId,
    otp,
    type: params.type,
    attempts: 0,
    maxAttempts: MAX_ATTEMPTS,
    createdAt: now,
    expiresAt: now + OTP_EXPIRY_MS,
    lastSentAt: now,
    isVerified: false,
    metadata: params.metadata,
  };

  activeChallenges.set(challengeToken, challenge);
  emailToChallengeMap.set(normalizedEmail, challengeToken);

  // Dispatch OTP email via Brevo transactional engine
  const dispatchResult = await brevoEmailService.sendOtpEmail(normalizedEmail, otp, {
    name: params.name,
    type: params.type,
  });

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
}): Promise<VerifyOtpResult> {
  const normalizedEmail = params.email.toLowerCase().trim();
  const challenge = activeChallenges.get(params.challengeToken);

  if (!challenge || challenge.email !== normalizedEmail) {
    return {
      success: false,
      error: 'Invalid or expired verification session. Please initiate login again.',
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
    return {
      success: false,
      error: 'Maximum verification attempts exceeded (5). Session terminated for security.',
      code: 'TOO_MANY_ATTEMPTS',
    };
  }

  // Constant-time OTP string comparison
  const submittedOtpBuf = Buffer.from(params.otp.trim(), 'utf-8');
  const expectedOtpBuf = Buffer.from(challenge.otp, 'utf-8');

  const isMatch =
    submittedOtpBuf.length === expectedOtpBuf.length &&
    crypto.timingSafeEqual(submittedOtpBuf, expectedOtpBuf);

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

  return {
    success: true,
    userId: challenge.userId,
    email: challenge.email,
    type: challenge.type,
    metadata: challenge.metadata,
  };
}

/**
 * Resends a fresh OTP code to the user, respecting the 30-second cooldown
 */
export async function resendOtpChallenge(params: {
  email: string;
  challengeToken: string;
}): Promise<ResendOtpResult> {
  const normalizedEmail = params.email.toLowerCase().trim();
  const challenge = activeChallenges.get(params.challengeToken);

  if (!challenge || challenge.email !== normalizedEmail) {
    // If challenge missing but email is known, create a new one
    const newChallenge = await createOtpChallenge({
      email: normalizedEmail,
      type: 'LOGIN',
    });
    return {
      success: true,
      challengeToken: newChallenge.challengeToken,
      cooldownSeconds: 30,
      message: 'New verification code dispatched to your email.',
    };
  }

  const now = Date.now();
  const elapsed = now - challenge.lastSentAt;

  if (elapsed < RESEND_COOLDOWN_MS) {
    const remainingSec = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
    return {
      success: false,
      error: `Please wait ${remainingSec} second(s) before requesting another code.`,
      cooldownSeconds: remainingSec,
    };
  }

  // Generate new OTP and refresh challenge
  const newOtp = generateSecureOtp();
  challenge.otp = newOtp;
  challenge.lastSentAt = now;
  challenge.expiresAt = now + OTP_EXPIRY_MS;
  challenge.attempts = 0; // reset attempts on clean resend

  await brevoEmailService.sendOtpEmail(normalizedEmail, newOtp, {
    type: challenge.type,
  });

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
