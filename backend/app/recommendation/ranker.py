import re
import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple, List, Optional
from sklearn.metrics.pairwise import cosine_similarity
from ..schemas.recommendation import UserProfileRequest, ProductScoreBreakdown
from ..data.loader import DataLoader

class MultiObjectiveRanker:
    # 6-factor objective weights summing to 1.0
    WEIGHTS = {
        "concern": 0.30,
        "ingredient": 0.20,
        "skin_compatibility": 0.15,
        "preference_match": 0.15,
        "budget_fit": 0.10,
        "evidence_score": 0.10
    }

    # Clinical active ingredient targeting matrix
    TARGET_ACTIVES = {
        "acne": ["salicylic", "zinc pca", "azelaic", "benzoyl", "tea tree", "niacinamide", "sulfur", "adapalene"],
        "hyperpigmentation": ["ascorbic", "vitamin c", "niacinamide", "azelaic", "alpha arbutin", "tranexamic", "kojic", "glycolic", "licorice"],
        "pigmentation": ["ascorbic", "vitamin c", "niacinamide", "azelaic", "alpha arbutin", "tranexamic", "kojic"],
        "redness": ["centella", "cica", "panthenol", "allantoin", "oatmeal", "colloidal oat", "madecassoside", "bisabolol", "green tea"],
        "barrier_repair": ["ceramide", "ceramide np", "cholesterol", "phytosphingosine", "panthenol", "hyaluronic", "squalane", "bifida"],
        "dryness": ["hyaluronic", "sodium hyaluronate", "glycerin", "ceramide", "shea butter", "squalane", "polyglutamic"],
        "anti_aging": ["retinol", "retinal", "retinoate", "peptide", "copper peptide", "matrixyl", "adenosine", "ascorbic", "bakuchiol"],
        "dullness": ["ascorbic", "vitamin c", "glycolic", "lactic", "niacinamide", "ferulic", "papaya"],
        "enlarged_pores": ["salicylic", "niacinamide", "zinc pca", "clay", "kaolin", "bha"],
        "oiliness": ["salicylic", "niacinamide", "zinc pca", "green tea", "silica", "mattifying"]
    }

    @classmethod
    def score_product(cls, row: pd.Series, profile: UserProfileRequest, avg_category_budget: float) -> Tuple[float, ProductScoreBreakdown]:
        # 1. Concern Match (30%)
        user_concerns = [c.strip().lower() for c in profile.concerns if c.strip()]
        prod_concerns = row.get('concerns_list', [])
        if not prod_concerns and isinstance(row.get('concerns'), str):
            prod_concerns = [c.strip().lower() for c in row['concerns'].replace("'", "").replace("[", "").replace("]", "").split(",")]

        if user_concerns:
            matched_concerns = [c for c in user_concerns if any(c in pc or pc in c for pc in prod_concerns)]
            concern_ratio = len(matched_concerns) / len(user_concerns)
            # Universal baseline support for barrier/hydration
            if concern_ratio == 0:
                if any(c in ['barrier_repair', 'dryness', 'oiliness', 'dullness'] for c in prod_concerns):
                    concern_ratio = 0.35
                else:
                    concern_ratio = 0.20
        else:
            concern_ratio = 0.85
        s_concern = min(100.0, max(0.0, concern_ratio * 100.0))

        # 2. Ingredient Match & Content Relevance (20%)
        # Combine Clinical Active bonus + TF-IDF cosine similarity
        ing_text = str(row.get('ingredients_text', '')).lower()
        active_matches = 0
        total_targets = 0
        for uc in user_concerns:
            actives = cls.TARGET_ACTIVES.get(uc, [])
            if actives:
                total_targets += 1
                if any(act in ing_text for act in actives):
                    active_matches += 1

        active_ratio = (active_matches / max(1, total_targets)) if total_targets > 0 else 0.7

        # Content-based similarity using TF-IDF
        cosine_sim = cls._calculate_content_similarity(row, profile)
        s_ing = (0.60 * active_ratio * 100.0) + (0.40 * cosine_sim * 100.0)
        s_ingredient = min(100.0, max(10.0, s_ing))

        # 3. Skin Compatibility (15%)
        user_skin = profile.skin_type.lower()
        prod_skins = row.get('skin_types_list', [])
        if not prod_skins and isinstance(row.get('skin_types'), str):
            prod_skins = [s.strip().lower() for s in row['skin_types'].replace("'", "").replace("[", "").replace("]", "").split(",")]

        if user_skin in prod_skins or "all" in prod_skins:
            s_skin = 100.0
        elif user_skin == "combination" and ("oily" in prod_skins or "dry" in prod_skins):
            s_skin = 88.0
        elif user_skin == "sensitive" and ("normal" in prod_skins or "dry" in prod_skins):
            s_skin = 80.0
        elif user_skin == "normal":
            s_skin = 90.0
        else:
            s_skin = 60.0

        # Safety adjustment for high-sensitivity profiles
        if profile.sensitivity == "high":
            if not row.get('fragrance_free', True):
                s_skin = max(0.0, s_skin - 40.0)
            if not row.get('alcohol_free', True):
                s_skin = max(0.0, s_skin - 20.0)

        s_skin = min(100.0, max(0.0, s_skin))

        # 4. Preference Match (15%)
        s_pref = 100.0
        if profile.fragrance_free and not row.get('fragrance_free', True):
            s_pref -= 45.0
        if profile.vegan and not row.get('vegan', False):
            s_pref -= 25.0
        if profile.cruelty_free and not row.get('cruelty_free', False):
            s_pref -= 15.0
        s_preference = min(100.0, max(0.0, s_pref))

        # 5. Budget Fit (10%)
        price = float(row.get('price', 0.0))
        target_cat_budget = max(100.0, avg_category_budget)
        if price <= target_cat_budget:
            s_budget = 100.0
        else:
            ratio = (price - target_cat_budget) / target_cat_budget
            s_budget = max(15.0, 100.0 - (ratio * 65.0))
        s_budget = min(100.0, max(0.0, s_budget))

        # 6. Evidence Score (10%)
        evi = float(row.get('evidence_score', 0.85))
        rating = float(row.get('rating', 4.0)) / 5.0
        s_evidence = min(100.0, max(0.0, (0.7 * evi + 0.3 * rating) * 100.0))

        # Total Composite Weighted Score
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

    @classmethod
    def _calculate_content_similarity(cls, row: pd.Series, profile: UserProfileRequest) -> float:
        """Fast TF-IDF Cosine Similarity using precomputed matrix."""
        try:
            loader = DataLoader.get_instance()
            vectorizer, tfidf_matrix = loader.get_tfidf()
            if vectorizer is None or tfidf_matrix is None:
                return 0.70

            matrix_idx = int(row.get('_matrix_idx', -1))
            if matrix_idx < 0 or matrix_idx >= tfidf_matrix.shape[0]:
                return 0.70

            user_query = f"{profile.skin_type} {' '.join(profile.concerns)} {'fragrance free' if profile.fragrance_free else ''}"
            user_vec = vectorizer.transform([user_query])
            prod_vec = tfidf_matrix[matrix_idx]

            sim = float((user_vec @ prod_vec.T).toarray()[0][0])
            return min(1.0, max(0.2, (sim * 1.5) + 0.3))
        except Exception:
            return 0.70
