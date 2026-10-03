import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api/response';
import { handleApiError, ValidationError, UnauthorizedError } from '@/lib/api/errorHandler';
import { hashPassword } from '@/lib/auth/password';
import { initAuthStore, findUserByEmail, saveUserRecord } from '@/lib/data/authStore';

export async function POST(request: NextRequest) {
  try {
    await initAuthStore();
    const body = await request.json();
    const { email, token, newPassword } = body;

    if (!email || !token || !newPassword) {
      throw new ValidationError('Email, reset token, and new password are required.');
    }

    if (newPassword.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long.');
    }

    const record = findUserByEmail(email);
    if (!record || record.resetToken !== token) {
      throw new UnauthorizedError('Invalid or expired password reset token.');
    }

    if (record.resetTokenExpires && record.resetTokenExpires < Date.now()) {
      throw new UnauthorizedError('Password reset token has expired.');
    }

    const newHash = await hashPassword(newPassword);
    record.user.password_hash = newHash;
    record.user.updated_at = new Date().toISOString();
    delete record.resetToken;
    delete record.resetTokenExpires;

    saveUserRecord(record);

    return successResponse({ message: 'Password has been successfully updated. Please sign in.' }, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
