const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

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

async function listProfiles() {
    try {
        await client.connect();
        const res = await client.query('SELECT id, name, email, phone FROM public.profiles');
        console.table(res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

listProfiles();
