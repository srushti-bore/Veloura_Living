/**
 * 🏛️ Veloura Living — Marketing Consent, Unsubscribe & Campaign Safety Store (Backend Microservice)
 * Primary Source of Truth: PostgreSQL / Supabase Relational Database.
 */

import crypto from 'crypto';
import { queryPostgres, isPostgresAvailable } from '../db/postgres';
import { AppError } from '../api/errorHandler';
import {
  DbCustomerMarketingConsent,
  DbMarketingCampaign,
  DbMarketingCampaignDispatch,
  MarketingConsentInput,
  ClaimedDispatchItem,
  CampaignDispatchResultInput,
} from '../types/marketing';

const consentsCache = new Map<string, DbCustomerMarketingConsent>();
const campaignsCache = new Map<string, DbMarketingCampaign>();
const dispatchesCache = new Map<string, DbMarketingCampaignDispatch>();

export function generateUnsubscribeToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function getMarketingConsent(email: string): Promise<DbCustomerMarketingConsent | undefined> {
  if (!email) return undefined;
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
      console.warn('⚠️ [getMarketingConsent PG Error (Backend)]:', e.message);
    }
  }

  return consentsCache.get(normalized);
}

export async function getMarketingConsentByToken(token: string): Promise<DbCustomerMarketingConsent | undefined> {
  if (!token) return undefined;

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
      console.warn('⚠️ [getMarketingConsentByToken PG Error (Backend)]:', e.message);
    }
  }

  for (const consent of consentsCache.values()) {
    if (consent.unsubscribe_token === token) return consent;
  }
  return undefined;
}

export async function recordMarketingConsent(input: MarketingConsentInput): Promise<DbCustomerMarketingConsent> {
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
        return res.rows[0];
      }
    } catch (err: any) {
      console.warn('⚠️ [recordMarketingConsent PG Error (Backend)]:', err.message);
    }
  }

  consentsCache.set(email, record);
  return record;
}

export async function unsubscribeCustomer(
  identifier: { token?: string; email?: string; reason?: string }
): Promise<{ success: boolean; message: string; email?: string }> {
  const now = new Date().toISOString();

  let targetConsent: DbCustomerMarketingConsent | undefined;
  if (identifier.token) {
    targetConsent = await getMarketingConsentByToken(identifier.token);
  } else if (identifier.email) {
    targetConsent = await getMarketingConsent(identifier.email);
  }

  if (!targetConsent && identifier.email) {
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
    return { success: false, message: 'Unsubscribe token or record not found.' };
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
      console.warn('⚠️ [unsubscribeCustomer PG Error (Backend)]:', err.message);
    }
  }

  consentsCache.set(targetConsent.email.toLowerCase().trim(), targetConsent);
  return {
    success: true,
    message: 'You have been successfully unsubscribed from Veloura Living promotional emails.',
    email: targetConsent.email,
  };
}
