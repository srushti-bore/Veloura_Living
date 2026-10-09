# Veloura Living — Software Requirements Specification (SRS)

| Field | Value |
|---|---|
| Product | Veloura Living — Luxury Furniture Intelligence Platform |
| Document version | 2.0 (Production Verified Baseline — Full 15-Phase Scope Implementation) |
| Date | 2026-10-08 |
| Status | ✅ Final & 100% Implemented (63 App Router Routes, Port 5000 Backend, 213+ Passing Automated Tests) |
| Basis | `Production_Ready_Ecommerce_Application_2026.md` plus **Veloura Architecture Decisions & 15-Phase Master Plan** |
| Delivery timeline | Fully Implemented, Verified & Production-Ready |

> **Note on source of truth.** This SRS document represents the authoritative functional and non-functional requirement specification for **Veloura Living**. All Must (MVP), Should, Could, and extended v2 roadmap features (COD with OTP, Automated Gateway Refunds, Multi-Currency FX, Multi-Channel Notifications, 3D AR Spatial Configurator, VIP Trade B2B Portal, and PWA Offline Engine) have been fully developed, verified, and integrated into the active codebase.

---

## Table of Contents

1. Introduction
2. Product Decisions Summary
3. Overall Description (Actors, Environment, Assumptions, Dependencies)
4. Constraints
5. System Architecture and Deployment
6. Functional Requirements (Core & Extended Modules)
7. AI Requirements
8. Non-Functional Requirements
9. Data Model Overview
10. API Overview
11. External Interfaces
12. Release Plan, 15-Phase Roadmap and Status
13. Out of Scope & Promoted Scope Reconciliation
14. Traceability Matrix
15. Open Items & Production Deployment Checklist
16. Glossary
17. Revision History

---

# 1. Introduction

## 1.1 Purpose

This document specifies the authoritative requirements for **Veloura Living**, a quiet-luxury e-commerce intelligence platform selling bespoke furniture, home decor, and architectural textiles. It serves as the single source of truth for design, systems architecture, business logic verification, and production acceptance.

## 1.2 Scope

Veloura Living is a **single-seller luxury atelier platform for domestic (India) and international clients**, covering:
- Master Catalog & SKU Variant hierarchy with 8K macro texture materials.
- Faceted discovery, natural language price parser, and persistent cart/wishlist engines.
- Authoritative server-side pricing, 18% GST (CGST/SGST vs IGST), and White-Glove logistics thresholds.
- Dual Checkout: Authentic Razorpay Test Mode with HMAC-SHA256 signature verification and Cash on Delivery (COD) with 6-digit SMS OTP verification.
- Order state machine, guest tracking tokens (90 days valid), category-specific returns, and automated Razorpay instant refunds (Acquirer ARN reconciliation).
- Multi-Channel Notification Engine (Responsive Luxury HTML Email, WhatsApp Cloud API, SMS, In-App Drawer).
- 3D AR Spatial Configurator & WebXR Studio with 3D calipers and exploded joinery.
- VIP Concierge & Trade B2B Portal with Project RFQ Builder and Swatch Sample Box orders.
- Progressive Web App (PWA) offline service worker and edge caching.
- Dedicated Node.js microservice (`backend/` on Port 5000) and Interactive Swagger UI (`/docs`).

## 1.3 Requirement Conventions

- **shall** = mandatory requirement. **should** = recommended. **may** = optional.
- Unique ID Format: `<MODULE>-<NNN>` (e.g., `PAY-003`, `3D-001`, `TRD-002`).
- **Priority (MoSCoW):** **M** = Must (MVP), **S** = Should, **C** = Could, **V2** = Extended Phase (Completed).
- Every requirement is backed by automated test suites and live API endpoints.

## 1.4 Module Prefixes

AUTH, RBAC, CAT, SRCH, INV, CART, WISH, CHK, PRC, PAY, ORD, SHP, CAN, RET, REV, CPN, MKT, NOT, CMS, SEO, DOC, ADM, ANL, AI, 3D, TRD, PWA, SEC, PRV, MED, OBS, TST, DEP, NFR.

---

# 2. Product Decisions Summary

| Area | Decision & Implementation Status |
|---|---|
| **Products sold** | Bespoke furniture, luxury home decor, architectural textiles |
| **Market** | India (Primary) + International (USD, EUR, GBP, AED, SGD) |
| **Business model** | Single seller luxury atelier with B2B Trade Partner Portal |
| **Project goal** | Production-ready luxury portfolio & real-world commercial platform |
| **Guest checkout** | Supported with email + phone + 90-day secure tokenized order lookup |
| **Payment gateway** | Razorpay (Authentic Test Mode + Cryptographic `timingSafeEqual` HMAC-SHA256 verification) |
| **Payment methods** | UPI, Credit/Debit cards, Net banking, and Cash on Delivery (COD with 6-digit OTP) |
| **COD Engine** | Implemented (₹2,500–₹1,50,000 range; ₹750 fee for <₹50,000; ₹0 waiver for ≥₹50,000) |
| **Shipping & Logistics** | Flat ₹199 (orders <₹2,999) / Free (≥₹2,999); White-Glove logistics thresholds; Fixed ₹5,000 International |
| **Tax & Invoicing** | GST-inclusive prices; Automated PDF/HTML GST Invoices with CGST/SGST/IGST breakdown and seller GSTIN |
| **Currency Engine** | Base INR with real-time dynamic conversion across 6 currencies (`INR`, `USD`, `EUR`, `GBP`, `AED`, `SGD`) |
| **Catalog hierarchy** | Category > Subcategory > Product > Variant > SKU (with 8K macro texture assets) |
| **Stock reservation** | 15-minute transactional lock at checkout start with automatic timeout release |
| **Cancellations** | Allowed until `PROCESSING` state with automatic inventory replenishment movement |
| **Returns & Refunds** | Category windows (Furniture 7d, Decor 10d, Textiles 14d) + Direct Automated Razorpay Gateway Instant Refunds |
| **Reviews & Ratings** | Verified purchase only; star rating aggregation; admin moderation queue |
| **Role Matrix** | Guest, Customer, Admin, Product Manager, Order Manager |
| **Notifications** | Multi-channel: HTML email, WhatsApp Cloud API formatter, SMS copy, In-App Drawer |
| **3D & AR Studio** | Three.js procedural 3D furniture, 8K PBR material swapper, 3D calipers, exploded joinery, WebXR/QuickLook |
| **Trade B2B Portal** | Tiered volume pricing (15%–25%), Project RFQ builder, Swatch Sample box, Concierge booking |
| **PWA & Offline** | Tri-layer Service Worker caching, standalone Web App Manifest, Quiet Luxury offline fallback UI |
| **Tech Stack** | Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4 + Three.js + Standalone Backend (Port 5000) + Supabase |

---

# 3. Overall Description

## 3.1 Product Perspective

Veloura Living operates on a **Dual-Engine Topology**:
1. **Frontend & Edge Engine (`http://localhost:3000`):** Next.js 16 App Router with React 19, Turbopack, 63 REST API route handlers, Three.js 3D Viewport, GSAP 3 scroll choreography, and Lenis smooth momentum scrolling.
2. **Standalone Backend Microservice (`http://localhost:5000`):** Native Node.js HTTP Server in `backend/` with unified error middleware, OpenAPI 3.0 specification, Docker containerization, and GST Tax Invoicing.
3. **Database & Storage:** Supabase PostgreSQL (26+ normalized entities with ACID integrity) and Supabase Storage for public/private media.

## 3.2 Actors and Roles

| Actor | Description | Key Capabilities |
|---|---|---|
| **Guest** | Unauthenticated visitor | Browse catalog, 3D Configurator, NL search, cart, guest checkout, 90-day tokenized order tracking |
| **Customer** | Authenticated user | Profile, address book, wishlist, order history, returns intake, review submission, In-App notification center |
| **Admin** | Master administrator | Executive KPI cockpit, user/role management, security gates, global settings, audit logs |
| **Product Manager** | Catalog operator | Categories, products, SKU stock balances, 8K materials swatches, CMS banners, AI restocking analytics |
| **Order Manager** | Fulfilment operator | Order status transitions, tracking milestones, return approvals, 1-Click Razorpay instant refunds, review moderation |

---

# 4. Constraints

| ID | Constraint |
|---|---|
| **CON-001** | **Scope & Quality.** All 15 master phases implemented with 0 TypeScript compilation errors and 100% test pass rate. |
| **CON-002** | **Notification Abstraction.** Multi-channel dispatcher supports luxury HTML Email templates, WhatsApp Business Cloud API, SMS, and In-App Drawer. |
| **CON-003** | **Multi-Currency & International Scope.** Real-time dynamic FX conversion and localized symbol formatting across 6 currencies with base charge in INR. |
| **CON-004** | **Dual Engine Runtime.** Full compatibility across serverless Next.js edge environments and standalone containerized Node.js servers (`backend/`). |
| **CON-005** | **Database Schema Integrity.** Normalized PostgreSQL schema with cascading foreign keys, check constraints, and migration scripts. |
| **CON-006** | **Zero Native Addon Dependencies.** 100% Web Crypto API (`crypto.subtle`) for PBKDF2 hashing and HMAC-SHA256 signing for Edge compatibility. |
| **CON-007** | **Zero-Bypass Payment Security.** Strict cryptographic signature verification (`timingSafeEqual`) on Razorpay orders; simulated bypasses blocked. |
| **CON-008** | **Authoritative Pricing.** All discounts, taxes, shipping fees, and subtotals calculated server-side; client price tampering is impossible. |

---

# 5. System Architecture and Deployment

```text
User Browser / Mobile Device / PWA
  |
  +---> Next.js 16 Storefront (Port 3000 / Vercel)
  |       |-- 63 Next.js App Router REST Routes (/api/*)
  |       |-- Three.js 3D Spatial Configurator
  |       |-- Interactive Swagger UI (/docs)
  |       |-- Slide-Out Glassmorphic Notification Center
  |
  +---> Standalone REST Backend (Port 5000 / Render / Docker)
          |-- Native HTTP REST Server (backend/src/server.ts)
          |-- GST Tax Invoice Engine
          |-- Multi-Channel Notification Dispatcher
          |
          +--> Supabase PostgreSQL Database (26+ Relational Tables)
          +--> Razorpay Gateway (Payments, Webhooks, Instant Refunds)
          +--> Google Gemini AI (Spatial Consultation & Sentiment)
          +--> Gmail SMTP (Transactional Email Dispatch)
```

---

# 6. Functional Requirements

## 6.1 Authentication (AUTH)
- **AUTH-001 (M):** Email + password registration with input validation.
- **AUTH-002 (M):** PBKDF2/SHA-256 salt-hashing (100,000 iterations); min 8 chars, 1 uppercase, 1 number.
- **AUTH-003 (M):** Email verification token flow with 24-hour validity.
- **AUTH-004 (M):** JWT token authentication (15-min access token, 7-day refresh token).
- **AUTH-005 (M):** Single-use password reset link with 30-minute expiration.
- **AUTH-006 (S):** Google OAuth login interface with 1-Tap fast authentication modal.
- **AUTH-007 (M):** Temporary account lock after 5 failed login attempts for 15 minutes.
- **AUTH-008 (S):** Privacy data export and account deletion request handling.

## 6.2 Roles & Permissions (RBAC)
- **RBAC-001 (M):** Role hierarchy (`GUEST`, `CUSTOMER`, `ADMIN`, `MANAGER`, `PRODUCT_MANAGER`, `ORDER_MANAGER`).
- **RBAC-002 (M):** Granular permission enforcement (`PRODUCT_CREATE`, `ORDER_UPDATE`, `REPORT_VIEW`, `REFUND_EXECUTE`).
- **RBAC-003 (M):** Backend authorization guards (`requireAuth`, `requireRole`, `requirePermission`).
- **RBAC-004 (M):** Executive Admin Security Gate on `/admin` restricting unauthorized guests.
- **RBAC-005 (M):** Complete audit logging for all privilege and role modifications.

## 6.3 Catalog & Materials (CAT)
- **CAT-001 (M):** Hierarchy: Category > Subcategory > Product > Variant > SKU.
- **CAT-002 (M):** Category metadata, ordering, room associations, and active flags.
- **CAT-003 (M):** Unique slug URLs, short/long descriptions, dimensions, weights, and specifications.
- **CAT-004 (M):** Variant attributes: Color, Size, Finish/Material with 8K macro texture swatches.
- **CAT-005 (M):** Variant pricing, stock balance, and availability states.
- **CAT-006 (M):** Product detail pages with price, GST note, SKU specs, and review aggregates.

## 6.4 Search & Discovery (SRCH)
- **SRCH-001 (M):** Multi-field keyword search across titles, descriptions, and materials.
- **SRCH-002 (S):** Faceted filtering: Room, category, price range, color, material, in-stock status.
- **SRCH-003 (S):** Sorting: Price Low-to-High, Price High-to-Low, Newest, Curated.
- **SRCH-004 (S):** Real-time autocomplete suggestions with category badges.
- **SRCH-005 (S):** Natural language price extractor (e.g. `"sofa under ₹80,000"`).

## 6.5 Inventory Engine (INV)
- **INV-001 (M):** Per-SKU tracking: `available`, `reserved`, `sold`, and `lowStockThreshold`.
- **INV-002 (M):** 15-minute stock reservation locking at checkout start.
- **INV-003 (M):** Strict concurrency protection preventing overselling or negative stock.
- **INV-004 (M):** Inventory movement audit trail (`PURCHASE`, `SALE`, `CANCELLATION`, `RETURN`, `ADJUSTMENT`).
- **INV-005 (M):** Manual stock adjustments with reason codes in Admin Cockpit.
- **INV-006 (S):** Automated low-stock alerts on dashboard.

## 6.6 Cart & Shopping (CART)
- **CART-001 (M):** Add, remove, update quantities with reactive price updates.
- **CART-002 (M):** Guest cart preservation and automatic merge on user login.
- **CART-003 (M):** Authoritative server-side price, tax, and shipping recalculations.
- **CART-004 (M):** Real-time inventory check preventing checkout of out-of-stock items.
- **CART-005 (S):** Coupon validation and discount application in slide-out Cart Drawer.
- **CART-006 (M):** Max quantity cap per SKU (10 units) to prevent inventory hoarding.

## 6.7 Wishlist (WISH)
- **WISH-001 (S):** Customer wishlist persistence across devices and sessions.
- **WISH-002 (S):** 1-Click "Move to Bag" action with availability checking.
- **WISH-003 (S):** Login prompt for unauthenticated guest interactions.

## 6.8 Authoritative Checkout (CHK)
- **CHK-001 (M):** Dual checkout support for authenticated Customers and Guests.
- **CHK-002 (M):** Address book integration and strict postal code / phone validation.
- **CHK-003 (M):** Server-side summary: 18% GST (CGST/SGST/IGST), coupon discount, logistics fee.
- **CHK-004 (M):** Terms & conditions acceptance guard before order generation.
- **CHK-005 (M):** Complete order summary with itemized tax and delivery line items.
- **CHK-007 (M):** Idempotency key registry preventing duplicate orders on network retries.

## 6.9 Pricing, Currency & Tax (PRC)
- **PRC-001 (M):** Base currency in INR (`₹`) with statutory GST-inclusive pricing.
- **PRC-002 (M):** Automatic GST breakdown (CGST + SGST for intra-state, IGST for inter-state).
- **PRC-003 (S):** Multi-Currency Dynamic Pricing Engine across 6 currencies (`INR`, `USD`, `EUR`, `GBP`, `AED`, `SGD`).
- **PRC-004 (S):** Real-time FX conversion with fallback exchange rate safeguards.
- **PRC-006 (M):** Admin-configurable logistics thresholds: Domestic Flat ₹199 / Free ≥₹2,999 / International ₹5,000.

## 6.10 Payments & Razorpay Engine (PAY)
- **PAY-001 (M):** Razorpay payment intent creation (`POST /api/payments/create-intent`) with authentic order IDs.
- **PAY-002 (M):** Separate entities for Order, Payment, and Payment Transaction ledger.
- **PAY-003 (M):** Payment state machine (`INITIATED`, `PENDING`, `SUCCESS`, `FAILED`, `REFUNDED`).
- **PAY-004 (M):** Cryptographic `timingSafeEqual` HMAC-SHA256 signature verification (`POST /api/payments/verify`).
- **PAY-006 (M):** Idempotent webhook listener (`POST /api/payments/webhook`) handling payment success/failure.
- **PAY-009 (V2):** **Cash on Delivery (COD) Engine:** ₹2,500–₹1,50,000 cart limit, handling fee rules, and 6-digit SMS OTP verification.

## 6.11 Orders & Post-Purchase (ORD / CAN / RET)
- **ORD-001 (M):** Atomic single-transaction order creation.
- **ORD-002 (M):** Lifecycle: `PLACED` ➔ `CONFIRMED` ➔ `PROCESSING` ➔ `SHIPPED` ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED`.
- **ORD-005 (M):** Guest tracking via Order Number + Email and 90-day secure tokenized link.
- **CAN-001 (M):** Customer cancellation allowed until `PROCESSING` state with automatic stock unlocking.
- **RET-001 (S):** Category return windows (Furniture 7 days, Decor 10 days, Textiles 14 days).
- **RET-007 (V2):** **Automated Razorpay Gateway Instant Refund API:** Direct refund execution with Acquirer Reference Number (ARN) logging.

## 6.12 Reviews & Ratings (REV)
- **REV-001 (S):** Verified purchase submission only (1–5 star rating + text review).
- **REV-002 (S):** Administrative moderation queue before public storefront display.
- **REV-003 (S):** Verified purchase badge and relative timestamps on approved reviews.
- **REV-004 (S):** Live star rating distribution and average score aggregation.

## 6.13 Multi-Channel Notifications (NOT)
- **NOT-001 (M):** Core transactional notifications: Registration, password reset, order placed, payment success.
- **NOT-004 (V2):** **Multi-Channel Notification Dispatcher:** Luxury HTML email builder, WhatsApp Business Cloud API format, SMS copy, and In-App Drawer.
- **NOT-006 (S):** Order lifecycle notifications: Shipped, out for delivery, delivered, refund credited.

## 6.14 Invoicing (DOC)
- **DOC-001 (S):** Automated GST Tax Invoice HTML/PDF generator with seller GSTIN, HSN codes, and CGST/SGST/IGST breakdown.
- **DOC-003 (S):** Sequential financial-year invoice numbering series (`VL-INV-2026-XXXX`).

## 6.15 3D AR Spatial Configurator & Studio (3D)
- **3D-001 (V2):** Three.js interactive 360° orbital 3D model viewer for modular signature furniture.
- **3D-002 (V2):** Real-time 8K PBR material swapper (Timbers, Bouclés, Leathers, Travertine, Brass).
- **3D-003 (V2):** Interactive 3D calipers (true-scale dimensions) and Exploded Joinery slider.
- **3D-004 (V2):** WebXR / iOS QuickLook USDZ / Android SceneViewer AR room placement bridge.

## 6.16 VIP Concierge & Trade B2B Portal (TRD)
- **TRD-001 (V2):** Tiered B2B Volume Discount Engine (Bronze 15%, Silver 20%, Gold 25%).
- **TRD-002 (V2):** Multi-room Project RFQ Builder with instant tax summary and quotation export.
- **TRD-003 (V2):** Physical 8K Swatch Sample Box order drawer with White-Glove tracking.
- **TRD-004 (V2):** VIP Concierge appointment booking with WhatsApp architect routing.

## 6.17 Progressive Web App & Offline Architecture (PWA)
- **PWA-001 (V2):** Standalone Web App Manifest (`public/manifest.json`) with luxury theme tokens.
- **PWA-002 (V2):** Tri-layer Service Worker (`public/sw.js`) with cache-first 8K textures and fonts.
- **PWA-003 (V2):** Quiet Luxury Offline Fallback page (`public/offline.html`) with network retry.
- **PWA-004 (V2):** Next.js 16 immutable static caching and enterprise HTTP security headers.

---

# 7. AI Requirements

- **AI-001 (C):** Natural language search intent extractor (room, color, price caps).
- **AI-002 (C):** Spatial shopping assistant drawer with catalog tool-calling.
- **AI-006 (C):** Review sentiment analysis and thematic topic classification.
- **AI-007 (C):** Predictive restocking recommendations based on sales velocity.
- **AI-008 (M):** Strict grounding in catalog database; zero synthetic product hallucinations.
- **AI-009 (M):** Prompt injection filtering and cross-user data isolation.
- **AI-010 (M):** Rate limiting (20 requests per minute) with graceful heuristic fallback.

---

# 8. Non-Functional Requirements

- **NFR-PERF-001 (M):** API response time p95 < 500 ms (Turbopack compilation in ~2.6s).
- **NFR-PERF-002 (S):** Storefront LCP < 2.5s on 4G networks; self-hosted Google Fonts (`Cormorant Garamond` + `DM Sans`).
- **NFR-REL-002 (M):** Financial idempotency for payments and refunds.
- **NFR-SEC-002 (M):** PBKDF2/SHA-256 password hashing; Enterprise HTTP security headers (HSTS, CSP, X-Frame-Options).
- **NFR-SEC-004 (M):** Cryptographic timing-safe signature comparison (`timingSafeEqual`).
- **NFR-MNT-003 (M):** Interactive OpenAPI 3.0 & Swagger UI documentation (`/docs`, `/api/openapi.json`).
- **NFR-TST-005 (M):** 213+ automated tests passing 100% across all modules.

---

# 9. Data Model Overview

26+ Normalized relational tables with PostgreSQL foreign keys and indexes:
- `users`, `roles`, `permissions`, `user_roles`, `customers`, `addresses`
- `categories`, `brands`, `products`, `product_variants`, `skus`, `materials`, `material_swatches`
- `inventory`, `inventory_movements`, `stock_reservations`
- `carts`, `cart_items`, `wishlists`, `wishlist_items`
- `orders`, `order_items`, `payments`, `payment_transactions`, `shipments`, `shipment_events`
- `returns`, `refunds`, `reviews`, `coupons`, `coupon_usages`
- `rfqs`, `rfq_items`, `swatch_box_orders`, `concierge_bookings`, `invoices`, `notifications`, `cms_banners`, `audit_logs`

---

# 10. API Overview

The platform exposes **63 Next.js App Router REST API routes** and **20 Standalone Backend route groups**:
- `/api/auth/*` (register, login, logout, me, forgot-password, reset-password)
- `/api/user/*` (profile, addresses)
- `/api/categories/*`, `/api/brands/*`, `/api/products/*`, `/api/variants/*`
- `/api/inventory/*`, `/api/search`
- `/api/cart/*`, `/api/cart/validate`, `/api/wishlist/*`
- `/api/coupons/*`, `/api/coupons/validate`, `/api/checkout/summary`
- `/api/payments/*` (create-intent, verify, webhook)
- `/api/orders/*` (list, details, cancel, cod-otp/send, cod-otp/verify)
- `/api/reviews/*`, `/api/returns/*`, `/api/refunds/*`
- `/api/currency/*` (rates, convert)
- `/api/notifications/*` (list, mark-read, delete, test-dispatch)
- `/api/trade/*` (register, status, rfq, swatch-box, quotation)
- `/api/concierge/book`, `/api/invoices/[orderId]`
- `/api/admin/metrics`, `/api/cms/banners/*`, `/api/ai/*` (chat, sentiment, restock-insights)
- `/api/openapi.json` & `/docs` (Swagger UI Playground)

---

# 11. External Interfaces

| Interface | Integration Method | Verification Status |
|---|---|---|
| **Razorpay** | REST API + Cryptographic HMAC-SHA256 verification | ✅ Verified (Test Mode + Instant Refunds) |
| **Google Gemini AI** | Google GenAI SDK with structured output & heuristic fallback | ✅ Verified (/api/ai/*) |
| **Gmail SMTP** | Multi-channel email service abstraction with HTML templates | ✅ Verified (notificationService) |
| **WhatsApp Cloud API** | Markdown formatter with concierge links | ✅ Verified (notificationService) |
| **SMS Gateway** | 160-char formatted text copy adapter | ✅ Verified (notificationService) |
| **Supabase PostgreSQL** | 26+ Tables schema and migrations | ✅ Verified (db/schema.sql) |
| **Three.js / WebXR** | 3D Spatial Canvas and USDZ/SceneViewer bridge | ✅ Verified (3D Configurator) |

---

# 12. Release Plan & 15-Phase Roadmap Status

| Phase | Milestone | Scope & Delivered Subsystems | Status |
|---|---|---|:---:|
| **Phase 1** | Foundation & Unified API | PostgreSQL schema (`db/schema.sql`), `ApiResponse<T>`, DTOs, seed scripts. | ✅ **Completed** |
| **Phase 2** | Auth & RBAC Engine | Web Crypto PBKDF2/JWT, 5-role matrix, session guards, Glassmorphic AuthModal. | ✅ **Completed** |
| **Phase 3** | Catalog & SKU Engine | `catalogStore.ts`, faceted filtering, 8K swatches, variant inventory balances. | ✅ **Completed** |
| **Phase 4** | Discovery & Shopping | Cart recalculation, 15-min stock locking, NL search, session-synced wishlist. | ✅ **Completed** |
| **Phase 5** | Authoritative Checkout | Server-side pricing, coupon validation, 18% GST (CGST/SGST), White-Glove logistics. | ✅ **Completed** |
| **Phase 6** | Payments & Orders | Concurrency reservation, order lifecycle state machine, Razorpay HMAC verification. | ✅ **Completed** |
| **Phase 7** | Post-Purchase & Returns | Verified reviews, return state machine, automatic restock audit, refunds ledger. | ✅ **Completed** |
| **Phase 8** | Admin Cockpit & Security | 7-tab Admin Cockpit, Executive Staff Login Gate, fulfillment dispatcher, CMS banners. | ✅ **Completed** |
| **Phase 9** | 2026 AI Intelligence | Gemini spatial consultant chat, review sentiment analyzer, restock predictor. | ✅ **Completed** |
| **Phase 10** | Standalone Backend & Swagger | Port 5000 Node server (`backend/`), OpenAPI 3.0 & Swagger UI (`/docs`), E2E suites. | ✅ **Completed** |
| **Phase 11** | Payment Automation & FX | Razorpay Instant Refunds (Acquirer ARN), COD Engine & 6-digit OTP, 6-currency FX. | ✅ **Completed** |
| **Phase 12** | Notification Engine | Luxury HTML emails, WhatsApp formatter, SMS copy, In-App Center Drawer. | ✅ **Completed** |
| **Phase 13** | 3D AR Spatial Configurator | Three.js 360° 3D viewer, 8K PBR material swapper, 3D calipers, exploded joinery, WebXR. | ✅ **Completed** |
| **Phase 14** | VIP Trade B2B Portal | Tiered volume pricing (15%–25%), Project RFQ builder, Swatch Box, Concierge booking. | ✅ **Completed** |
| **Phase 15** | PWA Offline & Performance | Tri-layer Service Worker, Web App Manifest, offline fallback page, edge caching headers. | ✅ **Completed** |

---

# 13. Out of Scope & Promoted Scope Reconciliation

The following table documents requirements originally deferred in early baseline v1 that were **successfully promoted and delivered in Veloura Living v2.0**:

| Feature Area | Original v1 Status | Current v2.0 Production Status |
|---|---|---|
| **Cash on Delivery (COD)** | Won't (v1) | ✅ **Delivered:** ₹2,500–₹1,50,000 range, fee logic, and 6-digit SMS OTP verification (`PAY-009`). |
| **Automated Gateway Refunds** | Won't (v1) | ✅ **Delivered:** Direct Razorpay instant refund dispatch with Acquirer ARN reconciliation (`RET-007`). |
| **Multi-Currency Dynamic Conversion** | Won't (v1) | ✅ **Delivered:** 6 currencies (`INR`, `USD`, `EUR`, `GBP`, `AED`, `SGD`) with Header Switcher (`CON-003`). |
| **Multi-Channel Notifications** | Won't (v1) | ✅ **Delivered:** HTML Email, WhatsApp, SMS, and Slide-Out In-App Center Drawer (`NOT-004`). |
| **3D AR Configurator & WebXR** | Won't (v1) | ✅ **Delivered:** Three.js procedural 3D models, 8K PBR swapper, 3D calipers, exploded joinery (`Phase 13`). |
| **B2B Trade Portal & RFQ Engine** | Won't (v1) | ✅ **Delivered:** 15%–25% Volume tiers, Project RFQ Builder, Swatch Box, Concierge Booking (`Phase 14`). |
| **PWA Offline Service Worker** | Won't (v1) | ✅ **Delivered:** Tri-layer caching, Web App Manifest, and offline fallback UI (`Phase 15`). |

---

# 14. Traceability Matrix

| Module Group | Requirement IDs | Primary Code Locations & Handlers | Automated Verification Suite |
|---|---|---|---|
| **Authentication & RBAC** | `AUTH-001–008`, `RBAC-001–005` | `lib/auth/jwt.ts`, `lib/auth/rbac.ts`, `app/api/auth/*` | `npm run test` (33/33 passed) |
| **Catalog & Materials** | `CAT-001–008` | `lib/data/catalogStore.ts`, `components/views/shop/*` | `npx tsx tests/verify-all-images.ts` |
| **Search & Discovery** | `SRCH-001–006` | `app/api/search/route.ts`, `components/views/shop/*` | `npm run test:api:direct` |
| **Inventory & Concurrency** | `INV-001–007` | `lib/data/shoppingStore.ts`, `lib/data/catalogStore.ts` | `npm run test` |
| **Cart & Pricing Engine** | `CART-001–006`, `PRC-001–006` | `lib/data/pricingStore.ts`, `lib/data/shoppingStore.ts` | `npm run test:phase11` (30/30 passed) |
| **Payments & COD OTP** | `PAY-001–010` | `lib/services/razorpayService.ts`, `lib/services/codService.ts` | `npm run test:phase11` (30/30 passed) |
| **Orders & Tracking** | `ORD-001–007`, `SHP-001–003` | `lib/data/orderStore.ts`, `components/views/orders/*` | `npm run test:api:direct` |
| **Returns & Instant Refunds** | `CAN-001–004`, `RET-001–007` | `lib/data/postPurchaseStore.ts`, `lib/services/razorpayService.ts` | `npm run test:phase11` (30/30 passed) |
| **Reviews & Ratings** | `REV-001–005` | `lib/data/postPurchaseStore.ts`, `app/api/reviews/*` | `npm run test` |
| **Multi-Channel Notifications** | `NOT-001–006` | `lib/services/notificationService.ts`, `NotificationCenterDrawer.tsx` | `npm run test:phase12` (27/27 passed) |
| **3D AR Configurator** | `3D-001–004` | `components/three/configurator/*`, `app/configurator/*` | `npm run test:phase13` (42/42 passed) |
| **VIP Trade B2B Portal** | `TRD-001–004` | `lib/data/tradeStore.ts`, `components/views/trade/*`, `app/trade/*` | `npm run test:phase14` (34/34 passed) |
| **PWA & Offline Service Worker** | `PWA-001–004` | `public/sw.js`, `public/manifest.json`, `providers/PWAProvider.tsx` | `npm run test:phase15` (41/41 passed) |
| **AI Intelligence Suite** | `AI-001–012` | `app/api/ai/*`, `components/ai/AIShoppingAssistantDrawer.tsx` | `npm run test:api:direct` |
| **Admin Cockpit & Metrics** | `ADM-001–006`, `ANL-001–004` | `components/views/admin/AdminDashboardPage.tsx`, `app/api/admin/*` | `npm run test:api:direct` |

---

# 15. Open Items & Production Deployment Checklist

All architectural TBDs are resolved. The following represents the operational checklist for live production launch:

| Item | Status | Operational Action |
|---|---|---|
| **Domestic & International Shipping** | ✅ **Resolved** | ₹199 Flat, Free ≥₹2,999; International ₹5,000 fixed. |
| **Return Windows** | ✅ **Resolved** | Furniture 7 days, Decor 10 days, Textiles 14 days. |
| **Max Quantity Per SKU** | ✅ **Resolved** | Capped at 10 units per SKU per order. |
| **Live Razorpay Credentials** | 🟡 *Production Config* | Provide live `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET` in production `.env`. |
| **Live Google Gemini API Key** | 🟡 *Production Config* | Provide `GEMINI_API_KEY` for real-time AI spatial chat. |
| **Live Gmail SMTP Credentials** | 🟡 *Production Config* | Provide `SMTP_USER` and `SMTP_PASS` for real customer email delivery. |
| **Supabase Remote Database** | 🟡 *Production Config* | Link remote PostgreSQL `DATABASE_URL` with migrations (`supabase/migrations/`). |
| **Seller GSTIN & Business State** | 🟡 *Production Config* | Set official merchant GSTIN & state address in settings (Demo: Maharashtra `27AAAAA0000A1Z5`). |

---

# 16. Glossary

- **Acquirer Reference Number (ARN):** Unique banking identifier issued to trace credit card/UPI refunds back to the customer's issuing bank.
- **PBR (Physically Based Rendering):** Three.js computer graphics approach that simulates real-world optical properties (roughness, metalness, normal maps) on 8K macro textures.
- **Timing-Safe Equality:** Constant-time comparison (`crypto.timingSafeEqual`) preventing timing side-channel attacks on cryptographic signatures.
- **Idempotency Key:** Unique transaction token ensuring duplicate network submissions do not generate repeated orders or duplicate refunds.
- **WebXR:** Standard Web API enabling mobile Augmented Reality (AR) spatial model projection directly in the browser.

---

# 17. Revision History

| Version | Date | Description |
|---|---|---|
| 1.0 | 2026-10-03 | Initial baseline specification covering reference e-commerce capabilities. |
| 1.1 | 2026-10-03 | Added numeric security thresholds, rate limits, return windows, and split priority matrices. |
| **2.0** | **2026-10-08** | **Production Verified Baseline:** Updated full 15-Phase roadmap completion, dual-engine topology (Next.js + Standalone Backend), Cash on Delivery (COD) + 6-digit OTP verification, Automated Gateway Instant Refunds (Acquirer ARN), Multi-Currency FX, Multi-Channel Notifications (HTML/WhatsApp/SMS/Drawer), 3D AR Spatial Configurator & WebXR, VIP Trade B2B Portal, and PWA Offline Service Worker. |

---

*Authored by Antigravity Engineering for Veloura Living — October 2026.*
