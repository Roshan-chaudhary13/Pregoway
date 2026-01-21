const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

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

const client = new Client({
    connectionString: envConfig.DATABASE_URL
});

async function run() {
    try {
        await client.connect();
        console.log("Connected...");

        // Sync Query: Find users in auth.users who are NOT in public.profiles and insert them
        const syncQuery = `
      INSERT INTO public.profiles (id, email, name, created_at)
      SELECT 
        id, 
        email, 
        raw_user_meta_data->>'full_name', 
        created_at 
      FROM auth.users
      WHERE id NOT IN (SELECT id FROM public.profiles)
      ON CONFLICT (id) DO NOTHING;
    `;

        const res = await client.query(syncQuery);
        console.log(`Synced ${res.rowCount} missing profiles from Auth to Public table.`);

    } catch (err) {
        console.error("Error syncing profiles:", err);
    } finally {
        await client.end();
    }
}

run();
