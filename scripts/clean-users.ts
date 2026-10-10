/**
 * 🏛️ Veloura Living — User Database Cleanup & Reset Script
 * Deletes all non-system registered/login users from PostgreSQL database and disk cache.
 * Preserves canonical master administrative accounts.
 * 
 * Usage: npx -y tsx scripts/clean-users.ts
 */

import fs from 'fs';
import path from 'path';
import { queryPostgres, isPostgresAvailable } from '../lib/db/postgres';

const DATA_FILE = path.join(process.cwd(), '.data', 'users_store.json');

const CANONICAL_EMAILS = [
  'admin@velouraliving.com',
  'concierge@velouraliving.com',
  'client@example.com',
];

async function cleanUsers() {
  const isDryRun = process.argv.includes('--dry-run');
  const isConfirmed = process.argv.includes('--confirm') || process.argv.includes('--force');

  console.log('🏛️  [Veloura Living] User Database Cleanup & Inspection Utility');
  console.log(`🔒 Mode: ${isDryRun ? 'DRY RUN (Read-Only Preview)' : isConfirmed ? 'DESTRUCTIVE EXECUTION (--confirm)' : 'SAFETY CHECK (Defaulting to Dry-Run Preview)'}`);
  console.log(`🛡️  Preserving canonical accounts: ${CANONICAL_EMAILS.join(', ')}`);

  const shouldExecuteDeletion = isConfirmed && !isDryRun;

  // 1. PostgreSQL / Supabase Inspection & Cleanup
  const pgReady = await isPostgresAvailable();
  if (pgReady) {
    console.log('\n📦 Connected to PostgreSQL. Inspecting user records...');
    try {
      // Dynamic parameterized placeholders for canonical emails ($1, $2, $3, ...)
      const placeholders = CANONICAL_EMAILS.map((_, idx) => `$${idx + 1}`).join(', ');

      if (shouldExecuteDeletion) {
        const deleteRes = await queryPostgres(
          `DELETE FROM users 
           WHERE LOWER(email) NOT IN (${placeholders})
           RETURNING email;`,
          CANONICAL_EMAILS
        );
        if (deleteRes) {
          console.log(`✅ Deleted ${deleteRes.rowCount} non-canonical user(s) from PostgreSQL database:`);
          deleteRes.rows.forEach((r: any) => console.log(`   - ${r.email}`));
        }
      } else {
        const previewRes = await queryPostgres(
          `SELECT email, status, created_at FROM users 
           WHERE LOWER(email) NOT IN (${placeholders});`,
          CANONICAL_EMAILS
        );
        if (previewRes) {
          console.log(`🔍 [DRY-RUN] Found ${previewRes.rowCount} candidate user(s) in PostgreSQL that would be deleted:`);
          previewRes.rows.forEach((r: any) => console.log(`   - ${r.email} (${r.status})`));
        }
      }
    } catch (err: any) {
      console.warn('⚠️ PostgreSQL operation warning:', err.message);
    }
  } else {
    console.log('\nℹ️ PostgreSQL not connected. Inspecting local disk storage (.data/users_store.json)...');
  }

  // 2. Local Disk Cache Inspection & Cleanup (.data/users_store.json)
  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const records = JSON.parse(raw);
      
      const kept = records.filter((r: any) => 
        CANONICAL_EMAILS.includes(r.user.email.toLowerCase().trim())
      );
      const toDelete = records.filter((r: any) => 
        !CANONICAL_EMAILS.includes(r.user.email.toLowerCase().trim())
      );
      const deletedCount = toDelete.length;

      if (shouldExecuteDeletion) {
        fs.writeFileSync(DATA_FILE, JSON.stringify(kept, null, 2), 'utf-8');
        console.log(`✅ Deleted ${deletedCount} user(s) from disk store (.data/users_store.json).`);
        console.log(`🔒 Preserved ${kept.length} canonical account(s):`);
        kept.forEach((k: any) => console.log(`   + ${k.user.email} (${k.roles.join(', ')})`));
      } else {
        console.log(`🔍 [DRY-RUN] Found ${deletedCount} user(s) in disk cache that would be purged:`);
        toDelete.forEach((d: any) => console.log(`   - ${d.user.email} (Status: ${d.user.status})`));
        console.log(`🔒 Preserved ${kept.length} canonical account(s) will remain intact.`);
      }
    } catch (err: any) {
      console.error('❌ Error inspecting/cleaning local disk cache:', err.message);
    }
  }

  if (!shouldExecuteDeletion) {
    console.log('\n💡 [DRY RUN COMPLETE] No records were deleted or modified.');
    console.log('   To execute actual deletion, run with: npx tsx scripts/clean-users.ts --confirm\n');
  } else {
    console.log('\n✨ Database and user store cleanup completed successfully!\n');
  }
}

cleanUsers()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal cleanup error:', err);
    process.exit(1);
  });
