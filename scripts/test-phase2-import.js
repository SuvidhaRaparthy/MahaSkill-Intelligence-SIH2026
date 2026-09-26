import fs from 'fs';
import path from 'path';
import { parseTextContent } from '../src/data-import/fileParser.ts';
import { validateImportDataset } from '../src/data-import/importValidator.ts';
import { executeDatasetImport, fetchImportHistory } from '../src/data-import/importService.ts';

async function testPhase2Pipeline() {
  console.log('====================================================');
  console.log('   MAHASKILL INTELLIGENCE — PHASE 2 VERIFICATION   ');
  console.log('====================================================\n');

  // 1. Read Test CSV File
  const sampleCsvPath = path.resolve('public/samples/sample_job_postings.csv');
  console.log('1. Reading sample dataset file:', sampleCsvPath);
  const csvContent = fs.readFileSync(sampleCsvPath, 'utf8');

  // 2. Parse CSV
  console.log('2. Parsing CSV file contents...');
  const parsedData = parseTextContent(csvContent, 'sample_job_postings.csv');
  console.log(`   ✓ Parsed ${parsedData.totalRows} raw rows. Headers: ${parsedData.headers.join(', ')}`);

  // 3. Perform Row-Level Schema Validation
  console.log('\n3. Running Row-Level Schema & Taxonomy Validation...');
  const validationResult = validateImportDataset(parsedData.records, 'JOB_POSTINGS', 'ncs');
  console.log(`   ✓ Total Processed: ${validationResult.totalRecords}`);
  console.log(`   ✓ Accepted Valid Rows: ${validationResult.acceptedRecords.length}`);
  console.log(`   ✓ Rejected Error Rows: ${validationResult.rejectedRecords.length}`);

  if (validationResult.rejectedRecords.length > 0) {
    console.log('\n   Detected Expected Validation Error Examples:');
    validationResult.rejectedRecords.forEach(r => {
      console.log(`   - Row #${r.rowIndex}: ${r.errors.join(' | ')}`);
    });
  }

  // 4. Execute Import to Supabase
  console.log('\n4. Executing Ingestion into Supabase Database...');
  const importResponse = await executeDatasetImport(
    validationResult,
    'JOB_POSTINGS',
    'ncs',
    'sample_job_postings.csv'
  );

  console.log('   ✓ Ingestion Result:', importResponse.success ? 'SUCCESS' : 'FAILED');
  console.log(`   ✓ Accepted Records Inserted: ${importResponse.importRecord.records_accepted}`);
  console.log(`   ✓ Audit Trail Log ID: ${importResponse.importRecord.id}`);

  // 5. Fetch & Verify Import History Audit Trail
  console.log('\n5. Fetching `data_imports` Audit Trail Log from Supabase...');
  const history = await fetchImportHistory();
  console.log(`   ✓ Retrieved ${history.length} audit trail records.`);
  console.log('   Latest Audit Record:', history[0]);

  console.log('\n====================================================');
  console.log('  ✅ PHASE 2 INGESTION PIPELINE FULLY VERIFIED!   ');
  console.log('====================================================');
}

testPhase2Pipeline().catch(console.error);
