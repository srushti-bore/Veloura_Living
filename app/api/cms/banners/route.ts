import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api/response';
import { handleApiError, ValidationError } from '@/lib/api/errorHandler';
import { requireRole } from '@/lib/auth/session';
import { getCmsBanners, createCmsBanner } from '@/lib/data/cmsStore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sectionName = searchParams.get('section') || undefined;
    const banners = getCmsBanners(sectionName);
    return successResponse(banners, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(request, ['ADMIN', 'MANAGER']);

    const body = await request.json();
    const { section_name, title, subtitle, image_url, cta_label, cta_link, display_order, is_active } = body;

    if (!section_name || !title || !image_url) {
      throw new ValidationError('section_name, title, and image_url are required.');
    }

    const banner = createCmsBanner({
      section_name,
      title,
      subtitle,
      image_url,
      cta_label,
      cta_link,
      display_order: Number(display_order) || 0,
      is_active: is_active ?? true,
    });

    return successResponse(banner, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
