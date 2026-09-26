// MahaSkill Intelligence - Employer Validation Portal (Phase 6)
import React, { useState, useEffect } from 'react';
import { DataClassificationBadge } from '../components/common/DataClassificationBadge';
import type { EmployerValidationSummary } from '../analytics/capacityAndValidationEngine';
import {
  calculateEmployerValidationSummary,
  submitEmployerValidationSignal
} from '../analytics/capacityAndValidationEngine';
import { SEED_DISTRICTS, SEED_SECTORS } from '../data/seedData';
import {
  CheckCircle2,
  Building2,
  Award,
  Send,
  Sparkles
} from 'lucide-react';

export const EmployerValidation: React.FC = () => {
  const [selectedSkill, setSelectedSkill] = useState('EV Battery Diagnostics');
  const [summary, setSummary] = useState<EmployerValidationSummary | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    employer_name: '',
    sector_name: 'Automotive and EV',
    district_name: 'Pune',
    skill_name: 'EV Battery Diagnostics',
    occupation_title: 'EV Battery Diagnostics Specialist',
    demand_level: 'CRITICAL' as const,
    importance_score: 9,
    hiring_difficulty: 'EXTREME' as const,
    expected_future_demand: 'GROWING' as const,
    recommended_training_priority: 'HIGH_PRIORITY' as const,
    agreement_level: 'STRONGLY_AGREE' as const,
    comments: ''
  });

  useEffect(() => {
    loadSummary();
  }, [selectedSkill]);

  const loadSummary = async () => {
    const data = await calculateEmployerValidationSummary(selectedSkill);
    setSummary(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employer_name.trim()) return;

    setIsSubmitting(true);
    await submitEmployerValidationSignal(formData);
    setIsSubmitting(false);
    setFormSubmitted(true);

    // Refresh summary
    await loadSummary();

    setTimeout(() => {
      setFormSubmitted(false);
      setFormData({
        ...formData,
        employer_name: '',
        comments: ''
      });
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Employer Validation & Industry Signal Loop</span>
            </h1>
            <DataClassificationBadge classification="DERIVED_METRIC" />
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Phase 6 Engine: Allows regional employers to validate detected skill demand, provide structured hiring signals, and strengthen decision confidence scores.
          </p>
        </div>

        <DataClassificationBadge classification="SYNTHETIC_DEMO_DATA" />
      </div>

      {/* Summary Score Card */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-xs">
            <div className="text-[11px] font-medium text-slate-600 flex items-center justify-between">
              <span>Validating Employers</span>
              <Building2 className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{summary.validating_employers_count} Employers</div>
            <div className="text-[10px] text-indigo-700 font-mono">Multi-employer consensus</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-xs">
            <div className="text-[11px] font-medium text-slate-600 flex items-center justify-between">
              <span>Agreement Consensus</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-600">{summary.agreement_pct}% Agreement</div>
            <div className="text-[10px] text-emerald-700 font-mono">
              {summary.strongly_agree_count} strongly agree, {summary.agree_count} agree
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-xs">
            <div className="text-[11px] font-medium text-slate-600 flex items-center justify-between">
              <span>Industry Validation Score</span>
              <Award className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-amber-700">{summary.industry_validation_score} / 100</div>
            <div className="text-[10px] text-amber-800 font-mono">Deterministic statistical score</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-xs">
            <div className="text-[11px] font-medium text-slate-600 flex items-center justify-between">
              <span>Confidence Contribution</span>
              <Sparkles className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-700">+{summary.confidence_contribution} Points</div>
            <div className="text-[10px] text-slate-500 font-mono">Added to system confidence</div>
          </div>
        </div>
      )}

      {/* Main Grid: Submission Form & Active Signal Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submission Form */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Send className="w-4 h-4 text-indigo-600" />
              <span>Submit Employer Validation Signal</span>
            </h2>
            <p className="text-[11px] text-slate-600">Structured hiring signal from verified industry partner</p>
          </div>

          {formSubmitted ? (
            <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <div className="font-bold text-emerald-800 text-sm">Validation Signal Submitted!</div>
              <p className="text-xs text-slate-700">
                Your hiring feedback has been persisted and incorporated into the Industry Validation score.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-700">Employer / Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tata Motors EV Division"
                  value={formData.employer_name}
                  onChange={(e) => setFormData({ ...formData, employer_name: e.target.value })}
                  className="w-full bg-slate-50 text-slate-800 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-700">Industry Sector</label>
                  <select
                    value={formData.sector_name}
                    onChange={(e) => setFormData({ ...formData, sector_name: e.target.value })}
                    className="w-full bg-slate-50 text-slate-800 border border-slate-300 rounded-lg px-2 py-1.5 focus:outline-none"
                  >
                    {SEED_SECTORS.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-700">District Location</label>
                  <select
                    value={formData.district_name}
                    onChange={(e) => setFormData({ ...formData, district_name: e.target.value })}
                    className="w-full bg-slate-50 text-slate-800 border border-slate-300 rounded-lg px-2 py-1.5 focus:outline-none"
                  >
                    {SEED_DISTRICTS.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-700">Target Skill Name</label>
                <input
                  type="text"
                  value={formData.skill_name}
                  onChange={(e) => {
                    setFormData({ ...formData, skill_name: e.target.value });
                    setSelectedSkill(e.target.value);
                  }}
                  className="w-full bg-slate-50 text-slate-800 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-700">Hiring Difficulty</label>
                  <select
                    value={formData.hiring_difficulty}
                    onChange={(e) => setFormData({ ...formData, hiring_difficulty: e.target.value as any })}
                    className="w-full bg-slate-50 text-slate-800 border border-slate-300 rounded-lg px-2 py-1.5 focus:outline-none"
                  >
                    <option value="EXTREME">Extreme Shortage</option>
                    <option value="MODERATE">Moderate Shortage</option>
                    <option value="EASY">Easy to Hire</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-700">Validation Consensus</label>
                  <select
                    value={formData.agreement_level}
                    onChange={(e) => setFormData({ ...formData, agreement_level: e.target.value as any })}
                    className="w-full bg-slate-50 text-slate-800 border border-slate-300 rounded-lg px-2 py-1.5 focus:outline-none"
                  >
                    <option value="STRONGLY_AGREE">Strongly Agree</option>
                    <option value="AGREE">Agree</option>
                    <option value="DISAGREE">Disagree</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-700">Employer Comments / Evidence Details</label>
                <textarea
                  rows={3}
                  placeholder="Provide specific notes regarding hiring difficulty, batch sizes, or curriculum gaps..."
                  value={formData.comments}
                  onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                  className="w-full bg-slate-50 text-slate-800 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Submitting Signal...' : 'Submit Validation Signal'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Active Validation Signals Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>Validated Employer Signals ({summary?.validating_employers_count || 0})</span>
              </h2>
              <p className="text-[11px] text-slate-600">Target Skill: {selectedSkill}</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600">Select Skill:</span>
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="bg-slate-50 text-slate-800 border border-slate-300 text-xs rounded-lg px-2 py-1 focus:outline-none"
              >
                <option value="EV Battery Diagnostics">EV Battery Diagnostics</option>
                <option value="CAN Bus Diagnostics">CAN Bus Diagnostics</option>
                <option value="React.js">React.js</option>
                <option value="Cloud Architecture (AWS)">Cloud Architecture (AWS)</option>
                <option value="Legacy PHP Maintenance">Legacy PHP Maintenance</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-indigo-700">Tata Motors EV Division</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                  STRONGLY AGREE
                </span>
              </div>
              <p className="text-xs text-slate-700">
                "Critical shortage of technicians who can perform battery state-of-health diagnostics and CAN bus troubleshooting."
              </p>
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono border-t border-slate-200 pt-1.5">
                <span>District: Pune | Sector: Automotive and EV</span>
                <span>Hiring Difficulty: EXTREME</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-indigo-700">Mahindra Electric Mobility</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                  STRONGLY AGREE
                </span>
              </div>
              <p className="text-xs text-slate-700">
                "Requires immediate addition of EV battery bench diagnostic modules in local ITI Pune curriculum."
              </p>
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono border-t border-slate-200 pt-1.5">
                <span>District: Pune | Sector: Automotive and EV</span>
                <span>Hiring Difficulty: EXTREME</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-indigo-700">Bosch India Automotive</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-300">
                  AGREE
                </span>
              </div>
              <p className="text-xs text-slate-700">
                "High hiring demand for certified CAN bus frame analysis technicians in Nashik plant."
              </p>
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono border-t border-slate-200 pt-1.5">
                <span>District: Nashik | Sector: Automotive and EV</span>
                <span>Hiring Difficulty: MODERATE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
