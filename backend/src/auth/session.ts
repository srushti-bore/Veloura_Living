import { verifyToken } from './jwt';
import { UserRoleEnum, UserSession } from '../types';
import { findUserById, findUserByIdAuthoritative } from '../data/authStore';

export async function parseAuthToken(authHeaderOrToken?: string): Promise<UserSession | null> {
  if (!authHeaderOrToken) return null;

  let token = authHeaderOrToken;
  if (token.startsWith('Bearer ')) {
    token = token.slice(7).trim();
  }

  const payload = await verifyToken(token);
  if (!payload) return null;

  const record = (await findUserByIdAuthoritative(payload.sub)) || findUserById(payload.sub);
  if (!record || record.user.status !== 'ACTIVE') return null;

  return {
    id: record.user.id,
    email: record.user.email,
    roles: record.roles,
    status: record.user.status,
    profile: {
      firstName: record.profile?.first_name,
      lastName: record.profile?.last_name,
      avatarUrl: record.profile?.avatar_url,
    },
  };
}
