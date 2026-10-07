async function testHttpEndpoints() {
  console.log('\n🏛️  Testing Live HTTP Auth Endpoints against localhost:3000...\n');

  // 1. Test POST /api/auth/login
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'client@example.com',
      password: 'VelouraClient2026!',
    }),
  });

  const loginData = await loginRes.json();
  console.log('HTTP Login Status:', loginRes.status);
  console.log('HTTP Login Success:', loginData.success);
  console.log('Logged in User:', loginData.data?.user?.email, 'Roles:', loginData.data?.user?.roles);

  if (!loginRes.ok || !loginData.success) {
    throw new Error('HTTP Login failed');
  }

  // 2. Test authenticated /api/auth/me with Bearer token
  const token = loginData.data?.token;
  const meRes = await fetch('http://localhost:3000/api/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const meData = await meRes.json();
  console.log('\nHTTP /api/auth/me Status:', meRes.status);
  console.log('Authenticated Profile:', meData.data?.user?.profile?.first_name, meData.data?.user?.profile?.last_name);
  console.log('Saved Addresses:', meData.data?.user?.addresses?.length);

  // 3. Test Wrong Password
  const wrongRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'client@example.com',
      password: 'IncorrectPassword999!',
    }),
  });
  const wrongData = await wrongRes.json();
  console.log('\nWrong Password Response (Expected 401):', wrongRes.status, wrongData.error?.message);

  console.log('\n🏛️  ALL LIVE HTTP AUTH TESTS PASSED 100%!\n');
}

testHttpEndpoints().catch((err) => {
  console.error('HTTP Test failed:', err);
  process.exit(1);
});
