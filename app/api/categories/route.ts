import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api/response';
import { handleApiError, ValidationError } from '@/lib/api/errorHandler';
import { requirePermission } from '@/lib/auth/session';
import { getCategories, createCategory } from '@/lib/data/catalogStore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('all') !== 'true';
    const categories = getCategories(activeOnly);
    return successResponse(categories, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requirePermission(request, 'CMS_MANAGE');
    const body = await request.json();
    const { name, slug, description, image_url, display_order, is_active } = body;

    if (!name || !slug) {
      throw new ValidationError('Category name and slug are required.');
    }

    const newCategory = createCategory({
      name,
      slug,
      description: description || '',
      image_url: image_url || '/images/rooms/veloura_ultra_luxury_living_hero.jpg',
      display_order: Number(display_order) || 0,
      is_active: is_active !== undefined ? !!is_active : true,
    });

    return successResponse(newCategory, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
