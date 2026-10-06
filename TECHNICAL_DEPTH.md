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
8. [Phase 11: Payment Automation, Automated Refunds & Multi-Currency Engine](#8-phase-11-payment-automation-automated-refunds--multi-currency-engine)
9. [Phase 12: Multi-Channel Notification Engine & In-App Notification Center Drawer](#9-phase-12-multi-channel-notification-engine--in-app-notification-center-drawer)
10. [Automated Verification & E2E Validation Matrix](#10-automated-verification--e2e-validation-matrix)

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

## 8. Phase 11: Payment Automation, Razorpay Test Mode, Automated Refunds & Multi-Currency Engine

### 💳 1. Authentic Razorpay Test Mode Order & Cryptographic Signature Engine (`PAY-001`, `PAY-002`)
- **Server-Side Order Intent Creation (`POST /api/payments/create-intent`):**
  - Communicates directly with official Razorpay API endpoint: `https://api.razorpay.com/v1/orders`.
  - Authenticates via Base64 encoded Basic Auth: `Basic Buffer.from(RAZORPAY_KEY_ID + ":" + RAZORPAY_KEY_SECRET).toString('base64')`.
  - Amount subunit validation: Converts order totals to paise ($₹ \times 100$) with server-side validation ensuring amount $> 0$.
  - Generates authentic Razorpay order identifiers (e.g., `order_TkWj2PHTG9yxhG`).
- **Cryptographic HMAC-SHA256 Signature Verification (`POST /api/payments/verify`):**
  - Computes message digest across concatenated order and payment identifiers:
    $$\text{Payload} = \text{razorpay\_order\_id} \parallel \text{"|"} \parallel \text{razorpay\_payment\_id}$$
    $$\text{Signature}_{\text{expected}} = \text{HMAC-SHA256}\left(\text{Payload}, \text{RAZORPAY\_KEY\_SECRET}\right)$$
  - Employs constant-time byte comparison (`crypto.timingSafeEqual`) to prevent side-channel timing analysis attacks.
  - Strictly ignores unverified client status strings; only cryptographically matching signatures allow state progression to `PaymentStatus: 'Paid'`.
- **Zero-Bypass Client Execution:**
  - Removed all fake payment simulations (`pay_test_*`, `sig_test_*`, `rzp_test_veloura_living_demo`).
  - Strict requirement of active Razorpay Checkout SDK initialization before launching payment dialog.

### ⚡ 2. Direct Automated Razorpay Gateway Refund Engine (`RET-007`)
- **Direct Refund Dispatch:** Interacts directly with `POST /v1/payments/:id/refund` transmitting JSON payload:
  ```json
  {
    "amount": 7800000,
    "speed": "optimum",
    "notes": { "order_number": "VL-2026-8941" },
    "receipt": "rcpt_return_8941"
  }
  ```
- **Auditing & Reconciliation:** Stores `gateway_refund_id` (e.g. `rfnd_xxx`), `gateway_arn` Acquirer Reference Number, and refund speed (`optimum` / `normal`).
- **Webhook Integration:** `POST /api/payments/webhook` listens for `refund.processed` and `refund.failed` to update the refund status and alert operations staff.

### 🛡️ 2. Cash on Delivery (COD) Safety Engine & OTP Protocol (`PAY-009`)
- **Eligibility Window:** Orders must have a taxable amount between ₹2,500 and ₹1,50,000.
- **Handling Fee Rules:** Orders $< ₹50,000$ incur a ₹750 logistics handling fee; orders $\ge ₹50,000$ receive a complimentary fee waiver ($₹0$).
- **Cryptographic OTP Verification:** Dispatches a 6-digit one-time passcode with 10-minute validity via `POST /api/orders/cod-otp/send`, verified securely at checkout before order creation.

### 💱 3. Multi-Currency FX Engine (`CON-003`)
- **Conversion Matrix:** Real-time conversion formula with locale formatting:
  $$\text{Converted Amount} = \text{round}\left( \text{Amount in INR} \times \text{Exchange Rate} \right)$$
- **Supported Currency Matrix:**
  | Currency Code | Symbol | Rate from INR | Format Locale | Sample ₹1,00,000 |
  |---|---|---|---|---|
  | `INR` | ₹ | 1.0 | `en-IN` | ₹1,00,000 |
  | `USD` | $ | 0.01188 | `en-US` | $1,188.00 |
  | `EUR` | € | 0.01093 | `de-DE` | 1.093,00 € |
  | `GBP` | £ | 0.00911 | `en-GB` | £911.00 |
  | `AED` | AED | 0.04365 | `en-AE` | AED 4,365.00 |
  | `SGD` | S$ | 0.01545 | `en-SG` | $1,545.00 |

---

## 9. Phase 12: Multi-Channel Notification Engine & In-App Notification Center Drawer

### 📬 1. Multi-Channel Notification Dispatcher Architecture
The notification subsystem (`lib/services/notificationService.ts` & `backend/src/services/notificationService.ts`) handles orchestrated multi-channel broadcasts across 4 specialized adapters:

```mermaid
graph LR
    Trigger[Order / Refund / VIP Event] --> NotifService[NotificationService Dispatcher]
    NotifService --> InAppAdapter[In-App Ledger Store]
    NotifService --> EmailAdapter[Responsive Luxury HTML Email]
    NotifService --> WhatsAppAdapter[WhatsApp Cloud API Formatter]
    NotifService --> SmsAdapter[SMS Gateway Copy Formatter]
    InAppAdapter --> ClientDrawer[Slide-Out Drawer & Header Bell]
```

### ✉️ 2. Luxury HTML Email Template Specification
- **Visual Design:** Dark slate `#1c1815` body, `#2a201a` inner container, `#8B5A2B` gold accents, inline CSS compatibility across Apple Mail, Gmail, and Outlook.
- **Header:** Golden serif Veloura Living Atelier branding with tagline.
- **Action Area:** High-contrast luxury CTA button linked directly to the order tracking or concierge landing URL.
- **Statutory Footer:** White-Glove logistics assurance, Atelier Milan address, and instant assistance contacts.

### 📱 3. WhatsApp & SMS Copy Formatters
- **WhatsApp Cloud API:** Markdown styling (`*bold*`, `_italic_`), emoji accents (`🏛️`, `📦`, `✨`, `💳`), order IDs, and concierge tracking links.
- **SMS Copy:** Compact 160-character budget with `[VELOURA]` sender identifier and essential tracking URL.

### 🗄️ 4. In-App Notification Center Drawer & State Management
- **Slide-Out Drawer:** Glassmorphic side drawer (`components/notifications/NotificationCenterDrawer.tsx`) featuring 4 category tabs (`ALL`, `ORDERS`, `VIP`, `REFUNDS`).
- **Reactive State:** `NotificationProvider` with 30s polling cycle and optimistic unread badge calculation (`components/layout/Header.tsx`).
- **Batch Actions:** 1-Click `markAllNotificationsAsRead` and `clearAllNotifications` clearing operations.

---

---

## 10. Phase 13: 3D AR Spatial Configurator & Procedural Three.js Studio
- **Procedural 3D Geometry Generators (`components/three/configurator/furnitureModels.ts`):** Dynamic construction of 4 modular signature pieces (*Serpentine Sofa*, *Aurelia Table*, *Fujiwara Cabinet*, *Zenith Lounge Chair*) with isolated part mesh topologies.
- **Real-Time 8K PBR Material Shader Engine (`lib/data/configuratorMaterials.ts`):** 15 curated luxury materials with PBR physical properties (roughness, metalness, normal mapping).
- **Interactive Spatial Tools:** 360° orbital camera with inertia damping, 4 lighting environment presets, true-scale 3D calipers overlay, and exploded joinery expansion slider.
- **WebXR & QuickLook Bridge (`lib/services/arBridgeService.ts`):** QR code generation and iOS QuickLook USDZ / Android SceneViewer bridge.

---

## 11. Phase 14: VIP Concierge & Trade B2B Portal Architecture
- **Tiered Volume Pricing Engine (`lib/data/tradeStore.ts`):** Automatic tier calculation (Bronze 15%, Silver 20%, Gold 25%) based on commercial project scope.
- **Project RFQ Builder (`components/views/trade/TradeRFQBuilderModal.tsx`):** Multi-room Bill of Materials builder with instant tax computation and PDF/HTML quotation output.
- **Physical Swatch Sample Box Pipeline (`components/views/trade/SwatchBoxOrderDrawer.tsx`):** Client selection for up to 5 physical 8K swatches with White-Glove logistics tracking.
- **VIP Concierge Consultation Gate (`components/views/trade/VIPConciergeBookingModal.tsx`):** Calendar appointment scheduler with dedicated Trade Architect assignment and instant WhatsApp Concierge routing.

---

## 12. Phase 15: Progressive Web App (PWA) Offline Engine & Edge Cache Architecture
- **Web App Manifest (`public/manifest.json`):** Standalone PWA declaration with brand tokens (`#2A1A12` / `#1C1815`) and deep shortcuts.
- **Service Worker (`public/sw.js`):** Tri-layer caching strategy (Pre-cache application shell, Network-first + offline fallback for HTML, Cache-first for 8K textures and fonts, API fallback).
- **Offline Spatial UI (`public/offline.html`, `providers/PWAProvider.tsx`):** Offline status pill indicator and beforeinstallprompt installation prompt.
- **Next.js 16 Edge Headers (`next.config.mjs`):** 1-year immutable caching for static assets, immediate revalidation for SW/manifest, and enterprise HTTP security headers.

---

## 13. Automated Verification & E2E Validation Matrix

| Test Suite | Execution Command | Coverage & Scope | Status |
|---|---|---|---|
| **TypeScript Typecheck** | `npx.cmd tsc --noEmit` | Strict compilation across all 63 App Router routes and backend modules | ✅ **0 Errors** |
| **Phase 15 PWA & Performance** | `npm.cmd run test:phase15` | Web App Manifest, Service Worker Caching, Offline Fallback, Security Headers | ✅ **41/41 (100%)** |
| **Phase 14 VIP Trade & RFQ** | `npm.cmd run test:phase14` | Tiered Discounts, RFQ Builder, Swatch Box Order, VIP Concierge, Quotation Generator | ✅ **34/34 (100%)** |
| **Phase 13 3D AR Configurator** | `npm.cmd run test:phase13` | Three.js Models, PBR Materials, 3D Calipers, Exploded Joinery, AR Intent Bridge | ✅ **42/42 (100%)** |
| **Phase 12 Notification Suite** | `npm.cmd run test:phase12` | HTML Emails, WhatsApp/SMS Templates, In-App Drawer Ledger, Lifecycle Triggers | ✅ **27/27 (100%)** |
| **Phase 11 Payment Suite** | `npm.cmd run test:phase11` | FX Engine, COD Safety, OTP Verification, Direct Gateway Refunds & COD Checkout | ✅ **30/30 (100%)** |
| **Direct REST APIs** | `npm.cmd run test:api:direct` | 39 direct REST API endpoints tested against live Next.js App Router handlers | ✅ **39/39 (100%)** |
| **SRS Unit & Integration Tests** | `npm.cmd test` | 33 unit and domain store tests | ✅ **33/33 (100%)** |

---

*Authored by Antigravity Engineering for Veloura Living — October 2026.*
