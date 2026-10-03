import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api/response';
import { handleApiError, NotFoundError } from '@/lib/api/errorHandler';
import { requirePermission } from '@/lib/auth/session';
import { getVariantBySku, updateVariantStock } from '@/lib/data/catalogStore';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ sku: string }> }
) {
  try {
    const { sku } = await params;
    const variant = getVariantBySku(sku);
    if (!variant) {
      throw new NotFoundError(`Variant SKU '${sku}' not found.`);
    }
    return successResponse(variant, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ sku: string }> }
) {
  try {
    await requirePermission(request, 'PRODUCT_UPDATE');
    const { sku } = await params;
    const body = await request.json();

    if (body.stock !== undefined) {
      const updated = updateVariantStock(sku, Number(body.stock));
      if (!updated) {
        throw new NotFoundError(`Variant SKU '${sku}' not found.`);
      }
      return successResponse(updated, 200);
    }

    const variant = getVariantBySku(sku);
    if (!variant) {
      throw new NotFoundError(`Variant SKU '${sku}' not found.`);
    }

    return successResponse(variant, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
