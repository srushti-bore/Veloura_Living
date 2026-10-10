-- ============================================================================
-- 🏛️ Supabase Migration: 20261010000003_pending_registrations.sql
-- Veloura Living — Shared Persistent Pending Registration Store
-- Reference: docs/Veloura_Living_SRS.md (AUTH-001, AUTH-003, SEC-002)
-- ============================================================================

CREATE TABLE IF NOT EXISTS pending_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    password_hash TEXT NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(50),
    created_at BIGINT NOT NULL,
    expires_at BIGINT NOT NULL,
    created_at_tz TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pending_registrations_email ON pending_registrations(email);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_expires_at ON pending_registrations(expires_at);
