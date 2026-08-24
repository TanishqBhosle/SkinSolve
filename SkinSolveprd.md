# SkinSolve — Product Requirements Document

**Version:** 1.0  
**Status:** MVP  
**Domain:** Beauty / Personalized Skincare  
**Target Delivery:** 48 Hours  
**Primary Platform:** Web Application (Streamlit)  
**Deployment:** Streamlit Community Cloud

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [Product Vision & Goals](#product-vision--goals)
4. [Target Users](#target-users)
5. [Functional Requirements](#functional-requirements)
6. [Recommendation Architecture](#recommendation-architecture)
7. [Technical Specification](#technical-specification)
8. [Data Strategy](#data-strategy)
9. [User Interface](#user-interface)
10. [Evaluation & Success Criteria](#evaluation--success-criteria)
11. [Implementation Plan](#implementation-plan)
12. [Appendix](#appendix)

---

## Executive Summary

**SkinSolve** is an AI-assisted, constraint-aware skincare recommendation engine that converts a user's problem, goals, and constraints into an **optimized personalized routine**.

**Traditional systems:**
```
User → Preferences → Products
```

**SkinSolve approach:**
```
User Problem → Goals & Constraints → Candidate Solutions → Ranking → Optimized Routine
```

### Key Innovation

> **Recommendation as problem-solving and optimization, not product similarity.**

The system treats skincare recommendation as a constrained decision problem where users have multiple simultaneous concerns (acne, oiliness, sensitivity), preferences (fragrance-free), and budget limitations. Rather than recommend independent products, SkinSolve generates a coherent routine that minimizes redundancy while maximizing problem-solving benefit.

### Sample Input → Output

**User Input:**
> "I have oily skin, acne, sensitive skin, I avoid fragrance, and my budget is ₹1,500."

**System Output:**
```
Morning Routine:
  1. Salicylic Acid Cleanser
  2. Niacinamide Serum
  3. Lightweight Moisturizer
  4. Sunscreen (SPF 30)

Evening Routine:
  1. Oil Cleanser
  2. Salicylic Acid Cleanser
  3. Niacinamide Serum
  4. Lightweight Moisturizer

Total Cost: ₹1,485 (within budget)
Confidence: 87%
```

---

## Problem Statement

### Current Gap

Most skincare recommendation systems are built around:
- Product similarity
- Popularity/ratings
- Historical user behavior

These approaches **fail to answer:**
> "Given my specific problem, constraints, budget, preferences and existing routine, what combination of products should I use?"

### Why This Matters

Skincare is inherently multi-objective:
- Multiple simultaneous skin concerns (acne, oiliness, sensitivity, pigmentation)
- Hard constraints (budget, fragrance-free requirement, ingredient restrictions)
- Existing products that must be considered
- Minimum effective routine (avoid overloading with unnecessary products)

A single product recommendation is insufficient. Users need guidance on **routine compatibility and completeness**.

### Problem Definition (Mathematical)

Given:
- User profile (U): skin type, concerns, sensitivity, preferences
- Desired outcomes (G): problem resolution targets
- Constraints (C): budget, ingredient restrictions, existing products
- Product catalog (P): available products with metadata
- Ingredient knowledge (K): ingredient-function relationships

Generate a routine (R) such that:

```
R* = argmax_R Utility(R, U, G, C, K)
```

Subject to:
```
Budget(R) ≤ B
Compatibility(R) = 1
ConstraintViolations(R) = 0
Minimize |R| (prefer smaller routines)
```

---

## Product Vision & Goals

### Vision Statement

> **Make skincare recommendations problem-solving, personalized, explainable, and constraint-aware.**

Instead of asking: *"Which product should I buy?"*  
Users should answer: *"What is the smallest compatible routine that best addresses my goals within my constraints?"*

### Primary Goals

1. ✅ Build a functional constraint-aware recommendation engine
2. ✅ Convert natural language requirements into structured inputs
3. ✅ Generate relevant product candidates
4. ✅ Apply hard constraints (budget, preferences, incompatibilities)
5. ✅ Rank products using multi-objective scoring
6. ✅ Construct coherent skincare routines
7. ✅ Provide transparent recommendation explanations
8. ✅ Handle impossible/conflicting requirements gracefully
9. ✅ Evaluate recommendation quality quantitatively
10. ✅ Deploy interactive web application
11. ✅ Provide reproducible GitHub repository & documentation

### Secondary Goals

- Demonstrate recommendation-system fundamentals
- Demonstrate optimization and constraint handling
- Demonstrate explainable AI principles
- Create architecture for future image-based skin analysis integration

### Explicit Non-Goals

The MVP will **NOT**:
- Diagnose skin diseases or medical conditions
- Provide clinical treatment advice
- Replace a dermatologist
- Train proprietary skin-analysis models
- Build mobile applications
- Implement large-scale production infrastructure
- Real-time web scraping
- Guarantee skincare outcomes

*These are candidates for Phase 2+.*

---

## Target Users

### Primary User Persona

**"Skincare Consumer with Multiple Constraints"**

A user who:
- Has one or more skin concerns (acne, oiliness, sensitivity, etc.)
- Struggles to select compatible products
- Has a defined budget
- May have ingredient preferences (fragrance-free, etc.)
- May already own skincare products
- Wants personalized, not generic, recommendations
- Values understanding *why* products are recommended

### Secondary User Persona

**"Technical Evaluator"**

A reviewer assessing:
- Recommendation quality and correctness
- System architecture and design decisions
- Explainability and transparency
- Evaluation methodology
- Engineering quality

### User Scenarios

#### Scenario A — Problem-Focused Beginner
> "I have acne and oily skin. I don't know what products to buy."

**Needs:**
- Simple routine (minimal products)
- Clear explanations
- Budget-friendly options

**Expected:** Focused acne/oil-control routine with 4–6 products

---

#### Scenario B — Constraint-Driven User
> "I have sensitive skin, avoid fragrance, and have a ₹1,500 budget."

**Needs:**
- Strong constraint handling
- Affordable recommendations
- Ingredient filtering

**Expected:** Routine respecting all constraints, possibly with trade-offs explained

---

#### Scenario C — Existing Routine User
> "I already have a cleanser and moisturizer. What else do I need?"

**Needs:**
- Awareness of existing products
- Avoid duplicate categories
- Routine completion suggestions

**Expected:** Recommendations complementing existing products

---

#### Scenario D — Impossible Constraints
> "Acne + pigmentation + sensitive + fragrance-free + ₹200 budget"

**Needs:**
- Graceful failure handling
- Clear conflict explanation
- Feasible alternatives

**Expected:** Explanation of conflicts + closest feasible solution

---

## Functional Requirements

### FR-01: User Profile Capture

Users must be able to provide:

| Field | Type | Options |
|-------|------|---------|
| **Skin Type** | Selection | Dry, Oily, Combination, Normal |
| **Skin Concerns** | Multi-select | Acne, Oiliness, Dryness, Pigmentation, Dullness, Uneven Texture, Redness |
| **Sensitivity Level** | Selection | Low, Medium, High |
| **Budget** | Numeric | ₹100 – ₹5,000+ |
| **Fragrance Preference** | Boolean | Fragrance-Free / Allow Fragrance |
| **Existing Products** | Text | Optional; product names/categories |
| **Additional Notes** | Text | Optional; free-form preferences |

### FR-02: Natural Language Input (Optional)

System should support free-text problem description:

**Example:**
> "I have oily skin with acne and sensitive skin. I avoid fragrance and have a budget of ₹1500."

**Conversion:** Parsed into structured profile

```json
{
  "skin_type": "oily",
  "concerns": ["acne"],
  "sensitivity": "high",
  "fragrance_free": true,
  "budget": 1500
}
```

### FR-03: Recommendation Workflow

The system shall:

1. **Understand** the user problem (parse inputs)
2. **Generate** candidate products (recall-focused)
3. **Filter** by hard constraints (budget, preferences)
4. **Rank** candidates using multi-objective scoring
5. **Optimize** into a coherent routine
6. **Explain** each recommendation
7. **Present** results with confidence and alternatives

### FR-04: Constraint Engine

The system shall enforce hard constraints:

- **Budget limit:** `Cost(routine) ≤ User Budget`
- **Fragrance-free:** Reject all fragrant products if user requires fragrance-free
- **Ingredient restrictions:** Block products containing excluded ingredients
- **Skin type compatibility:** Prioritize products matched to user's skin type
- **Existing products:** Avoid duplicate categories in recommendations

### FR-05: Recommendation Scoring

Products ranked using multi-objective function:

```
Score(p, u) = w_c·C + w_i·I + w_s·S + w_p·P + w_b·B + w_e·E
```

| Signal | Weight | Description |
|--------|--------|-------------|
| **Concern Match (C)** | 30% | How well product targets user's concerns |
| **Ingredient Match (I)** | 20% | Relevance of product ingredients to goals |
| **Skin Compatibility (S)** | 15% | Match between product and user's skin type |
| **Preference Match (P)** | 15% | Fragrance-free, brand preferences, etc. |
| **Budget Fit (B)** | 10% | Value relative to user's budget |
| **Evidence Score (E)** | 10% | Clinical/ingredient evidence strength |

*Note: Weights are engineered for MVP and validated experimentally, not universally optimal.*

### FR-06: Routine Optimization

System shall construct routines with:

1. **Category coverage:** Cleanser, Treatment, Moisturizer, Sunscreen (at minimum)
2. **Product synergy:** Avoid incompatible ingredients
3. **Minimize redundancy:** Don't recommend 3 acne products if 1–2 suffice
4. **Budget optimization:** Fit within budget while maximizing benefit
5. **Complexity control:** Prefer simpler routines when trade-offs are minimal

**Output structure:**

```
Morning Routine:
  1. [Cleanser]
  2. [Treatment/Serum] (optional)
  3. [Moisturizer]
  4. [Sunscreen] (recommended)

Evening Routine:
  1. [Cleanser] (optional: oil + water cleanser)
  2. [Treatment/Serum]
  3. [Moisturizer]
```

### FR-07: Explainability

Each recommendation shall include:

**Product Card:**
```
Product Name — XX% Match Score

Why Recommended:
• Targets [specific concern]
• Compatible with [skin type]
• Satisfies [constraint: fragrance-free]
• Fits within [remaining budget]
• Complements [other products in routine]

Score Breakdown:
  Concern Match:       25/30
  Ingredient Match:    18/20
  Skin Compatibility:  14/15
  Preference Match:    12/15
  Budget Fit:           9/10
  Evidence Score:       9/10
  ─────────────────────────
  TOTAL:               87/100
```

### FR-08: Failure Handling

When no complete solution exists:

```
⚠️  No complete routine satisfies all constraints.

Closest Solution (₹245 | 87% constraint satisfaction)
─────────────────────────────────────────────────────
Primary Conflict:  Budget Limit

Details:
  • Your budget: ₹200
  • Minimum recommended spend: ₹245
  • Shortfall: ₹45

Alternative Options:
  1. Increase budget by ₹45 → full routine
  2. Reduce concerns (e.g., skip pigmentation) → ₹180
  3. Accept 2-product routine only → ₹195
```

---

## Recommendation Architecture

### System Components

```
┌─────────────────────────────────┐
│      User Input (Natural)       │
└────────────────┬────────────────┘
                 │
    ┌────────────▼────────────┐
    │   Problem Parser        │  (Parse language + structure inputs)
    └────────────┬────────────┘
                 │
    ┌────────────▼────────────┐
    │  User Profile Model     │  (Structured representation)
    └────────────┬────────────┘
                 │
    ┌────────────▼────────────┐
    │ Candidate Generation    │  (Recall: broad set of candidates)
    └────────────┬────────────┘
                 │
    ┌────────────▼────────────┐
    │  Constraint Engine      │  (Filter by hard constraints)
    └────────────┬────────────┘
                 │
    ┌────────────▼────────────┐
    │ Multi-Objective Ranker  │  (Score & rank candidates)
    └────────────┬────────────┘
                 │
    ┌────────────▼────────────┐
    │ Routine Optimizer       │  (Construct coherent routine)
    └────────────┬────────────┘
                 │
    ┌────────────▼────────────┐
    │ Explanation Engine      │  (Generate explanations)
    └────────────┬────────────┘
                 │
    ┌────────────▼────────────┐
    │   Personalized          │
    │   Recommendation        │
    └─────────────────────────┘
```

### Component Responsibilities

#### 1. Problem Parser
- Accepts free-text input (optional)
- Extracts structured features
- Validates completeness
- Requests missing information if needed

#### 2. User Profile Model
- Represents user as structured object
- Normalizes inputs
- Identifies explicit and inferred preferences
- Manages constraints

#### 3. Candidate Generation
- Retrieves products matching user concerns
- Matches by skin type
- Prioritizes recall (broad set)
- Example: "oily + acne" → 15–25 candidates

#### 4. Constraint Engine
- Applies hard filters (budget, fragrance, ingredients)
- Removes incompatible products
- Tracks constraint violations
- Provides feedback on conflicts

#### 5. Multi-Objective Ranker
- Scores each candidate
- Computes weighted feature scores
- Produces ranked list
- Tracks score components

#### 6. Routine Optimizer
- Selects products for coherent routine
- Ensures category coverage
- Minimizes redundancy
- Optimizes for budget and complexity
- Outputs morning/evening routines

#### 7. Explanation Engine
- Generates "why recommended" text
- Explains score breakdown
- Optionally explains rejections
- Handles failure cases

---

## Technical Specification

### Technology Stack

| Layer | Technology |
|-------|------------|
| **Programming Language** | Python 3.9+ |
| **UI Framework** | Streamlit |
| **Data Processing** | Pandas, NumPy |
| **Recommendation** | Scikit-learn |
| **Storage** | CSV / SQLite |
| **Visualization** | Plotly, Matplotlib |
| **Version Control** | Git / GitHub |
| **Deployment** | Streamlit Community Cloud |
| **Optional: NLP** | Claude API (for parsing) |

### Repository Structure

```
skinsolve/
├── README.md                          # Setup, usage, architecture
├── requirements.txt                   # Python dependencies
├── .gitignore
│
├── app.py                             # Streamlit UI entry point
│
├── src/
│   ├── __init__.py
│   ├── data_loader.py                 # Load products, ingredients
│   ├── preprocessing.py               # Normalize data
│   ├── problem_parser.py              # Parse user input
│   ├── candidate_generator.py         # Generate candidates
│   ├── constraint_engine.py           # Apply constraints
│   ├── ranker.py                      # Score & rank
│   ├── routine_optimizer.py           # Construct routines
│   └── explanation_engine.py          # Generate explanations
│
├── data/
│   ├── products.csv                   # 150–300 products
│   ├── ingredients.csv                # 50–100 ingredients
│   └── evidence.csv                   # Evidence mappings
│
├── evaluation/
│   ├── test_cases.csv                 # 20–50 test scenarios
│   └── evaluate.py                    # Run evaluation
│
├── tests/
│   ├── test_parser.py
│   ├── test_constraints.py
│   ├── test_ranker.py
│   └── test_routine.py
│
└── docs/
    └── architecture.md                # Architecture diagram
```

### Data Schemas

#### Products Dataset

| Field | Type | Example |
|-------|------|---------|
| `product_id` | String | `P001` |
| `name` | String | `Salicylic Acid Cleanser` |
| `brand` | String | `Clearskin` |
| `category` | String | `Cleanser \| Serum \| Moisturizer \| Sunscreen` |
| `price` | Float | `450.00` |
| `skin_types` | List | `["oily", "combination"]` |
| `concerns` | List | `["acne", "oiliness"]` |
| `ingredients` | List | `["salicylic acid", "niacinamide"]` |
| `fragrance_free` | Boolean | `true` |
| `alcohol_free` | Boolean | `false` |
| `rating` | Float | `4.3` |
| `description` | String | `"2% salicylic acid for acne control"` |
| `evidence_tags` | List | `["clinically_tested", "dermatologist_approved"]` |

#### Ingredients Dataset

| Field | Type | Example |
|-------|------|---------|
| `ingredient` | String | `Salicylic Acid` |
| `functions` | List | `["exfoliant", "acne_treatment"]` |
| `concerns_addressed` | List | `["acne", "oiliness"]` |
| `skin_types` | List | `["oily", "combination"]` |
| `evidence_level` | String | `"strong" \| "moderate" \| "light"` |
| `source` | String | `"Cosmetic Ingredient Review"` |
| `notes` | String | `"BHA; keratolytic"` |

#### Evaluation Dataset

| Case | Skin | Concerns | Sensitivity | Budget | Expected Output |
|------|------|----------|-------------|--------|-----------------|
| `01` | oily | acne | high | 1500 | Acne/oil-control routine |
| `02` | dry | dryness | high | 2000 | Hydration routine |
| `03` | combination | pigmentation | medium | 2500 | Pigmentation-focused routine |
| `04` | oily | acne | low | 1000 | Budget acne routine |
| `05` | combination | multiple | high | 200 | Graceful failure |

---

## Data Strategy

### Data Sources

The MVP does not require large user-interaction datasets. Instead:

| Component | Size | Source |
|-----------|------|--------|
| **Product Catalog** | 150–300 products | Manual curation + public beauty datasets |
| **Ingredient Knowledge Base** | 50–100 ingredients | Cosmetic ingredient databases |
| **Evaluation Test Cases** | 20–50 scenarios | Domain expertise + manual design |

### Data Quality

- Product metadata is normalized and validated
- Ingredient-function mappings are evidence-based (simplified for MVP)
- Product prices represent reference values (not real-time)
- User-provided information assumed accurate
- Evaluation labels based on predefined relevance criteria

### Cold-Start Strategy

The system operates primarily in a **cold-start environment** (no historical user behavior). Recommendation relies on:
- Content-based features (product metadata, ingredients)
- Domain knowledge (ingredient-concern mappings)
- User-provided constraints

---

## User Interface

### Input Page

**Purpose:** Gather user requirements

**Elements:**
- Natural-language problem input (optional, expandable)
- Skin type selector (radio buttons)
- Skin concerns (multi-select checkboxes)
- Sensitivity level (dropdown)
- Budget slider (₹100–₹5,000)
- Fragrance preference (toggle)
- Existing products (text input, optional)
- "Get Recommendations" button

**Validation:**
- At least one concern required
- Budget >= ₹100
- Clear error messages for missing fields

---

### Results Page

**Purpose:** Present recommendations and explanations

**Sections:**

#### 1. Summary Card
```
✅ Recommendation Found

Match Score:        87%
Total Cost:         ₹1,485
Routine Length:     7 products
Constraints Met:    All ✓
```

#### 2. Morning Routine
- Product 1: Cleanser
  - Price: ₹350
  - Match: 92%
  - Why recommended: [Explanation card]

- Product 2: Serum
  - [Same structure]

#### 3. Evening Routine
- [Same structure as morning]

#### 4. Details & Explanations
- Full score breakdown per product
- Why alternatives were rejected (optional)
- Conflict resolution (if any)
- Confidence indicators

#### 5. Next Steps
- "Save Routine" / "Download PDF"
- "Try Different Constraints"
- "See Alternatives"

---

### Failure Case Display

**When no complete routine exists:**

```
⚠️  No complete routine found

Summary:
  Budget Required:    ₹245
  Your Budget:        ₹200
  Shortfall:          ₹45

Closest Solution (84% constraints):
  [Display partial routine]

Options:
  [ ] Increase budget
  [ ] Reduce concerns
  [ ] Accept 2-product routine
  [ ] Get partial recommendations
```

---

## Evaluation & Success Criteria

### Evaluation Baselines

The system will be evaluated against progressively stronger baselines:

#### Baseline 1: Popularity-Based
Recommend highest-rated products without personalization.

#### Baseline 2: Content-Based
Recommend products matching user concerns; no constraint handling.

#### Baseline 3: Constraint-Aware Ranker
Content-based ranking + hard constraints (no routine optimization).

#### SkinSolve
Constraint-aware ranking + routine optimization + explainability.

---

### Quantitative Metrics

#### Precision@K
```
Precision@K = (Relevant items in top-K) / K
```
*Measures: % of recommended products relevant to user goals*

#### Recall@K
```
Recall@K = (Relevant items retrieved) / (All relevant items)
```
*Measures: % of all relevant products captured in recommendations*

#### NDCG@K (Normalized Discounted Cumulative Gain)
*Measures: Ranking quality (relevant items ranked higher)*

#### Constraint Satisfaction Rate (CSR)
```
CSR = (Valid recommendations) / (Total recommendations) × 100%
```
*Measures: % of recommendations respecting all hard constraints*

#### Routine Completeness
*Measures: Whether recommended routine covers essential categories*

#### Diversity Score
*Measures: Degree of meaningful variation among recommended products*

#### Latency
*Measures: Average recommendation generation time (target: <2 seconds)*

---

### Qualitative Success Criteria

1. ✅ Recommendations are **relevant** to user's stated problems
2. ✅ Recommendations **respect hard constraints** (budget, fragrance-free)
3. ✅ Routine is **coherent** (products complement each other)
4. ✅ Explanations are **transparent** and understandable
5. ✅ Failures are **handled gracefully** (no fabricated solutions)
6. ✅ System is **reproducible** (another engineer can rebuild it)
7. ✅ Documentation is **comprehensive** (assumptions, limitations, rationale)
8. ✅ Code is **clean and testable** (unit tests present)

---

### MVP Success Criteria

The MVP is successful when:

1. User can enter realistic skincare problem
2. System converts inputs into structured profile
3. Relevant candidates are generated
4. Hard constraints are enforced
5. Products are ranked using multi-objective scoring
6. Coherent routine is optimized
7. Recommendations are explained transparently
8. Impossible constraints result in graceful failures
9. Evaluation metrics are reproducible
10. Application is deployed and publicly accessible
11. GitHub repository is clean and documented
12. Another engineer can reproduce the system using README

---

## Implementation Plan

### Day 1: Recommendation Engine (24 hours)

#### Phase 1: Setup & Data (4 hours)
- [ ] Repository initialization
- [ ] Dataset curation and schema definition
- [ ] Data preprocessing pipeline
- [ ] Data validation

**Definition of Done:** Clean, normalized product and ingredient datasets

---

#### Phase 2: Core Components (8 hours)
- [ ] User profile model
- [ ] Problem parser
- [ ] Candidate generation engine
- [ ] Constraint engine

**Definition of Done:** Given a user profile, system generates constrained candidate set

---

#### Phase 3: Ranking & Optimization (8 hours)
- [ ] Multi-objective ranker (scoring function)
- [ ] Routine optimizer (category coverage, coherence)
- [ ] Explanation engine (recommendation justifications)

**Definition of Done:** End-to-end recommendation pipeline works independently

---

#### Phase 4: Testing & Evaluation (4 hours)
- [ ] Unit tests for each component
- [ ] Integration tests for end-to-end flow
- [ ] Evaluation dataset and baseline comparisons
- [ ] Performance metrics computation

**Definition of Done:** Recommendation engine tested and evaluated

---

### Day 2: Productization & Deployment (24 hours)

#### Phase 5: Streamlit UI (6 hours)
- [ ] Input page (profile capture)
- [ ] Results page (routine display)
- [ ] Recommendation cards and explanations
- [ ] Failure state handling

**Definition of Done:** Working web UI connected to recommendation engine

---

#### Phase 6: Polish & Edge Cases (4 hours)
- [ ] Error handling and validation
- [ ] Edge case testing (impossible constraints, missing data)
- [ ] Performance optimization
- [ ] User feedback messages

**Definition of Done:** Robust, user-friendly application

---

#### Phase 7: Documentation (6 hours)
- [ ] README (setup, usage, architecture overview)
- [ ] Architecture diagram
- [ ] Design decision documentation
- [ ] Limitations and future roadmap
- [ ] API/function docstrings

**Definition of Done:** Another engineer can understand and reproduce the system

---

#### Phase 8: Deployment & Final QA (8 hours)
- [ ] Deploy to Streamlit Community Cloud
- [ ] End-to-end testing of deployed app
- [ ] GitHub repository cleanup
- [ ] Bug fixes and final polish
- [ ] Test cases and evaluation results

**Definition of Done:** Public, working application with clean repository

---

## Appendix

### A. Product Principles

1. **Problem Before Product**  
   Understand what the user is solving before recommending anything.

2. **Constraints Are First-Class Signals**  
   Budget, sensitivity, preferences directly influence recommendation quality.

3. **Recommend Less, But Better**  
   Avoid unnecessary product overload.

4. **Explain Every Important Decision**  
   Users should understand *why* recommendations were made.

5. **Fail Honestly**  
   If no feasible solution exists, say so clearly.

6. **Separate Interpretation from Logic**  
   An LLM may parse user language, but recommendation engine should be deterministic and testable.

---

### B. Safety & Responsible Use

**Disclaimer:**
> SkinSolve provides cosmetic product recommendations based on user-provided information. It does not diagnose, prevent, or treat medical conditions. For persistent or severe skin concerns, consult a qualified healthcare professional.

**Key Points:**
- Recommendations represent cosmetic guidance only
- Not a substitute for professional dermatological advice
- Outcomes not guaranteed
- Individual skin responses vary

---

### C. Known Limitations

| Limitation | Impact | Mitigation |
|-----------|--------|-----------|
| Small product catalog (150–300 vs. thousands in production) | Limited coverage | Clear about scope in README |
| Simplified ingredient evidence layer | Reduced accuracy | Documented assumptions |
| No user behavior history | Cold-start challenge | Noted as Phase 2 improvement |
| No computer vision | Can't analyze skin images | Documented future roadmap |
| Engineered weights (not learned) | Potentially suboptimal rankings | Validated experimentally; noted for Phase 2 |
| Reference prices (not real-time) | Prices may change | Clear about data freshness |

---

### D. Future Roadmap

#### Phase 2 — Behavioral Personalization
- User interaction history (ratings, clicks, purchases)
- Collaborative filtering
- Learning-to-rank models

#### Phase 3 — Skin Journey
```
Skin State → Recommendation → User Feedback → Updated State → Next Best Action
```

#### Phase 4 — Computer Vision
```
Selfie → Skin Analysis → Structured Parameters → SkinSolve
```

#### Phase 5 — Evidence Intelligence
- Research paper retrieval
- Literature embeddings
- Evidence-ranked explanations
- Citation-aware explanations

---

### E. Competitive Differentiation

| System Type | Approach | Limitation |
|------------|----------|-----------|
| **Popularity-based** | Recommend popular products | Ignores personal constraints |
| **Content-based** | Match product to user profile | Independent product ranking |
| **Collaborative** | Recommend based on similar users | Cold-start problem |
| **SkinSolve** | Constrained optimization + routine | Treats recommendation as problem-solving |

**Core Innovation:**
> Skincare recommendation as constraint-aware optimization and routine construction, not product ranking.

---

### F. Key Assumptions

1. Product metadata is sufficiently accurate for recommendation
2. Ingredient-function mappings are simplified but valid for MVP
3. Product prices represent reasonable reference values
4. User-provided information is assumed accurate
5. Offline metrics correlate with real-world satisfaction
6. Cold-start recommendation is feasible without user history

---

### G. Submission Deliverables

#### Deliverable 1: GitHub Repository
- Source code with modular architecture
- Sample dataset and preprocessing
- Unit and integration tests
- Evaluation pipeline
- Comprehensive README
- Setup instructions
- Architecture documentation

**Repository URL:** `[TO BE ADDED]`

---

#### Deliverable 2: Deployed Application
- Publicly accessible URL
- No local setup required
- Full end-to-end workflow functional
- No exposed credentials
- Reasonable latency (<2 seconds)

**Deployment URL:** `[TO BE ADDED]`

---

#### Deliverable 3: Documentation
- Problem statement and motivation
- Architecture overview
- Recommendation methodology
- Evaluation results
- Design decisions
- Limitations and roadmap
- Setup and usage guide

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024 | — | Initial PRD |

---

**Last Updated:** 2024  
**Next Review:** Post-MVP evaluation