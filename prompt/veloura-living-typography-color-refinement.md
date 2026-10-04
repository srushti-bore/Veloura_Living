# Veloura Living — Typography & Color Refinement

## Purpose

This is a **refinement-only** task for the existing Veloura Living frontend.

The Veloura Living authentication experience has already been implemented separately using `veloura-auth-experience.md`.

**DO NOT re-implement, redesign, or duplicate the authentication experience.**

This task only refines:
1. Typography
2. Color temperature / palette
3. Visual consistency

The existing Veloura Living UI/UX, layout, components, imagery, interactions, animations, and authentication experience must remain intact.

---

# 1. NON-NEGOTIABLE — DO NOT REDESIGN

The current Veloura Living website is already designed and approved.

DO NOT redesign or replace:
- Homepage layout
- Header
- Navigation
- Hero structure
- Existing sections
- Product cards
- Collection layouts
- Existing imagery
- Existing interactions
- Existing animations
- Existing responsive structure
- Existing component architecture unless technically necessary

Do not rebuild the frontend from scratch.

Do not introduce a new unrelated design system.

Only apply the typography and color refinements defined in this document.

---

# 2. FINAL BRAND DIRECTION

Veloura Living should communicate:

- Premium
- Luxury
- Editorial
- Warm
- Sophisticated
- Minimal
- Architectural
- Real-home feeling
- Premium furniture ecommerce
- Furniture Intelligence

The website should feel like:

**Luxury interior design editorial + premium furniture showroom + modern architectural magazine + high-end ecommerce**

It should NOT feel like generic ecommerce, SaaS, fintech, cyberpunk, neon interface, or cold technology UI.

---

# 3. TYPOGRAPHY — FINAL DECISION

## Primary Display Font — Instrument Serif

Use **Instrument Serif** for:
- Hero headlines
- Main page headings
- Editorial headlines
- Collection titles
- Large section headings where appropriate
- Product storytelling headlines
- Luxury statements
- Editorial content
- High-impact promotional statements

Instrument Serif provides the emotional, editorial and luxury character of Veloura.

The existing hero treatment such as **“Timeless Furniture / for Living.”** should retain its editorial character while using Instrument Serif consistently.

## Secondary / Functional Font — Instrument Sans

Use **Instrument Sans** for:
- Navigation
- Buttons
- Search
- Product information
- Product metadata
- Prices
- Filters
- Forms
- Checkout
- Account UI
- AI Consultant UI
- Admin UI
- Labels
- Supporting descriptions
- Body copy
- Microcopy

Instrument Sans provides clarity, readability and ecommerce usability.

## Typography Philosophy

**Instrument Serif = Emotion + Luxury + Editorial**

**Instrument Sans = Clarity + Ecommerce + Function**

Do not use Instrument Serif everywhere.

Do not use Instrument Sans as the only font.

---

# 4. TYPOGRAPHY APPLICATION

### Hero
Instrument Serif for primary hero headings.
Instrument Sans for supporting copy and CTA labels.

### Navigation
Instrument Sans.

### Collection / Editorial Sections
Instrument Serif for major titles.
Instrument Sans for descriptions and supporting UI.

### Product Cards
Use Instrument Serif selectively for product names where it improves the premium feel.
Use Instrument Sans for price, variant information, labels, metadata and buttons.

### Ecommerce Functional UI
Use Instrument Sans for search, filters, sorting, cart, checkout, forms and account UI.

---

# 5. COLOR PALETTE — FINAL DIRECTION

The current website already has a warm cream and brown foundation.

**Do NOT completely replace the current palette.**

Make the current palette slightly warmer, richer and more sophisticated.

Desired progression:

**Ivory → Cream → Warm Beige → Warm Brown → Deep Brown**

The website should become warmer without becoming a fully brown website.

## Approved Color Tokens

### Deep Brown
`#3B2418`

Use for primary CTA buttons, strong contrast, important controls and premium emphasis.

### Dark Brown
`#4A2C1A`

Use for primary text, strong headings and important UI text.

### Warm Brown
`#7A4E2D`

Use for accents, active states, hover states and secondary emphasis.

### Veloura Brown
`#8B5A2B`

Retain this as an important Veloura brand accent. Use selectively.

### Warm Terracotta
`#9A633D`

Use very sparingly as a small accent, not as a dominant color.

### Warm Ivory
`#FBF8F3`

Use for main page surfaces and clean premium areas.

### Cream
`#F7F0E7`

Use for warm sections, cards and secondary surfaces.

### Soft Beige
`#E8D8C5`

Use for subtle backgrounds, borders and decorative elements.

### Border
`#D8C4AD`

Use for dividers, input borders and subtle separators.

### Muted Text
`#735E4E`

Use for supporting descriptions, secondary information and metadata.

---

# 6. COLOR BALANCE — IMPORTANT

Do NOT turn the website into a brown website.

The visual balance should be:

- Ivory / Cream → dominant
- Beige → supporting
- Warm Brown → brand emphasis
- Deep Brown → contrast
- Terracotta → minimal accent

The desired feeling is:

**Warm luxury**

NOT:

**Dark brown ecommerce**

Avoid introducing:
- Blue-dominant UI
- Neon green
- Purple
- Cool gray dominance
- Bright orange
- Neon colors
- Black-heavy surfaces
- Strong multicolor gradients

---

# 7. BUTTON REFINEMENT

Preserve existing button shapes and layout.

Do NOT redesign buttons.

Only refine colors where necessary.

### Primary Button
Background: `#3B2418`
Text: Warm Ivory / White

### Hover
`#7A4E2D`

### Secondary Button
Warm Ivory / Cream background with Warm Brown or Deep Brown border and dark brown text.

---

# 8. NAVIGATION REFINEMENT

Keep the existing navigation structure unchanged.

Use **Instrument Sans** for navigation labels, utility actions, account, cart, search, AI Consultant and Admin.

Active states may use Veloura Brown or Warm Brown.

Do not redesign the header.

---

# 9. EXISTING HERO — PRESERVE

The current hero is already visually strong.

Preserve:
- Hero structure
- Day / Night experience
- Existing imagery
- Existing CTA placement
- Existing interactive behavior
- Existing layout
- Existing spacing

Only refine typography and color consistency.

---

# 10. EXISTING AUTHENTICATION — PRESERVE

The authentication experience has already been implemented separately.

**DO NOT:**
- Rebuild it
- Duplicate it
- Replace its lifestyle image
- Create another authentication design
- Reintroduce glassmorphism
- Change its layout unnecessarily

Preserve the already implemented authentication experience from `veloura-auth-experience.md`.

Only apply typography/color changes necessary for consistency with the finalized Veloura system.

The authentication's existing:
- Solid cream/ivory surface
- Warm brown typography
- Premium lifestyle image
- Sign In / Sign Up structure
- Concierge Access concept
- Profile integration

must remain intact.

**Do not duplicate the Gemini image-generation prompt or image implementation instructions.**

---

# 11. EXISTING UI/UX MUST REMAIN INTACT

Preserve:
- Existing hover behavior
- Existing scroll behavior
- Existing GSAP animations
- Existing smooth scrolling
- Existing interactive hero
- Existing cards
- Existing navigation behavior
- Existing AI interactions
- Existing responsive behavior

This is a visual refinement task, not a UX redesign.

---

# 12. RESPONSIVE BEHAVIOR

Typography and colors must remain consistent across desktop, tablet and mobile.

Do not introduce responsive layout changes unless required for readability or preventing overflow.

Instrument Serif should scale appropriately.
Instrument Sans should remain highly readable for functional UI.

---

# 13. ACCESSIBILITY

Maintain or improve:
- Text contrast
- Focus states
- Button readability
- Form readability
- Navigation readability

Do not use brown shades that cause insufficient contrast.

---

# 14. PERFORMANCE

Do not unnecessarily add:
- New UI libraries
- Large font packages
- Duplicate font files
- Heavy dependencies

Use the project's existing font-loading strategy where possible.

If the fonts are not already available, implement them using the project's existing preferred font-loading approach and avoid loading unnecessary weights.

---

# 15. IMPLEMENTATION PROCESS

Before making changes:

1. Inspect the existing Veloura Living frontend.
2. Identify the current typography implementation.
3. Identify current color tokens / CSS variables / theme values.
4. Identify where fonts are loaded.
5. Map display typography to Instrument Serif.
6. Map functional typography to Instrument Sans.
7. Refine the current palette toward the approved warm brown/ivory palette.
8. Preserve existing component dimensions.
9. Preserve existing spacing.
10. Preserve existing layout.
11. Preserve existing animations.
12. Preserve the already implemented authentication experience.
13. Test all major pages.
14. Test desktop, tablet and mobile.
15. Verify contrast.
16. Verify there is no accidental redesign.

---

# 16. FINAL QUALITY CHECK

### Typography
- Instrument Serif is used for editorial/display content.
- Instrument Sans is used for functional/ecommerce content.
- Typography hierarchy is consistent.
- No random third font has been introduced.

### Color
- Website feels warmer.
- Cream and ivory remain dominant.
- Brown provides premium contrast.
- Brown is not overused.
- No cool/neon colors were introduced.

### Existing Design
- Homepage layout unchanged.
- Header unchanged.
- Hero structure unchanged.
- Product layouts unchanged.
- Existing interactions unchanged.
- Existing animations unchanged.
- Existing authentication experience preserved.

---

# FINAL NON-NEGOTIABLE RULE

This is a **TYPOGRAPHY + COLOR REFINEMENT ONLY** task.

Do not redesign Veloura Living.

Do not reimplement the authentication experience.

Do not duplicate the Gemini image-generation instructions.

Do not replace existing imagery.

Do not introduce glassmorphism.

Do not create a new layout.

Only refine the existing Veloura Living experience using:

## Typography
**Instrument Serif + Instrument Sans**

## Palette
**Warm Ivory + Cream + Soft Beige + Warm Brown + Deep Brown**

## Brand Feeling
**Premium + Luxury + Editorial + Warm + Architectural + Ecommerce**

The final result should feel like the same Veloura Living website — simply more polished, cohesive, warm and luxurious.
