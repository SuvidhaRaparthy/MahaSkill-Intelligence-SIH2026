# MahaSkill Intelligence — Phase 1 Foundation Stabilization Report

**Project**: MahaSkill Intelligence (SIH 2026 - Problem Statement SIH26134)  
**Date**: September 25, 2026  
**Status**: Phase 1 Foundation Stabilization Completed  

---

## 1. Problems Identified During Phase 1 Audit

1. **Route Import Mismatch (`TrainingPlans`)**:
   - `src/pages/TrainingPlans.tsx` contained a full 448-line Phase 7 District Training Plan Generator component with PDF export, comparison modal, and filters.
   - However, `src/pages/Pages.tsx` defined a 10-line stub `TrainingPlans` component, which `src/App.tsx` imported, bypassing the real implementation.

2. **Seed Script Mapping & Relationship Bounding BUGS (`seed-db.js`)**:
   - **`district_id` bug**: `distIdMap[jp.district_id]` expected string keys (`'d1'`), but `jp.district_id` was already UUID `'11111111-...'`. This evaluated to `undefined` and fell back to `distIdMap.d1`, assigning **ALL 300 job postings to Pune**.
   - **`sector_id` bug**: `jp.sector_id === 's1'` checked for string `'s1'` when `jp.sector_id` was UUID `'a1111111-...'`. This evaluated to `false`, assigning **ALL 300 job postings to Automotive/EV**.
   - **Missing `job_skills` linking**: `seed-db.js` inserted 300 `job_postings` into the database but **never created `job_skills` records** linking postings to canonical skills in the junction table. As a result, SQL views (such as `vw_emerging_skills`) returning joined `job_skills` records evaluated to 0 rows in Supabase.
   - **Missing Junction & Capacity Seeds**: `course_skills`, `trainers`, `equipment`, `employer_signals`, `employer_validations`, and `recommendation_evidence` tables were missing seed insert blocks in `seed-db.js` and `seed.sql`.

3. **Client Security & Secret Bundle Expose (`supabase.ts`)**:
   - `src/lib/supabase.ts` created `export const supabaseAdmin` initializing Supabase with `SUPABASE_SERVICE_ROLE_KEY`. Exporting this in Vite frontend client code could expose service-role admin privileges to browser bundles, bypassing Row-Level Security (RLS).
   - `.env` containing local secrets was not listed in `.gitignore`.

---

## 2. Fixes Implemented

### Step 1: Fixed Training Plan Route
- Updated `src/pages/Pages.tsx` to re-export `export { TrainingPlans } from './TrainingPlans';`.
- Verified `src/App.tsx` now loads the real `TrainingPlans.tsx` component (448 lines) complete with PDF export, side-by-side district comparison modal, and priority filters.

### Step 2–4: Database Relationships & Seed Process Fixes
- **Fixed `scripts/seed-db.js` Mapping**: Corrected `district_id` and `sector_id` assignments so job postings preserve their true district (`Pune`, `Nashik`, `Nagpur`) and sector (`Information Technology`, `Automotive & EV`) UUIDs.
- **Added `job_skills` Linking**: Modified `seed-db.js` to extract and insert matching `job_skills` records for every inserted job posting into the `job_skills` junction table.
- **Populated Missing Junction Tables**: Added explicit seed inserts in both `scripts/seed-db.js` and `supabase/seed.sql` for:
  - `course_skills` (linking ITI/Polytechnic courses to canonical skills with coverage levels)
  - `employer_signals` (linking OEMs/employers to target skills and hiring numbers)
  - `trainers` (recording instructor availability and certified counts per district/skill)
  - `equipment` (recording diagnostic lab equipment bench counts per district/sector)
  - `recommendation_evidence` (linking governance recommendations to traceable job posting & survey evidence)

### Step 5–6: Security & Environment Fixes
- **Client Security Refactoring**: Removed `supabaseAdmin` export from `src/lib/supabase.ts` and refactored `src/data-import/importService.ts` to use `supabase` public client, enforcing Supabase Row Level Security (RLS).
- **Git Ignore**: Added `.env` and `.env*.local` to `.gitignore`.

### Step 7: Analytical Engine Connection Audit
- Verified all 5 engines in `src/analytics/`:
  - `demandSupplyGapEngine.ts`: Calculates Demand Score, Supply Score, Net Gap, and Gap Classifications deterministically.
  - `emergingAndCurriculumEngine.ts`: Detects emerging skills, curriculum coverage %, and generates ADD/RETAIN/REVIEW recommendations.
  - `capacityAndValidationEngine.ts`: Computes trainer capacity ratios (1:35), equipment kit ratios (1:25), and employer agreement percentages.
  - `districtTrainingPlanEngine.ts`: Calculates composite district priority scores ($0.40 \text{ Gap} + 0.30 \text{ Consensus} + 0.20 \text{ Capacity} + 0.10 \text{ Growth}$).
  - `policySimulatorEngine.ts`: Recalculates simulated scores deterministically upon slider adjustments.
- Confirmed engines use Supabase DB queries with graceful fallback to `seedData.ts` structures if offline or empty.

---

## 3. Files Changed

1. **`src/pages/Pages.tsx`**: Re-exported real `TrainingPlans` component from `./TrainingPlans`.
2. **`src/data/seedData.ts`**: Updated `generateSyntheticJobPostings()` to attach `skill_id` for accurate job-skill relationship linking.
3. **`scripts/seed-db.js`**: Fixed posting district/sector UUID bugs, added `job_skills`, `course_skills`, `employer_signals`, `trainers`, `equipment`, and `recommendation_evidence` seed insertions.
4. **`supabase/seed.sql`**: Added SQL inserts for `course_skills`, `employer_signals`, `trainers`, `equipment`, and `recommendation_evidence`.
5. **`src/lib/supabase.ts`**: Removed client-side `supabaseAdmin` service role instantiation.
6. **`src/data-import/importService.ts`**: Updated database calls to use standard `supabase` client subject to RLS.
7. **`.gitignore`**: Added `.env` and `.env*.local`.

---

## 4. Build & Test Verification Results

### Production Build (`npm run build`)
```text
> mahaskill-intelligence@0.0.0 build
> tsc -b && vite build

vite v8.2.2 building client environment for production...
transforming...
✓ 2506 modules transformed.
rendering chunks...
dist/index.html                     0.47 kB │ gzip:   0.30 kB
dist/assets/index-BHBLu_c5.css     58.34 kB │ gzip:  14.59 kB
dist/assets/index-C9whsTk-.js   1,178.80 kB │ gzip: 314.82 kB

✓ built in 599ms
```
- **Build Status**: **0 TypeScript compilation errors, 0 Vite bundler errors.**

### Automated Test Suites
1. **User Journey Verification (`test-phase9-user-journey.cjs`)**: **12 / 12 SECTIONS PASSED**
2. **Evidence & Provenance Audit (`audit-evidence-provenance.cjs`)**: **12 / 12 AUDITS PASSED**
3. **Policy Simulator Test Suite (`test-phase8-pipeline.cjs`)**: **11 / 11 SCENARIOS PASSED**

---

## 5. Remaining Items for Phase 2

1. **Live Supabase Connectivity**: Remote Supabase URL (`https://erfltqteyqmshbituvdv.supabase.co`) returned network fetch error during local `seed-db.js` CLI execution. Ensure Supabase credentials or local PostgreSQL instance are connected for Phase 2 dataset expansion.
2. **Synthetic Dataset Enrichment (Phase 2 Objective)**: Expand synthetic job posting corpus to cover additional Maharashtra districts (e.g. Chhatrapati Sambhajinagar/Aurangabad, Thane) and emerging sectors (e.g. Healthcare Tech, Renewable Energy).
