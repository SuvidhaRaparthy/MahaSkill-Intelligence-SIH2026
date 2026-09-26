# PHASE 3 — SKILL & OCCUPATION INTELLIGENCE DOCUMENTATION

## 1. Existing Normalization Architecture

The Skill & Occupation Intelligence normalization pipeline converts raw, unstandardized job postings, raw skill terms, and raw occupation strings into canonical, auditable database records. It operates deterministically to maintain mathematical accuracy and strict reproducibility across the MahaSkill Intelligence platform.

The architectural flow is structured as follows:

```
RAW JOB POSTING / CSV / JSON
       │
       ▼
LANGUAGE UNDERSTANDING (Gemini API / Natural Language Context)
       │
       ▼
SKILL EXTRACTION (Deterministic phrase matching + multi-skill parsing)
       │
       ▼
SKILL RESOLUTION PIPELINE (5-Tier Priority Cascade)
  ├── 1. Exact Canonical Skill Match (EXACT)
  ├── 2. Approved Alias Dictionary Lookup (ALIAS)
  ├── 3. Deterministic Normalization Rules (RULE)
  ├── 4. Gemini Language Understanding (AI_ASSISTED)
  └── 5. Fallback Unresolved Record (UNRESOLVED / EMERGING)
       │
       ▼
OCCUPATION RESOLUTION (NCO-2015 Classification Engine)
       │
       ▼
DATABASE LINKAGE (job_postings ──> job_skills ──> skills & occupations)
       │
       ▼
DETERMINISTIC ANALYTICS (Demand Calculation, Supply Comparison, Net Gap)
```

---

## 2. Canonical Skill Resolution Process

The canonical skill resolution process takes any raw text string and processes it through a strict 5-tier priority hierarchy (`skillNormalizer.ts`):

1. **Tier 1: EXACT Match**: Direct case-insensitive string match against canonical skills in the database (`skills` table).
2. **Tier 2: ALIAS Match**: Match against approved alias mappings in `SKILL_ALIASES` dictionary (e.g., `ReactJS` → `React.js`, `EV Battery Health Check` → `EV Battery Diagnostics`).
3. **Tier 3: RULE Match**: Standardized text cleaning, punctuation stripping, suffix removal (`- Developer`, `- Technician`, `- Specialist`), and regex matching.
4. **Tier 4: AI_ASSISTED Match**: Used only when semantic context is required to clarify ambiguities. Retains strict reference to canonical skill IDs.
5. **Tier 5: UNRESOLVED**: Retains raw term, marks status as `emerging`, and assigns mapping status `UNRESOLVED`.

---

## 3. Alias Handling

Aliases allow multiple common, variant, or mis-spelled job posting skill terms to resolve to a single canonical skill without creating duplicate skills in the taxonomy.

### Key Mappings Implemented:
* `ReactJS`, `React JS`, `React.js`, `React Frontend` → **React.js**
* `BMS Repair`, `BMS Diagnostics`, `Battery Management System` → **Battery Management Systems (BMS)**
* `EV Battery Health Check`, `EV Health Inspection`, `Battery Health Check` → **EV Battery Diagnostics**
* `PyTorch ML`, `PyTorch Framework` → **PyTorch**
* `Docker Containers`, `Dockerization` → **Docker**

All alias resolutions emit an auditable `ResolutionRecord` containing:
* `rawTerm`: The original input string.
* `canonicalSkill`: The matched canonical skill name.
* `canonicalSkillId`: The canonical UUID.
* `mappingMethod`: `EXACT`, `ALIAS`, `RULE`, `AI_ASSISTED`, or `UNRESOLVED`.
* `confidence`: Decimal score (1.0 for EXACT/ALIAS, 0.85 for RULE, 0.70 for AI_ASSISTED, 0.0 for UNRESOLVED).
* `provenance`: `SYNTHETIC_DEMO_DATA` or `INGESTED_JOB_DATA`.

---

## 4. Gemini's Exact Role

Gemini is strictly constrained to **Language Understanding** tasks.

### Permitted Gemini Responsibilities:
* Extracting skill mentions from raw, unstructured job description text.
* Distinguishing semantically ambiguous terms based on job context (e.g., distinguishing "Java" language from "JavaScript").
* Recommending candidate taxonomy concepts for human review.

### Prohibited Gemini Roles (Enforced in Code):
* Gemini does **NOT** calculate Demand Scores, Supply Scores, Gap Scores, or District Priorities.
* Gemini does **NOT** generate policy simulation numbers or capacity deficits.
* Gemini does **NOT** invent new official canonical skills or NCO codes. Unknown terms are routed to `UNRESOLVED / EMERGING`.

---

## 5. Occupation / NCO Resolution

Jobs are mapped to official National Classification of Occupations (NCO-2015) codes using deterministic matching (`occupationNormalizer.ts`):

* **EV Battery Specialist**: NCO Code `2152.0100` (Electronics & Battery Engineering)
* **Automotive Electronics Technician**: NCO Code `3113.0200` (Electrical/Electronics Diagnostics)
* **Frontend Developer**: NCO Code `2512.0100` (Software & Web Engineering)
* **Cloud Infrastructure Engineer**: NCO Code `2522.0100` (Systems & Cloud Engineering)
* **AI/ML Specialist**: NCO Code `2511.0200` (Systems Analysis & AI Solutions)

Where no exact NCO code matches, raw occupation titles are preserved with mapping status `UNMAPPED` and classification `PROTOTYPE_UNCLASSIFIED`. Official NCO codes are never fabricated.

---

## 6. Unresolved / Emerging Skill Handling

Unresolved skill terms are never discarded or deleted. They are preserved in the system with status `emerging` and mapping status `UNRESOLVED`.

### Workflow for Emerging Skills:
1. Unknown term detected during job ingestion (e.g., "Quantum Algorithm Optimization").
2. Normalizer assigns `mappingStatus = "UNRESOLVED"` and `taxonomyStatus = "emerging"`.
3. Record is saved to database linked to the source job.
4. Rendered in the Skill Intelligence dashboard under "Emerging Skills" for curriculum advisory review.

---

## 7. Job → Skill Database Linkage

The platform maintains strict relational integrity:

```
job_postings (id)
    └── job_skills (job_id, skill_id, raw_skill_term, mapping_status, confidence, provenance)
          └── skills (id, name, sector_id, taxonomy_status)
```

* Multi-skill jobs (e.g., "Senior React & TypeScript Developer") generate multiple discrete rows in `job_skills` (one for `React.js` and one for `TypeScript`).
* Foreign key constraints are enforced across all tables in Supabase.
* No orphan `job_skills` records exist in the remote database.

---

## 8. Import Pipeline

The job import pipeline (`jobImporter.ts` & `job_postings` ingestion) validates each record before insertion:

1. **Validation**: Check for mandatory fields (`title`, `company`, `location`, `district_id`).
2. **Skill Extraction**: Extract raw skill strings from job title and description.
3. **Skill Normalization**: Run 5-tier normalization cascade for each extracted skill.
4. **Occupation Resolution**: Resolve NCO-2015 code and occupation context.
5. **Job Insertion**: Insert job into `job_postings`.
6. **Linkage Insertion**: Insert resolved relationships into `job_skills`.
7. **Audit Logging**: Write audit log entry with full provenance metadata.

---

## 9. Provenance & Audit Behavior

Every skill resolution produces a transparent audit trail. In the UI and API:
* **Raw Term**: `ReactJS`
* **Canonical Skill**: `React.js`
* **Resolution Method**: `ALIAS`
* **Confidence**: `1.0`
* **Provenance**: `SYNTHETIC_DEMO_DATA`

Deterministic mapping methods (EXACT, ALIAS, RULE) are strictly labeled as such and are never mislabeled as "AI-generated".

---

## 10. Test Cases & Results

All 10 Phase 3 test cases were executed against the remote Supabase database and normalization pipeline via `scripts/test-phase3-pipeline.cjs`:

| Test | Input Scenario | Expected Result | Status |
|---|---|---|---|
| **TEST 1** | "ReactJS Developer" | Canonical `React.js` (ALIAS) | **PASS** |
| **TEST 2** | "React JS Developer" | Canonical `React.js` (ALIAS) | **PASS** |
| **TEST 3** | "React.js Developer" | Canonical `React.js` (EXACT) | **PASS** |
| **TEST 4** | "BMS Repair Technician" | Canonical `Battery Management Systems (BMS)` (ALIAS) | **PASS** |
| **TEST 5** | "EV Battery Health Check" | Canonical `EV Battery Diagnostics` (ALIAS) | **PASS** |
| **TEST 6** | "Quantum Algorithm Optimization" | `UNRESOLVED` / status: `emerging` | **PASS** |
| **TEST 7** | "Senior React & TypeScript Developer" | Multi-skill: `[React.js, TypeScript]` | **PASS** |
| **TEST 8** | EV Diagnostic Role | Mapped NCO `2152.0100` (EV Battery Specialist) | **PASS** |
| **TEST 9** | Cloud Role | Mapped NCO `2522.0100` (Cloud Infrastructure Engineer) | **PASS** |
| **TEST 10** | Database Linkages | Remote Supabase verified (10 jobs, 10 linkages) | **PASS** |

**Total Test Results: 10 / 10 PASSED (100%)**

---

## 11. Build Result

Production build command (`npm run build`) was executed with zero errors:

```
> mahaskill-intelligence@0.0.0 build
> tsc -b && vite build

vite v8.2.2 building client environment for production...
✓ 2506 modules transformed.
dist/index.html                     0.47 kB
dist/assets/index-BHBLu_c5.css     58.34 kB
dist/assets/index-DGGPnOkb.js   1,188.21 kB

✓ built cleanly in 497ms
```

---

## 12. Regression Results

All pre-existing and Phase 3 verification suites were run and passed 100%:

1. `scripts/audit-evidence-provenance.cjs`: **12 / 12 Audits Passed**
2. `scripts/test-phase8-pipeline.cjs`: **11 / 11 Scenarios Passed**
3. `scripts/test-phase9-user-journey.cjs`: **12 / 12 Sections Passed**
4. `scripts/test-phase3-pipeline.cjs`: **10 / 10 Test Cases Passed**

---

## 13. Remaining Limitations

1. **Remote Supabase Network Constraints**: In environments without live network access, the system falls back gracefully to local pre-seeded analytical data while retaining exact database structure parity.
2. **Gemini API Rate Limits**: When using Gemini API for complex natural language job descriptions, rate limits are managed via deterministic fallback to phrase matching without loss of canonical mapping accuracy.
3. **NCO-2015 Coverage**: NCO-2015 taxonomy focuses primarily on established occupations; newly emerging roles (such as Generative AI Prompt Engineer) are correctly tagged as `PROTOTYPE_UNCLASSIFIED` pending official government taxonomy updates.
