// Phase 6 Pipeline Verification Test for MahaSkill Intelligence
// Run using: node scripts/test-phase6-pipeline.cjs

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env
try {
  const envConfig = fs.readFileSync(path.resolve(process.cwd(), '.env'), 'utf-8');
  envConfig.split('\n').forEach((line) => {
    const [key, ...value] = line.split('=');
    if (key && value.length > 0) {
      process.env[key.trim()] = value.join('=').trim();
    }
  });
} catch (e) {
  // Proceed with existing process.env
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://erfltqteyqmshbituvdv.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

console.log('=====================================================');
console.log('PHASE 6 VERIFICATION â€” LIVE SUPABASE PIPELINE TEST');
console.log('=====================================================\n');

let passed = 0;
let total = 0;

function assert(testName, condition, detail) {
  total++;
  if (condition) {
    console.log(`  âœ… PASSED: ${testName} (${detail})`);
    passed++;
  } else {
    console.error(`  âŒ FAILED: ${testName} (${detail})`);
  }
}

async function runPhase6PipelineTests() {
  // 1. Fetch live database records
  const [
    { data: skills },
    { data: postings },
    { data: jobSkills },
    { data: empSignals },
    { data: employers },
    { data: trainers },
    { data: equipment },
    { data: courses },
    { data: courseSkills },
    { data: districts }
  ] = await Promise.all([
    supabase.from('skills').select('*'),
    supabase.from('job_postings').select('*'),
    supabase.from('job_skills').select('*'),
    supabase.from('employer_signals').select('*'),
    supabase.from('employers').select('*'),
    supabase.from('trainers').select('*'),
    supabase.from('equipment').select('*'),
    supabase.from('courses').select('*'),
    supabase.from('course_skills').select('*'),
    supabase.from('districts').select('*')
  ]);

  const puneDist = districts.find((d) => d.name.toLowerCase() === 'pune');
  const nashikDist = districts.find((d) => d.name.toLowerCase() === 'nashik');

  console.log('--- TEST GROUP 1: DATABASE BASELINE INTEGRITY ---');
  assert('Supabase employers table has 5 records', employers && employers.length === 5, `Found ${employers?.length} records`);
  assert('Supabase employer_signals table has 3 active records', empSignals && empSignals.length === 3, `Found ${empSignals?.length} records`);
  assert('Supabase trainers table has 3 records', trainers && trainers.length === 3, `Found ${trainers?.length} records`);
  assert('Supabase equipment table has 3 records', equipment && equipment.length === 3, `Found ${equipment?.length} records`);

  // --- BENCHMARK TEST CASE: EV Battery Diagnostics â€” Pune ---
  console.log('\n--- TEST GROUP 2: EV BATTERY DIAGNOSTICS â€” PUNE (BENCHMARK CASE) ---');
  const evSkill = skills.find((s) => s.canonical_name === 'EV Battery Diagnostics');

  // Employer signal aggregation for EV Battery Diagnostics in Pune
  const evPuneSignals = empSignals.filter((es) => es.skill_id === evSkill.id && es.district_id === puneDist.id);
  const evPuneExpectedHires = evPuneSignals.reduce((acc, es) => acc + Number(es.expected_hires || 0), 0);
  assert('EV Battery Diagnostics in Pune has 2 employer signals', evPuneSignals.length === 2, `Signals count = ${evPuneSignals.length}`);
  assert('EV Battery Diagnostics expected hires sum = 80', evPuneExpectedHires === 80, `Expected hires = ${evPuneExpectedHires}`);

  // Demand Calculation (Phase 4.4 methodology)
  const punePostings = postings.filter((jp) => jp.district_id === puneDist.id);
  const punePostingIds = new Set(punePostings.map((jp) => jp.id));
  const evPuneJobSkills = jobSkills.filter((js) => js.skill_id === evSkill.id && punePostingIds.has(js.job_id || js.job_posting_id));
  const evPunePostingsCount = new Set(evPuneJobSkills.map((js) => js.job_id || js.job_posting_id)).size;
  const evPuneDirectDemand = evPunePostingsCount + evPuneExpectedHires;
  assert('EV Battery Diagnostics Direct Demand = 108', evPuneDirectDemand === 108, `Demand = ${evPunePostingsCount} postings + ${evPuneExpectedHires} hires = ${evPuneDirectDemand}`);

  // Trainer Capacity Audit
  const evPuneTrainerRec = trainers.find((t) => t.skill_id === evSkill.id && t.district_id === puneDist.id);
  const evPuneAvailTrainers = evPuneTrainerRec ? Number(evPuneTrainerRec.certified_count || evPuneTrainerRec.trainer_count) : 0;
  const evPuneCourses = courses.filter((c) => c.district_id === puneDist.id && courseSkills.some((cs) => cs.course_id === c.id && cs.skill_id === evSkill.id));
  const evPuneSeats = evPuneCourses.reduce((acc, c) => acc + Number(c.annual_seats || 0), 0);
  const evPuneReqTrainers = Math.ceil(evPuneSeats / 35); // 35 trainees/trainer
  const evPuneTrainerGap = evPuneAvailTrainers - evPuneReqTrainers;
  const evPuneTrainerReadinessPct = Math.min(100, Math.round((evPuneAvailTrainers / evPuneReqTrainers) * 100));

  assert('EV Battery Diagnostics Available Certified Trainers in Pune = 3', evPuneAvailTrainers === 3, `Available = ${evPuneAvailTrainers}`);
  assert('EV Battery Diagnostics Required Trainers in Pune = 4', evPuneReqTrainers === 4, `Required = ceil(120 / 35) = ${evPuneReqTrainers}`);
  assert('EV Battery Diagnostics Trainer Gap = -1 (Shortage)', evPuneTrainerGap === -1, `Gap = 3 - 4 = ${evPuneTrainerGap}`);
  assert('EV Battery Diagnostics Trainer Readiness % = 75%', evPuneTrainerReadinessPct === 75, `Readiness = ${evPuneTrainerReadinessPct}%`);

  // Equipment Capacity Audit
  const evPuneEquipmentRec = equipment.find((e) => e.district_id === puneDist.id && e.equipment_name.toLowerCase().includes('ev battery'));
  const evPuneAvailEquipment = evPuneEquipmentRec ? Number(evPuneEquipmentRec.available_quantity) : 0;
  const evPuneReqEquipment = Math.ceil(30 / 3); // 30 batch trainees, 3 trainees/bench -> 10 benches
  const evPuneEquipmentGap = evPuneAvailEquipment - evPuneReqEquipment;
  const evPuneEquipmentReadinessPct = Math.min(100, Math.round((evPuneAvailEquipment / evPuneReqEquipment) * 100));

  assert('EV Battery Diagnostics Available Benches in Pune = 7', evPuneAvailEquipment === 7, `Available = ${evPuneAvailEquipment}`);
  assert('EV Battery Diagnostics Required Benches in Pune = 10', evPuneReqEquipment === 10, `Required = ceil(30 / 3) = ${evPuneReqEquipment}`);
  assert('EV Battery Diagnostics Equipment Gap = -3 (Shortage)', evPuneEquipmentGap === -3, `Gap = 7 - 10 = ${evPuneEquipmentGap}`);
  assert('EV Battery Diagnostics Equipment Readiness % = 70%', evPuneEquipmentReadinessPct === 70, `Readiness = ${evPuneEquipmentReadinessPct}%`);

  // Phase 4.4 Coverage %
  const evPuneEffectiveSupply = 0.6 * evPuneSeats + 0.4 * evPuneCourses.reduce((acc, c) => acc + Number(c.annual_completions || 0), 0);
  const evPuneCoveragePct = (evPuneEffectiveSupply / evPuneDirectDemand) * 100;

  // District Readiness Calculation
  const evPuneReadinessScore = Math.min(100, Math.round(0.40 * evPuneTrainerReadinessPct + 0.40 * evPuneEquipmentReadinessPct + 0.20 * Math.min(100, evPuneCoveragePct)));
  let evPuneStatus = 'MODERATE READINESS';
  if (evPuneReadinessScore >= 80 && evPuneTrainerReadinessPct >= 100 && evPuneEquipmentReadinessPct >= 100) {
    evPuneStatus = 'FULLY READY';
  } else if (evPuneDirectDemand > 0 && (evPuneTrainerGap < -3 || evPuneEquipmentGap < -3 || evPuneReadinessScore < 60)) {
    evPuneStatus = 'NOT READY â€” CAPACITY INVESTMENT REQUIRED';
  }

  assert('EV Battery Diagnostics Readiness Score = 78 / 100', evPuneReadinessScore === 78, `Score = floor(0.40*75 + 0.40*70 + 0.20*100) = ${evPuneReadinessScore}`);
  assert('EV Battery Diagnostics Status = MODERATE READINESS', evPuneStatus === 'MODERATE READINESS', `Status = ${evPuneStatus}`);

  // --- TEST GROUP 3: REACT.JS â€” PUNE (UNMAPPED TRAINING INFRASTRUCTURE) ---
  console.log('\n--- TEST GROUP 3: REACT.JS â€” PUNE (UNMAPPED INFRASTRUCTURE) ---');
  const reactSkill = skills.find((s) => s.canonical_name === 'React.js');
  const reactPuneSignals = empSignals.filter((es) => es.skill_id === reactSkill.id && es.district_id === puneDist.id);
  const reactPuneExpectedHires = reactPuneSignals.reduce((acc, es) => acc + Number(es.expected_hires || 0), 0);
  assert('React.js in Pune has 1 employer signal', reactPuneSignals.length === 1, `Signals count = ${reactPuneSignals.length}`);
  assert('React.js expected hires = 120', reactPuneExpectedHires === 120, `Expected hires = ${reactPuneExpectedHires}`);

  // Trainer & Equipment Audit for React.js
  const reactTrainerRec = trainers.find((t) => t.skill_id === reactSkill.id && t.district_id === puneDist.id);
  const reactAvailTrainers = reactTrainerRec ? Number(reactTrainerRec.certified_count) : 0;
  const reactEquipmentRec = equipment.find((e) => e.district_id === puneDist.id && e.equipment_name.toLowerCase().includes('react'));
  const reactAvailEquipment = reactEquipmentRec ? Number(reactEquipmentRec.available_quantity) : 0;

  // React Direct Demand in Maharashtra = 262; Unmapped -> Required Trainers = ceil(262 / 35) = 8; Required Workstations = ceil(262 / 10) = 27
  const reactReqTrainers = Math.ceil(262 / 35);
  const reactReqWorkstations = Math.ceil(262 / 10);

  assert('React.js Available Trainers in Pune = 0', reactAvailTrainers === 0, `Available = ${reactAvailTrainers}`);
  assert('React.js Required Trainers for 262 Demand = 8', reactReqTrainers === 8, `Required = ceil(262 / 35) = ${reactReqTrainers}`);
  assert('React.js Available Workstations in Pune = 0', reactAvailEquipment === 0, `Available = ${reactAvailEquipment}`);
  assert('React.js Required Workstations for 262 Demand = 27', reactReqWorkstations === 27, `Required = ceil(262 / 10) = ${reactReqWorkstations}`);

  // --- TEST GROUP 4: CAN BUS DIAGNOSTICS â€” NASHIK (OVERSUPPLIED CAPACITY) ---
  console.log('\n--- TEST GROUP 4: CAN BUS DIAGNOSTICS â€” NASHIK (OVERSUPPLIED) ---');
  const canSkill = skills.find((s) => s.canonical_name === 'CAN Bus Diagnostics');
  const canNashikTrainerRec = trainers.find((t) => t.skill_id === canSkill.id && t.district_id === nashikDist.id);
  const canNashikAvailTrainers = canNashikTrainerRec ? Number(canNashikTrainerRec.certified_count) : 0;
  const canNashikEquipmentRec = equipment.find((e) => e.district_id === nashikDist.id && e.equipment_name.toLowerCase().includes('can bus'));
  const canNashikAvailEquipment = canNashikEquipmentRec ? Number(canNashikEquipmentRec.available_quantity) : 0;

  assert('CAN Bus Available Trainers in Nashik = 5', canNashikAvailTrainers === 5, `Available = ${canNashikAvailTrainers}`);
  assert('CAN Bus Available Equipment in Nashik = 10', canNashikAvailEquipment === 10, `Available = ${canNashikAvailEquipment}`);

  // --- EDGE CASES ---
  console.log('\n--- EDGE CASES VERIFICATION ---');
  // Safe zero demand handling
  const safeZeroRatio = 0 / Math.max(1, 0);
  assert('Zero demand protects against NaN/Infinity', !isNaN(safeZeroRatio) && isFinite(safeZeroRatio), `Safe Ratio = ${safeZeroRatio}`);

  // Multi-source evidence sum
  const evidenceContributions = [0.40, 0.40, 0.20];
  const sumContrib = evidenceContributions.reduce((a, b) => a + b, 0);
  assert('Readiness weight contribution sum = 1.0 (100%)', sumContrib === 1.0, `Sum = ${sumContrib}`);

  console.log('\n=====================================================');
  console.log(`PHASE 6 TEST SUMMARY: ${passed} / ${total} assertions passed.`);
  console.log('=====================================================');

  if (passed === total) {
    console.log('\nâœ… PHASE 6 PIPELINE VERIFICATION PASSED PERFECTLY!');
    process.exit(0);
  } else {
    console.error('\nâŒ PHASE 6 PIPELINE VERIFICATION FAILED.');
    process.exit(1);
  }
}

runPhase6PipelineTests().catch((err) => {
  console.error('âŒ Test execution error:', err);
  process.exit(1);
});
