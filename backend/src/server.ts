/**
 * 🏛️ Veloura Living — Standalone Production Backend HTTP/REST Server
 * Reference: docs/Veloura_Living_SRS.md (Deployment & Backend Architecture, Section 33, 40)
 */

import http from 'http';
import { parse } from 'url';
import { initAuthStore, findUserByEmail, findUserById, saveUserRecord } from './data/authStore';
import { initCatalogStore, getProducts, getProductBySlugOrId, getCategories, getBrands, getVariantBySku, updateVariantStock } from './data/catalogStore';
import { getCart, addToCart, updateCartItemQuantity, removeFromCart, clearCart } from './data/shoppingStore';
import { calculateAuthoritativeCheckout, getCoupons, validateCoupon } from './data/pricingStore';
import { initOrderStore, createOrder, getOrderById, getAllOrders, getOrdersByUserId, updateOrderStatus } from './data/orderStore';
import { initPostPurchaseStore, getReviews, createReview, getReturns, createReturnRequest, updateReturnStatus, getRefunds, createRefundRecord, cancelOrderAuthoritative } from './data/postPurchaseStore';
import { initCmsStore, getCmsBanners, createCmsBanner } from './data/cmsStore';
import { hashPassword, verifyPassword } from './auth/password';
import { signToken, verifyToken } from './auth/jwt';
import { parseAuthToken } from './auth/session';
import { hasAnyRole } from './auth/rbac';
import { formatSuccessResponse, formatErrorResponse } from './api/response';

// Initialize in-memory storage singletons
initAuthStore();
initCatalogStore();
initOrderStore();
initPostPurchaseStore();
initCmsStore();

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

      if (findUserByEmail(email)) {
        return sendJson(res, 409, formatErrorResponse('User with this email already exists.', 'CONFLICT'));
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

      saveUserRecord(userRecord);
      const token = await signToken(userId, email, ['CUSTOMER']);

      return sendJson(res, 201, formatSuccessResponse({
        user: {
          id: userId,
          email,
          roles: ['CUSTOMER'],
          status: 'ACTIVE',
          profile: { firstName, lastName },
        },
        token,
      }));
    }

    if (pathname === '/api/auth/login' && method === 'POST') {
      const body = await parseRequestBody(req);
      const { email, password } = body;

      const record = findUserByEmail(email);
      if (!record || !(await verifyPassword(password, record.user.password_hash))) {
        return sendJson(res, 401, formatErrorResponse('Invalid credentials.', 'UNAUTHORIZED'));
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
    if (pathname === '/api/coupons/validate' && method === 'POST') {
      const body = await parseRequestBody(req);
      const { code, subtotal = 0 } = body;
      const val = validateCoupon(code, Number(subtotal), session?.id);
      return sendJson(res, 200, formatSuccessResponse(val));
    }

    if (pathname === '/api/checkout/summary' && method === 'POST') {
      const body = await parseRequestBody(req);
      const { shippingMethod = 'standard', couponCode } = body;
      const summary = calculateAuthoritativeCheckout({
        ownerKey,
        shippingMethod,
        couponCode,
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
      return sendJson(res, 200, formatSuccessResponse(order));
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
