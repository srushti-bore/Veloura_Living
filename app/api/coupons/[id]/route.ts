import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/errorHandler';
import { requireRole } from '@/lib/auth/session';
import { toggleCouponStatus, deleteCoupon } from '@/lib/data/pricingStore';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(request, ['ADMIN', 'MANAGER']);
    const { id } = await params;
    const updated = toggleCouponStatus(id);
    if (!updated) {
      return errorResponse('Coupon not found', 404);
    }
    return successResponse(updated, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(request, ['ADMIN', 'MANAGER']);
    const { id } = await params;
    const deleted = deleteCoupon(id);
    if (!deleted) {
      return errorResponse('Coupon not found', 404);
    }
    return successResponse({ success: true, message: 'Coupon deleted successfully' }, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
