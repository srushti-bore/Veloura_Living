/**
 * 🏛️ Veloura Living — Complete Direct Live API Test Suite
 * Executes authoritative route validations across all API subsystems.
 */

import { GET as getHealth } from '../app/api/health/route';
import { GET as getOpenApi } from '../app/api/openapi.json/route';
import { POST as authLogin } from '../app/api/auth/login/route';
import { GET as authMe } from '../app/api/auth/me/route';
import { GET as getProfile, PUT as putProfile } from '../app/api/user/profile/route';
import { GET as getAddresses, POST as postAddress } from '../app/api/user/addresses/route';
import { GET as getCategories } from '../app/api/categories/route';
import { GET as getBrands } from '../app/api/brands/route';
import { GET as getProducts } from '../app/api/products/route';
import { GET as getProductBySlug } from '../app/api/products/[slug]/route';
import { GET as getVariants } from '../app/api/variants/route';
import { GET as getSearch } from '../app/api/search/route';
import { GET as getCurrencyRates } from '../app/api/currency/rates/route';
import { POST as postCurrencyConvert } from '../app/api/currency/convert/route';
import { GET as getCart, POST as postCart } from '../app/api/cart/route';
import { POST as postCartValidate } from '../app/api/cart/validate/route';
import { GET as getWishlist } from '../app/api/wishlist/route';
import { GET as getCoupons } from '../app/api/coupons/route';
import { POST as postCouponValidate } from '../app/api/coupons/validate/route';
import { POST as postCheckoutSummary } from '../app/api/checkout/summary/route';
import { POST as postCodOtpSend } from '../app/api/orders/cod-otp/send/route';
import { POST as postCodOtpVerify } from '../app/api/orders/cod-otp/verify/route';
import { GET as getOrders, POST as postOrder } from '../app/api/orders/route';
import { GET as getOrderById } from '../app/api/orders/[id]/route';
import { GET as getInvoice } from '../app/api/invoices/[orderId]/route';
import { GET as getReviews, POST as postReview } from '../app/api/reviews/route';
import { GET as getReturns } from '../app/api/returns/route';
import { POST as postProcessRefund } from '../app/api/refunds/process-gateway/route';
import { GET as getRefunds } from '../app/api/refunds/route';
import { POST as postAiChat } from '../app/api/ai/chat/route';
import { GET as getAiSentiment } from '../app/api/ai/sentiment/route';
import { GET as getAiRestock } from '../app/api/ai/restock-insights/route';
import { GET as getCmsBanners } from '../app/api/cms/banners/route';
import { GET as getNotifications, DELETE as deleteNotification } from '../app/api/notifications/route';
import { POST as postMarkRead } from '../app/api/notifications/mark-read/route';
import { POST as postTestDispatch } from '../app/api/notifications/test-dispatch/route';
import { POST as postTradeRegister } from '../app/api/trade/register/route';
import { GET as getTradeStatus } from '../app/api/trade/status/route';
import { GET as getTradeRfq, POST as postTradeRfq } from '../app/api/trade/rfq/route';
import { GET as getTradeSwatchBox, POST as postTradeSwatchBox } from '../app/api/trade/swatch-box/route';
import { GET as getConciergeBook, POST as postConciergeBook } from '../app/api/concierge/book/route';
import { GET as getTradeQuotation } from '../app/api/trade/quotation/[rfqId]/route';
import { NextRequest } from 'next/server';

interface TestResult {
  category: string;
  name: string;
  method: string;
  endpoint: string;
  status: number;
  expectedStatus: number;
  passed: boolean;
  durationMs: number;
  details?: string;
}

const results: TestResult[] = [];

function makeRequest(
  url: string,
  method: string = 'GET',
  body?: any,
  token?: string,
  cookie?: string
): NextRequest {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (cookie) headers['Cookie'] = cookie;

  return new NextRequest(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
}

async function recordTest(
  category: string,
  name: string,
  method: string,
  endpoint: string,
  expectedStatus: number,
  fn: () => Promise<Response>
) {
  const start = performance.now();
  try {
    const res = await fn();
    const durationMs = Math.round(performance.now() - start);
    let passed = res.status === expectedStatus;
    let details: string | undefined;

    let text = await res.text();
    if (!passed) {
      details = `Expected ${expectedStatus} but got ${res.status}: ${text.slice(0, 100)}`;
    }

    results.push({
      category,
      name,
      method,
      endpoint,
      status: res.status,
      expectedStatus,
      passed,
      durationMs,
      details,
    });
  } catch (err: any) {
    results.push({
      category,
      name,
      method,
      endpoint,
      status: 500,
      expectedStatus,
      passed: false,
      durationMs: Math.round(performance.now() - start),
      details: err.message,
    });
  }
}

async function runAllApiTests() {
  console.log('🏛️ =========================================================================');
  console.log('🏛️ VELOURA LIVING — DIRECT REST API COMPREHENSIVE TEST RUNNER');
  console.log('🏛️ =========================================================================\n');

  let adminToken = '';
  let customerToken = '';
  const testSessionCookie = `veloura_session_id=session_test_${Date.now()}`;

  // 1. System & Spec
  await recordTest('1. System & OpenAPI', 'System Health Check', 'GET', '/api/health', 200, () =>
    getHealth(makeRequest('http://localhost:3000/api/health'))
  );
  await recordTest('1. System & OpenAPI', 'OpenAPI 3.0 Spec Schema', 'GET', '/api/openapi.json', 200, () =>
    getOpenApi()
  );

  // 2. Auth & RBAC
  await recordTest('2. Authentication & RBAC', 'Admin Login', 'POST', '/api/auth/login', 200, async () => {
    const res = await authLogin(
      makeRequest('http://localhost:3000/api/auth/login', 'POST', {
        email: 'admin@velouraliving.com',
        password: 'VelouraAdmin2026!',
      })
    );
    const json = JSON.parse(await res.clone().text());
    adminToken = json.data?.token || '';
    return res;
  });

  await recordTest('2. Authentication & RBAC', 'Customer Login', 'POST', '/api/auth/login', 200, async () => {
    const res = await authLogin(
      makeRequest('http://localhost:3000/api/auth/login', 'POST', {
        email: 'client@example.com',
        password: 'VelouraAdmin2026!',
      })
    );
    const json = JSON.parse(await res.clone().text());
    customerToken = json.data?.token || '';
    return res;
  });

  await recordTest('2. Authentication & RBAC', 'Session Introspection (/api/auth/me)', 'GET', '/api/auth/me', 200, () =>
    authMe(makeRequest('http://localhost:3000/api/auth/me', 'GET', undefined, customerToken))
  );

  await recordTest('2. Authentication & RBAC', 'Client Profile (/api/user/profile)', 'GET', '/api/user/profile', 200, () =>
    getProfile(makeRequest('http://localhost:3000/api/user/profile', 'GET', undefined, customerToken))
  );

  await recordTest('2. Authentication & RBAC', 'Address Book (/api/user/addresses)', 'GET', '/api/user/addresses', 200, () =>
    getAddresses(makeRequest('http://localhost:3000/api/user/addresses', 'GET', undefined, customerToken))
  );

  // 3. Catalog & Search
  await recordTest('3. Catalog & Search', 'Product Categories', 'GET', '/api/categories', 200, () =>
    getCategories(makeRequest('http://localhost:3000/api/categories'))
  );
  await recordTest('3. Catalog & Search', 'Brand Registry', 'GET', '/api/brands', 200, () =>
    getBrands(makeRequest('http://localhost:3000/api/brands'))
  );
  await recordTest('3. Catalog & Search', 'Paginated Catalog', 'GET', '/api/products', 200, () =>
    getProducts(makeRequest('http://localhost:3000/api/products?limit=10'))
  );
  await recordTest('3. Catalog & Search', 'Product by Slug', 'GET', '/api/products/serpentine-modular-sectional-sofa', 200, () =>
    getProductBySlug(makeRequest('http://localhost:3000/api/products/serpentine-modular-sectional-sofa'), {
      params: Promise.resolve({ slug: 'serpentine-modular-sectional-sofa' }),
    })
  );
  await recordTest('3. Catalog & Search', 'SKU Variants List', 'GET', '/api/variants', 200, () =>
    getVariants(makeRequest('http://localhost:3000/api/variants'))
  );
  await recordTest('3. Catalog & Search', 'Natural Language Search', 'GET', '/api/search?q=walnut', 200, () =>
    getSearch(makeRequest('http://localhost:3000/api/search?q=walnut'))
  );

  // 4. Multi-Currency FX Engine
  await recordTest('4. Multi-Currency FX', 'Live Exchange Rates', 'GET', '/api/currency/rates', 200, () =>
    getCurrencyRates(makeRequest('http://localhost:3000/api/currency/rates'))
  );
  await recordTest('4. Multi-Currency FX', 'Convert INR to USD', 'POST', '/api/currency/convert', 200, () =>
    postCurrencyConvert(
      makeRequest('http://localhost:3000/api/currency/convert', 'POST', {
        amountInINR: 120000,
        targetCurrency: 'USD',
      })
    )
  );
  await recordTest('4. Multi-Currency FX', 'Convert INR to EUR', 'POST', '/api/currency/convert', 200, () =>
    postCurrencyConvert(
      makeRequest('http://localhost:3000/api/currency/convert', 'POST', {
        amountInINR: 85000,
        targetCurrency: 'EUR',
      })
    )
  );

  // 5. Cart & Wishlist
  await recordTest('5. Shopping Cart & Inventory', 'Get Authoritative Cart', 'GET', '/api/cart', 200, () =>
    getCart(makeRequest('http://localhost:3000/api/cart', 'GET', undefined, undefined, testSessionCookie))
  );
  await recordTest('5. Shopping Cart & Inventory', 'Add Item to Cart', 'POST', '/api/cart', 200, () =>
    postCart(
      makeRequest(
        'http://localhost:3000/api/cart',
        'POST',
        { sku: 'VL-LR-SF-001-OAT', quantity: 1 },
        undefined,
        testSessionCookie
      )
    )
  );
  await recordTest('5. Shopping Cart & Inventory', 'Validate Cart Stock', 'POST', '/api/cart/validate', 200, () =>
    postCartValidate(
      makeRequest('http://localhost:3000/api/cart/validate', 'POST', undefined, undefined, testSessionCookie)
    )
  );
  await recordTest('5. Shopping Cart & Inventory', 'Get Wishlist', 'GET', '/api/wishlist', 200, () =>
    getWishlist(makeRequest('http://localhost:3000/api/wishlist', 'GET', undefined, customerToken))
  );

  // 6. Pricing & Checkout
  await recordTest('6. Pricing & Checkout', 'Get Active Coupons', 'GET', '/api/coupons', 200, () =>
    getCoupons(makeRequest('http://localhost:3000/api/coupons'))
  );
  await recordTest('6. Pricing & Checkout', 'Validate Valid Coupon (VELOURA15)', 'POST', '/api/coupons/validate', 200, () =>
    postCouponValidate(
      makeRequest('http://localhost:3000/api/coupons/validate', 'POST', {
        code: 'VELOURA15',
        subtotal: 85000,
      })
    )
  );
  await recordTest('6. Pricing & Checkout', 'Checkout Summary (INR)', 'POST', '/api/checkout/summary', 200, () =>
    postCheckoutSummary(
      makeRequest(
        'http://localhost:3000/api/checkout/summary',
        'POST',
        { shippingMethod: 'standard', couponCode: 'VELOURA15' },
        undefined,
        testSessionCookie
      )
    )
  );

  // 7. COD Safety & OTP Protocol
  let testVerificationId = '';
  let testOtpCode = '';
  await recordTest('7. COD Safety & OTP', 'Send COD OTP', 'POST', '/api/orders/cod-otp/send', 200, async () => {
    const res = await postCodOtpSend(
      makeRequest('http://localhost:3000/api/orders/cod-otp/send', 'POST', {
        phoneOrEmail: '+91 98200 12345',
        amountInINR: 85000,
      })
    );
    const json = JSON.parse(await res.clone().text());
    testVerificationId = json.data?.verificationId || '';
    testOtpCode = json.data?.debugCode || '123456';
    return res;
  });

  await recordTest('7. COD Safety & OTP', 'Verify COD OTP Token', 'POST', '/api/orders/cod-otp/verify', 200, () =>
    postCodOtpVerify(
      makeRequest('http://localhost:3000/api/orders/cod-otp/verify', 'POST', {
        verificationId: testVerificationId,
        otp: testOtpCode,
      })
    )
  );

  // 8. Orders & Invoicing
  await recordTest('8. Orders & Invoicing', 'Get Orders Registry', 'GET', '/api/orders', 200, () =>
    getOrders(makeRequest('http://localhost:3000/api/orders', 'GET', undefined, customerToken))
  );
  await recordTest('8. Orders & Invoicing', 'Get Seeded Order by UUID', 'GET', '/api/orders/:id', 200, () =>
    getOrderById(
      makeRequest('http://localhost:3000/api/orders/44444444-1111-1111-1111-111111111101', 'GET', undefined, customerToken),
      { params: Promise.resolve({ id: '44444444-1111-1111-1111-111111111101' }) }
    )
  );
  await recordTest('8. Orders & Invoicing', 'GST Tax Invoice PDF/HTML', 'GET', '/api/invoices/:orderId', 200, () =>
    getInvoice(
      makeRequest('http://localhost:3000/api/invoices/44444444-1111-1111-1111-111111111101'),
      { params: Promise.resolve({ orderId: '44444444-1111-1111-1111-111111111101' }) }
    )
  );

  // 9. Reviews & Refunds
  await recordTest('9. Reviews & Gateway Refunds', 'Product Reviews', 'GET', '/api/reviews', 200, () =>
    getReviews(makeRequest('http://localhost:3000/api/reviews?productId=prod-lr-01'))
  );
  await recordTest('9. Reviews & Gateway Refunds', 'Returns Queue', 'GET', '/api/returns', 200, () =>
    getReturns(makeRequest('http://localhost:3000/api/returns', 'GET', undefined, adminToken))
  );
  await recordTest('9. Reviews & Gateway Refunds', 'Refunds Ledger', 'GET', '/api/refunds', 200, () =>
    getRefunds(makeRequest('http://localhost:3000/api/refunds', 'GET', undefined, adminToken))
  );
  await recordTest('9. Reviews & Gateway Refunds', 'Execute Razorpay Instant Refund', 'POST', '/api/refunds/process-gateway', 200, () =>
    postProcessRefund(
      makeRequest(
        'http://localhost:3000/api/refunds/process-gateway',
        'POST',
        {
          orderId: '44444444-1111-1111-1111-111111111101',
          paymentId: 'pay_sim_direct_test',
          amountInINR: 78000,
          speed: 'optimum',
        },
        adminToken
      )
    )
  );

  // 10. AI Spatial Intelligence & CMS
  await recordTest('10. AI & CMS', 'AI Spatial Consultant Chat', 'POST', '/api/ai/chat', 200, () =>
    postAiChat(
      makeRequest('http://localhost:3000/api/ai/chat', 'POST', {
        message: 'Recommend walnut dining table for 8 guests',
      })
    )
  );
  await recordTest('10. AI & CMS', 'AI Review Sentiment Analytics', 'GET', '/api/ai/sentiment', 200, () =>
    getAiSentiment(makeRequest('http://localhost:3000/api/ai/sentiment', 'GET', undefined, adminToken))
  );
  await recordTest('10. AI & CMS', 'AI Predictive Restocking Insights', 'GET', '/api/ai/restock-insights', 200, () =>
    getAiRestock(makeRequest('http://localhost:3000/api/ai/restock-insights', 'GET', undefined, adminToken))
  );
  await recordTest('10. AI & CMS', 'CMS Hero Banners', 'GET', '/api/cms/banners', 200, () =>
    getCmsBanners(makeRequest('http://localhost:3000/api/cms/banners'))
  );

  // 11. Notifications & In-App Drawer
  await recordTest('11. Notifications & In-App Center', 'Get In-App Notifications', 'GET', '/api/notifications', 200, () =>
    getNotifications(makeRequest('http://localhost:3000/api/notifications', 'GET', undefined, customerToken))
  );
  await recordTest('11. Notifications & In-App Center', 'Mark All Read', 'POST', '/api/notifications/mark-read', 200, () =>
    postMarkRead(
      makeRequest('http://localhost:3000/api/notifications/mark-read', 'POST', { all: true }, customerToken)
    )
  );
  await recordTest('11. Notifications & In-App Center', 'Test Multi-Channel Alert Dispatch', 'POST', '/api/notifications/test-dispatch', 200, () =>
    postTestDispatch(
      makeRequest('http://localhost:3000/api/notifications/test-dispatch', 'POST', {
        title: 'Atelier Test Dispatch',
        message: 'Direct API validation passed.',
      })
    )
  );

  // 12. VIP Concierge & Trade B2B Portal
  await recordTest('12. VIP Trade & Concierge', 'Register Trade Partner', 'POST', '/api/trade/register', 201, () =>
    postTradeRegister(
      makeRequest('http://localhost:3000/api/trade/register', 'POST', {
        businessName: 'Studio Architrave Milan',
        contactPerson: 'Elena Bianchi',
        email: 'trade@studioarchitrave.com',
        phone: '+91 98200 99881',
        tradeRole: 'INTERIOR_DESIGNER',
        gstin: '27AABCS1429B1Z8',
        websiteOrPortfolio: 'https://studioarchitrave.com',
      })
    )
  );
  await recordTest('12. VIP Trade & Concierge', 'Get Trade Partner Status', 'GET', '/api/trade/status?email=trade@studioarchitrave.com', 200, () =>
    getTradeStatus(makeRequest('http://localhost:3000/api/trade/status?email=trade@studioarchitrave.com'))
  );
  await recordTest('12. VIP Trade & Concierge', 'Submit Project RFQ', 'POST', '/api/trade/rfq', 201, () =>
    postTradeRfq(
      makeRequest('http://localhost:3000/api/trade/rfq', 'POST', {
        businessName: 'Studio Architrave Milan',
        contactPerson: 'Elena Bianchi',
        email: 'trade@studioarchitrave.com',
        phone: '+91 98200 99881',
        projectTitle: 'Palazzo Royale Mumbai Penthouse',
        projectLocation: 'Penthouse 48, Worli Seaface, Mumbai',
        targetInstallationDate: '2026-11-15',
        lineItems: [
          {
            productId: 'prod-001',
            productName: 'Serpentine Modular Sectional Sofa',
            sku: 'SOFA-MOD-01',
            quantity: 2,
            unitPrice: 185000,
          },
        ],
      })
    )
  );
  await recordTest('12. VIP Trade & Concierge', 'Get Partner RFQs', 'GET', '/api/trade/rfq?partnerId=trade_partner_001', 200, () =>
    getTradeRfq(makeRequest('http://localhost:3000/api/trade/rfq?partnerId=trade_partner_001'))
  );
  await recordTest('12. VIP Trade & Concierge', 'Order Physical Swatch Box', 'POST', '/api/trade/swatch-box', 201, () =>
    postTradeSwatchBox(
      makeRequest('http://localhost:3000/api/trade/swatch-box', 'POST', {
        businessName: 'Studio Architrave Milan',
        recipientName: 'Elena Bianchi',
        shippingAddress: '42 Luxury Way, Worli',
        city: 'Mumbai',
        postalCode: '400018',
        selectedSwatchIds: ['mat-walnut', 'mat-boucle', 'mat-leather'],
      })
    )
  );
  await recordTest('12. VIP Trade & Concierge', 'Get Swatch Box Orders', 'GET', '/api/trade/swatch-box?partnerId=trade_partner_001', 200, () =>
    getTradeSwatchBox(makeRequest('http://localhost:3000/api/trade/swatch-box?partnerId=trade_partner_001'))
  );
  await recordTest('12. VIP Trade & Concierge', 'Book VIP Concierge Consultation', 'POST', '/api/concierge/book', 201, () =>
    postConciergeBook(
      makeRequest('http://localhost:3000/api/concierge/book', 'POST', {
        clientName: 'Aditya Birla Atelier',
        email: 'trade@studioarchitrave.com',
        phone: '+91 98200 99881',
        serviceType: 'VIRTUAL_CAD',
        scheduledDate: '2026-10-12',
        timeSlot: '15:00',
        locationOrVirtual: 'Virtual Spatial CAD Suite',
        roomDetails: 'Palazzo Seaface 4-bedroom luxury interior',
      })
    )
  );
  await recordTest('12. VIP Trade & Concierge', 'Get Concierge Bookings', 'GET', '/api/concierge/book?email=trade@studioarchitrave.com', 200, () =>
    getConciergeBook(makeRequest('http://localhost:3000/api/concierge/book?email=trade@studioarchitrave.com'))
  );
  await recordTest('12. VIP Trade & Concierge', 'Generate Commercial GST Quotation', 'GET', '/api/trade/quotation/rfq_vl_2026_901', 200, () =>
    getTradeQuotation(makeRequest('http://localhost:3000/api/trade/quotation/rfq_vl_2026_901'), { params: Promise.resolve({ rfqId: 'rfq_vl_2026_901' }) })
  );

  // Print Report Grouped by Category
  const categories = Array.from(new Set(results.map((r) => r.category)));
  let totalPassed = 0;

  for (const cat of categories) {
    console.log(`\n📦 ${cat}`);
    const catResults = results.filter((r) => r.category === cat);
    for (const r of catResults) {
      const icon = r.passed ? '✓' : '✗';
      const color = r.passed ? '\x1b[32m' : '\x1b[31m';
      const reset = '\x1b[0m';
      console.log(
        `  ${color}${icon}${reset} [${r.method}] ${r.endpoint.padEnd(45)} ➜ ${r.name} (${r.status}, ${r.durationMs}ms)${
          r.details ? ` - ${r.details}` : ''
        }`
      );
      if (r.passed) totalPassed++;
    }
  }

  console.log('\n🏛️ =========================================================================');
  console.log('📊 MASTER API TEST RESULTS SUMMARY:');
  console.log(`   ✓ Passed Endpoints:  ${totalPassed}`);
  console.log(`   ✗ Failed Endpoints:  ${results.length - totalPassed}`);
  console.log(`   🎯 Total Endpoints:   ${results.length}`);
  console.log('🏛️ =========================================================================');

  if (totalPassed === results.length) {
    console.log(`\n🎉 ALL ${results.length}/${results.length} API ENDPOINTS PASSED VALIDATION (100% HEALTHY)!`);
  } else {
    process.exit(1);
  }
}

runAllApiTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
