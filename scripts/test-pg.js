import pg from 'pg';
import fs from 'fs';

const projectRef = 'erfltqteyqmshbituvdv';
const hosts = [
  `db.${projectRef}.supabase.co`,
  `aws-0-ap-south-1.pooler.supabase.com`,
  `aws-0-us-east-1.pooler.supabase.com`,
  `aws-0-eu-central-1.pooler.supabase.com`
];

async function tryConnect() {
  console.log('Testing connection to Supabase PostgreSQL database...');
  const migrationSql = fs.readFileSync('supabase/migrations/20260909000000_initial_schema.sql', 'utf8');
  const seedSql = fs.readFileSync('supabase/seed.sql', 'utf8');

  // Try standard environment or pg config
  const pass = process.env.SUPABASE_DB_PASSWORD || process.env.SUPABASE_SERVICE_ROLE_KEY;

  for (const host of hosts) {
    const client = new pg.Client({
      host: host,
      port: host.includes('pooler') ? 6543 : 5432,
      database: 'postgres',
      user: host.includes('pooler') ? `postgres.${projectRef}` : 'postgres',
      password: pass,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000
    });

    try {
      console.log(`Connecting to ${host}...`);
      await client.connect();
      console.log(`✅ Successfully connected to ${host}!`);
      
      console.log('Applying database migrations...');
      await client.query(migrationSql);
      console.log('✅ Migrations applied successfully!');

      console.log('Applying seed data...');
      await client.query(seedSql);
      console.log('✅ Seed data applied successfully!');

      await client.query("NOTIFY pgrst, 'reload schema';");
      console.log('✅ PostgREST schema reloaded!');
      
      await client.end();
      return true;
    } catch (err) {
      console.log(`Failed connecting to ${host}:`, err.message);
      try { await client.end(); } catch (e) {}
    }
  }
  return false;
}

tryConnect().then(success => {
  console.log('Result:', success ? 'Success' : 'Direct PG auth required password');
});
