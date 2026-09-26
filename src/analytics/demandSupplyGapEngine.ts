// MahaSkill Intelligence - Skill Demand, Supply & Gap Analysis Analytics Engine (Phase 4.4)
// Implements validated Demand-Aligned Coverage Methodology
import { supabase } from '../lib/supabase';

/**
 * Authoritative coverage-based classification thresholds per SIH26134 specification (Phase 4.4).
 */
export const COVERAGE_THRESHOLDS = {
  CRITICAL_SHORTAGE: 50,    // CR < 50%
  MODERATE_SHORTAGE: 90,    // 50% <= CR < 90%
  BALANCED_MAX: 125,        // 90% <= CR <= 125%
  MODERATE_OVERSUPPLY: 200  // 125% < CR <= 200%, HIGH_OVERSUPPLY > 200%
};

// Deprecated legacy alias for backwards compatibility
export const GAP_THRESHOLDS = {
  HIGH_SHORTAGE: 25,
  MODERATE_SHORTAGE: 10,
  BALANCED_MIN: -9,
  BALANCED_MAX: 9,
  MODERATE_OVERSUPPLY: -10,
  HIGH_OVERSUPPLY: -25
};

export type CoverageStatusType =
  | 'CRITICAL_SHORTAGE'
  | 'MODERATE_SHORTAGE'
  | 'BALANCED'
  | 'MODERATE_OVERSUPPLY'
  | 'HIGH_OVERSUPPLY';

export type GapStatusType = CoverageStatusType | 'HIGH_SHORTAGE';

export interface CoverageClassification {
  status: CoverageStatusType;
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  description: string;
}

export type GapClassification = CoverageClassification;

/**
 * Authoritative classification function based on Coverage Percentage.
 */
export function classifyCoverageRatio(coveragePercent: number): CoverageClassification {
  if (coveragePercent < COVERAGE_THRESHOLDS.CRITICAL_SHORTAGE) {
    return {
      status: 'CRITICAL_SHORTAGE',
      label: 'Critical Shortage',
      badgeBg: 'bg-rose-950/60',
      badgeText: 'text-rose-300',
      badgeBorder: 'border-rose-700/60',
      description: 'Critical severe shortage. Annual training throughput covers less than 50% of direct hiring demand.'
    };
  }
  if (coveragePercent < COVERAGE_THRESHOLDS.MODERATE_SHORTAGE) {
    return {
      status: 'MODERATE_SHORTAGE',
      label: 'Moderate Shortage',
      badgeBg: 'bg-amber-950/60',
      badgeText: 'text-amber-300',
      badgeBorder: 'border-amber-700/60',
      description: 'Moderate shortage. Training throughput falls behind hiring demand (50% to 90% coverage).'
    };
  }
  if (coveragePercent <= COVERAGE_THRESHOLDS.BALANCED_MAX) {
    return {
      status: 'BALANCED',
      label: 'Balanced Ecosystem',
      badgeBg: 'bg-emerald-950/60',
      badgeText: 'text-emerald-300',
      badgeBorder: 'border-emerald-700/60',
      description: 'Ecosystem balance. Annual training throughput matches direct hiring demand (90% to 125% coverage).'
    };
  }
  if (coveragePercent <= COVERAGE_THRESHOLDS.MODERATE_OVERSUPPLY) {
    return {
      status: 'MODERATE_OVERSUPPLY',
      label: 'Moderate Oversupply',
      badgeBg: 'bg-blue-950/60',
      badgeText: 'text-blue-300',
      badgeBorder: 'border-blue-700/60',
      description: 'Moderate oversupply. Training throughput exceeds immediate hiring demand by up to 2x (125% to 200% coverage).'
    };
  }
  return {
    status: 'HIGH_OVERSUPPLY',
    label: 'High Oversupply',
    badgeBg: 'bg-purple-950/60',
    badgeText: 'text-purple-300',
    badgeBorder: 'border-purple-700/60',
    description: 'Substantial oversupply. High seat capacity relative to hiring demand (>200% coverage).'
  };
}

// Legacy helper wrapper for backwards compatibility
export function classifyGapScore(gapScore: number): GapClassification {
  if (gapScore >= 25) return classifyCoverageRatio(0);
  if (gapScore >= 10) return classifyCoverageRatio(75);
  if (gapScore >= -9) return classifyCoverageRatio(100);
  if (gapScore >= -25) return classifyCoverageRatio(150);
  return classifyCoverageRatio(250);
}

export interface SkillGapAnalysisResult {
  skill_id: string;
  skill_name: string;
  category: string;
  district_id?: string;
  district_name: string;
  sector_id?: string;
  sector_name: string;

  // Requirement E: Explicit Analytical Demand Fields
  demandScore: number;
  uniqueJobPostings: number;
  expectedHires: number;
  directHiringDemand: number;

  // Legacy field aliases for backwards compatibility
  job_postings_count: number;
  posting_percentage: number;
  employer_signals_count: number;
  growth_rate_pct: number | null;
  historical_data_available: boolean;

  // Requirement E: Explicit Analytical Supply Fields
  annualSeats: number;
  annualCompletions: number;
  effectiveSupply: number;
  courses_count: number;
  annual_seats: number;
  annual_completions: number;
  curriculum_coverage: number;

  // Requirement E: Explicit Coverage & Deficit Metrics
  coverageRatio: number;
  coveragePercent: number;
  physicalDeficit: number;

  // Requirement E: Explicit Visualization Scores (0 - 100 Index)
  posting_demand_component: number;
  employer_signal_component: number;
  growth_component: number;
  demand_score: number;
  supplyScore: number;
  supply_score: number;
  netGap: number;
  gap_score: number;

  // Requirement E: Authoritative Coverage Classification
  classification: CoverageClassification;

  // Provenance & Component Tracking
  is_database_derived: boolean;
  db_error?: string;
  signals_available: {
    job_postings: boolean;
    employer_signals: boolean;
    growth_history: boolean;
    course_seats: boolean;
  };
  explainability: {
    summary: string;
    coverage_explain: string;
    physical_deficit_explain: string;
    posting_component_explain: string;
    employer_component_explain: string;
    growth_component_explain: string;
    demand_formula: string;
    supply_formula: string;
    gap_formula: string;
    contributing_occupations: string[];
    contributing_courses: { course_name: string; institute_name: string; seats: number; completions: number }[];
  };
}

export interface FilterOptions {
  districtId?: string;
  sectorId?: string;
  category?: string;
  period?: string;
}

/**
 * Main Deterministic Analytics Engine for Phase 4.4:
 * Implements Demand-Aligned Coverage Methodology using active remote Supabase relational database.
 */
export async function calculateSkillDemandSupplyGaps(
  filters: FilterOptions = {}
): Promise<SkillGapAnalysisResult[]> {
  const { districtId = 'ALL', sectorId = 'ALL', category = 'ALL' } = filters;

  // District/Sector ID mapping for legacy seed IDs (d1, d2, d3, s1, s2)
  const distIdMap: Record<string, string> = {
    d1: '11111111-1111-4111-8111-111111111111',
    d2: '22222222-2222-4222-8222-222222222222',
    d3: '33333333-3333-4333-8333-333333333333'
  };
  const secIdMap: Record<string, string> = {
    s1: 'a1111111-1111-4111-8111-111111111111',
    s2: 'a2222222-2222-4222-8222-222222222222'
  };

  const resolvedDistrictId = distIdMap[districtId] || districtId;
  const resolvedSectorId = secIdMap[sectorId] || sectorId;

  // 1. Query relational data directly from Supabase
  let dbSkills: any[] = [];
  let dbJobPostings: any[] = [];
  let dbJobSkills: any[] = [];
  let dbCourses: any[] = [];
  let dbCourseSkills: any[] = [];
  let dbEmployerSignals: any[] = [];
  let dbTimeSeries: any[] = [];
  let dbDistricts: any[] = [];
  let dbSectors: any[] = [];
  let dbOccupations: any[] = [];
  let fetchError: string | null = null;

  try {
    const [
      resSkills,
      resPostings,
      resJobSkills,
      resCourses,
      resCourseSkills,
      resEmployerSignals,
      resTimeSeries,
      resDistricts,
      resSectors,
      resOccupations
    ] = await Promise.all([
      supabase.from('skills').select('*'),
      supabase.from('job_postings').select('id, title, district_id, sector_id'),
      supabase.from('job_skills').select('job_id, skill_id, raw_skill_text'),
      supabase.from('courses').select('id, course_name, district_id, institute_name, annual_seats, annual_completions'),
      supabase.from('course_skills').select('course_id, skill_id, coverage_level'),
      supabase.from('employer_signals').select('id, skill_id, district_id, sector_id, expected_hires'),
      supabase.from('time_series_metrics').select('id, skill_id, district_id, sector_id, period, metric_value'),
      supabase.from('districts').select('*'),
      supabase.from('sectors').select('*'),
      supabase.from('occupations').select('*')
    ]);

    if (resSkills.error) throw resSkills.error;
    if (resPostings.error) throw resPostings.error;
    if (resJobSkills.error) throw resJobSkills.error;

    dbSkills = resSkills.data || [];
    dbJobPostings = resPostings.data || [];
    dbJobSkills = resJobSkills.data || [];
    dbCourses = resCourses.data || [];
    dbCourseSkills = resCourseSkills.data || [];
    dbEmployerSignals = resEmployerSignals.data || [];
    dbTimeSeries = resTimeSeries.data || [];
    dbDistricts = resDistricts.data || [];
    dbSectors = resSectors.data || [];
    dbOccupations = resOccupations.data || [];
  } catch (err: any) {
    console.error('[Gap Engine Error] Database query failed:', err);
    fetchError = err?.message || 'Database connection error';
  }

  // Handle DB fetch errors explicitly
  if (fetchError || dbSkills.length === 0) {
    const errClass = classifyCoverageRatio(0);
    return [{
      skill_id: 'err-1',
      skill_name: 'Database Fetch Error',
      category: 'System',
      district_name: 'N/A',
      sector_name: 'N/A',
      demandScore: 0,
      uniqueJobPostings: 0,
      expectedHires: 0,
      directHiringDemand: 0,
      job_postings_count: 0,
      posting_percentage: 0,
      employer_signals_count: 0,
      growth_rate_pct: null,
      historical_data_available: false,
      annualSeats: 0,
      annualCompletions: 0,
      effectiveSupply: 0,
      courses_count: 0,
      annual_seats: 0,
      annual_completions: 0,
      curriculum_coverage: 0,
      coverageRatio: 0,
      coveragePercent: 0,
      physicalDeficit: 0,
      posting_demand_component: 0,
      employer_signal_component: 0,
      growth_component: 0,
      demand_score: 0,
      supplyScore: 0,
      supply_score: 0,
      netGap: 0,
      gap_score: 0,
      classification: errClass,
      is_database_derived: false,
      db_error: fetchError || 'No canonical skills found in database',
      signals_available: { job_postings: false, employer_signals: false, growth_history: false, course_seats: false },
      explainability: {
        summary: `Database query failed: ${fetchError || 'No records returned'}.`,
        coverage_explain: 'N/A',
        physical_deficit_explain: 'N/A',
        posting_component_explain: 'N/A',
        employer_component_explain: 'N/A',
        growth_component_explain: 'N/A',
        demand_formula: 'N/A',
        supply_formula: 'N/A',
        gap_formula: 'N/A',
        contributing_occupations: [],
        contributing_courses: []
      }
    }];
  }

  // Resolve District Name & Sector Name
  const districtObj = dbDistricts.find(d =>
    d.id === resolvedDistrictId ||
    d.id === districtId ||
    d.name.toLowerCase() === districtId.toLowerCase()
  );
  const targetDistrictId = districtObj ? districtObj.id : resolvedDistrictId;
  const districtName = resolvedDistrictId === 'ALL' ? 'All Maharashtra Districts' : (districtObj?.name || 'Selected District');

  const sectorObj = dbSectors.find(s =>
    s.id === resolvedSectorId ||
    s.id === sectorId ||
    s.name.toLowerCase() === sectorId.toLowerCase()
  );
  const targetSectorId = sectorObj ? sectorObj.id : resolvedSectorId;
  const sectorName = resolvedSectorId === 'ALL' ? 'All Industry Sectors' : (sectorObj?.name || 'Selected Sector');

  // Filter skills by category
  let targetSkills = dbSkills;
  if (category !== 'ALL') {
    targetSkills = dbSkills.filter(s => s.category.toLowerCase() === category.toLowerCase());
  }

  // Filter job postings by district and sector
  let filteredPostings = dbJobPostings;
  if (targetDistrictId !== 'ALL') {
    filteredPostings = filteredPostings.filter(jp => jp.district_id === targetDistrictId);
  }
  if (targetSectorId !== 'ALL') {
    filteredPostings = filteredPostings.filter(jp => jp.sector_id === targetSectorId);
  }

  const validPostingIds = new Set(filteredPostings.map(jp => jp.id));
  const totalFilteredPostings = filteredPostings.length || 1;

  // Filter courses by district
  let filteredCourses = dbCourses;
  if (targetDistrictId !== 'ALL') {
    filteredCourses = filteredCourses.filter(c => c.district_id === targetDistrictId);
  }
  const validCourseIds = new Set(filteredCourses.map(c => c.id));

  // Pre-calculate maximum postings count per skill across dataset for Demand Score normalization
  const skillPostingCountsMap = new Map<string, number>();
  targetSkills.forEach(skill => {
    const matchingJs = dbJobSkills.filter(js => js.skill_id === skill.id && validPostingIds.has(js.job_id));
    const uniqueJobIds = new Set(matchingJs.map(js => js.job_id));
    skillPostingCountsMap.set(skill.id, uniqueJobIds.size);
  });
  const maxObservedPostings = Math.max(...Array.from(skillPostingCountsMap.values()), 1);

  // Pre-calculate maximum employer signal expected hires for Demand Score normalization
  const skillEmpHiresMap = new Map<string, number>();
  targetSkills.forEach(skill => {
    const matchingSignals = dbEmployerSignals.filter(es =>
      es.skill_id === skill.id &&
      (targetDistrictId === 'ALL' || es.district_id === targetDistrictId) &&
      (targetSectorId === 'ALL' || es.sector_id === targetSectorId)
    );
    const totalHires = matchingSignals.reduce((sum, es) => sum + (es.expected_hires || 0), 0);
    skillEmpHiresMap.set(skill.id, totalHires);
  });
  const maxObservedEmpHires = Math.max(...Array.from(skillEmpHiresMap.values()), 1);

  // Calculate analytics for each skill
  const results: SkillGapAnalysisResult[] = targetSkills.map(skill => {
    // 1. Direct Hiring Demand
    const uniqueJobPostings = skillPostingCountsMap.get(skill.id) || 0;
    const postingPercentage = Math.round((uniqueJobPostings / totalFilteredPostings) * 100);

    const matchingSignals = dbEmployerSignals.filter(es =>
      es.skill_id === skill.id &&
      (resolvedDistrictId === 'ALL' || es.district_id === resolvedDistrictId) &&
      (resolvedSectorId === 'ALL' || es.sector_id === resolvedSectorId)
    );
    const employerSignalsCount = matchingSignals.length;
    const expectedHires = matchingSignals.reduce((sum, es) => sum + (es.expected_hires || 0), 0);
    
    // Validated Direct Hiring Demand = Unique Postings + Employer Expected Hires
    const directHiringDemand = uniqueJobPostings + expectedHires;

    // 2. Effective Supply Throughput
    const matchingCs = dbCourseSkills.filter(cs => cs.skill_id === skill.id && validCourseIds.has(cs.course_id));
    const matchingCourses = filteredCourses.filter(c => matchingCs.some(cs => cs.course_id === c.id));
    const coursesCount = matchingCourses.length;
    const annualSeats = matchingCourses.reduce((sum, c) => sum + (c.annual_seats || 0), 0);
    const annualCompletions = matchingCourses.reduce((sum, c) => sum + (c.annual_completions || 0), 0);
    const curriculumCoverage = coursesCount > 0 ? (skill.taxonomy_status === 'emerging' ? 30 : 85) : 0;

    // Effective Supply = 0.60 * Seats + 0.40 * Completions
    const effectiveSupply = Number((0.60 * annualSeats + 0.40 * annualCompletions).toFixed(1));

    // 3. Coverage Ratio & Coverage %
    // Coverage Ratio = Effective Supply / max(1, Direct Hiring Demand)
    const coverageRatio = Number((effectiveSupply / Math.max(1, directHiringDemand)).toFixed(4));
    const coveragePercent = Number((coverageRatio * 100).toFixed(2));

    // 4. Physical Deficit / Surplus
    // Physical Deficit = Direct Hiring Demand - Effective Supply
    const physicalDeficit = Number((directHiringDemand - effectiveSupply).toFixed(1));

    // 5. Preserved Validated Demand Score (0-100)
    const normPostingDemand = Math.min(100, Math.round((uniqueJobPostings / maxObservedPostings) * 100));
    const normEmployerDemand = employerSignalsCount > 0
      ? Math.min(100, Math.round((expectedHires / maxObservedEmpHires) * 100))
      : 0;

    const matchingTs = dbTimeSeries.filter(ts =>
      ts.skill_id === skill.id &&
      (resolvedDistrictId === 'ALL' || ts.district_id === resolvedDistrictId) &&
      (resolvedSectorId === 'ALL' || ts.sector_id === resolvedSectorId)
    );

    let growthRatePct: number | null = null;
    let hasHistoricalData = false;
    let normGrowthScore = 50;

    if (matchingTs.length >= 2) {
      const sorted = [...matchingTs].sort((a, b) => a.period.localeCompare(b.period));
      const earliest = sorted[0].metric_value;
      const latest = sorted[sorted.length - 1].metric_value;
      if (earliest > 0) {
        growthRatePct = Math.round(((latest - earliest) / earliest) * 100);
        hasHistoricalData = true;
        normGrowthScore = Math.min(100, Math.max(0, Math.round(50 + growthRatePct * 0.5)));
      }
    }

    let demandScore = 0;
    if (hasHistoricalData) {
      demandScore = Math.round(0.50 * normPostingDemand + 0.30 * normEmployerDemand + 0.20 * normGrowthScore);
    } else {
      demandScore = Math.round(0.65 * normPostingDemand + 0.35 * normEmployerDemand);
    }
    demandScore = Math.min(100, Math.max(0, demandScore));

    // 6. Demand-Aligned Supply Score (Secondary Visualization Metric)
    let supplyScore = 0;
    if (effectiveSupply > 0) {
      supplyScore = Math.min(100, Math.floor(coverageRatio * demandScore));
    }

    // 7. Net Gap Index (Normalized Index Difference)
    const gapScore = demandScore - supplyScore;

    // 8. Authoritative Coverage Classification
    const classification = classifyCoverageRatio(coveragePercent);

    // Contributing Occupations & Courses
    const contributingOccs = dbOccupations
      .filter(o => resolvedSectorId === 'ALL' || o.sector_id === resolvedSectorId)
      .map(o => `${o.title} (NCO-${o.nco_code})`)
      .slice(0, 3);

    const contributingCourseDetails = matchingCourses.map(c => ({
      course_name: c.course_name,
      institute_name: c.institute_name,
      seats: c.annual_seats,
      completions: c.annual_completions
    }));

    const explainability = {
      summary: `${skill.canonical_name} in ${districtName} (${sectorName}): Direct Demand = ${directHiringDemand} persons/yr, Effective Supply = ${effectiveSupply} persons/yr, Coverage = ${coveragePercent}% (${classification.label}).`,
      coverage_explain: `Coverage Ratio = ${effectiveSupply} Effective Supply / ${directHiringDemand} Hiring Demand = ${coveragePercent}%`,
      physical_deficit_explain: physicalDeficit > 0
        ? `Physical Deficit: +${physicalDeficit} persons/year unsupplied demand`
        : `Physical Surplus: ${physicalDeficit} persons/year effective throughput surplus`,
      posting_component_explain: `${uniqueJobPostings} unique job postings (${postingPercentage}% of market) → ${normPostingDemand}/100 posting score`,
      employer_component_explain: `${employerSignalsCount} employer signals (${expectedHires} expected hires) → ${normEmployerDemand}/100 employer score`,
      growth_component_explain: hasHistoricalData
        ? `Historical time-series growth ${growthRatePct}% → ${normGrowthScore}/100 growth score`
        : 'No historical time-series data available',
      demand_formula: hasHistoricalData
        ? `Demand Score = 0.50 × Posting Component (${normPostingDemand}) + 0.30 × Employer Component (${normEmployerDemand}) + 0.20 × Growth Component (${normGrowthScore}) = ${demandScore}`
        : `Demand Score = 0.65 × Posting Component (${normPostingDemand}) + 0.35 × Employer Component (${normEmployerDemand}) = ${demandScore}`,
      supply_formula: `Effective Supply = 0.60 × Seats (${annualSeats}) + 0.40 × Completions (${annualCompletions}) = ${effectiveSupply} persons/yr. Supply Score = min(100, floor(${coverageRatio} × ${demandScore})) = ${supplyScore}`,
      gap_formula: `Net Gap Index = Demand Score (${demandScore}) - Supply Score (${supplyScore}) = ${gapScore > 0 ? '+' : ''}${gapScore} (${classification.label})`,
      contributing_occupations: contributingOccs,
      contributing_courses: contributingCourseDetails
    };

    return {
      skill_id: skill.id,
      skill_name: skill.canonical_name,
      category: skill.category,
      district_id: resolvedDistrictId === 'ALL' ? undefined : resolvedDistrictId,
      district_name: districtName,
      sector_id: resolvedSectorId === 'ALL' ? undefined : resolvedSectorId,
      sector_name: sectorName,

      demandScore,
      uniqueJobPostings,
      expectedHires,
      directHiringDemand,

      job_postings_count: uniqueJobPostings,
      posting_percentage: postingPercentage,
      employer_signals_count: employerSignalsCount,
      growth_rate_pct: growthRatePct,
      historical_data_available: hasHistoricalData,

      annualSeats,
      annualCompletions,
      effectiveSupply,
      courses_count: coursesCount,
      annual_seats: annualSeats,
      annual_completions: annualCompletions,
      curriculum_coverage: curriculumCoverage,

      coverageRatio,
      coveragePercent,
      physicalDeficit,

      posting_demand_component: normPostingDemand,
      employer_signal_component: normEmployerDemand,
      growth_component: normGrowthScore,

      demand_score: demandScore,
      supplyScore,
      supply_score: supplyScore,
      netGap: gapScore,
      gap_score: gapScore,

      classification,
      is_database_derived: true,

      signals_available: {
        job_postings: uniqueJobPostings > 0,
        employer_signals: employerSignalsCount > 0,
        growth_history: hasHistoricalData,
        course_seats: coursesCount > 0
      },
      explainability
    };
  });

  return results;
}

/**
 * Persists calculated metrics into Supabase skill_demand_metrics and skill_supply_metrics.
 */
export async function persistMetricsToSupabase(results: SkillGapAnalysisResult[]): Promise<boolean> {
  try {
    const period = new Date().toISOString().slice(0, 7); // e.g. "2026-09"

    for (const res of results) {
      if (res.district_id && res.sector_id) {
        await supabase.from('skill_demand_metrics').upsert({
          district_id: res.district_id,
          sector_id: res.sector_id,
          skill_id: res.skill_id,
          period,
          posting_count: res.uniqueJobPostings,
          employer_demand: res.expectedHires,
          growth_rate: res.growth_rate_pct || 0,
          demand_score: res.demandScore,
          confidence: 90
        });

        await supabase.from('skill_supply_metrics').upsert({
          district_id: res.district_id,
          sector_id: res.sector_id,
          skill_id: res.skill_id,
          period,
          course_count: res.courses_count,
          annual_seats: res.annualSeats,
          annual_completions: res.annualCompletions,
          curriculum_coverage: res.curriculum_coverage,
          supply_score: res.supplyScore
        });
      }
    }
    return true;
  } catch (err) {
    console.warn('[Metrics Persist] Error persisting metrics to Supabase:', err);
    return false;
  }
}
