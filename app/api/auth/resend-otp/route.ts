import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { handleApiError, ValidationError } from '@/lib/api/errorHandler';
import { resendOtpChallenge } from '@/lib/auth/otpService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, challengeToken } = body;

    if (!email || !challengeToken) {
      throw new ValidationError('Email and challenge token are required.');
    }

    const resendResult = await resendOtpChallenge({
      email,
      challengeToken,
    });

    if (!resendResult.success) {
      return errorResponse(
        resendResult.error || 'Failed to resend verification code.',
        429,
        'COOLDOWN_ACTIVE'
      );
    }

    return successResponse(
      {
        message: resendResult.message || 'New verification code dispatched to your email.',
        cooldownSeconds: resendResult.cooldownSeconds || 30,
        challengeToken: resendResult.challengeToken,
      },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
