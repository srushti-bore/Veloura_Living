import { NextRequest } from 'next/server';
export const dynamic = 'force-dynamic';
import { successResponse } from '@/lib/api/response';
import { handleApiError, ValidationError } from '@/lib/api/errorHandler';
import { recordMarketingConsent } from '@/lib/data/marketingStore';
import { findUserByEmailAuthoritative } from '@/lib/data/authStore';

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email } = body;

    if (!email || typeof email !== 'string') {
      throw new ValidationError('Email address is required.');
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedEmail.length < 5 || trimmedEmail.length > 254 || !EMAIL_REGEX.test(trimmedEmail)) {
      throw new ValidationError('Please enter a valid personal or business email address.');
    }

    // Lookup if this email matches an existing user account
    const existingUser = await findUserByEmailAuthoritative(trimmedEmail).catch(() => undefined);

    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    // Affirmative opt-in via explicit newsletter submission
    const record = await recordMarketingConsent({
      email: trimmedEmail,
      isOptedIn: true,
      source: 'FOOTER_NEWSLETTER',
      userId: existingUser?.user?.id,
      ipAddress,
      userAgent,
    });

    return successResponse(
      {
        email: record.email,
        isOptedIn: true,
        consentedAt: record.consented_at,
        message: 'Thank you for subscribing to The Considered Home. Lookbooks and design inspiration will be delivered to your inbox.',
      },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
