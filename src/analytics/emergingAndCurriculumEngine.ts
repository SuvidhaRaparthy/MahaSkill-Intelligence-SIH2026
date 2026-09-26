// MahaSkill Intelligence - Emerging Skills & Curriculum Alignment Analytics Engine (Phase 5)
import { supabase } from '../lib/supabase';
import { calculateSkillDemandSupplyGaps } from './demandSupplyGapEngine';

export const EMERGING_THRESHOLDS = {
  MIN_EMPLOYERS: 2,
  MIN_POSTINGS: 5,
  MIN_GROWTH_PCT: 20
};

export interface EmergingSkillItem {
  id: string;
  raw_term: string;
  canonical_name: string;
  category: string;
  taxonomy_status: 'official' | 'normalized' | 'emerging' | 'unmapped';
  recent_demand_count: number;
  growth_rate_pct: number | null;
  employer_count: number;
  district_count: number;
  districts_list: string[];
  sector_count: number;
  sectors_list: string[];
  first_observed_date: string;
  latest_observed_date: string;
  confidence: number;
  confidence_breakdown: string;
  evidence: {
    summary: string;
    sample_employers: string[];
    sample_districts: string[];
  };
  review_status: 'POTENTIAL_EMERGING_REVIEW' | 'TAXONOMY_ADDED' | 'UNDER_OBSERVATION';
}

export interface CurriculumCoverageItem {
  skill_id: string;
  skill_name: string;
  category: string;
  demand_score: number;
  supply_score: number;
  gap_score: number;
  direct_hiring_demand: number;
  effective_supply: number;
  courses_count: number;
  covering_courses: { course_name: string; institute_name: string; seats: number; completions: number }[];
  coverage_pct: number;
  coverage_status: 'FULLY COVERED' | 'PARTIALLY COVERED' | 'NOT COVERED' | 'OVERSUPPLIED';
}

export type RecommendationType =
  | 'ADD'
  | 'RETAIN'
  | 'REVIEW'
  | 'OVERSUPPLY'
  | 'POTENTIAL_OBSOLESCENCE'
  | 'POTENTIAL_OVERSUPPLY';

export interface EvidenceReference {
  id: string;
  source_type: string;
  source_reference: string;
  evidence_label: string;
  contribution_pct: number;
  explanation: string;
  is_synthetic: boolean;
  timestamp: string;
  confidence: number;
}

export interface CurriculumRecommendationItem {
  id: string;
  recommendation_type: RecommendationType;
  recommendation_label: string;
  badge_bg: string;
  badge_text: string;
  badge_border: string;
  skill_id: string;
  skill_name: string;
  course_id?: string;
  course_name?: string;
  category: string;
  district_name: string;
  sector_name: string;
  confidence: number;
  confidence_reason: string;
  reason: string;
  supporting_metrics: {
    demand_score: number;
    supply_score: number;
    gap_score: number;
    growth_rate_pct: number | null;
    employers_count: number;
    curriculum_coverage_pct: number;
    annual_seats: number;
    direct_hiring_demand: number;
    effective_supply: number;
    physical_deficit: number;
  };
  evidence_references: EvidenceReference[];
}

export interface FilterOptionsPhase5 {
  districtId?: string;
  sectorId?: string;
  category?: string;
  recommendationType?: string;
}

/**
 * 1. Detects Emerging Skills dynamically from Remote Supabase Database
 */
export async function detectEmergingSkills(filters: FilterOptionsPhase5 = {}): Promise<EmergingSkillItem[]> {
  const { districtId = 'ALL', sectorId = 'ALL' } = filters;

  const [
    { data: dbSkills },
    { data: dbPostings },
    { data: dbJobSkills },
    { data: dbEmployerSignals },
    { data: dbTimeSeries },
    { data: dbDistricts },
    { data: dbSectors }
  ] = await Promise.all([
    supabase.from('skills').select('*'),
    supabase.from('job_postings').select('*'),
    supabase.from('job_skills').select('*'),
    supabase.from('employer_signals').select('*'),
    supabase.from('time_series_metrics').select('*'),
    supabase.from('districts').select('*'),
    supabase.from('sectors').select('*')
  ]);

  const skills = dbSkills || [];
  const postings = dbPostings || [];
  const jobSkills = dbJobSkills || [];
  const empSignals = dbEmployerSignals || [];
  const timeSeries = dbTimeSeries || [];
  const districts = dbDistricts || [];
  const sectors = dbSectors || [];

  const districtMap = new Map<string, string>(districts.map((d: any) => [d.id, d.name]));
  const sectorMap = new Map<string, string>(sectors.map((s: any) => [s.id, s.name]));

  // Calculate dynamic metrics for each skill
  const candidates: EmergingSkillItem[] = [];

  for (const skill of skills) {
    // District / Sector filtering
    let relevantJobSkills = jobSkills.filter((js: any) => js.skill_id === skill.id);
    let relevantEmpSignals = empSignals.filter((es: any) => es.skill_id === skill.id);
    let relevantTS = timeSeries.filter((ts: any) => ts.skill_id === skill.id);

    if (districtId !== 'ALL') {
      const postingIdsInDist = new Set(postings.filter((p: any) => p.district_id === districtId).map((p: any) => p.id));
      relevantJobSkills = relevantJobSkills.filter((js: any) => postingIdsInDist.has(js.job_posting_id));
      relevantEmpSignals = relevantEmpSignals.filter((es: any) => es.district_id === districtId);
      relevantTS = relevantTS.filter((ts: any) => ts.district_id === districtId);
    }

    if (sectorId !== 'ALL') {
      const postingIdsInSector = new Set(postings.filter((p: any) => p.sector_id === sectorId).map((p: any) => p.id));
      relevantJobSkills = relevantJobSkills.filter((js: any) => postingIdsInSector.has(js.job_posting_id));
      relevantEmpSignals = relevantEmpSignals.filter((es: any) => es.sector_id === sectorId);
      relevantTS = relevantTS.filter((ts: any) => ts.sector_id === sectorId);
    }

    // Dynamic Growth % from time_series_metrics
    let growthPct: number | null = null;
    if (relevantTS.length >= 2) {
      const sorted = [...relevantTS].sort((a: any, b: any) => a.period.localeCompare(b.period));
      const earliest = Number(sorted[0].metric_value);
      const latest = Number(sorted[sorted.length - 1].metric_value);
      growthPct = Math.round(((latest - earliest) / Math.max(1, earliest)) * 10000) / 100;
    }

    const postingsCount = relevantJobSkills.length;
    const empSignalCount = relevantEmpSignals.length;

    // Distinct Employers
    const employerSet = new Set<string>();
    relevantJobSkills.forEach((js: any) => {
      const jp = postings.find((p: any) => p.id === js.job_posting_id);
      if (jp?.company) employerSet.add(jp.company);
    });

    // Distinct Districts
    const distSet = new Set<string>();
    relevantJobSkills.forEach((js: any) => {
      const jp = postings.find((p: any) => p.id === js.job_posting_id);
      if (jp?.district_id && districtMap.has(jp.district_id)) distSet.add(districtMap.get(jp.district_id)!);
    });
    relevantEmpSignals.forEach((es: any) => {
      if (es.district_id && districtMap.has(es.district_id)) distSet.add(districtMap.get(es.district_id)!);
    });

    // Distinct Sectors
    const secSet = new Set<string>();
    relevantJobSkills.forEach((js: any) => {
      const jp = postings.find((p: any) => p.id === js.job_posting_id);
      if (jp?.sector_id && sectorMap.has(jp.sector_id)) secSet.add(sectorMap.get(jp.sector_id)!);
    });

    // Emergence filter: status === 'emerging' OR growth >= 20% OR high posting/signal demand for unmapped skill
    const isEmergingCandidate =
      skill.taxonomy_status === 'emerging' ||
      (growthPct !== null && growthPct >= 20) ||
      (postingsCount >= 5 && skill.category.toLowerCase().includes('emerging'));

    if (isEmergingCandidate) {
      const confidence = Math.min(95, Math.max(60, 50 + employerSet.size * 5 + postingsCount));
      const distList = Array.from(distSet);
      if (distList.length === 0) distList.push('Maharashtra');

      const secList = Array.from(secSet);
      if (secList.length === 0) secList.push('Cross-Sector');

      candidates.push({
        id: skill.id,
        raw_term: skill.canonical_name,
        canonical_name: skill.canonical_name,
        category: skill.category,
        taxonomy_status: skill.taxonomy_status as any,
        recent_demand_count: postingsCount,
        growth_rate_pct: growthPct,
        employer_count: employerSet.size + empSignalCount,
        district_count: distList.length,
        districts_list: distList,
        sector_count: secList.length,
        sectors_list: secList,
        first_observed_date: '2025-07-01',
        latest_observed_date: '2026-03-01',
        confidence,
        confidence_breakdown: `Confidence ${confidence}%: Derived from ${postingsCount} verified job postings, ${empSignalCount} employer signals, and dynamic quarterly metrics.`,
        evidence: {
          summary: `Observed ${postingsCount} job postings across ${employerSet.size || 1} distinct employers${growthPct !== null ? ` with ${growthPct > 0 ? '+' : ''}${growthPct}% period growth` : ''}.`,
          sample_employers: Array.from(employerSet).slice(0, 4),
          sample_districts: distList
        },
        review_status: 'POTENTIAL_EMERGING_REVIEW'
      });
    }
  }

  return candidates;
}

/**
 * 2. Calculates Curriculum Coverage using Phase 4.4 Outputs
 */
export async function calculateCurriculumCoverage(filters: FilterOptionsPhase5 = {}): Promise<CurriculumCoverageItem[]> {
  const gapResults = await calculateSkillDemandSupplyGaps(filters);

  return gapResults.map((gap) => {
    const coveragePct = gap.coveragePercent;
    let status: CurriculumCoverageItem['coverage_status'] = 'NOT COVERED';

    if (coveragePct > 200) {
      status = 'OVERSUPPLIED';
    } else if (coveragePct >= 90) {
      status = 'FULLY COVERED';
    } else if (coveragePct > 0) {
      status = 'PARTIALLY COVERED';
    } else {
      status = 'NOT COVERED';
    }

    return {
      skill_id: gap.skill_id,
      skill_name: gap.skill_name,
      category: gap.category,
      demand_score: gap.demand_score,
      supply_score: gap.supply_score,
      gap_score: gap.gap_score,
      direct_hiring_demand: gap.directHiringDemand,
      effective_supply: gap.effectiveSupply,
      courses_count: gap.courses_count,
      covering_courses: gap.explainability.contributing_courses,
      coverage_pct: Math.round(coveragePct * 100) / 100,
      coverage_status: status
    };
  });
}

/**
 * 3. Generates Deterministic Evidence-Based Curriculum Alignment Recommendations
 */
export async function generateCurriculumRecommendations(
  filters: FilterOptionsPhase5 = {}
): Promise<CurriculumRecommendationItem[]> {
  const { districtId = 'ALL', sectorId = 'ALL', recommendationType = 'ALL' } = filters;

  const [gapResults, { data: dbTimeSeries }] = await Promise.all([
    calculateSkillDemandSupplyGaps({ districtId, sectorId }),
    supabase.from('time_series_metrics').select('*')
  ]);

  const timeSeries = dbTimeSeries || [];
  const recommendations: CurriculumRecommendationItem[] = [];

  gapResults.forEach((gap, idx) => {
    // Calculate dynamic growth rate from time_series_metrics
    let tsForSkill = timeSeries.filter((ts: any) => ts.skill_id === gap.skill_id);
    if (districtId !== 'ALL') tsForSkill = tsForSkill.filter((ts: any) => ts.district_id === districtId);

    let growthPct: number | null = null;
    if (tsForSkill.length >= 2) {
      const sorted = [...tsForSkill].sort((a: any, b: any) => a.period.localeCompare(b.period));
      const earliest = Number(sorted[0].metric_value);
      const latest = Number(sorted[sorted.length - 1].metric_value);
      growthPct = Math.round(((latest - earliest) / Math.max(1, earliest)) * 10000) / 100;
    }

    const CR = gap.coveragePercent; // Phase 4.4 Coverage %
    const demand = gap.directHiringDemand;
    const supply = gap.effectiveSupply;

    let recType: RecommendationType = 'REVIEW';
    let label = 'REVIEW CURRICULUM ALIGNMENT';
    let badgeBg = 'bg-amber-950/60';
    let badgeText = 'text-amber-300';
    let badgeBorder = 'border-amber-700/60';
    let reason = '';

    // STRICT DETERMINISTIC RECOMMENDATION RULES
    // Rule 1: ADD — High demand or emerging growth with CR < 50%
    if ((demand > 0 || (growthPct !== null && growthPct >= 20)) && CR < 50) {
      recType = 'ADD';
      label = 'ADD / CURRICULUM UPDATE SIGNAL';
      badgeBg = 'bg-indigo-950/60';
      badgeText = 'text-indigo-300';
      badgeBorder = 'border-indigo-700/60';
      reason = `Market demand (${demand} persons/yr) exists with critically low/zero vocational curriculum coverage (${CR.toFixed(1)}%). Curriculum addition required.`;
    }
    // Rule 2: RETAIN — Market demand with balanced coverage (90% <= CR <= 125%)
    else if (demand > 0 && CR >= 90 && CR <= 125) {
      recType = 'RETAIN';
      label = 'RETAIN CURRICULUM MODULE';
      badgeBg = 'bg-emerald-950/60';
      badgeText = 'text-emerald-300';
      badgeBorder = 'border-emerald-700/60';
      reason = `Market demand (${demand} persons/yr) is well-matched by existing vocational course capacity (${supply} effective supply, ${CR.toFixed(1)}% coverage). Retain current module.`;
    }
    // Rule 3: OVERSUPPLY — CR > 200% OR (CR > 125% with negative growth)
    else if (CR > 200 || (CR > 125 && growthPct !== null && growthPct < 0)) {
      recType = 'OVERSUPPLY';
      label = 'OVERSUPPLY SIGNAL — REVIEW CAPACITY';
      badgeBg = 'bg-rose-950/60';
      badgeText = 'text-rose-300';
      badgeBorder = 'border-rose-700/60';
      reason = `Training throughput (${supply} persons/yr) materially exceeds market hiring demand (${demand} persons/yr) at ${CR.toFixed(1)}% coverage. Seat capacity review recommended.`;
    }
    // Rule 4: REVIEW — 50% <= CR < 90% OR 125% < CR <= 200%
    else if ((CR >= 50 && CR < 90) || (CR > 125 && CR <= 200)) {
      recType = 'REVIEW';
      label = 'REVIEW CURRICULUM ALIGNMENT';
      badgeBg = 'bg-amber-950/60';
      badgeText = 'text-amber-300';
      badgeBorder = 'border-amber-700/60';
      reason = `Moderate coverage mismatch (${CR.toFixed(1)}% coverage against ${demand} demand). Curriculum alignment and seat allocation review recommended.`;
    }

    // Filter by recommendation type if selected
    if (recommendationType !== 'ALL' && recType !== recommendationType) return;

    // Confidence Calculation
    const employerCount = gap.employer_signals_count || 0;
    const confidence = Math.min(95, Math.max(65, 55 + employerCount * 5 + (gap.job_postings_count > 10 ? 15 : 5)));
    const confidenceReason = `Confidence ${confidence}%: Derived from ${gap.job_postings_count} verified job postings, ${employerCount} employer signals, and Phase 4.4 coverage analytics.`;

    // Evidence References from Database Evidence
    const evidenceReferences: EvidenceReference[] = [
      {
        id: `ev-1-${idx}`,
        source_type: 'Job Postings Signal',
        source_reference: 'National Career Service Portal',
        evidence_label: `${gap.job_postings_count} Job Postings Analyzed`,
        contribution_pct: 45,
        explanation: `${gap.job_postings_count} job postings requesting ${gap.skill_name} in ${gap.district_name}.`,
        is_synthetic: true,
        timestamp: '2026-03-01',
        confidence: 92
      },
      {
        id: `ev-2-${idx}`,
        source_type: 'Employer Survey Signals',
        source_reference: 'MahaSkill Employer Portal',
        evidence_label: `${employerCount} Verified Employer Hiring Signals`,
        contribution_pct: 35,
        explanation: `${employerCount} employers confirmed active hiring demand (${gap.expectedHires} expected hires) for ${gap.skill_name}.`,
        is_synthetic: true,
        timestamp: '2026-03-01',
        confidence: 88
      },
      {
        id: `ev-3-${idx}`,
        source_type: 'Vocational Training Enrolment',
        source_reference: 'MahaSwayam ITI Database',
        evidence_label: `${gap.annual_seats} Annual Seats & ${gap.annual_completions} Completions`,
        contribution_pct: 20,
        explanation: `${gap.courses_count} courses providing ${gap.effectiveSupply} effective supply across regional institutes.`,
        is_synthetic: true,
        timestamp: '2026-03-01',
        confidence: 95
      }
    ];

    recommendations.push({
      id: `rec-${gap.skill_id}-${idx}`,
      recommendation_type: recType,
      recommendation_label: label,
      badge_bg: badgeBg,
      badge_text: badgeText,
      badge_border: badgeBorder,
      skill_id: gap.skill_id,
      skill_name: gap.skill_name,
      course_name: gap.explainability.contributing_courses[0]?.course_name || `No Vocational Course Mapped`,
      category: gap.category,
      district_name: gap.district_name,
      sector_name: gap.sector_name,
      confidence,
      confidence_reason: confidenceReason,
      reason,
      supporting_metrics: {
        demand_score: gap.demand_score,
        supply_score: gap.supply_score,
        gap_score: gap.gap_score,
        growth_rate_pct: growthPct,
        employers_count: employerCount,
        curriculum_coverage_pct: Math.round(CR * 100) / 100,
        annual_seats: gap.annual_seats,
        direct_hiring_demand: demand,
        effective_supply: supply,
        physical_deficit: gap.physicalDeficit
      },
      evidence_references: evidenceReferences
    });
  });

  return recommendations;
}
