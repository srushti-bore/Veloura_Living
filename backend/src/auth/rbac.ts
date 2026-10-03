/**
 * 🏛️ Veloura Living — Role-Based Access Control (RBAC) Engine
 * Reference: docs/Veloura_Living_SRS.md (Section 30, 71)
 */

import { UserRoleEnum } from '../types';

export type PermissionSlug =
  | 'PRODUCT_CREATE'
  | 'PRODUCT_UPDATE'
  | 'PRODUCT_DELETE'
  | 'ORDER_VIEW'
  | 'ORDER_UPDATE'
  | 'CUSTOMER_VIEW'
  | 'REPORT_VIEW'
  | 'CMS_MANAGE'
  | 'USER_MANAGE';

export const ROLE_PERMISSIONS: Record<UserRoleEnum, PermissionSlug[]> = {
  ADMIN: [
    'PRODUCT_CREATE',
    'PRODUCT_UPDATE',
    'PRODUCT_DELETE',
    'ORDER_VIEW',
    'ORDER_UPDATE',
    'CUSTOMER_VIEW',
    'REPORT_VIEW',
    'CMS_MANAGE',
    'USER_MANAGE',
  ],
  MANAGER: [
    'PRODUCT_CREATE',
    'PRODUCT_UPDATE',
    'ORDER_VIEW',
    'ORDER_UPDATE',
    'CUSTOMER_VIEW',
    'REPORT_VIEW',
    'CMS_MANAGE',
  ],
  PRODUCT_MANAGER: [
    'PRODUCT_CREATE',
    'PRODUCT_UPDATE',
    'PRODUCT_DELETE',
    'CMS_MANAGE',
  ],
  ORDER_MANAGER: [
    'ORDER_VIEW',
    'ORDER_UPDATE',
    'CUSTOMER_VIEW',
  ],
  CUSTOMER: [],
};

export function hasAnyRole(userRoles: UserRoleEnum[], requiredRoles: UserRoleEnum[]): boolean {
  if (!userRoles || userRoles.length === 0) return false;
  if (userRoles.includes('ADMIN')) return true;
  return requiredRoles.some((role) => userRoles.includes(role));
}

export function hasPermission(userRoles: UserRoleEnum[], permission: PermissionSlug): boolean {
  if (!userRoles || userRoles.length === 0) return false;
  if (userRoles.includes('ADMIN')) return true;

  return userRoles.some((role) => {
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission);
  });
}
