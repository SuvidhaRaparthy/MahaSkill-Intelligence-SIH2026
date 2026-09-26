const { normalizeSkillText } = require('../src/data-import/skillNormalizer.ts');
const { normalizeOccupationTitle } = require('../src/data-import/occupationNormalizer.ts');
const { extractSkillsDeterministic } = require('../src/data-import/skillExtractor.ts');
const { createClient } = require('@supabase/supabase-js');

const fs = require('fs');
const path = require('path');

try {
  const envConfig = fs.readFileSync(path.resolve(process.cwd(), '.env'), 'utf-8');
  envConfig.split('\n').forEach((line) => {
    const [key, ...value] = line.split('=');
    if (key && value.length > 0) {
      process.env[key.trim()] = value.join('=').trim();
    }
  });
} catch (e) {}

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://erfltqteyqmshbituvdv.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

async function runPhase3Tests() {
  console.log('==================================================');
  console.log('  MAHASKILL INTELLIGENCE - PHASE 3 TEST SUITE');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  âœ… [PASS]: ${message}`);
      passed++;
    } else {
      console.error(`  âŒ [FAIL]: ${message}`);
      failed++;
    }
  }

  // TEST 1: "ReactJS Developer" -> React.js
  const t1 = normalizeSkillText("ReactJS Developer");
  assert(t1.canonical_name === 'React.js' && t1.mapping_method === 'ALIAS', `TEST 1: "ReactJS Developer" -> Canonical "${t1.canonical_name}" (${t1.mapping_method})`);

  // TEST 2: "React JS Developer" -> React.js
  const t2 = normalizeSkillText("React JS Developer");
  assert(t2.canonical_name === 'React.js' && t2.mapping_method === 'ALIAS', `TEST 2: "React JS Developer" -> Canonical "${t2.canonical_name}" (${t2.mapping_method})`);

  // TEST 3: "React.js Developer" -> React.js
  const t3 = normalizeSkillText("React.js Developer");
  assert(t3.canonical_name === 'React.js', `TEST 3: "React.js Developer" -> Canonical "${t3.canonical_name}"`);

  // TEST 4: "BMS Repair Technician" -> Battery Management Systems (BMS)
  const t4 = normalizeSkillText("BMS Repair Technician");
  assert(t4.canonical_name.includes('Battery Management Systems') || t4.canonical_name.includes('BMS'), `TEST 4: "BMS Repair Technician" -> Canonical "${t4.canonical_name}"`);

  // TEST 5: "EV Battery Health Check" -> EV Battery Diagnostics
  const t5 = normalizeSkillText("EV Battery Health Check");
  assert(t5.canonical_name === 'EV Battery Diagnostics' && t5.mapping_method === 'ALIAS', `TEST 5: "EV Battery Health Check" -> Canonical "${t5.canonical_name}" (${t5.mapping_method})`);

  // TEST 6: Unknown skill term -> UNRESOLVED / EMERGING
  const t6 = normalizeSkillText("Quantum Algorithm Optimization");
  assert(t6.mapping_method === 'UNRESOLVED' && t6.taxonomy_status === 'emerging', `TEST 6: "Quantum Algorithm Optimization" -> Mapping "${t6.mapping_method}" Status "${t6.taxonomy_status}"`);

  // TEST 7: Multi-skill job: "Senior React & TypeScript Developer" -> React.js + TypeScript
  const extracted = extractSkillsDeterministic("Senior React & TypeScript Developer", "Building frontend apps with React and TypeScript.");
  const skillNames = extracted.map(e => e.canonical_name);
  assert(skillNames.includes('React.js') && skillNames.includes('TypeScript'), `TEST 7: Multi-skill extraction extracted: [${skillNames.join(', ')}]`);

  // TEST 8: Relevant automotive job -> correct canonical occupation (EV Battery Specialist NCO-2152.0100)
  const occ1 = normalizeOccupationTitle("EV Battery Diagnostic Engineer");
  assert(occ1.nco_code === '2152.0100' && occ1.title === 'EV Battery Specialist', `TEST 8: Automotive role mapped to "${occ1.title}" (NCO ${occ1.nco_code})`);

  // TEST 9: Relevant cloud job -> Cloud Infrastructure Engineer (NCO-2522.0100)
  const occ2 = normalizeOccupationTitle("Cloud Infrastructure Solutions Architect");
  assert(occ2.nco_code === '2522.0100' && occ2.title === 'Cloud Infrastructure Engineer', `TEST 9: Cloud role mapped to "${occ2.title}" (NCO ${occ2.nco_code})`);

  // TEST 10: Database linkage verification in remote Supabase
  const { data: jobs, error: errJobs } = await supabase.from('job_postings').select('id').limit(10);
  const { data: jobSkills, error: errJs } = await supabase.from('job_skills').select('id, job_id, skill_id').limit(10);
  assert(!errJobs && !errJs && jobs.length > 0 && jobSkills.length > 0, `TEST 10: Remote Supabase database contains ${jobs ? jobs.length : 0} job postings and ${jobSkills ? jobSkills.length : 0} job_skills linkages`);

  console.log('\n--------------------------------------------------');
  console.log(`  RESULTS: ${passed} PASSED / ${failed} FAILED`);
  console.log('--------------------------------------------------\n');

  if (failed > 0) process.exit(1);
}

runPhase3Tests().catch((err) => {
  console.error('Fatal Test Failure:', err);
  process.exit(1);
});
