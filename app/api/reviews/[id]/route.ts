import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api/response';
import { handleApiError, NotFoundError, UnauthorizedError, ValidationError } from '@/lib/api/errorHandler';
import { getSession } from '@/lib/auth/session';
import { hasAnyRole } from '@/lib/auth/rbac';
import { voteReviewHelpful, updateReviewStatus, deleteReview } from '@/lib/data/postPurchaseStore';
import { ReviewStatusEnum } from '@/types';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const session = await getSession(request);

    // 1. Upvote helpful
    if (body.action === 'vote_helpful') {
      const updated = voteReviewHelpful(id);
      if (!updated) {
        throw new NotFoundError(`Review ${id} not found.`);
      }
      return successResponse(updated, 200);
    }

    // 2. Admin moderation status update
    if (body.status) {
      if (!session || !hasAnyRole(session.roles, ['ADMIN', 'MANAGER', 'PRODUCT_MANAGER'])) {
        throw new UnauthorizedError('Administrative role required to moderate reviews.');
      }
      const updated = updateReviewStatus(id, body.status as ReviewStatusEnum);
      if (!updated) {
        throw new NotFoundError(`Review ${id} not found.`);
      }
      return successResponse(updated, 200);
    }

    throw new ValidationError('Invalid review action. Supported actions: vote_helpful, status.');
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

    if (!session) {
      throw new UnauthorizedError('Authentication required to delete a review.');
    }

    const isAdmin = hasAnyRole(session.roles, ['ADMIN', 'MANAGER', 'PRODUCT_MANAGER']);
    const deleted = deleteReview(id, session.id, isAdmin);

    if (!deleted) {
      throw new NotFoundError(`Review ${id} could not be deleted or unauthorized.`);
    }

    return successResponse({ deleted: true, id }, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
