import pytest
from app.recommendation.parser import parse_skincare_problem
from app.recommendation.constraints import ConstraintEngine
from app.recommendation.optimizer import RoutineOptimizer
from app.services.recommendation_service import RecommendationService
from app.schemas.recommendation import UserProfileRequest
from app.data.loader import DataLoader

def test_data_loader():
    loader = DataLoader.get_instance()
    df = loader.get_products()
    assert not df.empty
    assert len(df) >= 20
    assert "price" in df.columns
    assert "category" in df.columns

def test_problem_parser():
    query = "I have oily skin with acne, severe blackheads and I need fragrance-free products under ₹1500"
    res = parse_skincare_problem(query)
    assert res.skin_type == "oily"
    assert "acne" in res.concerns
    assert res.fragrance_free is True
    assert res.budget == 1500.0

def test_constraint_filtering_fragrance():
    loader = DataLoader.get_instance()
    df = loader.get_products()
    
    profile = UserProfileRequest(
        skin_type="dry",
        concerns=["dryness"],
        sensitivity="high",
        budget=2000,
        fragrance_free=True
    )
    candidates, logs = ConstraintEngine.filter_candidates(df, profile)
    assert all(candidates['fragrance_free'] == True)

def test_recommendation_routine_generation():
    profile = UserProfileRequest(
        skin_type="oily",
        concerns=["acne", "oiliness"],
        sensitivity="medium",
        budget=2000,
        fragrance_free=True,
        vegan=False,
        cruelty_free=False
    )
    res = RecommendationService.get_recommendations(profile)
    assert res.status == "success"
    assert res.overall_match_percentage > 70
    assert res.total_routine_price <= 2000
    assert len(res.morning_routine) >= 3
    assert len(res.evening_routine) >= 3
    assert res.constraint_status.budget_satisfied is True

def test_budget_failure_resolution():
    profile = UserProfileRequest(
        skin_type="oily",
        concerns=["acne"],
        sensitivity="low",
        budget=250.0, # impossibly low for 4 products
        fragrance_free=False
    )
    res = RecommendationService.get_recommendations(profile)
    assert res.status == "constraint_violation"
    assert res.failure_resolution is not None
    assert res.failure_resolution.failed is True
    assert res.failure_resolution.shortfall > 0
    assert len(res.failure_resolution.actionable_suggestions) > 0
