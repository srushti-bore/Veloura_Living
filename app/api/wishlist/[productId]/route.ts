import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/errorHandler';
import { getSession } from '@/lib/auth/session';
import { removeFromWishlist } from '@/lib/data/shoppingStore';

const WISHLIST_SESSION_COOKIE = 'veloura_session_id';

function resolveOwnerKey(request: NextRequest, sessionUserId?: string): string {
  if (sessionUserId) return sessionUserId;
  const cookie = request.cookies.get(WISHLIST_SESSION_COOKIE)?.value;
  return cookie || 'default_session';
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const session = await getSession(request);
    const ownerKey = resolveOwnerKey(request, session?.id);
    const { productId } = await params;

    const updated = removeFromWishlist(ownerKey, productId);
    return successResponse({ wishlist: updated, removed: productId }, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
