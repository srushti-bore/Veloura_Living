import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api/response';
import { handleApiError, ValidationError } from '@/lib/api/errorHandler';
import { requirePermission } from '@/lib/auth/session';
import { getCoupons, createCoupon } from '@/lib/data/pricingStore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('all') !== 'true';
    const coupons = getCoupons(activeOnly);
    return successResponse(coupons, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requirePermission(request, 'CMS_MANAGE');
    const body = await request.json();
    const { code, discount_type, discount_value, min_order_value, max_discount_amount, usage_limit, is_active } = body;

    if (!code || !discount_type || !discount_value) {
      throw new ValidationError('Coupon code, discount type, and discount value are required.');
    }

    const newCoupon = createCoupon({
      code,
      discount_type,
      discount_value: Number(discount_value),
      min_order_value: Number(min_order_value) || 0,
      max_discount_amount: max_discount_amount ? Number(max_discount_amount) : undefined,
      usage_limit: usage_limit ? Number(usage_limit) : undefined,
      per_user_limit: 1,
      starts_at: new Date().toISOString(),
      is_active: is_active !== undefined ? !!is_active : true,
    });

    return successResponse(newCoupon, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
