// MahaSkill Intelligence - Policy What-If Simulator Engine (Phase 8)
import { supabase } from '../lib/supabase';
import type { SimulationRecord } from '../types/database';
import { calculateSkillDemandSupplyGaps, classifyCoverageRatio } from './demandSupplyGapEngine';
import {
  calculateTrainerCapacity,
  calculateEquipmentCapacity,
  calculateTrainingReadiness
} from './capacityAndValidationEngine';
import { calculateCurriculumCoverage, generateCurriculumRecommendations } from './emergingAndCurriculumEngine';
import { generateDistrictTrainingPlans } from './districtTrainingPlanEngine';

export interface BaselineScenarioMetrics {
  district_name: string;
  sector_name: string;
  skill_id: string;
  skill_name: string;
  category: string;
  course_name: string;
  direct_demand: number;
  annual_seats: number;
  annual_completions: number;
  effective_supply: number;
  coverage_pct: number;
  physical_deficit: number;
  demand_score: number;
  supply_score: number;
  gap_score: number;
  net_gap_index: number;
  growth_rate_pct: number | null;
  curriculum_action: string;
  trainers_available: number;
  trainers_required: number;
  trainer_gap: number;
  equipment_available: number;
  equipment_required: number;
  equipment_gap: number;
  curriculum_coverage_pct: number;
  priority_level: string;
  priority_score: number;
  readiness_score: number;
  readiness_classification: string;
}

export interface SimulationInputs {
  additional_seats: number;
  additional_trainers: number;
  additional_equipment: number;
  curriculum_module_added: boolean;
}

export interface SimulationResult {
  scenario_name: string;
  inputs: SimulationInputs;
  baseline: BaselineScenarioMetrics;
  simulated: {
    annual_seats: number;
    effective_supply: number;
    coverage_pct: number;
    coverage_classification: string;
    physical_deficit: number;
    supply_score: number;
    gap_score: number;
    net_gap_index: number;
    trainers_available: number;
    trainers_required: number;
    trainer_gap: number;
    equipment_available: number;
    equipment_required: number;
    equipment_gap: number;
    curriculum_coverage_pct: number;
    priority_score: number;
    priority_level: string;
    readiness_score: number;
    readiness_classification: string;
  };
  impact: {
    gap_improvement: number;
    physical_deficit_improvement: number;
    trainer_gap_improvement: number;
    equipment_gap_improvement: number;
    readiness_improvement: number;
    tradeoffs: string[];
  };
  assumptions: string[];
  is_simulation: boolean;
}

/**
 * 1. Retrieves real, empirical baseline metrics for a target district + skill combination
 */
export async function getBaselineScenarioMetrics(
  districtName: string = 'Pune',
  skillName: string = 'EV Battery Diagnostics'
): Promise<BaselineScenarioMetrics> {
  const [
    gapResults,
    plans,
    coverageList,
    recommendations,
    trainerList,
    equipmentList,
    readinessList
  ] = await Promise.all([
    calculateSkillDemandSupplyGaps({ districtId: districtName }),
    generateDistrictTrainingPlans({ districtName: districtName }),
    calculateCurriculumCoverage(),
    generateCurriculumRecommendations(),
    calculateTrainerCapacity(districtName),
    calculateEquipmentCapacity(districtName),
    calculateTrainingReadiness(districtName)
  ]);

  const matchedGap = gapResults.find(
    (g) => g.skill_name.toLowerCase().includes(skillName.toLowerCase()) || skillName.toLowerCase().includes(g.skill_name.toLowerCase())
  ) || gapResults[0];

  const matchedPlan = plans.find(
    (p) => p.skill_name.toLowerCase().includes(skillName.toLowerCase()) || skillName.toLowerCase().includes(p.skill_name.toLowerCase())
  ) || plans[0];

  const recMatch = recommendations.find((r) =>
    r.skill_id === matchedGap.skill_id || r.skill_name.toLowerCase().includes(matchedGap.skill_name.toLowerCase())
  );

  const cov = coverageList.find((c) => c.skill_id === matchedGap.skill_id) || { coverage_pct: matchedGap.curriculum_coverage || 0 };

  const tMatch = trainerList.find((t) =>
    t.district_name.toLowerCase() === matchedGap.district_name.toLowerCase() &&
    (t.skill_name.toLowerCase().includes(matchedGap.skill_name.toLowerCase()) || matchedGap.skill_name.toLowerCase().includes(t.skill_name.toLowerCase()))
  );

  const eMatch = equipmentList.find((e) =>
    e.district_name.toLowerCase() === matchedGap.district_name.toLowerCase() &&
    (e.skill_name.toLowerCase().includes(matchedGap.skill_name.toLowerCase()) || matchedGap.skill_name.toLowerCase().includes(e.skill_name.toLowerCase()))
  );

  const rMatch = readinessList.find((r) =>
    r.district_name.toLowerCase() === matchedGap.district_name.toLowerCase() &&
    r.skill_name.toLowerCase().includes(matchedGap.skill_name.toLowerCase())
  );

  const currentSeats = matchedGap.annualSeats;
  const currentCompletions = matchedGap.annualCompletions;
  const tAvail = tMatch ? tMatch.available_trainers : (matchedPlan ? matchedPlan.current_trainers : 0);
  const tReq = currentSeats > 0 ? Math.ceil(currentSeats / 35) : Math.ceil(matchedGap.directHiringDemand / 35);
  const tGap = tAvail - tReq;

  const isIT = matchedGap.category.toLowerCase().includes('software') || matchedGap.category.toLowerCase().includes('it') || matchedGap.skill_name.toLowerCase().includes('react') || matchedGap.skill_name.toLowerCase().includes('php') || matchedGap.skill_name.toLowerCase().includes('ai');
  const eAvail = eMatch ? eMatch.available_quantity : (matchedPlan ? matchedPlan.current_equipment_units : 0);
  const trainReq = currentSeats > 0 ? currentSeats : matchedGap.directHiringDemand;
  const eReq = isIT ? Math.ceil(trainReq / 10) : Math.ceil(Math.min(30, trainReq) / 3);
  const eGap = eAvail - eReq;

  const curriculumAction = recMatch?.recommendation_type || (matchedGap.coveragePercent > 200 ? 'OVERSUPPLY' : 'REVIEW');
  const readinessScore = rMatch ? rMatch.overall_readiness_score : (matchedPlan ? matchedPlan.readiness_score : 50);
  const readinessClassification = rMatch ? rMatch.overall_status : (matchedPlan ? matchedPlan.readiness_classification : 'MODERATE READINESS');

  return {
    district_name: matchedGap.district_name,
    sector_name: matchedGap.sector_name,
    skill_id: matchedGap.skill_id,
    skill_name: matchedGap.skill_name,
    category: matchedGap.category,
    course_name: matchedGap.explainability.contributing_courses[0]?.course_name || `${matchedGap.skill_name} Vocational Module`,
    direct_demand: matchedGap.directHiringDemand,
    annual_seats: currentSeats,
    annual_completions: currentCompletions,
    effective_supply: matchedGap.effectiveSupply,
    coverage_pct: Math.round(matchedGap.coveragePercent * 100) / 100,
    physical_deficit: matchedGap.physicalDeficit,
    demand_score: matchedGap.demandScore,
    supply_score: matchedGap.supplyScore,
    gap_score: matchedGap.netGap,
    net_gap_index: matchedGap.netGap,
    growth_rate_pct: matchedGap.growth_rate_pct,
    curriculum_action: curriculumAction,
    trainers_available: tAvail,
    trainers_required: tReq,
    trainer_gap: tGap,
    equipment_available: eAvail,
    equipment_required: eReq,
    equipment_gap: eGap,
    curriculum_coverage_pct: cov.coverage_pct,
    priority_level: matchedPlan ? matchedPlan.priority.level : 'MEDIUM',
    priority_score: matchedPlan ? matchedPlan.priority_score : 50,
    readiness_score: readinessScore,
    readiness_classification: readinessClassification
  };
}

/**
 * 2. Deterministic What-If Calculation Engine
 * Computes hypothetical new effective supply, coverage, physical deficit, trainer gap, equipment gap, and tradeoffs.
 */
export function runPolicySimulation(
  baseline: BaselineScenarioMetrics,
  inputs: SimulationInputs,
  scenarioName: string = 'Simulated Policy Scenario'
): SimulationResult {
  // 1. Simulated Seats & Effective Supply (Section 7.1)
  const simSeats = baseline.annual_seats + inputs.additional_seats;
  const simEffectiveSupply = Number((0.60 * simSeats + 0.40 * baseline.annual_completions).toFixed(1));

  // 2. Simulated Coverage Ratio & Coverage % (Section 8)
  const simCoverageRatio = simEffectiveSupply / Math.max(1, baseline.direct_demand);
  const simCoveragePercent = Number((simCoverageRatio * 100).toFixed(2));

  // 3. Simulated Physical Deficit/Surplus (Section 9)
  const simPhysicalDeficit = Number((baseline.direct_demand - simEffectiveSupply).toFixed(1));

  // 4. Simulated Coverage Classification (Section 12 - Phase 4.4 function)
  const simCoverageClass = classifyCoverageRatio(simCoveragePercent);

  // 5. Simulated Supply Score & Net Gap Index (Section 10 & 11)
  const simSupplyScore = simEffectiveSupply === 0
    ? 0
    : Math.min(100, Math.floor(simCoverageRatio * baseline.demand_score));
  const simNetGapIndex = baseline.demand_score - simSupplyScore;

  // 6. Simulated Trainer Capacity (Section 13)
  const simTrainersAvailable = baseline.trainers_available + inputs.additional_trainers;
  const simTrainersRequired = simSeats > 0 ? Math.ceil(simSeats / 35) : Math.ceil(baseline.direct_demand / 35);
  const simTrainerGap = simTrainersAvailable - simTrainersRequired;

  // 7. Simulated Equipment Capacity (Section 14)
  const isIT = baseline.category.toLowerCase().includes('software') ||
               baseline.category.toLowerCase().includes('it') ||
               baseline.skill_name.toLowerCase().includes('react') ||
               baseline.skill_name.toLowerCase().includes('php') ||
               baseline.skill_name.toLowerCase().includes('ai');
  const trainingReq = simSeats > 0 ? simSeats : baseline.direct_demand;
  const simEquipmentRequired = isIT ? Math.ceil(trainingReq / 10) : Math.ceil(Math.min(30, trainingReq) / 3);
  const simEquipmentAvailable = baseline.equipment_available + inputs.additional_equipment;
  const simEquipmentGap = simEquipmentAvailable - simEquipmentRequired;

  // 8. Simulated Curriculum Coverage
  const simCurriculumCoverage = inputs.curriculum_module_added ? 100 : baseline.curriculum_coverage_pct;

  // 9. Simulated Readiness (Section 15 - Phase 6 Formula)
  const trainerReadinessPct = Math.min(100, Math.floor((simTrainersAvailable / Math.max(1, simTrainersRequired)) * 100));
  const equipmentReadinessPct = Math.min(100, Math.floor((simEquipmentAvailable / Math.max(1, simEquipmentRequired)) * 100));
  const simReadinessScore = Math.min(100, Math.floor(
    0.40 * trainerReadinessPct +
    0.40 * equipmentReadinessPct +
    0.20 * Math.min(100, simCoveragePercent)
  ));
  const simReadinessClass = simReadinessScore >= 80 ? 'HIGH READINESS' : (simReadinessScore >= 50 ? 'MODERATE READINESS' : 'LOW READINESS');

  // 10. Impact Improvements
  const gapImprovement = baseline.net_gap_index - simNetGapIndex;
  const physicalDeficitImprovement = baseline.physical_deficit - simPhysicalDeficit;
  const trainerGapImprovement = simTrainerGap - baseline.trainer_gap;
  const equipmentGapImprovement = simEquipmentGap - baseline.equipment_gap;
  const readinessImprovement = simReadinessScore - baseline.readiness_score;

  // 11. Policy Trade-off Analysis
  const tradeoffs: string[] = [];
  if (inputs.additional_seats > 0 && simTrainerGap < 0) {
    tradeoffs.push(`Seat expansion (+${inputs.additional_seats} seats) added, but instructor shortage (${simTrainerGap} trainers) remains. CAPACITY DELIVERY CONSTRAINT REMAINS.`);
  }
  if (inputs.additional_trainers > 0 && simEquipmentGap < 0) {
    tradeoffs.push(`Trainer capacity improved (+${inputs.additional_trainers} instructors), but lab equipment deficit (${simEquipmentGap} units) remains. PRACTICAL LAB TRAINING CONSTRAINT REMAINS.`);
  }
  if (!inputs.curriculum_module_added && baseline.curriculum_coverage_pct < 50) {
    tradeoffs.push(`Training seats expanded, but curriculum coverage remains at ${simCurriculumCoverage}%. CURRICULUM MODULE ALIGNMENT RECOMMENDED.`);
  }
  if (simTrainerGap >= 0 && simEquipmentGap >= 0 && simCurriculumCoverage >= 80) {
    tradeoffs.push(`All delivery constraints resolved. Optimal execution readiness achieved.`);
  }

  const assumptions = [
    `Assumption: Direct hiring demand (${baseline.direct_demand} jobs/yr) and Demand Score (${baseline.demand_score}) remain constant during policy simulation.`,
    `Assumption: 1 certified instructor per 35 annual student seats (Rule A/B).`,
    `Assumption: Diagnostic equipment/workstations allocated per Phase 6 domain ratio (${isIT ? '1 per 10 workstations' : '1 per 3 bench trainees'}).`,
    `Assumption: Simulated effective supply follows Phase 4.4 formula (0.60 * seats + 0.40 * completions).`
  ];

  return {
    scenario_name: scenarioName,
    inputs,
    baseline,
    simulated: {
      annual_seats: simSeats,
      effective_supply: simEffectiveSupply,
      coverage_pct: simCoveragePercent,
      coverage_classification: simCoverageClass.label,
      physical_deficit: simPhysicalDeficit,
      supply_score: simSupplyScore,
      gap_score: simNetGapIndex,
      net_gap_index: simNetGapIndex,
      trainers_available: simTrainersAvailable,
      trainers_required: simTrainersRequired,
      trainer_gap: simTrainerGap,
      equipment_available: simEquipmentAvailable,
      equipment_required: simEquipmentRequired,
      equipment_gap: simEquipmentGap,
      curriculum_coverage_pct: simCurriculumCoverage,
      priority_score: baseline.priority_score,
      priority_level: baseline.priority_level,
      readiness_score: simReadinessScore,
      readiness_classification: simReadinessClass
    },
    impact: {
      gap_improvement: gapImprovement,
      physical_deficit_improvement: physicalDeficitImprovement,
      trainer_gap_improvement: trainerGapImprovement,
      equipment_gap_improvement: equipmentGapImprovement,
      readiness_improvement: readinessImprovement,
      tradeoffs
    },
    assumptions,
    is_simulation: true
  };
}

/**
 * 3. Identifies the "Best-performing simulated scenario" from a list of scenarios
 */
export function identifyBestScenario(scenarios: SimulationResult[]): SimulationResult | null {
  if (!scenarios || scenarios.length === 0) return null;

  let best = scenarios[0];
  let bestScore = -999;

  for (const sc of scenarios) {
    const score =
      sc.impact.gap_improvement * 2.0 +
      sc.impact.readiness_improvement * 1.5 +
      (sc.simulated.trainer_gap >= 0 ? 20 : 0) +
      (sc.simulated.equipment_gap >= 0 ? 15 : 0);

    if (score > bestScore) {
      bestScore = score;
      best = sc;
    }
  }

  return best;
}

// In-memory store for fallback if Supabase table is unreachable
const memorySimulationsStore: SimulationRecord[] = [];

/**
 * 4. Saves Simulation Record to Supabase `simulations` table
 */
export async function saveSimulationRecord(simulation: SimulationResult): Promise<{ success: boolean; id?: string }> {
  const record: SimulationRecord = {
    scenario_name: simulation.scenario_name,
    district_name: simulation.baseline.district_name,
    sector_name: simulation.baseline.sector_name,
    skill_name: simulation.baseline.skill_name,
    course_name: simulation.baseline.course_name,
    inputs: simulation.inputs,
    assumptions: simulation.assumptions,
    baseline_values: {
      demand_score: simulation.baseline.demand_score,
      supply_score: simulation.baseline.supply_score,
      gap_score: simulation.baseline.gap_score,
      annual_seats: simulation.baseline.annual_seats,
      trainers_available: simulation.baseline.trainers_available,
      trainers_required: simulation.baseline.trainers_required,
      trainer_gap: simulation.baseline.trainer_gap,
      equipment_available: simulation.baseline.equipment_available,
      equipment_required: simulation.baseline.equipment_required,
      equipment_gap: simulation.baseline.equipment_gap,
      curriculum_coverage_pct: simulation.baseline.curriculum_coverage_pct,
      priority_level: simulation.baseline.priority_level,
      readiness_score: simulation.baseline.readiness_score
    },
    simulated_values: {
      demand_score: simulation.baseline.demand_score,
      supply_score: simulation.simulated.supply_score,
      gap_score: simulation.simulated.net_gap_index,
      annual_seats: simulation.simulated.annual_seats,
      trainers_available: simulation.simulated.trainers_available,
      trainer_gap: simulation.simulated.trainer_gap,
      equipment_available: simulation.simulated.equipment_available,
      equipment_gap: simulation.simulated.equipment_gap,
      curriculum_coverage_pct: simulation.simulated.curriculum_coverage_pct,
      priority_level: simulation.simulated.priority_level,
      readiness_score: simulation.simulated.readiness_score
    },
    impact: simulation.impact,
    is_simulation: true,
    created_at: new Date().toISOString()
  };

  memorySimulationsStore.unshift(record);

  try {
    const { data, error } = await supabase.from('simulations').insert([record]).select();
    if (error) {
      console.warn('Saved simulation to memory store (Supabase insert fallback):', error.message);
      return { success: true, id: `sim-${Date.now()}` };
    }
    return { success: true, id: data?.[0]?.id || `sim-${Date.now()}` };
  } catch (err) {
    console.warn('Saved simulation to memory store:', err);
    return { success: true, id: `sim-${Date.now()}` };
  }
}

/**
 * 5. Fetches Saved Simulations
 */
export async function fetchSavedSimulations(): Promise<SimulationRecord[]> {
  try {
    const { data, error } = await supabase
      .from('simulations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return memorySimulationsStore;
    }
    return data as SimulationRecord[];
  } catch {
    return memorySimulationsStore;
  }
}

