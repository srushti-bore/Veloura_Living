import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api/response';
import { handleApiError, ValidationError, UnauthorizedError } from '@/lib/api/errorHandler';
import { getSession } from '@/lib/auth/session';
import { hasAnyRole } from '@/lib/auth/rbac';
import { getReturns, createReturnRequest } from '@/lib/data/postPurchaseStore';
import { ReturnStatusEnum } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    const { searchParams } = new URL(request.url);

    const orderId = searchParams.get('orderId') || undefined;
    const status = (searchParams.get('status') as ReturnStatusEnum) || undefined;
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 20;

    // If staff/admin or explicit all requested
    if (session && hasAnyRole(session.roles, ['ADMIN', 'MANAGER', 'ORDER_MANAGER'])) {
      const result = getReturns({ orderId, status, page, limit });
      return successResponse(result.returns, 200, {
        page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    }

    // Customer's returns
    const userId = session?.id || '33333333-3333-3333-3333-333333333303'; // Demo fallback
    const result = getReturns({ userId, orderId, status, page, limit });

    return successResponse(result.returns, 200, {
      page,
      limit,
      total: result.total,
      totalPages: result.totalPages,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    const body = await request.json();

    const { orderId, reason, condition, images, items, userEmail } = body;

    if (!orderId) {
      throw new ValidationError('orderId is required to initiate a return.');
    }
    if (!reason || reason.trim().length < 5) {
      throw new ValidationError('A specific return reason (at least 5 characters) is required.');
    }

    const userId = session?.id || '33333333-3333-3333-3333-333333333303';
    const email = userEmail || session?.email || 'client@example.com';

    const returnRecord = createReturnRequest({
      orderId,
      userId,
      userEmail: email,
      reason,
      condition,
      images,
      items,
    });

    return successResponse(returnRecord, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
