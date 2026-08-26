import re
import pandas as pd
from typing import List, Tuple, Dict, Any, Set
from ..schemas.recommendation import UserProfileRequest

class ConstraintEngine:
    @staticmethod
    def filter_candidates(df: pd.DataFrame, profile: UserProfileRequest) -> Tuple[pd.DataFrame, List[str]]:
        rejections_log: List[str] = []
        filtered_df = df.copy()

        # 0. Budget Pre-Filter: No single product should cost more than the total routine budget
        if profile.budget > 0:
            pre_count = len(filtered_df)
            filtered_df = filtered_df[filtered_df['price'] <= profile.budget]
            dropped = pre_count - len(filtered_df)
            if dropped > 0:
                rejections_log.append(f"Filtered out {dropped} product(s) priced above total budget ceiling of ₹{int(profile.budget)}.")

        # 1. Fragrance-Free Hard Constraint
        if profile.fragrance_free:
            pre_count = len(filtered_df)
            filtered_df = filtered_df[filtered_df['fragrance_free'] == True]
            dropped = pre_count - len(filtered_df)
            if dropped > 0:
                rejections_log.append(f"Filtered out {dropped} product(s) containing fragrance / parfum.")

        # 2. Excluded Ingredients Hard Constraint
        if profile.excluded_ingredients:
            for exc in profile.excluded_ingredients:
                exc_clean = exc.strip().lower()
                if not exc_clean:
                    continue
                pre_count = len(filtered_df)
                
                # Check ingredients_text, ingredients_list, and product name
                def contains_excluded(row):
                    ing_text = str(row.get('ingredients_text', '')).lower()
                    name_text = str(row.get('name', '')).lower()
                    if exc_clean in ["retinoid", "retinol"]:
                        return bool(re.search(r'\b(retinoid|retinol|retinal|retinoate|tretinoin|adapalene)\b', ing_text + " " + name_text))
                    elif exc_clean in ["salicylic acid", "bha"]:
                        return bool(re.search(r'\b(salicylic|salicylate|betaine salicylate|bha)\b', ing_text + " " + name_text))
                    elif exc_clean == "niacinamide":
                        return bool(re.search(r'\b(niacinamide|nicotinamide)\b', ing_text + " " + name_text))
                    elif exc_clean in ["vitamin c", "ascorbic acid"]:
                        return bool(re.search(r'\b(ascorbic|ascorbyl|tetrahexyldecyl|ethyl ascorbic)\b', ing_text + " " + name_text))
                    elif exc_clean in ["glycolic acid", "aha"]:
                        return bool(re.search(r'\b(glycolic|lactic|mandelic|tartaric|aha)\b', ing_text + " " + name_text))
                    else:
                        return exc_clean in ing_text or exc_clean in name_text

                mask = filtered_df.apply(contains_excluded, axis=1)
                filtered_df = filtered_df[~mask]
                dropped = pre_count - len(filtered_df)
                if dropped > 0:
                    rejections_log.append(f"Filtered out {dropped} product(s) containing excluded ingredient '{exc}'.")

        # 3. Existing Products Exclusion (Avoid recommending categories the user already owns)
        if profile.existing_products:
            pre_count = len(filtered_df)
            filtered_df = filtered_df[~filtered_df['category'].isin(profile.existing_products)]
            dropped = pre_count - len(filtered_df)
            if dropped > 0:
                rejections_log.append(f"Excluded {dropped} product(s) matching already owned categories ({', '.join(profile.existing_products)}).")

        # 4. High Sensitivity Profile Hard Filter
        if profile.sensitivity == "high":
            pre_count = len(filtered_df)
            def is_irritating_for_sensitive(row):
                name = str(row.get('name', '')).lower()
                ing = str(row.get('ingredients_text', '')).lower()
                has_high_aha = bool(re.search(r'(?:glycolic 10%|aha 7%|peeling|10% aha|30% aha)', name + " " + ing))
                has_alcohol = bool(re.search(r'(?:alcohol denat|sd alcohol)', ing))
                return has_high_aha or has_alcohol

            sens_mask = filtered_df.apply(is_irritating_for_sensitive, axis=1)
            filtered_df = filtered_df[~sens_mask]
            dropped = pre_count - len(filtered_df)
            if dropped > 0:
                rejections_log.append(f"Omitted {dropped} high-strength chemical exfoliants/alcohol formulas for sensitive skin safety.")

        # 5. Soft Preferences (Vegan & Cruelty-Free) - Enforce if candidate pool remains adequate
        if profile.vegan:
            vegan_candidates = filtered_df[filtered_df['vegan'] == True]
            categories_present = set(vegan_candidates['category'].unique())
            needed = set(df['category'].unique()) - set(profile.existing_products or [])
            if needed.issubset(categories_present) or len(vegan_candidates) >= 8:
                filtered_df = vegan_candidates
                rejections_log.append("Applied vegan preference filter.")

        if profile.cruelty_free:
            cf_candidates = filtered_df[filtered_df['cruelty_free'] == True]
            categories_present = set(cf_candidates['category'].unique())
            needed = set(df['category'].unique()) - set(profile.existing_products or [])
            if needed.issubset(categories_present) or len(cf_candidates) >= 8:
                filtered_df = cf_candidates
                rejections_log.append("Applied cruelty-free preference filter.")

        return filtered_df, rejections_log

    @staticmethod
    def check_routine_active_conflicts(products: List[Dict[str, Any]]) -> Tuple[bool, List[str]]:
        """
        Check for cross-product active ingredient contraindications in a routine.
        Rules:
        - Retinoid + BHA (Salicylic Acid): separate to alternate AM/PM slots
        - Retinoid + Strong AHA (Glycolic Acid): separate to alternate slots
        - Vitamin C (L-Ascorbic Acid) + Retinoid: separate Vitamin C to AM, Retinoid to PM
        - High Niacinamide + L-Ascorbic Acid: monitor for flushing, separate slots
        """
        conflicts = []
        has_retinoid = any(
            re.search(r'\b(retinoate|retinol|retinal|tretinoin|retinoid)\b', str(p.get('ingredients_text', '')) + " " + str(p.get('name', '')).lower())
            for p in products
        )
        has_bha = any(
            re.search(r'\b(salicylic|bha)\b', str(p.get('ingredients_text', '')) + " " + str(p.get('name', '')).lower())
            for p in products
        )
        has_strong_aha = any(
            re.search(r'\b(glycolic|lactic acid 10%)\b', str(p.get('ingredients_text', '')) + " " + str(p.get('name', '')).lower())
            for p in products
        )
        has_vit_c = any(
            re.search(r'\b(ascorbic acid|l-ascorbic|pure vitamin c)\b', str(p.get('ingredients_text', '')) + " " + str(p.get('name', '')).lower())
            for p in products
        )

        if has_retinoid and has_bha:
            conflicts.append("Retinoid and BHA detected in routine; placed in separate AM/PM slots to avoid skin barrier irritation.")
        if has_retinoid and has_strong_aha:
            conflicts.append("Retinoid and High AHA acid detected; AHA scheduled for alternate morning/evening routine slot.")
        if has_retinoid and has_vit_c:
            conflicts.append("Pure Vitamin C and Retinoid separated: Vitamin C assigned to AM protection, Retinoid assigned to PM renewal.")

        return True, conflicts

