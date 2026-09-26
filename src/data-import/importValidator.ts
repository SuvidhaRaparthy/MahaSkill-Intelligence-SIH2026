// MahaSkill Intelligence - Dataset Import Validation Engine
import type { DatasetType, ImportValidationResult } from '../data-sources/DataSourceAdapter';
import { DATA_SOURCE_REGISTRY } from '../data-sources/SourceRegistry';
import { SEED_DISTRICTS, SEED_SECTORS } from '../data/seedData';

const VALID_DISTRICT_NAMES = new Set(SEED_DISTRICTS.map(d => d.name.toLowerCase()));
const VALID_SECTOR_NAMES = new Set(SEED_SECTORS.map(s => s.name.toLowerCase()));

/**
 * Validates parsed raw records row-by-row against dataset schema and database taxonomy rules.
 */
export function validateImportDataset(
  records: Record<string, any>[],
  datasetType: DatasetType,
  sourceId: string
): ImportValidationResult {
  const metadata = DATA_SOURCE_REGISTRY[sourceId] || DATA_SOURCE_REGISTRY.ncs;
  const requiredFields = metadata.required_fields[datasetType] || [];

  const acceptedRecords: any[] = [];
  const rejectedRecords: { rowIndex: number; rawData: any; errors: string[] }[] = [];
  const seenKeys = new Set<string>();

  let missingRequiredFieldsCount = 0;
  let invalidTypeCount = 0;
  let duplicateCount = 0;
  let unmappedTaxonomyCount = 0;

  records.forEach((row, idx) => {
    const rowIndex = idx + 1;
    const errors: string[] = [];

    // 1. Missing Required Fields Check
    for (const field of requiredFields) {
      const val = row[field];
      if (val === undefined || val === null || String(val).trim() === '') {
        errors.push(`Missing required column: "${field}"`);
        missingRequiredFieldsCount++;
      }
    }

    // 2. Duplicate Detection
    let uniqueKey = '';
    if (datasetType === 'JOB_POSTINGS') {
      uniqueKey = `${row.title}_${row.company}_${row.district}`.toLowerCase();
    } else if (datasetType === 'SKILL_TAXONOMY') {
      uniqueKey = `${row.canonical_name || row.skill_name}`.toLowerCase();
    } else if (datasetType === 'COURSES_TRAINING') {
      uniqueKey = `${row.course_name}_${row.institute_name}`.toLowerCase();
    }

    if (uniqueKey && seenKeys.has(uniqueKey)) {
      errors.push(`Duplicate record detected matching "${uniqueKey}"`);
      duplicateCount++;
    } else if (uniqueKey) {
      seenKeys.add(uniqueKey);
    }

    // 3. District Taxonomy Validation
    if (row.district && String(row.district).trim()) {
      const distLower = String(row.district).trim().toLowerCase();
      if (!VALID_DISTRICT_NAMES.has(distLower)) {
        errors.push(`Unrecognized district "${row.district}". Supported: Pune, Nashik, Nagpur.`);
        unmappedTaxonomyCount++;
      }
    }

    // 4. Sector Taxonomy Validation
    if (row.sector && String(row.sector).trim()) {
      const secLower = String(row.sector).trim().toLowerCase();
      const match = Array.from(VALID_SECTOR_NAMES).some(s => s.includes(secLower) || secLower.includes(s));
      if (!match) {
        errors.push(`Unrecognized sector "${row.sector}". Supported: Information Technology, Automotive and EV.`);
        unmappedTaxonomyCount++;
      }
    }

    // 5. Posted Date Validation
    if (row.posted_date) {
      const dateStr = String(row.posted_date);
      const parsedDate = Date.parse(dateStr);
      if (isNaN(parsedDate)) {
        errors.push(`Invalid date format "${row.posted_date}". Expected YYYY-MM-DD.`);
        invalidTypeCount++;
      }
    }

    if (errors.length === 0) {
      acceptedRecords.push({
        ...row,
        _validated_at: new Date().toISOString()
      });
    } else {
      rejectedRecords.push({
        rowIndex,
        rawData: row,
        errors
      });
    }
  });

  return {
    isValid: rejectedRecords.length === 0,
    totalRecords: records.length,
    acceptedRecords,
    rejectedRecords,
    summary: {
      missingRequiredFieldsCount,
      invalidTypeCount,
      duplicateCount,
      unmappedTaxonomyCount
    }
  };
}
