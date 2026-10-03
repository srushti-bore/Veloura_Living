import { NextResponse } from 'next/server';
import { successResponse } from '@/lib/api/response';
import { AUTH_COOKIE_NAME } from '@/lib/auth/session';

export async function POST() {
  const response = successResponse({ message: 'Successfully signed out' }, 200);
  response.cookies.set(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return response;
}
