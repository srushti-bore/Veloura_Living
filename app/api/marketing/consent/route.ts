import { NextRequest } from 'next/server';
export const dynamic = 'force-dynamic';
import { successResponse } from '@/lib/api/response';
import { handleApiError, ValidationError, ForbiddenError, UnauthorizedError } from '@/lib/api/errorHandler';
import { getSession } from '@/lib/auth/session';
import { findUserByEmailAuthoritative } from '@/lib/data/authStore';
import { recordMarketingConsent, getMarketingConsent } from '@/lib/data/marketingStore';
import { ConsentSourceEnum } from '@/types/marketing';

const VALID_SOURCES: ConsentSourceEnum[] = [
  'CHECKOUT',
  'FOOTER_NEWSLETTER',
  'ACCOUNT_SETTINGS',
  'API',
  'IMPORT',
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, isOptedIn, source } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      throw new ValidationError('A valid email address is required.');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const consentSource: ConsentSourceEnum = VALID_SOURCES.includes(source) ? source : 'CHECKOUT';

    // 🔒 Security & Authorization Check: Prevent unauthorized preference tampering
    const session = await getSession(request);

    if (session) {
      // Authenticated users may ONLY modify their own marketing preferences (unless Admin)
      const isAdmin = session.roles.includes('ADMIN');
      if (!isAdmin && session.email.toLowerCase().trim() !== normalizedEmail) {
        throw new ForbiddenError('You are not authorized to modify marketing preferences for another customer account.');
      }
    } else {
      // Unauthenticated visitor / guest:
      // Modifying preferences via ACCOUNT_SETTINGS strictly requires user authentication
      if (consentSource === 'ACCOUNT_SETTINGS') {
        throw new UnauthorizedError('Please sign in to your account to update your marketing preferences.');
      }
    }

    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    const consent = await recordMarketingConsent({
      email: normalizedEmail,
      isOptedIn: Boolean(isOptedIn),
      source: consentSource,
      userId: session?.id,
      ipAddress,
      userAgent,
    });

    return successResponse(
      {
        email: consent.email,
        isOptedIn: consent.is_opted_in,
        source: consent.consent_source,
        consentedAt: consent.consented_at,
        unsubscribedAt: consent.unsubscribed_at,
        message: consent.is_opted_in
          ? 'Marketing preferences saved. You are opted in to exclusive collections and atelier updates.'
          : 'Marketing preferences saved. You will not receive promotional emails.',
      },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    const { searchParams } = new URL(request.url);
    const queryEmail = searchParams.get('email')?.toLowerCase().trim();

    if (!session && !queryEmail) {
      throw new UnauthorizedError('Authentication required to view marketing preferences.');
    }

    const targetEmail = queryEmail || session?.email;
    if (!targetEmail) {
      throw new ValidationError('Email parameter is required.');
    }

    // Non-admin users can only view their own preferences
    if (session && !session.roles.includes('ADMIN') && session.email.toLowerCase().trim() !== targetEmail) {
      throw new ForbiddenError('Access denied to other customer preferences.');
    }

    const consent = await getMarketingConsent(targetEmail);

    return successResponse({
      email: targetEmail,
      isOptedIn: consent ? consent.is_opted_in : false,
      source: consent?.consent_source || null,
      consentedAt: consent?.consented_at || null,
      unsubscribedAt: consent?.unsubscribed_at || null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
