import { NextRequest } from 'next/server';
export const dynamic = 'force-dynamic';
import { successResponse } from '@/lib/api/response';
import { handleApiError, ValidationError } from '@/lib/api/errorHandler';
import { unsubscribeCustomer, getMarketingConsentByToken, getMarketingConsent } from '@/lib/data/marketingStore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { token, email, reason } = body;

    if (!token && !email) {
      throw new ValidationError('A valid unsubscribe token or email address is required.');
    }

    const result = await unsubscribeCustomer({ token, email, reason });

    return successResponse(
      {
        unsubscribed: true,
        email: result.email,
        message: result.message,
        transactionalNote: 'You will continue to receive critical order receipts and account security notices.',
      },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token && !email) {
      throw new ValidationError('A valid unsubscribe token or email address is required.');
    }

    // Check if token exists
    const consent = token
      ? await getMarketingConsentByToken(token)
      : email
      ? await getMarketingConsent(email)
      : undefined;

    return successResponse({
      email: consent?.email || email || null,
      isOptedIn: consent ? consent.is_opted_in : false,
      unsubscribedAt: consent?.unsubscribed_at || null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
