// MahaSkill Intelligence - Navigation Sidebar Component
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Activity, Lightbulb, TrendingUp, MapPin, 
  Search, BookOpen, CheckCircle, Wrench, Sliders, FileText, 
  AlertTriangle, Database, ShieldCheck, HelpCircle, ChevronRight
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Overview', path: '/', icon: LayoutDashboard },
  { name: 'Labour Signals', path: '/labour-signals', icon: Activity, badge: '300+ Signals' },
  { name: 'Skill Intelligence', path: '/skill-intelligence', icon: Lightbulb },
  { name: 'Emerging Skills', path: '/emerging-skills', icon: TrendingUp, badge: 'Alert', badgeColor: 'bg-amber-500/20 text-amber-300' },
  { name: 'District Intelligence', path: '/district-intelligence', icon: MapPin },
  { name: 'Skill Explorer', path: '/skill-explorer', icon: Search },
  { name: 'Curriculum Intelligence', path: '/curriculum-intelligence', icon: BookOpen },
  { name: 'Employer Validation', path: '/employer-validation', icon: CheckCircle },
  { name: 'Trainer & Equipment', path: '/trainer-equipment', icon: Wrench },
  { name: 'Policy Simulator', path: '/policy-simulator', icon: Sliders },
  { name: 'Training Plans', path: '/training-plans', icon: FileText },
  { name: 'Action Center', path: '/action-center', icon: AlertTriangle, badge: '5 Actions', badgeColor: 'bg-rose-500/20 text-rose-300' },
  { name: 'Data Sources', path: '/data-sources', icon: Database },
  { name: 'Data Quality', path: '/data-quality', icon: ShieldCheck },
  { name: 'Methodology', path: '/methodology', icon: HelpCircle }
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 z-30 shrink-0 text-slate-700 select-none shadow-xs">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-amber-500 via-indigo-600 to-emerald-500 p-0.5 shadow-sm">
          <div className="w-full h-full bg-white rounded-[7px] flex items-center justify-center font-bold text-indigo-700 text-lg">
            MSI
          </div>
        </div>
        <div>
          <h1 className="font-extrabold text-sm text-slate-900 tracking-wide leading-tight">
            MahaSkill Intelligence
          </h1>
          <p className="text-[11px] text-indigo-700 font-semibold tracking-normal">
            Govt Decision Support System
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-200">
        <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
          Decision Support Modules
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110 opacity-80 group-hover:opacity-100" />
                <span className="truncate">{item.name}</span>
              </div>
              {item.badge ? (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                  {item.badge}
                </span>
              ) : (
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / Department Badge */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 flex flex-col gap-1">
        <div className="flex items-center gap-1.5 font-medium text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>SIH26134 Platform Live</span>
        </div>
        <span className="text-[10px] text-slate-500">Maharashtra Skill Dev Corp</span>
      </div>
    </aside>
  );
};
