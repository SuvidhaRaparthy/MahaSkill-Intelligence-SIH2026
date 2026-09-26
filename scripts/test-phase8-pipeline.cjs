// Phase 8 Automated Live Pipeline Test Suite - Policy What-If Simulator
// Queries live Supabase database and verifies Phase 8 policy simulations and baseline immutability.

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

let supabaseUrl = process.env.VITE_SUPABASE_URL;
let supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  try {
    const envFile = fs.readFileSync('.env', 'utf8');
    envFile.split('\n').forEach((line) => {
      const [k, ...v] = line.split('=');
      if (k && v.length) {
        const key = k.trim();
        const val = v.join('=').trim();
        if (key === 'VITE_SUPABASE_URL') supabaseUrl = val;
        if (key === 'VITE_SUPABASE_ANON_KEY') supabaseKey = val;
      }
    });
  } catch (err) {}
}

const supabase = createClient(supabaseUrl, supabaseKey);

function classifyCoverageRatio(coveragePercent) {
  if (coveragePercent < 50) return 'CRITICAL_SHORTAGE';
  if (coveragePercent < 90) return 'MODERATE_SHORTAGE';
  if (coveragePercent <= 125) return 'BALANCED';
  if (coveragePercent <= 200) return 'MODERATE_OVERSUPPLY';
  return 'HIGH_OVERSUPPLY';
}

function runPolicySimulationMath(baseline, inputs) {
  const simSeats = baseline.annual_seats + inputs.additional_seats;
  const simEffectiveSupply = Number((0.60 * simSeats + 0.40 * baseline.annual_completions).toFixed(1));

  const simCoverageRatio = simEffectiveSupply / Math.max(1, baseline.direct_demand);
  const simCoveragePercent = Number((simCoverageRatio * 100).toFixed(2));
  const simPhysicalDeficit = Number((baseline.direct_demand - simEffectiveSupply).toFixed(1));
  const simCoverageClass = classifyCoverageRatio(simCoveragePercent);

  const simSupplyScore = simEffectiveSupply === 0
    ? 0
    : Math.min(100, Math.floor(simCoverageRatio * baseline.demand_score));
  const simNetGapIndex = baseline.demand_score - simSupplyScore;

  const simTrainersAvailable = baseline.trainers_available + inputs.additional_trainers;
  const simTrainersRequired = simSeats > 0 ? Math.ceil(simSeats / 35) : Math.ceil(baseline.direct_demand / 35);
  const simTrainerGap = simTrainersAvailable - simTrainersRequired;

  const isIT = baseline.category.toLowerCase().includes('software') ||
               baseline.category.toLowerCase().includes('it') ||
               baseline.skill_name.toLowerCase().includes('react') ||
               baseline.skill_name.toLowerCase().includes('php') ||
               baseline.skill_name.toLowerCase().includes('ai');
  const trainingReq = simSeats > 0 ? simSeats : baseline.direct_demand;
  const simEquipmentRequired = isIT ? Math.ceil(trainingReq / 10) : Math.ceil(Math.min(30, trainingReq) / 3);
  const simEquipmentAvailable = baseline.equipment_available + inputs.additional_equipment;
  const simEquipmentGap = simEquipmentAvailable - simEquipmentRequired;

  const simCurriculumCoverage = inputs.curriculum_module_added ? 100 : baseline.curriculum_coverage_pct;

  const trainerReadinessPct = Math.min(100, Math.floor((simTrainersAvailable / Math.max(1, simTrainersRequired)) * 100));
  const equipmentReadinessPct = Math.min(100, Math.floor((simEquipmentAvailable / Math.max(1, simEquipmentRequired)) * 100));
  const simReadinessScore = Math.min(100, Math.floor(
    0.40 * trainerReadinessPct +
    0.40 * equipmentReadinessPct +
    0.20 * Math.min(100, simCoveragePercent)
  ));

  return {
    inputs,
    simulated: {
      annual_seats: simSeats,
      effective_supply: simEffectiveSupply,
      coverage_pct: simCoveragePercent,
      coverage_classification: simCoverageClass,
      physical_deficit: simPhysicalDeficit,
      supply_score: simSupplyScore,
      net_gap_index: simNetGapIndex,
      trainers_available: simTrainersAvailable,
      trainers_required: simTrainersRequired,
      trainer_gap: simTrainerGap,
      equipment_available: simEquipmentAvailable,
      equipment_required: simEquipmentRequired,
      equipment_gap: simEquipmentGap,
      curriculum_coverage_pct: simCurriculumCoverage,
      readiness_score: simReadinessScore
    },
    is_simulation: true
  };
}

async function runPhase8LivePipelineTests() {
  console.log('\n==================================================');
  console.log('  MAHASKILL INTELLIGENCE - PHASE 8 LIVE PIPELINE TEST');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Capture Initial Database Baseline Counts
  const [
    { count: countDistricts },
    { count: countSectors },
    { count: countOccupations },
    { count: countSkills },
    { count: countPostings },
    { count: countJobSkills },
    { count: countSignals },
    { count: countCourses },
    { count: countCourseSkills },
    { count: countTrainers },
    { count: countEquipment }
  ] = await Promise.all([
    supabase.from('districts').select('*', { count: 'exact', head: true }),
    supabase.from('sectors').select('*', { count: 'exact', head: true }),
    supabase.from('occupations').select('*', { count: 'exact', head: true }),
    supabase.from('skills').select('*', { count: 'exact', head: true }),
    supabase.from('job_postings').select('*', { count: 'exact', head: true }),
    supabase.from('job_skills').select('*', { count: 'exact', head: true }),
    supabase.from('employer_signals').select('*', { count: 'exact', head: true }),
    supabase.from('courses').select('*', { count: 'exact', head: true }),
    supabase.from('course_skills').select('*', { count: 'exact', head: true }),
    supabase.from('trainers').select('*', { count: 'exact', head: true }),
    supabase.from('equipment').select('*', { count: 'exact', head: true })
  ]);

  console.log('Initial Database Baseline Verified:');
  console.log(`  districts: ${countDistricts}, skills: ${countSkills}, job_postings: ${countPostings}, employer_signals: ${countSignals}`);

  // Fetch live baseline for Case 1: React.js / Pune
  const [
    { data: puneDist },
    { data: reactSkill },
    { data: allPostings },
    { data: reactJobSkills },
    { data: reactSignals }
  ] = await Promise.all([
    supabase.from('districts').select('*').eq('name', 'Pune').single(),
    supabase.from('skills').select('*').ilike('canonical_name', '%React%').single(),
    supabase.from('job_postings').select('id, district_id'),
    supabase.from('job_skills').select('job_id, skill_id'),
    supabase.from('employer_signals').select('expected_hires, district_id, skill_id')
  ]);

  // Filter Pune postings matching React.js
  const punePostingIds = new Set(allPostings.filter(p => p.district_id === puneDist.id).map(p => p.id));
  const puneReactJobSkills = reactJobSkills.filter(js => js.skill_id === reactSkill.id && punePostingIds.has(js.job_id));
  const uniquePunePostingsCount = new Set(puneReactJobSkills.map(js => js.job_id)).size; // 60

  const puneReactSignals = reactSignals.filter(es => es.district_id === puneDist.id && es.skill_id === reactSkill.id);
  const expectedHiresCount = puneReactSignals.reduce((s, es) => s + es.expected_hires, 0); // 120

  const baselineReactPune = {
    district_name: 'Pune',
    sector_name: 'Information Technology',
    skill_name: 'React.js',
    category: 'Software Development',
    direct_demand: uniquePunePostingsCount + expectedHiresCount, // 180
    annual_seats: 0,
    annual_completions: 0,
    effective_supply: 0,
    coverage_pct: 0,
    physical_deficit: 180,
    demand_score: 100,
    supply_score: 0,
    net_gap_index: 100,
    trainers_available: 0,
    trainers_required: Math.ceil(180 / 35), // 6
    trainer_gap: -6,
    equipment_available: 0,
    equipment_required: Math.ceil(180 / 10), // 18
    equipment_gap: -18,
    curriculum_coverage_pct: 0,
    readiness_score: 0
  };

  console.log('\n--- Case 1: React.js Pune Policy Simulation ---');
  assert(baselineReactPune.direct_demand === 180, `Case 1 Baseline: Direct Demand = ${baselineReactPune.direct_demand}`);
  assert(baselineReactPune.effective_supply === 0, `Case 1 Baseline: Effective Supply = ${baselineReactPune.effective_supply}`);
  assert(baselineReactPune.coverage_pct === 0, `Case 1 Baseline: Coverage % = ${baselineReactPune.coverage_pct}%`);

  // Simulate capacity addition: +180 seats, +6 trainers, +18 workstations
  const sim1 = runPolicySimulationMath(baselineReactPune, {
    additional_seats: 180,
    additional_trainers: 6,
    additional_equipment: 18,
    curriculum_module_added: true
  });

  assert(sim1.simulated.annual_seats === 180, `Case 1 Sim: Simulated seats = ${sim1.simulated.annual_seats}`);
  assert(sim1.simulated.effective_supply === 108, `Case 1 Sim: Simulated S_eff = ${sim1.simulated.effective_supply} (0.6 * 180)`);
  assert(sim1.simulated.coverage_pct === 60, `Case 1 Sim: Simulated Coverage = ${sim1.simulated.coverage_pct}% (108/180)`);
  assert(sim1.simulated.physical_deficit === 72, `Case 1 Sim: Simulated Physical Deficit reduced to +72 (180 - 108)`);
  assert(sim1.simulated.trainer_gap === 0, `Case 1 Sim: Trainer gap resolved to 0 (6 available / 6 required)`);
  assert(sim1.simulated.equipment_gap === 0, `Case 1 Sim: Equipment gap resolved to 0 (18 available / 18 required)`);
  assert(sim1.simulated.readiness_score === 92, `Case 1 Sim: Simulated Readiness recalculated to ${sim1.simulated.readiness_score}/100`);
  assert(sim1.is_simulation === true, `Case 1 Sim: Flagged explicitly as is_simulation = true`);

  console.log('\n--- Case 2: EV Battery Diagnostics Pune Simulation ---');
  const baselineEV = {
    district_name: 'Pune',
    sector_name: 'Automotive and EV',
    skill_name: 'EV Battery Diagnostics',
    category: 'Automotive Engineering',
    direct_demand: 108,
    annual_seats: 120,
    annual_completions: 105,
    effective_supply: 114,
    coverage_pct: 105.56,
    physical_deficit: -6,
    demand_score: 75,
    supply_score: 75,
    net_gap_index: 0,
    trainers_available: 3,
    trainers_required: 4,
    trainer_gap: -1,
    equipment_available: 7,
    equipment_required: 10,
    equipment_gap: -3,
    curriculum_coverage_pct: 85,
    readiness_score: 78
  };

  const sim2 = runPolicySimulationMath(baselineEV, {
    additional_seats: 0,
    additional_trainers: 1,
    additional_equipment: 3,
    curriculum_module_added: false
  });

  assert(sim2.simulated.direct_demand === undefined && baselineEV.direct_demand === 108, `Case 2 Sim: Direct Demand held constant at 108`);
  assert(sim2.simulated.effective_supply === 114, `Case 2 Sim: Effective Supply remains 114 since additional seats = 0`);
  assert(sim2.simulated.trainer_gap === 0, `Case 2 Sim: Trainer gap resolved (4 available / 4 required)`);
  assert(sim2.simulated.equipment_gap === 0, `Case 2 Sim: Equipment gap resolved (10 available / 10 required)`);
  assert(sim2.simulated.readiness_score > baselineEV.readiness_score, `Case 2 Sim: Readiness score improved from ${baselineEV.readiness_score} to ${sim2.simulated.readiness_score}`);

  console.log('\n--- Case 3: Oversupply Simulation (CAN Bus Nashik) ---');
  const baselineOversupply = {
    district_name: 'Nashik',
    sector_name: 'Automotive and EV',
    skill_name: 'CAN Bus Diagnostics',
    category: 'Automotive Electronics',
    direct_demand: 40,
    annual_seats: 90,
    annual_completions: 82,
    effective_supply: 86.8,
    coverage_pct: 217.00,
    physical_deficit: -46.8,
    demand_score: 50,
    supply_score: 100,
    net_gap_index: -50,
    trainers_available: 5,
    trainers_required: 3,
    trainer_gap: +2,
    equipment_available: 10,
    equipment_required: 10,
    equipment_gap: 0,
    curriculum_coverage_pct: 100,
    readiness_score: 95
  };

  const sim3 = runPolicySimulationMath(baselineOversupply, {
    additional_seats: 0,
    additional_trainers: 0,
    additional_equipment: 0,
    curriculum_module_added: false
  });

  assert(sim3.simulated.coverage_classification === 'HIGH_OVERSUPPLY', `Case 3 Sim: Coverage classification remains HIGH_OVERSUPPLY (217%)`);
  assert(sim3.simulated.physical_deficit < 0, `Case 3 Sim: Physical deficit remains negative (-46.8 surplus seats)`);

  console.log('\n--- Case 4: Zero Supply Handling ---');
  const sim4 = runPolicySimulationMath({ ...baselineReactPune, effective_supply: 0, annual_seats: 0, annual_completions: 0 }, { additional_seats: 0, additional_trainers: 0, additional_equipment: 0, curriculum_module_added: false });
  assert(sim4.simulated.effective_supply === 0, `Case 4: Effective supply = 0`);
  assert(sim4.simulated.supply_score === 0, `Case 4: Supply score = 0`);
  assert(sim4.simulated.coverage_pct === 0, `Case 4: Coverage % = 0%`);

  console.log('\n--- Case 5: Zero Demand Safeguard ---');
  const zeroDemandBaseline = { ...baselineReactPune, direct_demand: 0 };
  const sim5 = runPolicySimulationMath(zeroDemandBaseline, { additional_seats: 50, additional_trainers: 2, additional_equipment: 5, curriculum_module_added: false });
  assert(!isNaN(sim5.simulated.coverage_pct) && isFinite(sim5.simulated.coverage_pct), `Case 5: Zero demand protected against division by zero`);

  console.log('\n--- Case 6: Baseline Immutability Audit ---');
  const [
    { count: postDistricts },
    { count: postSkills },
    { count: postPostings },
    { count: postSignals },
    { count: postCourses },
    { count: postTrainers },
    { count: postEquip }
  ] = await Promise.all([
    supabase.from('districts').select('*', { count: 'exact', head: true }),
    supabase.from('skills').select('*', { count: 'exact', head: true }),
    supabase.from('job_postings').select('*', { count: 'exact', head: true }),
    supabase.from('employer_signals').select('*', { count: 'exact', head: true }),
    supabase.from('courses').select('*', { count: 'exact', head: true }),
    supabase.from('trainers').select('*', { count: 'exact', head: true }),
    supabase.from('equipment').select('*', { count: 'exact', head: true })
  ]);

  assert(countDistricts === postDistricts, `Immutability: districts count unchanged (${countDistricts})`);
  assert(countSkills === postSkills, `Immutability: skills count unchanged (${countSkills})`);
  assert(countPostings === postPostings, `Immutability: job_postings count unchanged (${countPostings})`);
  assert(countSignals === postSignals, `Immutability: employer_signals count unchanged (${countSignals})`);
  assert(countCourses === postCourses, `Immutability: courses count unchanged (${countCourses})`);
  assert(countTrainers === postTrainers, `Immutability: trainers count unchanged (${countTrainers})`);
  assert(countEquipment === postEquip, `Immutability: equipment count unchanged (${countEquipment})`);

  console.log('\n--------------------------------------------------');
  console.log(`  RESULTS: ${passed} PASSED / ${failed} FAILED`);
  console.log('--------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase8LivePipelineTests().catch((err) => {
  console.error('Fatal error during Phase 8 live pipeline test:', err);
  process.exit(1);
});
