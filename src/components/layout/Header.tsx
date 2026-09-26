// MahaSkill Intelligence - Header Navigation Bar Component
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../context/AuthContext';
import { Search, UserCheck } from 'lucide-react';
import { DataClassificationBadge } from '../common/DataClassificationBadge';

export const Header: React.FC = () => {
  const { user, role, loginDemo } = useAuth();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as UserRole;
    loginDemo(newRole);
  };

  return (
    <header className="h-16 bg-white/90 backdrop-blur border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 text-slate-800">
      {/* Search Input */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search skills (e.g. EV Battery, React), districts, courses or codes..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Controls & User Profile */}
      <div className="flex items-center gap-4">
        {/* Data Classification Badge */}
        <DataClassificationBadge classification="DERIVED_METRIC" />

        {/* Role Selector Dropdown */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
          <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
          <span className="text-slate-500 font-medium text-[11px]">Role:</span>
          <select
            value={role}
            onChange={handleRoleChange}
            className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer text-xs"
          >
            <option value="GOVERNMENT_OFFICIAL" className="bg-white text-slate-800">
              🏛️ Government Official
            </option>
            <option value="TRAINING_INSTITUTE" className="bg-white text-slate-800">
              🏫 Training Institute
            </option>
            <option value="EMPLOYER" className="bg-white text-slate-800">
              🏢 Employer / Industry
            </option>
            <option value="PUBLIC_ANALYST" className="bg-white text-slate-800">
              👥 Student / Public Analyst
            </option>
          </select>
        </div>

        {/* User Card */}
        {user && (
          <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
            <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center font-bold text-xs text-indigo-700">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-slate-800 leading-tight">{user.name}</div>
              <div className="text-[10px] text-slate-500 truncate max-w-[140px]">{user.department || user.email}</div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
