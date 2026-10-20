-- ============================================================================
-- Migration: 20261020000001_marketing_campaign_test_recipient_isolation.sql
-- Description: Adds deterministic test-recipient isolation to claim_campaign_dispatches.
-- Enables n8n/test runners to specify an optional target email so test runs exclusively
-- claim designated recipients without risking real customer dispatches.
-- ============================================================================

-- 1. Create or replace 4-parameter claim function with target email filtering
CREATE OR REPLACE FUNCTION claim_campaign_dispatches(
    p_campaign_key VARCHAR,
    p_worker_id VARCHAR,
    p_batch_size INT DEFAULT 50,
    p_target_email VARCHAR DEFAULT NULL
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
          AND (p_target_email IS NULL OR TRIM(p_target_email) = '' OR LOWER(cd.email) = LOWER(TRIM(p_target_email)))
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

-- 2. Backward compatibility wrapper for existing 3-argument callers
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
    RETURN QUERY SELECT * FROM claim_campaign_dispatches(p_campaign_key, p_worker_id, p_batch_size, NULL::VARCHAR);
END;
$$;

-- 3. Security Hardening: Revoke from PUBLIC, anon, and authenticated; grant strictly to service_role
REVOKE ALL ON FUNCTION claim_campaign_dispatches(VARCHAR, VARCHAR, INT, VARCHAR) FROM PUBLIC;
REVOKE ALL ON FUNCTION claim_campaign_dispatches(VARCHAR, VARCHAR, INT) FROM PUBLIC;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        REVOKE ALL ON FUNCTION claim_campaign_dispatches(VARCHAR, VARCHAR, INT, VARCHAR) FROM anon;
        REVOKE ALL ON FUNCTION claim_campaign_dispatches(VARCHAR, VARCHAR, INT) FROM anon;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
        REVOKE ALL ON FUNCTION claim_campaign_dispatches(VARCHAR, VARCHAR, INT, VARCHAR) FROM authenticated;
        REVOKE ALL ON FUNCTION claim_campaign_dispatches(VARCHAR, VARCHAR, INT) FROM authenticated;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
        GRANT EXECUTE ON FUNCTION claim_campaign_dispatches(VARCHAR, VARCHAR, INT, VARCHAR) TO service_role;
        GRANT EXECUTE ON FUNCTION claim_campaign_dispatches(VARCHAR, VARCHAR, INT) TO service_role;
    END IF;
END $$;

-- 4. Apply explicit search_path to functions to defend against CWE-426 search_path hijacking
ALTER FUNCTION claim_campaign_dispatches(VARCHAR, VARCHAR, INT, VARCHAR) SET search_path = public, pg_temp;
ALTER FUNCTION claim_campaign_dispatches(VARCHAR, VARCHAR, INT) SET search_path = public, pg_temp;
