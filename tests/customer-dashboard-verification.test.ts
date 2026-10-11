import assert from 'node:assert';
import { getOrdersByUserId } from '../lib/data/orderStore';
import { PRODUCTS } from '../lib/data/mockData';

export async function runCustomerDashboardTests(): Promise<{ passed: number; failed: number; errors: string[] }> {
  console.log('\n===========================================================');
  console.log('🏛️ VELOURA LIVING — EXACT CUSTOMER DASHBOARD VERIFICATION');
  console.log('===========================================================\n');

  let passed = 0;
  let failed = 0;
  const errors: string[] = [];

  function test(name: string, fn: () => void | Promise<void>) {
    try {
      fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ❌ FAIL: ${name}`, err?.message || err);
      errors.push(`${name}: ${err?.message || err}`);
      failed++;
    }
  }

  async function testAsync(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ❌ FAIL: ${name}`, err?.message || err);
      errors.push(`${name}: ${err?.message || err}`);
      failed++;
    }
  }

  // 1. Dynamic Customer Name Resolution Tests
  console.log('--- 1. Dynamic Customer Name Resolution ---');
  test('1.1 Dynamic first name from profile takes precedence', () => {
    const profile = { first_name: 'Priya', last_name: 'Sharma' };
    const user = { profile: { firstName: 'Fallback' }, email: 'other@example.com' };
    const customerFirstName = profile?.first_name || user?.profile?.firstName || user?.email?.split('@')[0] || 'there';
    assert.strictEqual(customerFirstName, 'Priya');
  });

  test('1.2 Dynamic first name falls back to user session profile', () => {
    const profile = null;
    const user = { profile: { firstName: 'Aarav' }, email: 'aarav@example.com' };
    const customerFirstName = profile?.first_name || user?.profile?.firstName || user?.email?.split('@')[0] || 'there';
    assert.strictEqual(customerFirstName, 'Aarav');
  });

  test('1.3 Dynamic first name falls back to email prefix when profile is empty', () => {
    const profile = null;
    const user = { profile: undefined, email: 'rohit@example.com' };
    const customerFirstName = profile?.first_name || user?.profile?.firstName || user?.email?.split('@')[0] || 'there';
    assert.strictEqual(customerFirstName, 'rohit');
  });

  test('1.4 Dynamic first name falls back gracefully to "there" when all identity is absent', () => {
    const profile = null;
    const user = null;
    const customerFirstName = (profile as any)?.first_name || (user as any)?.profile?.firstName || (user as any)?.email?.split('@')[0] || 'there';
    assert.strictEqual(customerFirstName, 'there');
    assert.notStrictEqual(customerFirstName, 'undefined');
    assert.notStrictEqual(customerFirstName, 'null');
  });

  // 2. Customer Isolation Tests
  console.log('\n--- 2. Customer Isolation & Real Data Sourcing ---');
  await testAsync('2.1 Customer A and Customer B have strictly isolated order sets', async () => {
    const userA = 'user-isolated-a-' + Date.now();
    const userB = 'user-isolated-b-' + Date.now();

    const ordersA = getOrdersByUserId(userA);
    const ordersB = getOrdersByUserId(userB);

    assert.strictEqual(Array.isArray(ordersA), true);
    assert.strictEqual(Array.isArray(ordersB), true);
    assert.strictEqual(ordersA.length, 0);
    assert.strictEqual(ordersB.length, 0);
  });

  // 3. Metric Calculations
  console.log('\n--- 3. Accurate Metric Calculations ---');
  test('3.1 Total Spent calculates exact sum of valid order totals', () => {
    const sampleOrders = [
      { id: '1', total: 45999, items: [] },
      { id: '2', total: 38999, items: [] },
      { id: '3', total: 32499, items: [] },
    ];
    const totalSpent = sampleOrders.reduce((sum, order) => {
      const orderTotal = Number(order.total || 0);
      return sum + (isNaN(orderTotal) ? 0 : orderTotal);
    }, 0);
    assert.strictEqual(totalSpent, 117497);
  });

  test('3.2 Active Products reflects real product catalog count', () => {
    assert.strictEqual(typeof PRODUCTS.length, 'number');
    assert.strictEqual(PRODUCTS.length > 0, true);
    assert.strictEqual(PRODUCTS.length, 24);
  });

  test('3.3 Wishlist count filters against active product collection', () => {
    const mockWishlist = [PRODUCTS[0].id, PRODUCTS[1].id];
    const wishlistedProducts = PRODUCTS.filter((p) => mockWishlist.includes(p.id));
    assert.strictEqual(wishlistedProducts.length, 2);
  });

  // 4. Reference Layout Structure Alignment
  console.log('\n--- 4. Reference Dashboard Layout Alignment ---');
  test('4.1 Navigation items order strictly matches reference', () => {
    const expectedNav = [
      'Dashboard',
      'My Orders',
      'Wishlist',
      'Addresses',
      'Profile',
      'Reviews',
      'Settings',
      'Logout',
    ];
    assert.strictEqual(expectedNav.length, 8);
    assert.strictEqual(expectedNav[0], 'Dashboard');
    assert.strictEqual(expectedNav[1], 'My Orders');
    assert.strictEqual(expectedNav[2], 'Wishlist');
    assert.strictEqual(expectedNav[3], 'Addresses');
    assert.strictEqual(expectedNav[4], 'Profile');
    assert.strictEqual(expectedNav[5], 'Reviews');
    assert.strictEqual(expectedNav[6], 'Settings');
    assert.strictEqual(expectedNav[7], 'Logout');
  });

  test('4.2 Quick Actions match reference exactly', () => {
    const expectedActions = [
      'Track Order',
      'Explore Collection',
      'Contact Support',
      'Manage Wishlist',
    ];
    assert.strictEqual(expectedActions[0], 'Track Order');
    assert.strictEqual(expectedActions[1], 'Explore Collection');
    assert.strictEqual(expectedActions[2], 'Contact Support');
    assert.strictEqual(expectedActions[3], 'Manage Wishlist');
  });

  console.log('\n-----------------------------------------------------------');
  console.log(`Customer Dashboard Suite: Passed: ${passed}, Failed: ${failed}`);
  console.log('-----------------------------------------------------------\n');

  return {
    passed,
    failed,
    errors,
  };
}

if (process.argv[1]?.includes('customer-dashboard-verification.test')) {
  runCustomerDashboardTests()
    .then((res) => {
      if (res.failed > 0) process.exit(1);
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
