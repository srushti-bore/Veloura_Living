import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api/response';
import { handleApiError, NotFoundError, ForbiddenError } from '@/lib/api/errorHandler';
import { getOrderByIdOrNumber, sanitizeOrderForGuest } from '@/lib/data/orderStore';
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
    const guestToken = searchParams.get('token') || request.headers.get('x-guest-tracking-token');
    const trackingEmail = searchParams.get('email')?.toLowerCase().trim();
    const trackingPhone = searchParams.get('phone')?.trim();

    const order = getOrderByIdOrNumber(id);
    if (!order) {
      throw new NotFoundError(`Order with identifier '${id}' not found.`);
    }

    // 1. Staff / Admin Access (Privileged Full Order View)
    const isStaff = session && hasAnyRole(session.roles, ['ADMIN', 'MANAGER', 'ORDER_MANAGER']);
    if (isStaff) {
      return successResponse(order, 200);
    }

    // 2. Authenticated Customer Owner Access (Full Order View for Order Owner)
    if (session && order.user_id && order.user_id === session.id) {
      return successResponse(order, 200);
    }

    // 3. Guest Order Tracking via High-Entropy Cryptographic Token (Data-Minimization Enforced)
    // Possession of guessable email or phone alone is strictly insufficient to access private order details
    if (guestToken && order.guest_access_token && guestToken === order.guest_access_token) {
      const customer = order.customer_info;
      if (trackingEmail && customer && customer.email.toLowerCase().trim() !== trackingEmail) {
        throw new ForbiddenError('Tracking credentials do not match order records.');
      }
      if (trackingPhone && customer && customer.phone.replace(/\s+/g, '') !== trackingPhone.replace(/\s+/g, '')) {
        throw new ForbiddenError('Tracking credentials do not match order records.');
      }

      // Return sanitized, data-minimized guest view (redacts street address, unmasked phone/email, payment tokens)
      const sanitized = sanitizeOrderForGuest(order);
      return successResponse(sanitized, 200);
    }

    // If caller is unauthenticated or does not possess valid tracking token
    throw new ForbiddenError('Access Denied: Valid guest access token or authenticated customer login required.');
  } catch (error) {
    return handleApiError(error);
  }
}

