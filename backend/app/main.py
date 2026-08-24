from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any

from app.schemas.recommendation import (
    UserProfileRequest,
    ProblemParseRequest,
    ProblemParseResponse,
    RecommendationResponse
)
from app.recommendation.parser import parse_skincare_problem
from app.services.recommendation_service import RecommendationService
from app.data.loader import DataLoader

app = FastAPI(
    title="SkinSolve Intelligence API",
    description="Deterministic, constraint-aware skincare recommendation and routine optimization engine.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/v1/health")
def health_check():
    loader = DataLoader.get_instance()
    products_count = len(loader.get_products())
    return {
        "status": "healthy",
        "service": "SkinSolve Backend API",
        "version": "1.0.0",
        "catalog_size": products_count
    }

@app.post("/api/v1/parse-problem", response_model=ProblemParseResponse)
def parse_problem_endpoint(req: ProblemParseRequest):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query string cannot be empty.")
    return parse_skincare_problem(req.query)

@app.post("/api/v1/recommendations", response_model=RecommendationResponse)
def get_recommendations_endpoint(profile: UserProfileRequest):
    try:
        return RecommendationService.get_recommendations(profile)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/products")
def list_products():
    loader = DataLoader.get_instance()
    df = loader.get_products()
    return df.to_dict(orient="records")

@app.get("/api/v1/ingredients")
def list_ingredients():
    loader = DataLoader.get_instance()
    df = loader.get_ingredients()
    return df.to_dict(orient="records")

@app.get("/api/v1/evidence")
def list_evidence():
    loader = DataLoader.get_instance()
    df = loader.get_evidence()
    return df.to_dict(orient="records")
