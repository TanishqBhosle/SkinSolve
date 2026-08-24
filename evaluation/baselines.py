import pandas as pd
from typing import List, Dict, Any
from app.schemas.recommendation import UserProfileRequest, ProductRecommendation

class Baselines:
    @staticmethod
    def popularity_baseline(df: pd.DataFrame, profile: UserProfileRequest) -> List[Dict[str, Any]]:
        """Ranks purely by review count and rating with zero constraint awareness."""
        sorted_df = df.sort_values(by=["rating", "reviews_count"], ascending=[False, False])
        return sorted_df.head(4).to_dict(orient="records")

    @staticmethod
    def content_based_baseline(df: pd.DataFrame, profile: UserProfileRequest) -> List[Dict[str, Any]]:
        """Ranks based solely on text overlap with concerns, ignoring budget limit."""
        concerns = profile.concerns
        def calc_overlap(row):
            row_concerns = str(row.get('concerns', '')).lower()
            return sum(1 for c in concerns if c.lower() in row_concerns)
        df_copy = df.copy()
        df_copy['score'] = df_copy.apply(calc_overlap, axis=1)
        sorted_df = df_copy.sort_values(by=["score", "rating"], ascending=[False, False])
        return sorted_df.head(4).to_dict(orient="records")
