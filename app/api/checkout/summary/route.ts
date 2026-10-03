import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/errorHandler';
import { getSession } from '@/lib/auth/session';
import { calculateAuthoritativeCheckout } from '@/lib/data/pricingStore';

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
    const body = await request.json().catch(() => ({}));

    const { shippingAddressId, shippingMethod = 'standard', couponCode } = body;

    const summary = calculateAuthoritativeCheckout({
      ownerKey,
      shippingAddressId,
      shippingMethod,
      couponCode,
    });

    return successResponse(summary, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
