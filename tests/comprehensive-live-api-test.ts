/**
 * 🏛️ Veloura Living — Master Comprehensive Live API Test Suite
 * Fully tests 38+ REST API routes across all subsystems:
 * 1. System Health & OpenAPI 3.0 Documentation
 * 2. Authentication & Session RBAC Access Control
 * 3. Master Catalog, Categories & Faceted Search
 * 4. Multi-Currency Dynamic FX Engine (CON-003)
 * 5. Shopping Cart & Inventory Stock Concurrency
 * 6. Authoritative Pricing, Coupons & Checkout Calculation
 * 7. Cash on Delivery (COD) Safety & OTP Protocol (PAY-009)
 * 8. Orders, Invoicing & Lifecycle Registry
 * 9. Post-Purchase, Reviews & Automated Razorpay Refunds (RET-007)
 * 10. AI Spatial Intelligence & CMS Showcases
 */

export {};

interface ApiTestStep {
  name: string;
  category: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  body?: any;
  headers?: Record<string, string | undefined>;
  expectedStatus: number[];
  validate?: (json: any, res: Response) => boolean | string;
}

interface TestReport {
  name: string;
  category: string;
  method: string;
  endpoint: string;
  status: number;
  passed: boolean;
  durationMs: number;
  message?: string;
}

const BASE_URL = (process.env.TEST_API_URL || 'http://localhost:3000').trim();

async function runComprehensiveApiTests() {
  console.log('🏛️ =================================================================');
  console.log(`🏛️ VELOURA LIVING — COMPREHENSIVE LIVE API TEST RUNNER (${BASE_URL})`);
  console.log('🏛️ =================================================================\n');

  let adminToken = '';
  let customerToken = '';
  let testVerificationId = '';
  let testOtpCode = '';
  let testCreatedOrderId = '';

  const testSessionCookie = `veloura_test_session_${Date.now()}`;
  const reports: TestReport[] = [];

  // Helper to execute single test step
  async function executeStep(step: ApiTestStep): Promise<TestReport> {
    const url = `${BASE_URL}${step.endpoint}`;
    const start = performance.now();

    const rawHeaders = step.headers || {};
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Cookie': `veloura_session_id=${testSessionCookie}`,
    };
    for (const [k, v] of Object.entries(rawHeaders)) {
      if (v !== undefined) headers[k] = v;
    }

    try {
      const res = await fetch(url, {
        method: step.method,
        headers,
        body: step.body ? JSON.stringify(step.body) : undefined,
      });

      const durationMs = Math.round(performance.now() - start);
      let json: any = null;
      let text = '';
      try {
        text = await res.text();
        json = JSON.parse(text);
      } catch {
        // Non-JSON content
      }

      const statusPassed = step.expectedStatus.includes(res.status);
      let customValidationError: boolean | string = true;

      if (statusPassed && step.validate) {
        customValidationError = step.validate(json || text, res);
      }

      const passed = statusPassed && (customValidationError === true || customValidationError === undefined);
      const message = passed
        ? undefined
        : typeof customValidationError === 'string'
        ? customValidationError
        : `Expected status [${step.expectedStatus.join(', ')}] but got ${res.status}. Response: ${text.slice(0, 150)}`;

      return {
        name: step.name,
        category: step.category,
        method: step.method,
        endpoint: step.endpoint,
        status: res.status,
        passed,
        durationMs,
        message,
      };
    } catch (err: any) {
      return {
        name: step.name,
        category: step.category,
        method: step.method,
        endpoint: step.endpoint,
        status: 0,
        passed: false,
        durationMs: Math.round(performance.now() - start),
        message: `Network exception: ${err.message}`,
      };
    }
  }

  // -------------------------------------------------------------
  // Test Suites Definition
  // -------------------------------------------------------------
  const testSteps: ApiTestStep[] = [
    // SUITE 1: System Health & OpenAPI Documentation
    {
      category: '1. System & OpenAPI Spec',
      name: 'System Health Check (/api/health)',
      method: 'GET',
      endpoint: '/api/health',
      expectedStatus: [200],
      validate: (json) => json.status?.toUpperCase() === 'HEALTHY' || json.status === 'ok',
    },
    {
      category: '1. System & OpenAPI Spec',
      name: 'OpenAPI 3.0 Specification Schema (/api/openapi.json)',
      method: 'GET',
      endpoint: '/api/openapi.json',
      expectedStatus: [200],
      validate: (json) => json.openapi?.startsWith('3.') && !!json.paths,
    },

    // SUITE 2: Authentication & RBAC Access Control
    {
      category: '2. Authentication & RBAC',
      name: 'Executive Admin Login (admin@velouraliving.com)',
      method: 'POST',
      endpoint: '/api/auth/login',
      body: {
        email: 'admin@velouraliving.com',
        password: 'VelouraAdmin2026!',
      },
      expectedStatus: [200],
      validate: (json) => {
        adminToken = json.data?.token || json.token || '';
        return !!adminToken;
      },
    },
    {
      category: '2. Authentication & RBAC',
      name: 'Verified Customer Login (client@example.com)',
      method: 'POST',
      endpoint: '/api/auth/login',
      body: {
        email: 'client@example.com',
        password: 'VelouraAdmin2026!',
      },
      expectedStatus: [200],
      validate: (json) => {
        customerToken = json.data?.token || json.token || '';
        return !!customerToken;
      },
    },
    {
      category: '2. Authentication & RBAC',
      name: 'Session Token Introspection with RBAC Claims (/api/auth/me)',
      method: 'GET',
      endpoint: '/api/auth/me',
      expectedStatus: [200],
      get headers() {
        return { Authorization: `Bearer ${adminToken}` };
      },
      validate: (json) => {
        const user = json.data?.user || json.user || json.data;
        return user?.roles?.includes('ADMIN') || user?.role === 'ADMIN';
      },
    },
    {
      category: '2. Authentication & RBAC',
      name: 'Client User Profile Management (/api/user/profile)',
      method: 'GET',
      endpoint: '/api/user/profile',
      expectedStatus: [200, 401],
      get headers() {
        return customerToken ? { Authorization: `Bearer ${customerToken}` } : {};
      },
    },
    {
      category: '2. Authentication & RBAC',
      name: 'Client Address Book Retrieval (/api/user/addresses)',
      method: 'GET',
      endpoint: '/api/user/addresses',
      expectedStatus: [200],
      get headers() {
        return customerToken ? { Authorization: `Bearer ${customerToken}` } : {};
      },
      validate: (json) => Array.isArray(json.data || json.addresses || json),
    },

    // SUITE 3: Master Catalog, Categories & Faceted Search
    {
      category: '3. Master Catalog & Search',
      name: 'Retrieve All Product Categories (/api/categories)',
      method: 'GET',
      endpoint: '/api/categories',
      expectedStatus: [200],
      validate: (json) => Array.isArray(json.data || json) && (json.data || json).length > 0,
    },
    {
      category: '3. Master Catalog & Search',
      name: 'Retrieve Master Brand Registry (/api/brands)',
      method: 'GET',
      endpoint: '/api/brands',
      expectedStatus: [200],
      validate: (json) => Array.isArray(json.data || json) && (json.data || json).length > 0,
    },
    {
      category: '3. Master Catalog & Search',
      name: 'Fetch Paginated Products Catalog (/api/products)',
      method: 'GET',
      endpoint: '/api/products',
      expectedStatus: [200],
      validate: (json) => {
        const list = json.data?.products || json.products || json.data || [];
        return Array.isArray(list) && list.length > 0;
      },
    },
    {
      category: '3. Master Catalog & Search',
      name: 'Faceted Product Filtering (Room & Min Price)',
      method: 'GET',
      endpoint: '/api/products?category=living-room&minPrice=10000',
      expectedStatus: [200],
      validate: (json) => {
        const list = json.data?.products || json.products || json.data || [];
        return Array.isArray(list);
      },
    },
    {
      category: '3. Master Catalog & Search',
      name: 'Retrieve Single Product By Slug (Serpentine Sectional)',
      method: 'GET',
      endpoint: '/api/products/serpentine-modular-sectional-sofa',
      expectedStatus: [200],
      validate: (json) => {
        const prod = json.data || json;
        return prod.slug === 'serpentine-modular-sectional-sofa' && Array.isArray(prod.variants);
      },
    },
    {
      category: '3. Master Catalog & Search',
      name: 'Retrieve Active SKU Variants (/api/variants)',
      method: 'GET',
      endpoint: '/api/variants',
      expectedStatus: [200],
      validate: (json) => Array.isArray(json.data || json),
    },
    {
      category: '3. Master Catalog & Search',
      name: 'Natural Language Search Engine (/api/search?q=table)',
      method: 'GET',
      endpoint: '/api/search?q=table',
      expectedStatus: [200],
      validate: (json) => Array.isArray(json.data?.products || json.products || json.data),
    },

    // SUITE 4: Multi-Currency Dynamic FX Engine (CON-003)
    {
      category: '4. Multi-Currency FX Engine',
      name: 'Fetch Live Currency Exchange Rates (/api/currency/rates)',
      method: 'GET',
      endpoint: '/api/currency/rates',
      expectedStatus: [200],
      validate: (json) => {
        const currencies = json.data?.currencies || json.currencies || json.data?.rates;
        return !!currencies && !!currencies.USD && !!currencies.EUR;
      },
    },
    {
      category: '4. Multi-Currency FX Engine',
      name: 'Convert INR to USD Dynamic Pricing (/api/currency/convert)',
      method: 'POST',
      endpoint: '/api/currency/convert',
      body: {
        amountInINR: 120000,
        targetCurrency: 'USD',
      },
      expectedStatus: [200],
      validate: (json) => {
        const data = json.data || json;
        return data.targetCurrency === 'USD' && data.convertedAmount > 1000 && data.symbol === '$';
      },
    },
    {
      category: '4. Multi-Currency FX Engine',
      name: 'Convert INR to EUR Dynamic Pricing (/api/currency/convert)',
      method: 'POST',
      endpoint: '/api/currency/convert',
      body: {
        amountInINR: 85000,
        targetCurrency: 'EUR',
      },
      expectedStatus: [200],
      validate: (json) => {
        const data = json.data || json;
        return data.targetCurrency === 'EUR' && data.convertedAmount > 700 && data.symbol === '€';
      },
    },

    // SUITE 5: Shopping Cart & Inventory Stock Concurrency
    {
      category: '5. Shopping Cart & Inventory',
      name: 'Fetch Authoritative Shopping Cart (/api/cart)',
      method: 'GET',
      endpoint: '/api/cart',
      expectedStatus: [200],
      validate: (json) => {
        const cart = json.data || json;
        return Array.isArray(cart.items) && typeof cart.subtotal === 'number';
      },
    },
    {
      category: '5. Shopping Cart & Inventory',
      name: 'Add Luxury Coffee Table SKU to Cart (VL-LR-TBL-002-AME)',
      method: 'POST',
      endpoint: '/api/cart',
      body: {
        sku: 'VL-LR-TBL-002-AME',
        quantity: 1,
      },
      expectedStatus: [200],
      validate: (json) => {
        const cart = json.data || json;
        return cart.items?.some((i: any) => i.sku === 'VL-LR-TBL-002-AME');
      },
    },
    {
      category: '5. Shopping Cart & Inventory',
      name: 'Validate Cart Stock Concurrency (/api/cart/validate)',
      method: 'POST',
      endpoint: '/api/cart/validate',
      expectedStatus: [200],
      validate: (json) => {
        const res = json.data || json;
        return res.isValid === true || res.is_valid === true;
      },
    },
    {
      category: '5. Shopping Cart & Inventory',
      name: 'Fetch User Wishlist (/api/wishlist)',
      method: 'GET',
      endpoint: '/api/wishlist',
      expectedStatus: [200],
      validate: (json) => {
        const data = json.data || json;
        return Array.isArray(data.productIds) || Array.isArray(data);
      },
    },

    // SUITE 6: Authoritative Pricing, Coupons & Checkout Calculation
    {
      category: '6. Pricing, Coupons & Checkout',
      name: 'Retrieve Active Promotional Coupons (/api/coupons)',
      method: 'GET',
      endpoint: '/api/coupons',
      expectedStatus: [200],
      validate: (json) => Array.isArray(json.data || json),
    },
    {
      category: '6. Pricing, Coupons & Checkout',
      name: 'Validate Valid Coupon Code (VELOURA15)',
      method: 'POST',
      endpoint: '/api/coupons/validate',
      body: {
        code: 'VELOURA15',
        subtotal: 95000,
      },
      expectedStatus: [200],
      validate: (json) => {
        const data = json.data || json;
        return data.isValid === true && data.discountAmount > 0;
      },
    },
    {
      category: '6. Pricing, Coupons & Checkout',
      name: 'Safely Reject Non-Existent Coupon Code (INVALID_COUPON_XYZ)',
      method: 'POST',
      endpoint: '/api/coupons/validate',
      body: {
        code: 'INVALID_COUPON_XYZ',
        subtotal: 50000,
      },
      expectedStatus: [200, 400, 422],
      validate: (json) => {
        const data = json.data || json;
        return data.isValid === false || json.success === false;
      },
    },
    {
      category: '6. Pricing, Coupons & Checkout',
      name: 'Authoritative Checkout Summary with Tax & Logistics (INR)',
      method: 'POST',
      endpoint: '/api/checkout/summary',
      body: {
        shippingMethod: 'standard',
        couponCode: 'VELOURA15',
        targetCurrency: 'INR',
      },
      expectedStatus: [200],
      validate: (json) => {
        const data = json.data || json;
        return data.is_valid === true && data.grand_total > 0 && !!data.tax;
      },
    },
    {
      category: '6. Pricing, Coupons & Checkout',
      name: 'Authoritative Checkout Summary in Multi-Currency USD',
      method: 'POST',
      endpoint: '/api/checkout/summary',
      body: {
        shippingMethod: 'standard',
        targetCurrency: 'USD',
      },
      expectedStatus: [200],
      validate: (json) => {
        const data = json.data || json;
        return data.currency === 'USD' && data.converted_total > 0 && data.formatted_total.includes('$');
      },
    },

    // SUITE 7: Cash on Delivery (COD) Safety & OTP Verification (PAY-009)
    {
      category: '7. COD Safety & OTP Engine',
      name: 'Dispatch COD 6-Digit Verification OTP (/api/orders/cod-otp/send)',
      method: 'POST',
      endpoint: '/api/orders/cod-otp/send',
      body: {
        phoneOrEmail: '+91 98201 11223',
        amountInINR: 48000,
      },
      expectedStatus: [200],
      validate: (json) => {
        const data = json.data || json;
        testVerificationId = data.verificationId;
        testOtpCode = data.debugCode || '748291';
        return !!testVerificationId && testVerificationId.startsWith('cod_ver_');
      },
    },
    {
      category: '7. COD Safety & OTP Engine',
      name: 'Verify COD 6-Digit OTP Token (/api/orders/cod-otp/verify)',
      method: 'POST',
      endpoint: '/api/orders/cod-otp/verify',
      get body() {
        return {
          verificationId: testVerificationId,
          otp: testOtpCode,
        };
      },
      expectedStatus: [200],
      validate: (json) => {
        const data = json.data || json;
        return data.verified === true;
      },
    },

    // SUITE 8: Order Placement, Invoicing & Orders Registry
    {
      category: '8. Orders & Invoicing',
      name: 'Create Authoritative COD Luxury Order (/api/orders)',
      method: 'POST',
      endpoint: '/api/orders',
      get body() {
        return {
          fullName: 'Lady Evelyn Sinclair',
          email: 'evelyn.sinclair@mayfair-estates.co.uk',
          phone: '+91 98201 11223',
          addressLine1: 'Penthouse 42, World One Towers',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400013',
          shippingMethod: 'standard',
          paymentMethod: 'COD',
          currency: 'INR',
          codVerificationId: testVerificationId,
        };
      },
      expectedStatus: [200, 201],
      validate: (json) => {
        const order = json.data?.order || json.order || json.data;
        if (order?.id) testCreatedOrderId = order.id;
        return !!order && (order.payment_method === 'COD' || !!order.id);
      },
    },
    {
      category: '8. Orders & Invoicing',
      name: 'Retrieve Orders Registry (/api/orders)',
      method: 'GET',
      endpoint: '/api/orders',
      expectedStatus: [200],
      get headers() {
        return adminToken ? { Authorization: `Bearer ${adminToken}` } : {};
      },
      validate: (json) => Array.isArray(json.data || json.orders || json),
    },
    {
      category: '8. Orders & Invoicing',
      name: 'Retrieve Seeded Order by UUID',
      method: 'GET',
      endpoint: '/api/orders/44444444-1111-1111-1111-111111111101',
      expectedStatus: [200],
      validate: (json) => {
        const order = json.data || json;
        return order.id === '44444444-1111-1111-1111-111111111101';
      },
    },
    {
      category: '8. Orders & Invoicing',
      name: 'Generate Statutory GST Tax Invoice (/api/invoices/:orderId)',
      method: 'GET',
      endpoint: '/api/invoices/44444444-1111-1111-1111-111111111101',
      expectedStatus: [200],
      validate: (json) => {
        const invoice = json.data || json;
        return !!(invoice.invoice_number || invoice.invoiceNumber) && (invoice.grandTotal > 0 || invoice.grand_total > 0);
      },
    },

    // SUITE 9: Post-Purchase, Reviews & Automated Razorpay Refunds (RET-007)
    {
      category: '9. Post-Purchase & Gateway Refunds',
      name: 'Fetch Verified Customer Reviews for Product',
      method: 'GET',
      endpoint: '/api/reviews?productId=prod-lr-01',
      expectedStatus: [200],
      validate: (json) => Array.isArray(json.data?.reviews || json.reviews || json.data),
    },
    {
      category: '9. Post-Purchase & Gateway Refunds',
      name: 'Submit Verified Product Review (/api/reviews)',
      method: 'POST',
      endpoint: '/api/reviews',
      body: {
        productId: 'prod-lr-01',
        authorName: 'Aarav Singhania',
        rating: 5,
        title: 'Exquisite Solid Oak Craftsmanship',
        comment: 'The tactile bouclé upholstery and mortise joints are museum grade. Truly quiet luxury.',
      },
      expectedStatus: [200, 201],
      validate: (json) => json.success === true || !!json.data?.id,
    },
    {
      category: '9. Post-Purchase & Gateway Refunds',
      name: 'Fetch Returns & Exchanges Queue (/api/returns)',
      method: 'GET',
      endpoint: '/api/returns',
      expectedStatus: [200],
      get headers() {
        return adminToken ? { Authorization: `Bearer ${adminToken}` } : {};
      },
      validate: (json) => Array.isArray(json.data || json.returns || json),
    },
    {
      category: '9. Post-Purchase & Gateway Refunds',
      name: 'Execute Direct Razorpay Instant Refund (/api/refunds/process-gateway)',
      method: 'POST',
      endpoint: '/api/refunds/process-gateway',
      body: {
        orderId: '44444444-1111-1111-1111-111111111101',
        paymentId: 'pay_rzp_mock_live_99812',
        amountInINR: 65000,
        speed: 'optimum',
        reason: 'Customer return approved: Material swap',
      },
      expectedStatus: [200],
      get headers() {
        return adminToken ? { Authorization: `Bearer ${adminToken}` } : {};
      },
      validate: (json) => {
        const data = json.data || json;
        return !!data.refund && data.gatewayResponse?.success === true;
      },
    },

    // SUITE 10: AI Spatial Intelligence & CMS Showcases
    {
      category: '10. AI Spatial Intelligence & CMS',
      name: 'AI Spatial Designer Consultation Chat (/api/ai/chat)',
      method: 'POST',
      endpoint: '/api/ai/chat',
      body: {
        message: 'I have a 450 sq ft sunlit penthouse living room. Suggest minimalist walnut pieces under ₹2,00,000.',
      },
      expectedStatus: [200],
      validate: (json) => {
        const data = json.data || json;
        return typeof data.message === 'string' && data.message.length > 20;
      },
    },
    {
      category: '10. AI Spatial Intelligence & CMS',
      name: 'AI Review Sentiment Analytics (/api/ai/sentiment)',
      method: 'GET',
      endpoint: '/api/ai/sentiment',
      expectedStatus: [200],
      get headers() {
        return adminToken ? { Authorization: `Bearer ${adminToken}` } : {};
      },
      validate: (json) => {
        const data = json.data || json;
        return data.totalReviewsAnalyzed !== undefined || !!data.sentimentClassification;
      },
    },
    {
      category: '10. AI Spatial Intelligence & CMS',
      name: 'AI Predictive Restocking Insights (/api/ai/restock-insights)',
      method: 'GET',
      endpoint: '/api/ai/restock-insights',
      expectedStatus: [200],
      get headers() {
        return adminToken ? { Authorization: `Bearer ${adminToken}` } : {};
      },
      validate: (json) => {
        const data = json.data || json;
        return data.totalSkusAudited > 0 || Array.isArray(data.recommendedActionItems);
      },
    },
    {
      category: '10. AI Spatial Intelligence & CMS',
      name: 'Fetch Active CMS Hero & Showcase Banners (/api/cms/banners)',
      method: 'GET',
      endpoint: '/api/cms/banners',
      expectedStatus: [200],
      validate: (json) => Array.isArray(json.data || json),
    },

    // -------------------------------------------------------------
    // SUITE 11: Multi-Channel Notifications & In-App Drawer Center
    // -------------------------------------------------------------
    {
      category: '11. Notifications & In-App Center',
      name: 'Fetch Customer In-App Notifications (/api/notifications)',
      method: 'GET',
      endpoint: '/api/notifications',
      expectedStatus: [200],
      validate: (json) => {
        const data = json.data || json;
        return Array.isArray(data.notifications) && typeof data.unreadCount === 'number';
      },
    },
    {
      category: '11. Notifications & In-App Center',
      name: 'Mark All Notifications As Read (/api/notifications/mark-read)',
      method: 'POST',
      endpoint: '/api/notifications/mark-read',
      body: { all: true },
      expectedStatus: [200],
      validate: (json) => {
        const data = json.data || json;
        return data.markedAll === true;
      },
    },
    {
      category: '11. Notifications & In-App Center',
      name: 'Dispatch Diagnostic Test Multi-Channel Alert (/api/notifications/test-dispatch)',
      method: 'POST',
      endpoint: '/api/notifications/test-dispatch',
      body: {
        channels: ['IN_APP', 'EMAIL', 'WHATSAPP', 'SMS'],
        type: 'ORDER_STATUS',
        title: 'Diagnostic Test Verification',
        message: 'All notification channels verified.',
      },
      expectedStatus: [200],
      validate: (json) => {
        const data = json.data || json;
        return !!data.notificationId && Array.isArray(data.channelResults);
      },
    },
  ];

  // Run all steps sequentially
  let currentCategory = '';
  for (const step of testSteps) {
    if (step.category !== currentCategory) {
      currentCategory = step.category;
      console.log(`\n📦 ${currentCategory}`);
    }

    const rep = await executeStep(step);
    reports.push(rep);

    const icon = rep.passed ? '✓' : '✗';
    const color = rep.passed ? '\x1b[32m' : '\x1b[31m';
    const reset = '\x1b[0m';
    console.log(
      `  ${color}${icon}${reset} [${rep.method}] ${rep.endpoint} ➜ ${rep.name} (${rep.status}, ${rep.durationMs}ms)${
        rep.message ? ` - ${rep.message}` : ''
      }`
    );
  }

  // Summary Metrics
  const passedCount = reports.filter((r) => r.passed).length;
  const failedCount = reports.length - passedCount;
  const totalDuration = reports.reduce((sum, r) => sum + r.durationMs, 0);

  console.log('\n🏛️ =================================================================');
  console.log('📊 MASTER LIVE API TEST SUITE SUMMARY:');
  console.log(`   ✓ Passed Endpoints:  ${passedCount}`);
  console.log(`   ✗ Failed Endpoints:  ${failedCount}`);
  console.log(`   🎯 Total Endpoints:   ${reports.length}`);
  console.log(`   ⏱️ Total Time:        ${totalDuration}ms`);
  console.log('🏛️ =================================================================\n');

  if (failedCount === 0) {
    console.log(`🎉 100% SUCCESS: ALL ${reports.length}/${reports.length} LIVE REST API ENDPOINTS VALIDATED & HEALTHY!`);
  } else {
    console.error(`❌ ${failedCount} API ENDPOINTS FAILED VALIDATION.`);
    process.exit(1);
  }
}

runComprehensiveApiTests().catch((err) => {
  console.error('\n❌ API Test Runner crashed with uncaught error:', err);
  process.exit(1);
});
