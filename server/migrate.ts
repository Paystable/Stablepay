
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { migrate } from 'drizzle-orm/neon-http/migrator';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

// Create tables manually since we don't have migration files
async function createTables() {
  try {
    console.log('Creating travel_rule_compliance table...');
    
    await sql(`
      CREATE TABLE IF NOT EXISTS travel_rule_compliance (
        id SERIAL PRIMARY KEY,
        user_address VARCHAR(42) NOT NULL UNIQUE,
        status TEXT CHECK (status IN ('pending', 'completed', 'skipped')) DEFAULT 'pending',
        originator_info TEXT,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('Creating other required tables if they don\'t exist...');
    
    await sql(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        wallet_address VARCHAR(42),
        email TEXT,
        full_name TEXT,
        kyc_status TEXT CHECK (kyc_status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await sql(`
      CREATE TABLE IF NOT EXISTS kyc_records (
        id SERIAL PRIMARY KEY,
        user_address VARCHAR(42) NOT NULL,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone_number TEXT,
        aadhar_number TEXT,
        pan_number TEXT,
        status TEXT CHECK (status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
        verification_data TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await sql(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_address VARCHAR(42) NOT NULL,
        tx_hash VARCHAR(66) NOT NULL,
        type TEXT CHECK (type IN ('deposit', 'withdrawal', 'transfer_in', 'transfer_out', 'yield_claim')) NOT NULL,
        amount DECIMAL(18, 6) NOT NULL,
        status TEXT CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
        block_number INTEGER,
        timestamp TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await sql(`
      CREATE TABLE IF NOT EXISTS withdrawal_requests (
        id SERIAL PRIMARY KEY,
        user_address VARCHAR(42) NOT NULL,
        usdc_amount DECIMAL(18, 6) NOT NULL,
        inr_amount DECIMAL(18, 2) NOT NULL,
        tx_hash VARCHAR(66) NOT NULL,
        verification_type TEXT CHECK (verification_type IN ('bank', 'upi')) NOT NULL,
        bank_account TEXT,
        ifsc_code TEXT,
        upi_id TEXT,
        status TEXT CHECK (status IN ('processing', 'completed', 'failed')) DEFAULT 'processing',
        created_at TIMESTAMP DEFAULT NOW(),
        processed_at TIMESTAMP
      );
    `);

    console.log('✅ All tables created successfully!');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
}

createTables()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
