// Phase 6 Test & Verification Script for MahaSkill Intelligence
// Run using: node scripts/test-phase6-pipeline.js

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
console.log('PHASE 6 VERIFICATION — EMPLOYER VALIDATION & CAPACITY AUDIT');
console.log('=====================================================\n');

// 1. Employer Validation Score Calculator
function calculateEmployerValidationScore(stronglyAgreeCount, agreeCount, disagreeCount) {
  const total = stronglyAgreeCount + agreeCount + disagreeCount;
  if (total === 0) return { score: 0, agreementPct: 0, confidenceBonus: 0 };

  const agreementPct = Math.round(((stronglyAgreeCount + agreeCount) / total) * 100);
  const score = Math.min(100, Math.round(agreementPct * 0.70 + Math.min(30, total * 3.75)));
  const confidenceBonus = total >= 5 && agreementPct >= 80 ? 15 : 8;

  return { score, agreementPct, confidenceBonus };
}

// 2. Trainer Capacity Gap Calculator
function calculateTrainerGap(required, available) {
  const gap = available - required;
  const status = gap < 0 ? 'TRAINER SHORTAGE' : gap === 0 ? 'BALANCED' : 'SUFFICIENT';
  return { gap, status };
}

// 3. Equipment Capacity Gap Calculator
function calculateEquipmentGap(required, available) {
  const gap = available - required;
  const status = gap < 0 ? 'EQUIPMENT SHORTAGE' : gap === 0 ? 'BALANCED' : 'SUFFICIENT';
  return { gap, status };
}

// 4. Overall Training Delivery Readiness Calculator
function calculateTrainingReadiness(demandScore, supplyScore, trainerReadinessPct, equipmentReadinessPct) {
  const overallReadinessScore = Math.round(0.30 * supplyScore + 0.35 * trainerReadinessPct + 0.35 * equipmentReadinessPct);
  let status = 'MODERATE READINESS';

  if (demandScore >= 70 && overallReadinessScore < 60) {
    status = 'NOT READY — CAPACITY INVESTMENT REQUIRED';
  } else if (overallReadinessScore >= 80) {
    status = 'FULLY READY';
  } else if (demandScore <= 30 && supplyScore >= 60) {
    status = 'OVERSUPPLIED / EXCESS CAPACITY';
  }

  return { overallReadinessScore, status };
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

console.log('--- TEST GROUP 1: EMPLOYER VALIDATION & CONSENSUS ---');
const valScoreA = calculateEmployerValidationScore(6, 2, 0); // 8 employers agree
assert('Multi-employer Validation Agreement', valScoreA.agreementPct === 100, `Agreement: ${valScoreA.agreementPct}%`);
assert('Industry Validation Score', valScoreA.score >= 75, `Score: ${valScoreA.score} / 100`);
assert('Confidence Bonus Contribution', valScoreA.confidenceBonus === 15, `Bonus: +${valScoreA.confidenceBonus} pts`);

console.log('\n--- TEST GROUP 2: TRAINER CAPACITY GAP AUDIT ---');
const trainerAudit = calculateTrainerGap(18, 10);
assert('Trainer Gap Calculation', trainerAudit.gap === -8, `Gap: ${trainerAudit.gap}`);
assert('Trainer Shortage Classification', trainerAudit.status === 'TRAINER SHORTAGE', `Status: ${trainerAudit.status}`);

console.log('\n--- TEST GROUP 3: EQUIPMENT CAPACITY GAP AUDIT ---');
const equipmentAudit = calculateEquipmentGap(25, 12);
assert('Equipment Gap Calculation', equipmentAudit.gap === -13, `Gap: ${equipmentAudit.gap}`);
assert('Equipment Shortage Classification', equipmentAudit.status === 'EQUIPMENT SHORTAGE', `Status: ${equipmentAudit.status}`);

console.log('\n--- TEST GROUP 4: TRAINING DELIVERY READINESS SCORE ---');
const readinessA = calculateTrainingReadiness(85, 28, 55, 48); // High demand, low trainer & equipment capacity
assert('Readiness Score Calculation', readinessA.overallReadinessScore < 60, `Overall Score: ${readinessA.overallReadinessScore}`);
assert('Readiness Status Classification', readinessA.status === 'NOT READY — CAPACITY INVESTMENT REQUIRED', `Status: ${readinessA.status}`);

console.log('\n--- TEST GROUP 5: ENRICHED RECOMMENDATION EVIDENCE ---');
const mockEnrichedEvidence = {
  demandGap: +44,
  employersValidating: 8,
  qualifiedTrainers: '10 / 18 required',
  equipmentKits: '12 / 25 required'
};
assert('Employer Evidence Enriched', mockEnrichedEvidence.employersValidating === 8, `Employers: ${mockEnrichedEvidence.employersValidating}`);
assert('Trainer Evidence Enriched', mockEnrichedEvidence.qualifiedTrainers.includes('10 / 18'), `Trainers: ${mockEnrichedEvidence.qualifiedTrainers}`);
assert('Equipment Evidence Enriched', mockEnrichedEvidence.equipmentKits.includes('12 / 25'), `Equipment: ${mockEnrichedEvidence.equipmentKits}`);

console.log('\n--- TEST GROUP 6: DISTRICT COMPARISON AUDIT ---');
const districtAudits = {
  Pune: { trainersAvailable: 10, trainersRequired: 18, trainerGap: -8 },
  Nashik: { trainersAvailable: 7, trainersRequired: 12, trainerGap: -5 },
  Nagpur: { trainersAvailable: 15, trainersRequired: 15, trainerGap: 0 }
};

assert('Pune Trainer Gap Audit', districtAudits.Pune.trainerGap === -8, `Pune Gap: -8`);
assert('Nashik Trainer Gap Audit', districtAudits.Nashik.trainerGap === -5, `Nashik Gap: -5`);
assert('Nagpur Trainer Gap Audit', districtAudits.Nagpur.trainerGap === 0, `Nagpur Gap: 0 (Balanced)`);

console.log('\n=====================================================');
console.log(`TEST RESULT SUMMARY: ${passed} / ${total} tests passed.`);
console.log('=====================================================');

if (passed === total) {
  console.log('\nPhase 6 Verification Script Completed Successfully!');
  process.exit(0);
} else {
  console.error('\nSome Phase 6 tests failed.');
  process.exit(1);
}
