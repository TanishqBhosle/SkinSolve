# Comprehensive Repository-Wide Debugging, Optimization, Testing, and Integration Plan for SkinSolve

## Summary
SkinSolve is an AI-powered, constraint-aware skincare recommendation and routine optimization engine with a FastAPI backend and a React/Vite/Tailwind frontend. This implementation plan resolves all bugs across data loading, parsing, constraint satisfaction, deterministic ranking, content similarity, routine optimization, evaluation benchmarks, frontend API contracts, and UX.

---

## User Review Required
> [!NOTE]
> All changes preserve the existing architecture and directory structure while significantly upgrading data cleaning, NLP extraction, deterministic ML ranking (TF-IDF + Cosine similarity), combinatorial routine optimization, evaluation metrics (Precision@K, Recall@K, NDCG@K, CSR, Completeness, Diversity, Coverage, Latency across 35+ benchmark scenarios), and frontend integration.

---

## Proposed Changes

### Component 1: Data & Data Loader (`backend/app/data/loader.py`, `data/`)
- Clean and normalize `data/products.csv`, `data/ingredients.csv`, and `data/evidence.csv`.
- In `DataLoader`:
  - Cleanly parse stringified Python lists (`skin_types`, `concerns`, `ingredients`, `evidence_tags`) into native Python lists/sets.
  - Add guaranteed boolean fields: `vegan`, `cruelty_free`, `fragrance_free`, `alcohol_free`.
  - Provide helper index structures: category index, ingredient sets, TF-IDF vectorizer matrix fitted on combined product metadata & ingredients for fast content-based cosine similarity.
  - Implement a singleton cache so dataset loading and TF-IDF matrix generation happen only once at startup.

### Component 2: Natural Language Problem Parser (`backend/app/recommendation/parser.py`)
- Enhance rule-based NLP extraction:
  - Budget parsing: Support `₹`, `rs`, `inr`, `rupees`, `k` notation (e.g. `1.5k` $\to$ 1500), "under 2000", "around 1500", "budget 1200".
  - Skin type extraction: Oily, dry, combination, sensitive, normal, acne-prone, dehydrated.
  - Multi-concern extraction: Acne, hyperpigmentation, dark spots, redness, rosacea, barrier repair, anti-aging, wrinkles, dullness, enlarged pores, oiliness.
  - Sensitivity tier extraction: Low, medium, high.
  - Preferences and exclusions: Fragrance-free, vegan, cruelty-free, alcohol-free, "no niacinamide", "avoid salicylic acid", "retinoid free", "no retinol".
  - Return structured explanation grounded in extracted entities.

### Component 3: Constraint Engine (`backend/app/recommendation/constraints.py`)
- Strictly separate hard constraints from soft preferences:
  - **Hard constraints (filters)**:
    1. Budget ceiling check during routine assembly.
    2. Explicit ingredient exclusions (searches ingredient tokens and names).
    3. Fragrance-free strict filter when requested.
    4. Owned product categories exclusion.
    5. High-sensitivity safety exclusions (harsh physical/chemical exfoliants like Glycolic Acid > 5% or strong peels).
  - **Soft preferences**:
    - Vegan, cruelty-free, brand preferences (steer scoring rather than hard-dropping if candidate pool would be empty).
  - **Active ingredient contraindication checker**:
    - Detects risky combinations (e.g. BHA + Retinoid in same session, high acid exfoliant + strong retinoid) and logs slotting separation.

### Component 4: Deterministic Multi-Objective Ranker & Content Similarity (`backend/app/recommendation/ranker.py`)
- Formula with normalized terms $\in [0, 1]$:
  $$\text{Score} = 0.30 C + 0.20 I + 0.15 S + 0.15 P + 0.10 B + 0.10 E$$
  - $C$ (Concern Match): Exact and semantic match ratio of target concerns to product concerns.
  - $I$ (Ingredient Match & Content Similarity): TF-IDF cosine similarity between user requirement profile vector and product ingredient/description vector + targeted active bonus.
  - $S$ (Skin Compatibility): Exact skin type match, combination tolerance, sensitive profile safety.
  - $P$ (Preference Match): Vegan, cruelty-free, fragrance-free adherence.
  - $B$ (Budget Fit): Price-to-category-budget ratio with smooth penalty.
  - $E$ (Evidence Score): Dermatological trial evidence level from clinical evidence database.
- Safe calculations: no division by zero, no NaN, deterministic outputs, explicit score breakdown per item.

### Component 5: Combinatorial Routine Optimizer (`backend/app/recommendation/optimizer.py`)
- Determine required categories based on owned products (Cleanser, Treatment, Moisturizer, Sunscreen).
- Knapsack / branch-and-bound optimization to find the combination of products that maximizes total routine score subject to:
  $$\sum_{p \in \text{Routine}} \text{Price}(p) \le \text{Budget}$$
- AM/PM slotting (Sunscreen in AM, heavy actives/retinoids in PM, gentle cleansers/moisturizers in AM+PM).
- Smart alternatives generation (Budget-friendly alternative saving money, Gentler alternative with higher soothing actives).
- First-class failure resolution: When budget is insufficient for all needed steps, calculate exact shortfall, recommend partial routines (e.g. Cleanser + Sunscreen essentials) or budget adjustments.

### Component 6: Evaluation Benchmark System (`evaluation/`)
- Create `evaluation/scenarios.json` and `evaluation/test_cases.csv` containing **35 comprehensive, realistic test personas** (diverse skin types, budgets, sensitivity levels, exclusions, owned products).
- Implement 4 models in `evaluation/baselines.py` and `evaluation/evaluate.py`:
  1. Popularity Baseline
  2. Content-Based Baseline
  3. Constraint-Aware Baseline
  4. SkinSolve Multi-Objective Hybrid (Ours)
- Compute real empirical metrics:
  - Precision@K
  - Recall@K
  - NDCG@K (Graded Relevance based on ground-truth compatibility)
  - Constraint Satisfaction Rate (CSR)
  - Routine Completeness Rate
  - Intra-List Diversity
  - Catalog Coverage
  - Latency (Mean, P50, P95)

### Component 7: Backend API & Error Handling (`backend/app/main.py`, `backend/app/schemas/`)
- Add structured error handler returning JSON errors in the standard format `{ "error": { "code": "...", "message": "..." } }`.
- Add `/api/v1/evaluation` endpoint to expose live evaluation metrics and scenario comparisons to the frontend.
- Standardize CORS, health checks, and API docs.
- Add `pytest.ini` and `conftest.py` so backend tests run seamlessly from repository root.

### Component 8: Frontend Polish & Contract Integration (`frontend/`)
- Standardize `API_BASE_URL` in `frontend/src/services/api.ts` to `http://localhost:8000/api/v1`.
- Update `Evaluation.tsx` to fetch live evaluation metrics from backend or display the benchmark matrix.
- Ensure all screens handle loading, empty, and error states gracefully with retry options.
- Polish UI typography, spacing, responsive layout (tested for 375px, 390px, 430px mobile viewports).

---

## Verification Plan

### Automated Tests
1. Run pytest suite:
   `py -3 -m pytest backend/tests -v`
2. Run benchmark evaluation:
   `py -3 evaluation/evaluate.py`
3. Run frontend TypeScript and build check:
   `cd frontend && npm run build`

### Manual & End-to-End Scenarios Verification
1. **Scenario A**: Oily skin, Acne, Fragrance-free, ₹1500 $\to$ Valid routine, 100% constraints satisfied.
2. **Scenario B**: Sensitive skin, Pigmentation, Fragrance-free, ₹2000 $\to$ Valid gentle routine.
3. **Scenario C**: Acne, Pigmentation, ₹200 $\to$ Constraint shortfall diagnosis with suggestions.
4. **Scenario D**: Oily skin, Acne, already owns Cleanser $\to$ Cleanser omitted from shopping cart, budget allocated to Treatment/Sunscreen/Moisturizer.
5. **Scenario E**: Natural language query with INR/₹/synonyms $\to$ Accurately parsed.
6. **Scenario F**: Active conflict check (Retinoid + BHA) $\to$ Proper slotting (AM vs PM).
