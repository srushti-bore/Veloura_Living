/**
 * 🏛️ Veloura Living — Comprehensive OpenAPI 3.0.0 Specification
 * Reference: docs/Veloura_Living_SRS.md (API Contracts & Architecture)
 */

export const openapiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Veloura Living Luxury Commerce API",
    version: "1.1.0",
    description: "Production REST API endpoints for Veloura Living — High-end luxury furniture intelligence platform, white-glove logistics, GST invoicing, and AI spatial consulting.",
    contact: {
      name: "Veloura Engineering Team",
      email: "concierge@velouraliving.com"
    }
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Next.js Fullstack Server (Port 3000)"
    },
    {
      url: "http://localhost:5000",
      description: "Standalone Node.js REST API Server (Port 5000)"
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your JWT token obtained from /api/auth/login or /api/auth/register"
      },
      SessionKey: {
        type: "apiKey",
        in: "header",
        name: "X-Session-ID",
        description: "Guest / Cart Session Identifier"
      }
    }
  },
  paths: {
    "/api/health": {
      get: {
        tags: ["Observability"],
        summary: "System Health & Uptime Diagnostics",
        description: "Returns health status, uptime, subsystem connectivity (DB, AI, Payments), and memory telemetry.",
        responses: {
          200: {
            description: "System is healthy",
            content: {
              "application/json": {
                example: {
                  status: "HEALTHY",
                  service: "veloura-living-ecommerce",
                  version: "1.1.0",
                  uptime_seconds: 145000,
                  environment: "development",
                  checks: {
                    database: "CONNECTED",
                    storage: "CONNECTED",
                    ai_service: "READY",
                    payment_gateway: "READY",
                    notification_provider: "READY"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "Register New Customer Account",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                email: "client@velouraliving.com",
                password: "VelouraPassword@2026",
                firstName: "Aditya",
                lastName: "Roy",
                phone: "+91 98200 11223"
              }
            }
          }
        },
        responses: {
          201: { description: "User registered successfully with JWT session" },
          400: { description: "Invalid email or weak password" },
          409: { description: "User already exists" }
        }
      }
    },
    "/api/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Authenticate User & Issue JWT",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                email: "customer@velouraliving.com",
                password: "VelouraClient@2026"
              }
            }
          }
        },
        responses: {
          200: { description: "Credentials verified, 6-digit OTP challenge dispatched via Brevo email" },
          401: { description: "Invalid credentials or account locked" },
          423: { description: "Account locked due to 5 consecutive failed attempts (15-min lockout)" }
        }
      }
    },
    "/api/auth/verify-otp": {
      post: {
        tags: ["Authentication"],
        summary: "Verify 6-Digit Security OTP & Issue Authenticated Session",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                email: "customer@velouraliving.com",
                challengeToken: "chal_98a7sd8f7a6sd5f",
                otp: "829143"
              }
            }
          }
        },
        responses: {
          200: { description: "OTP verified, authoritative JWT session and cookie issued" },
          400: { description: "Invalid, expired, or replayed OTP code" }
        }
      }
    },
    "/api/auth/resend-otp": {
      post: {
        tags: ["Authentication"],
        summary: "Resend 6-Digit OTP with 30s Rate-Limiting Cooldown",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                email: "customer@velouraliving.com",
                challengeToken: "chal_98a7sd8f7a6sd5f"
              }
            }
          }
        },
        responses: {
          200: { description: "New OTP dispatched to email" },
          429: { description: "Cooldown active (wait 30s)" }
        }
      }
    },
    "/api/auth/me": {
      get: {
        tags: ["Authentication"],
        summary: "Current Authenticated Session Profile",
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "Active session user profile and RBAC roles" },
          401: { description: "Unauthorized - missing or invalid token" }
        }
      }
    },
    "/api/products": {
      get: {
        tags: ["Catalog & Products"],
        summary: "List Products with Filtering & Pagination",
        parameters: [
          { name: "category", in: "query", schema: { type: "string" }, description: "Filter by category slug (living-room, bedroom, dining, study)" },
          { name: "room", in: "query", schema: { type: "string" }, description: "Filter by room slug" },
          { name: "minPrice", in: "query", schema: { type: "number" }, description: "Minimum price in INR" },
          { name: "maxPrice", in: "query", schema: { type: "number" }, description: "Maximum price in INR" },
          { name: "search", in: "query", schema: { type: "string" }, description: "Search keyword" },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } }
        ],
        responses: {
          200: { description: "List of products with pagination metadata" }
        }
      }
    },
    "/api/products/{slug}": {
      get: {
        tags: ["Catalog & Products"],
        summary: "Get Single Product Details by Slug or ID",
        parameters: [
          { name: "slug", in: "path", required: true, schema: { type: "string" }, example: "solis-lounge-chair" }
        ],
        responses: {
          200: { description: "Detailed product object with variants and 3D assets" },
          404: { description: "Product not found" }
        }
      }
    },
    "/api/categories": {
      get: {
        tags: ["Catalog & Products"],
        summary: "List All Product Categories",
        responses: {
          200: { description: "Array of category objects" }
        }
      }
    },
    "/api/brands": {
      get: {
        tags: ["Catalog & Products"],
        summary: "List Curated Luxury Brands / Workshops",
        responses: {
          200: { description: "Array of artisan brand profiles" }
        }
      }
    },
    "/api/cart": {
      get: {
        tags: ["Shopping Cart"],
        summary: "Retrieve Current Cart Items & Totals",
        security: [{ BearerAuth: [] }, { SessionKey: [] }],
        responses: {
          200: { description: "Active cart with itemized lines and subtotal" }
        }
      },
      post: {
        tags: ["Shopping Cart"],
        summary: "Add Item to Cart with Stock & Limit Validation",
        security: [{ BearerAuth: [] }, { SessionKey: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                sku: "SOLIS-CHAIR-BOUCLE-OAK",
                quantity: 1
              }
            }
          }
        },
        responses: {
          200: { description: "Item added successfully" },
          400: { description: "Stock exceeded or quantity exceeds 10 per SKU limit (CART-006)" }
        }
      }
    },
    "/api/checkout/summary": {
      post: {
        tags: ["Checkout & Pricing"],
        summary: "Authoritative Server-Side Checkout Calculation",
        security: [{ BearerAuth: [] }, { SessionKey: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                shippingMethod: "standard",
                couponCode: "VELOURA15"
              }
            }
          }
        },
        responses: {
          200: {
            description: "Calculated breakdown with ₹199/<₹2,999 shipping, 18% GST, and discount"
          }
        }
      }
    },
    "/api/coupons/validate": {
      post: {
        tags: ["Checkout & Pricing"],
        summary: "Validate Privilege / Coupon Code",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                code: "VELOURA15",
                subtotal: 50000
              }
            }
          }
        },
        responses: {
          200: { description: "Coupon validity and calculated savings" }
        }
      }
    },
    "/api/orders": {
      get: {
        tags: ["Orders & Fulfillment"],
        summary: "List Customer Orders or All Orders (Admin)",
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "Array of orders with status timeline" }
        }
      },
      post: {
        tags: ["Orders & Fulfillment"],
        summary: "Create Authoritative White-Glove Order",
        security: [{ BearerAuth: [] }, { SessionKey: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                fullName: "Aarav Singhania",
                email: "aarav@velouraliving.com",
                phone: "+91 98201 54321",
                address: "Skyline Penthouse 34A, Worli",
                city: "Mumbai",
                state: "Maharashtra",
                pincode: "400018",
                shippingMethod: "standard",
                paymentMethod: "UPI",
                couponCode: "VELOURA15"
              }
            }
          }
        },
        responses: {
          201: { description: "Order confirmed, inventory allocated, invoice generated" },
          400: { description: "Validation error or empty cart" }
        }
      }
    },
    "/api/orders/{id}": {
      get: {
        tags: ["Orders & Fulfillment"],
        summary: "Get Order Details & Tracking by ID",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, example: "ord-seed-001" }
        ],
        responses: {
          200: { description: "Detailed order object" },
          404: { description: "Order not found" }
        }
      }
    },
    "/api/orders/{id}/cancel": {
      post: {
        tags: ["Orders & Fulfillment"],
        summary: "Authoritative Order Cancellation",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, example: "ord-seed-001" }
        ],
        requestBody: {
          content: {
            "application/json": {
              example: { reason: "Customer requested cancellation before shipment" }
            }
          }
        },
        responses: {
          200: { description: "Order cancelled and stock restocked" },
          400: { description: "Order cannot be cancelled in current status" }
        }
      }
    },
    "/api/invoices/{orderId}": {
      get: {
        tags: ["Invoicing & Compliance"],
        summary: "Get Official FY-Sequenced GST Tax Invoice",
        parameters: [
          { name: "orderId", in: "path", required: true, schema: { type: "string" }, example: "ord-seed-001" },
          { name: "format", in: "query", schema: { type: "string", enum: ["json", "html"] }, description: "Response format" }
        ],
        responses: {
          200: { description: "Tax invoice data or rendered HTML print view" },
          404: { description: "Order not found" }
        }
      }
    },
    "/api/payments/create-intent": {
      post: {
        tags: ["Payments Gateway"],
        summary: "Create Razorpay Payment Order Intent",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                orderId: "ord-seed-001",
                amount: 75000,
                currency: "INR"
              }
            }
          }
        },
        responses: {
          200: { description: "Razorpay order created with key ID and order ID" }
        }
      }
    },
    "/api/payments/verify": {
      post: {
        tags: ["Payments Gateway"],
        summary: "Verify Razorpay Payment Signature",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                razorpay_order_id: "order_mock_12345",
                razorpay_payment_id: "pay_mock_67890",
                razorpay_signature: "mock_signature_hex"
              }
            }
          }
        },
        responses: {
          200: { description: "Signature verified, payment captured" }
        }
      }
    },
    "/api/currency/rates": {
      get: {
        tags: ["Payments Gateway"],
        summary: "Get Real-Time Multi-Currency FX Rates (CON-003)",
        description: "Returns active currency exchange rates for INR base against USD, EUR, GBP, AED, and SGD.",
        responses: {
          200: { description: "Current rates matrix and last updated timestamp" }
        }
      }
    },
    "/api/currency/convert": {
      post: {
        tags: ["Payments Gateway"],
        summary: "Convert Amount Between Currencies",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: { amountInINR: 100000, targetCurrency: "USD" }
            }
          }
        },
        responses: {
          200: { description: "Converted amount, rate, and formatted string" }
        }
      }
    },
    "/api/orders/cod-otp/send": {
      post: {
        tags: ["Orders & Fulfillment"],
        summary: "Dispatch 6-Digit COD Verification OTP (PAY-009)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: { phoneOrEmail: "+91 98201 54321", amountInINR: 78000, postalCode: "400018" }
            }
          }
        },
        responses: {
          200: { description: "Verification ID and OTP expiry timestamp" },
          400: { description: "Cart ineligible for COD or invalid phone number" }
        }
      }
    },
    "/api/orders/cod-otp/verify": {
      post: {
        tags: ["Orders & Fulfillment"],
        summary: "Verify Submitted COD 6-Digit OTP",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: { verificationId: "cod_ver_abc123", otp: "748291" }
            }
          }
        },
        responses: {
          200: { description: "Phone contact verified for Cash on Delivery" },
          400: { description: "Invalid or expired OTP" }
        }
      }
    },
    "/api/refunds/process-gateway": {
      post: {
        tags: ["Post-Purchase & Reviews"],
        summary: "Execute Automated Razorpay Gateway Refund (RET-007)",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                orderId: "ord-seed-001",
                amountInINR: 78000,
                speed: "optimum",
                reason: "Customer verified return inspection complete"
              }
            }
          }
        },
        responses: {
          200: { description: "Direct gateway refund processed and linked to ARN" },
          400: { description: "Invalid order or payment ID" }
        }
      }
    },
    "/api/reviews": {
      get: {
        tags: ["Post-Purchase & Reviews"],
        summary: "Get Verified Reviews for Product",
        parameters: [
          { name: "productId", in: "query", schema: { type: "string" }, example: "prod-solis-chair" }
        ],
        responses: {
          200: { description: "Reviews list with aggregate rating statistics" }
        }
      },
      post: {
        tags: ["Post-Purchase & Reviews"],
        summary: "Submit Verified Customer Review",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                productId: "prod-solis-chair",
                rating: 5,
                title: "Exquisite Craftsmanship & Texture",
                comment: "The bouclé upholstery is soft yet resilient. Fits seamlessly into our living room pavilion."
              }
            }
          }
        },
        responses: {
          201: { description: "Review submitted" }
        }
      }
    },
    "/api/returns": {
      get: {
        tags: ["Post-Purchase & Reviews"],
        summary: "List Return Requests",
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "Array of return requests" }
        }
      },
      post: {
        tags: ["Post-Purchase & Reviews"],
        summary: "Create Category-Aware Return Request (RET-001)",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                orderId: "ord-seed-001",
                reason: "Dimension mismatch in study room",
                condition: "UNOPENED_CRATE"
              }
            }
          }
        },
        responses: {
          201: { description: "Return request initiated within category window (7/10/14 days)" },
          400: { description: "Return window expired or invalid condition" }
        }
      }
    },
    "/api/ai/chat": {
      post: {
        tags: ["AI Spatial Consultant"],
        summary: "Interact with AI Spatial Intelligence Consultant",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                message: "Which coffee table pairs well with a Japandi beige bouclé sofa in a 400 sq ft room?",
                roomType: "living_room"
              }
            }
          }
        },
        responses: {
          200: {
            description: "AI spatial recommendation, palette suggestions, and curated product matching"
          }
        }
      }
    },
    "/api/ai/restock-insights": {
      get: {
        tags: ["AI Spatial Consultant"],
        summary: "AI Predictive Restock Demand Forecasts",
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "Predicted stockout dates and restock recommendations" }
        }
      }
    },
    "/api/admin/metrics": {
      get: {
        tags: ["Admin & Analytics"],
        summary: "Executive Cockpit Performance Metrics",
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "GMV, orders count, conversion rates, and stock alerts" }
        }
      }
    },
    "/api/notifications": {
      get: {
        tags: ["Notifications"],
        summary: "Retrieve Customer In-App Notifications & Unread Count",
        parameters: [
          { name: "unreadOnly", in: "query", schema: { type: "boolean" } },
          { name: "type", in: "query", schema: { type: "string" } }
        ],
        responses: {
          200: { description: "List of in-app notifications and unread count" }
        }
      },
      delete: {
        tags: ["Notifications"],
        summary: "Delete Single or Clear All Notifications",
        parameters: [
          { name: "id", in: "query", schema: { type: "string" } }
        ],
        responses: {
          200: { description: "Notification deletion confirmation" }
        }
      }
    },
    "/api/notifications/mark-read": {
      post: {
        tags: ["Notifications"],
        summary: "Mark Single Notification or All as Read",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  all: { type: "boolean" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Notification read state updated" }
        }
      }
    },
    "/api/notifications/test-dispatch": {
      post: {
        tags: ["Notifications"],
        summary: "Diagnostic Multi-Channel Notification Test Dispatcher",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  channels: { type: "array", items: { type: "string" } },
                  type: { type: "string" },
                  title: { type: "string" },
                  message: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Multi-channel dispatch telemetry results" }
        }
      }
    }
  }
};
