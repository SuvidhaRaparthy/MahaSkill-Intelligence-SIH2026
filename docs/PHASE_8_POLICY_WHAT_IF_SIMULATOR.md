# PHASE 8 — POLICY WHAT-IF SIMULATOR SPECIFICATION & DOCUMENTATION

## 1. Purpose

The **Policy What-If Simulator** (Phase 8) of MahaSkill Intelligence enables government planners and policymakers in Maharashtra to model hypothetical policy interventions (training seat expansions, instructor hiring grants, practical lab equipment procurements, and curriculum module additions) and observe the simulated impact on:
- Effective Supply throughput ($S_{\text{eff}}$)
- Demand-Aligned Coverage Ratio ($CR_{\%}$)
- Physical Deficit / Surplus headcount
- Supply Score index (0–100)
- Net Skill Gap Index
- Trainer & Equipment capacity gaps
- Infrastructure execution readiness score (0–100)
- Downstream training plan feasibility

---

## 2. Baseline Immutability & Simulation Labeling

- **Baseline Immutability**: The active remote Supabase database remains the immutable empirical source of truth. Simulations operate strictly in-memory or on explicitly tagged records (`is_simulation: true`). Baseline tables (`job_postings`, `job_skills`, `employer_signals`, `courses`, `course_skills`, `trainers`, `equipment`, `time_series_metrics`, `recommendations`) are NEVER modified by policy simulations.
- **Simulation Labeling**: All simulated outputs in the UI and exports are prominently tagged with:
  > **FORECAST / SIMULATION — NOT AN OFFICIAL GOVERNMENT TARGET**

---

## 3. Policy Input Controls

The simulator provides interactive sliders and toggles for policy levers:
1. **Additional Training Seats** ($\Delta \text{Seats}$): $+0 \text{ to } +600 \text{ seats/yr}$
2. **Additional Trainers** ($\Delta \text{Trainers}$): $+0 \text{ to } +20 \text{ certified instructors}$
3. **Additional Equipment** ($\Delta \text{Equipment}$): $+0 \text{ to } +30 \text{ diagnostic benches / workstations}$
4. **Curriculum Alignment Module**: Toggle hypothetical 100% curriculum module introduction.

---

## 4. Analytical Simulation Formulas

### 4.1 Simulated Effective Supply
$$\text{Simulated Seats} = \text{Baseline Annual Seats} + \text{Additional Seats}$$
$$\text{Simulated } S_{\text{eff}} = 0.60 \times \text{Simulated Seats} + 0.40 \times \text{Baseline Annual Completions}$$

### 4.2 Simulated Coverage Ratio & %
$$\text{Simulated Coverage Ratio} = \frac{\text{Simulated } S_{\text{eff}}}{\max(1, D_{\text{demand}})}$$
$$\text{Simulated Coverage \%} = \text{Simulated Coverage Ratio} \times 100$$

### 4.3 Simulated Physical Deficit / Surplus
$$\text{Simulated Physical Deficit} = D_{\text{demand}} - \text{Simulated } S_{\text{eff}}$$
*(positive = shortage; negative = surplus; zero = balanced)*

### 4.4 Simulated Supply Score & Net Gap Index (Phase 4.4)
$$\text{Simulated Supply Score} = \begin{cases} 
0 & \text{if Simulated } S_{\text{eff}} = 0 \\
\min\left(100, \lfloor \text{Simulated Coverage Ratio} \times \text{Demand Score} \rfloor\right) & \text{otherwise}
\end{cases}$$
$$\text{Simulated Net Gap Index} = \text{Demand Score} - \text{Simulated Supply Score}$$
*(Strictly labeled as an index score from 0–100, not a headcount).*

### 4.5 Simulated Coverage Classification (Phase 4.4 Thresholds)
- $< 50\% \rightarrow \text{CRITICAL\_SHORTAGE}$
- $50\% \text{ to } <90\% \rightarrow \text{MODERATE\_SHORTAGE}$
- $90\% \text{ to } 125\% \rightarrow \text{BALANCED}$
- $>125\% \text{ to } 200\% \rightarrow \text{MODERATE\_OVERSUPPLY}$
- $>200\% \rightarrow \text{HIGH\_OVERSUPPLY}$

### 4.6 Simulated Trainer Capacity (Phase 6 Rules)
- $\text{Simulated Required Trainers} = \text{Simulated Seats} > 0 ? \left\lceil \frac{\text{Simulated Seats}}{35} \right\rceil : \left\lceil \frac{D_{\text{demand}}}{35} \right\rceil$
- $\text{Simulated Available Trainers} = \text{Baseline Available Trainers} + \text{Additional Trainers}$
- $\text{Simulated Trainer Gap} = \text{Simulated Available Trainers} - \text{Simulated Required Trainers}$

### 4.7 Simulated Equipment Capacity (Phase 6 Domain Rules)
- **IT / Software Skills**: $\text{Simulated Required Workstations} = \left\lceil \frac{\text{Training Requirement}}{10} \right\rceil$
- **Automotive / Hardware Skills**: $\text{Simulated Required Benches} = \left\lceil \frac{\min(30, \text{Training Requirement})}{3} \right\rceil$
  where $\text{Training Requirement} = \text{Simulated Seats} > 0 ? \text{Simulated Seats} : D_{\text{demand}}$.
- $\text{Simulated Available Equipment} = \text{Baseline Available Equipment} + \text{Additional Equipment}$
- $\text{Simulated Equipment Gap} = \text{Simulated Available Equipment} - \text{Simulated Required Equipment}$

### 4.8 Simulated Execution Readiness (Phase 6 Formula)
$$\text{Trainer Readiness \%} = \min\left(100, \left\lfloor \frac{\text{Simulated Available Trainers}}{\text{Simulated Required Trainers}} \times 100 \right\rfloor\right)$$
$$\text{Equipment Readiness \%} = \min\left(100, \left\lfloor \frac{\text{Simulated Available Equipment}}{\text{Simulated Required Equipment}} \times 100 \right\rfloor\right)$$
$$\text{Simulated Readiness} = \min\left(100, \left\lfloor 0.40 \times \text{Trainer Readiness \%} + 0.40 \times \text{Equipment Readiness \%} + 0.20 \times \min(100, \text{Simulated Coverage \%}) \right\rfloor\right)$$

---

## 5. Phase 7 Integration

The simulator displays side-by-side **Baseline vs. Simulated** comparisons for each metric.
- **Labour-Market Priority**: Baseline Phase 7 Priority Score and Level remain visible as observed market priority (demand-side).
- **Resource Feasibility**: Simulated readiness and capacity gaps reflect the execution feasibility under the policy grant.

---

## 6. Live Benchmark Cases Verification

| Case | Baseline ($D, S_{\text{eff}}, CR$) | Policy Input ($\Delta \text{Seats}, \Delta \text{Trainers}, \Delta \text{Equip}$) | Simulated ($S_{\text{eff}}, CR$, Deficit) | Trainer Gap (Base $\rightarrow$ Sim) | Equipment Gap (Base $\rightarrow$ Sim) | Readiness (Base $\rightarrow$ Sim) |
|---|---|---|---|---|---|---|
| **React.js (Pune)** | $D=180, S_{\text{eff}}=0, CR=0\%$ | $+180 \text{ seats}, +6 \text{ trainers}, +18 \text{ workstations}$ | $S_{\text{eff}}=108, CR=60.00\%, +72 \text{ deficit}$ | $-6 \rightarrow 0$ | $-18 \rightarrow 0$ | $0 \rightarrow 92$ |
| **EV Battery (Pune)** | $D=108, S_{\text{eff}}=114, CR=105.56\%$ | $+0 \text{ seats}, +1 \text{ trainer}, +3 \text{ benches}$ | $S_{\text{eff}}=114, CR=105.56\%, -6 \text{ surplus}$ | $-1 \rightarrow 0$ | $-3 \rightarrow 0$ | $78 \rightarrow 100$ |
| **CAN Bus (Nashik)** | $D=40, S_{\text{eff}}=86.8, CR=217.00\%$ | $+0 \text{ seats}, +0 \text{ trainers}, +0 \text{ equip}$ | $S_{\text{eff}}=86.8, CR=217.00\%, -46.8 \text{ surplus}$ | $+2 \rightarrow +2$ | $0 \rightarrow 0$ | $95 \rightarrow 95$ |

---

## 7. Security & Data Safety

- Uses frontend Supabase client with standard anonymous RLS policies.
- No service-role keys or backend secrets exposed in frontend code.
- Persistent simulation records written to `simulations` table with `is_simulation = true`.

---

## 8. Test Suite Verification

- **Live Pipeline Suite (`scripts/test-phase8-pipeline.cjs`)**: **29 PASSED / 0 FAILED**
  - Case 1 (React.js Pune): PASSED
  - Case 2 (EV Battery Pune): PASSED
  - Case 3 (CAN Bus Nashik Oversupply): PASSED
  - Case 4 (Zero Supply): PASSED
  - Case 5 (Zero Demand Safeguard): PASSED
  - Case 6 (Baseline Immutability Audit): PASSED
- **Full Regression Suite (Phases 3–9)**: **ALL PASSED**
- **Production Build (`npm run build`)**: **Clean build in 528ms with 0 errors**
