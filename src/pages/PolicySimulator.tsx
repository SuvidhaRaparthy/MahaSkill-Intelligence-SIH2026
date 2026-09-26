// MahaSkill Intelligence - Policy What-If Simulator Page (Phase 8)
import React, { useState, useEffect } from 'react';
import { DataClassificationBadge } from '../components/common/DataClassificationBadge';
import { SEED_DISTRICTS, SEED_SECTORS, SEED_SKILLS } from '../data/seedData';
import type {
  BaselineScenarioMetrics,
  SimulationInputs,
  SimulationResult
} from '../analytics/policySimulatorEngine';
import {
  getBaselineScenarioMetrics,
  runPolicySimulation,
  identifyBestScenario,
  saveSimulationRecord,
  fetchSavedSimulations
} from '../analytics/policySimulatorEngine';
import type { SimulationRecord } from '../types/database';
import {
  Sliders,
  RotateCcw,
  Save,
  MapPin,
  Layers,
  UserCheck,
  Cpu,
  BookOpen,
  Info,
  Layers3,
  Award
} from 'lucide-react';

export const PolicySimulator: React.FC = () => {
  // Selection state
  const [selectedDistrict, setSelectedDistrict] = useState('Pune');
  const [selectedSector, setSelectedSector] = useState('Automotive & EV');
  const [selectedSkill, setSelectedSkill] = useState('EV Battery Diagnostics');

  // Interactive Simulation Input State
  const [inputs, setInputs] = useState<SimulationInputs>({
    additional_seats: 0,
    additional_trainers: 1,
    additional_equipment: 3,
    curriculum_module_added: false
  });

  const [scenarioNameInput, setScenarioNameInput] = useState('Scenario A: Target Resource Allocation');

  // Baseline & Simulation Result State
  const [baseline, setBaseline] = useState<BaselineScenarioMetrics | null>(null);
  const [currentSimulation, setCurrentSimulation] = useState<SimulationResult | null>(null);

  // Scenario Comparison List
  const [comparedScenarios, setComparedScenarios] = useState<SimulationResult[]>([]);
  const [savedSimulations, setSavedSimulations] = useState<SimulationRecord[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadBaselineData();
  }, [selectedDistrict, selectedSkill]);

  const loadBaselineData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const bData = await getBaselineScenarioMetrics(selectedDistrict, selectedSkill);
      setBaseline(bData);

      // Determine appropriate default policy inputs for selected target skill
      let targetInputs: SimulationInputs = {
        additional_seats: 0,
        additional_trainers: 0,
        additional_equipment: 0,
        curriculum_module_added: false
      };
      let targetLabel = 'Baseline Scenario (0 inputs)';

      if (bData.skill_name.toLowerCase().includes('react')) {
        targetInputs = {
          additional_seats: 180,
          additional_trainers: 6,
          additional_equipment: 18,
          curriculum_module_added: true
        };
        targetLabel = 'Scenario A: Full Gap Resolution (+180 seats, +6 trainers, +18 workstations)';
      } else if (bData.skill_name.toLowerCase().includes('ev battery')) {
        targetInputs = {
          additional_seats: 0,
          additional_trainers: 1,
          additional_equipment: 3,
          curriculum_module_added: false
        };
        targetLabel = 'Scenario A: Lab & Instructor Upgrade (+1 trainer, +3 benches)';
      }

      setInputs(targetInputs);
      setScenarioNameInput(targetLabel);

      const initialSim = runPolicySimulation(bData, targetInputs, targetLabel);
      setCurrentSimulation(initialSim);

      // Preset comparative scenarios for side-by-side matrix
      const scA = runPolicySimulation(
        bData,
        { additional_seats: Math.max(0, Math.ceil(bData.direct_demand - bData.effective_supply)), additional_trainers: 0, additional_equipment: 0, curriculum_module_added: false },
        'Scenario 1: Seat Expansion Only'
      );
      const scB = runPolicySimulation(
        bData,
        targetInputs,
        'Scenario 2: Target Resource Allocation'
      );
      const scC = runPolicySimulation(
        bData,
        { additional_seats: targetInputs.additional_seats + 100, additional_trainers: targetInputs.additional_trainers + 5, additional_equipment: targetInputs.additional_equipment + 10, curriculum_module_added: true },
        'Scenario 3: Maximum Expansion Grant'
      );

      setComparedScenarios([scA, scB, scC]);

      const saved = await fetchSavedSimulations();
      setSavedSimulations(saved);
    } catch (err: any) {
      console.error('Failed to load Policy Simulator baseline data:', err);
      setLoadError(err?.message || 'Failed to query live baseline metrics from Supabase database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (baseline) {
      const updatedSim = runPolicySimulation(baseline, inputs, scenarioNameInput);
      setCurrentSimulation(updatedSim);
    }
  }, [inputs, scenarioNameInput, baseline]);

  // Reset Simulation to Baseline
  const handleResetSimulation = () => {
    setInputs({
      additional_seats: 0,
      additional_trainers: 0,
      additional_equipment: 0,
      curriculum_module_added: false
    });
    setScenarioNameInput('Baseline Scenario (0 inputs)');
  };

  // Add Current Inputs as a Scenario to Comparison Table
  const handleAddScenarioToComparison = () => {
    if (!baseline) return;
    const newSim = runPolicySimulation(baseline, inputs, scenarioNameInput);
    setComparedScenarios((prev) => [...prev.slice(-3), newSim]); // keep up to 4
  };

  // Save Simulation to Supabase
  const handleSaveSimulation = async () => {
    if (!currentSimulation) return;
    const res = await saveSimulationRecord(currentSimulation);
    if (res.success) {
      setSaveSuccessMsg(`Simulation "${currentSimulation.scenario_name}" saved successfully!`);
      const updated = await fetchSavedSimulations();
      setSavedSimulations(updated);
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    }
  };

  const bestScenario = identifyBestScenario(comparedScenarios);

  const isIT = baseline?.category.toLowerCase().includes('software') ||
               baseline?.category.toLowerCase().includes('it') ||
               baseline?.skill_name.toLowerCase().includes('react') ||
               baseline?.skill_name.toLowerCase().includes('php') ||
               baseline?.skill_name.toLowerCase().includes('ai');
  const equipmentUnitLabel = isIT ? 'workstations' : 'diagnostic kits';

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">
        <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-2"></div>
        <span>Loading Policy What-If Simulator Baseline Data from Supabase...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner with Mandatory Prominent Label */}
      <div className="border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-600" />
              <span>Policy What-If Simulator</span>
            </h1>
            <DataClassificationBadge classification="SIMULATION" />
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Government decision-support tool for testing hypothetical seat capacity, instructor hiring, equipment procurement, and curriculum alignment.
          </p>
        </div>

        {/* PROMINENT MANDATORY SIMULATION LABEL */}
        <div className="bg-amber-50 border border-amber-300 text-amber-900 px-3 py-1.5 rounded-lg text-[11px] font-extrabold tracking-wide uppercase flex items-center gap-1.5 shadow-xs">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>FORECAST / SIMULATION — NOT AN OFFICIAL GOVERNMENT TARGET</span>
        </div>
      </div>

      {/* Error Alert Banner */}
      {loadError && (
        <div className="bg-rose-50 border border-rose-300 p-4 rounded-xl flex items-center gap-3 text-xs text-rose-800 shadow-xs">
          <Info className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <div className="font-bold">Simulator Baseline Query Error</div>
            <div>{loadError}</div>
          </div>
        </div>
      )}

      {/* Target Selection Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
        <div className="text-xs font-semibold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
          <MapPin className="w-3.5 h-3.5 text-indigo-600" />
          <span>Simulation Target Selection</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-600">District</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
            >
              {SEED_DISTRICTS.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-600">Sector</label>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
            >
              {SEED_SECTORS.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-600">Skill / Course</label>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
            >
              {SEED_SKILLS.map((s) => (
                <option key={s.id} value={s.canonical_name}>
                  {s.canonical_name} ({s.category})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid: Left Controls vs Right Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Scenario Controls (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 space-y-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>Hypothetical Policy Controls</span>
            </div>
            <DataClassificationBadge classification="SIMULATION" showIcon={false} />
          </div>

          {/* Scenario Name Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-600">Scenario Label</label>
            <input
              type="text"
              value={scenarioNameInput}
              onChange={(e) => setScenarioNameInput(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500 font-medium"
              placeholder="e.g. Scenario B: Capacity Expansion"
            />
          </div>

          {/* Control A: Additional Training Seats Slider */}
          <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-800 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Additional Seats</span>
              </span>
              <span className="text-emerald-700 font-mono font-bold text-sm">
                +{inputs.additional_seats} seats
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="600"
              step="20"
              value={inputs.additional_seats}
              onChange={(e) => setInputs({ ...inputs, additional_seats: parseInt(e.target.value) || 0 })}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>0 (Baseline)</span>
              <span>+300</span>
              <span>+600 seats</span>
            </div>
          </div>

          {/* Control B: Additional Trainers Slider */}
          <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-800 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                <span>Additional Trainers</span>
              </span>
              <span className="text-indigo-700 font-mono font-bold text-sm">
                +{inputs.additional_trainers} instructors
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={inputs.additional_trainers}
              onChange={(e) => setInputs({ ...inputs, additional_trainers: parseInt(e.target.value) || 0 })}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>0 (Baseline)</span>
              <span>+10</span>
              <span>+20 instructors</span>
            </div>
          </div>

          {/* Control C: Additional Equipment Slider */}
          <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-800 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-amber-600" />
                <span>Additional Lab Equipment</span>
              </span>
              <span className="text-amber-700 font-mono font-bold text-sm">
                +{inputs.additional_equipment} units
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="1"
              value={inputs.additional_equipment}
              onChange={(e) => setInputs({ ...inputs, additional_equipment: parseInt(e.target.value) || 0 })}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>0 (Baseline)</span>
              <span>+15</span>
              <span>+30 {equipmentUnitLabel}</span>
            </div>
          </div>

          {/* Control D: Curriculum Module Alignment Toggle */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-purple-600" />
                <span>Add Curriculum Skill Module</span>
              </span>
              <p className="text-[10px] text-slate-500">Hypothetically align regional ITI curriculum to 100% coverage</p>
            </div>
            <input
              type="checkbox"
              checked={inputs.curriculum_module_added}
              onChange={(e) => setInputs({ ...inputs, curriculum_module_added: e.target.checked })}
              className="w-4 h-4 text-indigo-600 bg-white border-slate-300 rounded cursor-pointer"
            />
          </div>

          {/* Action Buttons: Reset & Save */}
          <div className="space-y-2 pt-2">
            {saveSuccessMsg && (
              <div className="p-2 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg text-xs text-center font-medium">
                {saveSuccessMsg}
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetSimulation}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-300"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Simulation</span>
              </button>

              <button
                onClick={handleAddScenarioToComparison}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-indigo-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-300"
              >
                <Layers3 className="w-3.5 h-3.5" />
                <span>Compare</span>
              </button>

              <button
                onClick={handleSaveSimulation}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Simulation</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Impact Dashboard (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Baseline vs Simulated Comparison Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Net Skill Gap Impact Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-xs">
              <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                <span>Labour-Market Net Skill Gap</span>
                <span className="text-[10px] text-emerald-700 font-bold">
                  {currentSimulation.impact.gap_improvement > 0 ? `-${currentSimulation.impact.gap_improvement} pts gap` : 'No change'}
                </span>
              </div>

              <div className="flex items-baseline gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 block font-mono">Baseline</span>
                  <span className="text-xl font-bold text-rose-600">+{currentSimulation.baseline.gap_score}</span>
                </div>
                <span className="text-slate-400 font-bold text-lg">→</span>
                <div>
                  <span className="text-[10px] text-indigo-600 block font-mono">Simulated</span>
                  <span className="text-2xl font-extrabold text-emerald-600">+{currentSimulation.simulated.gap_score}</span>
                </div>
              </div>

              <div className="text-[10px] font-mono text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200">
                Supply Score index increased from {currentSimulation.baseline.supply_score} to {currentSimulation.simulated.supply_score}/100.
              </div>
            </div>

            {/* Annual Seat Capacity Impact Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-xs">
              <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                <span>Annual Training Capacity</span>
                <span className="text-[10px] text-emerald-700 font-bold">+{inputs.additional_seats} seats</span>
              </div>

              <div className="flex items-baseline gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 block font-mono">Baseline</span>
                  <span className="text-xl font-bold text-slate-700">{currentSimulation.baseline.annual_seats}</span>
                </div>
                <span className="text-slate-400 font-bold text-lg">→</span>
                <div>
                  <span className="text-[10px] text-indigo-600 block font-mono">Simulated</span>
                  <span className="text-2xl font-extrabold text-indigo-700">{currentSimulation.simulated.annual_seats}</span>
                </div>
              </div>

              <div className="text-[10px] font-mono text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200">
                Estimated training capacity expanded by +{inputs.additional_seats} annual student seats.
              </div>
            </div>

            {/* Trainer Capacity Deficit Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-xs">
              <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                <span>Instructor Capacity Deficit</span>
                <span className={`text-[10px] font-bold ${currentSimulation.simulated.trainer_gap >= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {currentSimulation.simulated.trainer_gap >= 0 ? 'Capacity Adequate' : 'Shortage Remains'}
                </span>
              </div>

              <div className="flex items-baseline gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 block font-mono">Baseline</span>
                  <span className="text-xl font-bold text-rose-600">{currentSimulation.baseline.trainer_gap}</span>
                </div>
                <span className="text-slate-400 font-bold text-lg">→</span>
                <div>
                  <span className="text-[10px] text-indigo-600 block font-mono">Simulated</span>
                  <span className={`text-2xl font-extrabold ${currentSimulation.simulated.trainer_gap >= 0 ? 'text-emerald-600' : 'text-amber-700'}`}>
                    {currentSimulation.simulated.trainer_gap >= 0 ? `+${currentSimulation.simulated.trainer_gap}` : currentSimulation.simulated.trainer_gap} trainers
                  </span>
                </div>
              </div>

              <div className="text-[10px] font-mono text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200">
                Available: {currentSimulation.simulated.trainers_available} / Required: {currentSimulation.baseline.trainers_required} certified trainers.
              </div>
            </div>

            {/* Equipment Deficit Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-xs">
              <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                <span>Practical Lab Equipment Deficit</span>
                <span className={`text-[10px] font-bold ${currentSimulation.simulated.equipment_gap >= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {currentSimulation.simulated.equipment_gap >= 0 ? 'Adequate Lab Benches' : 'Equipment Shortage'}
                </span>
              </div>

              <div className="flex items-baseline gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 block font-mono">Baseline</span>
                  <span className="text-xl font-bold text-rose-600">{currentSimulation.baseline.equipment_gap}</span>
                </div>
                <span className="text-slate-400 font-bold text-lg">→</span>
                <div>
                  <span className="text-[10px] text-indigo-600 block font-mono">Simulated</span>
                  <span className={`text-2xl font-extrabold ${currentSimulation.simulated.equipment_gap >= 0 ? 'text-emerald-600' : 'text-amber-700'}`}>
                    {currentSimulation.simulated.equipment_gap >= 0 ? `+${currentSimulation.simulated.equipment_gap}` : currentSimulation.simulated.equipment_gap} units
                  </span>
                </div>
              </div>

              <div className="text-[10px] font-mono text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200">
                Available: {currentSimulation.simulated.equipment_available} / Required: {currentSimulation.baseline.equipment_required} {equipmentUnitLabel}.
              </div>
            </div>
          </div>

          {/* Policy Trade-off Analysis Box */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-xs">
            <div className="text-xs font-bold text-amber-800 flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-600" />
              <span>Policy Delivery Trade-Off Analysis</span>
            </div>

            <div className="space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
              {currentSimulation.impact.tradeoffs.map((t, idx) => (
                <div key={idx} className="text-[11px] font-mono text-slate-700 flex items-start gap-2">
                  <span className="text-amber-600 font-bold">▶</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Explainability & Assumptions Box */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-xs">
            <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Simulation Math & Underlying Assumptions</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1 text-[11px] font-mono text-slate-600">
              <div className="text-indigo-700 font-semibold mb-1">Calculation Trail:</div>
              <div>Baseline Capacity: {currentSimulation.baseline.annual_seats} seats + User Added: {inputs.additional_seats} seats = Simulated: {currentSimulation.simulated.annual_seats} seats</div>
              <div className="mt-2 text-slate-800 font-semibold">Assumptions:</div>
              {currentSimulation.assumptions.map((a, i) => (
                <div key={i} className="text-slate-600">
                  • {a}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Multiple Scenario Comparison Table Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers3 className="w-4 h-4 text-indigo-600" />
              <span>Multi-Scenario Policy Matrix ({comparedScenarios.length} Scenarios)</span>
            </h2>
            <p className="text-[11px] text-slate-600">Side-by-side comparison of baseline vs hypothetical capacity allocations</p>
          </div>

          {bestScenario && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Best-performing simulated scenario: {bestScenario.scenario_name}</span>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Scenario Label</th>
                <th className="py-3 px-4">Additional Seats</th>
                <th className="py-3 px-4">Simulated Supply</th>
                <th className="py-3 px-4">Simulated Net Gap</th>
                <th className="py-3 px-4">Trainer Deficit</th>
                <th className="py-3 px-4">Equipment Deficit</th>
                <th className="py-3 px-4">Curriculum Coverage</th>
                <th className="py-3 px-4">Execution Readiness</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              {/* Baseline Row */}
              <tr className="bg-slate-50 font-bold text-slate-700">
                <td className="py-3 px-4 text-slate-900 font-sans">Baseline (Current Empirical)</td>
                <td className="py-3 px-4">0 seats</td>
                <td className="py-3 px-4">{baseline.supply_score}/100</td>
                <td className="py-3 px-4 text-rose-600">+{baseline.gap_score}</td>
                <td className="py-3 px-4 text-rose-600">{baseline.trainer_gap} trainers</td>
                <td className="py-3 px-4 text-rose-600">{baseline.equipment_gap} units</td>
                <td className="py-3 px-4">{baseline.curriculum_coverage_pct}%</td>
                <td className="py-3 px-4">{baseline.readiness_score}/100</td>
              </tr>

              {/* Simulated Scenarios */}
              {comparedScenarios.map((sc, idx) => (
                <tr
                  key={idx}
                  className={`hover:bg-slate-50 transition-colors ${
                    bestScenario?.scenario_name === sc.scenario_name ? 'bg-emerald-50/70 font-semibold' : ''
                  }`}
                >
                  <td className="py-3 px-4 text-slate-900 font-sans flex items-center gap-2">
                    <span>{sc.scenario_name}</span>
                    {bestScenario?.scenario_name === sc.scenario_name && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] border border-emerald-300 font-extrabold uppercase">
                        Best Scenario
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-emerald-700 font-bold">+{sc.inputs.additional_seats}</td>
                  <td className="py-3 px-4">{sc.simulated.supply_score}/100</td>
                  <td className="py-3 px-4 font-bold text-indigo-700">+{sc.simulated.gap_score}</td>
                  <td className={`py-3 px-4 ${sc.simulated.trainer_gap >= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {sc.simulated.trainer_gap >= 0 ? `+${sc.simulated.trainer_gap}` : sc.simulated.trainer_gap}
                  </td>
                  <td className={`py-3 px-4 ${sc.simulated.equipment_gap >= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {sc.simulated.equipment_gap >= 0 ? `+${sc.simulated.equipment_gap}` : sc.simulated.equipment_gap}
                  </td>
                  <td className="py-3 px-4">{sc.simulated.curriculum_coverage_pct}%</td>
                  <td className="py-3 px-4 font-bold text-emerald-700">{sc.simulated.readiness_score}/100</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Saved Simulations History Log */}
      {savedSimulations.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
          <div className="text-xs font-bold text-slate-900 flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="flex items-center gap-2">
              <Save className="w-4 h-4 text-indigo-600" />
              <span>Saved Simulation Log ({savedSimulations.length})</span>
            </span>
            <DataClassificationBadge classification="SIMULATION" showIcon={false} />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 font-mono">
              <thead className="bg-slate-100 text-slate-700 uppercase text-[10px]">
                <tr>
                  <th className="py-2 px-3">Timestamp</th>
                  <th className="py-2 px-3">Scenario Name</th>
                  <th className="py-2 px-3">Target Skill</th>
                  <th className="py-2 px-3">Added Seats</th>
                  <th className="py-2 px-3">Added Trainers</th>
                  <th className="py-2 px-3">Added Equipment</th>
                  <th className="py-2 px-3">Simulated Gap</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {savedSimulations.slice(0, 5).map((rec, i) => (
                  <tr key={rec.id || i} className="hover:bg-slate-50">
                    <td className="py-2 px-3 text-slate-500 text-[10px]">
                      {rec.created_at ? new Date(rec.created_at).toLocaleTimeString() : 'Recent'}
                    </td>
                    <td className="py-2 px-3 font-sans text-slate-900 font-bold">{rec.scenario_name}</td>
                    <td className="py-2 px-3 text-indigo-700 font-sans">{rec.skill_name}</td>
                    <td className="py-2 px-3 text-emerald-700">+{rec.inputs.additional_seats}</td>
                    <td className="py-2 px-3 text-indigo-700">+{rec.inputs.additional_trainers}</td>
                    <td className="py-2 px-3 text-amber-700">+{rec.inputs.additional_equipment}</td>
                    <td className="py-2 px-3 font-bold text-emerald-700">+{rec.simulated_values.gap_score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
