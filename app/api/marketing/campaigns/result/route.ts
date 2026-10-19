import { NextRequest } from 'next/server';
export const dynamic = 'force-dynamic';
import { successResponse } from '@/lib/api/response';
import { handleApiError, UnauthorizedError, ValidationError, NotFoundError } from '@/lib/api/errorHandler';
import { getSession } from '@/lib/auth/session';
import { recordDispatchResult } from '@/lib/data/marketingStore';
import { CampaignDispatchResultInput } from '@/types/marketing';

const VALID_STATUSES: CampaignDispatchResultInput['status'][] = [
  'ACCEPTED',
  'FAILED',
  'BOUNCED',
  'TIMEOUT_AMBIGUOUS',
];

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
      throw new UnauthorizedError('Unauthorized dispatch result update request.');
    }

    const body = await request.json().catch(() => ({}));
    const { dispatchId, status, providerMessageId, failureReason } = body;

    if (!dispatchId || typeof dispatchId !== 'string') {
      throw new ValidationError('dispatchId is required.');
    }

    if (!status || !VALID_STATUSES.includes(status)) {
      throw new ValidationError(`status must be one of: ${VALID_STATUSES.join(', ')}`);
    }

    const updated = await recordDispatchResult({
      dispatchId,
      status,
      providerMessageId,
      failureReason,
    });

    if (!updated) {
      throw new NotFoundError(`Dispatch record not found for id: ${dispatchId}`);
    }

    return successResponse(
      {
        dispatchId: updated.id,
        status: updated.status,
        providerMessageId: updated.provider_message_id,
        sentAt: updated.sent_at,
        updatedAt: updated.updated_at,
      },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
