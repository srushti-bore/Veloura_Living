# Veloura Living — OTP Verification Processing Screen

Implement the OTP verification processing screen to closely match the attached reference image. The image is the primary visual reference.

### Design Requirements
- Reuse the exact same split-screen authentication layout as the existing Veloura Living Login and OTP pages.
- **Left panel:** Preserve the warm, premium living-room image and the editorial text “Beautiful Spaces. Better Living.”
- **Right panel:** Use the existing official Veloura Living logo, warm ivory/cream background, dark walnut-brown typography, and subtle decorative details.
- Center a refined circular loading indicator in the right panel, followed by:
  - Heading: **“Verifying…”**
  - Message: **“Please wait while we confirm your identity.”**
- Match the reference image's proportions, spacing, typography, alignment, and minimal luxury aesthetic as closely as possible.
- Reuse existing brand assets and shared authentication components. Do not recreate the logo or introduce a different visual style.

### GSAP Micro-Interactions
- Animate the circular loader with a smooth, continuous rotation.
- Add a subtle entrance transition for the loader, heading, and supporting message.
- Keep the existing left lifestyle image's slow, continuous zoom-in/zoom-out animation if already implemented.
- Use restrained, premium motion without bounce effects, flashy transitions, or layout shifts.
- Respect `prefers-reduced-motion` and clean up GSAP animations when the component unmounts.

### Authentication Behaviour
- Display this screen only while the real server-side OTP verification request is processing.
- Prevent duplicate submissions while verification is in progress.
- On successful verification, transition to the existing **Login Successful!** screen, then redirect according to the server-verified role:
  - Customer → Customer destination.
  - Authorized Admin → Admin Dashboard.
- On failure, show a clear, accessible error state and allow the user to retry where appropriate.
- Never simulate verification success or bypass OTP validation.

### Flexibility and Constraints
- Reuse the existing authentication state management and API routes.
- Keep the loader, processing message, and status transitions modular so future changes can be added easily.
- Preserve the existing Login, Create Account, OTP Verification, and Dashboard designs.
- Do not redesign unrelated pages or hardcode authentication results.
- Never open, read, print, modify, or expose any `.env` or `.env.*` files or secrets.
- Ensure the layout remains responsive on desktop, tablet, and mobile.

### Acceptance Criteria
The processing screen should closely resemble the supplied reference image, maintain visual consistency with the Veloura Living authentication experience, animate smoothly with GSAP, and reflect the actual server-side verification status.
