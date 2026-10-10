/**
 * 🏛️ Veloura Living — Standalone Production Backend HTTP/REST Server
 * Reference: docs/Veloura_Living_SRS.md (Deployment & Backend Architecture, Section 33, 40)
 */

try {
  // Automatically load local .env and root .env into process.env if present (Node.js built-in)
  (process as any).loadEnvFile?.();
} catch {}
try {
  const path = require('path');
  const rootEnv = path.resolve(__dirname, '../../.env');
  (process as any).loadEnvFile?.(rootEnv);
} catch {}

import http from 'http';
import { parse } from 'url';
import { initAuthStore, findUserByEmail, findUserById, saveUserRecord, UserRecord } from './data/authStore';
import { initCatalogStore, getProducts, getProductBySlugOrId, getCategories, getBrands, getVariantBySku, updateVariantStock } from './data/catalogStore';
import { getCart, addToCart, updateCartItemQuantity, removeFromCart, clearCart } from './data/shoppingStore';
import { calculateAuthoritativeCheckout, getCoupons, validateCoupon } from './data/pricingStore';
import { initOrderStore, createOrder, getOrderById, getAllOrders, getOrdersByUserId, updateOrderStatus, sanitizeOrderForGuest } from './data/orderStore';
import { initPostPurchaseStore, getReviews, createReview, getReturns, createReturnRequest, updateReturnStatus, getRefunds, createRefundRecord, cancelOrderAuthoritative } from './data/postPurchaseStore';
import { initCmsStore, getCmsBanners, createCmsBanner } from './data/cmsStore';
import { initNotificationStore, getNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification, clearAllNotifications } from './data/notificationStore';
import { notificationService } from './services/notificationService';
import { hashPassword, verifyPassword } from './auth/password';
import { signToken, verifyToken } from './auth/jwt';
import { parseAuthToken } from './auth/session';
import { hasAnyRole } from './auth/rbac';
import { createOtpChallenge, verifyOtpChallenge, resendOtpChallenge } from './auth/otpService';
import { savePendingRegistration, consumePendingRegistration } from './auth/pendingRegistrationStore';
import { generateGstInvoiceForOrder } from './services/invoiceService';
import { formatSuccessResponse, formatErrorResponse } from './api/response';
import { currencyEngine } from './services/currencyEngine';
import { razorpayService } from './services/razorpayService';
import { codSafetyService } from './services/codService';

// Initialize in-memory storage singletons
initAuthStore();
initCatalogStore();
initOrderStore();
initPostPurchaseStore();
initCmsStore();
initNotificationStore();

const PORT = process.env.PORT || 5000;

function sendJson(res: http.ServerResponse, statusCode: number, data: any) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Session-ID, X-Idempotency-Key',
  });
  res.end(JSON.stringify(data));
}

function parseRequestBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = parse(req.url || '', true);
  const pathname = parsedUrl.pathname || '/';
  const method = req.method?.toUpperCase() || 'GET';
  const query = parsedUrl.query;

  // Handle CORS Preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Session-ID, X-Idempotency-Key',
    });
    return res.end();
  }

  // Parse User Session from Bearer Token
  const authHeader = req.headers['authorization'];
  const session = await parseAuthToken(authHeader);

  try {
    // 0. Swagger OpenAPI Spec & Interactive Documentation
    if (pathname === '/api/openapi.json') {
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      return res.end(JSON.stringify({
        openapi: "3.0.0",
        info: {
          title: "Veloura Living Standalone Backend REST API",
          version: "1.1.0",
          description: "Production Standalone REST API endpoints for Veloura Living on Port 5000."
        },
        servers: [{ url: "http://localhost:5000" }, { url: "http://localhost:3000" }]
      }));
    }

    if (pathname === '/docs') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(`<!DOCTYPE html>
<html>
<head>
  <title>Veloura Living Backend API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui.css">
  <style>body { margin: 0; background: #faf7f2; font-family: sans-serif; }</style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui-bundle.js"></script>
  <script>
    window.onload = () => {
      SwaggerUIBundle({
        url: '/api/openapi.json',
        dom_id: '#swagger-ui',
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
        layout: 'BaseLayout'
      });
    };
  </script>
</body>
</html>`);
    }

    // 1. Health Check
    if (pathname === '/' || pathname === '/api/health') {
      return sendJson(res, 200, formatSuccessResponse({
        service: 'Veloura Living REST API Backend',
        status: 'ONLINE',
        version: '2026.1.0',
        timestamp: new Date().toISOString(),
      }));
    }

    // 2. Authentication
    if (pathname === '/api/auth/register' && method === 'POST') {
      const body = await parseRequestBody(req);
      const { email, password, firstName, lastName, phone } = body;

      if (!email || !password || password.length < 8) {
        return sendJson(res, 400, formatErrorResponse('Valid email and password (min 8 chars) required.'));
      }

      const existing = findUserByEmail(email);
      if (existing && existing.user.is_email_verified) {
        return sendJson(res, 409, formatErrorResponse('An account with this email address already exists. Please sign in instead.', 'CONFLICT'));
      }

      const userId = crypto.randomUUID();
      const passwordHash = await hashPassword(password);
      const now = new Date().toISOString();

      const userRecord = {
        user: {
          id: userId,
          email: email.toLowerCase().trim(),
          password_hash: passwordHash,
          status: 'ACTIVE' as const,
          is_email_verified: false,
          created_at: now,
          updated_at: now,
        },
        roles: ['CUSTOMER' as const],
        profile: {
          user_id: userId,
          first_name: firstName || '',
          last_name: lastName || '',
          phone: phone || '',
          preferred_currency: 'INR',
          created_at: now,
          updated_at: now,
        },
        addresses: [],
      };

      // Do NOT save to DB yet — only persist upon successful OTP verification
      const pending = savePendingRegistration({
        email: userRecord.user.email,
        passwordHash,
        firstName: firstName || '',
        lastName: lastName || '',
        phone: phone || '',
      });

      const challenge = await createOtpChallenge({
        email: userRecord.user.email,
        type: 'REGISTER',
        userId,
        name: firstName,
        metadata: { pendingRegistrationId: pending.id },
      });

      if (!challenge.emailDispatched || !challenge.challengeToken) {
        return sendJson(res, 502, formatErrorResponse('Unable to deliver verification code. Please check your email or try again shortly.', 'EMAIL_DISPATCH_FAILED'));
      }

      return sendJson(res, 201, formatSuccessResponse({
        user: {
          id: userId,
          email,
          roles: ['CUSTOMER'],
          status: 'ACTIVE',
          profile: { firstName, lastName },
        },
        requiresOtp: true,
        challengeToken: challenge.challengeToken,
        expiresInSeconds: challenge.expiresInSeconds,
        cooldownSeconds: challenge.cooldownSeconds,
        message: 'Account created. Verification code dispatched to your email.',
      }));
    }

    if (pathname === '/api/auth/login' && method === 'POST') {
      const body = await parseRequestBody(req);
      const { email, password } = body;

      const record = findUserByEmail(email);
      if (!record || !(await verifyPassword(password, record.user.password_hash))) {
        return sendJson(res, 401, formatErrorResponse('Invalid credentials.', 'UNAUTHORIZED'));
      }

      const challenge = await createOtpChallenge({
        email: record.user.email,
        type: 'LOGIN',
        userId: record.user.id,
        name: record.profile?.first_name,
      });

      if (!challenge.emailDispatched || !challenge.challengeToken) {
        return sendJson(res, 502, formatErrorResponse('Unable to deliver verification code. Please check your email or try again shortly.', 'EMAIL_DISPATCH_FAILED'));
      }

      return sendJson(res, 200, formatSuccessResponse({
        requiresOtp: true,
        challengeToken: challenge.challengeToken,
        email: record.user.email,
        expiresInSeconds: challenge.expiresInSeconds,
        cooldownSeconds: challenge.cooldownSeconds,
        message: challenge.message,
      }));
    }

    if (pathname === '/api/auth/verify-otp' && method === 'POST') {
      const body = await parseRequestBody(req);
      const { email, challengeToken, otp, type } = body;

      if (!email || !challengeToken || !otp) {
        return sendJson(res, 400, formatErrorResponse('Email, challenge token, and 6-digit OTP are required.'));
      }

      const verifyResult = await verifyOtpChallenge({ email, challengeToken, otp, expectedType: type });
      if (!verifyResult.success) {
        return sendJson(res, 400, formatErrorResponse(verifyResult.error || 'Invalid OTP code.', verifyResult.code || 'OTP_ERROR'));
      }

      let record: UserRecord | undefined = findUserByEmail(email);
      if (verifyResult.type === 'REGISTER') {
        const pendingId = verifyResult.metadata?.pendingRegistrationId;
        const pending = pendingId ? consumePendingRegistration(pendingId) : null;
        if (pending) {
          if (record && record.user.is_email_verified) {
            return sendJson(res, 409, formatErrorResponse('This account is already registered and verified. Please sign in instead.', 'CONFLICT'));
          }
          const now = new Date().toISOString();
          const userId = crypto.randomUUID();
          const newRecord: UserRecord = {
            user: {
              id: userId,
              email: pending.email.toLowerCase().trim(),
              password_hash: pending.passwordHash,
              status: 'ACTIVE',
              is_email_verified: true,
              created_at: now,
              updated_at: now,
            },
            roles: ['CUSTOMER'],
            profile: {
              user_id: userId,
              first_name: pending.firstName,
              last_name: pending.lastName,
              phone: pending.phone,
              preferred_currency: 'INR',
              created_at: now,
              updated_at: now,
            },
            addresses: [],
          };
          saveUserRecord(newRecord);
          record = newRecord;
        } else if (!record && verifyResult.metadata?.pendingRecord) {
          const pr = verifyResult.metadata.pendingRecord as UserRecord;
          pr.user.is_email_verified = true;
          pr.user.created_at = new Date().toISOString();
          pr.user.updated_at = new Date().toISOString();
          saveUserRecord(pr);
          record = pr;
        } else if (record && !record.user.is_email_verified) {
          record.user.is_email_verified = true;
          record.user.updated_at = new Date().toISOString();
          saveUserRecord(record);
        } else if (record && record.user.is_email_verified) {
          return sendJson(res, 409, formatErrorResponse('This account is already registered and verified. Please sign in instead.', 'CONFLICT'));
        } else {
          return sendJson(res, 400, formatErrorResponse('Pending registration expired or not found. Please register again.', 'VALIDATION_ERROR'));
        }
      } else if (verifyResult.type === 'LOGIN') {
        if (!record) {
          return sendJson(res, 401, formatErrorResponse('User profile not found for this login session.', 'UNAUTHORIZED'));
        }
        if (record.user.status === 'SUSPENDED') {
          return sendJson(res, 401, formatErrorResponse('Your account has been suspended. Please contact concierge support.', 'UNAUTHORIZED'));
        }
        if (!record.user.is_email_verified) {
          record.user.is_email_verified = true;
          record.user.updated_at = new Date().toISOString();
          saveUserRecord(record);
        }
      }

      if (!record) {
        return sendJson(res, 404, formatErrorResponse('User profile not found.'));
      }

      const token = await signToken(record.user.id, record.user.email, record.roles);

      return sendJson(res, 200, formatSuccessResponse({
        user: {
          id: record.user.id,
          email: record.user.email,
          roles: record.roles,
          status: record.user.status,
          profile: {
            firstName: record.profile?.first_name,
            lastName: record.profile?.last_name,
            avatarUrl: record.profile?.avatar_url,
          },
        },
        token,
      }));
    }

    if (pathname === '/api/auth/resend-otp' && method === 'POST') {
      const body = await parseRequestBody(req);
      const { email, challengeToken } = body;

      if (!email || !challengeToken) {
        return sendJson(res, 400, formatErrorResponse('Email and challenge token are required.'));
      }

      const resendResult = await resendOtpChallenge({ email, challengeToken });
      if (!resendResult.success) {
        return sendJson(res, 429, formatErrorResponse(resendResult.error || 'Cooldown active.', 'COOLDOWN_ACTIVE'));
      }

      return sendJson(res, 200, formatSuccessResponse({
        message: resendResult.message,
        cooldownSeconds: resendResult.cooldownSeconds,
        challengeToken: resendResult.challengeToken,
      }));
    }

    if (pathname === '/api/auth/me' && method === 'GET') {
      if (!session) {
        return sendJson(res, 401, formatErrorResponse('Unauthorized.', 'UNAUTHORIZED'));
      }
      return sendJson(res, 200, formatSuccessResponse(session));
    }

    // 3. Products & Catalog
    if (pathname === '/api/products' && method === 'GET') {
      const category = query.category as string;
      const room = query.room as string;
      const minPrice = query.minPrice ? Number(query.minPrice) : undefined;
      const maxPrice = query.maxPrice ? Number(query.maxPrice) : undefined;
      const search = query.search as string;
      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 20;

      const result = getProducts({ category, room, minPrice, maxPrice, search }, { page, limit });
      return sendJson(res, 200, formatSuccessResponse(result.products, {
        page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      }));
    }

    if (pathname.startsWith('/api/products/') && method === 'GET') {
      const slug = pathname.replace('/api/products/', '');
      const product = getProductBySlugOrId(slug);
      if (!product) {
        return sendJson(res, 404, formatErrorResponse(`Product ${slug} not found.`, 'NOT_FOUND'));
      }
      return sendJson(res, 200, formatSuccessResponse(product));
    }

    if (pathname === '/api/categories' && method === 'GET') {
      return sendJson(res, 200, formatSuccessResponse(getCategories()));
    }

    if (pathname === '/api/brands' && method === 'GET') {
      return sendJson(res, 200, formatSuccessResponse(getBrands()));
    }

    // 4. Shopping Cart
    const ownerKey = session?.id || (req.headers['x-session-id'] as string) || 'default_session';

    if (pathname === '/api/cart' && method === 'GET') {
      const cart = getCart(ownerKey);
      return sendJson(res, 200, formatSuccessResponse(cart));
    }

    if (pathname === '/api/cart' && method === 'POST') {
      const body = await parseRequestBody(req);
      const { sku, quantity = 1 } = body;
      if (!sku) return sendJson(res, 400, formatErrorResponse('SKU is required.'));

      const result = addToCart(ownerKey, sku, Number(quantity));
      if (result.error) return sendJson(res, 400, formatErrorResponse(result.error));

      return sendJson(res, 200, formatSuccessResponse(result.cart));
    }

    // 5. Checkout & Pricing
    if (pathname === '/api/currency/rates' && method === 'GET') {
      return sendJson(res, 200, formatSuccessResponse(currencyEngine.getRatesSummary()));
    }

    if (pathname === '/api/currency/convert' && method === 'POST') {
      const body = await parseRequestBody(req);
      const { amountInINR, targetCurrency = 'INR' } = body;
      const converted = currencyEngine.convertFromINR(Number(amountInINR || 0), targetCurrency);
      const formatted = currencyEngine.formatPrice(Number(amountInINR || 0), targetCurrency);
      const config = currencyEngine.getCurrency(targetCurrency);
      return sendJson(res, 200, formatSuccessResponse({
        amountInINR,
        targetCurrency: config.code,
        convertedAmount: converted,
        formattedPrice: formatted,
        rate: config.rateFromINR,
      }));
    }

    if (pathname === '/api/orders/cod-otp/send' && method === 'POST') {
      const body = await parseRequestBody(req);
      const { phoneOrEmail, amountInINR, postalCode } = body;
      if (!phoneOrEmail) return sendJson(res, 400, formatErrorResponse('phoneOrEmail is required'));
      if (amountInINR !== undefined) {
        const eligibility = codSafetyService.checkEligibility(Number(amountInINR), postalCode);
        if (!eligibility.eligible) {
          return sendJson(res, 400, formatErrorResponse(eligibility.reason || 'Not eligible for COD'));
        }
      }
      const otpRes = codSafetyService.generateOtp(phoneOrEmail);
      return sendJson(res, 200, formatSuccessResponse({
        verificationId: otpRes.verificationId,
        expiresAt: otpRes.expiresAt,
        message: `6-digit verification code sent to ${phoneOrEmail}`,
        debugCode: otpRes.otp,
      }));
    }

    if (pathname === '/api/orders/cod-otp/verify' && method === 'POST') {
      const body = await parseRequestBody(req);
      const { verificationId, otp } = body;
      if (!verificationId || !otp) return sendJson(res, 400, formatErrorResponse('verificationId and otp required'));
      const verRes = codSafetyService.verifyOtp(verificationId, otp);
      if (!verRes.verified) return sendJson(res, 400, formatErrorResponse(verRes.message));
      return sendJson(res, 200, formatSuccessResponse({ verified: true, message: verRes.message }));
    }

    if (pathname === '/api/coupons/validate' && method === 'POST') {
      const body = await parseRequestBody(req);
      const { code, subtotal = 0 } = body;
      const val = validateCoupon(code, Number(subtotal), session?.id);
      return sendJson(res, 200, formatSuccessResponse(val));
    }

    if (pathname === '/api/checkout/summary' && method === 'POST') {
      const body = await parseRequestBody(req);
      const { shippingMethod = 'standard', couponCode, paymentMethod, targetCurrency } = body;
      const summary = calculateAuthoritativeCheckout({
        ownerKey,
        shippingMethod,
        couponCode,
        paymentMethod,
        targetCurrency,
      });
      return sendJson(res, 200, formatSuccessResponse(summary));
    }

    // 6. Orders
    if (pathname === '/api/orders' && method === 'GET') {
      if (session && hasAnyRole(session.roles, ['ADMIN', 'MANAGER', 'ORDER_MANAGER']) && query.all === 'true') {
        const result = getAllOrders();
        return sendJson(res, 200, formatSuccessResponse(result.orders));
      }
      const userOrders = session ? getOrdersByUserId(session.id) : [];
      return sendJson(res, 200, formatSuccessResponse(userOrders));
    }

    if (pathname === '/api/orders' && method === 'POST') {
      const body = await parseRequestBody(req);
      const result = createOrder({
        ownerKey,
        userId: session?.id,
        customerInfo: body,
        shippingMethod: body.shippingMethod || 'standard',
        paymentMethod: body.paymentMethod || 'UPI',
        couponCode: body.couponCode,
        currency: body.currency || 'INR',
        codVerificationId: body.codVerificationId,
        customerNotes: body.customerNotes,
      });

      if (result.error) return sendJson(res, 400, formatErrorResponse(result.error));
      return sendJson(res, 201, formatSuccessResponse(result.order));
    }

    if (pathname.startsWith('/api/orders/') && pathname.endsWith('/cancel') && method === 'POST') {
      const orderId = pathname.replace('/api/orders/', '').replace('/cancel', '');
      const body = await parseRequestBody(req);
      const userId = session?.id || '33333333-3333-3333-3333-333333333303';
      const isAdmin = session ? hasAnyRole(session.roles, ['ADMIN', 'MANAGER', 'ORDER_MANAGER']) : false;

      const result = cancelOrderAuthoritative({
        orderId,
        userId,
        reason: body.reason || 'Client request',
        isAdmin,
      });
      return sendJson(res, 200, formatSuccessResponse(result));
    }

    if (pathname.startsWith('/api/orders/') && method === 'GET') {
      const orderId = pathname.replace('/api/orders/', '');
      const order = getOrderById(orderId);
      if (!order) return sendJson(res, 404, formatErrorResponse(`Order ${orderId} not found.`, 'NOT_FOUND'));

      const isStaff = session && hasAnyRole(session.roles, ['ADMIN', 'MANAGER', 'ORDER_MANAGER']);
      if (isStaff) {
        return sendJson(res, 200, formatSuccessResponse(order));
      }

      if (session && order.user_id && order.user_id === session.id) {
        return sendJson(res, 200, formatSuccessResponse(order));
      }

      const guestToken = (query.token as string) || (req.headers['x-guest-tracking-token'] as string);
      if (guestToken && order.guest_access_token && guestToken === order.guest_access_token) {
        const trackingEmail = (query.email as string)?.toLowerCase().trim();
        const trackingPhone = (query.phone as string)?.trim();
        const customer = order.customer_info;
        if (trackingEmail && customer && customer.email.toLowerCase().trim() !== trackingEmail) {
          return sendJson(res, 403, formatErrorResponse('Tracking credentials do not match order records.', 'FORBIDDEN'));
        }
        if (trackingPhone && customer && customer.phone.replace(/\s+/g, '') !== trackingPhone.replace(/\s+/g, '')) {
          return sendJson(res, 403, formatErrorResponse('Tracking credentials do not match order records.', 'FORBIDDEN'));
        }
        return sendJson(res, 200, formatSuccessResponse(sanitizeOrderForGuest(order)));
      }

      return sendJson(res, 403, formatErrorResponse('Access Denied: Valid guest access token or authenticated customer login required.', 'FORBIDDEN'));
    }

    // 6.1 Invoices
    if (pathname.startsWith('/api/invoices/') && method === 'GET') {
      const orderId = pathname.replace('/api/invoices/', '');
      const invoice = generateGstInvoiceForOrder(orderId);
      if (!invoice) return sendJson(res, 404, formatErrorResponse(`Invoice for order ${orderId} not found.`, 'NOT_FOUND'));
      return sendJson(res, 200, formatSuccessResponse(invoice));
    }

    // 7. Reviews
    if (pathname === '/api/reviews' && method === 'GET') {
      const productId = query.productId as string;
      const result = getReviews({ productId });
      return sendJson(res, 200, formatSuccessResponse(result));
    }

    if (pathname === '/api/reviews' && method === 'POST') {
      const body = await parseRequestBody(req);
      const userId = session?.id || '33333333-3333-3333-3333-333333333303';
      const review = createReview({
        productId: body.productId,
        userId,
        userName: body.userName || 'Veloura Client',
        rating: Number(body.rating),
        title: body.title,
        comment: body.comment,
        images: body.images,
      });
      return sendJson(res, 201, formatSuccessResponse(review));
    }

    // 8. Returns & Refunds
    if (pathname === '/api/returns' && method === 'GET') {
      const result = getReturns({ userId: session?.id });
      return sendJson(res, 200, formatSuccessResponse(result.returns));
    }

    if (pathname === '/api/returns' && method === 'POST') {
      const body = await parseRequestBody(req);
      const userId = session?.id || '33333333-3333-3333-3333-333333333303';
      const ret = createReturnRequest({
        orderId: body.orderId,
        userId,
        reason: body.reason,
        condition: body.condition,
      });
      return sendJson(res, 201, formatSuccessResponse(ret));
    }

    if (pathname === '/api/refunds/process-gateway' && method === 'POST') {
      const body = await parseRequestBody(req);
      const { orderId, returnId, amountInINR, paymentId, speed = 'optimum', reason } = body;
      if (!orderId || !amountInINR) return sendJson(res, 400, formatErrorResponse('orderId and amountInINR required'));

      const gatewayResult = await razorpayService.processDirectRefund({
        paymentId: paymentId || 'pay_system_generated',
        amountInINR: Number(amountInINR),
        speed,
        reason,
      });

      const refundRecord = createRefundRecord({
        returnId,
        orderId,
        paymentId: paymentId || 'pay_system_generated',
        amount: Number(amountInINR),
        reason: reason || 'Automated Refund',
      });
      refundRecord.gateway_refund_id = gatewayResult.refundId;

      return sendJson(res, 200, formatSuccessResponse({
        refund: refundRecord,
        gatewayResponse: gatewayResult,
        message: `Refund of ₹${amountInINR} processed via Razorpay.`,
      }));
    }

    if (pathname === '/api/refunds' && method === 'GET') {
      return sendJson(res, 200, formatSuccessResponse(getRefunds({})));
    }


    // 9. CMS & Banners
    if (pathname === '/api/cms/banners' && method === 'GET') {
      return sendJson(res, 200, formatSuccessResponse(getCmsBanners()));
    }

    // 10. AI Chat & Restock Insights
    if (pathname === '/api/ai/chat' && method === 'POST') {
      const body = await parseRequestBody(req);
      const prompt = (body.message || '').toLowerCase();
      const { products } = getProducts({}, { limit: 4 });

      return sendJson(res, 200, formatSuccessResponse({
        message: 'For your space, we recommend pairing sculpted bouclé textures with warm Japanese Walnut.',
        roomTip: 'Maintain 45 cm clearance between coffee tables and lounge perimeters.',
        paletteSuggestion: ['#4A2C1A', '#A9794F', '#D8B486', '#FAF7F2'],
        recommendedProducts: products.slice(0, 3),
      }));
    }

    // 11. Notifications (Multi-Channel & In-App Center)
    if (pathname === '/api/notifications' && method === 'GET') {
      const ownerKey = session?.id || session?.email || 'default_session';
      const result = getNotifications(ownerKey, {
        limit: Number(parsedUrl.query.limit) || 30,
        unreadOnly: parsedUrl.query.unreadOnly === 'true',
        type: parsedUrl.query.type as any,
      });
      return sendJson(res, 200, formatSuccessResponse(result));
    }

    if (pathname === '/api/notifications/mark-read' && method === 'POST') {
      const ownerKey = session?.id || session?.email || 'default_session';
      const body = await parseRequestBody(req);
      if (body.all || !body.id) {
        const count = markAllNotificationsAsRead(ownerKey);
        return sendJson(res, 200, formatSuccessResponse({ markedAll: true, count }));
      }
      const notif = markNotificationAsRead(body.id, ownerKey);
      if (!notif) return sendJson(res, 404, formatErrorResponse(`Notification ${body.id} not found`));
      return sendJson(res, 200, formatSuccessResponse({ notification: notif }));
    }

    if (pathname === '/api/notifications' && method === 'DELETE') {
      const ownerKey = session?.id || session?.email || 'default_session';
      const id = parsedUrl.query.id as string;
      if (id) {
        const deleted = deleteNotification(id, ownerKey);
        if (!deleted) return sendJson(res, 404, formatErrorResponse(`Notification ${id} not found`));
        return sendJson(res, 200, formatSuccessResponse({ deleted: true, id }));
      }
      const cleared = clearAllNotifications(ownerKey);
      return sendJson(res, 200, formatSuccessResponse({ clearedCount: cleared }));
    }

    if (pathname === '/api/notifications/test-dispatch' && method === 'POST') {
      const body = await parseRequestBody(req);
      const result = await notificationService.dispatchNotification({
        recipientEmail: body.recipientEmail || 'concierge@velouraliving.com',
        recipientPhone: body.recipientPhone || '+91 98200 12345',
        channels: body.channels || ['IN_APP', 'EMAIL', 'WHATSAPP', 'SMS'],
        type: body.type || 'ORDER_STATUS',
        title: body.title || 'Diagnostic Notification',
        message: body.message || 'Diagnostic alert from standalone server',
        actionUrl: body.actionUrl || '/shop',
      });
      return sendJson(res, 200, formatSuccessResponse(result));
    }

    // 404 Route Not Found Fallback
    return sendJson(res, 404, formatErrorResponse(`Route ${method} ${pathname} not found.`, 'ROUTE_NOT_FOUND'));
  } catch (error: any) {
    console.error('Server Internal Error:', error);
    return sendJson(res, 500, formatErrorResponse(error.message || 'Internal Server Error', 'SERVER_ERROR'));
  }
});

server.listen(PORT, () => {
  console.log(`🏛️ Veloura Living Backend REST Server running on port ${PORT}`);
});
