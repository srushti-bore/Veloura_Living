# VELOURA LIVING — PRODUCTION AUTHENTICATION & MULTI-USER IDENTITY FIX

## ROLE

You are working on the existing Veloura Living repository:

`srushti-bore/Veloura_Living`

This is a production-oriented premium furniture ecommerce application.

Your task is to audit and fix the COMPLETE authentication, user identity, customer account isolation, admin authentication, authorization, session, and database persistence architecture.

---

# 🚨 ABSOLUTE NON-NEGOTIABLE RULE

## DO NOT CHANGE THE EXISTING FRONTEND UI/UX/DESIGN.

The current Veloura Living frontend is already designed and approved.

Do NOT:

- redesign pages
- change layouts
- change colors
- change typography
- change spacing
- change cards
- change animations
- change hero sections
- change navigation
- change product UI
- change checkout visual design
- introduce a new design system
- replace existing authentication UI unnecessarily
- add unnecessary visual components

You are fixing the AUTHENTICATION / BACKEND / DATA / SECURITY architecture.

If an existing UI component already provides login/signup/admin login functionality, reuse it and wire it correctly.

Only make the minimum UI changes required for correct authentication behavior, routing, loading states, and error handling.

---

# 1. FIRST — AUDIT THE CURRENT REPOSITORY

Before modifying anything, inspect the complete repository.

Pay special attention to:

- `lib/data/authStore.ts`
- `providers/AuthProvider.tsx`
- `lib/auth/jwt.ts`
- `lib/auth/session.ts`
- `lib/auth/rbac.ts`
- `app/api/auth/**`
- `app/api/admin/**`
- `app/api/user/**`
- checkout routes/components
- wishlist implementation
- cart implementation
- order implementation
- profile/address implementation
- Google OAuth implementation
- admin dashboard
- existing database/schema files
- environment configuration
- existing tests

Do NOT blindly replace existing architecture.

Preserve working functionality and integrate the proper persistent authentication layer into the current project.

---

# 2. CURRENT CRITICAL PROBLEM

The current authentication implementation contains:

```ts
const globalUsers: Map<string, UserRecord> = new Map();
```

inside:

`lib/data/authStore.ts`

This is NOT acceptable for production multi-user authentication.

Users must NOT depend on process memory.

The following must become persistent:

- users
- passwords
- roles
- profiles
- addresses
- Google identity
- account status
- login security state
- password reset state
- email verification state
- user-owned ecommerce data

---

# 3. IMPLEMENT REAL DATABASE-BACKED AUTHENTICATION

Use PostgreSQL as the source of truth.

Development:

```text
Local PostgreSQL
```

Production:

```text
Supabase PostgreSQL
```

The implementation must remain compatible with both.

Inspect the repository first.

If an existing database layer exists, extend it.

If there is no usable persistence layer, introduce a clean PostgreSQL data-access layer using a production-safe approach such as Prisma or another appropriate PostgreSQL repository abstraction.

Do NOT use an in-memory Map as the source of truth.

The architecture must support:

```text
API Route
   ↓
Auth Service
   ↓
User Repository
   ↓
PostgreSQL
```

---

# 4. USER IDENTITY MODEL

Every registered customer must receive a unique immutable `user.id`.

Example:

```text
User A
id = UUID-A

User B
id = UUID-B

User C
id = UUID-C
```

Never identify a user internally only by email.

Email should be unique, but `user.id` must be the primary identity.

Use `user.id` for ownership and authorization.

---

# 5. CUSTOMER REGISTRATION

Existing customer registration must create a persistent database record.

Required behavior:

1. Validate email.
2. Normalize email.
3. Check unique email.
4. Hash password using the existing secure password hashing implementation.
5. Create unique user ID.
6. Create CUSTOMER role.
7. Create profile.
8. Persist everything in PostgreSQL.
9. Create authenticated session.
10. Return the authenticated user.
11. Never create duplicate users for the same email.

Two different users must be able to register independently.

Example:

```text
alice@example.com
bob@example.com
```

must become two separate persistent accounts.

---

# 6. CUSTOMER LOGIN

Customer login must:

1. Find user from PostgreSQL.
2. Verify password.
3. Check account status.
4. Check lockout state.
5. Create authenticated session.
6. Store user identity in secure HTTP-only cookie/session.
7. Return the authenticated user.
8. Load profile and user-owned data using `user.id`.

Do NOT use hardcoded demo users as the normal authentication mechanism.

---

# 7. LOGOUT

Logout must invalidate/remove the active session securely.

After logout:

```text
user = null
profile = null
addresses = []
private account data = inaccessible
```

A previously authenticated customer must not remain authenticated after logout.

---

# 8. USER DATA ISOLATION

This is extremely important.

Customer A must NEVER see Customer B's private data.

All user-owned resources must be scoped using authenticated `user.id`.

Examples:

```text
GET /api/user/profile
GET /api/user/addresses
GET /api/user/orders
GET /api/user/wishlist
GET /api/user/cart
GET /api/user/reviews
```

must use:

```ts
session.userId
```

or equivalent server-side authenticated identity.

Never trust:

```text
userId
email
customerId
```

sent by the frontend for authorization.

Example:

If Customer A manually changes:

```text
/api/user/orders?userId=B
```

the server must still return only Customer A's authorized data.

---

# 9. CART OWNERSHIP

Cart must be associated with the authenticated user's ID.

Example:

```text
Customer A
user_id = A
cart_id = cart-A

Customer B
user_id = B
cart_id = cart-B
```

Customer A must never receive Customer B's cart.

Guest cart behavior may remain supported according to the existing checkout architecture, but when a guest authenticates, implement safe cart merging without overwriting another user's cart.

---

# 10. WISHLIST OWNERSHIP

Wishlist must be tied to:

```text
user.id
```

Customer A's wishlist must never appear for Customer B.

Logout/login as another customer must load the second customer's wishlist.

---

# 11. ORDER OWNERSHIP

Orders must be permanently associated with:

```text
user_id
```

For authenticated customers:

```text
order.user_id = authenticatedSession.userId
```

Never accept arbitrary `user_id` from the browser during order creation.

A customer can only access their own orders.

Admin/staff access may be allowed according to RBAC.

---

# 12. PROFILE AND ADDRESS OWNERSHIP

Profile and addresses must use the authenticated user's ID.

Customer A cannot:

- read Customer B's profile
- update Customer B's profile
- delete Customer B's address
- add an address to Customer B's account

All mutations must derive ownership from the authenticated session.

---

# 13. ADMIN AUTHENTICATION

Create a proper administrative authentication flow.

Preferred structure:

```text
/customer login
/admin/login
```

The admin area must NOT rely on the customer simply navigating to:

```text
/admin
```

Unauthenticated users accessing:

```text
/admin
```

must be redirected to:

```text
/admin/login
```

An authenticated CUSTOMER must also be denied access to the admin area.

---

# 14. ADMIN LOGIN

Admin login must authenticate against the PostgreSQL database.

Admin account must have a proper role such as:

```text
ADMIN
```

or another existing staff role defined by the current RBAC system.

Do NOT hardcode:

```text
admin@velouraliving.com
VelouraAdmin2026!
```

inside frontend code.

Do NOT expose admin credentials through:

- UI
- demo buttons
- source code
- client-side constants
- public environment variables

---

# 15. ADMIN SEEDING

If an initial admin account is required, create it through a secure server-side seed mechanism.

For example:

```text
scripts/seed-admin.ts
```

or an equivalent database seed mechanism.

Admin credentials must come from secure environment variables during seeding.

Example:

```text
ADMIN_EMAIL
ADMIN_PASSWORD
```

Do NOT put the actual password into source code.

The seed must:

- create the admin only if missing
- hash the password
- assign ADMIN role
- create profile
- never expose the password to the browser

---

# 16. REMOVE DEMO ADMIN QUICK LOGIN

The existing Admin Dashboard contains demo/fast-access credentials.

Remove production demo login behavior such as:

```text
1-Click Master Admin
Concierge / Manager
```

Do not keep hardcoded credentials in the UI.

The admin dashboard should operate only after successful authentication.

---

# 17. ADMIN RBAC

Use the existing RBAC implementation where possible.

Existing roles include concepts such as:

```text
ADMIN
MANAGER
PRODUCT_MANAGER
ORDER_MANAGER
CUSTOMER
```

Preserve the existing role model unless the database implementation requires normalization.

ADMIN:

```text
full administrative access
```

MANAGER:

```text
approved management permissions
```

PRODUCT_MANAGER:

```text
product/catalog related permissions
```

ORDER_MANAGER:

```text
order related permissions
```

CUSTOMER:

```text
customer-only permissions
```

---

# 18. SERVER-SIDE AUTHORIZATION

This is mandatory.

Never rely only on:

```ts
isAdmin
isManager
```

from React.

Frontend role checks are only for UI.

Every sensitive API endpoint must independently validate:

```text
authenticated session
+
user role
+
permission
+
resource ownership where applicable
```

Example:

```text
/api/admin/products
/api/admin/orders
/api/admin/customers
/api/admin/reviews
/api/admin/returns
/api/admin/cms
/api/admin/analytics
```

must perform server-side authorization.

A CUSTOMER manually calling these APIs must receive:

```text
401 Unauthorized
```

or:

```text
403 Forbidden
```

as appropriate.

---

# 19. ADMIN CUSTOMER DATA ACCESS

Admin/staff users may access customer data only according to their role and permissions.

Customer privacy must still be respected.

Do not allow arbitrary role escalation from request payloads.

Never trust:

```text
role: "ADMIN"
```

from the client.

Roles must come from the database/session.

---

# 20. JWT SECURITY

Inspect the current:

```text
lib/auth/jwt.ts
```

The current code has a fallback JWT secret.

Remove insecure production fallback behavior.

Do NOT use:

```ts
process.env.JWT_SECRET || 'hardcoded-secret'
```

Production must require:

```text
JWT_SECRET
```

from the environment.

If the secret is missing in production, fail securely rather than silently using a default secret.

---

# 21. JWT EXPIRATION

Keep the SRS-aligned expiration strategy.

Current intended values:

```text
Access token: 15 minutes
Refresh token: 7 days
```

Ensure implementation is internally consistent.

Do not create a cookie that claims to live for 7 days while the underlying token expires after 15 minutes unless an actual refresh-token mechanism exists.

If refresh tokens are implemented:

- persist/track refresh tokens securely
- rotate refresh tokens where appropriate
- revoke them on logout
- prevent replay

If the current application only needs a short-lived session for this phase, implement a consistent secure session strategy rather than pretending a refresh-token flow exists.

---

# 22. HTTP COOKIE SECURITY

Authentication cookies must use appropriate security attributes:

```text
HttpOnly
Secure in production
SameSite=Lax or stricter where appropriate
appropriate Path
reasonable Max-Age
```

Do not store authentication tokens in:

```text
localStorage
sessionStorage
```

unless there is a specific unavoidable reason.

---

# 23. GOOGLE OAUTH

Preserve the existing Google OAuth 2.0 implementation.

However, make it database-backed.

Google login behavior:

### Existing user

If Google email matches an existing account:

```text
login existing user
```

Do NOT create a duplicate customer.

### New Google user

Create:

```text
unique user.id
CUSTOMER role
verified email
Google identity mapping
profile
```

and persist it to PostgreSQL.

Google account identity should be stored separately or through the appropriate identity/provider fields.

Never use a dummy in-memory-only account.

---

# 24. GOOGLE + PASSWORD ACCOUNT LINKING

If a customer initially registered using:

```text
email + password
```

and later uses Google with the same verified email, do not create a second customer.

Link the OAuth identity to the existing account according to the application's security rules.

Do not automatically merge accounts with conflicting identities without verification.

---

# 25. PASSWORD RESET

Preserve the existing SRS behavior.

Password reset tokens must be persisted in the database.

Do NOT store reset tokens only in:

```text
Map
```

or process memory.

Requirements:

```text
single-use
expiration
secure random token
invalidate after successful password reset
```

---

# 26. EMAIL VERIFICATION

Email verification tokens must be database-backed.

Requirements:

```text
secure token
24-hour expiration
single-use
invalidate after verification
```

Do not keep verification state only in memory.

---

# 27. LOGIN LOCKOUT / SECURITY

Preserve the existing SRS requirement:

```text
5 failed attempts within 15 minutes
→ 15-minute lockout
```

But persist the security state in PostgreSQL.

Do not store failed login counters only in memory.

Consider rate limiting at the API layer as an additional protection.

---

# 28. CHECKOUT IDENTITY

Audit all checkout routes.

The current checkout implementation may contain demo/default customer information.

Remove hardcoded/demo customer identity from production checkout behavior.

Authenticated checkout must use:

```text
authenticated user.id
```

for:

- customer identity
- address
- order creation
- order ownership
- payment metadata
- order tracking

Do NOT allow the browser to choose another customer's identity.

---

# 29. GUEST CHECKOUT

Preserve the SRS requirement for guest checkout.

Guest checkout must remain possible if already implemented.

Guest orders must use a secure guest identity/order tracking mechanism.

After guest checkout:

```text
order number
+
email/phone
```

can be used for tracking according to the SRS.

Do not expose sensitive customer information through order tracking.

---

# 30. CUSTOMER LOGIN SESSION SWITCHING

This exact scenario must work:

### Step 1

Login:

```text
alice@example.com
```

Alice sees:

```text
Alice profile
Alice addresses
Alice cart
Alice wishlist
Alice orders
```

### Step 2

Logout.

### Step 3

Login:

```text
bob@example.com
```

Bob must see:

```text
Bob profile
Bob addresses
Bob cart
Bob wishlist
Bob orders
```

Alice's private data must not remain in React state, cookies, API responses, or client-side caches.

---

# 31. ADMIN / CUSTOMER SESSION ISOLATION

Test:

```text
Customer → /admin
```

must be denied.

Test:

```text
Admin → customer private account endpoints
```

must only be allowed where explicit admin permission exists.

Test:

```text
Customer manipulates role payload
```

must NOT grant admin access.

---

# 32. AUTH PROVIDER

Update:

```text
providers/AuthProvider.tsx
```

only as necessary.

It should:

- load current authenticated user
- clear stale user state
- handle login
- handle registration
- handle logout
- refresh session
- load profile
- load addresses
- expose role/permissions

Do not change the visual authentication experience unless technically necessary.

---

# 33. AUTH ME ENDPOINT

Audit:

```text
/api/auth/me
```

It must:

1. validate session
2. load user from PostgreSQL
3. load roles
4. load profile
5. load addresses
6. return only data appropriate to the current user
7. reject invalid/stale sessions

Never reconstruct the user from untrusted client data.

---

# 34. DATABASE SCHEMA

Design the minimum production-ready schema needed for authentication.

At minimum support concepts equivalent to:

```text
users
roles
user_roles
profiles
addresses
oauth_accounts / auth_identities
sessions or refresh_tokens
password_reset_tokens
email_verification_tokens
```

Use UUID primary keys where appropriate.

Add:

```text
unique(email)
```

and required indexes/foreign keys.

Use proper cascading behavior carefully.

Do not destroy existing ecommerce data relationships.

---

# 35. EXISTING ECOMMERCE DATA

Do not break existing:

- products
- variants
- categories
- inventory
- cart
- wishlist
- orders
- reviews
- returns
- coupons
- CMS
- payments
- Razorpay
- AI features

If these currently use temporary/mock/in-memory storage, document that separately.

For THIS task, authentication/user identity must become the reliable source of identity.

---

# 36. ENVIRONMENT VARIABLES

Actual `.env` files must remain untracked.

Keep:

```text
.env
.env.local
.env.production.local
```

in `.gitignore`.

`.env.example` may be committed.

Never commit:

```text
JWT_SECRET
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET
SUPABASE_SERVICE_ROLE_KEY
GEMINI_API_KEY
SMTP_PASS
Google OAuth client secret
database passwords
```

---

# 37. ENVIRONMENT VALIDATION

Create a safe server-side environment validation mechanism.

Required production secrets should fail fast if missing.

Do NOT silently fall back to insecure hardcoded credentials.

Never expose server-only secrets through:

```text
NEXT_PUBLIC_*
```

---

# 38. EXISTING ENV EXAMPLE

Review `.env.example`.

Keep it as a template only.

Replace obviously fake-but-secret-looking defaults with safe placeholders where appropriate.

Example:

```text
JWT_SECRET="replace-with-a-secure-random-secret"
```

Do not place real credentials in `.env.example`.

---

# 39. DATABASE CONFIGURATION

Support:

### Local development

```text
DATABASE_URL=postgresql://...
```

### Production

Supabase PostgreSQL connection.

Keep database access server-side.

Do not expose:

```text
DATABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

to the browser.

---

# 40. ADMIN ROUTE PROTECTION

Protect:

```text
/admin
/admin/*
```

using server-side authentication/authorization.

Do not depend solely on React rendering conditions.

If Next.js middleware is appropriate, use it.

Otherwise implement secure server-side guards at the route/page/API level.

Do not introduce unnecessary middleware complexity if the current architecture has another reliable server-side protection mechanism.

---

# 41. API SECURITY AUDIT

Search the complete repository for:

```text
/api/admin
/api/user
/api/auth
```

and inspect every endpoint.

For each protected endpoint verify:

```text
Authentication?
Authorization?
Ownership?
Input validation?
```

Fix any endpoint that trusts:

```text
userId
role
email
admin
isAdmin
```

from request body/query parameters.

---

# 42. HARDCODED DEMO DATA AUDIT

Search for:

```text
admin@velouraliving.com
client@example.com
concierge@velouraliving.com
VelouraAdmin2026!
demo
mock user
default customer
default address
hardcoded user id
```

Remove these from runtime authentication logic.

If demo/test fixtures are needed for automated tests, isolate them under test/seed fixtures and never expose them in production UI.

---

# 43. UI PRESERVATION

Do NOT change:

- colors
- fonts
- page layouts
- component styling
- animations
- cards
- buttons
- spacing
- responsive design
- hero sections

The only allowed UI behavior changes are:

```text
redirect unauthenticated user to correct login
show authenticated user's actual information
show correct role state
show proper auth errors
remove demo credentials
```

---

# 44. ERROR HANDLING

Authentication errors must be safe.

Do not reveal whether an email exists during password-reset requests.

Do not expose:

```text
database errors
stack traces
JWT secrets
password hashes
internal IDs unnecessarily
```

Use clean user-facing messages.

---

# 45. TESTING — MANDATORY

Create/update automated tests for:

## Customer

- registration
- duplicate email
- login
- wrong password
- logout
- session restoration
- profile isolation
- address isolation
- cart isolation
- wishlist isolation
- order isolation

## Multi-user

Create:

```text
User A
User B
```

Verify A cannot access B's data.

## Admin

- admin login
- customer denied from admin
- manager role behavior
- unauthorized API access denied
- admin API authorization
- role escalation attempt denied

## Google OAuth

- existing email does not duplicate
- new Google user creates customer
- identity persists

## Security

- missing JWT_SECRET in production fails safely
- expired token rejected
- invalid token rejected
- logout invalidates session
- reset token expires
- verification token expires
- lockout works
- rate limiting/security checks work where implemented

---

# 46. BUILD VALIDATION

After implementation run:

```bash
npm run build
```

and existing test suites where compatible.

Fix:

- TypeScript errors
- ESLint/build errors
- runtime errors
- API errors
- broken imports

Do not finish with known build failures.

---

# 47. FINAL ACCEPTANCE TEST

The implementation is NOT complete until this exact flow works:

### Customer A

Register:

```text
alice@example.com
```

Login.

Verify:

```text
Alice profile
Alice address
Alice cart
Alice wishlist
Alice orders
```

### Logout

### Customer B

Register:

```text
bob@example.com
```

Login.

Verify:

```text
Bob profile
Bob address
Bob cart
Bob wishlist
Bob orders
```

Verify Alice's data is NOT visible.

### Admin

Login using the secure seeded admin account.

Verify:

```text
/admin
```

works.

### Customer

Login as customer and attempt:

```text
/admin
/api/admin/*
```

Must be denied.

### Security

Attempt to modify:

```text
userId
role
email
```

from the browser request.

The server must ignore unauthorized identity changes.

---

# 48. IMPORTANT ARCHITECTURAL RULE

Do NOT simply replace:

```ts
globalUsers
```

with another in-memory object.

The final source of truth MUST be PostgreSQL.

The application should survive:

- server restart
- deployment
- multiple server instances
- Vercel serverless execution
- Render backend execution
- Supabase production database

without losing users.

---

# 49. DO NOT REWRITE THE WHOLE PROJECT

This is an authentication/data architecture correction.

Do not rebuild Veloura Living from scratch.

Do not replace the frontend.

Do not migrate unrelated features unnecessarily.

Modify only what is required to make authentication and identity production-ready.

---

# 50. FINAL DELIVERABLES

After implementation, provide a concise technical report containing:

### A. Root causes found

Example:

```text
1. In-memory auth store
2. Hardcoded admin credentials
3. JWT fallback secret
4. Missing persistent OAuth identity
5. Insufficient server-side admin protection
6. Demo checkout identity
```

### B. Files changed

List every modified/created file.

### C. Database changes

List tables/schema/migrations created.

### D. Environment variables required

List required variables without exposing their secret values.

### E. Authentication flow

Explain:

```text
Customer registration
Customer login
Google login
Logout
Admin login
RBAC
Session
```

### F. Testing result

Report:

```text
Build: PASS/FAIL
Tests: PASS/FAIL
Customer isolation: PASS/FAIL
Admin authorization: PASS/FAIL
```

---

# FINAL SUCCESS CONDITION

Veloura Living must behave like a real multi-user production ecommerce application:

```text
Customer A
      ↓
Own persistent account
      ↓
Own profile
Own address
Own cart
Own wishlist
Own orders
      ↓
Logout

Customer B
      ↓
Own completely separate account
      ↓
Own data only
```

and:

```text
Admin
   ↓
Separate administrative authentication
   ↓
RBAC
   ↓
Protected admin APIs
   ↓
Admin dashboard
```

while the existing Veloura Living frontend UI/UX/design remains unchanged.

DO NOT consider the task complete merely because the login button works.

The task is complete only when the underlying identity, persistence, authorization, ownership isolation, and security architecture are correct.