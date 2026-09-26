# PHASE 4.2 — DEMAND–SUPPLY METHODOLOGY REDESIGN

## 1. Current Methodology Overview

In Phase 4.0, the analytics engine (`src/analytics/demandSupplyGapEngine.ts`) evaluated Demand Score, Supply Score, and Net Skill Gap using the following logic:

### Demand Score Formula (0–100 Scale):
$$\text{Demand Score} = \begin{cases} \left\lfloor 0.50 \times D_{\text{posting}} + 0.30 \times D_{\text{employer}} + 0.20 \times D_{\text{growth}} \right\rfloor, & \text{with growth data} \\ \left\lfloor 0.65 \times D_{\text{posting}} + 0.35 \times D_{\text{employer}} \right\rfloor, & \text{without growth data} \end{cases}$$

Where:
* $D_{\text{posting}} = \min\left(100, \lfloor \frac{\text{Skill Postings Count}}{\max_{s}(\text{Postings}_s)} \times 100 \rfloor\right)$
* $D_{\text{employer}} = \min\left(100, \lfloor \frac{\text{Expected Hires}}{\max_{s}(\text{Expected Hires}_s)} \times 100 \rfloor\right)$
* $D_{\text{growth}} = \min\left(100, \max(0, \lfloor 50 + 0.5 \times \text{Growth Rate \%} \rfloor)\right)$

### Current Supply Score Formula (0–100 Scale):
$$\text{Supply Score} = \min\left(100, \left\lfloor \frac{0.60 \times \text{Annual Seats} + 0.40 \times \text{Annual Completions}}{\text{Max Observed Supply Seats in Jurisdiction}} \times 100 \right\rfloor\right)$$

### Current Net Skill Gap Formula:
$$\text{Net Skill Gap} = \text{Demand Score} - \text{Supply Score}$$

---

## 2. Problems with Current Methodology

The Phase 4.1 audit identified three fundamental mathematical and conceptual flaws:

1. **Incompatible Scaling Baseline**:
   Supply Score scales seats against the **maximum seat count among all skills in the filtered jurisdiction** ($\text{Max Observed Supply Seats}$). Any skill with the largest seat count in a district automatically gets a Supply Score near $95\text{--}100/100$, regardless of whether those seats are adequate to meet employer hiring demand.
2. **Inverted Shortage/Oversupply Classifications**:
   * *EV Battery Diagnostics (Pune)*: 28 job postings, 2 major EV manufacturers demanding 80 hires, +155% growth $\rightarrow$ Demand Score = 60. But because 120 seats is the local maximum in Pune, Supply Score = 95, yielding $\text{Net Gap} = 60 - 95 = \mathbf{-35}$ (**High Oversupply**). This misclassifies a surging, under-capacitated EV sector as oversupplied!
   * *Legacy PHP Maintenance (Pune)*: 14 postings, fading demand. If 500 seats are present, Supply = 100, Net Gap = -82. If 0 seats are present, Supply = 0, Net Gap = +18 (**Moderate Shortage**).
3. **Decoupled Demand and Supply Evaluation**:
   The current model calculates Supply Score independently of Demand Score, subtracting two unrelated percentile metrics ($\text{Demand Score} - \text{Supply Score}$) rather than evaluating **Demand Coverage**.

---

## 3. Data Available in Remote Supabase Database

The active remote Supabase database provides the following empirical source metrics:

* `job_postings`: Ingested job postings per skill and district ($N_{\text{postings}}$).
* `job_skills`: Relational junction mapping postings to canonical skills.
* `employer_signals`: Direct enterprise hiring intent records with expected hires ($N_{\text{expected\_hires}}$).
* `time_series_metrics`: Historical quarterly job posting counts for calculating skill growth rate ($G_{\%}$).
* `courses`: Accredited vocational courses with `annual_seats` ($S_{\text{seats}}$) and `annual_completions` ($S_{\text{completions}}$).
* `course_skills`: Relational junction mapping courses to canonical skills.
* `districts` & `sectors`: Jurisdictional and industry taxonomies.

---

## 4. Missing Data & System Boundaries

* **No Exhaustive Macro Labour Census**: The database contains representative ingested job postings (300) and enterprise signals (5), not an exhaustive census of all hiring across Maharashtra.
* **No Direct Conversion Constant**: The database does not contain a hardcoded multiplier mapping 1 job posting to $N$ total market vacancies.
* **Conclusion**: We must not invent arbitrary conversion factors to claim absolute macro census numbers. Instead, we must define a **Direct Hiring Demand Benchmark** derived transparently from available database rows.

---

## 5. Candidate Methodologies Considered

### Candidate A: Direct Physical Seat Gap ($G_{\text{physical}}$)
$$\text{Direct Hiring Demand } D_{\text{hires}} = N_{\text{postings}} + N_{\text{expected\_hires}}$$
$$\text{Effective Supply } S_{\text{eff}} = 0.6 \times S_{\text{seats}} + 0.4 \times S_{\text{completions}}$$
$$\text{Physical Gap } G_{\text{physical}} = D_{\text{hires}} - S_{\text{eff}}$$
* *Pros*: 100% transparent, physical units (seats/graduates), no arbitrary normalization.
* *Cons*: Cannot be rendered directly on 0–100 UI chart widgets without dual axis.

### Candidate B: Demand-Aligned Supply Coverage Score (Recommended Primary Architecture)
Keeps the normalized $0\text{--}100$ Demand Score for UI compatibility, but scales Supply Score **against the skill's own hiring demand volume ($D_{\text{hires}}$)** rather than the jurisdiction's maximum seat count:

$$\text{Direct Hiring Demand } D_{\text{hires}} = N_{\text{postings}} + N_{\text{expected\_hires}}$$
$$\text{Effective Supply } S_{\text{eff}} = 0.6 \times S_{\text{seats}} + 0.4 \times S_{\text{completions}}$$
$$\text{Supply Coverage Ratio } CR = \frac{S_{\text{eff}}}{\max(1, D_{\text{hires}})}$$
$$\text{Demand-Aligned Supply Score } S_{\text{score}} = \min\left(100, \left\lfloor CR \times \text{Demand Score} \right\rfloor\right)$$
$$\text{Net Skill Gap } G = \text{Demand Score} - S_{\text{score}}$$

---

## 6. Recommended Methodology: Dual-Layer Demand-Aligned Analytics

We recommend implementing **Candidate B (Demand-Aligned Analytics)**, which exposes both **Physical Seat Metrics** and **Normalized 0–100 Scores**:

1. **Physical Metric Layer**:
   * $\text{Direct Hiring Demand } D_{\text{hires}} = N_{\text{postings}} + N_{\text{expected\_hires}}$
   * $\text{Effective Graduate Throughput } S_{\text{eff}} = 0.6 \times S_{\text{seats}} + 0.4 \times S_{\text{completions}}$
   * $\text{Supply Coverage Percentage } CR_{\%} = \lfloor (S_{\text{eff}} / D_{\text{hires}}) \times 100 \rfloor$
   * $\text{Physical Seat Deficit/Surplus } G_{\text{physical}} = D_{\text{hires}} - S_{\text{eff}}$

2. **Normalized UI Layer (0–100)**:
   * $\text{Demand Score} = \text{Unchanged Phase 4.0 Demand Score}$
   * $\text{Demand-Aligned Supply Score } S_{\text{score}} = \min\left(100, \left\lfloor \frac{S_{\text{eff}}}{\max(1, D_{\text{hires}})} \times \text{Demand Score} \right\rfloor\right)$
   * $\text{Net Skill Gap } G = \text{Demand Score} - S_{\text{score}}$

---

## 7. Exact Mathematical Formulas

$$\text{Direct Hiring Demand } D_{\text{hires}} = N_{\text{postings}} + N_{\text{expected\_hires}}$$

$$\text{Effective Supply Throughput } S_{\text{eff}} = 0.60 \times S_{\text{seats}} + 0.40 \times S_{\text{completions}}$$

$$\text{Coverage Ratio } CR = \frac{S_{\text{eff}}}{\max(1, D_{\text{hires}})}$$

$$\text{Demand-Aligned Supply Score } S_{\text{score}} = \begin{cases} 0, & \text{if } S_{\text{eff}} = 0 \\ \min\left(100, \left\lfloor CR \times \text{Demand Score} \right\rfloor\right), & \text{if } S_{\text{eff}} > 0 \end{cases}$$

$$\text{Net Skill Gap } G = \text{Demand Score} - S_{\text{score}}$$

---

## 8. Meaning of Every Variable

| Variable | Definition | Source Table / Field |
|---|---|---|
| $N_{\text{postings}}$ | Unique job postings referencing the canonical skill in target district/sector | `job_postings` JOIN `job_skills` |
| $N_{\text{expected\_hires}}$ | Total employer expected hires validation volume | `employer_signals.expected_hires` |
| $D_{\text{hires}}$ | Total Direct Hiring Demand Volume | Derived: $N_{\text{postings}} + N_{\text{expected\_hires}}$ |
| $S_{\text{seats}}$ | Total approved annual course seats teaching the skill in target district | `courses.annual_seats` JOIN `course_skills` |
| $S_{\text{completions}}$ | Total actual annual graduate completions | `courses.annual_completions` JOIN `course_skills` |
| $S_{\text{eff}}$ | Effective Supply Throughput ($60\%$ seats $+ 40\%$ completions) | Derived: $0.60 S_{\text{seats}} + 0.40 S_{\text{completions}}$ |
| $CR$ | Supply Coverage Ratio ($S_{\text{eff}} / D_{\text{hires}}$) | Derived ratio |
| $\text{Demand Score}$ | Normalized Demand Index ($0\text{--}100$) | Unchanged Phase 4.0 formula |
| $S_{\text{score}}$ | Demand-Aligned Supply Score ($0\text{--}100$) | Derived: $\min(100, \lfloor CR \times \text{Demand Score} \rfloor)$ |
| $G$ | Net Skill Gap Score | Derived: $\text{Demand Score} - S_{\text{score}}$ |

---

## 9. Edge-Case Handling

1. **High Demand + Zero Supply** ($D_{\text{hires}} > 0, S_{\text{eff}} = 0$):
   $S_{\text{score}} = 0 \rightarrow \text{Net Gap } G = \text{Demand Score}$ (**High Shortage**, $100\%$ deficit).
2. **High Demand + High Supply** ($D_{\text{hires}} = 100, S_{\text{eff}} = 100$):
   $CR = 1.0 \rightarrow S_{\text{score}} = \text{Demand Score} \rightarrow \text{Net Gap } G = 0$ (**Balanced Ecosystem**).
3. **Low Demand + High Supply** ($D_{\text{hires}} = 10, S_{\text{eff}} = 200$):
   $CR = 20.0 \rightarrow S_{\text{score}} = \min(100, \lfloor 20 \times 18 \rfloor) = 100 \rightarrow \text{Net Gap } G = 18 - 100 = \mathbf{-82}$ (**High Oversupply**).
4. **Zero Demand + High Supply** ($D_{\text{hires}} = 0, S_{\text{eff}} > 0$):
   $\text{Demand Score} = 0 \rightarrow S_{\text{score}} = 100 \rightarrow \text{Net Gap } G = -100$ (**High Oversupply**).
5. **Zero Demand + Zero Supply** ($D_{\text{hires}} = 0, S_{\text{eff}} = 0$):
   $\text{Demand Score} = 0 \rightarrow S_{\text{score}} = 0 \rightarrow \text{Net Gap } G = 0$ (**Balanced Ecosystem**).
6. **Multiple Courses per Skill**:
   $S_{\text{seats}}$ and $S_{\text{completions}}$ sum across all matching unique course rows in the jurisdiction without double-counting.
7. **Multiple Skills per Course**:
   Each skill receives the full seat/completion throughput of courses that include that skill in `course_skills`.

---

## 10. Four Worked Examples (Active Supabase Data)

### Worked Example 1: EV Battery Diagnostics — Pune (`d1`)
* $N_{\text{postings}} = 28$, $N_{\text{expected\_hires}} = 80 \rightarrow D_{\text{hires}} = 108$
* $S_{\text{seats}} = 120$, $S_{\text{completions}} = 105 \rightarrow S_{\text{eff}} = 114$
* Coverage Ratio $CR = 114 / 108 = 1.055$ ($105.5\%$ demand coverage)
* $\text{Demand Score} = 60$
* $\text{Proposed Supply Score } S_{\text{score}} = \min(100, \lfloor 1.055 \times 60 \rfloor) = \mathbf{60}$
* $\text{Proposed Net Gap } G = 60 - 60 = \mathbf{0}$ (**Balanced / Adequately Capacitated**)
* *Physical Output*: **+6 seats surplus** ($114 \text{ supply vs } 108 \text{ demand}$)
* *Comparison*: Eliminates the broken Phase 4.0 error which gave $-35$ (**High Oversupply**).

### Worked Example 2: Legacy PHP Maintenance — Pune (`d1`)
* $N_{\text{postings}} = 14$, $N_{\text{expected\_hires}} = 0 \rightarrow D_{\text{hires}} = 14$
* $S_{\text{seats}} = 500$, $S_{\text{completions}} = 470 \rightarrow S_{\text{eff}} = 488$
* Coverage Ratio $CR = 488 / 14 = 34.85$ ($3,485\%$ demand coverage)
* $\text{Demand Score} = 18$
* $\text{Proposed Supply Score } S_{\text{score}} = \min(100, \lfloor 34.85 \times 18 \rfloor) = \mathbf{100}$
* $\text{Proposed Net Gap } G = 18 - 100 = \mathbf{-82}$ (**High Oversupply**)
* *Physical Output*: **-474 seats massive surplus** ($488 \text{ supply vs } 14 \text{ demand}$)

### Worked Example 3: React.js — All Maharashtra (`ALL`)
* $N_{\text{postings}} = 142$, $N_{\text{expected\_hires}} = 120 \rightarrow D_{\text{hires}} = 262$
* $S_{\text{seats}} = 0$, $S_{\text{completions}} = 0 \rightarrow S_{\text{eff}} = 0$
* Coverage Ratio $CR = 0.0$ ($0\%$ demand coverage)
* $\text{Demand Score} = 94$
* $\text{Proposed Supply Score } S_{\text{score}} = \mathbf{0}$
* $\text{Proposed Net Gap } G = 94 - 0 = \mathbf{+94}$ (**High Shortage**)
* *Physical Output*: **+262 seats deficit** ($0 \text{ supply vs } 262 \text{ demand}$)

### Worked Example 4: CAN Bus Diagnostics — Nashik (`d2`)
* $N_{\text{postings}} = 40$, $N_{\text{expected\_hires}} = 0 \rightarrow D_{\text{hires}} = 40$
* $S_{\text{seats}} = 90$, $S_{\text{completions}} = 82 \rightarrow S_{\text{eff}} = 86.8$
* Coverage Ratio $CR = 86.8 / 40 = 2.17$ ($217\%$ demand coverage)
* $\text{Demand Score} = 65$
* $\text{Proposed Supply Score } S_{\text{score}} = \min(100, \lfloor 2.17 \times 65 \rfloor) = \mathbf{100}$
* $\text{Proposed Net Gap } G = 65 - 100 = \mathbf{-35}$ (**Moderate Oversupply**)
* *Physical Output*: **-46.8 seats surplus** ($86.8 \text{ supply vs } 40 \text{ demand}$)

---

## 11. Why the Methodology is Defensible

1. **Mathematically Sound Scaling**: Supply Score is anchored directly to the skill's own demand volume ($D_{\text{hires}}$), ensuring that $\text{Net Gap} = \text{Demand Score} - \text{Supply Score}$ is a true measure of unmet demand.
2. **Intuitive Equilibrium Behavior**: When training supply exactly matches hiring demand ($CR = 1.0$), $\text{Supply Score} = \text{Demand Score}$ and $\text{Net Gap} = 0$ (**Balanced**).
3. **No Arbitrary Jurisdictional Maxima**: Eliminates $\text{Max Observed Supply Seats}$, preventing small course seat counts from being artificially inflated to $100/100$.
4. **Dual Transparency**: Provides both normalized $0\text{--}100$ scores for UI executive dashboards and raw physical numbers (seats, completions, expected hires) for evidence panels.

---

## 12. Limitations

* **Sample Ingestion Scaling**: $D_{\text{hires}}$ relies on ingested job postings and employer signals. In full state deployment, an administrative multiplier (e.g. macro survey expansion factor) can be applied to $D_{\text{hires}}$ without changing the mathematical formula.
* **Multi-Skill Course Attribution**: When a single course covers multiple skills, full seat capacity is currently attributed to each taught skill; future enhancements can incorporate `coverage_level` weights (e.g. HIGH = 1.0, MEDIUM = 0.5).

---

## 13. Impact on Phase 5 and Later Modules

* **Curriculum Recommendations**: ADD recommendations will trigger when $CR < 50\%$ or $\text{Net Gap} \ge +25$, generating exact seat targets ($D_{\text{hires}} - S_{\text{eff}}$).
* **Policy Simulator**: Simulating seat increases will directly increase $S_{\text{eff}}$ and $CR$, smoothly reducing $\text{Net Gap}$ with linear mathematical precision.

---

## 14. Migration & Implementation Requirements

When ready for implementation in a future phase:
1. Update `calculateSkillDemandSupplyGaps()` in `src/analytics/demandSupplyGapEngine.ts` to compute $D_{\text{hires}}$, $S_{\text{eff}}$, $CR$, and $S_{\text{score}}$.
2. Update `SkillGapAnalysisResult` interface to export `direct_hiring_demand`, `effective_supply_throughput`, and `supply_coverage_pct`.
3. Update UI cards in `DemandSupplyGap.tsx` to display physical seat gap metrics alongside 0–100 scores.
4. Re-run Phase 4 test suite and regression scripts.

---

## FINAL VERDICT

`METHODOLOGY DESIGN VALID — READY FOR IMPLEMENTATION`

---

*STOP: Design phase complete. No code changes, database changes, or PPT changes were made.*
