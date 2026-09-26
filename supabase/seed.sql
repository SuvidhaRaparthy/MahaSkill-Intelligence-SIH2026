-- MahaSkill Intelligence - Demo Seed Dataset
-- File: supabase/seed.sql

-- 1. Districts (Pune, Nashik, Nagpur)
INSERT INTO districts (id, name, state, latitude, longitude) VALUES
('11111111-1111-4111-8111-111111111111', 'Pune', 'Maharashtra', 18.5204, 73.8567),
('22222222-2222-4222-8222-222222222222', 'Nashik', 'Maharashtra', 19.9975, 73.7898),
('33333333-3333-4333-8333-333333333333', 'Nagpur', 'Maharashtra', 21.1458, 79.0882)
ON CONFLICT (name) DO UPDATE SET state = EXCLUDED.state;

-- 2. Sectors (Information Technology, Automotive and EV)
INSERT INTO sectors (id, name, description) VALUES
('a1111111-1111-4111-8111-111111111111', 'Information Technology', 'Software development, cloud computing, artificial intelligence, and web technologies.'),
('a2222222-2222-4222-8222-222222222222', 'Automotive and EV', 'Electric vehicle manufacturing, battery management systems, vehicle diagnostics, and powertrain engineering.')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

-- 3. Occupations
INSERT INTO occupations (id, title, nco_code, nco_family, sector_id) VALUES
('b1111111-1111-4111-8111-111111111111', 'EV Battery Specialist', '2152.0100', 'Electrical Engineers', 'a2222222-2222-4222-8222-222222222222'),
('b2222222-2222-4222-8222-222222222222', 'Automotive Electronics Diagnostics Technician', '3113.0200', 'Electrical Engineering Technicians', 'a2222222-2222-4222-8222-222222222222'),
('b3333333-3333-4333-8333-333333333333', 'Frontend Software Developer', '2512.0100', 'Software Developers', 'a1111111-1111-4111-8111-111111111111'),
('b4444444-4444-4444-8444-444444444444', 'Cloud Infrastructure Engineer', '2522.0100', 'System Administrators', 'a1111111-1111-4111-8111-111111111111'),
('b5555555-5555-4555-8555-555555555555', 'AI & Machine Learning Engineer', '2511.0200', 'Systems Analysts', 'a1111111-1111-4111-8111-111111111111')
ON CONFLICT DO NOTHING;

-- 4. Skills
INSERT INTO skills (id, canonical_name, category, description, taxonomy_status, qualification_code) VALUES
('c1111111-1111-4111-8111-111111111111', 'EV Battery Diagnostics', 'Automotive Engineering', 'Testing, cell balancing, state of health estimation, and fault diagnostics in lithium-ion battery packs.', 'emerging', 'AUTO-EV-001'),
('c2222222-2222-4222-8222-222222222222', 'Battery Management Systems (BMS)', 'Automotive Engineering', 'Design and programming of BMS hardware and software for thermal and electrical regulation.', 'normalized', 'AUTO-EV-002'),
('c3333333-3333-4333-8333-333333333333', 'CAN Bus Diagnostics', 'Automotive Electronics', 'Vehicle network communication protocol inspection, frame parsing, and sensor troubleshooting.', 'official', 'AUTO-ELE-003'),
('c4444444-4444-4444-8444-444444444444', 'React.js', 'Software Development', 'Building interactive browser web applications using React hooks and component architecture.', 'official', 'IT-DEV-001'),
('c5555555-5555-4555-8555-555555555555', 'TypeScript', 'Software Development', 'Strongly-typed JavaScript superset application engineering.', 'normalized', 'IT-DEV-002'),
('c6666666-6666-4666-8666-666666666666', 'Generative AI & LLM Integration', 'Artificial Intelligence', 'Building API applications using Large Language Models, prompt engineering, and RAG pipelines.', 'emerging', 'IT-AI-001'),
('c7777777-7777-4777-8777-777777777777', 'Cloud Architecture (AWS/Azure)', 'Cloud Computing', 'Deployment, container management, and scalable cloud deployment.', 'official', 'IT-CLOUD-001'),
('c8888888-8888-4888-8888-888888888888', 'Legacy PHP Maintenance', 'Legacy Web', 'Server-side scripting with legacy PHP versions (v5.6/v7.0).', 'official', 'IT-LEGACY-001')
ON CONFLICT (canonical_name) DO UPDATE SET category = EXCLUDED.category;

-- 5. Skill Aliases
INSERT INTO skill_aliases (skill_id, alias) VALUES
('c1111111-1111-4111-8111-111111111111', 'EV Battery Health Check'),
('c1111111-1111-4111-8111-111111111111', 'Battery Pack Testing'),
('c4444444-4444-4444-8444-444444444444', 'ReactJS'),
('c4444444-4444-4444-8444-444444444444', 'React Developer'),
('c5555555-5555-4555-8555-555555555555', 'TS')
ON CONFLICT (alias) DO NOTHING;

-- 6. Employers
INSERT INTO employers (id, name, sector_id, district_id, organization_type) VALUES
('e1111111-1111-4111-8111-111111111111', 'Tata Motors EV Systems', 'a2222222-2222-4222-8222-222222222222', '11111111-1111-4111-8111-111111111111', 'LARGE_ENTERPRISE'),
('e2222222-2222-4222-8222-222222222222', 'Mahindra Electric Mobility', 'a2222222-2222-4222-8222-222222222222', '11111111-1111-4111-8111-111111111111', 'LARGE_ENTERPRISE'),
('e3333333-3333-4333-8333-333333333333', 'Bosch Automotive Components', 'a2222222-2222-4222-8222-222222222222', '22222222-2222-4222-8222-222222222222', 'MULTINATIONAL'),
('e4444444-4444-4444-8444-444444444444', 'Persistent Systems', 'a1111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', 'ENTERPRISE'),
('e5555555-5555-4555-8555-555555555555', 'InfoCepts Tech', 'a1111111-1111-4111-8111-111111111111', '33333333-3333-4333-8333-333333333333', 'ENTERPRISE')
ON CONFLICT DO NOTHING;

-- 7. Qualifications
INSERT INTO qualifications (id, qualification_name, qualification_code, nsqf_level, sector_id) VALUES
('f1111111-1111-4111-8111-111111111111', 'Certificate in Electric Vehicle Maintenance', 'ELE/Q6001', 4, 'a2222222-2222-4222-8222-222222222222'),
('f2222222-2222-4222-8222-222222222222', 'Diploma in Web & Cloud Application Engineering', 'SSC/Q0501', 5, 'a1111111-1111-4111-8111-111111111111')
ON CONFLICT DO NOTHING;

-- 8. Courses
INSERT INTO courses (id, course_name, qualification_id, district_id, institute_name, annual_seats, annual_completions, active, is_synthetic) VALUES
('d4444444-4444-4444-8444-444444444444', 'Government ITI EV Service Technician Course', 'f1111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', 'Government ITI Aundh Pune', 120, 105, true, true),
('d5555555-5555-4555-8555-555555555555', 'Automotive Electrical Systems Certification', 'f1111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 'Government Polytechnic Nashik', 90, 82, true, true),
('d6666666-6666-4666-8666-666666666666', 'Web Software Development Diploma (PHP & Basic Web)', 'f2222222-2222-4222-8222-222222222222', '11111111-1111-4111-8111-111111111111', 'Pune Skill Training Institute', 500, 470, true, true)
ON CONFLICT DO NOTHING;

-- 8b. Course Skills (Junction Table)
INSERT INTO course_skills (id, course_id, skill_id, coverage_level, hours, mandatory) VALUES
('e1111111-4444-4444-8444-111111111111', 'd4444444-4444-4444-8444-444444444444', 'c1111111-1111-4111-8111-111111111111', 'HIGH', 120, true),
('e2222222-4444-4444-8444-222222222222', 'd4444444-4444-4444-8444-444444444444', 'c2222222-2222-4222-8222-222222222222', 'MEDIUM', 60, true),
('e3333333-5555-4555-8555-333333333333', 'd5555555-5555-4555-8555-555555555555', 'c3333333-3333-4333-8333-333333333333', 'HIGH', 90, true),
('e4444444-6666-4666-8666-444444444444', 'd6666666-6666-4666-8666-666666666666', 'c8888888-8888-4888-8888-888888888888', 'HIGH', 200, true)
ON CONFLICT DO NOTHING;

-- 8c. Employer Signals
INSERT INTO employer_signals (id, employer_id, skill_id, district_id, sector_id, required_proficiency, expected_hires, comments) VALUES
('g1111111-1111-4111-8111-111111111111', 'e1111111-1111-4111-8111-111111111111', 'c1111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', 'a2222222-2222-4222-8222-222222222222', 'advanced', 45, 'High urgency for EV battery diagnostics engineers in Pune plant.'),
('g2222222-2222-4222-8222-222222222222', 'e2222222-2222-4222-8222-222222222222', 'c1111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', 'a2222222-2222-4222-8222-222222222222', 'intermediate', 35, 'Expanding EV assembly line hiring.'),
('g3333333-3333-4333-8333-333333333333', 'e4444444-4444-4444-8444-444444444444', 'c4444444-4444-4444-8444-444444444444', '11111111-1111-4111-8111-111111111111', 'a1111111-1111-4111-8111-111111111111', 'intermediate', 120, 'Frontend web application hiring.')
ON CONFLICT DO NOTHING;

-- 8d. Trainers and Equipment
INSERT INTO trainers (id, district_id, skill_id, trainer_count, certified_count, is_synthetic) VALUES
('h1111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', 'c1111111-1111-4111-8111-111111111111', 4, 3, true),
('h2222222-2222-4222-8222-222222222222', '22222222-2222-4222-8222-222222222222', 'c3333333-3333-4333-8333-333333333333', 5, 5, true),
('h3333333-3333-4333-8333-333333333333', '33333333-3333-4333-8333-333333333333', 'c3333333-3333-4333-8333-333333333333', 3, 3, true)
ON CONFLICT DO NOTHING;

INSERT INTO equipment (id, district_id, sector_id, equipment_name, available_quantity, required_per_batch, is_synthetic) VALUES
('i1111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', 'a2222222-2222-4222-8222-222222222222', 'EV Battery Diagnostic Bench', 7, 1, true),
('i2222222-2222-4222-8222-222222222222', '22222222-2222-4222-8222-222222222222', 'a2222222-2222-4222-8222-222222222222', 'CAN Bus Oscilloscope Kit', 10, 1, true),
('i3333333-3333-4333-8333-333333333333', '33333333-3333-4333-8333-333333333333', 'a2222222-2222-4222-8222-222222222222', 'CAN Bus Oscilloscope Kit', 5, 1, true)
ON CONFLICT DO NOTHING;

-- 8e. Employer Validations
INSERT INTO employer_validations (id, employer_id, skill_id, recommendation_id, validation, comments) VALUES
('ev111111-1111-4111-8111-111111111111', 'e1111111-1111-4111-8111-111111111111', 'c1111111-1111-4111-8111-111111111111', 'f3333333-3333-4333-8333-333333333333', 'CONFIRM', 'Tata Motors confirms 100% agreement with ITI Pune EV module addition.'),
('ev222222-2222-4222-8222-222222222222', 'e2222222-2222-4222-8222-222222222222', 'c1111111-1111-4111-8111-111111111111', 'f3333333-3333-4333-8333-333333333333', 'CONFIRM', 'Mahindra Electric confirms urgent need for EV battery technicians.'),
('ev333333-3333-4333-8333-333333333333', 'e4444444-4444-4444-8444-444444444444', 'c8888888-8888-4888-8888-888888888888', 'f5555555-5555-4555-8555-555555555555', 'CONFIRM', 'Persistent Systems confirms reallocation from Legacy PHP to React/Cloud.')
ON CONFLICT DO NOTHING;

-- 9. Recommendations (Priority Actions for Action Center)
INSERT INTO recommendations (id, district_id, sector_id, skill_id, course_id, recommendation_type, priority, gap_score, confidence, status, summary) VALUES
('f3333333-3333-4333-8333-333333333333', '11111111-1111-4111-8111-111111111111', 'a2222222-2222-4222-8222-222222222222', 'c1111111-1111-4111-8111-111111111111', 'd4444444-4444-4444-8444-444444444444', 'ADD_SKILL', 'CRITICAL', 55.00, 82.00, 'PENDING', 'Add EV Battery Diagnostics module to ITI Pune curriculum due to 154% surging employer hiring demand.'),
('f4444444-4444-4444-8444-444444444444', '33333333-3333-4333-8333-333333333333', 'a2222222-2222-4222-8222-222222222222', 'c3333333-3333-4333-8333-333333333333', NULL, 'TRAINER_GAP', 'HIGH', 40.00, 78.00, 'PENDING', 'Address shortage of certified CAN Bus diagnostics trainers in Nagpur institutes.'),
('f5555555-5555-4555-8555-555555555555', '11111111-1111-4111-8111-111111111111', 'a1111111-1111-4111-8111-111111111111', 'c8888888-8888-4888-8888-888888888888', 'd6666666-6666-4666-8666-666666666666', 'POTENTIAL_OVERSUPPLY', 'MEDIUM', -48.00, 88.00, 'PENDING', 'Potential oversupply in legacy PHP modules (500 seats vs 110 job postings). Reallocate seats to React & Cloud.')
ON CONFLICT DO NOTHING;

-- 9b. Recommendation Evidence
INSERT INTO recommendation_evidence (id, recommendation_id, source_type, evidence_label, contribution, explanation) VALUES
('j1111111-1111-4111-8111-111111111111', 'f3333333-3333-4333-8333-333333333333', 'JOB_POSTING_AGGREGATE', '28 Job Postings in Pune for EV Battery Diagnostics', 0.50, 'Verified job openings on National Career Service portal.'),
('j2222222-2222-4222-8222-222222222222', 'f3333333-3333-4333-8333-333333333333', 'EMPLOYER_SURVEY_SIGNAL', '8 Employers Validated Demand (Tata Motors EV, Mahindra Electric)', 0.30, '100% agreement consensus across Pune automotive OEMs.')
ON CONFLICT DO NOTHING;

-- 10. Data Sources Registry
INSERT INTO data_sources (id, source_name, organization, source_type, access_method, last_retrieved, status, notes) VALUES
('f6666666-6666-4666-8666-666666666666', 'National Career Service', 'Ministry of Labour & Employment, GoI', 'JOB_POSTINGS', 'API / CSV Import', NOW(), 'ACTIVE', 'Primary source for official employer job opening signals.'),
('f7777777-7777-4777-8777-777777777777', 'MahaSwayam Portal', 'Government of Maharashtra', 'SKILL_SCHEMES', 'CSV Import', NOW(), 'ACTIVE', 'State level training capacity and candidate enrolment records.'),
('f8888888-8888-4888-8888-888888888888', 'NCVET Qualifications Register', 'MSDE, GoI', 'QUALIFICATIONS', 'Reference Registry', NOW(), 'ACTIVE', 'National Occupational Standards and NSQF alignment taxonomy.'),
('f9999999-9999-4999-8999-999999999999', 'MoSPI PLFS Reports', 'Ministry of Statistics & Programme Implementation', 'LABOUR_INDICATORS', 'Statistical Publication', NOW(), 'ACTIVE', 'Macroeconomic Labour Force Participation and Unemployment metrics.')
ON CONFLICT (source_name) DO NOTHING;
