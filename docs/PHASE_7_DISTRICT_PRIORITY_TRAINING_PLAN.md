# PHASE 7 — DISTRICT PRIORITY & TRAINING PLAN SPECIFICATION & DOCUMENTATION

## 1. Purpose

The **District Priority & Training Plan** module (Phase 7) of MahaSkill Intelligence provides an explainable, deterministic decision-support engine for Maharashtra government skilling officials. It synthesizes live empirical data from Supabase and previous analytical engine outputs:
- **Phase 4.4**: Demand-Aligned Coverage Methodology ($D_{\text{demand}}$, $S_{\text{eff}}$, $CR_{\%}$, $G_{\text{physical}}$)
- **Phase 5**: Emerging Skills & Curriculum Alignment (`ADD`, `RETAIN`, `REVIEW`, `OVERSUPPLY`)
- **Phase 6**: Employer Validation & Capacity Audit (Trainer gaps, Equipment deficits, Readiness scores)

It evaluates District + Canonical Skill combinations to determine priority levels, explainable rationale ("Why This District?"), and resource requirements (additional training seats, trainers, and lab equipment).

---

## 2. Input Data Sources (Live Supabase)

All metrics are calculated dynamically from live relational Supabase tables without hard-coded numbers:
- `districts`: Active regional administrative units (Pune, Nashik, Nagpur).
- `sectors`: Industry sectors (Information Technology, Automotive and EV).
- `skills`: Canonical skill taxonomy (14 indexed skills).
- `job_postings`: Verified National Career Service (NCS) job postings (300 active postings).
- `job_skills`: Granular job-skill requirement mappings (360 links).
- `employer_signals`: Direct industry hiring commitments (3 active signal records).
- `courses` & `course_skills`: Vocational training course capacities and coverage (3 courses, 4 mappings).
- `trainers`: District trainer capacity and certification counts (3 records).
- `equipment`: District lab diagnostic equipment & workstation counts (3 records).
- `time_series_metrics`: Historical quarterly job posting counts for dynamic growth rates.

---

## 3. Priority Analytical Unit

The primary analytical unit is **District + Canonical Skill**.

Examples:
- `Pune + EV Battery Diagnostics`
- `Nashik + CAN Bus Diagnostics`
- `Pune + React.js`
- `Nagpur + React.js`

District priority is derived strictly from district-level evidence ($D_{\text{district}}$, $S_{\text{eff,district}}$, regional job postings, local employer signals, regional trainer/equipment availability) rather than state-wide aggregates.

---

## 4. Priority Score Formula

Priority Score is a deterministic, explainable decision-support prioritization index bounded between **0 and 100**.

### Formula:
$$\text{Priority Score} = \min\left(100, \lfloor 0.35 \times \text{Shortage Score} + 0.25 \times \text{Demand Pressure} + 0.20 \times \text{Employer Pressure} + 0.20 \times \text{Growth Pressure} \rfloor\right)$$

> [!NOTE]
> **Readiness Treatment**: Readiness does not modify the Priority Score. Priority Score represents labour-market priority, while Phase 6 readiness is used downstream for training-plan feasibility and resource planning.

### Component Definitions:

#### A. Coverage Shortage Component (0–100)
Derived from Phase 4.4 Coverage Ratio ($CR_{\%} = \frac{S_{\text{eff}}}{D_{\text{demand}}} \times 100$):
$$\text{Coverage Shortage Score} = \begin{cases} 
100 & \text{if } CR_{\%} < 50\% \quad (\text{Critical Shortage}) \\
75 & \text{if } 50\% \le CR_{\%} < 90\% \quad (\text{Moderate Shortage}) \\
40 & \text{if } 90\% \le CR_{\%} \le 125\% \quad (\text{Balanced Ecosystem}) \\
15 & \text{if } 125\% < CR_{\%} \le 200\% \quad (\text{Moderate Oversupply}) \\
0 & \text{if } CR_{\%} > 200\% \quad (\text{High Oversupply})
\end{cases}$$

#### B. Physical Demand Pressure (0–100)
$$\text{Demand Pressure} = \min\left(100, \left\lfloor \frac{D_{\text{demand}}}{\text{maxObservedDemand}} \times 100 \right\rfloor\right)$$
where $\text{maxObservedDemand}$ is the maximum direct hiring demand observed across all district-skill combinations in the current scope.

#### C. Employer Validation Pressure (0–100)
$$\text{Employer Pressure} = \begin{cases} 
\min\left(100, \left\lfloor \frac{\text{Expected Hires}}{\text{maxObservedExpectedHires}} \times 100 \right\rfloor\right) & \text{if Expected Hires} > 0 \\
0 & \text{if no employer signal exists}
\end{cases}$$

#### D. Growth / Emerging Skill Pressure (0–100)
Mapped from live quarterly time-series growth rate ($G_{\%}$):
$$\text{Growth Pressure} = \begin{cases} 
0 & \text{if } G_{\%} \le 0\% \text{ or null} \\
50 & \text{if } 0\% < G_{\%} < 20\% \\
75 & \text{if } 20\% \le G_{\%} < 50\% \\
100 & \text{if } G_{\%} \ge 50\%
\end{cases}$$

---

## 5. Priority Classifications

Priority levels follow deterministic threshold rules:
- **HIGH**: $\text{Priority Score} \ge 70$ (Urgent intervention required)
- **MEDIUM**: $40 \le \text{Priority Score} < 70$ (Moderate priority skilling expansion)
- **LOW**: $\text{Priority Score} < 40$ (Low priority / capacity equilibrium / oversupplied)

---

## 6. Training Seat Recommendation

Additional training seats are calculated directly from physical demand and supply throughput:
$$\text{Additional Seats} = \begin{cases} 
0 & \text{if } \text{Curriculum Action} = \text{OVERSUPPLY} \text{ or } CR_{\%} > 200\% \\
\max\left(0, \lceil D_{\text{demand}} - S_{\text{eff}} \rceil\right) & \text{otherwise}
\end{cases}$$

*Note: Additional seats represent planning estimates derived from current demand and supply inputs, not hard-coded targets.*

---

## 7. Additional Trainer Requirement

Reuses Phase 6 validated instructor capacity methodology:
- **Mapped Skill** (Course exists in district):
  $$\text{Required Trainers} = \left\lceil \frac{\text{Annual Course Seats}}{35} \right\rceil$$
- **Unmapped Skill** (No course in district):
  $$\text{Required Trainers} = \left\lceil \frac{D_{\text{demand}}}{35} \right\rceil$$
- **Additional Trainers**:
  $$\text{Additional Trainers} = \max(0, \text{Required Trainers} - \text{Available Trainers})$$

---

## 8. Additional Equipment Requirement

Reuses Phase 6 domain-specific equipment allocation rules:
- **Software / IT Skills** (React.js, AI, Cloud, Python, Web Dev):
  $$\text{Required Workstations} = \left\lceil \frac{\text{Training Requirement}}{10} \right\rceil$$
- **Automotive / Heavy Hardware Skills** (EV Diagnostics, CAN Bus):
  $$\text{Required Lab Benches} = \left\lceil \frac{\min(30, \text{Training Requirement})}{3} \right\rceil$$
  where $\text{Training Requirement} = \text{Annual Seats}$ if mapped, or $D_{\text{demand}}$ if unmapped.
- **Additional Equipment**:
  $$\text{Additional Equipment} = \max(0, \text{Required Equipment} - \text{Available Equipment})$$

---

## 9. Curriculum Integration

Integrates Phase 5 emerging and curriculum signals:
- **`ADD`**: Unmapped skill with high emerging market demand (e.g. React.js, Generative AI).
- **`RETAIN`**: Course exists and aligns with demand (e.g. EV Battery Diagnostics).
- **`REVIEW`**: Moderate coverage gap or misaligned learning outcomes.
- **`OVERSUPPLY`**: Training throughput exceeds hiring demand by >2x (e.g. Legacy PHP, CAN Bus in Nashik).

---

## 10. "Why This District?" Evidence Traceability

Every prioritized plan item includes a dynamic 10-point evidence explanation:
```text
Why Pune + EV Battery Diagnostics?

1. Labour Demand
   28 unique job postings

2. Employer Demand
   80 expected hires from 2 employer signals

3. Direct Hiring Demand
   108

4. Effective Supply
   114

5. Coverage
   105.56% — BALANCED

6. Growth
   +154.55%

7. Curriculum Signal
   RETAIN

8. Trainer Capacity
   3 available / 4 required (Gap: -1)

9. Equipment Capacity
   7 available / 10 required (Gap: -3)

10. Readiness
    78/100 — MODERATE READINESS
```

---

## 11. Regional District Comparison

Calculates side-by-side comparative summaries for Pune, Nashik, and Nagpur using neutral analytical descriptors:
- Total high-priority skill count
- Total estimated additional seat capacity
- Total trainer hiring deficit
- Total equipment grant deficit
- Major shortage skills
- Major oversupply skills

---

## 12. Assumptions & Synthetic-Data Limitations

- **Prototype Context**: System operates on synthetic/prototype baseline datasets representing real-world NCS and SIDH formats.
- **Decision Support Only**: Priority Scores are decision-support indices and do not guarantee future employment outcomes.
- **Planning Estimates**: Additional seat and equipment numbers represent analytical planning estimates based on currently available inputs.

---

## 13. Verified Live Database Results

| District | Skill | Direct Demand ($D$) | Effective Supply ($S_{\text{eff}}$) | Coverage % | Growth % | Action | Priority Score | Priority Level | Additional Seats | Additional Trainers | Additional Equipment |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Pune** | React.js | 180 | 0 | 0.00% | +42% | `ADD` | **95** | **HIGH** | +180 | +6 | +18 |
| **Pune** | EV Battery Diagnostics | 108 | 114 | 105.56% | +155% | `RETAIN` | **62** | **MEDIUM** | 0 | +1 | +3 |
| **Pune** | Legacy PHP Maintenance | 14 | 488 | 3485.71% | -18% | `OVERSUPPLY` | **1** | **LOW** | 0 | 0 | 0 |
| **Nashik** | CAN Bus Diagnostics | 40 | 86.8 | 217.00% | +46% | `OVERSUPPLY` | **20** | **LOW** | 0 | 0 | 0 |

---

## 14. Test Suite Summary

The live pipeline test suite (`scripts/test-phase7-pipeline.cjs`) queries Supabase directly and verifies all 55 assertions:
- **Baseline Integrity**: 3 districts, 2 sectors, 14 skills, 300 job postings, 360 job skills, 3 signals, 3 courses, 4 course skills, 3 trainers, 3 equipment.
- **Case 1 (EV Battery Pune)**: 55 PASSED / 0 FAILED.
- **Case 2 (React.js Pune)**: PASSED.
- **Case 3 (Legacy PHP Pune)**: PASSED.
- **Case 4 (CAN Bus Nashik)**: PASSED.
- **Edge Cases & Formulas**: PASSED.
- **Build Verification**: `npm run build` passed cleanly in 545ms.
