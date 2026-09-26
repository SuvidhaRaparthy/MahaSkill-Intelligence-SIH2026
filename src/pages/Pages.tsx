// MahaSkill Intelligence - Module Stubs for remaining 13 routes
import React from 'react';
import { DataClassificationBadge } from '../components/common/DataClassificationBadge';
import { SEED_RECOMMENDATIONS } from '../data/seedData';
export { DataSources } from './DataSources';
export { SkillIntelligence } from './SkillIntelligence';
export { EmergingSkills } from './EmergingSkills';
export { CurriculumIntelligence } from './CurriculumIntelligence';
export { EmployerValidation } from './EmployerValidation';
export { TrainerEquipment } from './TrainerEquipment';
export { PolicySimulator } from './PolicySimulator';
export { TrainingPlans } from './TrainingPlans';

// Helper Wrapper for Module Stubs
const PageWrapper: React.FC<{ title: string; subtitle: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
  <div className="space-y-6">
    <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
          <DataClassificationBadge classification="SYNTHETIC_DEMO_DATA" />
        </div>
        <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
      </div>
    </div>
    {children}
  </div>
);

export const LabourSignals: React.FC = () => (
  <PageWrapper title="Labour Signals & Job Ingestion" subtitle="Real-time web & portal job opening ingestion pipeline from National Career Service and employers">
    <div className="bg-white border border-slate-200 rounded-xl p-6 text-xs text-slate-700 shadow-xs">
      <div className="font-semibold text-slate-900 mb-2">Active Ingestion Pipeline</div>
      <p>300+ Job Signals parsed and indexed across Pune, Nashik, and Nagpur. Raw text is processed via AI Skill Extraction.</p>
    </div>
  </PageWrapper>
);





export const DistrictIntelligence: React.FC = () => (
  <PageWrapper title="District Intelligence Center" subtitle="Deep-dive district skill portfolios, seats, completions, and capacity gaps">
    <div className="bg-white border border-slate-200 rounded-xl p-6 text-xs text-slate-700 shadow-xs">
      <div className="font-semibold text-slate-900 mb-2">District Profiles</div>
      <p>Select district (Pune, Nashik, Nagpur) to view local training ecosystem balance.</p>
    </div>
  </PageWrapper>
);

export const SkillExplorer: React.FC = () => (
  <PageWrapper title="Skill Explorer & Taxonomy Engine" subtitle="Search canonical skills, aliases, qualification mappings, and trend history">
    <div className="bg-white border border-slate-200 rounded-xl p-6 text-xs text-slate-700 shadow-xs">
      <div className="font-semibold text-slate-900 mb-2">Canonical Skill Registry</div>
      <p>Explore 42 canonical skills including React.js, TypeScript, CAN Bus Diagnostics, and BMS Systems.</p>
    </div>
  </PageWrapper>
);






export const ActionCenter: React.FC = () => (
  <PageWrapper title="Government Action Center" subtitle="Prioritized algorithmic decision cards for state and district planners">
    <div className="bg-white border border-slate-200 rounded-xl p-6 text-xs text-slate-700 shadow-xs space-y-3">
      <div className="font-semibold text-slate-900">Top Priority Actions</div>
      <div className="space-y-2">
        {SEED_RECOMMENDATIONS.map((rec) => (
          <div key={rec.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
            <div>
              <div className="font-semibold text-indigo-700">{rec.district_name} - {rec.skill_name}</div>
              <div className="text-slate-600 text-[11px] mt-1">{rec.summary}</div>
            </div>
            <span className="px-2.5 py-1 bg-indigo-600 text-white rounded text-[10px] font-bold">Action Needed</span>
          </div>
        ))}
      </div>
    </div>
  </PageWrapper>
);

export const DataQuality: React.FC = () => (
  <PageWrapper title="Data Quality & Provenance Center" subtitle="Audit record counts, valid/invalid data ratios, missing district tags, and synthetic record labels">
    <div className="bg-white border border-slate-200 rounded-xl p-6 text-xs text-slate-700 shadow-xs">
      <div className="font-semibold text-slate-900 mb-2">Quality Audit Summary</div>
      <p>Total Records: 328 | Valid: 328 | Missing Tags: 0 | Synthetic Flagged: 100%.</p>
    </div>
  </PageWrapper>
);

export const Methodology: React.FC = () => (
  <PageWrapper title="Analytical Methodology & Formulas" subtitle="Transparent mathematical formulas for Demand Score, Supply Score, Gap Score, and Confidence Index">
    <div className="bg-white border border-slate-200 rounded-xl p-6 text-xs text-slate-700 shadow-xs space-y-4">
      <div className="font-semibold text-slate-900 text-sm">Demand Score Formula</div>
      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-amber-700">
        Demand Score = 0.50 × Job Posting Demand + 0.30 × Employer Signals + 0.20 × Growth Rate
      </div>
      <div className="font-semibold text-slate-900 text-sm">Gap Score Formula</div>
      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-emerald-700">
        Gap Score = Demand Score - Supply Score
      </div>
    </div>
  </PageWrapper>
);
