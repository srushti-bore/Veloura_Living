-- ============================================================================
-- 🏛️ Supabase Migration: 20261019000001_marketing_consent_and_campaign_safety.sql
-- Veloura Living — Marketing Consent, Unsubscribe Management & Campaign Safety
-- Reference: prompt/Veloura_Living_Marketing_Consent_and_Campaign_Safety.md
-- ============================================================================

-- Ensure required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. ENUMS FOR MARKETING & CAMPAIGN DISPATCH
-- ============================================================================

DO $$ BEGIN
    CREATE TYPE consent_source_enum AS ENUM (
        'CHECKOUT', 'FOOTER_NEWSLETTER', 'ACCOUNT_SETTINGS', 'API', 'IMPORT'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE campaign_dispatch_status_enum AS ENUM (
        'PENDING', 
        'CLAIMED', 
        'SENDING', 
        'ACCEPTED', 
        'DELIVERED', 
        'FAILED', 
        'BOUNCED', 
        'SKIPPED_UNSUBSCRIBED', 
        'TIMEOUT_AMBIGUOUS'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 2. CUSTOMER MARKETING CONSENTS & UNSUBSCRIBE PREFERENCES
-- ============================================================================

CREATE TABLE IF NOT EXISTS customer_marketing_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    is_opted_in BOOLEAN NOT NULL DEFAULT FALSE,
    consent_source consent_source_enum,
    consented_at TIMESTAMPTZ,
    unsubscribed_at TIMESTAMPTZ,
    unsubscribe_token VARCHAR(128) NOT NULL UNIQUE,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Ensure user_id foreign key constraint uses ON DELETE SET NULL to preserve unsubscribe suppression history upon user deletion
-- Deterministically inspects confdeltype ('n' = SET NULL) to avoid unnecessarily dropping or recreating an already-correct constraint
DO $$ 
DECLARE
    v_confdeltype "char";
BEGIN
    SELECT c.confdeltype INTO v_confdeltype
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE t.relname = 'customer_marketing_consents'
      AND c.conname = 'customer_marketing_consents_user_id_fkey'
      AND c.contype = 'f';

    IF v_confdeltype IS NULL THEN
        -- Constraint does not exist yet; add it
        ALTER TABLE customer_marketing_consents 
            ADD CONSTRAINT customer_marketing_consents_user_id_fkey 
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
    ELSIF v_confdeltype <> 'n' THEN
        -- Constraint exists but does NOT use ON DELETE SET NULL (e.g. legacy CASCADE); upgrade it
        ALTER TABLE customer_marketing_consents 
            DROP CONSTRAINT customer_marketing_consents_user_id_fkey;

        ALTER TABLE customer_marketing_consents 
            ADD CONSTRAINT customer_marketing_consents_user_id_fkey 
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
    -- If v_confdeltype = 'n', the constraint already enforces ON DELETE SET NULL; do nothing.
END $$;

CREATE INDEX IF NOT EXISTS idx_marketing_consents_email ON customer_marketing_consents(email);
CREATE INDEX IF NOT EXISTS idx_marketing_consents_opted_in ON customer_marketing_consents(is_opted_in) WHERE is_opted_in = TRUE;
CREATE INDEX IF NOT EXISTS idx_marketing_consents_unsub_token ON customer_marketing_consents(unsubscribe_token);
CREATE INDEX IF NOT EXISTS idx_marketing_consents_user_id ON customer_marketing_consents(user_id);

-- ============================================================================
-- 3. MARKETING CAMPAIGNS REGISTRY
-- ============================================================================

CREATE TABLE IF NOT EXISTS marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_key VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_key ON marketing_campaigns(campaign_key);

-- ============================================================================
-- 4. MARKETING CAMPAIGN DISPATCHES (STRICT DEDUPLICATION & ATOMIC CLAIMS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS marketing_campaign_dispatches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
    campaign_key VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL,
    status campaign_dispatch_status_enum NOT NULL DEFAULT 'PENDING',
    claimed_at TIMESTAMPTZ,
    claimed_by VARCHAR(100),
    sent_at TIMESTAMPTZ,
    provider_message_id VARCHAR(150),
    attempts INT NOT NULL DEFAULT 0,
    max_attempts INT NOT NULL DEFAULT 3,
    failure_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- DATABASE-LEVEL UNIQUENESS CONSTRAINT:
    -- Guarantees that a customer can NEVER receive duplicate dispatches for the same campaign
    CONSTRAINT uq_campaign_recipient UNIQUE (campaign_key, email)
);

CREATE INDEX IF NOT EXISTS idx_campaign_dispatches_status ON marketing_campaign_dispatches(campaign_key, status);
CREATE INDEX IF NOT EXISTS idx_campaign_dispatches_email ON marketing_campaign_dispatches(email);
CREATE INDEX IF NOT EXISTS idx_campaign_dispatches_provider_id ON marketing_campaign_dispatches(provider_message_id);

-- ============================================================================
-- 5. AUDIENCE POPULATION STORED FUNCTION FOR n8n / CAMPAIGN RUNNER
-- ============================================================================

CREATE OR REPLACE FUNCTION populate_campaign_dispatches(p_campaign_key VARCHAR)
RETURNS INT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_campaign_id UUID;
    v_inserted_count INT;
BEGIN
    SELECT id INTO v_campaign_id 
    FROM marketing_campaigns 
    WHERE campaign_key = p_campaign_key AND is_active = TRUE;

    IF v_campaign_id IS NULL THEN
        RAISE EXCEPTION 'Active marketing campaign not found for key: %', p_campaign_key
            USING ERRCODE = '22000';
    END IF;

    -- Insert eligible recipients (opted in, not unsubscribed, verified/active, non-admin)
    INSERT INTO marketing_campaign_dispatches (
        campaign_id,
        campaign_key,
        user_id,
        email,
        status
    )
    SELECT 
        v_campaign_id,
        p_campaign_key,
        u.id AS user_id,
        LOWER(TRIM(cmc.email)),
        'PENDING'::campaign_dispatch_status_enum
    FROM customer_marketing_consents cmc
    LEFT JOIN users u ON LOWER(u.email) = LOWER(cmc.email)
    WHERE cmc.is_opted_in = TRUE 
      AND cmc.unsubscribed_at IS NULL
      AND (u.status IS NULL OR u.status = 'ACTIVE')
      AND (u.is_email_verified IS NULL OR u.is_email_verified = TRUE)
      AND NOT EXISTS (
          -- Strictly exclude internal administrators and ops managers
          SELECT 1 
          FROM user_roles ur
          JOIN roles r ON r.id = ur.role_id
          WHERE ur.user_id = u.id 
            AND r.name IN ('ADMIN', 'MANAGER', 'PRODUCT_MANAGER', 'ORDER_MANAGER')
      )
    ON CONFLICT (campaign_key, email) DO NOTHING;

    GET DIAGNOSTICS v_inserted_count = ROW_COUNT;
    RETURN v_inserted_count;
END;
$$;

-- ============================================================================
-- 6. ATOMIC CAMPAIGN DISPATCH CLAIM FUNCTION FOR n8n (FOR UPDATE SKIP LOCKED)
-- ============================================================================

CREATE OR REPLACE FUNCTION claim_campaign_dispatches(
    p_campaign_key VARCHAR,
    p_worker_id VARCHAR,
    p_batch_size INT DEFAULT 50
)
RETURNS TABLE (
    dispatch_id UUID,
    campaign_id UUID,
    campaign_key VARCHAR,
    email VARCHAR,
    first_name VARCHAR,
    last_name VARCHAR,
    unsubscribe_token VARCHAR
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN QUERY
    WITH locked_rows AS (
        SELECT cd.id
        FROM marketing_campaign_dispatches cd
        INNER JOIN customer_marketing_consents cmc ON LOWER(cmc.email) = LOWER(cd.email)
        WHERE cd.campaign_key = p_campaign_key
          AND cd.status = 'PENDING'
          AND cmc.is_opted_in = TRUE
          AND cmc.unsubscribed_at IS NULL
          AND cd.attempts < cd.max_attempts
        ORDER BY cd.created_at ASC
        LIMIT p_batch_size
        FOR UPDATE OF cd SKIP LOCKED
    ),
    updated AS (
        UPDATE marketing_campaign_dispatches cd
        SET status = 'CLAIMED'::campaign_dispatch_status_enum,
            claimed_at = CURRENT_TIMESTAMP,
            claimed_by = p_worker_id,
            attempts = cd.attempts + 1,
            updated_at = CURRENT_TIMESTAMP
        FROM locked_rows lr
        WHERE cd.id = lr.id
        RETURNING cd.id, cd.campaign_id, cd.campaign_key, cd.email, cd.user_id
    )
    SELECT 
        u.id AS dispatch_id,
        u.campaign_id,
        u.campaign_key,
        u.email,
        COALESCE(p.first_name, '') AS first_name,
        COALESCE(p.last_name, '') AS last_name,
        COALESCE(cmc.unsubscribe_token, '') AS unsubscribe_token
    FROM updated u
    LEFT JOIN profiles p ON p.user_id = u.user_id
    LEFT JOIN customer_marketing_consents cmc ON LOWER(cmc.email) = LOWER(u.email);
END;
$$;

-- ============================================================================
-- 7. IDEMPOTENT UNSUBSCRIBE STORED FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION unsubscribe_customer_by_token(
    p_token VARCHAR,
    p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_found BOOLEAN;
BEGIN
    UPDATE customer_marketing_consents
    SET is_opted_in = FALSE,
        unsubscribed_at = COALESCE(unsubscribed_at, CURRENT_TIMESTAMP),
        updated_at = CURRENT_TIMESTAMP
    WHERE unsubscribe_token = p_token;

    GET DIAGNOSTICS v_found = ROW_COUNT;
    RETURN (v_found > 0);
END;
$$;

CREATE OR REPLACE FUNCTION unsubscribe_customer_by_email(
    p_email VARCHAR,
    p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_found BOOLEAN;
BEGIN
    UPDATE customer_marketing_consents
    SET is_opted_in = FALSE,
        unsubscribed_at = COALESCE(unsubscribed_at, CURRENT_TIMESTAMP),
        updated_at = CURRENT_TIMESTAMP
    WHERE LOWER(email) = LOWER(TRIM(p_email));

    GET DIAGNOSTICS v_found = ROW_COUNT;
    RETURN (v_found > 0);
END;
$$;

-- ============================================================================
-- 8. ROW LEVEL SECURITY (RLS) & POSTGREST ACCESS RESTRICTIONS
-- ============================================================================

-- 1. Enable RLS on every marketing and campaign table
ALTER TABLE customer_marketing_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaign_dispatches ENABLE ROW LEVEL SECURITY;

-- 2. Revoke table-level permissions from PUBLIC (standard PostgreSQL)
REVOKE ALL ON customer_marketing_consents FROM PUBLIC;
REVOKE ALL ON marketing_campaigns FROM PUBLIC;
REVOKE ALL ON marketing_campaign_dispatches FROM PUBLIC;

-- 3. Explicitly revoke anon & authenticated access and grant strictly to service_role (Supabase environment)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        REVOKE ALL ON customer_marketing_consents FROM anon;
        REVOKE ALL ON marketing_campaigns FROM anon;
        REVOKE ALL ON marketing_campaign_dispatches FROM anon;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
        REVOKE ALL ON customer_marketing_consents FROM authenticated;
        REVOKE ALL ON marketing_campaigns FROM authenticated;
        REVOKE ALL ON marketing_campaign_dispatches FROM authenticated;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
        GRANT ALL ON customer_marketing_consents TO service_role;
        GRANT ALL ON marketing_campaigns TO service_role;
        GRANT ALL ON marketing_campaign_dispatches TO service_role;
    END IF;
END $$;

-- 4. Create explicit RLS policies for service_role ensuring default-deny for all other roles
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'customer_marketing_consents' AND policyname = 'service_role_manage_marketing_consents'
        ) THEN
            CREATE POLICY service_role_manage_marketing_consents 
            ON customer_marketing_consents
            FOR ALL
            TO service_role
            USING (true)
            WITH CHECK (true);
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'marketing_campaigns' AND policyname = 'service_role_manage_campaigns'
        ) THEN
            CREATE POLICY service_role_manage_campaigns 
            ON marketing_campaigns
            FOR ALL
            TO service_role
            USING (true)
            WITH CHECK (true);
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'marketing_campaign_dispatches' AND policyname = 'service_role_manage_dispatches'
        ) THEN
            CREATE POLICY service_role_manage_dispatches 
            ON marketing_campaign_dispatches
            FOR ALL
            TO service_role
            USING (true)
            WITH CHECK (true);
        END IF;
    END IF;
END $$;

-- 5. Revoke function execution from PUBLIC, anon, and authenticated
REVOKE ALL ON FUNCTION populate_campaign_dispatches(VARCHAR) FROM PUBLIC;
REVOKE ALL ON FUNCTION claim_campaign_dispatches(VARCHAR, VARCHAR, INT) FROM PUBLIC;
REVOKE ALL ON FUNCTION unsubscribe_customer_by_token(VARCHAR, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION unsubscribe_customer_by_email(VARCHAR, TEXT) FROM PUBLIC;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        REVOKE ALL ON FUNCTION populate_campaign_dispatches(VARCHAR) FROM anon;
        REVOKE ALL ON FUNCTION claim_campaign_dispatches(VARCHAR, VARCHAR, INT) FROM anon;
        REVOKE ALL ON FUNCTION unsubscribe_customer_by_token(VARCHAR, TEXT) FROM anon;
        REVOKE ALL ON FUNCTION unsubscribe_customer_by_email(VARCHAR, TEXT) FROM anon;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
        REVOKE ALL ON FUNCTION populate_campaign_dispatches(VARCHAR) FROM authenticated;
        REVOKE ALL ON FUNCTION claim_campaign_dispatches(VARCHAR, VARCHAR, INT) FROM authenticated;
        REVOKE ALL ON FUNCTION unsubscribe_customer_by_token(VARCHAR, TEXT) FROM authenticated;
        REVOKE ALL ON FUNCTION unsubscribe_customer_by_email(VARCHAR, TEXT) FROM authenticated;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
        GRANT EXECUTE ON FUNCTION populate_campaign_dispatches(VARCHAR) TO service_role;
        GRANT EXECUTE ON FUNCTION claim_campaign_dispatches(VARCHAR, VARCHAR, INT) TO service_role;
        GRANT EXECUTE ON FUNCTION unsubscribe_customer_by_token(VARCHAR, TEXT) TO service_role;
        GRANT EXECUTE ON FUNCTION unsubscribe_customer_by_email(VARCHAR, TEXT) TO service_role;
    END IF;
END $$;

-- 6. Apply explicit search_path to functions to defend against CWE-426 search_path hijacking
ALTER FUNCTION populate_campaign_dispatches(VARCHAR) SET search_path = public, pg_temp;
ALTER FUNCTION claim_campaign_dispatches(VARCHAR, VARCHAR, INT) SET search_path = public, pg_temp;
ALTER FUNCTION unsubscribe_customer_by_token(VARCHAR, TEXT) SET search_path = public, pg_temp;
ALTER FUNCTION unsubscribe_customer_by_email(VARCHAR, TEXT) SET search_path = public, pg_temp;

