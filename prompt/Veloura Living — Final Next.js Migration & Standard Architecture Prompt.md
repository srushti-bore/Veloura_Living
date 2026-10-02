# Veloura Living — Final Next.js Migration & Standard Architecture Prompt

## ROLE

You are working on the existing **Veloura Living** frontend project.

The current project is already implemented in React/Vite and contains an established:

- UI/UX system
- Visual design system
- Components
- Interactions
- Animations
- GSAP behavior
- Lenis smooth scrolling
- Three.js / 3D elements
- Room experiences
- Product experiences
- Ecommerce flows
- AI assistant experience
- Studio experience
- Admin experience
- Assets
- Design tokens
- Typography system

Your task is to **migrate the existing project to Next.js using the App Router inside the SAME project folder**.

---

# 1. PRIMARY OBJECTIVE

Convert the existing React/Vite frontend into a clean, production-ready **Next.js App Router architecture** while preserving the existing Veloura experience.

The following are the source of truth:

- Existing UI
- Existing UX
- Existing visual design
- Existing layouts
- Existing responsive behavior
- Existing animations
- Existing micro-interactions
- Existing GSAP behavior
- Existing Lenis smooth scrolling
- Existing Three.js / 3D behavior
- Existing room experience
- Existing product experience
- Existing ecommerce features
- Existing AI assistant
- Existing Studio experience
- Existing navigation
- Existing design tokens
- Existing typography appearance
- Existing imagery
- Existing visual composition

This is primarily an **architectural/technical migration**, not a redesign.

---

# 2. SAME PROJECT — NO NEW PROJECT

Work directly inside the existing Veloura project.

DO NOT create:

- `veloura-next/`
- `veloura-frontend/`
- another Next.js project
- another repository
- another root folder

The existing project directory must remain the application root.

Required transformation:

```text
Existing Veloura React/Vite Project
                ↓
Same Veloura Project
                ↓
Next.js App Router
```

Do not rebuild the application from scratch.

---

# 3. CRITICAL DESIGN PRESERVATION RULE

## DO NOT REDESIGN THE PROJECT

The existing Veloura UI/UX is the primary source of truth.

Do NOT change the design simply because:

- Next.js uses a different architecture
- Next.js recommends another implementation pattern
- you prefer another component structure
- you think another layout is cleaner
- you want a more modern design
- you want a more minimal design
- you want a more premium design
- you want to simplify components
- you want to introduce another design system
- you want to replace existing interactions
- you want to use a different component library

### Design changes are allowed ONLY when technically required.

A design/UI change is acceptable only when it is genuinely required because of:

- Next.js architecture
- Server/Client rendering requirements
- browser/server compatibility
- hydration issues
- accessibility requirements
- performance requirements
- technical incompatibility
- responsive rendering issues

Before changing any existing UI, determine whether the change is actually technically necessary.

### If NOT technically necessary:

PRESERVE the existing:

- layout
- spacing
- typography
- colors
- cards
- buttons
- navigation
- hero
- imagery
- visual hierarchy
- glass treatment
- interactions
- animations
- micro-interactions
- responsive behavior
- room interactions
- product interactions
- ecommerce flows

### If technically necessary:

Make the **smallest possible change**.

Preserve:

- visual language
- hierarchy
- interaction intent
- spacing
- proportions
- responsiveness
- animation behavior

Priority order:

```text
Existing UI/UX
      ↓
Existing functionality
      ↓
Existing visual identity
      ↓
Existing animations/interactions
      ↓
Existing responsive behavior
      ↓
Next.js technical requirements
      ↓
Minimal necessary changes
```

Never use the migration as an excuse to redesign Veloura.

---

# 4. TARGET STANDARD PROJECT STRUCTURE

Use the following as the target architecture.

```text
veloura/
│
├── .git/
│
├── .github/
│   └── workflows/
│       └── ...
│
├── .gitignore
├── .env.local
├── .env.example
│
├── README.md
├── package.json
├── package-lock.json
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── eslint.config.mjs
│
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   │
│   ├── shop/
│   │   └── page.tsx
│   │
│   ├── rooms/
│   │   ├── page.tsx
│   │   └── [slug]/
│   │       └── page.tsx
│   │
│   ├── products/
│   │   └── [slug]/
│   │       └── page.tsx
│   │
│   ├── collections/
│   │   └── page.tsx
│   │
│   ├── journal/
│   │   └── page.tsx
│   │
│   ├── checkout/
│   │   └── page.tsx
│   │
│   ├── account/
│   │   └── page.tsx
│   │
│   ├── studio/
│   │   └── page.tsx
│   │
│   └── admin/
│       └── page.tsx
│
├── components/
│   │
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── ...
│   │
│   ├── hero/
│   │   ├── HeroComparisonSlider.tsx
│   │   └── ...
│   │
│   ├── products/
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── ProductDetails.tsx
│   │   └── ...
│   │
│   ├── rooms/
│   │   ├── RoomScene.tsx
│   │   ├── RoomHotspot.tsx
│   │   └── ...
│   │
│   ├── collections/
│   │   └── ...
│   │
│   ├── journal/
│   │   └── ...
│   │
│   ├── commerce/
│   │   ├── CartDrawer.tsx
│   │   ├── Wishlist.tsx
│   │   ├── Checkout.tsx
│   │   ├── OrderSummary.tsx
│   │   └── ...
│   │
│   ├── ai/
│   │   ├── AIAssistant.tsx
│   │   └── ...
│   │
│   ├── studio/
│   │   └── ...
│   │
│   ├── admin/
│   │   └── ...
│   │
│   ├── three/
│   │   ├── FloatingFurnitureCanvas.tsx
│   │   └── ...
│   │
│   ├── animation/
│   │   ├── SmoothScroll.tsx
│   │   └── ...
│   │
│   └── ui/
│       ├── Button.tsx
│       ├── Modal.tsx
│       ├── Toast.tsx
│       ├── Input.tsx
│       └── ...
│
├── lib/
│   │
│   ├── animations/
│   │   ├── gsap.ts
│   │   └── ...
│   │
│   ├── data/
│   │   ├── products.ts
│   │   ├── rooms.ts
│   │   ├── collections.ts
│   │   ├── journal.ts
│   │   └── ...
│   │
│   ├── cart/
│   │   └── ...
│   │
│   ├── wishlist/
│   │   └── ...
│   │
│   ├── orders/
│   │   └── ...
│   │
│   ├── ai/
│   │   └── ...
│   │
│   ├── utils/
│   │   └── ...
│   │
│   └── constants/
│       └── ...
│
├── hooks/
│   ├── useCart.ts
│   ├── useWishlist.ts
│   ├── useMediaQuery.ts
│   ├── useLenis.ts
│   └── ...
│
├── providers/
│   ├── AppProvider.tsx
│   ├── SmoothScrollProvider.tsx
│   └── ...
│
├── styles/
│   ├── tokens.css
│   └── ...
│
├── public/
│   ├── images/
│   │   ├── hero/
│   │   ├── rooms/
│   │   ├── products/
│   │   ├── collections/
│   │   ├── journal/
│   │   └── video/
│   │
│   ├── textures/
│   ├── icons/
│   └── fonts/
│
├── types/
│   ├── product.ts
│   ├── room.ts
│   ├── cart.ts
│   ├── order.ts
│   └── ...
│
└── tests/
    ├── components/
    ├── pages/
    └── ...
```

This is the target architecture.

Do not blindly move every file.

First understand the responsibility of each existing file and then place it appropriately.

---

# 5. GIT / GITIGNORE

The project must contain a proper root-level:

```text
.gitignore
```

Use:

```gitignore
# Dependencies
node_modules/

# Next.js
.next/
out/

# Production
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
*.log
npm-debug.log*
yarn-debug.log*
pnpm-debug.log*

# OS
.DS_Store
Thumbs.db

# IDE / Editors
.vscode/
.idea/

# TypeScript
*.tsbuildinfo

# Vercel
.vercel/

# Testing / Coverage
coverage/
.nyc_output/

# Temporary files
*.tmp
*.temp

# Cache
.cache/
.parcel-cache/
.turbo/

# Generated files
*.generated.*

# Misc
.DS_Store
```

### Environment file rules

`.env.example` may be committed.

`.env.local` must NOT be committed.

Never expose real secrets or API keys.

`.env.example` should contain only variable names/placeholders.

---

# 6. NEXT.JS APP ROUTER

Use the Next.js App Router.

Do NOT recreate the old Vite routing system.

Routes must map to:

```text
/
 /shop
 /rooms
 /rooms/[slug]
 /products/[slug]
 /collections
 /journal
 /checkout
 /account
 /studio
 /admin
```

Preserve existing URL behavior wherever reasonably possible.

---

# 7. SERVER VS CLIENT COMPONENTS

Use Server Components by default.

Only use Client Components when browser-side functionality is genuinely required.

Use:

```tsx
"use client";
```

only where needed.

Client Components are appropriate for:

- GSAP
- Lenis
- Three.js
- Canvas
- Hero interaction
- Room hotspots
- Cart interactions
- Wishlist interactions
- Filters
- Modals
- AI chat interaction
- localStorage
- browser APIs
- interactive product controls
- mouse/pointer interactions
- micro-interactions

Do NOT make the entire application a Client Component.

Do NOT add `"use client"` everywhere unnecessarily.

Maintain clean Server/Client boundaries.

---

# 8. GSAP

GSAP is an important part of the existing Veloura experience.

Preserve:

- animation timing
- easing
- ScrollTrigger
- reveal animations
- stagger animations
- hover animations
- image reveals
- transitions
- micro-interactions

Do not redesign animation behavior.

Browser-dependent GSAP code must run only on the client.

Use proper cleanup:

- GSAP context cleanup
- ScrollTrigger cleanup
- event listener cleanup

Do not duplicate animation engines.

Keep the existing GSAP architecture where practical.

---

# 9. LENIS

Preserve the existing Lenis smooth-scroll experience.

Create/use:

```text
providers/SmoothScrollProvider.tsx
```

Maintain the existing relationship:

```text
Lenis
   +
GSAP
   +
ScrollTrigger
```

Do not introduce another smooth-scroll library.

Do not replace Lenis.

Do not change the scrolling feel unless technically necessary.

---

# 10. THREE.JS / 3D

Preserve existing Three.js functionality.

Keep 3D functionality isolated under:

```text
components/three/
```

Three.js components must be client-side.

Do not remove 3D functionality because Next.js uses Server Components.

Use dynamic loading/client-only strategies where technically appropriate.

Do not alter the visual behavior unnecessarily.

---

# 11. HERO

The Veloura Hero is a critical experience.

Do NOT redesign it.

Preserve:

- composition
- dimensions
- typography
- overlay
- interaction
- frame behavior
- transitions
- responsive behavior
- controls
- animation timing

The current Hero implementation and intended behavior are the source of truth.

### Missing asset rule

If an expected Hero asset/path is missing:

DO NOT invent a replacement.

DO NOT silently substitute another image.

Report the missing dependency and preserve the existing implementation as much as technically possible.

---

# 12. ASSETS

Move required production assets into:

```text
public/images/
```

Organize logically:

```text
public/
└── images/
    ├── hero/
    ├── rooms/
    ├── products/
    ├── collections/
    ├── journal/
    └── video/
```

Also preserve:

```text
public/
├── textures/
├── icons/
└── fonts/
```

Do NOT delete assets before confirming that they are no longer referenced.

Do NOT rename assets unnecessarily.

Update asset paths systematically.

### Important

Do NOT assume `dist/` is the source of truth.

Identify the actual source assets.

Only migrate verified production assets into `public/`.

---

# 13. IMAGE HANDLING

Use Next.js image optimization where appropriate.

However, do NOT blindly replace every `<img>` with `next/image`.

Special cases include:

- canvas animations
- frame sequences
- dynamically positioned room images
- 3D textures
- background images
- animation frames
- special interactive imagery

These should use technically appropriate rendering methods.

The visual output must remain unchanged.

---

# 14. DESIGN TOKENS

Preserve the existing Veloura design system.

Do not redesign:

- colors
- typography
- spacing
- radii
- shadows
- glass treatment
- layout proportions

Keep the token system under:

```text
styles/tokens.css
```

Do not introduce random new colors.

Do not replace existing tokens with generic Tailwind colors.

If existing components contain hardcoded values, do NOT perform a massive design-token refactor during the migration.

First achieve visual parity.

---

# 15. TYPOGRAPHY

Preserve the current typography appearance.

Do not randomly change fonts.

Migrate font configuration to the appropriate Next.js implementation only after confirming visual parity.

Typography migration must not change:

- font appearance
- weight
- tracking
- line height
- hierarchy
- responsive sizing

---

# 16. STATE & BUSINESS LOGIC

Preserve all existing frontend functionality:

- product catalog
- product variants
- search
- filters
- cart
- wishlist
- coupons
- orders
- checkout
- shipping logic
- account interactions
- AI assistant
- room/product relationships
- Studio
- Admin functionality

Move reusable business logic appropriately into:

```text
lib/
hooks/
providers/
```

Do not unnecessarily mix business logic into page components.

Do not introduce a new state-management library unless genuinely required.

---

# 17. LOCAL STORAGE / BROWSER APIs

The current application may use:

- localStorage
- window
- document
- requestAnimationFrame
- canvas

These must NOT execute during server rendering.

Handle them through:

- Client Components
- effects
- client-only utilities
- appropriate lifecycle handling

Avoid hydration mismatches.

---

# 18. TYPESCRIPT

Use TypeScript consistently.

Create shared types under:

```text
types/
```

Examples:

```text
types/product.ts
types/room.ts
types/cart.ts
types/order.ts
```

Do not duplicate large interfaces across components.

Do not use `any` as a shortcut for migration problems.

---

# 19. CONFIGURATION

Replace Vite-specific configuration with the appropriate Next.js configuration.

Migration should eventually remove/replace:

```text
vite.config.ts
Vite entry points
Vite routing
Vite-specific environment assumptions
```

Introduce:

```text
next.config.ts
Next.js scripts
Next.js App Router
```

Do not delete a configuration file until all of its dependencies have been migrated.

---

# 20. PACKAGE MANAGEMENT

Keep existing useful dependencies.

Do NOT unnecessarily replace:

- GSAP
- Lenis
- Three.js
- Lucide
- Tailwind
- existing utility libraries

Remove only dependencies that are genuinely Vite-specific or no longer used after migration.

Do not add large libraries just to solve small migration problems.

---

# 21. RESPONSIVE BEHAVIOR

Existing responsive behavior is part of the product.

Preserve:

- desktop
- tablet
- mobile
- navigation
- cards
- grids
- typography
- room layouts
- Hero behavior
- checkout layout
- product layouts

Do not use migration as an excuse to redesign mobile.

---

# 22. PERFORMANCE

Only optimize carefully after functional and visual parity is achieved.

Potential optimization areas:

- Server Components
- dynamic imports
- client-only loading
- image optimization
- code splitting
- lazy loading
- Three.js loading
- animation lifecycle
- unnecessary Client Components

Do NOT optimize by removing visual features.

Do NOT reduce animation quality just to simplify implementation.

---

# 23. MIGRATION PROCESS

Follow this sequence:

```text
1. Inspect existing project
        ↓
2. Create migration map
        ↓
3. Inspect dependencies and assets
        ↓
4. Create/prepare Git branch or backup
        ↓
5. Install/configure Next.js
        ↓
6. Create app/ structure
        ↓
7. Add/update .gitignore
        ↓
8. Add .env.example safely
        ↓
9. Preserve Tailwind + design tokens
        ↓
10. Migrate verified assets
        ↓
11. Migrate root layout
        ↓
12. Migrate Header + Footer
        ↓
13. Migrate Home
        ↓
14. Migrate Shop
        ↓
15. Migrate Product routes
        ↓
16. Migrate Rooms
        ↓
17. Migrate Collections
        ↓
18. Migrate Journal
        ↓
19. Migrate Commerce
        ↓
20. Migrate Account
        ↓
21. Migrate Studio
        ↓
22. Migrate Admin
        ↓
23. Preserve/integrate GSAP
        ↓
24. Preserve/integrate Lenis
        ↓
25. Preserve/integrate Three.js
        ↓
26. Preserve/integrate AI interactions
        ↓
27. Responsive verification
        ↓
28. Visual parity verification
        ↓
29. Remove obsolete Vite code
        ↓
30. Production cleanup
```

GSAP, Lenis and Three.js architecture must be considered during the migration, not treated as optional features to be added at the end.

---

# 24. MIGRATION MAP

Before major implementation changes, create an internal migration map.

For every existing file determine:

```text
Current File
→ New Location
→ Server / Client
→ Dependencies
→ Migration Notes
```

Also determine:

- Is it a page?
- Is it reusable?
- Is it interactive?
- Does it use browser APIs?
- Does it use GSAP?
- Does it use Lenis?
- Does it use Three.js?
- Does it contain business logic?
- Does it belong in `lib`?
- Does it belong in `hooks`?
- Does it belong in `providers`?
- Does it belong in `components`?

Do not blindly move files based only on their current filenames.

---

# 25. VISUAL PARITY REQUIREMENT

Before considering the migration complete, compare the original React/Vite implementation with the Next.js implementation.

## HOME

Verify:

- Hero
- navigation
- typography
- imagery
- cards
- sections
- animations
- footer
- micro-interactions

## SHOP

Verify:

- filters
- product grid
- product cards
- hover behavior
- search
- responsive layout

## ROOMS

Verify:

- room imagery
- hotspots
- product overlays
- interactions
- room navigation
- responsive behavior

## PRODUCT

Verify:

- gallery
- variants
- pricing
- CTA
- details
- recommendations
- interactions

## COMMERCE

Verify:

- cart
- wishlist
- checkout
- coupons
- shipping
- order summary
- account behavior

## OTHER

Verify:

- AI Assistant
- Studio
- Admin
- Journal
- Collections

Nothing should visually regress.

---

# 26. DO NOT DO THESE THINGS

DO NOT:

- create a new Next.js project
- create a new root folder
- redesign the homepage
- redesign the Hero
- change the color system
- replace typography unnecessarily
- remove GSAP
- remove Lenis
- remove Three.js
- remove AI
- remove room interactions
- remove ecommerce features
- replace working components with generic templates
- introduce a generic shadcn-style design system over the existing UI
- replace the existing design with a default Next.js design
- replace animations with CSS simply because it is easier
- simplify complex interactions without technical necessity
- invent missing assets
- invent missing functionality
- silently remove broken/unused-looking features
- expose secrets in `.env.example`
- commit `.env.local`
- use `dist/` as the source of truth
- add unnecessary dependencies
- make the entire application `"use client"`

---

# 27. MIGRATION SAFETY

Before deleting or replacing anything:

1. Identify references.
2. Identify dependencies.
3. Migrate dependencies.
4. Verify the replacement works.
5. Verify visual parity.
6. Verify responsive behavior.
7. Verify interactions.
8. Only then remove obsolete code.

The existing Vite implementation should remain understandable until the Next.js version is stable.

---

# 28. TESTING / VERIFICATION

After each major migration stage:

- run TypeScript checks
- run lint checks
- run the development server
- test affected routes
- test interactions
- inspect browser console
- inspect hydration warnings
- verify responsive behavior
- verify animation lifecycle
- verify asset loading

Before final cleanup:

- verify every route
- verify all major interactions
- verify all assets
- verify GSAP
- verify Lenis
- verify Three.js
- verify AI
- verify commerce flows
- verify mobile/tablet/desktop
- verify no hydration errors
- verify no broken imports
- verify no missing assets
- verify no unnecessary Client Components

---

# 29. FINAL TARGET

The final result must be:

```text
Existing Veloura Experience
          +
Next.js App Router
          +
Clean Standard Architecture
          +
Proper Git / Environment Setup
          +
Preserved UI/UX
          +
Preserved Features
          +
Preserved GSAP
          +
Preserved Lenis
          +
Preserved Three.js
          +
Preserved AI Experience
          +
Better Scalability
          +
Production-Ready Foundation
```

The migration is successful only when the user can interact with the Next.js version and feel that it is the **same Veloura Living experience**, not a redesigned version of Veloura.

---

# FINAL INSTRUCTION

Before making major changes:

1. Thoroughly inspect the existing project.
2. Understand the current architecture.
3. Understand the current UI/UX.
4. Understand the current assets.
5. Understand the current animations.
6. Understand the current commerce logic.
7. Understand the current room/product relationships.
8. Understand the current GSAP + Lenis + Three.js architecture.
9. Create the migration map.
10. Then execute the migration incrementally.

Work directly inside the existing Veloura project.

Do not create a new project.

Do not redesign unless technically required.

**Existing UI/UX and functionality are the source of truth. Next.js is the architectural migration, not the design change.**