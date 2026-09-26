import { supabase } from '../lib/supabase';
import { calculateSkillDemandSupplyGaps } from './demandSupplyGapEngine';
import { SEED_EMPLOYER_VALIDATIONS } from '../data/seedData';
import type { EmployerValidationRecord } from '../types/database';

export interface EmployerValidationSignal {
  id: string;
  employer_name: string;
  sector_name: string;
  district_name: string;
  skill_name: string;
  occupation_title: string;
  demand_level: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  importance_score: number; // 1 - 10
  hiring_difficulty: 'EXTREME' | 'MODERATE' | 'EASY';
  expected_future_demand: 'GROWING' | 'STABLE' | 'DECLINING';
  recommended_training_priority: 'HIGH_PRIORITY' | 'MEDIUM_PRIORITY' | 'LOW_PRIORITY';
  agreement_level: 'STRONGLY_AGREE' | 'AGREE' | 'DISAGREE';
  comments: string;
  submitted_at: string;
  is_synthetic: boolean;
}

export interface EmployerValidationSummary {
  skill_name: string;
  validating_employers_count: number;
  expected_hires_sum: number;
  strongly_agree_count: number;
  agree_count: number;
  disagree_count: number;
  agreement_pct: number;
  industry_validation_score: number; // 0 - 100
  confidence_contribution: number; // e.g. +15
  represented_sectors: string[];
  represented_districts: string[];
  sample_comments: string[];
  total_validations_count: number;
}

export interface TrainerCapacityItem {
  id: string;
  district_name: string;
  skill_name: string;
  course_name: string;
  required_capacity: number;
  available_trainers: number;
  trainer_gap: number;
  status: 'TRAINER SHORTAGE' | 'BALANCED' | 'SUFFICIENT';
  is_synthetic: boolean;
}

export interface EquipmentCapacityItem {
  id: string;
  district_name: string;
  skill_name: string;
  equipment_type: string;
  required_quantity: number;
  available_quantity: number;
  equipment_gap: number;
  status: 'EQUIPMENT SHORTAGE' | 'BALANCED' | 'SUFFICIENT';
  is_synthetic: boolean;
}

export interface TrainingReadinessItem {
  skill_id: string;
  skill_name: string;
  district_name: string;
  sector_name: string;
  demand_level: string;
  demand_score: number;
  supply_score: number;
  industry_validation_score: number;
  trainer_readiness_pct: number;
  equipment_readiness_pct: number;
  overall_readiness_score: number;
  overall_status:
    | 'NOT READY — CAPACITY INVESTMENT REQUIRED'
    | 'MODERATE READINESS'
    | 'FULLY READY'
    | 'OVERSUPPLIED / EXCESS CAPACITY';
  action_summary: string;
  is_synthetic: boolean;
  metrics: {
    direct_hiring_demand: number;
    effective_supply: number;
    coverage_pct: number;
    expected_hires: number;
    available_trainers: number;
    required_trainers: number;
    trainer_gap: number;
    available_equipment: number;
    required_equipment: number;
    equipment_gap: number;
  };
}

/**
 * Documented Capacity Assumptions & Ratios (Phase 6 Audit):
 * - Trainer Requirement Basis:
 *   - Mapped Skill (Course Seats > 0): Required Trainers = ceil(Annual Course Seats / 35)
 *   - Unmapped Skill (Course Seats = 0): Required Trainers = ceil(Direct Hiring Demand / 35)
 * - Equipment Requirement Basis (Domain-Specific Ratios):
 *   - Automotive / Heavy Hardware Lab (EV Battery Bench, CAN Bus Kit):
 *     1 bench per 3 trainees in a 30-trainee lab batch -> max 10 benches required per lab batch.
 *   - Software / IT Workstation Lab (React.js, Developer PC Workstations):
 *     1 workstation per 10 annual trainees shared across computer lab shift schedules -> ceil(Demand or Seats / 10).
 */
export const CAPACITY_RATIOS = {
  TRAINEES_PER_TRAINER: 35,
  AUTOMOTIVE_TRAINEES_PER_BENCH: 3,
  IT_TRAINEES_PER_WORKSTATION: 10,
  STANDARD_BATCH_SIZE: 30
};

/**
 * 1. Calculates Employer Validation Summary dynamically from Remote Supabase
 */
export async function calculateEmployerValidationSummary(
  skillName: string,
  districtName: string = 'All Districts'
): Promise<EmployerValidationSummary> {
  const [
    { data: dbSignals },
    { data: dbEmployers },
    { data: dbSkills },
    { data: dbDistricts },
    { data: dbSectors },
    { data: dbValidations }
  ] = await Promise.all([
    supabase.from('employer_signals').select('*'),
    supabase.from('employers').select('*'),
    supabase.from('skills').select('*'),
    supabase.from('districts').select('*'),
    supabase.from('sectors').select('*'),
    supabase.from('employer_validations').select('*')
  ]);

  const signals = dbSignals || [];
  const employers = dbEmployers || [];
  const skills = dbSkills || [];
  const districts = dbDistricts || [];
  const sectors = dbSectors || [];
  const validations: EmployerValidationRecord[] = (dbValidations && dbValidations.length > 0)
    ? dbValidations
    : SEED_EMPLOYER_VALIDATIONS;

  const empMap = new Map<string, string>(employers.map((e: any) => [e.id, e.company_name || e.name]));
  const distMap = new Map<string, string>(districts.map((d: any) => [d.id, d.name]));
  const secMap = new Map<string, string>(sectors.map((s: any) => [s.id, s.name]));

  // Find canonical skill
  const targetSkill = skills.find((s: any) =>
    s.canonical_name.toLowerCase().includes(skillName.toLowerCase()) ||
    skillName.toLowerCase().includes(s.canonical_name.toLowerCase())
  );

  let matchingSignals = signals;
  if (targetSkill) {
    matchingSignals = matchingSignals.filter((s: any) => s.skill_id === targetSkill.id);
  } else {
    matchingSignals = matchingSignals.filter((s: any) =>
      (s.comments && s.comments.toLowerCase().includes(skillName.toLowerCase()))
    );
  }

  if (districtName !== 'All Districts' && districtName !== 'ALL') {
    const targetDist = districts.find((d: any) => d.name.toLowerCase() === districtName.toLowerCase());
    if (targetDist) {
      matchingSignals = matchingSignals.filter((s: any) => s.district_id === targetDist.id);
    }
  }

  const validatingEmployerIds = new Set<string>();
  let expectedHiresSum = 0;
  const representedSectors = new Set<string>();
  const representedDistricts = new Set<string>();
  const sampleComments: string[] = [];

  matchingSignals.forEach((sig: any) => {
    if (sig.employer_id && empMap.has(sig.employer_id)) {
      validatingEmployerIds.add(empMap.get(sig.employer_id)!);
    } else {
      validatingEmployerIds.add(`Employer Signal ${sig.id.slice(0, 8)}`);
    }

    expectedHiresSum += Number(sig.expected_hires || 0);

    if (sig.district_id && distMap.has(sig.district_id)) {
      representedDistricts.add(distMap.get(sig.district_id)!);
    }
    if (sig.sector_id && secMap.has(sig.sector_id)) {
      representedSectors.add(secMap.get(sig.sector_id)!);
    }

    if (sig.comments) sampleComments.push(sig.comments);
  });

  // Filter explicit validation records for matching skill
  let matchingValidations = validations;
  if (targetSkill) {
    matchingValidations = matchingValidations.filter((v: any) => v.skill_id === targetSkill.id);
  } else {
    matchingValidations = matchingValidations.filter((v: any) =>
      v.comments && v.comments.toLowerCase().includes(skillName.toLowerCase())
    );
  }

  matchingValidations.forEach((v: any) => {
    if (v.comments && !sampleComments.includes(v.comments)) {
      sampleComments.push(v.comments);
    }
  });

  const totalValidationsCount = matchingValidations.length;
  let stronglyAgreeCount = 0; // CONFIRM
  let agreeCount = 0;          // EDIT
  let disagreeCount = 0;       // REJECT

  matchingValidations.forEach((v: any) => {
    if (v.validation === 'CONFIRM') {
      stronglyAgreeCount++;
    } else if (v.validation === 'EDIT') {
      agreeCount++;
    } else if (v.validation === 'REJECT') {
      disagreeCount++;
    }
  });

  let agreementPct = 0;
  if (totalValidationsCount > 0) {
    agreementPct = Math.round((stronglyAgreeCount / totalValidationsCount) * 100);
  } else {
    agreementPct = 0; // No explicit validation records -> 0% (validation pending)
  }

  const count = validatingEmployerIds.size;
  const industryValidationScore = count === 0
    ? 0
    : Math.min(100, Math.round(50 + count * 20 + Math.min(30, expectedHiresSum * 0.25)));

  const confidenceContribution = count >= 2 ? 15 : count === 1 ? 10 : 0;

  return {
    skill_name: targetSkill ? targetSkill.canonical_name : skillName,
    validating_employers_count: count,
    expected_hires_sum: expectedHiresSum,
    strongly_agree_count: stronglyAgreeCount,
    agree_count: agreeCount,
    disagree_count: disagreeCount,
    agreement_pct: agreementPct,
    industry_validation_score: industryValidationScore,
    confidence_contribution: confidenceContribution,
    represented_sectors: Array.from(representedSectors),
    represented_districts: Array.from(representedDistricts),
    sample_comments: sampleComments,
    total_validations_count: totalValidationsCount
  };
}

export interface SubmitEmployerSignalInput {
  employer_id?: string;
  employer_name?: string;
  skill_id?: string;
  skill_name?: string;
  district_id?: string;
  district_name?: string;
  sector_id?: string;
  sector_name?: string;
  expected_hires?: number;
  required_proficiency?: string;
  demand_level?: string;
  comments?: string;
  confidence?: number;
}

/**
 * 1b. Submits a Structured Employer Validation Signal using actual Supabase schema
 */
export async function submitEmployerValidationSignal(
  signalInput: SubmitEmployerSignalInput | any
): Promise<{ success: boolean; error?: string }> {
  try {
    const [{ data: dbEmployers }, { data: dbSkills }, { data: dbDistricts }, { data: dbSectors }] = await Promise.all([
      supabase.from('employers').select('id, name'),
      supabase.from('skills').select('id, canonical_name'),
      supabase.from('districts').select('id, name'),
      supabase.from('sectors').select('id, name')
    ]);

    const employers = dbEmployers || [];
    const skills = dbSkills || [];
    const districts = dbDistricts || [];
    const sectors = dbSectors || [];

    let employerId = signalInput.employer_id;
    if (!employerId && signalInput.employer_name) {
      const match = employers.find((e: any) =>
        e.name.toLowerCase().includes(signalInput.employer_name.toLowerCase()) ||
        signalInput.employer_name.toLowerCase().includes(e.name.toLowerCase())
      );
      if (match) employerId = match.id;
    }
    if (!employerId && employers.length > 0) employerId = employers[0].id;

    let skillId = signalInput.skill_id;
    if (!skillId && signalInput.skill_name) {
      const match = skills.find((s: any) =>
        s.canonical_name.toLowerCase().includes(signalInput.skill_name.toLowerCase()) ||
        signalInput.skill_name.toLowerCase().includes(s.canonical_name.toLowerCase())
      );
      if (match) skillId = match.id;
    }
    if (!skillId && skills.length > 0) skillId = skills[0].id;

    let districtId = signalInput.district_id;
    if (!districtId && signalInput.district_name) {
      const match = districts.find((d: any) => d.name.toLowerCase() === signalInput.district_name.toLowerCase());
      if (match) districtId = match.id;
    }
    if (!districtId && districts.length > 0) districtId = districts[0].id;

    let sectorId = signalInput.sector_id;
    if (!sectorId && signalInput.sector_name) {
      const match = sectors.find((sec: any) => sec.name.toLowerCase().includes(signalInput.sector_name.toLowerCase()));
      if (match) sectorId = match.id;
    }
    if (!sectorId && sectors.length > 0) sectorId = sectors[0].id;

    const insertPayload = {
      employer_id: employerId,
      skill_id: skillId,
      district_id: districtId,
      sector_id: sectorId,
      expected_hires: Number(signalInput.expected_hires || 10),
      required_proficiency: signalInput.required_proficiency || signalInput.demand_level || 'intermediate',
      comments: signalInput.comments || '',
      signal_date: new Date().toISOString().slice(0, 10),
      confidence: Number(signalInput.confidence || 85)
    };

    const { error } = await supabase.from('employer_signals').insert(insertPayload);
    if (error) {
      console.warn('[Employer Validation] Supabase insert error:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.warn('[Employer Validation] Signal submission exception:', err);
    return { success: false, error: err?.message || 'Failed to connect to database' };
  }
}

/**
 * 2. Calculates Trainer Capacity Audit dynamically from Remote Supabase
 * Basis:
 * - Mapped Skill (Course Seats > 0): Required Trainers = ceil(Annual Course Seats / 35)
 * - Unmapped Skill (Course Seats = 0): Required Trainers = ceil(Direct Hiring Demand / 35)
 */
export async function calculateTrainerCapacity(districtFilter: string = 'ALL'): Promise<TrainerCapacityItem[]> {
  const [
    { data: dbTrainers },
    { data: dbSkills },
    { data: dbDistricts },
    { data: dbCourses },
    { data: dbCourseSkills },
    { data: dbPostings },
    { data: dbJobSkills },
    { data: dbEmpSignals }
  ] = await Promise.all([
    supabase.from('trainers').select('*'),
    supabase.from('skills').select('*'),
    supabase.from('districts').select('*'),
    supabase.from('courses').select('*'),
    supabase.from('course_skills').select('*'),
    supabase.from('job_postings').select('*'),
    supabase.from('job_skills').select('*'),
    supabase.from('employer_signals').select('*')
  ]);

  const trainers = dbTrainers || [];
  const skills = dbSkills || [];
  const districts = dbDistricts || [];
  const courses = dbCourses || [];
  const courseSkills = dbCourseSkills || [];
  const postings = dbPostings || [];
  const jobSkills = dbJobSkills || [];
  const empSignals = dbEmpSignals || [];

  const items: TrainerCapacityItem[] = [];

  for (const skill of skills) {
    for (const dist of districts) {
      if (districtFilter !== 'ALL' && dist.name.toLowerCase() !== districtFilter.toLowerCase() && dist.id !== districtFilter) {
        continue;
      }

      // Check available trainers in DB
      const trRecord = trainers.find((t: any) => t.skill_id === skill.id && t.district_id === dist.id);
      const availableTrainers = trRecord ? Number(trRecord.certified_count || trRecord.trainer_count || 0) : 0;

      // Find course seats for skill in district
      const mappedCourseIds = new Set(courseSkills.filter((cs: any) => cs.skill_id === skill.id).map((cs: any) => cs.course_id));
      const distCourses = courses.filter((c: any) => c.district_id === dist.id && mappedCourseIds.has(c.id));
      const totalSeats = distCourses.reduce((sum: number, c: any) => sum + Number(c.annual_seats || 0), 0);

      // Compute Direct Hiring Demand for unmapped skills
      let demand = 0;
      if (totalSeats === 0) {
        const pIdsInDist = new Set(postings.filter((p: any) => p.district_id === dist.id).map((p: any) => p.id));
        const relJS = jobSkills.filter((js: any) => js.skill_id === skill.id && pIdsInDist.has(js.job_id || js.job_posting_id));
        const postingCount = new Set(relJS.map((js: any) => js.job_id || js.job_posting_id)).size;
        const relES = empSignals.filter((es: any) => es.skill_id === skill.id && es.district_id === dist.id);
        const expectedHires = relES.reduce((sum: number, es: any) => sum + Number(es.expected_hires || 0), 0);
        demand = postingCount + expectedHires;
      }

      // Rule A: Mapped Skill -> ceil(Course Seats / 35)
      // Rule B: Unmapped Skill -> ceil(Direct Hiring Demand / 35)
      const requirementBasis = totalSeats > 0 ? totalSeats : demand;
      const requiredCapacity = requirementBasis > 0 ? Math.ceil(requirementBasis / CAPACITY_RATIOS.TRAINEES_PER_TRAINER) : 0;

      if (totalSeats > 0 || availableTrainers > 0 || demand > 0) {
        const gap = availableTrainers - requiredCapacity;
        const status = gap < 0 ? 'TRAINER SHORTAGE' : gap === 0 ? 'BALANCED' : 'SUFFICIENT';

        items.push({
          id: trRecord?.id || `tr-${skill.id.slice(0, 8)}-${dist.id.slice(0, 8)}`,
          district_name: dist.name,
          skill_name: skill.canonical_name,
          course_name: distCourses[0]?.course_name || `${skill.canonical_name} Module`,
          required_capacity: requiredCapacity,
          available_trainers: availableTrainers,
          trainer_gap: gap,
          status,
          is_synthetic: trRecord?.is_synthetic ?? true
        });
      }
    }
  }

  return items;
}

/**
 * 3. Calculates Equipment Capacity Audit dynamically from Remote Supabase
 * Domain Ratios:
 * - Automotive / Heavy Hardware Lab: 1 bench per 3 trainees in lab batch -> max 10 benches required per lab batch.
 * - Software / IT Workstation Lab (React.js): 1 workstation per 10 annual trainees -> ceil(Demand or Seats / 10).
 */
export async function calculateEquipmentCapacity(districtFilter: string = 'ALL'): Promise<EquipmentCapacityItem[]> {
  const [
    { data: dbEquipment },
    { data: dbSkills },
    { data: dbDistricts },
    { data: dbCourses },
    { data: dbCourseSkills },
    { data: dbPostings },
    { data: dbJobSkills },
    { data: dbEmpSignals }
  ] = await Promise.all([
    supabase.from('equipment').select('*'),
    supabase.from('skills').select('*'),
    supabase.from('districts').select('*'),
    supabase.from('courses').select('*'),
    supabase.from('course_skills').select('*'),
    supabase.from('job_postings').select('*'),
    supabase.from('job_skills').select('*'),
    supabase.from('employer_signals').select('*')
  ]);

  const equipment = dbEquipment || [];
  const skills = dbSkills || [];
  const districts = dbDistricts || [];
  const courses = dbCourses || [];
  const courseSkills = dbCourseSkills || [];
  const postings = dbPostings || [];
  const jobSkills = dbJobSkills || [];
  const empSignals = dbEmpSignals || [];

  const items: EquipmentCapacityItem[] = [];

  for (const skill of skills) {
    for (const dist of districts) {
      if (districtFilter !== 'ALL' && dist.name.toLowerCase() !== districtFilter.toLowerCase() && dist.id !== districtFilter) {
        continue;
      }

      // Check available equipment in DB
      const eqRecord = equipment.find((e: any) =>
        e.district_id === dist.id &&
        (e.equipment_name.toLowerCase().includes(skill.canonical_name.toLowerCase()) ||
         (skill.canonical_name.includes('EV Battery') && e.equipment_name.toLowerCase().includes('ev battery')) ||
         (skill.canonical_name.includes('CAN Bus') && e.equipment_name.toLowerCase().includes('can bus')))
      );

      const availableQuantity = eqRecord ? Number(eqRecord.available_quantity || 0) : 0;

      // Find course seats for skill in district
      const mappedCourseIds = new Set(courseSkills.filter((cs: any) => cs.skill_id === skill.id).map((cs: any) => cs.course_id));
      const distCourses = courses.filter((c: any) => c.district_id === dist.id && mappedCourseIds.has(c.id));
      const totalSeats = distCourses.reduce((sum: number, c: any) => sum + Number(c.annual_seats || 0), 0);

      // Compute Direct Hiring Demand for unmapped skills
      let demand = 0;
      if (totalSeats === 0) {
        const pIdsInDist = new Set(postings.filter((p: any) => p.district_id === dist.id).map((p: any) => p.id));
        const relJS = jobSkills.filter((js: any) => js.skill_id === skill.id && pIdsInDist.has(js.job_id || js.job_posting_id));
        const postingCount = new Set(relJS.map((js: any) => js.job_id || js.job_posting_id)).size;
        const relES = empSignals.filter((es: any) => es.skill_id === skill.id && es.district_id === dist.id);
        const expectedHires = relES.reduce((sum: number, es: any) => sum + Number(es.expected_hires || 0), 0);
        demand = postingCount + expectedHires;
      }

      // Domain-specific equipment calculation:
      // IT / Software Skills (e.g. React.js): 1 workstation per 10 annual trainees -> ceil(Demand or Seats / 10)
      // Automotive / Heavy Labs (e.g. EV Battery): 1 bench per 3 trainees in batch (max 30 trainees/batch) -> ceil(min(30, Seats or Demand) / 3)
      const isITSkill = skill.category.toLowerCase().includes('software') || skill.canonical_name.toLowerCase().includes('react');
      let requiredQuantity = 0;

      if (isITSkill) {
        const basis = totalSeats > 0 ? totalSeats : demand;
        requiredQuantity = basis > 0 ? Math.ceil(basis / CAPACITY_RATIOS.IT_TRAINEES_PER_WORKSTATION) : 0;
      } else {
        const maxBatch = Math.min(CAPACITY_RATIOS.STANDARD_BATCH_SIZE, totalSeats || demand || CAPACITY_RATIOS.STANDARD_BATCH_SIZE);
        const basis = totalSeats > 0 ? maxBatch : demand;
        requiredQuantity = basis > 0 ? Math.ceil(basis / CAPACITY_RATIOS.AUTOMOTIVE_TRAINEES_PER_BENCH) : 0;
      }

      if (totalSeats > 0 || availableQuantity > 0 || demand > 0) {
        const gap = availableQuantity - requiredQuantity;
        const status = gap < 0 ? 'EQUIPMENT SHORTAGE' : gap === 0 ? 'BALANCED' : 'SUFFICIENT';

        items.push({
          id: eqRecord?.id || `eq-${skill.id.slice(0, 8)}-${dist.id.slice(0, 8)}`,
          district_name: dist.name,
          skill_name: skill.canonical_name,
          equipment_type: eqRecord?.equipment_name || (isITSkill ? 'High-Performance Developer Computer Workstations' : `${skill.canonical_name} Diagnostic Kit`),
          required_quantity: requiredQuantity,
          available_quantity: availableQuantity,
          equipment_gap: gap,
          status,
          is_synthetic: eqRecord?.is_synthetic ?? true
        });
      }
    }
  }

  return items;
}

/**
 * 4. Calculates Combined Training Delivery Readiness Score (0-100) & Status
 */
export async function calculateTrainingReadiness(
  districtFilter: string = 'ALL',
  sectorFilter: string = 'ALL'
): Promise<TrainingReadinessItem[]> {
  const gapResults = await calculateSkillDemandSupplyGaps({ districtId: districtFilter, sectorId: sectorFilter });
  const trainerData = await calculateTrainerCapacity(districtFilter);
  const equipmentData = await calculateEquipmentCapacity(districtFilter);

  return Promise.all(
    gapResults.map(async (gap) => {
      const valSummary = await calculateEmployerValidationSummary(gap.skill_name, gap.district_name);

      const tMatch = trainerData.find((t) =>
        t.district_name.toLowerCase() === gap.district_name.toLowerCase() &&
        t.skill_name.toLowerCase().includes(gap.skill_name.toLowerCase())
      );
      const eMatch = equipmentData.find((e) =>
        e.district_name.toLowerCase() === gap.district_name.toLowerCase() &&
        e.skill_name.toLowerCase().includes(gap.skill_name.toLowerCase())
      );

      const tAvailable = tMatch ? tMatch.available_trainers : 0;
      const tRequired = tMatch ? tMatch.required_capacity : 0;
      const tGap = tMatch ? tMatch.trainer_gap : 0;

      const eAvailable = eMatch ? eMatch.available_quantity : 0;
      const eRequired = eMatch ? eMatch.required_quantity : 0;
      const eGap = eMatch ? eMatch.equipment_gap : 0;

      const trainerReadinessPct = tRequired > 0 ? Math.min(100, Math.round((tAvailable / tRequired) * 100)) : (tAvailable > 0 ? 100 : 0);
      const equipmentReadinessPct = eRequired > 0 ? Math.min(100, Math.round((eAvailable / eRequired) * 100)) : (eAvailable > 0 ? 100 : 0);

      const CR = gap.coveragePercent;

      // Deterministic Readiness Score Formula (0-100)
      const overallReadinessScore = Math.min(
        100,
        Math.round(0.40 * trainerReadinessPct + 0.40 * equipmentReadinessPct + 0.20 * Math.min(100, CR))
      );

      let overallStatus: TrainingReadinessItem['overall_status'] = 'MODERATE READINESS';
      let actionSummary = '';

      if (CR > 200) {
        overallStatus = 'OVERSUPPLIED / EXCESS CAPACITY';
        actionSummary = `Training throughput (${gap.effectiveSupply} persons/yr) materially exceeds hiring demand (${gap.directHiringDemand} persons/yr) at ${CR.toFixed(1)}% coverage. Reallocate lab equipment and trainers to shortage skills.`;
      } else if (trainerReadinessPct >= 100 && equipmentReadinessPct >= 100 && CR >= 90) {
        overallStatus = 'FULLY READY';
        actionSummary = `Training capacity, certified trainers (${tAvailable}/${tRequired}), and lab equipment (${eAvailable}/${eRequired}) are fully aligned.`;
      } else if (gap.directHiringDemand > 0 && (tGap < -3 || eGap < -3 || overallReadinessScore < 60)) {
        overallStatus = 'NOT READY — CAPACITY INVESTMENT REQUIRED';
        actionSummary = `High demand (${gap.directHiringDemand} persons/yr) but delivery bottlenecks: ${Math.abs(tGap)} certified trainer(s) and ${Math.abs(eGap)} equipment unit(s) needed in ${gap.district_name}.`;
      } else {
        overallStatus = 'MODERATE READINESS';
        actionSummary = `Moderate delivery readiness (${overallReadinessScore}/100). Trainer gap: ${tGap}, equipment gap: ${eGap}. Minor capacity upgrades recommended in ${gap.district_name}.`;
      }

      return {
        skill_id: gap.skill_id,
        skill_name: gap.skill_name,
        district_name: gap.district_name,
        sector_name: gap.sector_name,
        demand_level: gap.directHiringDemand >= 100 ? 'CRITICAL' : gap.directHiringDemand >= 40 ? 'HIGH' : 'MODERATE',
        demand_score: gap.demand_score,
        supply_score: gap.supply_score,
        industry_validation_score: valSummary.industry_validation_score,
        trainer_readiness_pct: trainerReadinessPct,
        equipment_readiness_pct: equipmentReadinessPct,
        overall_readiness_score: overallReadinessScore,
        overall_status: overallStatus,
        action_summary: actionSummary,
        is_synthetic: true,
        metrics: {
          direct_hiring_demand: gap.directHiringDemand,
          effective_supply: gap.effectiveSupply,
          coverage_pct: gap.coveragePercent,
          expected_hires: valSummary.expected_hires_sum,
          available_trainers: tAvailable,
          required_trainers: tRequired,
          trainer_gap: tGap,
          available_equipment: eAvailable,
          required_equipment: eRequired,
          equipment_gap: eGap
        }
      };
    })
  );
}
