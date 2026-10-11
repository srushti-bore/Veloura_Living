-- 🏛️ Veloura Living — Phase 22: Single Admin Invariant & Bootstrap Audit Log
-- Enforces that exactly one user account can hold the ADMIN role in PostgreSQL.
-- Tracks initial administrative bootstrap in a tamper-resistant audit table.

-- 1. Create admin_bootstrap_log table
CREATE TABLE IF NOT EXISTS admin_bootstrap_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_email VARCHAR(255) NOT NULL UNIQUE,
    admin_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    bootstrapped_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_admin_bootstrap_log_email ON admin_bootstrap_log(admin_email);

-- 2. Trigger Function to Enforce Single Admin Invariant
CREATE OR REPLACE FUNCTION check_single_admin_invariant()
RETURNS TRIGGER AS $$
DECLARE
    admin_role_id UUID;
    existing_admin_count INT;
BEGIN
    SELECT id INTO admin_role_id FROM roles WHERE name = 'ADMIN';
    IF admin_role_id IS NOT NULL AND NEW.role_id = admin_role_id THEN
        SELECT COUNT(*) INTO existing_admin_count
        FROM user_roles
        WHERE role_id = admin_role_id
          AND user_id != NEW.user_id;

        IF existing_admin_count > 0 THEN
            RAISE EXCEPTION 'Single Admin Policy violation: Exactly one account may hold the ADMIN role.'
                USING ERRCODE = '23514'; -- check_violation
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Attach Trigger to user_roles
DROP TRIGGER IF EXISTS trg_single_admin_user_roles ON user_roles;
CREATE TRIGGER trg_single_admin_user_roles
BEFORE INSERT OR UPDATE ON user_roles
FOR EACH ROW EXECUTE FUNCTION check_single_admin_invariant();
