import { NextRequest } from 'next/server';
export const dynamic = 'force-dynamic';
import { successResponse, errorResponse } from '@/lib/api/response';
import { handleApiError, ValidationError, ConflictError } from '@/lib/api/errorHandler';
import { hashPassword } from '@/lib/auth/password';
import { initAuthStore, findUserByEmail, saveUserRecord, UserRecord } from '@/lib/data/authStore';
import { createOtpChallenge } from '@/lib/auth/otpService';

export async function POST(request: NextRequest) {
  try {
    await initAuthStore();
    const body = await request.json();
    const { email, password, firstName, lastName, phone } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      throw new ValidationError('A valid email address is required.');
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long.');
    }

    const existing = findUserByEmail(email);
    if (existing && existing.user.is_email_verified) {
      throw new ConflictError('An account with this email address already exists. Please sign in instead.');
    }

    const userId = crypto.randomUUID();
    const passwordHash = await hashPassword(password);
    const now = new Date().toISOString();

    const newRecord: UserRecord = {
      user: {
        id: userId,
        email: email.toLowerCase().trim(),
        password_hash: passwordHash,
        status: 'ACTIVE',
        is_email_verified: false,
        created_at: now,
        updated_at: now,
      },
      roles: ['CUSTOMER'],
      profile: {
        user_id: userId,
        first_name: firstName?.trim() || '',
        last_name: lastName?.trim() || '',
        phone: phone?.trim() || '',
        preferred_currency: 'INR',
        created_at: now,
        updated_at: now,
      },
      addresses: [],
    };

    // Do NOT save to DB yet — only persist upon successful OTP verification
    // Create OTP verification challenge with pending record in metadata
    const challenge = await createOtpChallenge({
      email: newRecord.user.email,
      type: 'REGISTER',
      userId,
      name: newRecord.profile.first_name,
      metadata: { pendingRecord: newRecord },
    });

    if (!challenge.emailDispatched || !challenge.challengeToken) {
      return errorResponse(
        'Unable to deliver verification code. Please check your email or try again shortly.',
        502,
        'EMAIL_DISPATCH_FAILED'
      );
    }

    const responseData = {
      user: {
        id: userId,
        email: newRecord.user.email,
        roles: newRecord.roles,
        status: 'ACTIVE',
        profile: {
          firstName: newRecord.profile.first_name,
          lastName: newRecord.profile.last_name,
          avatarUrl: newRecord.profile.avatar_url,
        },
      },
      requiresOtp: true,
      challengeToken: challenge.challengeToken,
      expiresInSeconds: challenge.expiresInSeconds,
      cooldownSeconds: challenge.cooldownSeconds,
      message: 'Account created. Verification code dispatched to your email.',
    };

    return successResponse(responseData, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
