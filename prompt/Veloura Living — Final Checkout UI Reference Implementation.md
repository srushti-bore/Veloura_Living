# Veloura Living — FINAL CHECKOUT UI IMPLEMENTATION

## PRIMARY INSTRUCTION

The attached reference image is the **FINAL approved visual design for the Veloura Living checkout experience**.

Treat the attached image as the **single source of truth for the checkout UI/UX**.

Do NOT redesign it.
Do NOT reinterpret it.
Do NOT create your own variation.
Do NOT add unnecessary UI elements.

The goal is to make the existing Veloura Living checkout implementation visually match the attached reference as closely as realistically possible.

---

# IMPORTANT

The reference image contains the complete approved checkout experience:

1. Client Identity
2. Delivery Destination
3. Atelier Staging
4. Order & Vault Review
5. Payment
6. Order Confirmed

The existing application already has checkout functionality.

Your job is to **bring the existing implementation visually and structurally in line with this reference design**, while preserving the underlying business logic.

---

# DO NOT CHANGE

Do NOT modify:

- Existing product catalog
- Homepage
- Product pages
- Shop pages
- Header functionality
- Authentication system
- Cart functionality
- Wishlist functionality
- Backend architecture
- Order business logic
- Razorpay security logic
- API contracts unless absolutely required
- Database logic
- Environment configuration
- Existing non-checkout pages

Only modify the checkout experience.

---

# FINAL VISUAL DIRECTION

The checkout should match the reference image's:

- Warm ivory / cream background
- Dark brown typography
- Elegant serif display headings
- Clean modern sans-serif body text
- Thin subtle borders
- Soft rounded corners
- Minimal shadows
- Premium editorial furniture aesthetic
- Generous whitespace
- Very restrained visual hierarchy
- Minimal luxury ecommerce appearance

The checkout must feel like a **luxury furniture brand**, not a SaaS dashboard.

---

# TYPOGRAPHY — VERY IMPORTANT

The current implementation has typography that looks blurry/heavy.

Fix this.

The reference uses a combination of:

### Display / Headings

Use an elegant high-quality serif font.

Headings such as:

```text
Checkout
Client Identity
Delivery Destination
Atelier Staging
Order & Vault Review
Payment
Order Confirmed
```

must have:

- High readability
- Sharp rendering
- Elegant editorial appearance
- Medium/light weight
- Proper letter spacing
- No artificial blur
- No excessive boldness

### Body

Use a clean premium sans-serif font for:

- Labels
- Inputs
- Buttons
- Navigation
- Supporting text
- Prices
- Step labels

Avoid using the same font family for every element if the existing design system already supports a serif + sans pairing.

IMPORTANT:

Do not use CSS effects that make text appear blurred.

Avoid:

```css
filter: blur(...)
text-shadow: ...
transform: scale(...) 
```

or any other unnecessary rendering effect on typography.

Typography must remain crisp at normal browser zoom.

---

# HEADER

Keep the existing Veloura header structure/functionality.

Visually make the checkout header consistent with the attached reference:

- Minimal
- Clean
- Thin
- Warm cream background
- Veloura logo on left
- Navigation
- Utility icons on right

Do not introduce a new header system if the current one can be styled to match.

---

# CHECKOUT LAYOUT

Desktop layout should follow the reference:

```text
┌───────────────────────────────────────────────────────────────┐
│                       HEADER                                  │
├──────────────┬─────────────────────────────┬──────────────────┤
│              │                             │                  │
│  CHECKOUT    │       STEP CONTENT          │  ORDER SUMMARY   │
│              │                             │                  │
│  01          │                             │  Product         │
│  Identity    │                             │  Price           │
│              │                             │  Subtotal        │
│  02          │                             │  Shipping        │
│  Delivery    │                             │  Total           │
│              │                             │                  │
│  03          │                             │  Product image   │
│  Atelier     │                             │                  │
│              │                             │                  │
│  04          │                             │                  │
│  Review      │                             │                  │
│              │                             │                  │
│  05          │                             │                  │
│  Payment     │                             │                  │
│              │                             │                  │
└──────────────┴─────────────────────────────┴──────────────────┘
```

The proportions, spacing and visual density should closely follow the reference image.

---

# LEFT CHECKOUT NAVIGATION

Create a refined vertical checkout progress navigation.

Do NOT use large dark cards like the current implementation.

The reference uses a much lighter and more elegant vertical step system.

Each step contains:

- Small circular indicator
- Step number
- Step name

Example:

```text
01  Client Identity

02  Delivery Destination

03  Atelier Staging

04  Order & Vault Review

05  Payment
```

Completed:

```text
✓ Client Identity
```

Current:

```text
● Atelier Staging
```

Upcoming:

```text
○ Payment
```

Use subtle colors and typography.

The left navigation must remain visually lightweight.

---

# MAIN CONTENT

The center content area is the primary focus.

Use:

- Large elegant serif heading
- Small step indicator
- Short supporting description
- Clean forms/content
- Large whitespace
- Minimal borders

Avoid making the entire center section look like a heavy card.

The reference design is **editorial and spacious**.

---

# RIGHT ORDER SUMMARY

Create a compact order summary panel matching the reference.

Include:

- Product thumbnail
- Product name
- Variant information
- Quantity
- Price
- Subtotal
- Shipping
- Final total

Example:

```text
Order Summary

[Product Image]

Solitude Upholstered
King Bed

Qty: 1

₹1,22,000

────────────────

Subtotal       ₹1,22,000
Shipping       Complimentary

Total Payable  ₹1,22,000
```

Keep this panel visually quiet.

Do NOT add unnecessary promotional blocks, badges or large marketing messages.

---

# STEP 01 — CLIENT IDENTITY

Route:

```text
/checkout/identity
```

Match the reference design.

Content:

```text
Checkout

Client Identity

Let's get to know you. This helps us personalize your
experience and keep you updated on your order.

[Continue as Guest] [Already have an account?]

First Name
Last Name

Email Address

Phone Number

[ ] Keep me updated with news, offers and design inspiration.

Continue to Delivery →
```

Keep the form clean and minimal.

---

# STEP 02 — DELIVERY DESTINATION

Route:

```text
/checkout/delivery
```

Match the reference.

Fields:

- Address Line 1
- Address Line 2
- City
- State
- PIN Code
- Country

Include a subtle delivery information block.

Primary CTA:

```text
Continue to Atelier Staging →
```

---

# STEP 03 — ATELIER STAGING

Route:

```text
/checkout/atelier
```

Match the reference.

Include:

### Delivery Method

Radio options such as:

- Standard Delivery
- White-Glove Delivery
- Express Delivery

Only show options supported by the existing application/backend.

### Additional Services

Use the existing supported services.

Examples:

- Professional Assembly
- Old Furniture Removal
- Installation Support

### Special Instructions

Optional textarea.

Primary CTA:

```text
Continue to Order & Review →
```

---

# STEP 04 — ORDER & VAULT REVIEW

Route:

```text
/checkout/review
```

This page should follow the reference closely.

Show sections:

### Your Order

Product image + product details + price.

### Client Identity

Show saved customer information.

Include:

```text
Edit
```

### Delivery Destination

Show saved address.

Include:

```text
Edit
```

### Atelier Staging

Show selected delivery/staging option.

Include:

```text
Edit
```

Primary CTA:

```text
Continue to Payment →
```

---

# STEP 05 — PAYMENT

Route:

```text
/checkout/payment
```

Match the reference payment page.

Use clean payment method cards:

```text
○ Razorpay
  UPI · Cards · Net Banking · Wallets

○ UPI

○ Credit / Debit Card

○ Net Banking

○ Wallets
```

However, only expose payment methods that are actually supported by the current payment implementation.

Do NOT create fake payment methods.

Do NOT simulate successful payments.

The Razorpay integration must remain backend-authoritative and secure.

Primary CTA:

```text
Pay ₹X →
```

---

# ORDER CONFIRMED

Route:

```text
/checkout/success
```

Match the final panel in the reference image.

Use:

- Large check icon
- Elegant serif heading
- Short confirmation message
- Order number
- Payment status
- Estimated delivery
- Track Order button
- Continue Shopping button
- Large premium furniture image on the right

Example:

```text
Order Confirmed

Thank you for choosing Veloura Living.
Your order has been successfully placed.

Order Number
#VL-24876

Payment Status
● Paid

Estimated Delivery
7–10 business days

[Track Your Order →]
[Continue Shopping]
```

---

# IMAGES

Use existing Veloura product/brand imagery wherever possible.

Do NOT replace existing assets unnecessarily.

Images should appear:

- Sharp
- High quality
- Properly cropped
- Editorial
- Premium
- Consistent with the reference

Do not use random stock imagery if suitable project assets already exist.

---

# RESPONSIVE DESIGN

Desktop should closely match the attached reference.

Tablet:

- Preserve step navigation
- Reduce spacing intelligently

Mobile:

Convert the left vertical step navigation into a compact horizontal/top progress indicator.

Do not simply stack the desktop layout without adapting it.

---

# ANIMATION

Keep animation extremely subtle.

Allowed:

- Small page transitions
- Soft opacity transitions
- Button hover
- Step transition
- Input focus

Avoid:

- Large movement
- Bounce
- Excessive GSAP effects
- Excessive parallax
- Distracting animation

The checkout should feel calm and premium.

---

# FUNCTIONALITY MUST REMAIN INTACT

Do not sacrifice functionality for visual matching.

The flow must remain:

```text
Client Identity
      ↓
Delivery Destination
      ↓
Atelier Staging
      ↓
Order & Vault Review
      ↓
Payment
      ↓
Razorpay Verification
      ↓
Order Confirmed
```

Preserve existing:

- Cart state
- Pricing
- Discounts
- Shipping calculation
- GST calculation
- Order creation
- Payment verification
- Razorpay integration
- Authentication
- Guest checkout

---

# RAZORPAY SECURITY

Do NOT:

- Fake payment success
- Generate fake payment IDs
- Generate fake signatures
- Bypass signature verification
- Trust client-side payment success
- Expose Razorpay secret
- Modify environment files

The backend must remain authoritative.

---

# ENVIRONMENT FILE SECURITY

ABSOLUTELY DO NOT access or inspect:

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

Do not open them.

Do not read them.

Do not print them.

Do not modify them.

Do not ask for their contents.

Use environment variable references by name only.

---

# IMPLEMENTATION PROCESS

Before changing code:

1. Inspect the current checkout implementation.
2. Inspect existing checkout routes.
3. Inspect current checkout components.
4. Inspect current global typography.
5. Inspect existing design tokens.
6. Identify reusable components.
7. Identify existing product/order summary components.
8. Identify current Razorpay integration.
9. Identify current responsive behavior.

Then implement the reference design.

Do not rebuild the entire application.

---

# FINAL VISUAL QA

After implementation, compare every checkout route against the attached reference.

Check:

- Font sharpness
- Font hierarchy
- Font size
- Line height
- Spacing
- Alignment
- Border radius
- Border weight
- Background color
- Button proportions
- Step navigation
- Order summary
- Product image sizing
- Form spacing
- Responsive behavior

The final result should feel like the **same design system and same visual language as the reference image**, not merely a similar checkout.

## FINAL RULE

The attached reference image is the design source of truth.

**Do not creatively redesign it. Reproduce its visual language faithfully while preserving the existing Veloura functionality.**