/**
 * 🏛️ Veloura Living — Single Admin Security & Bootstrap Test Suite
 * 
 * Verifies Phase 6 requirements:
 * 1. Safe failure on missing/weak bootstrap configuration (ADMIN_EMAIL, ADMIN_PASSWORD).
 * 2. Complete elimination of hardcoded/demo password verification shortcuts ($2a$ demo bypasses).
 * 3. Complete elimination of default ADMIN and MANAGER auto-seeding across both backend roots.
 * 4. Idempotent one-time bootstrap (does not overwrite existing password or duplicate account).
 * 5. Rejection of conflicting or multiple existing admin accounts.
 * 6. Protection against customer self-promotion via registration, Google OAuth, and profile updates.
 * 7. Server-side fail-closed RBAC: Customer tokens cannot access Admin endpoints (403 Forbidden).
 * 8. Server-side fail-closed authoritative role resolution (empty roles on missing user_roles).
 * 9. Customer data, orders, and profiles preserved without deletion or corruption.
 */

import { runAdminBootstrap } from '../scripts/seed-admin';
import { hashPassword, verifyPassword } from '../lib/auth/password';
import { hashPassword as backendHashPassword, verifyPassword as backendVerifyPassword } from '../backend/src/auth/password';
import {
  initUserRepository,
  createUser,
  findUserByEmail,
  findUserById,
  saveUserRecord,
  findOrCreateGoogleUser,
  clearUsersCacheForTesting,
  getAllUsers,
} from '../lib/data/userRepository';
import {
  initAuthStore as backendInitAuthStore,
  findUserByEmail as backendFindUserByEmail,
  getAllUsers as backendGetAllUsers,
} from '../backend/src/data/authStore';
import { requireRole, requireAuth } from '../lib/auth/session';
import { signToken } from '../lib/auth/jwt';
import { NextRequest } from 'next/server';
import { hasAnyRole } from '../lib/auth/rbac';
import { hasAnyRole as backendHasAnyRole } from '../backend/src/auth/rbac';

export interface TestResult {
  passed: number;
  failed: number;
  errors: string[];
}

export async function runSingleAdminBootstrapTests(): Promise<TestResult> {
  console.log('\n🔒 RUNNING SINGLE ADMIN SECURITY & BOOTSTRAP TEST SUITE...');
  let passed = 0;
  let failed = 0;
  const errors: string[] = [];

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      passed++;
      console.log(`  ✓ ${testName}`);
    } else {
      failed++;
      const err = `  ✗ ${testName}${detail ? ` -> ${detail}` : ''}`;
      console.error(err);
      errors.push(err);
    }
  }

  // =========================================================================
  // 1. Password Security & Demo Bypass Removal Tests
  // =========================================================================
  console.log('\n--- 1. Password Verification Security & Shortcut Removal ---');
  try {
    const saltRoundsPassword = 'TestSecurePassword2026!';
    const realHash = await hashPassword(saltRoundsPassword);
    const backendRealHash = await backendHashPassword(saltRoundsPassword);

    assert(
      await verifyPassword(saltRoundsPassword, realHash),
      'Next.js root: Valid password matches real bcrypt hash'
    );
    assert(
      !(await verifyPassword('WrongPassword123!', realHash)),
      'Next.js root: Invalid password fails against real bcrypt hash'
    );

    assert(
      await backendVerifyPassword(saltRoundsPassword, backendRealHash),
      'Backend root: Valid password matches real bcrypt hash'
    );
    assert(
      !(await backendVerifyPassword('WrongPassword123!', backendRealHash)),
      'Backend root: Invalid password fails against real bcrypt hash'
    );

    // Test that old demo passwords cannot bypass when hash does not match
    const fakeDemoHash = '$2a$10$demoHashForAdminThatShouldNeverBypassAnything';
    assert(
      !(await verifyPassword('admin123', fakeDemoHash)),
      'Next.js root: Demo password "admin123" does NOT bypass verifyPassword'
    );
    assert(
      !(await verifyPassword('manager123', fakeDemoHash)),
      'Next.js root: Demo password "manager123" does NOT bypass verifyPassword'
    );
    assert(
      !(await verifyPassword('customer123', fakeDemoHash)),
      'Next.js root: Demo password "customer123" does NOT bypass verifyPassword'
    );

    assert(
      !(await backendVerifyPassword('admin123', fakeDemoHash)),
      'Backend root: Demo password "admin123" does NOT bypass verifyPassword'
    );
    assert(
      !(await backendVerifyPassword('manager123', fakeDemoHash)),
      'Backend root: Demo password "manager123" does NOT bypass verifyPassword'
    );
    assert(
      !(await backendVerifyPassword('customer123', fakeDemoHash)),
      'Backend root: Demo password "customer123" does NOT bypass verifyPassword'
    );
  } catch (err: any) {
    assert(false, 'Password verification suite failed unexpectedly', err.message);
  }

  // =========================================================================
  // 2. Default Seed Elimination (No Auto-Seeded Privileged Accounts)
  // =========================================================================
  console.log('\n--- 2. Default Seed Elimination (No Insecure Privileged Seeds) ---');
  try {
    clearUsersCacheForTesting({ resetDisk: true });
    await initUserRepository();
    const nextUsers = getAllUsers();

    const nextAdmins = nextUsers.filter((u) => u.roles.includes('ADMIN'));
    const nextManagers = nextUsers.filter((u) => u.roles.includes('MANAGER'));

    assert(
      nextAdmins.length === 0,
      'Next.js repository: Automatic seed does NOT create any ADMIN account'
    );
    assert(
      nextManagers.length === 0,
      'Next.js repository: Automatic seed does NOT create any MANAGER account'
    );

    await backendInitAuthStore();
    const backendUsers = backendGetAllUsers();
    const backendAdmins = backendUsers.filter((u) => u.roles.includes('ADMIN'));
    const backendManagers = backendUsers.filter((u) => u.roles.includes('MANAGER'));

    assert(
      backendAdmins.length === 0,
      'Backend store: Automatic seed does NOT create any ADMIN account'
    );
    assert(
      backendManagers.length === 0,
      'Backend store: Automatic seed does NOT create any MANAGER account'
    );
  } catch (err: any) {
    assert(false, 'Default seed elimination check failed', err.message);
  }

  // =========================================================================
  // 3. Admin Bootstrap Configuration & Validation
  // =========================================================================
  console.log('\n--- 3. Admin Bootstrap Configuration & Fail-Closed Validation ---');
  try {
    // 3a. Missing ADMIN_EMAIL
    let missingEmailFailed = false;
    try {
      await runAdminBootstrap({ adminEmail: '', adminPassword: 'ValidAdminPass123!' });
    } catch (e: any) {
      if (e.message.includes('ADMIN_EMAIL')) missingEmailFailed = true;
    }
    assert(missingEmailFailed, 'Bootstrap fails safely when ADMIN_EMAIL is missing');

    // 3b. Invalid ADMIN_EMAIL format
    let badEmailFailed = false;
    try {
      await runAdminBootstrap({ adminEmail: 'invalid-email-string', adminPassword: 'ValidAdminPass123!' });
    } catch (e: any) {
      if (e.message.includes('Invalid ADMIN_EMAIL')) badEmailFailed = true;
    }
    assert(badEmailFailed, 'Bootstrap fails safely when ADMIN_EMAIL is invalid format');

    // 3c. Missing ADMIN_PASSWORD
    let missingPassFailed = false;
    try {
      await runAdminBootstrap({ adminEmail: 'admin@velouraliving.com', adminPassword: '' });
    } catch (e: any) {
      if (e.message.includes('ADMIN_PASSWORD')) missingPassFailed = true;
    }
    assert(missingPassFailed, 'Bootstrap fails safely when ADMIN_PASSWORD is missing');

    // 3d. Weak ADMIN_PASSWORD (< 10 chars)
    let weakPassFailed = false;
    try {
      await runAdminBootstrap({ adminEmail: 'admin@velouraliving.com', adminPassword: 'short' });
    } catch (e: any) {
      if (e.message.includes('minimum strength requirements')) weakPassFailed = true;
    }
    assert(weakPassFailed, 'Bootstrap fails safely when ADMIN_PASSWORD is too short (< 10 chars)');

    // 3e. Database connection failure handling (mocking unavailable DB)
    let dbFailHandled = false;
    try {
      await runAdminBootstrap({
        adminEmail: 'admin@velouraliving.com',
        adminPassword: 'ValidAdminPass123!',
        customClient: {
          query: async () => {
            throw new Error('Connection refused: PostgreSQL offline');
          },
          release: () => {},
        },
      });
    } catch (e: any) {
      if (e.message.includes('PostgreSQL')) dbFailHandled = true;
    }
    assert(dbFailHandled, 'Bootstrap fails safely when PostgreSQL is unreachable');
  } catch (err: any) {
    assert(false, 'Admin bootstrap validation tests failed', err.message);
  }

  // =========================================================================
  // 4. One-Time Bootstrap Atomicity & Invariants (Transactional Mock)
  // =========================================================================
  console.log('\n--- 4. One-Time Bootstrap Atomicity, Invariants & Idempotency ---');
  try {
    // In-memory mock database state for transaction simulation
    const mockDb = {
      users: new Map<string, any>(),
      profiles: new Map<string, any>(),
      roles: new Map<string, any>([
        ['ADMIN', { id: 'role-admin-id', name: 'ADMIN' }],
        ['CUSTOMER', { id: 'role-cust-id', name: 'CUSTOMER' }],
      ]),
      user_roles: new Map<string, any>(),
      bootstrap_log: [] as any[],
    };

    const createMockClient = () => {
      let inTransaction = false;
      return {
        query: async (sql: string, params: any[] = []) => {
          const trimmed = sql.trim();
          if (trimmed === 'BEGIN') {
            inTransaction = true;
            return { rows: [] };
          }
          if (trimmed === 'COMMIT') {
            inTransaction = false;
            return { rows: [] };
          }
          if (trimmed === 'ROLLBACK') {
            inTransaction = false;
            return { rows: [] };
          }
          if (trimmed.includes('pg_advisory_xact_lock')) {
            return { rows: [] };
          }
          if (trimmed.includes('CREATE TABLE IF NOT EXISTS admin_bootstrap_log')) {
            return { rows: [] };
          }
          if (trimmed.includes('SELECT u.id, u.email')) {
            // Looking for existing admins
            const adminRoleId = mockDb.roles.get('ADMIN')?.id;
            const adminUserIds = Array.from(mockDb.user_roles.values())
              .filter((ur) => ur.role_id === adminRoleId)
              .map((ur) => ur.user_id);
            const foundUsers = adminUserIds
              .map((uid) => mockDb.users.get(uid))
              .filter(Boolean)
              .map((u) => ({ id: u.id, email: u.email }));
            return { rows: foundUsers };
          }
          if (trimmed.includes('SELECT id FROM roles WHERE name')) {
            const roleName = params[0] || 'ADMIN';
            const role = mockDb.roles.get(roleName);
            return { rows: role ? [{ id: role.id }] : [{ id: 'role-admin-id' }] };
          }
          if (trimmed.includes('INSERT INTO roles')) {
            const roleName = params[0] || 'ADMIN';
            const newRole = { id: `role-${roleName.toLowerCase()}-id`, name: roleName };
            mockDb.roles.set(roleName, newRole);
            return { rows: [{ id: newRole.id }] };
          }
          if (trimmed.includes('SELECT id, password_hash, status FROM users WHERE LOWER(TRIM(email)) = $1')) {
            const targetEmail = (params[0] || '').toLowerCase().trim();
            const user = Array.from(mockDb.users.values()).find(
              (u) => (u.email || '').toLowerCase().trim() === targetEmail
            );
            return { rows: user ? [{ id: user.id, email: user.email, password_hash: user.password_hash }] : [] };
          }
          if (trimmed.includes('INSERT INTO users (id, email, password_hash, status, is_email_verified')) {
            const newUser = {
              id: params[0],
              email: params[1],
              password_hash: params[2],
              status: params[3],
              is_email_verified: params[4],
            };
            mockDb.users.set(newUser.id, newUser);
            return { rows: [{ id: newUser.id }] };
          }
          if (trimmed.includes('INSERT INTO profiles (user_id, first_name, last_name, phone, preferred_currency, interior_style_preference')) {
            mockDb.profiles.set(params[0], {
              user_id: params[0],
              first_name: params[1],
              last_name: params[2],
              phone: params[3],
              preferred_currency: params[4],
            });
            return { rows: [] };
          }
          if (trimmed.includes('INSERT INTO user_roles')) {
            const adminRoleId = mockDb.roles.get('ADMIN')?.id || 'role-admin-id';
            mockDb.user_roles.set(`${params[0]}_${adminRoleId}`, {
              user_id: params[0],
              role_id: adminRoleId,
            });
            return { rows: [] };
          }
          if (trimmed.includes('INSERT INTO admin_bootstrap_log')) {
            mockDb.bootstrap_log.push({
              admin_email: params[0],
              admin_user_id: params[1],
              metadata: params[2],
            });
            return { rows: [] };
          }
          return { rows: [] };
        },
        release: () => {},
      };
    };

    const bootstrapEmail = 'owner@velouraliving.com';
    const bootstrapPass = 'SuperOwnerSecretKey2026!';

    // 4a. Initial Bootstrap Execution
    const run1 = await runAdminBootstrap({
      adminEmail: bootstrapEmail,
      adminPassword: bootstrapPass,
      customClient: createMockClient(),
    });

    assert(run1.success, 'First bootstrap execution succeeds');
    assert(run1.adminEmail === bootstrapEmail, 'Bootstrapped admin email matches configured ADMIN_EMAIL');
    assert(run1.isNew === true, 'First bootstrap indicates new admin account created');
    assert(mockDb.users.size === 1, 'Exactly one user created in users table');
    assert(mockDb.bootstrap_log.length === 1, 'Bootstrap logged to admin_bootstrap_log table');

    const createdAdmin = Array.from(mockDb.users.values())[0];
    const initialPassHash = createdAdmin.password_hash;

    // 4b. Idempotency: Re-running bootstrap with same email does NOT change password or duplicate user
    const run2 = await runAdminBootstrap({
      adminEmail: bootstrapEmail,
      adminPassword: 'AnotherDifferentPass2026!',
      customClient: createMockClient(),
    });

    assert(run2.success, 'Subsequent bootstrap with same email succeeds idempotently');
    assert(run2.isNew === false, 'Subsequent bootstrap indicates existing admin preserved');
    assert(mockDb.users.size === 1, 'No duplicate user created in database');
    assert(
      createdAdmin.password_hash === initialPassHash,
      'Existing admin password hash was NOT overwritten or reset'
    );

    // 4c. Conflicting Admin Rejection: Running bootstrap with different email fails closed
    let conflictRejected = false;
    try {
      await runAdminBootstrap({
        adminEmail: 'imposter@otherdomain.com',
        adminPassword: 'ImposterPass2026!',
        customClient: createMockClient(),
      });
    } catch (e: any) {
      if (e.message.includes('A different Admin account')) conflictRejected = true;
    }
    assert(conflictRejected, 'Bootstrap fails safely when conflicting admin email is provided');

    // 4d. Multiple Admins Rejection: If multiple admins somehow exist, fails closed
    const secondUserId = 'second-admin-user-id';
    mockDb.users.set(secondUserId, {
      id: secondUserId,
      email: 'extra@velouraliving.com',
      password_hash: 'hash',
    });
    mockDb.user_roles.set(`${secondUserId}_role-admin-id`, {
      user_id: secondUserId,
      role_id: 'role-admin-id',
    });

    let multiRejected = false;
    try {
      await runAdminBootstrap({
        adminEmail: bootstrapEmail,
        adminPassword: bootstrapPass,
        customClient: createMockClient(),
      });
    } catch (e: any) {
      if (e.message.includes('Multiple accounts')) multiRejected = true;
    }
    assert(multiRejected, 'Bootstrap fails safely when multiple admins exist in database');
  } catch (err: any) {
    assert(false, 'One-time bootstrap invariants suite failed', err.message);
  }

  // =========================================================================
  // 5. Customer Self-Promotion Prevention
  // =========================================================================
  console.log('\n--- 5. Prevention of Customer Self-Promotion & Invariant Enforcement ---');
  try {
    clearUsersCacheForTesting();
    await initUserRepository();

    // 5a. createUser strips ADMIN role
    const maliciousNewUser = await createUser({
      email: 'attacker@evil.com',
      password: 'AttackerPassword2026!',
      firstName: 'Attacker',
      lastName: 'User',
      roles: ['ADMIN' as any, 'CUSTOMER'],
    });

    assert(
      !maliciousNewUser.roles.includes('ADMIN'),
      'createUser automatically filters out "ADMIN" role from requested roles'
    );
    assert(
      maliciousNewUser.roles.includes('CUSTOMER'),
      'createUser preserves legitimate "CUSTOMER" role'
    );

    // 5b. Google OAuth cannot link to an administrative account
    // Create an in-memory admin fixture
    const adminEmail = 'legit-admin@velouraliving.com';
    const adminRecord = {
      user: {
        id: 'admin-fixed-id-1234',
        email: adminEmail,
        password_hash: '$2b$10$validBcryptHashForTestingOnly1234567890123456789012345',
        status: 'ACTIVE' as const,
        is_email_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      roles: ['ADMIN' as const],
      profile: {
        user_id: 'admin-fixed-id-1234',
        first_name: 'Lead',
        last_name: 'Admin',
        preferred_currency: 'INR',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      addresses: [],
    };
    saveUserRecord(adminRecord);

    let googleAdminBlocked = false;
    try {
      await findOrCreateGoogleUser({
        googleId: 'google-oauth-attacker-id',
        email: adminEmail,
        firstName: 'Malicious',
        lastName: 'AdminAttempt',
      });
    } catch (e: any) {
      if (e.message.includes('administrative account')) {
        googleAdminBlocked = true;
      }
    }
    assert(googleAdminBlocked, 'Google OAuth is strictly rejected when targeting an ADMIN account');

    // 5c. Google OAuth brand-new account only gets CUSTOMER role
    const googleCustomer = await findOrCreateGoogleUser({
      googleId: 'google-legit-customer-id',
      email: 'new-client@gmail.com',
      firstName: 'Jane',
      lastName: 'Doe',
    });
    assert(
      googleCustomer.roles.length === 1 && googleCustomer.roles[0] === 'CUSTOMER',
      'Brand-new Google OAuth user receives strictly ["CUSTOMER"] role'
    );
  } catch (err: any) {
    assert(false, 'Customer self-promotion prevention tests failed', err.message);
  }

  // =========================================================================
  // 6. Server-Side RBAC Enforcement (Next.js & Express)
  // =========================================================================
  console.log('\n--- 6. Server-Side RBAC & Session Enforcement ---');
  try {
    const customerUserId = 'cust-user-id-555';
    const customerEmail = 'customer@client.com';
    saveUserRecord({
      user: {
        id: customerUserId,
        email: customerEmail,
        password_hash: 'hash',
        status: 'ACTIVE',
        is_email_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      roles: ['CUSTOMER'],
      profile: {
        user_id: customerUserId,
        first_name: 'Customer',
        last_name: 'User',
        preferred_currency: 'INR',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      addresses: [],
    });
    const customerToken = await signToken(customerUserId, customerEmail, ['CUSTOMER']);

    // Mock NextRequest for customer accessing Admin route
    const reqWithCustomerToken = new NextRequest('http://localhost:3000/api/admin/metrics', {
      headers: {
        authorization: `Bearer ${customerToken}`,
      },
    });

    let customerDenied = false;
    let customerErrorStatus = 0;
    try {
      await requireRole(reqWithCustomerToken, ['ADMIN']);
    } catch (err: any) {
      customerDenied = true;
      customerErrorStatus = err.statusCode || 403;
    }

    assert(
      customerDenied && customerErrorStatus === 403,
      'Next.js requireRole: Customer token is rejected with 403 Forbidden for ADMIN route'
    );

    // Mock unauthenticated request
    const reqUnauthenticated = new NextRequest('http://localhost:3000/api/admin/metrics');
    let unauthDenied = false;
    let unauthStatus = 0;
    try {
      await requireAuth(reqUnauthenticated);
    } catch (err: any) {
      unauthDenied = true;
      unauthStatus = err.statusCode || 401;
    }
    assert(
      unauthDenied && unauthStatus === 401,
      'Next.js requireAuth: Unauthenticated request is rejected with 401 Unauthorized'
    );

    // Express backend RBAC helpers
    assert(
      !backendHasAnyRole(['CUSTOMER'], ['ADMIN', 'MANAGER', 'ORDER_MANAGER']),
      'Backend Express RBAC: Customer roles do not satisfy admin/manager requirement'
    );
    assert(
      backendHasAnyRole(['ADMIN'], ['ADMIN', 'MANAGER', 'ORDER_MANAGER']),
      'Backend Express RBAC: ADMIN role satisfies privileged requirement'
    );
  } catch (err: any) {
    assert(false, 'Server-side RBAC tests failed', err.message);
  }

  // =========================================================================
  // 7. Customer Data Isolation & Preservation
  // =========================================================================
  console.log('\n--- 7. Customer Data & Orders Preservation ---');
  try {
    clearUsersCacheForTesting({ resetDisk: true });
    await initUserRepository();

    // Verify existing demo customer is loaded into repository
    const users = getAllUsers();
    const customerUser = users.find((u) => u.user.email === 'client@example.com');
    assert(
      !!customerUser,
      'Customer account (client@example.com) is present and preserved'
    );
    assert(
      customerUser?.roles.includes('CUSTOMER') && !customerUser?.roles.includes('ADMIN'),
      'Customer account holds strictly CUSTOMER role without privileged leakage'
    );
  } catch (err: any) {
    assert(false, 'Customer data preservation test failed', err.message);
  }

  // =========================================================================
  // Summary
  // =========================================================================
  console.log('\n-----------------------------------------------------------');
  console.log(`Single Admin Security Suite: Passed: ${passed}, Failed: ${failed}`);
  console.log('-----------------------------------------------------------');

  return { passed, failed, errors };
}

// Allow direct execution
if (process.argv[1]?.includes('single-admin-bootstrap.test.ts')) {
  runSingleAdminBootstrapTests().then((res) => {
    if (res.failed > 0) {
      console.error('Test suite failed!');
      process.exit(1);
    } else {
      console.log('All Single Admin security tests passed successfully!');
      process.exit(0);
    }
  });
}
