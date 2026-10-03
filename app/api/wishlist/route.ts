import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api/response';
import { handleApiError, ValidationError } from '@/lib/api/errorHandler';
import { getSession } from '@/lib/auth/session';
import { getWishlist, toggleWishlistItem } from '@/lib/data/shoppingStore';
import { getProductBySlugOrId } from '@/lib/data/catalogStore';

const WISHLIST_SESSION_COOKIE = 'veloura_session_id';

function resolveOwnerKey(request: NextRequest, sessionUserId?: string): { key: string; newSessionId?: string } {
  if (sessionUserId) return { key: sessionUserId };
  const existingCookie = request.cookies.get(WISHLIST_SESSION_COOKIE)?.value;
  if (existingCookie) return { key: existingCookie };

  const newSessionId = `anon_${crypto.randomUUID()}`;
  return { key: newSessionId, newSessionId };
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    const { key, newSessionId } = resolveOwnerKey(request, session?.id);
    const productIds = getWishlist(key);

    const products = productIds
      .map((id) => getProductBySlugOrId(id))
      .filter((p) => p !== undefined);

    const response = successResponse({ productIds, products }, 200);
    if (newSessionId) {
      response.cookies.set(WISHLIST_SESSION_COOKIE, newSessionId, {
        path: '/',
        maxAge: 30 * 24 * 60 * 60,
        sameSite: 'lax',
      });
    }
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    const { key, newSessionId } = resolveOwnerKey(request, session?.id);
    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      throw new ValidationError('Product ID is required.');
    }

    const result = toggleWishlistItem(key, productId);

    const response = successResponse(result, 200);
    if (newSessionId) {
      response.cookies.set(WISHLIST_SESSION_COOKIE, newSessionId, {
        path: '/',
        maxAge: 30 * 24 * 60 * 60,
        sameSite: 'lax',
      });
    }
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
