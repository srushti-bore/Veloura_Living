/**
 * 🏛️ Veloura Living — Administrative User Seeder Script
 * Idempotently seeds/updates the primary Master Admin account.
 * Reads ADMIN_EMAIL and ADMIN_PASSWORD from environment variables.
 * Usage: npx tsx scripts/seed-admin.ts
 */

import { initUserRepository, findUserByEmail, saveUserRecord, UserRecord } from '../lib/data/userRepository';
import { hashPassword } from '../lib/auth/password';

async function seedAdmin() {
  console.log('🏛️  [Veloura Living] Initializing Admin Account Seeder...');
  await initUserRepository();

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@velouraliving.com').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || process.env.ADMIN_INITIAL_PASSWORD || 'VelouraAdmin2026!';
  const adminPasswordHash = await hashPassword(adminPassword);

  let adminRecord = findUserByEmail(adminEmail);

  if (adminRecord) {
    adminRecord.user.password_hash = adminPasswordHash;
    adminRecord.user.status = 'ACTIVE';
    adminRecord.user.is_email_verified = true;
    if (!adminRecord.roles.includes('ADMIN')) {
      adminRecord.roles.push('ADMIN');
    }
    adminRecord.user.updated_at = new Date().toISOString();
    saveUserRecord(adminRecord);
    console.log(`✅ Master Admin account (${adminEmail}) synchronized successfully.`);
  } else {
    const adminId = '33333333-3333-3333-3333-333333333301';
    const newAdmin: UserRecord = {
      user: {
        id: adminId,
        email: adminEmail,
        password_hash: adminPasswordHash,
        status: 'ACTIVE',
        is_email_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      roles: ['ADMIN'],
      profile: {
        user_id: adminId,
        first_name: 'Eleanor',
        last_name: 'Vance',
        phone: '+91 98200 12345',
        avatar_url: '/images/team/eleanor.jpg',
        preferred_currency: 'INR',
        interior_style_preference: 'Warm Minimalist',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      addresses: [],
    };
    saveUserRecord(newAdmin);
    console.log(`✅ Master Admin account (${adminEmail}) created successfully.`);
  }
}

seedAdmin()
  .then(() => {
    console.log('🏛️  Admin Seeder Completed.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌  Admin Seeder Failed:', err);
    process.exit(1);
  });
