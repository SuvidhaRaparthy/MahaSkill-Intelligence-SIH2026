// MahaSkill Intelligence - Skill Demand, Supply & Gap Analysis UI (Phase 4.4)
import React, { useState, useEffect } from 'react';
import { DataClassificationBadge } from '../components/common/DataClassificationBadge';
import {
  calculateSkillDemandSupplyGaps
} from '../analytics/demandSupplyGapEngine';
import type {
  SkillGapAnalysisResult,
  FilterOptions
} from '../analytics/demandSupplyGapEngine';
import { SEED_DISTRICTS, SEED_SECTORS } from '../data/seedData';
import {
  TrendingUp,
  TrendingDown,
  Layers,
  Search,
  Filter,
  Info,
  X,
  MapPin,
  Briefcase,
  BookOpen,
  Award,
  BarChart3,
  PieChart as PieIcon,
  HelpCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export const DemandSupplyGap: React.FC = () => {
  const [filters, setFilters] = useState<FilterOptions>({
    districtId: 'ALL',
    sectorId: 'ALL',
    category: 'ALL',
    period: '2026-Q1'
  });

  const [results, setResults] = useState<SkillGapAnalysisResult[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<SkillGapAnalysisResult | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    loadAnalytics();
  }, [filters]);

  const loadAnalytics = async () => {
    const data = await calculateSkillDemandSupplyGaps(filters);
    setResults(data);
  };

  // Filter results for search & status
  const filteredResults = results.filter((r) => {
    const matchesSearch =
      r.skill_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || r.classification.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Summary Metrics based on authoritative Coverage % classification
  const criticalShortageCount = results.filter((r) => r.classification.status === 'CRITICAL_SHORTAGE').length;
  const modShortageCount = results.filter((r) => r.classification.status === 'MODERATE_SHORTAGE').length;
  const balancedCount = results.filter((r) => r.classification.status === 'BALANCED').length;
  const oversupplyCount = results.filter((r) => r.classification.status.includes('OVERSUPPLY')).length;

  // Chart Data Preparation (Demand Score vs Supply Score 0-100)
  const chartData = filteredResults.slice(0, 8).map((r) => ({
    name: r.skill_name.length > 18 ? r.skill_name.substring(0, 16) + '...' : r.skill_name,
    fullName: r.skill_name,
    'Demand Score': r.demandScore,
    'Supply Score': r.supplyScore,
    'Coverage %': r.coveragePercent
  }));

  const distributionData = [
    { name: 'Critical Shortage (<50%)', count: criticalShortageCount, color: '#f43f5e' },
    { name: 'Moderate Shortage (50-90%)', count: modShortageCount, color: '#f59e0b' },
    { name: 'Balanced (90-125%)', count: balancedCount, color: '#10b981' },
    { name: 'Oversupply (>125%)', count: oversupplyCount, color: '#8b5cf6' }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <span>Skill Demand, Supply & Gap Analysis Engine</span>
            </h1>
            <DataClassificationBadge classification="DERIVED_METRIC" />
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Phase 4.4 Engine: Validated Demand-Aligned Coverage Methodology. Authoritative Coverage % (Effective Supply / Direct Demand) and Physical Deficit/Surplus.
          </p>
        </div>

        {/* Threshold Reference Indicator */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex items-center gap-3 text-[11px] shadow-xs">
          <div className="font-semibold text-slate-700 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
            <span>Coverage % Thresholds:</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className="text-rose-700 font-bold">Critical: &lt;50%</span>
            <span className="text-amber-700 font-bold">Moderate: 50–90%</span>
            <span className="text-emerald-700 font-bold">Balanced: 90–125%</span>
            <span className="text-purple-700 font-bold">Oversupply: &gt;125%</span>
          </div>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-xs">
          <div className="text-[11px] font-medium text-slate-600 flex items-center justify-between">
            <span>Critical Shortage (&lt;50% Coverage)</span>
            <TrendingUp className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-600">{criticalShortageCount} Skills</div>
          <div className="text-[10px] text-rose-700 font-mono">Supply covers &lt;50% of hiring demand</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-xs">
          <div className="text-[11px] font-medium text-slate-600 flex items-center justify-between">
            <span>Moderate Shortage (50–90%)</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-600">{modShortageCount} Skills</div>
          <div className="text-[10px] text-amber-700 font-mono">Supply falls behind hiring demand</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-xs">
          <div className="text-[11px] font-medium text-slate-600 flex items-center justify-between">
            <span>Balanced Ecosystem (90–125%)</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">{balancedCount} Skills</div>
          <div className="text-[10px] text-emerald-700 font-mono">Throughput matches hiring demand</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-xs">
          <div className="text-[11px] font-medium text-slate-600 flex items-center justify-between">
            <span>Oversupply Risk (&gt;125%)</span>
            <TrendingDown className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-600">{oversupplyCount} Skills</div>
          <div className="text-[10px] text-purple-700 font-mono">Capacity exceeds hiring demand</div>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="text-xs font-semibold text-slate-900 flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-indigo-600" />
            <span>Multi-Dimensional Filters (District, Sector, Category)</span>
          </div>
          <DataClassificationBadge classification="SYNTHETIC_DEMO_DATA" showIcon={false} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* District Filter */}
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

          {/* Sector Filter */}
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

          {/* Category Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-600 flex items-center gap-1">
              <Layers className="w-3 h-3 text-indigo-600" />
              <span>Skill Category</span>
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full bg-slate-50 text-slate-800 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Skill Categories</option>
              <option value="Automotive Engineering">Automotive Engineering</option>
              <option value="Software Development">Software Development</option>
              <option value="Artificial Intelligence">Artificial Intelligence</option>
              <option value="Cloud Computing">Cloud Computing</option>
              <option value="Legacy Web">Legacy Web</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-600 flex items-center gap-1">
              <Search className="w-3 h-3 text-indigo-600" />
              <span>Search Skills</span>
            </label>
            <input
              type="text"
              placeholder="e.g. EV Battery, React, CAN Bus..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart: Demand Score vs Supply Score Comparison */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span>Demand Score vs Supply Score Index (0–100)</span>
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Demand-Aligned Coverage Model</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#475569', fontSize: 10 }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis tick={{ fill: '#475569', fontSize: 10 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '11px', color: '#0f172a' }}
                  labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="Demand Score" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Supply Score" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Shortage & Oversupply Distribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-amber-600" />
              <span>Coverage Gap Distribution</span>
            </h3>
          </div>

          <div className="space-y-3 my-auto">
            {distributionData.map((d, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-700 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                    <span>{d.name}</span>
                  </span>
                  <span className="font-bold text-slate-900">{d.count} Skills</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.round((d.count / (results.length || 1)) * 100)}%`,
                      backgroundColor: d.color
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
            💡 <strong className="text-slate-900">Governance Insight:</strong> Critical Shortage skills (&lt;50% Coverage) require immediate seat additions in regional ITIs/polytechnics.
          </div>
        </div>
      </div>

      {/* Main Skill Demand, Supply & Gap Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs space-y-3">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Labour Market Demand & Supply Coverage Matrix ({filteredResults.length})</span>
            </h2>
            <p className="text-[11px] text-slate-600">Click any skill row to view full mathematical explainability breakdown & contributing data</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 text-slate-800 border border-slate-300 text-xs rounded-lg px-2 py-1 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="CRITICAL_SHORTAGE">Critical Shortage (&lt;50%)</option>
              <option value="MODERATE_SHORTAGE">Moderate Shortage (50-90%)</option>
              <option value="BALANCED">Balanced (90-125%)</option>
              <option value="MODERATE_OVERSUPPLY">Moderate Oversupply (125-200%)</option>
              <option value="HIGH_OVERSUPPLY">High Oversupply (&gt;200%)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Canonical Skill</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Direct Hiring Demand</th>
                <th className="py-3 px-4">Effective Supply</th>
                <th className="py-3 px-4">Coverage %</th>
                <th className="py-3 px-4">Physical Deficit / Surplus</th>
                <th className="py-3 px-4">Status Classification</th>
                <th className="py-3 px-4">Demand Score</th>
                <th className="py-3 px-4">Supply Score</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredResults.map((row) => (
                <tr
                  key={row.skill_id}
                  onClick={() => setSelectedSkill(row)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  {/* Skill Name */}
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-900">{row.skill_name}</span>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-300 font-medium">
                      {row.category}
                    </span>
                  </td>

                  {/* Direct Hiring Demand */}
                  <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                    {row.directHiringDemand} persons/yr
                  </td>

                  {/* Effective Supply */}
                  <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                    {row.effectiveSupply} persons/yr
                  </td>

                  {/* Coverage % (Authoritative Metric) */}
                  <td className="py-3 px-4 font-mono font-extrabold text-sm">
                    <span
                      className={
                        row.coveragePercent < 50
                          ? 'text-rose-600'
                          : row.coveragePercent < 90
                          ? 'text-amber-600'
                          : row.coveragePercent <= 125
                          ? 'text-emerald-600'
                          : 'text-purple-600'
                      }
                    >
                      {row.coveragePercent}%
                    </span>
                  </td>

                  {/* Physical Deficit / Surplus */}
                  <td className="py-3 px-4 font-mono font-semibold">
                    <span className={row.physicalDeficit > 0 ? 'text-rose-600 font-bold' : row.physicalDeficit === 0 ? 'text-emerald-600' : 'text-purple-600 font-bold'}>
                      {row.physicalDeficit > 0 ? `+${row.physicalDeficit} deficit` : `${row.physicalDeficit} surplus`}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${row.classification.badgeBg} ${row.classification.badgeText} ${row.classification.badgeBorder}`}
                    >
                      {row.classification.label}
                    </span>
                  </td>

                  {/* Demand Score (Index) */}
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {row.demandScore} / 100
                  </td>

                  {/* Supply Score (Visualization Index) */}
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {row.supplyScore} / 100
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSkill(row);
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-indigo-700 rounded text-[11px] font-medium flex items-center gap-1 transition-colors border border-slate-300"
                    >
                      <Info className="w-3 h-3" />
                      <span>Why?</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drill-down Explainability Modal */}
      {selectedSkill && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto text-slate-800">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">{selectedSkill.skill_name}</h2>
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${selectedSkill.classification.badgeBg} ${selectedSkill.classification.badgeText} ${selectedSkill.classification.badgeBorder}`}
                  >
                    {selectedSkill.classification.label}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Jurisdiction: {selectedSkill.district_name} | Sector: {selectedSkill.sector_name}
                </p>
              </div>

              <button
                onClick={() => setSelectedSkill(null)}
                className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors border border-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Score Breakdown Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-indigo-200 text-center space-y-1">
                <div className="text-[10px] font-medium text-indigo-700 uppercase tracking-wider">Direct Hiring Demand</div>
                <div className="text-2xl font-bold text-indigo-700">{selectedSkill.directHiringDemand}</div>
                <div className="text-[10px] text-slate-500 font-mono">persons/year demand</div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-emerald-200 text-center space-y-1">
                <div className="text-[10px] font-medium text-emerald-700 uppercase tracking-wider">Effective Supply</div>
                <div className="text-2xl font-bold text-emerald-700">{selectedSkill.effectiveSupply}</div>
                <div className="text-[10px] text-slate-500 font-mono">persons/year throughput</div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-amber-200 text-center space-y-1">
                <div className="text-[10px] font-medium text-amber-700 uppercase tracking-wider">Coverage %</div>
                <div className="text-2xl font-extrabold text-amber-700">
                  {selectedSkill.coveragePercent}%
                </div>
                <div className="text-[10px] text-slate-500 font-mono">Capacity Coverage</div>
              </div>
            </div>

            {/* "Why?" Math Explainability Step-by-Step */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 font-mono text-xs text-slate-800">
              <div className="font-sans font-bold text-amber-800 text-xs flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                <span>Deterministic Calculation Explanation ("Why?" Breakdown)</span>
              </div>

              <div className="space-y-2 border-t border-slate-200 pt-2 text-[11px]">
                <div>
                  <span className="text-indigo-700 font-bold">1. Coverage Ratio &amp; Percentage:</span>
                  <p className="text-slate-700 mt-0.5">{selectedSkill.explainability.coverage_explain}</p>
                </div>

                <div>
                  <span className="text-rose-700 font-bold">2. Physical Deficit / Surplus:</span>
                  <p className="text-slate-700 mt-0.5">{selectedSkill.explainability.physical_deficit_explain}</p>
                </div>

                <div>
                  <span className="text-indigo-700 font-bold">3. Demand Score Index (0–100):</span>
                  <p className="text-slate-700 mt-0.5">{selectedSkill.explainability.demand_formula}</p>
                </div>

                <div>
                  <span className="text-emerald-700 font-bold">4. Supply Score &amp; Effective Throughput:</span>
                  <p className="text-slate-700 mt-0.5">{selectedSkill.explainability.supply_formula}</p>
                </div>

                <div>
                  <span className="text-amber-700 font-bold">5. Net Gap Index Score:</span>
                  <p className="text-slate-700 mt-0.5">{selectedSkill.explainability.gap_formula}</p>
                </div>
              </div>
            </div>

            {/* Underlying Data Lists (Courses, Seats, Completions) */}
            <div className="space-y-3 text-xs">
              <div className="font-semibold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Regional Courses Teaching Skill ({selectedSkill.courses_count} courses)</span>
              </div>

              {selectedSkill.explainability.contributing_courses.length === 0 ? (
                <div className="text-slate-500 text-xs italic bg-slate-50 p-3 rounded-lg border border-slate-200">
                  No registered vocational courses currently teach this skill in selected district.
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedSkill.explainability.contributing_courses.map((c, i) => (
                    <div key={i} className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-slate-900">{c.course_name}</div>
                        <div className="text-[11px] text-slate-600">{c.institute_name}</div>
                      </div>
                      <div className="text-right font-mono text-[11px]">
                        <div className="text-indigo-700 font-semibold">{c.seats} Annual Seats</div>
                        <div className="text-emerald-700">{c.completions} Annual Completions</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Close */}
            <div className="border-t border-slate-200 pt-3 flex justify-end">
              <button
                onClick={() => setSelectedSkill(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors border border-slate-300"
              >
                Close Explanation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
