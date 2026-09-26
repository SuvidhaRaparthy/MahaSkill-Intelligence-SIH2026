// MahaSkill Intelligence - Main Application Layout Wrapper
import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Outlet } from 'react-router-dom';
import { Info } from 'lucide-react';

export const Layout: React.FC = () => {
  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans antialiased overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <Header />

        {/* System Data Provenance Banner */}
        <div className="bg-amber-50/90 border-b border-amber-200 px-6 py-1.5 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>
              <strong>Prototype Mode:</strong> Demonstrating SIH26134 pipeline with 300+ synthetic job signals & official NCO/NCVET taxonomies across Pune, Nashik & Nagpur.
            </span>
          </div>
          <span className="text-[10px] text-amber-700 font-mono font-semibold">v1.0.0-phase1</span>
        </div>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
