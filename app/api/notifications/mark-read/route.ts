import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/errorHandler';
import { getSession } from '@/lib/auth/session';
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/lib/data/notificationStore';

const NOTIF_SESSION_COOKIE = 'veloura_session_id';

function resolveOwnerKey(request: NextRequest, sessionUserId?: string): string {
  if (sessionUserId) return sessionUserId;
  const cookie = request.cookies.get(NOTIF_SESSION_COOKIE)?.value;
  return cookie || 'default_session';
}

/**
 * POST /api/notifications/mark-read
 * Mark a single notification or all notifications as read.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    const ownerKey = resolveOwnerKey(request, session?.id);
    const body = await request.json().catch(() => ({}));

    const { id, all = false } = body;

    if (all || !id) {
      const count = markAllNotificationsAsRead(ownerKey);
      return successResponse({ markedAll: true, count, message: `${count} notifications marked as read.` }, 200);
    }

    const updated = markNotificationAsRead(id, ownerKey);
    if (!updated) {
      return errorResponse(`Notification ${id} not found`, 404, 'NOT_FOUND');
    }

    return successResponse({ notification: updated, message: 'Notification marked as read.' }, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
