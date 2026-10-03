import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/errorHandler';
import { requireAuth } from '@/lib/auth/session';
import { ROLE_PERMISSIONS } from '@/lib/auth/rbac';
import { initAuthStore, findUserById } from '@/lib/data/authStore';

export async function GET(request: NextRequest) {
  try {
    await initAuthStore();
    const session = await requireAuth(request);

    const record = findUserById(session.id);
    if (!record) {
      return successResponse({ user: session, permissions: [] }, 200);
    }

    // Collect distinct permissions
    const permissionsSet = new Set<string>();
    for (const role of record.roles) {
      const perms = ROLE_PERMISSIONS[role] || [];
      perms.forEach((p) => permissionsSet.add(p));
    }

    return successResponse(
      {
        user: {
          id: record.user.id,
          email: record.user.email,
          roles: record.roles,
          status: record.user.status,
          profile: record.profile,
          addresses: record.addresses,
        },
        permissions: Array.from(permissionsSet),
      },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
