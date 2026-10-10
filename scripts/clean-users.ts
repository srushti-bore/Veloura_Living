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
  console.log('🏛️  [Veloura Living] Cleaning all registered users from database & store...');

  // 1. Clean PostgreSQL / Supabase if connected
  const pgReady = await isPostgresAvailable();
  if (pgReady) {
    console.log('📦 Connected to PostgreSQL. Deleting non-canonical user records...');
    try {
      const deleteRes = await queryPostgres(
        `DELETE FROM users 
         WHERE LOWER(email) NOT IN ($1, $2)
         RETURNING email;`,
        CANONICAL_EMAILS
      );
      if (deleteRes) {
        console.log(`✅ Deleted ${deleteRes.rowCount} user(s) from PostgreSQL database:`);
        deleteRes.rows.forEach((r: any) => console.log(`   - ${r.email}`));
      }
    } catch (err: any) {
      console.warn('⚠️ PostgreSQL Delete warning:', err.message);
    }
  } else {
    console.log('ℹ️ PostgreSQL not connected. Cleaning local disk storage (.data/users_store.json)...');
  }

  // 2. Clean Local Disk Cache (.data/users_store.json)
  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const records = JSON.parse(raw);
      
      const kept = records.filter((r: any) => 
        CANONICAL_EMAILS.includes(r.user.email.toLowerCase().trim())
      );
      const deletedCount = records.length - kept.length;

      fs.writeFileSync(DATA_FILE, JSON.stringify(kept, null, 2), 'utf-8');
      console.log(`✅ Deleted ${deletedCount} user(s) from disk store (.data/users_store.json).`);
      console.log(`🔒 Preserved ${kept.length} canonical account(s):`);
      kept.forEach((k: any) => console.log(`   + ${k.user.email} (${k.roles.join(', ')})`));
    } catch (err: any) {
      console.error('❌ Error cleaning local disk cache:', err.message);
    }
  }

  console.log('\n✨ Database and user store cleanup completed successfully!\n');
}

cleanUsers()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal cleanup error:', err);
    process.exit(1);
  });
