# 🧩 Veloura Living — Component Hierarchy & Layout Guide

This document maps all React components across layout, views, interactive 3D viewports, commerce drawers, and modals.

---

## 🏛️ Component Architecture Map

```
components/
├── layout/
│   ├── Header.tsx                 # Consolidated 6-item navigation, Studio & Rooms dropdowns
│   └── Footer.tsx                 # Clean editorial footer, brand heritage & newsletter
│
├── views/
│   ├── home/
│   │   └── HomePage.tsx           # Hero comparison stage, curated rooms & signature pieces
│   ├── shop/
│   │   └── ShopPage.tsx           # Faceted catalog filters, product grid & search results
│   ├── product/
│   │   └── ProductDetailPage.tsx  # Product specs, swatch picker, 360 viewer & complete room
│   ├── configurator/
│   │   └── ConfiguratorStudioPage.tsx # Sticky 3D canvas + scrollable bespoke material customizer
│   ├── studio/
│   │   └── StudioPage.tsx         # 2D interactive architectural floor plan room planner
│   ├── rooms/
│   │   ├── RoomsPage.tsx          # Overview of all living spaces with atmosphere cards
│   │   └── RoomDetailPage.tsx     # Deep dive with interactive 32-point hotspot annotations
│   ├── collections/
│   │   └── CollectionsPage.tsx    # Aesthetic collections (Japandi, Wabi-Sabi, Italian Modern)
│   ├── journal/
│   │   └── JournalPage.tsx        # Architectural and craft editorial publications
│   ├── trade/
│   │   └── TradePortalPage.tsx    # B2B Trade registration, tier calculator & swatch box orders
│   ├── account/
│   │   └── AccountPage.tsx        # Patron orders, live shipment tracking & wishlist gallery
│   ├── checkout/
│   │   └── CheckoutPage.tsx       # 2-step checkout, COD OTP verification & address book
│   └── admin/
│       └── AdminDashboardPage.tsx # 7-tab operations console (Metrics, Orders, Stock, AI)
│
├── three/
│   └── configurator/
│       ├── ThreeStudioViewport.tsx # WebGL canvas, OrbitControls, lights & camera lerping
│       ├── ARPlacementModal.tsx    # Interactive spotlight QR container for WebXR & USDZ
│       ├── ConfiguratorSidebar.tsx # Scrollable parts and materials selector
│       └── ProceduralFurniture.ts  # Three.js procedural geometry models & joinery metadata
│
├── hero/
│   └── HeroComparisonSlider.tsx   # 60fps Day/Night split comparison slider
│
├── products/
│   ├── ProductCard.tsx            # Hover thumbnail, swatch preview & wishlist heart trigger
│   ├── Interactive360Viewer.tsx   # 36-frame rotational piece preview
│   └── HotspotPreviewModal.tsx    # Quick-view modal triggered from room scenes
│
├── commerce/
│   └── CartDrawer.tsx             # Slide-over cart, coupon validator, tax breakdown & checkout
│
├── ai/
│   └── AIShoppingAssistantDrawer.tsx # Chat interface, dimension advice & spatial recommendations
│
├── notifications/
│   └── NotificationCenterDrawer.tsx # Real-time notification list, test dispatcher & unread badges
│
├── auth/
│   ├── AuthModal.tsx              # Popover dialog container for authentication
│   ├── SignInForm.tsx             # PBKDF2 password sign-in form
│   ├── SignUpForm.tsx             # Patron registration with role assignment
│   └── ForgotPasswordForm.tsx     # Self-service password reset token flow
│
└── common/
    ├── CurrencySelector.tsx       # Multi-currency dropdown (INR, USD, EUR, GBP, AED, JPY)
    ├── LuxuryToast.tsx            # Warm espresso/gold animated notification toasts
    └── LuxuryCursor.tsx           # Subtle magnetic trailing custom luxury cursor
```

---

## 🎛️ Global React Providers (`providers/`)

All global contexts wrap the application in `app/layout.tsx`:

1. **`AuthProvider`**: Manages current user session, JWT tokens, profile data, address book, and permissions.
2. **`CurrencyProvider`**: Manages active currency (`INR`, `USD`, etc.), real-time conversion rates, and formatters (`formatPrice`).
3. **`NotificationProvider`**: Polls notifications API, tracks unread counts, and triggers toast popups.
4. **`PWAProvider`**: Captures `beforeinstallprompt`, registers Service Worker, and renders offline indicators.
5. **`AppProvider` (`useStore`)**: Unified shopping store (cart, wishlist, active filters, search query, AI conversation state).
6. **`SmoothScrollProvider`**: Lenis smooth momentum scrolling engine.
