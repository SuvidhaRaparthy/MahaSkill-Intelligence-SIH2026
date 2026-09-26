// MahaSkill Intelligence - District Training Plan Generator Page (Phase 7)
import React, { useState, useEffect } from 'react';
import { DataClassificationBadge } from '../components/common/DataClassificationBadge';
import type {
  DistrictTrainingPlanItem,
  DistrictComparisonSummary,
  PlanFilterOptions
} from '../analytics/districtTrainingPlanEngine';
import {
  generateDistrictTrainingPlans,
  generateDistrictComparisons
} from '../analytics/districtTrainingPlanEngine';
import { exportDistrictTrainingPlanPDF } from '../utils/pdfExportEngine';
import { SEED_DISTRICTS, SEED_SECTORS } from '../data/seedData';
import {
  FileText,
  MapPin,
  Briefcase,
  Layers,
  Filter,
  Search,
  Info,
  X,
  Printer,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Cpu
} from 'lucide-react';

export const TrainingPlans: React.FC = () => {
  const [filters, setFilters] = useState<PlanFilterOptions>({
    districtName: 'ALL',
    sectorName: 'ALL',
    priorityLevel: 'ALL'
  });

  const [plans, setPlans] = useState<DistrictTrainingPlanItem[]>([]);
  const [comparisons, setComparisons] = useState<DistrictComparisonSummary[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<DistrictTrainingPlanItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    const [pData, cData] = await Promise.all([
      generateDistrictTrainingPlans(filters),
      generateDistrictComparisons()
    ]);
    setPlans(pData);
    setComparisons(cData);
  };

  const filteredPlans = plans.filter((p) => {
    const matchesSearch =
      p.district_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.skill_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sector_name.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Maharashtra Aggregates
  const totalAdditionalSeats = plans.reduce((sum, p) => sum + p.estimated_additional_seats, 0);
  const totalTrainerDeficit = plans.reduce((sum, p) => sum + p.estimated_additional_trainers, 0);
  const totalEquipmentDeficit = plans.reduce((sum, p) => sum + p.estimated_additional_equipment, 0);
  const highPriorityCount = plans.filter((p) => p.priority.level === 'HIGH').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <span>District Training Plan Generator</span>
            </h1>
            <DataClassificationBadge classification="DERIVED_METRIC" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Phase 7 Engine: Algorithmic government decision-support generator synthesizing demand, supply, employer validations, and trainer/equipment capacity grants.
          </p>
        </div>

        <DataClassificationBadge classification="SYNTHETIC_DEMO_DATA" />
      </div>

      {/* Maharashtra Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
            <span>High-Priority Skilling Plans</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-700">{highPriorityCount} Plans</div>
          <div className="text-[10px] text-rose-800 font-mono font-medium">Immediate intervention needed</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
            <span>Estimated Additional Capacity</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">+{totalAdditionalSeats} Seats</div>
          <div className="text-[10px] text-emerald-800 font-mono font-medium">Estimated skilling expansion</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
            <span>Trainer Hiring Grant Deficit</span>
            <UserCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-indigo-700">+{totalTrainerDeficit} Instructors</div>
          <div className="text-[10px] text-indigo-800 font-mono font-medium">Certified trainers needed</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
            <span>Practical Equipment Deficit</span>
            <Cpu className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700">+{totalEquipmentDeficit} Units</div>
          <div className="text-[10px] text-amber-800 font-mono font-medium">Diagnostic benches required</div>
        </div>
      </div>

      {/* District Side-by-Side Comparison Section */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-indigo-600" />
          <span>Regional District Comparison (Pune vs Nashik vs Nagpur)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {comparisons.map((c) => (
            <div
              key={c.district_name}
              className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 hover:border-indigo-300 transition-colors shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900 text-sm">{c.district_name} District</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    c.highest_priority_level === 'HIGH'
                      ? 'bg-rose-950/60 text-rose-300 border-rose-700/60'
                      : 'bg-amber-950/60 text-amber-300 border-amber-700/60'
                  }`}
                >
                  {c.highest_priority_level} PRIORITY
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1 text-xs font-mono">
                <div className="flex justify-between text-slate-700">
                  <span>Additional Seats:</span>
                  <span className="font-bold text-emerald-700">+{c.total_additional_seats} seats</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Trainer Gap:</span>
                  <span className="font-bold text-indigo-700">+{c.total_trainer_shortage} trainers</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Equipment Deficit:</span>
                  <span className="font-bold text-amber-700">+{c.total_equipment_shortage} units</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 space-y-1">
                <div className="font-semibold text-slate-700 text-[10px]">Top Skill Gaps:</div>
                <div className="text-slate-800 text-[11px] font-medium">{c.top_skill_gaps.join(', ')}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="text-xs font-semibold text-slate-900 flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-indigo-600" />
            <span>Training Plan Filters</span>
          </div>
          <DataClassificationBadge classification="SYNTHETIC_DEMO_DATA" showIcon={false} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-600 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-indigo-600" />
              <span>District</span>
            </label>
            <select
              value={filters.districtName}
              onChange={(e) => setFilters({ ...filters, districtName: e.target.value })}
              className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
            >
              <option value="ALL">All Maharashtra Districts</option>
              {SEED_DISTRICTS.map((d) => (
                <option key={d.id} value={d.name}>
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
              value={filters.sectorName}
              onChange={(e) => setFilters({ ...filters, sectorName: e.target.value })}
              className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
            >
              <option value="ALL">All Industry Sectors</option>
              {SEED_SECTORS.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-600 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-indigo-600" />
              <span>Priority Level</span>
            </label>
            <select
              value={filters.priorityLevel}
              onChange={(e) => setFilters({ ...filters, priorityLevel: e.target.value })}
              className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
            >
              <option value="ALL">All Priority Levels</option>
              <option value="HIGH">HIGH (Score &ge; 70)</option>
              <option value="MEDIUM">MEDIUM (Score 40&ndash;69)</option>
              <option value="LOW">LOW (Score &lt; 40)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-600 flex items-center gap-1">
              <Search className="w-3 h-3 text-indigo-600" />
              <span>Search Plan</span>
            </label>
            <input
              type="text"
              placeholder="Search district or skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Main District Training Plans Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs space-y-3">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Algorithmic Skilling Roadmap Plans ({filteredPlans.length})</span>
            </h2>
            <p className="text-[11px] text-slate-500">Click any row for complete mathematical "Why This District?" evidence & PDF export</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">Priority Level</th>
                <th className="py-3 px-4">Skill & Sector</th>
                <th className="py-3 px-4">Current Capacity</th>
                <th className="py-3 px-4">Estimated Additional Capacity</th>
                <th className="py-3 px-4">Trainer Requirement</th>
                <th className="py-3 px-4">Equipment Requirement</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPlans.map((plan) => (
                <tr
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 font-bold text-slate-900">{plan.district_name}</td>

                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-1 rounded text-[10px] font-extrabold border ${plan.priority.badgeBg} ${plan.priority.badgeText} ${plan.priority.badgeBorder}`}
                    >
                      {plan.priority.level} ({plan.priority_score})
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="space-y-0.5">
                      <div className="font-bold text-indigo-700">{plan.skill_name}</div>
                      <div className="text-[10px] text-slate-500">{plan.sector_name}</div>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-800">
                    {plan.current_annual_capacity} seats
                  </td>

                  <td className="py-3 px-4 font-mono font-extrabold text-emerald-700">
                    {plan.estimated_additional_seats > 0 ? (
                      `+${plan.estimated_additional_seats} seats`
                    ) : (
                      <span className="text-slate-400 font-normal italic">Sufficient</span>
                    )}
                  </td>

                  <td className="py-3 px-4 font-mono text-indigo-700 font-semibold">
                    {plan.estimated_additional_trainers > 0 ? (
                      `+${plan.estimated_additional_trainers} trainers`
                    ) : (
                      <span className="text-slate-400 font-normal italic">Adequate</span>
                    )}
                  </td>

                  <td className="py-3 px-4 font-mono text-amber-700 font-semibold">
                    {plan.estimated_additional_equipment > 0 ? (
                      `+${plan.estimated_additional_equipment} units`
                    ) : (
                      <span className="text-slate-400 font-normal italic">Adequate</span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPlan(plan);
                        }}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-indigo-700 border border-slate-200 rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
                      >
                        <Info className="w-3 h-3" />
                        <span>Why?</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          exportDistrictTrainingPlanPDF(plan);
                        }}
                        className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-xs"
                      >
                        <Printer className="w-3 h-3" />
                        <span>PDF</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drill-down Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-xl relative max-h-[90vh] overflow-y-auto text-slate-800">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">{selectedPlan.district_name} Skilling Plan — {selectedPlan.skill_name}</h2>
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold border ${selectedPlan.priority.badgeBg} ${selectedPlan.priority.badgeText} ${selectedPlan.priority.badgeBorder}`}
                  >
                    {selectedPlan.priority.level} ({selectedPlan.priority_score}/100)
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Sector: {selectedPlan.sector_name}</p>
              </div>

              <button
                onClick={() => setSelectedPlan(null)}
                className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* "WHY THIS DISTRICT?" Governance Explanation Box */}
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 space-y-2 font-mono text-xs text-amber-950">
              <div className="font-sans font-bold text-amber-900 text-xs flex items-center gap-1.5">
                <Info className="w-4 h-4 text-amber-600" />
                <span>"WHY THIS DISTRICT?" Governance Explanation</span>
              </div>
              <p className="leading-relaxed whitespace-pre-line text-amber-950 text-[11px] font-medium">{selectedPlan.why_this_district}</p>
            </div>

            {/* Recommended Governance Actions */}
            <div className="space-y-2 text-xs">
              <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Recommended Governance Actions (Non-Automatic Decision Support)</span>
              </div>

              <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                {selectedPlan.recommended_actions.map((act, i) => (
                  <div key={i} className="text-slate-800 text-[11px] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                    <span>{act}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
              <button
                onClick={() => exportDistrictTrainingPlanPDF(selectedPlan)}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Export PDF Training Plan</span>
              </button>

              <button
                onClick={() => setSelectedPlan(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                Close Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
