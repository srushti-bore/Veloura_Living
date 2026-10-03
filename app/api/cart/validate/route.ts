import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/errorHandler';
import { getSession } from '@/lib/auth/session';
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
    const cart = getCart(ownerKey);

    const issues: { sku: string; name: string; requestedQty: number; availableStock: number; message: string }[] = [];

    cart.items.forEach((item) => {
      if (!item.is_in_stock || item.quantity > item.available_stock) {
        issues.push({
          sku: item.sku,
          name: item.product_name,
          requestedQty: item.quantity,
          availableStock: item.available_stock,
          message: item.available_stock === 0 
            ? `${item.product_name} (${item.variant_name}) is currently out of stock.`
            : `Only ${item.available_stock} units available for ${item.product_name} (${item.variant_name}).`,
        });
      }
    });

    const isValid = issues.length === 0 && cart.items.length > 0;

    return successResponse(
      {
        isValid,
        cart,
        issues,
      },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
