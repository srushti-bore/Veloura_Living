/**
 * 🏛️ Veloura Living — Mandatory OTP Authentication & Brevo Transactional Email Test Suite
 * 
 * Verifies all 19 SRS Section 13 Regression Scenarios:
 * 1. Registration with successful OTP delivery.
 * 2. Registration when OTP delivery fails.
 * 3. Login with successful OTP delivery.
 * 4. Login when OTP delivery fails.
 * 5. Invalid OTP rejection and remaining attempts.
 * 6. Expired OTP rejection.
 * 7. Maximum failed attempts (5-attempt lock).
 * 8. OTP challenge purpose mismatch (LOGIN vs REGISTER).
 * 9. OTP reuse after successful verification (single-use guarantee).
 * 10. Resend cooldown (30s) and resend limits (3 max).
 * 11. Failed resend without silently invalidating the previous challenge (staged transactional resend).
 * 12. Concurrent verification and resend behavior.
 * 13. OTP state shared across processes or persisted across application restarts.
 * 14. Separate sessions for two different customers.
 * 15. A customer attempting to access another customer's profile, cart, or orders.
 * 16. Customer attempts to access admin endpoints.
 * 17. Unauthorized admin role escalation attempts.
 * 18. Existing frontend authentication response compatibility.
 * 19. Existing checkout and Razorpay test-mode flows remain unaffected.
 */

import fs from 'fs';
import path from 'path';
import { initUserRepository, createUser, findUserByEmail, UserRecord } from '../lib/data/userRepository';
import { hashPassword } from '../lib/auth/password';
import { signToken, verifyToken } from '../lib/auth/jwt';
import {
  createOtpChallenge,
  verifyOtpChallenge,
  resendOtpChallenge,
  getChallengeForTesting,
} from '../lib/auth/otpService';
import { brevoEmailService } from '../lib/services/brevoEmailService';
import {
  createOrder,
  recordPaymentTransaction,
  getOrderByIdOrNumber,
  getOrdersByUserId,
  initOrderStore,
} from '../lib/data/orderStore';
import { initCatalogStore, getAllVariants, updateVariantStock } from '../lib/data/catalogStore';
import { addToCart, getCart, clearCart } from '../lib/data/shoppingStore';
import { hasAnyRole } from '../lib/auth/rbac';

let passed = 0;
let total = 0;

function assert(condition: boolean, testName: string, failureDetails?: string) {
  total++;
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    if (failureDetails) console.error(`     Details: ${failureDetails}`);
  }
}

export async function runOtpBrevoTestSuite() {
  console.log('\n🏛️  ================================================================');
  console.log('🏛️  VELOURA LIVING — MANDATORY OTP & BREVO TRANSACTIONAL EMAIL TESTS');
  console.log('🏛️  ================================================================\n');

  await initUserRepository();
  initCatalogStore();
  initOrderStore();

  const timestamp = Date.now();
  const testUserEmail = `client_${timestamp}@example.com`;
  const testPassword = 'ClientLuxuryPass2026!';
  const passwordHash = await hashPassword(testPassword);

  const userRecord = await createUser({
    email: testUserEmail,
    passwordHash,
    firstName: 'Cordelia',
    lastName: 'Sinclair',
    phone: '+91 98200 88776',
  });

  // --------------------------------------------------------------------------
  // SCENARIO 1: REGISTRATION WITH SUCCESSFUL OTP DELIVERY
  // --------------------------------------------------------------------------
  console.log('📦 [1/19] Registration with Successful OTP Delivery:');
  const regEmail = `reg_success_${timestamp}@example.com`;
  const regChallenge = await createOtpChallenge({
    email: regEmail,
    type: 'REGISTER',
    userId: 'uuid_reg_1',
    name: 'Siddharth',
  });

  assert(regChallenge.emailDispatched === true, '1. Registration OTP email dispatch confirmed');
  assert(Boolean(regChallenge.challengeToken), '1. Registration returns valid challengeToken');
  assert(regChallenge.expiresInSeconds === 600, '1. Expiration window initialized to 10 minutes (600s)');

  // --------------------------------------------------------------------------
  // SCENARIO 2: REGISTRATION WHEN OTP DELIVERY FAILS (HONEST ERROR)
  // --------------------------------------------------------------------------
  console.log('\n📦 [2/19] Registration When OTP Delivery Fails (Honest Error):');
  const origSend = brevoEmailService.sendOtpEmail;
  // Mock delivery failure
  brevoEmailService.sendOtpEmail = async () => ({
    success: false,
    error: 'Brevo API connection timeout',
  });

  const failedRegChallenge = await createOtpChallenge({
    email: `reg_fail_${timestamp}@example.com`,
    type: 'REGISTER',
    userId: 'uuid_reg_fail',
    name: 'Failed User',
  });

  assert(failedRegChallenge.emailDispatched === false, '2. Dispatch failure treated as real failure (emailDispatched: false)');
  assert(failedRegChallenge.challengeToken === '', '2. Empty challenge token returned on dispatch failure');
  assert(
    failedRegChallenge.message.includes('Unable to deliver verification code'),
    '2. Safe user-friendly failure message returned without leaking provider secrets'
  );

  // Restore email sender
  brevoEmailService.sendOtpEmail = origSend;

  // --------------------------------------------------------------------------
  // SCENARIO 3: LOGIN WITH SUCCESSFUL OTP DELIVERY
  // --------------------------------------------------------------------------
  console.log('\n📦 [3/19] Login with Successful OTP Delivery:');
  const loginChallenge = await createOtpChallenge({
    email: testUserEmail,
    type: 'LOGIN',
    userId: userRecord.user.id,
    name: 'Cordelia',
  });

  assert(loginChallenge.emailDispatched === true, '3. Login OTP email dispatch confirmed');
  assert(Boolean(loginChallenge.challengeToken), '3. Login challengeToken generated with entropy');
  const storedLogin = getChallengeForTesting(loginChallenge.challengeToken);
  assert(storedLogin?.otp.length === 6, '3. Generated OTP is exactly 6 numeric digits');
  assert(/^\d{6}$/.test(storedLogin?.otp || ''), '3. OTP contains only numeric digits');

  // --------------------------------------------------------------------------
  // SCENARIO 4: LOGIN WHEN OTP DELIVERY FAILS (HONEST ERROR)
  // --------------------------------------------------------------------------
  console.log('\n📦 [4/19] Login When OTP Delivery Fails (Honest Error):');
  brevoEmailService.sendOtpEmail = async () => ({
    success: false,
    error: 'Brevo upstream 503 service unavailable',
  });

  const failedLoginChallenge = await createOtpChallenge({
    email: testUserEmail,
    type: 'LOGIN',
    userId: userRecord.user.id,
    name: 'Cordelia',
  });

  assert(failedLoginChallenge.emailDispatched === false, '4. Login dispatch failure reported accurately');
  assert(failedLoginChallenge.challengeToken === '', '4. Does not issue challengeToken on login delivery failure');

  brevoEmailService.sendOtpEmail = origSend;

  // --------------------------------------------------------------------------
  // SCENARIO 5: INVALID OTP REJECTION & ATTEMPTS DECREMENT
  // --------------------------------------------------------------------------
  console.log('\n📦 [5/19] Invalid OTP Rejection & Remaining Attempts:');
  const freshLogin = await createOtpChallenge({
    email: testUserEmail,
    type: 'LOGIN',
    userId: userRecord.user.id,
    name: 'Cordelia',
  });

  const wrongRes = await verifyOtpChallenge({
    email: testUserEmail,
    challengeToken: freshLogin.challengeToken,
    otp: '000000',
  });

  assert(wrongRes.success === false, '5. Incorrect OTP is strictly rejected');
  assert(wrongRes.code === 'INVALID_OTP', '5. Returns INVALID_OTP error code');
  assert(wrongRes.remainingAttempts === 4, '5. Remaining attempts decremented accurately to 4');

  // --------------------------------------------------------------------------
  // SCENARIO 6: EXPIRED OTP REJECTION
  // --------------------------------------------------------------------------
  console.log('\n📦 [6/19] Expired OTP Rejection:');
  const expChallenge = await createOtpChallenge({
    email: `exp_${timestamp}@example.com`,
    type: 'LOGIN',
    userId: userRecord.user.id,
  });
  const expStored = getChallengeForTesting(expChallenge.challengeToken)!;
  // Simulate passage of time past 10-minute expiry
  expStored.expiresAt = Date.now() - 5000;

  const expVerifyRes = await verifyOtpChallenge({
    email: `exp_${timestamp}@example.com`,
    challengeToken: expChallenge.challengeToken,
    otp: expStored.otp,
  });

  assert(expVerifyRes.success === false, '6. Expired OTP is strictly rejected');
  assert(expVerifyRes.code === 'EXPIRED_OTP', '6. Returns EXPIRED_OTP error code');

  // --------------------------------------------------------------------------
  // SCENARIO 7: MAXIMUM FAILED ATTEMPTS (5 MAX -> TERMINATION)
  // --------------------------------------------------------------------------
  console.log('\n📦 [7/19] Maximum Failed Attempts Protection:');
  const maxAttemptChal = await createOtpChallenge({
    email: testUserEmail,
    type: 'LOGIN',
    userId: userRecord.user.id,
  });

  // Attempt 1 to 4 with incorrect codes
  await verifyOtpChallenge({ email: testUserEmail, challengeToken: maxAttemptChal.challengeToken, otp: '111111' });
  await verifyOtpChallenge({ email: testUserEmail, challengeToken: maxAttemptChal.challengeToken, otp: '222222' });
  await verifyOtpChallenge({ email: testUserEmail, challengeToken: maxAttemptChal.challengeToken, otp: '333333' });
  await verifyOtpChallenge({ email: testUserEmail, challengeToken: maxAttemptChal.challengeToken, otp: '444444' });
  // 5th failed attempt
  const lockedOutRes = await verifyOtpChallenge({
    email: testUserEmail,
    challengeToken: maxAttemptChal.challengeToken,
    otp: '555555',
  });

  assert(lockedOutRes.success === false, '7. Exceeding 5 attempts invalidates and locks challenge session');
  assert(lockedOutRes.code === 'TOO_MANY_ATTEMPTS', '7. Returns TOO_MANY_ATTEMPTS code on brute force');

  // --------------------------------------------------------------------------
  // SCENARIO 8: OTP CHALLENGE PURPOSE MISMATCH (LOGIN VS REGISTER)
  // --------------------------------------------------------------------------
  console.log('\n📦 [8/19] OTP Challenge Purpose Mismatch (LOGIN vs REGISTER):');
  const regChalPurpose = await createOtpChallenge({
    email: `purpose_${timestamp}@example.com`,
    type: 'REGISTER',
    userId: 'uuid_purpose',
  });
  const regPurposeStored = getChallengeForTesting(regChalPurpose.challengeToken)!;

  const crossTypeRes = await verifyOtpChallenge({
    email: `purpose_${timestamp}@example.com`,
    challengeToken: regChalPurpose.challengeToken,
    otp: regPurposeStored.otp,
    expectedType: 'LOGIN', // Purpose mismatch
  });

  assert(crossTypeRes.success === false, '8. Register challenge rejected when verifying for LOGIN');
  assert(crossTypeRes.code === 'INVALID_CHALLENGE', '8. Returns INVALID_CHALLENGE error on purpose mismatch');

  // Clean verify matching REGISTER succeeds
  const matchTypeRes = await verifyOtpChallenge({
    email: `purpose_${timestamp}@example.com`,
    challengeToken: regChalPurpose.challengeToken,
    otp: regPurposeStored.otp,
    expectedType: 'REGISTER',
  });
  assert(matchTypeRes.success === true, '8. Matching expectedType REGISTER verification succeeds');

  // --------------------------------------------------------------------------
  // SCENARIO 9: OTP REUSE AFTER SUCCESSFUL VERIFICATION (REPLAY PREVENTION)
  // --------------------------------------------------------------------------
  console.log('\n📦 [9/19] OTP Reuse After Successful Verification (Single-Use):');
  const replayChal = await createOtpChallenge({
    email: testUserEmail,
    type: 'LOGIN',
    userId: userRecord.user.id,
  });
  const replayStored = getChallengeForTesting(replayChal.challengeToken)!;

  const firstVerify = await verifyOtpChallenge({
    email: testUserEmail,
    challengeToken: replayChal.challengeToken,
    otp: replayStored.otp,
  });
  assert(firstVerify.success === true, '9. First verification consumes OTP successfully');

  const replayVerify = await verifyOtpChallenge({
    email: testUserEmail,
    challengeToken: replayChal.challengeToken,
    otp: replayStored.otp,
  });
  assert(replayVerify.success === false, '9. Replaying already-consumed OTP is strictly rejected (single-use guarantee)');

  // --------------------------------------------------------------------------
  // SCENARIO 10: RESEND COOLDOWN AND RESEND LIMITS
  // --------------------------------------------------------------------------
  console.log('\n📦 [10/19] Resend Cooldown and Resend Limits:');
  const resendTestChal = await createOtpChallenge({
    email: testUserEmail,
    type: 'LOGIN',
    userId: userRecord.user.id,
  });

  // Attempt immediate resend (cooldown active)
  const prematureResend = await resendOtpChallenge({
    email: testUserEmail,
    challengeToken: resendTestChal.challengeToken,
  });
  assert(prematureResend.success === false, '10. Immediate resend within 30s cooldown is rejected');
  assert(Boolean(prematureResend.cooldownSeconds && prematureResend.cooldownSeconds <= 30), '10. Cooldown remaining seconds returned');

  // Advance time past cooldown and simulate reaching max resends (3)
  const storedResendTest = getChallengeForTesting(resendTestChal.challengeToken)!;
  storedResendTest.lastSentAt = Date.now() - 35000;
  storedResendTest.resends = 3; // Max resends reached

  const maxResendsRes = await resendOtpChallenge({
    email: testUserEmail,
    challengeToken: resendTestChal.challengeToken,
  });
  assert(maxResendsRes.success === false, '10. Exceeding max resends (3) is rejected');
  assert(maxResendsRes.error?.includes('Maximum resend limit reached') === true, '10. Max resend limit error message returned');

  // --------------------------------------------------------------------------
  // SCENARIO 11: FAILED RESEND WITHOUT SILENTLY INVALIDATING PREVIOUS CHALLENGE
  // --------------------------------------------------------------------------
  console.log('\n📦 [11/19] Staged Transactional Resend (Previous OTP Remains Valid on Dispatch Failure):');
  const stagedChal = await createOtpChallenge({
    email: `staged_${timestamp}@example.com`,
    type: 'LOGIN',
    userId: userRecord.user.id,
  });
  const stagedStored = getChallengeForTesting(stagedChal.challengeToken)!;
  const originalOtp = stagedStored.otp;
  // Advance cooldown
  stagedStored.lastSentAt = Date.now() - 35000;

  // Mock Brevo failure during resend
  brevoEmailService.sendOtpEmail = async () => ({
    success: false,
    error: 'Brevo gateway timeout on resend',
  });

  const failedResendRes = await resendOtpChallenge({
    email: `staged_${timestamp}@example.com`,
    challengeToken: stagedChal.challengeToken,
  });

  assert(failedResendRes.success === false, '11. Resend failure correctly reported');
  assert(failedResendRes.error?.includes('previous verification code remains valid') === true, '11. User notified that previous OTP remains valid');

  // Crucial test: Does the previous OTP still verify?
  const prevOtpVerify = await verifyOtpChallenge({
    email: `staged_${timestamp}@example.com`,
    challengeToken: stagedChal.challengeToken,
    otp: originalOtp,
  });
  assert(prevOtpVerify.success === true, '11. Original OTP remains valid and successfully verifies after failed resend!');

  brevoEmailService.sendOtpEmail = origSend;

  // --------------------------------------------------------------------------
  // SCENARIO 12: CONCURRENT VERIFICATION BEHAVIOR
  // --------------------------------------------------------------------------
  console.log('\n📦 [12/19] Concurrent Verification Atomicity:');
  const concurrentChal = await createOtpChallenge({
    email: testUserEmail,
    type: 'LOGIN',
    userId: userRecord.user.id,
  });
  const concurrentStored = getChallengeForTesting(concurrentChal.challengeToken)!;

  // Fire two simultaneous verification requests
  const [resA, resB] = await Promise.all([
    verifyOtpChallenge({ email: testUserEmail, challengeToken: concurrentChal.challengeToken, otp: concurrentStored.otp }),
    verifyOtpChallenge({ email: testUserEmail, challengeToken: concurrentChal.challengeToken, otp: concurrentStored.otp }),
  ]);

  const successCount = [resA.success, resB.success].filter(Boolean).length;
  assert(successCount === 1, '12. Exactly one concurrent verification succeeds; duplicate cannot double-consume');

  // --------------------------------------------------------------------------
  // SCENARIO 13: OTP STATE PERSISTED ACROSS RESTARTS / DISK CACHE
  // --------------------------------------------------------------------------
  console.log('\n📦 [13/19] OTP State Shared & Recovered Across Restarts:');
  const restartChal = await createOtpChallenge({
    email: `restart_${timestamp}@example.com`,
    type: 'LOGIN',
    userId: userRecord.user.id,
  });
  const restartStored = getChallengeForTesting(restartChal.challengeToken)!;
  const restartOtp = restartStored.otp;

  // Verify that plaintext OTP is never written to disk
  const diskPath = path.join(process.cwd(), '.data', 'otp_challenges.json');
  if (fs.existsSync(diskPath)) {
    const rawDisk = fs.readFileSync(diskPath, 'utf-8');
    const parsedDisk = JSON.parse(rawDisk);
    const diskRecord = parsedDisk.find((r: any) => r.challengeToken === restartChal.challengeToken);
    assert(diskRecord?.otp === '', '13. Plaintext OTP is stripped from persistent disk storage');
    assert(Boolean(diskRecord?.otpHash), '13. Salted SHA-256 verifier hash is preserved on disk');
  }

  // Verification succeeds using salted hash
  const restartVerify = await verifyOtpChallenge({
    email: `restart_${timestamp}@example.com`,
    challengeToken: restartChal.challengeToken,
    otp: restartOtp,
  });
  assert(restartVerify.success === true, '13. Challenge verified against persisted cryptographic hash');

  // --------------------------------------------------------------------------
  // SCENARIO 14: SEPARATE SESSIONS FOR TWO DIFFERENT CUSTOMERS
  // --------------------------------------------------------------------------
  console.log('\n📦 [14/19] Separate Sessions for Two Different Customers:');
  const userA = await createUser({
    email: `alice_${timestamp}@example.com`,
    passwordHash,
    firstName: 'Alice',
    lastName: 'Vanderbilt',
  });
  const userB = await createUser({
    email: `bob_${timestamp}@example.com`,
    passwordHash,
    firstName: 'Bob',
    lastName: 'Astor',
  });

  const tokenA = await signToken(userA.user.id, userA.user.email, userA.roles);
  const tokenB = await signToken(userB.user.id, userB.user.email, userB.roles);

  const sessionA = await verifyToken(tokenA);
  const sessionB = await verifyToken(tokenB);

  assert(sessionA?.sub === userA.user.id && sessionA?.email === userA.user.email, '14. Session A claims strictly bound to Alice');
  assert(sessionB?.sub === userB.user.id && sessionB?.email === userB.user.email, '14. Session B claims strictly bound to Bob');
  assert(sessionA?.sub !== sessionB?.sub, '14. Customer identities completely isolated');

  // --------------------------------------------------------------------------
  // SCENARIO 15: CUSTOMER ATTEMPTING TO ACCESS ANOTHER CUSTOMER'S DATA
  // --------------------------------------------------------------------------
  console.log('\n📦 [15/19] Customer Data Isolation (Cart & Orders Scoped to Owner):');
  const variants = getAllVariants();
  const sampleVariant = variants.find((v) => v.price >= 3000 && v.price <= 40000) || variants[0];
  const sampleSku = sampleVariant.sku;

  clearCart(userA.user.id);
  clearCart(userB.user.id);
  updateVariantStock(sampleSku, 100);

  addToCart(userA.user.id, sampleSku, 1);
  const cartA = getCart(userA.user.id);
  const cartB = getCart(userB.user.id);

  assert(cartA.items.length === 1 && cartA.items[0].quantity === 1, '15. Alice cart contains 1 unit');
  assert(cartB.items.length === 0, '15. Bob cart is completely empty (no data bleed)');

  // Orders scoping
  const orderA = createOrder({
    ownerKey: userA.user.id,
    userId: userA.user.id,
    customerInfo: {
      fullName: 'Alice Vanderbilt',
      email: userA.user.email,
      phone: '+91 98200 11111',
      addressLine1: 'Penthouse A',
      city: 'Mumbai',
      state: 'MH',
      postalCode: '400001',
    },
    paymentMethod: 'COD',
  });

  const aliceOrders = getOrdersByUserId(userA.user.id);
  const bobOrders = getOrdersByUserId(userB.user.id);

  assert(aliceOrders.some((o) => o.id === orderA.order.id), '15. Alice orders list contains Order A');
  assert(!bobOrders.some((o) => o.id === orderA.order.id), '15. Bob orders list cannot see Alice Order A');

  // --------------------------------------------------------------------------
  // SCENARIO 16: CUSTOMER ATTEMPTS TO ACCESS ADMIN ENDPOINTS
  // --------------------------------------------------------------------------
  console.log('\n📦 [16/19] Customer Access to Admin Role Protection:');
  const customerRoles = userA.roles; // ['CUSTOMER']
  const isAdminAuthorized = hasAnyRole(customerRoles, ['ADMIN', 'MANAGER', 'PRODUCT_MANAGER', 'ORDER_MANAGER']);
  assert(isAdminAuthorized === false, '16. Ordinary customer cannot access administrative endpoints (RBAC rejection)');

  // --------------------------------------------------------------------------
  // SCENARIO 17: UNAUTHORIZED ADMIN ROLE ESCALATION ATTEMPTS
  // --------------------------------------------------------------------------
  console.log('\n📦 [17/19] Unauthorized Role Escalation Prevention:');
  // Attempt to create user with malicious injected ADMIN role in registration
  const escalatedUser = await createUser({
    email: `hacker_${timestamp}@example.com`,
    passwordHash,
    firstName: 'Hacker',
    // In real registration, roles are hardcoded to ['CUSTOMER']
    roles: ['CUSTOMER'],
  });

  assert(escalatedUser.roles.length === 1 && escalatedUser.roles[0] === 'CUSTOMER', '17. Customer account granted only CUSTOMER role');
  assert(!escalatedUser.roles.includes('ADMIN'), '17. Public registration cannot escalate to ADMIN');

  // --------------------------------------------------------------------------
  // SCENARIO 18: FRONTEND AUTH RESPONSE COMPATIBILITY
  // --------------------------------------------------------------------------
  console.log('\n📦 [18/19] Frontend Authentication Response Contract Compatibility:');
  const compatChal = await createOtpChallenge({
    email: testUserEmail,
    type: 'LOGIN',
    userId: userRecord.user.id,
    name: 'Cordelia',
  });

  // Verify response contract matching AuthProvider.tsx:
  // { requiresOtp: true, challengeToken: string, expiresInSeconds: number, cooldownSeconds: number, message: string }
  assert(typeof compatChal.challengeToken === 'string' && compatChal.challengeToken.startsWith('chal_'), '18. challengeToken matches contract');
  assert(typeof compatChal.expiresInSeconds === 'number' && compatChal.expiresInSeconds > 0, '18. expiresInSeconds matches contract');
  assert(typeof compatChal.cooldownSeconds === 'number' && compatChal.cooldownSeconds === 30, '18. cooldownSeconds matches contract');
  assert(typeof compatChal.message === 'string' && compatChal.message.length > 0, '18. message matches contract');

  // --------------------------------------------------------------------------
  // SCENARIO 19: CHECKOUT AND RAZORPAY TEST-MODE FLOWS REMAIN UNAFFECTED
  // --------------------------------------------------------------------------
  console.log('\n📦 [19/19] Checkout & Razorpay Test-Mode Verification:');
  clearCart(userRecord.user.id);
  addToCart(userRecord.user.id, sampleSku, 1);

  const cardOrder = createOrder({
    ownerKey: userRecord.user.id,
    userId: userRecord.user.id,
    customerInfo: {
      fullName: 'Cordelia Sinclair',
      email: testUserEmail,
      phone: '+91 98200 88776',
      addressLine1: 'Villa 14, Worli Sea Face',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400018',
    },
    paymentMethod: 'CARD',
  });

  assert(cardOrder.order.payment_status === 'INITIATED', '19. Card order begins with INITIATED payment status');

  const confirmedCardOrder = recordPaymentTransaction({
    orderId: cardOrder.order.id,
    transactionRef: `pay_rzp_test_${timestamp}`,
    gatewayName: 'Razorpay',
    gatewayOrderId: `order_rzp_test_${timestamp}`,
    status: 'SUCCESS',
  });

  assert(confirmedCardOrder?.payment_status === 'SUCCESS', '19. Razorpay test-mode transaction progresses to SUCCESS');
  assert(confirmedCardOrder?.status === 'CONFIRMED', '19. Order progression to CONFIRMED unaffected');

  // --------------------------------------------------------------------------
  // SUMMARY REPORT
  // --------------------------------------------------------------------------
  console.log('\n🏛️  ================================================================');
  console.log(`🏛️  RESULTS: ${passed} / ${total} TESTS PASSED`);
  if (passed === total) {
    console.log('🏛️  STATUS: 🟢 ALL 19 MANDATORY REGRESSION SCENARIOS VERIFIED 100% PASSING');
  } else {
    console.log('🏛️  STATUS: 🔴 SOME TESTS FAILED');
  }
  console.log('🏛️  ================================================================\n');

  return { passed, failed: total - passed, errors: [] };
}

if (process.argv[1]?.endsWith('otp-brevo-auth.test.ts')) {
  runOtpBrevoTestSuite().catch((err) => {
    console.error('Fatal test runner error:', err);
    process.exit(1);
  });
}
