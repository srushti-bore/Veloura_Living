import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api/response';
import { handleApiError, NotFoundError } from '@/lib/api/errorHandler';
import { requirePermission } from '@/lib/auth/session';
import { getProductBySlugOrId, updateProduct, deleteProduct } from '@/lib/data/catalogStore';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const product = getProductBySlugOrId(slug);
    if (!product) {
      throw new NotFoundError(`Product not found with identifier '${slug}'.`);
    }
    return successResponse(product, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await requirePermission(request, 'PRODUCT_UPDATE');
    const { slug } = await params;
    const existing = getProductBySlugOrId(slug);
    if (!existing) {
      throw new NotFoundError('Product not found.');
    }

    const body = await request.json();
    const updated = updateProduct(existing.id, body);
    return successResponse(updated, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await requirePermission(request, 'PRODUCT_DELETE');
    const { slug } = await params;
    const existing = getProductBySlugOrId(slug);
    if (!existing) {
      throw new NotFoundError('Product not found.');
    }

    deleteProduct(existing.id);
    return successResponse({ message: 'Product successfully removed from catalog.' }, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
