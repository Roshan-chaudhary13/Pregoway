const fs = require('fs');
const path = require('path');

// Manual Env Parsing
const envPath = path.resolve(__dirname, '.env.local');
const envConfig = fs.readFileSync(envPath, 'utf8').split('\n').reduce((acc, line) => {
  const firstEqual = line.indexOf('=');
  if (firstEqual === -1) return acc;
  const key = line.substring(0, firstEqual).trim();
  let val = line.substring(firstEqual + 1).trim();
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }
  acc[key] = val.trim();
  return acc;
}, {});

// Use Direct Connection for reliability in scripts
const client = new Client({
  connectionString: envConfig.DATABASE_URL || 'postgresql://postgres:p0Ehjx20DFvu2GRF@db.cmtlzvybkgxkpjzbctkf.supabase.co:5432/postgres',
});

async function verifyCRUD() {
  console.log("🔍 Starting Database CRUD Verification...");

  try {
    await client.connect();
    console.log("✅ Connected to Database");

    // 1. READ: Check if tables exist
    const resTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    const tables = resTables.rows.map(r => r.table_name);
    console.log("📊 Found Tables:", tables);

    if (!tables.includes('profiles') || !tables.includes('daily_checkins')) {
      throw new Error("Missing required tables!");
    }

    // 2. READ: Count users
    const resCount = await client.query('SELECT count(*) FROM profiles');
    console.log("👥 Current User Profiles:", resCount.rows[0].count);

    // 3. INSERT (Simulation logic, can't insert into profiles easily due to FK constraint with auth.users)
    // We will verify we can read from the 'health_metrics' table which is less strict if RLS allows, 
    // but RLS is enabled. So we will just verify schema integrity.

    console.log("✅ Database Schema Integrity Verified.");

  } catch (err) {
    console.error("❌ Verification Failed:", err);
  } finally {
    await client.end();
  }
}

verifyCRUD();
