# Veloura Living — Strict Registration, Login & Success Flow

## Objective
Implement the authentication flow exactly as specified below, using the attached **Login Successful** screen as the visual reference. Preserve the existing Veloura Living branding and authentication UI.

**Do not change the flow, skip a step, or show the success screen before authentication is actually complete.**

## 1. New User — Create Account First

A new user who does not yet have an account must follow this exact sequence:

1. Open the existing Veloura Living authentication modal/page.
2. Select **Create Account**.
3. Enter the required registration details and submit the form.
4. Complete email OTP verification.
5. Create and persist the new Customer account only through the existing secure registration flow.
6. After registration and email verification are successfully completed, direct the user to the existing Sign In view if the current authentication policy requires a separate login.
7. The user must then enter their registered email and password to sign in.
8. Complete the mandatory login OTP verification.
9. Only after the login OTP is successfully verified and a valid authenticated session is established, display the **Login Successful** screen shown in the attached reference image.
10. When the user clicks **Continue**, redirect them to the appropriate Customer destination.

**Important:** Completing registration alone must not display the Login Successful screen or grant a fully authenticated login session if the existing flow requires a separate sign-in.

## 2. Existing User — Sign In Directly

A returning user who already has an account must follow this exact sequence:

1. Open the existing Veloura Living authentication modal/page.
2. Enter their registered email address and password in the Sign In view.
3. Submit the credentials.
4. The server validates the credentials and initiates the mandatory login OTP flow.
5. Display the existing OTP Verification screen.
6. Verify the OTP successfully on the server.
7. Establish the authenticated session.
8. Display the **Login Successful** screen shown in the attached image.
9. When the user clicks **Continue**, redirect them to the appropriate destination based on their server-verified role.

Do not force returning users to create an account again.

## 3. Login Successful Screen — Match the Reference

Recreate the attached reference as closely as practical.

- Use the existing official Veloura Living logo.
- Preserve the warm living-room lifestyle image on the left.
- Display the editorial text: “Beautiful Spaces. Better Living.”
- Use the same warm cream/ivory background, walnut-brown palette, rounded split-screen container, and premium typography.
- Display a centered circular success icon with a refined checkmark.
- Heading: **Login Successful!**
- Supporting message: **Welcome back, [User Name]**
- Primary button: **Continue**
- Keep the subtle decorative details and generous spacing shown in the reference.

Use the actual authenticated user's display name when available. Do not hardcode “User” or any sample name.

Reuse the shared authentication layout and existing assets so the Login, OTP Verification, Verifying, and Login Successful screens look like one cohesive experience.

## 4. Continue Button — Role-Based Destination

The Continue button must use the authenticated session and server-verified role:

- **Customer:** Navigate to the intended existing Customer destination.
- **Authorized Admin:** Navigate to the existing Admin Dashboard with the permissions granted to that Admin.

Both Customer and Admin must use the same login page, OTP flow, and Login Successful screen. Do not create a separate Admin login page.

Never determine the user's role from client-side form values, URL parameters, local storage, or an untrusted API response.

## 5. GSAP Micro-Interactions

Implement subtle, premium GSAP animations:

- Smooth entrance of the success icon, heading, supporting message, and Continue button.
- A restrained checkmark reveal or scale transition.
- Soft hover and press feedback for Continue.
- Preserve the existing slow lifestyle-image zoom-in/zoom-out animation if already implemented.

Keep the animation elegant and unobtrusive. Avoid bounce effects, excessive motion, layout shifts, or delaying the Continue button. Respect `prefers-reduced-motion` and clean up animations when the component unmounts.

## 6. Security and Existing Authentication

- Inspect the current Next.js authentication routes, OTP verification flow, session creation, and any standalone Express authentication implementation before making changes.
- Reuse existing registration, login, OTP, and session logic wherever possible.
- Enforce email OTP verification on the server.
- Do not display Login Successful based only on a successful password check; the login OTP and session establishment must also succeed.
- Preserve account separation so each Customer sees only their own account data.
- Only the single authorized Admin account may access protected administrative functionality.
- Never grant Admin permissions through public registration or client-side role changes.
- Do not introduce mock authentication or fake success responses.

## 7. Flexible Implementation

Use reusable authentication components and explicit state transitions so future changes to registration fields, OTP handling, success messages, and post-login destinations can be added without rebuilding the entire authentication experience.

Keep registration completion and login completion as distinct states. Prevent duplicate form submissions and handle validation errors, incorrect or expired OTPs, network failures, and session-creation failures appropriately.

## 8. Strict Constraints

- Preserve the existing website's UI/UX outside the requested authentication flow.
- Do not redesign unrelated pages.
- Do not hardcode user details, credentials, roles, or authentication outcomes.
- Never open, read, print, modify, or expose any `.env` or `.env.*` files or secrets.
- Do not delete existing user accounts or data.
- Do not bypass or weaken the existing security checks.

## 9. Required Tests

Verify all of the following:

1. New user → Create Account → registration OTP → registration completion → Sign In → login OTP → Login Successful → Continue.
2. Existing user → email/password → login OTP → Login Successful → Continue.
3. Incorrect password → no success screen.
4. Incorrect or expired OTP → no success screen.
5. Failed session creation → no success screen.
6. Customer → Customer destination.
7. Authorized Admin → Admin Dashboard.
8. Customer cannot access Admin routes or APIs.
9. Existing login, registration, password reset, and OTP features continue to work.

## Final Acceptance Criteria

The implementation must follow the two user journeys exactly, display the attached Login Successful design only after successful login OTP verification and session establishment, and route users securely according to their server-verified roles. Report the files changed and test results, and clearly identify any incomplete work.
