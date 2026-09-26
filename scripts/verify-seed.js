import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://erfltqteyqmshbituvdv.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const client = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
});

async function verifyCounts() {
  console.log('--- MahaSkill Intelligence Table Row Counts ---');
  const tables = [
    'districts', 'sectors', 'occupations', 'skills', 'skill_aliases',
    'job_postings', 'job_skills', 'qualifications', 'courses', 'course_skills',
    'employers', 'employer_signals', 'employer_validations', 'trainers', 'equipment',
    'skill_demand_metrics', 'skill_supply_metrics', 'recommendations', 'recommendation_evidence',
    'simulations', 'data_sources', 'data_imports', 'time_series_metrics', 'institute_responses', 'audit_logs'
  ];

  const results = {};

  for (const table of tables) {
    const { count, error } = await client.from(table).select('*', { count: 'exact', head: true });
    if (error) {
      results[table] = `Error: ${error.message}`;
    } else {
      results[table] = count;
    }
  }

  console.table(results);
}

verifyCounts().catch(console.error);
