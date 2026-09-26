import { createClient } from '@supabase/supabase-js';
import { 
  SEED_DISTRICTS, SEED_SECTORS, SEED_OCCUPATIONS, SEED_SKILLS, 
  SEED_COURSES, SEED_RECOMMENDATIONS, SEED_DATA_SOURCES, SEED_TIME_SERIES_METRICS,
  generateSyntheticJobPostings 
} from '../src/data/seedData.ts';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://erfltqteyqmshbituvdv.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
});

async function seedDatabase() {
  console.log('--- MahaSkill Intelligence Database Seeder ---');
  console.log('Connecting to:', supabaseUrl);

  const distIdMap = { 
    d1: '11111111-1111-4111-8111-111111111111', 
    d2: '22222222-2222-4222-8222-222222222222', 
    d3: '33333333-3333-4333-8333-333333333333' 
  };
  const secIdMap = { 
    s1: 'a1111111-1111-4111-8111-111111111111', 
    s2: 'a2222222-2222-4222-8222-222222222222' 
  };
  const occIdMap = { 
    o1: 'b1111111-1111-4111-8111-111111111111', 
    o2: 'b2222222-2222-4222-8222-222222222222', 
    o3: 'b3333333-3333-4333-8333-333333333333', 
    o4: 'b4444444-4444-4444-8444-444444444444', 
    o5: 'b5555555-5555-4555-8555-555555555555' 
  };
  const skillIdMap = {
    k1: 'c1111111-1111-4111-8111-111111111111',
    k2: 'c2222222-2222-4222-8222-222222222222',
    k3: 'c3333333-3333-4333-8333-333333333333',
    k4: 'c4444444-4444-4444-8444-444444444444',
    k5: 'c5555555-5555-4555-8555-555555555555',
    k6: 'c6666666-6666-4666-8666-666666666666',
    k7: 'c7777777-7777-4777-8777-777777777777',
    k8: 'c8888888-8888-4888-8888-888888888888'
  };
  const courseIdMap = { 
    c1: 'd4444444-4444-4444-8444-444444444444', 
    c2: 'd5555555-5555-4555-8555-555555555555', 
    c3: 'd6666666-6666-4666-8666-666666666666' 
  };

  // 1. Districts
  console.log('Seeding districts (Pune, Nashik, Nagpur)...');
  const { error: errDist } = await supabase.from('districts').upsert(
    SEED_DISTRICTS.map(d => ({
      id: distIdMap[d.id] || d.id,
      name: d.name,
      state: d.state,
      latitude: d.latitude,
      longitude: d.longitude
    })),
    { onConflict: 'name' }
  );
  if (errDist) console.error('Districts error:', errDist.message);

  // 2. Sectors
  console.log('Seeding sectors (Information Technology, Automotive and EV)...');
  const { error: errSec } = await supabase.from('sectors').upsert(
    SEED_SECTORS.map(s => ({
      id: secIdMap[s.id] || s.id,
      name: s.name,
      description: s.description
    })),
    { onConflict: 'name' }
  );
  if (errSec) console.error('Sectors error:', errSec.message);

  // 3. Occupations
  console.log('Seeding occupations...');
  const { error: errOcc } = await supabase.from('occupations').upsert(
    SEED_OCCUPATIONS.map(o => ({
      id: occIdMap[o.id] || o.id,
      title: o.title,
      nco_code: o.nco_code,
      nco_family: o.nco_family,
      sector_id: secIdMap[o.sector_id] || o.sector_id
    }))
  );
  if (errOcc) console.error('Occupations error:', errOcc.message);

  // 4. Skills
  console.log('Seeding skills...');
  const { error: errSk } = await supabase.from('skills').upsert(
    SEED_SKILLS.map(k => ({
      id: skillIdMap[k.id] || k.id,
      canonical_name: k.canonical_name,
      category: k.category,
      description: k.description,
      taxonomy_status: k.taxonomy_status,
      qualification_code: k.qualification_code
    })),
    { onConflict: 'canonical_name' }
  );
  if (errSk) console.error('Skills error:', errSk.message);

  // 5. Skill Aliases
  console.log('Seeding skill aliases...');
  await supabase.from('skill_aliases').upsert([
    { skill_id: skillIdMap.k1, alias: 'EV Battery Health Check' },
    { skill_id: skillIdMap.k1, alias: 'Battery Pack Testing' },
    { skill_id: skillIdMap.k4, alias: 'ReactJS' },
    { skill_id: skillIdMap.k4, alias: 'React Developer' },
    { skill_id: skillIdMap.k5, alias: 'TS' }
  ], { onConflict: 'alias' });

  // 6. Qualifications
  console.log('Seeding qualifications...');
  const { error: errQual } = await supabase.from('qualifications').upsert([
    {
      id: 'f1111111-1111-4111-8111-111111111111',
      qualification_name: 'Certificate in Electric Vehicle Maintenance',
      qualification_code: 'ELE/Q6001',
      nsqf_level: 4,
      sector_id: secIdMap.s2
    },
    {
      id: 'f2222222-2222-4222-8222-222222222222',
      qualification_name: 'Diploma in Web & Cloud Application Engineering',
      qualification_code: 'SSC/Q0501',
      nsqf_level: 5,
      sector_id: secIdMap.s1
    }
  ], { onConflict: 'qualification_code' });
  if (errQual) console.error('Qualifications error:', errQual.message);

  // 7. Courses
  console.log('Seeding courses...');
  const { error: errCourse } = await supabase.from('courses').upsert(
    SEED_COURSES.map(c => ({
      id: courseIdMap[c.id] || c.id,
      course_name: c.course_name,
      district_id: distIdMap[c.district_id] || c.district_id,
      institute_name: c.institute_name,
      annual_seats: c.annual_seats,
      annual_completions: c.annual_completions,
      active: c.active,
      source_name: c.source_name,
      is_synthetic: c.is_synthetic
    }))
  );
  if (errCourse) console.error('Courses error:', errCourse.message);

  // 7b. Course Skills (Junction Table)
  console.log('Seeding course_skills junction records...');
  await supabase.from('course_skills').upsert([
    { id: 'e1111111-4444-4444-8444-111111111111', course_id: courseIdMap.c1, skill_id: skillIdMap.k1, coverage_level: 'HIGH', hours: 120, mandatory: true },
    { id: 'e2222222-4444-4444-8444-222222222222', course_id: courseIdMap.c1, skill_id: skillIdMap.k2, coverage_level: 'MEDIUM', hours: 60, mandatory: true },
    { id: 'e3333333-5555-4555-8555-333333333333', course_id: courseIdMap.c2, skill_id: skillIdMap.k3, coverage_level: 'HIGH', hours: 90, mandatory: true },
    { id: 'e4444444-6666-4666-8666-444444444444', course_id: courseIdMap.c3, skill_id: skillIdMap.k8, coverage_level: 'HIGH', hours: 200, mandatory: true }
  ]);

  // 8. Employers
  console.log('Seeding employers...');
  const { error: errEmp } = await supabase.from('employers').upsert([
    { id: 'e1111111-1111-4111-8111-111111111111', name: 'Tata Motors EV Systems', sector_id: secIdMap.s2, district_id: distIdMap.d1, organization_type: 'LARGE_ENTERPRISE' },
    { id: 'e2222222-2222-4222-8222-222222222222', name: 'Mahindra Electric Mobility', sector_id: secIdMap.s2, district_id: distIdMap.d1, organization_type: 'LARGE_ENTERPRISE' },
    { id: 'e3333333-3333-4333-8333-333333333333', name: 'Bosch Automotive Components', sector_id: secIdMap.s2, district_id: distIdMap.d2, organization_type: 'MULTINATIONAL' },
    { id: 'e4444444-4444-4444-8444-444444444444', name: 'Persistent Systems', sector_id: secIdMap.s1, district_id: distIdMap.d1, organization_type: 'ENTERPRISE' },
    { id: 'e5555555-5555-4555-8555-555555555555', name: 'InfoCepts Tech', sector_id: secIdMap.s1, district_id: distIdMap.d3, organization_type: 'ENTERPRISE' }
  ]);
  if (errEmp) console.error('Employers error:', errEmp.message);

  // 8b. Employer Signals & Validations
  console.log('Seeding employer signals and validations...');
  const { error: errEs } = await supabase.from('employer_signals').upsert([
    { id: '11111111-7777-4111-8111-111111111111', employer_id: 'e1111111-1111-4111-8111-111111111111', skill_id: skillIdMap.k1, district_id: distIdMap.d1, sector_id: secIdMap.s2, required_proficiency: 'advanced', expected_hires: 45, comments: 'High urgency for EV battery diagnostics engineers in Pune plant.' },
    { id: '22222222-7777-4222-8222-222222222222', employer_id: 'e2222222-2222-4222-8222-222222222222', skill_id: skillIdMap.k1, district_id: distIdMap.d1, sector_id: secIdMap.s2, required_proficiency: 'intermediate', expected_hires: 35, comments: 'Expanding EV assembly line hiring.' },
    { id: '33333333-7777-4333-8333-333333333333', employer_id: 'e4444444-4444-4444-8444-444444444444', skill_id: skillIdMap.k4, district_id: distIdMap.d1, sector_id: secIdMap.s1, required_proficiency: 'intermediate', expected_hires: 120, comments: 'Frontend web application hiring.' }
  ]);
  if (errEs) console.error('Employer signals error:', errEs.message);

  // 8c. Trainers & Equipment
  console.log('Seeding trainers and lab equipment inventory...');
  const { error: errTr } = await supabase.from('trainers').upsert([
    { id: '11111111-8888-4111-8111-111111111111', district_id: distIdMap.d1, skill_id: skillIdMap.k1, trainer_count: 4, certified_count: 3, is_synthetic: true },
    { id: '22222222-8888-4222-8222-222222222222', district_id: distIdMap.d2, skill_id: skillIdMap.k3, trainer_count: 5, certified_count: 5, is_synthetic: true },
    { id: '33333333-8888-4333-8333-333333333333', district_id: distIdMap.d3, skill_id: skillIdMap.k3, trainer_count: 3, certified_count: 3, is_synthetic: true }
  ]);
  if (errTr) console.error('Trainers error:', errTr.message);

  const { error: errEq } = await supabase.from('equipment').upsert([
    { id: '11111111-9999-4111-8111-111111111111', district_id: distIdMap.d1, sector_id: secIdMap.s2, equipment_name: 'EV Battery Diagnostic Bench', available_quantity: 7, required_per_batch: 1, is_synthetic: true },
    { id: '22222222-9999-4222-8222-222222222222', district_id: distIdMap.d2, sector_id: secIdMap.s2, equipment_name: 'CAN Bus Oscilloscope Kit', available_quantity: 10, required_per_batch: 1, is_synthetic: true },
    { id: '33333333-9999-4333-8333-333333333333', district_id: distIdMap.d3, sector_id: secIdMap.s2, equipment_name: 'CAN Bus Oscilloscope Kit', available_quantity: 5, required_per_batch: 1, is_synthetic: true }
  ]);
  if (errEq) console.error('Equipment error:', errEq.message);

  // 8d. Time Series Metrics
  console.log('Seeding quarterly time series metrics for historical growth calculations...');
  const { error: errTs } = await supabase.from('time_series_metrics').upsert(
    SEED_TIME_SERIES_METRICS.map(ts => ({
      id: ts.id,
      district_id: distIdMap[ts.district_id] || ts.district_id,
      sector_id: secIdMap[ts.sector_id] || ts.sector_id,
      skill_id: skillIdMap[ts.skill_id] || ts.skill_id,
      period: ts.period,
      metric_name: ts.metric_name,
      metric_value: ts.metric_value
    }))
  );
  if (errTs) console.error('Time series error:', errTs.message);

  // 9. 300 Synthetic Job Postings & Linked Job Skills
  console.log('Clearing old synthetic job postings and job_skills...');
  await supabase.from('job_skills').delete().gte('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('job_postings').delete().gte('id', '00000000-0000-0000-0000-000000000000');

  console.log('Seeding 300 synthetic job postings and linking job_skills...');
  const syntheticPostings = generateSyntheticJobPostings();

  for (let i = 0; i < syntheticPostings.length; i += 50) {
    const chunk = syntheticPostings.slice(i, i + 50).map(jp => ({
      external_reference: jp.external_reference,
      title: jp.title,
      company: jp.company,
      district_id: distIdMap[jp.district_id] || jp.district_id,
      sector_id: secIdMap[jp.sector_id] || jp.sector_id,
      description: jp.description,
      experience_min: jp.experience_min,
      experience_max: jp.experience_max,
      seniority: jp.seniority,
      posted_date: jp.posted_date,
      source_name: jp.source_name,
      is_synthetic: true
    }));

    const { data: insertedPostings, error: errJp } = await supabase
      .from('job_postings')
      .insert(chunk)
      .select('id, title, description');

    if (errJp) {
      console.error(`Job postings chunk ${i} error:`, errJp.message);
    } else if (insertedPostings && insertedPostings.length > 0) {
      // Create job_skills junction records linking each inserted posting to canonical skill
      const jobSkillsBatch = [];
      insertedPostings.forEach((post, idx) => {
        const original = syntheticPostings[i + idx];
        const targetSkillId = skillIdMap[original?.skill_id] || original?.skill_id;
        if (targetSkillId) {
          jobSkillsBatch.push({
            job_id: post.id,
            skill_id: targetSkillId,
            raw_skill_text: post.title,
            proficiency: 'required',
            extraction_confidence: 90.00
          });
          if (post.title.includes('TypeScript') && targetSkillId !== skillIdMap.k5) {
            jobSkillsBatch.push({
              job_id: post.id,
              skill_id: skillIdMap.k5,
              raw_skill_text: 'TypeScript',
              proficiency: 'required',
              extraction_confidence: 85.00
            });
          }
        }
      });

      if (jobSkillsBatch.length > 0) {
        const { error: errJs } = await supabase.from('job_skills').insert(jobSkillsBatch);
        if (errJs) console.error(`Job skills chunk ${i} error:`, errJs.message);
      }
    }
  }

  // 10. Recommendations
  console.log('Seeding priority recommendations...');
  const { error: errRec } = await supabase.from('recommendations').upsert([
    {
      id: 'f3333333-3333-4333-8333-333333333333',
      district_id: distIdMap.d1,
      sector_id: secIdMap.s2,
      skill_id: skillIdMap.k1,
      course_id: courseIdMap.c1,
      recommendation_type: 'ADD_SKILL',
      priority: 'CRITICAL',
      gap_score: 55,
      confidence: 82,
      status: 'PENDING',
      summary: 'Add EV Battery Diagnostics module to ITI Pune curriculum due to 154% surging employer hiring demand.'
    },
    {
      id: 'f4444444-4444-4444-8444-444444444444',
      district_id: distIdMap.d3,
      sector_id: secIdMap.s2,
      skill_id: skillIdMap.k3,
      recommendation_type: 'TRAINER_GAP',
      priority: 'HIGH',
      gap_score: 40,
      confidence: 78,
      status: 'PENDING',
      summary: 'Address shortage of certified CAN Bus diagnostics trainers in Nagpur institutes.'
    },
    {
      id: 'f5555555-5555-4555-8555-555555555555',
      district_id: distIdMap.d1,
      sector_id: secIdMap.s1,
      skill_id: skillIdMap.k8,
      course_id: courseIdMap.c3,
      recommendation_type: 'POTENTIAL_OVERSUPPLY',
      priority: 'MEDIUM',
      gap_score: -48,
      confidence: 88,
      status: 'PENDING',
      summary: 'Potential oversupply in legacy PHP modules (500 seats vs 110 job postings). Reallocate seats to React & Cloud.'
    }
  ]);
  if (errRec) console.error('Recommendations error:', errRec.message);

  // 10b. Recommendation Evidence Records
  console.log('Seeding recommendation evidence records...');
  const { error: errRe } = await supabase.from('recommendation_evidence').upsert([
    {
      id: '11111111-aaaa-4111-8111-111111111111',
      recommendation_id: 'f3333333-3333-4333-8333-333333333333',
      source_type: 'JOB_POSTING_AGGREGATE',
      evidence_label: '28 Job Postings in Pune for EV Battery Diagnostics',
      contribution: 0.50,
      explanation: 'Verified job openings on National Career Service portal.'
    },
    {
      id: '22222222-aaaa-4222-8222-222222222222',
      recommendation_id: 'f3333333-3333-4333-8333-333333333333',
      source_type: 'EMPLOYER_SURVEY_SIGNAL',
      evidence_label: '8 Employers Validated Demand (Tata Motors EV, Mahindra Electric)',
      contribution: 0.30,
      explanation: '100% agreement consensus across Pune automotive OEMs.'
    }
  ]);
  if (errRe) console.error('Recommendation evidence error:', errRe.message);

  // 11. Data Sources
  console.log('Seeding data sources registry...');
  const { error: errDs } = await supabase.from('data_sources').upsert(
    SEED_DATA_SOURCES.map(ds => ({
      id: ds.id === 'ds1' ? 'f6666666-6666-4666-8666-666666666666' : (ds.id === 'ds2' ? 'f7777777-7777-4777-8777-777777777777' : (ds.id === 'ds3' ? 'f8888888-8888-4888-8888-888888888888' : 'f9999999-9999-4999-8999-999999999999')),
      source_name: ds.source_name,
      organization: ds.organization,
      source_type: ds.source_type,
      access_method: ds.access_method,
      status: ds.status,
      notes: ds.notes
    })),
    { onConflict: 'source_name' }
  );
  if (errDs) console.error('Data sources error:', errDs.message);

  console.log('\nâœ… Seeding complete!');
}

seedDatabase().catch(console.error);
