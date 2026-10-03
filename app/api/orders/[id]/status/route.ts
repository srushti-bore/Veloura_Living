import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api/response';
import { handleApiError, ValidationError, NotFoundError } from '@/lib/api/errorHandler';
import { requirePermission } from '@/lib/auth/session';
import { updateOrderStatus, getOrderByIdOrNumber } from '@/lib/data/orderStore';
import { OrderStatusEnum } from '@/types';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission(request, 'ORDER_UPDATE');
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const validStatuses: OrderStatusEnum[] = [
      'PLACED',
      'CONFIRMED',
      'PROCESSING',
      'SHIPPED',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
    ];

    if (!status || !validStatuses.includes(status)) {
      throw new ValidationError(`Invalid order status. Allowed: ${validStatuses.join(', ')}`);
    }

    const existing = getOrderByIdOrNumber(id);
    if (!existing) {
      throw new NotFoundError(`Order '${id}' not found.`);
    }

    const updated = updateOrderStatus(existing.id, status);
    return successResponse(updated, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
