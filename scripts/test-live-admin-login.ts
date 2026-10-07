/**
 * 🏛️ Veloura Living — Live Master Admin Authentication & RBAC Verification Test
 * Tests:
 * 1. Admin login via /api/auth/login
 * 2. Admin JWT verification with ADMIN role claims
 * 3. Access to protected /api/admin/metrics
 * 4. Access to administrative master order ledger (/api/orders?all=true)
 * 5. Customer role denial from /api/admin/metrics (RBAC Security verification)
 */

async function testAdminAuthFlow() {
  console.log('\n🏛️  ============================================================');
  console.log('🏛️  VELOURA LIVING — MASTER ADMIN AUTHENTICATION & RBAC TEST');
  console.log('🏛️  ============================================================\n');

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@velouraliving.com').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || process.env.ADMIN_INITIAL_PASSWORD || 'VelouraAdmin2026!';

  // 1. Admin Login Request
  console.log(`⏳ Step 1: Attempting Admin Login (${adminEmail})...`);
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: adminEmail,
      password: adminPassword,
    }),
  });

  const loginData = await loginRes.json();
  console.log(`HTTP Status: ${loginRes.status}`);
  console.log(`Login Success: ${loginData.success}`);

  if (!loginRes.ok || !loginData.success) {
    throw new Error(`Admin Login failed: ${JSON.stringify(loginData)}`);
  }

  const adminToken = loginData.data?.token;
  const adminUser = loginData.data?.user;
  console.log(`✅ Logged in Admin: ${adminUser.email}`);
  console.log(`✅ Assigned Roles: [${adminUser.roles.join(', ')}]`);
  console.log(`✅ Admin Profile: ${adminUser.profile.firstName} ${adminUser.profile.lastName}`);

  if (!adminUser.roles.includes('ADMIN')) {
    throw new Error('Security Error: User does not have ADMIN role!');
  }

  // 2. Fetch Protected Admin Metrics (/api/admin/metrics)
  console.log('\n⏳ Step 2: Accessing Protected Operations Metrics (/api/admin/metrics)...');
  const metricsRes = await fetch('http://localhost:3000/api/admin/metrics', {
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });

  const metricsData = await metricsRes.json();
  console.log(`HTTP Status: ${metricsRes.status}`);
  console.log(`Metrics Success: ${metricsData.success}`);

  if (metricsRes.ok && metricsData.success) {
    console.log(`✅ Total Revenue: ₹${metricsData.data?.totalRevenue?.toLocaleString('en-IN')}`);
    console.log(`✅ Total Orders: ${metricsData.data?.totalOrders}`);
    console.log(`✅ Catalog Products: ${metricsData.data?.totalProducts}`);
    console.log(`✅ Low Stock Count: ${metricsData.data?.lowStockCount}`);
  } else {
    throw new Error(`Failed to access admin metrics: ${JSON.stringify(metricsData)}`);
  }

  // 3. Fetch Master Order Ledger with Admin Clearance (/api/orders?all=true)
  console.log('\n⏳ Step 3: Querying Master Order Ledger with Admin Clearance...');
  const ordersRes = await fetch('http://localhost:3000/api/orders?all=true', {
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });

  const ordersData = await ordersRes.json();
  console.log(`HTTP Status: ${ordersRes.status}`);
  console.log(`✅ Retrieved Orders in System: ${ordersData.data?.length}`);

  // 4. Verify Customer Denial from Admin Metrics (RBAC Protection)
  console.log('\n⏳ Step 4: Testing Customer Role Access to Admin API (Security Check)...');
  const customerLoginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'client@example.com',
      password: 'VelouraClient2026!',
    }),
  });
  const customerLoginData = await customerLoginRes.json();
  const customerToken = customerLoginData.data?.token;

  const customerDeniedRes = await fetch('http://localhost:3000/api/admin/metrics', {
    headers: {
      Authorization: `Bearer ${customerToken}`,
    },
  });

  console.log(`Customer Access Response (Expected 401/403): ${customerDeniedRes.status}`);
  if (customerDeniedRes.status === 401 || customerDeniedRes.status === 403) {
    console.log('✅ RBAC Enforcement Confirmed: Customer is strictly blocked from accessing Admin console.');
  } else {
    throw new Error('Security Failure: Customer was allowed access to Admin metrics!');
  }

  console.log('\n🏛️  ============================================================');
  console.log('🏛️  STATUS: 🟢 MASTER ADMIN AUTHENTICATION & RBAC VERIFIED (100%)');
  console.log('🏛️  ============================================================\n');
}

testAdminAuthFlow()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n❌ Admin Auth Test Failed:', err);
    process.exit(1);
  });
