# Veloura Living --- Premium Authentication Experience

## Objective

Implement a premium Sign In / Sign Up authentication experience for the
existing Veloura Living website.

**IMPORTANT:** The existing Veloura Living frontend UI, UX, layout,
components, visual identity, animations, spacing, typography system,
colors, homepage sections, and overall design MUST NOT be redesigned or
replaced.

This task is ONLY for introducing and refining the authentication
experience.

The authentication experience must feel like a premium luxury furniture
brand --- warm, elegant, editorial, sophisticated, calm, and immersive.

It must NOT look like a SaaS dashboard, fintech login, generic ecommerce
login, or glassmorphism UI.

------------------------------------------------------------------------

# 1. Core Design Decision --- FINAL

The current Veloura Living visual direction shown in the existing
website is the correct foundation for this authentication experience.

Use the existing Veloura direction:

-   Warm
-   Premium
-   Minimal
-   Luxury
-   Editorial
-   Real-home feeling
-   Cream / ivory surfaces
-   Warm brown typography
-   Sophisticated furniture imagery

### Explicitly approved direction

Use a **solid cream / ivory authentication surface with warm brown
typography and a premium lifestyle furniture image**.

This is the final visual direction for the authentication experience.

The result should feel:

> Luxury furniture brand + premium interior editorial + private
> concierge access.

### DO NOT use Glassmorphism

The authentication experience MUST NOT use:

-   Glassmorphism
-   Frosted glass cards
-   Transparent glass panels
-   Heavy backdrop blur
-   Excessive gradients
-   Neon effects
-   Cyberpunk styling
-   Floating translucent UI
-   Strong glow effects

The authentication form must sit on a **solid, elegant cream/ivory
surface**.

The premium feeling should come from:

-   Typography
-   Spacing
-   Photography
-   Material-inspired colors
-   Subtle borders
-   Composition
-   Micro-interactions

NOT from glass effects.

------------------------------------------------------------------------

# 2. Authentication Entry Behavior

The authentication experience should appear in two situations.

### A. Initial Website Visit

When the user opens the Veloura Living website, display the
authentication experience according to the existing application flow.

The user should see:

-   Sign In
-   Create Account / Sign Up

The experience should feel intentional and premium rather than like an
intrusive generic popup.

### B. Profile Click

When the user clicks the existing `Profile` / account icon in the
Veloura Living header:

Open the exact same authentication experience.

Do NOT create two separate login designs.

The same reusable authentication component must support:

-   Initial authentication experience
-   Profile click
-   Future protected account actions

------------------------------------------------------------------------

# 3. Layout

Create a premium split authentication layout inspired by the provided
reference screenshot.

The reference is inspiration for the **split composition**, not
something to copy.

Suggested desktop structure:

``` text
-------------------------------------------------
|                                               |
|       LIFESTYLE IMAGE   | AUTHENTICATION     |
|                         |                    |
|                         | VELOURA            |
|                         |                    |
|                         | SIGN IN            |
|                         | CREATE ACCOUNT     |
|                         |                    |
-------------------------------------------------
```

### Left Side

Premium lifestyle furniture image.

### Right Side

Solid cream/ivory authentication surface containing:

-   Veloura branding
-   Sign In / Create Account navigation
-   Authentication form
-   Supporting text
-   Primary CTA
-   Secondary authentication actions where required

Use:

-   Clean rectangular / softly rounded structure
-   Premium proportions
-   Generous whitespace
-   Elegant typography
-   Subtle borders
-   Warm neutral surfaces
-   Strong visual hierarchy

Avoid overly rounded SaaS-style cards.

------------------------------------------------------------------------

# 4. Lifestyle Image --- Google Gemini AI

The left side must contain a premium furniture lifestyle image.

Use the first provided reference screenshot only as inspiration for the
type of lifestyle composition.

DO NOT copy:

-   The exact woman
-   Exact furniture
-   Exact room
-   Exact composition
-   Exact photography
-   Exact visual arrangement

Generate a NEW ORIGINAL image using Google Gemini AI.

## Gemini Image Prompt

Generate an original photorealistic premium interior lifestyle
photograph for a luxury furniture brand called Veloura Living.

Scene:

A sophisticated warm contemporary living room with premium wooden
furniture, a beautiful designer coffee table, elegant lounge seating,
soft natural daylight, neutral beige and warm brown interior tones,
tasteful decorative objects, subtle plants, refined architectural
details, and a high-end residential interior styling.

Include a naturally posed adult woman interacting with the furniture in
the room, such as sitting comfortably near the coffee table or arranging
a small decorative object.

The person should feel natural and candid rather than like a fashion
model or stock-photo pose.

Composition:

-   Premium furniture-focused interior
-   Human lifestyle moment
-   Natural interaction with furniture
-   Balanced composition
-   Enough visual breathing room
-   Suitable for a split-screen authentication layout
-   Strong furniture visibility
-   Warm and inviting atmosphere

Photography:

-   Photorealistic
-   High-end interior photography
-   Luxury furniture editorial
-   Natural lighting
-   Warm neutral tones
-   Premium architectural photography
-   Realistic wood, fabric and material textures
-   Natural human proportions
-   Sophisticated but homely
-   No artificial CGI appearance

DO NOT reproduce or closely imitate the reference image.

Create an original scene with a different person, different furniture
arrangement, different interior, and different composition.

Suggested asset filename:

`veloura-auth-lifestyle.webp`

Optimize the generated image for web performance.

------------------------------------------------------------------------

# 5. Authentication Branding

Use the existing Veloura Living brand/logo treatment.

Preferred authentication branding:

**VELOURA**

Supporting line:

**CONCIERGE ACCESS**

Optional supporting copy:

**Your space, thoughtfully curated.**

The branding must remain minimal and premium.

Do not turn the authentication screen into a marketing landing page.

------------------------------------------------------------------------

# 6. Sign In

Default authentication state:

## SIGN IN

Supporting copy:

**Welcome back.**

Fields:

-   Email Address
-   Password

Actions:

-   Sign In
-   Forgot Password?

Suggested hierarchy:

``` text
VELOURA | CONCIERGE ACCESS

SIGN IN       CREATE ACCOUNT

Welcome back.

EMAIL ADDRESS
[ input ]

PASSWORD                         Forgot Password?
[ input ]

[ Sign In ]

Don't have an account?
Create Account
```

Reuse the project's existing button styling wherever possible.

------------------------------------------------------------------------

# 7. Create Account / Sign Up

Create a second authentication state inside the same reusable component.

Fields:

-   Full Name
-   Email Address
-   Password
-   Confirm Password

Primary action:

**Create Account**

Secondary navigation:

**Already have an account? Sign In**

If the final SRS requires additional authentication methods such as
Google login or phone OTP, structure the component so those methods can
be integrated later without redesigning the authentication experience.

Do not visually overload the interface.

------------------------------------------------------------------------

# 8. Authentication Navigation

Allow the user to switch between:

-   SIGN IN
-   CREATE ACCOUNT

Use refined text/tab navigation.

The active state should use a subtle premium indicator.

Avoid:

-   Large colorful tabs
-   Pill-shaped SaaS controls
-   Excessive shadows
-   Glass effects

------------------------------------------------------------------------

# 9. Close / Exit Behavior

If authentication is presented over the existing homepage:

Provide a subtle close button.

When closed:

Return the user to the existing homepage exactly as it was.

Do not modify the underlying homepage.

------------------------------------------------------------------------

# 10. Background Treatment

When authentication is active over the homepage, the existing website
may be visually de-emphasized.

Preferred:

-   Light warm overlay
-   Subtle opacity
-   Minimal background separation

The authentication surface itself MUST remain solid.

Do not use a blurred glass card.

------------------------------------------------------------------------

# 11. Responsive Design

### Desktop

Use the premium image + authentication split layout.

### Tablet

Maintain the split layout where space allows.

### Mobile

Use:

Authentication first

with the lifestyle image either:

-   Above the form as a compact visual
-   Or below the form

depending on the existing Veloura mobile layout.

Do not create horizontal overflow.

------------------------------------------------------------------------

# 12. Interaction & Motion

Use the existing Veloura Living motion system.

Keep animations:

-   Subtle
-   Smooth
-   Premium
-   Restrained

Allowed:

-   Image fade/scale on authentication open
-   Form fade-up
-   Sign In / Create Account transition
-   Subtle button hover
-   Input focus transition

Avoid:

-   Bounce
-   Aggressive GSAP animations
-   Flashy effects
-   Neon glow
-   Excessive motion

The motion should communicate luxury and calmness.

------------------------------------------------------------------------

# 13. Existing UI/UX MUST REMAIN UNCHANGED

This is extremely important.

DO NOT:

-   Redesign the homepage
-   Change the existing header
-   Change navigation
-   Change hero
-   Change existing product cards
-   Change global typography
-   Change global colors
-   Change global spacing
-   Replace existing components
-   Remove existing animations
-   Change existing homepage layout
-   Introduce an unrelated design system

Only create the authentication experience and the minimum supporting
logic required to integrate it.

Reuse existing Veloura components, tokens, typography, buttons, icons,
and utilities wherever possible.

------------------------------------------------------------------------

# 14. Component Architecture

Create the authentication experience as reusable components.

Suggested structure:

``` text
components/
  auth/
    AuthExperience
    AuthPanel
    SignInForm
    SignUpForm
    AuthTabs
    AuthLifestyleImage
```

Keep separation between:

-   UI
-   Authentication state
-   Validation
-   API integration

Do not duplicate the authentication UI for Profile and initial website
entry.

Both must use the same authentication component.

------------------------------------------------------------------------

# 15. Authentication States

Support:

-   Sign In
-   Sign Up
-   Forgot Password
-   Loading
-   Validation Error
-   Authentication Error
-   Success

The UI should gracefully handle API responses.

Do not use fake authentication if backend authentication already exists.

If the backend authentication endpoint is not yet available, create the
frontend integration layer cleanly so the real API can be connected
later.

------------------------------------------------------------------------

# 16. Form Validation

Implement proper client-side validation.

### Sign In

-   Valid email
-   Required password

### Sign Up

-   Required name
-   Valid email
-   Password requirements
-   Confirm password matching

Show validation messages elegantly.

Do not use browser-default ugly error styling.

------------------------------------------------------------------------

# 17. Accessibility

Ensure:

-   Keyboard navigation
-   Proper labels
-   Accessible inputs
-   Visible focus states
-   Semantic buttons
-   Accessible close button
-   Appropriate ARIA attributes

Do not sacrifice accessibility for visual design.

------------------------------------------------------------------------

# 18. Performance

Optimize the lifestyle image.

Use:

-   WebP/AVIF where supported
-   Responsive image loading
-   Appropriate image dimensions
-   Lazy loading where appropriate

Do not unnecessarily increase the initial page bundle.

------------------------------------------------------------------------

# 19. Final Visual Quality Target

The final result should feel like:

**VELOURA \| CONCIERGE ACCESS**

rather than:

**Generic Login Page**

The authentication experience should communicate:

**Luxury furniture\
+ Warm home\
+ Premium lifestyle\
+ Personalized experience**

The user should immediately understand:

> This is a premium furniture brand where my account is part of a
> curated furniture experience.

The approved visual formula is:

**Solid cream/ivory surface + warm brown typography + premium lifestyle
furniture image + restrained luxury motion.**

------------------------------------------------------------------------

# 20. Final Implementation Checklist

Before changing anything:

1.  Inspect the existing Veloura Living frontend.
2.  Identify the existing header Profile interaction.
3.  Identify existing typography, colors, buttons, spacing and animation
    tokens.
4.  Reuse existing components wherever possible.
5.  Generate the new original lifestyle image with Google Gemini AI.
6.  Add the image to the appropriate public/static assets directory.
7.  Implement the reusable authentication experience.
8.  Connect Profile → Authentication.
9.  Implement the initial website authentication behavior.
10. Implement Sign In.
11. Implement Sign Up.
12. Implement Forgot Password state.
13. Implement validation and error states.
14. Test desktop.
15. Test tablet.
16. Test mobile.
17. Confirm that the existing homepage UI/UX remains visually unchanged.
18. Confirm that NO glassmorphism has been introduced.
19. Confirm that the authentication surface is solid cream/ivory.
20. Confirm that the final result feels premium, warm, editorial and
    distinctly Veloura.

------------------------------------------------------------------------

# NON-NEGOTIABLE RULE

**Do not redesign Veloura Living.**

The existing website is already designed.

This task adds a premium authentication experience that belongs to the
existing Veloura Living design language.

The final authentication experience must be:

**Warm + Premium + Minimal + Editorial + Luxury**

and specifically:

**NO GLASSMORPHISM.**
