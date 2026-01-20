const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Manual Env Parsing
const envPath = path.resolve(__dirname, '.env.local');
const envConfig = fs.readFileSync(envPath, 'utf8').split('\n').reduce((acc, line) => {
  const firstEqual = line.indexOf('=');
  if (firstEqual === -1) return acc;

  const key = line.substring(0, firstEqual).trim();
  let val = line.substring(firstEqual + 1).trim();

  // Remove quotes if present
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }

  acc[key] = val.trim();
  return acc;
}, {});

// Use Direct Connection for Schema Changes (ALTER TABLE requires session/direct)
const client = new Client({
  connectionString: envConfig.DATABASE_URL || 'postgresql://postgres:p0Ehjx20DFvu2GRF@db.cmtlzvybkgxkpjzbctkf.supabase.co:5432/postgres',
});

async function migrate_to_simulation() {
  console.log("🔄 Switching Database to Simulation Mode...");
  try {
    await client.connect();

    // 1. Drop Foreign Key Constraints (So we can use fake User IDs)
    await client.query(`
      ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
      ALTER TABLE public.daily_checkins DROP CONSTRAINT IF EXISTS daily_checkins_user_id_fkey;
      ALTER TABLE public.risk_logs DROP CONSTRAINT IF EXISTS risk_logs_user_id_fkey;
      ALTER TABLE public.health_metrics DROP CONSTRAINT IF EXISTS health_metrics_user_id_fkey;
    `);
    console.log("✅ FK Constraints Dropped");

    // 2. Disable RLS (So we can access data without a real Supabase Auth Token)
    await client.query(`
      ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
      ALTER TABLE public.daily_checkins DISABLE ROW LEVEL SECURITY;
      ALTER TABLE public.risk_logs DISABLE ROW LEVEL SECURITY;
      ALTER TABLE public.health_metrics DISABLE ROW LEVEL SECURITY;
    `);
    console.log("✅ Row Level Security Disabled");

    // 3. Add Email Column if missing
    await client.query(`
      ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
    `);
    console.log("✅ Email Column Ensured");

  } catch (err) {
    console.error("❌ Migration Failed:", err);
  } finally {
    await client.end();
  }
}

migrate_to_simulation();
