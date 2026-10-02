# Veloura Living — Design Tokens
## Design System Source of Truth

**Project:** Veloura Living  
**Design System:** Veloura Living Design Tokens  
**Status:** Locked foundation for implementation  
**Primary aesthetic:** Warm, premium, modern, minimal, editorial furniture experience  
**Primary reference direction:** Modern Furniture Website Design  
**Animation:** GSAP  
**Smooth scrolling:** Lenis  
**Immersive layer:** Selective 3D floating objects  

---

# 1. Design Philosophy

Veloura Living is not a generic furniture ecommerce interface.

The visual system must communicate:

- Premium
- Warm
- Elegant
- Sophisticated
- Minimal
- Calm
- Editorial
- Aspirational
- Human
- Home-oriented
- Design-conscious
- Emotionally engaging

The interface should feel like a premium furniture/design publication combined with intelligent commerce.

### Core principle

> **Furniture विकायचं नाही... Furniture Intelligence build करायची आहे.**

The visual system must support:

**Space → Design → Emotion → Discovery → Product → Purchase**

AI must feel like a natural furniture/design intelligence layer, not a generic AI tool.

---

# 2. Visual Direction

## Primary visual language

Use:

- Real-home interiors
- Warm natural lighting
- Neutral furniture
- Natural wood
- Linen
- Boucle
- Soft upholstery
- Stone and tactile materials
- Editorial compositions
- Large immersive imagery
- Generous whitespace
- Refined typography
- Soft contrast
- Restrained motion

Avoid:

- Neon interfaces
- Dominant green
- Dominant blue
- Futuristic SaaS aesthetics
- Gaming-style UI
- Excessive gradients
- Excessive glassmorphism
- Cold corporate layouts
- Sterile white-background product presentation
- Overly technical visual language
- Excessive animation

---

# 3. Color Tokens

## 3.1 Brand Palette

| Token | Value | Usage |
|---|---|---|
| `--color-primary-brown` | `#8B5A2B` | Primary brand accent |
| `--color-deep-brown` | `#4A2C1A` | Strong text, premium accents |
| `--color-warm-cream` | `#F5E6D3` | Warm brand background |
| `--color-soft-beige` | `#EADBC8` | Secondary surface |

These colors establish Veloura's warm furniture identity.

---

## 3.2 Neutral System

Use warm neutrals instead of pure black/white wherever possible.

```css
--color-neutral-0: #FFFFFF;
--color-neutral-50: #FCFAF7;
--color-neutral-100: #F7F4EF;
--color-neutral-200: #EEE9E1;
--color-neutral-300: #DED7CD;
--color-neutral-400: #C6BDB1;
--color-neutral-500: #9C9287;
--color-neutral-600: #746B61;
--color-neutral-700: #514A43;
--color-neutral-800: #332E29;
--color-neutral-900: #211E1B;
```

### Usage

- `neutral-0`: cards or controlled light surfaces
- `neutral-50`: primary page backgrounds
- `neutral-100`: secondary sections
- `neutral-200`: subtle borders
- `neutral-300`: dividers
- `neutral-500`: muted text
- `neutral-700`: secondary text
- `neutral-900`: primary dark text

---

## 3.3 Semantic Colors

Semantic colors should remain visually restrained.

```css
--color-success: #557A5A;
--color-warning: #A47A45;
--color-error: #A6544D;
--color-info: #657785;
```

Do not allow semantic colors to dominate the visual identity.

---

## 3.4 Background Tokens

```css
--surface-page: var(--color-neutral-50);
--surface-primary: #FFFFFF;
--surface-warm: var(--color-warm-cream);
--surface-soft: var(--color-soft-beige);
--surface-dark: var(--color-deep-brown);
--surface-muted: var(--color-neutral-100);
```

---

## 3.5 Text Tokens

```css
--text-primary: var(--color-neutral-900);
--text-secondary: var(--color-neutral-700);
--text-muted: var(--color-neutral-500);
--text-inverse: #FFFFFF;
--text-brand: var(--color-deep-brown);
--text-accent: var(--color-primary-brown);
```

---

# 4. Typography

Veloura uses a two-font system.

## 4.1 Display / Editorial

**Font:** Playfair Display

Use for:

- Hero headlines
- Major page titles
- Editorial headings
- Premium brand moments
- Large room storytelling
- Emotional statements

```css
--font-display: "Playfair Display", serif;
```

---

## 4.2 UI / Functional

**Font:** Inter

Use for:

- Navigation
- Body text
- Buttons
- Labels
- Product metadata
- Filters
- Forms
- Search
- Commerce UI
- Account UI

```css
--font-body: "Inter", sans-serif;
```

---

# 5. Typography Scale

## Display

```css
--font-size-display-xl: clamp(4rem, 8vw, 8rem);
--font-size-display-lg: clamp(3.5rem, 6vw, 6.5rem);
--font-size-display-md: clamp(2.75rem, 5vw, 5rem);
--font-size-display-sm: clamp(2.25rem, 4vw, 4rem);
```

## Headings

```css
--font-size-h1: clamp(2.5rem, 4vw, 4.5rem);
--font-size-h2: clamp(2rem, 3vw, 3.25rem);
--font-size-h3: clamp(1.5rem, 2vw, 2.25rem);
--font-size-h4: clamp(1.25rem, 1.5vw, 1.75rem);
--font-size-h5: 1.25rem;
--font-size-h6: 1.0625rem;
```

## Body

```css
--font-size-body-xl: 1.25rem;
--font-size-body-lg: 1.125rem;
--font-size-body-md: 1rem;
--font-size-body-sm: 0.9375rem;
--font-size-body-xs: 0.8125rem;
```

## Utility

```css
--font-size-label: 0.75rem;
--font-size-caption: 0.6875rem;
```

---

# 6. Font Weights

### Inter

```css
--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### Playfair Display

```css
--font-weight-display-regular: 400;
--font-weight-display-medium: 500;
--font-weight-display-semibold: 600;
```

Prefer regular/medium weights for editorial luxury. Avoid excessively heavy display typography.

---

# 7. Line Heights

```css
--line-height-display: 0.95;
--line-height-heading: 1.1;
--line-height-heading-relaxed: 1.2;

--line-height-body-tight: 1.4;
--line-height-body: 1.6;
--line-height-body-relaxed: 1.75;

--line-height-label: 1.2;
```

Large editorial headings should feel compact.

Body copy should remain comfortable and readable.

---

# 8. Letter Spacing

```css
--tracking-display: -0.035em;
--tracking-heading: -0.02em;
--tracking-body: 0;
--tracking-label: 0.08em;
--tracking-uppercase: 0.12em;
```

Uppercase eyebrow labels should use increased letter spacing.

---

# 9. Spacing System

Use an 8px base rhythm with flexible responsive spacing.

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
--space-20: 5rem;      /* 80px */
--space-24: 6rem;      /* 96px */
--space-32: 8rem;      /* 128px */
--space-40: 10rem;     /* 160px */
--space-48: 12rem;     /* 192px */
```

---

# 10. Section Spacing

## Desktop

```css
--section-space-sm: 5rem;
--section-space-md: 7rem;
--section-space-lg: 9rem;
--section-space-xl: 12rem;
```

## Tablet

```css
--section-space-sm: 4rem;
--section-space-md: 5rem;
--section-space-lg: 7rem;
```

## Mobile

```css
--section-space-sm: 3rem;
--section-space-md: 4rem;
--section-space-lg: 5rem;
```

Sections should feel spacious and editorial rather than densely packed.

---

# 11. Container System

```css
--container-xs: 640px;
--container-sm: 768px;
--container-md: 960px;
--container-lg: 1200px;
--container-xl: 1440px;
--container-2xl: 1600px;
```

Default premium content container:

```css
--container-main: 1440px;
```

Large immersive room/hero sections may extend beyond the standard content container.

---

# 12. Horizontal Page Padding

```css
--page-padding-desktop: clamp(2rem, 4vw, 5rem);
--page-padding-tablet: clamp(1.5rem, 4vw, 3rem);
--page-padding-mobile: 1.25rem;
```

Do not allow content to touch viewport edges except for intentional full-bleed imagery.

---

# 13. Grid Tokens

## Desktop Product Grid

```css
--grid-products-desktop: 4;
--grid-products-tablet: 3;
--grid-products-mobile: 2;
```

For editorial product presentations:

```css
--grid-gap-desktop: 1.5rem;
--grid-gap-tablet: 1.25rem;
--grid-gap-mobile: 0.75rem;
```

The grid should remain visually calm and avoid excessive card density.

---

# 14. Border Radius

Veloura uses restrained rounding.

```css
--radius-none: 0;
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-2xl: 24px;
--radius-pill: 999px;
```

### Usage

- Product cards: `radius-lg` or minimal radius depending on visual treatment
- Buttons: `radius-sm` to `radius-md`
- Pills: `radius-pill`
- Images: `radius-lg`
- Large editorial modules: `radius-xl` where appropriate

Avoid excessive rounded UI that makes the site feel like a SaaS product.

---

# 15. Borders

```css
--border-width-thin: 1px;
--border-width-medium: 2px;

--border-subtle: rgba(74, 44, 26, 0.12);
--border-default: rgba(74, 44, 26, 0.18);
--border-strong: rgba(74, 44, 26, 0.30);
```

Borders should be subtle.

Prefer spacing and contrast over heavy outlines.

---

# 16. Shadows

Shadows should communicate depth without looking like generic UI elevation.

```css
--shadow-sm: 0 2px 10px rgba(33, 30, 27, 0.06);
--shadow-md: 0 8px 24px rgba(33, 30, 27, 0.08);
--shadow-lg: 0 16px 48px rgba(33, 30, 27, 0.12);
--shadow-xl: 0 24px 72px rgba(33, 30, 27, 0.16);
```

Use shadows selectively.

Furniture imagery itself should provide most of the visual depth.

---

# 17. Image System

Images are a primary design element, not decoration.

## Image principles

Use:

- High-quality real interiors
- Warm natural lighting
- Editorial framing
- Realistic furniture
- Natural textures
- Room context
- Human-scale composition
- Consistent visual treatment

Avoid:

- Generic stock imagery
- Flat isolated product imagery everywhere
- Overprocessed renders
- Inconsistent lighting
- Random aspect ratios
- Low-resolution assets

---

# 18. Image Aspect Ratios

```css
--aspect-square: 1 / 1;
--aspect-product: 4 / 5;
--aspect-landscape: 4 / 3;
--aspect-wide: 16 / 9;
--aspect-editorial: 3 / 2;
--aspect-hero: 16 / 10;
```

Recommended usage:

- Product cards → `4:5`
- Category cards → `4:3`
- Hero → `16:10` or immersive full viewport
- Editorial → `3:2`
- Room experience → wide/immersive
- Mobile hero → responsive crop

---

# 19. Object Fit Rules

```css
object-fit: cover;
```

Default for room/editorial imagery.

For product imagery where the full furniture silhouette must remain visible:

```css
object-fit: contain;
```

Do not crop important furniture details.

---

# 20. Product Card Tokens

Product cards should include only information that helps discovery.

### Core content

- Product image
- Product name
- Rating
- Review count
- Price
- Sale price when applicable
- Wishlist
- Quick action where appropriate
- Availability
- Variant indication

### Card behavior

Default:

- Calm
- Minimal
- Image-forward
- Clear typography

Hover:

- Subtle image transition
- Wishlist visibility
- Quick action reveal
- Slight visual lift only if appropriate

Avoid:

- Large UI overlays
- Excessive badges
- Too many controls
- Heavy shadows

---

# 21. Button Tokens

## Primary Button

```css
--button-primary-bg: var(--color-deep-brown);
--button-primary-text: #FFFFFF;
```

Purpose:

- Main CTA
- Add to Cart
- Checkout
- Explore Collections

## Secondary Button

```css
--button-secondary-bg: transparent;
--button-secondary-text: var(--color-deep-brown);
--button-secondary-border: var(--border-default);
```

## Accent Button

```css
--button-accent-bg: var(--color-primary-brown);
--button-accent-text: #FFFFFF;
```

---

# 22. Button Dimensions

```css
--button-height-sm: 36px;
--button-height-md: 44px;
--button-height-lg: 52px;
--button-height-xl: 60px;
```

Horizontal padding:

```css
--button-padding-x-sm: 16px;
--button-padding-x-md: 20px;
--button-padding-x-lg: 28px;
--button-padding-x-xl: 36px;
```

Buttons should feel refined, not oversized unless used as a hero CTA.

---

# 23. Navigation Tokens

Desktop navigation should be:

- Minimal
- Spacious
- Editorial
- Easy to scan

Primary navigation can include:

- Home
- Shop
- Collections
- Rooms
- About
- Journal
- Contact

Utilities:

- Search
- Wishlist
- Account
- Cart

### Navigation typography

```css
--nav-font-size: 0.875rem;
--nav-font-weight: 500;
--nav-letter-spacing: 0.01em;
```

---

# 24. Mobile Navigation

Mobile header should include:

- Veloura logo
- Search
- Wishlist
- Cart
- Menu

Optional bottom navigation:

- Home
- Shop
- Wishlist
- Cart
- Account

Mobile navigation must prioritize thumb reach and fast access to commerce actions.

---

# 25. Hero Tokens

Hero sections should feel cinematic and editorial.

```css
--hero-min-height-desktop: 720px;
--hero-min-height-mobile: 620px;
```

Hero content should have:

- Eyebrow
- Large Playfair Display headline
- Supporting copy
- Primary CTA
- Optional secondary CTA
- Premium room imagery

Example content direction:

**Eyebrow:**  
FURNITURE INTELLIGENCE

**Headline:**  
Timeless Furniture for Living

**Supporting:**  
Thoughtfully designed furniture for modern homes. Explore, experience and bring your ideal space to life — with the power of AI.

---

# 26. Room Category Tokens

Core rooms:

1. Living Room
2. Bedroom
3. Dining
4. Office

Room cards should prioritize:

- Large room photography
- Room name
- Short supporting descriptor where useful
- Subtle hover interaction
- Clear route to room catalog

Room category images are discovery assets.

### Critical rule

> **A room collage is NOT a product.**

A collage is:

- Inspiration
- Editorial imagery
- Category representation
- Discovery entry point

It must never be stored or treated as one sellable catalog product.

---

# 27. Room Experience Tokens

The room experience connects:

**Room → Furniture → Product → Purchase**

Interactive room scenes may include clickable furniture such as:

- Sofa
- Bed
- Dining table
- Office chair
- Lamp
- Sideboard
- Coffee table
- Wardrobe
- Mirror
- Rug

Interaction states should be subtle and premium.

Possible visual treatment:

- Small hotspot
- Hover highlight
- Product label
- Floating product information
- Click → product detail

Avoid game-like markers.

---

# 28. AI UI Tokens

AI should visually belong to Veloura.

It must not look like a separate chatbot product.

Use:

- Warm surfaces
- Editorial typography where appropriate
- Inter for functional text
- Soft borders
- Calm motion
- Furniture imagery/context
- Clear conversational hierarchy

AI surfaces may support:

- AI Search
- AI Shopping Assistant
- Recommendations
- Room suggestions
- Complete the Room
- Product comparisons
- Space-aware discovery

---

# 29. Search Tokens

Natural-language search should be supported.

Examples:

- “Warm beige sofa for a small living room”
- “Wooden dining table for 6 people”
- “Minimal bedroom furniture under ₹1 lakh”
- “Comfortable office chair for long working hours”

Search UI should support:

- Search input
- Suggestions
- Intent interpretation
- Filters
- Recent searches
- Product results
- AI-assisted discovery

---

# 30. Filter Tokens

Core filters:

- Room
- Category
- Furniture Type
- Price
- Material
- Color
- Size
- Style
- Availability
- Rating

Filters should remain clean and discoverable.

Desktop may use a persistent/filter sidebar or refined toolbar.

Mobile should use:

- Filter button
- Sort button
- Bottom sheet/drawer
- Clear applied-filter state

---

# 31. Product Detail Tokens

Product detail should feel editorial and premium.

Core sections:

1. Product Hero
2. Gallery
3. Product Information
4. Variant Selection
5. Price
6. Rating
7. Availability
8. Delivery Estimate
9. Add to Cart
10. Buy Now
11. Wishlist
12. Product Story
13. Materials
14. Dimensions
15. Specifications
16. Care
17. Shipping
18. Returns
19. Reviews
20. Complete the Room
21. Related Products
22. Room Context
23. AI Assistance

Product page hierarchy:

**Image → Product identity → Price → Purchase action → Story → Specifications → Social proof → Discovery**

---

# 32. Commerce UI Tokens

Commerce surfaces must remain consistent with the brand.

Required states:

- Default
- Hover
- Focus
- Active
- Disabled
- Loading
- Success
- Error
- Empty
- Out of stock

Commerce components include:

- Cart drawer/page
- Quantity selector
- Variant selector
- Coupon input
- Address forms
- Payment UI
- Order summary
- Order tracking
- Returns/refunds
- Account pages

---

# 33. Form Tokens

Inputs should be:

- Clear
- Minimal
- Accessible
- Warm-neutral
- Easy to scan

```css
--input-height: 48px;
--input-height-lg: 56px;
--input-padding-x: 16px;
--input-border: var(--border-default);
--input-focus-border: var(--color-primary-brown);
```

Focus states must always remain visible.

---

# 34. Badge Tokens

Use badges sparingly.

Potential types:

- New
- Sale
- Bestseller
- Limited
- Low Stock
- Out of Stock

Badges should never overpower product imagery.

---

# 35. Motion System

## Motion philosophy

Motion should support:

- Spatial understanding
- Product discovery
- Storytelling
- Hierarchy
- Feedback

Motion must never become the primary attraction.

Avoid:

- Bounce
- Jerky movement
- Excessive parallax
- Long blocking animations
- Gimmicky transitions

---

# 36. GSAP — Primary Animation Engine

**GSAP is the primary animation engine for Veloura Living.**

Use GSAP for:

- Hero entrance animations
- Section reveals
- Product-card interactions
- Page transitions
- Image transitions
- Scroll-triggered storytelling
- Subtle parallax
- Room interaction
- Product hotspots
- Editorial sequences
- Micro-interactions
- 3D object animation

GSAP should be structured into reusable animation utilities rather than scattered imperative code.

Recommended conceptual structure:

```text
src/
  lib/
    animation/
      gsap.ts
      presets.ts
      transitions.ts
      scroll.ts
      interactions.ts
```

---

# 37. GSAP Timing Tokens

```css
--duration-instant: 120ms;
--duration-fast: 220ms;
--duration-normal: 400ms;
--duration-medium: 650ms;
--duration-slow: 900ms;
--duration-editorial: 1200ms;
```

Use longer durations for large editorial transitions and shorter durations for UI feedback.

---

# 38. Easing Tokens

Preferred easing:

```text
power2.out
power3.out
power4.out
expo.out
circ.out
```

For premium transitions, prefer smooth deceleration.

Avoid elastic/bounce easings for primary interactions.

---

# 39. Motion Presets

## Fade Up

```text
opacity: 0 → 1
y: 24px → 0
duration: 0.6–0.9s
```

## Image Reveal

```text
clip-path / scale / opacity
duration: 0.8–1.2s
```

## Product Hover

```text
scale: 1 → 1.02
duration: 0.35–0.5s
```

Keep hover transformations subtle.

## Room Hotspot

```text
scale: 0.9 → 1
opacity: 0 → 1
```

Avoid pulsing continuously unless there is a clear discoverability reason.

---

# 40. Lenis — Smooth Scrolling

**Lenis is the required smooth scrolling layer.**

Lenis should provide:

- Fluid scrolling
- Consistent scroll feel
- Premium editorial movement
- Natural integration with GSAP ScrollTrigger

Conceptual architecture:

```text
Lenis
  ↓
Scroll State
  ↓
GSAP ScrollTrigger
  ↓
Scroll-driven animations
```

Do not create competing custom smooth-scroll systems.

---

# 41. Scroll Behavior

Scrolling should feel:

- Smooth
- Controlled
- Natural
- Responsive

Avoid:

- Excessive inertia
- Delayed interactions
- Scroll hijacking
- Scroll-jacking essential navigation
- Motion that interferes with accessibility

User input should always feel respected.

---

# 42. 3D Floating Objects

3D is an immersive enhancement layer.

Potential use cases:

- Hero
- Furniture storytelling
- Editorial sections
- Collection transitions
- AI/intelligence visualization
- Product/material storytelling

Examples:

- Floating furniture silhouettes
- Material samples
- Decorative furniture components
- Abstract spatial forms
- Subtle product fragments

### 3D principles

3D must be:

- Minimal
- Elegant
- Slow
- Spatial
- Contextual
- Performance-conscious

3D must NOT make Veloura look like:

- A gaming website
- A futuristic SaaS product
- A technical 3D demo

---

# 43. 3D Motion Tokens

```css
--3d-float-duration: 6s;
--3d-float-distance: 12px;
--3d-rotation-range: 3deg;
```

Floating movement should be subtle.

Example behavior:

```text
Y movement: ±8–12px
Rotation: ±2–3deg
Long duration
Ease: smooth
```

3D objects should not constantly rotate aggressively.

---

# 44. 3D Performance Rules

Desktop:

- Full-quality 3D where appropriate

Tablet:

- Reduced complexity

Mobile:

- Simplified 3D
- Static fallback
- Reduced object count
- Reduced animation
- Or remove 3D where performance requires

Never allow 3D to block:

- Page rendering
- Product discovery
- Search
- Checkout
- Core navigation

---

# 45. Page Transition System

Transitions should be:

- Short
- Smooth
- Consistent
- Non-blocking

Suggested sequence:

```text
Current page
↓
Subtle exit
↓
Route change
↓
New page reveal
```

Do not create long cinematic transitions between ordinary commerce routes.

---

# 46. Hover System

Hover should provide useful feedback.

Possible behaviors:

- Image scale 1.01–1.03
- Secondary image reveal
- CTA visibility
- Underline movement
- Subtle shadow
- Image position shift

Avoid exaggerated movement.

Mobile must not depend on hover.

---

# 47. Interaction States

Every interactive component should define:

```text
Default
Hover
Focus
Active
Pressed
Disabled
Loading
Success
Error
```

Focus must be visible for keyboard users.

---

# 48. Accessibility Tokens

Accessibility is part of the design system.

Requirements:

- Semantic HTML
- Keyboard navigation
- Visible focus states
- Accessible labels
- Sufficient color contrast
- Alt text
- Accessible forms
- Accessible dialogs/modals
- Screen-reader-friendly navigation
- Reduced-motion support

---

# 49. Reduced Motion

When the user prefers reduced motion:

```text
Disable/reduce:
- Large parallax
- 3D floating movement
- Complex page transitions
- Continuous decorative animation
- Excessive scroll-linked animation
```

Keep essential interaction feedback.

---

# 50. Responsive Breakpoints

Use implementation-driven responsive behavior.

Suggested baseline:

```css
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

Do not design only for fixed device widths.

Design for fluid adaptation across:

- Mobile
- Tablet
- Laptop
- Desktop
- Large desktop

---

# 51. Mobile Design Rules

Mobile is not a shrunken desktop.

Mobile must have:

- Compact header
- Search access
- Wishlist
- Cart
- Menu
- Editorial hero
- Touch-friendly product cards
- Mobile filter drawer
- Mobile product gallery
- Accessible purchase actions
- Optional bottom navigation

Typography and spacing should scale fluidly.

---

# 52. Desktop Design Rules

Desktop should emphasize:

- Spacious editorial layouts
- Large room photography
- Strong typography
- Multi-column product grids
- Premium navigation
- Clear filtering
- Hover interactions
- Immersive room experiences
- Product storytelling
- Restrained animation

---

# 53. Component Density

Veloura should feel spacious.

Prefer:

```text
More whitespace
+
Fewer stronger elements
+
Large imagery
+
Clear hierarchy
```

Avoid:

```text
Too many cards
+
Too many badges
+
Too many buttons
+
Dense information
```

---

# 54. Z-Index System

Use a controlled stacking system.

```css
--z-base: 0;
--z-content: 10;
--z-header: 100;
--z-dropdown: 200;
--z-sticky: 300;
--z-drawer: 400;
--z-modal: 500;
--z-toast: 600;
--z-tooltip: 700;
```

Avoid arbitrary z-index values throughout components.

---

# 55. Iconography

Icons should be:

- Minimal
- Refined
- Consistent
- Thin/medium stroke
- Easy to recognize

Use icons for:

- Search
- Wishlist
- Account
- Cart
- Menu
- Filter
- Sort
- Arrow
- Close
- Share
- Location
- Delivery
- Returns

Avoid decorative icon overload.

---

# 56. Icon Sizing

```css
--icon-xs: 12px;
--icon-sm: 16px;
--icon-md: 20px;
--icon-lg: 24px;
--icon-xl: 32px;
```

---

# 57. Loading States

Loading should feel premium but remain functional.

Use:

- Soft skeletons
- Image placeholders
- Subtle opacity transitions
- Minimal spinners where required

Avoid aggressive animated loaders.

---

# 58. Empty States

Empty states should remain calm and helpful.

Examples:

- Empty cart
- Empty wishlist
- No search results
- No orders
- No recommendations

Use editorial copy and relevant discovery actions.

---

# 59. Error States

Error messaging should be:

- Clear
- Human
- Actionable
- Non-technical

Avoid exposing raw backend/API errors to customers.

---

# 60. Commerce Status Tokens

```css
--status-in-stock: #557A5A;
--status-low-stock: #A47A45;
--status-out-of-stock: #A6544D;
```

Use alongside text, not color alone.

---

# 61. Editorial Tokens

Editorial sections should have:

- Large headings
- Generous whitespace
- Strong photography
- Short, thoughtful copy
- Asymmetric layouts where useful
- Controlled motion

Editorial sections can interrupt traditional ecommerce grids to reinforce Veloura's identity.

---

# 62. Furniture Intelligence Visual Language

Furniture Intelligence should be visible through interaction rather than technical UI.

Examples:

### Room intelligence

Room → discover furniture → product

### AI search

Intent → interpreted furniture → products

### Recommendations

Product → complementary furniture → complete room

### AI assistant

Question → design-aware guidance → product discovery

The visual system should make these relationships feel natural.

---

# 63. Room-to-Product Visual Rules

Room scenes are discovery surfaces.

Example:

```text
Bedroom
  ↓
King Bed
  ↓
Product Detail
  ↓
Variant
  ↓
Add to Cart
```

The visual transition should preserve context.

When a user discovers a product from a room, the UI should communicate that relationship.

---

# 64. Asset Rules

Gemini-generated images are stored separately from the main repository before integration.

Once selected for production, assets should be copied/mapped into the main project structure.

Recommended:

```text
assets/
  images/
    rooms/
      living-room/
      bedroom/
      dining/
      office/

    products/
      living-room/
      bedroom/
      dining/
      office/

    collections/
    editorial/
```

---

# 65. Asset Naming Convention

Use predictable names.

Examples:

```text
living-room-hero.webp
living-room-category.webp

bedroom-hero.webp
bedroom-category.webp

bedroom-king-bed-01.webp
bedroom-bedside-table-01.webp

dining-hero.webp
dining-category.webp

office-hero.webp
office-category.webp
office-executive-desk-01.webp
```

Do not use:

```text
IMG_9384.png
gemini-final-final-2.png
newimage3.png
```

---

# 66. Critical Asset/Product Rule

### Collage ≠ Product

A generated collage containing multiple furniture pieces must never be represented as one product.

Correct:

```text
Bedroom Collage
   ↓
Bedroom Category
   ↓
Individual Products
   ├── King Bed
   ├── Bedside Table
   ├── Wardrobe
   ├── Dresser
   ├── Bench
   ├── Lounge Chair
   ├── Floor Lamp
   ├── Mirror
   └── Rug
```

Incorrect:

```text
Bedroom Collage
   ↓
"Bedroom Furniture Set" product
```

Unless an actual sellable furniture set exists as a separate catalog product.

---

# 67. Performance Tokens

Image-heavy pages must use:

- Responsive images
- Modern formats
- Lazy loading
- Optimized dimensions
- Proper `sizes`
- Critical image preload only
- Route-level loading
- Code splitting
- Font optimization
- Caching
- Layout-shift prevention

3D assets must also be optimized.

---

# 68. Animation Performance

GSAP animations should prioritize transform and opacity.

Prefer:

```text
transform
opacity
```

Avoid animating expensive layout properties unnecessarily:

```text
width
height
top
left
margin
```

Use GPU-friendly transforms where appropriate.

---

# 69. Design Token Naming Convention

Use semantic naming rather than visual-only naming.

Preferred:

```text
--surface-primary
--text-primary
--button-primary-bg
--border-subtle
--space-8
```

Avoid:

```text
--brown1
--cream2
--big-gap
--dark-text-new
```

Tokens must be reusable across the application.

---

# 70. Token Architecture

Recommended implementation:

```text
src/
  styles/
    tokens/
      colors.css
      typography.css
      spacing.css
      layout.css
      motion.css
      components.css
      responsive.css
      index.css
```

Or equivalent token architecture if the chosen framework uses TypeScript/JSON/design-token files.

There must be one source of truth.

---

# 71. Design System Layering

Use the following hierarchy:

```text
Foundation
  ↓
Design Tokens
  ↓
Primitive UI
  ↓
Shared Components
  ↓
Feature Components
  ↓
Pages
  ↓
Experiences
```

Example:

```text
Color Token
  ↓
Button Primitive
  ↓
Product CTA
  ↓
Product Detail
  ↓
Commerce Journey
```

---

# 72. Component Principles

Components must be:

- Reusable
- Accessible
- Responsive
- Composable
- Token-driven
- Animation-aware
- Independent from page-specific hacks

Avoid giant components.

---

# 73. Motion + Component Architecture

Animation logic should not be duplicated across pages.

Preferred:

```text
Animation Presets
    ↓
Shared Components
    ↓
Page-specific composition
```

Examples:

```text
fadeUp()
imageReveal()
staggerReveal()
parallax()
hoverLift()
roomHotspotReveal()
pageEnter()
pageExit()
```

---

# 74. Premium Experience Rules

Every page should answer:

> Why does this feel like Veloura Living rather than another furniture store?

The answer should come from:

- Imagery
- Typography
- Room context
- Product storytelling
- AI intelligence
- Interaction quality
- Spacing
- Motion
- Personalization

Not from decorative UI alone.

---

# 75. Non-Negotiable Design Rules

1. Veloura must not become a generic furniture ecommerce site.
2. Furniture Intelligence remains central.
3. Warm premium furniture aesthetic remains central.
4. Modern furniture website reference remains the current design direction.
5. Playfair Display is the editorial/display typeface.
6. Inter is the functional/UI typeface.
7. GSAP is the primary animation engine.
8. Lenis is the smooth scrolling layer.
9. 3D floating objects are selective immersive enhancements.
10. Motion must remain restrained and premium.
11. Mobile must be intentionally designed.
12. Accessibility cannot be sacrificed for visual effects.
13. Performance must be protected.
14. Room experiences connect inspiration to real products.
15. Room collages are not products.
16. Category clicks must reveal individual catalog products.
17. AI must feel like furniture/design intelligence.
18. Visual design must prioritize real-home context.
19. Design tokens must remain the source of truth.
20. No arbitrary one-off styling should override the design system without a clear reason.

---

# 76. Master Design System Definition

Veloura Living's design system is:

> **A warm, modern, editorial visual system that combines premium furniture aesthetics, room-based discovery, intelligent commerce, restrained GSAP motion, Lenis-powered smooth scrolling, and selective 3D spatial experiences.**

The interface should always feel:

**Premium → Warm → Calm → Editorial → Intelligent → Spatial → Human**

and never:

**Technical → Neon → Corporate → Generic → Game-like → Over-animated**

---

# 77. Implementation Priority

When visual decisions conflict, use this priority:

```text
1. Accessibility
2. Usability
3. Performance
4. Brand identity
5. Content hierarchy
6. Furniture discovery
7. Immersive interaction
8. Decorative effects
```

A beautiful effect must never compromise the core furniture journey.

---

# 78. Final Token Checklist

Before implementation, verify:

- [ ] Colors defined
- [ ] Typography defined
- [ ] Font weights defined
- [ ] Line heights defined
- [ ] Letter spacing defined
- [ ] Spacing scale defined
- [ ] Container system defined
- [ ] Grid system defined
- [ ] Radius defined
- [ ] Borders defined
- [ ] Shadows defined
- [ ] Image ratios defined
- [ ] Button tokens defined
- [ ] Form tokens defined
- [ ] Navigation tokens defined
- [ ] Product card rules defined
- [ ] Room experience rules defined
- [ ] AI visual rules defined
- [ ] GSAP defined
- [ ] Lenis defined
- [ ] 3D rules defined
- [ ] Motion durations defined
- [ ] Reduced-motion behavior defined
- [ ] Responsive rules defined
- [ ] Accessibility rules defined
- [ ] Performance rules defined
- [ ] Asset rules defined
- [ ] Collage/product distinction defined
- [ ] Component architecture defined
- [ ] Token naming convention defined

---

## End of Veloura Living Design Tokens
