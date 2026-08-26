import re
from typing import Dict, Any, List, Optional
from ..schemas.recommendation import ProblemParseResponse

def parse_skincare_problem(query: str) -> ProblemParseResponse:
    q = query.lower()
    
    # 1. Skin Type Extraction
    skin_type = "combination" # default balanced fallback
    if re.search(r'\b(oily|excess sebum|very oily|shiny skin|greasy)\b', q):
        skin_type = "oily"
    elif re.search(r'\b(dry|flaky|dehydrated|parched|very dry)\b', q):
        skin_type = "dry"
    elif re.search(r'\b(combination|combo|t-zone|t zone)\b', q):
        skin_type = "combination"
    elif re.search(r'\b(sensitive|reactive|burns easily|stings)\b', q) and not re.search(r'\b(normal|combination)\b', q):
        skin_type = "sensitive"
    elif re.search(r'\b(normal|balanced)\b', q):
        skin_type = "normal"

    # 2. Concerns Extraction
    concerns: List[str] = []
    concern_map = {
        "acne": [
            "acne", "pimple", "pimples", "breakout", "breakouts", "zits", "zit",
            "blemish", "blemishes", "cystic", "whiteheads", "blackheads", "clogged"
        ],
        "hyperpigmentation": [
            "pigmentation", "dark spots", "hyperpigmentation", "marks", "sun spots",
            "melasma", "discoloration", "uneven tone", "acne marks", "blemish marks"
        ],
        "redness": [
            "redness", "rosacea", "inflammation", "irritation", "flushing", "stinging"
        ],
        "dryness": [
            "dryness", "dehydration", "flaky", "peeling", "tightness", "rough skin"
        ],
        "barrier_repair": [
            "barrier", "damaged barrier", "compromised barrier", "burning", "stinging",
            "over-exfoliated", "over exfoliated"
        ],
        "anti_aging": [
            "aging", "wrinkles", "fine lines", "firmness", "elasticity", "mature", "sagging"
        ],
        "dullness": [
            "dull", "dullness", "radiance", "glow", "glowless", "tired looking", "brightening"
        ],
        "enlarged_pores": [
            "pores", "enlarged pores", "large pores", "blackhead", "blackheads"
        ],
        "oiliness": [
            "excess oil", "greasy", "shiny", "sebum", "very oily"
        ]
    }

    for concern_key, keywords in concern_map.items():
        if any(re.search(rf'\b{re.escape(kw)}\b', q) for kw in keywords):
            if concern_key not in concerns:
                concerns.append(concern_key)
    
    if not concerns:
        # Contextual fallback based on extracted skin type
        if skin_type == "oily":
            concerns = ["oiliness", "enlarged_pores"]
        elif skin_type == "dry":
            concerns = ["dryness", "barrier_repair"]
        elif skin_type == "sensitive":
            concerns = ["redness", "barrier_repair"]
        else:
            concerns = ["dullness"]

    # 3. Sensitivity Tier
    sensitivity = "medium"
    if re.search(r'\b(highly sensitive|very sensitive|super sensitive|extremely sensitive|eczema|rosacea|reactive skin|burns easily)\b', q):
        sensitivity = "high"
    elif re.search(r'\b(not sensitive|resilient|tough skin|rarely reacts|non-sensitive)\b', q):
        sensitivity = "low"
    elif re.search(r'\b(sensitive)\b', q):
        sensitivity = "high"

    # 4. Budget Extraction
    budget: float = 1500.0 # Default benchmark baseline
    q_normalized = re.sub(r'(?<=\d),(?=\d)', '', q)
    # Check "1.5k", "2k", "3k" notation
    k_match = re.search(r'(?:budget|under|below|max|around|up to|₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*k\b', q_normalized)
    if k_match:
        val = float(k_match.group(1)) * 1000.0
        if val >= 200:
            budget = val
    else:
        budget_patterns = [
            r'(?:budget|under|below|max|around|up to|approx|limit|ceiling|within|rs\.?|inr|₹)\s*(\d{3,5})',
            r'(\d{3,5})\s*(?:rs|inr|rupees|bucks|/-)?\s*(?:budget|max|only|limit)?'
        ]
        for pattern in budget_patterns:
            match = re.search(pattern, q_normalized)
            if match:
                found_val = float(match.group(1))
                if 200 <= found_val <= 20000:
                    budget = found_val
                    break

    # 5. Preferences
    fragrance_free = bool(re.search(
        r'(?:fragrance[\s-]free|no fragrance|without fragrance|avoid fragrance|unscented|perfume[\s-]free|no perfume|without perfume|avoid perfume|don[\'t\s]+want perfume|zero perfume|free from perfume|fragrance\s+free)',
        q
    ))
    if sensitivity == "high":
        fragrance_free = True # Automatic default for high-sensitivity profiles
    vegan = bool(re.search(r'\b(?:vegan|100% vegan)\b', q))
    cruelty_free = bool(re.search(r'\b(?:cruelty[\s-]free|not tested on animals|leaping bunny)\b', q))

    # 6. Excluded Ingredients
    excluded_ingredients: List[str] = []
    exclusion_patterns = [
        (r'\b(?:no|avoid|without|free from|exclude)\s+niacinamide\b', "Niacinamide"),
        (r'\b(?:no|avoid|without|free from|exclude)\s+(?:salicylic|bha)\b', "Salicylic Acid"),
        (r'\b(?:no|avoid|without|free from|exclude)\s+(?:retinol|retinoid|tretinoin)\b', "Retinoid"),
        (r'\b(?:no|avoid|without|free from|exclude)\s+(?:vitamin c|ascorbic)\b', "Vitamin C"),
        (r'\b(?:no|avoid|without|free from|exclude)\s+(?:glycolic|aha)\b', "Glycolic Acid"),
        (r'\b(?:no|avoid|without|free from|exclude)\s+(?:fragrance|parfum)\b', "Fragrance"),
        (r'\b(?:no|avoid|without|free from|exclude)\s+(?:alcohol|denatured alcohol)\b', "Alcohol")
    ]

    for pat, ingredient_name in exclusion_patterns:
        if re.search(pat, q):
            if ingredient_name not in excluded_ingredients:
                excluded_ingredients.append(ingredient_name)

    # Explanation
    concern_text = ", ".join(concerns) if concerns else "general barrier health"
    exclusions_text = f" while strictly excluding {', '.join(excluded_ingredients)}" if excluded_ingredients else ""
    explanation = (
        f"Identified {skin_type} skin with priority on {concern_text}. "
        f"Configured ₹{int(budget)} total routine budget ceiling with {sensitivity} sensitivity threshold"
        f"{exclusions_text}."
    )

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
