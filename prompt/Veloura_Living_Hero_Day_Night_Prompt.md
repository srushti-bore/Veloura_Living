# Veloura Living — Hero Day/Night Cinematic Video Reveal
## Final Antigravity Implementation Prompt

> **STRICT SCOPE:** Work ONLY on the existing Veloura Living Hero section. Do not redesign or modify anything else in the project.

---

## 1. Project & Asset Structure

You are working inside the existing Veloura Living project.

There is already a `video` folder inside the project:

```text
video/
├── day/
└── night/
```

- Day assets are inside `video/day/`
- Night assets are inside `video/night/`

Before coding, inspect the actual project structure and identify the exact filenames, extensions, and asset format.

### Important

Use the existing assets.

Do **not**:

- Create another video folder.
- Duplicate assets.
- Move assets.
- Rename assets.
- Replace assets.
- Generate placeholder assets.

---

# 2. Strict Hero-Only Scope

This is a **Hero-only implementation**.

Do not change or redesign:

- Existing website design.
- Existing layout.
- Typography.
- Colors.
- Spacing.
- Navigation.
- Header.
- Buttons.
- Product cards.
- Ecommerce functionality.
- Other sections.
- Footer.
- Existing responsive design.
- Existing design tokens.
- Existing components unrelated to the Hero.
- Existing GSAP architecture.
- Existing Lenis architecture.

Do not refactor unrelated code.

Do not fix unrelated issues discovered during implementation.

The only goal is to correctly implement the **Day ↔ Night cinematic video reveal inside the existing Hero**.

---

# 3. Main Goal

The existing Veloura Living Hero should show the same living-room scene in two visual states:

- **LEFT SIDE → DAY**
- **RIGHT SIDE → NIGHT**

A vertical draggable divider sits between them.

Concept:

```text
DAY VIDEO                  NIGHT VIDEO
████████████████│████████████████
                 ↑
             DRAG HANDLE
```

The divider controls the exact boundary between the Day and Night visuals.

---

# 4. Most Important Requirement — Drag Reveal

The drag reveal is the **most important part** of this implementation.

The user must be able to drag the vertical divider smoothly from left to right and right to left.

### Behavior

- Moving divider LEFT → reveals more NIGHT.
- Moving divider RIGHT → reveals more DAY.

Examples:

```text
50%:
DAY 50% | NIGHT 50%

25%:
DAY 25% | NIGHT 75%

75%:
DAY 75% | NIGHT 25%

100%:
Almost completely DAY

0%:
Almost completely NIGHT
```

The interaction must feel like a real cinematic before/after slider.

---

# 5. Critical Video Alignment

The Day and Night videos **must be perfectly aligned**.

Both videos must have:

- Exactly the same position.
- Exactly the same size.
- Exactly the same Hero bounds.
- Exactly the same aspect-ratio behavior.
- Exactly the same object positioning.
- Exactly the same crop.
- Exactly the same camera framing.

### Never

- Move one video independently.
- Scale one video differently.
- Apply separate transforms.
- Allow the sofa to shift.
- Allow the fireplace to shift.
- Allow the coffee table to shift.
- Allow windows or architecture to shift.
- Allow the garden to shift.

The Day and Night scenes must line up as precisely as the source videos allow.

The user should feel like they are revealing two lighting states of the **same room**.

---

# 6. Use Two Video Layers

Use two HTML5 `<video>` elements positioned exactly on top of each other.

Structure:

```text
Hero
├── Day Video
├── Night Video
└── Vertical Drag Divider
```

- Day is the base layer.
- Night is positioned directly above it.
- Night is clipped/revealed according to the divider position.

### Important

Do not move the videos while dragging.

Only change the clipping/reveal boundary.

Use a performant CSS clipping technique such as `clip-path` or another appropriate method.

---

# 7. Do Not Use Crossfade

This is **not** a Day-to-Night fade transition.

Do not implement:

```text
DAY opacity ↓
NIGHT opacity ↑
```

Do not crossfade the videos.

The actual visual boundary must move with the user's drag.

The user must physically reveal one video over the other.

---

# 8. Video Playback

Both Day and Night videos should:

- `autoplay`
- `muted`
- `playsinline`
- `loop`

Both should continuously play.

## Synchronization

Keep both videos synchronized as closely as possible.

They should start at the same playback position.

If required, synchronize playback so that Day and Night remain visually matched while the divider is being dragged.

Avoid obvious timing differences between the two videos.

The user should not feel like they are watching two unrelated videos.

---

# 9. Video Quality

Preserve the original quality of the existing Day and Night assets.

Do not unnecessarily:

- Compress.
- Blur.
- Sharpen.
- Filter.
- Re-encode.

The Hero should look:

- Premium.
- Cinematic.
- Photorealistic.
- Architectural.
- High-end furniture brand quality.

Do not add:

- Artificial glow.
- Excessive blur.
- Lens flare.
- Heavy gradients.
- Color filters.
- Unnecessary visual effects.

---

# 10. Existing Hero Design Must Remain Unchanged

Preserve the existing Hero exactly.

If the Hero currently contains:

- Heading.
- Paragraph.
- CTA.
- Navigation.
- Labels.
- Overlays.
- Other content.

Keep everything.

Do not rewrite the content.

Do not redesign the Hero.

Do not move existing content unnecessarily.

Do not change typography.

Do not change colors.

Do not change spacing.

Do not add a new Hero design.

The Day/Night video interaction must integrate into the existing Hero.

---

# 11. Hero 3D Look

Do **not** introduce a heavy 3D/WebGL presentation.

Do not introduce:

- Three.js.
- WebGL.
- Canvas-based 3D.
- Floating 3D objects.
- Heavy 3D parallax.

The premium/cinematic feeling should come from the Day/Night video reveal.

---

# 12. Divider Design

Create a subtle premium vertical divider.

It may contain:

- Thin vertical line.
- Small circular drag handle.
- Subtle left/right directional indicator.

Keep it minimal and elegant.

Use the existing Veloura Living visual language.

Do not create:

- Neon controls.
- Oversized arrows.
- Gaming-style UI.
- Excessive shadows.
- Excessive glassmorphism.
- Flashy effects.

The divider should look like a refined architectural comparison control.

---

# 13. Divider Initial Position

Start the divider at approximately:

```text
50%
```

Initial state:

```text
DAY 50% | NIGHT 50%
```

This should immediately communicate that the section is interactive.

If the existing design already contains DAY/NIGHT labels, preserve them.

If labels are necessary, keep them subtle and consistent with the existing design.

---

# 14. Drag Interaction

Use Pointer Events so the interaction works consistently across:

### Desktop

- Mouse.
- Pointer.

### Mobile

- Touch.
- Pointer.

The divider should follow the pointer directly.

The interaction must feel:

- Immediate.
- Smooth.
- Precise.
- Responsive.

Do not create noticeable lag.

Do not use a slow tween while the user is actively dragging.

Do not add unnecessary spring/bounce.

Clamp the divider between approximately:

```text
0% → 100%
```

Prevent horizontal page overflow.

---

# 15. Mobile Touch Behavior

Mobile is extremely important.

The user must be able to drag the divider horizontally without accidentally triggering unwanted vertical page scrolling.

During active horizontal dragging:

- Prioritize slider interaction.
- Prevent accidental horizontal page movement.
- Do not permanently disable vertical scrolling.
- Restore normal scrolling immediately after the interaction ends.

Make the invisible touch target around the divider large enough to grab comfortably.

The visual divider itself can remain thin.

---

# 16. GSAP

Use the existing GSAP installation/configuration in the project.

Do not install or create another animation system if GSAP already exists.

Use GSAP only for appropriate micro-interactions such as:

- Subtle divider hover.
- Drag handle feedback.
- Initial reveal.
- Small UI transitions.

The actual divider position while dragging should remain highly responsive.

Do not add excessive animation.

Motion should feel:

- Premium.
- Soft.
- Controlled.
- Intentional.

---

# 17. Lenis

The Veloura Living project already uses Lenis for smooth scrolling.

Do **not** create a second Lenis instance.

Do **not** replace the existing Lenis setup.

Reuse the existing Lenis system.

The Hero Day/Night slider must coexist correctly with Lenis.

Make sure:

- Normal page scrolling remains smooth.
- Lenis does not fight the slider.
- Dragging does not create scroll jitter.
- Mobile horizontal dragging does not accidentally scroll the page vertically.
- Normal page scrolling works immediately after releasing the divider.

Do not modify the global Lenis architecture unless absolutely necessary for this Hero interaction.

---

# 18. Responsive Hero

The Hero must work correctly across:

- Large desktop.
- Laptop.
- Tablet.
- Mobile.

On resize:

- Keep Day and Night perfectly aligned.
- Preserve aspect ratio.
- Preserve crop.
- Preserve divider position.
- Prevent layout shifts.
- Prevent horizontal overflow.

Do not introduce responsive redesign.

Use the existing Hero responsive behavior.

---

# 19. Performance

This is a website Hero, so performance is critical.

Prefer:

- Native HTML5 video.
- CSS clipping.
- Pointer Events.
- Existing GSAP.
- Existing Lenis.

Avoid:

- Three.js.
- WebGL.
- Canvas rendering for the videos.
- Unnecessary requestAnimationFrame loops.
- Unnecessary React state updates.
- Expensive filters.
- Continuous animation loops.

Do not re-render the React component on every pointer movement if it can be avoided.

Use refs or direct DOM updates where appropriate for high-frequency drag interaction.

---

# 20. No Unrelated Changes

This rule is **very important**.

Only modify the existing Hero implementation and the minimum CSS/logic required for the Hero Day/Night reveal.

Do not touch:

- Header.
- Navbar.
- Other pages.
- Other sections.
- Product sections.
- Furniture cards.
- Shopping/cart/checkout.
- Footer.
- CMS.
- Admin.
- Ecommerce functionality.
- Global design tokens.
- Unrelated animations.
- Unrelated components.

If you notice unrelated problems, leave them untouched.

Do not refactor unrelated code.

---

# 21. Existing Project Integration

Before coding:

1. Inspect the existing Veloura Living project.
2. Find the existing Hero component.
3. Inspect how the Hero is currently structured.
4. Inspect the existing GSAP setup.
5. Inspect the existing Lenis setup.
6. Locate:
   - `video/day/`
   - `video/night/`
7. Inspect the actual Day/Night asset format.
8. Understand how the existing Hero is responsive.

Then make the **smallest possible change** required.

Do not create a duplicate Hero.

Do not create a second scrolling system.

Do not create a second animation system.

Integrate into the existing Hero.

---

# 22. Drag Testing

After implementation, test the divider thoroughly.

Test:

```text
50% → 25% → 75% → 100% → 0%
```

Then test:

```text
LEFT → RIGHT → LEFT → RIGHT
```

Test both:

- Slow dragging.
- Fast dragging.

Test:

- Mouse drag.
- Touch drag.
- Click/release.
- Drag from different parts of the handle.
- Extreme left.
- Extreme right.

At every position verify:

- Day stays on the correct side.
- Night stays on the correct side.
- Videos remain aligned.
- Videos do not move.
- No flickering.
- No jumping.
- No clipping artifacts.
- No black/white gaps.
- No layout shifts.
- No horizontal overflow.

---

# 23. Most Important Visual Test

When the divider is at 50%:

The architecture must line up exactly across the divider.

For example:

- Fireplace edge on Day aligns with fireplace edge on Night.
- Sofa aligns.
- Coffee table aligns.
- Windows align.
- Floor aligns.
- Garden aligns.

If anything appears to shift when dragging the divider, fix the video sizing/cropping/alignment.

Do **not** solve alignment problems by moving the divider.

The videos themselves must remain perfectly aligned.

---

# 24. Final Acceptance Criteria

The implementation is successful only if:

- Existing Veloura Living design remains unchanged.
- Only the Hero was modified.
- Day assets are loaded from the existing `video/day/` folder.
- Night assets are loaded from the existing `video/night/` folder.
- Existing assets are not moved or renamed.
- Day and Night occupy exactly the same visual area.
- Both videos autoplay.
- Both videos are muted.
- Both videos play inline.
- Both videos loop.
- Both videos remain synchronized.
- Divider starts around 50%.
- Divider is draggable.
- Dragging LEFT reveals more NIGHT.
- Dragging RIGHT reveals more DAY.
- Divider directly controls the reveal boundary.
- There is NO crossfade.
- Videos never move independently.
- Videos never scale independently.
- Day and Night remain perfectly aligned.
- Desktop works.
- Mobile works.
- Touch dragging works.
- Lenis continues working.
- Existing GSAP setup continues working.
- No 3D/WebGL was introduced.
- No unrelated design was changed.
- No unrelated code was refactored.
- The interaction feels smooth, premium and cinematic.

---

# 25. Final Instruction

Before modifying anything, inspect the existing implementation and assets.

Then implement **ONLY** the Hero Day/Night reveal.

Use the smallest possible code change.

Do not redesign anything.

Do not modify unrelated components.

Do not introduce new visual concepts.

The single most important result is:

> **THE USER MUST BE ABLE TO DRAG THE VERTICAL DIVIDER AND SMOOTHLY REVEAL THE DAY AND NIGHT VIDEOS WHILE BOTH VIDEOS REMAIN PERFECTLY ALIGNED.**

The final Hero should feel like a premium Veloura Living architectural/furniture experience:

**CALM + CINEMATIC + PREMIUM + SMOOTH + INTERACTIVE**

Not flashy.
Not over-animated.
Not 3D-heavy.

**ONLY the existing Hero, with a polished Day ↔ Night drag-to-reveal experience.**
