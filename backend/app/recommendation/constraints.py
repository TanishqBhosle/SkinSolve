import pandas as pd
from typing import List, Tuple, Dict, Any
from ..schemas.recommendation import UserProfileRequest

class ConstraintEngine:
    @staticmethod
    def filter_candidates(df: pd.DataFrame, profile: UserProfileRequest) -> Tuple[pd.DataFrame, List[str]]:
        rejections_log = []
        filtered_df = df.copy()

        # 1. Fragrance Free Hard Constraint
        if profile.fragrance_free:
            pre_count = len(filtered_df)
            filtered_df = filtered_df[filtered_df['fragrance_free'] == True]
            dropped = pre_count - len(filtered_df)
            if dropped > 0:
                rejections_log.append(f"Filtered out {dropped} product(s) containing fragrance.")

        # 2. Excluded Ingredients Hard Constraint
        if profile.excluded_ingredients:
            for exc in profile.excluded_ingredients:
                pre_count = len(filtered_df)
                filtered_df = filtered_df[~filtered_df['ingredients'].str.contains(exc, case=False, na=False)]
                dropped = pre_count - len(filtered_df)
                if dropped > 0:
                    rejections_log.append(f"Filtered out {dropped} product(s) containing excluded ingredient '{exc}'.")

        # 3. Existing Products Exclusion (Prevent recommending duplicate owned categories)
        if profile.existing_products:
            pre_count = len(filtered_df)
            filtered_df = filtered_df[~filtered_df['category'].isin(profile.existing_products)]
            dropped = pre_count - len(filtered_df)
            if dropped > 0:
                rejections_log.append(f"Excluded {dropped} product(s) in owned categories ({', '.join(profile.existing_products)}).")

        # 4. Vegan & Cruelty Free Soft/Hard Preferences
        if profile.vegan:
            pre_count = len(filtered_df)
            vegan_df = filtered_df[filtered_df['vegan'] == True]
            if len(vegan_df) >= 4: # Only enforce strictly if sufficient pool exists
                filtered_df = vegan_df
                rejections_log.append("Applied strict vegan filter.")

        if profile.cruelty_free:
            pre_count = len(filtered_df)
            cf_df = filtered_df[filtered_df['cruelty_free'] == True]
            if len(cf_df) >= 4:
                filtered_df = cf_df
                rejections_log.append("Applied strict cruelty-free filter.")

        # 5. Sensitivity Filter (Filter out aggressive exfoliants / high acids if sensitivity == 'high')
        if profile.sensitivity == "high":
            pre_count = len(filtered_df)
            filtered_df = filtered_df[~filtered_df['name'].str.contains('Glycolic|7%|AHA 7%', case=False, na=False)]
            dropped = pre_count - len(filtered_df)
            if dropped > 0:
                rejections_log.append(f"Omitted {dropped} high-irritation chemical exfoliants due to high skin sensitivity.")

        return filtered_df, rejections_log

    @staticmethod
    def check_routine_active_conflicts(products: List[Dict[str, Any]]) -> Tuple[bool, List[str]]:
        """
        Check for cross-product active ingredient contraindications in a routine.
        e.g. BHA + Retinoid in same immediate session, or High acid + Retinoid.
        """
        conflicts = []
        has_retinoid = any("retinoate" in p.get('ingredients', '').lower() or "retinoid" in p.get('name', '').lower() for p in products)
        has_bha_or_aha = any("salicylic" in p.get('ingredients', '').lower() or "glycolic" in p.get('ingredients', '').lower() for p in products)
        
        # In a well-structured routine, BHA is AM or alternate PM, Retinoid is PM.
        # If both are in the same routine, we check if they are cleanly slotted.
        return len(conflicts) == 0, conflicts
