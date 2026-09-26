// MahaSkill Intelligence - Data Import Wizard Component
import React, { useState } from 'react';
import { DATA_SOURCE_REGISTRY } from '../../data-sources/SourceRegistry';
import type { DatasetType, ImportValidationResult } from '../../data-sources/DataSourceAdapter';
import { parseUploadedFile, parseTextContent } from '../../data-import/fileParser';
import type { ParsedFileData } from '../../data-import/fileParser';
import { validateImportDataset } from '../../data-import/importValidator';
import { executeDatasetImport } from '../../data-import/importService';
import { 
  UploadCloud, CheckCircle, AlertTriangle, XCircle, 
  ArrowRight, RefreshCw, Check, FileCode 
} from 'lucide-react';
import { DataClassificationBadge } from '../common/DataClassificationBadge';

interface Props {
  onImportComplete?: () => void;
}

export const DataImportWizard: React.FC<Props> = ({ onImportComplete }) => {
  const [selectedSourceId, setSelectedSourceId] = useState<string>('ncs');
  const [datasetType, setDatasetType] = useState<DatasetType>('JOB_POSTINGS');

  const [parsedData, setParsedData] = useState<ParsedFileData | null>(null);
  const [validationResult, setValidationResult] = useState<ImportValidationResult | null>(null);
  const [viewTab, setViewTab] = useState<'ALL' | 'VALID' | 'ERRORS'>('ALL');

  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);

  const selectedSource = DATA_SOURCE_REGISTRY[selectedSourceId] || DATA_SOURCE_REGISTRY.ncs;

  // Process File Upload
  const handleFileUpload = async (file: File) => {
    setImportStatus(null);
    try {
      const parsed = await parseUploadedFile(file);
      setParsedData(parsed);

      const validation = validateImportDataset(parsed.records, datasetType, selectedSourceId);
      setValidationResult(validation);
    } catch (err: any) {
      alert(`Error reading file: ${err.message}`);
    }
  };

  // Load Sample Dataset
  const handleLoadSample = async (sampleUrl: string, sampleDatasetType: DatasetType) => {
    setImportStatus(null);
    setDatasetType(sampleDatasetType);
    try {
      const res = await fetch(sampleUrl);
      const text = await res.text();
      const filename = sampleUrl.split('/').pop() || 'sample.csv';
      const parsed = parseTextContent(text, filename);
      setParsedData(parsed);

      const validation = validateImportDataset(parsed.records, sampleDatasetType, selectedSourceId);
      setValidationResult(validation);
    } catch (err: any) {
      alert(`Error loading sample dataset: ${err.message}`);
    }
  };

  // Execute Import to Supabase
  const handleExecuteImport = async () => {
    if (!validationResult || !parsedData) return;
    setIsImporting(true);
    setImportStatus(null);

    const res = await executeDatasetImport(
      validationResult,
      datasetType,
      selectedSourceId,
      parsedData.filename
    );

    setIsImporting(false);
    if (res.success) {
      setImportStatus({
        success: true,
        message: `Successfully imported ${res.importRecord.records_accepted} records into Supabase table! Recorded in data_imports audit log.`
      });
      if (onImportComplete) onImportComplete();
    } else {
      setImportStatus({
        success: false,
        message: res.error || 'Import failed to write records into database.'
      });
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
      {/* Wizard Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-indigo-600" />
            <span>Interactive Data Import & Validation Pipeline</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ingest CSV/JSON datasets from official portals, perform row-level schema validation, and insert valid records into Supabase.
          </p>
        </div>
        <DataClassificationBadge classification="REAL_PUBLIC_DATA" showIcon={false} />
      </div>

      {/* Step 1: Select Source & Dataset Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">1. Data Source Category</label>
          <select
            value={selectedSourceId}
            onChange={(e) => {
              setSelectedSourceId(e.target.value);
              setParsedData(null);
              setValidationResult(null);
            }}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            {Object.values(DATA_SOURCE_REGISTRY).map((src) => (
              <option key={src.id} value={src.id} className="bg-white text-slate-800">
                {src.source_name} ({src.organization})
              </option>
            ))}
          </select>
          <div className="text-[11px] text-slate-500 italic mt-1">{selectedSource.notes}</div>
        </div>

        {/* Dataset Type Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">2. Target Dataset Type</label>
          <select
            value={datasetType}
            onChange={(e) => {
              const newType = e.target.value as DatasetType;
              setDatasetType(newType);
              if (parsedData) {
                const validation = validateImportDataset(parsedData.records, newType, selectedSourceId);
                setValidationResult(validation);
              }
            }}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="JOB_POSTINGS" className="bg-white text-slate-800">📋 Job Vacancy Postings (`job_postings`)</option>
            <option value="SKILL_TAXONOMY" className="bg-white text-slate-800">💡 Skill Taxonomy & Aliases (`skills`)</option>
            <option value="COURSES_TRAINING" className="bg-white text-slate-800">🏫 Training Courses & Seats (`courses`)</option>
            <option value="EMPLOYER_SIGNALS" className="bg-white text-slate-800">🏢 Employer Survey Signals (`employer_signals`)</option>
          </select>
          <div className="text-[11px] text-slate-500 mt-1">
            Required columns: <span className="font-mono text-indigo-700">{ (selectedSource.required_fields[datasetType] || []).join(', ') }</span>
          </div>
        </div>
      </div>

      {/* Step 2: Upload Area or Load Test Sample */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-slate-700">3. Upload Dataset File or Load Test Sample</label>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* File Upload Box */}
          <div className="md:col-span-2 border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50/70 rounded-xl p-6 text-center space-y-2 transition-colors cursor-pointer relative">
            <input
              type="file"
              accept=".csv,.json,.txt"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <UploadCloud className="w-8 h-8 text-indigo-600 mx-auto" />
            <div className="text-xs font-medium text-slate-800">
              Drag & Drop your <span className="text-indigo-700 font-semibold">CSV</span> or <span className="text-indigo-700 font-semibold">JSON</span> file here
            </div>
            <div className="text-[10px] text-slate-500">Supports standard UTF-8 encoded CSV, TSV, and JSON tabular exports</div>
          </div>

          {/* Quick Sample Dataset Cards */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 flex flex-col justify-between">
            <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-amber-600" />
              <span>Load Synthetic Test Sample</span>
            </div>
            <div className="text-[11px] text-slate-500">Test the complete pipeline upload → validation → Supabase database insertion.</div>
            
            <div className="space-y-1.5 pt-1">
              <button
                onClick={() => handleLoadSample('/samples/sample_job_postings.csv', 'JOB_POSTINGS')}
                className="w-full py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-medium text-left flex items-center justify-between transition-colors"
              >
                <span>Sample NCS Job Postings</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleLoadSample('/samples/sample_skill_taxonomy.csv', 'SKILL_TAXONOMY')}
                className="w-full py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-medium text-left flex items-center justify-between transition-colors"
              >
                <span>Sample Skill Taxonomy CSV</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Summary & Record Preview */}
      {validationResult && parsedData && (
        <div className="space-y-4 border-t border-slate-200 pt-5">
          {/* Validation Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
              <div className="text-[11px] text-slate-500">Total File Records</div>
              <div className="text-lg font-bold text-slate-900">{validationResult.totalRecords}</div>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
              <div className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Accepted Records
              </div>
              <div className="text-lg font-bold text-emerald-800">{validationResult.acceptedRecords.length}</div>
            </div>
            <div className="bg-rose-50 border border-rose-200 p-3 rounded-lg">
              <div className="text-[11px] text-rose-800 font-semibold flex items-center gap-1">
                <XCircle className="w-3 h-3" /> Rejected Records
              </div>
              <div className="text-lg font-bold text-rose-800">{validationResult.rejectedRecords.length}</div>
            </div>
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
              <div className="text-[11px] text-amber-800 font-semibold">Validation Status</div>
              <div className="text-xs font-bold text-amber-800 mt-1">
                {validationResult.isValid ? '100% Passed Schema' : 'Validation Warnings'}
              </div>
            </div>
          </div>

          {/* Validation Error Reasons Breakdown */}
          {validationResult.rejectedRecords.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs space-y-2">
              <div className="font-semibold text-rose-800 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Row Validation Errors ({validationResult.rejectedRecords.length} Rows Flagged)</span>
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {validationResult.rejectedRecords.map((rej) => (
                  <div key={rej.rowIndex} className="text-[11px] text-rose-900 font-mono bg-rose-100/70 border border-rose-200 px-2.5 py-1 rounded">
                    <strong>Row #{rej.rowIndex}:</strong> {rej.errors.join(' | ')}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Table Preview Filter Tabs */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewTab('ALL')}
                className={`px-3 py-1 rounded-md text-xs font-medium ${
                  viewTab === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Rows ({validationResult.totalRecords})
              </button>
              <button
                onClick={() => setViewTab('VALID')}
                className={`px-3 py-1 rounded-md text-xs font-medium ${
                  viewTab === 'VALID' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Valid Rows ({validationResult.acceptedRecords.length})
              </button>
              {validationResult.rejectedRecords.length > 0 && (
                <button
                  onClick={() => setViewTab('ERRORS')}
                  className={`px-3 py-1 rounded-md text-xs font-medium ${
                    viewTab === 'ERRORS' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Errors ({validationResult.rejectedRecords.length})
                </button>
              )}
            </div>

            <div className="text-[11px] text-slate-500 font-mono">
              File: {parsedData.filename} ({parsedData.fileType})
            </div>
          </div>

          {/* Data Records Preview Table */}
          <div className="overflow-x-auto max-h-60 border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 font-semibold bg-slate-50 sticky top-0">
                  <th className="py-2 px-3">Status</th>
                  {parsedData.headers.slice(0, 6).map((h) => (
                    <th key={h} className="py-2 px-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {(viewTab === 'ALL'
                  ? parsedData.records
                  : viewTab === 'VALID'
                  ? validationResult.acceptedRecords
                  : validationResult.rejectedRecords.map((r) => r.rawData)
                ).map((row, i) => {
                  const isRejected = validationResult.rejectedRecords.some((r) => r.rawData === row);
                  return (
                    <tr key={i} className={isRejected ? 'bg-rose-50/60' : 'hover:bg-slate-50'}>
                      <td className="py-2 px-3">
                        {isRejected ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-rose-100 text-rose-800 font-bold border border-rose-300">
                            Rejected
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                            Valid
                          </span>
                        )}
                      </td>
                      {parsedData.headers.slice(0, 6).map((h) => (
                        <td key={h} className="py-2 px-3 font-mono text-[11px] truncate max-w-[160px]">
                          {String(row[h] ?? '-')}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Import Status Alert */}
          {importStatus && (
            <div className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
              importStatus.success
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-rose-50 text-rose-800 border-rose-300'
            }`}>
              {importStatus.success ? <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" /> : <XCircle className="w-4 h-4 shrink-0 text-rose-600" />}
              <span>{importStatus.message}</span>
            </div>
          )}

          {/* Execute Import Action Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => {
                setParsedData(null);
                setValidationResult(null);
                setImportStatus(null);
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Clear / Upload Another File
            </button>

            <button
              onClick={handleExecuteImport}
              disabled={isImporting || validationResult.acceptedRecords.length === 0}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              {isImporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Importing into Supabase...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Import {validationResult.acceptedRecords.length} Valid Records to Supabase</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
