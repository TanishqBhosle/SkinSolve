SkinSolve — Implementation Phases

Overview

The PRD targets a 48-hour MVP split into recommendation-engine work on Day 1 and productization/deployment on Day 2.

Phase 1 → Data & Setup
Phase 2 → Core Recommendation Components
Phase 3 → Ranking & Routine Optimization
Phase 4 → Testing & Evaluation
Phase 5 → React Frontend + API Integration
Phase 6 → Polish & Edge Cases
Phase 7 → Documentation
Phase 8 → Deployment & Final QA

Phase 1 — Setup & Data

Goal

Create a clean, validated foundation for the recommendation engine.

Tasks

initialize Git repository

create project structure

create Python environment

define product schema

curate 150–300 products

curate 50–100 ingredients

create evidence mappings

normalize metadata

validate dataset

create sample evaluation cases

Deliverables

data/products.csv
data/ingredients.csv
data/evidence.csv

Definition of Done

datasets load successfully

required fields are present

invalid records are detected

normalized data is ready for recommendation

Phase 2 — Core Recommendation Components

Goal

Build the deterministic recommendation foundation.

Tasks

User profile model

Input validation

Problem parser

Data loader

Candidate generator

Constraint engine

Candidate Generator

Given:

oily + acne

return a broad candidate set, approximately 15–25 products for a focused case.

Constraint Engine

Implement:

budget filtering

fragrance filtering

ingredient exclusions

skin compatibility

existing-product category handling

Definition of Done

Given a valid structured user profile, the system can generate a constrained candidate set.

Phase 3 — Ranking & Routine Optimization

Goal

Turn feasible candidates into a coherent routine.

Tasks

implement weighted scoring

implement score breakdown

implement product ranking

implement category coverage

implement redundancy reduction

implement compatibility checks

implement budget optimization

construct morning routine

construct evening routine

create explanations

Scoring

Concern Match       30%
Ingredient Match    20%
Skin Compatibility  15%
Preference Match    15%
Budget Fit          10%
Evidence Score      10%

Definition of Done

The complete recommendation engine can independently:

profile → candidates → constraints → ranking → routine → explanation

Phase 4 — Testing & Evaluation

Goal

Prove that the engine works and quantify recommendation quality.

Tasks

unit tests for parser

unit tests for constraints

unit tests for ranker

unit tests for routine optimizer

end-to-end tests

create 20–50 evaluation scenarios

implement baselines

calculate Precision@K

calculate Recall@K

calculate NDCG@K

calculate Constraint Satisfaction Rate

calculate routine completeness

calculate diversity

measure latency

Baselines

Baseline 1: Popularity
Baseline 2: Content-based
Baseline 3: Constraint-aware ranker
Final: SkinSolve

Definition of Done

Evaluation is reproducible and the final system can be compared against all baselines.

Phase 5 — React Frontend + API Integration

Goal

Connect the recommendation engine to a polished React web application through a FastAPI backend.

Backend API

Implement:

FastAPI application

recommendation endpoint

natural-language parsing endpoint if enabled

health endpoint

request/response schemas

CORS configuration for the frontend

structured API errors

React Input Screen

Implement:

optional natural-language problem field

skin type selector

concern multi-select

sensitivity selector

budget slider

fragrance toggle

existing products

additional notes

Get Recommendations button

React Results Screen

Implement:

recommendation summary

match score

total cost

constraint status

morning routine

evening routine

product cards

explanations

score breakdown

alternatives

React Failure Screen

Implement:

no complete routine message

budget shortfall

primary conflict

closest solution

alternative strategies

Definition of Done

Working React frontend is connected to the real recommendation engine through the FastAPI API.

Phase 6 — Polish & Edge Cases

Goal

Make the MVP robust and user-friendly.

Tasks

validation messages

empty states

loading states

graceful exception handling

impossible-constraint scenarios

missing data scenarios

duplicate product scenarios

performance optimization

consistent formatting

disclaimer

accessibility checks

Definition of Done

The application handles normal and failure scenarios without confusing users.

Phase 7 — Documentation

Goal

Make the project reproducible by another engineer.

Tasks

README setup guide

architecture documentation

HLD/LLD

folder structure

design decisions

evaluation methodology

limitations

future roadmap

function docstrings

test instructions

deployment instructions

Definition of Done

A new engineer can understand, install, run, test and evaluate SkinSolve without additional explanation.

Phase 8 — Deployment & Final QA

Goal

Deliver a public MVP.

Tasks

deploy to Streamlit Community Cloud

configure secrets safely

run production smoke tests

verify all pages

verify recommendation pipeline

verify failure handling

verify latency

clean GitHub repository

add final evaluation results

fix release blockers

Definition of Done

public application works

no credentials are exposed

end-to-end flow works

repository is clean

documentation is complete

evaluation results are reproducible

Recommended Execution Order

1. Data schema
2. Dataset
3. Models
4. Parser
5. Candidate generation
6. Constraints
7. Ranking
8. Routine optimization
9. Explanations
10. Tests
11. Evaluation
12. Streamlit UI
13. React polish
14. Documentation
15. Deployment

Do not spend major UI effort before the recommendation pipeline has deterministic tests.

Phase 2+ Roadmap

Behavioral Personalization

interaction history

ratings

clicks

purchases

collaborative filtering

learning-to-rank

Skin Journey

Skin State
   ↓
Recommendation
   ↓
User Feedback
   ↓
Updated State
   ↓
Next Best Action

Computer Vision

Selfie
  ↓
Skin Analysis
  ↓
Structured Parameters
  ↓
SkinSolve

Evidence Intelligence

research retrieval

literature embeddings

evidence-ranked explanations

citation-aware explanations