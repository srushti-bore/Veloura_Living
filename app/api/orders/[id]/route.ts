import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api/response';
import { handleApiError, NotFoundError, ForbiddenError } from '@/lib/api/errorHandler';
import { getOrderByIdOrNumber } from '@/lib/data/orderStore';
import { getSession } from '@/lib/auth/session';
import { hasAnyRole } from '@/lib/auth/rbac';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession(request);
    const { searchParams } = new URL(request.url);
    const trackingEmail = searchParams.get('email')?.toLowerCase().trim();
    const trackingPhone = searchParams.get('phone')?.trim();

    const order = getOrderByIdOrNumber(id);
    if (!order) {
      throw new NotFoundError(`Order with identifier '${id}' not found.`);
    }

    // 1. Staff / Admin Access
    const isStaff = session && hasAnyRole(session.roles, ['ADMIN', 'MANAGER', 'ORDER_MANAGER']);
    if (isStaff) {
      return successResponse(order, 200);
    }

    // 2. Authenticated Customer Owner Access
    if (session && order.user_id && order.user_id === session.id) {
      return successResponse(order, 200);
    }

    // 3. Guest Order Tracking via Verified Email or Phone
    const customer = order.customer_info;
    if (
      customer &&
      ((trackingEmail && customer.email.toLowerCase().trim() === trackingEmail) ||
        (trackingPhone && customer.phone.trim() === trackingPhone))
    ) {
      return successResponse(order, 200);
    }

    // If unauthenticated or caller does not match owner/tracking credentials
    throw new ForbiddenError('You do not have permission to access this order.');
  } catch (error) {
    return handleApiError(error);
  }
}

