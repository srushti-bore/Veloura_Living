# Veloura Living — Antigravity Animation & Interaction Prompt

## Objective

Refine the existing Veloura Living website without changing the established visual identity, layout direction, content structure, or premium furniture aesthetic.

### Important Direction

**REMOVE the 3D visual treatment from the Hero section.**

The Hero should no longer feel like a 3D/WebGL-heavy experience. Instead, create a **premium editorial, sophisticated and immersive 2D experience** using typography, imagery, spacing, subtle motion, and micro-interactions.

The website should feel:

- Premium
- Calm
- Sophisticated
- Minimal
- Architectural
- Furniture-focused
- Smooth
- Expensive without being flashy

Do NOT over-animate the interface.

---

# 1. HERO SECTION

### Remove

- Remove the existing Hero 3D look.
- Remove unnecessary floating 3D objects.
- Remove heavy WebGL-style movement.
- Remove excessive parallax.
- Remove anything that makes the Hero feel like a gaming/tech website.

### Keep

Maintain the existing Hero composition, typography, imagery and hierarchy from the current design.

### Animation

Use **GSAP** for subtle entrance animation.

Suggested sequence:

1. Hero background/image appears naturally.
2. Small eyebrow/label fades and moves upward.
3. Main heading reveals with a subtle upward motion.
4. Supporting paragraph fades upward.
5. Primary CTA appears slightly after the text.
6. Secondary CTA follows.
7. Final subtle image movement can happen once during page entrance.

Animation should feel like an **editorial reveal**, not a flashy animation.

Example motion characteristics:

- `opacity: 0 → 1`
- `y: 20–30px → 0`
- duration around `0.6–1s`
- premium easing
- staggered timing

Do NOT animate every element independently forever.

---

# 2. GSAP MICRO-INTERACTIONS

Use **GSAP as the primary animation engine**.

GSAP should be used mainly for:

- Button interactions
- Navigation interactions
- Image reveal
- Section reveal
- Hover states
- Small typography movements
- Product card interactions
- Scroll-triggered reveals
- CTA feedback
- Menu interactions

### Animation philosophy

Use:

> Less animation + better timing + better easing = premium experience.

Avoid:

- Excessive bounce
- Large scaling
- Aggressive rotations
- Continuous floating
- Overlapping animations
- Random movement
- Cartoon-like effects

---

# 3. LENIS SMOOTH SCROLL

Implement **Lenis** for smooth scrolling throughout the website.

The scrolling should feel:

- Fluid
- Controlled
- Premium
- Natural

Lenis should work together with GSAP ScrollTrigger where necessary.

### Important

Do not make scrolling excessively slow.

The user should still feel that the page responds immediately.

Use Lenis primarily to improve the overall smoothness and transition between sections rather than creating dramatic scroll effects.

---

# 4. SCROLL-TRIGGERED SECTION REVEALS

Use GSAP ScrollTrigger selectively.

When a section enters the viewport:

### Text

Use:

- fade in
- subtle upward movement
- small stagger

### Images

Use:

- subtle opacity reveal
- slight scale from approximately `1.03 → 1`
- optional small vertical movement

### Product Cards

Cards can reveal sequentially with a very subtle stagger.

Do NOT make every section have a completely different animation.

Maintain a consistent motion language throughout the website.

---

# 5. BUTTON MICRO-INTERACTIONS

Buttons are important.

Every major CTA should feel responsive when the user interacts with it.

### Hover

Use a subtle:

- background transition
- slight scale `1 → 1.02`
- text movement of a few pixels
- shimmer movement where applicable

### Click

Provide a very subtle press interaction:

`scale 1 → 0.98 → 1`

Keep it extremely fast.

---

# 6. PRIMARY CTA — BROWNISH SHIMMER

The main CTA buttons should have a **subtle brownish shimmer effect**.

This should be elegant and premium.

### Visual direction

Base button:

- warm brown / deep mocha tone
- cream/off-white text
- refined border radius
- no excessive glow

Add a very subtle diagonal shimmer/highlight that moves across the button on hover.

Concept:

`dark brown → warm brown → subtle lighter brown highlight → dark brown`

The shimmer should move smoothly from left to right.

### Important

The shimmer must NOT look like:

- Metallic chrome
- Neon
- Gold luxury effect
- Gaming button
- Strong gradient animation

It should feel like a **soft light passing over a premium material**.

Use GSAP for the shimmer interaction.

The shimmer should only activate on interaction/hover, not continuously.

---

# 7. SECONDARY BUTTONS

Secondary buttons should remain minimal.

Possible interaction:

- subtle border color transition
- text shift by 2–4px
- small arrow movement if an arrow exists

Example:

`Explore Collection →`

On hover:

`Explore Collection  →`

with the arrow moving slightly forward.

Keep it understated.

---

# 8. NAVIGATION MICRO-INTERACTION

Navigation should feel extremely polished.

### Menu items

On hover:

- subtle text color transition
- small underline or indicator reveal
- indicator should animate from left to right

Do not use large hover backgrounds.

### Header

If the current design has a transparent header:

On scroll, transition smoothly into a slightly more solid/background-supported header.

Use GSAP to animate:

- background opacity
- backdrop blur if already part of the design
- subtle shadow/border
- header height if necessary

Do not make the header dramatically shrink.

---

# 9. PRODUCT CARD INTERACTIONS

Product cards should have subtle interactions.

On hover:

- image scale approximately `1 → 1.03`
- image transition should be smooth
- card can move upward by approximately `2–4px`
- CTA/icon can reveal subtly

Do not make cards rotate.

Do not use excessive 3D tilt.

Furniture imagery should remain the visual focus.

---

# 10. IMAGE INTERACTIONS

Furniture photography is a major part of the experience.

Use subtle image motion:

- scale
- opacity
- clipping/mask reveal
- small parallax where appropriate

Avoid aggressive zoom.

Images should feel like they are being **revealed**, not animated for the sake of animation.

---

# 11. SECTION TRANSITIONS

Sections should connect naturally.

Use:

- whitespace
- typography
- image transitions
- subtle GSAP reveals

Do NOT add unnecessary animated separators or fancy transitions.

The page should feel like a premium furniture editorial website.

---

# 12. CURSOR INTERACTIONS

If the current implementation already has a custom cursor, keep it subtle.

If implementing one:

Use only minimal behavior.

For example:

- cursor slightly expands over interactive elements
- small visual feedback over CTA buttons
- no giant custom cursor
- no distracting trailing effects

If a custom cursor hurts usability or mobile compatibility, do not use it.

---

# 13. MOBILE BEHAVIOR

Animations must be responsive.

On mobile:

- Reduce animation distance.
- Reduce stagger.
- Disable unnecessary hover-only interactions.
- Do not use desktop-only cursor effects.
- Keep scrolling smooth.
- Preserve performance.

The mobile experience should remain premium and fast.

---

# 14. PERFORMANCE

This is extremely important.

Do NOT replace the removed Hero 3D with heavy animation elsewhere.

Prioritize:

- GSAP
- ScrollTrigger
- Lenis
- CSS transitions where appropriate

Avoid unnecessary:

- WebGL
- Three.js
- heavy canvas animations
- continuous animation loops
- excessive DOM animation

Animations should preferably use GPU-friendly properties:

- `transform`
- `opacity`

Avoid animating expensive layout properties unnecessarily.

---

# 15. MOTION SYSTEM

Create a consistent motion language.

### Fast interaction

For buttons/icons:

`150–300ms`

### Standard UI transition

`300–500ms`

### Section reveal

`600–900ms`

### Hero entrance

`700–1200ms`

Use premium easing rather than linear movement.

Motion should feel:

**soft → controlled → deliberate**

Never:

**fast → bouncy → flashy**

---

# 16. IMPORTANT DESIGN RULE

Do not redesign the website.

Do not introduce new visual concepts.

Do not change the established Veloura Living branding.

Do not make the website look like a SaaS product.

Do not make it look like a gaming website.

Do not overuse animation.

The goal is:

> **Premium static visual design + intelligent micro-interactions + smooth scrolling.**

The Hero should be **2D, editorial and elegant**, while the rest of the site gains depth through subtle movement.

---

# 17. FINAL IMPLEMENTATION STACK

Use:

### Animation
**GSAP**

### Scroll
**Lenis**

### Scroll-triggered animation
**GSAP ScrollTrigger**

### Styling
Use the existing styling architecture and design tokens.

### Avoid

- Three.js for the Hero
- WebGL Hero
- excessive 3D
- continuous floating objects
- excessive parallax
- over-engineered animation systems

---

# 18. FINAL EXPERIENCE TARGET

The final result should feel like:

> **A premium furniture brand website that feels alive without visibly trying to be animated.**

The user should notice:

- smooth scrolling
- beautiful transitions
- responsive buttons
- subtle image movement
- refined hover states
- elegant CTA shimmer
- polished section reveals

But the user should **not** feel:

> "This website has too many animations."

The animation should support the furniture, photography, typography and premium brand identity — never compete with them.

## Priority

1. Remove Hero 3D look.
2. Preserve Hero composition and premium visual identity.
3. Implement Lenis smooth scrolling.
4. Implement GSAP micro-interactions.
5. Implement GSAP ScrollTrigger section reveals.
6. Add subtle brownish shimmer to primary CTA buttons.
7. Polish navigation and product-card interactions.
8. Ensure excellent mobile behavior.
9. Keep performance high.
10. Do not over-animate.