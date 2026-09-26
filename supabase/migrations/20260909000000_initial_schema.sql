-- MahaSkill Intelligence - Initial PostgreSQL Database Schema Migration
-- Migration: 20260909000000_initial_schema.sql
-- Enables UUID generation and sets up all 25 system tables, foreign keys, indexes, views, and RLS policies.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Districts
CREATE TABLE IF NOT EXISTS districts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    state TEXT NOT NULL DEFAULT 'Maharashtra',
    latitude NUMERIC(10, 6) NOT NULL,
    longitude NUMERIC(10, 6) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Sectors
CREATE TABLE IF NOT EXISTS sectors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Occupations
CREATE TABLE IF NOT EXISTS occupations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    nco_code TEXT,
    nco_family TEXT,
    sector_id UUID REFERENCES sectors(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Skills
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    canonical_name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    description TEXT,
    taxonomy_status TEXT NOT NULL CHECK (taxonomy_status IN ('official', 'normalized', 'emerging', 'unmapped')),
    qualification_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Skill Aliases
CREATE TABLE IF NOT EXISTS skill_aliases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    alias TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Job Postings
CREATE TABLE IF NOT EXISTS job_postings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_reference TEXT,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    district_id UUID REFERENCES districts(id) ON DELETE SET NULL,
    sector_id UUID REFERENCES sectors(id) ON DELETE SET NULL,
    occupation_id UUID REFERENCES occupations(id) ON DELETE SET NULL,
    description TEXT,
    experience_min INT DEFAULT 0,
    experience_max INT DEFAULT 5,
    seniority TEXT,
    posted_date DATE NOT NULL,
    source_name TEXT NOT NULL DEFAULT 'National Career Service',
    source_reference TEXT,
    retrieved_at TIMESTAMPTZ DEFAULT NOW(),
    is_synthetic BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Job Skills
CREATE TABLE IF NOT EXISTS job_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE SET NULL,
    raw_skill_text TEXT NOT NULL,
    proficiency TEXT,
    extraction_confidence NUMERIC(5, 2) DEFAULT 80.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Qualifications
CREATE TABLE IF NOT EXISTS qualifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    qualification_name TEXT NOT NULL,
    qualification_code TEXT UNIQUE,
    nsqf_level INT,
    sector_id UUID REFERENCES sectors(id) ON DELETE SET NULL,
    source_name TEXT DEFAULT 'NCVET/NQR',
    verification_status TEXT DEFAULT 'VERIFIED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Courses
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_name TEXT NOT NULL,
    qualification_id UUID REFERENCES qualifications(id) ON DELETE SET NULL,
    district_id UUID REFERENCES districts(id) ON DELETE SET NULL,
    institute_name TEXT NOT NULL,
    annual_seats INT DEFAULT 0,
    annual_completions INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    source_name TEXT DEFAULT 'Skill India Digital Hub',
    source_reference TEXT,
    is_synthetic BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Course Skills
CREATE TABLE IF NOT EXISTS course_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    coverage_level TEXT CHECK (coverage_level IN ('HIGH', 'MEDIUM', 'LOW', 'ABSENT')),
    hours INT DEFAULT 0,
    mandatory BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Employers
CREATE TABLE IF NOT EXISTS employers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    sector_id UUID REFERENCES sectors(id) ON DELETE SET NULL,
    district_id UUID REFERENCES districts(id) ON DELETE SET NULL,
    organization_type TEXT DEFAULT 'PRIVATE_ENTERPRISE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Employer Signals
CREATE TABLE IF NOT EXISTS employer_signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    district_id UUID REFERENCES districts(id) ON DELETE SET NULL,
    sector_id UUID REFERENCES sectors(id) ON DELETE SET NULL,
    required_proficiency TEXT,
    expected_hires INT DEFAULT 0,
    signal_date DATE NOT NULL DEFAULT CURRENT_DATE,
    comments TEXT,
    confidence NUMERIC(5, 2) DEFAULT 85.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Employer Validations
CREATE TABLE IF NOT EXISTS employer_validations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    recommendation_id UUID,
    validation TEXT NOT NULL CHECK (validation IN ('CONFIRM', 'REJECT', 'EDIT')),
    corrected_proficiency TEXT,
    corrected_expected_hires INT,
    comments TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Trainers
CREATE TABLE IF NOT EXISTS trainers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district_id UUID REFERENCES districts(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    trainer_count INT DEFAULT 0,
    certified_count INT DEFAULT 0,
    is_synthetic BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Equipment
CREATE TABLE IF NOT EXISTS equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district_id UUID REFERENCES districts(id) ON DELETE CASCADE,
    sector_id UUID REFERENCES sectors(id) ON DELETE CASCADE,
    equipment_name TEXT NOT NULL,
    available_quantity INT DEFAULT 0,
    required_per_batch INT DEFAULT 1,
    is_synthetic BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Skill Demand Metrics
CREATE TABLE IF NOT EXISTS skill_demand_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district_id UUID REFERENCES districts(id) ON DELETE CASCADE,
    sector_id UUID REFERENCES sectors(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    period TEXT NOT NULL,
    posting_count INT DEFAULT 0,
    employer_demand INT DEFAULT 0,
    growth_rate NUMERIC(6, 2) DEFAULT 0.0,
    demand_score NUMERIC(5, 2) DEFAULT 0.0,
    confidence NUMERIC(5, 2) DEFAULT 75.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. Skill Supply Metrics
CREATE TABLE IF NOT EXISTS skill_supply_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district_id UUID REFERENCES districts(id) ON DELETE CASCADE,
    sector_id UUID REFERENCES sectors(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    period TEXT NOT NULL,
    course_count INT DEFAULT 0,
    annual_seats INT DEFAULT 0,
    annual_completions INT DEFAULT 0,
    curriculum_coverage NUMERIC(5, 2) DEFAULT 0.0,
    supply_score NUMERIC(5, 2) DEFAULT 0.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. Recommendations
CREATE TABLE IF NOT EXISTS recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district_id UUID REFERENCES districts(id) ON DELETE CASCADE,
    sector_id UUID REFERENCES sectors(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    recommendation_type TEXT NOT NULL CHECK (recommendation_type IN (
        'ADD_SKILL', 'RETAIN', 'REVIEW', 'POTENTIAL_OBSOLESCENCE', 
        'POTENTIAL_OVERSUPPLY', 'INCREASE_SEATS', 'DECREASE_SEATS_REVIEW', 
        'TRAINER_GAP', 'EQUIPMENT_GAP'
    )),
    priority TEXT NOT NULL CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW', 'CRITICAL')),
    gap_score NUMERIC(5, 2) DEFAULT 0.0,
    confidence NUMERIC(5, 2) DEFAULT 80.0,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VALIDATED', 'IN_REVIEW', 'IMPLEMENTED', 'REJECTED')),
    summary TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. Recommendation Evidence
CREATE TABLE IF NOT EXISTS recommendation_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recommendation_id UUID NOT NULL REFERENCES recommendations(id) ON DELETE CASCADE,
    source_type TEXT NOT NULL,
    source_record_id TEXT,
    evidence_label TEXT NOT NULL,
    contribution NUMERIC(5, 2) DEFAULT 1.0,
    explanation TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. Simulations
CREATE TABLE IF NOT EXISTS simulations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district_id UUID REFERENCES districts(id) ON DELETE CASCADE,
    scenario_name TEXT NOT NULL,
    assumptions JSONB NOT NULL DEFAULT '{}'::jsonb,
    before_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    after_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. Data Sources
CREATE TABLE IF NOT EXISTS data_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_name TEXT NOT NULL UNIQUE,
    organization TEXT NOT NULL,
    source_type TEXT NOT NULL,
    source_url TEXT,
    access_method TEXT NOT NULL,
    last_retrieved TIMESTAMPTZ,
    status TEXT DEFAULT 'ACTIVE',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. Data Imports
CREATE TABLE IF NOT EXISTS data_imports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID REFERENCES data_sources(id) ON DELETE SET NULL,
    filename TEXT NOT NULL,
    imported_at TIMESTAMPTZ DEFAULT NOW(),
    records_processed INT DEFAULT 0,
    records_accepted INT DEFAULT 0,
    records_rejected INT DEFAULT 0,
    status TEXT DEFAULT 'COMPLETED',
    error_summary TEXT
);

-- 23. Time Series Metrics
CREATE TABLE IF NOT EXISTS time_series_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district_id UUID REFERENCES districts(id) ON DELETE CASCADE,
    sector_id UUID REFERENCES sectors(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    period TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    metric_value NUMERIC(10, 2) NOT NULL,
    source_name TEXT DEFAULT 'Synthesized Analysis',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 24. Institute Responses
CREATE TABLE IF NOT EXISTS institute_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    institute_name TEXT NOT NULL,
    response_type TEXT NOT NULL CHECK (response_type IN ('ACCEPT', 'PARTIAL', 'UNFEASIBLE')),
    feasibility TEXT NOT NULL,
    trainer_available BOOLEAN DEFAULT FALSE,
    equipment_available BOOLEAN DEFAULT FALSE,
    estimated_cost NUMERIC(12, 2) DEFAULT 0.0,
    comments TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 25. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR HIGH PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_job_postings_district ON job_postings(district_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_sector ON job_postings(sector_id);
CREATE INDEX IF NOT EXISTS idx_job_skills_job ON job_skills(job_id);
CREATE INDEX IF NOT EXISTS idx_job_skills_skill ON job_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_courses_district ON courses(district_id);
CREATE INDEX IF NOT EXISTS idx_course_skills_course ON course_skills(course_id);
CREATE INDEX IF NOT EXISTS idx_course_skills_skill ON course_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_demand_metrics ON skill_demand_metrics(district_id, sector_id, skill_id);
CREATE INDEX IF NOT EXISTS idx_supply_metrics ON skill_supply_metrics(district_id, sector_id, skill_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_district ON recommendations(district_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_priority ON recommendations(priority);

-- POSTGRESQL AGGREGATED VIEWS

-- View 1: District Skill Gap Aggregates
CREATE OR REPLACE VIEW vw_district_skill_gap AS
SELECT 
    d.id AS district_id,
    d.name AS district_name,
    s.id AS sector_id,
    s.name AS sector_name,
    sk.id AS skill_id,
    sk.canonical_name AS skill_name,
    sk.taxonomy_status,
    COALESCE(dm.demand_score, 0) AS demand_score,
    COALESCE(sm.supply_score, 0) AS supply_score,
    (COALESCE(dm.demand_score, 0) - COALESCE(sm.supply_score, 0)) AS gap_score,
    COALESCE(dm.growth_rate, 0) AS growth_rate,
    COALESCE(dm.posting_count, 0) AS job_postings_count,
    COALESCE(dm.employer_demand, 0) AS employer_signals_count
FROM districts d
CROSS JOIN sectors s
CROSS JOIN skills sk
LEFT JOIN skill_demand_metrics dm ON dm.district_id = d.id AND dm.sector_id = s.id AND dm.skill_id = sk.id
LEFT JOIN skill_supply_metrics sm ON sm.district_id = d.id AND sm.sector_id = s.id AND sm.skill_id = sk.id;

-- View 2: Emerging Skills Summary
CREATE OR REPLACE VIEW vw_emerging_skills AS
SELECT 
    sk.id AS skill_id,
    sk.canonical_name,
    sk.category,
    sk.taxonomy_status,
    COUNT(DISTINCT jp.id) AS posting_count,
    COUNT(DISTINCT jp.company) AS employer_count,
    COUNT(DISTINCT jp.district_id) AS district_count,
    MAX(dm.growth_rate) AS max_growth_rate,
    AVG(dm.confidence) AS avg_confidence
FROM skills sk
JOIN job_skills js ON js.skill_id = sk.id
JOIN job_postings jp ON jp.id = js.job_id
LEFT JOIN skill_demand_metrics dm ON dm.skill_id = sk.id
WHERE sk.taxonomy_status IN ('emerging', 'unmapped') OR dm.growth_rate > 50
GROUP BY sk.id, sk.canonical_name, sk.category, sk.taxonomy_status;

-- View 3: Government Priority Actions View
CREATE OR REPLACE VIEW vw_government_priority_actions AS
SELECT 
    r.id AS recommendation_id,
    d.name AS district_name,
    s.name AS sector_name,
    sk.canonical_name AS skill_name,
    c.course_name,
    r.recommendation_type,
    r.priority,
    r.gap_score,
    r.confidence,
    r.summary,
    r.status,
    r.created_at
FROM recommendations r
LEFT JOIN districts d ON d.id = r.district_id
LEFT JOIN sectors s ON s.id = r.sector_id
LEFT JOIN skills sk ON sk.id = r.skill_id
LEFT JOIN courses c ON c.id = r.course_id
ORDER BY CASE r.priority WHEN 'CRITICAL' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 ELSE 4 END, r.gap_score DESC;

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE occupations ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all catalog / intelligence data
CREATE POLICY "Allow public read access on districts" ON districts FOR SELECT USING (true);
CREATE POLICY "Allow public read access on sectors" ON sectors FOR SELECT USING (true);
CREATE POLICY "Allow public read access on occupations" ON occupations FOR SELECT USING (true);
CREATE POLICY "Allow public read access on skills" ON skills FOR SELECT USING (true);
CREATE POLICY "Allow public read access on job_postings" ON job_postings FOR SELECT USING (true);
CREATE POLICY "Allow public read access on courses" ON courses FOR SELECT USING (true);
CREATE POLICY "Allow public read access on recommendations" ON recommendations FOR SELECT USING (true);
