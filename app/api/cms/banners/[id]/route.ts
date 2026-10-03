import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api/response';
import { handleApiError, NotFoundError, UnauthorizedError } from '@/lib/api/errorHandler';
import { getSession } from '@/lib/auth/session';
import { hasAnyRole } from '@/lib/auth/rbac';
import { updateCmsBanner, deleteCmsBanner } from '@/lib/data/cmsStore';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession(request);

    if (!session || !hasAnyRole(session.roles, ['ADMIN', 'MANAGER'])) {
      throw new UnauthorizedError('Administrative privileges required to update CMS content.');
    }

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
    const session = await getSession(request);

    if (!session || !hasAnyRole(session.roles, ['ADMIN', 'MANAGER'])) {
      throw new UnauthorizedError('Administrative privileges required to delete CMS content.');
    }

    const deleted = deleteCmsBanner(id);
    if (!deleted) {
      throw new NotFoundError(`Banner ${id} not found.`);
    }

    return successResponse({ deleted: true, id }, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
