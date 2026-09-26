// Phase 7 Automated Live Pipeline Test Suite - District Priority & Training Plan
// Queries live Supabase database and verifies Phase 4.4, Phase 5, Phase 6, Phase 7 calculations and assertions.

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read .env
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

// Priority classification function (Section 6)
function classifyDistrictPriority(score) {
  if (score >= 70) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  return 'LOW';
}

function computeCoverageShortageScore(coveragePercent) {
  if (coveragePercent < 50) return 100;
  if (coveragePercent < 90) return 75;
  if (coveragePercent <= 125) return 40;
  if (coveragePercent <= 200) return 15;
  return 0;
}

function computeGrowthPressureScore(growthPct) {
  if (growthPct === null || growthPct <= 0) return 0;
  if (growthPct < 20) return 50;
  if (growthPct < 50) return 75;
  return 100;
}

async function runPhase7LivePipelineTests() {
  console.log('\n==================================================');
  console.log('  MAHASKILL INTELLIGENCE - PHASE 7 LIVE PIPELINE TEST');
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

  // 1. Fetch live database records
  const [
    { data: districts, error: errDist },
    { data: sectors, error: errSec },
    { data: skills, error: errSkills },
    { data: postings, error: errPost },
    { data: jobSkills, error: errJS },
    { data: signals, error: errSig },
    { data: courses, error: errCourses },
    { data: courseSkills, error: errCS },
    { data: timeSeries, error: errTS },
    { data: trainers, error: errTrainers },
    { data: equipment, error: errEquip }
  ] = await Promise.all([
    supabase.from('districts').select('*'),
    supabase.from('sectors').select('*'),
    supabase.from('skills').select('*'),
    supabase.from('job_postings').select('*'),
    supabase.from('job_skills').select('*'),
    supabase.from('employer_signals').select('*'),
    supabase.from('courses').select('*'),
    supabase.from('course_skills').select('*'),
    supabase.from('time_series_metrics').select('*'),
    supabase.from('trainers').select('*'),
    supabase.from('equipment').select('*')
  ]);

  if (errDist || errSkills || errPost) {
    console.error('Database connection error:', errDist || errSkills || errPost);
    process.exit(1);
  }

  // Baseline database integrity check (Section 21)
  assert(districts.length === 3, `Baseline Check: districts count = ${districts.length} (expected 3)`);
  assert(sectors.length === 2, `Baseline Check: sectors count = ${sectors.length} (expected 2)`);
  assert(skills.length === 14, `Baseline Check: skills count = ${skills.length} (expected 14)`);
  assert(postings.length === 300, `Baseline Check: job_postings count = ${postings.length} (expected 300)`);
  assert(jobSkills.length === 360, `Baseline Check: job_skills count = ${jobSkills.length} (expected 360)`);
  assert(signals.length === 3, `Baseline Check: employer_signals count = ${signals.length} (expected 3)`);
  assert(courses.length === 3, `Baseline Check: courses count = ${courses.length} (expected 3)`);
  assert(courseSkills.length === 4, `Baseline Check: course_skills count = ${courseSkills.length} (expected 4)`);
  assert(trainers.length === 3, `Baseline Check: trainers count = ${trainers.length} (expected 3)`);
  assert(equipment.length === 3, `Baseline Check: equipment count = ${equipment.length} (expected 3)`);

  // Build analytical district-skill priorities
  const districtSkillPlans = [];
  const targetDistrictList = ['Pune', 'Nashik', 'Nagpur'];

  for (const dName of targetDistrictList) {
    const distObj = districts.find(d => d.name === dName);
    if (!distObj) continue;

    for (const skill of skills) {
      // 1. Unique Job Postings
      const dPostings = jobSkills.filter(js => js.skill_id === skill.id && postings.some(p => p.id === js.job_id && p.district_id === distObj.id));
      const uniqueJobPostings = new Set(dPostings.map(js => js.job_id)).size;

      // 2. Employer Signals
      const dSignals = signals.filter(es => es.skill_id === skill.id && es.district_id === distObj.id);
      const expectedHires = dSignals.reduce((sum, es) => sum + (es.expected_hires || 0), 0);

      // 3. Direct Hiring Demand
      const directDemand = uniqueJobPostings + expectedHires;

      // 4. Effective Supply
      const dCourseSkills = courseSkills.filter(cs => cs.skill_id === skill.id && courses.some(c => c.id === cs.course_id && c.district_id === distObj.id));
      const dCourses = courses.filter(c => dCourseSkills.some(cs => cs.course_id === c.id));
      const annualSeats = dCourses.reduce((sum, c) => sum + (c.annual_seats || 0), 0);
      const annualCompletions = dCourses.reduce((sum, c) => sum + (c.annual_completions || 0), 0);
      const effectiveSupply = Number((0.60 * annualSeats + 0.40 * annualCompletions).toFixed(1));

      // 5. Coverage Ratio & Coverage %
      const coverageRatio = directDemand === 0 ? (effectiveSupply > 0 ? 999 : 1) : effectiveSupply / directDemand;
      const coveragePercent = Math.round(coverageRatio * 100 * 100) / 100;

      // 6. Growth Rate % (Phase 5)
      const dTs = timeSeries.filter(ts => ts.skill_id === skill.id && (ts.district_id === distObj.id || !ts.district_id));
      let growthPct = null;
      if (dTs.length >= 2) {
        const sorted = [...dTs].sort((a, b) => a.period.localeCompare(b.period));
        const first = sorted[0].metric_value;
        const last = sorted[sorted.length - 1].metric_value;
        if (first > 0) growthPct = Math.round(((last - first) / first) * 100);
      }

      // 7. Phase 5 Curriculum Action
      let curriculumAction = 'REVIEW';
      if (dCourses.length === 0) {
        curriculumAction = 'ADD';
      } else if (coveragePercent > 200) {
        curriculumAction = 'OVERSUPPLY';
      } else if (coveragePercent >= 90 && coveragePercent <= 125) {
        curriculumAction = 'RETAIN';
      } else {
        curriculumAction = 'REVIEW';
      }

      districtSkillPlans.push({
        district: dName,
        skillId: skill.id,
        skillName: skill.canonical_name,
        category: skill.category,
        uniqueJobPostings,
        expectedHires,
        signalCount: dSignals.length,
        directDemand,
        annualSeats,
        annualCompletions,
        effectiveSupply,
        coveragePercent,
        growthPct,
        curriculumAction,
        dCourses
      });
    }
  }

  // Scope Maximums
  const maxDirectDemand = Math.max(1, ...districtSkillPlans.map(p => p.directDemand));
  const maxExpectedHires = Math.max(1, ...districtSkillPlans.map(p => p.expectedHires));

  // Compute final Priority Scores & Training Recommendations
  districtSkillPlans.forEach(plan => {
    const covScore = computeCoverageShortageScore(plan.coveragePercent);
    const demandPress = Math.min(100, Math.floor((plan.directDemand / maxDirectDemand) * 100));
    const empPress = plan.expectedHires > 0 ? Math.min(100, Math.floor((plan.expectedHires / maxExpectedHires) * 100)) : 0;
    const growthPress = computeGrowthPressureScore(plan.growthPct);

    plan.priorityScore = Math.min(100, Math.floor(0.35 * covScore + 0.25 * demandPress + 0.20 * empPress + 0.20 * growthPress));
    plan.priorityLevel = classifyDistrictPriority(plan.priorityScore);

    // Seats (Section 7)
    const isOversupply = plan.curriculumAction === 'OVERSUPPLY' || plan.coveragePercent > 200;
    plan.additionalSeats = isOversupply ? 0 : Math.max(0, Math.ceil(plan.directDemand - plan.effectiveSupply));

    // Trainers (Section 8)
    const tMatch = trainers.find(t => t.district_id === districts.find(d => d.name === plan.district).id && t.skill_id === plan.skillId);
    const availableTrainers = tMatch ? tMatch.trainer_count : 0;
    const requiredTrainers = plan.annualSeats > 0 ? Math.ceil(plan.annualSeats / 35) : Math.ceil(plan.directDemand / 35);
    plan.availableTrainers = availableTrainers;
    plan.requiredTrainers = requiredTrainers;
    plan.additionalTrainers = Math.max(0, requiredTrainers - availableTrainers);

    // Equipment (Section 9)
    const eMatch = equipment.find(e => e.district_id === districts.find(d => d.name === plan.district).id);
    const availableEquip = eMatch ? eMatch.available_quantity : 0;
    const isIT = plan.category.toLowerCase().includes('software') || plan.skillName.toLowerCase().includes('react') || plan.skillName.toLowerCase().includes('php') || plan.skillName.toLowerCase().includes('ai');
    const trainReq = plan.annualSeats > 0 ? plan.annualSeats : plan.directDemand;
    const requiredEquip = isIT ? Math.ceil(trainReq / 10) : Math.ceil(Math.min(30, trainReq) / 3);
    plan.availableEquip = availableEquip;
    plan.requiredEquip = requiredEquip;
    plan.additionalEquip = Math.max(0, requiredEquip - availableEquip);
  });

  console.log('\n--- Case 1: EV Battery Diagnostics / Pune ---');
  const evPune = districtSkillPlans.find(p => p.district === 'Pune' && p.skillName.includes('EV Battery'));
  assert(evPune !== undefined, 'Case 1: Pune + EV Battery record found');
  if (evPune) {
    assert(evPune.uniqueJobPostings === 28, `Case 1: Job Postings = ${evPune.uniqueJobPostings} (expected 28)`);
    assert(evPune.expectedHires === 80, `Case 1: Employer Expected Hires = ${evPune.expectedHires} (expected 80)`);
    assert(evPune.directDemand === 108, `Case 1: Direct Hiring Demand = ${evPune.directDemand} (expected 108)`);
    assert(evPune.effectiveSupply === 114, `Case 1: Effective Supply = ${evPune.effectiveSupply} (expected 114)`);
    assert(Math.abs(evPune.coveragePercent - 105.56) < 0.1, `Case 1: Coverage % = ${evPune.coveragePercent}% (expected ~105.56%)`);
    assert(evPune.curriculumAction === 'RETAIN', `Case 1: Curriculum Action = ${evPune.curriculumAction} (expected RETAIN)`);
    assert(evPune.additionalSeats === 0, `Case 1: Additional Seats = ${evPune.additionalSeats} (expected 0)`);
    assert(evPune.requiredTrainers === 4, `Case 1: Required Trainers = ${evPune.requiredTrainers} (expected 4)`);
    assert(evPune.requiredEquip === 10, `Case 1: Required Equipment = ${evPune.requiredEquip} (expected 10)`);
    assert(evPune.priorityScore === 62, `Case 1: Priority Score = ${evPune.priorityScore} (expected 62)`);
    assert(evPune.priorityLevel === 'MEDIUM', `Case 1: Priority Level = ${evPune.priorityLevel} (expected MEDIUM)`);
  }

  console.log('\n--- Case 2: React.js / Pune ---');
  const reactPune = districtSkillPlans.find(p => p.district === 'Pune' && p.skillName.includes('React'));
  assert(reactPune !== undefined, 'Case 2: Pune + React.js record found');
  if (reactPune) {
    assert(reactPune.uniqueJobPostings === 60, `Case 2: Job Postings = ${reactPune.uniqueJobPostings} (expected 60)`);
    assert(reactPune.expectedHires === 120, `Case 2: Employer Expected Hires = ${reactPune.expectedHires} (expected 120)`);
    assert(reactPune.directDemand === 180, `Case 2: Direct Hiring Demand = ${reactPune.directDemand} (expected 180)`);
    assert(reactPune.effectiveSupply === 0, `Case 2: Effective Supply = ${reactPune.effectiveSupply} (expected 0)`);
    assert(reactPune.coveragePercent === 0, `Case 2: Coverage % = ${reactPune.coveragePercent}% (expected 0%)`);
    assert(reactPune.curriculumAction === 'ADD', `Case 2: Curriculum Action = ${reactPune.curriculumAction} (expected ADD)`);
    assert(reactPune.additionalSeats === 180, `Case 2: Additional Seats = ${reactPune.additionalSeats} (expected 180)`);
    assert(reactPune.requiredTrainers === 6, `Case 2: Required Trainers = ${reactPune.requiredTrainers} (expected 6)`);
    assert(reactPune.requiredEquip === 18, `Case 2: Required Workstations = ${reactPune.requiredEquip} (expected 18)`);
    assert(reactPune.priorityScore >= 70, `Case 2: Priority Score = ${reactPune.priorityScore} >= 70 (expected HIGH)`);
    assert(reactPune.priorityLevel === 'HIGH', `Case 2: Priority Level = ${reactPune.priorityLevel} (expected HIGH)`);
  }

  console.log('\n--- Case 3: Legacy PHP Maintenance / Pune ---');
  const phpPune = districtSkillPlans.find(p => p.district === 'Pune' && p.skillName.includes('Legacy PHP'));
  assert(phpPune !== undefined, 'Case 3: Pune + Legacy PHP record found');
  if (phpPune) {
    assert(phpPune.coveragePercent > 200, `Case 3: Coverage % = ${phpPune.coveragePercent}% (>200% Oversupply)`);
    assert(phpPune.curriculumAction === 'OVERSUPPLY', `Case 3: Curriculum Action = ${phpPune.curriculumAction} (expected OVERSUPPLY)`);
    assert(phpPune.additionalSeats === 0, `Case 3: Additional Seats = ${phpPune.additionalSeats} (expected 0)`);
    assert(phpPune.growthPct < 0, `Case 3: Growth Rate % = ${phpPune.growthPct}% (expected negative)`);
  }

  console.log('\n--- Case 4: CAN Bus Diagnostics / Nashik ---');
  const canNashik = districtSkillPlans.find(p => p.district === 'Nashik' && p.skillName.includes('CAN Bus'));
  assert(canNashik !== undefined, 'Case 4: Nashik + CAN Bus record found');
  if (canNashik) {
    assert(canNashik.uniqueJobPostings === 40, `Case 4: Job Postings = ${canNashik.uniqueJobPostings} (expected 40)`);
    assert(canNashik.directDemand === 40, `Case 4: Direct Hiring Demand = ${canNashik.directDemand} (expected 40)`);
    assert(canNashik.effectiveSupply === 86.8, `Case 4: Effective Supply = ${canNashik.effectiveSupply} (expected 86.8)`);
    assert(Math.abs(canNashik.coveragePercent - 217) < 1, `Case 4: Coverage % = ${canNashik.coveragePercent}% (expected ~217%)`);
    assert(canNashik.curriculumAction === 'OVERSUPPLY', `Case 4: Curriculum Action = ${canNashik.curriculumAction} (expected OVERSUPPLY)`);
    assert(canNashik.additionalSeats === 0, `Case 4: Additional Seats = ${canNashik.additionalSeats} (expected 0)`);
  }

  console.log('\n--- Edge Cases & Formulas Check ---');
  // Formula consistency checks
  assert(computeCoverageShortageScore(20) === 100, 'Shortage Formula: <50% gives 100');
  assert(computeCoverageShortageScore(75) === 75, 'Shortage Formula: <90% gives 75');
  assert(computeCoverageShortageScore(100) === 40, 'Shortage Formula: <=125% gives 40');
  assert(computeCoverageShortageScore(150) === 15, 'Shortage Formula: <=200% gives 15');
  assert(computeCoverageShortageScore(300) === 0, 'Shortage Formula: >200% gives 0');

  assert(computeGrowthPressureScore(-10) === 0, 'Growth Formula: <=0% gives 0');
  assert(computeGrowthPressureScore(15) === 50, 'Growth Formula: <20% gives 50');
  assert(computeGrowthPressureScore(35) === 75, 'Growth Formula: <50% gives 75');
  assert(computeGrowthPressureScore(100) === 100, 'Growth Formula: >=50% gives 100');

  console.log('\n--------------------------------------------------');
  console.log(`  RESULTS: ${passed} PASSED / ${failed} FAILED`);
  console.log('--------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase7LivePipelineTests().catch((err) => {
  console.error('Fatal error during Phase 7 live pipeline test:', err);
  process.exit(1);
});
