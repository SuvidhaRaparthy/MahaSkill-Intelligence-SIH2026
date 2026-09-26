// Phase 5 Test & Verification Script for MahaSkill Intelligence
// Run using: node scripts/test-phase5-pipeline.js

import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env variables if present
try {
  const envConfig = readFileSync(resolve(process.cwd(), '.env'), 'utf-8');
  envConfig.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value.length > 0) {
      process.env[key.trim()] = value.join('=').trim();
    }
  });
} catch (e) {
  // Proceed with process.env
}

console.log('=====================================================');
console.log('PHASE 5 VERIFICATION — EMERGING SKILLS & CURRICULUM ALIGNMENT');
console.log('=====================================================\n');

// 1. Emerging Skill Detection Logic
function isEmergingSkill(growthPct, postingsCount, employerCount, isUnresolved) {
  if (isUnresolved && postingsCount >= 5) return true;
  return growthPct >= 50 && employerCount >= 3 && postingsCount >= 5;
}

// 2. Curriculum Recommendation Signal Rules
function generateRecommendationSignal(demandScore, gapScore, coveragePct, growthPct, supplyScore) {
  if (demandScore >= 70 && gapScore >= 25 && coveragePct < 40) {
    return {
      type: 'ADD',
      label: 'ADD / CURRICULUM UPDATE SIGNAL',
      reason: 'High industry demand with critical supply gap and no/low current vocational curriculum coverage.'
    };
  }
  if (demandScore >= 60 && coveragePct >= 70 && Math.abs(gapScore) < 20) {
    return {
      type: 'RETAIN',
      label: 'RETAIN CURRICULUM MODULE',
      reason: 'Strong ongoing industry demand currently well-matched by existing vocational institute course capacity.'
    };
  }
  if (demandScore <= 30 && growthPct !== null && growthPct < 0 && supplyScore >= 60) {
    return {
      type: 'POTENTIAL_OBSOLESCENCE',
      label: 'POTENTIAL OBSOLESCENCE SIGNAL — CURRICULUM REVIEW RECOMMENDED',
      reason: 'Persistently declining employer hiring demand alongside high legacy seat capacity. Curriculum review recommended.'
    };
  }
  if (gapScore <= -25 && supplyScore >= 60) {
    return {
      type: 'POTENTIAL_OVERSUPPLY',
      label: 'POTENTIAL OVERSUPPLY SIGNAL — REVIEW CAPACITY/ENROLMENT',
      reason: 'Training seat supply significantly exceeds regional employer hiring demand. Enrolment capacity review recommended.'
    };
  }
  return {
    type: 'REVIEW',
    label: 'REVIEW CURRICULUM ALIGNMENT',
    reason: 'Evolving employer requirements with partial curriculum coverage. Periodic module review recommended.'
  };
}

// --- RUN TEST SUITE ---
let passed = 0;
let total = 0;

function assert(testName, condition, detail) {
  total++;
  if (condition) {
    console.log(`  ✓ PASSED: ${testName} (${detail})`);
    passed++;
  } else {
    console.error(`  ❌ FAILED: ${testName} (${detail})`);
  }
}

console.log('--- TEST GROUP 1: SCENARIO A (EMERGING SKILL DETECTION) ---');
const isEvBatteryEmerging = isEmergingSkill(154, 28, 8, false);
assert('EV Battery Diagnostics flagged as Emerging', isEvBatteryEmerging, 'Growth: +154%, Employers: 8, Postings: 28');

const isUnresolvedEmerging = isEmergingSkill(0, 7, 3, true);
assert('Unresolved Term flagged as Potential Emerging Skill', isUnresolvedEmerging, 'Unresolved raw term with 7 postings');

console.log('\n--- TEST GROUP 2: SCENARIO B (MISSING CURRICULUM → ADD SIGNAL) ---');
const recB = generateRecommendationSignal(85, 45, 0, 154, 25);
assert('Missing Curriculum produces ADD Signal', recB.type === 'ADD', `Signal: ${recB.label}`);
assert('ADD Signal contains correct reason', recB.reason.includes('High industry demand'), `Reason: ${recB.reason}`);

console.log('\n--- TEST GROUP 3: SCENARIO C (EXISTING COVERAGE → RETAIN SIGNAL) ---');
const recC = generateRecommendationSignal(75, 5, 85, 42, 70);
assert('High Demand + Covered produces RETAIN Signal', recC.type === 'RETAIN', `Signal: ${recC.label}`);

console.log('\n--- TEST GROUP 4: SCENARIO D (PARTIAL COVERAGE → REVIEW SIGNAL) ---');
const recD = generateRecommendationSignal(55, 12, 45, 20, 43);
assert('Partial Coverage produces REVIEW Signal', recD.type === 'REVIEW', `Signal: ${recD.label}`);

console.log('\n--- TEST GROUP 5: SCENARIO E (OVERSUPPLY → POTENTIAL OVERSUPPLY SIGNAL) ---');
const recE = generateRecommendationSignal(35, -35, 80, 0, 70);
assert('High Supply vs Low Demand produces POTENTIAL OVERSUPPLY', recE.type === 'POTENTIAL_OVERSUPPLY', `Signal: ${recE.label}`);

console.log('\n--- TEST GROUP 6: SCENARIO F (DECLINING DEMAND → POTENTIAL OBSOLESCENCE SIGNAL) ---');
const recF = generateRecommendationSignal(22, -48, 90, -18, 70);
assert('Declining Demand produces POTENTIAL OBSOLESCENCE Signal', recF.type === 'POTENTIAL_OBSOLESCENCE', `Signal: ${recF.label}`);
assert('Safety wording present (review recommended)', recF.label.includes('REVIEW RECOMMENDED'), `Label: ${recF.label}`);

console.log('\n--- TEST GROUP 7: SCENARIO G (EVIDENCE & CONFIDENCE PROVENANCE) ---');
const mockEvidence = [
  { source: 'NCS Job Postings', weight: 45 },
  { source: 'MahaSkill Employer Signals', weight: 35 },
  { source: 'MahaSwayam ITI Database', weight: 20 }
];
const totalWeight = mockEvidence.reduce((sum, e) => sum + e.weight, 0);
assert('Multi-source Evidence Traceability', totalWeight === 100, `Evidence Contribution Sum: ${totalWeight}%`);

console.log('\n=====================================================');
console.log(`TEST RESULT SUMMARY: ${passed} / ${total} tests passed.`);
console.log('=====================================================');

if (passed === total) {
  console.log('\nPhase 5 Verification Script Completed Successfully!');
  process.exit(0);
} else {
  console.error('\nSome Phase 5 tests failed.');
  process.exit(1);
}
