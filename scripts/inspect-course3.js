const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://erfltqteyqmshbituvdv.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
});

async function inspectCourses() {
  const { data: courses } = await supabase.from('courses').select('*');
  console.log('--- ALL COURSES IN SUPABASE ---');
  courses.forEach(c => console.log(`ID: ${c.id} | Name: ${c.course_name} | District ID: ${c.district_id} | Institute: ${c.institute_name}`));
}

inspectCourses();
