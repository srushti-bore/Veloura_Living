import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/errorHandler';
import { getSession } from '@/lib/auth/session';
import {
  getNotifications,
  deleteNotification,
  clearAllNotifications,
} from '@/lib/data/notificationStore';

const NOTIF_SESSION_COOKIE = 'veloura_session_id';

function resolveOwnerKey(request: NextRequest, sessionUserId?: string): string {
  if (sessionUserId) return sessionUserId;
  const cookie = request.cookies.get(NOTIF_SESSION_COOKIE)?.value;
  return cookie || 'default_session';
}

/**
 * GET /api/notifications
 * Retrieve user's in-app notification list and unread count badge.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    const ownerKey = resolveOwnerKey(request, session?.id);

    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit')) || 30;
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const type = searchParams.get('type') || undefined;

    const result = getNotifications(ownerKey, { limit, unreadOnly, type });

    return successResponse(
      {
        notifications: result.notifications,
        total: result.total,
        unreadCount: result.unreadCount,
      },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/notifications
 * Delete a specific notification by ID or clear all notifications for the owner.
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession(request);
    const ownerKey = resolveOwnerKey(request, session?.id);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const deleted = deleteNotification(id, ownerKey);
      if (!deleted) {
        return errorResponse(`Notification ${id} not found`, 404, 'NOT_FOUND');
      }
      return successResponse({ deleted: true, id }, 200);
    }

    const clearedCount = clearAllNotifications(ownerKey);
    return successResponse({ clearedCount, message: 'All notifications cleared.' }, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
