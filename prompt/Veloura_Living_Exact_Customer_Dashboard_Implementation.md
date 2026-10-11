# Veloura Living — Exact Customer Dashboard Implementation

## Objective
Implement the Veloura Living Customer Dashboard by using the attached reference image as the **strict visual and layout reference**. The final implementation must look as close to the reference image as technically possible.

**IMPORTANT: Do not create a new design or reinterpret the reference. Reproduce the attached image as it is.**

## 1. Strict UI Requirements

Match the reference image precisely in terms of:

- Overall dashboard layout, proportions, spacing, alignment, and rounded outer container.
- Dark warm-brown left sidebar with the Veloura Living logo at the top.
- Customer profile section with profile image, dynamic customer name, and “Customer” role.
- Sidebar navigation in the exact order shown:
  - Dashboard
  - My Orders
  - Wishlist
  - Addresses
  - Profile
  - Reviews
  - Settings
  - Logout
- Top-right utility navigation with notification, wishlist, cart, profile avatar, and customer greeting.
- Large warm, premium living-room hero banner with:
  - “Your Dream Space Awaits”
  - “Discover furniture that feels like home.”
  - Product/category search bar and search icon.
- Four statistic cards:
  - Total Orders
  - Total Spent
  - Wishlist
  - Active Products
- Recent Orders section with the same table layout, column order, spacing, and status-badge styling as the reference.
- Quick Actions section with:
  - Track Order
  - Explore Collection
  - Contact Support
  - Manage Wishlist
- Same warm beige, ivory, cream, and brown color palette, typography hierarchy, icons, borders, shadows, and premium furniture-brand aesthetic.

Do not rearrange, remove, redesign, or unnecessarily rename any of these elements. Preserve the reference image's visual hierarchy and proportions.

## 2. Dynamic Customer Name — Mandatory

The only intentional visual-content difference from the reference is that the customer name must come from the currently authenticated user's actual registration/profile data.

Examples:
- Sidebar greeting: `Hi, Priya`
- Top-right greeting: `Hi, Priya`

These are examples only. Never hardcode “Priya” or any other customer name.

Requirements:
- Fetch the currently authenticated customer's name from the existing authentication/session and persistent user profile.
- Display the registered name consistently in both locations.
- If the customer updates their profile name, reflect the updated name appropriately.
- If a name is unavailable, use a graceful fallback such as “Hi, there” instead of displaying `undefined`, `null`, or a placeholder person's name.
- Ensure Customer A sees Customer A's information and Customer B sees Customer B's information.
- Never use another user's cached profile, hardcoded demo identity, or shared customer data.

## 3. Real Data and Functional Behaviour

Keep the same visual design while connecting the dashboard to the existing application functionality.

- **Total Orders:** Count the authenticated customer's actual orders.
- **Total Spent:** Calculate from that customer's applicable order records.
- **Wishlist:** Display the authenticated customer's actual wishlist count.
- **Active Products:** Use a clearly defined, relevant metric from existing application data; do not fabricate customer-specific values.
- **Recent Orders:** Fetch the current customer's actual recent orders and display their order IDs, products, amounts, statuses, and dates.
- **Search:** Connect to the existing product/category search functionality.
- **Track Order:** Navigate to the existing order-tracking flow.
- **Explore Collection:** Navigate to the appropriate existing collection/catalog page.
- **Manage Wishlist:** Open the existing wishlist functionality.
- **My Orders, Addresses, Profile, Reviews, Settings, and Logout:** Connect each item to its corresponding existing route or feature.
- Notification and cart icons must use the existing application functionality.

Do not display the sample names, order IDs, prices, statistics, or dates from the reference as real customer data. Use actual backend data and provide polished empty/loading states where necessary.

## 4. Flexible and Future-Ready Architecture

Keep the implementation modular and extensible so additional dashboard cards, navigation items, metrics, quick actions, and customer features can be added in the future without rewriting the entire dashboard.

- Reuse existing components, routes, authentication, APIs, and data models wherever appropriate.
- Use configurable data-driven rendering where it makes sense.
- Avoid hardcoding customer-specific values, statistics, orders, or identity information.
- Do not duplicate existing functionality or create unnecessary new routes.
- Handle loading, errors, empty data, expired sessions, and missing profile information gracefully.

## 5. GSAP Micro-Interactions

Integrate subtle, premium GSAP animations without changing the reference layout:

- Gentle fade-and-slide entrance for dashboard sections.
- Soft staggered entrance for statistic cards.
- Subtle hover transitions for sidebar links, cards, and Quick Actions.
- Smooth hero-banner content entrance.
- Refined button and icon interactions.

Animations must feel elegant and restrained. No bouncing, aggressive scaling, flashy effects, excessive motion, or distracting transitions. Respect `prefers-reduced-motion` and clean up GSAP timelines and ScrollTriggers correctly.

## 6. Responsive Behaviour

Preserve the reference design on desktop as the primary target. On tablets and mobile devices, adapt the layout carefully while retaining the same brand identity, visual hierarchy, and all essential functionality. Do not allow horizontal overflow or clipped controls.

## 7. Strict Project Constraints

- Inspect the existing repository and current dashboard implementation before making changes.
- Preserve the existing authentication and role-based access-control system.
- Do not modify the login, registration, OTP verification, or admin dashboard flows as part of this task.
- Do not change unrelated pages, global styling, or existing frontend UI/UX.
- Do not replace the current technology stack or introduce unnecessary dependencies.
- Do not hardcode data to make the dashboard merely look populated.
- **Do not open, read, print, modify, or expose any `.env` or `.env.*` files or their secrets.**
- Keep customer data isolated and enforce authorization on the server, not only in the UI.

## 8. Implementation and Acceptance Criteria

First inspect the existing implementation, then make the smallest necessary changes to achieve the reference design and connect it to real data.

The task is complete only when:

1. The dashboard visually matches the attached reference image as closely as possible.
2. The customer name is dynamically populated from the authenticated user's registered profile.
3. Every customer sees only their own dashboard data.
4. Dashboard statistics and recent orders are sourced from real data.
5. Navigation and Quick Actions work through the existing application.
6. GSAP micro-interactions are subtle and performant.
7. Responsive behaviour is verified.
8. Existing authentication, admin access, and unrelated pages remain unaffected.

After implementation, report the files changed, functionality connected, tests performed, and any remaining issues. Clearly identify any feature that could not be connected to existing backend functionality instead of faking its data.

**Final instruction: Treat the attached image as the source of truth for the UI. Match it—not a redesigned or inspired-by version. Only the customer identity and actual dashboard data should vary dynamically.**

## 9. Mandatory — Every Button, Section and Interaction Must Work

**STRICT REQUIREMENT: No dead buttons, non-functional icons, decorative-only controls, fake actions, or placeholder interactions are allowed.**

Every visible interactive element in the attached Customer Dashboard reference must be fully functional and connected to the existing Veloura Living application.

### A. Sidebar Navigation
- **Dashboard:** Open the customer dashboard.
- **My Orders:** Display the authenticated customer's order history and order details.
- **Wishlist:** Display and manage the customer's saved products.
- **Addresses:** View, add, edit, and delete saved delivery addresses.
- **Profile:** View and update the customer's profile information.
- **Reviews:** Display the customer's reviews and support available review actions.
- **Settings:** Open functional account settings, including supported security and preference options.
- **Logout:** Securely end the current session and redirect to the appropriate existing page.

### B. Header Controls
- **Notification icon:** Open the notification panel and display real notifications where supported.
- **Wishlist icon:** Navigate to or open the customer's wishlist.
- **Cart icon:** Open the existing cart and show the current customer's cart items.
- **Profile avatar/name/dropdown:** Open a functional account menu with the correct authenticated user's information and relevant account actions.

### C. Hero Banner and Search
- Make the hero banner interactive only where appropriate.
- Connect the search input and search icon to the existing product/category search functionality.
- Support Enter-key submission, loading feedback, empty results, and relevant search results.
- If the hero banner has carousel indicators or navigation controls, ensure they actually change the displayed slide.

### D. Statistics Cards
- **Total Orders:** Display the real order count and provide navigation to My Orders.
- **Total Spent:** Display the correct calculated amount using the application's order/payment rules.
- **Wishlist:** Display the real wishlist count and open Wishlist when clicked.
- **Active Products:** Use a clearly defined and relevant existing metric. Do not fabricate customer-specific information.

Make each card clickable only when it has a meaningful destination or action. Provide appropriate hover, focus, and active states.

### E. Recent Orders
- Display real orders belonging only to the authenticated customer.
- Make **View All** open the complete order history.
- Where appropriate, make an order row or order ID open that order's detail/tracking page.
- Display accurate order status, amount, product information, and date.
- Handle customers with no orders using a polished empty state and a working Explore Collection action.

### F. Quick Actions
- **Track Order:** Open the existing tracking flow and allow the customer to track an eligible order.
- **Explore Collection:** Navigate to the existing product collections/catalog.
- **Contact Support:** Open the existing support/contact experience.
- **Manage Wishlist:** Open the customer's wishlist management page.

### G. Functional Quality Requirements
- Connect all actions to real routes, APIs, and backend functionality already available in the repository.
- If a required feature does not exist, implement it using the existing architecture where feasible. Do not create a button that looks functional but does nothing.
- Use real data and persist supported create, read, update, and delete operations correctly.
- Add loading indicators, success/error feedback, confirmation dialogs for destructive actions, and empty states where appropriate.
- Prevent duplicate submissions and handle API failures, expired sessions, and network errors gracefully.
- Ensure keyboard accessibility, visible focus states, appropriate labels, and responsive interactions.
- Keep customer data isolated and enforce authorization server-side.
- Do not use fake alerts, dummy links, `href="#"`, hardcoded dashboard data, or simulated success messages as substitutes for actual functionality.
- Do not break existing login, registration, OTP verification, customer sessions, admin authorization, checkout, cart, or payment functionality.

### H. Mandatory Testing Before Completion
Test every visible button, icon, link, dropdown, search control, clickable card, table action, and navigation item individually.

Verify:
1. Every control triggers its intended action.
2. Navigation reaches the correct existing page.
3. Data loads from the correct backend source.
4. Changes persist after refresh wherever persistence is expected.
5. One customer cannot access another customer's private information.
6. Loading, empty, success, and failure states behave correctly.
7. Browser console and network requests do not show unresolved interaction errors.
8. The dashboard remains visually faithful to the supplied reference image.

**Do not mark the task complete just because the UI looks correct. Completion requires both visual fidelity and verified end-to-end functionality. In the final report, list tested interactions and explicitly disclose anything that remains incomplete.**
