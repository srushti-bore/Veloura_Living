import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/errorHandler';
import { notificationService } from '@/lib/services/notificationService';
import { NotificationChannel, NotificationType } from '@/types/notification';

/**
 * POST /api/notifications/test-dispatch
 * Developer and Admin Diagnostic Tool for dispatching test notifications across channels.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      channels = ['IN_APP', 'EMAIL', 'WHATSAPP', 'SMS'],
      type = 'ORDER_STATUS',
      title = 'Veloura Atelier: Diagnostic Test Alert',
      message = 'Your white-glove notification pipeline is operating with 100% telemetry fidelity.',
      recipientEmail = 'concierge@velouraliving.com',
      recipientPhone = '+91 98200 12345',
      actionUrl = '/shop',
    } = body;

    const result = await notificationService.dispatchNotification({
      recipientEmail,
      recipientPhone,
      channels: channels as NotificationChannel[],
      type: type as NotificationType,
      title,
      message,
      actionUrl,
    });

    return successResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
