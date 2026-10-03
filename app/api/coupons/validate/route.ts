import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { handleApiError, ValidationError } from '@/lib/api/errorHandler';
import { getSession } from '@/lib/auth/session';
import { validateCoupon } from '@/lib/data/pricingStore';
import { getCart } from '@/lib/data/shoppingStore';

const CART_SESSION_COOKIE = 'veloura_session_id';

function resolveOwnerKey(request: NextRequest, sessionUserId?: string): string {
  if (sessionUserId) return sessionUserId;
  const cookie = request.cookies.get(CART_SESSION_COOKIE)?.value;
  return cookie || 'default_session';
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    const ownerKey = resolveOwnerKey(request, session?.id);
    const body = await request.json();
    const { code, subtotal: customSubtotal } = body;

    if (!code || typeof code !== 'string') {
      throw new ValidationError('Coupon code is required.');
    }

    let subtotal = Number(customSubtotal);
    if (!subtotal || isNaN(subtotal)) {
      const cart = getCart(ownerKey);
      subtotal = cart.subtotal;
    }

    const result = validateCoupon(code, subtotal, session?.id);
    if (!result.isValid) {
      return errorResponse(result.message, 422, 'INVALID_COUPON');
    }

    return successResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
