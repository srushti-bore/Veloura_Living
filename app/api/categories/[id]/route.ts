import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api/response';
import { handleApiError, NotFoundError } from '@/lib/api/errorHandler';
import { requirePermission } from '@/lib/auth/session';
import { getCategoryByIdOrSlug, updateCategory, deleteCategory } from '@/lib/data/catalogStore';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const category = getCategoryByIdOrSlug(id);
    if (!category) {
      throw new NotFoundError('Category not found.');
    }
    return successResponse(category, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission(request, 'CMS_MANAGE');
    const { id } = await params;
    const body = await request.json();

    const updated = updateCategory(id, body);
    if (!updated) {
      throw new NotFoundError('Category not found.');
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
    await requirePermission(request, 'CMS_MANAGE');
    const { id } = await params;
    const deleted = deleteCategory(id);
    if (!deleted) {
      throw new NotFoundError('Category not found.');
    }
    return successResponse({ message: 'Category removed successfully.' }, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
