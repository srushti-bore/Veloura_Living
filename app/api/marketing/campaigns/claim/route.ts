import { NextRequest } from 'next/server';
export const dynamic = 'force-dynamic';
import { successResponse } from '@/lib/api/response';
import { handleApiError, UnauthorizedError, ValidationError, ForbiddenError } from '@/lib/api/errorHandler';
import { getSession } from '@/lib/auth/session';
import { marketingCampaignService } from '@/lib/data/marketingStore';

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export async function POST(request: NextRequest) {
  try {
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

    if (!isAuthorized && process.env.NODE_ENV !== 'production' && !configuredKey) {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      throw new UnauthorizedError('Unauthorized campaign claim request.');
    }

    const body = await request.json().catch(() => ({}));
    const { campaignKey, workerId, claimedBy, batchSize, title, subject, testRecipientEmail } = body;

    if (!campaignKey || typeof campaignKey !== 'string') {
      throw new ValidationError('campaignKey is required.');
    }

    let normalizedTestEmail: string | undefined = undefined;
    if (testRecipientEmail !== undefined && testRecipientEmail !== null) {
      if (typeof testRecipientEmail !== 'string') {
        throw new ValidationError('testRecipientEmail must be a string.');
      }
      const trimmed = testRecipientEmail.trim().toLowerCase();
      if (!trimmed || trimmed.length < 5 || trimmed.length > 254 || !EMAIL_REGEX.test(trimmed)) {
        throw new ValidationError('testRecipientEmail must be a valid email address.');
      }

      const allowlistRaw = process.env.MARKETING_TEST_ALLOWLIST || '';
      const allowedEmails = allowlistRaw
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);

      if (allowedEmails.length === 0 || !allowedEmails.includes(trimmed)) {
        throw new ForbiddenError(
          'testRecipientEmail is not permitted by server MARKETING_TEST_ALLOWLIST.'
        );
      }

      normalizedTestEmail = trimmed;
    }

    const worker = workerId || claimedBy || `n8n-worker-${Math.random().toString(36).slice(2, 8)}`;
    const limit = Math.min(Math.max(Number(batchSize) || 25, 1), 200);

    // Ensure campaign exists in registry
    await marketingCampaignService.createOrGetCampaign({
      campaignKey,
      title: title || `Campaign ${campaignKey}`,
      subject: subject || 'Veloura Living Exclusive Curation',
    });

    // Populate eligible dispatches idempotently (ON CONFLICT DO NOTHING)
    await marketingCampaignService.populateCampaignDispatches(campaignKey);

    // Atomically claim next available pending batch (FOR UPDATE SKIP LOCKED) with optional targetEmail
    const claimedItems = await marketingCampaignService.claimCampaignDispatches(
      campaignKey,
      worker,
      limit,
      normalizedTestEmail
    );

    return successResponse(
      {
        campaignKey,
        claimedBy: worker,
        count: claimedItems.length,
        items: claimedItems,
        ...(normalizedTestEmail ? { testRecipientEmail: normalizedTestEmail } : {}),
      },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
