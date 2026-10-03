import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api/response';
import { handleApiError, ValidationError, UnauthorizedError } from '@/lib/api/errorHandler';
import { getSession } from '@/lib/auth/session';
import { hasAnyRole } from '@/lib/auth/rbac';
import { cancelOrderAuthoritative } from '@/lib/data/postPurchaseStore';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession(request);
    const body = await request.json().catch(() => ({}));

    const userId = session?.id || '33333333-3333-3333-3333-333333333303';
    const isAdmin = session ? hasAnyRole(session.roles, ['ADMIN', 'MANAGER', 'ORDER_MANAGER']) : false;
    const reason = body.reason || 'Client request prior to fulfillment dispatch';

    const result = cancelOrderAuthoritative({
      orderId: id,
      userId,
      reason,
      isAdmin,
    });

    return successResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
