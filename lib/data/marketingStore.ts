/**
 * 🏛️ Veloura Living — Marketing Consent, Unsubscribe & Campaign Safety Store
 * Primary Source of Truth: PostgreSQL / Supabase Relational Database.
 * Offline Fallback: Local JSON storage in .data/ for reliable testing and staging.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { queryPostgres, isPostgresAvailable, getPostgresClient } from '@/lib/db/postgres';
import { AppError } from '@/lib/api/errorHandler';
import {
  DbCustomerMarketingConsent,
  DbMarketingCampaign,
  DbMarketingCampaignDispatch,
  MarketingConsentInput,
  ClaimedDispatchItem,
  CampaignDispatchResultInput,
} from '@/types/marketing';

const DATA_DIR = path.join(process.cwd(), '.data');
const CONSENTS_FILE = path.join(DATA_DIR, 'marketing_consents.json');
const CAMPAIGNS_FILE = path.join(DATA_DIR, 'marketing_campaigns.json');
const DISPATCHES_FILE = path.join(DATA_DIR, 'marketing_dispatches.json');

const consentsCache = new Map<string, DbCustomerMarketingConsent>();
const campaignsCache = new Map<string, DbMarketingCampaign>();
const dispatchesCache = new Map<string, DbMarketingCampaignDispatch>();
let isInitialized = false;

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {}
  }
}

function loadDiskCache(): void {
  try {
    ensureDataDir();
    if (fs.existsSync(CONSENTS_FILE)) {
      const data: DbCustomerMarketingConsent[] = JSON.parse(fs.readFileSync(CONSENTS_FILE, 'utf-8'));
      consentsCache.clear();
      data.forEach((c) => consentsCache.set(c.email.toLowerCase().trim(), c));
    }
    if (fs.existsSync(CAMPAIGNS_FILE)) {
      const data: DbMarketingCampaign[] = JSON.parse(fs.readFileSync(CAMPAIGNS_FILE, 'utf-8'));
      campaignsCache.clear();
      data.forEach((c) => campaignsCache.set(c.campaign_key, c));
    }
    if (fs.existsSync(DISPATCHES_FILE)) {
      const data: DbMarketingCampaignDispatch[] = JSON.parse(fs.readFileSync(DISPATCHES_FILE, 'utf-8'));
      dispatchesCache.clear();
      data.forEach((d) => dispatchesCache.set(d.id, d));
    }
  } catch (err: any) {
    console.warn('⚠️ [MarketingStore Disk Load Error]:', err.message);
  }
}

function saveDiskCache(): void {
  try {
    ensureDataDir();
    fs.writeFileSync(CONSENTS_FILE, JSON.stringify(Array.from(consentsCache.values()), null, 2), 'utf-8');
    fs.writeFileSync(CAMPAIGNS_FILE, JSON.stringify(Array.from(campaignsCache.values()), null, 2), 'utf-8');
    fs.writeFileSync(DISPATCHES_FILE, JSON.stringify(Array.from(dispatchesCache.values()), null, 2), 'utf-8');
  } catch (err: any) {
    console.warn('⚠️ [MarketingStore Disk Save Error]:', err.message);
  }
}

export function generateUnsubscribeToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function initMarketingStore(): Promise<void> {
  if (isInitialized) return;
  isInitialized = true;
  loadDiskCache();
}

export function clearMarketingCacheForTesting(): void {
  consentsCache.clear();
  campaignsCache.clear();
  dispatchesCache.clear();
  isInitialized = false;
  try {
    if (fs.existsSync(CONSENTS_FILE)) fs.unlinkSync(CONSENTS_FILE);
    if (fs.existsSync(CAMPAIGNS_FILE)) fs.unlinkSync(CAMPAIGNS_FILE);
    if (fs.existsSync(DISPATCHES_FILE)) fs.unlinkSync(DISPATCHES_FILE);
  } catch {}
}

/**
 * Retrieve customer marketing consent by email.
 */
export async function getMarketingConsent(email: string): Promise<DbCustomerMarketingConsent | undefined> {
  if (!email) return undefined;
  await initMarketingStore();
  const normalized = email.toLowerCase().trim();

  const hasPg = await isPostgresAvailable();
  if (hasPg) {
    try {
      const res = await queryPostgres<DbCustomerMarketingConsent>(
        'SELECT * FROM customer_marketing_consents WHERE LOWER(email) = $1',
        [normalized]
      );
      if (res && res.rows.length > 0) {
        consentsCache.set(normalized, res.rows[0]);
        return res.rows[0];
      }
      return undefined;
    } catch (e: any) {
      console.warn('⚠️ [getMarketingConsent PG Error]:', e.message);
    }
  }

  return consentsCache.get(normalized);
}

/**
 * Retrieve customer marketing consent by secure unsubscribe token.
 */
export async function getMarketingConsentByToken(token: string): Promise<DbCustomerMarketingConsent | undefined> {
  if (!token) return undefined;
  await initMarketingStore();

  const hasPg = await isPostgresAvailable();
  if (hasPg) {
    try {
      const res = await queryPostgres<DbCustomerMarketingConsent>(
        'SELECT * FROM customer_marketing_consents WHERE unsubscribe_token = $1',
        [token]
      );
      if (res && res.rows.length > 0) {
        consentsCache.set(res.rows[0].email.toLowerCase().trim(), res.rows[0]);
        return res.rows[0];
      }
      return undefined;
    } catch (e: any) {
      console.warn('⚠️ [getMarketingConsentByToken PG Error]:', e.message);
    }
  }

  for (const consent of consentsCache.values()) {
    if (consent.unsubscribe_token === token) {
      return consent;
    }
  }
  return undefined;
}

/**
 * Record or update customer marketing consent explicitly.
 * Rule: Unchecking the consent box strictly does not grant consent.
 * Default is FALSE unless explicitly affirmative.
 */
export async function recordMarketingConsent(input: MarketingConsentInput): Promise<DbCustomerMarketingConsent> {
  await initMarketingStore();
  const email = input.email.toLowerCase().trim();
  if (!email || !email.includes('@')) {
    throw new AppError('Valid email address is required for consent tracking', 400, 'INVALID_EMAIL');
  }

  const existing = await getMarketingConsent(email);
  const now = new Date().toISOString();
  const token = existing?.unsubscribe_token || generateUnsubscribeToken();

  const isOptedIn = Boolean(input.isOptedIn);
  const consentedAt = isOptedIn ? now : existing?.consented_at || null;
  const unsubscribedAt = isOptedIn ? null : (existing?.unsubscribed_at || (!existing ? null : now));

  const record: DbCustomerMarketingConsent = {
    id: existing?.id || crypto.randomUUID(),
    user_id: input.userId || existing?.user_id || null,
    email,
    is_opted_in: isOptedIn,
    consent_source: input.source,
    consented_at: consentedAt,
    unsubscribed_at: unsubscribedAt,
    unsubscribe_token: token,
    ip_address: input.ipAddress || existing?.ip_address || null,
    user_agent: input.userAgent || existing?.user_agent || null,
    created_at: existing?.created_at || now,
    updated_at: now,
  };

  const hasPg = await isPostgresAvailable();
  if (hasPg) {
    try {
      const query = `
        INSERT INTO customer_marketing_consents (
          id, user_id, email, is_opted_in, consent_source, consented_at, unsubscribed_at, 
          unsubscribe_token, ip_address, user_agent, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (email) DO UPDATE SET
          user_id = COALESCE(EXCLUDED.user_id, customer_marketing_consents.user_id),
          is_opted_in = EXCLUDED.is_opted_in,
          consent_source = EXCLUDED.consent_source,
          consented_at = CASE WHEN EXCLUDED.is_opted_in = TRUE THEN EXCLUDED.consented_at ELSE customer_marketing_consents.consented_at END,
          unsubscribed_at = CASE WHEN EXCLUDED.is_opted_in = TRUE THEN NULL ELSE COALESCE(customer_marketing_consents.unsubscribed_at, EXCLUDED.updated_at) END,
          ip_address = COALESCE(EXCLUDED.ip_address, customer_marketing_consents.ip_address),
          user_agent = COALESCE(EXCLUDED.user_agent, customer_marketing_consents.user_agent),
          updated_at = EXCLUDED.updated_at
        RETURNING *;
      `;
      const res = await queryPostgres<DbCustomerMarketingConsent>(query, [
        record.id,
        record.user_id,
        record.email,
        record.is_opted_in,
        record.consent_source,
        record.consented_at,
        record.unsubscribed_at,
        record.unsubscribe_token,
        record.ip_address,
        record.user_agent,
        record.created_at,
        record.updated_at,
      ]);

      if (res && res.rows.length > 0) {
        consentsCache.set(email, res.rows[0]);
        saveDiskCache();
        return res.rows[0];
      }
    } catch (err: any) {
      console.warn('⚠️ [recordMarketingConsent PG Upsert Error]:', err.message);
    }
  }

  consentsCache.set(email, record);
  saveDiskCache();
  return record;
}

/**
 * Idempotently process customer unsubscribe request by token or email.
 */
export async function unsubscribeCustomer(
  identifier: { token?: string; email?: string; reason?: string }
): Promise<{ success: boolean; message: string; email?: string }> {
  await initMarketingStore();
  const now = new Date().toISOString();

  let targetConsent: DbCustomerMarketingConsent | undefined;
  if (identifier.token) {
    targetConsent = await getMarketingConsentByToken(identifier.token);
  } else if (identifier.email) {
    targetConsent = await getMarketingConsent(identifier.email);
  }

  if (!targetConsent && identifier.email) {
    // Proactively persist an unsubscribed record so this email is never targeted in campaigns
    const email = identifier.email.toLowerCase().trim();
    targetConsent = {
      id: crypto.randomUUID(),
      user_id: null,
      email,
      is_opted_in: false,
      consent_source: 'API',
      consented_at: null,
      unsubscribed_at: now,
      unsubscribe_token: generateUnsubscribeToken(),
      created_at: now,
      updated_at: now,
    };
  }

  if (!targetConsent) {
    return {
      success: false,
      message: 'Unsubscribe token or record not found.',
    };
  }

  targetConsent.is_opted_in = false;
  targetConsent.unsubscribed_at = targetConsent.unsubscribed_at || now;
  targetConsent.updated_at = now;

  const hasPg = await isPostgresAvailable();
  if (hasPg) {
    try {
      if (identifier.token) {
        await queryPostgres('SELECT unsubscribe_customer_by_token($1, $2)', [
          identifier.token,
          identifier.reason || 'User requested via unsubscribe link',
        ]);
      } else if (targetConsent.email) {
        await queryPostgres('SELECT unsubscribe_customer_by_email($1, $2)', [
          targetConsent.email,
          identifier.reason || 'User requested unsubscribe',
        ]);
      }
    } catch (err: any) {
      console.warn('⚠️ [unsubscribeCustomer PG Error]:', err.message);
    }
  }

  consentsCache.set(targetConsent.email.toLowerCase().trim(), targetConsent);
  saveDiskCache();

  return {
    success: true,
    message: 'You have been successfully unsubscribed from Veloura Living promotional emails.',
    email: targetConsent.email,
  };
}

/**
 * Retrieve eligible marketing audience for a campaign.
 * Criteria: is_opted_in = true, unsubscribed_at IS NULL, verified/active, non-admin.
 */
export async function getEligibleMarketingAudience(campaignKey?: string): Promise<{
  total: number;
  recipients: Array<{
    userId?: string | null;
    email: string;
    firstName: string;
    lastName: string;
    unsubscribeToken: string;
  }>;
}> {
  await initMarketingStore();
  const hasPg = await isPostgresAvailable();

  if (hasPg) {
    try {
      const query = `
        SELECT 
          u.id AS user_id,
          LOWER(TRIM(cmc.email)) AS email,
          COALESCE(p.first_name, '') AS first_name,
          COALESCE(p.last_name, '') AS last_name,
          cmc.unsubscribe_token
        FROM customer_marketing_consents cmc
        LEFT JOIN users u ON LOWER(u.email) = LOWER(cmc.email)
        LEFT JOIN profiles p ON p.user_id = u.id
        WHERE cmc.is_opted_in = TRUE
          AND cmc.unsubscribed_at IS NULL
          AND (u.status IS NULL OR u.status = 'ACTIVE')
          AND (u.is_email_verified IS NULL OR u.is_email_verified = TRUE)
          AND NOT EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON r.id = ur.role_id
            WHERE ur.user_id = u.id AND r.name IN ('ADMIN', 'MANAGER', 'PRODUCT_MANAGER', 'ORDER_MANAGER')
          )
        ORDER BY cmc.created_at ASC;
      `;
      const res = await queryPostgres<{
        user_id: string | null;
        email: string;
        first_name: string;
        last_name: string;
        unsubscribe_token: string;
      }>(query);

      if (res) {
        return {
          total: res.rows.length,
          recipients: res.rows.map((r) => ({
            userId: r.user_id,
            email: r.email,
            firstName: r.first_name,
            lastName: r.last_name,
            unsubscribeToken: r.unsubscribe_token,
          })),
        };
      }
    } catch (e: any) {
      console.warn('⚠️ [getEligibleMarketingAudience PG Error]:', e.message);
    }
  }

  // Memory/Disk Fallback
  const list: Array<{
    userId?: string | null;
    email: string;
    firstName: string;
    lastName: string;
    unsubscribeToken: string;
  }> = [];

  for (const c of consentsCache.values()) {
    if (c.is_opted_in && !c.unsubscribed_at) {
      list.push({
        userId: c.user_id || null,
        email: c.email,
        firstName: '',
        lastName: '',
        unsubscribeToken: c.unsubscribe_token,
      });
    }
  }

  return {
    total: list.length,
    recipients: list,
  };
}

/**
 * Register or fetch marketing campaign metadata.
 */
export async function createOrGetCampaign(campaign: {
  campaignKey: string;
  title: string;
  subject: string;
  description?: string;
  metadata?: Record<string, any>;
}): Promise<DbMarketingCampaign> {
  await initMarketingStore();
  const key = campaign.campaignKey.trim();
  const now = new Date().toISOString();

  const hasPg = await isPostgresAvailable();
  if (hasPg) {
    try {
      const res = await queryPostgres<DbMarketingCampaign>(
        `INSERT INTO marketing_campaigns (campaign_key, title, subject, description, is_active, metadata)
         VALUES ($1, $2, $3, $4, TRUE, $5)
         ON CONFLICT (campaign_key) DO UPDATE SET
           title = EXCLUDED.title,
           subject = EXCLUDED.subject,
           description = COALESCE(EXCLUDED.description, marketing_campaigns.description),
           updated_at = CURRENT_TIMESTAMP
         RETURNING *;`,
        [key, campaign.title, campaign.subject, campaign.description || null, JSON.stringify(campaign.metadata || {})]
      );
      if (res && res.rows.length > 0) {
        campaignsCache.set(key, res.rows[0]);
        return res.rows[0];
      }
    } catch (e: any) {
      console.warn('⚠️ [createOrGetCampaign PG Error]:', e.message);
    }
  }

  let existing = campaignsCache.get(key);
  if (!existing) {
    existing = {
      id: crypto.randomUUID(),
      campaign_key: key,
      title: campaign.title,
      subject: campaign.subject,
      description: campaign.description || null,
      is_active: true,
      metadata: campaign.metadata || {},
      created_at: now,
      updated_at: now,
    };
    campaignsCache.set(key, existing);
    saveDiskCache();
  }
  return existing;
}

/**
 * Populate dispatch records for all currently eligible recipients.
 * Enforces database uniqueness on (campaign_key, email).
 */
export async function populateCampaignDispatches(campaignKey: string): Promise<number> {
  await initMarketingStore();
  const hasPg = await isPostgresAvailable();

  if (hasPg) {
    try {
      const res = await queryPostgres<{ populate_campaign_dispatches: number }>(
        'SELECT populate_campaign_dispatches($1);',
        [campaignKey]
      );
      if (res && res.rows.length > 0) {
        return Number(res.rows[0].populate_campaign_dispatches) || 0;
      }
    } catch (e: any) {
      console.warn('⚠️ [populateCampaignDispatches PG Error]:', e.message);
    }
  }

  // Memory fallback
  const audience = await getEligibleMarketingAudience(campaignKey);
  const campaign = await createOrGetCampaign({
    campaignKey,
    title: 'Festive Campaign',
    subject: 'Special Atelier Edition',
  });

  let count = 0;
  for (const r of audience.recipients) {
    const dispatchKey = `${campaignKey}:${r.email.toLowerCase()}`;
    const exists = Array.from(dispatchesCache.values()).some(
      (d) => d.campaign_key === campaignKey && d.email.toLowerCase() === r.email.toLowerCase()
    );
    if (!exists) {
      const newDispatch: DbMarketingCampaignDispatch = {
        id: crypto.randomUUID(),
        campaign_id: campaign.id,
        campaign_key: campaignKey,
        user_id: r.userId || null,
        email: r.email,
        status: 'PENDING',
        attempts: 0,
        max_attempts: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      dispatchesCache.set(newDispatch.id, newDispatch);
      count++;
    }
  }
  saveDiskCache();
  return count;
}

/**
 * Concurrency-safe atomic claim for n8n workers.
 * Uses PostgreSQL 'FOR UPDATE SKIP LOCKED' to prevent race conditions across parallel executions.
 */
export async function claimCampaignDispatches(
  campaignKey: string,
  workerId: string,
  batchSize: number = 50
): Promise<ClaimedDispatchItem[]> {
  await initMarketingStore();
  const hasPg = await isPostgresAvailable();

  if (hasPg) {
    try {
      const res = await queryPostgres<{
        dispatch_id: string;
        campaign_id: string;
        campaign_key: string;
        email: string;
        first_name: string;
        last_name: string;
        unsubscribe_token: string;
      }>(
        'SELECT * FROM claim_campaign_dispatches($1, $2, $3);',
        [campaignKey, workerId, batchSize]
      );

      if (res && res.rows.length > 0) {
        return res.rows.map((row) => ({
          dispatchId: row.dispatch_id,
          campaignId: row.campaign_id,
          campaignKey: row.campaign_key,
          email: row.email,
          firstName: row.first_name,
          lastName: row.last_name,
          unsubscribeToken: row.unsubscribe_token,
        }));
      }
      return [];
    } catch (e: any) {
      console.warn('⚠️ [claimCampaignDispatches PG Error]:', e.message);
    }
  }

  // Memory/Disk Fallback with Lock Emulation
  const claimed: ClaimedDispatchItem[] = [];
  const now = new Date().toISOString();

  for (const dispatch of dispatchesCache.values()) {
    if (dispatch.campaign_key === campaignKey && dispatch.status === 'PENDING' && dispatch.attempts < dispatch.max_attempts) {
      const consent = consentsCache.get(dispatch.email.toLowerCase().trim());
      // Re-verify they are still opted-in and not unsubscribed
      if (!consent || !consent.is_opted_in || consent.unsubscribed_at) {
        dispatch.status = 'SKIPPED_UNSUBSCRIBED';
        dispatch.updated_at = now;
        continue;
      }

      dispatch.status = 'CLAIMED';
      dispatch.claimed_at = now;
      dispatch.claimed_by = workerId;
      dispatch.attempts += 1;
      dispatch.updated_at = now;

      claimed.push({
        dispatchId: dispatch.id,
        campaignId: dispatch.campaign_id,
        campaignKey: dispatch.campaign_key,
        email: dispatch.email,
        firstName: '',
        lastName: '',
        unsubscribeToken: consent.unsubscribe_token,
      });

      if (claimed.length >= batchSize) break;
    }
  }

  saveDiskCache();
  return claimed;
}

/**
 * Record dispatch result (e.g. from Brevo or n8n).
 * Distinguishes ACCEPTED, FAILED, BOUNCED, and TIMEOUT_AMBIGUOUS outcomes.
 */
export async function recordDispatchResult(
  input: CampaignDispatchResultInput
): Promise<DbMarketingCampaignDispatch | undefined> {
  await initMarketingStore();
  const now = new Date().toISOString();

  const hasPg = await isPostgresAvailable();
  if (hasPg) {
    try {
      const res = await queryPostgres<DbMarketingCampaignDispatch>(
        `UPDATE marketing_campaign_dispatches
         SET status = $1,
             sent_at = CASE WHEN $1 = 'ACCEPTED' THEN CURRENT_TIMESTAMP ELSE sent_at END,
             provider_message_id = COALESCE($2, provider_message_id),
             failure_reason = COALESCE($3, failure_reason),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4
         RETURNING *;`,
        [input.status, input.providerMessageId || null, input.failureReason || null, input.dispatchId]
      );

      if (res && res.rows.length > 0) {
        const updated = res.rows[0];
        dispatchesCache.set(updated.id, updated);

        // If outcome is BOUNCED, immediately mark customer as unsubscribed
        if (input.status === 'BOUNCED') {
          await unsubscribeCustomer({ email: updated.email, reason: 'Provider reported email bounce' });
        }

        return updated;
      }
    } catch (e: any) {
      console.warn('⚠️ [recordDispatchResult PG Error]:', e.message);
    }
  }

  const dispatch = dispatchesCache.get(input.dispatchId);
  if (dispatch) {
    dispatch.status = input.status;
    if (input.status === 'ACCEPTED') {
      dispatch.sent_at = now;
    }
    dispatch.provider_message_id = input.providerMessageId || dispatch.provider_message_id;
    dispatch.failure_reason = input.failureReason || dispatch.failure_reason;
    dispatch.updated_at = now;

    if (input.status === 'BOUNCED') {
      await unsubscribeCustomer({ email: dispatch.email, reason: 'Provider reported email bounce' });
    }

    saveDiskCache();
    return dispatch;
  }

  return undefined;
}

export const marketingCampaignService = {
  createOrGetCampaign,
  populateCampaignDispatches,
  claimCampaignDispatches,
};
