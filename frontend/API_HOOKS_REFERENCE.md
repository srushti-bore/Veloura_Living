# 🔌 Veloura Living — Frontend API Hooks & Data Store Reference

This document catalogs all client-side React hooks, global state stores, and REST API integration endpoints utilized throughout the Veloura Living frontend.

---

## 🪝 Global React Hooks

### 1. `useStore()` (`@/providers/AppProvider`)
The core commerce and interaction hook.

```typescript
const {
  // Navigation
  currentPath,
  navigate,

  // Shopping Bag
  cart,
  cartCount,
  cartSubtotal,
  cartTotal,
  isCartOpen,
  setIsCartOpen,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
  appliedCoupon,
  applyCouponCode,

  // Wishlist
  wishlist,
  toggleWishlist,
  isWishlisted,

  // Orders
  orders,
  createOrder,

  // AI Spatial Consultant
  aiMessages,
  isAIOpen,
  setIsAIOpen,
  isAIThinking,
  sendAIMessage,

  // Catalog Discovery & Filters
  filters,
  setFilters,
  searchQuery,
  setSearchQuery,
  resetFilters,
  allProducts,
  rooms
} = useStore();
```

---

### 2. `useAuth()` (`@/providers/AuthProvider`)
User identity, authentication modal control, and administrative role gating.

```typescript
const {
  user,              // UserSession object (id, email, roles, status)
  profile,           // DbProfile (firstName, lastName, phone, avatarUrl)
  addresses,         // DbAddress[] (Shipping and billing addresses)
  isAuthenticated,   // Boolean flag
  isAdmin,           // Boolean flag (role === 'admin' || 'superadmin')
  isManager,         // Boolean flag (role === 'store_manager')
  isAuthModalOpen,   // Boolean
  authModalView,     // 'signin' | 'signup' | 'forgot'
  openAuthModal,     // (view) => void
  closeAuthModal,    // () => void
  login,             // ({ email, password }) => Promise<{ success, message }>
  register,          // ({ email, password, firstName, ... }) => Promise
  logout             // () => Promise<void>
} = useAuth();
```

---

### 3. `useCurrency()` (`@/providers/CurrencyProvider`)
Multi-currency dynamic pricing & FX calculation.

```typescript
const {
  currentCurrency,      // 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'JPY'
  setCurrency,          // (currencyCode) => void
  formatPrice,          // (amountInINR) => '₹1,85,000' | '$2,220'
  convertPrice,         // (amountInINR) => number
  supportedCurrencies,  // CurrencyConfig[]
  currencyConfig        // Active currency symbol, rate, decimal places
} = useCurrency();
```

---

### 4. `useNotifications()` (`@/providers/NotificationProvider`)
Live notification badges, drawer drawer controls, and toast alerts.

```typescript
const {
  notifications,        // DbNotification[]
  unreadCount,          // number
  isOpen,               // Boolean
  openDrawer,           // () => void
  closeDrawer,          // () => void
  toggleDrawer,         // () => void
  markAsRead,           // (id) => Promise<void>
  markAllAsRead,        // () => Promise<void>
  refreshNotifications  // () => Promise<void>
} = useNotifications();
```

---

### 5. `usePWA()` (`@/providers/PWAProvider`)
PWA installation prompts and network connectivity monitoring.

```typescript
const {
  isOnline,         // Boolean
  isInstallable,    // Boolean
  isInstalled,      // Boolean
  promptInstall     // () => Promise<void>
} = usePWA();
```

---

## 🌐 Next.js REST API Routes Consumed by Frontend

| Endpoint Path | HTTP Method | Frontend Consumer Component | Purpose |
| :--- | :--- | :--- | :--- |
| `/api/auth/me` | `GET` | `AuthProvider` | Fetches active session & permissions |
| `/api/auth/login` | `POST` | `SignInForm`, `AdminDashboardPage` | Authenticates patron or staff |
| `/api/products` | `GET` | `ShopPage`, `ProductDetailPage` | Fetches catalog products with filters |
| `/api/search` | `GET` | `Header`, `ShopPage` | Instant auto-complete search |
| `/api/currency/rates` | `GET` | `CurrencyProvider` | Fetches real-time FX exchange rates |
| `/api/ai/chat` | `POST` | `AIShoppingAssistantDrawer` | Generates spatial design responses |
| `/api/notifications` | `GET` | `NotificationProvider` | Retrieves user notifications |
| `/api/orders` | `GET`, `POST` | `CheckoutPage`, `AccountPage` | Creates & tracks luxury orders |
| `/api/orders/cod-otp/send` | `POST` | `CheckoutPage` | Dispatches 6-digit COD SMS verification |
| `/api/trade/register` | `POST` | `TradePortalPage` | Registers B2B trade partners |
| `/api/trade/rfq/calculate` | `POST` | `TradePortalPage` | Calculates tiered quotation & GST BOM |
| `/api/admin/metrics` | `GET` | `AdminDashboardPage` | Aggregates revenue, AOV & traffic |
