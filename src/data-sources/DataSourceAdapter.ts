// MahaSkill Intelligence - Data Source Adapter Interfaces
export type SourceCategory = 
  | 'NCS'
  | 'MAHASWAYAM'
  | 'NCO_DGE'
  | 'NCVET_NQR'
  | 'SKILL_INDIA'
  | 'MOSPI_PLFS'
  | 'DATA_GOV'
  | 'EMPLOYER_SURVEY'
  | 'SYNTHETIC_DEMO';

export type DatasetType = 
  | 'JOB_POSTINGS'
  | 'SKILL_TAXONOMY'
  | 'COURSES_TRAINING'
  | 'EMPLOYER_SIGNALS'
  | 'QUALIFICATIONS';

export interface DataSourceMetadata {
  id: string;
  category: SourceCategory;
  source_name: string;
  organization: string;
  source_type: string;
  access_method: 'API' | 'CSV_IMPORT' | 'EXCEL_IMPORT' | 'JSON_IMPORT' | 'REFERENCE_REGISTRY';
  supports_file_upload: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  notes: string;
  sample_file_url?: string;
  required_fields: Record<DatasetType, string[]>;
}

export interface ImportValidationResult<T = any> {
  isValid: boolean;
  totalRecords: number;
  acceptedRecords: T[];
  rejectedRecords: {
    rowIndex: number;
    rawData: any;
    errors: string[];
  }[];
  summary: {
    missingRequiredFieldsCount: number;
    invalidTypeCount: number;
    duplicateCount: number;
    unmappedTaxonomyCount: number;
  };
}
