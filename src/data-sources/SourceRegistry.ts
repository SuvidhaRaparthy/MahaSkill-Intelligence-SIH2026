// MahaSkill Intelligence - Data Source Registry
import type { DataSourceMetadata } from './DataSourceAdapter';

export const DATA_SOURCE_REGISTRY: Record<string, DataSourceMetadata> = {
  ncs: {
    id: 'ncs',
    category: 'NCS',
    source_name: 'National Career Service',
    organization: 'Ministry of Labour & Employment, GoI',
    source_type: 'Employer Vacancy Signals & Job Postings',
    access_method: 'CSV_IMPORT',
    supports_file_upload: true,
    status: 'ACTIVE',
    notes: 'Official job openings portal. Captures employer demand, location, sector, and raw skill descriptions.',
    sample_file_url: '/samples/sample_job_postings.csv',
    required_fields: {
      JOB_POSTINGS: ['title', 'company', 'district', 'sector', 'posted_date'],
      SKILL_TAXONOMY: ['canonical_name', 'category'],
      COURSES_TRAINING: ['course_name', 'institute_name', 'district'],
      EMPLOYER_SIGNALS: ['employer_name', 'skill_name', 'expected_hires'],
      QUALIFICATIONS: ['qualification_name', 'qualification_code']
    }
  },
  mahaswayam: {
    id: 'mahaswayam',
    category: 'MAHASWAYAM',
    source_name: 'MahaSwayam Portal',
    organization: 'Department of Skills, Employment & Innovation, Govt of Maharashtra',
    source_type: 'State Vocational Courses & Enrolment Seats',
    access_method: 'CSV_IMPORT',
    supports_file_upload: true,
    status: 'ACTIVE',
    notes: 'District-wise ITI seats, course offerings, and annual completions across Maharashtra.',
    sample_file_url: '/samples/sample_courses.csv',
    required_fields: {
      JOB_POSTINGS: ['title', 'company', 'district', 'sector', 'posted_date'],
      SKILL_TAXONOMY: ['canonical_name', 'category'],
      COURSES_TRAINING: ['course_name', 'institute_name', 'district', 'annual_seats'],
      EMPLOYER_SIGNALS: ['employer_name', 'skill_name', 'expected_hires'],
      QUALIFICATIONS: ['qualification_name', 'qualification_code']
    }
  },
  nco_dge: {
    id: 'nco_dge',
    category: 'NCO_DGE',
    source_name: 'NCO-2015 / DGE',
    organization: 'Directorate General of Employment, GoI',
    source_type: 'National Classification of Occupations',
    access_method: 'REFERENCE_REGISTRY',
    supports_file_upload: true,
    status: 'ACTIVE',
    notes: 'Standardized 4-digit NCO codes and occupation families used for job title normalization.',
    required_fields: {
      JOB_POSTINGS: ['title', 'nco_code'],
      SKILL_TAXONOMY: ['canonical_name', 'category'],
      COURSES_TRAINING: ['course_name', 'institute_name'],
      EMPLOYER_SIGNALS: ['employer_name', 'skill_name'],
      QUALIFICATIONS: ['qualification_name', 'qualification_code']
    }
  },
  ncvet_nqr: {
    id: 'ncvet_nqr',
    category: 'NCVET_NQR',
    source_name: 'NCVET / National Qualifications Register',
    organization: 'Ministry of Skill Development & Entrepreneurship, GoI',
    source_type: 'NSQF Qualifications & NOS Standards',
    access_method: 'REFERENCE_REGISTRY',
    supports_file_upload: true,
    status: 'ACTIVE',
    notes: 'National Occupational Standards (NOS) and NSQF aligned vocational qualifications.',
    required_fields: {
      JOB_POSTINGS: ['title', 'company'],
      SKILL_TAXONOMY: ['canonical_name', 'qualification_code'],
      COURSES_TRAINING: ['course_name', 'qualification_code'],
      EMPLOYER_SIGNALS: ['employer_name', 'skill_name'],
      QUALIFICATIONS: ['qualification_name', 'qualification_code', 'nsqf_level']
    }
  },
  skill_india: {
    id: 'skill_india',
    category: 'SKILL_INDIA',
    source_name: 'Skill India Digital Hub',
    organization: 'MSDE, GoI',
    source_type: 'Course Catalogue & Skill Standards',
    access_method: 'JSON_IMPORT',
    supports_file_upload: true,
    status: 'ACTIVE',
    notes: 'Central repository of certified short-term and long-term skilling courses.',
    required_fields: {
      JOB_POSTINGS: ['title', 'company'],
      SKILL_TAXONOMY: ['canonical_name', 'category'],
      COURSES_TRAINING: ['course_name', 'institute_name', 'district'],
      EMPLOYER_SIGNALS: ['employer_name', 'skill_name'],
      QUALIFICATIONS: ['qualification_name', 'qualification_code']
    }
  },
  mospi_plfs: {
    id: 'mospi_plfs',
    category: 'MOSPI_PLFS',
    source_name: 'MoSPI / PLFS',
    organization: 'Ministry of Statistics & Programme Implementation',
    source_type: 'Macro Labour Market Indicators',
    access_method: 'CSV_IMPORT',
    supports_file_upload: true,
    status: 'ACTIVE',
    notes: 'Macroeconomic indicators: Labour Force Participation Rate (LFPR) and Worker Population Ratio.',
    required_fields: {
      JOB_POSTINGS: ['title'],
      SKILL_TAXONOMY: ['canonical_name'],
      COURSES_TRAINING: ['course_name'],
      EMPLOYER_SIGNALS: ['employer_name'],
      QUALIFICATIONS: ['qualification_name']
    }
  },
  data_gov: {
    id: 'data_gov',
    category: 'DATA_GOV',
    source_name: 'data.gov.in',
    organization: 'National Informatics Centre, GoI',
    source_type: 'Open Government Datasets',
    access_method: 'CSV_IMPORT',
    supports_file_upload: true,
    status: 'ACTIVE',
    notes: 'Public employment, industrial, and economic datasets for Maharashtra districts.',
    required_fields: {
      JOB_POSTINGS: ['title', 'district', 'posted_date'],
      SKILL_TAXONOMY: ['canonical_name'],
      COURSES_TRAINING: ['course_name', 'district'],
      EMPLOYER_SIGNALS: ['employer_name', 'skill_name'],
      QUALIFICATIONS: ['qualification_name']
    }
  },
  employer_survey: {
    id: 'employer_survey',
    category: 'EMPLOYER_SURVEY',
    source_name: 'Direct Employer Hiring Survey',
    organization: 'Regional Industry Associations & Employers',
    source_type: 'Direct Employer Demand Signals',
    access_method: 'EXCEL_IMPORT',
    supports_file_upload: true,
    status: 'ACTIVE',
    notes: 'Primary surveys submitted by employers regarding projected 6-month hiring needs.',
    required_fields: {
      JOB_POSTINGS: ['title'],
      SKILL_TAXONOMY: ['canonical_name'],
      COURSES_TRAINING: ['course_name'],
      EMPLOYER_SIGNALS: ['employer_name', 'skill_name', 'expected_hires', 'district'],
      QUALIFICATIONS: ['qualification_name']
    }
  },
  synthetic_demo: {
    id: 'synthetic_demo',
    category: 'SYNTHETIC_DEMO',
    source_name: 'Synthetic Demo Generator',
    organization: 'MahaSkill Intelligence Sandbox',
    source_type: 'Prototype Demonstration Data',
    access_method: 'CSV_IMPORT',
    supports_file_upload: true,
    status: 'ACTIVE',
    notes: 'Synthetic datasets used for hackathon testing and demo pipeline validation.',
    required_fields: {
      JOB_POSTINGS: ['title', 'company', 'district', 'sector', 'posted_date'],
      SKILL_TAXONOMY: ['canonical_name', 'category'],
      COURSES_TRAINING: ['course_name', 'institute_name', 'district'],
      EMPLOYER_SIGNALS: ['employer_name', 'skill_name', 'expected_hires'],
      QUALIFICATIONS: ['qualification_name', 'qualification_code']
    }
  }
};
