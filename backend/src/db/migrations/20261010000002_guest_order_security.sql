-- ============================================================================
-- 🏛️ Supabase Migration: 20261010000002_guest_order_security.sql
-- Veloura Living — Guest Order Tracking Cryptographic Security Token (Backend)
-- Reference: docs/Veloura_Living_SRS.md (SEC-004, SEC-005)
-- ============================================================================

-- Add high-entropy guest access token column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_access_token VARCHAR(128);

-- Create index for fast and safe guest order lookups
CREATE INDEX IF NOT EXISTS idx_orders_guest_access_token ON orders(guest_access_token);
