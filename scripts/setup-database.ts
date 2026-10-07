/**
 * 🏛️ Veloura Living — Database Setup & Migration Runner
 * Executes db/schema.sql and db/seed.sql against the configured PostgreSQL database.
 * Usage: npx tsx scripts/setup-database.ts
 */

import fs from 'fs';
import path from 'path';
import { getPostgresPool, isPostgresAvailable } from '../lib/db/postgres';

async function setupDatabase() {
  console.log('\n🏛️  ============================================================');
  console.log('🏛️  VELOURA LIVING — POSTGRESQL DATABASE SETUP & SCHEMA SEEDER');
  console.log('🏛️  ============================================================\n');

  const pool = getPostgresPool();
  if (!pool) {
    console.error('❌ Error: DATABASE_URL is not configured in your environment or is unavailable.');
    console.log('👉 Please ensure your DATABASE_URL is added to your environment variables.');
    process.exit(1);
  }

  const isAlive = await isPostgresAvailable();
  if (!isAlive) {
    console.error('❌ Error: Could not connect to PostgreSQL server.');
    console.log('👉 Please verify your database host, port, username, and password.');
    process.exit(1);
  }

  console.log('✅ Connected to PostgreSQL database successfully.\n');

  const schemaPath = path.join(process.cwd(), 'db', 'schema.sql');
  const seedPath = path.join(process.cwd(), 'db', 'seed.sql');

  try {
    // 1. Run Schema
    if (fs.existsSync(schemaPath)) {
      console.log('⏳ Applying relational schema from db/schema.sql...');
      const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
      await pool.query(schemaSql);
      console.log('✅ Schema tables, enums, indexes, and triggers created successfully.');
    }

    // 2. Run Seed
    if (fs.existsSync(seedPath)) {
      console.log('\n⏳ Seeding foundational luxury catalog from db/seed.sql...');
      const seedSql = fs.readFileSync(seedPath, 'utf-8');
      await pool.query(seedSql);
      console.log('✅ Seed data inserted successfully.');
    }

    console.log('\n🏛️  ============================================================');
    console.log('🏛️  STATUS: 🟢 DATABASE INITIALIZATION COMPLETED (100%)');
    console.log('🏛️  ============================================================\n');
  } catch (err: any) {
    console.error('\n❌ Database Migration Failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();
