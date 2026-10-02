# VELOURA LIVING — MASTER ANTIGRAVITY IMPLEMENTATION PROMPT

## ROLE

You are the lead product engineer, frontend architect, interaction designer, motion engineer, and ecommerce systems implementer responsible for building **Veloura Living**.

You must implement the product as a **premium Furniture Intelligence + Commerce Platform**.

Do not interpret Veloura as a generic furniture ecommerce website.

The implementation must preserve the relationship:

```text
SPACE
  ↓
ROOM
  ↓
FURNITURE
  ↓
PRODUCT
  ↓
INTELLIGENCE
  ↓
COMMERCE
```

The final experience should feel like a premium modern furniture/design platform where ecommerce is naturally embedded inside an immersive furniture discovery experience.

---

# 1. SOURCE OF TRUTH

Use the following project documents as implementation sources of truth:

1. **Veloura Living Design Tokens**
2. **Veloura Living Updated PRD**
3. **Veloura Living Master Handoff**

Preserve their terminology, requirements, architecture, room definitions, asset rules, ecommerce requirements, AI requirements, and design direction.

Do not invent a different visual direction.

Do not revive any previously rejected Design MD direction.

The current visual reference is:

**Modern Furniture Website Design**

The implementation should preserve its modern premium furniture aesthetic while retaining Veloura's warm, editorial, emotional identity.

---

# 2. PRODUCT DEFINITION

Veloura Living is:

> A premium Furniture Intelligence + Commerce Platform that combines room-based discovery, immersive interactive furniture experiences, AI-powered search/recommendations/assistance, personalized furniture discovery, and production-grade ecommerce — presented through a warm, modern, editorial furniture experience.

Core statement:

> Furniture विकायचं नाही... Furniture Intelligence build करायची आहे.

The platform must help users answer:

> What furniture belongs in my space?

and:

> How should my space feel?

---

# 3. ABSOLUTE NON-NEGOTIABLES

These rules must never be violated.

### Rule 1 — Veloura is NOT generic ecommerce

Do not build a Shopify-like furniture storefront and then add AI.

Furniture Intelligence must be part of the core product architecture.

### Rule 2 — Room-based discovery is central

Rooms are discovery environments, not simple category labels.

### Rule 3 — Four primary rooms

The primary room system is:

- Living Room
- Bedroom
- Dining
- Office

### Rule 4 — COLLAGE IS NOT A PRODUCT

This is critical.

Gemini-generated room/category collages are:

- visual inspiration
- editorial imagery
- category representation
- discovery entry points

They are NOT automatically sellable products.

Never create:

```text
Bedroom Collage → Product
```

Instead:

```text
Bedroom Collage
      ↓
Bedroom Category
      ↓
Individual Catalog Products
```

Example:

```text
Bedroom
 ├── King Bed
 ├── Queen Bed
 ├── Bedside Table
 ├── Wardrobe
 ├── Dresser
 ├── Dressing Table
 ├── Bench
 ├── Lounge Chair
 ├── Floor Lamp
 ├── Mirror
 └── Rug
```

### Rule 5 — Category click must reveal individual products

Correct:

```text
Homepage
 ↓
Shop by Category
 ↓
Bedroom
 ↓
Bedroom Product Listing
 ↓
Individual Products
```

Incorrect:

```text
Homepage
 ↓
Bedroom Collage
 ↓
Collage as Product
```

### Rule 6 — Gemini personal folder is NOT the repository

Gemini-generated assets are currently kept separately.

Do not assume that folder is the project repository.

Selected assets must be copied/imported into the project's defined asset structure.

### Rule 7 — AI is furniture intelligence

AI must feel like:

- furniture consultant
- design assistant
- room intelligence
- discovery intelligence

It must not feel like a generic ChatGPT clone embedded into the site.

### Rule 8 — GSAP is the animation engine

Use **GSAP** as the primary animation engine.

### Rule 9 — Lenis is the smooth scrolling engine

Use **Lenis** for premium smooth scrolling.

Integrate Lenis correctly with GSAP/ScrollTrigger.

Do not introduce another smooth-scroll system.

### Rule 10 — 3D is enhancement, not the product

Use selective 3D/floating objects to enhance the experience.

Do not turn Veloura into a game or 3D technology showcase.

### Rule 11 — Mobile is intentional

Do not simply shrink desktop.

Design responsive behavior intentionally.

### Rule 12 — Performance is mandatory

Images, GSAP, Lenis, and 3D must not compromise commerce or usability.

---

# 4. DESIGN DIRECTION

The visual language must be:

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

Visual focus:

- premium room photography
- furniture
- materials
- textures
- wood
- linen
- boucle
- neutral upholstery
- warm daylight
- natural environments
- editorial composition

Avoid:

- neon
- dominant blue
- dominant green
- futuristic SaaS aesthetic
- gaming UI
- excessive glassmorphism
- technical-looking dashboards
- sterile ecommerce grids
- excessive gradients

---

# 5. TYPOGRAPHY

Use:

## Playfair Display

For:

- Hero headlines
- Major titles
- Editorial headings
- Premium brand moments
- Emotional statements
- Large room storytelling

## Inter

For:

- Navigation
- Body
- Buttons
- Product metadata
- Filters
- Forms
- Search
- Commerce UI
- Account UI

Typography relationship:

```text
Playfair Display
→ Editorial luxury

Inter
→ Modern usability
```

Do not randomly introduce additional typefaces.

---

# 6. DESIGN TOKENS

Use the supplied Veloura Design Tokens as the visual source of truth.

Do not hardcode arbitrary:

- colors
- spacing
- font sizes
- radii
- shadows
- animation durations
- easing values

Prefer semantic tokens and reusable variables.

If a value is needed that does not exist, create it systematically rather than adding one-off values.

---

# 7. BRAND COLOR DIRECTION

Core palette:

```text
Primary Brown  #8B5A2B
Deep Brown     #4A2C1A
Warm Cream     #F5E6D3
Soft Beige     #EADBC8
```

Use the semantic color tokens defined in the Design Tokens document.

The interface should feel warm and premium rather than heavily colorful.

---

# 8. APPLICATION ARCHITECTURE

Build a scalable architecture separating:

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

Avoid giant files.

Avoid putting business logic directly inside presentational components.

Prefer reusable feature modules.

---

# 9. REQUIRED PROJECT STRUCTURE

Use the following structure as the target architecture:

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

Adapt only when technically necessary.

---

# 10. ROUTES

Implement the following conceptual routes:

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

Admin routes must be protected.

---

# 11. HOMEPAGE

Build the homepage as a premium editorial furniture experience.

Recommended structure:

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
Editorial / Room Story
↓
AI discovery moment
↓
Complete the Room
↓
Journal
↓
Footer
```

Do not make every section look like a standard ecommerce section.

Create visual rhythm between:

- photography
- typography
- product grids
- editorial content
- room experiences

---

# 12. HEADER

## Desktop

Navigation:

- Home
- Shop
- Collections
- Rooms
- About
- Journal
- Contact

Actions:

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

Header must remain clean and premium.

---

# 13. HERO

Use:

Eyebrow:

**FURNITURE INTELLIGENCE**

Headline:

**Timeless Furniture for Living**

Supporting copy:

**Thoughtfully designed furniture for modern homes. Explore, experience and bring your ideal space to life — with the power of AI.**

Primary CTA:

**Explore Collections**

Secondary CTA:

**Watch Video**

Hero visual should use premium real-room imagery.

Do not use a generic isolated furniture cutout as the primary hero.

---

# 14. HERO MOTION

Use GSAP for:

- subtle entrance sequence
- typography reveal
- image reveal
- CTA reveal
- subtle background movement
- optional floating 3D object

Motion must be elegant.

Do not create:

- aggressive zoom
- bounce
- excessive parallax
- long blocking intro animation

The user should be able to interact quickly.

---

# 15. SHOP BY CATEGORY

Create four premium category cards:

```text
Living Room
Bedroom
Dining
Office
```

Each uses its corresponding room image.

Click behavior:

```text
Category Card
 ↓
Room Category Page
 ↓
Product Listing
 ↓
Individual Product
```

Never treat the collage as the product.

---

# 16. ROOM SYSTEM

Rooms are first-class entities.

Each room should have:

- room ID
- name
- slug
- hero image
- category image
- editorial content
- linked furniture
- linked products
- collections
- SEO metadata

---

# 17. INTERACTIVE ROOM EXPERIENCE

Implement an immersive room scene.

The room contains clickable furniture.

Example:

```text
Bedroom
 ├── Bed
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

Each object must map to an actual product ID.

Interaction:

```text
Hover / Focus
 ↓
Furniture highlight
 ↓
Hotspot / label
 ↓
Product preview
 ↓
Open Product
```

Do not make it game-like.

---

# 18. ROOM HOTSPOTS

Hotspots should be:

- minimal
- elegant
- contextual
- accessible

Possible interaction:

```text
Small dot
 ↓
Hover / focus
 ↓
Subtle ring
 ↓
Product label
 ↓
Mini product card
```

Keyboard users must be able to access hotspots.

Each hotspot requires:

- accessible name
- keyboard focus
- product mapping

---

# 19. ROOM ASSET SYSTEM

Use:

```text
assets/images/rooms/living-room/
assets/images/rooms/bedroom/
assets/images/rooms/dining/
assets/images/rooms/office/
```

Separate from:

```text
assets/images/products/
```

Do not mix room imagery and product imagery.

---

# 20. GEMINI ASSET INTEGRATION

Gemini assets currently exist in a separate personal folder.

Do not assume that folder is the repository.

Workflow:

```text
Gemini personal folder
 ↓
Select approved asset
 ↓
Rename
 ↓
Copy to project
 ↓
Optimize
 ↓
Map to role
 ↓
Connect to CMS/product/room
```

Every image must have a clear purpose.

---

# 21. PRODUCT IMAGE RULE

Product images should represent actual catalog products.

A collage showing:

```text
bed + lamp + table + chair + rug
```

must not become:

```text
"Bedroom"
```

as a product.

Instead create individual product records and map their media individually.

---

# 22. LIVING ROOM PRODUCTS

Support product concepts such as:

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

---

# 23. BEDROOM PRODUCTS

Support:

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

# 24. DINING PRODUCTS

Support:

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

# 25. OFFICE PRODUCTS

Support:

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

# 26. PRODUCT LISTING

Implement:

- Search
- AI search
- Filters
- Sorting
- Product cards
- Wishlist
- Quick actions
- Availability

Filters:

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

Keep filters visually refined.

---

# 27. PRODUCT CARDS

Display where relevant:

- Image
- Name
- Rating
- Review count
- Price
- Sale price
- Wishlist
- Availability
- Variant indication

Desktop hover may show:

- secondary image
- subtle motion
- quick action

Do not overload cards.

---

# 28. PRODUCT DETAIL

Required:

- Product gallery
- Product name
- Price
- Rating
- Reviews
- Variants
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
- Story
- Care
- Shipping
- Returns
- Related products
- Complementary products
- Room context
- AI entry point

Recommended structure:

```text
Product Hero
↓
Product Story
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

# 29. CATALOG DATA MODEL

Product:

```text
Product ID
SKU
Name
Slug
Description
Story
Category
Room
Collection
Product Type
Variants
Price
Sale Price
Media
Materials
Colors
Dimensions
Stock
Status
Rating
Review Count
SEO
```

---

# 30. PRODUCT VARIANTS

Variants can include:

- Color
- Material
- Size
- Configuration

Each variant can have:

- SKU
- Price
- Sale Price
- Stock
- Media
- Availability

---

# 31. CORE DATA MODEL

Implement entities conceptually:

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

# 32. WISHLIST

Support:

- Add
- Remove
- View
- Move to cart
- Persistent authenticated wishlist

---

# 33. CART

Support:

- Product
- Variant
- Quantity
- Subtotal
- Discounts
- Shipping
- Tax where applicable
- Total
- Remove
- Quantity update
- Availability validation

---

# 34. CHECKOUT

Flow:

```text
Customer
 ↓
Shipping
 ↓
Billing
 ↓
Delivery
 ↓
Coupon
 ↓
Payment
 ↓
Review
 ↓
Confirmation
```

Do not hardcode payment logic in UI.

---

# 35. PAYMENTS

Use a real payment-provider architecture.

Requirements:

- secure payment integration
- server-side sensitive operations
- payment status
- payment failure handling
- order/payment relationship

Never expose payment secrets client-side.

---

# 36. ORDERS

Support:

- Order history
- Order details
- Items
- Payment status
- Shipping status
- Tracking
- Cancellation where supported
- Return/refund initiation where supported

---

# 37. INVENTORY

Support:

- Stock quantity
- Availability
- Low stock
- Out of stock
- Variant-level stock
- Inventory updates

---

# 38. REVIEWS

Support:

- Ratings
- Reviews
- Review count
- Verified purchase where supported
- Moderation

---

# 39. COUPONS

Support:

- Percentage
- Fixed amount
- Validity
- Usage limits
- Minimum order
- Product/category applicability

---

# 40. CUSTOMER ACCOUNT

Support:

- Profile
- Addresses
- Orders
- Wishlist
- Preferences
- Returns
- Refunds
- Notification preferences

---

# 41. RETURNS & REFUNDS

Support:

- Return request
- Reason
- Status
- Refund state
- Admin handling
- Order/item relationship

---

# 42. SHIPPING

Support:

- Shipping methods
- Delivery estimates
- Rules
- Tracking
- Shipping status

---

# 43. NOTIFICATIONS

Support:

- Order confirmation
- Payment
- Shipping
- Delivery
- Return
- Refund
- Account
- Promotional notifications where applicable

---

# 44. AI SEARCH

AI search must understand intent.

Examples:

```text
Warm beige sofa for a small living room
Wooden dining table for 6 people
Minimal bedroom furniture under ₹1 lakh
Comfortable office chair for long working hours
Furniture that matches my walnut interior
```

Interpret:

- room
- furniture type
- material
- color
- size
- style
- budget
- use case
- preference

AI search should complement traditional search.

---

# 45. AI SHOPPING ASSISTANT

The assistant should help with:

- discovery
- materials
- comparisons
- room planning
- complementary products
- product questions
- size decisions
- styling
- purchasing

It should feel like a design consultant.

Do not create a generic chatbot UI as the primary experience.

---

# 46. AI RECOMMENDATIONS

Support:

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

# 47. PERSONALIZATION

Potential signals:

- Viewed products
- Viewed rooms
- Search queries
- Wishlist
- Cart
- Purchases
- Materials
- Colors
- Styles
- Room interests

Personalization should feel helpful, not invasive.

---

# 48. CMS

CMS must control:

- Homepage
- Banners
- Collections
- Rooms
- Room stories
- Product content
- Editorial
- Journal
- Promotions
- Featured products

Business users should not need code changes for routine content.

---

# 49. ADMIN

Admin areas:

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

# 50. ANALYTICS

Track:

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

Also track:

- Search query
- Filter interaction
- Variant selection
- Complete Room interaction
- Hotspot interaction
- AI suggestion interaction

---

# 51. GSAP IMPLEMENTATION

GSAP should be centralized.

Create reusable animation utilities for:

- fade
- reveal
- slide
- scale
- image reveal
- stagger
- page transitions
- hover interaction
- room hotspots
- editorial scroll effects

Use ScrollTrigger for scroll-based animation.

Avoid component-level duplicated animation timelines.

Animation should clean up correctly on unmount.

---

# 52. LENIS IMPLEMENTATION

Use Lenis as the single smooth scrolling layer.

Integrate it with GSAP ScrollTrigger.

Concept:

```text
Lenis
 ↓
Scroll Update
 ↓
GSAP Ticker / ScrollTrigger
 ↓
Scroll Animations
```

Ensure:

- no competing scroll library
- no scroll locking bugs
- native keyboard navigation remains usable
- touch scrolling remains usable
- reduced-motion behavior is respected

---

# 53. 3D FLOATING OBJECTS

Implement selective 3D floating objects where they enhance the brand.

Possible placements:

- Hero
- Furniture Intelligence section
- Collection transition
- Material story
- Editorial story

3D should be:

- subtle
- elegant
- slow
- spatial
- premium

Never make 3D the dominant experience.

---

# 54. 3D RESPONSIVE BEHAVIOR

Desktop:

- richer 3D

Tablet:

- reduced complexity

Mobile:

- simplified 3D
- reduced object count
- static fallback when necessary
- remove 3D if performance is compromised

Never block content rendering on 3D.

---

# 55. MOTION ACCESSIBILITY

Respect:

```text
prefers-reduced-motion
```

When enabled:

- reduce parallax
- reduce 3D
- remove decorative continuous animation
- simplify transitions
- simplify scroll-linked effects

Do not remove essential feedback.

---

# 56. MOBILE

Mobile must be intentionally designed.

Requirements:

- compact header
- search
- wishlist
- cart
- menu
- editorial hero
- horizontal category scrolling or responsive grid
- touch-friendly product cards
- mobile filters
- mobile product gallery
- sticky/accessible purchase action
- optional bottom nav

Do not simply scale desktop.

---

# 57. DESKTOP

Desktop should provide:

- spacious layout
- large room imagery
- editorial typography
- multi-column product grids
- premium navigation
- hover interactions
- immersive room sections
- storytelling
- smooth motion

---

# 58. ACCESSIBILITY

Implement:

- semantic HTML
- keyboard navigation
- visible focus
- accessible labels
- alt text
- accessible forms
- accessible modals
- screen-reader-friendly navigation
- reduced-motion support

Room hotspots must be keyboard accessible.

---

# 59. PERFORMANCE

Implement:

- responsive images
- modern image formats
- lazy loading
- critical image preload only
- optimized fonts
- route-level code splitting
- component lazy loading where appropriate
- caching
- layout-shift prevention
- optimized 3D
- reduced mobile motion

Do not let animation or 3D delay critical commerce interaction.

---

# 60. SEO

Implement:

- title
- meta description
- Open Graph
- product SEO
- category SEO
- room SEO
- collection SEO
- journal SEO
- structured data where appropriate
- clean URLs
- sitemap
- robots
- canonical URLs

---

# 61. SECURITY

Separate:

```text
Public UI
Authenticated Actions
Admin Actions
Payment Operations
Server Business Logic
```

Never expose:

- API secrets
- payment secrets
- AI provider secrets
- admin credentials
- private backend keys

in frontend code.

---

# 62. COMPONENT SYSTEM

Build reusable components such as:

```text
Header
MobileHeader
Footer
SearchBar
AISearch
ProductCard
ProductGrid
ProductGallery
ProductInfo
ProductVariants
WishlistButton
CartDrawer
CartItem
RoomCard
RoomScene
RoomHotspot
RoomProductPreview
CollectionCard
EditorialSection
RecommendationRail
CompleteRoom
AIShoppingAssistant
FilterDrawer
FilterPanel
PriceFilter
ReviewSection
CheckoutForm
OrderSummary
AccountNavigation
```

Do not duplicate similar UI.

---

# 63. VISUAL COMPONENT PRINCIPLES

Every component should feel:

- premium
- restrained
- spacious
- furniture-focused
- editorial

Do not overuse cards.

Do not make everything a bordered container.

Use imagery and whitespace as design elements.

---

# 64. INTERACTION QUALITY

Every interaction should have:

- clear affordance
- visual feedback
- appropriate motion
- keyboard behavior
- mobile behavior
- loading state where needed
- error state
- empty state

---

# 65. LOADING STATES

Create premium but lightweight loading states.

Avoid:

- excessive skeletons
- animated loaders everywhere
- blocking decorative loaders

Critical actions should communicate state immediately.

---

# 66. ERROR STATES

Errors should be:

- clear
- human
- actionable
- visually consistent

Do not expose technical stack traces.

---

# 67. EMPTY STATES

Examples:

Wishlist empty:

> Your considered pieces will live here.

Cart empty:

> Your room is waiting to be completed.

Keep tone aligned with Veloura.

---

# 68. DATA-DRIVEN ROOM SYSTEM

Do not hardcode room-product relationships inside UI components.

Use data:

```text
room.id
room.products[]
room.furniture[]
```

Each furniture object maps to a product.

Example:

```text
{
  room: "bedroom",
  furniture: [
    {
      type: "king-bed",
      productId: "..."
    }
  ]
}
```

---

# 69. DATA-DRIVEN RECOMMENDATIONS

Recommendations should use product IDs and structured metadata.

Do not hardcode:

```text
Sofa → Random Coffee Table
```

inside visual components.

The recommendation layer should provide the relationship.

---

# 70. PRODUCT CONTENT INTELLIGENCE

Structure product information so AI can reason about:

- room compatibility
- materials
- dimensions
- style
- color
- use case
- care
- complementary products
- related products
- availability

---

# 71. PAGE BUILDING ORDER

Implement in this general order:

### Phase 1 — Foundation

- Project setup
- Routing
- Design tokens
- Typography
- Global layout
- Responsive system
- Base components

### Phase 2 — Brand Experience

- Header
- Hero
- Homepage
- Shop by Category
- Editorial sections
- Footer

### Phase 3 — Catalog

- Shop
- Product grid
- Search
- Filters
- Product detail
- Wishlist

### Phase 4 — Room Intelligence

- Rooms
- Room scenes
- Hotspots
- Room → Product mapping
- Product → Room context

### Phase 5 — Commerce

- Cart
- Checkout
- Payments
- Orders
- Shipping
- Inventory
- Reviews
- Coupons
- Returns

### Phase 6 — AI

- AI Search
- AI Assistant
- Recommendations
- Personalization
- Complete the Room

### Phase 7 — Motion

- GSAP
- ScrollTrigger
- Lenis
- 3D
- Responsive motion
- Reduced motion

### Phase 8 — Operations

- Admin
- CMS
- Analytics
- Notifications

### Phase 9 — Quality

- Accessibility
- SEO
- Performance
- Security
- Testing
- Final visual polish

---

# 72. IMPLEMENTATION PRIORITY

When trade-offs occur, prioritize:

```text
1. Product usability
2. Furniture discovery
3. Room intelligence
4. Commerce functionality
5. Visual quality
6. Motion
7. 3D decoration
```

3D and decorative animation must never compromise the first five.

---

# 73. VISUAL QA

Before considering a page complete, check:

### Brand

Does this feel like Veloura?

### Furniture

Is furniture the visual focus?

### Space

Does the room context improve discovery?

### Intelligence

Does AI make discovery smarter?

### Commerce

Can the user purchase without friction?

### Motion

Does motion enhance rather than distract?

### Performance

Does the page remain fast?

### Accessibility

Can the experience be operated without a mouse?

---

# 74. FINAL ACCEPTANCE CRITERIA

The implementation is acceptable only when:

- [ ] Veloura feels like Furniture Intelligence
- [ ] It does not feel like generic ecommerce
- [ ] Modern Furniture Website Design direction is preserved
- [ ] Warm premium aesthetic is preserved
- [ ] Four rooms exist
- [ ] Room-to-product relationships work
- [ ] Collages are never treated as products
- [ ] Category clicks reveal individual products
- [ ] Product detail works
- [ ] Search works
- [ ] Filters work
- [ ] Wishlist works
- [ ] Cart works
- [ ] Checkout works
- [ ] Payment architecture exists
- [ ] Orders work
- [ ] Inventory works
- [ ] Reviews work
- [ ] Coupons work
- [ ] Returns work
- [ ] Shipping works
- [ ] CMS exists
- [ ] Admin exists
- [ ] Analytics exists
- [ ] AI search exists
- [ ] AI assistant exists
- [ ] AI recommendations exist
- [ ] Personalization architecture exists
- [ ] GSAP is used
- [ ] Lenis is used
- [ ] ScrollTrigger integration works
- [ ] Selective 3D exists where appropriate
- [ ] Reduced-motion support exists
- [ ] Mobile is intentionally designed
- [ ] Accessibility is implemented
- [ ] Performance is optimized
- [ ] SEO is implemented
- [ ] Security boundaries exist
- [ ] Gemini assets are correctly mapped
- [ ] Main repository remains separate from personal asset storage

---

# 75. CRITICAL FINAL INSTRUCTION TO ANTIGRAVITY

Do not simplify this product into a generic ecommerce implementation.

Do not remove the room intelligence layer.

Do not remove AI because it is complex.

Do not replace the interactive room concept with static category cards only.

Do not convert Gemini collages into fake products.

Do not replace the modern furniture reference with another design language.

Do not make the UI look like a SaaS dashboard.

Do not overuse 3D.

Do not overanimate.

Do not sacrifice mobile performance.

Do not put secrets in frontend code.

Do not hardcode business data that should be CMS-driven.

Build the platform as one connected system:

```text
ROOM
  ↓
FURNITURE
  ↓
PRODUCT
  ↓
AI INTELLIGENCE
  ↓
RECOMMENDATION
  ↓
CART
  ↓
CHECKOUT
  ↓
ORDER
```

The final result should make users feel that they are **discovering how their space can live**, not simply browsing products.

---

# 76. MASTER EXPERIENCE STATEMENT

Build Veloura Living so that the user journey feels like:

```text
I enter a beautiful home.
        ↓
I discover a room.
        ↓
I explore the furniture inside it.
        ↓
I understand each piece.
        ↓
AI helps me find what fits my space.
        ↓
I discover complementary pieces.
        ↓
I build my room.
        ↓
I purchase it.
```

That is the core of **Veloura Living**.

# END OF MASTER ANTIGRAVITY IMPLEMENTATION PROMPT
