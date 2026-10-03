import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { handleApiError, ValidationError } from '@/lib/api/errorHandler';
import { getSession } from '@/lib/auth/session';
import { createOrder, getOrdersByUserId, getAllOrders } from '@/lib/data/orderStore';
import { hasAnyRole } from '@/lib/auth/rbac';
import { PaymentMethodEnum } from '@/types';

const CART_SESSION_COOKIE = 'veloura_session_id';

function resolveOwnerKey(request: NextRequest, sessionUserId?: string): string {
  if (sessionUserId) return sessionUserId;
  const cookie = request.cookies.get(CART_SESSION_COOKIE)?.value;
  return cookie || 'default_session';
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    const { searchParams } = new URL(request.url);

    // If staff/admin with viewAll param, show all orders
    if (session && hasAnyRole(session.roles, ['ADMIN', 'MANAGER', 'ORDER_MANAGER']) && searchParams.get('all') === 'true') {
      const page = Number(searchParams.get('page')) || 1;
      const limit = Number(searchParams.get('limit')) || 20;
      const status = searchParams.get('status') as any;
      const result = getAllOrders({ page, limit, status });
      return successResponse(result.orders, 200, {
        page: result.totalPages ? page : 1,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    }

    // Default: Customer's own orders
    if (session?.id) {
      const orders = getOrdersByUserId(session.id);
      return successResponse(orders, 200);
    }

    // Anonymous demo: Return recent orders or empty
    const all = getAllOrders({ limit: 5 });
    return successResponse(all.orders, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    const ownerKey = resolveOwnerKey(request, session?.id);
    const body = await request.json();

    const {
      fullName,
      email,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      shippingMethod = 'standard',
      paymentMethod = 'UPI',
      couponCode,
      customerNotes,
      idempotencyKey,
    } = body;

    if (!fullName || !email || !phone || !addressLine1 || !city || !state || !postalCode) {
      throw new ValidationError('Complete customer contact and delivery address details are required.');
    }

    const result = createOrder({
      ownerKey,
      userId: session?.id,
      customerInfo: {
        fullName,
        email,
        phone,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
      },
      shippingMethod,
      paymentMethod: paymentMethod as PaymentMethodEnum,
      couponCode,
      customerNotes,
      idempotencyKey: idempotencyKey || request.headers.get('x-idempotency-key') || undefined,
    });

    if (result.error) {
      throw new ValidationError(result.error);
    }

    return successResponse(result.order, result.isDuplicate ? 200 : 201);
  } catch (error) {
    return handleApiError(error);
  }
}
