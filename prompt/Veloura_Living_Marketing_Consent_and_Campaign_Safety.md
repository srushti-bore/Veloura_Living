# Veloura Living — Marketing Consent & Campaign Safety Implementation

## Objective

Prepare the existing Veloura Living application and Supabase database for a future n8n-based festive email marketing workflow using Brevo.

Implement marketing consent persistence, unsubscribe management, and reliable campaign deduplication before enabling any real promotional email campaigns.

## Existing Architecture

- Frontend: Existing Veloura Living application
- Backend: Existing deployed architecture
- Database: Supabase PostgreSQL
- Authentication emails: Existing Brevo OTP integration
- Marketing automation: n8n, to be configured separately

## Phase 1: Repository and Schema Audit

Inspect the existing repository, database schema, migrations, checkout implementation, footer newsletter form, authentication flow, and Brevo integration.

Verify the existing `users`, `profiles`, and related tables before designing changes.

Do not assume a particular schema or implementation exists without verifying it.

## Phase 2: Marketing Consent

1. Add an appropriate persistent marketing-consent field using a database migration.
2. Default existing and newly created customers to not opted in unless valid consent is explicitly captured.
3. Connect the existing checkout `keepUpdated` checkbox to a secure backend endpoint that persists the customer's explicit choice.
4. Ensure that unchecking the box does not grant consent.
5. If the footer newsletter form is connected, persist consent only after an explicit affirmative subscription action and validate the submitted email.
6. Store consent timestamps and, where appropriate, consent source.
7. Prevent users from changing another customer's preferences without authorization.
8. Preserve the existing checkout UI/UX and authentication functionality.

## Phase 3: Unsubscribe Management

1. Implement a secure unsubscribe mechanism suitable for marketing emails.
2. Persist unsubscribe status in Supabase.
3. Ensure that unsubscribed customers are excluded from all subsequent marketing campaigns.
4. Make unsubscribe processing idempotent.
5. If Brevo unsubscribe events or webhooks are used, validate the event source according to the provider's supported verification mechanism.
6. Keep transactional authentication emails logically separate from promotional emails.
7. Do not automatically re-subscribe customers when a new festival campaign is created.

## Phase 4: Campaign Tracking and Duplicate Prevention

1. Design a suitable campaign-tracking schema with appropriate foreign keys, timestamps, status fields, and indexes.
2. Enforce a database-level uniqueness constraint for the intended campaign/customer combination.
3. Track campaign identifiers, customer identifiers, processing status, provider response identifiers when available, and failure details without storing unnecessary personal information.
4. Prevent concurrent workflow executions from sending the same campaign to the same customer more than once.
5. Implement safe retry handling. Do not retry an ambiguous provider outcome blindly if that could produce duplicate emails.
6. Distinguish between pending, processing, accepted by provider, delivered where confirmed, and failed outcomes as appropriate.
7. Provide a safe mechanism for n8n to claim a campaign/customer send job and record its result.

## Phase 5: Security and Testing

- Use migrations compatible with the existing Supabase PostgreSQL schema.
- Preserve existing authentication and Brevo OTP behavior.
- Keep all credentials server-side; never expose service-role keys or Brevo API keys in frontend code.
- Never access, read, print, or modify `.env` files or actual secrets.
- Do not send any real promotional emails during implementation or testing.
- Do not create or launch a live n8n campaign.
- Add tests for consent granted, consent absent, unsubscribe, duplicate requests, concurrent attempts, retries, and unauthorized preference changes.
- Test that existing users remain opted out unless valid consent has been recorded.
- Preserve the existing frontend UI/UX and avoid unrelated refactoring.

## Deliverables

1. Database migrations and schema changes.
2. Backend endpoints and validation logic.
3. Checkout and newsletter consent persistence where applicable.
4. Unsubscribe processing.
5. Campaign deduplication and tracking mechanisms suitable for n8n integration.
6. Automated test results.
7. The exact secure interface or database function n8n should use to retrieve eligible customers and claim campaign sends.
8. A report of files changed, migrations added, test results, and any remaining limitations.
