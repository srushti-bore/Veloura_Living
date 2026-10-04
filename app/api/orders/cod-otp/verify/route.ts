import { NextRequest } from 'next/server';
import { codSafetyService } from '@/lib/services/codService';
import { sendSuccess, sendError } from '@/lib/api/response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { verificationId, otp } = body;

    if (!verificationId || !otp) {
      return sendError('verificationId and otp are required', 'VALIDATION_ERROR', 400);
    }

    const verification = codSafetyService.verifyOtp(verificationId, otp);

    if (!verification.verified) {
      return sendError(verification.message, 'VALIDATION_ERROR', 400);
    }

    return sendSuccess({
      verified: true,
      verificationId,
      message: verification.message,
    });
  } catch (error: any) {
    return sendError(error.message || 'Failed to verify COD OTP', 'INTERNAL_ERROR', 500);
  }
}
