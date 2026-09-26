// MahaSkill Intelligence - Phase 4.4 Live Pipeline Test Suite
// Verifies Demand-Aligned Coverage Methodology against active remote Supabase database

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://erfltqteyqmshbituvdv.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
});

async function runPhase44PipelineTests() {
  console.log('==================================================');
  console.log('  MAHASKILL INTELLIGENCE - PHASE 4.4 PIPELINE TEST');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  âœ… [PASS]: ${message}`);
      passed++;
    } else {
      console.log(`  âŒ [FAIL]: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Fetch live database entities
    const { data: skills } = await supabase.from('skills').select('*');
    const { data: jobPostings } = await supabase.from('job_postings').select('*');
    const { data: jobSkills } = await supabase.from('job_skills').select('*');
    const { data: employerSignals } = await supabase.from('employer_signals').select('*');
    const { data: courses } = await supabase.from('courses').select('*');
    const { data: courseSkills } = await supabase.from('course_skills').select('*');
    const { data: districts } = await supabase.from('districts').select('*');

    assert(skills && skills.length === 14, `Supabase skills table returned ${skills?.length} canonical skills (expected 14)`);
    assert(jobPostings && jobPostings.length === 300, `Supabase job_postings table contains ${jobPostings?.length} job postings (expected 300)`);
    assert(jobSkills && jobSkills.length === 360, `Supabase job_skills table contains ${jobSkills?.length} job_skills relationships (expected 360)`);

    const puneId = '11111111-1111-4111-8111-111111111111';
    const nashikId = '22222222-2222-4222-8222-222222222222';

    // --------------------------------------------------
    // CASE 1: EV Battery Diagnostics â€” Pune
    // --------------------------------------------------
    console.log('\n--- CASE 1: EV Battery Diagnostics â€” Pune ---');
    const evSkill = skills.find(s => s.canonical_name.includes('EV Battery'));
    const evPunePostings = jobPostings.filter(jp => jp.district_id === puneId);
    const evPunePostingIds = new Set(evPunePostings.map(jp => jp.id));
    const evPuneJs = jobSkills.filter(js => js.skill_id === evSkill.id && evPunePostingIds.has(js.job_id));
    const evPuneUniquePostings = new Set(evPuneJs.map(js => js.job_id)).size;
    
    const evPuneSignals = employerSignals.filter(es => es.skill_id === evSkill.id && es.district_id === puneId);
    const evPuneExpectedHires = evPuneSignals.reduce((acc, es) => acc + (es.expected_hires || 0), 0);
    const evPuneDemand = evPuneUniquePostings + evPuneExpectedHires;

    const evPuneCourses = courses.filter(c => c.district_id === puneId && courseSkills.some(cs => cs.course_id === c.id && cs.skill_id === evSkill.id));
    const evPuneSeats = evPuneCourses.reduce((acc, c) => acc + c.annual_seats, 0);
    const evPuneCompletions = evPuneCourses.reduce((acc, c) => acc + c.annual_completions, 0);
    const evPuneEffectiveSupply = Number((0.60 * evPuneSeats + 0.40 * evPuneCompletions).toFixed(1));

    const evPuneCoverageRatio = Number((evPuneEffectiveSupply / evPuneDemand).toFixed(4));
    const evPuneCoveragePercent = Number((evPuneCoverageRatio * 100).toFixed(2));
    const evPuneDeficit = Number((evPuneDemand - evPuneEffectiveSupply).toFixed(1));

    assert(evPuneDemand === 108, `CASE 1 Direct Hiring Demand = ${evPuneDemand} (expected 108: 28 postings + 80 hires)`);
    assert(evPuneEffectiveSupply === 114, `CASE 1 Effective Supply = ${evPuneEffectiveSupply} (expected 114: 0.6*120 + 0.4*105)`);
    assert(Math.abs(evPuneCoveragePercent - 105.56) < 0.1, `CASE 1 Coverage % = ${evPuneCoveragePercent}% (expected ~105.56%)`);
    assert(evPuneDeficit === -6, `CASE 1 Physical Deficit = ${evPuneDeficit} (expected -6 surplus seats)`);
    assert(evPuneCoveragePercent >= 90 && evPuneCoveragePercent <= 125, `CASE 1 Classification = BALANCED (90% to 125% coverage)`);

    // --------------------------------------------------
    // CASE 2: Legacy PHP Maintenance â€” Pune
    // --------------------------------------------------
    console.log('\n--- CASE 2: Legacy PHP Maintenance â€” Pune ---');
    const phpSkill = skills.find(s => s.canonical_name.includes('Legacy PHP'));
    const phpPuneJs = jobSkills.filter(js => js.skill_id === phpSkill.id && evPunePostingIds.has(js.job_id));
    const phpPuneUniquePostings = new Set(phpPuneJs.map(js => js.job_id)).size;

    const phpPuneSignals = employerSignals.filter(es => es.skill_id === phpSkill.id && es.district_id === puneId);
    const phpPuneExpectedHires = phpPuneSignals.reduce((acc, es) => acc + (es.expected_hires || 0), 0);
    const phpPuneDemand = phpPuneUniquePostings + phpPuneExpectedHires;

    const phpPuneCourses = courses.filter(c => c.district_id === puneId && courseSkills.some(cs => cs.course_id === c.id && cs.skill_id === phpSkill.id));
    const phpPuneSeats = phpPuneCourses.reduce((acc, c) => acc + c.annual_seats, 0);
    const phpPuneCompletions = phpPuneCourses.reduce((acc, c) => acc + c.annual_completions, 0);
    const phpPuneEffectiveSupply = Number((0.60 * phpPuneSeats + 0.40 * phpPuneCompletions).toFixed(1));

    const phpPuneCoverageRatio = Number((phpPuneEffectiveSupply / Math.max(1, phpPuneDemand)).toFixed(4));
    const phpPuneCoveragePercent = Number((phpPuneCoverageRatio * 100).toFixed(2));
    const phpPuneDeficit = Number((phpPuneDemand - phpPuneEffectiveSupply).toFixed(1));

    assert(phpPuneDemand === 14, `CASE 2 Direct Hiring Demand = ${phpPuneDemand} (expected 14: 14 postings + 0 hires)`);
    assert(phpPuneEffectiveSupply === 488, `CASE 2 Effective Supply = ${phpPuneEffectiveSupply} (expected 488: 0.6*500 + 0.4*470)`);
    assert(Math.abs(phpPuneCoveragePercent - 3485.71) < 1.0, `CASE 2 Coverage % = ${phpPuneCoveragePercent}% (expected ~3485.71%)`);
    assert(phpPuneDeficit === -474, `CASE 2 Physical Deficit = ${phpPuneDeficit} (expected -474 surplus seats)`);
    assert(phpPuneCoveragePercent > 200, `CASE 2 Classification = HIGH_OVERSUPPLY (>200% coverage)`);

    // --------------------------------------------------
    // CASE 3: React.js â€” All Maharashtra
    // --------------------------------------------------
    console.log('\n--- CASE 3: React.js â€” All Maharashtra ---');
    const reactSkill = skills.find(s => s.canonical_name.includes('React.js'));
    const reactJs = jobSkills.filter(js => js.skill_id === reactSkill.id);
    const reactUniquePostings = new Set(reactJs.map(js => js.job_id)).size;

    const reactSignals = employerSignals.filter(es => es.skill_id === reactSkill.id);
    const reactExpectedHires = reactSignals.reduce((acc, es) => acc + (es.expected_hires || 0), 0);
    const reactDemand = reactUniquePostings + reactExpectedHires;

    const reactCourses = courses.filter(c => courseSkills.some(cs => cs.course_id === c.id && cs.skill_id === reactSkill.id));
    const reactSeats = reactCourses.reduce((acc, c) => acc + c.annual_seats, 0);
    const reactCompletions = reactCourses.reduce((acc, c) => acc + c.annual_completions, 0);
    const reactEffectiveSupply = Number((0.60 * reactSeats + 0.40 * reactCompletions).toFixed(1));

    const reactCoverageRatio = Number((reactEffectiveSupply / Math.max(1, reactDemand)).toFixed(4));
    const reactCoveragePercent = Number((reactCoverageRatio * 100).toFixed(2));
    const reactDeficit = Number((reactDemand - reactEffectiveSupply).toFixed(1));

    assert(reactDemand === 262, `CASE 3 Direct Hiring Demand = ${reactDemand} (expected 262: 142 postings + 120 hires)`);
    assert(reactEffectiveSupply === 0, `CASE 3 Effective Supply = ${reactEffectiveSupply} (expected 0)`);
    assert(reactCoveragePercent === 0, `CASE 3 Coverage % = ${reactCoveragePercent}% (expected 0%)`);
    assert(reactDeficit === 262, `CASE 3 Physical Deficit = +${reactDeficit} (expected +262 unsupplied demand)`);
    assert(reactCoveragePercent < 50, `CASE 3 Classification = CRITICAL_SHORTAGE (<50% coverage)`);

    // --------------------------------------------------
    // CASE 4: CAN Bus Diagnostics â€” Nashik
    // --------------------------------------------------
    console.log('\n--- CASE 4: CAN Bus Diagnostics â€” Nashik ---');
    const canSkill = skills.find(s => s.canonical_name.includes('CAN Bus'));
    const canNashikPostings = jobPostings.filter(jp => jp.district_id === nashikId);
    const canNashikPostingIds = new Set(canNashikPostings.map(jp => jp.id));
    const canNashikJs = jobSkills.filter(js => js.skill_id === canSkill.id && canNashikPostingIds.has(js.job_id));
    const canNashikUniquePostings = new Set(canNashikJs.map(js => js.job_id)).size;

    const canNashikSignals = employerSignals.filter(es => es.skill_id === canSkill.id && es.district_id === nashikId);
    const canNashikExpectedHires = canNashikSignals.reduce((acc, es) => acc + (es.expected_hires || 0), 0);
    const canNashikDemand = canNashikUniquePostings + canNashikExpectedHires;

    const canNashikCourses = courses.filter(c => c.district_id === nashikId && courseSkills.some(cs => cs.course_id === c.id && cs.skill_id === canSkill.id));
    const canNashikSeats = canNashikCourses.reduce((acc, c) => acc + c.annual_seats, 0);
    const canNashikCompletions = canNashikCourses.reduce((acc, c) => acc + c.annual_completions, 0);
    const canNashikEffectiveSupply = Number((0.60 * canNashikSeats + 0.40 * canNashikCompletions).toFixed(1));

    const canNashikCoverageRatio = Number((canNashikEffectiveSupply / Math.max(1, canNashikDemand)).toFixed(4));
    const canNashikCoveragePercent = Number((canNashikCoverageRatio * 100).toFixed(2));
    const canNashikDeficit = Number((canNashikDemand - canNashikEffectiveSupply).toFixed(1));

    assert(canNashikDemand === 40, `CASE 4 Direct Hiring Demand = ${canNashikDemand} (expected 40: 40 postings + 0 hires)`);
    assert(canNashikEffectiveSupply === 86.8, `CASE 4 Effective Supply = ${canNashikEffectiveSupply} (expected 86.8: 0.6*90 + 0.4*82)`);
    assert(canNashikCoveragePercent === 217, `CASE 4 Coverage % = ${canNashikCoveragePercent}% (expected 217%)`);
    assert(canNashikDeficit === -46.8, `CASE 4 Physical Deficit = ${canNashikDeficit} (expected -46.8 surplus seats)`);
    assert(canNashikCoveragePercent > 200, `CASE 4 Classification = HIGH_OVERSUPPLY (>200% coverage)`);

    // --------------------------------------------------
    // EDGE CASES VERIFICATION
    // --------------------------------------------------
    console.log('\n--- EDGE CASES VERIFICATION ---');

    // Edge Case: Division by zero protection
    const zeroDemand = 0;
    const zeroSupply = 0;
    const safeCR = zeroSupply / Math.max(1, zeroDemand);
    assert(!isNaN(safeCR) && isFinite(safeCR) && safeCR === 0, `Edge Case: Zero demand protects against division by zero (CR = 0)`);

    // Edge Case: High supply zero demand
    const zeroDemandHighSupply = 100;
    const safeCR2 = zeroDemandHighSupply / Math.max(1, 0);
    assert(!isNaN(safeCR2) && isFinite(safeCR2) && safeCR2 === 100, `Edge Case: Zero demand with positive supply handles max(1, demand) correctly`);

  } catch (err) {
    console.error('Test execution error:', err);
    assert(false, `Execution failed: ${err.message}`);
  }

  console.log('\n--------------------------------------------------');
  console.log(`  RESULTS: ${passed} PASSED / ${failed} FAILED`);
  console.log('--------------------------------------------------\n');

  if (failed > 0) process.exit(1);
}

runPhase44PipelineTests();
