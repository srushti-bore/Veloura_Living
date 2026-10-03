import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api/response';
import { handleApiError, ValidationError, UnauthorizedError } from '@/lib/api/errorHandler';
import { verifyPassword } from '@/lib/auth/password';
import { signToken } from '@/lib/auth/jwt';
import { AUTH_COOKIE_NAME } from '@/lib/auth/session';
import { initAuthStore, findUserByEmail } from '@/lib/data/authStore';
import { AuthResponseData } from '@/types';

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

    if (record.user.status === 'SUSPENDED') {
      throw new UnauthorizedError('Your account has been suspended. Please contact concierge support.');
    }

    const isMatch = await verifyPassword(password, record.user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password.');
    }

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
