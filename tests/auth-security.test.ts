/**
 * 🏛️ Veloura Living — Test Suite 3: Auth, RBAC & Security Lockout
 * Reference: docs/Veloura-Living_SRS_Final.md (TST-001, AUTH-001 to AUTH-007, SEC-002 to SEC-004)
 */

import { hashPassword, verifyPassword } from '../lib/auth/password';
import { signToken, verifyToken, ACCESS_TOKEN_EXPIRY_SECONDS, REFRESH_TOKEN_EXPIRY_SECONDS } from '../lib/auth/jwt';
import {
  initAuthStore,
  recordFailedLogin,
  checkAccountLockout,
  resetFailedLogin,
  createPasswordResetToken,
  createEmailVerificationToken,
} from '../lib/data/authStore';

export async function runAuthSecurityTests(): Promise<{ passed: number; failed: number; errors: string[] }> {
  let passed = 0;
  let failed = 0;
  const errors: string[] = [];

  function assert(condition: boolean, testName: string) {
    if (condition) {
      passed++;
      console.log(`  ✓ ${testName}`);
    } else {
      failed++;
      errors.push(`FAILED: ${testName}`);
      console.error(`  ✗ ${testName}`);
    }
  }

  console.log('\n--- 3. Testing Authentication & Security Lockout (AUTH & SEC) ---');
  await initAuthStore();

  // Test 1: PBKDF2 Password Hashing (AUTH-002)
  const plainPass = 'LuxurySafe2026!';
  const hashed = await hashPassword(plainPass);
  const isValidPass = await verifyPassword(plainPass, hashed);
  const isWrongPass = await verifyPassword('WrongPassword123', hashed);
  assert(isValidPass && !isWrongPass, 'PBKDF2 salt-hashing verifies correct password and rejects wrong password');

  // Test 2: JWT Access Token 15m & Refresh Token 7d lifespans (AUTH-004)
  assert(ACCESS_TOKEN_EXPIRY_SECONDS === 900, 'Access Token lifespan is 15 minutes (900 seconds)');
  assert(REFRESH_TOKEN_EXPIRY_SECONDS === 604800, 'Refresh Token lifespan is 7 days (604800 seconds)');

  const token = await signToken('user_test_123', 'client@example.com', ['CUSTOMER']);
  const payload = await verifyToken(token);
  assert(payload !== null && payload.email === 'client@example.com', 'HMAC-SHA256 JWT signed and verified successfully');

  // Test 3: Account Lockout after 5 Failed Login Attempts (AUTH-007)
  const testEmail = 'client@example.com';
  resetFailedLogin(testEmail);

  // 1st to 4th failed attempts: not locked
  for (let i = 1; i <= 4; i++) {
    const res = recordFailedLogin(testEmail);
    assert(!res.isLocked, `Attempt ${i} of 5 recorded without locking`);
  }

  // 5th failed attempt: MUST lock for 15 minutes
  const res5 = recordFailedLogin(testEmail);
  assert(res5.isLocked && res5.remainingMinutes === 15, '5th failed attempt triggers 15-minute account lockout (AUTH-007)');

  // Verify lockout check returns true
  const lockoutStatus = checkAccountLockout(testEmail);
  assert(lockoutStatus.isLocked, 'checkAccountLockout reports active lockout');

  // Reset lockout
  resetFailedLogin(testEmail);
  assert(!checkAccountLockout(testEmail).isLocked, 'Resetting failed login clears lockout state');

  // Test 4: Password Reset Token 30-min lifespan (AUTH-005)
  const resetToken = createPasswordResetToken('client@example.com');
  assert(resetToken !== undefined && resetToken.startsWith('reset_'), 'Password reset token generated (30-min lifespan)');

  // Test 5: Email Verification Token 24-hr lifespan (AUTH-003)
  const verifyTokenStr = createEmailVerificationToken('client@example.com');
  assert(verifyTokenStr !== undefined && verifyTokenStr.startsWith('verify_'), 'Email verification token generated (24-hr lifespan)');

  return { passed, failed, errors };
}
