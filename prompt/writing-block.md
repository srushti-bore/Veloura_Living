# Antigravity Implementation Prompt — Veloura Living Authentication & OTP Security Fix

## Project Context

Repository: `srushti-bore/Veloura_Living`  
Latest reviewed commit: `d9c9484` — Phase 18: Mandatory OTP Verification & Brevo Integration.

The project already has an implemented frontend. Authentication, registration, email OTP verification, Brevo integration, user management, customer sessions, and admin authentication need to be reviewed and corrected.

## 1. Mandatory Rules — Do Not Violate

1. **Do not read, open, inspect, print, modify, copy, expose, or commit any `.env`, `.env.*`, environment file, secret file, or credential value.** Do not use commands that display their contents. Do not reveal API keys, SMTP credentials, database URLs, JWT secrets, OTPs, passwords, cookies, or tokens in logs or reports.
2. Do not change the existing frontend design, layout, typography, colors, animations, responsiveness, components' visual styling, or overall UI/UX.
3. Do not rebuild the frontend or introduce a new authentication design. Preserve the existing OTP interface and authentication experience.
4. Do not hardcode credentials, OTPs, admin passwords, database configuration, API keys, user records, or environment-specific URLs.
5. Do not run destructive scripts, database resets, user-cleanup commands, migrations that delete data, or bulk deletion queries without explicit approval.
6. Do not deploy the frontend or backend, change production settings, or modify production data as part of this task.
7. Do not weaken authentication, authorization, OTP verification, password checks, or existing security protections to make tests pass.
8. Keep changes focused, maintainable, type-safe, and compatible with the existing architecture. Avoid unrelated refactoring and duplicate implementations.

## 2. Begin With a Read-Only Repository Audit

Inspect the current code and its dependencies before making changes. Prioritize these areas:

- `app/api/auth/login/route.ts`
- `app/api/auth/register/route.ts`
- `app/api/auth/verify-otp/route.ts`
- `app/api/auth/resend-otp/route.ts`
- `lib/auth/otpService.ts`
- `lib/services/brevoEmailService.ts`
- `lib/data/authStore.ts`
- `lib/data/userRepository.ts`
- `providers/AuthProvider.tsx`
- Existing admin authentication and authorization middleware/routes
- Existing backend authentication and OTP implementations
- Relevant tests, database schema, and package scripts

Search for duplicate authentication implementations and determine which services and data stores each route actually uses. Do not assume that the frontend, Next.js API routes, and separate backend share memory or database state.

Do not inspect environment files. You may inspect source code that references environment variable names, but never retrieve or reveal their values.

After the audit, implement the following fixes.

## 3. Fix the OTP Login Security Vulnerability

### Current concern

The OTP service can create a new login challenge when a supplied challenge token is missing or invalid. This must not provide an alternative route to authentication that bypasses the password-verification step.

### Required behavior

- A login challenge can only be created after the server successfully validates the user's email and password.
- Every login challenge must be securely bound to the verified user ID, normalized email, challenge type, and authentication flow.
- An unknown, invalid, expired, or mismatched challenge token must be rejected. Never silently create a new login challenge from an invalid resend request.
- A login OTP must never be sufficient to authenticate a user unless its challenge was created through the legitimate password-login flow.
- Verify that registration OTP challenges cannot be used as login challenges or vice versa.
- Challenge tokens must be unpredictable, single-use, and securely validated.
- Enforce OTP expiry, attempt limits, resend cooldowns, and server-side rate limiting.
- Ensure resend attempts cannot reset security limits in a way that enables brute-force attacks.
- Prevent race conditions in which the same OTP challenge can be successfully consumed more than once.
- Return generic, safe errors where appropriate to avoid leaking account existence or sensitive authentication state.

Add regression tests that prove an invalid or missing challenge cannot bypass password verification.

## 4. Fix OTP Persistence Across Frontend and Backend

### Current concern

The OTP service uses process-local JavaScript `Map` storage. Challenges may disappear after a restart and may not be available to other server instances or a separate backend process.

### Required behavior

- Use the project's existing persistent database or an appropriate shared store for OTP challenges.
- Store challenge records securely, including the user ID, normalized email, challenge purpose, expiry, attempt count, resend state, and consumption state.
- Prefer storing a cryptographic hash of the OTP rather than the raw OTP. Use secure comparison and appropriate protection for low-entropy codes.
- Apply atomic updates or transactions for verification, attempt increments, resend operations, and one-time consumption.
- Ensure the challenge-creation and verification endpoints use the same persistent source of truth.
- Add expiry cleanup without deleting unrelated user records.
- If the current database integration is unavailable, fail safely and report a clear server error. Do not silently switch to an insecure in-memory production fallback.
- Preserve compatibility with the current local development architecture while documenting any required database migration.

Do not introduce an entirely new database or paid service without first checking the existing architecture and explaining why it is necessary.

## 5. Correct Brevo Email Delivery Handling

Review `lib/services/brevoEmailService.ts` and every OTP creation/resend route.

### Required behavior

- Clearly distinguish real Brevo API delivery requests from mock or simulation responses.
- A simulated email must never be reported as a real email delivery.
- If Brevo rejects a request, times out, or is unavailable, the API must not report that the OTP was successfully delivered.
- Do not issue an authenticated session until the correct OTP has been successfully verified.
- Handle partial failures safely. If a challenge was created but email delivery failed, invalidate or safely expire the unusable challenge, or implement a controlled retry strategy.
- Apply the same delivery checks to OTP resend.
- Validate sender and recipient configuration through the existing configuration mechanism without printing configuration values.
- Log only sanitized diagnostic information: event type, safe status code, and non-sensitive error classification.
- Never log the OTP, full recipient address, credentials, authorization headers, JWTs, cookies, or reset tokens.
- Keep the existing email template and authentication UI design unless a security fix requires a non-visual change.

Do not add development OTP logging that exposes verification codes. Use a safe local testing strategy that does not weaken authentication or leak codes.

## 6. Fix Registration and User Data Integrity

Review the registration route, OTP verification route, and user repositories together.

- Validate and normalize email addresses consistently.
- Enforce unique user email addresses at the database level where supported.
- Prevent duplicate registration races.
- Ensure unverified registrations cannot access protected customer features.
- Create or activate the account only after successful registration OTP verification.
- Persist each customer under a unique, immutable user ID.
- Prevent pending registration metadata from being trusted without validating the corresponding challenge and registration purpose.
- Ensure registration cannot assign privileged roles.
- Assign the `CUSTOMER` role server-side for normal registrations.
- Preserve legitimate existing accounts and data.
- Check whether the current authentication store and user repository write to different storage systems. Correct any inconsistencies without overwriting existing data.

## 7. Verify Customer Session and Data Isolation

Test and fix authentication so that different users never share an authenticated identity or access one another's private data.

Required tests:

1. Customer A registers and verifies their email.
2. Customer B registers and verifies a different email.
3. Customer A logs in and receives their own identity and session.
4. Customer B logs in independently and receives a different identity and session.
5. Logging out of one session does not authenticate another account.
6. Switching accounts does not retain the previous user's profile, addresses, cart, wishlist, or order data.
7. User A cannot retrieve, edit, or delete User B's private data by changing a user ID in an API request.
8. Each protected endpoint derives the authenticated user from a validated server-side session or token, not from an untrusted client-supplied user ID.
9. Invalid, expired, and revoked sessions are rejected.
10. Existing customer data remains intact.

Do not treat separate frontend profiles alone as proof of isolation. Verify the backend authorization and persistence logic.

## 8. Secure Admin Authentication and Authorization

Review the existing admin login, admin roles, session validation, middleware, and protected API endpoints.

- Keep admin and customer permissions distinct.
- Never grant admin privileges based on an email address or role supplied by the browser.
- Prevent registration, OTP metadata, profile updates, or customer API requests from assigning privileged roles.
- Verify admin roles server-side for every protected administrative operation.
- Ensure customer tokens cannot access admin endpoints.
- Ensure unauthenticated requests cannot access admin data.
- Preserve legitimate admin accounts and existing data.
- Do not reset, delete, or replace existing admin credentials.
- Add tests for unauthorized, customer-only, and authorized admin requests.

Do not assume admin protection is complete just because the UI hides admin navigation.

## 9. Fix and Safeguard the User Cleanup Script

Review `scripts/clean-users.ts`.

The current PostgreSQL deletion query appears to use two parameter placeholders while receiving three canonical email parameters. Verify and correct the query safely.

Before any execution:

- Determine which database and data store the script would target without reading or printing credentials.
- Correct the parameter handling and validate the deletion criteria.
- Ensure the local file cleanup and database cleanup cannot silently leave the stores inconsistent.
- Add a dry-run mode that reports counts without deleting records.
- Require explicit confirmation for destructive execution.
- Add a backup and recovery recommendation.
- Do not run the cleanup script or delete any records as part of this task.
- Do not assume the canonical account list is complete or safe for production without verification.

## 10. Automated Tests and Verification

Add or update automated tests for:

- Successful password + OTP login.
- Wrong password and unknown user.
- OTP expiry.
- Invalid OTP and maximum attempts.
- Resend cooldown and delivery failures.
- Invalid challenge token and challenge replay.
- Login-versus-registration challenge separation.
- Challenge persistence across service restarts or instances, where supported by the test environment.
- Duplicate registration and unverified account restrictions.
- Customer session and private-data isolation.
- Admin/customer role separation.
- Cookie security settings and invalid sessions.
- Brevo mock mode versus real API failure handling.
- User cleanup dry-run and query correctness.

Run the project's existing test suite, relevant focused tests, TypeScript checks, lint checks, and production build where practical.

Do not claim tests passed unless they were actually executed. Report any blocked tests, missing infrastructure, or failures honestly. Do not make the test suite pass by disabling tests or relaxing security assertions.

## 11. Environment and Secret Safety

Do not open, read, print, modify, copy, or commit environment files or secret values.

Do not display secrets in terminal output, code diffs, logs, test reports, screenshots, or final summaries.

If configuration is missing, state only the required variable **names** and the service where they need to be configured. Ask me to configure them through the appropriate local or hosting settings. Never ask me to paste the secret values into the chat.

Do not run commands that dump all environment variables or print credential-bearing configuration.

## 12. Preserve the Existing Frontend

The existing Veloura Living frontend is already implemented.

- Keep the current UI/UX, styling, authentication layout, OTP inputs, and responsive behavior unchanged.
- Do not redesign the login or registration pages.
- Do not add unrelated UI components or visual effects.
- Make only the minimum frontend code changes necessary to correctly handle loading, verification, resend, and safe error states.
- Preserve existing API contracts where practical; if an API contract must change for security, update its callers and tests consistently.

## 13. Completion Report

When implementation is complete, provide a concise report containing:

1. Root causes found.
2. Files changed and the purpose of each change.
3. Security fixes completed.
4. Database or schema changes required, if any.
5. Tests actually executed and their real results.
6. Remaining blockers and manual steps.
7. Confirmation that existing UI/UX was preserved.
8. Confirmation that no environment files or secret values were accessed, exposed, or modified.
9. Confirmation that no cleanup script or destructive database operation was executed.
10. A clear recommendation on whether the backend is ready for deployment, based on verified results.

**Execution order:** Audit → implement focused fixes → run tests → review the diff → report results. Do not deploy.

**Final priority:** Secure authentication, reliable OTP delivery, distinct customer accounts, and correctly enforced admin permissions — without redesigning the existing Veloura Living frontend.