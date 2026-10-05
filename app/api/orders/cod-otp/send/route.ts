import { NextRequest } from 'next/server';
import { codSafetyService } from '@/lib/services/codService';
import { sendSuccess, sendError } from '@/lib/api/response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const phoneOrEmail = body.phoneOrEmail || body.phone || body.email;
    const amountInINR = body.amountInINR !== undefined ? body.amountInINR : body.amount;
    const postalCode = body.postalCode;

    if (!phoneOrEmail) {
      return sendError('phoneOrEmail (or phone/email) is required for COD verification', 'VALIDATION_ERROR', 400);
    }

    // Check cart eligibility if amount is supplied
    if (amountInINR !== undefined) {
      const eligibility = codSafetyService.checkEligibility(amountInINR, postalCode);
      if (!eligibility.eligible) {
        return sendError(eligibility.reason || 'Cart is not eligible for Cash on Delivery', 'BUSINESS_RULE_ERROR', 400);
      }
    }

    const result = codSafetyService.generateOtp(phoneOrEmail);

    return sendSuccess({
      verificationId: result.verificationId,
      expiresAt: result.expiresAt,
      message: `A 6-digit verification code has been dispatched to ${phoneOrEmail}.`,
      // For developer/tester convenience in preview mode:
      debugCode: process.env.NODE_ENV !== 'production' ? result.otp : undefined,
    });
  } catch (error: any) {
    return sendError(error.message || 'Failed to dispatch COD verification OTP', 'INTERNAL_ERROR', 500);
  }
}
