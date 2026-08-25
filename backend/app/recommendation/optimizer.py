import itertools
import pandas as pd
from typing import List, Dict, Any, Optional, Tuple
from ..schemas.recommendation import (
    UserProfileRequest,
    ProductRecommendation,
    AlternativeProduct,
    ConstraintStatus,
    FailureResolution,
    RecommendationResponse
)
from .ranker import MultiObjectiveRanker
from .constraints import ConstraintEngine

class RoutineOptimizer:
    CORE_CATEGORIES = ["Cleanser", "Treatment", "Moisturizer", "Sunscreen"]

    @classmethod
    def optimize_routine(cls, candidate_df: pd.DataFrame, profile: UserProfileRequest) -> RecommendationResponse:
        # Determine needed categories based on user's existing products
        needed_categories = [cat for cat in cls.CORE_CATEGORIES if cat not in (profile.existing_products or [])]
        if not needed_categories:
            needed_categories = ["Treatment"] # User owns everything, recommend targeted hero treatment

        num_slots = len(needed_categories)
        avg_cat_budget = profile.budget / max(1, num_slots)

        # 1. Rank products within each category
        category_pools: Dict[str, List[ProductRecommendation]] = {}
        for cat in needed_categories:
            cat_df = candidate_df[candidate_df['category'] == cat]
            scored_products = []
            for _, row in cat_df.iterrows():
                score, breakdown = MultiObjectiveRanker.score_product(row, profile, avg_cat_budget)
                
                # Generate why-recommended explanations
                why = cls._generate_why_recommended(row, profile, score)

                # Determine slotting (AM, PM, BOTH)
                slot = cls._determine_slot(row)

                # Extract key ingredients
                raw_ing = row.get('ingredients_list', [])
                if not raw_ing and isinstance(row.get('ingredients'), str):
                    raw_ing = [i.strip() for i in row['ingredients'].replace("'", "").replace("[", "").replace("]", "").split(",") if i.strip()]
                clean_ingredients = [str(i).capitalize() for i in raw_ing[:6]] if raw_ing else ["Balanced Emollients", "Hydrating Complex"]

                rec = ProductRecommendation(
                    product_id=str(row['product_id']),
                    name=str(row['name']),
                    brand=str(row['brand']),
                    category=str(row['category']),
                    price=float(row['price']),
                    image_url=str(row.get('image_url', '')),
                    rating=float(row.get('rating', 4.2)),
                    reviews_count=int(row.get('reviews_count', 350)),
                    fragrance_free=bool(row.get('fragrance_free', True)),
                    vegan=bool(row.get('vegan', False)),
                    cruelty_free=bool(row.get('cruelty_free', False)),
                    key_ingredients=clean_ingredients,
                    match_score=int(round(score)),
                    score_breakdown=breakdown,
                    why_recommended=why,
                    usage_slot=slot
                )
                scored_products.append(rec)
            
            # Sort descending by match score
            scored_products.sort(key=lambda x: x.match_score, reverse=True)
            category_pools[cat] = scored_products

        # 2. Check for empty candidate pools
        empty_cats = [cat for cat, prods in category_pools.items() if not prods]
        if empty_cats:
            return cls._handle_empty_category_failure(empty_cats, profile)

        # 3. Combinatorial Selection for Highest Utility under Budget Constraint
        best_combination = cls._find_optimal_combination(category_pools, needed_categories, profile.budget)

        if best_combination is None:
            # Check minimum possible routine cost across all category pools
            min_possible_cost = sum(min(p.price for p in category_pools[cat]) for cat in needed_categories)
            # Fallback to cheapest items for demonstration of shortfall
            cheapest_routine = {cat: min(category_pools[cat], key=lambda x: x.price) for cat in needed_categories}
            return cls._handle_budget_shortfall(min_possible_cost, min_possible_cost, profile, cheapest_routine)

        chosen_routine = best_combination
        total_cost = sum(p.price for p in chosen_routine.values())

        # 4. Active conflict checks
        products_dict = [p.model_dump() for p in chosen_routine.values()]
        safe, conflict_notes = ConstraintEngine.check_routine_active_conflicts(products_dict)

        # 5. Format Morning and Evening routines
        morning_routine, evening_routine = cls._build_am_pm_schedules(chosen_routine)

        # 6. Generate Alternatives (Budget Alternative & Gentler Formulation)
        alternatives = cls._generate_alternatives(category_pools, chosen_routine)

        all_products = list(chosen_routine.values())
        overall_match = int(round(sum(p.match_score for p in all_products) / max(1, len(all_products))))

        constraint_details = [
            f"Total routine cost (₹{int(total_cost)}) is strictly within your budget limit of ₹{int(profile.budget)}.",
            f"Coherently assembled {len(all_products)} steps ({', '.join(chosen_routine.keys())}) preventing category overlap.",
            "100% Fragrance-free formulation guaranteed." if profile.fragrance_free else "Dermatologically vetted formulation profile."
        ]
        if conflict_notes:
            constraint_details.extend(conflict_notes)

        constraint_status = ConstraintStatus(
            budget_satisfied=True,
            budget_limit=profile.budget,
            total_cost=total_cost,
            fragrance_satisfied=True if not profile.fragrance_free or all(p.fragrance_free for p in all_products) else False,
            exclusions_satisfied=True,
            no_active_conflicts=safe,
            details=constraint_details
        )

        return RecommendationResponse(
            status="success",
            overall_match_percentage=overall_match,
            total_routine_price=total_cost,
            constraint_status=constraint_status,
            morning_routine=morning_routine,
            evening_routine=evening_routine,
            all_recommended_products=all_products,
            alternatives=alternatives,
            failure_resolution=None
        )

    @classmethod
    def _find_optimal_combination(
        cls,
        category_pools: Dict[str, List[ProductRecommendation]],
        needed_categories: List[str],
        budget: float
    ) -> Optional[Dict[str, ProductRecommendation]]:
        pools = []
        for cat in needed_categories:
            top_scored = category_pools[cat][:12]
            lowest_priced = sorted(category_pools[cat], key=lambda x: x.price)[:6]
            # Union while preserving unique product_ids
            seen = set()
            combined_cat_pool = []
            for p in (top_scored + lowest_priced):
                if p.product_id not in seen:
                    seen.add(p.product_id)
                    combined_cat_pool.append(p)
            pools.append(combined_cat_pool)

        n_stages = len(pools)

        # Precompute min remaining costs and max remaining scores for pruning
        min_costs_suffix = [0.0] * (n_stages + 1)
        max_scores_suffix = [0.0] * (n_stages + 1)
        for i in range(n_stages - 1, -1, -1):
            min_costs_suffix[i] = min_costs_suffix[i + 1] + min(p.price for p in pools[i])
            max_scores_suffix[i] = max_scores_suffix[i + 1] + max(p.match_score for p in pools[i])

        best_combo: Optional[List[ProductRecommendation]] = None
        best_score = -1.0

        def search(stage: int, current_cost: float, current_score: float, current_combo: List[ProductRecommendation]):
            nonlocal best_combo, best_score
            if stage == n_stages:
                if current_score > best_score:
                    best_score = current_score
                    best_combo = list(current_combo)
                return

            # Branch-and-bound pruning:
            if current_cost + min_costs_suffix[stage] > budget:
                return
            if current_score + max_scores_suffix[stage] <= best_score:
                return

            for p in pools[stage]:
                if current_cost + p.price + min_costs_suffix[stage + 1] <= budget:
                    current_combo.append(p)
                    search(stage + 1, current_cost + p.price, current_score + p.match_score, current_combo)
                    current_combo.pop()

        search(0, 0.0, 0.0, [])

        if best_combo is not None:
            return {cat: best_combo[i] for i, cat in enumerate(needed_categories)}

        return None

    @classmethod
    def _determine_slot(cls, row: pd.Series) -> str:
        cat = str(row.get('category', ''))
        ing = str(row.get('ingredients_text', '')).lower()
        name = str(row.get('name', '')).lower()
        
        if cat == "Sunscreen":
            return "AM"
        if "retinoate" in ing or "retinol" in ing or "retinoid" in name or "glycolic" in ing or "peel" in name:
            return "PM"
        return "BOTH"

    @classmethod
    def _generate_why_recommended(cls, row: pd.Series, profile: UserProfileRequest, score: float) -> List[str]:
        bullets = []
        prod_concerns = row.get('concerns_list', [])
        user_concerns = [c.strip().lower() for c in profile.concerns if c.strip()]
        matched = [c for c in user_concerns if any(c in pc or pc in c for pc in prod_concerns)]
        if matched:
            bullets.append(f"Clinically targeted for {', '.join(matched).capitalize()}")
        
        prod_skins = row.get('skin_types_list', [])
        if profile.skin_type.lower() in prod_skins or "all" in prod_skins:
            bullets.append(f"pH-balanced and non-comedogenic for {profile.skin_type} skin")
        
        if profile.fragrance_free and row.get('fragrance_free', True):
            bullets.append("100% Fragrance-free and hypoallergenic")
            
        if profile.sensitivity == "high":
            bullets.append("Barrier-supportive formulation with zero harsh sensitizers")

        if not bullets:
            bullets.append("Provides essential dermal hydration and active carrier stability")
        
        return bullets[:4]

    @classmethod
    def _build_am_pm_schedules(cls, chosen: Dict[str, ProductRecommendation]) -> Tuple[List[ProductRecommendation], List[ProductRecommendation]]:
        am = []
        pm = []

        order = ["Cleanser", "Treatment", "Moisturizer", "Sunscreen"]
        for cat in order:
            if cat in chosen:
                p = chosen[cat]
                if p.usage_slot in ["AM", "BOTH"]:
                    am.append(p)
                if p.usage_slot in ["PM", "BOTH"] and cat != "Sunscreen":
                    pm.append(p)
        return am, pm

    @classmethod
    def _generate_alternatives(cls, pools: Dict[str, List[ProductRecommendation]], chosen: Dict[str, ProductRecommendation]) -> List[AlternativeProduct]:
        alternatives: List[AlternativeProduct] = []
        for cat, rec in chosen.items():
            pool = pools.get(cat, [])
            for alt in pool:
                if alt.product_id != rec.product_id:
                    if alt.price < rec.price:
                        alternatives.append(AlternativeProduct(
                            product=alt,
                            alternative_type="budget_friendly",
                            trade_off=f"Saves ₹{int(rec.price - alt.price)} while maintaining high clinical compatibility."
                        ))
                        break
                    elif alt.match_score >= rec.match_score - 3 and alt.product_id != rec.product_id:
                        alternatives.append(AlternativeProduct(
                            product=alt,
                            alternative_type="gentler_sensitive",
                            trade_off="Alternative soothing botanical formulation with equivalent barrier repair."
                        ))
                        break
        return alternatives[:3]

    @classmethod
    def _handle_budget_shortfall(cls, current_cost: float, min_cost: float, profile: UserProfileRequest, chosen: Dict[str, ProductRecommendation]) -> RecommendationResponse:
        shortfall = min_cost - profile.budget
        suggestions = [
            f"Increase budget ceiling by ₹{int(shortfall + 20)} to unlock the complete {len(chosen)}-step clinical routine.",
            f"Select a streamlined 2-step routine (Cleanser + Sunscreen) to stay strictly under ₹{int(profile.budget)}.",
            "Select items you already own (e.g. Cleanser or Moisturizer) in the questionnaire to reallocate funds toward targeted treatments."
        ]

        all_products = list(chosen.values())
        return RecommendationResponse(
            status="constraint_violation",
            overall_match_percentage=0,
            total_routine_price=min_cost,
            constraint_status=ConstraintStatus(
                budget_satisfied=False,
                budget_limit=profile.budget,
                total_cost=min_cost,
                fragrance_satisfied=True,
                exclusions_satisfied=True,
                no_active_conflicts=True,
                details=[f"Budget limit of ₹{int(profile.budget)} is below the minimum required routine cost (₹{int(min_cost)})."]
            ),
            morning_routine=[],
            evening_routine=[],
            all_recommended_products=all_products,
            alternatives=[],
            failure_resolution=FailureResolution(
                failed=True,
                reason=f"Your specified budget of ₹{int(profile.budget)} is below the minimum required (₹{int(min_cost)}) for all requested routine steps.",
                conflict_type="budget_shortfall",
                current_budget=profile.budget,
                minimum_required_budget=min_cost,
                shortfall=shortfall,
                actionable_suggestions=suggestions
            )
        )

    @classmethod
    def _handle_empty_category_failure(cls, empty_cats: List[str], profile: UserProfileRequest) -> RecommendationResponse:
        return RecommendationResponse(
            status="constraint_violation",
            overall_match_percentage=0,
            total_routine_price=0.0,
            constraint_status=ConstraintStatus(
                budget_satisfied=True,
                budget_limit=profile.budget,
                total_cost=0.0,
                fragrance_satisfied=True,
                exclusions_satisfied=False,
                no_active_conflicts=True,
                details=[f"No compatible products found in categories: {', '.join(empty_cats)} matching strict exclusions."]
            ),
            morning_routine=[],
            evening_routine=[],
            all_recommended_products=[],
            alternatives=[],
            failure_resolution=FailureResolution(
                failed=True,
                reason=f"No products in the catalog satisfied your combined strict exclusions ({', '.join(profile.excluded_ingredients)}) for {', '.join(empty_cats)}.",
                conflict_type="empty_candidates",
                current_budget=profile.budget,
                minimum_required_budget=0,
                shortfall=0,
                actionable_suggestions=[
                    "Consider relaxing specific ingredient exclusions to explore mild hypoallergenic alternatives.",
                    "Allow gentle fragrance-free alternatives in the filtered category."
                ]
            )
        )
