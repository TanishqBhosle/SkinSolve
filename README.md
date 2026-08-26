# SkinSolve — AI-Powered Constraint-Aware Skincare Recommendation & Routine Optimization Platform

SkinSolve is a production-quality skincare recommendation and routine optimization engine. Rather than acting as a simple catalog search or generic LLM wrapper, SkinSolve formulates routine design as a **combinatorial multi-objective constraint satisfaction problem** to construct the **smallest coherent skincare routine** under user-specific constraints (strict budget ceilings, ingredient sensitivities, contraindications, fragrance restrictions, and existing product inventory).

---

## 🌟 Key Architectural Features

1. **Deterministic Multi-Objective Scoring**:
   $$\text{Score} = 0.30 C + 0.20 I + 0.15 S + 0.15 P + 0.10 B + 0.10 E$$
   - **Concern Match (30%)**: Exact and semantic intersection of target goals (acne, hyperpigmentation, redness, barrier repair, anti-aging, etc.).
   - **Ingredient & Content Match (20%)**: Precomputed TF-IDF Cosine Similarity vector matrix combined with clinical active ingredient targeting.
   - **Skin Compatibility (15%)**: pH balance and vehicle suitability for oily, dry, combination, sensitive, and normal skin profiles.
   - **Preference Match (15%)**: Adherence to fragrance-free, vegan, and cruelty-free standards.
   - **Budget Ratio Fit (10%)**: Monotonic penalty function aligned with per-category allocation.
   - **Clinical Evidence Score (10%)**: Grounded trial-backed efficacy scoring from dermatological databases.

2. **Strict Hard Constraints Engine**:
   - **Budget Ceiling**: Guaranteed routine total cost $\le$ User budget ceiling.
   - **Ingredient Exclusions**: Strict filtering against normalized chemical lists and synonyms (e.g. `No Niacinamide`, `Avoid Salicylic Acid`, `Retinoid-Free`).
   - **Fragrance-Free Guarantee**: Hypoallergenic filtering for reactive profiles.
   - **Active Ingredient Safety Matrix**: Automated detection of contraindications (e.g. separating BHA + Retinoid into alternate AM/PM slots).
   - **Inventory Deduplication**: Omits categories the user already owns to focus the budget on hero treatments.

3. **Smallest Coherent Routine Construction**:
   - Optimal AM (Cleanser $\to$ Treatment $\to$ Moisturizer $\to$ Sunscreen) and PM schedules.
   - Transparent why-recommended bullet points and 6-factor score breakdowns.
   - Intelligent trade-off alternatives (Budget-Friendly Alternative vs Gentler Formulation).

4. **First-Class Failure Resolution**:
   - Calculates exact budget shortfalls (e.g. $+₹80$ gap) and suggests actionable relaxation paths.

5. **Empirical Benchmark Evaluation**:
   - Evaluated across 35 realistic synthetic personas against 3 competitive baseline architectures.

---

## 📊 Empirical Evaluation Benchmark Results

Tested on **42 diverse benchmark scenarios** against a curated **273-product catalog**:

| Model Architecture | Precision@4 | Recall@4 | NDCG@4 | CSR (%) | Completeness (%) | Coverage (%) | Avg Latency (ms) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Popularity Baseline** | 0.452 | 0.123 | 0.311 | 0.0% | 4.8% | 1.5% | 3.95 ms |
| **Content-Based Baseline** | 0.917 | 0.250 | 0.823 | 14.3% | 4.8% | 13.9% | 8.14 ms |
| **Constraint-Aware Baseline** | 0.710 | 0.178 | 0.463 | 0.0% | 100.0% | 2.6% | 14.68 ms |
| **SkinSolve Multi-Objective (Ours)** | **0.929** | **0.232** | **0.836** | **100.0%** | **100.0%** | **8.8%** | **217.50 ms** |

- **CSR (Constraint Satisfaction Rate)**: 100.0% adherence to all budget ceilings and hard exclusions.
- **Routine Completeness**: 100.0% coverage of required 4-step AM/PM slots.
- **NDCG@4**: 0.836 graded clinical suitability against the ideal theoretical ceiling.
- **Latency**: Sub-250ms deterministic execution.

---

## 🚀 Quick Start Guide

### 1. Start the Backend API (FastAPI)
```powershell
# From the repository root
py -3 -m uvicorn app.main:app --app-dir backend --reload --port 8000
```
Interactive OpenAPI Swagger docs will be live at `http://localhost:8000/docs`.

### 2. Start the Frontend (React + Vite + Tailwind)
```powershell
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Testing & Verification

### Run Backend Unit Tests (pytest):
```powershell
py -3 -m pytest backend/tests -v
```

### Run Benchmark Evaluation:
```powershell
py -3 evaluation/evaluate.py
```

### Run Phase 25 Verification Scenarios:
```powershell
py -3 scratch/verify_scenarios.py
```

### Build Frontend:
```powershell
cd frontend
npm run build
```
