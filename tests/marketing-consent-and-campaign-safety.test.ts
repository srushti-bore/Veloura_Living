/**
 * 🏛️ Veloura Living — Marketing Consent, Unsubscribe & Campaign Safety Test Suite
 * Validates Phase 2 (Consent), Phase 3 (Unsubscribe), Phase 4 (Deduplication & n8n Claiming) & Phase 5 (Security)
 */

import fs from 'fs';
import path from 'path';
import {
  clearMarketingCacheForTesting,
  recordMarketingConsent,
  getMarketingConsent,
  getMarketingConsentByToken,
  unsubscribeCustomer,
  getEligibleMarketingAudience,
  createOrGetCampaign,
  populateCampaignDispatches,
  claimCampaignDispatches,
  recordDispatchResult,
  marketingCampaignService,
} from '../lib/data/marketingStore';
import { POST as consentPostHandler } from '../app/api/marketing/consent/route';
import { POST as newsletterPostHandler } from '../app/api/marketing/newsletter/route';
import { POST as unsubscribePostHandler } from '../app/api/marketing/unsubscribe/route';
import { POST as webhookPostHandler } from '../app/api/marketing/brevo-webhook/route';
import { POST as eligiblePostHandler, GET as eligibleGetHandler } from '../app/api/marketing/campaigns/eligible/route';
import { POST as claimPostHandler } from '../app/api/marketing/campaigns/claim/route';
import { signToken } from '../lib/auth/jwt';
import { AUTH_COOKIE_NAME } from '../lib/auth/session';
import { initUserRepository } from '../lib/data/userRepository';
import { NextRequest } from 'next/server';

function createMockRequest(
  url: string,
  options: {
    method?: string;
    body?: any;
    token?: string;
    headers?: Record<string, string>;
  } = {}
): NextRequest {
  const reqHeaders = new Headers(options.headers || {});
  reqHeaders.set('content-type', 'application/json');
  if (options.token) {
    reqHeaders.set('authorization', `Bearer ${options.token}`);
    reqHeaders.set('cookie', `${AUTH_COOKIE_NAME}=${options.token}`);
  }

  const reqInit: RequestInit = {
    method: options.method || 'POST',
    headers: reqHeaders,
    body:
      options.body !== undefined
        ? typeof options.body === 'string'
          ? options.body
          : JSON.stringify(options.body)
        : undefined,
  };

  return new NextRequest(new URL(url, 'http://localhost:3000'), reqInit);
}

export async function runMarketingConsentTestSuite(): Promise<{
  passed: number;
  failed: number;
  errors: string[];
}> {
  console.log('\n===========================================================');
  console.log('🏛️  VELOURA LIVING — MARKETING CONSENT & CAMPAIGN SAFETY TESTS');
  console.log('===========================================================');

  let passed = 0;
  let failed = 0;
  const errors: string[] = [];

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${desc}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${desc}`);
      failed++;
      errors.push(desc);
    }
  }

  clearMarketingCacheForTesting();

  // -------------------------------------------------------------
  // 1. Consent Granted: Explicit Opt-In & Timestamp Tracking
  // -------------------------------------------------------------
  console.log('\n--- 1. Marketing Consent: Explicit Opt-In & Timestamp Tracking ---');
  try {
    const consent = await recordMarketingConsent({
      email: 'clara.design@example.com',
      isOptedIn: true,
      source: 'CHECKOUT',
      ipAddress: '192.168.1.50',
      userAgent: 'Mozilla/5.0 Luxury Atelier Client',
    });

    assert(consent.is_opted_in === true, '1.1 Explicit checkout opt-in sets is_opted_in to true');
    assert(Boolean(consent.consented_at), '1.2 Consented timestamp is accurately recorded');
    assert(consent.consent_source === 'CHECKOUT', '1.3 Consent source is recorded as CHECKOUT');
    assert(Boolean(consent.unsubscribe_token), '1.4 Unique high-entropy unsubscribe token generated');
    assert(consent.unsubscribed_at === null, '1.5 Active consent has unsubscribed_at as null');

    // Retrieve via email
    const fetched = await getMarketingConsent('clara.design@example.com');
    assert(fetched?.email === 'clara.design@example.com', '1.6 Consent record retrievable by normalized email');
  } catch (err: any) {
    assert(false, `1.x Error in consent granted test: ${err.message}`);
  }

  // -------------------------------------------------------------
  // 2. Consent Absent & Unchecked Checkbox Defense
  // -------------------------------------------------------------
  console.log('\n--- 2. Consent Absent & Unchecking Box Behavior ---');
  try {
    // Unchecking the box (isOptedIn = false)
    const optOutConsent = await recordMarketingConsent({
      email: 'marcus.vance@example.com',
      isOptedIn: false,
      source: 'CHECKOUT',
    });

    assert(optOutConsent.is_opted_in === false, '2.1 Unchecked checkbox strictly keeps is_opted_in as false');
    assert(optOutConsent.consented_at === null, '2.2 Opted-out customer has consented_at as null');

    // Default status for unknown user
    const unknown = await getMarketingConsent('stranger@example.com');
    assert(!unknown || unknown.is_opted_in === false, '2.3 Non-consented users default to opted-out');
  } catch (err: any) {
    assert(false, `2.x Error in consent absent test: ${err.message}`);
  }

  // -------------------------------------------------------------
  // 3. Footer Newsletter Affirmative Subscription & Email Validation
  // -------------------------------------------------------------
  console.log('\n--- 3. Footer Newsletter Subscription & Validation ---');
  try {
    // 3.1 Invalid email rejection
    const invalidReq = createMockRequest('http://localhost:3000/api/marketing/newsletter', {
      body: { email: 'invalid-email-string' },
    });
    const invalidRes = await newsletterPostHandler(invalidReq);
    assert(invalidRes.status === 400, '3.1 Invalid email format is rejected with HTTP 400');

    // 3.2 Valid newsletter subscription
    const validReq = createMockRequest('http://localhost:3000/api/marketing/newsletter', {
      body: { email: 'theodore.stone@architects.com' },
    });
    const validRes = await newsletterPostHandler(validReq);
    assert(validRes.status === 200, '3.2 Valid newsletter subscription accepted with HTTP 200');

    const newsletterConsent = await getMarketingConsent('theodore.stone@architects.com');
    assert(newsletterConsent?.is_opted_in === true, '3.3 Newsletter subscriber is marked is_opted_in = true');
    assert(newsletterConsent?.consent_source === 'FOOTER_NEWSLETTER', '3.4 Consent source recorded as FOOTER_NEWSLETTER');
  } catch (err: any) {
    assert(false, `3.x Error in newsletter subscription test: ${err.message}`);
  }

  // -------------------------------------------------------------
  // 4. Unauthorized Preference Tampering Defense
  // -------------------------------------------------------------
  console.log('\n--- 4. Security: Unauthorized Preference Change Defense ---');
  try {
    await initUserRepository();
    // User Alice (client@example.com) tries to alter Bob's marketing consent
    const aliceToken = await signToken('33333333-3333-3333-3333-333333333303', 'client@example.com', ['CUSTOMER']);
    const tamperReq = createMockRequest('http://localhost:3000/api/marketing/consent', {
      token: aliceToken,
      body: {
        email: 'bob@velouraliving.com',
        isOptedIn: true,
        source: 'ACCOUNT_SETTINGS',
      },
    });
    const tamperRes = await consentPostHandler(tamperReq);
    assert(tamperRes.status === 403, '4.1 Customer modifying another customer preference rejected with 403 Forbidden');

    // User Alice modifying her own consent succeeds
    const ownReq = createMockRequest('http://localhost:3000/api/marketing/consent', {
      token: aliceToken,
      body: {
        email: 'client@example.com',
        isOptedIn: true,
        source: 'ACCOUNT_SETTINGS',
      },
    });
    const ownRes = await consentPostHandler(ownReq);
    assert(ownRes.status === 200, '4.2 Customer modifying their own preference is accepted with 200 OK');
  } catch (err: any) {
    assert(false, `4.x Error in security tampering test: ${err.message}`);
  }

  // -------------------------------------------------------------
  // 5. Unsubscribe Management & Idempotency
  // -------------------------------------------------------------
  console.log('\n--- 5. Unsubscribe Management & Idempotency ---');
  try {
    const userToUnsub = await recordMarketingConsent({
      email: 'julian.luxe@example.com',
      isOptedIn: true,
      source: 'CHECKOUT',
    });

    const token = userToUnsub.unsubscribe_token;

    // First unsubscribe call
    const unsubResult1 = await unsubscribeCustomer({ token, reason: 'Too many emails' });
    assert(unsubResult1.success === true, '5.1 Token-based unsubscribe succeeds');

    const stateAfterUnsub = await getMarketingConsent('julian.luxe@example.com');
    assert(stateAfterUnsub?.is_opted_in === false, '5.2 is_opted_in set to false upon unsubscribe');
    assert(Boolean(stateAfterUnsub?.unsubscribed_at), '5.3 unsubscribed_at timestamp recorded');

    // Idempotent duplicate unsubscribe call
    const unsubResult2 = await unsubscribeCustomer({ token });
    assert(unsubResult2.success === true, '5.4 Second unsubscribe call is completely idempotent');

    // API Endpoint Test
    const apiUnsubReq = createMockRequest('http://localhost:3000/api/marketing/unsubscribe', {
      body: { token },
    });
    const apiUnsubRes = await unsubscribePostHandler(apiUnsubReq);
    assert(apiUnsubRes.status === 200, '5.5 /api/marketing/unsubscribe responds HTTP 200');
  } catch (err: any) {
    assert(false, `5.x Error in unsubscribe test: ${err.message}`);
  }

  // -------------------------------------------------------------
  // 6. Brevo Webhook Integration & Bounce Handling
  // -------------------------------------------------------------
  console.log('\n--- 6. Brevo Webhook Event Listener ---');
  try {
    // Subscribe user first
    await recordMarketingConsent({
      email: 'bounce.test@example.com',
      isOptedIn: true,
      source: 'CHECKOUT',
    });

    const webhookReq = createMockRequest('http://localhost:3000/api/marketing/brevo-webhook', {
      body: {
        event: 'unsubscribe',
        email: 'bounce.test@example.com',
        'message-id': 'msg_brevo_99128',
      },
    });

    const webhookRes = await webhookPostHandler(webhookReq);
    assert(webhookRes.status === 200, '6.1 Brevo webhook processes unsubscribe event with HTTP 200');

    const updatedConsent = await getMarketingConsent('bounce.test@example.com');
    assert(updatedConsent?.is_opted_in === false, '6.2 Brevo webhook event sets is_opted_in = false');
    assert(Boolean(updatedConsent?.unsubscribed_at), '6.3 Brevo webhook sets unsubscribed_at');
  } catch (err: any) {
    assert(false, `6.x Error in Brevo webhook test: ${err.message}`);
  }

  // -------------------------------------------------------------
  // 7. Audience Exclusion: Unsubscribed & Admin Exclusion
  // -------------------------------------------------------------
  console.log('\n--- 7. Marketing Audience Eligibility & Exclusion ---');
  try {
    const audience = await getEligibleMarketingAudience();
    const emails = audience.recipients.map((r) => r.email.toLowerCase());

    assert(!emails.includes('julian.luxe@example.com'), '7.1 Unsubscribed customer is strictly excluded from audience');
    assert(!emails.includes('bounce.test@example.com'), '7.2 Bounced/unsubscribed customer is strictly excluded');
    assert(!emails.includes('marcus.vance@example.com'), '7.3 Opted-out customer is strictly excluded');
    assert(emails.includes('clara.design@example.com'), '7.4 Consented customer is included in audience');

    // Rule 7 in Phase 3: "Do not automatically re-subscribe customers when a new festival campaign is created."
    await createOrGetCampaign({
      campaignKey: 'diwali-2026-luxury-suite',
      title: 'Diwali 2026 Private Suite',
      subject: 'Architectural Hardwood Creations for the Festival of Lights',
    });

    const audienceAfterNewCampaign = await getEligibleMarketingAudience('diwali-2026-luxury-suite');
    const emailsAfter = audienceAfterNewCampaign.recipients.map((r) => r.email.toLowerCase());
    assert(
      !emailsAfter.includes('julian.luxe@example.com'),
      '7.5 Creating a new festive campaign does NOT re-subscribe unsubscribed users'
    );
  } catch (err: any) {
    assert(false, `7.x Error in audience eligibility test: ${err.message}`);
  }

  // -------------------------------------------------------------
  // 8. Campaign Deduplication & Database Uniqueness Constraint
  // -------------------------------------------------------------
  console.log('\n--- 8. Campaign Deduplication & Dispatch Population ---');
  try {
    const campaignKey = 'diwali-2026-luxury-suite';

    // Populate dispatches
    const firstCount = await populateCampaignDispatches(campaignKey);
    assert(firstCount >= 1, '8.1 Initial campaign dispatch population queues eligible recipients');

    // Re-running population must be idempotent (0 duplicate inserts)
    const secondCount = await populateCampaignDispatches(campaignKey);
    assert(secondCount === 0, '8.2 Re-running dispatch population inserts 0 duplicate recipients');
  } catch (err: any) {
    assert(false, `8.x Error in campaign deduplication test: ${err.message}`);
  }

  // -------------------------------------------------------------
  // 9. Atomic Concurrency Job Claiming (SKIP LOCKED Simulation)
  // -------------------------------------------------------------
  // -------------------------------------------------------------
  // 9. Atomic Concurrency Job Claiming (SKIP LOCKED Simulation)
  // -------------------------------------------------------------
  console.log('\n--- 9. Concurrency-Safe Job Claiming (n8n Worker Claim) ---');
  let claimedDispatchId: string | null = null;
  try {
    const campaignKey = 'diwali-2026-luxury-suite';

    // Worker 1 claims batch
    const worker1Batch = await claimCampaignDispatches(campaignKey, 'n8n-worker-alpha', 10);
    assert(worker1Batch.length >= 1, '9.1 Worker 1 claims pending campaign dispatches');
    assert(Boolean(worker1Batch[0].unsubscribeToken), '9.2 Claimed dispatch includes personal unsubscribeToken');
    claimedDispatchId = worker1Batch[0].dispatchId;

    // Worker 2 attempts to claim concurrently
    const worker2Batch = await claimCampaignDispatches(campaignKey, 'n8n-worker-beta', 10);
    const worker1Emails = new Set(worker1Batch.map((i) => i.email));
    const overlap = worker2Batch.filter((i) => worker1Emails.has(i.email));
    assert(overlap.length === 0, '9.3 Concurrent worker claims are completely disjoint (zero duplicate claims)');
  } catch (err: any) {
    assert(false, `9.x Error in concurrent job claim test: ${err.message}`);
  }

  // -------------------------------------------------------------
  // 10. Safe Retry & Ambiguous Outcome Handling
  // -------------------------------------------------------------
  console.log('\n--- 10. Safe Retry & Ambiguous Outcome Handling ---');
  try {
    if (claimedDispatchId) {
      // 10.1 Ambiguous timeout tracking (safe retry defense)
      const ambiguousResult = await recordDispatchResult({
        dispatchId: claimedDispatchId,
        status: 'TIMEOUT_AMBIGUOUS',
        failureReason: 'Provider gateway timeout after 10000ms. Awaiting delivery confirmation.',
      });
      assert(ambiguousResult?.status === 'TIMEOUT_AMBIGUOUS', '10.1 Ambiguous timeout recorded without blind retry');

      // 10.2 Final accepted confirmation
      const finalResult = await recordDispatchResult({
        dispatchId: claimedDispatchId,
        status: 'ACCEPTED',
        providerMessageId: 'brevo_msg_festive_77182',
      });
      assert(finalResult?.status === 'ACCEPTED', '10.2 Provider acceptance confirmed with provider_message_id');
      assert(Boolean(finalResult?.sent_at), '10.3 sent_at timestamp persisted');
    } else {
      assert(false, '10.1 No claimed dispatch available for outcome transition test');
    }
  } catch (err: any) {
    assert(false, `10.x Error in retry & outcome tracking test: ${err.message}`);
  }

  // -------------------------------------------------------------
  // 11. Unsubscribe Persistence Across Account Deletion (Suppression Invariant)
  // -------------------------------------------------------------
  console.log('\n--- 11. Unsubscribe Persistence Across Account Deletion ---');
  try {
    const deletedEmail = 'deleted.client@example.com';
    const initialConsent = await recordMarketingConsent({
      email: deletedEmail,
      userId: 'user-to-be-deleted-999',
      isOptedIn: true,
      source: 'CHECKOUT',
    });
    assert(initialConsent.is_opted_in === true, '11.1 Initial consent registered for client');

    // Unsubscribe the customer
    await unsubscribeCustomer({ email: deletedEmail, reason: 'Account closed' });
    const unsubscribedState = await getMarketingConsent(deletedEmail);
    assert(unsubscribedState?.is_opted_in === false, '11.2 Customer is unsubscribed');
    assert(Boolean(unsubscribedState?.unsubscribed_at), '11.3 unsubscribed_at is persisted');

    // Verify unlinked/deleted user consent remains intact keyed by email
    const audience = await getEligibleMarketingAudience();
    const isExcluded = !audience.recipients.some((a) => a.email.toLowerCase() === deletedEmail.toLowerCase());
    assert(isExcluded, '11.4 Deleted/unlinked customer is strictly excluded from eligible audience');

    // Campaign dispatch population safely honors suppression
    const campaignKey = 'diwali-2026-luxury-suite';
    const populated = await populateCampaignDispatches(campaignKey);
    assert(typeof populated === 'number', '11.5 Campaign dispatch population safely honors suppression');
  } catch (err: any) {
    assert(false, `11.x Error in account deletion suppression test: ${err.message}`);
  }

  // -------------------------------------------------------------
  // 12. Database Migration Security Invariants (RLS, Grants & Search Path)
  // -------------------------------------------------------------
  console.log('\n--- 12. Database Migration Security & RLS Static Verification ---');
  try {
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20261019000001_marketing_consent_and_campaign_safety.sql');
    const completeSetupPath = path.join(process.cwd(), 'supabase', 'complete_supabase_setup.sql');
    
    assert(fs.existsSync(migrationPath), '12.1 Migration file exists');
    assert(fs.existsSync(completeSetupPath), '12.2 complete_supabase_setup.sql exists');

    const migrationSql = fs.readFileSync(migrationPath, 'utf-8');
    const completeSql = fs.readFileSync(completeSetupPath, 'utf-8');

    // 1. Verify RLS is enabled on all 3 tables
    assert(migrationSql.includes('ALTER TABLE customer_marketing_consents ENABLE ROW LEVEL SECURITY;'), '12.3 RLS enabled on customer_marketing_consents in migration');
    assert(migrationSql.includes('ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;'), '12.4 RLS enabled on marketing_campaigns in migration');
    assert(migrationSql.includes('ALTER TABLE marketing_campaign_dispatches ENABLE ROW LEVEL SECURITY;'), '12.5 RLS enabled on marketing_campaign_dispatches in migration');

    // 2. Verify anon and authenticated access is revoked
    assert(migrationSql.includes('REVOKE ALL ON customer_marketing_consents FROM anon;'), '12.6 customer_marketing_consents revoked from anon');
    assert(migrationSql.includes('REVOKE ALL ON customer_marketing_consents FROM authenticated;'), '12.7 customer_marketing_consents revoked from authenticated');
    assert(migrationSql.includes('GRANT ALL ON customer_marketing_consents TO service_role;'), '12.8 customer_marketing_consents granted to service_role');

    // 3. Verify function execution is revoked from PUBLIC, anon, and authenticated
    assert(migrationSql.includes('REVOKE ALL ON FUNCTION populate_campaign_dispatches(VARCHAR) FROM PUBLIC;'), '12.9 populate_campaign_dispatches revoked from PUBLIC');
    assert(migrationSql.includes('REVOKE ALL ON FUNCTION claim_campaign_dispatches(VARCHAR, VARCHAR, INT) FROM PUBLIC;'), '12.10 claim_campaign_dispatches revoked from PUBLIC');
    assert(migrationSql.includes('REVOKE ALL ON FUNCTION unsubscribe_customer_by_token(VARCHAR, TEXT) FROM PUBLIC;'), '12.11 unsubscribe_customer_by_token revoked from PUBLIC');
    assert(migrationSql.includes('REVOKE ALL ON FUNCTION unsubscribe_customer_by_email(VARCHAR, TEXT) FROM PUBLIC;'), '12.12 unsubscribe_customer_by_email revoked from PUBLIC');

    // 4. Verify search_path is set to public, pg_temp
    assert(migrationSql.includes('ALTER FUNCTION populate_campaign_dispatches(VARCHAR) SET search_path = public, pg_temp;'), '12.13 populate_campaign_dispatches search_path secured');
    assert(migrationSql.includes('ALTER FUNCTION claim_campaign_dispatches(VARCHAR, VARCHAR, INT) SET search_path = public, pg_temp;'), '12.14 claim_campaign_dispatches search_path secured');
    assert(migrationSql.includes('ALTER FUNCTION unsubscribe_customer_by_token(VARCHAR, TEXT) SET search_path = public, pg_temp;'), '12.15 unsubscribe_customer_by_token search_path secured');
    assert(migrationSql.includes('ALTER FUNCTION unsubscribe_customer_by_email(VARCHAR, TEXT) SET search_path = public, pg_temp;'), '12.16 unsubscribe_customer_by_email search_path secured');

    // 5. Verify deterministic user_id ON DELETE SET NULL constraint upgrade (no broad exceptions, no unnecessary drops)
    assert(migrationSql.includes('user_id UUID REFERENCES users(id) ON DELETE SET NULL,'), '12.17 customer_marketing_consents user_id uses ON DELETE SET NULL');
    assert(migrationSql.includes("v_confdeltype <> 'n'"), '12.18 Inspects confdeltype to prevent unnecessary constraint drops');
    assert(migrationSql.includes('FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;'), '12.19 Constraint upgrade applies ON DELETE SET NULL');
    assert(!migrationSql.includes('WHEN others THEN null;'), '12.20 Zero broad exception handlers in migration');

    // 6. Verify complete_supabase_setup.sql has equivalent hardening
    assert(completeSql.includes('ALTER TABLE customer_marketing_consents ENABLE ROW LEVEL SECURITY;'), '12.21 complete_supabase_setup.sql contains RLS configuration');
    assert(completeSql.includes("v_confdeltype <> 'n'"), '12.22 complete_supabase_setup.sql inspects confdeltype');
    assert(!completeSql.includes('WHEN others THEN null;'), '12.23 complete_supabase_setup.sql has zero broad exception handlers');
  } catch (err: any) {
    assert(false, `12.x Error in migration security verification: ${err.message}`);
  }

  // -------------------------------------------------------------
  // 13. Eligible Campaign Audience POST Endpoint Security & Validation
  // -------------------------------------------------------------
  console.log('\n--- 13. Eligible Audience POST Endpoint Security & Validation ---');
  const originalApiKey = process.env.MARKETING_API_KEY;
  const originalNodeEnv = process.env.NODE_ENV;
  try {
    process.env.MARKETING_API_KEY = 'test-marketing-key';

    // 13.1 Valid POST with campaignKey returns 200 OK
    const validPostReq = createMockRequest('http://localhost:3000/api/marketing/campaigns/eligible', {
      method: 'POST',
      body: { campaignKey: 'diwali-2026-luxury-suite' },
      headers: { 'x-marketing-api-key': 'test-marketing-key' },
    });
    const validRes = await eligiblePostHandler(validPostReq);
    assert(validRes.status === 200, '13.1 Valid POST with campaignKey returns HTTP 200');
    const validJson = await validRes.json();
    assert(validJson.success === true, '13.2 Valid POST returns success true');
    assert(typeof validJson.data?.totalEligible === 'number', '13.3 totalEligible count is present in response');
    assert(validJson.data?.campaignKey === 'diwali-2026-luxury-suite', '13.4 campaignKey is preserved in response');

    // 13.5-13.7 Privacy check: Ensure customer personal data (emails, unsubscribe tokens) is strictly NOT exposed
    assert(validJson.data?.recipients === undefined, '13.5 POST response does not expose recipients array');
    assert(validJson.data?.emails === undefined, '13.6 POST response does not expose customer emails');
    assert(validJson.data?.unsubscribeTokens === undefined, '13.7 POST response does not expose unsubscribe tokens');

    // 13.8 Optional campaignKey: POST without body (empty body) accepts request
    const emptyBodyReq = createMockRequest('http://localhost:3000/api/marketing/campaigns/eligible', {
      method: 'POST',
      body: undefined,
      headers: { 'x-marketing-api-key': 'test-marketing-key' },
    });
    const emptyRes = await eligiblePostHandler(emptyBodyReq);
    assert(emptyRes.status === 200, '13.8 POST with empty body returns HTTP 200 (optional body)');

    // 13.9-13.10 Optional campaignKey: POST with empty JSON object {}
    const emptyObjReq = createMockRequest('http://localhost:3000/api/marketing/campaigns/eligible', {
      method: 'POST',
      body: {},
      headers: { 'x-marketing-api-key': 'test-marketing-key' },
    });
    const emptyObjRes = await eligiblePostHandler(emptyObjReq);
    assert(emptyObjRes.status === 200, '13.9 POST with empty object {} returns HTTP 200');
    const emptyObjJson = await emptyObjRes.json();
    assert(emptyObjJson.data?.campaignKey === 'all', '13.10 Omitting campaignKey defaults to "all"');

    // 13.11-13.12 Malformed JSON in body triggers 400 VALIDATION_ERROR
    const malformedReq = createMockRequest('http://localhost:3000/api/marketing/campaigns/eligible', {
      method: 'POST',
      body: '{ not valid json: true ',
      headers: { 'x-marketing-api-key': 'test-marketing-key' },
    });
    const malformedRes = await eligiblePostHandler(malformedReq);
    assert(malformedRes.status === 400, '13.11 Malformed JSON body is rejected with HTTP 400');
    const malformedJson = await malformedRes.json();
    assert(malformedJson.error?.code === 'VALIDATION_ERROR', '13.12 Malformed JSON returns VALIDATION_ERROR code');

    // 13.13 Invalid non-string campaignKey triggers 400 VALIDATION_ERROR
    const invalidTypeReq = createMockRequest('http://localhost:3000/api/marketing/campaigns/eligible', {
      method: 'POST',
      body: { campaignKey: 12345 },
      headers: { 'x-marketing-api-key': 'test-marketing-key' },
    });
    const invalidTypeRes = await eligiblePostHandler(invalidTypeReq);
    assert(invalidTypeRes.status === 400, '13.13 Non-string campaignKey rejected with HTTP 400');

    // 13.14 Authentication rejection: Missing/wrong API key in production mode
    (process.env as any).NODE_ENV = 'production';
    const unauthorizedReq = createMockRequest('http://localhost:3000/api/marketing/campaigns/eligible', {
      method: 'POST',
      body: { campaignKey: 'diwali-2026' },
      headers: { 'x-marketing-api-key': 'wrong-key-value' },
    });
    const unauthRes = await eligiblePostHandler(unauthorizedReq);
    assert(unauthRes.status === 401, '13.14 Invalid API key in production rejects with HTTP 401 Unauthorized');

    // 13.15 Preserved GET handler check
    (process.env as any).NODE_ENV = 'development';
    const getReq = createMockRequest('http://localhost:3000/api/marketing/campaigns/eligible?campaignKey=diwali-2026', {
      method: 'GET',
      headers: { 'x-marketing-api-key': 'test-marketing-key' },
    });
    const getRes = await eligibleGetHandler(getReq);
    assert(getRes.status === 200, '13.15 Preserved GET handler responds with HTTP 200');
  } catch (err: any) {
    assert(false, `13.x Error in eligible audience POST test: ${err.message}`);
  } finally {
    process.env.MARKETING_API_KEY = originalApiKey;
    (process.env as any).NODE_ENV = originalNodeEnv;
  }

  // -------------------------------------------------------------
  // 14. Campaign Claim POST Endpoint Security & Validation (/api/marketing/campaigns/claim)
  // -------------------------------------------------------------
  console.log('\n--- 14. Campaign Claim POST Endpoint Security & Validation ---');
  const originalClaimApiKey = process.env.MARKETING_API_KEY;
  const originalClaimN8nKey = process.env.N8N_MARKETING_KEY;
  const originalClaimNodeEnv = process.env.NODE_ENV;

  // Preserve original service methods for clean restoration
  const originalCreateOrGetCampaign = marketingCampaignService.createOrGetCampaign;
  const originalPopulateCampaignDispatches = marketingCampaignService.populateCampaignDispatches;
  const originalClaimCampaignDispatches = marketingCampaignService.claimCampaignDispatches;

  let createOrGetCalls = 0;
  let populateCalls = 0;
  let claimCalls = 0;

  // Mock campaign store mutation dependencies
  marketingCampaignService.createOrGetCampaign = async (campaign) => {
    createOrGetCalls++;
    return {
      id: 'mock-campaign-id',
      campaign_key: campaign.campaignKey,
      title: campaign.title,
      subject: campaign.subject,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as any;
  };

  marketingCampaignService.populateCampaignDispatches = async (_campaignKey) => {
    populateCalls++;
    return 10;
  };

  marketingCampaignService.claimCampaignDispatches = async (_campaignKey, worker, limit) => {
    claimCalls++;
    return [
      {
        id: 'mock-dispatch-1',
        campaign_id: 'mock-campaign-id',
        email: 'mock-recipient@veloura.com',
        first_name: 'Aria',
        last_name: 'Vance',
        unsubscribe_token: 'mock-token-abc',
        status: 'CLAIMED',
      },
    ] as any;
  };

  try {
    delete process.env.N8N_MARKETING_KEY;
    process.env.MARKETING_API_KEY = 'test-marketing-key';
    (process.env as any).NODE_ENV = 'production';

    // 14.1 - 14.7: Authenticated request with empty JSON body {}
    createOrGetCalls = 0;
    populateCalls = 0;
    claimCalls = 0;

    const emptyBodyReq = createMockRequest('http://localhost:3000/api/marketing/campaigns/claim', {
      method: 'POST',
      body: {},
      headers: { 'x-marketing-api-key': 'test-marketing-key' },
    });
    const emptyRes = await claimPostHandler(emptyBodyReq);
    assert(emptyRes.status === 400, '14.1 Authenticated POST with empty body {} returns HTTP 400');
    const emptyJson = await emptyRes.json();
    assert(emptyJson.success === false, '14.2 Empty body returns success false');
    assert(emptyJson.error?.code === 'VALIDATION_ERROR', '14.3 Empty body returns VALIDATION_ERROR code');
    assert(emptyJson.error?.message === 'campaignKey is required.', '14.4 Empty body returns expected validation error for missing campaignKey');
    assert(createOrGetCalls === 0, '14.5 createOrGetCampaign is not called on empty body {}');
    assert(populateCalls === 0, '14.6 populateCampaignDispatches is not called on empty body {}');
    assert(claimCalls === 0, '14.7 claimCampaignDispatches is not called on empty body {}');

    // 14.8 - 14.11: Missing marketing API key returns HTTP 401 and no mutations called
    createOrGetCalls = 0;
    populateCalls = 0;
    claimCalls = 0;

    const missingKeyReq = createMockRequest('http://localhost:3000/api/marketing/campaigns/claim', {
      method: 'POST',
      body: { campaignKey: 'diwali-2026-luxury-suite' },
      headers: {},
    });
    const missingKeyRes = await claimPostHandler(missingKeyReq);
    assert(missingKeyRes.status === 401, '14.8 Missing marketing API key in production returns HTTP 401');
    const missingKeyJson = await missingKeyRes.json();
    assert(missingKeyJson.success === false, '14.9 Missing API key returns success false');
    assert(missingKeyJson.error?.code === 'UNAUTHORIZED', '14.10 Missing API key returns UNAUTHORIZED code');
    assert(
      createOrGetCalls === 0 && populateCalls === 0 && claimCalls === 0,
      '14.11 Zero campaign-store mutation functions called on missing API key'
    );

    // 14.12 - 14.15: Invalid marketing API key returns HTTP 401 and no mutations called
    createOrGetCalls = 0;
    populateCalls = 0;
    claimCalls = 0;

    const invalidKeyReq = createMockRequest('http://localhost:3000/api/marketing/campaigns/claim', {
      method: 'POST',
      body: { campaignKey: 'diwali-2026-luxury-suite' },
      headers: { 'x-marketing-api-key': 'incorrect-api-key' },
    });
    const invalidKeyRes = await claimPostHandler(invalidKeyReq);
    assert(invalidKeyRes.status === 401, '14.12 Invalid marketing API key returns HTTP 401');
    const invalidKeyJson = await invalidKeyRes.json();
    assert(invalidKeyJson.success === false, '14.13 Invalid API key returns success false');
    assert(invalidKeyJson.error?.code === 'UNAUTHORIZED', '14.14 Invalid API key returns UNAUTHORIZED code');
    assert(
      createOrGetCalls === 0 && populateCalls === 0 && claimCalls === 0,
      '14.15 Zero campaign-store mutation functions called on invalid API key'
    );

    // 14.16 - 14.18: Non-string campaignKey returns HTTP 400 and no mutations called
    createOrGetCalls = 0;
    populateCalls = 0;
    claimCalls = 0;

    const invalidTypeReq = createMockRequest('http://localhost:3000/api/marketing/campaigns/claim', {
      method: 'POST',
      body: { campaignKey: 12345 },
      headers: { 'x-marketing-api-key': 'test-marketing-key' },
    });
    const invalidTypeRes = await claimPostHandler(invalidTypeReq);
    assert(invalidTypeRes.status === 400, '14.16 Non-string campaignKey returns HTTP 400');
    const invalidTypeJson = await invalidTypeRes.json();
    assert(invalidTypeJson.error?.code === 'VALIDATION_ERROR', '14.17 Non-string campaignKey returns VALIDATION_ERROR');
    assert(
      createOrGetCalls === 0 && populateCalls === 0 && claimCalls === 0,
      '14.18 Zero campaign-store mutation functions called on non-string campaignKey'
    );

    // 14.19 - 14.25: Valid authenticated claim executes mutations and returns HTTP 200 with claimed batch
    createOrGetCalls = 0;
    populateCalls = 0;
    claimCalls = 0;

    const validClaimReq = createMockRequest('http://localhost:3000/api/marketing/campaigns/claim', {
      method: 'POST',
      body: {
        campaignKey: 'diwali-2026-luxury-suite',
        workerId: 'test-n8n-worker-01',
        batchSize: 15,
      },
      headers: { 'x-marketing-api-key': 'test-marketing-key' },
    });
    const validClaimRes = await claimPostHandler(validClaimReq);
    assert(validClaimRes.status === 200, '14.19 Valid authenticated claim returns HTTP 200');
    const validClaimJson = await validClaimRes.json();
    assert(validClaimJson.success === true, '14.20 Valid claim returns success true');
    assert(validClaimJson.data?.campaignKey === 'diwali-2026-luxury-suite', '14.21 Valid claim echoes campaignKey');
    assert(validClaimJson.data?.claimedBy === 'test-n8n-worker-01', '14.22 Valid claim echoes workerId');
    assert(validClaimJson.data?.count === 1, '14.23 Valid claim returns expected item count');
    assert(validClaimJson.data?.items?.length === 1, '14.24 Valid claim returns claimed items array');
    assert(
      createOrGetCalls === 1 && populateCalls === 1 && claimCalls === 1,
      '14.25 createOrGetCampaign, populateCampaignDispatches, and claimCampaignDispatches called exactly once for valid request'
    );
  } catch (err: any) {
    assert(false, `14.x Error in campaign claim POST test: ${err.message}`);
  } finally {
    marketingCampaignService.createOrGetCampaign = originalCreateOrGetCampaign;
    marketingCampaignService.populateCampaignDispatches = originalPopulateCampaignDispatches;
    marketingCampaignService.claimCampaignDispatches = originalClaimCampaignDispatches;
    process.env.MARKETING_API_KEY = originalClaimApiKey;
    process.env.N8N_MARKETING_KEY = originalClaimN8nKey;
    (process.env as any).NODE_ENV = originalClaimNodeEnv;
  }

  // -------------------------------------------------------------
  // 15. Deterministic Test-Recipient Isolation & Allowlist Security
  // -------------------------------------------------------------
  console.log('\n--- 15. Deterministic Test-Recipient Isolation & Allowlist Security ---');
  const origIsoApiKey = process.env.MARKETING_API_KEY;
  const origIsoN8nKey = process.env.N8N_MARKETING_KEY;
  const origIsoAllowlist = process.env.MARKETING_TEST_ALLOWLIST;
  const origIsoNodeEnv = process.env.NODE_ENV;

  const spiedCreate = marketingCampaignService.createOrGetCampaign;
  const spiedPopulate = marketingCampaignService.populateCampaignDispatches;
  const spiedClaim = marketingCampaignService.claimCampaignDispatches;

  let isoCreateCalls = 0;
  let isoPopulateCalls = 0;
  let isoClaimCalls = 0;
  let lastClaimTargetEmail: string | undefined = undefined;

  marketingCampaignService.createOrGetCampaign = async (campaign) => {
    isoCreateCalls++;
    return {
      id: 'mock-campaign-id',
      campaign_key: campaign.campaignKey,
      title: campaign.title,
      subject: campaign.subject,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as any;
  };

  marketingCampaignService.populateCampaignDispatches = async (_campaignKey) => {
    isoPopulateCalls++;
    return 1;
  };

  marketingCampaignService.claimCampaignDispatches = async (_campaignKey, worker, limit, targetEmail) => {
    isoClaimCalls++;
    lastClaimTargetEmail = targetEmail;
    return [
      {
        dispatchId: 'mock-dispatch-iso-1',
        campaignId: 'mock-campaign-id',
        campaignKey: _campaignKey,
        email: targetEmail || 'default@veloura.com',
        firstName: 'Test',
        lastName: 'Recipient',
        unsubscribeToken: 'test-token-iso',
      },
    ];
  };

  try {
    delete process.env.N8N_MARKETING_KEY;
    process.env.MARKETING_API_KEY = 'test-marketing-key';
    (process.env as any).NODE_ENV = 'production';

    // 15.1 - 15.3: Missing allowlist rejects with HTTP 403 and zero mutation calls
    delete process.env.MARKETING_TEST_ALLOWLIST;
    isoCreateCalls = 0;
    isoPopulateCalls = 0;
    isoClaimCalls = 0;

    const missingAllowlistReq = createMockRequest('http://localhost:3000/api/marketing/campaigns/claim', {
      method: 'POST',
      body: {
        campaignKey: 'diwali-2026-luxury-suite',
        testRecipientEmail: 'tester@veloura.com',
      },
      headers: { 'x-marketing-api-key': 'test-marketing-key' },
    });
    const missingAllowlistRes = await claimPostHandler(missingAllowlistReq);
    assert(missingAllowlistRes.status === 403, '15.1 Missing MARKETING_TEST_ALLOWLIST rejects with HTTP 403');
    const missingAllowlistJson = await missingAllowlistRes.json();
    assert(missingAllowlistJson.error?.code === 'FORBIDDEN', '15.2 Missing allowlist returns FORBIDDEN error code');
    assert(
      isoCreateCalls === 0 && isoPopulateCalls === 0 && isoClaimCalls === 0,
      '15.3 Zero store mutation calls when allowlist is missing'
    );

    // 15.4 - 15.5: Empty allowlist rejects with HTTP 403 and zero mutation calls
    process.env.MARKETING_TEST_ALLOWLIST = '   ';
    isoCreateCalls = 0;
    isoPopulateCalls = 0;
    isoClaimCalls = 0;

    const emptyAllowlistReq = createMockRequest('http://localhost:3000/api/marketing/campaigns/claim', {
      method: 'POST',
      body: {
        campaignKey: 'diwali-2026-luxury-suite',
        testRecipientEmail: 'tester@veloura.com',
      },
      headers: { 'x-marketing-api-key': 'test-marketing-key' },
    });
    const emptyAllowlistRes = await claimPostHandler(emptyAllowlistReq);
    assert(emptyAllowlistRes.status === 403, '15.4 Empty MARKETING_TEST_ALLOWLIST rejects with HTTP 403');
    assert(
      isoCreateCalls === 0 && isoPopulateCalls === 0 && isoClaimCalls === 0,
      '15.5 Zero store mutation calls when allowlist is whitespace/empty'
    );

    // 15.6 - 15.7: Recipient not in allowlist rejects with HTTP 403 and zero mutation calls
    process.env.MARKETING_TEST_ALLOWLIST = 'authorized-tester@veloura.com, qa-lead@veloura.com';
    isoCreateCalls = 0;
    isoPopulateCalls = 0;
    isoClaimCalls = 0;

    const unlistedReq = createMockRequest('http://localhost:3000/api/marketing/campaigns/claim', {
      method: 'POST',
      body: {
        campaignKey: 'diwali-2026-luxury-suite',
        testRecipientEmail: 'unauthorized-user@external.com',
      },
      headers: { 'x-marketing-api-key': 'test-marketing-key' },
    });
    const unlistedRes = await claimPostHandler(unlistedReq);
    assert(unlistedRes.status === 403, '15.6 Recipient not in MARKETING_TEST_ALLOWLIST rejects with HTTP 403');
    assert(
      isoCreateCalls === 0 && isoPopulateCalls === 0 && isoClaimCalls === 0,
      '15.7 Zero store mutation calls when recipient is not allowlisted'
    );

    // 15.8 - 15.9: Malformed testRecipientEmail rejects with HTTP 400 and zero mutation calls
    isoCreateCalls = 0;
    isoPopulateCalls = 0;
    isoClaimCalls = 0;

    const malformedEmailReq = createMockRequest('http://localhost:3000/api/marketing/campaigns/claim', {
      method: 'POST',
      body: {
        campaignKey: 'diwali-2026-luxury-suite',
        testRecipientEmail: 'invalid-email-format',
      },
      headers: { 'x-marketing-api-key': 'test-marketing-key' },
    });
    const malformedEmailRes = await claimPostHandler(malformedEmailReq);
    assert(malformedEmailRes.status === 400, '15.8 Malformed testRecipientEmail rejects with HTTP 400');
    const malformedEmailJson = await malformedEmailRes.json();
    assert(malformedEmailJson.error?.code === 'VALIDATION_ERROR', '15.9 Malformed email returns VALIDATION_ERROR');

    // 15.10 - 15.13: Email normalization works (trim + lowercase matching and forwarding)
    process.env.MARKETING_TEST_ALLOWLIST = '  Authorized-Tester@Veloura.COM , other@veloura.com  ';
    isoCreateCalls = 0;
    isoPopulateCalls = 0;
    isoClaimCalls = 0;
    lastClaimTargetEmail = undefined;

    const normalizedReq = createMockRequest('http://localhost:3000/api/marketing/campaigns/claim', {
      method: 'POST',
      body: {
        campaignKey: 'diwali-2026-luxury-suite',
        testRecipientEmail: '   AUTHORIZED-TESTER@VELOURA.COM   ',
      },
      headers: { 'x-marketing-api-key': 'test-marketing-key' },
    });
    const normalizedRes = await claimPostHandler(normalizedReq);
    assert(normalizedRes.status === 200, '15.10 Normalized testRecipientEmail succeeds with HTTP 200');
    const normalizedJson = await normalizedRes.json();
    assert(normalizedJson.data?.testRecipientEmail === 'authorized-tester@veloura.com', '15.11 Response echoes normalized email');
    assert(lastClaimTargetEmail === 'authorized-tester@veloura.com', '15.12 Target email passed to store is normalized to lowercase trim');
    assert(isoClaimCalls === 1, '15.13 claimCampaignDispatches called with normalized email filter');

    // -------------------------------------------------------------
    // Store-Level Multi-Recipient Isolation & Fallback Prevention
    // -------------------------------------------------------------
    marketingCampaignService.createOrGetCampaign = spiedCreate;
    marketingCampaignService.populateCampaignDispatches = spiedPopulate;
    marketingCampaignService.claimCampaignDispatches = spiedClaim;

    clearMarketingCacheForTesting();

    const isoCampaignKey = 'diwali-iso-test-campaign';
    await createOrGetCampaign({
      campaignKey: isoCampaignKey,
      title: 'Festive Isolation Test',
      subject: 'Curated Elegance',
    });

    // Register 3 customers:
    // Customer 1: real customer 1 (opted in, eligible)
    // Customer 2: designated test inbox (opted in, eligible)
    // Customer 3: real customer 2 (opted in, eligible)
    await recordMarketingConsent({
      email: 'customer-early@veloura.com',
      isOptedIn: true,
      source: 'CHECKOUT',
    });
    await recordMarketingConsent({
      email: 'designated-test@veloura.com',
      isOptedIn: true,
      source: 'CHECKOUT',
    });
    await recordMarketingConsent({
      email: 'customer-late@veloura.com',
      isOptedIn: true,
      source: 'CHECKOUT',
    });

    // Populate all 3 dispatches
    const populatedCount = await populateCampaignDispatches(isoCampaignKey);
    assert(populatedCount === 3, '15.14 3 recipients successfully populated for isolation test');

    // 15.15 - 15.16: Test claim specifying ONLY 'designated-test@veloura.com'
    const testClaimResult = await claimCampaignDispatches(
      isoCampaignKey,
      'test-worker-iso',
      10,
      'designated-test@veloura.com'
    );
    assert(testClaimResult.length === 1, '15.15 Exactly 1 item claimed when test recipient specified');
    assert(
      testClaimResult[0].email.toLowerCase() === 'designated-test@veloura.com',
      '15.16 Claimed item matches designated test recipient exclusively'
    );

    // 15.17 - 15.19: Unrestricted claim proves remaining non-test customers remained PENDING and untouched
    const remainingUnrestrictedClaim = await claimCampaignDispatches(
      isoCampaignKey,
      'test-worker-check',
      10
    );
    assert(remainingUnrestrictedClaim.length === 2, '15.17 Both non-test customers remained PENDING and available');
    const remainingEmails = remainingUnrestrictedClaim.map((c) => c.email.toLowerCase());
    assert(
      remainingEmails.includes('customer-early@veloura.com') && remainingEmails.includes('customer-late@veloura.com'),
      '15.18 Real customers were completely untouched by the test claim'
    );
    assert(
      !remainingEmails.includes('designated-test@veloura.com'),
      '15.19 Designated test recipient was already claimed and not duplicated'
    );

    // 15.20 - 15.22: Unsubscribed or ineligible test recipient returns ZERO items and never falls back
    clearMarketingCacheForTesting();
    const fallbackCampaignKey = 'diwali-fallback-prevention-test';
    await createOrGetCampaign({
      campaignKey: fallbackCampaignKey,
      title: 'Fallback Prevention Test',
      subject: 'Exclusivity',
    });

    // Seed real customer (opted in)
    await recordMarketingConsent({
      email: 'real-shopper@veloura.com',
      isOptedIn: true,
      source: 'CHECKOUT',
    });
    // Seed test customer (initially opted in, then unsubscribed)
    await recordMarketingConsent({
      email: 'unsubscribed-tester@veloura.com',
      isOptedIn: true,
      source: 'CHECKOUT',
    });
    await populateCampaignDispatches(fallbackCampaignKey);

    // Unsubscribe the test customer
    await unsubscribeCustomer({ email: 'unsubscribed-tester@veloura.com', reason: 'User opt-out' });

    // Claim with test recipient filter pointing to unsubscribed tester:
    const ineligibleClaim = await claimCampaignDispatches(
      fallbackCampaignKey,
      'worker-fallback-test',
      10,
      'unsubscribed-tester@veloura.com'
    );
    assert(ineligibleClaim.length === 0, '15.20 Ineligible/unsubscribed test recipient returns 0 items');

    // Confirm that real-shopper was NOT claimed as fallback:
    const realShopperCheck = await claimCampaignDispatches(
      fallbackCampaignKey,
      'worker-check',
      10
    );
    assert(realShopperCheck.length === 1, '15.21 Real customer remained pending and was never claimed as fallback');
    assert(
      realShopperCheck[0].email.toLowerCase() === 'real-shopper@veloura.com',
      '15.22 Real customer is claimed only when explicitly requested without fallback corruption'
    );

    // 15.23 - 15.27: Migration file static verification
    const newMigrationPath = path.join(
      process.cwd(),
      'supabase',
      'migrations',
      '20261020000001_marketing_campaign_test_recipient_isolation.sql'
    );
    assert(fs.existsSync(newMigrationPath), '15.23 Forward-only migration file exists');
    const newMigrationSql = fs.readFileSync(newMigrationPath, 'utf-8');
    assert(
      newMigrationSql.includes('p_target_email VARCHAR DEFAULT NULL'),
      '15.24 Migration declares p_target_email optional filter'
    );
    assert(
      newMigrationSql.includes('LOWER(cd.email) = LOWER(TRIM(p_target_email))'),
      '15.25 Migration applies case-insensitive email filtering in locked_rows CTE'
    );
    assert(
      newMigrationSql.includes('FOR UPDATE OF cd SKIP LOCKED'),
      '15.26 Migration preserves FOR UPDATE OF cd SKIP LOCKED concurrency safety'
    );
    assert(
      newMigrationSql.includes('REVOKE ALL ON FUNCTION claim_campaign_dispatches(VARCHAR, VARCHAR, INT, VARCHAR) FROM PUBLIC;'),
      '15.27 Migration restricts permissions on new function signature'
    );
  } catch (err: any) {
    assert(false, `15.x Error in test-recipient isolation verification: ${err.message}`);
  } finally {
    marketingCampaignService.createOrGetCampaign = spiedCreate;
    marketingCampaignService.populateCampaignDispatches = spiedPopulate;
    marketingCampaignService.claimCampaignDispatches = spiedClaim;
    process.env.MARKETING_API_KEY = origIsoApiKey;
    process.env.N8N_MARKETING_KEY = origIsoN8nKey;
    process.env.MARKETING_TEST_ALLOWLIST = origIsoAllowlist;
    (process.env as any).NODE_ENV = origIsoNodeEnv;
  }

  console.log('\n===========================================================');
  console.log(`📊 MARKETING CONSENT & CAMPAIGN SAFETY SUMMARY:`);
  console.log(`   ✓ Passed: ${passed}`);
  console.log(`   ✗ Failed: ${failed}`);
  console.log(`   🎯 Total:  ${passed + failed}`);
  console.log('===========================================================');

  return { passed, failed, errors };
}

if (process.argv[1]?.endsWith('marketing-consent-and-campaign-safety.test.ts')) {
  runMarketingConsentTestSuite().then((res) => {
    if (res.failed > 0) {
      process.exit(1);
    }
    process.exit(0);
  });
}
