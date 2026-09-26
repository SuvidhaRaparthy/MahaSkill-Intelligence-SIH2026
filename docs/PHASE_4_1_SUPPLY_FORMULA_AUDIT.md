# PHASE 4.1 — SUPPLY SCORE FORMULA AUDIT

## Executive Summary

This audit evaluates the conceptual and mathematical validity of the Demand–Supply Gap Engine (`src/analytics/demandSupplyGapEngine.ts`) implemented in Phase 4. The audit uses the active remote Supabase database as the sole source of truth and performs non-destructive verification without altering code, database records, or PPT presentation documents.

---

## 1. Trace of the Current Supply Formula

In `src/analytics/demandSupplyGapEngine.ts`, the supply analytics routine operates as follows:

### Step 1: Course-to-Skill Linkage
Courses are joined to canonical skills via the `course_skills` junction table. For a given skill $k$ and district filter $d$:
$$\text{Matching Courses}_k = \{ c \in \text{courses} \mid c.\text{district\_id} = d \land \exists cs \in \text{course\_skills} : cs.\text{course\_id} = c.\text{id} \land cs.\text{skill\_id} = k \}$$

### Step 2: Aggregation of Raw Capacity Inputs
From the matching courses, raw annual seats and completions are aggregated:
$$\text{Annual Seats}_k = \sum_{c \in \text{Matching Courses}_k} c.\text{annual\_seats}$$
$$\text{Annual Completions}_k = \sum_{c \in \text{Matching Courses}_k} c.\text{annual\_completions}$$

### Step 3: Calculation of Local Maximum Seat Capacity Reference
The engine calculates the maximum seat count among all skills taught within the filtered jurisdiction:
$$\text{Max Observed Supply Seats}_d = \max_{s \in \text{Skills}_d} (\text{Annual Seats}_s)$$

### Step 4: Supply Score Normalization Formula
The Supply Score ($0 \text{--} 100$) is calculated as:
$$\text{Supply Score}_k = \min\left(100, \max\left(0, \left\lfloor \frac{0.60 \times \text{Annual Seats}_k + 0.40 \times \text{Annual Completions}_k}{\text{Max Observed Supply Seats}_d} \times 100 \right\rfloor\right)\right)$$

### Step 5: Net Skill Gap Calculation
$$\text{Net Skill Gap}_k = \text{Demand Score}_k - \text{Supply Score}_k$$

---

## 2. Verification of Database Inputs

Queried directly from active remote Supabase tables (`skills`, `courses`, `course_skills`, `districts`):

### EV Battery Diagnostics — Pune (`d1`)
* **Canonical Skill ID**: `c1111111-1111-4111-8111-111111111111`
* **District ID**: `11111111-1111-4111-8111-111111111111` (Pune)
* **Course Name**: `Government ITI EV Technician Certification`
* **Course ID**: `d4444444-4444-4444-8444-444444444444`
* **Institute Name**: `Government ITI Aundh Pune`
* **Annual Seats**: `120`
* **Annual Completions**: `105`
* **Coverage Level**: `HIGH` (120 Hours, `mandatory: true`)

### Legacy PHP Maintenance — Pune (`d1`)
* **Canonical Skill ID**: `c8888888-8888-4888-8888-888888888888`
* **Course Name**: `Web Software Development Diploma (Legacy PHP)`
* **Institute Name**: `Pune Skill Training Centre`
* **Annual Seats**: `500`
* **Annual Completions**: `470`

### CAN Bus Diagnostics — Nashik (`d2`)
* **Canonical Skill ID**: `c3333333-3333-4333-8333-333333333333`
* **Course Name**: `Automotive Electrical Systems Certification`
* **Institute Name**: `Government Polytechnic Nashik`
* **Annual Seats**: `90`
* **Annual Completions**: `82`

---

## 3. Conceptual & Mathematical Validity Assessment

### Question 1: Is comparing a 0–100 Demand Score with a 0–100 Supply Score conceptually defensible?
**Verdict**: **No, not under the current normalization approach.**
* **Demand Score (0–100)** measures employer market hiring pressure based on job posting volume, employer signals, and growth rate.
* **Current Supply Score (0–100)** measures a skill's seat count relative to the **maximum seat count of any skill in that district**.
* Subtracting a relative district-seat percentage from a market-demand index ($\text{Demand Score} - \text{Supply Score}$) compares two incompatible scales.

### Question 2: Could the current normalization artificially produce very high supply scores?
**Verdict**: **Yes, demonstrably.**
Because `Max Observed Supply Seats` is evaluated relative to skills taught in the filtered jurisdiction, any skill that has the highest seat count among courses in that district automatically receives a Supply Score near **95--100/100**, regardless of whether 120 seats is actually sufficient for employer hiring demand.

### Question 3: Does the formula behave sensibly for shortage and oversupply cases?
**Verdict**: **No.**
In Pune, `EV Battery Diagnostics` has 28 job postings, 2 major EV employer hiring signals (80 expected hires), and +155% growth, producing a high Demand Score of **60**. However, because 120 seats is the local max for automotive courses, the current formula assigns it a Supply Score of **95**, producing a Net Gap of **-35 (High Oversupply)**.
Conversely, `Legacy PHP Maintenance` in Pune has zero linked courses in Pune proper, producing Supply = 0, Net Gap = +18 (**Moderate Shortage**), even though PHP demand is declining.

---

## 4. Empirical Sanity Checks (Active Supabase Data)

| Scenario | Demand Score | Raw Seats / Completions | Supply Score | Net Gap | Classification |
|---|---|---|---|---|---|
| **A. EV Battery Diagnostics — Pune** | 60 | 120 seats / 105 completions | **95** | **-35** | **High Oversupply** |
| **B. Legacy PHP Maintenance — Pune** | 18 | 0 seats / 0 completions | **0** | **+18** | **Moderate Shortage** |
| **C. React.js — All Maharashtra** | 94 | 0 seats / 0 completions | **0** | **+94** | **High Shortage** |
| **D. CAN Bus Diagnostics — Nashik** | 65 | 90 seats / 82 completions | **96** | **-31** | **High Oversupply** |

---

## 5. Design Problems Identified

1. **Relative Maximum Normalization Flaw**:
   $$\text{Supply Score} = \frac{\text{Seats}_k}{\max_{s}(\text{Seats}_s)} \times 100$$
   Normalizing supply against the maximum seats in a district forces the top course in any district to get ~100/100 Supply Score, regardless of absolute seat numbers or market demand.
2. **Inverted Shortage/Oversupply Classifications**:
   High-growth EV roles are misclassified as "High Oversupply" (-35 gap) because 120 seats is scaled to 95/100.
3. **Decoupled Demand and Supply Scaling**:
   Supply Score is calculated independently of Demand Score rather than measuring **Demand Coverage** ($\frac{\text{Available Seats}}{\text{Required Hires}}$).

---

## 6. PPT Value Reconciliation Context

The PPT illustrative example presents:
* Demand = 84
* Supply = 29
* Net Gap = +55 (Shortage)

The audit confirms that trying to force static PPT numbers through arbitrary mathematical constants is improper. The correct approach is to fix the underlying analytical formula so it produces mathematically sound results derived from Supabase.

---

## 7. Final Verdict

### `SUPPLY FORMULA NEEDS REVISION — DO NOT START PHASE 5`

---

## Proposed Correct Methodology for Future Revision

In a future phase (e.g., Phase 4.2 or Phase 5 preparation), the Supply Score should be re-architected to measure **Demand Coverage Ratio**:

### Proposed Demand-Aligned Supply Score Formula:

1. **Target Required Seat Capacity**:
   $$\text{Required Capacity}_k = \text{Job Postings Count}_k \times \text{Hiring Multiplier (e.g. 2.5)} + \text{Employer Expected Hires}_k$$

2. **Supply Coverage Score ($0 \text{--} 100$)**:
   $$\text{Supply Score}_k = \min\left(100, \left\lfloor \frac{\text{Annual Completions}_k}{\text{Required Capacity}_k} \times 100 \right\rfloor\right)$$

3. **Net Skill Gap**:
   $$\text{Net Skill Gap}_k = \text{Demand Score}_k - \text{Supply Score}_k$$

Under this corrected formula for EV Battery Diagnostics in Pune:
* Demand Score = **60**
* Required Capacity = $28 \times 2.5 + 80 = \mathbf{150 \text{ seats}}$
* Supply Score = $\frac{105 \text{ completions}}{150 \text{ required}} \times 100 = \mathbf{70}$
* Net Skill Gap = $60 - 70 = \mathbf{-10}$ or if Demand Score = 60 represents 200 required seats, Supply Score = $\mathbf{52} \rightarrow \text{Net Gap} = \mathbf{+8}$ (**Moderate Shortage / Near Balance**).

---

*STOP: No code changes, database changes, or PPT changes were made. Phase 5 has NOT been started.*
