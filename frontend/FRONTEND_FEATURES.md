# 🚀 Veloura Living — 15-Phase Master Feature & Capabilities Matrix

A comprehensive breakdown of all features, capabilities, and interactive modules built across the Veloura Living frontend.

---

## 📋 Master Roadmap Breakdown

| Phase | Module Name | Primary Frontend Views & Components | Key Capabilities & Interactions |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **Foundational Architecture** | `RootLayout`, `AppProvider`, `Header`, `Footer` | Next.js 16 App Router, Lenis smooth scroll, Cormorant typography, responsive grids |
| **Phase 2** | **Hero Dual-Lighting Stage** | `HeroComparisonSlider`, `SceneChoreography` | 60fps frame-by-frame Day/Night comparison slider, ambient lighting shift |
| **Phase 3** | **Interactive Room Discovery** | `RoomScene`, `HotspotPreviewModal`, `RoomsPage` | 4 curated rooms, 32-point architectural hotspots, instant modal piece preview |
| **Phase 4** | **Catalog & Filter Engine** | `ShopPage`, `ProductCard`, `FilterSidebar` | Multi-criteria faceted filters (price, timber, category, color), URL query sync |
| **Phase 5** | **Product Detail Experience** | `ProductDetailPage`, `Interactive360Viewer` | Swatch selector, 360° rotational view, complete the room bundle recommendations |
| **Phase 6** | **Cart & Dynamic Pricing** | `CartDrawer`, `CurrencySelector` | Real-time tax & white-glove shipping calculator, promo codes (`LUXE10`), multi-currency |
| **Phase 7** | **AI Spatial Consultant** | `AIShoppingAssistantDrawer` | Real-time spatial styling assistant, room dimension tips, tailored product suggestions |
| **Phase 8** | **VIP Patron Auth Modal** | `AuthModal`, `SignInForm`, `SignUpForm` | Luxury 2-column modal, tabbed auth, PBKDF2 credential verification, lockout |
| **Phase 9** | **Checkout & Logistics** | `CheckoutPage`, `OrderTrackingTimeline` | 2-step checkout, COD 6-digit OTP verification, 4-stage logistics tracking |
| **Phase 10** | **Post-Purchase & Returns** | `AccountPage`, `InvoicePDFModal` | 7–14 day return window policy, GST tax invoice download, verified buyer reviews |
| **Phase 11** | **Payment & Gateway Refunds** | `PaymentGatewayModal`, `RefundTracker` | Razorpay ARN reconciliation, instant wallet credit, idempotency token validation |
| **Phase 12** | **Notification Engine** | `NotificationCenterDrawer`, `LuxuryToast` | Live unread badges, push toast dispatch, simulated SMS/WhatsApp delivery preview |
| **Phase 13** | **3D AR Spatial Configurator**| `ConfiguratorStudioPage`, `ThreeStudioViewport` | Real-time Three.js 3D viewport, 15 PBR materials, procedural models, WebXR AR |
| **Phase 14** | **VIP Concierge & Trade B2B** | `TradePortalPage`, `RFQCalculatorModal` | Tiered B2B discount matrix (15%-25%), CSV BOM exporter, swatch sample box orders |
| **Phase 15** | **PWA & Offline Performance**| `PWAProvider`, `ServiceWorker`, `offline.html` | Standalone app installation, offline cached fallback, 8K tactile texture caching |

---

## 🔍 Deep-Dive: Key Frontend Modules

### 1. Spatial 3D Configurator (`/configurator`)
* **Left Canvas**: `lg:sticky lg:top-20` smooth 3D viewport with auto-rotating studio podium, soft shadows, and OrbitControls.
* **Floating Controls**: 4 camera preset quick buttons (Front Angle, Top Architectural, 45° Hero, Detail Zoom) + Reset Orbit + AR Launcher.
* **Right Panel**: Scrollable piece selector (Sofa, Table, Credenza, Swivel Chair), material swatches grouped by category, live dimension breakdown, and itemized valuation receipts.

### 2. Header & Clean Navigation (`components/layout/Header.tsx`)
* **6-Item Primary Nav**: `Home`, `Rooms ▾`, `Shop`, `Studio ▾`, `Collections`, `Journal`.
* **Consolidated Studio Dropdown**: Integrates 2D Room Planner (`/studio`), Interactive 3D Studio (`/configurator`), and AR Spatial Preview into one intuitive menu.
* **Utility Top Bar**: Houses Warranty assurance, complimentary assembly promo, multi-currency selector, install app trigger, and Trade Portal link.
* **Right-Side Actions**: AI Consultant, Search bar, Wishlist counter, Notifications bell, User Profile popover, and Cart pill button.
