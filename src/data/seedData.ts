// MahaSkill Intelligence - Comprehensive TypeScript Seed Store & Fallback Data Layer
import type { 
  District, Sector, Occupation, Skill, JobPosting, Course, 
  Recommendation, DataSourceRegistryItem, DistrictSkillGapSummary,
  CourseSkill, EmployerSignal, EmployerValidationRecord, TrainerRecord, EquipmentRecord, TimeSeriesMetric
} from '../types/database';

export const SEED_DISTRICTS: District[] = [
  { id: '11111111-1111-4111-8111-111111111111', name: 'Pune', state: 'Maharashtra', latitude: 18.5204, longitude: 73.8567 },
  { id: '22222222-2222-4222-8222-222222222222', name: 'Nashik', state: 'Maharashtra', latitude: 19.9975, longitude: 73.7898 },
  { id: '33333333-3333-4333-8333-333333333333', name: 'Nagpur', state: 'Maharashtra', latitude: 21.1458, longitude: 79.0882 }
];

export const SEED_SECTORS: Sector[] = [
  { id: 'a1111111-1111-4111-8111-111111111111', name: 'Information Technology', description: 'Software engineering, cloud infrastructure, web architectures, AI & ML.' },
  { id: 'a2222222-2222-4222-8222-222222222222', name: 'Automotive and EV', description: 'EV drivetrain, battery technology, CAN Bus diagnostics, power electronics.' }
];

export const SEED_OCCUPATIONS: Occupation[] = [
  { id: 'b1111111-1111-4111-8111-111111111111', title: 'EV Battery Diagnostics Specialist', nco_code: '2152.0100', nco_family: 'Electrical Engineers', sector_id: 'a2222222-2222-4222-8222-222222222222' },
  { id: 'b2222222-2222-4222-8222-222222222222', title: 'Automotive Electronics Technician', nco_code: '3113.0200', nco_family: 'Electrical Technicians', sector_id: 'a2222222-2222-4222-8222-222222222222' },
  { id: 'b3333333-3333-4333-8333-333333333333', title: 'Frontend Software Developer', nco_code: '2512.0100', nco_family: 'Software Developers', sector_id: 'a1111111-1111-4111-8111-111111111111' },
  { id: 'b4444444-4444-4444-8444-444444444444', title: 'Cloud Systems Engineer', nco_code: '2522.0100', nco_family: 'Systems Administrators', sector_id: 'a1111111-1111-4111-8111-111111111111' },
  { id: 'b5555555-5555-4555-8555-555555555555', title: 'AI Applications Engineer', nco_code: '2511.0200', nco_family: 'Systems Analysts', sector_id: 'a1111111-1111-4111-8111-111111111111' }
];

export const SEED_SKILLS: Skill[] = [
  { id: 'c1111111-1111-4111-8111-111111111111', canonical_name: 'EV Battery Diagnostics', category: 'Automotive Engineering', description: 'State-of-health diagnostics, thermal management and fault code analysis for lithium-ion battery modules.', taxonomy_status: 'emerging', qualification_code: 'AUTO-EV-001', created_at: '2026-01-10' },
  { id: 'c2222222-2222-4222-8222-222222222222', canonical_name: 'Battery Management Systems (BMS)', category: 'Automotive Engineering', description: 'Cell monitoring, SOC calculation, and thermal throttling controllers.', taxonomy_status: 'normalized', qualification_code: 'AUTO-EV-002', created_at: '2026-01-15' },
  { id: 'c3333333-3333-4333-8333-333333333333', canonical_name: 'CAN Bus Diagnostics', category: 'Automotive Electronics', description: 'Controller Area Network frame decoding and sensor diagnostics.', taxonomy_status: 'official', qualification_code: 'AUTO-ELE-003', created_at: '2025-11-20' },
  { id: 'c4444444-4444-4444-8444-444444444444', canonical_name: 'React.js', category: 'Software Development', description: 'Modern single page frontend engineering using component structures and hooks.', taxonomy_status: 'official', qualification_code: 'IT-DEV-001', created_at: '2025-08-01' },
  { id: 'c5555555-5555-4555-8555-555555555555', canonical_name: 'TypeScript', category: 'Software Development', description: 'Typed JavaScript programming for large scale enterprise web applications.', taxonomy_status: 'normalized', qualification_code: 'IT-DEV-002', created_at: '2025-09-12' },
  { id: 'c6666666-6666-4666-8666-666666666666', canonical_name: 'Generative AI & LLM Integration', category: 'Artificial Intelligence', description: 'LLM APIs, retrieval-augmented generation (RAG) and prompt design.', taxonomy_status: 'emerging', qualification_code: 'IT-AI-001', created_at: '2026-02-01' },
  { id: 'c7777777-7777-4777-8777-777777777777', canonical_name: 'Cloud Architecture (AWS/Azure)', category: 'Cloud Computing', description: 'DevOps, containerization, microservices and serverless infrastructure.', taxonomy_status: 'official', qualification_code: 'IT-CLOUD-001', created_at: '2025-07-15' },
  { id: 'c8888888-8888-4888-8888-888888888888', canonical_name: 'Legacy PHP Maintenance', category: 'Legacy Web', description: 'Legacy server scripting on PHP 5.x/7.x applications.', taxonomy_status: 'official', qualification_code: 'IT-LEGACY-001', created_at: '2024-05-10' }
];

export const SEED_SKILL_ALIASES = [
  { id: 'sa1', skill_id: 'c1111111-1111-4111-8111-111111111111', alias: 'EV Battery Health Check' },
  { id: 'sa2', skill_id: 'c1111111-1111-4111-8111-111111111111', alias: 'Battery Pack Testing' },
  { id: 'sa3', skill_id: 'c4444444-4444-4444-8444-444444444444', alias: 'ReactJS' },
  { id: 'sa4', skill_id: 'c4444444-4444-4444-8444-444444444444', alias: 'React JS' },
  { id: 'sa5', skill_id: 'c4444444-4444-4444-8444-444444444444', alias: 'React Developer' },
  { id: 'sa6', skill_id: 'c5555555-5555-4555-8555-555555555555', alias: 'TS' },
  { id: 'sa7', skill_id: 'c2222222-2222-4222-8222-222222222222', alias: 'BMS Calibration' },
  { id: 'sa8', skill_id: 'c6666666-6666-4666-8666-666666666666', alias: 'GenAI RAG' }
];

export const SEED_COURSES: Course[] = [
  { id: 'd4444444-4444-4444-8444-444444444444', course_name: 'Government ITI EV Technician Certification', district_id: '11111111-1111-4111-8111-111111111111', institute_name: 'Government ITI Aundh Pune', annual_seats: 120, annual_completions: 105, active: true, source_name: 'Skill India Digital Hub', is_synthetic: true },
  { id: 'd5555555-5555-4555-8555-555555555555', course_name: 'Automotive Electrical Systems Certification', district_id: '22222222-2222-4222-8222-222222222222', institute_name: 'Government Polytechnic Nashik', annual_seats: 90, annual_completions: 82, active: true, source_name: 'Skill India Digital Hub', is_synthetic: true },
  { id: 'd6666666-6666-4666-8666-666666666666', course_name: 'Web Software Development Diploma (Legacy PHP)', district_id: '11111111-1111-4111-8111-111111111111', institute_name: 'Pune Skill Training Centre', annual_seats: 500, annual_completions: 470, active: true, source_name: 'MahaSwayam Portal', is_synthetic: true }
];

export const SEED_COURSE_SKILLS: CourseSkill[] = [
  { id: 'e1111111-4444-4444-8444-111111111111', course_id: 'd4444444-4444-4444-8444-444444444444', skill_id: 'c1111111-1111-4111-8111-111111111111', coverage_level: 'HIGH', hours: 120, mandatory: true },
  { id: 'e2222222-4444-4444-8444-222222222222', course_id: 'd4444444-4444-4444-8444-444444444444', skill_id: 'c2222222-2222-4222-8222-222222222222', coverage_level: 'MEDIUM', hours: 60, mandatory: true },
  { id: 'e3333333-5555-4555-8555-333333333333', course_id: 'd5555555-5555-4555-8555-555555555555', skill_id: 'c3333333-3333-4333-8333-333333333333', coverage_level: 'HIGH', hours: 90, mandatory: true },
  { id: 'e4444444-6666-4666-8666-444444444444', course_id: 'd6666666-6666-4666-8666-666666666666', skill_id: 'c8888888-8888-4888-8888-888888888888', coverage_level: 'HIGH', hours: 200, mandatory: true }
];

export const SEED_EMPLOYERS = [
  { id: 'e1111111-1111-4111-8111-111111111111', name: 'Tata Motors EV Systems', sector_id: 'a2222222-2222-4222-8222-222222222222', district_id: '11111111-1111-4111-8111-111111111111', organization_type: 'LARGE_ENTERPRISE' },
  { id: 'e2222222-2222-4222-8222-222222222222', name: 'Mahindra Electric Mobility', sector_id: 'a2222222-2222-4222-8222-222222222222', district_id: '11111111-1111-4111-8111-111111111111', organization_type: 'LARGE_ENTERPRISE' },
  { id: 'e3333333-3333-4333-8333-333333333333', name: 'Bosch Automotive Components', sector_id: 'a2222222-2222-4222-8222-222222222222', district_id: '22222222-2222-4222-8222-222222222222', organization_type: 'MULTINATIONAL' },
  { id: 'e4444444-4444-4444-8444-444444444444', name: 'Persistent Systems', sector_id: 'a1111111-1111-4111-8111-111111111111', district_id: '11111111-1111-4111-8111-111111111111', organization_type: 'ENTERPRISE' },
  { id: 'e5555555-5555-4555-8555-555555555555', name: 'InfoCepts Tech', sector_id: 'a1111111-1111-4111-8111-111111111111', district_id: '33333333-3333-4333-8333-333333333333', organization_type: 'ENTERPRISE' }
];

export const SEED_EMPLOYER_SIGNALS: EmployerSignal[] = [
  { id: 'g1111111-1111-4111-8111-111111111111', employer_id: 'e1111111-1111-4111-8111-111111111111', employer_name: 'Tata Motors EV Systems', skill_id: 'c1111111-1111-4111-8111-111111111111', skill_name: 'EV Battery Diagnostics', district_id: '11111111-1111-4111-8111-111111111111', sector_id: 'a2222222-2222-4222-8222-222222222222', required_proficiency: 'advanced', expected_hires: 45, signal_date: '2026-02-15', comments: 'High urgency for EV battery diagnostics engineers in Pune plant.', confidence: 92 },
  { id: 'g2222222-2222-4222-8222-222222222222', employer_id: 'e2222222-2222-4222-8222-222222222222', employer_name: 'Mahindra Electric Mobility', skill_id: 'c1111111-1111-4111-8111-111111111111', skill_name: 'EV Battery Diagnostics', district_id: '11111111-1111-4111-8111-111111111111', sector_id: 'a2222222-2222-4222-8222-222222222222', required_proficiency: 'intermediate', expected_hires: 35, signal_date: '2026-02-20', comments: 'Expanding EV assembly line hiring.', confidence: 88 },
  { id: 'g3333333-3333-4333-8333-333333333333', employer_id: 'e4444444-4444-4444-8444-444444444444', employer_name: 'Persistent Systems', skill_id: 'c4444444-4444-4444-8444-444444444444', skill_name: 'React.js', district_id: '11111111-1111-4111-8111-111111111111', sector_id: 'a1111111-1111-4111-8111-111111111111', required_proficiency: 'intermediate', expected_hires: 120, signal_date: '2026-01-25', comments: 'Frontend web application hiring.', confidence: 95 },
  { id: 'g4444444-4444-4444-8444-444444444444', employer_id: 'e3333333-3333-4333-8333-333333333333', employer_name: 'Bosch Automotive Components', skill_id: 'c3333333-3333-4333-8333-333333333333', skill_name: 'CAN Bus Diagnostics', district_id: '22222222-2222-4222-8222-222222222222', sector_id: 'a2222222-2222-4222-8222-222222222222', required_proficiency: 'advanced', expected_hires: 25, signal_date: '2026-02-10', comments: 'CAN Bus diagnostics technician hiring in Nashik plant.', confidence: 85 },
  { id: 'g5555555-5555-4555-8555-555555555555', employer_id: 'e5555555-5555-4555-8555-555555555555', employer_name: 'InfoCepts Tech', skill_id: 'c7777777-7777-4777-8777-777777777777', skill_name: 'Cloud Architecture (AWS/Azure)', district_id: '33333333-3333-4333-8333-333333333333', sector_id: 'a1111111-1111-4111-8111-111111111111', required_proficiency: 'advanced', expected_hires: 60, signal_date: '2026-02-18', comments: 'Cloud migration team hiring in Nagpur center.', confidence: 90 }
];

export const SEED_EMPLOYER_VALIDATIONS: EmployerValidationRecord[] = [
  { id: 'ev1', employer_id: 'e1111111-1111-4111-8111-111111111111', skill_id: 'c1111111-1111-4111-8111-111111111111', recommendation_id: 'f3333333-3333-4333-8333-333333333333', validation: 'CONFIRM', comments: 'Tata Motors confirms 100% agreement with ITI Pune EV module addition.' },
  { id: 'ev2', employer_id: 'e2222222-2222-4222-8222-222222222222', skill_id: 'c1111111-1111-4111-8111-111111111111', recommendation_id: 'f3333333-3333-4333-8333-333333333333', validation: 'CONFIRM', comments: 'Mahindra Electric confirms urgent need for EV battery technicians.' },
  { id: 'ev3', employer_id: 'e4444444-4444-4444-8444-444444444444', skill_id: 'c8888888-8888-4888-8888-888888888888', recommendation_id: 'f5555555-5555-4555-8555-555555555555', validation: 'CONFIRM', comments: 'Persistent Systems confirms reallocation from Legacy PHP to React/Cloud.' }
];

export const SEED_TRAINERS: TrainerRecord[] = [
  { id: 'h1111111-1111-4111-8111-111111111111', district_id: '11111111-1111-4111-8111-111111111111', skill_id: 'c1111111-1111-4111-8111-111111111111', trainer_count: 4, certified_count: 3, is_synthetic: true },
  { id: 'h2222222-2222-4222-8222-222222222222', district_id: '22222222-2222-4222-8222-222222222222', skill_id: 'c3333333-3333-4333-8333-333333333333', trainer_count: 5, certified_count: 5, is_synthetic: true },
  { id: 'h3333333-3333-4333-8333-333333333333', district_id: '33333333-3333-4333-8333-333333333333', skill_id: 'c3333333-3333-4333-8333-333333333333', trainer_count: 3, certified_count: 3, is_synthetic: true }
];

export const SEED_EQUIPMENT: EquipmentRecord[] = [
  { id: 'i1111111-1111-4111-8111-111111111111', district_id: '11111111-1111-4111-8111-111111111111', sector_id: 'a2222222-2222-4222-8222-222222222222', equipment_name: 'EV Battery Diagnostic Bench', available_quantity: 7, required_per_batch: 1, is_synthetic: true },
  { id: 'i2222222-2222-4222-8222-222222222222', district_id: '22222222-2222-4222-8222-222222222222', sector_id: 'a2222222-2222-4222-8222-222222222222', equipment_name: 'CAN Bus Oscilloscope Kit', available_quantity: 10, required_per_batch: 1, is_synthetic: true },
  { id: 'i3333333-3333-4333-8333-333333333333', district_id: '33333333-3333-4333-8333-333333333333', sector_id: 'a2222222-2222-4222-8222-222222222222', equipment_name: 'CAN Bus Oscilloscope Kit', available_quantity: 5, required_per_batch: 1, is_synthetic: true }
];

export const SEED_RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'f3333333-3333-4333-8333-333333333333',
    district_id: '11111111-1111-4111-8111-111111111111',
    district_name: 'Pune',
    sector_id: 'a2222222-2222-4222-8222-222222222222',
    sector_name: 'Automotive and EV',
    skill_id: 'c1111111-1111-4111-8111-111111111111',
    skill_name: 'EV Battery Diagnostics',
    course_id: 'd4444444-4444-4444-8444-444444444444',
    course_name: 'Government ITI EV Technician Certification',
    recommendation_type: 'ADD_SKILL',
    priority: 'CRITICAL',
    gap_score: 55,
    confidence: 82,
    status: 'PENDING',
    summary: 'Add EV Battery Diagnostics module to ITI Pune curriculum due to 154% surging employer hiring demand (28 recent job postings across 8 employers).',
    created_at: '2026-03-01',
    evidence_count: 5
  },
  {
    id: 'f4444444-4444-4444-8444-444444444444',
    district_id: '33333333-3333-4333-8333-333333333333',
    district_name: 'Nagpur',
    sector_id: 'a2222222-2222-4222-8222-222222222222',
    sector_name: 'Automotive and EV',
    skill_id: 'c3333333-3333-4333-8333-333333333333',
    skill_name: 'CAN Bus Diagnostics',
    recommendation_type: 'TRAINER_GAP',
    priority: 'HIGH',
    gap_score: 40,
    confidence: 78,
    status: 'PENDING',
    summary: 'Address shortage of certified CAN Bus diagnostics trainers in Nagpur institutes (8 required vs 3 certified available).',
    created_at: '2026-03-02',
    evidence_count: 4
  },
  {
    id: 'f5555555-5555-4555-8555-555555555555',
    district_id: '11111111-1111-4111-8111-111111111111',
    district_name: 'Pune',
    sector_id: 'a1111111-1111-4111-8111-111111111111',
    sector_name: 'Information Technology',
    skill_id: 'c8888888-8888-4888-8888-888888888888',
    skill_name: 'Legacy PHP Maintenance',
    course_id: 'd6666666-6666-4666-8666-666666666666',
    course_name: 'Web Software Development Diploma (Legacy PHP)',
    recommendation_type: 'POTENTIAL_OVERSUPPLY',
    priority: 'MEDIUM',
    gap_score: -48,
    confidence: 88,
    status: 'PENDING',
    summary: 'Potential oversupply in legacy PHP training modules (500 seats vs 110 annual job postings). Recommend reallocating 150 seats to React & Cloud modules.',
    created_at: '2026-03-04',
    evidence_count: 6
  }
];

export const SEED_TIME_SERIES_METRICS: TimeSeriesMetric[] = [
  // EV Battery Diagnostics (Surging Growth: 11 -> 18 -> 28 => +154.5%)
  { id: '11111111-9999-4111-8111-111111111101', district_id: '11111111-1111-4111-8111-111111111111', sector_id: 'a2222222-2222-4222-8222-222222222222', skill_id: 'c1111111-1111-4111-8111-111111111111', period: '2025-Q3', metric_name: 'job_postings_count', metric_value: 11 },
  { id: '11111111-9999-4111-8111-111111111102', district_id: '11111111-1111-4111-8111-111111111111', sector_id: 'a2222222-2222-4222-8222-222222222222', skill_id: 'c1111111-1111-4111-8111-111111111111', period: '2025-Q4', metric_name: 'job_postings_count', metric_value: 18 },
  { id: '11111111-9999-4111-8111-111111111103', district_id: '11111111-1111-4111-8111-111111111111', sector_id: 'a2222222-2222-4222-8222-222222222222', skill_id: 'c1111111-1111-4111-8111-111111111111', period: '2026-Q1', metric_name: 'job_postings_count', metric_value: 28 },

  // Generative AI & LLM Integration (High Growth: 8 -> 12 -> 18 => +125%)
  { id: '11111111-9999-4111-8111-111111111104', district_id: '11111111-1111-4111-8111-111111111111', sector_id: 'a1111111-1111-4111-8111-111111111111', skill_id: 'c6666666-6666-4666-8666-666666666666', period: '2025-Q3', metric_name: 'job_postings_count', metric_value: 8 },
  { id: '11111111-9999-4111-8111-111111111105', district_id: '11111111-1111-4111-8111-111111111111', sector_id: 'a1111111-1111-4111-8111-111111111111', skill_id: 'c6666666-6666-4666-8666-666666666666', period: '2025-Q4', metric_name: 'job_postings_count', metric_value: 12 },
  { id: '11111111-9999-4111-8111-111111111106', district_id: '11111111-1111-4111-8111-111111111111', sector_id: 'a1111111-1111-4111-8111-111111111111', skill_id: 'c6666666-6666-4666-8666-666666666666', period: '2026-Q1', metric_name: 'job_postings_count', metric_value: 18 },

  // React.js (Moderate Growth: 100 -> 120 -> 142 => +42%)
  { id: '11111111-9999-4111-8111-111111111107', district_id: '11111111-1111-4111-8111-111111111111', sector_id: 'a1111111-1111-4111-8111-111111111111', skill_id: 'c4444444-4444-4444-8444-444444444444', period: '2025-Q3', metric_name: 'job_postings_count', metric_value: 100 },
  { id: '11111111-9999-4111-8111-111111111108', district_id: '11111111-1111-4111-8111-111111111111', sector_id: 'a1111111-1111-4111-8111-111111111111', skill_id: 'c4444444-4444-4444-8444-444444444444', period: '2025-Q4', metric_name: 'job_postings_count', metric_value: 120 },
  { id: '11111111-9999-4111-8111-111111111109', district_id: '11111111-1111-4111-8111-111111111111', sector_id: 'a1111111-1111-4111-8111-111111111111', skill_id: 'c4444444-4444-4444-8444-444444444444', period: '2026-Q1', metric_name: 'job_postings_count', metric_value: 142 },

  // Legacy PHP Maintenance (Declining: 17 -> 15 -> 14 => -17.6%)
  { id: '11111111-9999-4111-8111-111111111110', district_id: '11111111-1111-4111-8111-111111111111', sector_id: 'a1111111-1111-4111-8111-111111111111', skill_id: 'c8888888-8888-4888-8888-888888888888', period: '2025-Q3', metric_name: 'job_postings_count', metric_value: 17 },
  { id: '11111111-9999-4111-8111-111111111111', district_id: '11111111-1111-4111-8111-111111111111', sector_id: 'a1111111-1111-4111-8111-111111111111', skill_id: 'c8888888-8888-4888-8888-888888888888', period: '2025-Q4', metric_name: 'job_postings_count', metric_value: 15 },
  { id: '11111111-9999-4111-8111-111111111112', district_id: '11111111-1111-4111-8111-111111111111', sector_id: 'a1111111-1111-4111-8111-111111111111', skill_id: 'c8888888-8888-4888-8888-888888888888', period: '2026-Q1', metric_name: 'job_postings_count', metric_value: 14 },

  // CAN Bus Diagnostics (Steady Growth: 13 -> 16 -> 19 => +46.1%)
  { id: '11111111-9999-4111-8111-111111111113', district_id: '22222222-2222-4222-8222-222222222222', sector_id: 'a2222222-2222-4222-8222-222222222222', skill_id: 'c3333333-3333-4333-8333-333333333333', period: '2025-Q3', metric_name: 'job_postings_count', metric_value: 13 },
  { id: '11111111-9999-4111-8111-111111111114', district_id: '22222222-2222-4222-8222-222222222222', sector_id: 'a2222222-2222-4222-8222-222222222222', skill_id: 'c3333333-3333-4333-8333-333333333333', period: '2025-Q4', metric_name: 'job_postings_count', metric_value: 16 },
  { id: '11111111-9999-4111-8111-111111111115', district_id: '22222222-2222-4222-8222-222222222222', sector_id: 'a2222222-2222-4222-8222-222222222222', skill_id: 'c3333333-3333-4333-8333-333333333333', period: '2026-Q1', metric_name: 'job_postings_count', metric_value: 19 }
];

export const SEED_DATA_SOURCES: DataSourceRegistryItem[] = [
  { id: 'f6666666-6666-4666-8666-666666666666', source_name: 'National Career Service', organization: 'Ministry of Labour & Employment, GoI', source_type: 'Job Postings & Signals', access_method: 'API / CSV Import', last_retrieved: '2026-03-08', status: 'ACTIVE', notes: 'Primary official portal for verified employer job vacancies.' },
  { id: 'f7777777-7777-4777-8777-777777777777', source_name: 'MahaSwayam Portal', organization: 'Govt. of Maharashtra Dept. of Skills', source_type: 'State Skill Capacity', access_method: 'CSV Upload / API', last_retrieved: '2026-03-07', status: 'ACTIVE', notes: 'District wise ITI seats and vocational enrolment statistics.' },
  { id: 'f8888888-8888-4888-8888-888888888888', source_name: 'NCVET / NQR', organization: 'MSDE, GoI', source_type: 'National Qualifications', access_method: 'Reference Registry', last_retrieved: '2026-03-01', status: 'ACTIVE', notes: 'National Classification of Occupations (NCO-2015) & NSQF levels.' },
  { id: 'f9999999-9999-4999-8999-999999999999', source_name: 'MoSPI PLFS', organization: 'Ministry of Statistics & Programme Impl.', source_type: 'Macro Labour Indicators', access_method: 'Quarterly Datasets', last_retrieved: '2026-02-15', status: 'ACTIVE', notes: 'State & district level labour force participation rate reference.' }
];

export const SEED_DISTRICT_SKILL_GAPS: DistrictSkillGapSummary[] = [
  { district_id: '11111111-1111-4111-8111-111111111111', district_name: 'Pune', sector_name: 'Automotive and EV', skill_name: 'EV Battery Diagnostics', taxonomy_status: 'emerging', demand_score: 84, supply_score: 29, gap_score: 55, growth_rate: 154, job_postings_count: 28, employer_signals_count: 8 },
  { district_id: '11111111-1111-4111-8111-111111111111', district_name: 'Pune', sector_name: 'Information Technology', skill_name: 'React.js', taxonomy_status: 'official', demand_score: 91, supply_score: 58, gap_score: 33, growth_rate: 42, job_postings_count: 142, employer_signals_count: 35 },
  { district_id: '22222222-2222-4222-8222-222222222222', district_name: 'Nashik', sector_name: 'Automotive and EV', skill_name: 'CAN Bus Diagnostics', taxonomy_status: 'official', demand_score: 72, supply_score: 45, gap_score: 27, growth_rate: 38, job_postings_count: 19, employer_signals_count: 5 },
  { district_id: '33333333-3333-4333-8333-333333333333', district_name: 'Nagpur', sector_name: 'Information Technology', skill_name: 'Cloud Architecture (AWS)', taxonomy_status: 'official', demand_score: 78, supply_score: 32, gap_score: 46, growth_rate: 65, job_postings_count: 31, employer_signals_count: 12 },
  { district_id: '11111111-1111-4111-8111-111111111111', district_name: 'Pune', sector_name: 'Information Technology', skill_name: 'Legacy PHP Maintenance', taxonomy_status: 'official', demand_score: 22, supply_score: 70, gap_score: -48, growth_rate: -18, job_postings_count: 14, employer_signals_count: 2 }
];

// Helper to generate 300 synthetic job postings with coherent skill & district distributions
export function generateSyntheticJobPostings(): (JobPosting & { skill_id: string })[] {
  const templates = [
    // 0: Pune EV Battery
    { title: 'EV Battery Diagnostic Engineer', sector: 'a2222222-2222-4222-8222-222222222222', skill_id: 'c1111111-1111-4111-8111-111111111111', district: '11111111-1111-4111-8111-111111111111', occupation: 'b1111111-1111-4111-8111-111111111111' },
    // 1: Pune BMS
    { title: 'BMS Calibration Technician', sector: 'a2222222-2222-4222-8222-222222222222', skill_id: 'c2222222-2222-4222-8222-222222222222', district: '11111111-1111-4111-8111-111111111111', occupation: 'b2222222-2222-4222-8222-222222222222' },
    // 2: Pune Legacy PHP
    { title: 'Legacy PHP Scripting Maintainer', sector: 'a1111111-1111-4111-8111-111111111111', skill_id: 'c8888888-8888-4888-8888-888888888888', district: '11111111-1111-4111-8111-111111111111', occupation: 'b3333333-3333-4333-8333-333333333333' },
    // 3: Pune GenAI
    { title: 'GenAI RAG Pipeline Developer', sector: 'a1111111-1111-4111-8111-111111111111', skill_id: 'c6666666-6666-4666-8666-666666666666', district: '11111111-1111-4111-8111-111111111111', occupation: 'b5555555-5555-4555-8555-555555555555' },
    // 4: Pune React.js
    { title: 'Senior React & TypeScript Developer', sector: 'a1111111-1111-4111-8111-111111111111', skill_id: 'c4444444-4444-4444-8444-444444444444', district: '11111111-1111-4111-8111-111111111111', occupation: 'b3333333-3333-4333-8333-333333333333' },
    // 5: Pune TypeScript
    { title: 'TypeScript Software Engineer', sector: 'a1111111-1111-4111-8111-111111111111', skill_id: 'c5555555-5555-4555-8555-555555555555', district: '11111111-1111-4111-8111-111111111111', occupation: 'b3333333-3333-4333-8333-333333333333' },
    
    // 6: Nashik CAN Bus
    { title: 'CAN Bus Electronics Specialist', sector: 'a2222222-2222-4222-8222-222222222222', skill_id: 'c3333333-3333-4333-8333-333333333333', district: '22222222-2222-4222-8222-222222222222', occupation: 'b2222222-2222-4222-8222-222222222222' },
    // 7: Nashik React.js
    { title: 'Frontend React Developer', sector: 'a1111111-1111-4111-8111-111111111111', skill_id: 'c4444444-4444-4444-8444-444444444444', district: '22222222-2222-4222-8222-222222222222', occupation: 'b3333333-3333-4333-8333-333333333333' },
    // 8: Nashik Automotive Electronics
    { title: 'Automotive Electronics Diagnostics Specialist', sector: 'a2222222-2222-4222-8222-222222222222', skill_id: 'c3333333-3333-4333-8333-333333333333', district: '22222222-2222-4222-8222-222222222222', occupation: 'b2222222-2222-4222-8222-222222222222' },

    // 9: Nagpur Cloud
    { title: 'Cloud Infrastructure Solutions Architect', sector: 'a1111111-1111-4111-8111-111111111111', skill_id: 'c7777777-7777-4777-8777-777777777777', district: '33333333-3333-4333-8333-333333333333', occupation: 'b4444444-4444-4444-8444-444444444444' },
    // 10: Nagpur React.js
    { title: 'Web Application Software Engineer (React)', sector: 'a1111111-1111-4111-8111-111111111111', skill_id: 'c4444444-4444-4444-8444-444444444444', district: '33333333-3333-4333-8333-333333333333', occupation: 'b3333333-3333-4333-8333-333333333333' },
    // 11: Nagpur GenAI
    { title: 'AI & LLM Integration Architect', sector: 'a1111111-1111-4111-8111-111111111111', skill_id: 'c6666666-6666-4666-8666-666666666666', district: '33333333-3333-4333-8333-333333333333', occupation: 'b5555555-5555-4555-8555-555555555555' }
  ];

  const companies = ['Tata Motors EV', 'Mahindra Electric', 'Bosch India', 'Persistent Systems', 'InfoCepts', 'KPIT Tech', 'Geometric Systems'];
  const postings: (JobPosting & { skill_id: string })[] = [];

  // Exact target allocation: 140 Pune, 75 Nashik, 85 Nagpur = 300 Job Postings
  for (let i = 1; i <= 300; i++) {
    let tIdx = 4; // default
    if (i <= 28) tIdx = 0;              // 28 EV Battery (Pune)
    else if (i <= 46) tIdx = 1;         // 18 BMS (Pune)
    else if (i <= 60) tIdx = 2;         // 14 Legacy PHP (Pune)
    else if (i <= 69) tIdx = 3;         // 9 GenAI (Pune)
    else if (i <= 129) tIdx = 4;        // 60 React.js (Pune)
    else if (i <= 140) tIdx = 5;        // 11 TypeScript (Pune) -> Pune total = 140
    else if (i <= 175) tIdx = 6;        // 35 CAN Bus (Nashik)
    else if (i <= 210) tIdx = 7;        // 35 React.js (Nashik)
    else if (i <= 215) tIdx = 8;        // 5 Automotive Electronics (Nashik) -> Nashik total = 75
    else if (i <= 246) tIdx = 9;        // 31 Cloud Architecture (Nagpur)
    else if (i <= 293) tIdx = 10;       // 47 React.js (Nagpur)
    else tIdx = 11;                     // 7 GenAI (Nagpur) -> Nagpur total = 85

    const template = templates[tIdx];
    const company = companies[i % companies.length];

    postings.push({
      id: `jp-${i}`,
      external_reference: `NCS-2026-MH-${1000 + i}`,
      title: `${template.title} #${i}`,
      company: company,
      district_id: template.district,
      sector_id: template.sector,
      occupation_id: template.occupation,
      skill_id: template.skill_id,
      description: `Targeting candidate with hands-on proficiency in ${template.title} for regional operations.`,
      experience_min: (i % 4) + 1,
      experience_max: (i % 4) + 4,
      seniority: i % 2 === 0 ? 'Mid-Level' : 'Senior',
      posted_date: `2026-0${(i % 3) + 1}-15`,
      source_name: 'National Career Service',
      retrieved_at: new Date().toISOString(),
      is_synthetic: true
    });
  }

  return postings;
}
