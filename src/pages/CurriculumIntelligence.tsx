// MahaSkill Intelligence - Curriculum Alignment Engine Page (Phase 5)
import React, { useState, useEffect } from 'react';
import { DataClassificationBadge } from '../components/common/DataClassificationBadge';
import type {
  CurriculumRecommendationItem,
  CurriculumCoverageItem,
  FilterOptionsPhase5
} from '../analytics/emergingAndCurriculumEngine';
import {
  generateCurriculumRecommendations,
  calculateCurriculumCoverage
} from '../analytics/emergingAndCurriculumEngine';
import { SEED_DISTRICTS, SEED_SECTORS } from '../data/seedData';
import {
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Info,
  X,
  MapPin,
  Briefcase,
  ShieldCheck,
  FileText
} from 'lucide-react';

export const CurriculumIntelligence: React.FC = () => {
  const [filters, setFilters] = useState<FilterOptionsPhase5>({
    districtId: 'ALL',
    sectorId: 'ALL',
    category: 'ALL',
    recommendationType: 'ALL'
  });

  const [activeSubTab, setActiveSubTab] = useState<'recommendations' | 'coverage'>('recommendations');
  const [recommendations, setRecommendations] = useState<CurriculumRecommendationItem[]>([]);
  const [coverageList, setCoverageList] = useState<CurriculumCoverageItem[]>([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState<CurriculumRecommendationItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadEngineData();
  }, [filters]);

  const loadEngineData = async () => {
    const [recs, cov] = await Promise.all([
      generateCurriculumRecommendations(filters),
      calculateCurriculumCoverage(filters)
    ]);
    setRecommendations(recs);
    setCoverageList(cov);
  };

  const filteredRecommendations = recommendations.filter((r) => {
    const matchesSearch =
      r.skill_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.course_name && r.course_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      r.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      filters.recommendationType === 'ALL' || r.recommendation_type === filters.recommendationType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span>Curriculum Coverage & Evidence-Based Alignment Engine</span>
            </h1>
            <DataClassificationBadge classification="DERIVED_METRIC" />
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Phase 5 Engine: Generates evidence-based curriculum recommendations (ADD, RETAIN, REVIEW, POTENTIAL OBSOLESCENCE, POTENTIAL OVERSUPPLY) using multi-signal statistical models.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex items-center gap-3 text-[11px] shadow-xs">
          <div className="font-semibold text-slate-700 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Strict Safety Directive:</span>
          </div>
          <span className="text-slate-600 text-[10px]">
            "Potential obsolescence signal — curriculum review recommended" (Never auto-deletes courses).
          </span>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-xs">
          <div className="text-[11px] font-medium text-slate-600 flex items-center justify-between">
            <span>Curriculum Update Signals (ADD)</span>
            <BookOpen className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-indigo-700">
            {recommendations.filter((r) => r.recommendation_type === 'ADD').length} Signals
          </div>
          <div className="text-[10px] text-indigo-700 font-mono">High demand + zero/low coverage</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-xs">
          <div className="text-[11px] font-medium text-slate-600 flex items-center justify-between">
            <span>Retain Modules (RETAIN)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">
            {recommendations.filter((r) => r.recommendation_type === 'RETAIN').length} Modules
          </div>
          <div className="text-[10px] text-emerald-700 font-mono">High demand + well covered</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-xs">
          <div className="text-[11px] font-medium text-slate-600 flex items-center justify-between">
            <span>Curriculum Review Signals</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-600">
            {recommendations.filter((r) => r.recommendation_type === 'REVIEW').length} Reviews
          </div>
          <div className="text-[10px] text-amber-700 font-mono">Partial coverage or evolving demand</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-xs">
          <div className="text-[11px] font-medium text-slate-600 flex items-center justify-between">
            <span>Obsolescence / Capacity Signals</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-600">
            {recommendations.filter((r) => r.recommendation_type.includes('OBSOLESCENCE') || r.recommendation_type.includes('OVERSUPPLY')).length} Signals
          </div>
          <div className="text-[10px] text-rose-700 font-mono">Declining demand or excess seats</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="text-xs font-semibold text-slate-900 flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-indigo-600" />
            <span>Curriculum Intelligence Filters</span>
          </div>
          <DataClassificationBadge classification="SYNTHETIC_DEMO_DATA" showIcon={false} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-600 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-indigo-600" />
              <span>District Jurisdiction</span>
            </label>
            <select
              value={filters.districtId}
              onChange={(e) => setFilters({ ...filters, districtId: e.target.value })}
              className="w-full bg-slate-50 text-slate-800 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Maharashtra Districts</option>
              {SEED_DISTRICTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-600 flex items-center gap-1">
              <Briefcase className="w-3 h-3 text-indigo-600" />
              <span>Industry Sector</span>
            </label>
            <select
              value={filters.sectorId}
              onChange={(e) => setFilters({ ...filters, sectorId: e.target.value })}
              className="w-full bg-slate-50 text-slate-800 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Industry Sectors</option>
              {SEED_SECTORS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-600 flex items-center gap-1">
              <FileText className="w-3 h-3 text-indigo-600" />
              <span>Recommendation Type</span>
            </label>
            <select
              value={filters.recommendationType}
              onChange={(e) => setFilters({ ...filters, recommendationType: e.target.value })}
              className="w-full bg-slate-50 text-slate-800 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Recommendation Types</option>
              <option value="ADD">ADD / Curriculum Update Signal</option>
              <option value="RETAIN">RETAIN Curriculum Module</option>
              <option value="REVIEW">REVIEW Alignment</option>
              <option value="OVERSUPPLY">OVERSUPPLY Signal</option>
              <option value="POTENTIAL_OBSOLESCENCE">POTENTIAL OBSOLESCENCE Signal</option>
              <option value="POTENTIAL_OVERSUPPLY">POTENTIAL OVERSUPPLY Signal</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-600 flex items-center gap-1">
              <Search className="w-3 h-3 text-indigo-600" />
              <span>Search Skill / Course</span>
            </label>
            <input
              type="text"
              placeholder="Search course or skill name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 space-x-4">
        <button
          onClick={() => setActiveSubTab('recommendations')}
          className={`pb-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeSubTab === 'recommendations'
              ? 'border-indigo-600 text-indigo-700 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Evidence-Based Alignment Recommendations ({filteredRecommendations.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('coverage')}
          className={`pb-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeSubTab === 'coverage'
              ? 'border-indigo-600 text-indigo-700 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Curriculum Coverage Matrix ({coverageList.length})</span>
        </button>
      </div>

      {/* Sub-Tab 1: Evidence-Based Recommendations */}
      {activeSubTab === 'recommendations' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Skill / Course Module</th>
                  <th className="py-3 px-4">Recommendation Type Signal</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-4">Core Mathematical Reason</th>
                  <th className="py-3 px-4">Supporting Metrics (Demand, Supply, Gap)</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredRecommendations.map((rec) => (
                  <tr
                    key={rec.id}
                    onClick={() => setSelectedRecommendation(rec)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900">{rec.skill_name}</div>
                        <div className="text-[10px] text-slate-500">{rec.course_name}</div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded text-[10px] font-extrabold border ${rec.badge_bg} ${rec.badge_text} ${rec.badge_border}`}
                      >
                        {rec.recommendation_label}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                      {rec.confidence}%
                    </td>

                    <td className="py-3 px-4 text-[11px] text-slate-700 max-w-md">
                      <p className="line-clamp-2">{rec.reason}</p>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="text-indigo-700 font-bold">D:{rec.supporting_metrics.demand_score}</span>
                        <span className="text-emerald-700 font-bold">S:{rec.supporting_metrics.supply_score}</span>
                        <span className={rec.supporting_metrics.gap_score >= 0 ? 'text-amber-700 font-bold' : 'text-purple-700 font-bold'}>
                          Gap:{rec.supporting_metrics.gap_score > 0 ? `+${rec.supporting_metrics.gap_score}` : rec.supporting_metrics.gap_score}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRecommendation(rec);
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-indigo-700 rounded text-[11px] font-medium flex items-center gap-1 transition-colors border border-slate-300"
                      >
                        <Info className="w-3 h-3" />
                        <span>Evidence Trail</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Curriculum Coverage Matrix */}
      {activeSubTab === 'coverage' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">High-Demand Skill</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Demand Score</th>
                <th className="py-3 px-4">Supply Score</th>
                <th className="py-3 px-4">Coverage Status</th>
                <th className="py-3 px-4">Coverage %</th>
                <th className="py-3 px-4">Registered Vocational Courses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {coverageList.map((cov, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">{cov.skill_name}</td>
                  <td className="py-3 px-4 text-slate-600">{cov.category}</td>
                  <td className="py-3 px-4 font-mono font-bold text-indigo-700">{cov.demand_score} / 100</td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-700">{cov.supply_score} / 100</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                        cov.coverage_status === 'FULLY COVERED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : cov.coverage_status === 'PARTIALLY COVERED'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-rose-50 text-rose-700 border-rose-300'
                      }`}
                    >
                      {cov.coverage_status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">{cov.coverage_pct}%</td>
                  <td className="py-3 px-4 text-[11px] text-slate-700">
                    {cov.covering_courses.length === 0 ? (
                      <span className="text-slate-400 italic">No course coverage detected</span>
                    ) : (
                      cov.covering_courses.map((c) => c.course_name).join(', ')
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Drill-down Evidence Trail Modal */}
      {selectedRecommendation && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto text-slate-800">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">{selectedRecommendation.skill_name}</h2>
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold border ${selectedRecommendation.badge_bg} ${selectedRecommendation.badge_text} ${selectedRecommendation.badge_border}`}
                  >
                    {selectedRecommendation.recommendation_label}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Jurisdiction: {selectedRecommendation.district_name} | Sector: {selectedRecommendation.sector_name}
                </p>
              </div>

              <button
                onClick={() => setSelectedRecommendation(null)}
                className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors border border-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Core Recommendation & Confidence Card */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="font-semibold text-indigo-700 flex items-center justify-between">
                <span>Core Alignment Recommendation</span>
                <span className="font-mono text-amber-800 font-bold">Confidence: {selectedRecommendation.confidence}%</span>
              </div>
              <p className="text-slate-800 leading-relaxed text-[11px] font-medium">{selectedRecommendation.reason}</p>
              <div className="text-[10px] text-slate-500 font-mono border-t border-slate-200 pt-1.5">
                {selectedRecommendation.confidence_reason}
              </div>
            </div>

            {/* Evidence References Trail List */}
            <div className="space-y-3 text-xs">
              <div className="font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Supporting Multi-Source Evidence References</span>
              </div>

              <div className="space-y-2">
                {selectedRecommendation.evidence_references.map((ev) => (
                  <div key={ev.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-900">{ev.evidence_label}</span>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-indigo-700">Contribution: {ev.contribution_pct}%</span>
                        <span className="text-emerald-700">Confidence: {ev.confidence}%</span>
                      </div>
                    </div>
                    <p className="text-slate-600 text-[11px]">{ev.explanation}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono border-t border-slate-200 pt-1">
                      <span>Source: {ev.source_reference}</span>
                      <span>Timestamp: {ev.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Close */}
            <div className="border-t border-slate-200 pt-3 flex justify-end">
              <button
                onClick={() => setSelectedRecommendation(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors border border-slate-300"
              >
                Close Evidence Trail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
