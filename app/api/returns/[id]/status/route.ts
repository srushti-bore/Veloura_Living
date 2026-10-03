import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api/response';
import { handleApiError, ValidationError, UnauthorizedError, NotFoundError } from '@/lib/api/errorHandler';
import { getSession } from '@/lib/auth/session';
import { hasAnyRole } from '@/lib/auth/rbac';
import { updateReturnStatus, getReturnById } from '@/lib/data/postPurchaseStore';
import { ReturnStatusEnum } from '@/types';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession(request);

    // Guard: Order Manager, Manager, or Admin role required
    if (!session || !hasAnyRole(session.roles, ['ADMIN', 'MANAGER', 'ORDER_MANAGER'])) {
      throw new UnauthorizedError('Administrative permission required to update return status.');
    }

    const body = await request.json();
    const { status, trackingNumber } = body;

    const validStatuses: ReturnStatusEnum[] = [
      'RETURN_REQUESTED',
      'RETURN_APPROVED',
      'RETURN_REJECTED',
      'RETURN_PICKUP',
      'RETURN_RECEIVED',
      'REFUND_INITIATED',
      'REFUNDED',
    ];

    if (!status || !validStatuses.includes(status)) {
      throw new ValidationError(`Invalid return status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const updated = updateReturnStatus(id, status, session.id, trackingNumber);

    return successResponse(updated, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
