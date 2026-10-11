# Veloura Living — Premium Login Experience Implementation

## Objective

Recreate the existing Veloura Living authentication experience to closely match the attached reference image. Treat the image as the primary visual reference, not merely as inspiration.

The result must feel like a premium, warm, editorial furniture brand: elegant, cozy, minimal, and professional.

**Important:** The design must be flexible and extensible. Future authentication options, form fields, notices, and features should be addable without rebuilding the entire page.

## 1. Reference-Matched Design

Implement a split-screen authentication layout inside a refined, rounded container.

### Left Panel — Lifestyle Experience
- Use a large, premium, realistic living-room furniture image.
- Display the editorial heading: “Beautiful Spaces. Better Living.”
- Use elegant serif typography, warm lighting, and a carefully balanced composition.
- Maintain the image-led luxury aesthetic shown in the reference.
- Keep the image responsive and properly cropped across screen sizes.

### Right Panel — Authentication Form
- Display the official existing Veloura Living logo asset. Do not redraw or approximate the logo.
- Use a warm ivory/cream background with dark walnut-brown typography and subtle beige borders.
- Add the heading “Sign in to your account”.
- Include:
  - Email address
  - Password with show/hide toggle
  - Remember me, only if compatible with the existing secure session design
  - Forgot password?
  - Primary Continue button
  - Google authentication option
  - Apple authentication option only if the project supports or is explicitly configured to support it
  - Create Account link
  - Terms of Service and Privacy Policy links
- Use consistent spacing, premium typography, subtle borders, and carefully controlled shadows.
- Match the reference's proportions, alignment, padding, and visual hierarchy as closely as practical.

Do not add unnecessary fields, badges, or decorative elements that compromise the reference design.

## 2. Flexible, Future-Ready Architecture

Do not hardcode the entire login UI into one oversized component.

Build reusable components and a configurable structure that allows future features to be added without redesigning the page. For example:
- Authentication form fields
- Primary and social authentication actions
- Optional form sections
- Legal notices and links
- Loading, error, and success states
- OTP verification interface
- Additional supported authentication providers

Use typed configuration, reusable components, and clear separation between UI, validation, and authentication logic. Optional features should render only when enabled and supported.

Do not hardcode provider availability, credentials, API responses, user roles, or authentication results.

Future extensibility must not introduce unnecessary complexity or a generic-looking design.

## 3. GSAP Micro-Interactions

Integrate GSAP for subtle, premium micro-interactions while preserving the original composition.

Implement:
- A gentle entrance animation for the authentication container.
- A subtle staggered reveal for the logo, heading, form fields, and actions.
- Soft hover and press feedback for buttons.
- Smooth focus transitions for form inputs.
- Refined transitions between Sign In, Create Account, OTP Verification, Processing, and Success states.
- A restrained image reveal or subtle visual movement, only if it improves the experience.

### Animation Constraints
- Keep animations short, smooth, and understated.
- Avoid bounce effects, excessive parallax, dramatic zooming, flashy transitions, and distracting motion.
- Prevent layout shifts and avoid delaying form interaction.
- Respect `prefers-reduced-motion`.
- Clean up GSAP timelines and ScrollTrigger instances, if used, when components unmount.
- Do not add ScrollTrigger or Lenis merely for this login screen unless genuinely needed.
- Do not animate every element continuously.

### Slow Lifestyle Image Zoom Animation — GSAP
- Add a very slow, smooth, continuous zoom-in and zoom-out effect to the living-room lifestyle image on the left side of the login page.
- Use GSAP to create a seamless, alternating scale animation, approximately from `scale: 1` to `scale: 1.06` and back to `scale: 1`.
- Each zoom cycle should take approximately 8–12 seconds, using gentle `ease: "sine.inOut"` easing.
- Keep the animation running continuously without sudden jumps, flickering, or visible resets.
- Apply the transform to the image only, not its parent container, text overlay, or login form.
- Keep the image clipped within its existing rounded container using `overflow: hidden`; preserve its composition and prevent layout shifts.
- Keep the animation subtle and luxurious, like a slow cinematic camera movement—not a dramatic zoom.
- Clean up the GSAP animation when the component unmounts.
- Respect `prefers-reduced-motion` and disable continuous zoom for users who prefer reduced motion.
- Preserve the existing image, layout, typography, colors, and all authentication functionality.

## 4. Existing Authentication Must Remain Functional

This is a UI implementation task integrated with the existing authentication system, not a replacement authentication system.

- Inspect the current login, registration, Google authentication, password reset, and OTP flows before modifying anything.
- Reuse existing API routes, validation, authentication components, session management, and backend services wherever possible.
- Preserve mandatory email OTP verification for both Customer and Admin.
- Both roles must use the same login page and authentication flow.
- After successful authentication, redirect according to the server-verified role: Customers to their existing customer destination and the authorized Admin to the Admin Dashboard.
- Never trust a client-provided role or grant Admin permissions from the frontend.
- Do not make unsupported social authentication buttons appear functional. If a provider is not configured, handle it appropriately without inventing a successful login.

Do not weaken existing authentication security to achieve the visual design.

## 5. Responsive Behaviour

Desktop:
- Maintain the large lifestyle image and form split shown in the reference.

Tablet:
- Adjust the split proportions and spacing without distorting the image or form.

Mobile:
- Use a clean, single-column layout.
- Keep the logo, heading, fields, primary action, and essential links accessible.
- Adapt or reduce the lifestyle image section thoughtfully instead of squeezing the desktop layout into a small screen.

Prevent horizontal overflow, clipped form controls, and awkward scrolling.

## 6. Performance, Accessibility, and Quality

- Use the existing project's framework, component conventions, and styling system.
- Reuse available assets and installed dependencies wherever practical.
- Do not add duplicate GSAP installations or unnecessary libraries.
- Use semantic labels, keyboard-accessible controls, visible focus states, and accessible error messages.
- Avoid unnecessary layout shifts and oversized assets.
- Ensure all form controls remain usable while animations run.
- Keep code modular, typed, maintainable, and production-ready.

## 7. Strict Project Constraints

- Inspect the existing project before implementation.
- Preserve the rest of the website's existing UI/UX.
- Do not redesign unrelated pages or the main website.
- Do not replace working authentication APIs with mock implementations.
- Do not hardcode credentials, users, authentication results, or secrets.
- Never open, read, print, modify, or expose any `.env` or `.env.*` files.
- Do not delete existing user data or break existing login and registration functionality.

## 8. Implementation and Final Verification

First identify the existing authentication components, styling approach, available assets, GSAP installation, and current authentication flow. Then implement the design using the existing architecture.

After implementation, verify:
- Visual similarity to the supplied reference.
- Sign-in and Create Account navigation.
- Password visibility toggle and validation.
- Forgot-password functionality.
- Supported Google/Apple authentication behaviour.
- Mandatory OTP flow and its animated states.
- Correct Customer/Admin redirects after successful verification.
- Responsive desktop, tablet, and mobile layouts.
- Keyboard accessibility and reduced-motion behaviour.
- No regressions to unrelated website pages.

Finally, report the files changed, reusable components created, GSAP interactions added, tests performed, and any authentication provider requiring separate configuration.
