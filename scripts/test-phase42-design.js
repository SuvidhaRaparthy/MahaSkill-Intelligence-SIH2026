import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://erfltqteyqmshbituvdv.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
});

async function runDesignTest() {
  console.log('==================================================');
  console.log('  PHASE 4.2 METHODOLOGY DESIGN TEST SCRATCH');
  console.log('==================================================\n');

  // Fetch tables
  const { data: skills } = await supabase.from('skills').select('*');
  const { data: jobPostings } = await supabase.from('job_postings').select('*');
  const { data: jobSkills } = await supabase.from('job_skills').select('*');
  const { data: employerSignals } = await supabase.from('employer_signals').select('*');
  const { data: courses } = await supabase.from('courses').select('*');
  const { data: courseSkills } = await supabase.from('course_skills').select('*');
  const { data: districts } = await supabase.from('districts').select('*');

  const puneId = '11111111-1111-4111-8111-111111111111';
  const nashikId = '22222222-2222-4222-8222-222222222222';

  // 1. EV Battery Diagnostics in Pune
  const evSkill = skills.find(s => s.canonical_name.includes('EV Battery'));
  const evPunePostings = jobPostings.filter(jp => jp.district_id === puneId);
  const evPunePostingIds = new Set(evPunePostings.map(jp => jp.id));
  const evPuneJs = jobSkills.filter(js => js.skill_id === evSkill.id && evPunePostingIds.has(js.job_id));
  const evPuneJobCount = new Set(evPuneJs.map(js => js.job_id)).size;
  const evPuneSignals = employerSignals.filter(es => es.skill_id === evSkill.id && es.district_id === puneId);
  const evPuneHires = evPuneSignals.reduce((acc, es) => acc + (es.expected_hires || 0), 0);
  const evPuneCourses = courses.filter(c => c.district_id === puneId && courseSkills.some(cs => cs.course_id === c.id && cs.skill_id === evSkill.id));
  const evPuneSeats = evPuneCourses.reduce((acc, c) => acc + c.annual_seats, 0);
  const evPuneCompletions = evPuneCourses.reduce((acc, c) => acc + c.annual_completions, 0);

  console.log('--- SCENARIO 1: EV Battery Diagnostics â€” Pune ---');
  console.log(`Job Postings Count: ${evPuneJobCount}`);
  console.log(`Employer Expected Hires: ${evPuneHires}`);
  console.log(`Total Direct Hiring Demand (D_hires): ${evPuneJobCount + evPuneHires}`);
  console.log(`Annual Seats: ${evPuneSeats}, Completions: ${evPuneCompletions}`);
  const evD = 60;
  const evDhires = evPuneJobCount + evPuneHires;
  const evS = Math.min(100, Math.floor((evPuneCompletions / evDhires) * evD));
  console.log(`Demand Score: ${evD} | Proposed Supply Score: ${evS} | Proposed Net Gap: ${evD - evS}`);

  // 2. Legacy PHP in Pune
  const phpSkill = skills.find(s => s.canonical_name.includes('Legacy PHP'));
  const phpPuneJs = jobSkills.filter(js => js.skill_id === phpSkill.id && evPunePostingIds.has(js.job_id));
  const phpPuneJobCount = new Set(phpPuneJs.map(js => js.job_id)).size;
  const phpPuneSignals = employerSignals.filter(es => es.skill_id === phpSkill.id && es.district_id === puneId);
  const phpPuneHires = phpPuneSignals.reduce((acc, es) => acc + (es.expected_hires || 0), 0);
  const phpPuneCourses = courses.filter(c => c.district_id === puneId && courseSkills.some(cs => cs.course_id === c.id && cs.skill_id === phpSkill.id));
  const phpPuneSeats = phpPuneCourses.reduce((acc, c) => acc + c.annual_seats, 0);
  const phpPuneCompletions = phpPuneCourses.reduce((acc, c) => acc + c.annual_completions, 0);

  console.log('\n--- SCENARIO 2: Legacy PHP Maintenance â€” Pune ---');
  console.log(`Job Postings Count: ${phpPuneJobCount}`);
  console.log(`Employer Expected Hires: ${phpPuneHires}`);
  console.log(`Total Direct Hiring Demand (D_hires): ${phpPuneJobCount + phpPuneHires}`);
  console.log(`Annual Seats: ${phpPuneSeats}, Completions: ${phpPuneCompletions}`);
  const phpD = 18;
  const phpDhires = phpPuneJobCount + phpPuneHires;
  const phpS = Math.min(100, Math.floor((phpPuneCompletions / phpDhires) * phpD));
  console.log(`Demand Score: ${phpD} | Proposed Supply Score: ${phpS} | Proposed Net Gap: ${phpD - phpS}`);

  // 3. React.js in Maharashtra
  const reactSkill = skills.find(s => s.canonical_name.includes('React.js'));
  const reactJs = jobSkills.filter(js => js.skill_id === reactSkill.id);
  const reactJobCount = new Set(reactJs.map(js => js.job_id)).size;
  const reactSignals = employerSignals.filter(es => es.skill_id === reactSkill.id);
  const reactHires = reactSignals.reduce((acc, es) => acc + (es.expected_hires || 0), 0);
  const reactCourses = courses.filter(c => courseSkills.some(cs => cs.course_id === c.id && cs.skill_id === reactSkill.id));
  const reactSeats = reactCourses.reduce((acc, c) => acc + c.annual_seats, 0);
  const reactCompletions = reactCourses.reduce((acc, c) => acc + c.annual_completions, 0);

  console.log('\n--- SCENARIO 3: React.js â€” All Maharashtra ---');
  console.log(`Job Postings Count: ${reactJobCount}`);
  console.log(`Employer Expected Hires: ${reactHires}`);
  console.log(`Total Direct Hiring Demand (D_hires): ${reactJobCount + reactHires}`);
  console.log(`Annual Seats: ${reactSeats}, Completions: ${reactCompletions}`);
  const reactD = 94;
  const reactDhires = reactJobCount + reactHires;
  const reactS = reactDhires > 0 ? Math.min(100, Math.floor((reactCompletions / reactDhires) * reactD)) : 0;
  console.log(`Demand Score: ${reactD} | Proposed Supply Score: ${reactS} | Proposed Net Gap: ${reactD - reactS}`);

  // 4. CAN Bus in Nashik
  const canSkill = skills.find(s => s.canonical_name.includes('CAN Bus'));
  const canNashikPostings = jobPostings.filter(jp => jp.district_id === nashikId);
  const canNashikPostingIds = new Set(canNashikPostings.map(jp => jp.id));
  const canNashikJs = jobSkills.filter(js => js.skill_id === canSkill.id && canNashikPostingIds.has(js.job_id));
  const canNashikJobCount = new Set(canNashikJs.map(js => js.job_id)).size;
  const canNashikSignals = employerSignals.filter(es => es.skill_id === canSkill.id && es.district_id === nashikId);
  const canNashikHires = canNashikSignals.reduce((acc, es) => acc + (es.expected_hires || 0), 0);
  const canNashikCourses = courses.filter(c => c.district_id === nashikId && courseSkills.some(cs => cs.course_id === c.id && cs.skill_id === canSkill.id));
  const canNashikSeats = canNashikCourses.reduce((acc, c) => acc + c.annual_seats, 0);
  const canNashikCompletions = canNashikCourses.reduce((acc, c) => acc + c.annual_completions, 0);

  console.log('\n--- SCENARIO 4: CAN Bus Diagnostics â€” Nashik ---');
  console.log(`Job Postings Count: ${canNashikJobCount}`);
  console.log(`Employer Expected Hires: ${canNashikHires}`);
  console.log(`Total Direct Hiring Demand (D_hires): ${canNashikJobCount + canNashikHires}`);
  console.log(`Annual Seats: ${canNashikSeats}, Completions: ${canNashikCompletions}`);
  const canD = 65;
  const canDhires = canNashikJobCount + canNashikHires;
  const canS = Math.min(100, Math.floor((canNashikCompletions / canDhires) * canD));
  console.log(`Demand Score: ${canD} | Proposed Supply Score: ${canS} | Proposed Net Gap: ${canD - canS}`);
}

runDesignTest();
