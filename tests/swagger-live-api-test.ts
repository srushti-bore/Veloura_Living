/**
 * 🏛️ Veloura Living — Automated Swagger / OpenAPI Live Endpoint Test Suite
 * Tests all endpoints against live servers (Next.js :3000 and Backend :5000)
 */

export {};

interface TestResult {
  endpoint: string;
  method: string;
  status: number;
  expectedStatus: number[];
  passed: boolean;
  durationMs: number;
  details?: string;
}

const BASE_URL = (process.env.TEST_API_URL || 'http://localhost:3000').trim();

async function testEndpoint(
  method: string,
  path: string,
  options: {
    body?: any;
    headers?: Record<string, string>;
    expectedStatus?: number[];
  } = {}
): Promise<TestResult> {
  const url = `${BASE_URL}${path}`;
  const expectedStatus = options.expectedStatus || [200, 201];
  const start = performance.now();

  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': 'swagger-test-session',
        ...(options.headers || {})
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    const durationMs = Math.round(performance.now() - start);
    const passed = expectedStatus.includes(res.status);
    let details = '';
    try {
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        if (!passed) {
          details = json.error || JSON.stringify(json);
        }
      } catch {
        if (!passed) {
          details = text;
        }
      }
    } catch {
      details = '';
    }

    return {
      endpoint: path,
      method,
      status: res.status,
      expectedStatus,
      passed,
      durationMs,
      details: passed ? undefined : details
    };
  } catch (err: any) {
    return {
      endpoint: path,
      method,
      status: 0,
      expectedStatus,
      passed: false,
      durationMs: Math.round(performance.now() - start),
      details: err.message
    };
  }
}

async function runSwaggerTests() {
  console.log('===========================================================');
  console.log(`🚀 VELOURA LIVING — LIVE SWAGGER API TEST SUITE (${BASE_URL})`);
  console.log('===========================================================\n');

  const results: TestResult[] = [];
  let authToken = '';

  // 1. Health & OpenAPI Spec
  console.log('--- 1. System Health & OpenAPI Spec ---');
  results.push(await testEndpoint('GET', '/api/health'));
  results.push(await testEndpoint('GET', '/api/openapi.json'));

  // 2. Authentication Flow
  console.log('--- 2. Authentication & Session RBAC ---');
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@velouraliving.com',
      password: 'VelouraAdmin2026!'
    })
  });

  if (loginRes.ok) {
    const loginJson = await loginRes.json();
    authToken = loginJson.data?.token || loginJson.token || '';
  }

  results.push({
    endpoint: '/api/auth/login',
    method: 'POST',
    status: loginRes.status,
    expectedStatus: [200],
    passed: loginRes.status === 200,
    durationMs: 15
  });

  if (authToken) {
    results.push(await testEndpoint('GET', '/api/auth/me', {
      headers: { Authorization: `Bearer ${authToken}` }
    }));
  }

  // 3. Catalog & Products
  console.log('--- 3. Products & Catalog Navigation ---');
  results.push(await testEndpoint('GET', '/api/products'));
  results.push(await testEndpoint('GET', '/api/products?category=living-room&minPrice=10000'));
  results.push(await testEndpoint('GET', '/api/products/serpentine-modular-sectional-sofa'));
  results.push(await testEndpoint('GET', '/api/categories'));
  results.push(await testEndpoint('GET', '/api/brands'));

  // 4. Shopping Cart Operations
  console.log('--- 4. Shopping Cart & Inventory ---');
  results.push(await testEndpoint('GET', '/api/cart'));
  results.push(await testEndpoint('POST', '/api/cart', {
    body: { sku: 'VL-LR-SF-001-OAT', quantity: 1 }
  }));

  // 5. Multi-Currency FX Engine
  console.log('--- 5. Multi-Currency FX Engine ---');
  results.push(await testEndpoint('GET', '/api/currency/rates'));
  results.push(await testEndpoint('POST', '/api/currency/convert', {
    body: { amountInINR: 125000, targetCurrency: 'USD' }
  }));

  // 6. Checkout, Coupons & Invoicing
  console.log('--- 6. Checkout, Coupons & Invoicing ---');
  results.push(await testEndpoint('POST', '/api/coupons/validate', {
    body: { code: 'VELOURA15', subtotal: 85000 }
  }));
  results.push(await testEndpoint('POST', '/api/checkout/summary', {
    body: { shippingMethod: 'standard', couponCode: 'VELOURA15' }
  }));
  results.push(await testEndpoint('GET', '/api/invoices/44444444-1111-1111-1111-111111111101'));

  // 7. COD Safety & OTP Protocol
  console.log('--- 7. COD Safety & OTP Protocol ---');
  results.push(await testEndpoint('POST', '/api/orders/cod-otp/send', {
    body: { phone: '+91 98200 12345', amount: 85000 }
  }));

  // 8. Orders, Returns & Gateway Refunds
  console.log('--- 8. Orders, Returns & Gateway Refunds ---');
  results.push(await testEndpoint('GET', '/api/orders', {
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
  }));
  results.push(await testEndpoint('GET', '/api/orders/44444444-1111-1111-1111-111111111101'));
  results.push(await testEndpoint('GET', '/api/reviews?productId=prod-lr-01'));
  results.push(await testEndpoint('GET', '/api/returns', {
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
  }));
  results.push(await testEndpoint('POST', '/api/refunds/process-gateway', {
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    body: {
      orderId: '44444444-1111-1111-1111-111111111101',
      paymentId: 'pay_sim_swagger_01',
      amountInINR: 78000,
      speed: 'optimum',
      reason: 'Swagger live test refund'
    }
  }));

  // 9. Notifications & In-App Center
  console.log('--- 9. Notifications & In-App Center ---');
  results.push(await testEndpoint('GET', '/api/notifications', {
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
  }));
  results.push(await testEndpoint('POST', '/api/notifications/mark-read', {
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    body: { all: true }
  }));
  results.push(await testEndpoint('POST', '/api/notifications/test-dispatch', {
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    body: {
      title: 'Swagger Live Test Alert',
      message: 'All multi-channel notification pipelines active.'
    }
  }));

  // 10. AI Spatial Intelligence
  console.log('--- 10. AI Spatial Intelligence ---');
  results.push(await testEndpoint('POST', '/api/ai/chat', {
    body: { message: 'Recommend solid wood tables for 300 sq ft room' }
  }));

  // Output formatting
  let passedCount = 0;
  for (const r of results) {
    const icon = r.passed ? '✓' : '✗';
    const color = r.passed ? '\x1b[32m' : '\x1b[31m';
    const reset = '\x1b[0m';
    console.log(`  ${color}${icon}${reset} [${r.method}] ${r.endpoint} ➜ Status ${r.status} (${r.durationMs}ms)${r.details ? ` - ${r.details}` : ''}`);
    if (r.passed) passedCount++;
  }

  console.log('\n===========================================================');
  console.log(`📊 SWAGGER LIVE TEST SUMMARY:`);
  console.log(`   ✓ Passed: ${passedCount}`);
  console.log(`   ✗ Failed: ${results.length - passedCount}`);
  console.log(`   🎯 Total:  ${results.length}`);
  console.log('===========================================================');

  if (passedCount === results.length) {
    console.log('🎉 ALL SWAGGER API ENDPOINTS TESTED & RESPONDING 100% HEALTHY!');
  } else {
    process.exit(1);
  }
}

runSwaggerTests();
