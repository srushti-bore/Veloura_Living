import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api/response';
import { handleApiError, NotFoundError } from '@/lib/api/errorHandler';
import { getOrderByIdOrNumber } from '@/lib/data/orderStore';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = getOrderByIdOrNumber(id);
    if (!order) {
      throw new NotFoundError(`Order with identifier '${id}' not found.`);
    }
    return successResponse(order, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
