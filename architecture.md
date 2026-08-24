# SkinSolve — System Architecture & High-Level Design

## 1. Overview
SkinSolve is an AI-powered, constraint-aware skincare recommendation and routine-optimization platform. Unlike traditional similarity recommenders or generic LLM chatbots, SkinSolve solves the combinatorial optimization problem of constructing the **smallest coherent skincare routine** under user-specific constraints (budget ceiling, sensitivity profile, contraindications, fragrance preferences, and existing inventory).

---

## 2. Multi-Tier Architecture

```
+---------------------------------------------------------------------------------------+
|                                  PRESENTATION TIER                                    |
|  - React 18 + Vite + TypeScript                                                       |
|  - Tailwind CSS + Botanical Sage Design System                                        |
|  - Guided Onboarding Questionnaire & Natural Language Problem Input                   |
|  - Interactive AM/PM Routine Dashboard with Score Breakdown & Alternatives             |
|  - First-Class Constraint Conflict Resolution Flow                                    |
+-------------------------------------------+-------------------------------------------+
                                            | REST JSON APIs
                                            v
+---------------------------------------------------------------------------------------+
|                                    APPLICATION TIER                                   |
|  - FastAPI (Python 3.10+)                                                             |
|  - Pydantic v2 Schema Validation                                                      |
|  - Endpoints: /parse-problem, /recommendations, /products, /evaluate, /health         |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            v
+---------------------------------------------------------------------------------------+
|                               RECOMMENDATION ENGINE                                   |
|  1. Problem Parser & Entity Normalizer                                                |
|  2. Candidate Generation & Compatibility Filter                                       |
|  3. Hard Constraint Validator (Budget, Fragrance, Ingredient Exclusions)             |
|  4. Multi-Objective Ranker (Weighted Multi-Factor Scoring)                            |
|  5. Routine Optimizer (Combinatorial Minimal Coherent Routine Builder)                |
|  6. Explanation & Alternative Generation Engine                                       |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            v
+---------------------------------------------------------------------------------------+
|                                       DATA TIER                                       |
|  - Structured CSV Stores: products.csv, ingredients.csv, evidence.csv                 |
|  - Indexed In-Memory Repository with fast lookup & constraint filtering               |
+---------------------------------------------------------------------------------------+
```

---

## 3. Recommendation Pipeline

```
[User Problem / Input]
         |
         v
[Problem Parser] --------> Normalizes skin type, concerns, sensitivity, budget, preferences
         |
         v
[Candidate Filter] ------> Discards incompatible products (e.g. non-matching skin suitability)
         |
         v
[Constraint Engine] -----> Enforces hard constraints:
                           - Total budget ceiling (sum(products) <= budget)
                           - Fragrance-free flag enforcement
                           - Excluded ingredients rejection
                           - Category exclusion for existing products
         |
         v
[Multi-Objective Ranker] -> Computes composite score:
                           * Concern Match:      30%
                           * Ingredient Match:   20%
                           * Skin Compatibility: 15%
                           * Preference Match:   15%
                           * Budget Fit:         10%
                           * Evidence Score:     10%
         |
         v
[Routine Optimizer] -----> Selects minimal essential routine across core steps:
                           - AM: Cleanser -> Treatment -> Moisturizer -> Sunscreen
                           - PM: Cleanser -> Treatment -> Moisturizer
                           - Avoids cross-product active ingredient conflicts (e.g., AHA/BHA + Retinoid)
         |
         v
[Explanation Engine] ----> Generates why-recommended bullets, score breakdown, and alternatives
```

---

## 4. Scoring Formula

For a product $p$ and user profile $u$:

$$\text{FinalScore}(p, u) = 0.30 \cdot S_{\text{concern}} + 0.20 \cdot S_{\text{ingredient}} + 0.15 \cdot S_{\text{skin}} + 0.15 \cdot S_{\text{preference}} + 0.10 \cdot S_{\text{budget}} + 0.10 \cdot S_{\text{evidence}}$$
