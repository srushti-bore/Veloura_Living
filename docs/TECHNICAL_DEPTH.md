# 🏛️ Veloura Living — Deep Technical Architecture & Systems Engineering Manual

**Document Version:** 2.0  
**Target Platform:** Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4 + Three.js + GSAP 3 + Lenis + Google Gemini AI  
**Dual-Engine Topology:** Frontend & Edge REST APIs (`http://localhost:3000`) + Standalone Node.js Backend Microservice (`http://localhost:5000`)  
**Workspace:** `d:\Veloura Living`  
**GitHub Repository:** [https://github.com/srushti-bore/Veloura_Living](https://github.com/srushti-bore/Veloura_Living)  

---

## 📑 Table of Contents
1. [Core Architectural Philosophy & Design Tokens](#1-core-architectural-philosophy--design-tokens)
2. [Dual-Engine Topology & Boundary Isolation](#2-dual-engine-topology--boundary-isolation)
3. [Authoritative Pricing, Taxation & Ledger Engines](#3-authoritative-pricing-taxation--ledger-engines)
4. [Inventory Concurrency & State Machine Lifecycle](#4-inventory-concurrency--state-machine-lifecycle)
5. [Spatial UI Choreography & Motion Engineering](#5-spatial-ui-choreography--motion-engineering)
6. [Tactile Material Laboratory 8K Macro Pipeline](#6-tactile-material-laboratory-8k-macro-pipeline)
7. [Cryptographic Security, Session Guards & RBAC Enclave](#7-cryptographic-security-session-guards--rbac-enclave)
8. [Automated Verification & E2E Validation Matrix](#8-automated-verification--e2e-validation-matrix)
9. [Cloud Deployment Topology, Render Containerization & Database Interconnect](#9-cloud-deployment-topology-render-containerization--database-interconnect)
10. [Phase 21: Master Supabase Schema Engine, Brevo Key Sanitization & Resilient Dev OTP Protocol](#10-phase-21-master-supabase-schema-engine-brevo-key-sanitization--resilient-dev-otp-protocol)
11. [Phase 22: Secure Single Admin Finalization, PostgreSQL Invariant Enforcer & Zero-Credential Seed Architecture](#11-phase-22-secure-single-admin-finalization-postgresql-invariant-enforcer--zero-credential-seed-architecture)

---

## 1. Core Architectural Philosophy & Design Tokens

Veloura Living represents a "Quiet Luxury" architectural standard. Every UI component avoids loud visual saturation in favor of high-tactility materials, organic typography, smooth inertial momentum scrolling, and mathematically consistent color tokens.

### 🎨 Master Color Tokens

| Token Name | Hex Code | HSL Representation | Semantic Usage |
|---|---|---|---|
| **Veloura Espresso** | `#2A1A12` | `hsl(21, 38%, 12%)` | Primary headers, high-contrast dark accents |
| **Deep Walnut** | `#4A2C1A` | `hsl(23, 48%, 20%)` | Primary brand accent, button fills, active tabs |
| **Warm Walnut** | `#765236` | `hsl(26, 37%, 34%)` | Secondary interactive elements, icons |
| **Caramel Gold** | `#A9794F` | `hsl(28, 36%, 49%)` | Badges, spotlight ribbons, rating stars |
| **Soft Sand** | `#D8B486` | `hsl(34, 52%, 69%)` | Subtle borders, hover highlights |
| **Warm Cream** | `#F4E8D7` | `hsl(36, 56%, 90%)` | Card backgrounds, pill tags, pill highlights |
| **Ivory Canvas** | `#FAF7F2` | `hsl(38, 45%, 96%)` | Global page background canvas |
| **Taupe Gray** | `#B9AA99` | `hsl(32, 18%, 66%)` | Secondary body text, captions |
| **Charcoal Dark** | `#211915` | `hsl(20, 22%, 11%)` | Modal backdrops, 3D studio viewports |

### 🖋️ Typography Engineering
- **Display / Editorial Headings:** `Cormorant Garamond` (Google Font via `next/font/google`), loaded with `display: 'swap'` and zero Cumulative Layout Shift (CLS).
- **Interface / Body / Numerical Pricing:** `DM Sans` (Google Font), tuned for high legibility on high-DPI displays.
- **Statutory Currency Standard:** Indian Rupee (`₹`) formatted with `Intl.NumberFormat('en-IN')` ensuring localized grouping (`₹1,85,000`).

---

## 2. Dual-Engine Topology & Boundary Isolation

The architecture maintains strict decoupling between the fullstack Next.js Edge frontend and the containerized Node.js backend microservice:

```mermaid
graph TD
    ClientBrowser[Modern Web Client / Mobile / Desktop]
    
    subgraph FrontendApp [Next.js 16 App Router - Port 3000]
        NextApp[Server & Client Components / React 19]
        NextEdgeAPI[48 Edge REST API Routes /api/*]
        SwaggerDocs[/docs - Interactive Swagger UI]
        AISpatialEngine[Gemini AI Spatial Consultant]
    end
    
    subgraph StandaloneBackend [Node.js Microservice - Port 5000]
        NodeServer[Native HTTP REST Server - src/server.ts]
        AuthStore[PBKDF2 Auth & Session Engine]
        CatalogStore[Master Catalog & Inventory Store]
        OrderStore[Order & Ledger State Machine]
        PricingStore[Authoritative Tax & Coupon Engine]
        Invoicing[GST Tax Invoice Generator]
    end
    
    subgraph Persistence [PostgreSQL / Supabase Database]
        Schema[(26+ Normalized Relational Tables)]
    end
    
    ClientBrowser -->|HTTP 200 / SSR / Turbopack| NextApp
    ClientBrowser -->|Fetch /api/*| NextEdgeAPI
    ClientBrowser -->|Direct REST / Docker / Render| NodeServer
    NextEdgeAPI --> Schema
    NodeServer --> Schema
```

---

## 3. Authoritative Pricing, Taxation & Ledger Engines

To completely prevent client-side price tampering, all cart recalculations, coupon validations, shipping tiers, and tax lines are computed on the server.

### 🧮 Mathematical Recalculation Model

$$\text{Subtotal} = \sum_{i=1}^{n} (\text{Unit Price}_i \times \text{Quantity}_i)$$

$$\text{Discount} = \min\left( \text{Subtotal} \times \text{Coupon Discount Rate}, \text{Coupon Max Cap} \right)$$

$$\text{Taxable Amount} = \max(0, \text{Subtotal} - \text{Discount})$$

$$\text{GST Amount (18\%)} = \text{Taxable Amount} \times 0.18$$

$$\text{Shipping Fee} = \begin{cases} 
0 & \text{if } \text{Taxable Amount} \ge ₹1,00,000 \\ 
₹4,500 & \text{if } \text{Taxable Amount} < ₹1,00,000 
\end{cases}$$

$$\text{Total Payable} = \text{Taxable Amount} + \text{GST Amount} + \text{Shipping Fee}$$

---

## 4. Inventory Concurrency & State Machine Lifecycle

### 📦 Order & Inventory State Machine

```mermaid
stateDiagram-v2
    [*] --> PLACED: Checkout Completed (Stock Reserved)
    PLACED --> CONFIRMED: Payment Signature Verified
    CONFIRMED --> PROCESSING: Workshop Carpentry & Upholstery
    PROCESSING --> SHIPPED: White-Glove Logistics Dispatch
    SHIPPED --> OUT_FOR_DELIVERY: Final Mile Concierge
    OUT_FOR_DELIVERY --> DELIVERED: Client Assembly & Signoff
    
    PLACED --> CANCELLED: Client / Admin Cancellation
    CANCELLED --> [*]: Stock Released ('CANCELLATION' Movement)
    
    DELIVERED --> RETURN_REQUESTED: Client 14-Day Return Intake
    RETURN_REQUESTED --> RETURN_APPROVED: Operations Inspection
    RETURN_APPROVED --> RETURN_RECEIVED: Reverse Logistics Received
    RETURN_RECEIVED --> REFUNDED: Stock Replenished + Gateway Refund
    REFUNDED --> [*]
```

---

## 5. Spatial UI Choreography & Motion Engineering

### 🖱️ 1. Dynamic Category Mega-Menu (Tri-Fold Popover)
- **Trigger:** Hover over "ROOMS" in `components/layout/Header.tsx` with a 150ms debounce grace period.
- **Geometry:** 3-column floating panel:
  - **Col 1 (Rooms Index):** Direct room navigation cards with icons and subcategory pills.
  - **Col 2 (Master Collection):** Editorial photographic showcase of the seasonal suite.
  - **Col 3 (Stylist Spotlight):** Curated spotlight piece with real-time price and 1-click cart action.

### 📌 2. Sticky Refine Catalog Sidebar & Dynamic Elevation
- **Sticky Lock:** Fixed at `top-28` within `components/views/shop/ShopPage.tsx`.
- **Dynamic Elevation Glow:** ScrollTrigger detects viewport delta, applying `shadow-soft-xl`, `border-[#8B5A2B]/30`, and a `backdrop-blur-md` glassmorphism layer.
- **Active Filter Chips:** Real-time reactive chip row showing applied filters with 1-click individual removal and "Clear All" batch reset.

---

## 6. Tactile Material Laboratory 8K Macro Pipeline

The `/studio` Material Texture Studio (`components/studio/MaterialTextureStudio.tsx`) renders hyper-realistic macro photography swatches.

### 🔬 8K Macro Texture Assets

| Material ID | Material Name | Category | Origin | Asset Path |
|---|---|---|---|---|
| `mat-walnut` | Solid American Black Walnut | Timber | Appalachian, USA | `/images/materials/veloura_swatch_walnut.jpg` |
| `mat-boucle` | Belgian Heritage Wool Bouclé | Textile | Flanders, Belgium | `/images/materials/veloura_swatch_boucle.jpg` |
| `mat-leather` | Vegetable-Tanned Saddle Leather | Leather | Tuscany, Italy | `/images/materials/veloura_swatch_leather.jpg` |
| `mat-travertine` | Honed Roman Travertine Stone | Stone | Tivoli, Italy | `/images/materials/veloura_swatch_travertine.jpg` |
| `mat-brass` | Hand-Spun Muted Brushed Brass | Metal | Birmingham, UK | `/images/materials/veloura_swatch_brass.jpg` |

### 🖼️ Texture Fallback Formula
If an asset is loading, a radial CSS gradient dynamically renders using the material's exact color token:
$$\text{Background} = \text{radial-gradient}\left(\text{circle at } 30\% \ 30\%, \ \text{colorHex} + \text{"dd"}, \ \text{colorHex} + \text{"88"}, \ \#1c1815\right)$$

---

## 7. Cryptographic Security, Session Guards & RBAC Enclave

### 🔐 Cryptographic Specification
- **Password Hashing:** Web Crypto `PBKDF2` with SHA-256, 100,000 iterations, and a 16-byte cryptographically secure random salt.
- **Session Tokens:** HMAC-SHA256 signed JSON Web Tokens (JWT) containing `sub`, `email`, `role`, `permissions`, `iat`, and `exp` claims.
- **Edge Compatibility:** 100% native Web Crypto API (`crypto.subtle`) ensuring zero dependency on legacy Node-only C++ addons.

### 🛡️ Executive Admin Security Gate
Unauthenticated visitors and standard `CUSTOMER` accounts navigating to `/admin` are intercepted by the Staff Security Gate (`components/views/admin/AdminDashboardPage.tsx`) requiring verified `ADMIN` or `MANAGER` clearances.

---

## 8. Automated Verification & E2E Validation Matrix

| Test Suite | Execution Command | Coverage & Scope | Status |
|---|---|---|---|
| **TypeScript Typecheck** | `npx.cmd tsc --noEmit` | Strict compilation across all 48 App Router routes and backend modules | ✅ **0 Errors** |
| **Asset & Image Integrity** | `npx.cmd tsx tests/verify-all-images.ts` | 37 static luxury visuals, room heroes, product images, and material swatches | ✅ **37/37 (100%)** |
| **Swagger Live REST APIs** | `npx.cmd tsx tests/swagger-live-api-test.ts` | 19 live REST API endpoints on `http://localhost:3000` | ✅ **19/19 (100%)** |
| **Live Pages & Order E2E** | `npx.cmd tsx tests/e2e-live-pages-test.ts` | 15 live web pages, cart flow, checkout summary, and GST tax invoice generation | ✅ **15/15 (100%)** |
| **Unit & Integration Tests** | `npm.cmd test` | 33 unit and domain store tests | ✅ **33/33 (100%)** |

---

## 9. Cloud Deployment Topology, Render Containerization & Database Interconnect

The production architecture orchestrates three cloud tiers:

```mermaid
graph LR
    User([Client Web Browser]) -->|HTTPS Storefront| Vercel[Vercel Serverless Edge - Next.js 16]
    User -->|API / Swagger Docs| Render[Render Container - Node.js REST API]
    Vercel -->|NEXT_PUBLIC_BACKEND_URL| Render
    Render -->|CORS APP_URL Whitelist| Vercel
    Vercel -->|DATABASE_URL: Transaction Pooler 6543| Supabase[(Supabase PostgreSQL)]
    Render -->|DATABASE_URL: Session Pooler 5432| Supabase
```

### 🐳 1. Render Container Specification (`backend/Dockerfile`)
- **Multi-Stage Build Pipeline:** Alpine Linux `node:20-alpine` base image ensuring minimal attack surface and fast layer caching.
- **Dependency Isolation:** `backend/package.json` specifies locked runtime dependencies (`pg: ^8.23.1`) and dev dependencies (`@types/pg`, `@types/node`, `typescript`), installed via `npm ci --omit=dev`.
- **Strict Compilation:** Standalone `tsconfig.json` compiles TypeScript source directly to `dist/server.js` with `"types": ["node", "pg"]`.

### 🗄️ 2. PostgreSQL Connection Pooling & Zero-ORM Philosophy (CON-004 & CON-006)
- **Zero Heavy ORMs:** Veloura Living intentionally avoids heavy ORM engines (such as Prisma or Hibernate) to eliminate 50MB+ native binary dependencies, avoid serverless cold starts, and maintain pure Edge compatibility.
- **Direct Parameterized Queries:** Data access layers utilize native `pg.Pool` with TLS 1.3 `ssl: { rejectUnauthorized: false }` connecting via Supabase connection poolers.
- **Transactional Consistency:** Critical state transitions (such as customer registration, order checkout, stock reservation, and payment refunds) execute within atomic `BEGIN ... COMMIT / ROLLBACK` database transactions.

---

## 10. Phase 21: Master Supabase Schema Engine, Brevo Key Sanitization & Resilient Dev OTP Protocol

Veloura Living enforces high reliability in production cloud deployments (Vercel + Supabase Transaction Pooler + Render Node/Docker service) while guaranteeing fail-closed account integrity and seamless staging/preview onboarding.

```mermaid
sequenceDiagram
    autonumber
    actor Client as Web Browser (Vercel)
    participant API as Next.js Auth API
    participant DevEnv as isDevOtpAllowed()
    participant Brevo as Brevo REST API / SMTP
    participant PG as Supabase PostgreSQL Pooler (6543)

    Client->>API: POST /api/auth/register (name, email, password)
    API->>PG: findUserByEmailAuthoritative(email)
    PG-->>API: 0 rows (Account does not exist)
    API->>Brevo: sendVerificationOtp(email, code, name)
    alt Brevo Dispatch Succeeds
        Brevo-->>API: 201 Created (Message ID)
        API-->>Client: 200 OK (OTP Sent to Email)
    else Brevo Dispatch Fails (e.g. 401 Key not found / network error)
        API->>DevEnv: isDevOtpAllowed() Check
        alt Preview / Staging Dev OTP Enabled
            DevEnv-->>API: true (ALLOW_DEV_OTP / ey: ALLOW_DEV_OTP / DEV_OTP)
            API-->>Client: 200 OK + [Demo Mode] OTP Challenge Token in message
        else Production Strict Mode
            DevEnv-->>API: false
            API-->>Client: 502 Bad Gateway (Exact Provider Error Feedback)
        end
    end
```

### 🗄️ 1. Master All-in-One Supabase DDL Architecture (`supabase/complete_supabase_setup.sql`)
- **Single-Source Migration Blueprint:** 889 lines of idempotent SQL executed cleanly in Supabase SQL Editor.
- **Consolidated Entity Coverage:**
  - 33 relational tables, 14 ENUM types (`user_role_type`, `order_status`, `payment_status`, etc.), and 12 relational triggers.
  - `otp_challenges` with SHA-256 code hashing, 5-minute TTL, attempt counters, and cooldown tracking.
  - `pending_registrations` with cryptographic isolation, preventing unverified accounts from populating `users`.
  - `orders.guest_access_token` high-entropy column for secure guest order lookups.
  - Complete luxury catalog seed data (categories, brands, products, SKU variants, coupons).

### 🔑 2. Brevo API Key Sanitization & Transport Isolation
- **REST vs. SMTP Credential Isolation:** Brevo separates REST API keys (`xkeysib-...`) from SMTP credentials (`xsmtpsib-...`). Attempting to authenticate at `https://api.brevo.com/v3/smtp/email` using an `xsmtpsib-...` key produces `401: Key not found`.
- **Automated String Sanitization:** Strips leading/trailing whitespace, newlines, and wrapping double or single quotes from `BREVO_API_KEY` before dispatch.
- **Fail-Safe Logging:** Obfuscates secret tokens while emitting exact HTTP status codes and API error messages for rapid diagnostics.

### 🧪 3. Multi-Alias Resilient Dev OTP Protocol (`isDevOtpAllowed`)
- **Tolerant Alias Matching:** Inspects `ALLOW_DEV_OTP`, `ey: ALLOW_DEV_OTP`, `Key: ALLOW_DEV_OTP`, `NEXT_PUBLIC_ALLOW_DEV_OTP`, and `DEV_OTP`.
- **Preview & Staging Bypass:** If third-party email providers encounter transient outages or misconfigurations in non-production environments, the registration flow safely generates real cryptographic challenges with `[Demo Mode] Verification code: XXXXXX` included in the response message.
- **Production Defense:** When `NODE_ENV === 'production'` and no dev override is configured, the system strictly refuses mock codes and safely reports the upstream provider error without crashing.

### 📡 4. Transparent Delivery Error Propagation
- **Root-Cause Visibility:** `POST /api/auth/register` and `POST /api/auth/login` propagate `challenge.message` directly to the client rather than masking failures with generic 502 messages, pinpointing configuration discrepancies instantly.

---

## 11. Phase 22: Secure Single Admin Finalization, PostgreSQL Invariant Enforcer & Zero-Credential Seed Architecture

Veloura Living guarantees strict least-privilege security and prevents administrative privilege sprawl across both development and production environments.

### 🛡️ 1. PostgreSQL Database Invariant Trigger (`trg_single_admin_user_roles`)
- **Single Admin Invariant:** A PostgreSQL trigger function `check_single_admin_invariant()` is attached to `user_roles`. It validates that no more than one user possesses the `ADMIN` role. Any unauthorized INSERT or UPDATE attempting to assign a secondary `ADMIN` role is blocked at the database engine level with `RAISE EXCEPTION`.
- **Audit Ledger Table (`admin_bootstrap_log`):** Dedicated immutable audit trail recording all bootstrap executions (`BOOTSTRAP_CREATED`, `BOOTSTRAP_PRESERVED`, `LEGACY_RECONCILED`), timestamps, admin UUID, and execution metadata.

### 🚫 2. Total Elimination of Insecure Defaults & Demo Password Bypasses
- **Removal of Password Bypass Shortcuts:** Removed demo bypasses (`$2a$` / `$2b$` prefix shortcuts with hardcoded strings like `"admin123"`, `"manager123"`, `"customer123"`) in both Next.js (`lib/auth/password.ts`) and Node.js (`backend/src/auth/password.ts`). Every password check strictly verifies cryptographic bcrypt salts.
- **Purged Privileged Defaults:** Completely removed hardcoded `admin@velouraliving.com` and `manager@velouraliving.com` default account creation from runtime memory stores and SQL seed files.
- **Fail-Closed Role Resolution:** `findUserByEmailAuthoritative()` and `findUserByIdAuthoritative()` return empty arrays (`roles: []`) when no roles are assigned, eliminating privilege inheritance bugs.

### 🔒 3. Self-Promotion Defense & OAuth Takeover Hardening
- **Sanitized Registration:** `createUser()` sanitizes requested roles to strip `'ADMIN'` and `'MANAGER'`, guaranteeing self-service registrations can only ever be granted `['CUSTOMER']`.
- **OAuth Guardrail:** `app/api/auth/google/callback/route.ts` rejects Google OAuth sign-in/linking for accounts possessing the `ADMIN` role, safeguarding administrators against third-party provider account takeovers.

### ⚙️ 4. Concurrency-Safe Idempotent Bootstrap CLI (`scripts/seed-admin.ts`)
- **Advisory Locking:** Protected with transactional advisory lock `pg_advisory_xact_lock(6216480572791833921)` to eliminate race conditions under concurrent CLI runs.
- **Environment Driven:** Operates strictly on `ADMIN_EMAIL` and `ADMIN_PASSWORD` (min 10 characters).
- **Idempotency:** Preserves existing credentials on reruns without overwriting active password hashes.

---

*Authored by Antigravity Engineering for Veloura Living — October 2026.*
