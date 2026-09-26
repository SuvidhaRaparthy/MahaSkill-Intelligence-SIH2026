import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import pg from 'pg';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://erfltqteyqmshbituvdv.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('--- MahaSkill Intelligence DB Migration & Verification ---');
console.log('Supabase URL:', supabaseUrl);
console.log('Service Key:', serviceKey ? 'Provided (' + serviceKey.slice(0, 12) + '...)' : 'Missing');

const client = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
});

async function runVerification() {
  console.log('\nChecking table existence in Supabase database...');
  const tables = [
    'districts', 'sectors', 'occupations', 'skills', 'skill_aliases',
    'job_postings', 'job_skills', 'qualifications', 'courses', 'course_skills',
    'employers', 'employer_signals', 'employer_validations', 'trainers', 'equipment',
    'skill_demand_metrics', 'skill_supply_metrics', 'recommendations', 'recommendation_evidence',
    'simulations', 'data_sources', 'data_imports', 'time_series_metrics', 'institute_responses', 'audit_logs'
  ];

  const existingTables = [];
  const missingTables = [];

  for (const table of tables) {
    const { error } = await client.from(table).select('count', { count: 'exact', head: true });
    if (error && error.code === 'PGRST205') {
      missingTables.push(table);
    } else {
      existingTables.push(table);
    }
  }

  console.log(`Existing tables (${existingTables.length}/${tables.length}):`, existingTables);
  console.log(`Missing tables (${missingTables.length}/${tables.length}):`, missingTables);
}

runVerification().catch(console.error);
