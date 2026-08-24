import pandas as pd
from typing import List, Dict, Any
from ..schemas.recommendation import UserProfileRequest, RecommendationResponse
from ..data.loader import DataLoader
from ..recommendation.constraints import ConstraintEngine
from ..recommendation.optimizer import RoutineOptimizer

class RecommendationService:
    @staticmethod
    def get_recommendations(profile: UserProfileRequest) -> RecommendationResponse:
        data_loader = DataLoader.get_instance()
        products_df = data_loader.get_products()

        if products_df.empty:
            raise ValueError("Product catalog data is empty.")

        # 1. Candidate Generation & Constraint Filtering
        candidates_df, rejections_log = ConstraintEngine.filter_candidates(products_df, profile)

        # 2. Routine Optimization & Multi-Objective Ranking
        response = RoutineOptimizer.optimize_routine(candidates_df, profile)
        return response
