# Veloura Living — Fix Mandatory OTP Authentication and Brevo Transactional Emails

## Objective

Debug and fix the existing local-development authentication and transactional email flows in Veloura Living.

The frontend and backend run as separate local servers. The application uses the Brevo API for transactional email.

### Strict constraints

- Do not open, read, print, modify, expose, or copy any `.env`, `.env.*`, secret file, credential file, or environment variable value.
- Do not reveal API keys, tokens, passwords, OTP values, or other secrets in terminal output, logs, reports, or source changes.
- Do not change the existing frontend UI/UX, styling, layouts, typography, routes, or design.
- Reuse the existing architecture and components wherever possible.
- Do not hardcode credentials, email addresses, frontend/backend URLs, OTPs, or configuration values.
- Do not replace the existing authentication provider or email architecture without first establishing what the project currently uses.
- Do not claim that email delivery works unless it has been verified through provider responses and delivery logs.

## Task 1: Audit the existing authentication flow

Trace the current signup, login, OTP generation, OTP email delivery, OTP verification, session creation, and protected-route logic.

Identify why login currently succeeds without mandatory OTP verification.

Determine whether authentication is handled by the custom backend, Supabase Auth, or another existing provider. Preserve the existing provider and architecture.

## Task 2: Enforce mandatory OTP verification

Implement or repair the existing flow so that:

1. A login or signup attempt follows the project's intended authentication policy.
2. The backend generates a secure, unpredictable OTP when required.
3. The OTP is delivered through the existing Brevo API integration.
4. The OTP is associated with the correct user and verification challenge.
5. The backend validates the submitted OTP.
6. Expired, incorrect, reused, or invalidated OTPs are rejected.
7. Rate limiting and resend cooldowns prevent abuse.
8. The authenticated session or access token is issued only after the required verification succeeds.
9. Protected backend endpoints independently enforce authentication and authorization.
10. A frontend-only flag or client-side redirect cannot bypass verification.

Follow the current project's security practices for OTP storage, expiry, attempt limits, and session management. Do not log OTP values.

If the project uses Supabase Auth, inspect its actual session and email-confirmation behaviour. Do not create a parallel custom authentication flow unnecessarily.

## Task 3: Repair Brevo transactional email delivery

Inspect the existing email-sending service and its call sites.

Check:

- Whether the OTP email function is actually invoked.
- Whether the order confirmation email function is actually invoked.
- Whether the existing Brevo endpoint, HTTP method, payload, sender and recipient mappings are correct.
- Whether asynchronous requests are awaited and failures are handled.
- Whether provider responses and errors are being silently swallowed.
- Whether required sender or account verification is configured.

Use the project's existing configuration mechanism without opening or exposing environment files or secrets.

Add safe diagnostic logs containing event names, HTTP status codes, and sanitized error details only. Never log credentials, authorization headers, OTP values, full email content, or sensitive customer information.

Return actionable errors to the existing frontend without changing its design.

## Task 4: Repair order confirmation email triggering

Trace the existing verified payment and order-creation flow.

Ensure the confirmation email is triggered only after the order is validly persisted and confirmed. Use the actual persisted order data for the email.

Include the order ID, products, quantities, totals, payment status, and delivery details where available.

An email failure must not cause a valid order to be duplicated, cancelled, or paid for again. Add safe retry handling only where compatible with the existing architecture, and prevent duplicate order creation and unintended duplicate emails.

Do not weaken Razorpay payment verification or webhook signature validation.

## Task 5: Testing

Add or update automated tests for:

- Correct OTP accepted.
- Incorrect and expired OTP rejected.
- OTP reuse rejected.
- Login cannot bypass mandatory verification.
- OTP delivery failure is reported accurately.
- Brevo API errors are safely handled.
- Successful order confirmation triggers the email service.
- Email failure does not invalidate a successfully confirmed order.
- Duplicate payment notifications do not create duplicate orders.
- Existing authorization and customer separation remain intact.

Use mocked email-provider responses for automated tests; do not send real customer emails or make real payments during testing.

## Deliverables

1. A concise root-cause report.
2. A list of files changed, without opening or listing secret files.
3. A summary of authentication and email fixes.
4. Automated test results.
5. Manual local testing instructions.
6. Any remaining setup requirements, described without displaying or requesting secret values.

Make the smallest safe changes necessary. Preserve the current frontend UI/UX and existing business logic wherever it is correct.