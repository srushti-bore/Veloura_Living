# Veloura Living — Software Requirements Specification (SRS)

| Field | Value |
|---|---|
| Product | Veloura Living — E-Commerce Platform |
| Document version | 1.1 (Final Baseline, updated with security numbers, split priorities, and business values) |
| Date | 2026-10-03 |
| Status | Final |
| Basis | `Production_Ready_Ecommerce_Application_2026.md` (reference document) **plus Veloura-specific decisions** recorded in Section 2 and Section 4 |
| Delivery timeline | 3–4 months, phase-wise (Section 12) |

> **Note on source of truth.** The reference document provides the capability and engineering baseline. Where this SRS adds or narrows requirements (deployment platforms, payment gateway, scope, v1/v2 split, measurable targets), those are **Veloura-specific additions** and take precedence over the reference document's optional language ("may", "can", "should").

---

## Table of Contents

1. Introduction
2. Product Decisions Summary
3. Overall Description (Actors, Environment, Assumptions, Dependencies)
4. Constraints
5. System Architecture and Deployment
6. Functional Requirements
7. AI Requirements
8. Non-Functional Requirements
9. Data Model Overview
10. API Overview
11. External Interfaces
12. Release Plan and Priorities
13. Out of Scope
14. Traceability Matrix
15. Open Items (TBD Values)
16. Glossary
17. Revision History

---

# 1. Introduction

## 1.1 Purpose

This document specifies the requirements for **Veloura Living**, a production-oriented e-commerce platform selling home decor, furniture, and home textiles. It is the baseline for design, implementation, testing, and acceptance.

## 1.2 Scope

Veloura Living is a **single-seller** online store for **India and international customers**, covering catalog, search, cart, guest and registered checkout, Razorpay payments, order management, inventory, returns, reviews, coupons, CMS, email notifications, admin operations, and AI-assisted features. It is built for a **portfolio plus real business launch**.

## 1.3 Requirement Conventions

- **shall** = mandatory requirement. **should** = recommended. **may** = optional.
- Each requirement has a unique ID: `<MODULE>-<NNN>` (e.g., `PAY-003`).
- **Priority (MoSCoW):** **M** = Must (MVP), **S** = Should, **C** = Could, **W** = Won't (v1, deferred to v2 or later).
- Every Must requirement has testable acceptance criteria (AC).
- Each requirement row has exactly one priority. Where a requirement applies only when a parent feature is enabled, the priority is the standard value and the acceptance criteria state "Applies when <feature> is enabled."

## 1.4 Module Prefixes

AUTH, RBAC, CAT, SRCH, INV, CART, WISH, CHK, PRC, PAY, ORD, SHP, CAN, RET, REV, CPN, MKT, NOT, CMS, SEO, DOC, ADM, ANL, AI, SEC, PRV, MED, OBS, TST, DEP, NFR.

---

# 2. Product Decisions Summary

| Area | Decision |
|---|---|
| Products sold | Home decor, furniture, home textiles |
| Market | India + International |
| Business model | Single seller |
| Project goal | Portfolio + real business launch |
| Guest checkout | Yes (guest checkout supported) |
| Payment gateway | Razorpay |
| v1 payment methods | UPI, Credit/Debit cards, Net banking |
| COD | v2 (Won't in v1) |
| Shipping | Manual in v1 (admin updates status and tracking); provider integration v2 |
| Shipping charge | Flat rate with free-shipping threshold |
| Currency | INR base price; display conversion for international users |
| Tax | GST-inclusive prices; GST invoice with CGST/SGST/IGST breakup |
| Catalog hierarchy | Category > Subcategory > Product > Variant > SKU |
| Variant attributes | Color, Size, Material/Finish; Dimensions + Weight as specifications |
| Stock reservation | At checkout start, released on timeout (15 minutes) |
| Cancellation | Customer may cancel until PROCESSING |
| Guest tracking | Order number + email lookup **and** tokenized email link |
| Returns | Return request + manual refund in v1; category-wise return window (admin configurable) |
| Reviews | Verified purchase only; admin moderation; rating + text |
| Roles | Guest, Customer, Admin, Product Manager, Order Manager |
| Login | Email + password, Google OAuth, email verification, forgot password |
| Notifications | Email only in v1; architecture extensible for SMS, WhatsApp, Push |
| Email provider | Gmail SMTP (behind provider abstraction) |
| AI provider | Google Gemini (behind AI service interface) |
| Recommendations | Rule-based |
| Production stack | Vercel (frontend), Render (backend), Supabase PostgreSQL, Supabase Storage |
| Environments | Development, Staging, Production |

---

# 3. Overall Description

## 3.1 Product Perspective

Veloura Living is a layered system: Next.js/React frontend on Vercel, a Java/Spring Boot REST API on Render, Supabase PostgreSQL for data, Supabase Storage for media and documents, and external integrations (Razorpay, Gemini, Gmail SMTP). It is **not** a collection of CRUD screens; business rules live in the service layer.

## 3.2 Actors and Roles

| Actor | Description | Key goals |
|---|---|---|
| **Guest** | Unauthenticated visitor | Browse, search, add to cart, check out without account, track order |
| **Customer** | Registered, verified user | Order history, wishlist, returns, reviews, saved addresses, AI order status |
| **Admin** | Full-access administrator | All admin functions, users/roles, settings, reports |
| **Product Manager** | Catalog operator | Categories, products, variants, SKUs, media, inventory, CMS content, AI content drafts |
| **Order Manager** | Fulfilment operator | Orders, shipments, cancellations, returns, manual refunds, reviews moderation |

## 3.3 Operating Environment

- Browsers: current Chrome, Edge, Firefox, Safari; mobile, tablet, laptop, desktop.
- Frontend: Vercel. Backend: Render. Database: Supabase PostgreSQL. Storage: Supabase Storage.

## 3.4 Assumptions

| ID | Assumption |
|---|---|
| ASM-001 | Razorpay account is available with test mode for dev/staging and live mode for production. |
| ASM-002 | Razorpay international payment activation is obtained before accepting international cards in production. |
| ASM-003 | Business GSTIN and registered state are available for GST invoicing. |
| ASM-004 | Cancellation refunds for prepaid orders are processed manually by Order Manager/Admin (consistent with manual refund in v1) and tracked in system status. |
| ASM-005 | Currency conversion rates are fetched from a configurable source, with an admin-set fallback rate. Display conversion is an estimate; the charge is in INR. |
| ASM-006 | Gemini API key and quota are available to the project. |
| ASM-007 | International shipping uses a fixed configurable flat rate in v1. |

## 3.5 Dependencies

Razorpay, Google Gemini API, Gmail SMTP, Google OAuth, Supabase, Render, Vercel, GitHub (Actions), Sentry, an uptime monitor, and an analytics tool (GA4 or Plausible) for traffic metrics.

---

# 4. Constraints

| ID | Constraint |
|---|---|
| **CON-001** | **Scope vs timeline.** The project has a 3–4 month timeline. Delivery **shall** be phase-wise: Must (MVP) first, then Should, then Could. Could items (AI features, blogs, flash sales, abandoned cart, advanced analytics) **shall not** delay Must items. |
| **CON-002** | **Email provider.** v1 uses Gmail SMTP. Its daily sending limit and spam/blocking risk are accepted for v1. The system **shall** use an email provider abstraction so Gmail SMTP can be replaced with Resend, Brevo, or AWS SES without changing business logic. Gmail SMTP **shall** use app-specific credentials supplied via environment configuration. |
| **CON-003** | **International scope.** International payments depend on Razorpay international activation (ASM-002). International tax, shipping, and GDPR handling are **limited in v1**: fixed international shipping rate, INR charging, and GDPR basics as a Could item. Full international tax/shipping is v2. |
| CON-004 | **Render cold start.** On the free tier the backend may sleep and take 30–60 seconds to respond on first request. Uptime ping and a frontend loading state **shall** mitigate this. Performance targets exclude cold starts. |
| CON-005 | **Supabase connection pooling.** The backend **shall** connect to Supabase PostgreSQL through the connection pooler with a bounded pool size suited to free-tier connection limits. |
| CON-006 | **Supabase Storage access.** Catalog and CMS media **shall** be in a public bucket. Invoices and return photos **shall** be in a private bucket accessed via short-lived signed URLs. |
| CON-007 | **Free-tier limits.** Database size, storage size, bandwidth, and AI quota are limited on free tiers. Usage limits **shall** be monitored and alerted. |
| CON-008 | **No secrets in code.** All secrets **shall** be supplied via environment configuration; none **shall** be committed to Git. |
| CON-009 | **Payment mode separation.** Razorpay test credentials **shall** be used in Development and Staging; live credentials only in Production. |
| CON-010 | **Frontend authority.** The frontend **shall not** be the source of truth for price, discount, tax, inventory, role, order status, or payment status. |

---

# 5. System Architecture and Deployment

## 5.1 Production Deployment

| Layer | Platform | Responsibility |
|---|---|---|
| Frontend | Vercel | Next.js/React storefront, admin UI |
| Backend API | Render | Spring Boot REST API, business logic, AI service, notification service |
| Database | Supabase PostgreSQL | Production relational data |
| Storage | Supabase Storage | Product/CMS media (public), invoices/return photos (private) |

```text
User
  |
  v
Vercel (Frontend)
  |  HTTPS / REST
  v
Render (Spring Boot API)
  |
  +--> Supabase PostgreSQL
  +--> Supabase Storage
  +--> Razorpay (payments + webhooks)
  +--> Google Gemini (AI)
  +--> Gmail SMTP (email)
  +--> Google OAuth
```

## 5.2 Backend Layering

Controller > Service > Repository > PostgreSQL. DTOs **shall** be used for all API requests and responses; entities **shall not** be exposed directly. Centralized exception handling and validation **shall** apply.

## 5.3 Extensibility Points

| Abstraction | v1 implementation | Future |
|---|---|---|
| Notification channel | Email | SMS, WhatsApp, Push |
| Email provider | Gmail SMTP | Resend, Brevo, SES |
| AI provider | Gemini | Other LLM providers |
| Shipping provider | Manual | Shiprocket, Delhivery, etc. |
| Payment method | UPI, cards, net banking | COD |

---

# 6. Functional Requirements

## 6.1 Authentication (AUTH)

| ID | Requirement | Pri | Acceptance criteria |
|---|---|---|---|
| AUTH-001 | The system shall allow registration with email and password. | M | Valid registration creates an unverified account; duplicate email is rejected with a clear error. |
| AUTH-002 | The system shall hash passwords with BCrypt (or stronger) and enforce password rules: minimum 8 characters, at least 1 uppercase letter, and at least 1 number. | M | Plain passwords never stored or logged; passwords violating the rules are rejected with a clear message. |
| AUTH-003 | The system shall require email verification before a Customer can use account features. The verification link shall expire after **24 hours**. | M | Unverified user cannot access account-only features; link activates the account within 24 hours; expired link is rejected and can be resent. |
| AUTH-004 | The system shall support login, logout, and token-based authentication. Access tokens shall expire after **15 minutes** and refresh tokens after **7 days**. | M | Valid login returns tokens; logout invalidates the refresh token; expired access token is rejected; refresh works until day 7. |
| AUTH-005 | The system shall support forgot password and password reset via a single-use email link that expires after **30 minutes**. | M | Reset link works once and expires after 30 minutes; old password stops working after reset. |
| AUTH-006 | The system shall support Google OAuth login. | S | Google login creates or links an account by verified email. |
| AUTH-007 | The system shall lock an account temporarily after **5 failed login attempts within 15 minutes**, for 15 minutes. | M | The 6th attempt within the window is rejected even with correct credentials; lock expires after 15 minutes; lock events are logged. |
| AUTH-008 | The system shall allow account deletion/data export on request (see PRV). | S | See PRV-003. |

## 6.2 Roles and Permissions (RBAC)

| ID | Requirement | Pri | Acceptance criteria |
|---|---|---|---|
| RBAC-001 | The system shall implement roles: GUEST, CUSTOMER, ADMIN, PRODUCT_MANAGER, ORDER_MANAGER. | M | Each role exists and is assignable (GUEST implicit). |
| RBAC-002 | The system shall enforce granular permissions (e.g., PRODUCT_CREATE/UPDATE/DELETE, ORDER_VIEW/UPDATE, CUSTOMER_VIEW, REPORT_VIEW, CMS_MANAGE, USER_MANAGE). | M | A Product Manager cannot call order-update APIs; an Order Manager cannot call product-delete APIs (403). |
| RBAC-003 | The system shall enforce authorization on the backend for every protected API. | M | Direct API calls without permission return 401/403 regardless of frontend state. |
| RBAC-004 | Only ADMIN shall manage users, roles, and settings. | M | Non-admin access to user/role management is rejected. |
| RBAC-005 | Role changes shall be audit logged. | M | Audit entry records actor, target user, old/new role, timestamp. |

## 6.3 Catalog (CAT)

| ID | Requirement | Pri | Acceptance criteria |
|---|---|---|---|
| CAT-001 | The system shall support the hierarchy Category > Subcategory > Product > Variant > SKU. | M | Product cannot exist without a category; variant belongs to one product; SKU unique. |
| CAT-002 | Categories shall support image, description, SEO metadata, ordering, and active/inactive status. | M | Inactive categories and their products are hidden from customers. |
| CAT-003 | Products shall support name, slug, short/full description, brand, specifications, dimensions, weight, and status. | M | Slug is unique and SEO-friendly. |
| CAT-004 | Variants shall support Color, Size, and Material/Finish attributes. | M | Each variant defines its own attribute values. |
| CAT-005 | Each variant shall have its own SKU, price, original price, inventory, images, and availability. | M | Price and stock are stored per variant/SKU. |
| CAT-006 | Product pages shall display price, discount, GST-inclusive note, availability, SKU, specifications, delivery and return info, rating, and review count. | M | All fields render from backend data. |
| CAT-007 | Product listing shall support pagination, filtering, and sorting. | M | See SRCH-002/003. |
| CAT-008 | Product and category management shall be restricted to ADMIN and PRODUCT_MANAGER. | M | Others receive 403. |
| CAT-009 | Product video shall not be required in v1. | W | Deferred to v2. |

## 6.4 Search and Discovery (SRCH)

| ID | Requirement | Pri | Acceptance criteria |
|---|---|---|---|
| SRCH-001 | The system shall provide keyword search across product name, description, category, and attributes. | M | Searching a known product name returns it. |
| SRCH-002 | The system shall provide filters: category, price range, color, material, rating, availability. | S | Filters combine and update results and counts. |
| SRCH-003 | The system shall provide sorting: price low/high, newest, popularity. | S | Sort order is correct for each option. |
| SRCH-004 | The system shall provide autocomplete suggestions. | S | Suggestions appear after a minimum of 2 characters within the performance target. |
| SRCH-005 | The system shall support typo tolerance and synonyms (e.g., sofa/couch) using PostgreSQL full-text and trigram search with an admin-managed synonym list. | S | A one-character typo and a configured synonym return relevant results. |
| SRCH-006 | Search shall use the product catalog in the database as the source of truth. | M | Search never returns non-existent or inactive products. |

## 6.5 Inventory (INV)

| ID | Requirement | Pri | Acceptance criteria |
|---|---|---|---|
| INV-001 | Inventory shall be tracked per SKU/variant: available, reserved, sold, low-stock threshold. | M | Sellable = available − reserved. |
| INV-002 | The system shall reserve stock when checkout starts and release it automatically after **15 minutes** (configurable) if payment is not completed. | M | Two concurrent buyers of the last unit: only one reservation succeeds; expired reservation is released. |
| INV-003 | The system shall prevent overselling under concurrent orders using transactional/locking controls. | M | Concurrency test: N parallel purchases never produce negative stock. |
| INV-004 | Every stock change shall create an inventory movement record (purchase, sale, cancellation, return, adjustment, damage, correction). | M | Movement history shows who/what/when for each change. |
| INV-005 | Admins and Product Managers shall adjust stock manually with a reason. | M | Adjustment creates a movement and an audit log. |
| INV-006 | The system shall flag low-stock SKUs below threshold in admin. | S | Low-stock list and dashboard alert appear. |
| INV-007 | Payment failure, cancellation, and timeout shall release reserved stock. | M | Stock returns to sellable in each case. |

## 6.6 Cart (CART)

| ID | Requirement | Pri | Acceptance criteria |
|---|---|---|---|
| CART-001 | The system shall support add, remove, increase, decrease, and update quantity. | M | Cart totals update correctly. |
| CART-002 | Guests shall have a cart (browser/session-bound) that merges into the Customer cart on login. | M | Guest items are preserved after login without duplicates. |
| CART-003 | The backend shall recalculate unit price, discount, tax, shipping, and total on every cart operation. | M | Tampered client price is ignored. |
| CART-004 | The system shall validate availability and show out-of-stock/limited items. | M | Unavailable items cannot proceed to checkout. |
| CART-005 | The system shall support applying and removing coupons in the cart/checkout. | S | See CPN. |
| CART-006 | Quantity per SKU per order shall not exceed **10** (admin-configurable) or available stock, whichever is lower. | M | Quantity above 10 or above stock is rejected with a clear message. |

## 6.7 Wishlist (WISH)

| ID | Requirement | Pri | Acceptance criteria |
|---|---|---|---|
| WISH-001 | Customers shall add/remove/view wishlist items (product/variant). | S | Wishlist persists across sessions. |
| WISH-002 | Customers shall move wishlist items to cart and see availability. | S | Out-of-stock items are marked. |
| WISH-003 | Wishlist shall be available to registered Customers only. | S | Guests are prompted to log in. |

## 6.8 Checkout (CHK)

| ID | Requirement | Pri | Acceptance criteria |
|---|---|---|---|
| CHK-001 | The system shall support checkout for Customers and Guests. | M | Guest completes an order with name, email, phone, address. |
| CHK-002 | Checkout shall collect delivery and billing address with validation. | M | Invalid or incomplete address is rejected. |
| CHK-003 | Checkout shall calculate shipping, discount, GST-inclusive tax breakup, and final amount on the backend. Default shipping: **₹199 flat** for India, **free for orders of ₹2,999 or more**, and **₹5,000 fixed** for international orders (all admin-configurable). | M | Totals match backend calculation; ₹2,998 pays ₹199 shipping and ₹2,999 pays ₹0 shipping; international orders show ₹5,000. |
| CHK-004 | Checkout shall require acceptance of terms and conditions. | M | Order cannot be placed without acceptance. |
| CHK-005 | Checkout shall show order summary before payment. | M | Summary matches the order created. |
| CHK-006 | Checkout start shall create stock reservations (INV-002). | M | See INV-002. |
| CHK-007 | Checkout shall use idempotency protection so repeated submissions create one order. | M | Double-click "Pay Now" results in one order and one payment attempt. |
| CHK-008 | Saved addresses shall be available to Customers. | S | Customer selects from saved addresses. |

## 6.9 Pricing, Currency and Tax (PRC)

| ID | Requirement | Pri | Acceptance criteria |
|---|---|---|---|
| PRC-001 | Prices shall be stored in INR and shall be GST-inclusive. | M | Displayed price equals stored price. |
| PRC-002 | The system shall compute GST breakup: CGST+SGST for intra-state and IGST for inter-state, based on seller and delivery state. | M | Invoice breakup is correct for both cases. |
| PRC-003 | International customers shall see a converted price estimate; the charge shall be in INR. | S | Estimate is labelled as approximate; charge equals the INR total. |
| PRC-004 | Exchange rates shall come from a configurable source with an admin fallback rate. | S | Fallback is used when the source fails. |
| PRC-005 | Tax rates shall be configurable per category. | M | Changing a rate affects new orders only. |
| PRC-006 | Shipping flat rate (default ₹199), free-shipping threshold (default ₹2,999), and international rate (default ₹5,000) shall be admin-configurable. | M | Values are stored in settings, changes apply to new checkouts only, and are audit logged. |

## 6.10 Payments (PAY)

| ID | Requirement | Pri | Acceptance criteria |
|---|---|---|---|
| PAY-001 | The system shall support UPI, credit/debit cards, and net banking via Razorpay. | M | Test-mode payment succeeds for each method. |
| PAY-002 | Order, Payment, and Payment Transaction shall be separate entities. | M | One order can have multiple transactions. |
| PAY-003 | Payment states shall include INITIATED, PENDING, SUCCESS, FAILED, CANCELLED, REFUNDED, PARTIALLY_REFUNDED. | M | Transitions follow defined rules. |
| PAY-004 | Payment success shall be confirmed only by a **verified Razorpay webhook** (signature verification) or equivalent server-side verification. | M | Forged webhook is rejected; order is confirmed only after verification. |
| PAY-005 | The backend shall compute the payable amount; client-supplied amounts shall be ignored. | M | Tampered amount does not change the Razorpay order amount. |
| PAY-006 | Duplicate payment requests/webhooks shall be handled idempotently. | M | Replayed webhook does not duplicate confirmation or stock changes. |
| PAY-007 | Failed or abandoned payments shall leave the order in PAYMENT_FAILED and release stock. | M | Stock returns; customer can retry. |
| PAY-008 | Refunds shall be associated with a payment transaction and recorded. | M | Refund record links to the original transaction. |
| PAY-009 | Cash on Delivery shall not be available in v1. | W | COD is deferred to v2. |
| PAY-010 | Razorpay secrets shall never be exposed to the frontend. | M | Only the public key id is exposed. |

## 6.11 Orders (ORD)

| ID | Requirement | Pri | Acceptance criteria |
|---|---|---|---|
| ORD-001 | The system shall create orders with items, address, payment, and customer/guest details in a single transaction. | M | Failure rolls back all records. |
| ORD-002 | Order lifecycle: PLACED > CONFIRMED > PROCESSING > SHIPPED > OUT_FOR_DELIVERY > DELIVERED; alternatives: CANCELLED, RETURN_REQUESTED, RETURNED, REFUND_INITIATED, REFUNDED, PAYMENT_FAILED. | M | Only valid transitions are allowed; invalid transitions return an error. |
| ORD-003 | Status transitions shall be enforced by backend business rules, not the frontend. | M | Direct invalid status updates are rejected. |
| ORD-004 | Customers shall view order history with number, date, items, amount, payment/order/shipping status, address, invoice, and cancellation/return/refund status. | M | All fields are visible per order. |
| ORD-005 | Guests shall track orders by order number + email and by a tokenized link in the confirmation email. Tokens shall expire **90 days** after order placement. | M | Wrong email fails; token link works without login within 90 days and fails afterwards; tokens are unguessable and revocable; email lookup remains available after expiry. |
| ORD-006 | Order Manager/Admin shall update order status and view orders with filters. | M | Updates are audit logged. |
| ORD-007 | Order numbers shall be unique and non-sequentially guessable. | M | Number format is documented and unique. |

## 6.12 Shipping (SHP)

| ID | Requirement | Pri | Acceptance criteria |
|---|---|---|---|
| SHP-001 | Admin/Order Manager shall manually update shipment status and enter courier name and tracking number. | M | Shipment events are stored and visible to the customer. |
| SHP-002 | Order tracking shall show milestones: Placed, Confirmed, Processing, Shipped, Out for Delivery, Delivered. | M | Timeline reflects shipment events. |
| SHP-003 | Shipment events shall trigger customer email notifications. | S | Shipped/Delivered emails are sent. |
| SHP-004 | Shipping provider API integration shall not be in v1. | W | Deferred to v2 via the shipping provider abstraction. |

## 6.13 Cancellation (CAN)

| ID | Requirement | Pri | Acceptance criteria |
|---|---|---|---|
| CAN-001 | Customers shall cancel orders in PLACED, CONFIRMED, or PROCESSING status. | M | Cancel in SHIPPED or later is rejected with guidance to the return process. |
| CAN-002 | Cancellation shall release stock and record an inventory movement. | M | Stock is restored. |
| CAN-003 | Cancelling a paid order shall create a pending refund task for manual processing (ASM-004) and notify the customer. | M | Refund status is visible and updated by admin. |
| CAN-004 | Guests shall cancel through tracked access (order number + email or token link). | S | Cancellation succeeds only with valid access. |

## 6.14 Returns and Refunds (RET)

| ID | Requirement | Pri | Acceptance criteria |
|---|---|---|---|
| RET-001 | Customers shall request a return for delivered orders within the **category-wise return window** counted from delivery date. Defaults: **Furniture 7 days, Decor 10 days, Textiles 14 days** (admin-configurable). | S | Request on day 7 for furniture is accepted and on day 8 is rejected; likewise for decor (10) and textiles (14). |
| RET-002 | Return states: RETURN_REQUESTED, RETURN_APPROVED, RETURN_REJECTED, RETURN_PICKUP, RETURN_RECEIVED, REFUND_INITIATED, REFUNDED. | S | Transitions are enforced. |
| RET-003 | Order Manager/Admin shall approve or reject requests with a reason. | S | Decision and reason are stored and emailed. |
| RET-004 | Refunds in v1 shall be processed **manually** by Admin/Order Manager via the Razorpay dashboard and then marked in the system with reference ID and amount. | S | Refund record stores reference and links to the payment transaction. |
| RET-005 | Customers may upload return photos, stored in a private bucket. | C | Photos are accessible only via signed URLs to authorized staff and the owner. |
| RET-006 | Damaged/wrong items shall always be eligible regardless of window. | S | Flagged request bypasses the window with reviewer approval. |
| RET-007 | Automated Razorpay refund API processing shall not be in v1. | W | Deferred to v2. |

## 6.15 Reviews and Ratings (REV)

| ID | Requirement | Pri | Acceptance criteria |
|---|---|---|---|
| REV-001 | Only Customers with a delivered order containing the product shall submit a review (rating 1–5 and text). | S | Non-purchasers are rejected. |
| REV-002 | Reviews shall be moderated; they are published only after approval. | S | Pending reviews are not public. |
| REV-003 | Reviews shall show a verified purchase indicator and date. | S | Badge shown on published reviews. |
| REV-004 | Product rating and review count shall be computed from approved reviews. | S | Aggregates update on approve/remove. |
| REV-005 | Order Manager/Admin shall approve, reject, or remove reviews. | S | Actions are audit logged. |
| REV-006 | Review images and helpful/not-helpful voting shall not be in v1. | W | Deferred. |

## 6.16 Coupons and Discounts (CPN)

| ID | Requirement | Pri | Acceptance criteria |
|---|---|---|---|
| CPN-001 | The system shall support percentage and fixed-amount coupon codes. | S | Both types compute correct discounts. |
| CPN-002 | Coupons shall support minimum order value and maximum discount cap. | S | Rules enforced at validation. |
| CPN-003 | Coupons shall support total usage limit, per-user limit, and start/end dates. | S | Exceeded or expired coupons are rejected. |
| CPN-004 | Coupons shall support first-order, category-specific, and product-specific eligibility. | S | Ineligible carts are rejected with a reason. |
| CPN-005 | The backend shall validate every coupon on every price calculation and at order creation. | M | Client-claimed discount is ignored. Applies when coupons are enabled. |
| CPN-006 | Guest per-user limits shall be tracked by email/phone. | S | Same email cannot exceed the limit. |

## 6.17 Marketing (MKT)

| ID | Requirement | Pri | Acceptance criteria |
|---|---|---|---|
| MKT-001 | Admin shall create flash sales and campaign discounts with start/end times. | C | Sale price applies only within the window and is backend-calculated. |
| MKT-002 | The system shall send abandoned cart recovery emails to logged-in Customers with idle carts. | C | Email is sent once per configured idle period; unsubscribe is respected. |
| MKT-003 | Related, recently viewed, and frequently bought together shall use rule-based logic (same category, order co-occurrence, view history). | S | Results come only from active in-stock catalog products. |
| MKT-004 | Loyalty points, gift cards, and referral programs shall not be in v1. | W | Deferred. |

## 6.18 Notifications (NOT)

| ID | Requirement | Pri | Acceptance criteria |
|---|---|---|---|
| NOT-001 | The system shall send core transactional emails: email verification, password reset, order placed, payment success, and payment failed. | M | Email is sent on each event with correct content and the correct recipient (Customer or Guest email). |
| NOT-002 | The notification service shall be separated from core business logic and use a channel abstraction. | M | Adding a channel does not modify order/payment code. |
| NOT-003 | Email sending shall be asynchronous with retry and failure logging. | S | Failure does not block order creation; failed emails are retried and visible in logs. |
| NOT-004 | SMS, WhatsApp, and Push shall not be implemented in v1. | W | Only extensibility is provided (CON-002, Section 5.3). |
| NOT-005 | Email shall go through the provider abstraction (Gmail SMTP in v1). | M | Provider is replaceable by configuration. |
| NOT-006 | The system shall send lifecycle emails: order confirmed, shipped, out for delivery, delivered, cancellation, return approved/rejected, refund initiated, and refund completed. | S | Email is sent on each status change with correct content. |

## 6.19 CMS (CMS)

| ID | Requirement | Pri | Acceptance criteria |
|---|---|---|---|
| CMS-001 | Admin shall manage homepage banners and hero content (image, text, link, order, active dates). | S | Changes appear on the storefront. |
| CMS-002 | Admin shall manage static pages and FAQs (About, Contact, Shipping, Returns, Privacy, Terms). | S | Pages render at clean URLs. |
| CMS-003 | Admin shall manage navigation menus, footer content, and per-page SEO metadata. | S | Menus/footer render from CMS data. |
| CMS-004 | Admin shall manage blog posts and landing pages. | C | Posts are published with SEO metadata. |
| CMS-005 | CMS shall control content only; layout, typography, components, and animation remain fixed in the frontend. | M | No visual page builder is provided. |

## 6.20 SEO (SEO)

| ID | Requirement | Pri | Acceptance criteria |
|---|---|---|---|
| SEO-001 | The system shall provide SEO-friendly URLs and slugs for categories, products, and pages. | M | URLs are readable and unique. |
| SEO-002 | The system shall provide meta title, meta description, canonical URL, Open Graph, and social metadata. | S | Metadata present on key pages. |
| SEO-003 | The system shall provide Product, Organization, and Breadcrumb structured data reflecting actual page content. | S | Structured data validates; rating data only when real reviews exist. |
| SEO-004 | The system shall provide a sitemap and robots configuration. | S | Sitemap lists active public URLs. |

## 6.21 Invoicing (DOC)

| ID | Requirement | Pri | Acceptance criteria |
|---|---|---|---|
| DOC-001 | The system shall auto-generate a PDF GST invoice after successful payment with seller GSTIN, buyer details, item tax breakup (CGST/SGST/IGST), and totals. | S | PDF totals match the order. |
| DOC-002 | Invoices shall be stored in the private bucket and emailed/downloadable via signed URL by the owner or authorized staff. | S | Unauthorized access fails. |
| DOC-003 | Invoice numbers shall be sequential and unique per financial-year series. | S | No gaps or duplicates. |

## 6.22 Admin Panel (ADM)

| ID | Requirement | Pri | Acceptance criteria |
|---|---|---|---|
| ADM-001 | The admin panel shall provide core modules: Products, Categories, Variants, Inventory, Orders, Payments, Shipments, Users, Roles, Permissions, and Settings. | M | Each module is reachable and shown according to role permissions. |
| ADM-002 | The admin UI shall show only modules permitted for the logged-in role. | M | Hidden and API-enforced. |
| ADM-003 | Admin shall view customer profile, addresses, orders, payments, returns, reviews, wishlist, and activity subject to permissions. | S | Data shown per RBAC. |
| ADM-004 | Admin actions on price, stock, orders, payments, refunds, roles, and settings shall be audit logged (SEC-006). | M | Who/what/when/old/new recorded. |
| ADM-005 | Admin shall manage settings: shipping rates, threshold, tax rates, return windows, reservation timeout, synonyms, fallback exchange rate. | M | Settings persist and take effect. |
| ADM-006 | The admin panel shall provide extended modules: Returns, Refunds, Customers, Coupons, Campaigns, Reviews, CMS, SEO, Media, and Reports. | S | Each module is reachable and shown according to role permissions. |

## 6.23 Analytics and Dashboard (ANL)

| ID | Requirement | Pri | Acceptance criteria |
|---|---|---|---|
| ANL-001 | Dashboard shall show revenue, orders, customers, and average order value with date filter. | S | Figures match order/payment data. |
| ANL-002 | Dashboard shall show top products and low-stock alerts. | S | Lists are accurate. |
| ANL-003 | Dashboard shall show sales graph, returns and refunds. | S | Graph reflects selected period. |
| ANL-004 | Dashboard shall show conversion rate, cart abandonment, and traffic (via GA4 or Plausible plus backend events). | C | Metrics are available with documented definitions. |

## 6.24 Media Management (MED)

| ID | Requirement | Pri | Acceptance criteria |
|---|---|---|---|
| MED-001 | Product/category/brand/banner images shall be uploaded by authorized staff to the public Supabase bucket. | M | Upload succeeds only for permitted roles. |
| MED-002 | Uploads shall validate file type and size and be optimized for web delivery. | M | Invalid files are rejected. |
| MED-003 | Multiple images per product/variant shall be supported with ordering and a primary image. | M | Gallery order is respected. |
| MED-004 | Private files (invoices, return photos) shall use the private bucket and signed URLs (CON-006). | S | Direct public access is not possible. |

---

# 7. AI Requirements

AI is a probabilistic component. Business-critical facts (products, prices, inventory, orders, policies) **shall** come from deterministic services and the database. All AI features are accessed via a provider-agnostic **AI Service** interface with Google Gemini as the v1 provider.

| ID | Requirement | Pri | Acceptance criteria |
|---|---|---|---|
| AI-001 | **AI natural-language search:** the system shall convert queries like "comfortable grey 3-seater sofa under ₹30,000" into structured filters (category, color, use case, max price) and execute them against the real catalog. | C | Parsed filters are shown/applied; only real catalog products are returned. |
| AI-002 | **AI shopping assistant:** the assistant shall answer product, policy, and FAQ questions using tool/function calling against Product APIs and approved knowledge sources. | C | Answers cite real catalog data; unknown information yields "I don't have that information." |
| AI-003 | The assistant shall give order/refund status **only to authenticated Customers** for their own orders via the Order API. | C | A user cannot retrieve another user's order; guests get no order data from the assistant. |
| AI-004 | **AI product content:** admin shall generate short/long descriptions, highlights, SEO title/description, and keywords from product inputs. | C | Output is a draft only. |
| AI-005 | AI-generated content shall follow Draft > Human Review > Approval > Publish. | C | Unapproved AI content is never public. |
| AI-006 | **AI review analysis:** the system shall summarize sentiment, common praises, and complaints per product from approved reviews. | C | Summary is visible to admin only; sample-size shown. |
| AI-007 | **AI admin insights:** the system shall provide decision support (e.g., restock suggestions) from inventory, sales velocity, and trends. | C | Suggestions are advisory and never execute actions automatically. |
| AI-008 | The AI shall never invent products, prices, inventory, or policies. | M | Responses are validated against retrieved data; unverifiable claims are blocked. Applies when any AI feature is enabled. |
| AI-009 | The AI layer shall apply prompt injection protection, input/output filtering, and no cross-user data exposure. | M | Injection test cases do not leak data or bypass rules. Applies when any AI feature is enabled. |
| AI-010 | The AI layer shall enforce a rate limit of **20 requests per minute per user** (per IP for unauthenticated users), per-request token limits, and a monthly cost/quota cap. | M | The 21st request within a minute returns a graceful rate-limit message; the cap blocks further calls with a graceful message. Applies when any AI feature is enabled. |
| AI-011 | The system shall provide graceful fallback (e.g., standard search/FAQ) when the AI provider fails or times out. | M | Customer flows continue without AI. Applies when any AI feature is enabled. |
| AI-012 | AI calls shall be logged (without sensitive data) and monitored (see OBS). | S | Failures and latency are visible. |
| AI-013 | Recommendations shall be rule-based (MKT-003); personalized AI/embedding recommendations shall not be in v1. | W | Deferred. |

> AI-008 to AI-011 are Must requirements that apply only when an AI feature is enabled. The AI features themselves (AI-001 to AI-007) are Could, so no AI feature may be released without these safeguards.

---

# 8. Non-Functional Requirements

## 8.1 Performance

| ID | Requirement | Pri |
|---|---|---|
| NFR-PERF-001 | Standard API endpoints shall meet **p95 < 500 ms**, excluding cold starts and AI calls. | M |
| NFR-PERF-002 | Storefront pages shall achieve **LCP < 2.5 s on 4G**. | S |
| NFR-PERF-003 | Listing endpoints shall be paginated; heavy queries shall be indexed. | M |
| NFR-PERF-004 | Frequently read reference data (categories, settings) should be cached with defined invalidation. | C |
| NFR-PERF-005 | Images shall be optimized (responsive sizes, modern formats via Vercel). | S |

## 8.2 Availability and Reliability

| ID | Requirement | Pri |
|---|---|---|
| NFR-AVL-001 | Target availability is **99%** (free-tier realistic), measured monthly. | S |
| NFR-REL-001 | External calls (Razorpay, Gemini, SMTP) shall use timeouts; retries only where safe. | M |
| NFR-REL-002 | Retries for financial operations shall be idempotent (PAY-006, CHK-007). | M |
| NFR-REL-003 | Order, payment, inventory, shipment, and refund data shall remain consistent; multi-record operations shall be transactional. | M |
| NFR-REL-004 | Database backups shall be enabled per Supabase capability with a **Recovery Point Objective (RPO) of 24 hours** and a **Recovery Time Objective (RTO) of 4 hours**, with a documented and tested restore procedure. | S |

## 8.3 Security

| ID | Requirement | Pri |
|---|---|---|
| SEC-001 | All traffic shall use HTTPS. | M |
| SEC-002 | Passwords shall be BCrypt-hashed; secure headers (HSTS, CSP, X-Content-Type-Options, etc.) shall be set. | M |
| SEC-003 | The API shall use JWT/session authentication, RBAC, and restrictive CORS (allowed origins only). | M |
| SEC-004 | The system shall apply rate limits: login (see AUTH-007), registration and password reset **5 requests per hour per IP**, coupon validation **10 per minute per IP**, search **60 per minute per IP**, and AI endpoints (see AI-010). Exceeding a limit shall return HTTP 429. | M |
| SEC-005 | All inputs shall be validated via DTO validation; SQL injection shall be prevented via parameterized queries/JPA. | M |
| SEC-006 | Audit logs shall record: product create/price change, order placement/cancel, payment status change, refund, inventory adjustment, role change, settings change. | M |
| SEC-007 | Razorpay webhooks shall be signature-verified; payment secrets shall never reach the client. | M |
| SEC-008 | CSRF protection shall apply where cookie-based sessions are used. | M |
| SEC-009 | Secrets shall be managed through environment configuration; none in Git (CON-008). | M |
| SEC-010 | Sensitive data (passwords, tokens, secrets, full card data) shall never be logged; card data shall never be stored (handled by Razorpay). | M |
| SEC-011 | Dependency and security scanning shall run in CI (DEP-004). | S |

## 8.4 Privacy and Data Protection (PRV)

| ID | Requirement | Pri | Acceptance criteria |
|---|---|---|---|
| PRV-001 | The system shall publish a privacy policy and collect only required data, aligned with India's DPDP Act. | M | Policy is linked in footer and at registration/checkout. |
| PRV-002 | The system shall record consent where required (marketing emails, terms). | S | Consent flags are stored. |
| PRV-003 | Customers shall be able to request account deletion and data export; deletion shall anonymize personal data while retaining legally required order/invoice records. | S | Request is processed and confirmed. |
| PRV-004 | Access to customer data shall be restricted by RBAC. | M | See RBAC-002. |
| PRV-005 | Data retention periods shall be defined and documented. | S | Retention policy exists. |
| PRV-006 | GDPR basics (cookie consent, export/erasure) for international users. | C | Cookie banner and request flow available. |

## 8.5 Usability and Compatibility

| ID | Requirement | Pri |
|---|---|---|
| NFR-UX-001 | The storefront and admin shall be responsive across mobile, tablet, laptop, and desktop. | M |
| NFR-UX-002 | A consistent design system shall be used across storefront and admin. | S |
| NFR-UX-003 | The storefront should meet WCAG 2.1 AA basics (contrast, keyboard navigation, alt text). | C |
| NFR-UX-004 | The frontend shall show a clear loading/waking state when the backend is cold-starting. | S |

## 8.6 Maintainability and Quality

| ID | Requirement | Pri |
|---|---|---|
| NFR-MNT-001 | Code shall follow layered architecture (Controller > Service > Repository) with DTOs and global exception handling. | M |
| NFR-MNT-002 | Errors shall use a consistent JSON structure with categories (not found, validation, auth, authorization, business rule, payment, inventory, unexpected). | M |
| NFR-MNT-003 | APIs shall be documented with OpenAPI/Swagger. | M |
| NFR-MNT-004 | Database schema changes shall be managed through versioned migrations. | M |

## 8.7 Observability (OBS)

| ID | Requirement | Pri |
|---|---|---|
| OBS-001 | The backend shall emit structured (JSON) logs and expose health endpoints (e.g., Spring Actuator). | M |
| OBS-002 | Error tracking (Sentry) shall cover frontend and backend exceptions with alerts. | S |
| OBS-003 | Uptime monitoring with a keep-alive ping shall be configured. | S |
| OBS-004 | Alerts shall exist for payment failures, webhook errors, AI provider failures, failed emails, and free-tier usage limits. | S |
| OBS-005 | Metrics shall cover API latency, database performance, authentication failures, and inventory inconsistencies. | C |

## 8.8 Testing (TST)

| ID | Requirement | Pri |
|---|---|---|
| TST-001 | Unit tests shall cover business logic: pricing, coupons, tax, shipping, order state transitions, and inventory. | M |
| TST-002 | Integration and repository tests shall use a real PostgreSQL (Testcontainers), including inventory concurrency tests. | M |
| TST-003 | API/controller and security tests shall verify authentication, RBAC, and unauthorized access. | M |
| TST-004 | End-to-end tests (e.g., Playwright) shall cover auth, cart, guest checkout, and payment (test mode). | S |
| TST-005 | Minimum coverage: **70% overall** and **90% on pricing, payment, and inventory** modules. | M |
| TST-006 | Required scenarios: successful checkout, failed payment, out-of-stock, invalid coupon, unauthorized admin access, duplicate submission/webhook, order cancellation, return/refund, inventory changes, reservation timeout, guest tracking. | M |
| TST-007 | AI features shall have tests for hallucination guard, prompt injection, rate limits, and fallback. | S |

---

# 9. Data Model Overview

## 9.1 Entities

User, Role, Permission, Customer, Address, Category, Product, ProductVariant, SKU, Brand, ProductImage, ProductAttribute, Inventory, InventoryMovement, StockReservation, Cart, CartItem, Wishlist, WishlistItem, Order, OrderItem, Payment, PaymentTransaction, Shipment, ShipmentEvent, Coupon, CouponUsage, Campaign, Review, Return, Refund, Invoice, Notification, CMSContent, SEOMetadata, Setting, SynonymEntry, AuditLog, AIRequestLog.

## 9.2 Key Relationships

```text
Category 1--N Subcategory 1--N Product 1--N ProductVariant 1--1 SKU/Inventory
Customer 1--N Address
Customer 1--1 Cart 1--N CartItem
Customer 1--1 Wishlist 1--N WishlistItem
Customer (or Guest) 1--N Order 1--N OrderItem
Order 1--N PaymentTransaction (Payment aggregates transactions)
Order 1--N Shipment 1--N ShipmentEvent
Order 1--N Return 1--N Refund (linked to PaymentTransaction)
Product 1--N Review N--1 Customer
Order 1--1 Invoice
SKU 1--N InventoryMovement; SKU 1--N StockReservation
```

Guest orders store guest name, email, and phone on the Order and use the tracking token (ORD-005).

---

# 10. API Overview

Base paths follow a consistent REST convention:

`/api/auth`, `/api/users`, `/api/categories`, `/api/products`, `/api/brands`, `/api/variants`, `/api/inventory`, `/api/cart`, `/api/wishlist`, `/api/checkout`, `/api/payments` (incl. webhook), `/api/orders`, `/api/shipments`, `/api/returns`, `/api/refunds`, `/api/reviews`, `/api/coupons`, `/api/customers`, `/api/notifications`, `/api/cms`, `/api/invoices`, `/api/analytics`, `/api/settings`, `/api/ai`.

Requirements: OpenAPI documentation with endpoint, method, auth, request/response, errors, and examples (NFR-MNT-003); versioned API contracts via DTOs.

---

# 11. External Interfaces

| Interface | Purpose | Notes |
|---|---|---|
| Razorpay | Payments, webhooks, manual refund reference | Test vs live separation (CON-009) |
| Google Gemini | AI features | Behind AI service interface |
| Gmail SMTP | Transactional email | Behind email abstraction (CON-002) |
| Google OAuth | Social login | Verified email only |
| Supabase PostgreSQL / Storage | Data and files | Pooler (CON-005), buckets (CON-006) |
| GA4 or Plausible | Traffic analytics | Could (ANL-004) |
| Sentry / uptime monitor | Observability | OBS-002/003 |
| GitHub Actions | CI/CD | DEP section |

---

# 12. Release Plan and Priorities

## 12.1 Deployment and Engineering (DEP)

| ID | Requirement | Pri |
|---|---|---|
| DEP-001 | Frontend shall be deployed on Vercel, backend on Render, database on Supabase PostgreSQL, and files on Supabase Storage. | M |
| DEP-002 | Three environments shall exist: Development, Staging, Production, with separate Supabase projects/Render services and separate configuration. | S |
| DEP-003 | Configuration shall be via environment variables (e.g., DATABASE_URL, JWT_SECRET, RAZORPAY_KEY_ID/SECRET, GEMINI_API_KEY, SMTP credentials, STORAGE keys). | M |
| DEP-004 | CI/CD shall use GitHub Actions: build, test, security scan, Docker image build, and automated deploy (Render; Vercel on main). | S |
| DEP-005 | Docker shall be used for backend packaging and local development consistency. | S |
| DEP-006 | Git workflow: meaningful commits, branching strategy, pull requests, code review, `.gitignore`, no secrets, tagged releases. | M |
| DEP-007 | Production documentation (setup, environment variables, runbook, restore procedure) shall be maintained. | S |

## 12.2 MoSCoW Summary

- **Must (MVP):** AUTH (core), RBAC, CAT, SRCH-001/006, INV, CART, CHK, PRC, PAY, ORD, SHP-001/002, CAN, MED-001–003, ADM core, SEC, NFR core, OBS-001, TST core, DEP core.
- **Should:** Google login, search filters/sorting/autocomplete/typo-synonyms, wishlist, coupons, reviews, returns (manual refund), notifications beyond core, CMS core, SEO, invoices, analytics core, privacy extras, Sentry/uptime/alerts, E2E tests, CI/CD, three environments.
- **Could:** AI features (AI-001–007), blogs/landing pages, flash sales, abandoned cart recovery, conversion/traffic analytics, return photos, GDPR basics, caching, WCAG.
- **Won't (v1):** Section 13.

## 12.3 Indicative Phase Plan (3–4 months)

| Phase | Weeks | Focus |
|---|---|---|
| 1 Foundation | 1–2 | Repo, CI skeleton, DB design/ER, API conventions, environments, deployment skeleton |
| 2 Auth and Security | 2–4 | Registration, login, verification, reset, RBAC, security config |
| 3 Catalog and Inventory | 4–6 | Categories, products, variants/SKU, media, inventory, admin catalog |
| 4 Discovery and Cart | 6–8 | Search, filters, product pages, cart, guest cart, wishlist |
| 5 Checkout, Payments, Orders | 8–11 | Pricing/tax/shipping, reservation, Razorpay + webhook, orders, tracking, cancellation |
| 6 Post-purchase and Admin | 11–13 | Returns, reviews, coupons, notifications, invoices, CMS, dashboard |
| 7 AI (Could) | 13–15 | Gemini features with safety controls, only if Must/Should are stable |
| 8 Hardening | 15–16 | Testing to coverage target, security review, performance, monitoring, documentation |

Phases 7 may shift to post-launch if timeline pressure occurs (CON-001).

---

# 13. Out of Scope (v1 / Won't)

- Cash on Delivery (v2)
- Shipping provider integration (Shiprocket, Delhivery, etc.) (v2)
- Automated Razorpay refund API processing (v2)
- SMS, WhatsApp, and Push notification implementation (architecture only)
- Loyalty points, gift cards, referral programs
- Multi-vendor marketplace
- Native mobile app
- Personalized AI recommendations (embedding/behavioral)
- Phone OTP login
- Multi-currency charging (charge is INR only)
- Product video and review images
- Review helpful/not-helpful voting
- Full international tax/shipping calculation
- Visual page builder in CMS

---

# 14. Traceability Matrix

| Module | Requirement IDs | Primary APIs | Primary tests |
|---|---|---|---|
| Authentication | AUTH-001–008 | /api/auth | Unit, API, security |
| RBAC | RBAC-001–005 | /api/users | API security, RBAC tests |
| Catalog | CAT-001–009 | /api/categories, /products, /variants | Unit, repository, API |
| Search | SRCH-001–006 | /api/products/search | Integration, E2E |
| Inventory | INV-001–007 | /api/inventory | Unit, concurrency integration |
| Cart | CART-001–006 | /api/cart | Unit, API, E2E |
| Wishlist | WISH-001–003 | /api/wishlist | API |
| Checkout | CHK-001–008 | /api/checkout | Unit, integration, E2E, idempotency |
| Pricing and Tax | PRC-001–006 | /api/checkout, /settings | Unit (tax/shipping) |
| Payments | PAY-001–010 | /api/payments | Unit, integration, webhook replay, security |
| Orders | ORD-001–007 | /api/orders | Unit (state machine), API, E2E |
| Shipping | SHP-001–004 | /api/shipments | API, E2E |
| Cancellation | CAN-001–004 | /api/orders/{id}/cancel | Unit, integration |
| Returns/Refunds | RET-001–007 | /api/returns, /refunds | Unit, API |
| Reviews | REV-001–006 | /api/reviews | API, moderation tests |
| Coupons | CPN-001–006 | /api/coupons | Unit |
| Marketing | MKT-001–004 | /api/campaigns | Unit, job tests |
| Notifications | NOT-001–006 | /api/notifications | Integration, provider mock |
| CMS | CMS-001–005 | /api/cms | API |
| SEO | SEO-001–004 | frontend + /api/cms | Validation tools |
| Invoicing | DOC-001–003 | /api/invoices | Unit, integration |
| Admin | ADM-001–006 | /api/* (admin) | API security, E2E |
| Analytics | ANL-001–004 | /api/analytics | Unit, API |
| Media | MED-001–004 | /api/media | API, validation |
| AI | AI-001–013 | /api/ai | Unit, injection, fallback |
| Security | SEC-001–011 | All | Security tests, CI scans |
| Privacy | PRV-001–006 | /api/customers | API, review |
| Observability | OBS-001–005 | actuator | Smoke, alert tests |
| Testing | TST-001–007 | N/A | CI coverage gate |
| Deployment | DEP-001–007 | N/A | Pipeline verification |

---

# 15. Open Items (TBD Values)

These values are configurable and shall be set before launch. They do not block development.

| ID | Item | Where configured |
|---|---|---|
| ~~TBD-001~~ | **Resolved:** Domestic flat shipping ₹199, free above ₹2,999 | PRC-006, CHK-003 |
| ~~TBD-002~~ | **Resolved:** International fixed shipping ₹5,000 | PRC-006, CHK-003 |
| ~~TBD-003~~ | **Resolved:** Return windows Furniture 7, Decor 10, Textiles 14 days | RET-001 |
| TBD-004 | **Open:** GST rate per category (confirm with a CA, rates depend on product HSN and may change), seller GSTIN, registered state | Admin settings, PRC-005, ASM-003 |
| TBD-005 | **Open:** Exchange rate source and fallback rate | Admin settings (PRC-004) |
| TBD-006 | **Open:** Coupon campaign values | Admin (CPN) |
| ~~TBD-007~~ | **Resolved:** Maximum quantity per SKU per order is 10 | CART-006 |
| TBD-008 | Legal pages content (privacy policy, terms, shipping/return policy) | CMS |
| TBD-009 | Data retention periods | PRV-005 |
| TBD-010 | AI monthly cost/quota cap | Settings (AI-010) |
| TBD-011 | Decision to include GDPR basics in v1 | PRV-006 |

---

# 16. Glossary

| Term | Meaning |
|---|---|
| SKU | Stock Keeping Unit; the unique sellable variant identifier |
| RBAC | Role-Based Access Control |
| MoSCoW | Must, Should, Could, Won't prioritization |
| DTO | Data Transfer Object |
| Idempotency | Repeating the same request does not produce duplicate effects |
| Webhook | Server-to-server callback (e.g., Razorpay payment confirmation) |
| CGST/SGST/IGST | Central/State/Integrated Goods and Services Tax |
| LCP | Largest Contentful Paint |
| p95 | 95th percentile response time |
| DPDP Act | India's Digital Personal Data Protection Act |
| RAG | Retrieval-Augmented Generation |
| Cold start | Delay when a sleeping free-tier service wakes up |

---

# 17. Revision History

| Version | Date | Description |
|---|---|---|
| 1.0 | 2026-10-03 | Final baseline: reference-based requirements plus Veloura-specific decisions, constraints (CON-001 to CON-010), numbered FR/NFR with MoSCoW and acceptance criteria, release plan, traceability matrix, open items |
| 1.1 | 2026-10-03 | Added numeric security and expiry values (login lock, password rules, token/link expiry, rate limits, RPO/RTO); split mixed-priority rows (NOT-001/NOT-006, ADM-001/ADM-006); replaced non-standard M-dep notation; filled business values (shipping, free-shipping threshold, international rate, return windows, max quantity); updated open items |
