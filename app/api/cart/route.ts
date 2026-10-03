import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api/response';
import { handleApiError, ValidationError } from '@/lib/api/errorHandler';
import { getSession } from '@/lib/auth/session';
import { getCart, addToCart, clearCart } from '@/lib/data/shoppingStore';

const CART_SESSION_COOKIE = 'veloura_session_id';

function resolveOwnerKey(request: NextRequest, sessionUserId?: string): { key: string; newSessionId?: string } {
  if (sessionUserId) return { key: sessionUserId };
  const existingCookie = request.cookies.get(CART_SESSION_COOKIE)?.value;
  if (existingCookie) return { key: existingCookie };

  const newSessionId = `anon_${crypto.randomUUID()}`;
  return { key: newSessionId, newSessionId };
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    const { key, newSessionId } = resolveOwnerKey(request, session?.id);
    const cart = getCart(key);

    const response = successResponse(cart, 200);
    if (newSessionId) {
      response.cookies.set(CART_SESSION_COOKIE, newSessionId, {
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

    const { sku, variantSku, quantity = 1 } = body;
    const targetSku = variantSku || sku;

    if (!targetSku) {
      throw new ValidationError('Variant SKU is required to add item to bag.');
    }

    const result = addToCart(key, targetSku, Number(quantity));
    if (result.error) {
      throw new ValidationError(result.error);
    }

    const response = successResponse(result.cart, 200);
    if (newSessionId) {
      response.cookies.set(CART_SESSION_COOKIE, newSessionId, {
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

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession(request);
    const { key } = resolveOwnerKey(request, session?.id);
    const cart = clearCart(key);
    return successResponse(cart, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
