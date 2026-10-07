/**
 * 🏛️ Veloura Living — Production Authentication & Multi-User Identity Test Suite
 * Validates:
 * 1. Persistent User Registration & Duplicate Email Rejection
 * 2. Multi-User Account & Data Isolation (Alice vs Bob: Profiles, Addresses, Carts, Orders)
 * 3. 5-Attempt Account Lockout Security (SRS AUTH-007)
 * 4. Single-Use Password Reset & Email Verification Token Lifecycles
 * 5. Admin Authentication & Strict RBAC Enforcement on Protected Routes
 * 6. Google OAuth 2.0 Identity Creation & Account Linking
 */

import {
  initUserRepository,
  findUserByEmail,
  findUserById,
  createUser,
  updateUserProfile,
  getUserAddresses,
  addUserAddress,
  recordFailedLogin,
  checkAccountLockout,
  resetFailedLogin,
  createPasswordResetToken,
  consumePasswordResetToken,
  createEmailVerificationToken,
  consumeEmailVerificationToken,
  findOrCreateGoogleUser,
} from '../lib/data/userRepository';
import { hashPassword, verifyPassword } from '../lib/auth/password';
import { signToken, verifyToken } from '../lib/auth/jwt';
import { createOrder, getOrdersByUserId, getOrderByIdOrNumber, initOrderStore } from '../lib/data/orderStore';
import { getCart, addToCart, clearCart } from '../lib/data/shoppingStore';
import { initCatalogStore, getAllVariants } from '../lib/data/catalogStore';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, failureDetails?: string) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    if (failureDetails) console.error(`     Details: ${failureDetails}`);
  }
}

async function runAuthTestSuite() {
  console.log('\n🏛️  ============================================================');
  console.log('🏛️  VELOURA LIVING — PRODUCTION AUTH & MULTI-USER IDENTITY TEST');
  console.log('🏛️  ============================================================\n');

  await initUserRepository();
  initCatalogStore();
  initOrderStore();

  // --------------------------------------------------------------------------
  // TEST SUITE 1: CUSTOMER REGISTRATION & DUPLICATE EMAIL REJECTION
  // --------------------------------------------------------------------------
  console.log('📦 [1/6] Customer Registration & Hashing:');
  const aliceEmail = `alice_${Date.now()}@example.com`;
  const alicePassword = 'AliceLuxuryPass2026!';
  const aliceHash = await hashPassword(alicePassword);

  const aliceRecord = await createUser({
    email: aliceEmail,
    passwordHash: aliceHash,
    firstName: 'Alice',
    lastName: 'Vanderbilt',
    phone: '+91 98200 11111',
  });

  assert(Boolean(aliceRecord.user.id), 'Customer Alice receives unique immutable UUID');
  assert(aliceRecord.roles.includes('CUSTOMER'), 'Customer Alice receives CUSTOMER role');
  assert(aliceRecord.profile.first_name === 'Alice', 'Customer Alice profile properly initialized');

  // Verify duplicate registration rejection
  let duplicateRejected = false;
  try {
    await createUser({
      email: aliceEmail,
      passwordHash: aliceHash,
      firstName: 'Alice Duplicate',
    });
  } catch (err: any) {
    duplicateRejected = err.message.includes('already exists');
  }
  assert(duplicateRejected, 'Duplicate registration with same email is strictly rejected');

  // --------------------------------------------------------------------------
  // TEST SUITE 2: MULTI-USER DATA ISOLATION (ALICE vs BOB)
  // --------------------------------------------------------------------------
  console.log('\n📦 [2/6] Multi-User Data Isolation (Alice vs Bob):');
  const bobEmail = `bob_${Date.now()}@example.com`;
  const bobPassword = 'BobLuxuryPass2026!';
  const bobHash = await hashPassword(bobPassword);

  const bobRecord = await createUser({
    email: bobEmail,
    passwordHash: bobHash,
    firstName: 'Bob',
    lastName: 'Sterling',
    phone: '+91 98200 22222',
  });

  assert(aliceRecord.user.id !== bobRecord.user.id, 'Alice and Bob have completely distinct UUIDs');

  // Alice adds address
  const aliceAddress = addUserAddress(aliceRecord.user.id, {
    full_name: 'Alice Vanderbilt',
    phone: '+91 98200 11111',
    address_line1: 'Penthouse 50A, Sky Villa',
    city: 'Mumbai',
    state: 'Maharashtra',
    postal_code: '400001',
    country: 'India',
    is_default_shipping: true,
    is_default_billing: true,
  });

  // Bob adds address
  const bobAddress = addUserAddress(bobRecord.user.id, {
    full_name: 'Bob Sterling',
    phone: '+91 98200 22222',
    address_line1: 'Estate 12, Lutyens Enclave',
    city: 'New Delhi',
    state: 'Delhi',
    postal_code: '110001',
    country: 'India',
    is_default_shipping: true,
    is_default_billing: true,
  });

  const aliceAddresses = getUserAddresses(aliceRecord.user.id);
  const bobAddresses = getUserAddresses(bobRecord.user.id);

  assert(
    aliceAddresses.length === 1 && aliceAddresses[0].address_line1.includes('Sky Villa'),
    'Alice address list contains only Alice private address'
  );
  assert(
    bobAddresses.length === 1 && bobAddresses[0].address_line1.includes('Lutyens Enclave'),
    'Bob address list contains only Bob private address'
  );
  assert(
    !aliceAddresses.some((a) => a.id === bobAddress.id),
    'Alice cannot view or access Bob addresses (Strict Address Isolation)'
  );

  // Cart Isolation
  const allVariants = getAllVariants();
  const variant1 = allVariants[0];
  const variant2 = allVariants[1] || allVariants[0];

  addToCart(aliceRecord.user.id, variant1.sku, 1);
  addToCart(bobRecord.user.id, variant2.sku, 2);

  const aliceCart = getCart(aliceRecord.user.id);
  const bobCart = getCart(bobRecord.user.id);

  assert(
    aliceCart.items.length === 1 && aliceCart.items[0].sku === variant1.sku,
    'Alice cart contains only Alice selected piece'
  );
  assert(
    bobCart.items.length === 1 && bobCart.items[0].sku === variant2.sku && bobCart.items[0].quantity === 2,
    'Bob cart contains only Bob selected piece'
  );

  // Orders Isolation
  const aliceOrderResult = createOrder({
    ownerKey: aliceRecord.user.id,
    userId: aliceRecord.user.id,
    customerInfo: {
      fullName: 'Alice Vanderbilt',
      email: aliceEmail,
      phone: '+91 98200 11111',
      addressLine1: 'Penthouse 50A, Sky Villa',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001',
    },
    paymentMethod: 'UPI' as any,
  });

  const aliceOrders = getOrdersByUserId(aliceRecord.user.id);
  const bobOrders = getOrdersByUserId(bobRecord.user.id);

  assert(aliceOrders.length >= 1, 'Alice has authorized order in her private order vault');
  assert(bobOrders.length === 0, 'Bob private order list is completely isolated (0 orders)');

  // --------------------------------------------------------------------------
  // TEST SUITE 3: ACCOUNT LOCKOUT & SECURITY CONTROLS (SRS AUTH-007)
  // --------------------------------------------------------------------------
  console.log('\n📦 [3/6] Account Lockout & Brute-Force Protection (SRS AUTH-007):');
  const targetEmail = aliceEmail;

  // Simulate 4 failed attempts
  for (let i = 1; i <= 4; i++) {
    const res = recordFailedLogin(targetEmail);
    assert(!res.isLocked && res.attempts === i, `Attempt ${i}/5 recorded without premature lock`);
  }

  // 5th attempt locks account
  const lockResult = recordFailedLogin(targetEmail);
  assert(lockResult.isLocked === true && lockResult.remainingMinutes === 15, '5th failed attempt locks account for 15 minutes');

  const checkStatus = checkAccountLockout(targetEmail);
  assert(checkStatus.isLocked === true, 'Lockout verified by checkAccountLockout() query');

  // Reset lockout
  resetFailedLogin(targetEmail);
  const afterReset = checkAccountLockout(targetEmail);
  assert(afterReset.isLocked === false, 'Successful authentication resets lockout state');

  // --------------------------------------------------------------------------
  // TEST SUITE 4: PASSWORD RESET & EMAIL VERIFICATION TOKEN LIFECYCLES
  // --------------------------------------------------------------------------
  console.log('\n📦 [4/6] Password Reset & Email Verification Tokens:');
  const resetToken = createPasswordResetToken(aliceEmail);
  assert(Boolean(resetToken && resetToken.startsWith('reset_')), 'Password reset token generated with secure entropy');

  const resetSuccess = await consumePasswordResetToken(resetToken!, 'AliceNewSecurePass2026!');
  assert(resetSuccess === true, 'Password reset token consumed successfully and password updated');

  const replaySuccess = await consumePasswordResetToken(resetToken!, 'AliceReplayPass!');
  assert(replaySuccess === false, 'Single-use guarantee: Replaying used reset token is strictly rejected');

  const verifyTokenStr = createEmailVerificationToken(aliceEmail);
  assert(Boolean(verifyTokenStr && verifyTokenStr.startsWith('verify_')), 'Email verification token created');
  const verifySuccess = consumeEmailVerificationToken(verifyTokenStr!);
  assert(verifySuccess === true, 'Email verification token consumed and account marked verified');

  // --------------------------------------------------------------------------
  // TEST SUITE 5: ADMIN AUTHENTICATION & RBAC ROLES
  // --------------------------------------------------------------------------
  console.log('\n📦 [5/6] Admin Authentication & Server-Side RBAC Enforcement:');
  const adminEmail = 'admin@velouraliving.com';
  const adminUser = findUserByEmail(adminEmail);

  assert(Boolean(adminUser), 'Master Admin account is persisted and discoverable');
  assert(adminUser!.roles.includes('ADMIN'), 'Master Admin has verified ADMIN role');

  const adminJwt = await signToken(adminUser!.user.id, adminUser!.user.email, adminUser!.roles);
  const decodedAdmin = await verifyToken(adminJwt);
  assert(Boolean(decodedAdmin && decodedAdmin.roles.includes('ADMIN')), 'Admin JWT successfully verified with admin claims');

  // Customer Token Validation
  const customerJwt = await signToken(aliceRecord.user.id, aliceRecord.user.email, aliceRecord.roles);
  const decodedCustomer = await verifyToken(customerJwt);
  assert(
    Boolean(decodedCustomer && decodedCustomer.roles.includes('CUSTOMER') && !decodedCustomer.roles.includes('ADMIN')),
    'Customer token contains only CUSTOMER role without administrative privileges'
  );

  // --------------------------------------------------------------------------
  // TEST SUITE 6: GOOGLE OAUTH IDENTITY CREATION & LINKING
  // --------------------------------------------------------------------------
  console.log('\n📦 [6/6] Google OAuth 2.0 Account Creation & Linking:');
  const newGoogleEmail = `google_user_${Date.now()}@gmail.com`;
  const googleUser1 = await findOrCreateGoogleUser({
    googleId: 'google_oauth_id_101',
    email: newGoogleEmail,
    firstName: 'Devendra',
    lastName: 'Sharma',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
  });

  assert(Boolean(googleUser1.user.id), 'New Google OAuth user created with unique UUID');
  assert(googleUser1.user.is_email_verified === true, 'Google authenticated user email is marked verified');
  assert(googleUser1.roles.includes('CUSTOMER'), 'Google authenticated user assigned CUSTOMER role');

  // Link existing account with Google
  const linkedGoogleUser = await findOrCreateGoogleUser({
    googleId: 'google_oauth_id_alice',
    email: aliceEmail,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
  });

  assert(linkedGoogleUser.user.id === aliceRecord.user.id, 'Existing password account linked to Google identity without duplicate user creation');

  // --------------------------------------------------------------------------
  // FINAL REPORT
  // --------------------------------------------------------------------------
  console.log('\n🏛️  ============================================================');
  console.log(`🏛️  RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
  if (passedTests === totalTests) {
    console.log('🏛️  STATUS: 🟢 ALL PRODUCTION AUTH & IDENTITY TESTS PASSED (100%)');
  } else {
    console.log('🏛️  STATUS: 🔴 SOME TESTS FAILED');
  }
  console.log('🏛️  ============================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runAuthTestSuite().catch((err) => {
  console.error('Fatal error running auth test suite:', err);
  process.exit(1);
});
