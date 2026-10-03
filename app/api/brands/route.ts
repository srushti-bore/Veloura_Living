import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api/response';
import { handleApiError, ValidationError } from '@/lib/api/errorHandler';
import { requirePermission } from '@/lib/auth/session';
import { getBrands, createBrand } from '@/lib/data/catalogStore';

export async function GET() {
  try {
    const brands = getBrands();
    return successResponse(brands, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requirePermission(request, 'PRODUCT_CREATE');
    const body = await request.json();
    const { name, slug, description, logo_url, country_of_origin } = body;

    if (!name || !slug) {
      throw new ValidationError('Brand name and slug are required.');
    }

    const newBrand = createBrand({
      name,
      slug,
      description: description || '',
      logo_url: logo_url || '',
      country_of_origin: country_of_origin || 'India',
    });

    return successResponse(newBrand, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
