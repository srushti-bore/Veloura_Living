import { NextRequest } from 'next/server';
export const dynamic = 'force-dynamic';
import { successResponse } from '@/lib/api/response';
import { handleApiError, UnauthorizedError, ValidationError } from '@/lib/api/errorHandler';
import { getSession } from '@/lib/auth/session';
import { getEligibleMarketingAudience } from '@/lib/data/marketingStore';

/**
 * 🔒 Security: Check either n8n / marketing API Key (x-marketing-api-key / x-api-key) or Admin/Manager session.
 * Reused consistently across GET and POST handlers to ensure identical production authorization requirements.
 */
async function verifyMarketingAuthorization(request: NextRequest): Promise<void> {
  const apiKey = request.headers.get('x-marketing-api-key') || request.headers.get('x-api-key');
  const configuredKey = process.env.MARKETING_API_KEY || process.env.N8N_MARKETING_KEY;

  let isAuthorized = false;
  if (configuredKey && apiKey && apiKey.trim() === configuredKey.trim()) {
    isAuthorized = true;
  } else {
    const session = await getSession(request);
    if (session && (session.roles.includes('ADMIN') || session.roles.includes('MANAGER'))) {
      isAuthorized = true;
    }
  }

  // In local non-production if no key is configured yet, allow loopback requests
  if (!isAuthorized && process.env.NODE_ENV !== 'production' && !configuredKey) {
    isAuthorized = true;
  }

  if (!isAuthorized) {
    throw new UnauthorizedError('Unauthorized access to marketing audience. Valid API key or Admin session required.');
  }
}

/**
 * GET /api/marketing/campaigns/eligible
 * Existing GET handler preserved for administrative inspections and query-parameter based lookups.
 */
export async function GET(request: NextRequest) {
  try {
    await verifyMarketingAuthorization(request);

    const { searchParams } = new URL(request.url);
    const campaignKey = searchParams.get('campaignKey') || undefined;

    const audience = await getEligibleMarketingAudience(campaignKey);

    return successResponse(
      {
        totalEligible: audience.total,
        campaignKey: campaignKey || 'all',
        recipients: audience.recipients,
      },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/marketing/campaigns/eligible
 * Secure production endpoint for n8n to query audience eligibility and sizing.
 * Accepts optional JSON body with { campaignKey?: string }.
 * Strictly does NOT expose customer emails, consent records, or unsubscribe tokens unnecessarily.
 */
export async function POST(request: NextRequest) {
  try {
    await verifyMarketingAuthorization(request);

    let campaignKey: string | undefined;

    // Parse optional JSON body safely
    const bodyText = await request.text().catch(() => '');
    if (bodyText && bodyText.trim().length > 0) {
      try {
        const body = JSON.parse(bodyText);
        if (body && typeof body === 'object' && !Array.isArray(body)) {
          if (body.campaignKey !== undefined && body.campaignKey !== null) {
            if (typeof body.campaignKey !== 'string') {
              throw new ValidationError('campaignKey must be a string.');
            }
            campaignKey = body.campaignKey.trim() || undefined;
          }
        } else {
          throw new ValidationError('Request body must be a valid JSON object.');
        }
      } catch (err: any) {
        if (err instanceof ValidationError) throw err;
        throw new ValidationError('Malformed JSON in request body.');
      }
    }

    // Fallback to URL searchParams if not provided in body
    if (!campaignKey) {
      const { searchParams } = new URL(request.url);
      campaignKey = searchParams.get('campaignKey') || undefined;
    }

    const audience = await getEligibleMarketingAudience(campaignKey);

    // Production Privacy Guard: Do not expose customer emails, consent records,
    // or unsubscribe tokens in eligibility query responses.
    return successResponse(
      {
        totalEligible: audience.total,
        campaignKey: campaignKey || 'all',
        hasEligibleRecipients: audience.total > 0,
      },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
