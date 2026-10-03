import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api/response';
import { handleApiError, ValidationError, UnauthorizedError } from '@/lib/api/errorHandler';
import { getSession } from '@/lib/auth/session';
import { getReviews, createReview } from '@/lib/data/postPurchaseStore';
import { ReviewStatusEnum } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId') || undefined;
    const userId = searchParams.get('userId') || undefined;
    const status = (searchParams.get('status') as ReviewStatusEnum) || undefined;
    const minRating = searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined;
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;

    const result = getReviews({
      productId,
      userId,
      status,
      minRating,
      page,
      limit,
    });

    return successResponse(
      {
        reviews: result.reviews,
        summary: result.summary,
      },
      200,
      {
        page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    const body = await request.json();

    const { productId, rating, title, comment, images, orderId, userName } = body;

    if (!productId) {
      throw new ValidationError('productId is required.');
    }
    if (!rating || rating < 1 || rating > 5) {
      throw new ValidationError('rating must be between 1 and 5.');
    }
    if (!comment || comment.trim().length < 5) {
      throw new ValidationError('A detailed review comment of at least 5 characters is required.');
    }

    const userId = session?.id || '33333333-3333-3333-3333-333333333303'; // Default demo user if guest
    const authorName = userName || (session ? `${session.email.split('@')[0]}` : 'Veloura Client');

    const review = createReview({
      productId,
      userId,
      userName: authorName,
      orderId,
      rating: Number(rating),
      title,
      comment,
      images,
    });

    return successResponse(review, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
