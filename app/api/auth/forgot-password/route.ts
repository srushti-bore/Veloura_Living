import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api/response';
import { handleApiError, ValidationError } from '@/lib/api/errorHandler';
import { initAuthStore, findUserByEmail, saveUserRecord } from '@/lib/data/authStore';

export async function POST(request: NextRequest) {
  try {
    await initAuthStore();
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      throw new ValidationError('A valid email address is required.');
    }

    const record = findUserByEmail(email);
    if (record) {
      const resetToken = crypto.randomUUID();
      record.resetToken = resetToken;
      record.resetTokenExpires = Date.now() + 60 * 60 * 1000; // 1 hour validity
      saveUserRecord(record);
      // In production, an email would be dispatched here via notification service
      return successResponse(
        {
          message: 'Password reset instructions have been dispatched to your email.',
          demoToken: process.env.NODE_ENV !== 'production' ? resetToken : undefined,
        },
        200
      );
    }

    // Always return success to prevent email enumeration attacks
    return successResponse(
      { message: 'If that email address is in our system, we have dispatched a password reset link.' },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
