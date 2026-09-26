// MahaSkill Intelligence - Emerging Skill Detector & Radar Page (Phase 5)
import React, { useState, useEffect } from 'react';
import { DataClassificationBadge } from '../components/common/DataClassificationBadge';
import type {
  EmergingSkillItem,
  FilterOptionsPhase5
} from '../analytics/emergingAndCurriculumEngine';
import { detectEmergingSkills } from '../analytics/emergingAndCurriculumEngine';
import { SEED_DISTRICTS, SEED_SECTORS } from '../data/seedData';
import {
  TrendingUp,
  AlertTriangle,
  Search,
  Filter,
  Info,
  X,
  MapPin,
  Briefcase,
  Sparkles,
  Building2,
  Calendar
} from 'lucide-react';

export const EmergingSkills: React.FC = () => {
  const [filters, setFilters] = useState<FilterOptionsPhase5>({
    districtId: 'ALL',
    sectorId: 'ALL',
    category: 'ALL'
  });

  const [emergingList, setEmergingList] = useState<EmergingSkillItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<EmergingSkillItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    const data = await detectEmergingSkills(filters);
    setEmergingList(data);
  };

  const filteredList = emergingList.filter((item) => {
    const matchesSearch =
      item.canonical_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.raw_term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Dynamic Summary Cards Calculations derived from Live Phase 5 Engine
  const growthRates = emergingList
    .map((item) => item.growth_rate_pct)
    .filter((g): g is number => g !== null && !isNaN(g));

  const avgGrowth = growthRates.length > 0
    ? Math.round(growthRates.reduce((sum, g) => sum + g, 0) / growthRates.length)
    : 0;

  const employerSet = new Set<string>();
  emergingList.forEach((item) => {
    item.evidence.sample_employers.forEach((emp) => employerSet.add(emp));
  });
  const totalEmployerSignals = emergingList.reduce((sum, item) => sum + item.employer_count, 0);
  const requestingEmployersCount = employerSet.size > 0 ? employerSet.size : totalEmployerSignals;

  const unmappedCount = emergingList.filter(
    (item) => item.taxonomy_status === 'emerging' || item.taxonomy_status === 'unmapped' || item.category.toLowerCase().includes('unmapped')
  ).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-600" />
              <span>Emerging Skill Detector & Unresolved Signal Radar</span>
            </h1>
            <DataClassificationBadge classification="DERIVED_METRIC" />
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Phase 5 Engine: Early-warning detection of rapidly surging, unmapped, or unresolved skills across employer job postings.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-300 rounded-xl px-3.5 py-2 flex items-center gap-2 text-xs text-amber-900 shadow-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Strict Policy: Raw terms are preserved without forcing false canonical matches.</span>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-xs">
          <div className="text-[11px] font-medium text-slate-600 flex items-center justify-between">
            <span>Detected Emerging Signals</span>
            <Sparkles className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700">{emergingList.length} Skills</div>
          <div className="text-[10px] text-amber-800 font-mono">Surging employer demand</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-xs">
          <div className="text-[11px] font-medium text-slate-600 flex items-center justify-between">
            <span>Average Growth Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">{avgGrowth > 0 ? `+${avgGrowth}%` : 'Stable'}</div>
          <div className="text-[10px] text-slate-500 font-mono">Period-over-period increase</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-xs">
          <div className="text-[11px] font-medium text-slate-600 flex items-center justify-between">
            <span>Distinct Employers Requesting</span>
            <Building2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-indigo-700">{requestingEmployersCount} Employers</div>
          <div className="text-[10px] text-indigo-700 font-mono">Multi-employer validation</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-xs">
          <div className="text-[11px] font-medium text-slate-600 flex items-center justify-between">
            <span>Taxonomy Status</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-600">{unmappedCount} Unmapped Skills</div>
          <div className="text-[10px] text-rose-700 font-mono">Curriculum addition review required</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="text-xs font-semibold text-slate-900 flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-indigo-600" />
            <span>Radar Filters (District, Sector, Category)</span>
          </div>
          <DataClassificationBadge classification="SYNTHETIC_DEMO_DATA" showIcon={false} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
              <Search className="w-3 h-3 text-indigo-600" />
              <span>Search Skill / Term</span>
            </label>
            <input
              type="text"
              placeholder="Search skill name or raw term..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Emerging Skills Radar Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs space-y-3">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Emerging & Unresolved Skill Radar ({filteredList.length})</span>
            </h2>
            <p className="text-[11px] text-slate-600">Click any row to inspect underlying job postings, employers, and observation dates</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Raw Term / Skill</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Growth %</th>
                <th className="py-3 px-4">Recent Job Demand</th>
                <th className="py-3 px-4">Employers</th>
                <th className="py-3 px-4">Districts</th>
                <th className="py-3 px-4">Confidence Score</th>
                <th className="py-3 px-4">Taxonomy Status</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredList.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="space-y-0.5">
                      <div className="font-bold text-amber-800 font-mono text-sm">{item.canonical_name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Raw: "{item.raw_term}"</div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-300 font-medium">
                      {item.category}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-mono font-extrabold text-emerald-600 text-sm">
                    {item.growth_rate_pct !== null ? `+${item.growth_rate_pct}%` : 'Baseline / New'}
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-800">
                    {item.recent_demand_count} postings
                  </td>

                  <td className="py-3 px-4 font-mono font-semibold text-indigo-700">
                    {item.employer_count} employers
                  </td>

                  <td className="py-3 px-4 text-slate-700">
                    {item.districts_list.join(', ')}
                  </td>

                  <td className="py-3 px-4 font-mono">
                    <div className="flex items-center gap-1.5">
                      <div className="w-10 bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                        <div
                          className="bg-amber-500 h-full rounded-full"
                          style={{ width: `${item.confidence}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-amber-800">{item.confidence}%</span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                      {item.taxonomy_status.toUpperCase()}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem(item);
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-amber-800 rounded text-[11px] font-medium flex items-center gap-1 transition-colors border border-slate-300"
                    >
                      <Info className="w-3 h-3" />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drill-down Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto text-slate-800">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">{selectedItem.canonical_name}</h2>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                    POTENTIAL EMERGING SKILL — REVIEW REQUIRED
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">Raw Mention: "{selectedItem.raw_term}"</p>
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors border border-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="font-semibold text-amber-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Detection & Observation Evidence Summary</span>
              </div>
              <p className="text-slate-700 leading-relaxed text-[11px]">{selectedItem.evidence.summary}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <div className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-indigo-600" />
                  <span>Requesting Employers</span>
                </div>
                <div className="font-medium text-slate-900">{selectedItem.evidence.sample_employers.join(', ')}</div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <div className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-emerald-600" />
                  <span>Observation Timeline</span>
                </div>
                <div className="font-mono text-[11px] text-slate-800">
                  {selectedItem.first_observed_date} to {selectedItem.latest_observed_date}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3 flex justify-end">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors border border-slate-300"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
