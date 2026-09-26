// MahaSkill Intelligence - File Parsing Engine
import Papa from 'papaparse';

export interface ParsedFileData {
  filename: string;
  fileType: 'CSV' | 'JSON' | 'TABULAR';
  headers: string[];
  records: Record<string, any>[];
  totalRows: number;
}

/**
 * Parses uploaded File object or string content into structured JSON records.
 */
export async function parseUploadedFile(file: File): Promise<ParsedFileData> {
  const filename = file.name;
  const isJson = filename.toLowerCase().endsWith('.json');

  if (isJson) {
    const text = await file.text();
    const data = JSON.parse(text);
    const records = Array.isArray(data) ? data : (data.records || [data]);
    const headers = records.length > 0 ? Object.keys(records[0]) : [];
    
    return {
      filename,
      fileType: 'JSON',
      headers,
      records,
      totalRows: records.length
    };
  }

  // Parse CSV / Tabular via PapaParse
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: true,
      complete: (results) => {
        const records = (results.data as Record<string, any>[]).filter(r => r && Object.keys(r).length > 0);
        const headers = results.meta.fields || (records.length > 0 ? Object.keys(records[0]) : []);
        
        resolve({
          filename,
          fileType: 'CSV',
          headers,
          records,
          totalRows: records.length
        });
      },
      error: (error) => {
        reject(new Error(`CSV Parsing Error: ${error.message}`));
      }
    });
  });
}

/**
 * Parses raw text string (e.g. sample dataset) into structured records.
 */
export function parseTextContent(content: string, filename: string = 'sample_dataset.csv'): ParsedFileData {
  if (content.trim().startsWith('[') || content.trim().startsWith('{')) {
    const data = JSON.parse(content);
    const records = Array.isArray(data) ? data : [data];
    const headers = records.length > 0 ? Object.keys(records[0]) : [];
    return { filename, fileType: 'JSON', headers, records, totalRows: records.length };
  }

  const results = Papa.parse(content, {
    header: true,
    skipEmptyLines: 'greedy',
    dynamicTyping: true
  });

  const records = (results.data as Record<string, any>[]).filter(r => r && Object.keys(r).length > 0);
  const headers = results.meta.fields || (records.length > 0 ? Object.keys(records[0]) : []);

  return {
    filename,
    fileType: 'CSV',
    headers,
    records,
    totalRows: records.length
  };
}
