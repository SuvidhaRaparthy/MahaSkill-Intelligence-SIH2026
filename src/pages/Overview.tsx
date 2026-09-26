// MahaSkill Intelligence - Main Government Intelligence Dashboard (Overview)
import React, { useState, useEffect } from 'react';
import { 
  Activity, Lightbulb, TrendingUp, AlertTriangle, CheckCircle, 
  MapPin, ArrowUpRight, ArrowDownRight, Layers, ChevronRight
} from 'lucide-react';
import { DataClassificationBadge } from '../components/common/DataClassificationBadge';
import { SEED_RECOMMENDATIONS, SEED_DISTRICT_SKILL_GAPS } from '../data/seedData';
import { Link } from 'react-router-dom';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  BarChart, Bar, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { supabase } from '../lib/supabase';
import { calculateSkillDemandSupplyGaps } from '../analytics/demandSupplyGapEngine';
import { detectEmergingSkills, generateCurriculumRecommendations } from '../analytics/emergingAndCurriculumEngine';

// Time series demand trend mock data
const DEMAND_TREND_DATA = [
  { month: 'Oct 2025', EV_Diagnostics: 12, React_JS: 95, Cloud_Arch: 45, Legacy_PHP: 30 },
  { month: 'Nov 2025', EV_Diagnostics: 15, React_JS: 108, Cloud_Arch: 52, Legacy_PHP: 26 },
  { month: 'Dec 2025', EV_Diagnostics: 19, React_JS: 118, Cloud_Arch: 59, Legacy_PHP: 22 },
  { month: 'Jan 2026', EV_Diagnostics: 22, React_JS: 130, Cloud_Arch: 66, Legacy_PHP: 18 },
  { month: 'Feb 2026', EV_Diagnostics: 28, React_JS: 142, Cloud_Arch: 78, Legacy_PHP: 14 }
];

// Emerging skills growth chart data baseline
const EMERGING_SKILLS_DATA = [
  { name: 'EV Battery Diagnostics', growth: 154, posting_count: 28, employer_count: 8 },
  { name: 'GenAI & LLM Integration', growth: 180, posting_count: 36, employer_count: 14 },
  { name: 'TypeScript', growth: 65, posting_count: 98, employer_count: 28 },
  { name: 'CAN Bus Diagnostics', growth: 38, posting_count: 19, employer_count: 5 },
  { name: 'BMS Calibration', growth: 85, posting_count: 22, employer_count: 7 }
];

// Demand vs Supply Gap data baseline
const GAP_COMPARISON_DATA = [
  { skill: 'EV Diagnostics', demand: 84, supply: 29 },
  { skill: 'React.js', demand: 91, supply: 58 },
  { skill: 'Cloud Architecture', demand: 78, supply: 32 },
  { skill: 'CAN Bus', demand: 72, supply: 45 },
  { skill: 'Legacy PHP', demand: 22, supply: 70 }
];

// Sector Distribution Data
const SECTOR_DATA = [
  { name: 'Information Technology', value: 65, color: '#6366f1' },
  { name: 'Automotive & EV', value: 35, color: '#10b981' }
];

export const Overview: React.FC = () => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');

  // Dynamic Dashboard State derived from Remote Supabase & Phase 3–8 Analytics Engines
  const [metrics, setMetrics] = useState({
    jobSignals: 300,
    skillsTracked: 14,
    emergingSkills: 10,
    undersupplied: 10,
    oversupply: 3,
    curriculumMismatches: 14,
    validations: 3,
    districts: 3
  });

  const [emergingChartData, setEmergingChartData] = useState(EMERGING_SKILLS_DATA);
  const [gapChartData, setGapChartData] = useState(GAP_COMPARISON_DATA);

  useEffect(() => {
    loadDashboardMetrics();
  }, [selectedDistrict]);

  const loadDashboardMetrics = async () => {
    try {
      const [
        { count: jpCount },
        { count: sCount },
        { count: esCount },
        { count: dCount },
        emerging,
        gaps,
        curriculum
      ] = await Promise.all([
        supabase.from('job_postings').select('id', { count: 'exact', head: true }),
        supabase.from('skills').select('id', { count: 'exact', head: true }),
        supabase.from('employer_signals').select('id', { count: 'exact', head: true }),
        supabase.from('districts').select('id', { count: 'exact', head: true }),
        detectEmergingSkills({ districtId: selectedDistrict }),
        calculateSkillDemandSupplyGaps({ districtId: selectedDistrict }),
        generateCurriculumRecommendations({ districtId: selectedDistrict })
      ]);

      const undersuppliedCount = gaps.filter(g => g.classification.status.includes('SHORTAGE') || g.coveragePercent < 90).length;
      const oversupplyCount = gaps.filter(g => g.classification.status.includes('OVERSUPPLY') || g.coveragePercent > 125).length;

      setMetrics({
        jobSignals: jpCount ?? 300,
        skillsTracked: sCount ?? 14,
        emergingSkills: emerging.length,
        undersupplied: undersuppliedCount,
        oversupply: oversupplyCount,
        curriculumMismatches: curriculum.length,
        validations: esCount ?? 3,
        districts: dCount ?? 3
      });

      if (emerging.length > 0) {
        setEmergingChartData(
          emerging.slice(0, 5).map(e => ({
            name: e.canonical_name,
            growth: e.growth_rate_pct || 0,
            posting_count: e.recent_demand_count,
            employer_count: e.employer_count
          }))
        );
      }

      if (gaps.length > 0) {
        setGapChartData(
          gaps.slice(0, 5).map(g => ({
            skill: g.skill_name.length > 15 ? g.skill_name.substring(0, 14) + '...' : g.skill_name,
            demand: g.demandScore,
            supply: g.supplyScore
          }))
        );
      }
    } catch (err) {
      console.warn('[Overview] Error loading live metrics:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              State Labour-Market Intelligence Dashboard
            </h1>
            <DataClassificationBadge classification="SYNTHETIC_DEMO_DATA" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time skill demand extraction, training supply gap detection, and district decision support for Maharashtra.
          </p>
        </div>

        {/* District Filter Pills */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 p-1 rounded-lg shadow-xs">
          {['ALL', 'Pune', 'Nashik', 'Nagpur'].map((dist) => (
            <button
              key={dist}
              onClick={() => setSelectedDistrict(dist)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                selectedDistrict === dist
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {dist === 'ALL' ? 'All Districts' : dist}
            </button>
          ))}
        </div>
      </div>

      {/* SIH Demonstration Quick Flow Bar */}
      <div className="bg-gradient-to-r from-indigo-50 via-white to-emerald-50 border border-indigo-200 rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
            SIH
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <span>SIH 2026 Recommended Presentation Sequence</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-semibold">Verified Flow</span>
            </div>
            <p className="text-[11px] text-slate-600">Primary Story: Pune React.js (+180 seats) / EV Battery Diagnostics → District Training Plan → Policy Simulator</p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2 text-xs">
          <Link
            to="/skill-intelligence"
            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-[11px] transition-colors flex items-center gap-1 shadow-xs"
          >
            <span>1. EV Demand & Gaps</span>
            <ChevronRight className="w-3 h-3" />
          </Link>

          <Link
            to="/training-plans"
            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-[11px] transition-colors flex items-center gap-1 shadow-xs"
          >
            <span>2. District Training Plan</span>
            <ChevronRight className="w-3 h-3" />
          </Link>

          <Link
            to="/policy-simulator"
            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium text-[11px] transition-colors flex items-center gap-1 shadow-xs"
          >
            <span>3. Policy Simulator</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Top 8 Key Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <div className="text-slate-500 text-[11px] font-medium flex items-center justify-between">
            <span>Job Signals</span>
            <Activity className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 mt-1">{metrics.jobSignals}</div>
          <div className="text-[10px] text-emerald-600 flex items-center font-medium mt-0.5">
            <ArrowUpRight className="w-3 h-3" /> Verified Postings
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <div className="text-slate-500 text-[11px] font-medium flex items-center justify-between">
            <span>Skills Tracked</span>
            <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 mt-1">{metrics.skillsTracked}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Canonical Taxonomy</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <div className="text-slate-500 text-[11px] font-medium flex items-center justify-between">
            <span>Emerging Skills</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-amber-600 mt-1">{metrics.emergingSkills}</div>
          <div className="text-[10px] text-amber-700 font-medium mt-0.5">Alerts Triggered</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <div className="text-slate-500 text-[11px] font-medium flex items-center justify-between">
            <span>Undersupplied</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-xl font-bold text-rose-600 mt-1">{metrics.undersupplied}</div>
          <div className="text-[10px] text-rose-600 font-medium mt-0.5">High Gap Score</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <div className="text-slate-500 text-[11px] font-medium flex items-center justify-between">
            <span>Oversupply</span>
            <ArrowDownRight className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-xl font-bold text-purple-600 mt-1">{metrics.oversupply}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Courses Flagged</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <div className="text-slate-500 text-[11px] font-medium flex items-center justify-between">
            <span>Curriculum Mismatches</span>
            <Layers className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-blue-600 mt-1">{metrics.curriculumMismatches}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Modules for Review</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <div className="text-slate-500 text-[11px] font-medium flex items-center justify-between">
            <span>Validations</span>
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-600 mt-1">{metrics.validations}</div>
          <div className="text-[10px] text-emerald-700 font-medium mt-0.5">Employer Verified</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <div className="text-slate-500 text-[11px] font-medium flex items-center justify-between">
            <span>Districts</span>
            <MapPin className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 mt-1">{metrics.districts}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Pune, Nashik, Nagpur</div>
        </div>
      </div>

      {/* Main Charts & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Time-series Demand Trend */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Skill Demand Growth Trend (5-Month History)</h2>
              <p className="text-[11px] text-slate-500">Monthly job posting frequencies across key focus skills</p>
            </div>
            <DataClassificationBadge classification="DERIVED_METRIC" showIcon={false} />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DEMAND_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradEV" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gradReact" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '12px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} 
                />
                <Area type="monotone" dataKey="EV_Diagnostics" name="EV Battery Diagnostics" stroke="#10b981" fillOpacity={1} fill="url(#gradEV)" strokeWidth={2} />
                <Area type="monotone" dataKey="React_JS" name="React.js" stroke="#6366f1" fillOpacity={1} fill="url(#gradReact)" strokeWidth={2} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Sector Distribution & Quick Sector Filter */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-semibold text-slate-900">Sector Signal Distribution</h2>
            <p className="text-[11px] text-slate-500">Share of job postings by industry vertical</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={SECTOR_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {SECTOR_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '12px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 text-xs">
            {SECTOR_DATA.map((s) => (
              <div key={s.name} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-slate-700 font-medium">{s.name}</span>
                </div>
                <span className="font-bold text-slate-900">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Analytics Row: Emerging Skills & Gap Score Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Emerging Skills Bar Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Top Emerging Skills Growth (%)</h2>
              <p className="text-[11px] text-slate-500">Detected growth rate over prior 3-month baseline</p>
            </div>
            <DataClassificationBadge classification="DERIVED_METRIC" showIcon={false} />
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={emergingChartData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <XAxis type="number" stroke="#64748b" fontSize={11} tickFormatter={(val) => `+${val}%`} />
                <YAxis dataKey="name" type="category" stroke="#334155" fontSize={11} width={130} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '12px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} 
                  formatter={(value: any) => [`+${value}% Growth`, 'Growth Rate']}
                />
                <Bar dataKey="growth" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Demand vs Supply Score Comparison */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Demand vs Supply Score (0 - 100 Index)</h2>
              <p className="text-[11px] text-slate-500">Employer Demand score compared to Training Supply score</p>
            </div>
            <DataClassificationBadge classification="DERIVED_METRIC" showIcon={false} />
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gapChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="skill" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '12px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} 
                />
                <Bar dataKey="demand" name="Demand Score (0-100)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="supply" name="Supply Score (0-100)" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Interactive Maharashtra Map Preview Placeholder & District Quick Stats */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <span>Maharashtra Skill Gap Heatmap (Pune, Nashik, Nagpur Focus)</span>
            </h2>
            <p className="text-[11px] text-slate-500">Geographic distribution of demand-supply mismatches across key Maharashtra economic nodes</p>
          </div>
          <Link 
            to="/district-intelligence"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>View Full Map & Intelligence</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Map Preview Component Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-slate-50 rounded-xl border border-slate-200 p-4 relative overflow-hidden flex flex-col justify-between min-h-[260px]">
            {/* Simulated Map Visual Layout */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="relative z-10 space-y-2">
              <div className="text-xs font-semibold text-slate-800">Maharashtra District Cluster Overview</div>
              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-medium">🟢 Pune: Critical EV Gap (+55)</span>
                <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-medium">🟠 Nashik: Moderate Electronics Gap (+27)</span>
                <span className="bg-rose-100 text-rose-800 border border-rose-200 px-2 py-0.5 rounded font-medium">🔴 Nagpur: Trainer Deficit & Cloud Demand (+46)</span>
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-3 gap-3 bg-white/90 backdrop-blur border border-slate-200 p-3 rounded-lg text-xs shadow-xs">
              <div>
                <div className="text-slate-500 text-[10px]">Pune District</div>
                <div className="font-bold text-slate-900 text-sm">170 Postings</div>
                <div className="text-emerald-700 text-[10px] font-semibold">Top: EV Battery Diag</div>
              </div>
              <div>
                <div className="text-slate-500 text-[10px]">Nashik District</div>
                <div className="font-bold text-slate-900 text-sm">68 Postings</div>
                <div className="text-amber-700 text-[10px] font-semibold">Top: CAN Bus</div>
              </div>
              <div>
                <div className="text-slate-500 text-[10px]">Nagpur District</div>
                <div className="font-bold text-slate-900 text-sm">90 Postings</div>
                <div className="text-indigo-700 text-[10px] font-semibold">Top: Cloud Arch</div>
              </div>
            </div>
          </div>

          {/* District Summary Sidebar */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Top District Mismatches</h3>
            <div className="space-y-2">
              {SEED_DISTRICT_SKILL_GAPS.slice(0, 3).map((item) => (
                <div key={`${item.district_name}-${item.skill_name}`} className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs space-y-1 shadow-xs">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-slate-900">{item.district_name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${item.gap_score > 40 ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-amber-100 text-amber-800 border border-amber-200'}`}>
                      Gap: +{item.gap_score}
                    </span>
                  </div>
                  <div className="text-indigo-700 text-[11px] font-semibold">{item.skill_name}</div>
                  <div className="text-[10px] text-slate-500 flex items-center justify-between">
                    <span>{item.sector_name}</span>
                    <span className="text-slate-700 font-medium">+{item.growth_rate}% growth</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top 5 Government Priority Actions Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Government Action Center - Priority Decision Support</span>
            </h2>
            <p className="text-[11px] text-slate-500">Algorithmic action recommendations backed by employer signal evidence</p>
          </div>
          <Link
            to="/action-center"
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
          >
            Open Action Center
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">District</th>
                <th className="py-2.5 px-3">Sector</th>
                <th className="py-2.5 px-3">Skill / Course</th>
                <th className="py-2.5 px-3">Recommended Action Summary</th>
                <th className="py-2.5 px-3">Gap Score</th>
                <th className="py-2.5 px-3">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {SEED_RECOMMENDATIONS.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      rec.priority === 'CRITICAL' 
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : rec.priority === 'HIGH'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}>
                      {rec.priority}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{rec.district_name}</td>
                  <td className="py-3 px-3 text-slate-500">{rec.sector_name}</td>
                  <td className="py-3 px-3 font-semibold text-indigo-700">{rec.skill_name}</td>
                  <td className="py-3 px-3 max-w-md text-slate-800">{rec.summary}</td>
                  <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                    {rec.gap_score > 0 ? `+${rec.gap_score}` : rec.gap_score}
                  </td>
                  <td className="py-3 px-3 font-medium text-amber-700">{rec.confidence}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
