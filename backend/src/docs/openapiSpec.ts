/**
 * 🏛️ Veloura Living — Backend OpenAPI 3.0.0 Specification
 */

export const backendOpenapiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Veloura Living Standalone Backend REST API",
    version: "1.1.0",
    description: "Production Standalone REST API endpoints for Veloura Living on Port 5000.",
    contact: {
      name: "Veloura Engineering Team",
      email: "concierge@velouraliving.com"
    }
  },
  servers: [
    {
      url: "http://localhost:5000",
      description: "Standalone Backend Server (Port 5000)"
    },
    {
      url: "http://localhost:3000",
      description: "Next.js Fullstack Server (Port 3000)"
    }
  ],
  paths: {
    "/api/health": {
      get: {
        summary: "Backend Server Health",
        responses: { 200: { description: "Server is online" } }
      }
    },
    "/api/auth/register": {
      post: {
        summary: "Register Account & Dispatch OTP",
        responses: { 201: { description: "Created user challenge" } }
      }
    },
    "/api/auth/login": {
      post: {
        summary: "Validate Credentials & Dispatch OTP",
        responses: { 200: { description: "Dispatched OTP challenge" } }
      }
    },
    "/api/auth/verify-otp": {
      post: {
        summary: "Verify 6-Digit OTP & Issue JWT",
        responses: { 200: { description: "Issued JWT session" } }
      }
    },
    "/api/auth/resend-otp": {
      post: {
        summary: "Resend 6-Digit OTP (30s Cooldown)",
        responses: { 200: { description: "New OTP sent" } }
      }
    },
    "/api/auth/me": {
      get: {
        summary: "Session Introspection Profile",
        responses: { 200: { description: "User session" } }
      }
    },
    "/api/products": {
      get: {
        summary: "List Products with Filtering & Pagination",
        responses: { 200: { description: "Products list" } }
      }
    },
    "/api/categories": {
      get: {
        summary: "List All Categories",
        responses: { 200: { description: "Categories list" } }
      }
    },
    "/api/brands": {
      get: {
        summary: "List Brands",
        responses: { 200: { description: "Brands list" } }
      }
    },
    "/api/cart": {
      get: {
        summary: "Get Cart",
        responses: { 200: { description: "Cart object" } }
      },
      post: {
        summary: "Add item to Cart",
        responses: { 200: { description: "Updated cart" } }
      }
    },
    "/api/checkout/summary": {
      post: {
        summary: "Calculate Checkout Summary",
        responses: { 200: { description: "Summary with shipping, tax, discounts" } }
      }
    },
    "/api/coupons/validate": {
      post: {
        summary: "Validate Coupon",
        responses: { 200: { description: "Validity result" } }
      }
    },
    "/api/orders": {
      get: {
        summary: "Get Orders",
        responses: { 200: { description: "Orders list" } }
      },
      post: {
        summary: "Place Order",
        responses: { 201: { description: "Created order" } }
      }
    },
    "/api/reviews": {
      get: {
        summary: "Get Product Reviews",
        responses: { 200: { description: "Reviews list" } }
      },
      post: {
        summary: "Post Product Review",
        responses: { 201: { description: "Created review" } }
      }
    },
    "/api/returns": {
      get: {
        summary: "Get Returns",
        responses: { 200: { description: "Returns list" } }
      },
      post: {
        summary: "Request Return",
        responses: { 201: { description: "Created return" } }
      }
    },
    "/api/cms/banners": {
      get: {
        summary: "Get CMS Banners",
        responses: { 200: { description: "Banners array" } }
      }
    }
  }
};
