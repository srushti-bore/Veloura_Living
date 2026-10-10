import { NextRequest } from 'next/server';
export const dynamic = 'force-dynamic';
import { successResponse, errorResponse } from '@/lib/api/response';
import { handleApiError, ValidationError, UnauthorizedError } from '@/lib/api/errorHandler';
import { signToken } from '@/lib/auth/jwt';
import { AUTH_COOKIE_NAME } from '@/lib/auth/session';
import { initAuthStore, findUserByEmail, saveUserRecord, resetFailedLogin, UserRecord } from '@/lib/data/authStore';
import { verifyOtpChallenge } from '@/lib/auth/otpService';
import { AuthResponseData } from '@/types';

export async function POST(request: NextRequest) {
  try {
    await initAuthStore();
    const body = await request.json();
    const { email, challengeToken, otp } = body;

    if (!email || !challengeToken || !otp) {
      throw new ValidationError('Email, challenge token, and 6-digit verification code are required.');
    }

    const verifyResult = await verifyOtpChallenge({
      email,
      challengeToken,
      otp,
    });

    if (!verifyResult.success) {
      const status = verifyResult.code === 'TOO_MANY_ATTEMPTS' || verifyResult.code === 'EXPIRED_OTP' ? 400 : 400;
      return errorResponse(
        verifyResult.error || 'Invalid verification code.',
        status,
        verifyResult.code || 'OTP_VERIFICATION_FAILED'
      );
    }

    let record: UserRecord | undefined = findUserByEmail(email);
    if (!record && verifyResult.metadata?.pendingRecord) {
      const pending = verifyResult.metadata.pendingRecord as UserRecord;
      pending.user.is_email_verified = true;
      pending.user.created_at = new Date().toISOString();
      pending.user.updated_at = new Date().toISOString();
      saveUserRecord(pending);
      record = pending;
    } else if (record) {
      record.user.is_email_verified = true;
      record.user.updated_at = new Date().toISOString();
      saveUserRecord(record);
    }

    if (!record) {
      throw new UnauthorizedError('User profile not found for this verification.');
    }

    // Reset failed login counter
    resetFailedLogin(email);

    // Issue authoritative JWT token and HTTP-only session cookie
    const token = await signToken(record.user.id, record.user.email, record.roles);

    const responseData: AuthResponseData = {
      user: {
        id: record.user.id,
        email: record.user.email,
        roles: record.roles,
        status: record.user.status,
        profile: {
          firstName: record.profile.first_name,
          lastName: record.profile.last_name,
          avatarUrl: record.profile.avatar_url,
        },
      },
      token,
      expiresIn: 7 * 24 * 60 * 60,
    };

    const response = successResponse(responseData, 200);
    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
