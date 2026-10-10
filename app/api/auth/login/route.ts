import { NextRequest } from 'next/server';
export const dynamic = 'force-dynamic';
import { successResponse, errorResponse } from '@/lib/api/response';
import { handleApiError, ValidationError, UnauthorizedError } from '@/lib/api/errorHandler';
import { verifyPassword } from '@/lib/auth/password';
import { initAuthStore, findUserByEmail, checkAccountLockout, recordFailedLogin, resetFailedLogin } from '@/lib/data/authStore';
import { createOtpChallenge } from '@/lib/auth/otpService';

export async function POST(request: NextRequest) {
  try {
    await initAuthStore();
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      throw new ValidationError('Email and password are required.');
    }

    const record = findUserByEmail(email);
    if (!record) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    // 1. Check Account Lockout (SRS AUTH-007: 5 failed attempts in 15 mins -> 15 mins lock)
    const lockout = checkAccountLockout(email);
    if (lockout.isLocked) {
      throw new UnauthorizedError(
        `Account temporarily locked due to 5 consecutive failed login attempts (SRS AUTH-007). Please try again in ${lockout.remainingMinutes} minute(s).`
      );
    }

    if (record.user.status === 'SUSPENDED') {
      throw new UnauthorizedError('Your account has been suspended. Please contact concierge support.');
    }

    const isMatch = await verifyPassword(password, record.user.password_hash);
    if (!isMatch) {
      const failInfo = recordFailedLogin(email);
      if (failInfo.isLocked) {
        throw new UnauthorizedError(
          'Account has been temporarily locked for 15 minutes due to 5 failed login attempts (SRS AUTH-007).'
        );
      }
      throw new UnauthorizedError(
        `Invalid email or password. Attempt ${failInfo.attempts} of 5 before temporary 15-minute account lock.`
      );
    }

    // Generate mandatory 6-digit OTP challenge and dispatch via Brevo email
    const challenge = await createOtpChallenge({
      email: record.user.email,
      type: 'LOGIN',
      userId: record.user.id,
      name: record.profile.first_name,
    });

    if (!challenge.emailDispatched || !challenge.challengeToken) {
      return errorResponse(
        'Unable to deliver verification code. Please check your email or try again shortly.',
        502,
        'EMAIL_DISPATCH_FAILED'
      );
    }

    return successResponse(
      {
        requiresOtp: true,
        challengeToken: challenge.challengeToken,
        email: record.user.email,
        expiresInSeconds: challenge.expiresInSeconds,
        cooldownSeconds: challenge.cooldownSeconds,
        message: challenge.message,
      },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
