import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://erfltqteyqmshbituvdv.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
});

async function fixCoursesDistrict() {
  console.log('Fixing district_id for courses in Supabase...');

  // Course 1: Govt ITI Aundh Pune -> Pune (11111111-1111-4111-8111-111111111111)
  await supabase.from('courses').update({
    district_id: '11111111-1111-4111-8111-111111111111'
  }).eq('id', 'd4444444-4444-4444-8444-444444444444');

  // Course 2: Govt Polytechnic Nashik -> Nashik (22222222-2222-4222-8222-222222222222)
  await supabase.from('courses').update({
    district_id: '22222222-2222-4222-8222-222222222222'
  }).eq('id', 'd5555555-5555-4555-8555-555555555555');

  // Course 3: Pune Skill Training Centre -> Pune (11111111-1111-4111-8111-111111111111)
  await supabase.from('courses').update({
    district_id: '11111111-1111-4111-8111-111111111111'
  }).eq('id', 'd6666666-6666-4666-8666-466666666666');

  console.log('Courses district_id updated successfully.');
}

fixCoursesDistrict();
