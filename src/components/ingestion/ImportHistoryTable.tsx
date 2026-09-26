// MahaSkill Intelligence - Import History Audit Trail Component
import React, { useEffect, useState } from 'react';
import { fetchImportHistory } from '../../data-import/importService';
import type { DataImportRecord } from '../../data-import/importService';
import { Database, CheckCircle, AlertTriangle, XCircle, RefreshCw, FileText, Clock } from 'lucide-react';

export const ImportHistoryTable: React.FC = () => {
  const [history, setHistory] = useState<DataImportRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadHistory = async () => {
    setIsLoading(true);
    const data = await fetchImportHistory();
    setHistory(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-600" />
            <span>Ingestion Audit Log & History (`data_imports`)</span>
          </h2>
          <p className="text-[11px] text-slate-500">Complete record of every dataset file imported into Supabase</p>
        </div>
        <button
          onClick={loadHistory}
          className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 border border-slate-200 transition-colors flex items-center gap-1 text-xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-600 font-semibold bg-slate-50">
              <th className="py-2.5 px-3">Import Date</th>
              <th className="py-2.5 px-3">Source Name</th>
              <th className="py-2.5 px-3">Filename</th>
              <th className="py-2.5 px-3">Processed</th>
              <th className="py-2.5 px-3">Accepted</th>
              <th className="py-2.5 px-3">Rejected</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Audit Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-800">
            {history.map((record) => (
              <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{new Date(record.imported_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  </div>
                </td>
                <td className="py-3 px-3 font-semibold text-indigo-700">{record.source_name}</td>
                <td className="py-3 px-3 font-mono text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate max-w-[180px]">{record.filename}</span>
                </td>
                <td className="py-3 px-3 font-mono font-semibold text-slate-900">{record.records_processed}</td>
                <td className="py-3 px-3 font-mono font-semibold text-emerald-700">+{record.records_accepted}</td>
                <td className="py-3 px-3 font-mono font-semibold text-rose-700">
                  {record.records_rejected > 0 ? `-${record.records_rejected}` : '0'}
                </td>
                <td className="py-3 px-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 ${
                    record.status === 'COMPLETED'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      : record.status === 'PARTIAL_SUCCESS'
                      ? 'bg-amber-50 text-amber-800 border border-amber-300'
                      : 'bg-rose-50 text-rose-800 border border-rose-300'
                  }`}>
                    {record.status === 'COMPLETED' && <CheckCircle className="w-3 h-3 text-emerald-600" />}
                    {record.status === 'PARTIAL_SUCCESS' && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                    {record.status === 'FAILED' && <XCircle className="w-3 h-3 text-rose-600" />}
                    <span>{record.status}</span>
                  </span>
                </td>
                <td className="py-3 px-3 max-w-xs text-slate-500 truncate text-[11px]">
                  {record.error_summary || 'All records successfully verified & imported.'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
