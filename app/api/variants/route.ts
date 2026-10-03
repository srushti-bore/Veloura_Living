import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/errorHandler';
import { getProducts } from '@/lib/data/catalogStore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    const result = getProducts({}, { limit: 100 });
    let variants = result.products.flatMap((p) => p.variants);

    if (productId) {
      variants = variants.filter((v) => v.product_id === productId);
    }

    return successResponse(variants, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
