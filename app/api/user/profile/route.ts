import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api/response';
import { handleApiError, NotFoundError } from '@/lib/api/errorHandler';
import { requireAuth } from '@/lib/auth/session';
import { initAuthStore, findUserById, saveUserRecord } from '@/lib/data/authStore';

export async function GET(request: NextRequest) {
  try {
    await initAuthStore();
    const session = await requireAuth(request);
    const record = findUserById(session.id);
    if (!record) {
      throw new NotFoundError('User profile not found.');
    }
    return successResponse(record.profile, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    await initAuthStore();
    const session = await requireAuth(request);
    const record = findUserById(session.id);
    if (!record) {
      throw new NotFoundError('User profile not found.');
    }

    const body = await request.json();
    const { firstName, lastName, phone, preferredCurrency, interiorStylePreference, avatarUrl } = body;

    record.profile = {
      ...record.profile,
      first_name: firstName !== undefined ? firstName : record.profile.first_name,
      last_name: lastName !== undefined ? lastName : record.profile.last_name,
      phone: phone !== undefined ? phone : record.profile.phone,
      preferred_currency: preferredCurrency !== undefined ? preferredCurrency : record.profile.preferred_currency,
      interior_style_preference: interiorStylePreference !== undefined ? interiorStylePreference : record.profile.interior_style_preference,
      avatar_url: avatarUrl !== undefined ? avatarUrl : record.profile.avatar_url,
      updated_at: new Date().toISOString(),
    };

    saveUserRecord(record);
    return successResponse(record.profile, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
