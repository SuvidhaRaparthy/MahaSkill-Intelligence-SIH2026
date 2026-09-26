import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://erfltqteyqmshbituvdv.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
});

async function verifyEvSupply() {
  console.log('==================================================');
  console.log('  EV BATTERY DIAGNOSTICS SUPPLY VERIFICATION');
  console.log('==================================================\n');

  // 1. Fetch skills
  const { data: skills } = await supabase.from('skills').select('*');
  const evSkill = skills.find(s => s.canonical_name.includes('EV Battery Diagnostics') || s.canonical_name.includes('EV Battery'));
  
  console.log('--- 1. CANONICAL SKILL ---');
  console.log('Skill ID:', evSkill?.id);
  console.log('Canonical Name:', evSkill?.canonical_name);
  console.log('Category:', evSkill?.category);

  // 2. Fetch districts
  const { data: districts } = await supabase.from('districts').select('*');
  console.log('\n--- 2. DISTRICTS ---');
  districts.forEach(d => console.log(`District Name: ${d.name} | District ID: ${d.id}`));

  // 3. Fetch courses & course_skills
  const { data: courses } = await supabase.from('courses').select('*');
  const { data: courseSkills } = await supabase.from('course_skills').select('*');

  console.log('\n--- 3. COURSE_SKILLS LINKED TO EV BATTERY DIAGNOSTICS ---');
  const evCourseSkills = courseSkills.filter(cs => cs.skill_id === evSkill?.id);
  console.log(`Found ${evCourseSkills.length} course_skills record(s) linked to skill_id ${evSkill?.id}`);

  evCourseSkills.forEach((cs, i) => {
    const course = courses.find(c => c.id === cs.course_id);
    const district = districts.find(d => d.id === course?.district_id);
    console.log(`\nLink #${i + 1}:`);
    console.log(`  Course Name: ${course?.course_name}`);
    console.log(`  Course ID: ${course?.id}`);
    console.log(`  District Name: ${district?.name}`);
    console.log(`  District ID: ${course?.district_id}`);
    console.log(`  Institute Name: ${course?.institute_name}`);
    console.log(`  Annual Seats: ${course?.annual_seats}`);
    console.log(`  Annual Completions: ${course?.annual_completions}`);
    console.log(`  Coverage Level: ${cs.coverage_level}`);
    console.log(`  Hours: ${cs.hours}`);
    console.log(`  Mandatory: ${cs.mandatory}`);
  });

  console.log('\n--- 4. ALL COURSES IN SUPABASE DATABASE ---');
  courses.forEach(c => {
    const district = districts.find(d => d.id === c.district_id);
    console.log(`Course ID: ${c.id} | Course Name: ${c.course_name} | District: ${district?.name} (${c.district_id}) | Institute: ${c.institute_name} | Seats: ${c.annual_seats} | Completions: ${c.annual_completions}`);
  });

  // 5. Check job_postings and job_skills counts
  const { count: jobPostingsCount } = await supabase.from('job_postings').select('*', { count: 'exact', head: true });
  const { count: jobSkillsCount } = await supabase.from('job_skills').select('*', { count: 'exact', head: true });

  console.log('\n--- 5. BASELINE RECORD COUNTS ---');
  console.log(`job_postings count: ${jobPostingsCount}`);
  console.log(`job_skills count: ${jobSkillsCount}`);
}

verifyEvSupply();
