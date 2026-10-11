# Veloura Living — Premium OTP Verification Page

## Objective
Implement the OTP Verification page to closely match the attached reference image. Use the image as the primary visual reference. This page must feel like a natural continuation of the existing Veloura Living login experience.

## 1. Match the Reference Design
- Reuse the same split-screen layout as the login page.
- **Left panel:** Warm, premium living-room lifestyle image with the editorial text “Beautiful Spaces. Better Living.”
- **Right panel:** Warm ivory/cream background, official Veloura Living logo, dark walnut-brown typography, subtle beige borders, and generous spacing.
- Display the heading “Verify Your Email”.
- Display a message such as “We've sent a 6-digit OTP to [masked email address]”.
- Add six individual OTP input boxes in one horizontal row.
- Add a countdown timer with a “Resend OTP” action.
- Add a prominent brown “Verify” button.
- Add a “Back to login” link.
- Preserve the subtle decorative details and rounded proportions shown in the reference.

Use the existing official logo and suitable project assets. Do not recreate the logo with text or use unrelated stock imagery if the correct asset already exists.

## 2. Functional OTP Verification
- Connect the page to the existing OTP verification API and authentication flow.
- Accept exactly six numeric digits.
- Automatically move focus to the next input after a digit is entered.
- Support backspace, keyboard navigation, paste of a complete six-digit code, and mobile-friendly input.
- Enable verification only when the OTP is complete and valid.
- Show clear inline validation for incorrect, expired, or incomplete codes.
- Prevent repeated submissions while verification is processing.
- Display a loading/processing state during verification.
- On successful verification, show the existing Login Successful state and redirect according to the server-verified role:
  - Customer → Customer destination.
  - Authorized Admin → Admin Dashboard.
- Never determine or trust the user's role from client-side input.

## 3. Resend OTP and Timer
- Display a countdown based on the existing OTP policy.
- Enable “Resend OTP” only when permitted by the backend.
- Call the existing resend mechanism, if available, and handle rate limits and errors properly.
- Reset the countdown only after a successful resend.
- Do not generate, expose, or validate OTPs exclusively on the client.
- Do not invent successful API responses or bypass OTP verification.

## 4. GSAP Micro-Interactions
Add subtle, premium GSAP animations:
- Smooth entrance for the OTP card and its contents.
- Gentle staggered reveal for the six OTP boxes.
- Subtle focus and border transitions as the user enters digits.
- Smooth transitions between verification, processing, error, and success states.
- Reuse the login page's slow, continuous lifestyle-image zoom-in/zoom-out animation, approximately 8–12 seconds per cycle, if already implemented.

Keep all animations restrained, avoid bounce effects and layout shifts, clean up GSAP timelines on unmount, and respect `prefers-reduced-motion`. Animations must never delay or block OTP entry.

## 5. Flexible and Reusable Implementation
- Reuse shared authentication layout, logo, typography, colors, lifestyle image, and animation utilities from the login page.
- Keep OTP input, countdown, validation, and verification status as reusable components where appropriate.
- Keep timing and OTP policies controlled by the existing backend/configuration rather than hardcoding assumptions across components.
- Ensure future changes to OTP length, authentication providers, messages, or verification states can be implemented without rebuilding the whole page.
- Do not duplicate the entire login page implementation just to create the OTP screen.

## 6. Responsive and Accessible
- Preserve the split layout on desktop.
- Adapt cleanly for tablet and mobile screens.
- Keep all six inputs usable on narrow screens without horizontal overflow.
- Provide accessible labels, keyboard navigation, visible focus states, and screen-reader-friendly error messages.

## 7. Strict Constraints
- Inspect the existing authentication flow and reuse the current API routes and session logic.
- Preserve the existing login and registration functionality.
- Do not redesign unrelated pages or alter the overall Veloura Living brand design.
- Do not hardcode OTPs, credentials, user roles, or authentication results.
- Never open, read, print, modify, or expose `.env` or `.env.*` files or their secrets.

## Acceptance Criteria
The implemented OTP page should closely match the supplied image, feel visually consistent with the login page, perform real server-side OTP verification, support resend and error states correctly, use subtle GSAP micro-interactions, and work responsively across desktop and mobile.
