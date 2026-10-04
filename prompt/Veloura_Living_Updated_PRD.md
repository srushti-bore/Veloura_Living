# Veloura Living — Complete Product Requirements Document (PRD)

**Project:** Veloura Living  
**Document:** Updated Production PRD  
**Status:** Master implementation specification  
**Design system:** Veloura Living Design Tokens  
**Primary design reference:** Modern Furniture Website Design  
**Animation engine:** GSAP  
**Smooth scrolling:** Lenis  
**Immersive layer:** Selective 3D floating objects  
**Core positioning:** Furniture Intelligence + Commerce Platform

---

# 1. Executive Definition

Veloura Living is a premium **Furniture Intelligence + Commerce Platform** that combines:

- room-based furniture discovery
- immersive room experiences
- intelligent product discovery
- AI-powered search
- AI shopping assistance
- personalized recommendations
- product-to-room relationships
- furniture storytelling
- production-grade ecommerce
- editorial content
- premium visual design

The platform must not feel like a conventional furniture ecommerce website.

### Core statement

> **Furniture विकायचं नाही... Furniture Intelligence build करायची आहे.**

### Product positioning

> **A premium interactive furniture experience platform combining space, design, and emotion.**

The final product should answer two deeper questions:

> **What furniture belongs in my space?**

and

> **How should my space feel?**

---

# 2. Product Vision

Veloura combines three major systems:

```text
FURNITURE INTELLIGENCE
        +
IMMERSIVE EXPERIENCE
        +
PRODUCTION COMMERCE
```

The result should feel like a premium furniture/design experience where commerce is naturally embedded into discovery.

---

# 3. Strategic Product Layers

## 3.1 Furniture Intelligence Layer

Required capabilities:

- Room intelligence
- AI search
- AI shopping assistant
- AI recommendations
- Personalized furniture suggestions
- Interactive room experiences
- Furniture discovery based on space
- Furniture discovery based on design
- Furniture discovery based on emotion
- Product-content intelligence
- Furniture storytelling
- Room-based discovery
- Product-to-room relationships
- Complete-the-room recommendations

---

## 3.2 Commerce Layer

Required capabilities:

- Product catalog
- Product variants
- Search
- Smart filters
- Wishlist
- Cart
- Checkout
- Payments
- Orders
- Order tracking
- Inventory
- Reviews and ratings
- Coupons and discounts
- Customer accounts
- Returns/refunds
- Shipping
- Notifications
- CMS
- Admin dashboard
- Analytics

---

# 4. Product Goals

## Primary goals

1. Build a premium furniture discovery experience.
2. Make rooms a first-class discovery surface.
3. Connect inspiration directly to real products.
4. Integrate AI naturally into furniture discovery.
5. Provide production-ready ecommerce capabilities.
6. Create a differentiated furniture experience rather than a generic store.
7. Maintain premium visual quality across desktop and mobile.
8. Make the system scalable and CMS/admin driven.
9. Use motion and 3D to enhance spatial understanding without compromising usability.
10. Make product, room, content, and commerce relationships structurally connected.

---

# 5. Non-Goals

Veloura should not become:

- A generic Shopify-style storefront
- A SaaS dashboard
- A generic AI chatbot
- A gaming experience
- A technical AI demo
- A neon/futuristic interface
- A 3D showcase where 3D becomes the product
- An animation portfolio
- A static furniture catalog without context

---

# 6. Target Experience

The experience should feel:

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

The experience should communicate quality through:

- photography
- typography
- whitespace
- materials
- room context
- interaction
- product storytelling
- restrained motion
- intelligent discovery

---

# 7. Locked Design Direction

The current design direction is based on the **Modern Furniture Website Design** reference.

The implementation should preserve:

- modern premium furniture aesthetic
- strong layout quality
- visual hierarchy
- product/catalog presentation
- editorial spacing
- premium typography
- ecommerce structure
- refined filters
- product discovery
- premium product detail pages
- furniture storytelling

A previously rejected design direction must not be reintroduced.

---

# 8. Design System Dependency

The implementation must use the separate:

**Veloura Living Design Tokens**

as the design-system source of truth.

The PRD does not replace the token file.

The token file controls:

- colors
- typography
- spacing
- sizing
- radius
- shadows
- borders
- responsive values
- motion values
- image rules
- component states
- animation principles
- accessibility behavior

Any component that requires a new visual value should first check whether an existing token can be reused.

---

# 9. Typography

## Display / Editorial

**Playfair Display**

Use for:

- Hero headlines
- Major page titles
- Editorial headings
- Premium brand moments
- Large room storytelling
- Emotional statements

## UI / Functional

**Inter**

Use for:

- Navigation
- Body copy
- Buttons
- Labels
- Product metadata
- Filters
- Forms
- Search
- Commerce UI
- Account UI

Typography must create:

**Editorial luxury → Playfair Display**

and

**Modern usability → Inter**

---

# 10. Color Direction

Primary brand palette:

```text
Primary Brown  #8B5A2B
Deep Brown     #4A2C1A
Warm Cream     #F5E6D3
Soft Beige     #EADBC8
```

The implementation should also use the warm neutral semantic system defined in the Design Tokens file.

Avoid:

- neon
- dominant green
- dominant blue
- harsh sterile white
- excessive gradients
- excessive glassmorphism

---

# 11. Motion & Interaction Strategy

Motion is a supporting layer.

It must improve:

- hierarchy
- spatial understanding
- product discovery
- storytelling
- feedback

It must not slow down:

- browsing
- search
- cart
- checkout
- navigation

Avoid:

- bounce animations
- jerky movement
- excessive parallax
- gimmicky transitions
- long blocking animations

---

# 12. GSAP Requirement

**GSAP is the primary animation engine.**

Use GSAP for:

- hero entrances
- section reveals
- product-card interactions
- image transitions
- page transitions
- scroll-triggered storytelling
- subtle parallax
- room hotspots
- interactive room transitions
- editorial sequences
- micro-interactions
- 3D object animation

Animation logic must be reusable.

Recommended conceptual architecture:

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

Do not duplicate animation logic across page components.

---

# 13. Lenis Requirement

**Lenis is the required smooth-scrolling layer.**

Lenis should provide:

- smooth scrolling
- premium editorial scroll feel
- consistent scroll behavior
- integration with GSAP ScrollTrigger

Conceptually:

```text
Lenis
   ↓
Scroll State
   ↓
GSAP / ScrollTrigger
   ↓
Scroll-driven Experience
```

Do not introduce competing smooth-scroll systems.

Scrolling must remain accessible and should not interfere with essential interactions.

---

# 14. 3D Floating Objects

Selective 3D is an immersive enhancement.

Potential locations:

- Hero
- Furniture storytelling sections
- Collection transitions
- Material storytelling
- AI/furniture intelligence visualization
- Product/editorial storytelling

3D objects can include:

- subtle furniture silhouettes
- abstract spatial furniture forms
- material objects
- decorative furniture components
- lightweight product fragments

3D must feel:

- elegant
- spatial
- slow
- premium
- contextual

It must not make Veloura feel:

- game-like
- futuristic SaaS-like
- technically experimental

---

# 15. 3D Performance Requirements

Desktop:

- Full-quality 3D where appropriate

Tablet:

- Reduced complexity

Mobile:

- Reduced object count
- Reduced animation
- Static fallback where necessary
- Remove 3D where it harms performance

3D must never block:

- initial page rendering
- product discovery
- search
- navigation
- cart
- checkout

---

# 16. Reduced Motion

Respect user motion preferences.

When reduced motion is enabled:

- reduce/remove large parallax
- reduce 3D movement
- reduce complex page transitions
- disable continuous decorative animation
- reduce scroll-linked effects

Essential interaction feedback must remain available.

---

# 17. Core UX Journey

The central journey is:

```text
Hero
  ↓
Room Selection
  ↓
Product Listing
  ↓
Product Detail
  ↓
Interactive Clickable Room View
  ↓
Cart
  ↓
Checkout
  ↓
Order
  ↓
Tracking
```

This journey must remain coherent across desktop and mobile.

---

# 18. Core Room Categories

The four primary rooms are:

1. Living Room
2. Bedroom
3. Dining
4. Office

These rooms form the primary room-based discovery system.

---

# 19. Room Intelligence

A room is not simply a category label.

A room is a discovery environment.

The relationship is:

```text
Room
 ↓
Furniture
 ↓
Product
 ↓
Variant
 ↓
Purchase
```

Room scenes should expose individual furniture objects.

---

# 20. Critical Rule — Collage Is Not a Product

This is a non-negotiable product requirement.

Gemini-generated room/category collages are:

- Inspiration
- Editorial imagery
- Category representation
- Discovery entry points

They are not automatically products.

### Correct

```text
Bedroom Collage
      ↓
Bedroom Category
      ↓
Individual Products
      ├── King Bed
      ├── Queen Bed
      ├── Bedside Table
      ├── Wardrobe
      ├── Dresser
      ├── Dressing Table
      ├── Bench
      ├── Lounge Chair
      ├── Lamp
      ├── Mirror
      └── Rug
```

### Incorrect

```text
Bedroom Collage
      ↓
"Bedroom Furniture Set"
      ↓
Product
```

unless a real sellable set exists as a separate catalog product.

---

# 21. Homepage Requirements

Homepage structure should include:

```text
Header
↓
Hero
↓
Furniture Intelligence introduction
↓
Shop by Category
↓
Best Sellers / Featured Products
↓
Room / Editorial Story
↓
AI discovery or recommendation moment
↓
Complete the Room / Curated discovery
↓
Journal / Editorial
↓
Footer
```

The exact section ordering can evolve during implementation while preserving the core hierarchy.

---

# 22. Header

## Desktop

Primary navigation:

- Home
- Shop
- Collections
- Rooms
- About
- Journal
- Contact

Utility actions:

- Search
- Wishlist
- Account
- Cart

## Mobile

- Logo
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

---

# 23. Hero

Conceptual content:

### Eyebrow

**FURNITURE INTELLIGENCE**

### Headline

**Timeless Furniture for Living**

### Supporting copy

Thoughtfully designed furniture for modern homes. Explore, experience and bring your ideal space to life — with the power of AI.

### Primary CTA

**Explore Collections**

### Secondary CTA

**Watch Video**

Hero should use premium real-room imagery.

A generic isolated product cutout should not be the primary hero visual.

---

# 24. Shop by Category

Homepage must include a strong:

**Shop by Category**

section.

Categories:

- Living Room
- Bedroom
- Dining
- Office

Each category should use premium room imagery.

Click behavior:

```text
Category
 ↓
Room Catalog
 ↓
Individual Products
```

The category collage is never treated as a product.

---

# 25. Living Room Asset/Discovery Requirements

The Living Room visual system includes:

### Hero/interior

- Large neutral sectional sofa
- Wooden coffee tables
- Boucle lounge chair
- Wooden media console
- Shelving
- Rug
- Warm natural interior
- Large windows
- Soft daylight

### Product concepts

- Sofa
- Sectional Sofa
- Lounge Chair
- Coffee Table
- Side Table
- TV/Media Console
- Shelving
- Floor Lamp
- Table Lamp
- Rug
- Ottoman
- Sideboard

The final catalog must represent individual sellable products separately.

---

# 26. Bedroom Asset/Discovery Requirements

Bedroom hero/interior:

- Upholstered bed
- Warm wood
- Bedside table
- Wardrobe
- Bench
- Lounge chair
- Neutral rug
- Warm textiles
- Natural daylight

Product concepts:

- King Bed
- Queen Bed
- Bedside Table
- Bedside Table Pair
- Wardrobe
- Dresser
- Dressing Table
- Vanity
- Bedroom Bench
- Lounge Chair
- Floor Lamp
- Table Lamp
- Full-Length Mirror
- Bedroom Rug

---

# 27. Dining Asset/Discovery Requirements

Dining hero/interior:

- Large wooden dining table
- Upholstered dining chairs
- Pendant light
- Shelving
- Sideboard
- Warm wood
- Neutral rug
- Table styling
- Natural daylight

Product concepts:

- 6-Seater Dining Table
- 8-Seater Dining Table
- Dining Chair
- Dining Chair Pair
- Dining Chair Set
- Sideboard
- Display Cabinet
- Bar Cabinet
- Pendant Light
- Console Table
- Dining Bench

---

# 28. Office Asset/Discovery Requirements

Office hero/interior:

- Executive wooden desk
- Ergonomic chair
- Lounge chair
- Bookshelf
- Sideboard/credenza
- Floor lamp
- Desk lamp
- Warm rug
- Natural light
- Premium home-office environment

Product concepts:

- Executive Desk
- Compact Desk
- Ergonomic Chair
- Executive Chair
- Lounge Chair
- Bookshelf
- Storage Cabinet
- Filing Cabinet
- Desk Lamp
- Floor Lamp
- Side Table
- Credenza
- Meeting Table

---

# 29. Product Listing Page

Product listing must support:

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

Capabilities:

- Search
- AI search
- Sorting
- Filtering
- Product cards
- Wishlist
- Quick actions
- Pagination or infinite loading as appropriate

The UI should remain visually uncluttered.

---

# 30. Product Card

Required:

- Product image
- Product name
- Rating
- Review count
- Price
- Sale price where applicable
- Wishlist
- Availability
- Variant indication
- Optional quick action

The product card should remain image-first.

Hover can provide:

- secondary image
- subtle scale
- quick action
- wishlist reveal

Do not overload cards.

---

# 31. AI Search

AI search must understand natural-language intent.

Examples:

```text
Warm beige sofa for a small living room

Wooden dining table for 6 people

Minimal bedroom furniture under ₹1 lakh

Comfortable office chair for long working hours

Furniture that matches my walnut interior
```

The system should interpret:

- room
- furniture type
- material
- color
- size
- style
- budget
- use case
- preferences

AI search should complement traditional search/filtering.

---

# 32. AI Shopping Assistant

The assistant should behave like a furniture/design consultant.

It should help with:

- product discovery
- materials
- comparisons
- room planning
- complementary furniture
- product questions
- size/space decisions
- styling
- purchase guidance

It should not visually resemble a generic AI assistant.

---

# 33. AI Recommendations

Required recommendation types:

- Personalized
- Room-based
- Product-to-product
- Complementary
- Complete the Room
- Recently viewed
- Behavior-based
- Preference-based

Example:

```text
Sofa
 ↓
Coffee Table
 ↓
Side Table
 ↓
Rug
 ↓
Lamp
```

---

# 34. Interactive Room Experience

The room experience must allow users to discover furniture directly from a scene.

Interaction model:

```text
Room
 ↓
Clickable Furniture
 ↓
Furniture Highlight
 ↓
Product Preview
 ↓
Product Detail
 ↓
Wishlist / Cart
```

Possible interactive objects:

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

The interaction must feel like furniture discovery, not gaming.

---

# 35. Room Hotspots

Hotspots should be:

- Minimal
- Elegant
- Discoverable
- Contextual

Possible treatment:

- small dot
- subtle ring
- hover highlight
- floating label
- contextual product card

Avoid large game-like markers.

---

# 36. Product Detail Page

Product detail should include:

- Gallery
- Product name
- Price
- Rating
- Reviews
- Variant selection
- Color
- Material
- Dimensions
- Specifications
- Availability
- Delivery estimate
- Quantity
- Add to Cart
- Buy Now
- Wishlist
- Product story
- Care instructions
- Shipping
- Returns
- Related products
- Complementary products
- Room context
- AI assistance

Recommended hierarchy:

```text
Product Hero
↓
Story
↓
Specifications
↓
Materials
↓
Dimensions
↓
Delivery
↓
Reviews
↓
Complete the Room
↓
Related Products
```

---

# 37. Catalog Architecture

Products must support:

- Product ID
- SKU
- Name
- Slug
- Description
- Story
- Category
- Room
- Collection
- Product type
- Variants
- Price
- Sale price
- Media
- Materials
- Colors
- Dimensions
- Stock
- Status
- Rating
- Review count
- SEO data

---

# 38. Product Variants

Variant system must support where applicable:

- Color
- Material
- Size
- Configuration
- Other product-specific attributes

Each variant should be able to have:

- SKU
- price
- sale price
- stock
- media
- availability

---

# 39. Core Data Model

Required entities:

```text
User
Product
ProductVariant
Category
Room
Collection
ProductMedia
Inventory
Wishlist
Cart
CartItem
Order
OrderItem
Payment
Shipping
Review
Coupon
ReturnRequest
Notification
Recommendation
AIConversation
CMSContent
AdminUser
AnalyticsEvent
```

Critical relationship:

```text
Room
 ↓
RoomFurniture / RoomProduct
 ↓
Product
 ↓
ProductVariant
```

---

# 40. Room-to-Product Relationship

Example:

```text
Bedroom
 ├── King Bed → Product ID
 ├── Bedside Table → Product ID
 ├── Wardrobe → Product ID
 ├── Dresser → Product ID
 ├── Dressing Table → Product ID
 ├── Bench → Product ID
 ├── Lounge Chair → Product ID
 ├── Floor Lamp → Product ID
 ├── Mirror → Product ID
 └── Rug → Product ID
```

Same architecture applies to Living, Dining, and Office.

---

# 41. Wishlist

Users must be able to:

- Add product
- Remove product
- View wishlist
- Move wishlist product to cart
- Persist wishlist for authenticated users

Product cards and detail pages should expose wishlist actions.

---

# 42. Cart

Cart must support:

- Product
- Variant
- Quantity
- Subtotal
- Discounts
- Shipping
- Tax where applicable
- Total
- Remove
- Quantity updates
- Availability validation

Cart UI should remain visually consistent with Veloura.

---

# 43. Checkout

Checkout should support:

1. Customer details
2. Shipping address
3. Billing information
4. Delivery method
5. Coupon
6. Payment
7. Order review
8. Confirmation

Payment logic must not be hardcoded into the frontend.

---

# 44. Payments

Architecture must support a real payment provider.

Requirements:

- Secure payment integration
- Server-side sensitive operations
- Payment status
- Payment failure handling
- Order/payment relationship
- Confirmation state

Secrets must never be exposed in client-side code.

---

# 45. Orders

Users must be able to:

- View order history
- View order detail
- Track status
- View items
- View payment state
- View shipping state
- Request cancellation where supported
- Start return/refund flow where supported

---

# 46. Inventory

Inventory must support:

- Stock quantity
- Availability
- Low stock
- Out of stock
- Inventory updates
- Variant-level stock

UI must reflect real availability.

---

# 47. Reviews & Ratings

Support:

- Rating
- Review
- Review count
- Verified purchase state where supported
- Review moderation
- Admin review management

---

# 48. Coupons & Discounts

Support:

- Percentage discounts
- Fixed discounts
- Validity dates
- Usage limits
- Minimum order values
- Product/category applicability
- Coupon status

---

# 49. Customer Accounts

Account area should support:

- Profile
- Addresses
- Orders
- Wishlist
- Preferences
- Account settings
- Returns/refunds
- Notification preferences where applicable

---

# 50. Returns & Refunds

Support:

- Return request
- Return reason
- Request status
- Refund status
- Admin handling
- Relevant order/item relationship

---

# 51. Shipping

Support:

- Shipping methods
- Delivery estimates
- Shipping rules
- Tracking
- Order-shipping relationship
- Shipping status

---

# 52. Notifications

Potential notifications:

- Order confirmation
- Payment confirmation
- Shipping update
- Delivery update
- Return update
- Refund update
- Account notification
- Promotional notification where applicable

---

# 53. CMS

Business users should be able to update everyday content without changing source code.

CMS should manage:

- Homepage sections
- Banners
- Collections
- Room stories
- Product content
- Editorial content
- Journal
- Promotions
- Featured products
- Room experiences
- AI merchandising content where appropriate

---

# 54. Admin Dashboard

Admin should support:

- Dashboard
- Products
- Variants
- Categories
- Rooms
- Collections
- Inventory
- Orders
- Customers
- Reviews
- Coupons
- Returns
- Shipping
- CMS
- Journal
- Notifications
- Analytics

---

# 55. Analytics

Track both commerce and furniture intelligence.

Required events include:

```text
Room Viewed
Room Product Clicked
AI Search Used
AI Recommendation Clicked
AI Assistant Opened
Product Viewed
Wishlist Added
Cart Added
Checkout Started
Purchase Completed
```

Additional useful events:

- Search query submitted
- Filter applied
- Filter removed
- Product variant selected
- Complete Room clicked
- Recommendation dismissed
- Room hotspot opened
- AI suggestion accepted
- Product shared

---

# 56. Analytics Model

Analytics should help answer:

### Discovery

- Which rooms are most viewed?
- Which room objects are clicked?
- Which searches are common?

### Commerce

- Which products convert?
- Which categories drive cart activity?
- Where does checkout drop off?

### Intelligence

- Which AI queries lead to discovery?
- Which recommendations are interacted with?
- Which room-to-product journeys convert?

---

# 57. Collections

Core collections:

- Living Room
- Bedroom
- Dining
- Office

Potential future collections:

- Warm Minimal
- Modern Classic
- Natural Wood
- Soft Neutral
- Contemporary

Collections should be CMS/admin-driven rather than hardcoded.

---

# 58. Journal / Editorial

Journal content can include:

- Furniture guides
- Room styling
- Material stories
- Design inspiration
- Buying guides
- Care guides
- Room transformations
- Trends
- Editorial stories

Journal strengthens the brand beyond ecommerce.

---

# 59. Mobile Requirements

Mobile is not a shrunken desktop.

Required:

- Compact header
- Search
- Wishlist
- Cart
- Menu
- Editorial hero
- Touch-optimized category cards
- Touch-optimized product cards
- Mobile filters
- Mobile product gallery
- Accessible purchase actions
- Optional bottom navigation

Animations and 3D must be reduced where necessary.

---

# 60. Desktop Requirements

Desktop should emphasize:

- Spacious editorial layout
- Large room photography
- Strong typography
- Multi-column product grids
- Premium navigation
- Clear filters
- Hover interactions
- Smooth motion
- Immersive room sections
- Product storytelling

---

# 61. Responsive Strategy

Breakpoints should be implementation-driven.

Baseline:

```text
640px
768px
1024px
1280px
1536px
```

The system must adapt fluidly across:

- Mobile
- Tablet
- Laptop
- Desktop
- Large desktop

---

# 62. Accessibility

Required:

- Semantic HTML
- Keyboard accessibility
- Visible focus states
- Accessible labels
- Sufficient contrast
- Alt text
- Accessible forms
- Accessible dialogs
- Screen-reader-friendly navigation
- Reduced-motion support

Premium visual design must never compromise accessibility.

---

# 63. Performance

Because the experience is image-heavy, performance is a product requirement.

Required:

- Responsive images
- Modern formats
- Lazy loading
- Critical image preload only
- Optimized fonts
- Route-level code splitting
- Component-level lazy loading where appropriate
- Caching
- Layout-shift prevention
- Optimized 3D assets
- Reduced mobile animation complexity

---

# 64. 3D Performance Strategy

3D should load progressively.

Suggested strategy:

```text
Initial page
 ↓
Critical content rendered
 ↓
Hero/product imagery rendered
 ↓
3D enhancement loaded progressively
```

Do not block the main commerce experience waiting for 3D.

---

# 65. SEO

Required:

- Page title
- Meta description
- Open Graph
- Product SEO
- Category SEO
- Room SEO
- Collection SEO
- Journal SEO
- Structured data where appropriate
- Clean URLs
- Sitemap
- Robots
- Canonical URLs

---

# 66. Security

Separate:

```text
Public UI
Authenticated Actions
Admin Actions
Payment Operations
Server-side Business Logic
```

Never expose:

- Payment secrets
- API secrets
- AI provider secrets
- Admin credentials
- Private backend keys

in frontend code.

---

# 67. Technical Architecture

Recommended separation:

```text
UI
Components
Pages / Routes
Features
Business Logic
Services
API
Data
State
AI
Commerce
CMS
Admin
Analytics
Assets
Styles
Utilities
```

Avoid giant components and page-specific business logic.

---

# 68. Main Project Folder Structure

```text
veloura-living/
│
├── public/
│   ├── favicon/
│   ├── logos/
│   └── static/
│
├── src/
│   ├── app/
│   │   ├── routes/
│   │   ├── layouts/
│   │   └── providers/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── navigation/
│   │   ├── product/
│   │   ├── room/
│   │   ├── commerce/
│   │   ├── ai/
│   │   └── editorial/
│   │
│   ├── features/
│   │   ├── catalog/
│   │   ├── search/
│   │   ├── wishlist/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── orders/
│   │   ├── reviews/
│   │   ├── coupons/
│   │   ├── accounts/
│   │   ├── returns/
│   │   ├── shipping/
│   │   ├── recommendations/
│   │   ├── ai-search/
│   │   ├── ai-assistant/
│   │   └── room-experience/
│   │
│   ├── pages/
│   │   ├── home/
│   │   ├── shop/
│   │   ├── collections/
│   │   ├── rooms/
│   │   ├── product/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── account/
│   │   ├── orders/
│   │   ├── journal/
│   │   └── contact/
│   │
│   ├── admin/
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── inventory/
│   │   ├── orders/
│   │   ├── customers/
│   │   ├── reviews/
│   │   ├── coupons/
│   │   ├── returns/
│   │   ├── cms/
│   │   └── analytics/
│   │
│   ├── services/
│   │   ├── api/
│   │   ├── payments/
│   │   ├── shipping/
│   │   ├── notifications/
│   │   ├── analytics/
│   │   └── ai/
│   │
│   ├── lib/
│   │   ├── animation/
│   │   │   ├── gsap.ts
│   │   │   ├── presets.ts
│   │   │   ├── transitions.ts
│   │   │   ├── scroll.ts
│   │   │   └── interactions.ts
│   │   ├── 3d/
│   │   └── utils/
│   │
│   ├── hooks/
│   ├── state/
│   ├── types/
│   ├── config/
│   ├── styles/
│   │   └── tokens/
│   └── utils/
│
├── assets/
│   ├── images/
│   │   ├── rooms/
│   │   │   ├── living-room/
│   │   │   ├── bedroom/
│   │   │   ├── dining/
│   │   │   └── office/
│   │   ├── products/
│   │   │   ├── living-room/
│   │   │   ├── bedroom/
│   │   │   ├── dining/
│   │   │   └── office/
│   │   ├── collections/
│   │   └── editorial/
│   ├── icons/
│   └── fonts/
│
├── tests/
├── docs/
├── .env.example
├── README.md
└── package.json
```

---

# 69. Asset Integration

Gemini images currently live in a separate personal folder.

That folder is not automatically the repository.

When assets are selected for implementation:

```text
Personal Gemini Folder
        ↓
Review / Select
        ↓
Rename
        ↓
Copy into repository
        ↓
Map to CMS / product / room
```

---

# 70. Asset Mapping

Example:

```text
assets/images/rooms/bedroom/bedroom-hero.webp
    → Bedroom hero

assets/images/rooms/bedroom/bedroom-category.webp
    → Homepage category card

assets/images/products/bedroom/bedroom-king-bed-01.webp
    → King Bed product media

assets/images/products/bedroom/bedroom-nightstand-01.webp
    → Bedside Table product media
```

Every production asset should have a known role.

---

# 71. Asset Rules

Do not mix:

- Room hero
- Room collage
- Category image
- Product image
- Editorial image

without explicit mapping.

A room collage may represent multiple furniture products but remains a visual discovery asset.

---

# 72. CMS-First Content Philosophy

Business users should not need source-code changes for everyday content.

CMS/admin should control:

- Products
- Product media
- Variants
- Inventory
- Categories
- Rooms
- Collections
- Homepage content
- Editorial content
- Journal
- Promotions
- Featured products

---

# 73. API / Service Separation

The UI should communicate with services rather than embedding business rules in components.

Examples:

```text
services/api
services/payments
services/shipping
services/notifications
services/analytics
services/ai
```

Business-critical operations should execute server-side where required.

---

# 74. State Management

State should be separated conceptually into:

### UI state

- drawers
- modals
- filters
- navigation
- animation state

### Commerce state

- cart
- wishlist
- checkout
- order state

### User state

- account
- preferences
- addresses

### Discovery state

- recent searches
- recent products
- recommendations
- room context

### AI state

- conversation
- intent
- recommendation context

Avoid one giant global state object.

---

# 75. Routing

Expected public routes:

```text
/
 /shop
 /collections
 /collections/:slug
 /rooms
 /rooms/living-room
 /rooms/bedroom
 /rooms/dining
 /rooms/office
 /products/:slug
 /cart
 /checkout
 /account
 /account/orders
 /account/orders/:id
 /wishlist
 /journal
 /journal/:slug
 /about
 /contact
```

Admin routes should remain protected.

---

# 76. Search-to-Purchase Journey

The system should support:

```text
Search Intent
 ↓
AI Interpretation
 ↓
Filtered Product Results
 ↓
Product Detail
 ↓
Room Context
 ↓
Complementary Recommendations
 ↓
Cart
 ↓
Checkout
```

---

# 77. Room-to-Purchase Journey

```text
Homepage
 ↓
Shop by Category
 ↓
Room
 ↓
Interactive Room
 ↓
Click Furniture
 ↓
Product
 ↓
Variant
 ↓
Add to Cart
 ↓
Checkout
```

This is a key differentiated journey.

---

# 78. Product-to-Room Journey

```text
Product
 ↓
View Room Context
 ↓
Interactive Room
 ↓
Discover Complementary Furniture
 ↓
Complete the Room
```

---

# 79. Complete the Room

The platform should connect products into contextual groups.

Example:

```text
Sofa
+
Coffee Table
+
Side Table
+
Rug
+
Lamp
```

The recommendation engine should understand room context and compatibility.

---

# 80. Personalization

Potential signals:

- Viewed products
- Viewed rooms
- Search queries
- Wishlist
- Cart
- Purchase history
- Preferred materials
- Preferred colors
- Preferred styles
- Room interests

Personalization should improve discovery without making the interface feel invasive.

---

# 81. Product Content Intelligence

Products should contain structured content for AI and discovery:

- materials
- dimensions
- room compatibility
- style
- color
- care
- use case
- complementary products
- related products
- delivery
- availability

This structured content enables better AI search and recommendations.

---

# 82. Accessibility + Motion Interaction

Interactive room scenes must not rely only on visual motion.

Every interactive furniture object should have an accessible alternative:

- keyboard access
- accessible label
- clear focus state
- readable product information

Motion should not be required to understand product identity.

---

# 83. Performance Acceptance Criteria

A page is not considered complete if:

- 3D blocks rendering
- images cause major layout shift
- animations delay interaction
- scrolling becomes unstable
- checkout is affected by decorative effects
- mobile performance becomes unacceptable

---

# 84. Security Acceptance Criteria

Before production:

- secrets are server-side
- admin routes are protected
- payment operations are secured
- authenticated operations are authorized
- user data is protected
- sensitive errors are not exposed

---

# 85. Quality Bar

Every major page should be evaluated against:

### Brand

Does it feel like Veloura?

### Furniture

Is furniture the visual/content focus?

### Intelligence

Does the experience make discovery smarter?

### Space

Does room context improve understanding?

### Commerce

Can the user actually purchase?

### Motion

Does animation improve the experience?

### Performance

Does the experience remain fast?

### Accessibility

Can all users operate it?

---

# 86. Definition of Done — Design

A page is visually complete when:

- Design Tokens are used
- Typography hierarchy is correct
- Spacing feels editorial
- Images are high quality
- Product hierarchy is clear
- Mobile adaptation is intentional
- Motion is restrained
- Focus states exist
- No random visual values are introduced

---

# 87. Definition of Done — Room Experience

A room experience is complete when:

- Room scene renders
- Individual furniture is identifiable
- Furniture can be selected
- Product information appears
- Product route works
- Product media exists
- Add to wishlist works
- Add to cart works
- Keyboard accessibility works
- Mobile fallback works
- Performance remains acceptable

---

# 88. Definition of Done — Ecommerce

Commerce is complete when:

- Product catalog works
- Variants work
- Search works
- Filters work
- Wishlist works
- Cart works
- Checkout works
- Payment provider integration exists
- Orders are created
- Tracking state exists
- Inventory updates work
- Reviews work
- Coupons work
- Accounts work
- Returns/refunds flow exists
- Shipping flow exists

---

# 89. Definition of Done — AI

AI is complete when:

- Natural-language search works
- Intent is interpreted
- Product discovery uses structured product data
- AI assistant can answer product questions
- Recommendations use relevant context
- Room context can influence recommendations
- AI UI remains visually native to Veloura
- AI failures degrade gracefully

---

# 90. Definition of Done — Animation

Animation is complete when:

- GSAP is used as the primary animation engine
- Lenis provides smooth scrolling
- ScrollTrigger integration is stable
- Animations are reusable
- Reduced-motion mode works
- Mobile motion is appropriate
- No blocking animation affects commerce
- 3D is progressive and optional where necessary

---

# 91. Definition of Done — Asset Integration

Assets are complete when:

- Gemini assets are reviewed
- Correct assets are selected
- Files are renamed consistently
- Assets are copied into repository structure
- Room assets are mapped
- Product assets are mapped
- Editorial assets are mapped
- Collages are never treated as products
- Product IDs/media relationships are established

---

# 92. Core Non-Negotiables

1. Veloura is not generic furniture ecommerce.
2. Furniture Intelligence remains central.
3. Production ecommerce is required.
4. Room-based discovery remains central.
5. Living Room, Bedroom, Dining, Office are the primary rooms.
6. Gemini collages are visual inspiration only.
7. A collage is not a sellable product.
8. Category clicks reveal individual products.
9. Personal Gemini asset storage is separate from the main repo.
10. Modern Furniture Website Design remains the current reference direction.
11. Previous rejected design direction must not return.
12. Warm premium furniture visual language remains.
13. AI must feel like furniture/design intelligence.
14. GSAP is the primary animation engine.
15. Lenis is the smooth scrolling engine.
16. 3D is a selective immersive layer.
17. Motion must remain restrained.
18. Mobile is intentionally designed.
19. Accessibility is mandatory.
20. Performance is mandatory.
21. Payments must use proper service architecture.
22. Secrets must never be exposed client-side.
23. CMS/admin must control everyday business content.
24. Room-to-product relationships must be data-driven.
25. Design Tokens are the source of truth.

---

# 93. Master Product Definition

> **Veloura Living is a premium Furniture Intelligence + Commerce Platform that combines room-based discovery, immersive interactive furniture experiences, AI-powered search/recommendations/assistance, personalized furniture discovery, and production-grade ecommerce — presented through a warm, modern, editorial furniture experience.**

---

# 94. Implementation Principle

The implementation should always follow:

```text
Design System
      ↓
Reusable Components
      ↓
Feature Modules
      ↓
Page Composition
      ↓
Room Intelligence
      ↓
Commerce
      ↓
AI
      ↓
Analytics
```

Do not build isolated pages first and attempt to connect them later.

The room, product, AI, commerce, CMS, and analytics systems must be designed as one connected platform.

---

# 95. Final PRD Acceptance Checklist

## Product

- [ ] Furniture Intelligence defined
- [ ] Commerce defined
- [ ] Room discovery defined
- [ ] AI discovery defined
- [ ] Interactive rooms defined
- [ ] Product storytelling defined

## Rooms

- [ ] Living Room
- [ ] Bedroom
- [ ] Dining
- [ ] Office
- [ ] Room-to-product mapping
- [ ] Collage/product distinction

## Commerce

- [ ] Catalog
- [ ] Variants
- [ ] Search
- [ ] Filters
- [ ] Wishlist
- [ ] Cart
- [ ] Checkout
- [ ] Payments
- [ ] Orders
- [ ] Tracking
- [ ] Inventory
- [ ] Reviews
- [ ] Coupons
- [ ] Accounts
- [ ] Returns
- [ ] Shipping
- [ ] Notifications

## Intelligence

- [ ] AI Search
- [ ] AI Assistant
- [ ] Recommendations
- [ ] Personalization
- [ ] Complete the Room
- [ ] Product-content intelligence

## Experience

- [ ] GSAP
- [ ] Lenis
- [ ] ScrollTrigger integration
- [ ] Selective 3D
- [ ] Reduced motion
- [ ] Responsive motion
- [ ] Accessibility
- [ ] Performance

## Content

- [ ] CMS
- [ ] Journal
- [ ] Collections
- [ ] Room stories
- [ ] Product stories

## Technical

- [ ] Scalable architecture
- [ ] Data model
- [ ] Service separation
- [ ] Secure payments
- [ ] Admin
- [ ] Analytics
- [ ] SEO
- [ ] Asset mapping

---

# End of Veloura Living Complete PRD
