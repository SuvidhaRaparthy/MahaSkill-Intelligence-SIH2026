// MahaSkill Intelligence - Database TypeScript Interfaces

export type DataClassification = 
  | 'REAL_PUBLIC_DATA'
  | 'DERIVED_METRIC'
  | 'SYNTHETIC_DEMO_DATA'
  | 'FORECAST'
  | 'SIMULATION';

export type TaxonomyStatus = 'official' | 'normalized' | 'emerging' | 'unmapped';

export type MappingMethod = 
  | 'ALIAS_MATCH' 
  | 'EXACT_MATCH' 
  | 'FUZZY_MATCH' 
  | 'SEMANTIC_LLM' 
  | 'UNRESOLVED';

export type ProficiencyLevel = 
  | 'required' 
  | 'preferred' 
  | 'basic' 
  | 'intermediate' 
  | 'advanced';

export type RecommendationType = 
  | 'ADD_SKILL'
  | 'RETAIN'
  | 'REVIEW'
  | 'POTENTIAL_OBSOLESCENCE'
  | 'POTENTIAL_OVERSUPPLY'
  | 'INCREASE_SEATS'
  | 'DECREASE_SEATS_REVIEW'
  | 'TRAINER_GAP'
  | 'EQUIPMENT_GAP';

export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type ValidationStatus = 'CONFIRM' | 'REJECT' | 'EDIT';

export interface District {
  id: string;
  name: string;
  state: string;
  latitude: number;
  longitude: number;
}

export interface Sector {
  id: string;
  name: string;
  description: string;
}

export interface Occupation {
  id: string;
  title: string;
  nco_code: string;
  nco_family: string;
  sector_id: string;
}

export interface Skill {
  id: string;
  canonical_name: string;
  category: string;
  description: string;
  taxonomy_status: TaxonomyStatus;
  qualification_code?: string;
  created_at: string;
}

export interface SkillAlias {
  id: string;
  skill_id: string;
  alias: string;
}

export interface JobPosting {
  id: string;
  external_reference?: string;
  title: string;
  company: string;
  district_id: string;
  sector_id: string;
  occupation_id?: string;
  description: string;
  experience_min: number;
  experience_max: number;
  seniority: string;
  posted_date: string;
  source_name: string;
  source_reference?: string;
  retrieved_at: string;
  is_synthetic: boolean;
}

export interface JobSkill {
  id: string;
  job_id: string;
  skill_id?: string;
  raw_skill_text: string;
  proficiency?: ProficiencyLevel;
  extraction_confidence: number;
  mapping_method?: MappingMethod;
  created_at?: string;
}

export interface Course {
  id: string;
  course_name: string;
  qualification_id?: string;
  district_id: string;
  institute_name: string;
  annual_seats: number;
  annual_completions: number;
  active: boolean;
  source_name: string;
  is_synthetic: boolean;
}

export interface CourseSkill {
  id: string;
  course_id: string;
  skill_id: string;
  coverage_level: 'HIGH' | 'MEDIUM' | 'LOW' | 'ABSENT';
  hours: number;
  mandatory: boolean;
}

export interface EmployerValidationRecord {
  id: string;
  employer_id: string;
  skill_id: string;
  recommendation_id?: string;
  validation: ValidationStatus;
  corrected_proficiency?: string;
  corrected_expected_hires?: number;
  comments?: string;
  created_at?: string;
}

export interface TrainerRecord {
  id: string;
  district_id: string;
  skill_id: string;
  trainer_count: number;
  certified_count: number;
  is_synthetic: boolean;
}

export interface EquipmentRecord {
  id: string;
  district_id: string;
  sector_id: string;
  equipment_name: string;
  available_quantity: number;
  required_per_batch: number;
  is_synthetic: boolean;
}

export interface TimeSeriesMetric {
  id: string;
  district_id: string;
  sector_id: string;
  skill_id: string;
  period: string;
  metric_name: string;
  metric_value: number;
  source_name?: string;
}

export interface EmployerSignal {
  id: string;
  employer_id: string;
  employer_name?: string;
  skill_id: string;
  skill_name?: string;
  district_id: string;
  sector_id: string;
  required_proficiency: string;
  expected_hires: number;
  signal_date: string;
  comments: string;
  confidence: number;
}

export interface Recommendation {
  id: string;
  district_id: string;
  district_name?: string;
  sector_id: string;
  sector_name?: string;
  skill_id: string;
  skill_name?: string;
  course_id?: string;
  course_name?: string;
  recommendation_type: RecommendationType;
  priority: Priority;
  gap_score: number;
  confidence: number;
  status: string;
  summary: string;
  created_at: string;
  evidence_count?: number;
}

export interface RecommendationEvidence {
  id: string;
  recommendation_id: string;
  source_type: string;
  source_record_id?: string;
  evidence_label: string;
  contribution: number;
  explanation: string;
}

export interface SkillDemandMetric {
  id: string;
  district_id: string;
  sector_id: string;
  skill_id: string;
  period: string;
  posting_count: number;
  employer_demand: number;
  growth_rate: number;
  demand_score: number;
  confidence: number;
}

export interface SkillSupplyMetric {
  id: string;
  district_id: string;
  sector_id: string;
  skill_id: string;
  period: string;
  course_count: number;
  annual_seats: number;
  annual_completions: number;
  curriculum_coverage: number;
  supply_score: number;
}

export interface DataSourceRegistryItem {
  id: string;
  source_name: string;
  organization: string;
  source_type: string;
  source_url?: string;
  access_method: string;
  last_retrieved: string;
  status: string;
  notes: string;
}

export interface DistrictSkillGapSummary {
  district_id: string;
  district_name: string;
  sector_name: string;
  skill_name: string;
  taxonomy_status: TaxonomyStatus;
  demand_score: number;
  supply_score: number;
  gap_score: number;
  growth_rate: number;
  job_postings_count: number;
  employer_signals_count: number;
}

export interface SimulationRecord {
  id?: string;
  scenario_name: string;
  district_name: string;
  sector_name: string;
  skill_name: string;
  course_name?: string;
  inputs: {
    additional_seats: number;
    additional_trainers: number;
    additional_equipment: number;
    curriculum_coverage_pct?: number;
    curriculum_module_added?: boolean;
  };
  assumptions: string[];
  baseline_values: {
    demand_score: number;
    supply_score: number;
    gap_score: number;
    annual_seats: number;
    trainers_available: number;
    trainers_required: number;
    trainer_gap: number;
    equipment_available: number;
    equipment_required: number;
    equipment_gap: number;
    curriculum_coverage_pct: number;
    priority_level: string;
    readiness_score: number;
  };
  simulated_values: {
    demand_score: number;
    supply_score: number;
    gap_score: number;
    annual_seats: number;
    trainers_available: number;
    trainer_gap: number;
    equipment_available: number;
    equipment_gap: number;
    curriculum_coverage_pct: number;
    priority_level: string;
    readiness_score: number;
  };
  impact: {
    gap_improvement: number;
    trainer_gap_improvement: number;
    equipment_gap_improvement: number;
    readiness_improvement: number;
    tradeoffs: string[];
  };
  is_simulation: boolean;
  created_at?: string;
}

