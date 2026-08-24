import re
from typing import Dict, Any, List
from ..schemas.recommendation import ProblemParseResponse

def parse_skincare_problem(query: str) -> ProblemParseResponse:
    q = query.lower()
    
    # 1. Skin Type
    skin_type = "combination" # default fallback
    if "oily" in q:
        skin_type = "oily"
    elif "dry" in q:
        skin_type = "dry"
    elif "sensitive" in q and ("normal" not in q and "combination" not in q):
        skin_type = "sensitive"
    elif "combination" in q or "combo" in q:
        skin_type = "combination"
    elif "normal" in q:
        skin_type = "normal"

    # 2. Concerns
    concerns: List[str] = []
    concern_map = {
        "acne": ["acne", "pimples", "breakout", "breakouts", "zits", "blemish", "blemishes"],
        "hyperpigmentation": ["pigmentation", "dark spots", "hyperpigmentation", "marks", "sun spots", "melasma"],
        "redness": ["redness", "rosacea", "inflammation", "irritation", "flushing"],
        "dryness": ["dryness", "dehydration", "flaky", "peeling", "tightness"],
        "barrier_repair": ["barrier", "damaged barrier", "burning", "stinging"],
        "anti_aging": ["aging", "wrinkles", "fine lines", "firmness", "elasticity"],
        "dullness": ["dull", "dullness", "radiance", "glow", "glowless"],
        "enlarged_pores": ["pores", "enlarged pores", "blackheads", "whiteheads", "clogged pores"],
        "oiliness": ["excess oil", "greasy", "shiny", "sebum"]
    }

    for concern_key, keywords in concern_map.items():
        if any(kw in q for kw in keywords):
            if concern_key not in concerns:
                concerns.append(concern_key)
    
    if not concerns:
        # Fallback default based on skin type
        if skin_type == "oily":
            concerns = ["oiliness", "enlarged_pores"]
        elif skin_type == "dry":
            concerns = ["dryness", "barrier_repair"]
        else:
            concerns = ["dullness"]

    # 3. Sensitivity Tier
    sensitivity = "medium"
    if "highly sensitive" in q or "very sensitive" in q or "super sensitive" in q or "eczema" in q or "rosacea" in q:
        sensitivity = "high"
    elif "not sensitive" in q or "resilient" in q or "rarely reacts" in q:
        sensitivity = "low"
    elif "sensitive" in q:
        sensitivity = "high"

    # 4. Budget Extraction (INR / Rs / Rupees / digits)
    budget = 1500.0 # Default reasonable budget
    budget_patterns = [
        r'(?:budget|under|below|max|around|up to|rs\.?|inr|₹)\s*(\d{3,5})',
        r'(\d{3,5})\s*(?:rs|inr|rupees|bucks)?\s*(?:budget|max|only)?'
    ]
    for pattern in budget_patterns:
        match = re.search(pattern, q)
        if match:
            found_val = float(match.group(1))
            if found_val >= 200: # realistic minimum filter
                budget = found_val
                break

    # 5. Preferences
    fragrance_free = bool(re.search(r'(?:fragrance[\s-]free|no fragrance|without fragrance|avoid fragrance|unscented)', q))
    vegan = bool(re.search(r'(?:vegan|cruelty-free and vegan)', q))
    cruelty_free = bool(re.search(r'(?:cruelty[\s-]free|not tested on animals)', q))

    # 6. Excluded ingredients
    excluded_ingredients = []
    if "no niacinamide" in q or "avoid niacinamide" in q:
        excluded_ingredients.append("Niacinamide")
    if "no salicylic" in q or "avoid salicylic" in q:
        excluded_ingredients.append("Salicylic Acid")
    if "no retinoid" in q or "avoid retinoid" in q or "no retinol" in q:
        excluded_ingredients.append("Hydroxypinacolone Retinoate")

    explanation = f"Detected {skin_type} skin with {', '.join(concerns) if concerns else 'general maintenance'}. Extracted ₹{int(budget)} budget constraint with {sensitivity} sensitivity profile."

    return ProblemParseResponse(
        raw_query=query,
        skin_type=skin_type,
        concerns=concerns,
        sensitivity=sensitivity,
        budget=budget,
        fragrance_free=fragrance_free,
        vegan=vegan,
        cruelty_free=cruelty_free,
        excluded_ingredients=excluded_ingredients,
        explanation=explanation
    )
