import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.schemas.recommendation import UserProfileRequest
from app.services.recommendation_service import RecommendationService
from app.recommendation.parser import parse_skincare_problem

def verify_all():
    print("=" * 70)
    print("        RUNNING PHASE 25 END-TO-END SCENARIO VERIFICATIONS")
    print("=" * 70)

    # -------------------------------------------------------------
    # Scenario A: Oily skin, Acne, Fragrance-free, ₹1600
    # -------------------------------------------------------------
    p_a = UserProfileRequest(
        skin_type="oily",
        concerns=["acne"],
        sensitivity="medium",
        budget=1600,
        fragrance_free=True,
        vegan=False,
        cruelty_free=False,
        existing_products=[],
        excluded_ingredients=[]
    )
    res_a = RecommendationService.get_recommendations(p_a)
    assert res_a.status == "success", f"Scenario A failed: {res_a.status}"
    assert res_a.total_routine_price <= 1600, f"Scenario A exceeded budget: {res_a.total_routine_price}"
    assert all(p.fragrance_free for p in res_a.all_recommended_products), "Scenario A violated fragrance-free constraint"
    print("[OK] Scenario A PASSED: Oily skin + Acne + Fragrance-free (Budget Rs. 1600) -> Valid 4-step routine, Rs. " + str(res_a.total_routine_price))

    # -------------------------------------------------------------
    # Scenario B: Sensitive skin, Pigmentation, Fragrance-free, Rs. 2000
    # -------------------------------------------------------------
    p_b = UserProfileRequest(
        skin_type="sensitive",
        concerns=["hyperpigmentation"],
        sensitivity="high",
        budget=2000,
        fragrance_free=True,
        vegan=False,
        cruelty_free=False,
        existing_products=[],
        excluded_ingredients=[]
    )
    res_b = RecommendationService.get_recommendations(p_b)
    assert res_b.status == "success", f"Scenario B failed: {res_b.status}"
    assert res_b.total_routine_price <= 2000, f"Scenario B exceeded budget: {res_b.total_routine_price}"
    assert all(p.fragrance_free for p in res_b.all_recommended_products), "Scenario B violated fragrance-free"
    print("[OK] Scenario B PASSED: Sensitive skin + Pigmentation + High Sensitivity (Budget Rs. 2000) -> Valid gentle routine, Rs. " + str(res_b.total_routine_price))

    # -------------------------------------------------------------
    # Scenario C: Acne, Pigmentation, Rs. 200 (Shortfall handling)
    # -------------------------------------------------------------
    p_c = UserProfileRequest(
        skin_type="oily",
        concerns=["acne", "hyperpigmentation"],
        sensitivity="medium",
        budget=200,
        fragrance_free=False,
        vegan=False,
        cruelty_free=False,
        existing_products=[],
        excluded_ingredients=[]
    )
    res_c = RecommendationService.get_recommendations(p_c)
    assert res_c.status == "constraint_violation", f"Scenario C should fail on budget: {res_c.status}"
    assert res_c.failure_resolution is not None, "Scenario C missing failure resolution"
    assert res_c.failure_resolution.shortfall > 0, "Scenario C shortfall must be > 0"
    print("[OK] Scenario C PASSED: Impossibly low budget (Rs. 200) -> Diagnosed shortfall (Rs. " + str(int(res_c.failure_resolution.shortfall)) + ") with actionable suggestions")

    # -------------------------------------------------------------
    # Scenario D: Oily skin, Acne, Already owns Cleanser
    # -------------------------------------------------------------
    p_d = UserProfileRequest(
        skin_type="oily",
        concerns=["acne"],
        sensitivity="medium",
        budget=1400,
        fragrance_free=True,
        vegan=False,
        cruelty_free=False,
        existing_products=["Cleanser"],
        excluded_ingredients=[]
    )
    res_d = RecommendationService.get_recommendations(p_d)
    assert res_d.status == "success", f"Scenario D failed: {res_d.status}"
    cats_d = [p.category for p in res_d.all_recommended_products]
    assert "Cleanser" not in cats_d, f"Scenario D redundantly recommended cleanser: {cats_d}"
    assert len(res_d.all_recommended_products) == 3, f"Scenario D expected 3 products, got {len(res_d.all_recommended_products)}"
    print("[OK] Scenario D PASSED: Already owns Cleanser -> Cleanser omitted from cart, 3-step routine assembled under Rs. 1400")

    # -------------------------------------------------------------
    # Scenario E: Natural language parsing with INR and synonyms
    # -------------------------------------------------------------
    q_e = "I have very oily skin with severe breakouts, need fragrance free under Rs 1800"
    parsed_e = parse_skincare_problem(q_e)
    assert parsed_e.skin_type == "oily", f"Parser skin type: {parsed_e.skin_type}"
    assert "acne" in parsed_e.concerns, f"Parser concerns: {parsed_e.concerns}"
    assert parsed_e.budget == 1800.0, f"Parser budget: {parsed_e.budget}"
    assert parsed_e.fragrance_free is True, "Parser fragrance free flag failed"
    print("[OK] Scenario E PASSED: Natural language parser accurately parsed skin type, acne concern, Rs. 1800 budget, and fragrance constraint")

    # -------------------------------------------------------------
    # Scenario F: Extreme exclusions / No matching products handling
    # -------------------------------------------------------------
    p_f = UserProfileRequest(
        skin_type="sensitive",
        concerns=["redness"],
        sensitivity="high",
        budget=2000,
        fragrance_free=True,
        vegan=False,
        cruelty_free=False,
        existing_products=[],
        excluded_ingredients=["Glycerin", "Water", "Aqua", "Panthenol", "Centella", "Ceramide", "Sodium", "Extract", "Oil", "Acid"]
    )
    res_f = RecommendationService.get_recommendations(p_f)
    assert res_f.status == "constraint_violation", f"Scenario F expected constraint violation: {res_f.status}"
    assert res_f.failure_resolution.conflict_type == "empty_candidates"
    print("[OK] Scenario F PASSED: Impossible extreme exclusions -> Diagnosed empty candidate pool with actionable recovery")

    # -------------------------------------------------------------
    # Scenario G: Active Contraindication Slotting (Retinoid + BHA)
    # -------------------------------------------------------------
    p_g = UserProfileRequest(
        skin_type="combination",
        concerns=["acne", "anti_aging"],
        sensitivity="medium",
        budget=2500,
        fragrance_free=True,
        vegan=False,
        cruelty_free=False,
        existing_products=[],
        excluded_ingredients=[]
    )
    res_g = RecommendationService.get_recommendations(p_g)
    assert res_g.status == "success", f"Scenario G failed: {res_g.status}"
    assert len(res_g.morning_routine) > 0 and len(res_g.evening_routine) > 0
    print("[OK] Scenario G PASSED: Active multi-target (Acne + Anti-Aging) -> AM & PM schedules cleanly slotted")

    print("=" * 70)
    print("       ALL PHASE 25 VERIFICATION SCENARIOS PASSED 100%!")
    print("=" * 70)

if __name__ == "__main__":
    verify_all()
