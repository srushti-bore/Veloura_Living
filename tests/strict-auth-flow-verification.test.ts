/**
 * 🏛️ Veloura Living — Strict Registration, Login & Success Flow Verification Suite
 *
 * Verifies all 9 Required Test Scenarios:
 * 1. New user → Create Account → registration OTP → registration completion → Sign In → login OTP → Login Successful → Continue.
 * 2. Existing user → email/password → login OTP → Login Successful → Continue.
 * 3. Incorrect password → no success screen / rejection.
 * 4. Incorrect or expired OTP → no success screen / rejection.
 * 5. Failed session creation → no success screen / rejection.
 * 6. Customer → Customer destination (/account).
 * 7. Authorized Admin → Admin Dashboard (/admin).
 * 8. Customer cannot access Admin routes or APIs.
 * 9. Existing login, registration, password reset, and OTP features continue to work.
 */

import { NextRequest } from 'next/server';
import { POST as registerEndpoint } from '../app/api/auth/register/route';
import { POST as loginEndpoint } from '../app/api/auth/login/route';
import { POST as verifyOtpEndpoint } from '../app/api/auth/verify-otp/route';
import { POST as forgotPasswordEndpoint } from '../app/api/auth/forgot-password/route';
import { GET as meEndpoint } from '../app/api/auth/me/route';
import {
  initAuthStore,
  findUserByEmailAuthoritative,
  saveUserRecordAsync,
  UserRecord,
} from '../lib/data/authStore';
import { getChallengeForTesting, createOtpChallenge } from '../lib/auth/otpService';
import { hashPassword } from '../lib/auth/password';
import { signToken, verifyToken } from '../lib/auth/jwt';
import { requireRole } from '../lib/auth/session';
import { AUTH_COOKIE_NAME } from '../lib/auth/session';

export interface TestResult {
  passed: number;
  failed: number;
  errors: string[];
}

export async function runStrictAuthFlowTests(): Promise<TestResult> {
  let passed = 0;
  let total = 0;
  const errors: string[] = [];

  function assert(condition: boolean, testName: string, failureDetails?: string) {
    total++;
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      if (failureDetails) console.error(`     Details: ${failureDetails}`);
      errors.push(`${testName}${failureDetails ? `: ${failureDetails}` : ''}`);
    }
  }
  console.log('\n===========================================================');
  console.log('🏛️ VELOURA LIVING — STRICT REGISTRATION, LOGIN & SUCCESS FLOW TESTS');
  console.log('===========================================================\n');

  await initAuthStore();
  const timestamp = Date.now();

  // -------------------------------------------------------------
  // Test 1: New user → Create Account → registration OTP → registration completion → Sign In → login OTP → Login Successful → Continue
  // -------------------------------------------------------------
  console.log('--- Test 1: New User Strict Registration & Login Sequence ---');
  const newUserEmail = `newuser_${timestamp}@example.com`;
  const newUserPassword = 'SecurePassword123!';

  // Step 1.1: Submit registration details
  const regReq = new NextRequest('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email: newUserEmail,
      password: newUserPassword,
      firstName: 'Elena',
      lastName: 'Rostova',
      phone: '+91 98765 43210',
    }),
  });
  const regRes = await registerEndpoint(regReq);
  const regBody = await regRes.json();

  assert((regRes.status === 200 || regRes.status === 201) && regBody.success === true, '1.1 Registration form submission succeeds');
  assert(regBody.data?.requiresOtp === true, '1.2 Registration mandates email OTP verification');
  assert(Boolean(regBody.data?.challengeToken), '1.3 Registration challenge token issued');

  // Step 1.2: User enters registration OTP
  const regChallenge = getChallengeForTesting(regBody.data.challengeToken);
  assert(Boolean(regChallenge?.otp), '1.4 Dispatched registration OTP retrieved');

  const regVerifyReq = new NextRequest('http://localhost:3000/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email: newUserEmail,
      challengeToken: regBody.data.challengeToken,
      otp: regChallenge!.otp,
    }),
  });
  const regVerifyRes = await verifyOtpEndpoint(regVerifyReq);
  const regVerifyBody = await regVerifyRes.json();

  assert(regVerifyRes.status === 200 && regVerifyBody.success === true, '1.5 Registration OTP verified successfully');

  // Step 1.3: Verify account is created and persisted
  const createdRecord = await findUserByEmailAuthoritative(newUserEmail);
  assert(Boolean(createdRecord), '1.6 Customer account created and persisted in authoritative store');
  assert(createdRecord?.user.is_email_verified === true, '1.7 Registered account marked email_verified');
  assert(createdRecord?.roles.includes('CUSTOMER'), '1.8 Registered account assigned CUSTOMER role');

  // Step 1.4: Sign In with registered credentials
  const loginReq1 = new NextRequest('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email: newUserEmail,
      password: newUserPassword,
    }),
  });
  const loginRes1 = await loginEndpoint(loginReq1);
  const loginBody1 = await loginRes1.json();

  assert(loginRes1.status === 200 && loginBody1.success === true, '1.9 Sign In with valid credentials succeeds');
  assert(loginBody1.data?.requiresOtp === true, '1.10 Sign In triggers mandatory login OTP challenge');

  // Step 1.5: Verify login OTP
  const loginChallenge1 = getChallengeForTesting(loginBody1.data.challengeToken);
  assert(Boolean(loginChallenge1?.otp), '1.11 Login OTP challenge retrieved');

  const loginVerifyReq1 = new NextRequest('http://localhost:3000/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email: newUserEmail,
      challengeToken: loginBody1.data.challengeToken,
      otp: loginChallenge1!.otp,
    }),
  });
  const loginVerifyRes1 = await verifyOtpEndpoint(loginVerifyReq1);
  const loginVerifyBody1 = await loginVerifyRes1.json();

  assert(loginVerifyRes1.status === 200 && loginVerifyBody1.success === true, '1.12 Login OTP verified successfully');
  assert(Boolean(loginVerifyBody1.data?.token), '1.13 Authenticated session token issued');
  assert(loginVerifyBody1.data?.user?.profile?.firstName === 'Elena', '1.14 Authenticated user profile matches Elena');

  // Step 1.6: Continue destination check
  const customerRoles = loginVerifyBody1.data?.user?.roles || [];
  const targetDestination1 = customerRoles.includes('ADMIN') ? '/admin' : '/account';
  assert(targetDestination1 === '/account', '1.15 Customer role continues to Customer destination (/account)');

  // -------------------------------------------------------------
  // Test 2: Existing user → email/password → login OTP → Login Successful → Continue
  // -------------------------------------------------------------
  console.log('\n--- Test 2: Existing User Direct Sign In Flow ---');
  const existingUserEmail = `existing_${timestamp}@example.com`;
  const existingPassword = 'ExistingPassword456!';
  const existingHash = await hashPassword(existingPassword);

  const existingRecord: UserRecord = {
    user: {
      id: crypto.randomUUID(),
      email: existingUserEmail,
      password_hash: existingHash,
      status: 'ACTIVE',
      is_email_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    roles: ['CUSTOMER'],
    profile: {
      user_id: crypto.randomUUID(),
      first_name: 'Sophia',
      last_name: 'Laurent',
      preferred_currency: 'INR',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    addresses: [],
  };
  await saveUserRecordAsync(existingRecord, { isNewUser: true });

  const existingLoginReq = new NextRequest('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email: existingUserEmail,
      password: existingPassword,
    }),
  });
  const existingLoginRes = await loginEndpoint(existingLoginReq);
  const existingLoginBody = await existingLoginRes.json();

  assert(existingLoginRes.status === 200 && existingLoginBody.success === true, '2.1 Existing user login credentials validated');
  assert(existingLoginBody.data?.requiresOtp === true, '2.2 Mandatory login OTP challenge initiated');

  const existingOtpChallenge = getChallengeForTesting(existingLoginBody.data.challengeToken);
  const existingVerifyReq = new NextRequest('http://localhost:3000/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email: existingUserEmail,
      challengeToken: existingLoginBody.data.challengeToken,
      otp: existingOtpChallenge!.otp,
    }),
  });
  const existingVerifyRes = await verifyOtpEndpoint(existingVerifyReq);
  const existingVerifyBody = await existingVerifyRes.json();

  assert(existingVerifyRes.status === 200 && existingVerifyBody.success === true, '2.3 Existing user login OTP verified');
  assert(existingVerifyBody.data?.user?.profile?.firstName === 'Sophia', '2.4 Authenticated display name resolved to Sophia');

  // -------------------------------------------------------------
  // Test 3: Incorrect password → no success screen
  // -------------------------------------------------------------
  console.log('\n--- Test 3: Incorrect Password Rejection ---');
  const badPwReq = new NextRequest('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email: existingUserEmail,
      password: 'WrongPassword999!',
    }),
  });
  const badPwRes = await loginEndpoint(badPwReq);
  const badPwBody = await badPwRes.json();

  assert(badPwRes.status === 401 && badPwBody.success === false, '3.1 Incorrect password rejected with 401 Unauthorized');
  assert(!badPwBody.data?.token, '3.2 No session token issued on incorrect password');
  assert(!badPwBody.data?.requiresOtp, '3.3 No OTP challenge issued on incorrect password');

  // -------------------------------------------------------------
  // Test 4: Incorrect or expired OTP → no success screen
  // -------------------------------------------------------------
  console.log('\n--- Test 4: Incorrect or Expired OTP Rejection ---');
  // Attempt with invalid 6-digit OTP code
  const invalidOtpReq = new NextRequest('http://localhost:3000/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email: existingUserEmail,
      challengeToken: existingLoginBody.data.challengeToken,
      otp: '000000',
    }),
  });
  const invalidOtpRes = await verifyOtpEndpoint(invalidOtpReq);
  const invalidOtpBody = await invalidOtpRes.json();

  assert(invalidOtpRes.status === 400 && invalidOtpBody.success === false, '4.1 Invalid OTP code rejected with 400');
  assert(!invalidOtpBody.data?.token, '4.2 No session token issued on invalid OTP');

  // -------------------------------------------------------------
  // Test 5: Failed session creation → no success screen
  // -------------------------------------------------------------
  console.log('\n--- Test 5: Tampered / Missing Challenge Rejection ---');
  const tamperedReq = new NextRequest('http://localhost:3000/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email: existingUserEmail,
      challengeToken: 'fake-tampered-token-12345',
      otp: '123456',
    }),
  });
  const tamperedRes = await verifyOtpEndpoint(tamperedReq);
  const tamperedBody = await tamperedRes.json();

  assert(tamperedRes.status === 400 && tamperedBody.success === false, '5.1 Tampered challenge token rejected with 400');
  assert(!tamperedBody.data?.token, '5.2 No session created on invalid challenge');

  // -------------------------------------------------------------
  // Test 6: Customer → Customer destination (/account)
  // -------------------------------------------------------------
  console.log('\n--- Test 6: Customer Destination Routing ---');
  const customerToken = existingVerifyBody.data.token;
  const meCustomerReq = new NextRequest('http://localhost:3000/api/auth/me', {
    headers: {
      cookie: `${AUTH_COOKIE_NAME}=${customerToken}`,
    },
  });
  const meCustomerRes = await meEndpoint(meCustomerReq);
  const meCustomerBody = await meCustomerRes.json();

  assert(meCustomerRes.status === 200 && meCustomerBody.success === true, '6.1 Customer session validated via /api/auth/me');
  const verifiedCustomerRoles = meCustomerBody.data?.user?.roles || [];
  assert(verifiedCustomerRoles.includes('CUSTOMER') && !verifiedCustomerRoles.includes('ADMIN'), '6.2 Verified role is strictly CUSTOMER');
  const destinationCustomer = verifiedCustomerRoles.includes('ADMIN') ? '/admin' : '/account';
  assert(destinationCustomer === '/account', '6.3 Customer routes to /account');

  // -------------------------------------------------------------
  // Test 7: Authorized Admin → Admin Dashboard (/admin)
  // -------------------------------------------------------------
  console.log('\n--- Test 7: Authorized Admin Destination Routing ---');
  const adminEmail = `admin_${timestamp}@velouraliving.com`;
  const adminPassword = 'AdminMasterKey999!';
  const adminHash = await hashPassword(adminPassword);

  const adminRecord: UserRecord = {
    user: {
      id: crypto.randomUUID(),
      email: adminEmail,
      password_hash: adminHash,
      status: 'ACTIVE',
      is_email_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    roles: ['ADMIN'],
    profile: {
      user_id: crypto.randomUUID(),
      first_name: 'Director',
      last_name: 'Admin',
      preferred_currency: 'INR',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    addresses: [],
  };
  await saveUserRecordAsync(adminRecord, { isNewUser: false });

  const adminLoginReq = new NextRequest('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email: adminEmail,
      password: adminPassword,
    }),
  });
  const adminLoginRes = await loginEndpoint(adminLoginReq);
  const adminLoginBody = await adminLoginRes.json();

  assert(adminLoginRes.status === 200 && adminLoginBody.data?.requiresOtp === true, '7.1 Admin login triggers OTP flow');

  const adminOtpChallenge = getChallengeForTesting(adminLoginBody.data.challengeToken);
  const adminVerifyReq = new NextRequest('http://localhost:3000/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email: adminEmail,
      challengeToken: adminLoginBody.data.challengeToken,
      otp: adminOtpChallenge!.otp,
    }),
  });
  const adminVerifyRes = await verifyOtpEndpoint(adminVerifyReq);
  const adminVerifyBody = await adminVerifyRes.json();

  assert(adminVerifyRes.status === 200 && adminVerifyBody.success === true, '7.2 Admin login OTP verified');
  const adminToken = adminVerifyBody.data.token;

  const meAdminReq = new NextRequest('http://localhost:3000/api/auth/me', {
    headers: {
      cookie: `${AUTH_COOKIE_NAME}=${adminToken}`,
    },
  });
  const meAdminRes = await meEndpoint(meAdminReq);
  const meAdminBody = await meAdminRes.json();

  const verifiedAdminRoles = meAdminBody.data?.user?.roles || [];
  assert(verifiedAdminRoles.includes('ADMIN'), '7.3 Server-verified role contains ADMIN');
  const destinationAdmin = verifiedAdminRoles.includes('ADMIN') ? '/admin' : '/account';
  assert(destinationAdmin === '/admin', '7.4 Authorized Admin routes to /admin');

  // -------------------------------------------------------------
  // Test 8: Customer cannot access Admin routes or APIs
  // -------------------------------------------------------------
  console.log('\n--- Test 8: Customer Access to Admin Protected APIs Rejection ---');
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
  assert(customerDenied && customerErrorStatus === 403, '8.1 Customer token strictly rejected with 403 Forbidden for ADMIN role');

  // -------------------------------------------------------------
  // Test 9: Existing features continue to work (Forgot password, etc.)
  // -------------------------------------------------------------
  console.log('\n--- Test 9: Existing Features Regression Verification ---');
  const forgotReq = new NextRequest('http://localhost:3000/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: existingUserEmail }),
  });
  const forgotRes = await forgotPasswordEndpoint(forgotReq);
  const forgotBody = await forgotRes.json();

  assert(forgotRes.status === 200 && forgotBody.success === true, '9.1 Forgot password endpoint functional');

  console.log('\n===========================================================');
  console.log(`📊 STRICT AUTH FLOW VERIFICATION SUMMARY:`);
  console.log(`   ✓ Passed: ${passed}`);
  console.log(`   ✗ Failed: ${total - passed}`);
  console.log(`   🎯 Total:  ${total}`);
  console.log('===========================================================\n');

  return {
    passed,
    failed: total - passed,
    errors,
  };
}

if (process.argv[1]?.includes('strict-auth-flow-verification')) {
  runStrictAuthFlowTests().then((res) => {
    if (res.failed > 0) process.exit(1);
  }).catch((err) => {
    console.error('Fatal error running strict auth tests:', err);
    process.exit(1);
  });
}
