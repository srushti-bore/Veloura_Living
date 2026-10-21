/**
-- * 🏛️ Veloura Living — Marketing, Consent & Campaign Safety Types
-- * Prepared for n8n Workflow Automation & Brevo Promotional Campaigns
-- */

export type ConsentSourceEnum = 
  | 'CHECKOUT' 
  | 'FOOTER_NEWSLETTER' 
  | 'ACCOUNT_SETTINGS' 
  | 'API' 
  | 'IMPORT';

export type CampaignDispatchStatusEnum = 
  | 'PENDING' 
  | 'CLAIMED' 
  | 'SENDING' 
  | 'ACCEPTED' 
  | 'DELIVERED' 
  | 'FAILED' 
  | 'BOUNCED' 
  | 'SKIPPED_UNSUBSCRIBED' 
  | 'TIMEOUT_AMBIGUOUS';

export interface DbCustomerMarketingConsent {
  id: string;
  user_id?: string | null;
  email: string;
  is_opted_in: boolean;
  consent_source?: ConsentSourceEnum | null;
  consented_at?: string | null;
  unsubscribed_at?: string | null;
  unsubscribe_token: string;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbMarketingCampaign {
  id: string;
  campaign_key: string;
  title: string;
  subject: string;
  description?: string | null;
  is_active: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DbMarketingCampaignDispatch {
  id: string;
  campaign_id: string;
  campaign_key: string;
  user_id?: string | null;
  email: string;
  status: CampaignDispatchStatusEnum;
  claimed_at?: string | null;
  claimed_by?: string | null;
  sent_at?: string | null;
  provider_message_id?: string | null;
  attempts: number;
  max_attempts: number;
  failure_reason?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MarketingConsentInput {
  email: string;
  isOptedIn: boolean;
  source: ConsentSourceEnum;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface ClaimedDispatchItem {
  dispatchId: string;
  campaignId: string;
  campaignKey: string;
  email: string;
  firstName: string;
  lastName: string;
  unsubscribeToken: string;
}

export interface CampaignDispatchResultInput {
  dispatchId: string;
  status: 'ACCEPTED' | 'FAILED' | 'BOUNCED' | 'TIMEOUT_AMBIGUOUS';
  providerMessageId?: string;
  failureReason?: string;
}

export interface CampaignClaimInput {
  campaignKey: string;
  workerId?: string;
  claimedBy?: string;
  batchSize?: number;
  title?: string;
  subject?: string;
  testRecipientEmail?: string;
}
