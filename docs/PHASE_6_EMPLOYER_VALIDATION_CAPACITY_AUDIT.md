# PHASE 6 — EMPLOYER VALIDATION & CAPACITY AUDIT IMPLEMENTATION DOCUMENTATION

## Executive Summary

Phase 6 implements and verifies the **Employer Validation & Capacity Audit** module for MahaSkill Intelligence. The module links enterprise employer hiring signals directly to vocational training capacity (certified trainers and lab equipment) across regional jurisdictions, establishing an end-to-end evidence chain:

$$\text{Employer Signals } (3 \text{ records}) \longrightarrow D_{\text{demand}} \longrightarrow \text{Trainer Capacity Audit} \longrightarrow \text{Equipment Capacity Audit} \longrightarrow \text{District Readiness}$$

All metrics are derived dynamically from active remote Supabase database tables (`employer_signals`, `employers`, `trainers`, `equipment`, `courses`, `course_skills`, `skills`, `districts`) without modifying synthetic database records.

---

## 1. Existing Implementation Audit

Prior to Phase 6 execution:
* `capacityAndValidationEngine.ts` contained prototype arrays (`SEED_EMPLOYER_VALIDATIONS`) and static capacity fallbacks.
* Remote Supabase database contained:
  - `employers`: **5 profile records** (Tata Motors EV, Mahindra Electric, Bosch India, Persistent Systems, TCS)
  - `employer_signals`: **3 active hiring-signal records** (EV Battery Diagnostics Pune: 45 & 35 expected hires; React.js Pune: 120 expected hires)
  - `trainers`: **3 records** (Pune EV Battery: 3 certified trainers; Nashik CAN Bus: 5 certified trainers; Nagpur CAN Bus: 3 certified trainers)
  - `equipment`: **3 records** (Pune EV Battery: 7 benches; Nashik CAN Bus: 10 kits; Nagpur CAN Bus: 5 kits)

---

## 2. Employer Validation Methodology

* Query `employer_signals` ($3 \text{ active records}$) joined with `employers` ($5 \text{ profile records}$).
* Aggregates expected hiring volume per skill and district without double counting:
  - **EV Battery Diagnostics (Pune)**: $45 \text{ hires} + 35 \text{ hires} = 80 \text{ expected hires}$ (from Tata Motors EV & Mahindra Electric).
  - **React.js (Pune)**: $120 \text{ expected hires}$ (from Persistent Systems).

---

## 3. Demand Integration (Phase 4.4 Methodology)

Direct Hiring Demand follows the validated Phase 4.4 methodology:
$$D_{\text{demand}} = N_{\text{postings}} + N_{\text{expected\_hires}}$$

* **EV Battery Diagnostics — Pune**: $28 \text{ postings} + 80 \text{ expected hires} = 108 \text{ persons/year}$.
* **React.js — All Maharashtra**: $142 \text{ postings} + 120 \text{ expected hires} = 262 \text{ persons/year}$.

---

## 4. Trainer Capacity Audit Methodology & Dual-Basis Rule

The trainer requirement basis explicitly distinguishes mapped vs. unmapped skills:

* **Rule A — Mapped Skill (Course Seats $> 0$)**:
  Training requirement is driven by the established course seat capacity:
  $$\text{Trainers}_{\text{required}} = \left\lceil \frac{\text{Annual Course Seats}}{35} \right\rceil$$
  - EV Battery Diagnostics (Pune): $120 \text{ seats} \rightarrow \lceil 120 / 35 \rceil = 4 \text{ certified trainers required}$.
  - CAN Bus Diagnostics (Nashik): $90 \text{ seats} \rightarrow \lceil 90 / 35 \rceil = 3 \text{ certified trainers required}$.

* **Rule B — Unmapped Skill (Course Seats $= 0$)**:
  Training requirement is driven by unsupplied Direct Hiring Demand ($D_{\text{demand}}$) to calculate instructor hiring needed to launch new courses:
  $$\text{Trainers}_{\text{required}} = \left\lceil \frac{D_{\text{demand}}}{35} \right\rceil$$
  - React.js (Pune): $262 \text{ direct demand}, 0 \text{ seats} \rightarrow \lceil 262 / 35 \rceil = 8 \text{ certified trainers required}$.

* **Trainer Deficit / Surplus**:
  $$\text{Trainer Gap} = \text{Trainers}_{\text{available}} - \text{Trainers}_{\text{required}}$$
* **Trainer Readiness Percentage**:
  $$\text{Trainer Readiness \%} = \min\left(100, \left\lfloor \frac{\text{Trainers}_{\text{available}}}{\text{Trainers}_{\text{required}}} \times 100 \right\rfloor\right)$$

---

## 5. Equipment Capacity Audit Methodology & Domain-Specific Sharing Ratios

The domain model intentionally distinguishes equipment types based on practical lab sharing ratios:

* **Domain Type A — Automotive & Heavy Hardware Labs (EV Battery Benches, CAN Bus Oscilloscope Kits)**:
  - **Lab Batch Ratio**: 1 lab bench per 3 trainees in a 30-trainee lab batch $\rightarrow \text{max } 10 \text{ benches required per lab batch}$.
  - **Formula**:
    $$\text{Equipment}_{\text{required}} = \left\lceil \frac{\min(30, \text{Basis})}{3} \right\rceil = 10 \text{ benches per batch}$$
  - **EV Battery Diagnostics (Pune)**: $30 \text{ batch trainees} \rightarrow \lceil 30 / 3 \rceil = 10 \text{ diagnostic benches required}$. Available = $7 \text{ benches}$. Equipment Gap = $-3$.

* **Domain Type B — Software & IT Computer Labs (Developer PC Workstations)**:
  - **Computer Lab Ratio**: 1 workstation per 10 annual trainees shared across lab shift schedules.
  - **Formula**:
    $$\text{Equipment}_{\text{required}} = \left\lceil \frac{\text{Basis } (D_{\text{demand}} \text{ or Seats})}{10} \right\rceil$$
  - **React.js (Pune)**: $262 \text{ direct demand}, 0 \text{ seats} \rightarrow \lceil 262 / 10 \rceil = 27 \text{ workstations required}$. Available = $0$. Equipment Gap = $-27$.

* **Equipment Deficit / Surplus**:
  $$\text{Equipment Gap} = \text{Equipment}_{\text{available}} - \text{Equipment}_{\text{required}}$$
* **Equipment Readiness Percentage**:
  $$\text{Equipment Readiness \%} = \min\left(100, \left\lfloor \frac{\text{Equipment}_{\text{available}}}{\text{Equipment}_{\text{required}}} \times 100 \right\rfloor\right)$$

---

## 6. Deterministic District Readiness Score & Status

### Overall Readiness Score Formula ($0\text{--}100$)
$$\text{Overall Readiness Score} = \min\left(100, \left\lfloor 0.40 \times \text{Trainer Readiness \%} + 0.40 \times \text{Equipment Readiness \%} + 0.20 \times \min(100, CR_{\%}) \right\rfloor\right)$$

### Readiness Status Rules
* **`OVERSUPPLIED / EXCESS CAPACITY`**: Coverage Ratio $> 200\%$.
* **`FULLY READY`**: Trainer Readiness $\% \ge 100\%$ AND Equipment Readiness $\% \ge 100\%$ AND Coverage $\% \ge 90\%$ ($\text{Score} \ge 80$).
* **`MODERATE READINESS`**: Trainer or Equipment capacity has a minor gap ($\le 3 \text{ units deficit}$) ($\text{Score } 60\text{--}79$).
* **`NOT READY — CAPACITY INVESTMENT REQUIRED`**: High demand exists ($D_{\text{demand}} > 0$), but major trainer or equipment deficit exists ($> 3 \text{ units deficit}$ with $\text{Score } < 60$).

---

## 7. Benchmark Validation Results (Live Supabase Data)

### Benchmark Case: EV Battery Diagnostics — Pune
- **Employer Signals**: 2 signals (Tata Motors EV: 45, Mahindra Electric: 35 $\rightarrow 80 \text{ expected hires}$)
- **Direct Hiring Demand**: $28 \text{ postings} + 80 \text{ hires} = 108 \text{ persons/year}$
- **Trainer Audit**: $120 \text{ seats} \rightarrow \lceil 120 / 35 \rceil = 4 \text{ required trainers}$. Available = $3 \text{ certified trainers}$. Trainer Gap = $-1$. Trainer Readiness = $75\%$.
- **Equipment Audit**: $30 \text{ batch trainees} \rightarrow \lceil 30 / 3 \rceil = 10 \text{ benches}$. Available = $7 \text{ benches}$. Equipment Gap = $-3$. Equipment Readiness = $70\%$.
- **Phase 4.4 Coverage %**: $105.56\%$
- **Overall Readiness Score**: $\lfloor 0.40 \times 75 + 0.40 \times 70 + 0.20 \times 100 \rfloor = 78 / 100$
- **Readiness Status**: `MODERATE READINESS` ($\checkmark$ Expected)

### Benchmark Case: React.js — Pune
- **Employer Signals**: 1 signal (Persistent Systems: $120 \text{ expected hires}$)
- **Direct Hiring Demand**: $142 \text{ postings} + 120 \text{ hires} = 262 \text{ persons/year}$
- **Trainer Audit**: Unmapped $\rightarrow \lceil 262 / 35 \rceil = 8 \text{ required trainers}$. Available = $0$. Trainer Gap = $-8$.
- **Equipment Audit**: IT Workstation $\rightarrow \lceil 262 / 10 \rceil = 27 \text{ required workstations}$. Available = $0$. Equipment Gap = $-27$.
- **Overall Readiness Score**: $0 / 100$
- **Readiness Status**: `NOT READY — CAPACITY INVESTMENT REQUIRED` ($\checkmark$ Expected)

### Benchmark Case: CAN Bus Diagnostics — Nashik
- **Direct Hiring Demand**: $40 \text{ persons/year}$
- **Trainer Audit**: Available = $5$, Required = $3$. Trainer Gap = $+2$.
- **Equipment Audit**: Available = $10$, Required = $10$. Equipment Gap = $0$.
- **Coverage %**: $217.00\%$
- **Readiness Status**: `OVERSUPPLIED / EXCESS CAPACITY` ($\checkmark$ Expected)

---

## 8. Edge Case Handling

* **Zero Demand / Zero Capacity**: Handled safely without NaN/Infinity.
* **Unmapped Infrastructure**: Correctly computes 0 readiness for unmapped skills with active demand.
* **Double Counting Prevention**: Aggregates expected hires per unique employer signal row.

---

## 9. UI Changes ([EmployerValidation.tsx](file:///c:/MahaSkill%20Intelligence/src/pages/EmployerValidation.tsx) & [TrainerEquipment.tsx](file:///c:/MahaSkill%20Intelligence/src/pages/TrainerEquipment.tsx))

* **Employer Validation Portal**: Displays exact validating employer count ($3 \text{ signal rows}, 5 \text{ employer profiles}$), expected hires, affected skill/district, and employer comments.
* **Trainer & Equipment Audit Page**: Renders dynamic available vs required counts, deficit/surplus gaps, trainer readiness %, equipment readiness %, and readiness status badges.

---

## 10. Database Integrity Verification

Confirmed unchanged baseline counts in remote Supabase:
- `employers`: **5**
- `employer_signals`: **3**
- `job_postings`: **300**
- `job_skills`: **360**
- `skills`: **14**
- `districts`: **3**
- `sectors`: **2**
- `courses`: **3**
- `course_skills`: **4**
- `trainers`: **3**
- `equipment`: **3**

---

## 11. Regression Test Results

All regression test suites executed via CLI with 100% pass rates:
1. `node scripts/test-phase6-pipeline.cjs`: **27 / 27 Assertions Passed**
2. `node scripts/test-phase5-pipeline.cjs`: **28 / 28 Assertions Passed**
3. `node scripts/test-phase44-pipeline.cjs`: **25 / 25 Assertions Passed**
4. `node scripts/test-phase4-pipeline.cjs`: **15 / 15 Assertions Passed**
5. `npx tsx scripts/test-phase3-pipeline.cjs`: **10 / 10 Test Cases Passed**
6. `npx tsx scripts/test-phase8-pipeline.cjs`: **11 / 11 Scenarios Passed**
7. `npx tsx scripts/test-phase9-user-journey.cjs`: **12 / 12 Sections Passed**
8. `npx tsx scripts/audit-evidence-provenance.cjs`: **12 / 12 Audits Passed**

---

## 12. Build Result

Production build command (`npm run build`) completed cleanly:

```
> mahaskill-intelligence@0.0.0 build
> tsc -b && vite build

vite v8.2.2 building client environment for production...
✓ 2506 modules transformed.
dist/index.html                     0.47 kB
dist/assets/index-BHBLu_c5.css     58.34 kB
dist/assets/index-BzG_cx3f.js   1,179.44 kB

✓ built in 564ms
```

---

## 13. Limitations

* **Instructor Specialty Sub-fields**: Trainer capacity is evaluated at the canonical skill level; future granular instructor certification tracking (e.g. high-voltage vs low-voltage EV certification) can be integrated seamlessly.

---

## 14. Provenance & Data Classification

All Phase 6 capacity analytics follow strict evidence provenance directives:
* `REAL_PUBLIC_DATA`: Certified trainer counts and lab equipment inventory ingested from regional ITI data.
* `DERIVED_METRIC`: Direct Hiring Demand ($D_{\text{demand}}$), Required Trainers, Required Equipment, Trainer Gap, Equipment Gap, Trainer Readiness %, Equipment Readiness %, and District Readiness Score.
* `PROTOTYPE / SYNTHETIC DATA`: Preserved on synthetic employer hiring signals and lab equipment bench ratios.
