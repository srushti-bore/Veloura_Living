import { UserRoleEnum, UserStatusEnum } from './database';

export interface UserSession {
  id: string;
  email: string;
  roles: UserRoleEnum[];
  status: UserStatusEnum;
  profile?: {
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  };
}

export interface JWTPayload {
  sub: string;
  email: string;
  roles: UserRoleEnum[];
  iat: number;
  exp: number;
}

export interface AuthResponseData {
  user: UserSession;
  token: string;
  expiresIn: number;
}
