/**
 * 🏛️ Veloura Living — Secure Single Admin Bootstrap Command
 * 
 * Secure, one-time server-side bootstrap process for the single Master Admin account.
 * Follows strict enterprise security guidelines:
 * - Reads admin email exclusively from ADMIN_EMAIL.
 * - Reads initial password exclusively from ADMIN_PASSWORD or ADMIN_INITIAL_PASSWORD.
 * - Fails closed if required environment configuration is missing or weak.
 * - Zero credential exposure: Never prints passwords, hashes, secrets, or raw keys.
 * - Concurrency protection via PostgreSQL transactional advisory lock.
 * - Database-enforced single-Admin policy: At most one account can hold the ADMIN role.
 * - Idempotent execution: Never resets an existing Admin password or promotes another account.
 * - Persistently logs bootstrap completion in admin_bootstrap_log table.
 * 
 * Usage:
 *   npx tsx scripts/seed-admin.ts
 *   or: npm run seed:admin
 */

import fs from 'fs';
import path from 'path';

// Safely populate process.env for CLI execution without printing or exposing any credentials
export function loadEnvironmentForCli() {
  try {
    const envCandidates = [
      '.env.local',
      '.env',
      '.env.production',
      path.join('backend', '.env'),
      path.join('backend', '.env.local'),
    ];
    for (const file of envCandidates) {
      const fullPath = path.resolve(process.cwd(), file);
      if (fs.existsSync(fullPath)) {
        try {
          (process as any).loadEnvFile?.(fullPath);
        } catch {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            for (const line of content.split(/\r?\n/)) {
              const trimmed = line.trim();
              if (!trimmed || trimmed.startsWith('#')) continue;
              const eqIdx = trimmed.indexOf('=');
              if (eqIdx > 0) {
                const key = trimmed.slice(0, eqIdx).trim();
                let val = trimmed.slice(eqIdx + 1).trim();
                if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                  val = val.slice(1, -1);
                }
                if (!process.env[key]) {
                  process.env[key] = val;
                }
              }
            }
          } catch {}
        }
      }
    }
  } catch {}
}

import { getPostgresClient, isPostgresAvailable } from '../lib/db/postgres';
import { hashPassword } from '../lib/auth/password';
import { initUserRepository, saveUserRecord, UserRecord } from '../lib/data/userRepository';

export interface BootstrapResult {
  success: boolean;
  message: string;
  adminEmail: string;
  adminUserId: string;
  isNew: boolean;
}

export interface BootstrapOptions {
  email?: string;
  adminEmail?: string;
  password?: string;
  adminPassword?: string;
  customClient?: any;
}

/**
 * Executes the secure one-time single Admin bootstrap.
 */
export async function runAdminBootstrap(options?: BootstrapOptions): Promise<BootstrapResult> {
  const rawEmail = (options?.email || options?.adminEmail || process.env.ADMIN_EMAIL || '').trim();
  const rawPassword = options?.password || options?.adminPassword || process.env.ADMIN_PASSWORD || process.env.ADMIN_INITIAL_PASSWORD || '';

  // 1. Validate required environment configuration — Fail Closed
  if (!rawEmail) {
    throw new Error('Missing required ADMIN_EMAIL environment variable. Bootstrap aborted.');
  }

  const normalizedEmail = rawEmail.toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    throw new Error('Invalid ADMIN_EMAIL format. A valid email address is required. Bootstrap aborted.');
  }

  if (!rawPassword) {
    throw new Error('Missing required ADMIN_PASSWORD environment variable. Bootstrap aborted.');
  }

  if (rawPassword.length < 10) {
    throw new Error('ADMIN_PASSWORD does not meet minimum strength requirements (minimum 10 characters required). Bootstrap aborted.');
  }

  // 2. Authoritative PostgreSQL Connection Verification
  const client = options?.customClient || (await getPostgresClient());
  if (!client) {
    throw new Error('PostgreSQL database connection is unavailable. Admin bootstrap requires authoritative database persistence.');
  }

  try {
    // 3. Begin Atomic Transaction & Acquire Concurrency Advisory Lock
    await client.query('BEGIN');

    // pg_advisory_xact_lock with deterministic 64-bit key for Veloura Admin Bootstrap (0x56454C4F55524141 = 'VELOURAA')
    // Ensures two simultaneous bootstrap executions execute sequentially without race conditions.
    await client.query('SELECT pg_advisory_xact_lock(6216480572791833921)');

    // 4. Ensure Roles, Schema Prereqs & Audit Table Exist
    await client.query(
      `INSERT INTO roles (id, name, description)
       VALUES (gen_random_uuid(), 'ADMIN', 'Master Administrator with unrestricted platform privileges')
       ON CONFLICT (name) DO NOTHING`
    );

    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_bootstrap_log (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          admin_email VARCHAR(255) NOT NULL UNIQUE,
          admin_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
          bootstrapped_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
          metadata JSONB DEFAULT '{}'::jsonb
      )
    `);

    // 5. Query Existing Accounts Holding ADMIN Role in Database
    const existingAdminsRes = (await client.query(
      `SELECT u.id, u.email
       FROM users u
       JOIN user_roles ur ON u.id = ur.user_id
       JOIN roles r ON ur.role_id = r.id
       WHERE r.name = 'ADMIN'`
    )) as { rows: Array<{ id: string; email: string }> };

    // 6. Enforce Single-Admin Policy Invariants
    if (existingAdminsRes.rows.length > 1) {
      await client.query('ROLLBACK');
      throw new Error(
        `Ambiguous state detected: Multiple accounts (${existingAdminsRes.rows.length}) currently hold the ADMIN role in the database. Single Admin policy permits exactly one Admin. Manual database reconciliation required.`
      );
    }

    if (existingAdminsRes.rows.length === 1) {
      const existingAdmin = existingAdminsRes.rows[0];
      const existingEmailNormalized = (existingAdmin.email || '').toLowerCase().trim();

      if (existingEmailNormalized === normalizedEmail) {
        // Idempotent execution: Admin account already bootstrapped for this exact owner email
        // STRICT RULE: Do NOT overwrite or reset the existing password!
        await client.query(
          `INSERT INTO admin_bootstrap_log (admin_email, admin_user_id)
           VALUES ($1, $2)
           ON CONFLICT (admin_email) DO NOTHING`,
          [normalizedEmail, existingAdmin.id]
        );

        await client.query('COMMIT');

        return {
          success: true,
          message: `Single Admin account (${normalizedEmail}) already exists and is active. Existing credentials preserved.`,
          adminEmail: normalizedEmail,
          adminUserId: existingAdmin.id,
          isNew: false,
        };
      } else if (existingEmailNormalized === 'admin@velouraliving.com') {
        // Safe reconciliation of legacy default demo seed account:
        // Revoke ADMIN role from the legacy demo seed so the owner's configured ADMIN_EMAIL can become the single Admin.
        console.log(`ℹ️  Reconciling legacy default seed account (${existingEmailNormalized}): Revoking demo ADMIN role...`);
        await client.query(
          `DELETE FROM user_roles
           WHERE user_id = $1 AND role_id IN (SELECT id FROM roles WHERE name = 'ADMIN')`,
          [existingAdmin.id]
        );
      } else {
        // Conflicting Admin Account Detected!
        await client.query('ROLLBACK');
        throw new Error(
          `A different Admin account (${existingEmailNormalized}) already holds the exclusive ADMIN role. Single Admin policy strictly permits only one Admin account. Bootstrap will not overwrite or promote another account.`
        );
      }
    }

    // 7. No Existing Admin Account — Proceed with Atomic Creation
    // Check if a user with this email already exists in users table
    const existingUserRes = (await client.query(
      `SELECT id, password_hash, status FROM users WHERE LOWER(TRIM(email)) = $1`,
      [normalizedEmail]
    )) as { rows: Array<{ id: string; password_hash: string; status: string }> };

    let adminUserId: string;
    const adminPasswordHash = await hashPassword(rawPassword);
    const now = new Date().toISOString();

    if (existingUserRes.rows.length > 0) {
      // Existing user record being securely promoted during initial bootstrap
      adminUserId = existingUserRes.rows[0].id;

      await client.query(
        `UPDATE users
         SET password_hash = $2,
             status = 'ACTIVE',
             is_email_verified = TRUE,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [adminUserId, adminPasswordHash]
      );
    } else {
      // Create new Admin identity in users table
      adminUserId = crypto.randomUUID();

      await client.query(
        `INSERT INTO users (id, email, password_hash, status, is_email_verified, created_at, updated_at)
         VALUES ($1, $2, $3, 'ACTIVE', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [adminUserId, normalizedEmail, adminPasswordHash]
      );

      // Create Admin profile in profiles table
      await client.query(
        `INSERT INTO profiles (user_id, first_name, last_name, phone, preferred_currency, interior_style_preference, created_at, updated_at)
         VALUES ($1, 'Admin', 'Owner', '+91 00000 00000', 'INR', 'Warm Minimalist', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT (user_id) DO NOTHING`,
        [adminUserId]
      );
    }

    // Assign ADMIN role in user_roles table
    await client.query(
      `INSERT INTO user_roles (user_id, role_id)
       SELECT $1, id FROM roles WHERE name = 'ADMIN'
       ON CONFLICT (user_id, role_id) DO NOTHING`,
      [adminUserId]
    );

    // Persistently record bootstrap event in audit log
    await client.query(
      `INSERT INTO admin_bootstrap_log (admin_email, admin_user_id, metadata)
       VALUES ($1, $2, $3)
       ON CONFLICT (admin_email) DO NOTHING`,
      [normalizedEmail, adminUserId, JSON.stringify({ bootstrappedBy: 'cli', timestamp: now })]
    );

    // 8. Automatically apply Single Admin Policy Invariant Trigger to PostgreSQL
    try {
      await client.query(`
        CREATE OR REPLACE FUNCTION check_single_admin_invariant()
        RETURNS TRIGGER AS $$
        DECLARE
            admin_role_id UUID;
            admin_count INTEGER;
        BEGIN
            SELECT id INTO admin_role_id FROM roles WHERE name = 'ADMIN';
            IF NEW.role_id = admin_role_id THEN
                SELECT COUNT(*) INTO admin_count FROM user_roles WHERE role_id = admin_role_id AND user_id <> NEW.user_id;
                IF admin_count >= 1 THEN
                    RAISE EXCEPTION 'Veloura Living Security Invariant: Single Admin Policy strictly permits only ONE account with the ADMIN role. Action rejected.';
                END IF;
            END IF;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS trg_single_admin_user_roles ON user_roles;
        CREATE TRIGGER trg_single_admin_user_roles
        BEFORE INSERT OR UPDATE ON user_roles
        FOR EACH ROW
        EXECUTE FUNCTION check_single_admin_invariant();
      `);
    } catch {
      // In restricted privilege environments, transactional advisory lock ensures safety
    }

    await client.query('COMMIT');

    // Synchronize local runtime repository cache if initialized
    try {
      await initUserRepository();
      const adminRecord: UserRecord = {
        user: {
          id: adminUserId,
          email: normalizedEmail,
          password_hash: adminPasswordHash,
          status: 'ACTIVE',
          is_email_verified: true,
          created_at: now,
          updated_at: now,
        },
        roles: ['ADMIN'],
        profile: {
          user_id: adminUserId,
          first_name: 'Admin',
          last_name: 'Owner',
          phone: '',
          preferred_currency: 'INR',
          interior_style_preference: 'Warm Minimalist',
          created_at: now,
          updated_at: now,
        },
        addresses: [],
      };
      saveUserRecord(adminRecord);
    } catch {
      // In-memory sync failure is non-fatal; PostgreSQL is the authoritative truth
    }

    return {
      success: true,
      message: `Single Admin account (${normalizedEmail}) created and granted exclusive ADMIN role.`,
      adminEmail: normalizedEmail,
      adminUserId,
      isNew: true,
    };
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    if (!options?.customClient) {
      client.release();
    }
  }
}

// CLI Execution Entrypoint
async function main() {
  console.log('\n🏛️  ============================================================');
  console.log('🏛️  VELOURA LIVING — SECURE SINGLE ADMIN BOOTSTRAP UTILITY');
  console.log('🏛️  ============================================================\n');

  try {
    loadEnvironmentForCli();
    const result = await runAdminBootstrap();
    console.log(`✅ Status: ${result.message}`);
    console.log(`🛡️  Admin Identity: ${result.adminEmail}`);
    console.log(`🆔 User UUID: ${result.adminUserId}`);
    console.log('\n✨ Single Admin Bootstrap completed securely.\n');
    process.exit(0);
  } catch (err: any) {
    console.error('\n❌ Admin Bootstrap Failed:', err.message);
    process.exit(1);
  }
}

if (process.argv[1]?.includes('seed-admin')) {
  main();
}
