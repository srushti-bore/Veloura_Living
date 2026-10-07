# Veloura Living — Premium Multi-Step Checkout UX Implementation

## Objective

Redesign the existing Veloura Living checkout experience into a **standard, premium, multi-step checkout flow**.

The current checkout experience is not satisfactory because multiple checkout sections are being presented together. I want each checkout stage to have its **own dedicated page/route**, while maintaining a persistent step navigation on the left side.

The goal is to make the checkout feel like a premium furniture purchasing journey — clean, intentional, spacious, trustworthy, and easy to navigate.

---

# IMPORTANT — DO NOT CHANGE THE EXISTING DESIGN SYSTEM

This is extremely important.

Do NOT redesign the overall Veloura Living website.

Do NOT change:

- Existing global UI/UX
- Existing homepage design
- Existing product pages
- Existing typography
- Existing color palette
- Existing buttons
- Existing header/footer
- Existing cards
- Existing animations
- Existing spacing system
- Existing responsive behavior
- Existing visual identity

Reuse the existing Veloura Living design system and components wherever possible.

Only redesign/restructure the **Checkout flow**.

Do not introduce a completely different visual language.

The checkout must feel like it belongs to the existing Veloura Living website.

---

# REQUIRED CHECKOUT FLOW

Implement the checkout as separate dedicated routes/pages.

The final flow must be:

```text
CHECKOUT
   ↓
01 — CLIENT IDENTITY
   ↓
02 — DELIVERY DESTINATION
   ↓
03 — ATELIER STAGING
   ↓
04 — ORDER & VAULT REVIEW
   ↓
05 — PAYMENT
   ↓
ORDER CONFIRMED
```

---

# ROUTE STRUCTURE

Use a clean route architecture similar to:

```text
/checkout
/checkout/identity
/checkout/delivery
/checkout/atelier
/checkout/review
/checkout/payment
/checkout/success
```

If the existing project architecture has a better equivalent, use it instead.

Do not unnecessarily restructure the entire application.

---

# LEFT-SIDE CHECKOUT STEPPER

Every checkout step should have a persistent left-side navigation / progress rail.

Example:

```text
CHECKOUT

✓ 01
  Client Identity

○ 02
  Delivery Destination

○ 03
  Atelier Staging

○ 04
  Order & Vault Review

○ 05
  Payment
```

The exact visual implementation should follow the existing Veloura design language.

## Step states

### Active step

The current step must be clearly highlighted.

### Completed step

Completed steps should display a checkmark and appear clickable so the user can go back and edit information.

### Upcoming step

Upcoming steps should remain visually muted.

### Progress

The user should always understand:

- Where they are
- What they already completed
- What comes next
- How many steps remain

---

# STEP 01 — CLIENT IDENTITY

Route:

```text
/checkout/identity
```

Purpose:

Collect customer identity information.

Include the appropriate existing checkout/auth fields such as:

- First Name
- Last Name
- Email
- Phone Number

Support the existing Guest Checkout behavior.

If the user is already authenticated, pre-fill available information.

Primary CTA:

```text
Continue to Delivery
```

Secondary navigation:

```text
Back
```

Validation must happen before allowing the user to continue.

---

# STEP 02 — DELIVERY DESTINATION

Route:

```text
/checkout/delivery
```

Purpose:

Collect the customer's delivery destination.

Include:

- Address Line
- Apartment / Suite if applicable
- City
- State
- PIN / Postal Code
- Country

Use the existing Veloura form components where possible.

Primary CTA:

```text
Continue to Atelier Staging
```

Allow the user to return to Client Identity.

---

# STEP 03 — ATELIER STAGING

Route:

```text
/checkout/atelier
```

This step should maintain Veloura's premium furniture identity.

Do NOT make this look like a generic ecommerce shipping page.

Use this step for the applicable delivery/shipping/staging preferences already supported by the application.

Examples may include:

- Delivery method
- Shipping option
- Estimated delivery information
- Installation / assembly information if supported
- Special delivery instructions if supported

The actual available options must come from the existing application/business logic.

Do NOT invent backend functionality that does not exist.

Primary CTA:

```text
Continue to Order & Vault Review
```

---

# STEP 04 — ORDER & VAULT REVIEW

Route:

```text
/checkout/review
```

This is the final order review before payment.

Show a clear summary of:

### Products

- Product image
- Product name
- Variant
- Quantity
- Price

### Pricing

- Subtotal
- Discount
- Shipping
- GST / Tax
- Final total

### Customer information

- Client Identity

### Delivery information

- Delivery Destination
- Selected delivery/staging option

The user must be able to edit each section.

For example:

```text
CLIENT IDENTITY
John Doe
john@example.com
[Edit]

DELIVERY DESTINATION
Mumbai, Maharashtra
[Edit]

ATELIER STAGING
Standard Delivery
[Edit]
```

Then show:

```text
ORDER TOTAL
₹XX,XXX
```

Primary CTA:

```text
Continue to Payment
```

---

# STEP 05 — PAYMENT

Route:

```text
/checkout/payment
```

This step should contain the existing Razorpay payment integration.

Do NOT redesign the payment provider UI unnecessarily.

The Veloura checkout should clearly show:

- Order total
- Selected order information
- Payment options
- Razorpay Checkout initiation

Support the payment methods already implemented by the backend.

The payment flow must remain secure.

Do NOT implement fake/simulated payment success.

Do NOT bypass backend payment verification.

Payment success should only happen after proper backend verification.

---

# ORDER SUCCESS

Route:

```text
/checkout/success
```

After successful payment, show the existing Veloura success experience or improve it only within the current design language.

Show:

- Order confirmation
- Order number
- Payment status
- Delivery information
- Order summary
- Track Order CTA

Example:

```text
ORDER CONFIRMED

Your Veloura order has been successfully placed.

Order #VL-XXXXXX

[Track Order]
[Continue Shopping]
```

---

# NAVIGATION RULES

The checkout should behave like a real production ecommerce checkout.

### User can:

- Move forward only after required validation
- Go back to previous completed steps
- Edit previously entered information
- See their current progress at all times

### User should NOT:

- Skip required steps
- Directly access Payment without completing required checkout data
- Lose entered information when navigating between steps
- Lose cart data during checkout

If a user refreshes the page, preserve the checkout state using the application's existing state/persistence architecture.

Do not introduce unnecessary localStorage duplication if the project already has a centralized state solution.

---

# RESPONSIVE DESIGN

Desktop:

```text
------------------------------------------------
| Checkout Steps | Current Step Content        |
|                |                             |
| 01 Identity ✓  |                             |
| 02 Delivery    |        FORM / CONTENT       |
| 03 Atelier     |                             |
| 04 Review      |                             |
| 05 Payment     |                             |
------------------------------------------------
```

Mobile:

The left-side stepper should transform into an appropriate compact responsive progress indicator.

Do NOT force a desktop sidebar onto mobile.

Maintain the existing Veloura responsive design language.

---

# COMPONENT ARCHITECTURE

Prefer reusable components such as:

```text
CheckoutStepper
CheckoutLayout
CheckoutStepHeader
CheckoutNavigation
IdentityStep
DeliveryStep
AtelierStagingStep
OrderReviewStep
PaymentStep
CheckoutSummary
```

Reuse existing form, button, card, typography and layout components wherever possible.

Do not duplicate components unnecessarily.

---

# DATA / STATE REQUIREMENTS

The checkout steps must share the same checkout state.

Example conceptual state:

```ts
checkoutState = {
  identity,
  delivery,
  atelierStaging,
  orderReview,
  payment
}
```

Do not create separate isolated states for every page.

The final payment/order must use the same authoritative cart and pricing data already used by the application.

Do NOT trust client-side price values as the final payment amount.

The backend must remain authoritative for:

- Product price
- Quantity
- Discounts
- Shipping
- GST
- Final payable amount
- Order creation
- Payment verification

---

# IMPORTANT RAZORPAY REQUIREMENT

Do NOT weaken or bypass the existing Razorpay security flow.

The checkout UI should only trigger the proper backend payment flow.

Required conceptual flow:

```text
Checkout UI
    ↓
Create/validate Veloura Order
    ↓
Server-side authoritative amount
    ↓
Create Razorpay Order
    ↓
Open Razorpay Checkout
    ↓
Receive Razorpay response
    ↓
Backend signature verification
    ↓
Validate payment/order/amount
    ↓
Confirm Veloura Order
    ↓
Success Page
```

Never create a fake successful payment.

Never use fake:

```text
pay_test_*
sig_test_*
```

or similar simulated payment identifiers in the real checkout flow.

---

# DESIGN QUALITY REQUIREMENTS

The checkout should feel:

- Premium
- Minimal
- Calm
- Trustworthy
- Spacious
- Luxury furniture oriented
- Easy to understand

Avoid:

- Overcrowded layouts
- Excessive borders
- Generic SaaS styling
- Generic marketplace checkout styling
- Unnecessary animations
- Aggressive gradients
- Neon colors
- Blue-heavy UI
- Excessive glassmorphism
- Huge form blocks

Use subtle transitions between checkout steps where appropriate.

Do not add excessive animation.

---

# ACCESSIBILITY

Ensure:

- Proper form labels
- Keyboard navigation
- Visible focus states
- Accessible buttons
- Accessible error messages
- Proper input validation
- Screen-reader friendly step navigation where applicable

---

# ERROR HANDLING

Each step should clearly show validation errors.

Examples:

```text
Please enter your email address.
```

```text
Please enter a valid PIN code.
```

```text
Payment could not be completed. Please try again.
```

Do not silently fail.

Do not show fake success.

---

# IMPORTANT IMPLEMENTATION RULES

Before modifying anything:

1. Inspect the existing checkout implementation.
2. Identify the current checkout state management.
3. Identify existing components that can be reused.
4. Identify existing Razorpay integration.
5. Identify existing order creation flow.
6. Identify existing cart/pricing logic.

Then implement the multi-step checkout architecture.

Do NOT rebuild unrelated parts of the application.

Do NOT modify homepage/product page/header/footer design.

Do NOT change the existing Veloura branding.

Do NOT change the existing UI/UX outside checkout.

---

# ENVIRONMENT FILE SECURITY — ABSOLUTE RULE

DO NOT access, open, read, parse, print, inspect, modify, copy, or expose any environment file.

This includes:

```text
.env
.env.local
.env.development
.env.development.local
.env.test
.env.test.local
.env.production
.env.production.local
.env.example
```

Do not inspect their contents.

Do not ask me to provide environment variable values.

Use only environment variable names in code where required, for example:

```ts
process.env.RAZORPAY_KEY_ID
process.env.RAZORPAY_KEY_SECRET
```

Never expose or print their values.

Never include secrets in source code.

---

# FINAL ACCEPTANCE CRITERIA

The implementation is complete only when:

- Checkout is split into separate dedicated pages/routes.
- Left-side checkout stepper is present on desktop.
- Mobile has a responsive progress representation.
- Each step has its own content.
- Completed steps can be revisited.
- Required validation works.
- Checkout state persists between steps.
- Cart is preserved throughout checkout.
- Review page accurately summarizes the order.
- Payment page integrates with the existing Razorpay flow.
- No fake payment success exists.
- Backend remains authoritative for final pricing/payment/order confirmation.
- Success page appears only after successful payment verification.
- Existing Veloura UI/UX/design outside checkout remains unchanged.
- No environment file is accessed.
- No unrelated functionality is modified.

Before finishing, run the relevant existing tests/build checks and fix any errors introduced by this implementation.

Provide a concise implementation summary listing:

1. Routes created/updated
2. Components created/updated
3. Checkout state changes
4. Razorpay integration changes, if any
5. Validation changes
6. Tests/build status

Do not modify anything outside the required checkout scope.