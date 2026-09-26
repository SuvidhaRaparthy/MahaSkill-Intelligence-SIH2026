// MahaSkill Intelligence - Data Ingestion & Data Sources Center Page
import React, { useState } from 'react';
import { DATA_SOURCE_REGISTRY } from '../data-sources/SourceRegistry';
import { DataImportWizard } from '../components/ingestion/DataImportWizard';
import { ImportHistoryTable } from '../components/ingestion/ImportHistoryTable';
import { DataClassificationBadge } from '../components/common/DataClassificationBadge';
import { Download, ShieldCheck } from 'lucide-react';

export const DataSources: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState<number>(0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Data Ingestion Architecture & Source Registry
            </h1>
            <DataClassificationBadge classification="REAL_PUBLIC_DATA" />
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Modular data ingestion system for importing official government datasets, employer survey signals, and vocational course catalogs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/samples/sample_job_postings.csv"
            download
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>Job Postings Sample CSV</span>
          </a>
          <a
            href="/samples/sample_skill_taxonomy.csv"
            download
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-amber-600" />
            <span>Skill Taxonomy Sample CSV</span>
          </a>
        </div>
      </div>

      {/* Interactive Data Import Wizard */}
      <DataImportWizard onImportComplete={() => setRefreshKey(prev => prev + 1)} />

      {/* Ingestion Audit Trail Table */}
      <ImportHistoryTable key={refreshKey} />

      {/* Configured Data Sources Registry Grid */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Official & Public Data Source Adapters (9 Configured Categories)</span>
          </h2>
          <p className="text-[11px] text-slate-600">Authorized government portals, survey protocols, and reference classification taxonomies</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.values(DATA_SOURCE_REGISTRY).map((src) => (
            <div key={src.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 flex flex-col justify-between hover:border-slate-300 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-700">{src.source_name}</span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                    {src.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600">{src.organization}</div>
              </div>

              <div className="text-[11px] text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
                {src.notes}
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-200 pt-2 font-mono">
                <span>Access: {src.access_method}</span>
                <span className="text-slate-800 font-semibold">{src.source_type}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
