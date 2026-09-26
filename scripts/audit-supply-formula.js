import { calculateSkillDemandSupplyGaps } from '../src/analytics/demandSupplyGapEngine.ts';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://erfltqteyqmshbituvdv.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
});

async function runAudit() {
  console.log('==================================================');
  console.log('  PHASE 4.1 â€” SUPPLY FORMULA AUDIT SCRATCH');
  console.log('==================================================\n');

  // 1. Fetch DB inputs
  const { data: skills } = await supabase.from('skills').select('*');
  const { data: courses } = await supabase.from('courses').select('*');
  const { data: courseSkills } = await supabase.from('course_skills').select('*');
  const { data: districts } = await supabase.from('districts').select('*');

  console.log('--- DB COURSES ---');
  courses.forEach(c => {
    const dist = districts.find(d => d.id === c.district_id);
    console.log(`Course: ${c.course_name} | ID: ${c.id} | District: ${dist?.name} (${c.district_id}) | Seats: ${c.annual_seats} | Completions: ${c.annual_completions}`);
  });

  console.log('\n--- DB COURSE_SKILLS ---');
  courseSkills.forEach(cs => {
    const course = courses.find(c => c.id === cs.course_id);
    const skill = skills.find(s => s.id === cs.skill_id);
    console.log(`Course: ${course?.course_name} -> Skill: ${skill?.canonical_name} (${cs.skill_id}) | Coverage: ${cs.coverage_level}`);
  });

  // 2. Run Sanity Checks for the 4 requested scenarios:
  // A. EV Battery Diagnostics â€” Pune
  // B. Legacy PHP Maintenance â€” Pune
  // C. React.js â€” All Maharashtra
  // D. CAN Bus Diagnostics â€” Nashik

  console.log('\n==================================================');
  console.log('  SANITY CHECKS FOR 4 AUDIT SCENARIOS');
  console.log('==================================================\n');

  // Pune results
  const puneResults = await calculateSkillDemandSupplyGaps({ districtId: 'd1', sectorId: 'ALL' });
  const evPune = puneResults.find(r => r.skill_name.includes('EV Battery'));
  const phpPune = puneResults.find(r => r.skill_name.includes('Legacy PHP'));

  console.log('--- A. EV Battery Diagnostics â€” Pune ---');
  console.log(`Demand Score: ${evPune?.demand_score}`);
  console.log(`Raw Supply Inputs: Seats=${evPune?.annual_seats}, Completions=${evPune?.annual_completions}, Courses=${evPune?.courses_count}`);
  console.log(`Supply Score: ${evPune?.supply_score}`);
  console.log(`Net Gap: ${evPune?.gap_score}`);
  console.log(`Classification: ${evPune?.classification.label}`);

  console.log('\n--- B. Legacy PHP Maintenance â€” Pune ---');
  console.log(`Demand Score: ${phpPune?.demand_score}`);
  console.log(`Raw Supply Inputs: Seats=${phpPune?.annual_seats}, Completions=${phpPune?.annual_completions}, Courses=${phpPune?.courses_count}`);
  console.log(`Supply Score: ${phpPune?.supply_score}`);
  console.log(`Net Gap: ${phpPune?.gap_score}`);
  console.log(`Classification: ${phpPune?.classification.label}`);

  // All MH results
  const mhResults = await calculateSkillDemandSupplyGaps({ districtId: 'ALL', sectorId: 'ALL' });
  const reactMh = mhResults.find(r => r.skill_name.includes('React.js'));

  console.log('\n--- C. React.js â€” All Maharashtra ---');
  console.log(`Demand Score: ${reactMh?.demand_score}`);
  console.log(`Raw Supply Inputs: Seats=${reactMh?.annual_seats}, Completions=${reactMh?.annual_completions}, Courses=${reactMh?.courses_count}`);
  console.log(`Supply Score: ${reactMh?.supply_score}`);
  console.log(`Net Gap: ${reactMh?.gap_score}`);
  console.log(`Classification: ${reactMh?.classification.label}`);

  // Nashik results
  const nashikResults = await calculateSkillDemandSupplyGaps({ districtId: 'd2', sectorId: 'ALL' });
  const canNashik = nashikResults.find(r => r.skill_name.includes('CAN Bus'));

  console.log('\n--- D. CAN Bus Diagnostics â€” Nashik ---');
  console.log(`Demand Score: ${canNashik?.demand_score}`);
  console.log(`Raw Supply Inputs: Seats=${canNashik?.annual_seats}, Completions=${canNashik?.annual_completions}, Courses=${canNashik?.courses_count}`);
  console.log(`Supply Score: ${canNashik?.supply_score}`);
  console.log(`Net Gap: ${canNashik?.gap_score}`);
  console.log(`Classification: ${canNashik?.classification.label}`);
}

runAudit();
