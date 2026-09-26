# MahaSkill Intelligence — Implementation Baseline & Audit Report

**Project**: MahaSkill Intelligence (SIH 2026 - Problem Statement SIH26134)  
**Date**: September 25, 2026  
**Status**: Baseline Codebase Audit Completed  

---

## 1. Current Frontend Routes & Pages

| Route Path | Component File | Current Implementation Status | Description |
|---|---|---|---|
| `/` | `src/pages/Overview.tsx` | **IMPLEMENTED** | State Labour-Market Intelligence Dashboard with KPI cards, SIH quick flow banner, district heatmaps, demand vs supply bar charts, and priority recommendations table. |
| `/labour-signals` | `src/pages/Pages.tsx` (`LabourSignals`) | **UI_ONLY / STUB** | Module stub displaying basic count text for job posting ingestion pipeline. |
| `/skill-intelligence` | `src/pages/SkillIntelligence.tsx` | **IMPLEMENTED** | Skill taxonomy registry, alias normalization inspector, NCO occupation mapping, and emerging queue. |
| `/emerging-skills` | `src/pages/EmergingSkills.tsx` | **IMPLEMENTED** | Emerging skills radar cards, growth metrics, signals table, and skill drilldown modal. |
| `/district-intelligence` | `src/pages/Pages.tsx` (`DistrictIntelligence`) | **UI_ONLY / STUB** | Module stub displaying district selection note. |
| `/skill-explorer` | `src/pages/Pages.tsx` (`SkillExplorer`) | **UI_ONLY / STUB** | Module stub displaying canonical skill count summary. |
| `/curriculum-intelligence` | `src/pages/CurriculumIntelligence.tsx` | **IMPLEMENTED** | Course recommendation cards (ADD/RETAIN/REVIEW), curriculum coverage matrix, and evidence modal. |
| `/employer-validation` | `src/pages/EmployerValidation.tsx` | **IMPLEMENTED** | Employer survey signal submission, consensus percentage calculations, and validated employer list. |
| `/trainer-equipment` | `src/pages/TrainerEquipment.tsx` | **IMPLEMENTED** | Capacity audit cards, readiness matrix, trainer instructor gap table, and lab bench deficit table. |
| `/policy-simulator` | `src/pages/PolicySimulator.tsx` | **IMPLEMENTED** | Interactive Policy What-If Simulator with sliders, baseline vs simulation comparison, trade-off alerts, and simulation persistence. |
| `/training-plans` | `src/pages/TrainingPlans.tsx` (Component) / `src/pages/Pages.tsx` (Stub) | **PARTIAL / ROUTE MISMATCH** | Full 448-line Phase 7 District Training Plan Generator component exists in `src/pages/TrainingPlans.tsx`, but `App.tsx` imports stub from `Pages.tsx`. |
| `/action-center` | `src/pages/Pages.tsx` (`ActionCenter`) | **UI_ONLY** | Displays static seed recommendation cards for state/district planners. |
| `/data-sources` | `src/pages/DataSources.tsx` | **IMPLEMENTED** | Data source registry cards (NCS, MahaSwayam, Skill India Digital, NCVET NQR, MoSPI PLFS) with governance badges and data import wizard. |
| `/data-quality` | `src/pages/Pages.tsx` (`DataQuality`) | **UI_ONLY** | Module stub summarizing synthetic/valid record audit counts. |
| `/methodology` | `src/pages/Pages.tsx` (`Methodology`) | **UI_ONLY** | Module stub displaying transparent mathematical formulas for Demand Score and Gap Score. |

---

## 2. Current Supabase Database Tables

The database schema is defined in `supabase/migrations/20260909000000_initial_schema.sql` and contains **25 tables** and **3 PostgreSQL aggregated views**:

1. `districts`: District master registry (Pune, Nashik, Nagpur, etc.) with coordinates.
2. `sectors`: Industry sectors (Information Technology, Automotive & EV, Healthcare, etc.).
3. `occupations`: NCO-2015 mapped occupations with sector FKs.
4. `skills`: Canonical skill taxonomy with category, taxonomy status (`official`, `normalized`, `emerging`, `unmapped`), and qualification codes.
5. `skill_aliases`: Canonical to raw alias lookup dictionary.
6. `job_postings`: Ingested job postings with source, district, sector, occupation, and synthetic flags.
7. `job_skills`: Extracted raw skills per job posting with extraction confidence scores.
8. `qualifications`: NCVET/NQR national qualifications with NSQF levels.
9. `courses`: Training courses, institute names, annual seat capacities, and completion metrics.
10. `course_skills`: Skill coverage mapping per course with hours and mandatory flags.
11. `employers`: Employer master registry with organization types.
12. `employer_signals`: Industry survey signals on required skills and expected hiring numbers.
13. `employer_validations`: Employer validation confirmations/rejections of curriculum recommendations.
14. `trainers`: Instructor capacity counts and certification counts per district/skill.
15. `equipment`: Practical lab equipment inventory counts per district/sector.
16. `skill_demand_metrics`: Calculated periodic demand metrics (posting count, employer demand, growth rate, demand score).
17. `skill_supply_metrics`: Calculated periodic supply metrics (seat capacity, completions, supply score).
18. `recommendations`: Decision support recommendations (ADD_SKILL, RETAIN, REVIEW, etc.) with priority levels.
19. `recommendation_evidence`: Traceable evidence links supporting recommendations.
20. `simulations`: Saved Policy Simulator scenarios tagged with `is_simulation = true` and before/after metrics JSON.
21. `data_sources`: Governance registry of external official portals and access methods.
22. `data_imports`: Audit log of CSV/JSON file ingestion executions and record accepted/rejected counts.
23. `time_series_metrics`: Historical monthly trend metrics.
24. `institute_responses`: Training institute feasibility feedback on recommended curriculum changes.
25. `audit_logs`: Governance audit logs for security and tracking.

**Aggregated Views**:
- `vw_district_skill_gap`: Aggregates demand score, supply score, and net gap per district/sector/skill.
- `vw_emerging_skills`: Summarizes emerging skills with posting counts, employer counts, and growth rates.
- `vw_government_priority_actions`: Ranks high-priority government recommendations.

---

## 3. Current Migrations

- **`supabase/migrations/20260909000000_initial_schema.sql`**: Initial complete schema migration enabling UUID generation (`uuid-ossp`), creating all 25 tables, primary/foreign keys, performance indexes, views, and RLS policies.

---

## 4. Current Seed Scripts

- **`supabase/seed.sql`**: PostgreSQL seed file populating initial data for Pune, Nashik, Nagpur, Automotive/IT sectors, canonical skills, job postings, courses, and qualifications.
- **`scripts/seed-db.js`**: Node.js script using the Supabase JavaScript client (`@supabase/supabase-js`) to programmatically seed all tables.
- **`scripts/verify-seed.js` & `scripts/verify-db.js`**: Database sanity and table count validation utility scripts.

---

## 5. Current Synthetic Datasets

- **In-Memory Fallback Seed Layer (`src/data/seedData.ts`)**: Contains synthetic data arrays (`SEED_DISTRICTS`, `SEED_SECTORS`, `SEED_SKILLS`, `SEED_OCCUPATIONS`, `SEED_COURSES`, `SEED_EMPLOYERS`, `SEED_RECOMMENDATIONS`) used as an offline fallback when Supabase is not connected.
- **`public/samples/sample_job_postings.csv`**: Sample CSV dataset containing 10 NCS job vacancy postings for testing the Data Import Wizard.
- **`public/samples/sample_skill_taxonomy.csv`**: Sample CSV dataset containing skill taxonomy aliases for import validation.

---

## 6. Current Data-Import Pipeline

- **`src/data-import/fileParser.ts`**: Parses CSV, TSV, and JSON files using PapaParse/custom regex splitting into standard tabular records.
- **`src/data-import/importValidator.ts`**: Schema validator (`validateImportDataset`) validating required fields for `JOB_POSTINGS`, `SKILL_TAXONOMY`, `COURSES_TRAINING`, and `EMPLOYER_SIGNALS`.
- **`src/data-import/importService.ts`**: Executes validated imports into Supabase tables and records audit details in `data_imports`.
- **`src/data-sources/SourceRegistry.ts`**: Maintains registry metadata for National Career Service, MahaSwayam, Skill India Digital, NCVET NQR, and MoSPI PLFS.
- **`src/components/ingestion/DataImportWizard.tsx`**: Interactive UI for drag-and-drop file upload, schema validation, and database ingestion.
- **`src/components/ingestion/ImportHistoryTable.tsx`**: UI table displaying complete `data_imports` audit trail history.

---

## 7. Current Skill Normalization Logic

- **`src/data-import/skillNormalizer.ts`**:
  - `CANONICAL_MAPPINGS`: Direct dictionary mapping raw text (e.g. `react js`, `bms`, `can bus`, `genai`) to canonical skills.
  - Classifies taxonomy status as `official`, `normalized`, `emerging`, or `unmapped`.
  - Fallback substring matching and Title-Case formatting for novel terms.
- **`src/data-import/skillExtractor.ts`**: Extracts raw skill tokens from unstructured job posting descriptions (`extractSkillsFromText`).
- **`src/data-import/occupationNormalizer.ts`**: Maps job titles to NCO-2015 occupation codes (`normalizeOccupationText`).

---

## 8. Current Authentication Logic

- **`src/context/AuthContext.tsx`**: Provides role-based authentication context supporting 4 roles:
  1. `GOVERNMENT_OFFICIAL` (Default: Rajesh Patil IAS - State Planner)
  2. `TRAINING_INSTITUTE` (Dr. Suresh Deshmukh - ITI Aundh Principal)
  3. `EMPLOYER` (Vikram Joshi - Head of HR, Tata Motors EV)
  4. `PUBLIC_ANALYST` (Public Data Research Analyst)
- Automatically synchronizes with Supabase Auth (`supabase.auth.getSession()`, `onAuthStateChange()`) when credentials are present, and provides instant demo role switching.

---

## 9. Current RLS Policies

- Row Level Security (RLS) is enabled on core tables in `20260909000000_initial_schema.sql`:
  - `districts` (`Allow public read access on districts`)
  - `sectors` (`Allow public read access on sectors`)
  - `occupations` (`Allow public read access on occupations`)
  - `skills` (`Allow public read access on skills`)
  - `job_postings` (`Allow public read access on job_postings`)
  - `courses` (`Allow public read access on courses`)
  - `recommendations` (`Allow public read access on recommendations`)

---

## 10. Current Analytical Calculations

All analytics calculations follow deterministic formulas established across Phase 4–Phase 8:

1. **Demand Score Formula** (`demandSupplyGapEngine.ts`):
   $$\text{Demand Score} = 0.50 \times \text{Job Posting Demand} + 0.30 \times \text{Employer Signals} + 0.20 \times \text{Growth Rate}$$
2. **Supply Score Formula** (`demandSupplyGapEngine.ts`):
   $$\text{Supply Score} = \text{Normalized Seat Capacity (60\%)} + \text{Completions (40\%) relative to 400 seats}$$
3. **Net Skill Gap Formula** (`demandSupplyGapEngine.ts`):
   $$\text{Gap Score} = \text{Demand Score} - \text{Supply Score}$$
4. **Gap Classifications**:
   - `HIGH_SHORTAGE` ($\text{Gap} \ge 25$)
   - `MODERATE_SHORTAGE` ($10 \le \text{Gap} < 25$)
   - `BALANCED` ($-9 \le \text{Gap} \le 9$)
   - `MODERATE_OVERSUPPLY` ($-25 \le \text{Gap} < -10$)
   - `HIGH_OVERSUPPLY` ($\text{Gap} < -25$)
5. **Curriculum Recommendation Rules** (`emergingAndCurriculumEngine.ts`):
   - `ADD`: $\text{Gap} \ge 15$ AND $\text{Coverage} \le 40\%$
   - `RETAIN`: Balanced AND $\text{Coverage} \ge 75\%$
   - `REVIEW`: Oversupply $\le -15$ OR low coverage
6. **Capacity Gap Rules** (`capacityAndValidationEngine.ts`):
   - Trainer Ratio: 1 Trainer per 35 seats
   - Equipment Ratio: 1 Diagnostic kit per 25 seats
7. **District Priority Score** (`districtTrainingPlanEngine.ts`):
   $$\text{Priority Score} = 0.40 \times \text{Net Gap} + 0.30 \times \text{Employer Consensus} + 0.20 \times \text{Capacity Deficit} + 0.10 \times \text{Growth}$$
8. **Policy What-If Simulator** (`policySimulatorEngine.ts`):
   - Recalculates simulated scores deterministically upon seat, trainer, equipment, or curriculum slider changes without altering baseline metrics.

---

## 11. Current Hard-Coded / Demo Values

- **Primary SIH Demo Story**: Pune → Automotive/EV → EV Battery Diagnostics (+154% growth, +44 net gap, +280 additional seats needed, -8 trainer deficit, -13 lab bench deficit).
- **Secondary Oversupply Scenario**: Legacy PHP (Demand: 22, Supply: 70, Gap: -48).
- **Hard-coded Chart Arrays**: `DEMAND_TREND_DATA`, `EMERGING_SKILLS_DATA`, `GAP_COMPARISON_DATA`, `SECTOR_DATA` in `Overview.tsx` used for top-level state visualizations.

---

## 12. Current Stub Pages

- `/labour-signals` (Stub wrapper in `Pages.tsx`)
- `/district-intelligence` (Stub wrapper in `Pages.tsx`)
- `/skill-explorer` (Stub wrapper in `Pages.tsx`)
- `/training-plans` (Stub exported in `Pages.tsx` bypassing `src/pages/TrainingPlans.tsx`)
- `/action-center` (Stub wrapper in `Pages.tsx`)
- `/data-quality` (Stub wrapper in `Pages.tsx`)
- `/methodology` (Stub wrapper in `Pages.tsx`)

---

## 13. Current Build Errors

- **0 Build Errors**: `npm run build` (`tsc -b && vite build`) executed successfully with **0 compilation errors**.
```text
vite v8.2.2 building client environment for production...
transforming...
✓ 2504 modules transformed.
dist/index.html                     0.47 kB │ gzip:   0.30 kB
dist/assets/index-BeKDclke.css     58.31 kB │ gzip:  14.58 kB
dist/assets/index-nvM2oPtC.js   1,150.87 kB │ gzip: 309.30 kB
✓ built in 964ms
```

---

## 14. Current Unused / Dead Code Relevant to SIH Features

- **`src/pages/TrainingPlans.tsx` Route Bypass**: A complete 448-line Phase 7 District Training Plan Generator component exists with PDF export, comparison modal, and filters, but `src/App.tsx` imports the stub `TrainingPlans` component from `src/pages/Pages.tsx`.
- **Duplicate Script**: `scripts/test-phase7-pipeline.js` and `scripts/test-phase7-pipeline.cjs` coexist.

---

## 15. Major SIH Feature Classification Matrix

| Feature Area | Classification | Notes |
|---|---|---|
| State & District Overview Dashboard | **IMPLEMENTED** | `Overview.tsx` fully functional with filters & charts |
| Interactive Data Ingestion Pipeline | **IMPLEMENTED** | `DataImportWizard.tsx`, `importService.ts`, `importValidator.ts` |
| Skill Taxonomy & Normalization Engine | **IMPLEMENTED** | `skillNormalizer.ts`, `SkillIntelligence.tsx` |
| Emerging Skill Radar & Detection | **IMPLEMENTED** | `emergingAndCurriculumEngine.ts`, `EmergingSkills.tsx` |
| Deterministic Demand-Supply Gap Engine | **IMPLEMENTED** | `demandSupplyGapEngine.ts`, `DemandSupplyGap.tsx` |
| Curriculum Alignment & Recommendations | **IMPLEMENTED** | `emergingAndCurriculumEngine.ts`, `CurriculumIntelligence.tsx` |
| Employer Validation Signal Capture | **IMPLEMENTED** | `capacityAndValidationEngine.ts`, `EmployerValidation.tsx` |
| Trainer & Lab Equipment Capacity Audit | **IMPLEMENTED** | `capacityAndValidationEngine.ts`, `TrainerEquipment.tsx` |
| Policy What-If Simulator | **IMPLEMENTED** | `policySimulatorEngine.ts`, `PolicySimulator.tsx` |
| PDF Export Engine for Training Plans | **IMPLEMENTED** | `pdfExportEngine.ts` |
| Data Sources & Governance Registry | **IMPLEMENTED** | `SourceRegistry.ts`, `DataSources.tsx` |
| Multi-Role Role Switching Context | **IMPLEMENTED** | `AuthContext.tsx` |
| Supabase PostgreSQL Schema & RLS | **IMPLEMENTED** | `20260909000000_initial_schema.sql`, `seed.sql` |
| District Training Plan Generator Route | **PARTIAL** | Fully implemented in `TrainingPlans.tsx` but bypassed by stub import in `App.tsx` |
| Labour Signals Deep-Dive Page | **UI_ONLY** | Stub in `Pages.tsx` |
| District Intelligence Center Page | **UI_ONLY** | Stub in `Pages.tsx` |
| Skill Explorer & Taxonomy Deep-Dive Page | **UI_ONLY** | Stub in `Pages.tsx` |
| Government Action Center Page | **UI_ONLY** | Stub in `Pages.tsx` |
| Data Quality & Provenance Audit Page | **UI_ONLY** | Stub in `Pages.tsx` |
| Methodology Formula Transparency Page | **UI_ONLY** | Stub in `Pages.tsx` |
