import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api/response';
import { handleApiError, ValidationError, NotFoundError } from '@/lib/api/errorHandler';
import { getSession } from '@/lib/auth/session';
import { updateCartItemQuantity, removeFromCart } from '@/lib/data/shoppingStore';

const CART_SESSION_COOKIE = 'veloura_session_id';

function resolveOwnerKey(request: NextRequest, sessionUserId?: string): string {
  if (sessionUserId) return sessionUserId;
  const cookie = request.cookies.get(CART_SESSION_COOKIE)?.value;
  return cookie || 'default_session';
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const session = await getSession(request);
    const ownerKey = resolveOwnerKey(request, session?.id);
    const { itemId } = await params;
    const body = await request.json();

    if (body.quantity === undefined) {
      throw new ValidationError('Quantity is required.');
    }

    const result = updateCartItemQuantity(ownerKey, itemId, Number(body.quantity));
    if (result.error) {
      throw new ValidationError(result.error);
    }

    return successResponse(result.cart, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const session = await getSession(request);
    const ownerKey = resolveOwnerKey(request, session?.id);
    const { itemId } = await params;

    const cart = removeFromCart(ownerKey, itemId);
    return successResponse(cart, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
