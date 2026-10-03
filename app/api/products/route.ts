import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api/response';
import { handleApiError, ValidationError } from '@/lib/api/errorHandler';
import { requirePermission } from '@/lib/auth/session';
import { getProducts, createProduct } from '@/lib/data/catalogStore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const category = searchParams.get('category') || undefined;
    const room = searchParams.get('room') || undefined;
    const search = searchParams.get('search') || searchParams.get('q') || undefined;
    const material = searchParams.get('material') || undefined;
    const color = searchParams.get('color') || undefined;
    const isFeatured = searchParams.get('featured') === 'true' ? true : undefined;

    const minPriceStr = searchParams.get('minPrice');
    const maxPriceStr = searchParams.get('maxPrice');
    const minPrice = minPriceStr ? Number(minPriceStr) : undefined;
    const maxPrice = maxPriceStr ? Number(maxPriceStr) : undefined;

    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 24;
    const sortBy = searchParams.get('sortBy') || 'featured';
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

    const result = getProducts(
      { category, room, search, material, color, minPrice, maxPrice, isFeatured },
      { page, limit, sortBy, sortOrder }
    );

    return successResponse(result.products, 200, {
      page: result.page,
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
    await requirePermission(request, 'PRODUCT_CREATE');
    const body = await request.json();

    if (!body.name || !body.base_price) {
      throw new ValidationError('Product name and base price are required.');
    }

    const newProduct = createProduct(body);
    return successResponse(newProduct, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
