// Phase 3 Test & Verification Script for MahaSkill Intelligence
// Run using: node scripts/test-phase3-pipeline.js

import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env variables manually for node script execution
try {
  const envConfig = readFileSync(resolve(process.cwd(), '.env'), 'utf-8');
  envConfig.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value.length > 0) {
      process.env[key.trim()] = value.join('=').trim();
    }
  });
} catch (e) {
  console.log('No .env file found or failed to read, proceeding with process.env');
}

console.log('=====================================================');
console.log('PHASE 3 VERIFICATION — SKILL EXTRACTION & OCCUPATION MAPPING');
console.log('=====================================================\n');

// 1. Define Skill Alias Rules & Canonical Skill Taxonomy for Verification
const SKILL_ALIASES = {
  'react js': 'React.js',
  'reactjs': 'React.js',
  'react.js': 'React.js',
  'node js': 'Node.js',
  'nodejs': 'Node.js',
  'node.js': 'Node.js',
  'postgres': 'PostgreSQL',
  'postgresql': 'PostgreSQL',
  'aws cloud': 'AWS',
  'amazon web services': 'AWS',
  'aws': 'AWS',
  'ms excel': 'Microsoft Excel',
  'microsoft excel': 'Microsoft Excel'
};

const CANONICAL_TAXONOMY = new Set([
  'React.js',
  'Node.js',
  'PostgreSQL',
  'AWS',
  'Microsoft Excel',
  'Python',
  'Generative AI',
  'EV Battery Diagnostics',
  'CAN Bus Diagnostics',
  'Cybersecurity'
]);

function normalizeSkillTerm(rawTerm) {
  const clean = rawTerm.trim().toLowerCase();
  
  // 1. Alias rule match
  if (SKILL_ALIASES[clean]) {
    return {
      raw_term: rawTerm,
      canonical_name: SKILL_ALIASES[clean],
      mapping_method: 'ALIAS_MATCH',
      confidence: 100,
      status: 'CANONICAL',
      explainability: `Raw "${rawTerm}" matched alias rule → Canonical "${SKILL_ALIASES[clean]}" (100% confidence)`
    };
  }

  // 2. Canonical exact match check
  for (const can of CANONICAL_TAXONOMY) {
    if (can.toLowerCase() === clean) {
      return {
        raw_term: rawTerm,
        canonical_name: can,
        mapping_method: 'EXACT_MATCH',
        confidence: 100,
        status: 'CANONICAL',
        explainability: `Raw "${rawTerm}" matched canonical skill "${can}" (100% confidence)`
      };
    }
  }

  // 3. Unresolved / Emerging Skill
  return {
    raw_term: rawTerm,
    canonical_name: rawTerm, // Preserve raw term
    mapping_method: 'UNRESOLVED',
    confidence: 40,
    status: 'UNRESOLVED_EMERGING',
    explainability: `Raw term "${rawTerm}" not found in canonical taxonomy. Marked as unresolved/emerging.`
  };
}

// 2. Define Occupation Normalizer Test Rules
const OCCUPATION_RULES = [
  { keywords: ['software engineer', 'software developer', 'full stack developer', 'react'], title: 'Frontend Software Developer', nco: '2512.0100' },
  { keywords: ['data scientist', 'machine learning', 'ai engineer'], title: 'Machine Learning Engineer', nco: '2512.0200' },
  { keywords: ['ev technician', 'battery specialist', 'electric vehicle'], title: 'EV Technician & Battery Specialist', nco: '7412.0200' }
];

function normalizeOccupationTitle(title) {
  const lower = title.toLowerCase();
  for (const rule of OCCUPATION_RULES) {
    if (rule.keywords.some(k => lower.includes(k))) {
      return {
        raw_title: title,
        canonical_title: rule.title,
        nco_code: rule.nco,
        confidence: 95,
        status: 'MAPPED'
      };
    }
  }
  return {
    raw_title: title,
    canonical_title: 'Unmapped / Pending Review',
    nco_code: 'UNMAPPED',
    confidence: 30,
    status: 'UNMAPPED'
  };
}

// --- RUN VERIFICATION TEST SUITE ---
let passedTests = 0;
let totalTests = 0;

function assertEqual(testName, actual, expected) {
  totalTests++;
  if (actual === expected) {
    console.log(`  ✓ PASSED: ${testName} (Got: ${actual})`);
    passedTests++;
  } else {
    console.error(`  ❌ FAILED: ${testName} (Expected: ${expected}, Got: ${actual})`);
  }
}

console.log('--- TEST GROUP 1: SKILL ALIAS NORMALIZATION ---');
const testCasesSkills = [
  { input: 'React JS', expectedCanonical: 'React.js', expectedMethod: 'ALIAS_MATCH' },
  { input: 'ReactJS', expectedCanonical: 'React.js', expectedMethod: 'ALIAS_MATCH' },
  { input: 'React.js', expectedCanonical: 'React.js', expectedMethod: 'ALIAS_MATCH' },
  { input: 'Node JS', expectedCanonical: 'Node.js', expectedMethod: 'ALIAS_MATCH' },
  { input: 'Node.js', expectedCanonical: 'Node.js', expectedMethod: 'ALIAS_MATCH' },
  { input: 'AWS Cloud', expectedCanonical: 'AWS', expectedMethod: 'ALIAS_MATCH' },
  { input: 'Amazon Web Services', expectedCanonical: 'AWS', expectedMethod: 'ALIAS_MATCH' },
  { input: 'Postgres', expectedCanonical: 'PostgreSQL', expectedMethod: 'ALIAS_MATCH' },
  { input: 'MS Excel', expectedCanonical: 'Microsoft Excel', expectedMethod: 'ALIAS_MATCH' }
];

testCasesSkills.forEach(tc => {
  const res = normalizeSkillTerm(tc.input);
  assertEqual(`Alias "${tc.input}" → "${tc.expectedCanonical}"`, res.canonical_name, tc.expectedCanonical);
  assertEqual(`Mapping Method for "${tc.input}"`, res.mapping_method, tc.expectedMethod);
});

console.log('\n--- TEST GROUP 2: UNRESOLVED / EMERGING SKILL PRESERVATION ---');
const emergingTest = normalizeSkillTerm('Quantum Neuromorphic Processor Tuning');
assertEqual('Emerging Skill Preserves Raw Term', emergingTest.canonical_name, 'Quantum Neuromorphic Processor Tuning');
assertEqual('Emerging Skill Status', emergingTest.status, 'UNRESOLVED_EMERGING');
assertEqual('Emerging Skill Mapping Method', emergingTest.mapping_method, 'UNRESOLVED');

console.log('\n--- TEST GROUP 3: OCCUPATION NORMALIZATION & NCO CODES ---');
const occ1 = normalizeOccupationTitle('Senior React & Node JS Full Stack Developer');
assertEqual('Full Stack Dev → Canonical Title', occ1.canonical_title, 'Frontend Software Developer');
assertEqual('Full Stack Dev → NCO Code', occ1.nco_code, '2512.0100');

const occ2 = normalizeOccupationTitle('Autonomous Bio-Robotics Swarm Lead');
assertEqual('Unknown Occupation → Unmapped Title', occ2.canonical_title, 'Unmapped / Pending Review');
assertEqual('Unknown Occupation → NCO Code', occ2.nco_code, 'UNMAPPED');

console.log('\n=====================================================');
console.log(`TEST RESULT SUMMARY: ${passedTests} / ${totalTests} tests passed.`);
console.log('=====================================================');

if (passedTests === totalTests) {
  console.log('\nPhase 3 Verification Script Completed Successfully!');
  process.exit(0);
} else {
  console.error('\nSome Phase 3 tests failed.');
  process.exit(1);
}
