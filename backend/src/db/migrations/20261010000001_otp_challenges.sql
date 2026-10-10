-- ============================================================================
-- 🏛️ Supabase Migration: 20261010000001_otp_challenges.sql
-- Veloura Living — Shared Persistent OTP Challenge Store
-- Reference: docs/Veloura_Living_SRS.md (AUTH-001, AUTH-003, AUTH-007, SEC-002)
-- ============================================================================

CREATE TABLE IF NOT EXISTS otp_challenges (
    challenge_token VARCHAR(128) PRIMARY KEY,
    challenge_id UUID NOT NULL DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    user_id UUID,
    otp_hash VARCHAR(128) NOT NULL,
    salt VARCHAR(64) NOT NULL,
    type VARCHAR(32) NOT NULL CHECK (type IN ('LOGIN', 'REGISTER')),
    attempts INT NOT NULL DEFAULT 0,
    max_attempts INT NOT NULL DEFAULT 5,
    resends INT NOT NULL DEFAULT 0,
    max_resends INT NOT NULL DEFAULT 3,
    created_at BIGINT NOT NULL,
    expires_at BIGINT NOT NULL,
    last_sent_at BIGINT NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    metadata JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_otp_challenges_email ON otp_challenges(email);
CREATE INDEX IF NOT EXISTS idx_otp_challenges_expires_at ON otp_challenges(expires_at);
