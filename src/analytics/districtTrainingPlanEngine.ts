// MahaSkill Intelligence - District Training Plan Generator Engine (Phase 7)
import { calculateSkillDemandSupplyGaps } from './demandSupplyGapEngine';
import {
  calculateEmployerValidationSummary,
  calculateTrainerCapacity,
  calculateEquipmentCapacity,
  calculateTrainingReadiness
} from './capacityAndValidationEngine';
import { generateCurriculumRecommendations, detectEmergingSkills } from './emergingAndCurriculumEngine';

/**
 * Configurable Priority Thresholds per Phase 7 specifications
 */
export const PRIORITY_THRESHOLDS = {
  HIGH: 70,
  MEDIUM: 40
};

export type PriorityLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface PriorityClassification {
  level: PriorityLevel;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

export function classifyDistrictPriority(score: number): PriorityClassification {
  if (score >= PRIORITY_THRESHOLDS.HIGH) {
    return {
      level: 'HIGH',
      badgeBg: 'bg-rose-950/60',
      badgeText: 'text-rose-300',
      badgeBorder: 'border-rose-700/60'
    };
  }
  if (score >= PRIORITY_THRESHOLDS.MEDIUM) {
    return {
      level: 'MEDIUM',
      badgeBg: 'bg-amber-950/60',
      badgeText: 'text-amber-300',
      badgeBorder: 'border-amber-700/60'
    };
  }
  return {
    level: 'LOW',
    badgeBg: 'bg-slate-900/60',
    badgeText: 'text-slate-400',
    badgeBorder: 'border-slate-700/60'
  };
}

export interface DistrictTrainingPlanItem {
  id: string;
  district_name: string;
  sector_name: string;
  skill_id: string;
  skill_name: string;
  course_name: string;
  priority: PriorityClassification;
  priority_score: number;

  // Demand & Supply Metrics (Phase 4.4)
  direct_hiring_demand: number;
  effective_supply: number;
  coverage_pct: number;
  physical_deficit: number;
  coverage_classification: string;

  // Capacity & Seat Recommendations
  current_annual_capacity: number;
  estimated_required_capacity: number;
  estimated_additional_seats: number;
  seat_calculation_explainability: string;

  // Trainer Metrics (Phase 6)
  current_trainers: number;
  required_trainers: number;
  trainer_gap: number;
  estimated_additional_trainers: number;
  trainer_assumption_label: string;

  // Equipment Metrics (Phase 6)
  equipment_type: string;
  current_equipment_units: number;
  required_equipment_units: number;
  equipment_gap: number;
  estimated_additional_equipment: number;

  // Validation & Curriculum Alignment (Phase 5 & Phase 6)
  employer_validation_score: number;
  employer_expected_hires: number;
  employers_agree_count: number;
  curriculum_action: string;
  growth_rate_pct: number | null;

  // Readiness (Phase 6)
  readiness_score: number;
  readiness_classification: string;

  // Governance & Evidence
  why_this_district: string;
  why_this_district_breakdown: {
    job_postings_count: number;
    expected_hires: number;
    direct_demand: number;
    effective_supply: number;
    coverage_pct: number;
    coverage_classification: string;
    growth_rate_pct: number | null;
    curriculum_action: string;
    available_trainers: number;
    required_trainers: number;
    available_equipment: number;
    required_equipment: number;
    readiness_score: number;
    readiness_classification: string;
  };
  recommended_actions: string[];
  confidence_score: number;
  confidence_reason: string;
  is_synthetic: boolean;
}

export interface DistrictComparisonSummary {
  district_name: string;
  highest_priority_level: PriorityLevel;
  high_priority_count: number;
  top_skill_gaps: string[];
  total_additional_seats: number;
  total_trainer_shortage: number;
  total_equipment_shortage: number;
  avg_employer_validation: number;
  overall_readiness_status: string;
  major_shortage_skills: string[];
  major_oversupply_skills: string[];
}

export interface PlanFilterOptions {
  districtName?: string;
  sectorName?: string;
  skillName?: string;
  priorityLevel?: string;
  period?: string;
}

/**
 * Helper to compute Coverage Shortage Score (0-100) per Phase 7 specs
 */
function computeCoverageShortageScore(coveragePercent: number): number {
  if (coveragePercent < 50) return 100;
  if (coveragePercent < 90) return 75;
  if (coveragePercent <= 125) return 40;
  if (coveragePercent <= 200) return 15;
  return 0;
}

/**
 * Helper to compute Growth Pressure Score (0-100) per Phase 7 specs
 */
function computeGrowthPressureScore(growthPct: number | null): number {
  if (growthPct === null || growthPct <= 0) return 0;
  if (growthPct < 20) return 50;
  if (growthPct < 50) return 75;
  return 100;
}

/**
 * 1. Generates Structured District Training Plans with Deterministic Priority Scoring
 */
export async function generateDistrictTrainingPlans(
  filters: PlanFilterOptions = {}
): Promise<DistrictTrainingPlanItem[]> {
  const { districtName = 'ALL', sectorName = 'ALL', priorityLevel = 'ALL' } = filters;

  const targetDistricts = districtName === 'ALL' ? ['Pune', 'Nashik', 'Nagpur'] : [districtName];

  const [
    allGapsArrays,
    recommendations,
    readinessArrays,
    emergingSkills
  ] = await Promise.all([
    Promise.all(targetDistricts.map(d => calculateSkillDemandSupplyGaps({ districtId: d, sectorId: sectorName === 'ALL' ? 'ALL' : sectorName }))),
    generateCurriculumRecommendations(),
    Promise.all(targetDistricts.map(d => calculateTrainingReadiness(d))),
    detectEmergingSkills()
  ]);

  const gapResults = allGapsArrays.flat();
  const readinessData = readinessArrays.flat();

  // Calculate dynamic maximums for normalization across dataset scope
  const maxDirectDemand = Math.max(1, ...gapResults.map((g) => g.directHiringDemand));

  // Collect validation summaries and capacity data per district-skill
  const valSummaries = await Promise.all(
    gapResults.map((g) => calculateEmployerValidationSummary(g.skill_name, g.district_name))
  );
  const maxExpectedHires = Math.max(1, ...valSummaries.map((v) => v.expected_hires_sum));

  const trainerDataAll = await calculateTrainerCapacity('ALL');
  const equipmentDataAll = await calculateEquipmentCapacity('ALL');

  const plans: DistrictTrainingPlanItem[] = [];

  for (let i = 0; i < gapResults.length; i++) {
    const gap = gapResults[i];
    const valSummary = valSummaries[i];

    const recMatch = recommendations.find((r) =>
      r.skill_id === gap.skill_id ||
      r.skill_name.toLowerCase() === gap.skill_name.toLowerCase()
    );

    const tMatch = trainerDataAll.find((t) =>
      t.district_name.toLowerCase() === gap.district_name.toLowerCase() &&
      (t.skill_name.toLowerCase().includes(gap.skill_name.toLowerCase()) || gap.skill_name.toLowerCase().includes(t.skill_name.toLowerCase()))
    );

    const eMatch = equipmentDataAll.find((e) =>
      e.district_name.toLowerCase() === gap.district_name.toLowerCase() &&
      (e.skill_name.toLowerCase().includes(gap.skill_name.toLowerCase()) || gap.skill_name.toLowerCase().includes(e.skill_name.toLowerCase()))
    );

    const readinessMatch = readinessData.find((r) =>
      r.district_name.toLowerCase() === gap.district_name.toLowerCase() &&
      r.skill_name.toLowerCase().includes(gap.skill_name.toLowerCase())
    );

    const emMatch = emergingSkills.find((em) =>
      em.canonical_name.toLowerCase() === gap.skill_name.toLowerCase()
    );

    const growthPct = emMatch?.growth_rate_pct ?? recMatch?.supporting_metrics?.growth_rate_pct ?? gap.growth_rate_pct;

    // Component Scores for Deterministic Priority Formula (Section 4 & 5)
    const coverageShortageScore = computeCoverageShortageScore(gap.coveragePercent);
    const demandPressure = Math.min(100, Math.floor((gap.directHiringDemand / maxDirectDemand) * 100));
    const employerPressure = valSummary.expected_hires_sum > 0
      ? Math.min(100, Math.floor((valSummary.expected_hires_sum / maxExpectedHires) * 100))
      : 0;
    const growthPressure = computeGrowthPressureScore(growthPct);

    // Final Weighted Priority Score (0-100): 0.35 Shortage + 0.25 Demand + 0.20 Employer + 0.20 Growth
    const priorityScore = Math.min(
      100,
      Math.floor(
        0.35 * coverageShortageScore +
        0.25 * demandPressure +
        0.20 * employerPressure +
        0.20 * growthPressure
      )
    );

    const priorityClass = classifyDistrictPriority(priorityScore);

    // Filter checks
    if (priorityLevel !== 'ALL' && priorityClass.level !== priorityLevel) continue;
    if (districtName !== 'ALL' && gap.district_name.toLowerCase() !== districtName.toLowerCase()) continue;

    // Curriculum Action from Phase 5 Engine
    const curriculumAction = recMatch?.recommendation_type || (gap.coveragePercent > 200 ? 'OVERSUPPLY' : 'REVIEW');

    // Seat Calculations (Section 7 & 14): max(0, ceil(Direct Demand - Effective Supply)) (0 if OVERSUPPLY)
    const isOversupply = curriculumAction === 'OVERSUPPLY' || gap.coveragePercent > 200;
    const additionalSeats = isOversupply
      ? 0
      : Math.max(0, Math.ceil(gap.directHiringDemand - gap.effectiveSupply));

    const currentSeats = gap.annualSeats;
    const estimatedRequiredSeats = currentSeats + additionalSeats;

    const seatExplainability = additionalSeats > 0
      ? `Planning Estimate: Direct Hiring Demand (${gap.directHiringDemand}) exceeds Effective Supply (${gap.effectiveSupply} grads/yr). Estimated additional capacity required: +${additionalSeats} seats/yr.`
      : (isOversupply
        ? `Capacity Oversupply: Effective Supply (${gap.effectiveSupply} grads/yr) exceeds Direct Hiring Demand (${gap.directHiringDemand} jobs/yr) at ${gap.coveragePercent.toFixed(1)}% coverage. Recommend capacity review and reallocation.`
        : `Capacity Equilibrium: Effective Supply (${gap.effectiveSupply} grads/yr) satisfies Direct Hiring Demand (${gap.directHiringDemand} jobs/yr) at ${gap.coveragePercent.toFixed(1)}% coverage. No additional seats required.`);

    // Trainer Metrics (Section 8 - Phase 6 Rule)
    const currentTrainers = tMatch ? tMatch.available_trainers : 0;
    const requiredTrainers = currentSeats > 0 ? Math.ceil(currentSeats / 35) : Math.ceil(gap.directHiringDemand / 35);
    const trainerGap = currentTrainers - requiredTrainers;
    const additionalTrainers = Math.max(0, requiredTrainers - currentTrainers);
    const trainerAssumptionLabel = currentSeats > 0
      ? 'Rule A (Mapped Skill): ceil(Annual Course Seats / 35 trainees per trainer)'
      : 'Rule B (Unmapped Skill): ceil(Direct Hiring Demand / 35 trainees per trainer)';

    // Equipment Metrics (Section 9 - Phase 6 Rule)
    const isITSkill = gap.category.toLowerCase().includes('software') || gap.category.toLowerCase().includes('it') || gap.skill_name.toLowerCase().includes('react') || gap.skill_name.toLowerCase().includes('php') || gap.skill_name.toLowerCase().includes('ai');
    const currentEquipment = eMatch ? eMatch.available_quantity : 0;
    const trainingRequirement = currentSeats > 0 ? currentSeats : gap.directHiringDemand;
    const requiredEquipment = isITSkill ? Math.ceil(trainingRequirement / 10) : Math.ceil(Math.min(30, trainingRequirement) / 3);
    const equipmentGap = currentEquipment - requiredEquipment;
    const additionalEquipment = Math.max(0, requiredEquipment - currentEquipment);
    const equipmentType = eMatch ? eMatch.equipment_type : (isITSkill ? 'High-Performance Developer Computer Workstations' : `${gap.skill_name} Diagnostic Bench`);

    // Readiness Metrics (Phase 6 Integration)
    const readinessScore = readinessMatch ? readinessMatch.overall_readiness_score : 50;
    const readinessClassification = readinessMatch ? readinessMatch.overall_status : 'MODERATE READINESS';

    // Governance Action Recommendations (Section 11 & 14)
    const recActions: string[] = [];
    if (additionalSeats > 0) recActions.push(`Increase annual training seat capacity (+${additionalSeats} seats/yr)`);
    if (additionalTrainers > 0) recActions.push(`Recruit and certify instructors (+${additionalTrainers} instructor${additionalTrainers > 1 ? 's' : ''})`);
    if (additionalEquipment > 0) recActions.push(`Procure practical equipment (+${additionalEquipment} unit${additionalEquipment > 1 ? 's' : ''})`);

    if (curriculumAction === 'ADD') recActions.push(`Add ${gap.skill_name} module to regional ITI/Polytechnic curriculum`);
    else if (curriculumAction === 'RETAIN') recActions.push(`Retain current ${gap.skill_name} vocational course module`);
    else if (curriculumAction === 'OVERSUPPLY') {
      recActions.push(`Avoid capacity expansion for oversupplied skill`);
      recActions.push(`Review seat intake and reallocate lab equipment to shortage skills`);
    } else recActions.push(`Review curriculum alignment and module learning outcomes`);

    if (valSummary.validating_employers_count > 0) recActions.push(`Formalize enterprise apprenticeship partnership in ${gap.district_name}`);

    // "Why This District?" Detailed Traceability Explanation (Section 12)
    const whyThisDistrict = `Why ${gap.district_name} + ${gap.skill_name}?\n\n` +
      `1. Labour Demand\n   ${gap.job_postings_count} unique job postings\n\n` +
      `2. Employer Demand\n   ${valSummary.expected_hires_sum} expected hires from ${valSummary.validating_employers_count} employer signal${valSummary.validating_employers_count === 1 ? '' : 's'}\n\n` +
      `3. Direct Hiring Demand\n   ${gap.directHiringDemand}\n\n` +
      `4. Effective Supply\n   ${gap.effectiveSupply}\n\n` +
      `5. Coverage\n   ${gap.coveragePercent.toFixed(2)}% — ${gap.classification.label.toUpperCase()}\n\n` +
      `6. Growth\n   ${growthPct !== null ? `${growthPct > 0 ? '+' : ''}${growthPct}%` : 'Stable demand'}\n\n` +
      `7. Curriculum Signal\n   ${curriculumAction}\n\n` +
      `8. Trainer Capacity\n   ${currentTrainers} available / ${requiredTrainers} required (${trainerGap < 0 ? `Gap: ${trainerGap}` : 'Sufficient'})\n\n` +
      `9. Equipment Capacity\n   ${currentEquipment} available / ${requiredEquipment} required (${equipmentGap < 0 ? `Gap: ${equipmentGap}` : 'Sufficient'})\n\n` +
      `10. Readiness\n    ${readinessScore}/100 — ${readinessClassification}`;

    const whyBreakdown = {
      job_postings_count: gap.job_postings_count,
      expected_hires: valSummary.expected_hires_sum,
      direct_demand: gap.directHiringDemand,
      effective_supply: gap.effectiveSupply,
      coverage_pct: Math.round(gap.coveragePercent * 100) / 100,
      coverage_classification: gap.classification.label,
      growth_rate_pct: growthPct,
      curriculum_action: curriculumAction,
      available_trainers: currentTrainers,
      required_trainers: requiredTrainers,
      available_equipment: currentEquipment,
      required_equipment: requiredEquipment,
      readiness_score: readinessScore,
      readiness_classification: readinessClassification
    };

    const confidenceScore = Math.min(95, Math.max(70, 60 + valSummary.validating_employers_count * 5 + (gap.job_postings_count > 15 ? 15 : 5)));
    const confidenceReason = `Confidence Score ${confidenceScore}%: Derived from verified NCS job postings (${gap.job_postings_count}), employer signals (${valSummary.expected_hires_sum} expected hires), and Phase 4.4/5/6 engine outputs.`;

    plans.push({
      id: `plan-${gap.district_name}-${gap.skill_id}-${i}`,
      district_name: gap.district_name,
      sector_name: gap.sector_name,
      skill_id: gap.skill_id,
      skill_name: gap.skill_name,
      course_name: gap.explainability.contributing_courses[0]?.course_name || `${gap.skill_name} Vocational Module`,
      priority: priorityClass,
      priority_score: priorityScore,

      direct_hiring_demand: gap.directHiringDemand,
      effective_supply: gap.effectiveSupply,
      coverage_pct: Math.round(gap.coveragePercent * 100) / 100,
      physical_deficit: gap.physicalDeficit,
      coverage_classification: gap.classification.label,

      current_annual_capacity: currentSeats,
      estimated_required_capacity: estimatedRequiredSeats,
      estimated_additional_seats: additionalSeats,
      seat_calculation_explainability: seatExplainability,

      current_trainers: currentTrainers,
      required_trainers: requiredTrainers,
      trainer_gap: trainerGap,
      estimated_additional_trainers: additionalTrainers,
      trainer_assumption_label: trainerAssumptionLabel,

      equipment_type: equipmentType,
      current_equipment_units: currentEquipment,
      required_equipment_units: requiredEquipment,
      equipment_gap: equipmentGap,
      estimated_additional_equipment: additionalEquipment,

      employer_validation_score: valSummary.industry_validation_score,
      employer_expected_hires: valSummary.expected_hires_sum,
      employers_agree_count: valSummary.validating_employers_count,
      curriculum_action: curriculumAction,
      growth_rate_pct: growthPct,

      readiness_score: readinessScore,
      readiness_classification: readinessClassification,

      why_this_district: whyThisDistrict,
      why_this_district_breakdown: whyBreakdown,
      recommended_actions: recActions,
      confidence_score: confidenceScore,
      confidence_reason: confidenceReason,
      is_synthetic: true
    });
  }

  // Sort by Priority Score descending
  return plans.sort((a, b) => b.priority_score - a.priority_score);
}

/**
 * 2. Generates Side-by-Side District Comparison Summaries (Pune vs Nashik vs Nagpur)
 */
export async function generateDistrictComparisons(): Promise<DistrictComparisonSummary[]> {
  const targetDistricts = ['Pune', 'Nashik', 'Nagpur'];
  const summaries: DistrictComparisonSummary[] = [];

  for (const dName of targetDistricts) {
    const plans = await generateDistrictTrainingPlans({ districtName: dName });

    const totalSeats = plans.reduce((sum, p) => sum + p.estimated_additional_seats, 0);
    const totalTrainers = plans.reduce((sum, p) => sum + p.estimated_additional_trainers, 0);
    const totalEquipment = plans.reduce((sum, p) => sum + p.estimated_additional_equipment, 0);
    const highPriorityCount = plans.filter((p) => p.priority.level === 'HIGH').length;
    const highestPriority = highPriorityCount > 0 ? 'HIGH' : (plans.some((p) => p.priority.level === 'MEDIUM') ? 'MEDIUM' : 'LOW');

    const topGaps = plans.filter((p) => p.estimated_additional_seats > 0 || p.priority.level === 'HIGH').map((p) => p.skill_name);
    const majorShortageSkills = plans.filter((p) => p.coverage_pct < 50 || p.estimated_additional_seats > 0).map((p) => p.skill_name);
    const majorOversupplySkills = plans.filter((p) => p.coverage_pct > 200 || p.curriculum_action === 'OVERSUPPLY').map((p) => p.skill_name);

    const avgValScore = plans.length > 0
      ? Math.round(plans.reduce((sum, p) => sum + p.employer_validation_score, 0) / plans.length)
      : 0;

    summaries.push({
      district_name: dName,
      highest_priority_level: highestPriority,
      high_priority_count: highPriorityCount,
      top_skill_gaps: topGaps,
      total_additional_seats: totalSeats,
      total_trainer_shortage: totalTrainers,
      total_equipment_shortage: totalEquipment,
      avg_employer_validation: avgValScore,
      overall_readiness_status: totalSeats > 100 || totalTrainers > 5 ? 'CAPACITY INVESTMENT REQUIRED' : 'MODERATE READINESS',
      major_shortage_skills: majorShortageSkills,
      major_oversupply_skills: majorOversupplySkills
    });
  }

  return summaries;
}
