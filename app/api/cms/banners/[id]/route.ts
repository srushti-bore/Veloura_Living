import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api/response';
import { handleApiError, NotFoundError } from '@/lib/api/errorHandler';
import { requireRole } from '@/lib/auth/session';
import { updateCmsBanner, deleteCmsBanner } from '@/lib/data/cmsStore';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireRole(request, ['ADMIN', 'MANAGER']);

    const body = await request.json();
    const updated = updateCmsBanner(id, body);

    if (!updated) {
      throw new NotFoundError(`Banner ${id} not found.`);
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
    const { id } = await params;
    const session = await requireRole(request, ['ADMIN', 'MANAGER']);

    const deleted = deleteCmsBanner(id);
    if (!deleted) {
      throw new NotFoundError(`Banner ${id} not found.`);
    }

    return successResponse({ deleted: true, id }, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
