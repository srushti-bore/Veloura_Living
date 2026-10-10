/**
 * 🏛️ Veloura Living — Auth & Security Verification Test Suite
 * 
 * Verifies all Authentication, OTP & Backend Security issues:
 * 1. Issue 1: Server-enforced OTP challenge purpose separation (LOGIN vs REGISTER),
 *    handling omitted, forged, and unexpected purposes, testing both helper and endpoint policy.
 * 2. Issue 2: Production-safe pending registration persistence, fail-closed database unavailable
 *    mode, atomic single-use concurrency consumption, and removal of unverified bypasses.
 * 3. Fail-closed session authorization for missing, inactive, and suspended accounts.
 * 4. Staged failure-safe resend lifecycle, preserving previous OTP on failure and blocking superseded challenges.
 * 5. Concurrent OTP verification atomicity and atomic attempt count lockout under concurrency.
 * 6. High-entropy guest_access_token, elimination of hardcoded tokens, query string leakage defense, and guest data minimization.
 */

import {
  savePendingRegistration,
  getPendingRegistration,
  consumePendingRegistration,
  PendingRegistrationStoreError,
} from '../lib/auth/pendingRegistrationStore';
import {
  createOtpChallenge,
  verifyOtpChallenge,
  resendOtpChallenge,
  getChallengeForTesting,
  ALLOWED_OTP_PURPOSES,
  isValidOtpPurpose,
} from '../lib/auth/otpService';
import { POST as verifyOtpEndpoint } from '../app/api/auth/verify-otp/route';
import { brevoEmailService } from '../lib/services/brevoEmailService';
import {
  createOrder,
  getOrderByIdOrNumber,
  sanitizeOrderForGuest,
  initOrderStore,
} from '../lib/data/orderStore';
import { addToCart, clearCart } from '../lib/data/shoppingStore';
import { initCatalogStore, getAllVariants, updateVariantStock } from '../lib/data/catalogStore';
import { requireAuth, getSession } from '../lib/auth/session';
import { signToken } from '../lib/auth/jwt';
import { createUser, initUserRepository, saveUserRecord } from '../lib/data/userRepository';
import { findUserByEmail, initAuthStore } from '../lib/data/authStore';
import { hashPassword } from '../lib/auth/password';
import { NextRequest } from 'next/server';

export async function runAuthSecurityVerificationTests(): Promise<{
  passed: number;
  failed: number;
  errors: string[];
}> {
  let passed = 0;
  let failed = 0;
  const errors: string[] = [];

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      passed++;
      console.log(`  ✓ ${testName}`);
    } else {
      failed++;
      errors.push(`FAILED: ${testName} ${detail ? `(${detail})` : ''}`);
      console.error(`  ✗ ${testName} ${detail ? `(${detail})` : ''}`);
    }
  }

  console.log('\n===========================================================');
  console.log('🏛️  AUTHENTICATION & SECURITY VERIFICATION SUITE');
  console.log('===========================================================');

  const timestamp = Date.now();
  await initAuthStore();
  await initUserRepository();
  initOrderStore();

  // --------------------------------------------------------------------------
  // ISSUE 2: PRODUCTION-SAFE PENDING REGISTRATION PERSISTENCE
  // --------------------------------------------------------------------------
  console.log('\n--- Issue 2: Production-Safe Pending Registration Persistence & Concurrency ---');

  const pendingEmail = `pending_${timestamp}@example.com`;
  const dummyHash = 'pbkdf2_sha256$100000$salt$testhashvalue';
  const pendingReg = await savePendingRegistration({
    email: pendingEmail,
    passwordHash: dummyHash,
    firstName: 'Amara',
    lastName: 'Vance',
    phone: '+91 99887 76655',
  });

  assert(Boolean(pendingReg.id) && pendingReg.id.length >= 32, 'Pending registration generated opaque UUID identifier');
  assert(pendingReg.passwordHash === dummyHash, 'Pending registration safely preserved password hash in isolated store');

  // Verify retrieval
  const fetchedReg = await getPendingRegistration(pendingReg.id);
  assert(fetchedReg !== null && fetchedReg.email === pendingEmail, 'Pending registration retrievable via opaque identifier');

  // Create OTP challenge with pendingRegistrationId only
  const regChallenge = await createOtpChallenge({
    email: pendingEmail,
    type: 'REGISTER',
    name: 'Amara',
    metadata: {
      pendingRegistrationId: pendingReg.id,
      passwordHash: dummyHash, // Sensitive metadata that must be stripped
      password: 'PlaintextPassword123!',
    },
  });

  const storedChallenge = getChallengeForTesting(regChallenge.challengeToken);
  assert(storedChallenge !== undefined, 'Registration challenge initialized');
  assert(storedChallenge?.metadata?.pendingRegistrationId === pendingReg.id, 'Metadata contains opaque pendingRegistrationId');
  assert(storedChallenge?.metadata?.passwordHash === undefined, 'passwordHash strictly stripped from challenge metadata');
  assert(storedChallenge?.metadata?.password === undefined, 'plaintext password strictly stripped from challenge metadata');

  // Atomic concurrent consumption: 5 simultaneous requests attempting to consume the same pending registration
  const concurrentConsumes = await Promise.all([
    consumePendingRegistration(pendingReg.id),
    consumePendingRegistration(pendingReg.id),
    consumePendingRegistration(pendingReg.id),
    consumePendingRegistration(pendingReg.id),
    consumePendingRegistration(pendingReg.id),
  ]);
  const successfulConsumes = concurrentConsumes.filter((r) => r !== null);
  const nullConsumes = concurrentConsumes.filter((r) => r === null);

  assert(successfulConsumes.length === 1, 'Concurrent consume: exactly one request successfully consumes pending registration');
  assert(nullConsumes.length === 4, 'Concurrent consume: all other duplicate requests receive null (atomic single-use guaranteed)');

  // Expired pending registration test
  const expiredEmail = `expired_reg_${timestamp}@example.com`;
  const expiredPending = await savePendingRegistration({
    email: expiredEmail,
    passwordHash: dummyHash,
    firstName: 'Expired',
    lastName: 'User',
    phone: '+91 99887 00000',
  });
  expiredPending.expiresAt = Date.now() - 1000;
  const expiredConsumed = await consumePendingRegistration(expiredPending.id);
  assert(expiredConsumed === null, 'Expired pending registration cannot be consumed');

  // Production failure policy: no local fallback when DB required and unavailable
  let prodSaveRejected = false;
  try {
    await savePendingRegistration(
      {
        email: `prodfail_${timestamp}@example.com`,
        passwordHash: dummyHash,
      },
      { requirePostgres: true }
    );
  } catch (err: any) {
    if (err instanceof PendingRegistrationStoreError && err.code === 'DB_UNAVAILABLE') {
      prodSaveRejected = true;
    }
  }
  assert(prodSaveRejected === true, 'savePendingRegistration fails closed (DB_UNAVAILABLE) when PostgreSQL required but absent');

  let prodGetRejected = false;
  try {
    await getPendingRegistration('any-id', { requirePostgres: true });
  } catch (err: any) {
    if (err instanceof PendingRegistrationStoreError && err.code === 'DB_UNAVAILABLE') {
      prodGetRejected = true;
    }
  }
  assert(prodGetRejected === true, 'getPendingRegistration fails closed without falling back to local Map in production mode');

  let prodConsumeRejected = false;
  try {
    await consumePendingRegistration('any-id', { requirePostgres: true });
  } catch (err: any) {
    if (err instanceof PendingRegistrationStoreError && err.code === 'DB_UNAVAILABLE') {
      prodConsumeRejected = true;
    }
  }
  assert(prodConsumeRejected === true, 'consumePendingRegistration fails closed without falling back to local Map in production mode');

  // --------------------------------------------------------------------------
  // ISSUE 1: SERVER-ENFORCED OTP PURPOSE POLICY (LOGIN VS REGISTER)
  // --------------------------------------------------------------------------
  console.log('\n--- Issue 1: Server-Enforced OTP Purpose Policy & Endpoint Validation ---');

  // Verify explicit server purpose definitions
  assert(
    ALLOWED_OTP_PURPOSES.length === 2 &&
      ALLOWED_OTP_PURPOSES.includes('LOGIN') &&
      ALLOWED_OTP_PURPOSES.includes('REGISTER'),
    'ALLOWED_OTP_PURPOSES strictly limited to LOGIN and REGISTER'
  );
  assert(isValidOtpPurpose('LOGIN') === true, 'isValidOtpPurpose validates LOGIN');
  assert(isValidOtpPurpose('REGISTER') === true, 'isValidOtpPurpose validates REGISTER');
  assert(isValidOtpPurpose('PASSWORD_RESET') === false, 'isValidOtpPurpose rejects PASSWORD_RESET');
  assert(isValidOtpPurpose('') === false, 'isValidOtpPurpose rejects empty purpose');
  assert(isValidOtpPurpose(null) === false, 'isValidOtpPurpose rejects null purpose');

  // Challenge creation with invalid purpose fails safely
  const invalidTypeCreation = await createOtpChallenge({
    email: `badpurpose_${timestamp}@example.com`,
    type: 'INVALID_TYPE' as any,
  });
  assert(
    invalidTypeCreation.challengeToken === '' && invalidTypeCreation.emailDispatched === false,
    'createOtpChallenge safely rejects invalid challenge purpose'
  );

  // 1. REGISTER challenge purpose tests
  const purposeEmail = `purpose_sep_${timestamp}@example.com`;
  const regOnlyChal = await createOtpChallenge({
    email: purposeEmail,
    type: 'REGISTER',
  });
  const regOnlyStored = getChallengeForTesting(regOnlyChal.challengeToken)!;

  // Forged purpose: client supplies LOGIN on a REGISTER challenge
  const forgedPurposeVerify = await verifyOtpChallenge({
    email: purposeEmail,
    challengeToken: regOnlyChal.challengeToken,
    otp: regOnlyStored.otp,
    expectedType: 'LOGIN',
  });
  assert(forgedPurposeVerify.success === false, 'REGISTER challenge rejected when client supplies forged expectedType: LOGIN');
  assert(forgedPurposeVerify.code === 'INVALID_CHALLENGE', 'Forged purpose verification returns INVALID_CHALLENGE');

  // Omitted purpose: client does not pass expectedType, server resolves trusted REGISTER type
  const omittedPurposeVerify = await verifyOtpChallenge({
    email: purposeEmail,
    challengeToken: regOnlyChal.challengeToken,
    otp: regOnlyStored.otp,
    expectedType: undefined,
  });
  assert(omittedPurposeVerify.success === true, 'Matching or omitted expectedType resolves trusted server-side REGISTER purpose');
  assert(omittedPurposeVerify.type === 'REGISTER', 'Server context accurately identifies trusted challenge type as REGISTER');

  // 2. LOGIN challenge purpose tests
  const loginPurposeEmail = `login_purpose_${timestamp}@example.com`;
  const loginOnlyChal = await createOtpChallenge({
    email: loginPurposeEmail,
    type: 'LOGIN',
  });
  const loginOnlyStored = getChallengeForTesting(loginOnlyChal.challengeToken)!;

  // Forged purpose: client supplies REGISTER on a LOGIN challenge
  const forgedRegOnLogin = await verifyOtpChallenge({
    email: loginPurposeEmail,
    challengeToken: loginOnlyChal.challengeToken,
    otp: loginOnlyStored.otp,
    expectedType: 'REGISTER',
  });
  assert(forgedRegOnLogin.success === false, 'LOGIN challenge rejected when client supplies forged expectedType: REGISTER');
  assert(forgedRegOnLogin.code === 'INVALID_CHALLENGE', 'Cross-purpose verification returns INVALID_CHALLENGE');

  // 3. Stored challenge purpose corruption / missing fails closed
  const corruptPurposeChal = await createOtpChallenge({
    email: `corrupt_${timestamp}@example.com`,
    type: 'LOGIN',
  });
  const corruptStored = getChallengeForTesting(corruptPurposeChal.challengeToken)!;
  (corruptStored as any).type = 'UNEXPECTED_PURPOSE';

  const corruptVerify = await verifyOtpChallenge({
    email: `corrupt_${timestamp}@example.com`,
    challengeToken: corruptPurposeChal.challengeToken,
    otp: corruptStored.otp,
  });
  assert(corruptVerify.success === false, 'Stored challenge with unexpected purpose fails closed');
  assert(corruptVerify.code === 'INVALID_CHALLENGE', 'Corrupt purpose returns INVALID_CHALLENGE');

  // 4. Endpoint Policy Tests (POST /api/auth/verify-otp via NextRequest)
  console.log('\n--- Endpoint Policy Security: Account Creation & Session Rejection ---');

  // Flow A: Valid Registration via Endpoint succeeds and creates user
  const epEmail = `endpoint_reg_${timestamp}@example.com`;
  const epPending = await savePendingRegistration({
    email: epEmail,
    passwordHash: dummyHash,
    firstName: 'Audrey',
    lastName: 'Hepburn',
    phone: '+91 99887 11223',
  });

  const epRegChal = await createOtpChallenge({
    email: epEmail,
    type: 'REGISTER',
    name: 'Audrey',
    metadata: { pendingRegistrationId: epPending.id },
  });
  const epRegStored = getChallengeForTesting(epRegChal.challengeToken)!;

  const epReq = new NextRequest('http://localhost:3000/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email: epEmail,
      challengeToken: epRegChal.challengeToken,
      otp: epRegStored.otp,
    }),
  });

  const epRes = await verifyOtpEndpoint(epReq);
  const epBody = await epRes.json();
  assert(epRes.status === 200 && epBody.success === true, 'Valid registration OTP via endpoint succeeds with 200');
  assert(Boolean(epBody.data?.token), 'Valid registration receives authenticated JWT token');
  const createdEpUser = findUserByEmail(epEmail);
  assert(createdEpUser !== undefined && createdEpUser.user.is_email_verified === true, 'Registered user created and marked verified in store');

  // Flow B: Replay / Re-verification fails (single-use)
  const epReplayReq = new NextRequest('http://localhost:3000/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email: epEmail,
      challengeToken: epRegChal.challengeToken,
      otp: epRegStored.otp,
    }),
  });
  const epReplayRes = await verifyOtpEndpoint(epReplayReq);
  assert(epReplayRes.status === 400, 'Replaying verified registration OTP is strictly rejected (400)');

  // Flow C: Register challenge CANNOT target existing verified account (Conflict 409)
  const duplicateRegChal = await createOtpChallenge({
    email: epEmail, // Already verified user
    type: 'REGISTER',
    metadata: { pendingRegistrationId: 'fake-pending-id' },
  });
  const dupStored = getChallengeForTesting(duplicateRegChal.challengeToken)!;
  const dupReq = new NextRequest('http://localhost:3000/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email: epEmail,
      challengeToken: duplicateRegChal.challengeToken,
      otp: dupStored.otp,
    }),
  });
  const dupRes = await verifyOtpEndpoint(dupReq);
  assert(dupRes.status === 409, 'Registration verification on existing verified account returns 409 Conflict');

  // Flow D: Login challenge CANNOT log in non-existent account (Unauthorized 401)
  const ghostEmail = `ghost_${timestamp}@example.com`;
  const ghostLoginChal = await createOtpChallenge({
    email: ghostEmail,
    type: 'LOGIN',
  });
  const ghostStored = getChallengeForTesting(ghostLoginChal.challengeToken)!;
  const ghostReq = new NextRequest('http://localhost:3000/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email: ghostEmail,
      challengeToken: ghostLoginChal.challengeToken,
      otp: ghostStored.otp,
    }),
  });
  const ghostRes = await verifyOtpEndpoint(ghostReq);
  assert(ghostRes.status === 401, 'Login verification for non-existent user returns 401 Unauthorized');

  // Flow E: Bypass attempt with legacy pendingRecord metadata fails closed (no user created)
  const bypassEmail = `bypass_${timestamp}@example.com`;
  const bypassChal = await createOtpChallenge({
    email: bypassEmail,
    type: 'REGISTER',
    metadata: {
      pendingRecord: {
        user: { id: 'bypass-id', email: bypassEmail, status: 'ACTIVE' },
        roles: ['ADMIN'], // Attempting unverified admin injection
      },
    },
  });
  const bypassStored = getChallengeForTesting(bypassChal.challengeToken)!;
  const bypassReq = new NextRequest('http://localhost:3000/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email: bypassEmail,
      challengeToken: bypassChal.challengeToken,
      otp: bypassStored.otp,
    }),
  });
  const bypassRes = await verifyOtpEndpoint(bypassReq);
  assert(bypassRes.status === 400, 'Legacy pendingRecord injection without pending_registrations row fails closed (400)');
  assert(findUserByEmail(bypassEmail) === undefined, 'No user account created from legacy pendingRecord bypass attempt');

  // --------------------------------------------------------------------------
  // FAIL-CLOSED SESSIONS & CROSS-PROCESS ACCOUNT STATUS SYNC
  // --------------------------------------------------------------------------
  console.log('\n--- Fail-Closed Sessions & Real-Time Account Status Sync ---');

  // Missing user record fails closed
  const phantomUserId = '00000000-0000-0000-0000-000000000099';
  const phantomToken = await signToken(phantomUserId, 'phantom@example.com', ['CUSTOMER']);
  const phantomReq = new NextRequest('http://localhost:3000/api/customer/profile', {
    headers: { authorization: `Bearer ${phantomToken}` },
  });

  const phantomSession = await getSession(phantomReq);
  assert(phantomSession === null, 'Session authorization FAILS CLOSED (returns null) when user record does not exist');

  let phantomAuthRejected = false;
  try {
    await requireAuth(phantomReq);
  } catch {
    phantomAuthRejected = true;
  }
  assert(phantomAuthRejected === true, 'requireAuth strictly throws for missing user record');

  // Suspended account rejection
  const suspEmail = `suspended_${timestamp}@example.com`;
  const suspUser = await createUser({
    email: suspEmail,
    passwordHash: await hashPassword('SuspendedPass2026!'),
    firstName: 'Suspended',
    lastName: 'User',
  });
  suspUser.user.status = 'SUSPENDED';
  saveUserRecord(suspUser);

  const suspToken = await signToken(suspUser.user.id, suspUser.user.email, suspUser.roles);
  const suspReq = new NextRequest('http://localhost:3000/api/customer/profile', {
    headers: { authorization: `Bearer ${suspToken}` },
  });

  const suspSession = await getSession(suspReq);
  assert(suspSession?.status === 'SUSPENDED', 'Session status reflects real-time SUSPENDED status');

  let suspRejected = false;
  try {
    await requireAuth(suspReq);
  } catch (err: any) {
    suspRejected = true;
    assert(err.message.includes('suspended'), 'requireAuth error mentions account suspension');
  }
  assert(suspRejected === true, 'Suspended account strictly rejected by requireAuth');

  // Inactive account rejection
  const inactEmail = `inactive_${timestamp}@example.com`;
  const inactUser = await createUser({
    email: inactEmail,
    passwordHash: await hashPassword('InactivePass2026!'),
    firstName: 'Inactive',
    lastName: 'User',
  });
  inactUser.user.status = 'INACTIVE';
  saveUserRecord(inactUser);

  const inactToken = await signToken(inactUser.user.id, inactUser.user.email, inactUser.roles);
  const inactReq = new NextRequest('http://localhost:3000/api/customer/profile', {
    headers: { authorization: `Bearer ${inactToken}` },
  });

  let inactRejected = false;
  try {
    await requireAuth(inactReq);
  } catch (err: any) {
    inactRejected = true;
    assert(
      err.message.toLowerCase().includes('not active') || err.message.toLowerCase().includes('inactive'),
      'requireAuth error mentions inactive account'
    );
  }
  assert(inactRejected === true, 'Inactive account strictly rejected by requireAuth');

  // --------------------------------------------------------------------------
  // FAILURE-SAFE RESEND PERSISTENCE & SUPERSEDED CODE DEFENSE
  // --------------------------------------------------------------------------
  console.log('\n--- Failure-Safe Resend Persistence & Superseded Code Defense ---');

  const resendEmail = `resend_${timestamp}@example.com`;
  const initialChal = await createOtpChallenge({
    email: resendEmail,
    type: 'LOGIN',
  });
  const initialStored = getChallengeForTesting(initialChal.challengeToken)!;
  const initialOtp = initialStored.otp;

  initialStored.lastSentAt = Date.now() - 35000;

  // Mock Brevo delivery failure during resend
  const origSend = brevoEmailService.sendOtpEmail;
  brevoEmailService.sendOtpEmail = async () => ({
    success: false,
    deliveryStatus: 'TIMEOUT_UNKNOWN',
    error: 'Simulated connection timeout during resend',
  });

  const failedResend = await resendOtpChallenge({
    email: resendEmail,
    challengeToken: initialChal.challengeToken,
  });

  assert(failedResend.success === false, 'Resend reports failure when delivery or persistence fails');
  assert(failedResend.error?.includes('previous verification code remains valid') === true, 'Notifies client that previous OTP remains valid');

  const verifyInitialAfterFailedResend = await verifyOtpChallenge({
    email: resendEmail,
    challengeToken: initialChal.challengeToken,
    otp: initialOtp,
  });
  assert(verifyInitialAfterFailedResend.success === true, 'Original OTP successfully verifies after failed resend attempt');

  brevoEmailService.sendOtpEmail = origSend;

  // Successful resend: Superseded challenge defense
  const resendEmail2 = `resend2_${timestamp}@example.com`;
  const chal2 = await createOtpChallenge({
    email: resendEmail2,
    type: 'LOGIN',
  });
  const chal2Stored = getChallengeForTesting(chal2.challengeToken)!;
  const oldOtp = chal2Stored.otp;

  chal2Stored.lastSentAt = Date.now() - 35000;
  const successfulResend = await resendOtpChallenge({
    email: resendEmail2,
    challengeToken: chal2.challengeToken,
  });
  assert(successfulResend.success === true, 'Successful resend issues new verification challenge');

  const oldCodeVerify = await verifyOtpChallenge({
    email: resendEmail2,
    challengeToken: chal2.challengeToken,
    otp: oldOtp,
  });
  assert(oldCodeVerify.success === false, 'Superseded OTP code cannot be reused after resend');

  const updatedStored = getChallengeForTesting(chal2.challengeToken)!;
  const newCodeVerify = await verifyOtpChallenge({
    email: resendEmail2,
    challengeToken: chal2.challengeToken,
    otp: updatedStored.otp,
  });
  assert(newCodeVerify.success === true, 'Replacement OTP code verifies successfully');

  // --------------------------------------------------------------------------
  // CONCURRENT OTP VERIFICATION ATOMICITY & ATTEMPT LOCKOUT
  // --------------------------------------------------------------------------
  console.log('\n--- Concurrent OTP Verification Atomicity & Attempt Lockout ---');

  const concEmail = `concurrent_${timestamp}@example.com`;
  const concChal = await createOtpChallenge({
    email: concEmail,
    type: 'LOGIN',
  });
  const concStored = getChallengeForTesting(concChal.challengeToken)!;

  const concurrentVerifications = await Promise.all([
    verifyOtpChallenge({ email: concEmail, challengeToken: concChal.challengeToken, otp: concStored.otp }),
    verifyOtpChallenge({ email: concEmail, challengeToken: concChal.challengeToken, otp: concStored.otp }),
    verifyOtpChallenge({ email: concEmail, challengeToken: concChal.challengeToken, otp: concStored.otp }),
    verifyOtpChallenge({ email: concEmail, challengeToken: concChal.challengeToken, otp: concStored.otp }),
  ]);

  const concSuccesses = concurrentVerifications.filter((r) => r.success);
  const concFailures = concurrentVerifications.filter((r) => !r.success);

  assert(concSuccesses.length === 1, 'Exactly one concurrent verification succeeds under simultaneous requests');
  assert(concFailures.length === 3, 'All other concurrent duplicate requests are rejected (single-use guarantee)');

  // Concurrent invalid attempts lockout
  const lockoutEmail = `lockout_${timestamp}@example.com`;
  const lockoutChal = await createOtpChallenge({
    email: lockoutEmail,
    type: 'LOGIN',
  });

  const invalidAttempts = await Promise.all(
    Array.from({ length: 10 }, () =>
      verifyOtpChallenge({
        email: lockoutEmail,
        challengeToken: lockoutChal.challengeToken,
        otp: '000000',
      })
    )
  );

  assert(invalidAttempts.every((r) => !r.success), 'All 10 concurrent invalid attempts fail');

  const postLockoutAttempt = await verifyOtpChallenge({
    email: lockoutEmail,
    challengeToken: lockoutChal.challengeToken,
    otp: '123456',
  });
  assert(postLockoutAttempt.success === false, 'Session remains locked out after exceeding max attempts under concurrency');
  assert(postLockoutAttempt.code === 'TOO_MANY_ATTEMPTS', 'Lockout returns TOO_MANY_ATTEMPTS');
  assert(postLockoutAttempt.remainingAttempts === 0, 'Zero remaining attempts reported');

  // --------------------------------------------------------------------------
  // GUEST ORDER ACCESS & QUERY STRING DEFENSE
  // --------------------------------------------------------------------------
  console.log('\n--- Guest Order Access Security & Query String Defense ---');

  initCatalogStore();
  const variants = getAllVariants();
  const sampleVariant = variants.find((v) => v.price >= 3000 && v.price <= 40000) || variants[0];
  const sampleSku = sampleVariant.sku;
  updateVariantStock(sampleSku, 50);
  clearCart('guest_session_key_123');
  addToCart('guest_session_key_123', sampleSku, 1);

  const guestOrderRes = createOrder({
    ownerKey: 'guest_session_key_123',
    customerInfo: {
      fullName: 'Lady Genevieve Sterling',
      email: 'genevieve.sterling@mayfair-estates.co.uk',
      phone: '+44 7700 900123',
      addressLine1: '42 Berkeley Square',
      city: 'London',
      state: 'Greater London',
      postalCode: 'W1J 5AW',
    },
    paymentMethod: 'CARD',
  });

  const createdOrder = guestOrderRes.order;
  assert(Boolean(createdOrder.guest_access_token), 'Order assigned high-entropy guest_access_token');
  assert(
    createdOrder.guest_access_token?.startsWith('gat_') === true && createdOrder.guest_access_token.length >= 36,
    'guest_access_token prefixed with gat_ and meets entropy requirement'
  );

  const sanitizedGuestView = sanitizeOrderForGuest(createdOrder);
  assert(sanitizedGuestView.order_number === createdOrder.order_number, 'Sanitized view contains public order number');
  assert(
    (sanitizedGuestView as any).customer_info?.address_line1 === undefined,
    'Street address line 1 strictly stripped from guest tracking view'
  );
  assert(
    (sanitizedGuestView as any).customer_info?.addressLine1 === undefined,
    'Street addressLine1 strictly stripped from guest tracking view'
  );
  assert(
    sanitizedGuestView.customer_info?.email_masked.includes('***') === true,
    'Email address masked in guest tracking view'
  );
  assert(
    sanitizedGuestView.customer_info?.phone_masked.includes('*****') === true,
    'Phone number masked in guest tracking view'
  );
  assert(
    (sanitizedGuestView as any).payment === undefined,
    'Raw payment transactions and tokens stripped from guest tracking view'
  );

  const hardcodedDemoToken = 'gat_demo_sec_981240189234';
  assert(
    createdOrder.guest_access_token !== hardcodedDemoToken,
    'Order does not use hardcoded demo token'
  );

  // --------------------------------------------------------------------------
  // SUMMARY REPORT
  // --------------------------------------------------------------------------
  console.log('\n===========================================================');
  console.log(`📊 AUTHENTICATION & SECURITY VERIFICATION SUMMARY:`);
  console.log(`   ✓ Passed: ${passed}`);
  console.log(`   ✗ Failed: ${failed}`);
  console.log(`   🎯 Total:  ${passed + failed}`);
  console.log('===========================================================');

  return { passed, failed, errors };
}

if (process.argv[1]?.endsWith('auth-security-verification.test.ts')) {
  runAuthSecurityVerificationTests()
    .then((res) => {
      if (res.failed > 0) process.exit(1);
      process.exit(0);
    })
    .catch((err) => {
      console.error('Test execution error:', err);
      process.exit(1);
    });
}
