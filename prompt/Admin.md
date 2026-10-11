# Veloura Living — Secure Single Admin Finalization

## Objective

Finalize **Single Admin with Full Access** for the existing Veloura Living application in the repository `srushti-bore/Veloura_Living`.

The admin email will be a dedicated email address controlled by the project owner. Admin account creation must use a secure, one-time server-side bootstrap process.

This is a focused security and backend task. The existing frontend UI/UX is already implemented and MUST remain unchanged.

## Mandatory Safety Restrictions

1. Never open, read, print, modify, overwrite, copy, or expose any `.env` file or any `.env.*` file. This includes `.env`, `.env.local`, `.env.production`, and `.env.example`.
2. Never reveal, log, or commit environment-variable values, passwords, API keys, database URLs, JWT secrets, OTPs, or other credentials.
3. Do not run commands that dump environment variables or expose secrets.
4. Do not make changes to the existing visual design, styling, layouts, fonts, animations, navigation, or user-facing login/register experience.
5. Do not hardcode admin credentials, passwords, email addresses, bootstrap tokens, or environment-specific configuration into application code.
6. Do not delete existing customer accounts, orders, or other production data.
7. Inspect the existing implementation before changing it. Reuse existing authentication, PostgreSQL, password-hashing, and repository utilities where appropriate.
8. Do not claim deployment or tests succeeded unless actually verified.

## Phase 1 — Audit Existing Authentication and Admin Initialization

Inspect the relevant existing files, including:

- `lib/data/userRepository.ts`
- `lib/data/authStore.ts`
- `lib/auth/password.ts`
- `app/api/auth/login/route.ts`
- `app/api/auth/verify-otp/route.ts`
- `scripts/seed-admin.ts`
- `package.json`
- Database setup/migrations and existing authorization middleware
- Both the Next.js API routes and standalone Express backend in `backend/src/`

Do not inspect any environment files.

Document the existing account-creation paths, role persistence, authentication/session handling, and every location where ADMIN access can be granted.

Identify and eliminate insecure default credential fallbacks and automatic privileged-account seeding. Specifically investigate the existing default Admin, Manager, and demo Customer seeds.

Do not blindly remove or migrate existing database records. Prepare a safe migration/reconciliation plan for existing accounts and roles.

## Phase 2 — Establish the Single Admin Policy

Implement these rules consistently across both backend entry points wherever applicable:

- Exactly one approved account may hold the `ADMIN` role.
- The Admin account uses a dedicated owner-controlled email configured outside source code.
- Public registration, Google sign-in, customer profile updates, and ordinary API requests must never grant ADMIN privileges.
- A customer or manager must not be able to self-promote through request payloads, role fields, or direct API calls.
- All privileged API endpoints must enforce server-side authorization; hiding frontend controls is insufficient.
- Keep customer roles and customer-specific data isolated.
- Preserve existing authentication, mandatory email OTP verification, password reset, and secure session-cookie behavior.
- Admin access must remain valid across process restarts, deployments, and multiple application instances.
- PostgreSQL/Supabase must be authoritative in production. Do not rely on process memory or local JSON files for production Admin identity or role authorization.
- Do not silently grant CUSTOMER when a database role lookup fails for a privileged account. Handle missing or unavailable role data safely.

## Phase 3 — Implement a Secure One-Time Admin Bootstrap

Refactor the existing `scripts/seed-admin.ts` rather than introducing an unnecessary duplicate script, unless the existing structure makes reuse unsafe.

The bootstrap must:

1. Run as an explicit server-side CLI/operational command, not as a public HTTP endpoint.
2. Require the owner-provided Admin email and a strong initial password through approved server-side configuration. If required configuration is missing, fail closed. Never use default or demo credentials.
3. Never print passwords, hashes, secrets, or sensitive configuration values.
4. Require a working PostgreSQL connection and use the existing schema, role tables, password hashing, and persistence utilities.
5. Use a database transaction and appropriate concurrency protection so two simultaneous bootstrap executions cannot create multiple Admin accounts.
6. Create the Admin identity and its role assignment atomically, including the required user/profile/role records.
7. Enforce the single-Admin invariant using database-level constraints or a safe transactional strategy compatible with the existing schema.
8. Be idempotent without resetting the existing Admin password or silently promoting another account.
9. Record successful bootstrap completion persistently in the database, so restarts and redeployments cannot repeat privileged initialization.
10. Refuse unsafe situations, including missing configuration, unavailable database, an existing conflicting Admin identity, multiple existing Admin accounts, or ambiguous legacy-account ownership.
11. Never expose a public bootstrap endpoint, unauthenticated account-promotion route, or reusable bootstrap secret.
12. Use explicit, documented recovery/migration procedures for existing installations. If a legacy Admin already exists, do not overwrite its password or create another Admin automatically.

If the current database schema cannot enforce the required invariants safely, implement the smallest compatible migration and document it. Do not invent a separate parallel user system.

## Phase 4 — Remove Insecure Credential Paths

- Remove hardcoded fallback Admin passwords from repository initialization and the Admin seeder.
- Remove password-verification shortcuts that accept known demo passwords independently of the stored password hash.
- Remove automatic creation of privileged demo accounts.
- Stop production startup from automatically promoting or recreating an Admin.
- Preserve existing legitimate customer data and customer registration behavior.
- Do not automatically delete existing Manager or Customer records. Remove inappropriate default seeding and reconcile existing role assignments safely.
- Ensure the bootstrap never resets an existing password as a side effect of initialization.
- Verify that database persistence errors are awaited, surfaced safely, and never silently ignored for privileged-account creation.

## Phase 5 — Authorization and Authentication Verification

Verify the complete existing login flow:

1. Admin submits email and password.
2. Password is checked against the stored hash.
3. The existing mandatory OTP challenge is dispatched and verified.
4. The authenticated session is issued only after successful OTP verification.
5. The server derives the user's roles from authoritative persisted data.
6. The Admin receives access to authorized administrative operations.
7. A normal customer cannot access Admin APIs, even if they manipulate frontend state, URL paths, request bodies, or role fields.
8. Expired, invalid, or incorrectly scoped sessions are rejected.

Audit both Next.js and Express routes. If they share or duplicate authentication logic, ensure they enforce the same role policy and persistent identity source. Do not introduce an alternate authentication path that bypasses OTP or session validation.

## Phase 6 — Required Automated Tests

Add or update tests for:

- Successful one-time Admin bootstrap.
- Missing initial credentials/configuration fails safely.
- No default password or hardcoded credential fallback exists.
- Re-running bootstrap does not reset the Admin password or duplicate the account.
- Concurrent bootstrap executions cannot create multiple Admins.
- Existing conflicting or multiple Admin records cause a safe failure.
- A customer cannot become Admin through registration, Google sign-in, or profile/API updates.
- Customer sessions cannot access Admin endpoints.
- Admin access requires successful password and OTP verification.
- Admin role persistence works across repository reinitialization.
- Production database failure never silently falls back to local demo accounts.
- Existing customer accounts, orders, and customer-specific data remain intact.
- Both Next.js and Express authorization paths are covered where they expose privileged operations.

Run the relevant authentication tests, type checking, and production build where available. Report actual results, including any failures.

## Phase 7 — Configuration and Deployment Instructions

Do not modify or inspect any environment files.

Document only the required configuration variable NAMES, their purpose, and which deployment environment needs them. The owner will enter all values manually through the appropriate local or hosting dashboard.

Provide separate instructions for:

- Local development using the intended local database.
- Production PostgreSQL/Supabase initialization.
- Running the one-time bootstrap securely.
- Verifying the initial Admin login and email OTP delivery.
- Safely handling an existing legacy Admin account.
- Confirming no second Admin can be created.
- Deploying the code after bootstrap without repeating account creation.

Never include example passwords, actual credentials, secret values, or a fabricated Admin email.

## Phase 8 — Final Report

Return a concise implementation report with:

1. Root causes discovered.
2. Files changed and the reason for each change.
3. Database migrations, if any.
4. The exact safe bootstrap command, without any credential values.
5. Required configuration variable names only.
6. Test/build results.
7. Manual steps the owner must complete.
8. Confirmation that existing frontend UI/UX was preserved.
9. Any unresolved security issues.

## Acceptance Criteria

The task is complete only when there is one owner-controlled Admin identity, no default privileged credentials, no public Admin-promotion path, mandatory OTP remains enforced, Admin authorization is checked server-side, production identity/roles persist in PostgreSQL, and the bootstrap cannot create duplicates or reset credentials on redeployment.

Do not redesign the frontend. Do not access environment files or expose secrets. Prioritize correctness, data safety, and secure deployment over cosmetic refactoring.

- Read the admin email exclusively from the server-side `ADMIN_EMAIL` environment variable configured in the hosting platform where the admin bootstrap runs.
- Do not hardcode any admin email in the source code.
- The secure one-time bootstrap must create the single Admin account using the configured `ADMIN_EMAIL`.
- Provide clear step-by-step instructions explaining where to configure `ADMIN_EMAIL` in the deployment platform and how to run the bootstrap safely.
- Never read, print, modify, or expose any `.env` files or secret values.
- Preserve the existing frontend UI/UX.
