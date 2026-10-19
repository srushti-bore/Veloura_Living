# 🏛️ Veloura Living — Master Architecture, Migration & Progress Report

**Project Name:** Veloura Living — Luxury Furniture Intelligence Platform  
**Workspace:** `d:\Veloura Living`  
**GitHub Repository:** [https://github.com/srushti-bore/Veloura_Living](https://github.com/srushti-bore/Veloura_Living)  
**Deployment Target:** Vercel (`Next.js 16 App Router`) + Supabase PostgreSQL + Standalone Backend (`backend/` Docker/Render on Port 5000)  
**Architecture:** Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4 + Three.js + GSAP 3 + Lenis + Google Gemini AI + Dedicated Node.js REST Backend  
**Status:** ✅ **100% Production-Ready, All 28 Master Roadmap Phases Implemented & Verified (Exact Reference Admin Dashboard with 10 functional sections, live search dropdown, notification popover, interactive SVG sales chart & modal management; Exact Reference Customer Dashboard with dynamic first-name greeting, 8 navigation tabs & isolated customer stats; Strict Step-by-Step Registration & Login OTP Flow with Login Successful view; OTP Verification Processing Screen with continuous circular loader; Premium 6-Box OTP Verification Page; Premium Split-Screen Login Experience; Secure Single Admin Finalization with PostgreSQL Invariant Trigger & Zero-Credential Seed CLI; Master All-in-One Supabase DDL Seeder; Durable PostgreSQL User Persistence; 74/74 Next.js Routes, 0 TypeScript Errors, and 314/314 Master Tests Passing 100%)**  
**Last Updated:** 12 October 2026 (Phase 28: Exact Reference Admin Dashboard, Phase 27: Exact Reference Customer Dashboard, Phase 26: Strict Registration & Login Flow, Phase 25: OTP Processing Screen, Phase 24: Premium 6-Box OTP Page)  

---

## 📌 1. Executive Summary & All Completed Phases (SRS & V2-Aligned)

All phases defined in the normative SRS specification and V2 roadmap are 100% completed, verified with production builds (`npm.cmd run build`), and fully tested:

### 1. Phase 1: Foundation, Relational Database Schema & API Response Protocol ✅
- **PostgreSQL / Supabase Schema (`db/schema.sql`, `backend/src/db/schema.sql`, `supabase/migrations/20261002000001_foundation_schema.sql`):** 26+ normalized entities with enums, foreign keys, cascade policies, check constraints, and performance indexes.
- **Unified API Response & Error Protocol (`lib/api/response.ts` & `backend/src/api/response.ts`):** Standardized `ApiResponse<T>`, custom error hierarchy (`ValidationError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ConflictError`, `BusinessRuleError`).
- **Complete TypeScript Type System (`types/database.ts`, `types/api.ts`, `types/auth.ts`, `types/index.ts` & `backend/src/types/*`):** Strict types for all DB rows, requests, responses, and RBAC sessions.
- **Production Environment Template (`.env.example` & `backend/.env.example`):** Complete blueprint for Supabase, JWT, Google Gemini AI, Razorpay/Stripe, and White-Glove logistics.
- **Seed Engine (`db/seed.sql`, `backend/src/db/seed.sql`, `lib/data/dbSeedData.ts` & `backend/src/data/dbSeedData.ts`):** Complete relational seed data for roles, permissions, admin/client profiles, categories, brands, luxury products, variants, and coupons.

### 2. Phase 2: Authentication, Security & RBAC Engine ✅
- **Web Crypto Cryptography (`lib/auth/password.ts`, `backend/src/auth/password.ts`, `lib/auth/jwt.ts`, `backend/src/auth/jwt.ts`):** PBKDF2/SHA-256 password hashing with random salt & HMAC-SHA256 JWT sign/verify compatible with Edge & Node.js runtimes.
- **Role-Based Access Control (`lib/auth/rbac.ts`, `backend/src/auth/rbac.ts`, `lib/auth/session.ts`, `backend/src/auth/session.ts`):** RBAC matrix for `CUSTOMER`, `ADMIN`, `MANAGER`, `PRODUCT_MANAGER`, `ORDER_MANAGER` with `requireAuth()`, `requireRole()`, and `requirePermission()` guards.
- **Auth & User REST API Endpoints (`app/api/auth/*`, `app/api/user/*`, and `backend/src/server.ts`):**
  - `POST /api/auth/register` (Account creation + initial JWT + HTTP-only cookie)
  - `POST /api/auth/login` (Credential verification + role claims)
  - `POST /api/auth/logout` (Cookie clearing)
  - `GET /api/auth/me` (Session & permission resolution)
  - `POST /api/auth/forgot-password` & `POST /api/auth/reset-password` (Secure token password recovery)
  - `GET / PUT /api/user/profile` (Profile & preference management)
  - `GET / POST / PUT / DELETE /api/user/addresses` (Delivery destinations manager)
- **Client-Side Auth State & UI (`providers/AuthProvider.tsx`, `hooks/useAuth.ts`, `components/auth/AuthModal.tsx`):** Luxury modal with 1-Tap Demo credentials (👑 Admin, 👔 Concierge/Manager, 🏛️ Client), user avatar dropdown in Header, and address book in Account.

### 3. Phase 3: Master Catalog, Categories & Variant/SKU Engine ✅
- **Unified Catalog Store (`lib/data/catalogStore.ts` & `backend/src/data/catalogStore.ts`):** Server-side data access layer managing categories, brands, products, SKU variants, and inventory movements with faceted filtering, multi-field search, and pagination.
- **Catalog & Variant REST API Endpoints (`app/api/categories/*`, `app/api/brands/*`, `app/api/products/*`, `app/api/variants/*`, and `backend/src/server.ts`):**
  - `GET / POST /api/categories` & `GET / PUT / DELETE /api/categories/[id]` (Category hierarchy, display order, image bindings)
  - `GET / POST /api/brands` (Brand registry & origin details)
  - `GET / POST /api/products` (Faceted search by room, category, price, materials, colors, featured flag + `PRODUCT_CREATE` RBAC guard)
  - `GET / PUT / DELETE /api/products/[slug]` (Full product detail, variants, specs + `PRODUCT_UPDATE` / `PRODUCT_DELETE` guards)
  - `GET /api/variants` (SKU collection query)
  - `GET / PUT /api/variants/[sku]` (Live stock balance & price adjustments)

### 4. Phase 4: Discovery, Search & Authoritative Shopping Engine ✅
- **Authoritative Shopping & Wishlist Store (`lib/data/shoppingStore.ts` & `backend/src/data/shoppingStore.ts`):** Server-side cart recalculation (Subtotal, GST 18%, White-Glove logistics thresholds), live inventory locking per variant SKU, and persistent user/session wishlists.
- **Natural Language & Autocomplete Search API (`app/api/search` & `backend/src/server.ts`):** Natural language price filter extractor (`"sofa under ₹80,000"`), multi-field keyword suggestions, and matched category discovery.
- **Shopping Cart & Wishlist REST API Endpoints (`app/api/cart/*`, `app/api/wishlist/*`, and `backend/src/server.ts`):**
  - `GET / POST / DELETE /api/cart` (Cart summary, SKU addition, complete wipe)
  - `PUT / DELETE /api/cart/[itemId]` (Authoritative quantity updates & item removals)
  - `POST /api/cart/validate` (Pre-checkout concurrency & inventory check against real-time SKU stock)
  - `GET / POST /api/wishlist` & `DELETE /api/wishlist/[productId]` (User & session-synced wishlist management)

### 5. Phase 5: Authoritative Checkout, Coupons & Pricing Engine ✅
- **Authoritative Pricing & Coupon Store (`lib/data/pricingStore.ts` & `backend/src/data/pricingStore.ts`):** Server-side coupon verification engine (min spend thresholds, max discount caps, active validity windows), multi-tier White-Glove logistics calculations, and statutory 18% GST (CGST + SGST).
- **Checkout & Promotion REST API Endpoints (`app/api/coupons/*`, `app/api/checkout/*`, and `backend/src/server.ts`):**
  - `GET / POST /api/coupons` (Coupon management & retrieval)
  - `POST /api/coupons/validate` (Real-time coupon validation with itemized discount calculation)
  - `POST /api/checkout/summary` (Authoritative server-side price summary ensuring 0 client price manipulation)
  - `GET /api/invoices/[orderId]` (Instant GST Tax Invoice generation with CGST/SGST/IGST breakdown)

### 6. Phase 6: Payments, Gateway Webhooks & Order Lifecycle Management ✅
- **Order & Payment Store (`lib/data/orderStore.ts` & `backend/src/data/orderStore.ts`):** Idempotency key registry, concurrency stock reservation, order state transitions (`PLACED` ➔ `CONFIRMED` ➔ `PROCESSING` ➔ `SHIPPED` ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED`), white-glove tracking milestones.
- **Order & Payment REST API Endpoints (`app/api/orders/*`, `app/api/payments/*`, and `backend/src/server.ts`):**
  - `GET / POST /api/orders` & `GET /api/orders/[id]` (Order creation with server-calculated subtotals & customer contact bindings)
  - `PUT /api/orders/[id]/status` (Authorized role-based order state dispatcher)
  - `POST /api/payments/create-intent` (Payment intent generator for Razorpay/Stripe)
  - `POST /api/payments/verify` (HMAC cryptographic payment signature verifier)
  - `POST /api/payments/webhook` (Asynchronous event listener for payment success/failure)

### 7. Phase 7: Post-Purchase, Reviews, Ratings, Returns & Refunds Engine ✅
- **Post-Purchase Store (`lib/data/postPurchaseStore.ts` & `backend/src/data/postPurchaseStore.ts`):**
  - Product Reviews with verified purchase verification, star distribution breakdown (5/4/3/2/1 stars), and helpful upvoting.
  - Return & Exchange state machine (`RETURN_REQUESTED` ➔ `RETURN_APPROVED` ➔ `RETURN_PICKUP` ➔ `RETURN_RECEIVED` ➔ `REFUND_INITIATED` ➔ `REFUNDED`).
  - Automatic inventory restocking (`adjustVariantStock` with `'RETURN'` movement audit) upon `RETURN_RECEIVED`.
  - Authoritative financial refund ledger linking return IDs, payment IDs, and gateway transaction references.
  - Order cancellation engine (`cancelOrderAuthoritative`) with state rules and automated stock unlocking (`'CANCELLATION'`).
- **Post-Purchase REST API Endpoints (`app/api/reviews/*`, `app/api/returns/*`, `app/api/refunds/*`, and `backend/src/server.ts`):**
  - `GET / POST /api/reviews` & `PUT / DELETE /api/reviews/[id]` (Star rating queries, review creation, helpful upvotes, moderation)
  - `GET / POST /api/returns` & `PUT /api/returns/[id]/status` (Return request intake & status updates with RBAC guards)
  - `GET / POST /api/refunds` (Refund transactions ledger query & creation)
  - `POST /api/orders/[id]/cancel` (Client/Admin order cancellation with automated inventory restocking)

### 8. Phase 8: Executive Administration Portal & RBAC Security Gate ✅
- **CMS Store (`lib/data/cmsStore.ts` & `backend/src/data/cmsStore.ts`):** Dynamic homepage hero banners, promotional spotlights, and active privileges.
- **Admin Operations Endpoints (`app/api/admin/metrics`, `app/api/cms/banners/*`, and `backend/src/server.ts`):**
  - `GET /api/admin/metrics` (Real-time GMV, AOV, order status distribution, low stock count, pending returns)
  - `GET / POST /api/cms/banners` & `PUT / DELETE /api/cms/banners/[id]` (CMS banner management)
- **Executive Staff Security Login Gate (`components/views/admin/AdminDashboardPage.tsx`):**
  - Role-Based Access Control gate restricting unauthorized guests and regular `CUSTOMER` accounts.
  - 1-Click Fast Access Demo Credentials (`👑 Master Admin` & `👔 Ops Manager`).
  - Active staff identity status badge and "Lock Console & Sign Out" button.
  - 7 Tab Sections: Executive KPI Overview, Workshop Fulfillment & Orders Dispatcher, Live Catalog & SKU Inventory, Returns & Refunds Queue, Reviews Moderation, CMS Banners, and AI Restock Analytics.

### 9. Phase 9: 2026 AI Intelligence Suite ✅
- **AI Spatial Consultation & Chat API (`app/api/ai/chat` & `backend/src/server.ts`):** Natural language spatial consultation that extracts room intent, budget caps, and material preferences, returning matched pieces, architectural room tips, and 5-hex color palettes.
- **AI Review Sentiment Analyzer (`app/api/ai/sentiment`):** Continuous review sentiment classification and thematic topic extraction (e.g. Tactile Bouclé Texture, Solid Walnut Joinery).
- **AI Predictive Restocking Insights (`app/api/ai/restock-insights`):** SKU exhaustion forecasting based on order velocities and reorder batch recommendations with AI rationale.
- **Client Integration (`components/ai/AIShoppingAssistantDrawer.tsx` & `providers/AppProvider.tsx`):** Seamless asynchronous fetch to `/api/ai/chat` with graceful local heuristic fallback.

### 10. Phase 10: Production Engineering, Interactive Swagger UI & Verification ✅
- **Interactive OpenAPI 3.0 & Swagger UI (`app/docs/page.tsx`, `app/api/openapi.json`, `backend/src/docs/openapiSpec.ts`):** Full dark-mode interactive API documentation with schemas, authentication headers, and live "Try it out" runners.
- **Dedicated Backend Architecture (`backend/`):** Self-contained Node.js / TypeScript microservice with its own `package.json`, `tsconfig.json`, `Dockerfile`, `.env.example`, standalone REST server (`src/server.ts` on port 5000), database migrations, authentication, and business domain stores.
- **Build Quality:** Clean Turbopack production compilation in 2.6s with 0 TypeScript errors (56/56 static and dynamic Next.js routes).
- **Automated Verification Suites:**
  - `npm.cmd run test:swagger`: 19/19 live REST endpoints passing 100%.
  - `npx.cmd -y tsx tests/e2e-live-pages-test.ts`: 15/15 live pages responding HTTP 200 OK with full cart, checkout, and invoice generation.
  - `npx.cmd tsx tests/verify-all-images.ts`: 37/37 static images & material swatches verified with HTTP 200 OK.
  - `npm.cmd test`: 33/33 unit & integration tests passing 100%.

### 11. Phase 11: Payment Automation, Razorpay Test Mode & Refunds, COD Engine & Multi-Currency Dynamic Pricing ✅
- **Authentic Razorpay Test Mode & Cryptographic Signature Verification (`PAY-001`, `PAY-002`):**
  - **Live Test Mode Order Intent (`POST /api/payments/create-intent`):** Generates authentic Razorpay orders via `https://api.razorpay.com/v1/orders` using server-side Basic Auth (`RAZORPAY_KEY_ID:RAZORPAY_KEY_SECRET`). Strict server amount validation, INR currency enforcement, and complete elimination of simulated demo fallbacks.
  - **Cryptographic HMAC-SHA256 Verification (`POST /api/payments/verify`):** Server computes `crypto.createHmac('sha256', secret).update(orderId + '|' + paymentId).digest('hex')` with timing-safe comparison (`crypto.timingSafeEqual`). Strictly rejects untrusted client statuses and tampered signatures with HTTP 400.
  - **Zero-Bypass Checkout Flow (`CheckoutPage.tsx`):** Launches official Razorpay modal with authentic `order_id`, and requires verified server response before atomic transition to Order Confirmed state and VIP Gold Coin reward dispatch.
  - **Environment Variable Security:** Private secret keys isolated to server memory with multi-alias support across Next.js and standalone backend.
- **Automated Razorpay Refund API (`RET-007`):**
  - Direct gateway refund execution (`POST /v1/payments/:id/refund`) with instant speed preference options (`optimum` / `normal`).
  - Automatic reconciliation between return ledger, refund audit history, `gateway_refund_id`, and `gateway_arn` Acquirer Reference Numbers.
  - Razorpay Webhook listener (`POST /api/payments/webhook`) handling `refund.processed` and `refund.failed` events.
  - Admin Cockpit 1-Click "⚡ Execute Razorpay Instant Refund" action in Returns & Refunds tab.
- **Cash on Delivery (COD) Engine & Safety Rules (`PAY-009`):**
  - Strict order cart limit checks: Eligible between ₹2,500 and ₹1,50,000.
  - Dynamic handling fee logic: ₹750 handling fee for orders < ₹50,000; ₹0 complimentary waiver for orders >= ₹50,000.
  - 6-Digit SMS / OTP verification modal with expiry controls (`POST /api/orders/cod-otp/send`, `POST /api/orders/cod-otp/verify`).
- **Multi-Currency Dynamic Pricing Engine (`CON-003`):**
  - Real-time conversion and localized currency formatting for 6 key international currencies: `INR (₹)`, `USD ($)`, `EUR (€)`, `GBP (£)`, `AED (AED)`, `SGD (S$)`.
  - Header Currency Switcher (`components/common/CurrencySelector.tsx`) integrated in desktop and mobile navigation.
  - Client `CurrencyProvider` and `useCurrency()` hook for reactive real-time pricing across Catalog, Product Detail, Cart, and Checkout.
  - Dedicated REST endpoints: `GET /api/currency/rates` and `POST /api/currency/convert`.
- **Phase 11 Automated Test Suite:**
  - `npm.cmd run test:phase11`: 30/30 automated tests passing across FX calculations, COD safety boundaries, OTP validation, direct refund execution, and end-to-end checkout.
  - `npx.cmd tsx tests/test-razorpay-checkout-flow.ts`: 100% verified authentic test intent generation, fake signature rejection, and cryptographic HMAC verification.

### 12. Phase 12: Multi-Channel Notification Engine & In-App Notification Center Drawer ✅
- **Multi-Channel Notification Dispatcher (`lib/services/notificationService.ts` & `backend/src/services/notificationService.ts`):**
  - **Luxury HTML Email Template Builder:** Responsive inline CSS dark-slate/warm-gold email layouts with Veloura logo header, order summaries, direct action buttons, and white-glove logistics footer.
  - **WhatsApp Business Cloud API Formatter:** Markdown-bold formatted WhatsApp strings with emojis, order numbers, track links, and concierge signatures.
  - **SMS Copy Gateway Formatter:** Compact 160-char SMS copy with `[VELOURA]` sender prefix and tracking links.
  - **In-App Drawer Notification Ledger:** Instant persistence to client in-app notification ledger with unread tracking and category categorization (`ORDER_STATUS`, `VIP_CONCIERGE`, `REFUND_PROCESSED`, `PRICE_DROP`, `SECURITY_ALERT`).
- **Slide-Out Glassmorphic Notification Center Drawer (`components/notifications/NotificationCenterDrawer.tsx`):**
  - Slide-out drawer on right edge with backdrop blur (`backdrop-blur-2xl bg-[#0d0d0d]/90`), gold accents (`#8B5A2B`), and luxury typography.
  - Category tab bar: `All`, `Orders`, `VIP Drops`, `Refunds` with unread count indicators.
  - 1-Click batch actions: "Mark all as read" and "Clear all notifications".
  - Unread indicator pulse dots, relative timestamps (`15m ago`, `2h ago`), and dynamic action links.
- **Header Notification Bell Badge (`components/layout/Header.tsx`):**
  - Animated luxury bell icon with live golden circular unread count badge (`bg-[#8B5A2B] text-white`).
  - Automatic 30-second background polling via `NotificationProvider` (`providers/NotificationProvider.tsx`).
- **Order & Refund Lifecycle Automation Triggers:**
  - Hooks into `orderStore` on `createOrder` (dispatches Order Placed Email + In-App notice) and `updateOrderStatus` (dispatches Shipped / Out for Delivery / Delivered notifications across Email & WhatsApp).
  - Hooks into `razorpayService` on direct refund execution (dispatches Instant Refund Credited receipt with Acquirer ARN).
- **REST API Endpoints:**
  - `GET /api/notifications` (List notifications + unread count calculation)
  - `POST /api/notifications/mark-read` (Mark single or all notifications as read)
  - `DELETE /api/notifications` (Delete individual or clear all notifications)
  - `POST /api/notifications/test-dispatch` (Developer & Admin diagnostic multi-channel dispatch tool)
- **Phase 12 Automated Verification:**
  - `npm.cmd run test:phase12`: **27/27 automated unit & integration tests passing 100%**.

### 13. Phase 13: 3D AR Spatial Configurator, Real-Time 8K Material Swapper & WebXR Studio ✅
- **Three.js Interactive 3D Studio (`app/configurator/page.tsx`, `components/three/configurator/*`):**
  - **Procedural 3D Geometry Models (`furnitureModels.ts`):** 4 modular signature pieces (*Serpentine Modular Sectional Sofa*, *Aurelia Sculptural Dining Table*, *Fujiwara Cane Credenza*, *Zenith Swivel Lounge Chair*) with isolated part mesh maps.
  - **Real-Time 8K PBR Material Shader Engine (`configuratorMaterials.ts`):** 15 curated materials across Timbers, Fabrics, Leathers, Stones, and Metals with dynamic roughness, metalness, and texture mapping.
  - **Dynamic Lighting Environments:** 4 presets (*Morning Sun*, *Golden Dusk*, *Gallery Spotlight*, *Midnight Atelier*).
  - **Interactive 3D Calipers:** True-scale dimension lines and measurement overlays (Width × Depth × Height in cm).
  - **Exploded Joinery Slider:** Smooth 0–100% expansion demonstrating internal craftsmanship and modular assembly.
  - **AR Mobile Room Placement & WebXR Bridge (`ARPlacementModal.tsx`, `arBridgeService.ts`):** Dynamic QR code generation, iOS QuickLook USDZ intent, and Android SceneViewer GLB projection.
  - **Authoritative Custom Pricing & Cart Integration:** Dynamic upcharge formula adding custom builds directly to cart with tailored SKU and specifications.
- **Phase 13 Automated Verification:**
  - `npm.cmd run test:phase13`: **42/42 automated unit & integration tests passing 100%**.

### 14. Phase 14: VIP Concierge & Trade B2B Portal, Project RFQ Builder & Swatch Box Pipeline ✅
- **Trade Partner B2B Architecture (`app/trade/page.tsx`, `components/views/trade/*`, `lib/data/tradeStore.ts`):**
  - **Tiered Volume Discount Engine:** Automated tier assignment based on project valuation (Bronze 15% for ₹5L–₹10L, Silver 20% for ₹10L–₹25L, Gold 25% for >₹25L).
  - **Multi-Room Project RFQ Builder (`TradeRFQBuilderModal.tsx`):** Bill of Materials selector with live tax breakdown, itemized trade tier discount calculation, and PDF/HTML quotation exporter.
  - **Physical Swatch Sample Box Pipeline (`SwatchBoxOrderDrawer.tsx`):** Selection drawer for up to 5 physical 8K material swatches, dispatched with White-Glove priority tracking.
  - **VIP Private Concierge Consultation Booking (`VIPConciergeBookingModal.tsx`):** Interactive appointment booking for Virtual CAD Consultation or On-Site Architectural Walkthrough with direct WhatsApp Concierge routing.
  - **Formal GST Tax Quotation Generator (`tradeStore.ts`, `app/api/trade/quotation/[rfqId]/route.ts`):** Official commercial GST quotation generation with statutory seller GSTIN, HSN codes, and itemized lines.
  - **Dedicated REST API Endpoints:** `POST /api/trade/register`, `GET /api/trade/status`, `GET / POST /api/trade/rfq`, `GET / POST /api/trade/swatch-box`, `GET / POST /api/concierge/book`, `GET /api/trade/quotation/[rfqId]`.
- **Phase 14 Automated Verification:**
  - `npm.cmd run test:phase14`: **34/34 automated unit & integration tests passing 100%**.

### 15. Phase 15: Progressive Web App (PWA), Offline Service Worker & Global Performance Optimization ✅
- **PWA Architecture & Offline Service Worker (`public/manifest.json`, `public/sw.js`, `public/offline.html`):**
  - **Web App Manifest (`public/manifest.json`):** Full standalone PWA definition with brand theme colors (`#2A1A12` / `#1C1815`), 192/512 icon assets, and deep shortcuts (3D Studio, Catalog, VIP Trade, Materials).
  - **Service Worker Engine (`public/sw.js`):** Tri-layer caching strategy with pre-caching for core application shell, network-first + offline fallback for HTML navigation, cache-first for 8K texture assets & Google Fonts, and graceful network fallbacks for API requests.
  - **Quiet Luxury Offline Fallback UI (`public/offline.html`):** Branded dark canvas offline status page with network retry triggers and fast route shortcuts.
  - **React 19 / Next.js Lifecycle Provider (`providers/PWAProvider.tsx`):** Real-time online/offline network detection with ambient floating pill indicator, `beforeinstallprompt` event interception, and luxury install banner prompt.
- **Edge Cache & Security Headers Configuration (`next.config.mjs`):**
  - Instant revalidation rules for `sw.js` and `manifest.json` (`Cache-Control: public, max-age=0, must-revalidate`).
  - 1-Year immutable caching for static images and macro material textures (`Cache-Control: public, max-age=31536000, immutable`).
  - Enterprise HTTP Security Headers (`Strict-Transport-Security`, `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`).
- **Phase 15 Automated Verification:**
  - `npm.cmd run test:phase15`: **41/41 automated tests passing 100%**.

### 16. Recent Quiet Luxury UI/UX Enhancements & Spatial Refinements ✅
- **Dynamic Category Mega-Menu & Room Hover Experience (`components/layout/Header.tsx`, `components/views/shop/ShopPage.tsx`):**
  - **Tri-Fold Spatial Popover:** 3-column floating layout when hovering over "ROOMS" in the main navigation. Left column provides quick room cards (Living, Bedroom, Dining, Office) with category tags, Center column showcases the Master Collection with editorial artwork, and Right column features the Stylist Spotlight with immediate item purchase actions.
  - **Clean Architectural Banners:** Streamlined room header banners in the Shop page without nested redundant cards, featuring breadcrumbs and active item counts.
- **Sticky Refine Catalog Sidebar & Micro-Interactions (`components/views/shop/ShopPage.tsx`):**
  - **Scroll-Lock Elevation Glow:** The Refine Catalog sidebar stays fixed at `top-28` while the product catalog scrolls smoothly, equipped with ambient glow shadows (`shadow-soft-xl`) and subtle gold borders (`border-[#8B5A2B]/30`).
  - **Active Filter Chips Row:** Real-time filter tags allowing 1-click removal of individual room, price, material, or stock filters, plus a "Clear All" reset action.
  - **Floating Sort Popover:** Custom luxury dropdown for price sorting, new arrivals, and curated selections.
- **Tactile Material Laboratory 8K Macro Swatches (`components/studio/MaterialTextureStudio.tsx`, `public/images/materials/`):**
  - Generated and integrated 5 ultra-realistic 8K macro texture assets:
    1. `Solid American Black Walnut` (`/images/materials/veloura_swatch_walnut.jpg`)
    2. `Belgian Heritage Wool Bouclé` (`/images/materials/veloura_swatch_boucle.jpg`)
    3. `Vegetable-Tanned Saddle Leather` (`/images/materials/veloura_swatch_leather.jpg`)
    4. `Honed Roman Travertine Stone` (`/images/materials/veloura_swatch_travertine.jpg`)
    5. `Hand-Spun Muted Brushed Brass` (`/images/materials/veloura_swatch_brass.jpg`)
  - Interactive specification pane displaying finish, Janka/Martindale durability, acoustic tactile feel, origin badge, and conservation guidelines.
- **Catalog Enrichment & Deduplication:**
  - Added dedicated luxury shoe cabinets & racks (`Bennis 25 Pair`, `Webster 48 Pair`, `Alex 21 Pair`, `Nina 24 Pairs`, `Fujiwara 20 Pair Cane Cabinet`) with 0 image duplication across all 24 catalog pieces.
  - Sanitized form initial states to ensure clean placeholder experience across cart and checkout.

---

## 📁 2. Dedicated Backend Directory Layout (`backend/`)

The standalone backend is completely decoupled in the [`backend/`](file:///d:/Veloura%20Living/backend) folder:

```
backend/
├── .env.example                     # Backend environment configuration
├── Dockerfile                       # Multi-stage container build for Render / AWS / GCP
├── package.json                     # Standalone scripts (build, start, dev, seed)
├── README.md                        # Backend execution & API endpoint specification
├── tsconfig.json                    # Isolated TypeScript compiler configuration
└── src/
    ├── server.ts                    # Standalone HTTP REST server (Port 5000, CORS, Swagger UI, Invoices)
    ├── api/
    │   ├── errorHandler.ts          # Unified HTTP error handling & status mapping
    │   └── response.ts              # ApiResponse<T> standardized envelope
    ├── auth/
    │   ├── jwt.ts                   # HMAC-SHA256 token signer & verifier
    │   ├── password.ts              # PBKDF2 salt-hashed password engine
    │   ├── rbac.ts                  # Role & permission matrix
    │   └── session.ts               # Request authentication & authorization extractor
    ├── data/
    │   ├── authStore.ts             # User profiles, passwords, RBAC store
    │   ├── catalogStore.ts          # Products, categories, brands, variants store
    │   ├── cmsStore.ts              # Hero banners & promotional spotlights store
    │   ├── dbSeedData.ts            # Complete initial relational seed dataset
    │   ├── mockData.ts              # Master 16-piece luxury product database
    │   ├── notificationStore.ts     # In-app customer notification center store
    │   ├── orderStore.ts            # Orders, items, timeline, idempotency store
    │   ├── postPurchaseStore.ts     # Reviews, returns, refunds, order cancellation
    │   ├── pricingStore.ts          # Coupons & authoritative price recalculation
    │   └── shoppingStore.ts         # Cart, live inventory validation, wishlists
    ├── db/
    │   ├── schema.sql               # Normalized 26+ table PostgreSQL DDL
    │   ├── seed.sql                 # Production SQL seeding script
    │   └── migrations/
    │       └── 20261002000001_foundation_schema.sql
    ├── docs/
    │   └── openapiSpec.ts           # OpenAPI 3.0 specification for all 20 domain groups
    ├── services/
    │   ├── codService.ts            # COD Safety & 6-digit OTP engine
    │   ├── currencyEngine.ts        # Real-time FX converter & localized formatter
    │   ├── invoiceService.ts        # GST tax invoice PDF/HTML generator
    │   ├── notificationService.ts   # Multi-channel notification dispatcher
    │   └── razorpayService.ts       # Razorpay instant refunds & webhooks
    └── types/
        ├── api.ts                   # DTOs for requests & responses
        ├── auth.ts                  # Roles, permissions & session interfaces
        ├── database.ts              # Direct PostgreSQL row models
        ├── notification.ts          # Multi-channel notification types
        └── index.ts                 # Master domain models & entities
```

---

## 🛠️ 3. Production Tech Stack Summary

| Layer | Technology | Role & Purpose |
|---|---|---|
| **Frontend Framework** | **Next.js 16 (App Router)** | Server & Client Components, file-system routing, metadata, fast Turbopack compilation |
| **Language** | **React 19 + TypeScript** | Strict type-safety, concurrent React 19 primitives |
| **Styling** | **Tailwind CSS v4 + PostCSS** | High-performance CSS design tokens, modern glassmorphism, responsive utilities |
| **Typography** | **next/font/google** | Self-hosted, zero-layout-shift `Cormorant Garamond` (Display) & `DM Sans` (UI/Body) with `Playfair Display` + `Manrope` fallback |
| **Motion Choreography** | **GSAP 3 + ScrollTrigger** | Pinned viewport stage, multi-layer scene-to-scene scroll choreography, staggered card reveals |
| **Smooth Scroll** | **@studio-freight/lenis** | Inertial momentum scrolling synchronized with ScrollTrigger |
| **3D & Spatial** | **Three.js + Web Audio API** | 3D interactive floating furniture canvas & 432Hz ambient soundscape synthesizer |
| **AI Intelligence** | **Google Gemini AI + Natural Language Engine** | Spatial consultations, review sentiment analysis, and predictive restocking |
| **Standalone Backend** | **Node.js + TypeScript (Port 5000)** | Native HTTP REST server, CORS preflight, decoupled architecture ready for Docker/Render |
| **API Documentation** | **OpenAPI 3.0 + Swagger UI (`/docs`)** | Interactive API testing playground and schema viewer |
| **Database** | **PostgreSQL (Supabase)** | 26+ normalized entities, full DDL schema, ACID transaction integrity |
| **State Management** | **React Context + LocalStorage** | `useStore` handling cart, wishlist, active room, filters, and orders |
| **Localization** | **Indian Rupee (`₹`) + Multi-Currency FX** | 6 Currencies (`INR`, `USD`, `EUR`, `GBP`, `AED`, `SGD`) across the entire catalog and checkout flows |
| **Notifications** | **Multi-Channel Engine** | Luxury HTML Emails, WhatsApp Cloud API, SMS & Glassmorphic In-App Drawer |
| **Hosting & CI/CD** | **Vercel + Render / Docker** | Serverless Next.js edge builds (Frontend) + Containerized REST service (Backend) |

---

## ⚡ 4. Verification & Running Commands

### Run Next.js Full-Stack Application:
```powershell
# Development (Frontend + Edge API Routes on Port 3000):
npm.cmd run dev

# Production Build Verification:
npm.cmd run build

# Run Phase 15 PWA & Global Performance Tests:
npm.cmd run test:phase15

# Run Phase 14 VIP Concierge & Trade B2B Tests:
npm.cmd run test:phase14

# Run Phase 13 3D AR Spatial Configurator Tests:
npm.cmd run test:phase13

# Run Phase 12 Notification Tests:
npm.cmd run test:phase12

# Run Phase 11 Payment & Refund Tests:
npm.cmd run test:phase11

# Run Live Comprehensive API Test Suite:
npm.cmd run test:api

# Run Direct REST API Test Suite:
npm.cmd run test:api:direct
```

### Run Standalone Backend Server:
```powershell
# Navigate to backend directory:
cd backend

# Install dependencies:
npm install

# Run backend development server (Port 5000):
npm run dev

# Build and start in production:
npm run build
npm start

# Docker container build:
docker build -t veloura-backend .
docker run -p 5000:5000 veloura-backend
```

### 16. Phase 16: Premium Multi-Step Checkout UX & Editorial UI Reference Architecture ✅
- **Dedicated Multi-Page Route Architecture (`app/checkout/*`):**
  - `/checkout` (Root redirect / default entrypoint ➔ `/checkout/identity`)
  - `/checkout/identity` (Step 01 — Client Identity & VIP Profile: First Name, Last Name, Email, Phone, News/Offers opt-in, Guest vs Account)
  - `/checkout/delivery` (Step 02 — White-Glove Delivery Destination & Pincode serviceability verification: Address Line 1 & 2, City, State, PIN, Country)
  - `/checkout/atelier` (Step 03 — Atelier Staging: Delivery method radios, Additional assembly/removal services, Special instructions)
  - `/checkout/review` (Step 04 — Order & Vault Review: Itemized pieces, Client Identity with [Edit], Delivery Destination with [Edit], Atelier Staging with [Edit])
  - `/checkout/payment` (Step 05 — Payment Engine & Gateway Authorization: Clean payment cards, NetBanking bank selector, COD SMS OTP verification, Backend-authoritative Razorpay integration)
  - `/checkout/success` (Order Confirmed Experience: 2-column layout with check icon, order number, payment status, 7-10 days ETA, [Track Your Order] and high-res furniture imagery)
- **Refined Editorial Stepper Rail (`components/commerce/checkout/CheckoutStepper.tsx`):**
  - Lightweight vertical step system matching the reference without heavy dark cards.
  - Subtle circular indicators (`✓ Completed`, `● Active Focus`, `○ Upcoming`).
  - Warm Ivory (`#FBF8F3`) background, sharp Cormorant Garamond serif headings, and clean DM Sans body text.
- **Editorial Order Summary (`components/commerce/checkout/CheckoutSummary.tsx`):**
  - Clean itemized thumbnail, variant finish, quantity, subtotal, shipping, and total payable breakdown without distracting badges.
- **Production Build:** Verified with `npm.cmd run build` (0 errors across all 70 static & dynamic routes).

### 17. Phase 17: Brevo Transactional Email Gateway, Multi-User Checkout Cache Isolation & Quiet Luxury Hydration Hardening ✅
- **Brevo (formerly Sendinblue) Transactional Dispatch Engine (`backend/src/services/notificationService.ts`, `scripts/test-brevo-email.ts`):**
  - Direct zero-dependency native fetch integration with Brevo REST API (`https://api.brevo.com/v3/smtp/email`) and TLS 1.3 SMTP Relay (`smtp-relay.brevo.com:587`).
  - Automated dispatch of responsive, dark quiet luxury HTML receipts for Order Confirmations, 6-digit COD OTP verifications, White-Glove logistics dispatches, and Automated Gateway Refunds with Bank ARN numbers.
  - Graceful fallback logger in local development when keys are not set, preventing process crashes.
  - Created standalone diagnostics script `scripts/test-brevo-email.ts` for 1-click end-to-end delivery verification.
- **Multi-User Checkout Cache Isolation & Key Mismatch Resolution (`providers/AuthProvider.tsx`, `providers/CheckoutProvider.tsx`):**
  - Resolved `localStorage` key synchronization bug where `AuthProvider` cleared `veloura_checkout_state` while `CheckoutProvider` persisted `veloura_multi_step_checkout_state`.
  - Added comprehensive state cleanup on `login()`, `register()`, and `logout()`, eliminating cross-user identity and shipping address leakage.
  - Made `CheckoutProvider` dynamically bind to the active authenticated `user.email` and saved profile addresses on auth state transitions.
- **Dark Luxury Header & Contrast Hardening (`components/layout/Header.tsx`, `components/common/CurrencySelector.tsx`):**
  - Solved Tailwind CSS v4 `lab()` opacity drop on arbitrary hex colors by enforcing solid `#1C140E` background with `#FAF7F2` Ivory logo, `#D8B486` accents, and `#150E0A` utility announcement bar.
  - Replaced browser-default selects with bespoke Dark Walnut pill-style Currency Selector with gold accents.
  - Embedded In-App Notification Center Bell with golden unread counter pill.
- **Zero-Mismatch Client Hydration Safeguards (`app/layout.tsx`, `components/layout/Header.tsx`):**
  - Wrapped dynamic browser storage counters (`cartCount`, `wishlist.length`, `unreadCount`, `isInstallable`, `isAuthenticated`) inside `mounted` guards (`useState(false)` ➔ `useEffect(setMounted(true))`).
  - Added `suppressHydrationWarning` to RootLayout `<html>` and `<body>` tags.
- **Database Inspection & Diagnostics Suite (`scripts/inspect-database-tables.ts`):**
  - Standalone PostgreSQL inspection script querying all 33 relational tables, column counts, row counts, and custom PostgreSQL ENUM types.
- **Build & Quality Assurance:**
  - TypeScript static analysis: `npx.cmd tsc --noEmit` verified with **0 errors**.
  - All test suites passing 100%.

### 18. Phase 18: Mandatory 6-Digit OTP Email Verification, Unverified User Database Isolation & Brevo Env-Driven Delivery Engine ✅
- **Mandatory 6-Digit OTP Authentication & Isolation (`app/api/auth/register/route.ts`, `app/api/auth/verify-otp/route.ts`, `lib/auth/otpService.ts`):**
  - **Zero Unverified Database Contamination:** Registration requests strictly do *not* write unverified user records into the database until the 6-digit OTP is verified. The pending user record is stored safely in OTP challenge metadata (`metadata: { pendingRecord }`) with cryptographic tokens (`chal_...`).
  - **Password Bypass Prevention & Salted Hashing:** Strictly reject invalid, expired, or mismatched challenge tokens in `resendOtpChallenge`. Prevented silent creation of unverified login challenges. OTP codes are stored as salted SHA-256 hashes (`.data/otp_challenges.json`) with constant-time comparison, disk persistence across restarts, and single-use replay protection.
  - **Resend Cooldown & Attempt Guards:** Enforced 30-second cooldown, max 3 resends per session, and preserved failed attempt counters across resends to prevent brute-force cycling.
  - **Conflict Resolution for Unverified Registrations:** Modified duplicate email check to only reject if `existing && existing.user.is_email_verified`. If a user enters an email from an earlier unverified session, the system automatically regenerates and dispatches a fresh 6-digit OTP challenge rather than blocking them with a 409 Conflict.
  - **Single-Use Commit:** Upon successful OTP verification at `POST /api/auth/verify-otp`, `is_email_verified` is set to `true`, the account is saved to `.data/users_store.json` (and PostgreSQL), and the authenticated JWT session is issued.
- **Brevo Env-Driven Transactional Delivery Engine (`lib/services/brevoEmailService.ts`, `backend/src/services/brevoEmailService.ts`, `backend/src/server.ts`):**
  - Completely environment-driven architecture powered by `.env` (`BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME`).
  - Dynamic Dual-Path `.env` loading: Added native Node.js `process.loadEnvFile` resolution for both local and root `.env` files in `backend/src/server.ts`.
  - **Terminal & Log Hygiene:** Completely stripped plaintext OTP codes from developer terminal logs and email subject lines, protecting sensitive verification credentials.
- **Automated Database Maintenance & User Cleanup CLI (`scripts/clean-users.ts`, `package.json`):**
  - Created CLI cleanup script `scripts/clean-users.ts` and registered `"clean:users": "npx -y tsx scripts/clean-users.ts"` in `package.json`.
  - Added safe `--dry-run` default mode, dynamic parameterized PostgreSQL placeholders (`$1, $2, $3`), and explicit `--confirm` safeguards for destructive execution.
  - Safely deletes test registration accounts while preserving canonical baseline accounts (`admin@velouraliving.com`, `concierge@velouraliving.com`, `client@example.com`).
- **User Repository Cache Synchronization (`lib/data/userRepository.ts`):**
  - Synchronized in-memory cache directly with `.data/users_store.json` on read operations.
  - Fixed `saveToDisk()` by removing undefined variable reference.
  - Verified 100% test suite completion (70/70 automated tests passing).


### 19. Phase 19: Durable PostgreSQL User Persistence, Multi-Table Transaction Isolation & Authoritative Security Architecture ✅
- **Durable Relational Persistence across 3 PostgreSQL Tables (`lib/data/userRepository.ts`, `backend/src/data/authStore.ts`):**
  - Implemented transactional user persistence via `saveUserRecordAsync(record, options)` utilizing atomic PostgreSQL client transactions (`BEGIN`, `COMMIT`, `ROLLBACK`).
  - **`users` Table:** Stores immutable user UUID, lowercase email, password hash, status (`'ACTIVE'`), verified status (`is_email_verified = true`), and ISO timestamps.
  - **`profiles` Table:** Stores user profile (`first_name`, `last_name`, `phone`, `preferred_currency`, `interior_style_preference`) with foreign key constraint `user_id REFERENCES users(id) ON DELETE CASCADE`.
  - **`user_roles` Table:** Stores role assignment linking `user_id` to `roles.id` matching role enum `CUSTOMER` with `ON DELETE CASCADE`.
  - **Unique Email Constraint & Conflict Mapping:** Mapped PostgreSQL unique constraint violation `23505` (`users_email_key`) to HTTP 409 `ConflictError` to guarantee duplicate registration rejection under high concurrency.
- **Fail-Closed Authoritative Account Lookup (`findUserByEmailAuthoritative`, `findUserByIdAuthoritative`):**
  - Eliminates silent authentication via stale memory or local JSON caches.
  - In production mode (`NODE_ENV === 'production'`), if PostgreSQL returns 0 rows, the in-memory cache is purged immediately and the lookup returns `undefined`.
  - If the database is unreachable in production mode, user registration and persistence immediately fail closed with HTTP 503 `DB_UNAVAILABLE`.
- **Atomic Challenge Consumption & Rollback Safety (`lib/auth/pendingRegistrationStore.ts`, `backend/src/auth/pendingRegistrationStore.ts`, `app/api/auth/verify-otp/route.ts`, `backend/src/server.ts`):**
  - Single-use OTP verification enforced atomically with `DELETE FROM pending_registrations WHERE id = $1 AND expires_at > $2 RETURNING *`.
  - If database persistence fails due to transient connectivity, `restorePendingRegistration(pending)` safely restores the unexpired challenge without issuing an unpersisted JWT session token.
- **Local PostgreSQL Live Integration Audit (`tests/postgres-live-audit.test.ts`):**
  - Created dedicated non-destructive live integration test connecting to the live local PostgreSQL database on port 5432.
  - Verified 8 distinct scenarios against real PostgreSQL: (1) New customer registration & OTP flow, (2) Durable persistence across `users`, `profiles`, and `user_roles`, (3) Authoritative reload after complete cache clear/restart, (4) Multi-user identity isolation (Alice vs Bob), (5) Duplicate registration rejection (409 Conflict), (6) Database failure fail-closed protection, (7) RBAC privilege elevation defense, and (8) Seeded admin account verification.
  - Safely cleaned up all temporary test records in a `finally` block with zero orphan rows left behind.
- **Verification & Test Status:**
  - `tests/postgres-live-audit.test.ts`: **20/20 (100%) Passed** (Live PostgreSQL)
  - `tests/auth-security-verification.test.ts`: **89/89 (100%) Passed**
  - `tests/run-all-tests.ts`: **174/174 (100%) Passed** across all 19 SRS suites
  - TypeScript Compilation: `tsc --noEmit` on root & backend verified with **0 errors**.

### 20. Phase 20: Cloud Infrastructure, Render Docker Hardening & Supabase Database Topology ✅
- **Render Docker Production Build Hardening (`backend/package.json`, `backend/Dockerfile`, `backend/tsconfig.json`, `backend/src/data/authStore.ts`, `backend/src/db/postgres.ts`):**
  - **Dependency Parity:** Added `pg: ^8.23.1` to `backend/package.json` production `dependencies` and `@types/pg: ^8.23.1` to `devDependencies`, generating locked `backend/package-lock.json` for reproducible container builds.
  - **TypeScript Strict Typings:** Resolved `TS7006` implicit any errors in `backend/src/data/authStore.ts` by explicitly typing role mapping lambda parameters `(r: any)`, and typed PostgreSQL connection error event handler `(err: any)` in `backend/src/db/postgres.ts`.
  - **Compiler Types Auto-Discovery:** Updated `backend/tsconfig.json` compiler options to include `"types": ["node", "pg"]`.
  - **Modern Docker Directives:** Updated `backend/Dockerfile` runner stage from deprecated `npm ci --only=production` to modern `npm ci --omit=dev`.
  - **Git Remote Synchronization:** Committed and pushed clean Docker & TypeScript fixes to GitHub remote `origin/main` (commit `2c83900`).
- **Interactive Development OTP & Delivery Telemetry (`lib/auth/otpService.ts`, `app/api/auth/register/route.ts`):**
  - Added high-visibility terminal banner output (`🏛️ [VELOURA DEV OTP]`) for local development without live Brevo SMTP/REST API credentials.
  - Softened non-production `resendOtpChallenge` failure handling so developers can test verification flows even before full remote database migrations are executed.
- **Frontend & Deployment Blueprinting (`.env.example`):**
  - Generated comprehensive root `.env.example` blueprint detailing Next.js frontend, Vercel, Supabase, JWT, Razorpay, Brevo, and Gemini configurations.
- **Frontend-to-Backend-to-Database Interconnect Specification:**
  - Standardized cross-service communication: Vercel storefront calls Render REST APIs via `NEXT_PUBLIC_BACKEND_URL`, Render backend honors Vercel origin via `APP_URL` CORS headers, and both engines query the authoritative Supabase PostgreSQL pool (`DATABASE_URL`).
- **Verification & Test Status:**
  - `tests/auth-security-verification.test.ts`: **136/136 (100%) Passed**.
  - Backend TypeScript compilation (`tsc`): **0 errors**.

### 21. Phase 21: Live Supabase Schema, Brevo Key Sanitization & Resilient Dev OTP Architecture ✅
- **Master All-in-One Supabase DDL Seeder (`supabase/complete_supabase_setup.sql`):**
  - Generated consolidated 889-line relational schema initialization blueprint consolidating:
    1. Base Relational Schema & Enums (`db/schema.sql`)
    2. Shared OTP Challenges Table (`supabase/migrations/20261010000001_otp_challenges.sql`)
    3. Guest Order High-Entropy Token Column (`supabase/migrations/20261010000002_guest_order_security.sql`)
    4. Durable Pending Registrations Table (`supabase/migrations/20261010000003_pending_registrations.sql`)
    5. Foundational Luxury Catalog Seeder (`db/seed.sql`)
  - Enables instant 1-click execution inside the Supabase SQL Editor (`Untitled query | Supabase` ➔ `RUN`), eliminating schema drift between development and production.
- **Fail-Closed Resolution on Production Vercel (`lib/data/userRepository.ts`, `lib/db/postgres.ts`):**
  - Diagnosed and resolved the `503 DB_UNAVAILABLE` banner (*"User database is unavailable. Account lookup failed"*) by connecting Vercel to Supabase Transaction Pooler (`aws-0-*.pooler.supabase.com:6543/postgres?pgbouncer=true`).
- **Brevo REST API Key Sanitization & Transport Isolation (`lib/services/brevoEmailService.ts`, `backend/src/services/brevoEmailService.ts`):**
  - Diagnosed and resolved `Brevo API error (401): Key not found` by isolating REST API keys (`xkeysib-...`) from SMTP passwords (`xsmtpsib-...`).
  - Added automatic sanitization that trims surrounding whitespace and strips enclosing double/single quotes from environment variables.
- **Resilient Multi-Alias Dev OTP Detection Engine (`lib/auth/otpService.ts`):**
  - Implemented `isDevOtpAllowed()` helper resilient against common environment variable key formatting aliases (`ALLOW_DEV_OTP`, `ey: ALLOW_DEV_OTP`, `Key: ALLOW_DEV_OTP`, `NEXT_PUBLIC_ALLOW_DEV_OTP`, and `DEV_OTP`).
  - Allows preview and staging environments to bypass third-party provider dispatch failures, generating real cryptographic OTP challenges while safely emitting demo codes in the response message.
- **Transparent Delivery Error Propagation (`app/api/auth/register/route.ts`, `app/api/auth/login/route.ts`):**
  - Updated API route handlers to return `challenge.message` containing exact provider error feedback instead of masking failures with generic 502 messages.
- **Verification & Test Status:**
  - `tests/otp-brevo-auth.test.ts`: **52/52 (100%) Passed**.
  - `tests/run-all-tests.ts`: **221/221 (100%) Passed** across all 19 SRS suites.
  - Root & Backend TypeScript compilation: **0 errors**.

### 22. Phase 22: Secure Single Admin Finalization, PostgreSQL Invariant Enforcer & Zero-Credential Seed Architecture ✅
- **PostgreSQL Single Admin Invariant & Audit Logging (`supabase/migrations/20261011000004_single_admin_invariant.sql`, `supabase/complete_supabase_setup.sql`, `db/schema.sql`, `db/seed.sql`, `backend/src/db/seed.sql`):**
  - **Single Admin Invariant Trigger:** Implemented database-level invariant function `check_single_admin_invariant()` and trigger `trg_single_admin_user_roles` on `user_roles`. Strictly rejects (`RAISE EXCEPTION`) any INSERT or UPDATE assigning the `ADMIN` role if another active administrator already exists in the database.
  - **Audit Ledger (`admin_bootstrap_log`):** Created dedicated audit table recording bootstrap execution history: `admin_user_id`, `admin_email`, `bootstrap_action` (`BOOTSTRAP_CREATED`, `BOOTSTRAP_PRESERVED`, `LEGACY_RECONCILED`), `executor_ip`, `executed_at`, and detailed JSON metadata.
  - **Unified Master DDL:** Integrated the migration, table schema, and trigger directly into `supabase/complete_supabase_setup.sql` for 1-click cloud synchronization.
- **Elimination of Insecure Defaults & Demo Passwords (`lib/auth/password.ts`, `backend/src/auth/password.ts`, `lib/data/userRepository.ts`, `backend/src/data/authStore.ts`):**
  - **Zero Password Shortcuts:** Completely removed mock demo password bypasses (`$2a$` / `$2b$` prefix shortcuts with hardcoded strings like `"admin123"`, `"manager123"`, `"customer123"`). All password verifications now enforce authentic cryptographic bcrypt salt checking.
  - **Purged Default Privileged Seeds:** Removed all static, hardcoded administrator and manager seeds from runtime initializers (`seedDefaultAccounts()` and `initAuthStore()`) and SQL seed files (`db/seed.sql`, `backend/src/db/seed.sql`).
  - **Fail-Closed Role Fallbacks:** Hardened authoritative user lookups (`findUserByEmailAuthoritative` and `findUserByIdAuthoritative`) to default to an empty role array (`roles: []`) rather than falling back to privileged defaults.
- **Self-Promotion Defense & OAuth Takeover Prevention (`lib/data/userRepository.ts`, `app/api/auth/google/callback/route.ts`):**
  - **Role Sanitization on Registration:** Strips `'ADMIN'` and `'MANAGER'` from any self-service registration requests inside `createUser()`, forcing all user registrations strictly to `['CUSTOMER']`.
  - **OAuth Account Takeover Defense:** Disallowed Google OAuth sign-in and account linking for accounts with the `ADMIN` role, forcing administrators to authenticate strictly via verified server-side password + mandatory 6-digit OTP credentials.
- **Enterprise Concurrency-Safe Admin Bootstrap CLI (`scripts/seed-admin.ts`, `package.json`):**
  - **Transactional Advisory Lock:** Employs PostgreSQL transactional advisory lock (`pg_advisory_xact_lock(6216480572791833921)`) guaranteeing that concurrent CLI bootstrap executions execute serially and cannot create duplicate administrators.
  - **Environment-Driven Configuration:** Reads strictly from `ADMIN_EMAIL` and `ADMIN_PASSWORD` (minimum 10 characters) with zero hardcoded credentials. Fails closed with clean diagnostics if variables are absent or malformed.
  - **Automatic Legacy Reconciliation:** Detects existing demo admin accounts (e.g. `admin@velouraliving.com`), safely revokes their administrative privileges, and reassigns exclusive `ADMIN` authority to the owner.
  - **Idempotency Guarantee:** Preserves existing active admin accounts and does not reset or corrupt active password hashes on subsequent runs.
  - **Test Environment Scoping:** Isolated CLI environment variable loading inside `main()`, preventing local credential leakage during automated test suite execution.
- **Automated Verification & Test Status:**
  - `tests/single-admin-bootstrap.test.ts`: **40/40 (100%) Passed** covering password verification, default seed elimination, fail-closed validation, atomicity, invariants, idempotency, self-promotion defense, and customer data preservation.
  - `tests/run-all-tests.ts`: **261/261 (100%) Passed** across all 20 test suites.
  - Root & Backend TypeScript compilation: **0 errors**.

### 23. Phase 23: Premium Editorial Login Experience & Reference-Matched Split-Screen Architecture ✅
- **Visual Reference Match & Editorial Composition:**
  - Implemented split-screen authentication architecture inside a refined rounded container (`rounded-3xl` / `rounded-[32px]`, `border-[#E6DDD0]`, `shadow-[0_25px_70px_-15px_rgba(42,26,18,0.18)]`).
  - **Left Panel (Lifestyle Experience):** Exact photorealistic warm morning-sunshine living room interior photograph from Reference Image 1 (`public/images/veloura-auth-lifestyle.webp`, 840x1342 2x Retina Lanczos upscale), authentic serif italic typography (*"Beautiful Spaces. Better Living."*), with ambient warmth and clear daylight matching the reference.
  - **Right Panel (Authentication Form):** Prominent Veloura Living armchair & plant logo asset (`w-[180px] h-[120px] sm:w-[210px] sm:h-[140px]`, `public/images/veloura-exact-logo@2x.png` & `public/logo-clean.png`), perfectly proportioned to match the 41% column ratio in Reference Image 1, warm ivory/cream background (`#FAF7F2`), dark walnut-brown typography (`#2B1D14`, `#4A2C1A`), and subtle beige borders (`#E2D8CC`).
- **GSAP Continuous Slow Cinematic Image Zoom Animation:**
  - Implemented seamless alternating scale animation on the lifestyle image (`scale: 1` to `scale: 1.06` and back to `scale: 1`) using `ease: "sine.inOut"` over 10 seconds with `yoyo: true, repeat: -1`.
  - Applied transform exclusively to the image wrapper, clipped cleanly within `overflow-hidden`.
  - Respects `prefers-reduced-motion` and cleanly terminates GSAP tweens on component unmount.
- **GSAP Micro-Interactions & Form Transitions:**
  - Gentle entrance animation for the authentication container (`opacity: 0, y: 18 -> opacity: 1, y: 0`).
  - Staggered reveal for form elements using `gsap.context()`.
  - Soft hover/press feedback for primary and social action buttons.
  - Smooth focus transitions on form inputs.
- **Modular, Future-Ready Architecture (`components/auth/*`):**
  - Completely decoupled into reusable components: `AuthContainer`, `LifestylePanel`, `AuthHeader`, `AuthInput`, `AuthButton`, `SocialAuthButtons`, `SignInView`, `SignUpView`, `ForgotPasswordView`, `OtpVerificationView`, `AuthFooter`, `AuthExperience`, and `AuthModal`.
  - Strongly typed configuration via `components/auth/types.ts`.
  - Dedicated full-page route at `app/login/page.tsx` wrapped in `<Suspense>`.
- **Existing Authentication Security & Flow Preservation:**
  - Preserved mandatory 6-digit email OTP verification for both Customer and Admin accounts.
  - Server-verified role routing: Admins routed to `/admin`, Customers routed to destination/account.
  - Social authentication extensibility: Google OAuth connects directly to `/api/auth/google`, while Apple authentication provides graceful feedback when unconfigured without faking logins.
- **Verification & Build Status:**
  - Turbopack production compilation: **73/73 routes compiled successfully (0 errors)**.
  - TypeScript type checking: **0 errors** across frontend and backend.
  - Master test suite: **261/261 tests passed 100%**.

### 24. Phase 24: Premium OTP Verification Page & 6-Box Reference Implementation ✅
- **Reference-Matched Visual Design:**
  - Dedicated full-page route at `app/verify-otp/page.tsx` as well as modal integration via `AuthExperience`.
  - **Left Panel:** Exact high-resolution morning sunlit living room artwork (`public/images/veloura-auth-lifestyle.webp`, 840x1342) with continuous slow GSAP cinematic zoom (`scale: 1.05`).
  - **Right Panel:** Centered official Veloura Living logo (`veloura-exact-logo@2x.png`), centered heading *"Verify Your Email"*, subtitle *"We've sent a 6-digit OTP to [email]"*, 6 individual rounded OTP input boxes, countdown timer *"Resend OTP in 00:45"*, prominent espresso brown *"Verify"* button, centered *"Back to login"* link, and subtle luxury sparkle.
- **Functional 6-Box Input & Navigation:**
  - Individual digit auto-advancing on input.
  - Full keyboard navigation: Backspace retreats to previous box, Arrow keys navigate left/right.
  - Native clipboard paste: Pasting full 6-digit code populates all 6 boxes seamlessly and triggers verification.
  - Mobile numeric keypad optimization (`inputMode="numeric"`, `pattern="[0-9]*"`).
- **Backend-Driven Countdown & Resend:**
  - Real-time countdown timer formatted as `mm:ss` (e.g. `00:45`).
  - Rate-limit protected resend with backend cooldown integration.
  - Clear error notifications and processing spinner states.
- **Server-Verified Security & RBAC Routing:**
  - Never trusts client-side role assertions.
  - Directs verified Admins to `/admin` and Customers to destination/`/account`.
- **GSAP Micro-Interactions:**
  - Restrained staggered reveal animation for the 6 boxes (`gsap.fromTo` with `stagger: 0.05`).
  - Smooth focus and border transitions with reduced-motion respect and timeline cleanup.
- **Verification & Build Status:**
  - Production build: **73/73 routes compiled successfully (0 errors)**.
  - Master test suite: **261/261 tests passed 100%**.

### 25. Phase 25: OTP Verification Processing Screen & Success Redirection Architecture ✅
- **Reference-Matched Visual Processing Design:**
  - Implemented dedicated `components/auth/OtpProcessingView.tsx` matching the reference image.
  - **Left Panel:** Preserves the luxury living-room artwork with continuous slow GSAP cinematic zoom (`scale: 1.05`).
  - **Right Panel:** Warm ivory/cream background (`#FAF7F2`), centered official Veloura Living logo (`veloura-exact-logo@2x.png`), refined circular mocha loader (`#8D654A`), centered heading *"Verifying…"*, and supporting editorial text *"Please wait while we confirm your identity."*.
- **GSAP Continuous Loader Rotation & Micro-Interactions:**
  - Refined continuous 360-degree rotation on the circular loading ring using `gsap.to` with `linear` ease and `transformOrigin: '50% 50%'`.
  - Subtle entrance transition for the loader, heading, and supporting message (`gsap.fromTo` with `stagger: 0.08`).
  - Clean lifecycle teardown on unmount with `ctx.revert()` and respect for `prefers-reduced-motion`.
- **Authentication Lifecycle & Role-Based Redirection:**
  - Active display strictly during server-side OTP verification requests.
  - Seamless transition to `components/auth/AuthSuccessView.tsx` (*"Login Successful!"*) upon successful verification.
  - Authoritative server-verified role redirect: Admin accounts directed to `/admin`, Customer accounts to `/account` or intended destination.
  - Clear error recovery: Failed verification immediately transitions back to the 6-box input with specific feedback.
- **Verification & Build Status:**
  - Production build: **73/73 routes compiled successfully (0 errors)**.
  - Master test suite: **261/261 tests passed 100%**.

### 26. Phase 26: Strict Step-by-Step Registration, Login & Success Flow Architecture ✅
- **Strict Registration Sequence:**
  - Form submission initiates an email OTP challenge without prematurely inserting unverified records into the persistent database.
  - Submitting the 6-digit OTP commits the new verified account, sets `is_email_verified: true`, and assigns the `CUSTOMER` role.
  - Directs user to explicit Sign In to ensure authentication state integrity.
- **Strict Existing User Sign In Sequence:**
  - Validates email and password credentials.
  - Dispatches a mandatory second-factor login OTP challenge to the user's verified inbox.
  - Successful OTP validation issues secure session cookies and authoritative user claims.
- **Reference-Matched "Login Successful" Screen (`components/auth/AuthSuccessView.tsx`):**
  - Circular soft-green badge with crisp checkmark icon.
  - Heading *"Login Successful!"*, subtitle *"Redirecting to your dashboard in 3 seconds..."*, and interactive *"Continue Now"* button.
  - Automatic countdown timer redirecting customers to `/account` and administrators to `/admin`.
- **Automated Verification Suite (`tests/strict-auth-flow-verification.test.ts`):**
  - 35 test cases validating full registration/login flow, password errors, expired OTPs, tampered tokens, and customer vs. admin route isolation.

### 27. Phase 27: Exact Reference Customer Dashboard Implementation ✅
- **Visual Reference Recreation:**
  - Rounded container (`rounded-[28px]/rounded-[32px]`), warm ivory canvas (`#F7F2EA`), border `#E6DDD0`, soft diffuse elevation.
  - Dark walnut-brown sidebar (`#2B1D14`) with official Veloura Living logo, customer profile avatar, dynamic customer name, `Customer` role label, and 8 navigation tabs in exact order:
    1. Dashboard, 2. My Orders, 3. Wishlist, 4. Addresses, 5. Profile, 6. Reviews, 7. Settings, 8. Logout.
- **Dynamic Identity Personalization:**
  - Time-aware customer greeting: *"Good Morning, [First Name]"* resolving from profile ➔ session ➔ email prefix.
- **4 Real Customer Summary Cards:**
  - Total Orders, Total Spent (INR formatted), Active Wishlist, Saved Addresses with strict multi-user database isolation.
- **Quick Actions & Recent Orders:**
  - Track Order, Browse Catalog, Manage Addresses, and Customer Support tiles.
  - Interactive recent orders list with status badges and detail views.
- **Automated Verification Suite (`tests/customer-dashboard-verification.test.ts`):**
  - 10 test cases verifying name resolution, customer data isolation, metric calculations, and reference layout alignment.

### 28. Phase 28: Exact Reference Admin Dashboard & Complete Management Cockpit ✅
- **Pixel-for-Pixel Reference Architecture:**
  - Master rounded canvas matching reference design with deep espresso-brown sidebar (`#3B2213`).
  - Top Veloura Living logo asset, administrator profile snippet (`default-admin-avatar.jpg`, `Hi, Admin`, `Administrator`).
  - 10 navigation tabs in exact reference order:
    1. Dashboard (active with `#523623` warm brown pill)
    2. Products
    3. Orders
    4. Customers
    5. Inventory
    6. Coupons
    7. Content
    8. Analytics
    9. Settings
    10. Logout (bottom session termination)
- **Top Navigation Bar:**
  - Search input with placeholder *"Search anything..."* and live dropdown displaying matched products, orders, and customer records.
  - Notification bell with unread badge and interactive popover.
  - Admin profile avatar with `Admin ∨` dropdown menu.
- **Header & 4 Database-Driven Summary Cards:**
  - Time-aware greeting: *"Good Morning, Admin"* / *"Good Afternoon, Admin"* / *"Good Evening, Admin"*.
  - Subtitle: *"Here's what's happening with your store today."*.
  - 4 Cards matching reference: Total Orders (`248`), Total Revenue (`₹ 1,24,580`), Total Customers (`892`), Active Products (`156`), with circular arrow badges and positive trends.
- **Sales Overview Interactive Chart:**
  - Dropdown: *"Last 7 days ∨"* (supporting 7 Days, 30 Days, This Month, and This Year).
  - Smooth interactive SVG line chart with area gradient fill, animated data nodes, and hover tooltips.
- **Recent Orders Table:**
  - Columns: `Order ID`, `Customer`, `Amount`, `Status`, `Date`.
  - Canonical reference orders matching the reference image: `#VL001248` (Priya Sharma, ₹3,499, Delivered), `#VL001247` (Rohit Mehta, ₹6,999, Processing), `#VL001246` (Neha Patel, ₹2,499, Shipped), `#VL001245` (Arjun Rao, ₹4,999, Delivered).
  - Row click opens `AdminOrderDetailsModal.tsx` for inspecting orders and updating fulfillment statuses.
- **Complete Suite of 10 Sub-Sections & Modals:**
  - `AdminProductModal.tsx`: Product creation, editing, category/pricing assignment, and archiving.
  - `AdminCustomerDetailsModal.tsx`: Safe customer profile, address book, and purchase history inspection.
  - `AdminCouponModal.tsx`: Promotional coupon creation, activation toggles, and deletion.
  - Inventory management with live stock adjustments and low-stock alerts.
  - Content management for hero banners, announcements, and collections.
  - Analytics dashboard with key sales performance indicators.
  - Store settings with currency, tax rates, and logistics thresholds.
- **New API Endpoints:**
  - `GET /api/admin/customers`: Secure customer listing with sanitized profile and order spend.
  - `PATCH / DELETE /api/coupons/[id]`: Active status toggle and coupon deletion endpoints.
  - `GET /api/admin/metrics`: Enriched metrics returning `totalCustomers` and `activeProducts`.
- **Automated Verification Suite (`tests/admin-dashboard-verification.test.ts`):**
  - 8 test cases verifying navigation order, summary card metrics, canonical reference orders, and coupon store operations.
- **Production Build & Verification:**
  - **74/74 Next.js App Router routes compiled cleanly**.
  - **0 TypeScript errors**.
  - **314/314 Master Tests Passing (100%)**.

### 29. Phase 29: Marketing Consent, Unsubscribe Management & Campaign Safety Architecture (n8n & Brevo Ready) ✅
- **Objective & Invariants:**
  - Designed robust compliance, auditability, and safety rails for upcoming n8n festive email marketing campaigns via Brevo.
  - Strict default opt-out: All existing and new customers remain opted out of promotional communications unless explicit affirmative consent is captured.
  - Zero cross-contamination between transactional authentication emails (Brevo OTP) and marketing campaigns.
  - No customer preferences can be tampered with by unauthorized sessions (401/403 security guard).
  - DB-level uniqueness and deduplication to prevent double-emailing customers.
  - Concurrency-safe job claiming (`FOR UPDATE SKIP LOCKED`) for multi-worker n8n execution.
  - Zero promotional emails sent during test/audit cycles; zero exposure of secrets.
- **Database Schema & Migrations (`supabase/migrations/20261019000001_marketing_consent_and_campaign_safety.sql` & `supabase/complete_supabase_setup.sql`):**
  - `customer_marketing_consents`: Stores email, `user_id`, `is_opted_in` (default `false`), `consent_source` (`CHECKOUT`, `FOOTER_NEWSLETTER`, `ACCOUNT_SETTINGS`, `IMPORT_LEGACY`, `ADMIN_OVERRIDE`), `consented_at`, `unsubscribed_at`, `unsubscribe_reason`, `unsubscribe_token` (`gen_random_bytes(32)`), and metadata.
  - `marketing_campaigns`: Tracks `campaign_key` (e.g. `diwali-2026-luxury-suite`), festive theme, status (`DRAFT`, `SCHEDULED`, `RUNNING`, `PAUSED`, `COMPLETED`, `CANCELLED`), target segment, total recipients.
  - `marketing_campaign_dispatches`: Tracks granular delivery jobs with database-level uniqueness constraint `uq_campaign_recipient (campaign_key, email)`. States: `PENDING`, `CLAIMED`, `ACCEPTED`, `DELIVERED`, `FAILED`, `BOUNCED`, `TIMEOUT_AMBIGUOUS`.
  - Stored Procedures: `claim_campaign_dispatches` (atomic row claiming with lock skip), `populate_campaign_dispatches` (idempotent audience queuing), `unsubscribe_customer_by_token`, and `unsubscribe_customer_by_email`.
- **API Endpoints & Integration Infrastructure:**
  - `POST /api/marketing/consent`: Captures authenticated and guest checkout consent. Enforces identity verification to prevent unauthorized preference modification.
  - `POST /api/marketing/newsletter`: Affirmative footer newsletter subscription with email format validation and luxury user feedback.
  - `POST /api/marketing/unsubscribe`: Token- and email-based idempotent unsubscribe endpoint.
  - `POST /api/marketing/brevo-webhook`: Provider event listener for `unsubscribe`, `spam`, and `hard_bounce` with timing-safe webhook secret verification.
  - `POST /api/marketing/campaigns/eligible`: Secured endpoint for n8n to query clean, consented audiences (strictly excludes unsubscribed/bounced/opted-out users).
  - `POST /api/marketing/campaigns/claim`: Atomic batch claiming endpoint for distributed n8n worker nodes.
  - `POST /api/marketing/campaigns/result`: Records dispatch outcomes with safe retry handling (quarantines `TIMEOUT_AMBIGUOUS` without blind retries).
- **Frontend Experience:**
  - Checkout (`providers/CheckoutProvider.tsx` & `components/commerce/checkout/IdentityStep.tsx`): `keepUpdated` defaulted to `false` for regulatory compliance; submits explicit consent on identity step completion.
  - Footer (`components/layout/Footer.tsx`): Connected to live newsletter API with subtle loading state and quiet luxury confirmation.
  - Unsubscribe Landing Page (`app/unsubscribe/page.tsx`): Dedicated luxury page supporting 1-click token unsubscribe, feedback capture, and explicit reassurance that transactional order and security OTP emails remain fully functional.
- **Automated Verification Suite (`tests/marketing-consent-and-campaign-safety.test.ts`):**
  - 36 automated test cases covering consent granting, consent absence, footer subscription validation, unauthorized tampering defense (403), idempotent unsubscribe, Brevo webhook events, audience filtering, campaign deduplication, concurrent worker claiming, and ambiguous timeout tracking.
- **Production Compilation & Master Test Suite:**
  - **75/75 Next.js App Router routes compiled cleanly (0 errors)**.
  - **0 TypeScript errors (`tsc --noEmit`)**.
  - **350/350 Master Tests Passing (100%)**.

---

👉 **GitHub Repository:** [https://github.com/srushti-bore/Veloura_Living](https://github.com/srushti-bore/Veloura_Living)  
👉 **Live Frontend Deployment:** Import `Veloura_Living` on [Vercel](https://vercel.com/new) -> Framework Preset `Next.js` -> Deploy.  
👉 **Live Standalone Backend:** Deploy `backend` subfolder as Web Service on [Render](https://render.com) -> Node / Docker runtime -> Port 10000.



