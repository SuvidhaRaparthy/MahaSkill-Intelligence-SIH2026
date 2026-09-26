const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://erfltqteyqmshbituvdv.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
});

async function fixCoursesDistrict() {
  console.log('Updating district_id for all courses in Supabase...');

  const { data, error } = await supabase
    .from('courses')
    .update({ district_id: '11111111-1111-4111-8111-111111111111' })
    .eq('id', 'd6666666-6666-4666-8666-666666666666')
    .select();

  if (error) {
    console.error('Update error:', error);
  } else {
    console.log('Updated Course d6666666 to Pune:', data);
  }
}

fixCoursesDistrict();
