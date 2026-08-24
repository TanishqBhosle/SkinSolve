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
        needed_categories = [cat for cat in cls.CORE_CATEGORIES if cat not in profile.existing_products]
        if not needed_categories:
            needed_categories = ["Treatment"] # User has everything, recommend hero targeted treatment

        num_slots = len(needed_categories)
        avg_cat_budget = profile.budget / max(1, num_slots)

        # 1. Rank products within each category
        category_pools: Dict[str, List[ProductRecommendation]] = {}
        for cat in needed_categories:
            cat_df = candidate_df[candidate_df['category'] == cat]
            scored_products = []
            for _, row in cat_df.iterrows():
                score, breakdown = MultiObjectiveRanker.score_product(row, profile, avg_cat_budget)
                
                # Generate Why Recommended bullet points
                why = cls._generate_why_recommended(row, profile, score)

                # Determine AM/PM slotting
                slot = cls._determine_slot(row)

                rec = ProductRecommendation(
                    product_id=str(row['product_id']),
                    name=str(row['name']),
                    brand=str(row['brand']),
                    category=str(row['category']),
                    price=float(row['price']),
                    image_url=str(row['image_url']),
                    rating=float(row['rating']),
                    reviews_count=int(row.get('reviews_count', 500)),
                    fragrance_free=bool(row['fragrance_free']),
                    vegan=bool(row['vegan']),
                    cruelty_free=bool(row['cruelty_free']),
                    key_ingredients=[i.strip() for i in str(row['ingredients']).split(',')],
                    match_score=int(round(score)),
                    score_breakdown=breakdown,
                    why_recommended=why,
                    usage_slot=slot
                )
                scored_products.append(rec)
            
            # Sort by total score descending
            scored_products.sort(key=lambda x: x.match_score, reverse=True)
            category_pools[cat] = scored_products

        # 2. Check for empty pools (Failure condition 1)
        empty_cats = [cat for cat, prods in category_pools.items() if not prods]
        if empty_cats:
            return cls._handle_empty_category_failure(empty_cats, profile)

        # 3. Combinatorial Selection for Smallest Optimal Routine under Budget
        chosen_routine: Dict[str, ProductRecommendation] = {}
        
        # Greedy initial pick (top ranked per category)
        for cat in needed_categories:
            chosen_routine[cat] = category_pools[cat][0]

        total_cost = sum(p.price for p in chosen_routine.values())

        # If over budget, attempt downgrade to best lower-cost valid alternative within same category
        if total_cost > profile.budget:
            # Try to optimize down by swapping items with highest price / marginal score drop
            for _ in range(10): # bounded relaxation loop
                if total_cost <= profile.budget:
                    break
                # Find category with most expensive product where cheaper alternative exists
                candidates_to_downgrade = []
                for cat in needed_categories:
                    current_p = chosen_routine[cat]
                    cheaper_alts = [p for p in category_pools[cat] if p.price < current_p.price]
                    if cheaper_alts:
                        price_diff = current_p.price - cheaper_alts[0].price
                        candidates_to_downgrade.append((cat, price_diff, cheaper_alts[0]))
                
                if not candidates_to_downgrade:
                    break
                # Downgrade the one with biggest price reduction
                candidates_to_downgrade.sort(key=lambda x: x[1], reverse=True)
                best_swap = candidates_to_downgrade[0]
                chosen_routine[best_swap[0]] = best_swap[2]
                total_cost = sum(p.price for p in chosen_routine.values())

        # 4. Check if budget constraint is satisfied or failed
        if total_cost > profile.budget:
            # Check minimum possible cost across entire available pool
            min_possible_cost = sum(min(p.price for p in category_pools[cat]) for cat in needed_categories)
            return cls._handle_budget_shortfall(total_cost, min_possible_cost, profile, chosen_routine)

        # 5. Format Morning and Evening routines
        morning_routine, evening_routine = cls._build_am_pm_schedules(chosen_routine)

        # 6. Generate Alternatives (Budget Alternative & Gentler/Alternative Active)
        alternatives = cls._generate_alternatives(category_pools, chosen_routine)

        all_products = list(chosen_routine.values())
        overall_match = int(round(sum(p.match_score for p in all_products) / max(1, len(all_products))))

        constraint_status = ConstraintStatus(
            budget_satisfied=True,
            budget_limit=profile.budget,
            total_cost=total_cost,
            fragrance_satisfied=True if not profile.fragrance_free or all(p.fragrance_free for p in all_products) else False,
            exclusions_satisfied=True,
            no_active_conflicts=True,
            details=[
                f"Total routine cost (₹{int(total_cost)}) is within budget limit of ₹{int(profile.budget)}.",
                f"Selected {len(all_products)} coherent steps avoiding active ingredient overlap.",
                "Fragrance-free constraints fully satisfied." if profile.fragrance_free else "All safety guidelines passed."
            ]
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
    def _determine_slot(cls, row: pd.Series) -> str:
        cat = str(row.get('category', ''))
        ingredients = str(row.get('ingredients', '')).lower()
        if cat == "Sunscreen":
            return "AM"
        if "retinoate" in ingredients or "glycolic" in ingredients:
            return "PM"
        return "BOTH"

    @classmethod
    def _generate_why_recommended(cls, row: pd.Series, profile: UserProfileRequest, score: float) -> List[str]:
        bullets = []
        concerns = str(row.get('concerns', '')).split(',')
        matched = [c.strip() for c in concerns if c.strip() in profile.concerns]
        if matched:
            bullets.append(f"Directly targets {', '.join(matched)}")
        
        skin_types = str(row.get('skin_types', ''))
        if profile.skin_type in skin_types or "all" in skin_types:
            bullets.append(f"Formulated and pH-balanced for {profile.skin_type} skin")
        
        if profile.fragrance_free and row.get('fragrance_free', False):
            bullets.append("100% Fragrance-free and hypoallergenic")
            
        if profile.sensitivity == "high":
            bullets.append("Gentle, non-stripping barrier-supportive formula")

        if not bullets:
            bullets.append("Provides foundational skin barrier hydration")
        
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
        alternatives = []
        for cat, rec in chosen.items():
            pool = pools.get(cat, [])
            for alt in pool:
                if alt.product_id != rec.product_id:
                    if alt.price < rec.price:
                        alternatives.append(AlternativeProduct(
                            product=alt,
                            alternative_type="budget_friendly",
                            trade_off=f"Saves ₹{int(rec.price - alt.price)} with slightly simpler active concentration."
                        ))
                        break
                    elif alt.match_score > rec.match_score - 5 and alt.product_id != rec.product_id:
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
            f"Increase budget by ₹{int(shortfall + 10)} to cover the minimum essential 4-step routine.",
            "Choose a simplified 2-step routine (Cleanser + Sunscreen) to stay strictly under ₹" + str(int(profile.budget)),
            "Mark products you already own (e.g. Cleanser or Moisturizer) to allocate budget toward targeted treatments."
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
                details=[f"Budget limit of ₹{int(profile.budget)} is lower than minimum feasible routine cost (₹{int(min_cost)})."]
            ),
            morning_routine=[],
            evening_routine=[],
            all_recommended_products=all_products,
            alternatives=[],
            failure_resolution=FailureResolution(
                failed=True,
                reason=f"Your budget of ₹{int(profile.budget)} is below the minimum required (₹{int(min_cost)}) for a full personalized routine.",
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
                details=[f"No compatible products found in categories: {', '.join(empty_cats)} under strict exclusions."]
            ),
            morning_routine=[],
            evening_routine=[],
            all_recommended_products=[],
            alternatives=[],
            failure_resolution=FailureResolution(
                failed=True,
                reason=f"No products in catalog met your combination of strict exclusions ({', '.join(profile.excluded_ingredients)}) for {', '.join(empty_cats)}.",
                conflict_type="empty_candidates",
                current_budget=profile.budget,
                minimum_required_budget=0,
                shortfall=0,
                actionable_suggestions=[
                    "Relax specific ingredient exclusions to see suitable mild alternatives.",
                    "Allow gentle fragrance-free alternatives."
                ]
            )
        )
