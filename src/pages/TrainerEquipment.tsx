// MahaSkill Intelligence - Trainer & Equipment Capacity Audit Page (Phase 6)
import React, { useState, useEffect } from 'react';
import { DataClassificationBadge } from '../components/common/DataClassificationBadge';
import type {
  TrainerCapacityItem,
  EquipmentCapacityItem,
  TrainingReadinessItem
} from '../analytics/capacityAndValidationEngine';
import {
  calculateTrainerCapacity,
  calculateEquipmentCapacity,
  calculateTrainingReadiness
} from '../analytics/capacityAndValidationEngine';
import { SEED_DISTRICTS, SEED_SECTORS } from '../data/seedData';
import {
  Wrench,
  UserCheck,
  Cpu,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Info,
  X,
  MapPin,
  Briefcase,
  Award
} from 'lucide-react';

export const TrainerEquipment: React.FC = () => {
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'readiness' | 'trainers' | 'equipment'>('readiness');

  const [trainers, setTrainers] = useState<TrainerCapacityItem[]>([]);
  const [equipment, setEquipment] = useState<EquipmentCapacityItem[]>([]);
  const [readiness, setReadiness] = useState<TrainingReadinessItem[]>([]);
  const [selectedReadiness, setSelectedReadiness] = useState<TrainingReadinessItem | null>(null);

  useEffect(() => {
    loadCapacityData();
  }, [districtFilter, sectorFilter]);

  const loadCapacityData = async () => {
    const [tData, eData, rData] = await Promise.all([
      calculateTrainerCapacity(districtFilter),
      calculateEquipmentCapacity(districtFilter),
      calculateTrainingReadiness(districtFilter, sectorFilter)
    ]);
    setTrainers(tData);
    setEquipment(eData);
    setReadiness(rData);
  };

  const trainerShortageCount = trainers.filter((t) => t.status === 'TRAINER SHORTAGE').length;
  const equipmentShortageCount = equipment.filter((e) => e.status === 'EQUIPMENT SHORTAGE').length;
  const notReadyCount = readiness.filter((r) => r.overall_status.includes('NOT READY')).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Wrench className="w-5 h-5 text-indigo-600" />
              <span>Industry & Training Capacity Audit Center</span>
            </h1>
            <DataClassificationBadge classification="DERIVED_METRIC" />
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Phase 6 Engine: Audits certified instructor availability, practical lab equipment gaps, and overall Training Delivery Readiness scores.
          </p>
        </div>

        <DataClassificationBadge classification="SYNTHETIC_DEMO_DATA" />
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-xs">
          <div className="text-[11px] font-medium text-slate-600 flex items-center justify-between">
            <span>Trainer Capacity Shortages</span>
            <UserCheck className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-600">{trainerShortageCount} Courses</div>
          <div className="text-[10px] text-rose-700 font-mono">Instructor certification gap</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-xs">
          <div className="text-[11px] font-medium text-slate-600 flex items-center justify-between">
            <span>Equipment Lab Shortages</span>
            <Cpu className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-600">{equipmentShortageCount} Labs</div>
          <div className="text-[10px] text-amber-700 font-mono">Diagnostic bench deficit</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-xs">
          <div className="text-[11px] font-medium text-slate-600 flex items-center justify-between">
            <span>Delivery Readiness Bottlenecks</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-600">{notReadyCount} Skills</div>
          <div className="text-[10px] text-rose-700 font-mono">Investment required before launch</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-xs">
          <div className="text-[11px] font-medium text-slate-600 flex items-center justify-between">
            <span>Fully Ready Skilling Modules</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">
            {readiness.filter((r) => r.overall_status === 'FULLY READY').length} Modules
          </div>
          <div className="text-[10px] text-emerald-700 font-mono">Trainers & labs fully equipped</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="text-xs font-semibold text-slate-900 flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-indigo-600" />
            <span>Capacity Audit Filters</span>
          </div>
          <DataClassificationBadge classification="SYNTHETIC_DEMO_DATA" showIcon={false} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-600 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-indigo-600" />
              <span>District Jurisdiction</span>
            </label>
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
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
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Industry Sectors</option>
              {SEED_SECTORS.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 space-x-4">
        <button
          onClick={() => setActiveTab('readiness')}
          className={`pb-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'readiness'
              ? 'border-indigo-600 text-indigo-700 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Training Delivery Readiness Matrix ({readiness.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('trainers')}
          className={`pb-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'trainers'
              ? 'border-indigo-600 text-indigo-700 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Trainer Capacity Audit ({trainers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('equipment')}
          className={`pb-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'equipment'
              ? 'border-indigo-600 text-indigo-700 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Equipment & Practical Lab Audit ({equipment.length})</span>
        </button>
      </div>

      {/* Tab 1: Training Delivery Readiness Matrix */}
      {activeTab === 'readiness' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Skill & Jurisdiction</th>
                <th className="py-3 px-4">Demand Score</th>
                <th className="py-3 px-4">Employer Validation Score</th>
                <th className="py-3 px-4">Trainer Readiness</th>
                <th className="py-3 px-4">Equipment Readiness</th>
                <th className="py-3 px-4">Overall Readiness Score</th>
                <th className="py-3 px-4">Delivery Readiness Status</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {readiness.map((item, idx) => (
                <tr
                  key={idx}
                  onClick={() => setSelectedReadiness(item)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-900">{item.skill_name}</div>
                      <div className="text-[10px] text-slate-500">{item.district_name} | {item.sector_name}</div>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                    {item.demand_score} / 100
                  </td>

                  <td className="py-3 px-4 font-mono font-bold text-amber-700">
                    {item.industry_validation_score} / 100
                  </td>

                  <td className="py-3 px-4 font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className={item.trainer_readiness_pct < 70 ? 'text-rose-600 font-bold' : 'text-emerald-700 font-bold'}>
                        {item.trainer_readiness_pct}%
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className={item.equipment_readiness_pct < 70 ? 'text-amber-700 font-bold' : 'text-emerald-700 font-bold'}>
                        {item.equipment_readiness_pct}%
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-mono font-extrabold text-slate-900 text-sm">
                    {item.overall_readiness_score} / 100
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-1 rounded text-[10px] font-extrabold border ${
                        item.overall_status.includes('NOT READY')
                          ? 'bg-rose-50 text-rose-700 border-rose-300'
                          : item.overall_status === 'FULLY READY'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : item.overall_status.includes('OVERSUPPLIED')
                          ? 'bg-purple-50 text-purple-700 border-purple-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}
                    >
                      {item.overall_status}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedReadiness(item);
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-indigo-700 rounded text-[11px] font-medium flex items-center gap-1 transition-colors border border-slate-300"
                    >
                      <Info className="w-3 h-3" />
                      <span>Full Drill-Down</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Trainer Capacity Audit */}
      {activeTab === 'trainers' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">Skill / Course Module</th>
                <th className="py-3 px-4">Required Certified Trainers</th>
                <th className="py-3 px-4">Available Qualified Trainers</th>
                <th className="py-3 px-4">Trainer Capacity Gap</th>
                <th className="py-3 px-4">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {trainers.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">{t.district_name}</td>
                  <td className="py-3 px-4">
                    <div className="space-y-0.5">
                      <div className="font-bold text-indigo-700">{t.skill_name}</div>
                      <div className="text-[10px] text-slate-500">{t.course_name}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-800">{t.required_capacity} trainers</td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-700">{t.available_trainers} trainers</td>
                  <td className="py-3 px-4 font-mono font-extrabold text-sm">
                    <span className={t.trainer_gap < 0 ? 'text-rose-600' : 'text-emerald-700'}>
                      {t.trainer_gap > 0 ? `+${t.trainer_gap}` : t.trainer_gap}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        t.status === 'TRAINER SHORTAGE'
                          ? 'bg-rose-50 text-rose-700 border-rose-300'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Equipment Capacity Audit */}
      {activeTab === 'equipment' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">Equipment & Practical Lab Type</th>
                <th className="py-3 px-4">Target Skill</th>
                <th className="py-3 px-4">Required Quantity</th>
                <th className="py-3 px-4">Available Quantity</th>
                <th className="py-3 px-4">Equipment Deficit / Gap</th>
                <th className="py-3 px-4">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {equipment.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">{e.district_name}</td>
                  <td className="py-3 px-4 font-semibold text-amber-800">{e.equipment_type}</td>
                  <td className="py-3 px-4 text-indigo-700">{e.skill_name}</td>
                  <td className="py-3 px-4 font-mono text-slate-800">{e.required_quantity} units</td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-700">{e.available_quantity} units</td>
                  <td className="py-3 px-4 font-mono font-extrabold text-sm">
                    <span className={e.equipment_gap < 0 ? 'text-amber-700' : 'text-emerald-700'}>
                      {e.equipment_gap > 0 ? `+${e.equipment_gap}` : e.equipment_gap}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        e.status === 'EQUIPMENT SHORTAGE'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      }`}
                    >
                      {e.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Drill-down Modal */}
      {selectedReadiness && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto text-slate-800">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">{selectedReadiness.skill_name}</h2>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-300">
                    {selectedReadiness.overall_status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Jurisdiction: {selectedReadiness.district_name} | Sector: {selectedReadiness.sector_name}
                </p>
              </div>

              <button
                onClick={() => setSelectedReadiness(null)}
                className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors border border-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Score Metrics Grid */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div className="text-[10px] text-indigo-700 font-medium">Demand</div>
                <div className="text-lg font-bold text-indigo-700">{selectedReadiness.demand_score}</div>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div className="text-[10px] text-amber-800 font-medium">Validation</div>
                <div className="text-lg font-bold text-amber-700">{selectedReadiness.industry_validation_score}</div>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div className="text-[10px] text-emerald-700 font-medium">Trainers</div>
                <div className="text-lg font-bold text-emerald-700">{selectedReadiness.trainer_readiness_pct}%</div>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div className="text-[10px] text-purple-700 font-medium">Equipment</div>
                <div className="text-lg font-bold text-purple-700">{selectedReadiness.equipment_readiness_pct}%</div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="font-semibold text-rose-700 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Delivery Readiness Action Summary</span>
              </div>
              <p className="text-slate-800 leading-relaxed text-[11px] font-medium">{selectedReadiness.action_summary}</p>
            </div>

            <div className="border-t border-slate-200 pt-3 flex justify-end">
              <button
                onClick={() => setSelectedReadiness(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors border border-slate-300"
              >
                Close Drill-Down
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
