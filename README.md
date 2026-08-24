# SkinSolve — AI-Powered Personalized Skincare Intelligence Platform

SkinSolve is a production-quality, SaaS-level skincare recommendation platform. Rather than acting as a simple catalog search or generic LLM wrapper, SkinSolve solves the combinatorial constraint optimization problem of building the **smallest coherent skincare routine** under user-specific constraints (budget ceiling, sensitivity profile, contraindications, fragrance restrictions, and existing inventory).

---

## 🌟 Key Features

1. **Deterministic Multi-Objective Scoring**:
   - Concern Match: 30%
   - Ingredient Match: 20%
   - Skin Compatibility: 15%
   - Preference Match: 15%
   - Budget Fit: 10%
   - Clinical Evidence Tier: 10%
2. **Strict Hard Constraints Engine**:
   - Guaranteed routine total cost $\le$ User budget ceiling.
   - Fragrance-free and allergen filtering.
   - Active ingredient contraindication check (e.g. BHA + Retinoid overlap prevention).
   - Category deduplication against existing user products.
3. **Smallest Coherent Routine Construction**:
   - Structured AM (Cleanser $\to$ Treatment $\to$ Moisturizer $\to$ Sunscreen) and PM routines.
   - Transparent why-recommended bullet points and 6-factor score breakdowns.
   - Intelligent trade-off alternatives (Budget Alternative vs Gentler Formulation).
4. **First-Class Failure Resolution**:
   - Calculates exact budget shortfalls (e.g. $+₹45$ gap) and suggests actionable relaxation paths.
5. **Natural Language Parser**:
   - Parses unstructured complaints into structured attributes with user-editable review.
6. **Empirical Evaluation Benchmark**:
   - Rigorous evaluation against Popularity and Content-Based baselines across Constraint Satisfaction Rate (CSR), Completeness, and Latency.

---

## 🚀 Quick Start

### 1. Start the Backend API (FastAPI)
```powershell
$env:PYTHONPATH="backend"
py -3 -m uvicorn app.main:app --reload --port 8000
```
API Documentation will be live at `http://localhost:8000/docs`.

### 2. Start the Frontend (React + Vite)
```powershell
cd frontend
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Testing & Evaluation

### Backend Tests:
```powershell
$env:PYTHONPATH="backend"
py -3 -m pytest backend/tests -v
```

### Run Benchmarks:
```powershell
py -3 evaluation/evaluate.py
```
