import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { handleApiError, ValidationError, ConflictError } from '@/lib/api/errorHandler';
import { hashPassword } from '@/lib/auth/password';
import { signToken } from '@/lib/auth/jwt';
import { AUTH_COOKIE_NAME } from '@/lib/auth/session';
import { initAuthStore, findUserByEmail, saveUserRecord, UserRecord } from '@/lib/data/authStore';
import { AuthResponseData } from '@/types';

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
    if (existing) {
      throw new ConflictError('An account with this email address already exists.');
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

    saveUserRecord(newRecord);

    const token = await signToken(userId, newRecord.user.email, newRecord.roles);

    const responseData: AuthResponseData = {
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
      token,
      expiresIn: 7 * 24 * 60 * 60,
    };

    const response = successResponse(responseData, 201);
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
