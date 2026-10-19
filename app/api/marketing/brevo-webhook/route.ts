import { NextRequest } from 'next/server';
export const dynamic = 'force-dynamic';
import { successResponse, errorResponse } from '@/lib/api/response';
import { handleApiError, UnauthorizedError, ValidationError } from '@/lib/api/errorHandler';
import { unsubscribeCustomer, recordDispatchResult } from '@/lib/data/marketingStore';
import crypto from 'crypto';

/**
 * Brevo Webhook Event Listener for Unsubscribes and Bounces
 * Reference: https://developers.brevo.com/docs/webhooks
 */
export async function POST(request: NextRequest) {
  try {
    // 🔒 Source Verification: Verify webhook secret if configured in environment
    const configuredSecret = process.env.BREVO_WEBHOOK_SECRET || process.env.MARKETING_WEBHOOK_SECRET;
    if (configuredSecret) {
      const headerSecret = request.headers.get('x-webhook-secret') || request.headers.get('x-brevo-webhook-secret');
      const { searchParams } = new URL(request.url);
      const querySecret = searchParams.get('secret');

      const incoming = (headerSecret || querySecret || '').trim();
      const expected = configuredSecret.trim();

      if (!incoming || incoming.length !== expected.length) {
        throw new UnauthorizedError('Unauthorized webhook dispatch: secret mismatch.');
      }

      const isMatch = crypto.timingSafeEqual(Buffer.from(incoming), Buffer.from(expected));
      if (!isMatch) {
        throw new UnauthorizedError('Unauthorized webhook dispatch: invalid signature.');
      }
    }

    const payload = await request.json().catch(() => ({}));
    const event = (payload.event || payload.action || '').toLowerCase().trim();
    const email = (payload.email || payload.recipient || '').toLowerCase().trim();

    if (!email || !email.includes('@')) {
      throw new ValidationError('Invalid or missing email in webhook payload.');
    }

    const UNSUBSCRIBE_EVENTS = [
      'unsubscribe',
      'unsubscribed',
      'spam',
      'hard_bounce',
      'soft_bounce',
      'blocked',
      'invalid_email',
    ];

    if (UNSUBSCRIBE_EVENTS.includes(event)) {
      await unsubscribeCustomer({
        email,
        reason: `Brevo webhook event: ${event}`,
      });

      const messageId = payload['message-id'] || payload.messageId;
      if (messageId) {
        // Record bounce/unsubscribe in dispatch tracker if matching dispatch exists
        await recordDispatchResult({
          dispatchId: messageId,
          status: 'BOUNCED',
          failureReason: `Brevo event: ${event}`,
        }).catch(() => {});
      }

      return successResponse({ eventProcessed: event, email, unsubscribed: true }, 200);
    }

    return successResponse({ eventIgnored: event, email }, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
