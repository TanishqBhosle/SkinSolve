import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.data.loader import DataLoader
from app.recommendation.parser import parse_skincare_problem
from app.recommendation.constraints import ConstraintEngine
from app.recommendation.ranker import MultiObjectiveRanker
from app.recommendation.optimizer import RoutineOptimizer
from app.services.recommendation_service import RecommendationService
from app.schemas.recommendation import UserProfileRequest

client = TestClient(app)

def test_data_loader():
    loader = DataLoader.get_instance()
    df = loader.get_products()
    assert not df.empty
    assert len(df) >= 200
    assert "price" in df.columns
    assert "category" in df.columns
    assert "skin_types_list" in df.columns
    assert "concerns_list" in df.columns
    assert "ingredients_list" in df.columns
    assert "fragrance_free" in df.columns
    assert "vegan" in df.columns
    
    vec, mat = loader.get_tfidf()
    assert vec is not None
    assert mat is not None
    assert mat.shape[0] == len(df)

def test_problem_parser_standard():
    query = "I have oily skin with acne and blackheads. Need fragrance-free products under ₹1600"
    res = parse_skincare_problem(query)
    assert res.skin_type == "oily"
    assert "acne" in res.concerns
    assert res.fragrance_free is True
    assert res.budget == 1600.0
    assert "oily" in res.explanation

def test_problem_parser_synonyms_and_k_budget():
    query = "Very dry flaky face, super sensitive and red, 2k budget, no fragrance, avoid salicylic"
    res = parse_skincare_problem(query)
    assert res.skin_type in ["dry", "sensitive"]
    assert "dryness" in res.concerns or "redness" in res.concerns
    assert res.sensitivity == "high"
    assert res.budget == 2000.0
    assert res.fragrance_free is True
    assert "Salicylic Acid" in res.excluded_ingredients

def test_constraint_filtering_fragrance_and_exclusions():
    loader = DataLoader.get_instance()
    df = loader.get_products()
    
    profile = UserProfileRequest(
        skin_type="dry",
        concerns=["dryness"],
        sensitivity="high",
        budget=2000,
        fragrance_free=True,
        excluded_ingredients=["Salicylic Acid"]
    )
    candidates, logs = ConstraintEngine.filter_candidates(df, profile)
    assert not candidates.empty
    assert all(candidates['fragrance_free'] == True)
    assert not any(candidates['ingredients_text'].str.contains(r'\bsalicylic\b', case=False, na=False))

def test_multiobjective_ranker_deterministic():
    loader = DataLoader.get_instance()
    df = loader.get_products()
    row = df.iloc[0]
    
    profile = UserProfileRequest(
        skin_type="oily",
        concerns=["acne", "oiliness"],
        sensitivity="medium",
        budget=1800,
        fragrance_free=True
    )
    score1, breakdown1 = MultiObjectiveRanker.score_product(row, profile, avg_category_budget=450.0)
    score2, breakdown2 = MultiObjectiveRanker.score_product(row, profile, avg_category_budget=450.0)
    
    assert score1 == score2
    assert breakdown1.total_score == breakdown2.total_score
    assert 0.0 <= score1 <= 100.0

def test_recommendation_routine_generation():
    profile = UserProfileRequest(
        skin_type="oily",
        concerns=["acne", "oiliness"],
        sensitivity="medium",
        budget=1800,
        fragrance_free=True,
        vegan=False,
        cruelty_free=False
    )
    res = RecommendationService.get_recommendations(profile)
    assert res.status == "success"
    assert res.overall_match_percentage >= 75
    assert res.total_routine_price <= 1800
    assert len(res.all_recommended_products) == 4
    assert len(res.morning_routine) >= 3
    assert len(res.evening_routine) >= 3
    assert res.constraint_status.budget_satisfied is True
    assert len(res.alternatives) > 0

def test_recommendation_with_existing_products():
    profile = UserProfileRequest(
        skin_type="dry",
        concerns=["dryness", "barrier_repair"],
        sensitivity="high",
        budget=1400,
        fragrance_free=True,
        existing_products=["Cleanser"]
    )
    res = RecommendationService.get_recommendations(profile)
    assert res.status == "success"
    assert res.total_routine_price <= 1400
    # Cleanser should NOT be in the recommended cart
    categories = [p.category for p in res.all_recommended_products]
    assert "Cleanser" not in categories
    assert len(res.all_recommended_products) == 3

def test_budget_failure_resolution():
    profile = UserProfileRequest(
        skin_type="oily",
        concerns=["acne"],
        sensitivity="low",
        budget=200.0, # Impossibly low for 4 clinical products
        fragrance_free=False
    )
    res = RecommendationService.get_recommendations(profile)
    assert res.status == "constraint_violation"
    assert res.failure_resolution is not None
    assert res.failure_resolution.failed is True
    assert res.failure_resolution.shortfall > 0
    assert len(res.failure_resolution.actionable_suggestions) > 0
    assert res.constraint_status.budget_satisfied is False

def test_api_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["catalog_size"] > 200

def test_api_parse_endpoint():
    response = client.post("/api/v1/parse-problem", json={"query": "Oily skin with breakouts and ₹1500 budget"})
    assert response.status_code == 200
    data = response.json()
    assert data["skin_type"] == "oily"
    assert "acne" in data["concerns"]
    assert data["budget"] == 1500.0

def test_api_recommendation_endpoint():
    payload = {
        "skin_type": "combination",
        "concerns": ["hyperpigmentation", "dullness"],
        "sensitivity": "medium",
        "budget": 2000.0,
        "fragrance_free": True,
        "vegan": False,
        "cruelty_free": False,
        "existing_products": [],
        "excluded_ingredients": []
    }
    response = client.post("/api/v1/recommendations", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["total_routine_price"] <= 2000.0
    assert len(data["morning_routine"]) > 0

def test_api_evaluation_endpoint():
    response = client.get("/api/v1/evaluation")
    assert response.status_code == 200
    data = response.json()
    assert "models" in data
    assert len(data["models"]) == 4
