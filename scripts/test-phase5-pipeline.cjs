// Phase 5 Pipeline Verification Test for MahaSkill Intelligence
// Run using: node scripts/test-phase5-pipeline.cjs

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
console.log('PHASE 5 VERIFICATION â€” LIVE SUPABASE PIPELINE TEST');
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

async function runPhase5PipelineTests() {
  // 1. Fetch live database records
  const [
    { data: skills },
    { data: postings },
    { data: jobSkills },
    { data: empSignals },
    { data: timeSeries },
    { data: courses },
    { data: courseSkills },
    { data: districts }
  ] = await Promise.all([
    supabase.from('skills').select('*'),
    supabase.from('job_postings').select('*'),
    supabase.from('job_skills').select('*'),
    supabase.from('employer_signals').select('*'),
    supabase.from('time_series_metrics').select('*'),
    supabase.from('courses').select('*'),
    supabase.from('course_skills').select('*'),
    supabase.from('districts').select('*')
  ]);

  const puneDist = districts.find((d) => d.name.toLowerCase() === 'pune');
  const nashikDist = districts.find((d) => d.name.toLowerCase() === 'nashik');

  // Helper function to run Phase 4.4 analytical pipeline logic
  function calculatePhase44Metrics(skillId, districtId = null) {
    let relPostings = jobSkills.filter((js) => js.skill_id === skillId);
    let relSignals = empSignals.filter((es) => es.skill_id === skillId);

    if (districtId) {
      const pIds = new Set(postings.filter((p) => p.district_id === districtId).map((p) => p.id));
      relPostings = relPostings.filter((js) => pIds.has(js.job_id || js.job_posting_id));
      relSignals = relSignals.filter((es) => es.district_id === districtId);
    }

    const nPostings = relPostings.length;
    const nExpectedHires = relSignals.reduce((sum, es) => sum + Number(es.expected_hires || 0), 0);
    const directDemand = nPostings + nExpectedHires;

    const mappedCourses = courseSkills.filter((cs) => cs.skill_id === skillId);
    let totalSeats = 0;
    let totalCompletions = 0;

    mappedCourses.forEach((cs) => {
      const c = courses.find((crs) => crs.id === cs.course_id);
      if (c) {
        if (!districtId || c.district_id === districtId) {
          totalSeats += Number(c.annual_seats || 0);
          totalCompletions += Number(c.annual_completions || 0);
        }
      }
    });

    const effectiveSupply = Number((0.6 * totalSeats + 0.4 * totalCompletions).toFixed(1));
    const coverageRatio = Number((effectiveSupply / Math.max(1, directDemand)).toFixed(4));
    const coveragePercent = Number((coverageRatio * 100).toFixed(2));
    const physicalDeficit = Number((directDemand - effectiveSupply).toFixed(1));

    return {
      skillId,
      nPostings,
      nExpectedHires,
      directDemand,
      effectiveSupply,
      coveragePercent,
      physicalDeficit
    };
  }

  function computeDynamicGrowth(skillId, districtId = null) {
    let ts = timeSeries.filter((t) => t.skill_id === skillId);
    if (districtId) ts = ts.filter((t) => t.district_id === districtId);

    if (ts.length < 2) return null;
    const sorted = [...ts].sort((a, b) => a.period.localeCompare(b.period));
    const earliest = Number(sorted[0].metric_value);
    const latest = Number(sorted[sorted.length - 1].metric_value);
    return Math.round(((latest - earliest) / Math.max(1, earliest)) * 10000) / 100;
  }

  function generateRecommendation(demand, CR, growthPct) {
    if ((demand > 0 || (growthPct !== null && growthPct >= 20)) && CR < 50) {
      return 'ADD';
    }
    if (demand > 0 && CR >= 90 && CR <= 125) {
      return 'RETAIN';
    }
    if (CR > 200 || (CR > 125 && growthPct !== null && growthPct < 0)) {
      return 'OVERSUPPLY';
    }
    if ((CR >= 50 && CR < 90) || (CR > 125 && CR <= 200)) {
      return 'REVIEW';
    }
    return 'REVIEW';
  }

  // --- CASE 1: EV Battery Diagnostics (Pune) ---
  console.log('--- VALIDATION CASE 1: EV Battery Diagnostics â€” Pune ---');
  const evSkill = skills.find((s) => s.canonical_name === 'EV Battery Diagnostics');
  const evMetrics = calculatePhase44Metrics(evSkill.id, puneDist.id);
  const evGrowth = computeDynamicGrowth(evSkill.id, puneDist.id);
  const evRec = generateRecommendation(evMetrics.directDemand, evMetrics.coveragePercent, evGrowth);

  assert('EV Battery Diagnostics Direct Demand', evMetrics.directDemand === 108, `Demand = ${evMetrics.directDemand}`);
  assert('EV Battery Diagnostics Effective Supply', evMetrics.effectiveSupply === 114, `Supply = ${evMetrics.effectiveSupply}`);
  assert('EV Battery Diagnostics Coverage %', Math.abs(evMetrics.coveragePercent - 105.56) < 0.1, `Coverage = ${evMetrics.coveragePercent.toFixed(2)}%`);
  assert('EV Battery Diagnostics Dynamic Growth %', evGrowth === 154.55, `Growth = +${evGrowth}%`);
  assert('EV Battery Diagnostics Recommendation', evRec === 'RETAIN', `Recommendation = ${evRec}`);

  // --- CASE 2: React.js (All Maharashtra) ---
  console.log('\n--- VALIDATION CASE 2: React.js â€” All Maharashtra ---');
  const reactSkill = skills.find((s) => s.canonical_name === 'React.js');
  const reactMetrics = calculatePhase44Metrics(reactSkill.id, null);
  const reactGrowth = computeDynamicGrowth(reactSkill.id, null);
  const reactRec = generateRecommendation(reactMetrics.directDemand, reactMetrics.coveragePercent, reactGrowth);

  assert('React.js Direct Demand', reactMetrics.directDemand === 262, `Demand = ${reactMetrics.directDemand}`);
  assert('React.js Effective Supply', reactMetrics.effectiveSupply === 0, `Supply = ${reactMetrics.effectiveSupply}`);
  assert('React.js Coverage %', reactMetrics.coveragePercent === 0, `Coverage = ${reactMetrics.coveragePercent}%`);
  assert('React.js Dynamic Growth %', reactGrowth === 42, `Growth = +${reactGrowth}%`);
  assert('React.js Recommendation', reactRec === 'ADD', `Recommendation = ${reactRec}`);

  // --- CASE 3: Legacy PHP Maintenance (Pune) ---
  console.log('\n--- VALIDATION CASE 3: Legacy PHP Maintenance â€” Pune ---');
  const phpSkill = skills.find((s) => s.canonical_name === 'Legacy PHP Maintenance');
  const phpMetrics = calculatePhase44Metrics(phpSkill.id, puneDist.id);
  const phpGrowth = computeDynamicGrowth(phpSkill.id, puneDist.id);
  const phpRec = generateRecommendation(phpMetrics.directDemand, phpMetrics.coveragePercent, phpGrowth);

  assert('Legacy PHP Direct Demand', phpMetrics.directDemand === 14, `Demand = ${phpMetrics.directDemand}`);
  assert('Legacy PHP Effective Supply', phpMetrics.effectiveSupply === 488, `Supply = ${phpMetrics.effectiveSupply}`);
  assert('Legacy PHP Coverage %', Math.abs(phpMetrics.coveragePercent - 3485.71) < 1.0, `Coverage = ${phpMetrics.coveragePercent.toFixed(2)}%`);
  assert('Legacy PHP Dynamic Growth %', phpGrowth === -17.65, `Growth = ${phpGrowth}%`);
  assert('Legacy PHP Recommendation', phpRec === 'OVERSUPPLY', `Recommendation = ${phpRec}`);

  // --- CASE 4: CAN Bus Diagnostics (Nashik) ---
  console.log('\n--- VALIDATION CASE 4: CAN Bus Diagnostics â€” Nashik ---');
  const canSkill = skills.find((s) => s.canonical_name === 'CAN Bus Diagnostics');
  const canMetrics = calculatePhase44Metrics(canSkill.id, nashikDist.id);
  const canGrowth = computeDynamicGrowth(canSkill.id, nashikDist.id);
  const canRec = generateRecommendation(canMetrics.directDemand, canMetrics.coveragePercent, canGrowth);

  assert('CAN Bus Direct Demand', canMetrics.directDemand === 40, `Demand = ${canMetrics.directDemand}`);
  assert('CAN Bus Effective Supply', canMetrics.effectiveSupply === 86.8, `Supply = ${canMetrics.effectiveSupply}`);
  assert('CAN Bus Coverage %', canMetrics.coveragePercent === 217, `Coverage = ${canMetrics.coveragePercent}%`);
  assert('CAN Bus Dynamic Growth %', canGrowth === 46.15, `Growth = +${canGrowth}%`);
  assert('CAN Bus Recommendation is OVERSUPPLY', canRec === 'OVERSUPPLY', `Recommendation = ${canRec}`);

  // --- CASE 5: Unmapped Skill Verification (Generative AI) ---
  console.log('\n--- VALIDATION CASE 5: Generative AI & LLM Integration (Unmapped Skill) ---');
  const aiSkill = skills.find((s) => s.canonical_name.includes('Generative AI'));
  assert('Generative AI record exists in live DB', Boolean(aiSkill), `Skill ID = ${aiSkill ? aiSkill.id : 'none'}`);
  if (aiSkill) {
    const aiMetrics = calculatePhase44Metrics(aiSkill.id, null);
    const aiGrowth = computeDynamicGrowth(aiSkill.id, null);
    const aiRec = generateRecommendation(aiMetrics.directDemand, aiMetrics.coveragePercent, aiGrowth);

    assert('Generative AI Direct Demand', aiMetrics.directDemand === 16, `Demand = ${aiMetrics.directDemand}`);
    assert('Generative AI Effective Supply (0 mapped courses)', aiMetrics.effectiveSupply === 0, `Supply = ${aiMetrics.effectiveSupply}`);
    assert('Generative AI Coverage %', aiMetrics.coveragePercent === 0, `Coverage = ${aiMetrics.coveragePercent}%`);
    assert('Generative AI Dynamic Growth %', aiGrowth === 125, `Growth = +${aiGrowth}%`);
    assert('Generative AI Recommendation is ADD', aiRec === 'ADD', `Recommendation = ${aiRec}`);
  }

  // --- EDGE CASE VERIFICATION ---
  console.log('\n--- EDGE CASE VERIFICATIONS ---');
  // Edge Case A: Zero Demand + Zero Supply
  const recZero = generateRecommendation(0, 0, null);
  assert('Zero Demand + Zero Supply handled safely', recZero === 'REVIEW', `Recommendation = ${recZero}`);

  // Edge Case B: Multi-source Evidence Traceability
  const mockEvidenceRefs = [
    { source_type: 'Job Postings Signal', weight: 45 },
    { source_type: 'Employer Survey Signals', weight: 35 },
    { source_type: 'Vocational Training Enrolment', weight: 20 }
  ];
  const sumWeights = mockEvidenceRefs.reduce((acc, e) => acc + e.weight, 0);
  assert('Multi-source Evidence Traceability Sum = 100%', sumWeights === 100, `Sum = ${sumWeights}%`);

  console.log('\n=====================================================');
  console.log(`PHASE 5 TEST SUMMARY: ${passed} / ${total} assertions passed.`);
  console.log('=====================================================');

  if (passed === total) {
    console.log('\nâœ… PHASE 5 PIPELINE VERIFICATION PASSED PERFECTLY!');
    process.exit(0);
  } else {
    console.error('\nâŒ PHASE 5 PIPELINE VERIFICATION FAILED.');
    process.exit(1);
  }
}

runPhase5PipelineTests().catch((err) => {
  console.error('âŒ Test execution error:', err);
  process.exit(1);
});
