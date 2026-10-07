/**
 * Test script to verify the exact Registration -> Sign-In flow:
 * 1. Register a new user via POST /api/auth/register
 * 2. Verify that registration does NOT automatically set an auth session cookie (User is not logged in)
 * 3. Verify that an unauthenticated request to /api/auth/me returns 401
 * 4. Sign in with the new user's credentials via POST /api/auth/login
 * 5. Verify that login issues the auth session cookie and allows authenticated access
 * 6. Verify authenticated session details from /api/auth/me
 */

async function runRegistrationFlowTest() {
  console.log('\n🏛️  ============================================================');
  console.log('🏛️  TESTING REGISTRATION -> SIGN-IN SEPARATION FLOW');
  console.log('🏛️  ============================================================\n');

  const testEmail = `newpatron_${Date.now()}@example.com`;
  const testPassword = 'VelouraPatron2026!';
  const baseUrl = 'http://localhost:3000';

  console.log(`1. Submitting Registration for: ${testEmail}...`);
  const regRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
      firstName: 'Aurelia',
      lastName: 'Montague',
      phone: '+91 99887 76655',
    }),
  });

  const regData = await regRes.json();
  const regCookies = regRes.headers.get('set-cookie');

  console.log(`   Status: ${regRes.status}`);
  console.log(`   Success: ${regData.success}`);
  console.log(`   Set-Cookie Header: ${regCookies || '(None - User is NOT auto-logged in)'}`);

  if (regRes.status !== 201 || !regData.success) {
    console.error('❌ Registration failed:', regData);
    process.exit(1);
  }

  if (regCookies && regCookies.includes('veloura_auth_token=')) {
    console.error('❌ FAIL: Registration set an auth cookie! Expected no auto-login.');
    process.exit(1);
  } else {
    console.log('   ✅ PASS: Registration did NOT set an auth cookie.');
  }

  console.log('\n2. Verifying user is NOT logged in without signing in...');
  const unauthMeRes = await fetch(`${baseUrl}/api/auth/me`);
  console.log(`   GET /api/auth/me Status: ${unauthMeRes.status}`);
  if (unauthMeRes.status === 401) {
    console.log('   ✅ PASS: Unauthenticated access is rejected with 401.');
  } else {
    console.warn(`   ⚠️ Unexpected status: ${unauthMeRes.status}`);
  }

  console.log('\n3. Signing in with the newly registered credentials...');
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
    }),
  });

  const loginData = await loginRes.json();
  const loginCookie = loginRes.headers.get('set-cookie');

  console.log(`   Status: ${loginRes.status}`);
  console.log(`   Success: ${loginData.success}`);
  console.log(`   Auth Cookie Issued: ${Boolean(loginCookie && loginCookie.includes('veloura_auth_token'))}`);

  if (loginRes.status === 200 && loginData.success && loginCookie?.includes('veloura_auth_token')) {
    console.log('   ✅ PASS: Explicit login succeeded and issued session cookie.');
  } else {
    console.error('❌ FAIL: Login failed:', loginData);
    process.exit(1);
  }

  console.log('\n4. Verifying authenticated access with the session cookie...');
  const authMeRes = await fetch(`${baseUrl}/api/auth/me`, {
    headers: {
      Cookie: loginCookie.split(';')[0],
    },
  });

  const authMeData = await authMeRes.json();
  console.log(`   GET /api/auth/me Status: ${authMeRes.status}`);
  console.log(`   User Email: ${authMeData.data?.user?.email}`);
  console.log(`   Profile Name: ${authMeData.data?.user?.profile?.first_name} ${authMeData.data?.user?.profile?.last_name}`);
  console.log(`   Roles: ${JSON.stringify(authMeData.data?.user?.roles)}`);

  if (authMeRes.status === 200 && authMeData.data?.user?.email === testEmail.toLowerCase()) {
    console.log('   ✅ PASS: Authenticated profile retrieved successfully!');
  } else {
    console.error('❌ FAIL: Could not retrieve profile with session cookie.');
    process.exit(1);
  }

  console.log('\n🏛️  ============================================================');
  console.log('🏛️  STATUS: 🟢 ALL REGISTRATION & SIGN-IN SEPARATION TESTS PASSED');
  console.log('🏛️  ============================================================\n');
}

runRegistrationFlowTest().catch((err) => {
  console.error('Error running test:', err);
  process.exit(1);
});
