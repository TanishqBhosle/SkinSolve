import pandas as pd
from typing import Dict, Any, Tuple
from ..schemas.recommendation import UserProfileRequest, ProductScoreBreakdown

class MultiObjectiveRanker:
    # Established architecture scoring weights
    WEIGHTS = {
        "concern": 0.30,
        "ingredient": 0.20,
        "skin_compatibility": 0.15,
        "preference_match": 0.15,
        "budget_fit": 0.10,
        "evidence_score": 0.10
    }

    @classmethod
    def score_product(cls, row: pd.Series, profile: UserProfileRequest, avg_category_budget: float) -> Tuple[float, ProductScoreBreakdown]:
        # 1. Concern Match (30%)
        product_concerns = [c.strip().lower() for c in str(row.get('concerns', '')).split(',')]
        user_concerns = [c.strip().lower() for c in profile.concerns]
        if user_concerns:
            matched_concerns = set(product_concerns).intersection(set(user_concerns))
            concern_ratio = len(matched_concerns) / len(user_concerns)
            # Baseline minimum match if partially helpful
            if concern_ratio == 0 and any(c in ['barrier_repair', 'dryness', 'oiliness'] for c in product_concerns):
                concern_ratio = 0.3
        else:
            concern_ratio = 0.8
        s_concern = min(1.0, concern_ratio) * 100.0

        # 2. Ingredient Match (20%)
        ingredients = str(row.get('ingredients', '')).lower()
        s_ing = 50.0 # base score
        if "acne" in user_concerns and ("salicylic" in ingredients or "zinc pca" in ingredients or "azelaic" in ingredients):
            s_ing += 45.0
        if ("pigmentation" in user_concerns or "hyperpigmentation" in user_concerns) and ("ascorbic" in ingredients or "niacinamide" in ingredients or "azelaic" in ingredients):
            s_ing += 45.0
        if ("redness" in user_concerns or "sensitivity" in user_concerns) and ("centella" in ingredients or "panthenol" in ingredients or "oatmeal" in ingredients):
            s_ing += 45.0
        if ("dryness" in user_concerns or "barrier_repair" in user_concerns) and ("ceramide" in ingredients or "hyaluronic" in ingredients):
            s_ing += 45.0
        if "anti_aging" in user_concerns and ("retinoate" in ingredients or "peptide" in ingredients or "ascorbic" in ingredients):
            s_ing += 45.0
        s_ingredient = min(100.0, s_ing)

        # 3. Skin Compatibility (15%)
        product_skins = [s.strip().lower() for s in str(row.get('skin_types', '')).split(',')]
        user_skin = profile.skin_type.lower()
        if user_skin in product_skins or "all" in product_skins:
            s_skin = 100.0
        elif user_skin == "combination" and ("oily" in product_skins or "dry" in product_skins):
            s_skin = 85.0
        elif user_skin == "sensitive" and ("normal" in product_skins):
            s_skin = 75.0
        else:
            s_skin = 40.0

        # High sensitivity penalty if product is aggressive
        if profile.sensitivity == "high" and not row.get('fragrance_free', True):
            s_skin = max(0.0, s_skin - 40.0)

        # 4. Preference Match (15%)
        s_pref = 100.0
        if profile.fragrance_free and not row.get('fragrance_free', True):
            s_pref -= 50.0
        if profile.vegan and not row.get('vegan', False):
            s_pref -= 30.0
        if profile.cruelty_free and not row.get('cruelty_free', False):
            s_pref -= 20.0
        s_preference = max(0.0, s_pref)

        # 5. Budget Fit (10%)
        price = float(row.get('price', 0.0))
        if price <= avg_category_budget:
            s_budget = 100.0
        else:
            # Proportional penalty for exceeding expected category slice
            ratio = (price - avg_category_budget) / max(1.0, avg_category_budget)
            s_budget = max(20.0, 100.0 - (ratio * 60.0))

        # 6. Evidence Score (10%)
        evi = float(row.get('evidence_score', 0.8))
        s_evidence = evi * 100.0

        # Total Composite Score
        total_score = (
            cls.WEIGHTS["concern"] * s_concern +
            cls.WEIGHTS["ingredient"] * s_ingredient +
            cls.WEIGHTS["skin_compatibility"] * s_skin +
            cls.WEIGHTS["preference_match"] * s_preference +
            cls.WEIGHTS["budget_fit"] * s_budget +
            cls.WEIGHTS["evidence_score"] * s_evidence
        )

        breakdown = ProductScoreBreakdown(
            concern_match=round(cls.WEIGHTS["concern"] * s_concern, 1),
            ingredient_match=round(cls.WEIGHTS["ingredient"] * s_ingredient, 1),
            skin_compatibility=round(cls.WEIGHTS["skin_compatibility"] * s_skin, 1),
            preference_match=round(cls.WEIGHTS["preference_match"] * s_preference, 1),
            budget_fit=round(cls.WEIGHTS["budget_fit"] * s_budget, 1),
            evidence_score=round(cls.WEIGHTS["evidence_score"] * s_evidence, 1),
            total_score=round(total_score, 1)
        )

        return total_score, breakdown
