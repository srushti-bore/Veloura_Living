# Veloura Living — Final Redesign & Motion Design Specification
## Antigravity Implementation Prompt
### Premium Furniture Intelligence + Immersive Ecommerce Experience

---

## 0. EXECUTION DIRECTIVE

Redesign and refine the existing Veloura Living frontend into a premium, cinematic, modern furniture ecommerce experience.

**Do not rebuild the project from scratch.** Preserve the existing business logic, routes, data structures, product data, room data, components, commerce flows, and working functionality wherever possible. Upgrade the visual system, interaction system, motion system, typography, responsive behavior, and perceived premium quality.

The final experience must feel like:

> **A premium furniture brand + an immersive spatial experience + a modern ecommerce platform.**

The website must not feel like a generic ecommerce template.

### Critical motion requirement

The Dribbble reference:

**Wine Website Parallax Animation**  
https://dribbble.com/shots/14855742-Wine-Website-Parallax-Animation

is a **motion-behavior reference**, not merely a request for generic parallax.

Do NOT implement this as:

- a static page with background parallax
- a simple image moving slower than content
- isolated fade-up animations
- basic scroll reveal
- random 3D objects floating independently

Instead, implement a **scene-to-scene scroll choreography** inspired by the reference.

The viewport should behave like a stage. While the user scrolls, the current scene becomes pinned and its individual elements continuously rearrange into the next composition.

Elements must independently transition through combinations of:

- x/y movement
- scale
- rotation
- opacity
- clipping
- masking
- size changes
- depth/layer changes
- z-index changes
- blur where appropriate
- image crop changes
- text position changes
- text scale changes
- element overlap
- element-to-element transitions
- staggered timing
- 3D depth
- scene-to-scene composition changes

The goal is **95%+ similarity in motion behavior and interaction structure** to the referenced parallax choreography, while using original Veloura Living content, furniture, typography, colors, and compositions.

Do not copy the reference site's visual assets or branding.

---

# 1. BRAND & EXPERIENCE DIRECTION

## Brand

**Veloura Living**

## Positioning

> Furniture Intelligence + Immersive Furniture Commerce

Veloura is not simply an online furniture catalogue.

The experience should communicate:

**Space → Design → Emotion → Discovery → Product → Purchase**

The visitor should feel that they are exploring designed spaces rather than browsing a database of products.

---

# 2. VISUAL DIRECTION

Use the existing Veloura Living identity and the supplied logo as the foundation.

Overall aesthetic:

- Quiet luxury
- Warm architectural minimalism
- Premium furniture editorial
- Contemporary ecommerce
- Cinematic interiors
- Rich natural materials
- Restrained but sophisticated motion
- Large imagery
- Generous whitespace
- Strong typography hierarchy
- Subtle depth
- Sophisticated micro-interactions

Avoid:

- cheap-looking gradients
- excessive glassmorphism
- neon UI
- generic SaaS cards
- overly rounded ecommerce components
- excessive shadows
- excessive animation
- random 3D decoration
- cluttered layouts
- template-like design

---

# 3. COLOR SYSTEM

Derive the visual palette from the Veloura Living logo and existing premium brown identity.

Use these tokens as the primary palette:

```text
Espresso      #2A1A12
Deep Walnut   #4A2C1A
Walnut        #765236
Caramel       #A9794F
Sand          #D8B486
Cream         #F4E8D7
Ivory         #FAF7F2
Taupe         #B9AA99
Charcoal      #211915
```

### Usage

- Espresso: primary dark sections, premium navigation states
- Deep Walnut: headings, strong UI elements
- Walnut: secondary accents
- Caramel: interactive accent
- Sand: soft highlights
- Cream: warm surfaces
- Ivory: primary page background
- Taupe: secondary text/borders
- Charcoal: primary body text

Do not use every color simultaneously.

Maintain a restrained luxury palette.

---

# 4. TYPOGRAPHY

Replace the current generic typography with a premium ecommerce-friendly pairing.

## Display / Editorial

**Cormorant Garamond**

Use for:

- hero statements
- large editorial headings
- collection titles
- room storytelling
- major section statements
- premium product storytelling

## UI / Ecommerce

**DM Sans**

Use for:

- navigation
- product names
- prices
- buttons
- filters
- search
- forms
- account
- cart
- checkout
- metadata
- labels

Typography must remain highly readable and functional.

Do not use the display font for dense ecommerce UI.

---

# 5. GLOBAL LAYOUT PRINCIPLES

Use:

- large visual compositions
- strong horizontal rhythm
- asymmetric editorial layouts
- controlled whitespace
- full-width imagery
- large type
- layered compositions
- subtle overlapping elements
- premium product cards
- responsive grid systems

Avoid forcing every section into a conventional centered container.

Some sections should intentionally use:

- edge-to-edge imagery
- offset columns
- floating cards
- overlapping furniture
- asymmetrical text
- large negative space

---

# 6. HEADER

Redesign the header as a premium minimal navigation system.

Desktop:

```text
VEL OURA / LOGO

Rooms    Shop    Collections    Journal

                     Search   ♡   Bag
```

Requirements:

- transparent over hero initially
- transitions into an elevated/light surface when scrolling
- smooth color transition
- subtle blur only when necessary
- compact sticky state
- animated menu states
- elegant hover underline/indicator
- icon micro-interactions
- cart count animation
- search activation animation

Mobile:

- logo
- menu button
- bag
- expandable full-screen navigation

The header must participate in the overall motion language.

---

# 7. HERO — CINEMATIC SCROLL STAGE

The hero is the first major motion sequence.

Do not make it a conventional hero with one static image.

Use the existing day/night hero sequence assets where applicable.

The hero should feel like an immersive spatial introduction.

## Hero structure

Layer the scene:

```text
Background Interior
        ↓
Furniture
        ↓
Atmospheric Layer
        ↓
Floating Object / Product Detail
        ↓
Editorial Text
        ↓
CTA
        ↓
Scroll Indicator
```

## Scroll behavior

The hero should be pinned for a controlled scroll distance.

As the user scrolls:

1. camera/scene scale changes
2. furniture moves at different depths
3. background shifts
4. foreground furniture moves independently
5. typography enters/leaves through controlled movement
6. product/object layers rotate subtly
7. image crop changes
8. text composition rearranges
9. next scene begins forming before current scene completely disappears

The transition must feel continuous.

---

# 8. CRITICAL: SCENE-TO-SCENE PARALLAX CHOREOGRAPHY

This is the most important requirement of the entire redesign.

The website must reproduce the **behavioral concept** of the referenced Wine Website Parallax Animation.

## Core principle

The page is not a collection of independent sections.

It is a sequence of visual compositions.

Example:

```text
SCENE 01
Living Room
        ↓ scroll
Furniture shifts
        ↓
Text moves
        ↓
Lamp rotates
        ↓
Chair scales
        ↓
Image crops
        ↓
Product card enters
        ↓
Layers cross each other
        ↓
SCENE 02
New Living Room Composition
```

Then:

```text
SCENE 02
        ↓
Furniture exits one direction
        ↓
New object enters from another direction
        ↓
Headline changes position
        ↓
Product image expands
        ↓
Decorative object rotates
        ↓
Background changes
        ↓
SCENE 03
```

The user should feel that the same visual world is continuously being rearranged.

---

# 9. PINNED SCENE SYSTEM

Implement reusable scene components.

Example architecture:

```tsx
<ScrollScene>
  <SceneBackground />
  <SceneFurniture />
  <SceneObject />
  <SceneTypography />
  <SceneProduct />
  <SceneDecoration />
</ScrollScene>
```

Each scene should expose a normalized progress value:

```text
0 → scene starts
0.25 → composition begins shifting
0.50 → major transformation
0.75 → next composition forms
1.00 → next scene complete
```

GSAP ScrollTrigger should control this progress.

The viewport should remain visually stable while internal elements transform.

---

# 10. ELEMENT-LEVEL MOTION

Every important scene element must have its own timeline.

Example:

### Chair

```text
x: 0 → -180px
y: 0 → 80px
scale: 1 → 0.82
rotation: 0 → -8deg
```

### Lamp

```text
x: 0 → 140px
y: 0 → -60px
rotation: 0 → 18deg
scale: 1 → 1.08
```

### Headline

```text
y: 60px → -40px
opacity: 0 → 1 → 0
scale: 0.96 → 1.02
```

### Product card

```text
scale: 0.8 → 1
opacity: 0 → 1
x: 120px → 0
rotation: 4deg → 0
```

These values are examples. Tune them according to the actual composition.

---

# 11. DEPTH & 3D

Create a visual depth hierarchy.

Use:

```text
Layer 0 — Background
Layer 1 — Interior architecture
Layer 2 — Furniture
Layer 3 — Decorative objects
Layer 4 — Product/UI cards
Layer 5 — Typography
Layer 6 — Foreground accents
```

Use:

- translateZ where appropriate
- perspective
- scale differences
- blur/depth cues
- overlapping
- z-index choreography

Do not turn the website into a constant 3D demo.

3D should support the furniture experience.

---

# 12. 3D FLOATING OBJECTS

Use selective Three.js / CSS 3D objects.

Suitable objects:

- chair silhouettes
- lamps
- vases
- material samples
- abstract furniture components
- small architectural forms

Objects should:

- float subtly
- respond to scroll
- rotate slowly
- react to cursor movement
- participate in scene transitions

Avoid random decorative 3D elements that do not belong to the furniture story.

---

# 13. SCROLL-DRIVEN TEXT ANIMATION

Text should not simply fade in.

Use:

- word reveals
- line reveals
- vertical movement
- clipping masks
- scale transitions
- opacity choreography
- character/word stagger where appropriate

Example:

```text
DESIGNED
FOR
LIVING
```

As the user scrolls:

```text
DESIGNED
       ↓
FOR
       ↓
LIVING
```

Then the text can compress/reposition as the next visual scene forms.

Use SplitType or GSAP-compatible text splitting only where it improves the experience.

Do not animate every word on every section.

---

# 14. SCROLL PROGRESS / LOADING FEEL

The user specifically wants scrolling to feel like a loading/transition process.

Implement a subtle progress indicator.

Possible forms:

- thin top progress line
- circular progress
- scene number
- minimal percentage
- vertical progress rail

Example:

```text
01 / 04
```

or:

```text
●──────
```

The progress indicator should feel editorial, not like a technical loading bar.

---

# 15. LENIS

Use Lenis for smooth scrolling.

Requirements:

- smooth but responsive
- no excessive lag
- compatible with GSAP ScrollTrigger
- correct RAF integration
- no scroll hijacking that breaks accessibility
- touch devices should remain natural

Integrate:

```text
Lenis
   ↓
requestAnimationFrame
   ↓
GSAP ticker
   ↓
ScrollTrigger.update()
```

Ensure there is only one authoritative smooth-scroll loop.

---

# 16. GSAP MOTION ENGINE

GSAP is the primary animation engine.

Use:

- GSAP
- ScrollTrigger
- timelines
- labels
- scrub
- pin
- stagger
- matchMedia
- context cleanup

Create reusable motion utilities rather than writing random animations inside every component.

Suggested structure:

```text
lib/animations/
├── hero.ts
├── scenes.ts
├── products.ts
├── text.ts
├── navigation.ts
├── microInteractions.ts
└── utils.ts
```

---

# 17. SCENE TRANSITION PATTERN

Use this general choreography:

```text
SCENE A
↓
Hold
↓
Element movement begins
↓
Background movement
↓
Text transition
↓
Furniture transformation
↓
Product/object transition
↓
Overlap / crossing moment
↓
New composition emerges
↓
SCENE B
```

Important:

**Do not abruptly replace Scene A with Scene B.**

Scene B should visually emerge from Scene A.

---

# 18. ROOMS EXPERIENCE

Rooms:

- Living Room
- Bedroom
- Dining
- Office

Room discovery should feel like entering designed spaces.

Each room can have:

- cinematic hero
- room story
- hotspots
- furniture discovery
- material information
- products
- editorial content
- CTA

Room transitions should use the same scene choreography system.

---

# 19. ROOM HOTSPOTS

Hotspots should feel integrated into the scene.

On hover:

- subtle scale
- ring expansion
- label reveal
- product preview
- smooth line/connection where appropriate

On click:

- product information panel
- product image
- name
- price
- material
- CTA

Do not use generic blue ecommerce hotspot dots.

---

# 20. PRODUCT CARDS

Product cards should feel premium and tactile.

Hover:

```text
image crop changes
↓
product image scales slightly
↓
wishlist icon appears
↓
quick action appears
↓
product information shifts subtly
```

Micro-interactions:

- image zoom
- cursor response
- wishlist heart animation
- add-to-cart feedback
- price transition
- quick-view panel
- subtle shadow/depth change

Do not over-animate the entire card.

---

# 21. PRODUCT DETAIL PAGE

Product detail should combine ecommerce utility with editorial storytelling.

Include:

- product gallery
- product name
- price
- variants
- materials
- dimensions
- availability
- quantity
- add to cart
- wishlist
- description
- specifications
- reviews
- related products

Motion:

- gallery transitions
- image zoom
- sticky purchase panel where appropriate
- section reveal
- material transitions
- smooth thumbnail interactions

---

# 22. 360° / PRODUCT VIEWER

If the existing implementation cycles through product images, preserve it as a fallback but improve the interaction.

If actual 360 assets exist:

- drag interaction
- inertial movement
- subtle cursor state
- mobile swipe support

Do not falsely label a multi-image carousel as a true 360 viewer.

---

# 23. SEARCH

Search must feel like a premium discovery interface.

Opening search:

```text
Header expands
↓
Page dims subtly
↓
Search field enters
↓
Suggestions appear
↓
Results update
```

Search UI should support:

- product search
- room search
- collections
- journal
- AI search where available

Use smooth result transitions.

---

# 24. AI SHOPPING ASSISTANT

Keep the existing assistant functionality but upgrade the interface.

The assistant should feel like a luxury concierge.

Use:

- elegant chat panel
- suggested questions
- product cards
- room recommendations
- material suggestions
- add-to-cart actions

Micro-interactions:

- message entrance
- typing state
- product card reveal
- CTA feedback

Do not make it visually resemble a generic support chatbot.

---

# 25. AI / INTERIOR QUIZ

Quiz experience:

```text
Question
↓
Answer selection
↓
Micro transition
↓
Next question
↓
Visual progression
↓
Result
```

Use:

- progress indicator
- smooth option selection
- image transitions
- result reveal

The final result should feel editorial and personalized.

---

# 26. SPATIAL STUDIO

Spatial Studio should feel experimental and premium.

Support the existing concept of:

- room visualization
- furniture placement
- spatial composition
- furniture selection

Use subtle:

- drag feedback
- snap feedback
- hover depth
- object placement animations
- camera movement

Three.js should be used selectively.

---

# 27. MATERIAL STUDIO

Material exploration should feel tactile.

Use:

- fabric
- wood
- leather
- stone
- finish options

Interactions:

```text
hover → material preview
click → material expands
transition → product surface changes where supported
```

Use soft lighting and subtle motion.

---

# 28. COLLECTIONS

Collections should use editorial storytelling.

Each collection should have:

- hero visual
- collection statement
- furniture composition
- product discovery
- editorial copy
- CTA

Collection transitions can use scene-to-scene choreography.

---

# 29. JOURNAL

Journal should feel like a premium interior design publication.

Use:

- large feature image
- editorial typography
- category labels
- reading time
- article cards
- image transitions

Hover interactions should remain subtle.

---

# 30. CART

Cart should be polished and fast.

Use either:

- side drawer
- dedicated page

or both.

Interactions:

- item add animation
- image movement into cart where appropriate
- quantity transition
- remove transition
- subtotal update
- coupon feedback

Do not use exaggerated ecommerce animations.

---

# 31. CHECKOUT

Ensure `/checkout` exists and is connected to the cart flow.

Checkout must include:

- contact details
- shipping address
- delivery method
- payment UI
- order summary
- coupon/discount
- validation
- confirmation

Current simulated payment behavior may remain until a real payment provider is integrated.

Do not imply a real payment transaction when the system is still simulated.

---

# 32. BUTTON SYSTEM

Buttons must feel premium.

Primary button:

- Espresso / Deep Walnut base
- Cream/Ivory text
- subtle brownish shimmer

Hover:

```text
shimmer enters
→ surface moves
→ text shifts subtly
→ icon translates 2–4px
```

The shimmer must be:

- warm brown
- soft
- low contrast
- short
- elegant

Avoid glossy metallic effects.

---

# 33. GLOBAL MICRO-INTERACTION SYSTEM

Micro-interactions are required throughout the site.

Every meaningful interactive element should have feedback.

Include:

### Navigation

- hover indicators
- active states
- menu transitions

### Icons

- scale
- rotation
- stroke movement where appropriate

### Buttons

- shimmer
- lift
- icon movement

### Product cards

- image movement
- wishlist feedback
- quick action reveal

### Forms

- focus states
- validation transitions
- success states

### Cart

- count animation
- item addition feedback

### Wishlist

- heart animation

### Images

- hover zoom
- crop transitions

### Links

- underline animation
- directional movement

### Cursor

Optional premium cursor on desktop only.

Do not make the cursor distracting.

---

# 34. PARALLAX IMPLEMENTATION RULE

Do not use only:

```css
background-attachment: fixed;
```

Do not consider a page complete because images move at different speeds.

The primary system must be **element-level scene choreography**.

Use GSAP ScrollTrigger with pinned sections and scrubbed timelines.

Example conceptual structure:

```js
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: scene,
    start: "top top",
    end: "+=200%",
    scrub: 1,
    pin: true,
    anticipatePin: 1
  }
});

tl
  .to(background, {...}, 0)
  .to(chair, {...}, 0.1)
  .to(lamp, {...}, 0.2)
  .to(headline, {...}, 0.15)
  .to(product, {...}, 0.35);
```

The exact implementation can vary, but the visual result must follow this choreography.

---

# 35. RESPONSIVE MOTION

Desktop can have the full choreography.

Tablet should reduce:

- movement distance
- 3D depth
- overlapping complexity

Mobile should prioritize:

- readability
- performance
- touch
- controlled transitions

Do not simply scale the desktop scene down.

Create mobile-specific composition rules where required.

---

# 36. REDUCED MOTION

Respect:

```text
prefers-reduced-motion
```

When enabled:

- disable pinned long-scroll choreography
- remove unnecessary rotations
- reduce transforms
- remove aggressive scale movement
- keep opacity/short transitions
- preserve functionality

Accessibility takes priority over cinematic effects.

---

# 37. PERFORMANCE

The visual experience must remain smooth.

Requirements:

- lazy-load heavy assets
- optimize images
- use appropriate image formats
- avoid rendering unnecessary Three.js objects
- destroy ScrollTriggers correctly
- clean GSAP contexts
- avoid memory leaks
- pause unnecessary animations off-screen
- avoid excessive DOM nodes
- use GPU-friendly transforms
- avoid animating layout properties when possible

Prefer:

```text
transform
opacity
clip-path
```

over frequent:

```text
top
left
width
height
```

for animation.

---

# 38. HERO IMAGE SEQUENCE

Existing Day/Night image sequences should be retained where useful.

Verify and correct asset path mapping.

Current project assets are organized under:

```text
Video/
├── Day/
└── Night/
```

If the existing code expects:

```text
/video/day/
```

or:

```text
/video/night/
```

fix the path mapping rather than duplicating hundreds of assets unnecessarily.

The final implementation must work in production builds.

---

# 39. CURRENT PROJECT ISSUES TO FIX

During implementation, verify and correct:

1. `/checkout` route must exist and work.
2. Hero Day/Night asset path mismatch must be resolved.
3. External image dependencies should be reviewed.
4. External video dependencies should be reviewed.
5. Missing footer routes should be handled.
6. Dead/backup files should be identified.
7. Duplicate assets should be reviewed.
8. Tailwind v4 configuration should be verified.
9. Mobile behavior must be tested.
10. SEO metadata must be completed.
11. Accessibility must be checked.
12. Loading states must be polished.
13. Error states must be polished.
14. Empty states must be polished.

Do not break existing functionality while fixing these.

---

# 40. SEO

Ensure:

- metadata
- title templates
- descriptions
- Open Graph
- Twitter/X metadata
- canonical URLs where applicable
- semantic headings
- alt text
- structured data where appropriate

Product pages should have product-oriented metadata.

Journal pages should have article-oriented metadata.

---

# 41. ACCESSIBILITY

Ensure:

- keyboard navigation
- visible focus states
- sufficient contrast
- semantic HTML
- alt text
- accessible buttons
- accessible form labels
- reduced motion
- screen-reader friendly navigation
- no interaction dependent only on hover

---

# 42. COMPONENT ARCHITECTURE

Keep components reusable.

Suggested motion architecture:

```text
components/
├── animation/
│   ├── SmoothScroll.tsx
│   ├── ScrollScene.tsx
│   ├── SceneTransition.tsx
│   ├── RevealText.tsx
│   ├── ParallaxElement.tsx
│   └── MotionProvider.tsx
│
├── hero/
│   ├── CinematicHero.tsx
│   ├── HeroSequence.tsx
│   └── HeroScene.tsx
│
├── rooms/
│   ├── RoomScene.tsx
│   ├── RoomHotspot.tsx
│   └── RoomTransition.tsx
│
└── common/
    ├── MagneticButton.tsx
    ├── ShimmerButton.tsx
    └── AnimatedLink.tsx
```

Names may be adapted to the existing architecture.

---

# 43. MOTION DESIGN TOKENS

Create centralized motion constants.

Example:

```ts
export const motion = {
  easeLuxury: "power3.out",
  easeSmooth: "power2.out",
  easeReveal: "power4.out",

  duration: {
    micro: 0.2,
    short: 0.4,
    medium: 0.8,
    long: 1.4,
    cinematic: 2.0,
  },

  scene: {
    scrub: 1,
    pinDistance: 200,
  }
};
```

Avoid hardcoding inconsistent animation values throughout the application.

---

# 44. CURSOR INTERACTION

Optional desktop enhancement.

Cursor states:

```text
default
→ interactive
→ product
→ image
→ drag
```

Example:

Hover product:

```text
cursor expands
+
"VIEW"
```

Hover draggable studio object:

```text
cursor changes
+
"DRAG"
```

Keep this subtle.

Disable custom cursor on:

- touch devices
- reduced motion
- accessibility scenarios where it could interfere

---

# 45. LOADING EXPERIENCE

The initial loader should be minimal.

Use:

```text
VEL OURA
LIVING
```

with a subtle progress indicator.

Do not keep users waiting unnecessarily.

Only preload assets that are genuinely required for the first visual scene.

---

# 46. TRANSITION BETWEEN MAJOR PAGES

When navigating between:

- Rooms
- Shop
- Collections
- Journal

use subtle page transitions where appropriate.

Avoid long transitions that block navigation.

Possible sequence:

```text
current page compresses
→
image/texture transition
→
new page enters
```

Keep duration around 0.5–1.0 seconds unless the route specifically needs cinematic treatment.

---

# 47. WHAT "95% SIMILAR MOTION" MEANS

The target is **not pixel-copying** the Dribbble shot.

The target is to reproduce the same fundamental interaction language:

### Reference behavior

- scroll controls progression
- viewport behaves like a stage
- elements rearrange between compositions
- objects move independently
- visual layers overlap
- text participates in motion
- scene A transforms into scene B
- movement feels continuous
- transitions are choreographed rather than isolated
- composition is the animation

### Veloura adaptation

Replace the reference's content with:

- furniture
- room environments
- materials
- product photography
- interior objects
- Veloura typography
- Veloura colors
- Veloura brand identity

The final result should feel like:

> **"The furniture environment itself is moving and being art-directed by the user's scroll."**

---

# 48. DO NOT DO THESE THINGS

Do not deliver a redesign where:

- only the background has parallax
- every section simply fades upward
- every card has the same hover animation
- GSAP is used only for basic reveals
- 3D objects float randomly
- scenes abruptly switch
- text is static
- furniture images are just stacked cards
- animations ignore mobile
- motion blocks accessibility
- loading takes too long
- the ecommerce experience becomes difficult to use

---

# 49. IMPLEMENTATION ORDER

Follow this order:

## Phase 1 — Foundation

1. typography
2. color tokens
3. spacing
4. header
5. buttons
6. global UI states

## Phase 2 — Motion Engine

1. Lenis
2. GSAP ticker integration
3. ScrollTrigger
4. motion utilities
5. reduced-motion system
6. responsive motion rules

## Phase 3 — Cinematic Hero

1. hero sequence
2. pinned scene
3. furniture depth
4. text choreography
5. scene transitions
6. progress indicator

## Phase 4 — Scene-to-Scene System

1. reusable ScrollScene
2. element timelines
3. composition transitions
4. overlapping scenes
5. room storytelling

## Phase 5 — Ecommerce

1. shop
2. product cards
3. product detail
4. search
5. cart
6. checkout
7. wishlist

## Phase 6 — Intelligence

1. AI assistant
2. AI search
3. quiz
4. recommendations

## Phase 7 — Spatial Experience

1. Spatial Studio
2. Material Studio
3. selective Three.js

## Phase 8 — Editorial

1. collections
2. journal
3. storytelling sections

## Phase 9 — Polish

1. micro-interactions
2. responsive
3. accessibility
4. performance
5. SEO
6. loading
7. empty states
8. error states

---

# 50. QA CHECKLIST

Before declaring the redesign complete, verify:

## Visual

- [ ] Veloura logo is correct
- [ ] palette is consistent
- [ ] typography is correct
- [ ] premium furniture aesthetic is maintained
- [ ] no generic SaaS appearance

## Motion

- [ ] Lenis works
- [ ] GSAP works
- [ ] ScrollTrigger works
- [ ] scenes pin correctly
- [ ] scene transitions are continuous
- [ ] individual elements move independently
- [ ] text participates in transitions
- [ ] furniture participates in transitions
- [ ] objects have depth
- [ ] composition rearranges between scenes
- [ ] motion feels like the referenced Wine Website behavior
- [ ] no simple-background-parallax-only implementation

## Ecommerce

- [ ] shop works
- [ ] search works
- [ ] product detail works
- [ ] wishlist works
- [ ] cart works
- [ ] checkout route works
- [ ] quantity changes work
- [ ] coupon flow works where implemented

## Responsive

- [ ] desktop
- [ ] laptop
- [ ] tablet
- [ ] mobile
- [ ] touch
- [ ] reduced motion

## Quality

- [ ] no broken links
- [ ] no missing assets
- [ ] no console errors
- [ ] no hydration issues
- [ ] no animation memory leaks
- [ ] no unnecessary layout shifts
- [ ] acceptable performance
- [ ] accessibility checked
- [ ] SEO checked

---

# 51. FINAL QUALITY BAR

The final Veloura Living website should feel like a combination of:

```text
Premium Furniture Brand
        +
Editorial Interior Design Publication
        +
Immersive Spatial Experience
        +
Modern Ecommerce
        +
Furniture Intelligence
```

The most important principle is:

> **Do not treat motion as decoration. Treat motion as part of the product experience.**

The user's scroll should actively transform the composition.

The furniture, typography, imagery, product information, and spatial elements should feel art-directed together.

The website should communicate:

> **Furniture is not being displayed. A living space is being revealed.**

---

# 52. FINAL ANTIGRAVITY INSTRUCTION

Implement this specification directly against the existing Veloura Living project.

Preserve working functionality.

Do not remove existing commerce/intelligence features merely to simplify the redesign.

Upgrade the design system and motion system comprehensively.

Most importantly:

**Do not interpret the Dribbble reference as "add parallax."**

Interpret it as:

> **Build a scroll-controlled, pinned, scene-to-scene composition system in which individual visual elements continuously rearrange, transform, overlap, scale, rotate, clip, and transition into the next designed composition.**

Use GSAP + ScrollTrigger for the choreography.

Use Lenis for smooth scrolling.

Use selective Three.js/CSS 3D for depth.

Use responsive and reduced-motion alternatives.

Use original Veloura Living content and assets.

The final interaction should feel:

**cinematic, tactile, premium, spatial, smooth, editorial, and intentionally art-directed.**

