// MahaSkill Intelligence - Employer Validation Portal (Phase 6)
import React, { useState, useEffect } from 'react';
import { DataClassificationBadge } from '../components/common/DataClassificationBadge';
import type { EmployerValidationSummary } from '../analytics/capacityAndValidationEngine';
import {
  calculateEmployerValidationSummary,
  submitEmployerValidationSignal
} from '../analytics/capacityAndValidationEngine';
import { supabase } from '../lib/supabase';
import {
  CheckCircle2,
  Building2,
  Award,
  Send,
  Sparkles,
  AlertCircle,
  Users
} from 'lucide-react';

export interface EnrichedEmployerSignal {
  id: string;
  employer_id: string;
  skill_id: string;
  district_id: string;
  sector_id: string;
  employer_name: string;
  skill_name: string;
  district_name: string;
  sector_name: string;
  expected_hires: number;
  required_proficiency: string;
  comments: string;
  confidence: number;
  signal_date: string;
}

export const EmployerValidation: React.FC = () => {
  const [selectedSkill, setSelectedSkill] = useState('EV Battery Diagnostics');
  const [summary, setSummary] = useState<EmployerValidationSummary | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Entities loaded from Supabase for dynamic form & audit
  const [employerProfiles, setEmployerProfiles] = useState<any[]>([]);
  const [allSkills, setAllSkills] = useState<any[]>([]);
  const [allDistricts, setAllDistricts] = useState<any[]>([]);
  const [allSectors, setAllSectors] = useState<any[]>([]);
  const [allLiveSignals, setAllLiveSignals] = useState<EnrichedEmployerSignal[]>([]);
  const [isLoadingSignals, setIsLoadingSignals] = useState(true);

  // Form State using actual database schema foreign keys
  const [formData, setFormData] = useState({
    employer_id: '',
    sector_id: '',
    district_id: '',
    skill_id: '',
    expected_hires: 20,
    required_proficiency: 'advanced',
    comments: ''
  });

  useEffect(() => {
    loadEntitiesAndSignals();
  }, []);

  useEffect(() => {
    loadSummary();
  }, [selectedSkill]);

  const loadEntitiesAndSignals = async () => {
    setIsLoadingSignals(true);
    try {
      const [
        { data: employers },
        { data: skills },
        { data: districts },
        { data: sectors },
        { data: signals }
      ] = await Promise.all([
        supabase.from('employers').select('*'),
        supabase.from('skills').select('*'),
        supabase.from('districts').select('*'),
        supabase.from('sectors').select('*'),
        supabase.from('employer_signals').select('*')
      ]);

      const emps = employers || [];
      const sks = skills || [];
      const dists = districts || [];
      const secs = sectors || [];
      const sigs = signals || [];

      setEmployerProfiles(emps);
      setAllSkills(sks);
      setAllDistricts(dists);
      setAllSectors(secs);

      const empMap = new Map(emps.map((e: any) => [e.id, e.name]));
      const skillMap = new Map(sks.map((s: any) => [s.id, s.canonical_name]));
      const distMap = new Map(dists.map((d: any) => [d.id, d.name]));
      const secMap = new Map(secs.map((sec: any) => [sec.id, sec.name]));

      const enriched: EnrichedEmployerSignal[] = sigs.map((s: any) => ({
        id: s.id,
        employer_id: s.employer_id,
        skill_id: s.skill_id,
        district_id: s.district_id,
        sector_id: s.sector_id,
        employer_name: empMap.get(s.employer_id) || 'Unknown Employer',
        skill_name: skillMap.get(s.skill_id) || 'Unknown Skill',
        district_name: distMap.get(s.district_id) || 'Unknown District',
        sector_name: secMap.get(s.sector_id) || 'Unknown Sector',
        expected_hires: Number(s.expected_hires || 0),
        required_proficiency: s.required_proficiency || 'intermediate',
        comments: s.comments || '',
        confidence: Number(s.confidence || 85),
        signal_date: s.signal_date || ''
      }));

      setAllLiveSignals(enriched);

      // Set form defaults from loaded entities if empty
      if (emps.length > 0 && !formData.employer_id) {
        const evSkill = sks.find((s: any) => s.canonical_name === 'EV Battery Diagnostics');
        const puneDist = dists.find((d: any) => d.name === 'Pune');
        const autoSec = secs.find((sec: any) => sec.name.includes('Automotive'));

        setFormData((prev) => ({
          ...prev,
          employer_id: emps[0].id,
          skill_id: evSkill ? evSkill.id : (sks[0]?.id || ''),
          district_id: puneDist ? puneDist.id : (dists[0]?.id || ''),
          sector_id: autoSec ? autoSec.id : (secs[0]?.id || '')
        }));
      }
    } catch (err) {
      console.warn('Error loading Supabase entities for Employer Validation:', err);
    } finally {
      setIsLoadingSignals(false);
    }
  };

  const loadSummary = async () => {
    const data = await calculateEmployerValidationSummary(selectedSkill);
    setSummary(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employer_id || !formData.skill_id) return;

    setIsSubmitting(true);
    setSubmitError(null);
    setFormSubmitted(false);

    const result = await submitEmployerValidationSignal(formData);
    setIsSubmitting(false);

    if (result.success) {
      setFormSubmitted(true);
      await Promise.all([loadSummary(), loadEntitiesAndSignals()]);
      setTimeout(() => {
        setFormSubmitted(false);
        setFormData((prev) => ({ ...prev, comments: '' }));
      }, 4000);
    } else {
      setSubmitError(result.error || 'Failed to submit employer validation signal.');
    }
  };

  // Filter signals for selected skill (or show all if selectedSkill is 'All Skills')
  const displayedSignals = allLiveSignals.filter((sig) => {
    if (selectedSkill === 'All Skills') return true;
    return sig.skill_name.toLowerCase().includes(selectedSkill.toLowerCase()) ||
      selectedSkill.toLowerCase().includes(sig.skill_name.toLowerCase());
  });

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

        <DataClassificationBadge classification="REAL_PUBLIC_DATA" />
      </div>

      {/* Summary Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-xs">
          <div className="text-[11px] font-medium text-slate-600 flex items-center justify-between">
            <span>Employer Profiles & Signals</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{employerProfiles.length} Profiles | {allLiveSignals.length} Signals</div>
          <div className="text-[10px] text-indigo-700 font-mono">
            {summary?.validating_employers_count || 0} signals for {selectedSkill}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-xs">
          <div className="text-[11px] font-medium text-slate-600 flex items-center justify-between">
            <span>Expected Employer Hires</span>
            <Building2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">{summary?.expected_hires_sum || 0} Hires</div>
          <div className="text-[10px] text-emerald-700 font-mono">
            Target Skill: {selectedSkill}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-xs">
          <div className="text-[11px] font-medium text-slate-600 flex items-center justify-between">
            <span>Industry Validation Score</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700">{summary?.industry_validation_score || 0} / 100</div>
          <div className="text-[10px] text-amber-800 font-mono">
            {(summary?.total_validations_count ?? 0) > 0
              ? `${summary?.agreement_pct || 0}% agreement (${summary?.strongly_agree_count}/${summary?.total_validations_count} confirmed)`
              : 'Validation pending (No explicit employer validations)'}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-xs">
          <div className="text-[11px] font-medium text-slate-600 flex items-center justify-between">
            <span>Confidence Contribution</span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-700">+{summary?.confidence_contribution || 0} Points</div>
          <div className="text-[10px] text-slate-500 font-mono">Added to Phase 4.4 confidence</div>
        </div>
      </div>

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

          {submitError && (
            <div className="bg-rose-50 border border-rose-300 p-3 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">Submission Failed</div>
                <div>{submitError}</div>
              </div>
            </div>
          )}

          {formSubmitted ? (
            <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <div className="font-bold text-emerald-800 text-sm">Validation Signal Submitted!</div>
              <p className="text-xs text-slate-700">
                Your hiring feedback has been persisted using actual database foreign keys and incorporated into live analytics.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-700">Employer Profile *</label>
                <select
                  required
                  value={formData.employer_id}
                  onChange={(e) => setFormData({ ...formData, employer_id: e.target.value })}
                  className="w-full bg-slate-50 text-slate-800 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
                >
                  {employerProfiles.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-700">Industry Sector</label>
                  <select
                    value={formData.sector_id}
                    onChange={(e) => setFormData({ ...formData, sector_id: e.target.value })}
                    className="w-full bg-slate-50 text-slate-800 border border-slate-300 rounded-lg px-2 py-1.5 focus:outline-none"
                  >
                    {allSectors.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-700">District Location</label>
                  <select
                    value={formData.district_id}
                    onChange={(e) => setFormData({ ...formData, district_id: e.target.value })}
                    className="w-full bg-slate-50 text-slate-800 border border-slate-300 rounded-lg px-2 py-1.5 focus:outline-none"
                  >
                    {allDistricts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-700">Target Skill</label>
                <select
                  value={formData.skill_id}
                  onChange={(e) => {
                    const skId = e.target.value;
                    setFormData({ ...formData, skill_id: skId });
                    const matchSk = allSkills.find((s) => s.id === skId);
                    if (matchSk) setSelectedSkill(matchSk.canonical_name);
                  }}
                  className="w-full bg-slate-50 text-slate-800 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
                >
                  {allSkills.map((sk) => (
                    <option key={sk.id} value={sk.id}>
                      {sk.canonical_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-700">Expected Hires *</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    required
                    value={formData.expected_hires}
                    onChange={(e) => setFormData({ ...formData, expected_hires: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 text-slate-800 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-700">Required Proficiency</label>
                  <select
                    value={formData.required_proficiency}
                    onChange={(e) => setFormData({ ...formData, required_proficiency: e.target.value })}
                    className="w-full bg-slate-50 text-slate-800 border border-slate-300 rounded-lg px-2 py-1.5 focus:outline-none"
                  >
                    <option value="advanced">Advanced</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="basic">Basic / Entry Level</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-700">Employer Comments / Evidence Details</label>
                <textarea
                  rows={3}
                  placeholder="Provide specific notes regarding hiring urgency, batch sizes, or curriculum gaps..."
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

        {/* Active Validation Signals Table / Dynamic Cards */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>Validated Employer Signals ({displayedSignals.length})</span>
              </h2>
              <p className="text-[11px] text-slate-600">Filter: {selectedSkill}</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600">Select Skill:</span>
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="bg-slate-50 text-slate-800 border border-slate-300 text-xs rounded-lg px-2 py-1 focus:outline-none"
              >
                <option value="EV Battery Diagnostics">EV Battery Diagnostics</option>
                <option value="React.js">React.js</option>
                <option value="CAN Bus Diagnostics">CAN Bus Diagnostics</option>
                <option value="Cloud Architecture (AWS)">Cloud Architecture (AWS)</option>
                <option value="Legacy PHP Maintenance">Legacy PHP Maintenance</option>
                <option value="All Skills">All Skills</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {isLoadingSignals ? (
              <div className="text-xs text-slate-500 py-6 text-center">Loading live employer signals from Supabase...</div>
            ) : displayedSignals.length === 0 ? (
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center space-y-1">
                <div className="text-xs font-semibold text-slate-700">No Active Employer Signals Found</div>
                <div className="text-[11px] text-slate-500">
                  No active employer validation signals are recorded for "{selectedSkill}".
                </div>
              </div>
            ) : (
              displayedSignals.map((sig) => (
                <div key={sig.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-indigo-700">{sig.employer_name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 uppercase">
                      {sig.required_proficiency} PROFICIENCY ({sig.expected_hires} HIRES)
                    </span>
                  </div>
                  <p className="text-xs text-slate-700">
                    "{sig.comments || 'Direct industry hiring signal recorded.'}"
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono border-t border-slate-200 pt-1.5">
                    <span>District: {sig.district_name} | Sector: {sig.sector_name} | Skill: {sig.skill_name}</span>
                    <span>Expected Hires: {sig.expected_hires}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="text-[10px] text-slate-400 font-mono border-t border-slate-100 pt-2 text-right">
            Data Provenance: Employer hiring signals + Relational employer_validations audit
          </div>
        </div>
      </div>
    </div>
  );
};

