# Veloura Living --- Shop Room Hover Experience

## Objective

Enhance the **existing Veloura Living Shop page** with a premium,
dynamic hover interaction for the existing **ROOM** row.

The existing Shop section already contains:

**ROOM:** - All Living Spaces - Living Room - Bedroom Sanctuary - Dining
& Gathering - Home Office & Study

These exact Room options are the target of this task.

When the user moves the cursor over a Room option, a large premium
**visual category panel / mega-menu-style panel** should smoothly
appear.

The experience should take inspiration from the **interaction pattern**
of premium ecommerce websites, but the implementation must be completely
original to Veloura Living.

------------------------------------------------------------------------

# 1. VERY IMPORTANT --- This Is NOT a Navbar Mega Menu

Do **not** add this interaction to the main navbar.

Do **not** create a new Living / Bedroom / Dining / Office mega menu in
the top navigation.

The interaction belongs specifically to the **ROOM row inside the
existing Shop section**.

The existing structure is conceptually:

``` text
AI Search
        ↓
ROOM:
[All Living Spaces] [Living Room] [Bedroom Sanctuary]
[Dining & Gathering] [Home Office & Study]
        ↓
Existing Product Grid
```

The Room row should remain visually recognizable as part of the existing
Shop experience.

------------------------------------------------------------------------

# 2. Desired Interaction

When the user hovers over:

-   Living Room
-   Bedroom Sanctuary
-   Dining & Gathering
-   Home Office & Study

show a premium room-specific panel.

Example:

``` text
ROOM:
[All Living Spaces] [Living Room] [Bedroom Sanctuary]
[Dining & Gathering] [Home Office & Study]

              ↓ hover

┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  ROOM / CATEGORY GROUPS              FEATURED VISUAL CARDS    │
│                                                               │
│  Seating                             ┌───────────────┐        │
│  Sofas                               │               │        │
│  Lounge Chairs                      │   IMAGE       │        │
│  Accent Chairs                      │               │        │
│                                      └───────────────┘        │
│  Tables                              Collection / Category    │
│  Coffee Tables                       Explore →               │
│  Side Tables                                                   │
│  Console Tables                       ┌───────────────┐        │
│                                      │               │        │
│  Storage                             │   IMAGE       │        │
│  TV Units                            │               │        │
│  Cabinets                            └───────────────┘        │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

This is only a structural example.

The final composition must fit the existing Veloura Shop layout and
visual system.

------------------------------------------------------------------------

# 3. Room Options Must Be Data-Driven

The system must support the existing Room options:

``` text
All Living Spaces
Living Room
Bedroom Sanctuary
Dining & Gathering
Home Office & Study
```

Do NOT create separate components such as:

``` tsx
<LivingRoomMenu />
<BedroomMenu />
<DiningMenu />
<OfficeMenu />
```

Instead create one reusable Room panel component driven by data.

Conceptually:

``` ts
type RoomCategory = {
  id: string
  label: string
  href?: string
  groups: RoomGroup[]
  featuredCards?: RoomFeaturedCard[]
}
```

The exact type/model should follow the existing project architecture.

Adding another Room later should require adding data, not creating
another UI component.

------------------------------------------------------------------------

# 4. NO HARD-CODED UI CONTENT

This is a strict requirement.

Do NOT put separate room-specific arrays directly inside the React
component.

Do NOT hard-code fake:

-   product names
-   prices
-   ratings
-   inventory
-   product IDs
-   image URLs
-   routes

First inspect the existing Veloura frontend and identify:

1.  existing Shop data
2.  existing room/category data
3.  existing product/catalog data
4.  existing collection data
5.  existing image/media sources
6.  existing routes
7.  existing API/service layer

Reuse the real project data wherever possible.

If a small mapping/configuration layer is necessary, keep it separate
from the UI and make it typed.

------------------------------------------------------------------------

# 5. Room-Specific Content

Each Room should be able to expose relevant furniture groups and visual
cards.

For example, a Living Room could contain groups such as:

-   Seating
-   Sofas
-   Lounge Chairs
-   Accent Chairs
-   Coffee Tables
-   Side Tables
-   TV / Media Storage

Bedroom Sanctuary could contain:

-   Beds
-   Bedside Tables
-   Dressers
-   Wardrobes
-   Bedroom Seating
-   Storage

Dining & Gathering could contain:

-   Dining Tables
-   Dining Chairs
-   Benches
-   Bar / Counter Seating
-   Sideboards
-   Dining Storage

Home Office & Study could contain:

-   Desks
-   Study Tables
-   Office Chairs
-   Shelving
-   Storage
-   Lighting

**These are examples only.**

Do not blindly hard-code these categories if the actual Veloura catalog
uses different data.

The real project/catalog source is the source of truth.

------------------------------------------------------------------------

# 6. All Living Spaces

`All Living Spaces` must work through the same reusable system.

It can provide a broader overview containing:

-   Living Room
-   Bedroom Sanctuary
-   Dining & Gathering
-   Home Office & Study

plus curated featured room/collection cards.

Do not create a separate implementation for `All Living Spaces`.

------------------------------------------------------------------------

# 7. Featured Visual Cards

The hover panel should include premium visual cards where appropriate.

Cards may contain:

-   furniture/lifestyle image
-   room/category label
-   collection title
-   short supporting text when available
-   CTA / arrow
-   optional real product/category metadata
-   optional real badge

Example:

``` text
┌──────────────────────────────┐
│                              │
│       FURNITURE IMAGE        │
│                              │
├──────────────────────────────┤
│ LIVING ROOM                  │
│ Sculptural Seating           │
│ Explore collection       →   │
└──────────────────────────────┘
```

Do not create fake pricing just to populate a card.

If real product data is unavailable, use a category/collection-level
card.

------------------------------------------------------------------------

# 8. Use Existing Veloura Media

Use the project's existing media system.

Preferred source order:

1.  existing Veloura assets
2.  existing catalog/product images
3.  existing room/category images
4.  existing collection/CMS media
5.  placeholder only when absolutely necessary

Do not introduce random external images.

Do not copy images from the reference screenshots.

Images should:

-   preserve good furniture composition
-   use an editorial crop
-   avoid aggressive cropping
-   use the existing optimized image component
-   support responsive loading
-   remain performant

------------------------------------------------------------------------

# 9. Reference Images --- How to Interpret Them

The reference screenshots are **not assets** and will **not be provided
to Antigravity**.

Use their concept only:

### Reference interaction pattern

Use as inspiration for:

-   large premium panel
-   grouped navigation
-   visual feature area
-   smooth reveal
-   clear hierarchy
-   premium ecommerce feel

### Reference card treatment

Use as inspiration for:

-   large visual cards
-   image + label + title
-   premium card framing
-   subtle CTA/arrow
-   editorial furniture presentation

### Existing Veloura Shop

The current Veloura Shop is the **source of truth** for:

-   layout
-   spacing
-   Room row
-   product grid
-   filters
-   AI Search
-   typography
-   colors
-   existing interactions

Do not redesign the Shop page.

------------------------------------------------------------------------

# 10. Visual Language --- Existing Veloura System

Use the existing finalized Veloura design system.

Warm luxury palette:

-   Deep Brown `#3B2418`
-   Dark Brown `#4A2C1A`
-   Warm Brown `#7A4E2D`
-   Veloura Brown `#8B5A2B`
-   Warm Terracotta `#9A633D`
-   Warm Ivory `#FBF8F3`
-   Cream `#F7F0E7`
-   Soft Beige `#E8D8C5`
-   Border `#D8C4AD`
-   Muted Text `#735E4E`

The panel should feel primarily:

**Ivory → Cream → Warm Beige → Warm Brown → Deep Brown**

Do not make the entire panel dark brown.

Do not introduce:

-   neon
-   blue-dominant colors
-   purple
-   cool gray dominance
-   bright orange
-   black-heavy surfaces
-   unnecessary gradients

------------------------------------------------------------------------

# 11. Typography

Use the existing finalized typography system.

### Instrument Serif

Use for:

-   major room/editorial titles
-   featured collection titles
-   visual card headlines where appropriate

### Instrument Sans

Use for:

-   Room labels
-   navigation links
-   subcategory links
-   CTA labels
-   metadata
-   supporting text
-   functional UI

Principle:

**Instrument Serif = Emotion + Luxury + Editorial**

**Instrument Sans = Clarity + Ecommerce + Function**

Do not use Instrument Serif everywhere.

------------------------------------------------------------------------

# 12. Animation

Reuse the existing Veloura motion system.

If GSAP, Lenis, or existing motion utilities are already present,
integrate with them rather than creating a second animation system.

### Panel open

Use:

-   subtle opacity transition
-   slight translate/reveal
-   optional very small scale
-   restrained content stagger

### Room switch

When moving:

``` text
Living Room → Bedroom Sanctuary → Dining & Gathering
```

keep the panel shell stable and transition only the changing content.

Avoid:

-   full panel flash
-   unnecessary remounting
-   layout jumping

### Card hover

Use:

-   subtle image scale
-   slight CTA/arrow movement
-   refined border/shadow transition

Avoid:

-   bounce
-   exaggerated zoom
-   heavy blur
-   glow
-   flashy animation

The motion should feel **premium editorial**, not playful.

------------------------------------------------------------------------

# 13. Hover Safety

The user must be able to move the cursor:

``` text
ROOM OPTION
    ↓
OPEN PANEL
    ↓
MOVE INTO PANEL
```

without the panel disappearing accidentally.

Use an appropriate hover-safe implementation:

-   shared pointer region
-   pointer enter/leave state
-   short intentional close delay
-   safe interaction area

Do not use an unnecessarily long delay.

When moving directly from one Room option to another, the panel should
update smoothly.

------------------------------------------------------------------------

# 14. Desktop / Tablet / Mobile

### Desktop

Use the full hover experience.

### Tablet

Do not depend only on hover.

Support tap/click interaction where appropriate.

### Mobile

Do not squeeze the desktop mega panel into a mobile viewport.

Use a clean accordion/drawer experience using the same data source:

``` text
Living Room
  Sofas
  Lounge Chairs
  Coffee Tables
  Storage

Bedroom Sanctuary
  Beds
  Bedside Tables
  Wardrobes
  Storage

Dining & Gathering
  Dining Tables
  Dining Chairs
  Sideboards

Home Office & Study
  Desks
  Office Chairs
  Shelving
  Storage
```

The same Room data must power desktop, tablet, and mobile.

------------------------------------------------------------------------

# 15. Room Navigation Behavior

The Room panel should work with the existing Shop filtering/navigation
system.

When the user clicks:

-   Living Room
-   Bedroom Sanctuary
-   Dining & Gathering
-   Home Office & Study
-   any valid subcategory
-   any featured Room/category card

navigate using the **existing Veloura Shop/category routes**.

Do not invent route names.

Do not create duplicate category pages.

The existing Shop/product-grid experience should remain intact.

------------------------------------------------------------------------

# 16. Existing Shop Experience Must Not Change

The current Shop already contains important functionality such as:

-   AI Search
-   Room filters
-   Refine Catalog
-   product cards
-   product images
-   wishlist
-   ratings
-   product metadata
-   existing warm luxury styling

Do NOT rebuild or redesign any of these.

The new Room hover panel is an **enhancement to the existing Shop
navigation/discovery experience**.

------------------------------------------------------------------------

# 17. NON-NEGOTIABLE --- Do Not Redesign Existing UI/UX

Do not:

-   redesign the navbar
-   replace the logo
-   redesign the Shop page
-   redesign the Room row itself unnecessarily
-   redesign product cards
-   redesign filters
-   redesign AI Search
-   redesign Collections
-   redesign Home
-   redesign authentication
-   change global spacing unnecessarily
-   replace existing components unnecessarily
-   remove existing interactions
-   modify unrelated pages

This task is only:

**Dynamic Room hover panel + premium visual discovery interaction +
flexible data-driven Room navigation.**

Everything else must remain stable.

------------------------------------------------------------------------

# 18. Reuse Existing Components

Before creating new components, inspect:

1.  existing Shop page
2.  existing Room filter/navigation component
3.  existing product/category cards
4.  existing image component
5.  existing motion utilities
6.  existing design tokens
7.  existing route/navigation utilities
8.  existing catalog/category data

Reuse existing components where appropriate.

Possible architecture:

``` text
Shop
 └── RoomNavigation
      ├── RoomTrigger
      └── RoomHoverPanel
           ├── RoomGroupList
           ├── RoomGroup
           ├── RoomFeaturedGrid
           └── RoomFeaturedCard
```

This is a suggested architecture only.

Follow the project's actual conventions.

------------------------------------------------------------------------

# 19. Accessibility

The interaction must be accessible.

Requirements:

-   keyboard navigation
-   visible focus states
-   Escape closes the panel
-   Enter / Space activates Room controls
-   semantic navigation
-   appropriate ARIA attributes
-   sufficient contrast
-   touch-friendly targets
-   no critical functionality available only through hover

Hover is an enhancement, not the only way to access the content.

------------------------------------------------------------------------

# 20. Performance

The Room panel must remain lightweight.

Requirements:

-   use the existing optimized image component
-   lazy-load non-critical visual cards where appropriate
-   do not load every image unnecessarily on initial page load
-   avoid an API request on every hover
-   cache Room/category data appropriately
-   avoid expensive pointer-movement re-renders
-   keep Room switching responsive

The user should feel an immediate response when hovering.

------------------------------------------------------------------------

# 21. Scalable Data Architecture

The final system should support:

``` text
Room
  ↓
Room Groups
  ↓
Subcategories
  ↓
Existing Category / Collection / Product Route
  ↓
Existing Media
```

Conceptually:

``` ts
{
  id: "living-room",
  label: "Living Room",
  href: "<existing-room-route>",
  groups: [
    {
      title: "<real catalog group>",
      items: [...]
    }
  ],
  featuredCards: [...]
}
```

This is only a conceptual structure.

Use real Veloura data and existing routes.

The UI must not assume that only the current five Room options will ever
exist.

------------------------------------------------------------------------

# 22. Final User Experience

The intended flow:

``` text
User opens Veloura Shop
        ↓
Existing Shop UI remains unchanged
        ↓
User sees:

ROOM:
[All Living Spaces] [Living Room] [Bedroom Sanctuary]
[Dining & Gathering] [Home Office & Study]
        ↓
User hovers "Living Room"
        ↓
Premium Living Room panel opens
        ↓
Relevant furniture groups + visual cards appear
        ↓
User moves to "Bedroom Sanctuary"
        ↓
Same panel smoothly transitions to Bedroom content
        ↓
User moves to "Dining & Gathering"
        ↓
Dining content appears
        ↓
User clicks a subcategory / visual card
        ↓
Existing Veloura Shop/category experience opens
```

The result should feel:

**Premium**\
**Editorial**\
**Furniture-first**\
**Warm**\
**Intelligent**\
**Smooth**\
**Flexible**\
**Scalable**

------------------------------------------------------------------------

# 23. Implementation Rules for Antigravity

Before coding:

1.  Inspect the current Veloura Shop implementation.
2.  Find the exact component rendering the existing `ROOM:` row.
3.  Identify how Room filtering currently works.
4.  Identify existing category/catalog/product data.
5.  Identify existing media/image sources.
6.  Identify existing Shop/category routes.
7.  Identify existing card components.
8.  Identify existing motion utilities.
9.  Identify current design tokens.
10. Implement the smallest clean architectural change.

Do not rewrite unrelated code.

Do not create duplicate systems.

Do not hard-code fake content.

Do not introduce a second design system.

Do not redesign the existing Shop.

------------------------------------------------------------------------

# 24. Acceptance Criteria

-   [ ] The interaction is implemented specifically in the existing Shop
    `ROOM:` row.
-   [ ] The five existing Room options are supported:
    -   [ ] All Living Spaces
    -   [ ] Living Room
    -   [ ] Bedroom Sanctuary
    -   [ ] Dining & Gathering
    -   [ ] Home Office & Study
-   [ ] Hovering a Room option opens a premium visual panel.
-   [ ] The panel feels like the reference interaction pattern without
    copying it.
-   [ ] The panel contains relevant Room groups and visual cards where
    real data exists.
-   [ ] Room content is data-driven.
-   [ ] There is one reusable Room panel component.
-   [ ] No separate hard-coded Living/Bedroom/Dining/Office menu
    components exist.
-   [ ] No fake products, prices, ratings, or inventory are introduced.
-   [ ] Existing catalog/category/media sources are reused.
-   [ ] Existing Veloura routes are reused.
-   [ ] Moving between Room options updates the panel smoothly.
-   [ ] Hover-safe behavior works.
-   [ ] Desktop hover works.
-   [ ] Tablet does not depend only on hover.
-   [ ] Mobile uses an accessible accordion/drawer pattern.
-   [ ] Keyboard navigation works.
-   [ ] Escape closes the panel.
-   [ ] Existing Shop UI/UX remains unchanged.
-   [ ] Existing product cards remain unchanged.
-   [ ] Existing AI Search remains unchanged.
-   [ ] Existing filters remain unchanged.
-   [ ] Existing navbar remains unchanged.
-   [ ] Existing typography system is respected.
-   [ ] Existing warm luxury color system is respected.
-   [ ] Existing motion system is reused.
-   [ ] No glassmorphism is introduced.
-   [ ] No excessive blur, glow, bounce, or flashy animation is
    introduced.
-   [ ] Future Room categories can be added through data/configuration
    rather than new UI components.

------------------------------------------------------------------------

# Final Rule

**Do not treat this as a website redesign.**

This is a **Shop Room navigation intelligence + premium hover
interaction enhancement**.

The existing Veloura Shop is the source of truth.

Build the interaction once, drive it with real project data, keep it
flexible, and preserve the existing Veloura UI/UX exactly as it is.
