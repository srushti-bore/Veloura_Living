# Veloura Living — Admin Dashboard: Exact Reference Implementation

## Objective

Implement the Veloura Living Admin Dashboard to match the attached reference image **as closely as possible, pixel-for-pixel wherever practical**. The attached image is the definitive visual reference and must be followed strictly.

This is an implementation task, not a redesign task.

## 1. Strict Visual Requirements

Recreate the dashboard with the same layout, proportions, spacing, typography, colors, and visual hierarchy shown in the reference image.

### Overall Layout
- A premium, warm, minimal furniture-brand dashboard.
- Cream/ivory content background with subtle warm borders and shadows.
- Deep espresso-brown left sidebar with the Veloura Living logo at the top.
- Large main content area with a clean, structured layout.
- Maintain the reference image's desktop proportions while making the layout responsive.

### Left Sidebar
Reproduce the sidebar with the following elements in the same order and visual style:

1. Veloura Living logo
2. Admin profile/avatar
3. Greeting: “Hi, Admin”
4. Role label: “Administrator”
5. Dashboard
6. Products
7. Orders
8. Customers
9. Inventory
10. Coupons
11. Content
12. Analytics
13. Settings
14. Logout at the bottom

The active navigation item must have the same warm-brown highlighted appearance as the reference. Each navigation item must open its corresponding functional section.

### Top Navigation
- Search field with the placeholder “Search anything...”
- Notification bell
- Admin profile icon and dropdown
- Preserve the reference image's alignment, sizing, and spacing.

### Dashboard Header
Display:
- “Good Morning, Admin”
- “Here's what's happening with your store today.”

The greeting should use the authenticated administrator's actual display name where available, without hardcoding a specific person's identity.

### Summary Cards
Create four cards matching the reference:

1. Total Orders
2. Total Revenue
3. Total Customers
4. Active Products

Each card must display the actual corresponding value from the database, with percentage trends only when reliable comparison data is available. Do not hardcode the sample figures or percentage changes from the image.

### Sales Overview
- Recreate the large sales chart on the left.
- Include the “Last 7 days” dropdown shown in the reference.
- The chart must display real sales/revenue data for the selected period.
- Changing the period must update the chart and related totals.
- Include proper currency formatting in INR.
- Provide loading, empty-data, and error states.

### Recent Orders
- Recreate the recent-orders table on the right.
- Include Order ID, Customer, Amount, Status, and Date columns.
- Display real orders from the database.
- Preserve the reference's compact table styling, row separators, spacing, and status badges.
- “View all” must navigate to the complete Orders section.

## 2. Every Section Must Work

Implement the following sections as functional admin interfaces, not static mockups:

- **Dashboard:** Store overview, metrics, sales chart, and recent orders.
- **Products:** View, search, filter, create, edit, activate/deactivate, and archive products where supported.
- **Orders:** View order details, payment status, fulfillment status, and tracking information. Allow permitted status updates with validation.
- **Customers:** View customer records, search and filter them, and open customer details. Never expose passwords, OTPs, or sensitive authentication data.
- **Inventory:** Display stock levels, variants, SKUs, and low-stock alerts. Support authorized stock adjustments with validation and audit records where supported.
- **Coupons:** View, create, edit, activate/deactivate, and validate coupons according to the existing business rules.
- **Content:** Manage existing supported homepage content, banners, collections, and other CMS content.
- **Analytics:** Provide meaningful sales, order, product, and customer metrics using real data.
- **Settings:** Implement the existing supported store and account settings with proper authorization.
- **Notifications:** Open a functional notification panel using real notification data when available.
- **Admin profile dropdown:** Provide working profile/account actions supported by the application.
- **Global search:** Search relevant records using the existing backend capabilities and display actionable results.
- **Logout:** Safely terminate the authenticated session and redirect to the appropriate login screen.

Do not create decorative controls that look functional but do nothing.

## 3. Every Button and Interactive Element Must Work

Audit and implement every visible interactive element, including:

- Sidebar navigation items
- Search field and search results
- Notification bell
- Admin profile dropdown
- Summary cards where navigation or drill-down is appropriate
- Sales chart date-range dropdown
- “View all” link
- Table rows and actionable order details
- Product, order, customer, inventory, coupon, content, analytics, and settings controls
- Logout
- Pagination, sorting, filtering, dialogs, forms, and confirmation actions introduced in the relevant sections

Every action must have a meaningful result. If a feature is not supported by the current backend, implement the necessary API and persistence logic rather than presenting a fake success message.

Use appropriate loading indicators, validation messages, confirmation dialogs, success/error feedback, and empty states. Destructive actions must require confirmation.

## 4. Real Data and Backend Integration

- Inspect the existing Veloura Living repository and reuse its current architecture, components, API routes, authentication, database models, and business logic wherever appropriate.
- Integrate the dashboard with the actual persistent database and existing APIs.
- Do not hardcode sample dashboard figures, customers, orders, products, revenue, chart points, or success responses.
- Do not replace real database data with mock data in production.
- Use consistent INR formatting and the application's existing date conventions.
- Handle API errors and unavailable data gracefully.
- Make sure all mutations are persisted and remain correct after refreshing or signing in again.
- Ensure the dashboard reflects actual database changes.

## 5. Security and Single-Admin Authorization

Veloura Living must retain its intended **single Admin account with full administrative access**.

- Only the authorized Admin account may access protected admin routes and perform administrative operations.
- Enforce authorization on the server/API, not only by hiding frontend navigation items.
- Customer accounts must never gain Admin access through registration, profile editing, Google authentication, or client-side requests.
- Verify authorization for every privileged operation.
- Preserve existing login, mandatory email OTP verification, session handling, and logout behavior.
- Do not expose secrets, credentials, OTPs, password hashes, or private customer information.
- Never open, read, print, modify, or expose `.env` or `.env.*` files.
- Never hardcode Admin credentials, API secrets, or sensitive configuration.
- Do not delete existing customer, product, order, or other business data.

## 6. Flexible and Future-Ready Architecture

The dashboard must remain easy to extend when new requirements are added in the future.

- Use reusable components for summary cards, charts, tables, status badges, search, filters, dialogs, and forms.
- Keep navigation and section configuration maintainable and extensible.
- Build on the existing architecture rather than introducing unnecessary duplicate components or API systems.
- Use reusable data-fetching and error-handling patterns.
- Support additional dashboard cards, sections, metrics, and actions without requiring a complete redesign.
- Avoid hardcoded assumptions about record counts, product categories, order statuses, or future dashboard sections.
- Use proper TypeScript types and clear component responsibilities.
- Follow the repository's existing conventions and dependencies.
- Do not introduce a new dependency if the existing project already provides a suitable solution.

## 7. Design Quality and Micro-Interactions

Match the attached reference image first. Do not invent a new visual direction.

- Preserve the espresso-brown, cream, and warm-neutral palette.
- Maintain the premium furniture-brand aesthetic.
- Add subtle GSAP micro-interactions where appropriate: gentle card entrances, sidebar active-state transitions, restrained hover feedback, and smooth chart/content transitions.
- Keep animations refined and lightweight. Avoid excessive movement, bouncing, flashy effects, or distracting transitions.
- Respect `prefers-reduced-motion`.
- Ensure interactions do not interfere with navigation, form submission, accessibility, or performance.

## 8. Responsive Behavior and Accessibility

- Desktop should match the reference image as closely as practical.
- On tablets and mobile devices, adapt the sidebar, cards, chart, and tables without breaking functionality.
- Use accessible labels, keyboard-operable controls, visible focus states, and appropriate contrast.
- Ensure tables and complex data sections remain usable on smaller screens.

## 9. Required Implementation Workflow

1. Inspect the current repository and identify the existing Admin Dashboard, authentication, authorization, API routes, database models, and relevant tests.
2. Compare the existing dashboard against the attached reference image.
3. Implement the visual changes without disturbing unrelated pages or the existing customer-facing UI/UX.
4. Connect every dashboard section and interactive control to real application functionality.
5. Add or update backend/API logic only where necessary.
6. Add tests for Admin authorization, dashboard data, section navigation, important mutations, and error handling.
7. Run the available lint, type-check, build, and relevant tests.
8. Fix issues introduced by the implementation.

Do not stop after creating the dashboard's appearance. Complete the functional implementation as well.

## 10. Acceptance Criteria

The task is complete only when:

- The Admin Dashboard visually matches the attached image as closely as possible.
- All sidebar sections open the correct functional interfaces.
- All visible buttons and interactive elements perform their intended actions.
- Summary cards, sales charts, and recent orders use real persisted data.
- Search, date-range selection, navigation, and supported CRUD operations work.
- Admin-only actions are protected by server-side authorization.
- Existing authentication and mandatory OTP behavior remain intact.
- The implementation is responsive, maintainable, and ready for future additions.
- No unrelated customer-facing design has been changed.
- No `.env` files or secrets have been accessed or exposed.
- The final report clearly lists completed features, files changed, tests run, and any genuine blockers or unfinished functionality.
