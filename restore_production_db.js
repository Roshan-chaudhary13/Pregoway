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

    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
    }

    acc[key] = val.trim();
    return acc;
}, {});

const client = new Client({
    connectionString: envConfig.DATABASE_URL || 'postgresql://postgres:p0Ehjx20DFvu2GRF@db.cmtlzvybkgxkpjzbctkf.supabase.co:5432/postgres',
});

async function restore_production_db() {
    console.log("🚀 Restoring Database to Production Mode...");
    try {
        await client.connect();

        // 1. Re-enable Foreign Key Constraints
        await client.query(`
      -- Profiles
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'profiles_id_fkey') THEN
          ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id);
        END IF;
      END $$;

      -- Daily Check-ins
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'daily_checkins_user_id_fkey') THEN
          ALTER TABLE public.daily_checkins ADD CONSTRAINT daily_checkins_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);
        END IF;
      END $$;

      -- Risk Logs
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'risk_logs_user_id_fkey') THEN
          ALTER TABLE public.risk_logs ADD CONSTRAINT risk_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);
        END IF;
      END $$;

      -- Health Metrics
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'health_metrics_user_id_fkey') THEN
          ALTER TABLE public.health_metrics ADD CONSTRAINT health_metrics_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);
        END IF;
      END $$;
    `);
        console.log("✅ FK Constraints Restored");

        // 2. Re-enable RLS
        await client.query(`
      ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.risk_logs ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.health_metrics ENABLE ROW LEVEL SECURITY;
    `);
        console.log("✅ Row Level Security Enabled");

        // 3. Ensure Policies exist and are correct
        await client.query(`
      -- Clean up potentially broken policies
      DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
      DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
      DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
      
      CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
      CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
      CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

      DROP POLICY IF EXISTS "Users can view own checkins" ON public.daily_checkins;
      DROP POLICY IF EXISTS "Users can insert own checkins" ON public.daily_checkins;
      CREATE POLICY "Users can view own checkins" ON public.daily_checkins FOR SELECT USING (auth.uid() = user_id);
      CREATE POLICY "Users can insert own checkins" ON public.daily_checkins FOR INSERT WITH CHECK (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Users can view own metrics" ON public.health_metrics;
      DROP POLICY IF EXISTS "Users can insert own metrics" ON public.health_metrics;
      CREATE POLICY "Users can view own metrics" ON public.health_metrics FOR SELECT USING (auth.uid() = user_id);
      CREATE POLICY "Users can insert own metrics" ON public.health_metrics FOR INSERT WITH CHECK (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Users can view own risk logs" ON public.risk_logs;
      CREATE POLICY "Users can view own risk logs" ON public.risk_logs FOR SELECT USING (auth.uid() = user_id);
    `);
        console.log("✅ RLS Policies Verified");

    } catch (err) {
        console.error("❌ Restoration Failed:", err);
    } finally {
        await client.end();
    }
}

restore_production_db();
