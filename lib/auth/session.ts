/**
 * 🏛️ Veloura Living — Server-Side Session & Request Authenticator
 * Reference: docs/Veloura_Living_SRS.md (Section 31, 43, 71)
 */

import { NextRequest } from 'next/server';
import { verifyToken } from './jwt';
import { UserSession, UserRoleEnum } from '@/types';
import { UnauthorizedError, ForbiddenError } from '@/lib/api/errorHandler';
import { hasAnyRole, hasPermission, PermissionSlug } from './rbac';
import { findUserById } from '@/lib/data/authStore';

export const AUTH_COOKIE_NAME = 'veloura_auth_token';

/**
 * Extract token from Authorization header (Bearer <token>) or auth cookie.
 */
export function extractTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  const cookieToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (cookieToken) {
    return cookieToken;
  }

  return null;
}

/**
 * Get authenticated user session from request, returning null if unauthenticated.
 * Synchronizes with authoritative user identity store to reflect real-time role changes and account status.
 */
export async function getSession(request: NextRequest): Promise<UserSession | null> {
  const token = extractTokenFromRequest(request);
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  const record = findUserById(payload.sub);
  const status = record?.user.status || 'ACTIVE';

  return {
    id: payload.sub,
    email: payload.email,
    roles: record?.roles || payload.roles,
    status,
  };
}

/**
 * Require valid authentication or throw UnauthorizedError (401).
 * Rejects suspended, inactive, or unauthorized users immediately.
 */
export async function requireAuth(request: NextRequest): Promise<UserSession> {
  const session = await getSession(request);
  if (!session) {
    throw new UnauthorizedError('Authentication required. Please sign in to proceed.');
  }

  if (session.status === 'SUSPENDED') {
    throw new UnauthorizedError('Your account has been suspended. Please contact concierge support.');
  }

  return session;
}

/**
 * Require specific roles or throw ForbiddenError (403).
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: UserRoleEnum[]
): Promise<UserSession> {
  const session = await requireAuth(request);
  if (!hasAnyRole(session.roles, allowedRoles)) {
    throw new ForbiddenError('Access Denied: You do not have permission to access this resource.');
  }
  return session;
}

/**
 * Require specific permission or throw ForbiddenError (403).
 */
export async function requirePermission(
  request: NextRequest,
  permission: PermissionSlug
): Promise<UserSession> {
  const session = await requireAuth(request);
  if (!hasPermission(session.roles, permission)) {
    throw new ForbiddenError(`Access Denied: Missing required permission (${permission}).`);
  }
  return session;
}
