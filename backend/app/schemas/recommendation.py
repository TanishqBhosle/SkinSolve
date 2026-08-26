from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class UserProfileRequest(BaseModel):
    skin_type: str = Field(..., description="User's primary skin type (oily, dry, combination, sensitive, normal)")
    concerns: List[str] = Field(default_factory=list, description="Target skin concerns (acne, hyperpigmentation, redness, dryness, anti_aging, dullness, etc.)")
    sensitivity: str = Field(default="medium", description="Sensitivity tier: low, medium, high")
    budget: float = Field(..., gt=0, description="Total budget ceiling in INR")
    fragrance_free: bool = Field(default=False, description="Strict requirement for fragrance-free formulations")
    vegan: bool = Field(default=False, description="Strict vegan preference")
    cruelty_free: bool = Field(default=False, description="Strict cruelty-free preference")
    existing_products: List[str] = Field(default_factory=list, description="Product categories already owned and retained (e.g. ['Cleanser', 'Moisturizer'])")
    excluded_ingredients: List[str] = Field(default_factory=list, description="Specific ingredients to strictly avoid")

class ProblemParseRequest(BaseModel):
    query: str = Field(..., description="Natural language description of skin state, goals, and constraints")

class ProblemParseResponse(BaseModel):
    raw_query: str
    skin_type: Optional[str]
    concerns: List[str]
    sensitivity: str
    budget: Optional[float]
    fragrance_free: bool
    vegan: bool
    cruelty_free: bool
    excluded_ingredients: List[str]
    explanation: str

class ProductScoreBreakdown(BaseModel):
    concern_match: float
    ingredient_match: float
    skin_compatibility: float
    preference_match: float
    budget_fit: float
    evidence_score: float
    total_score: float

class ProductRecommendation(BaseModel):
    product_id: str
    name: str
    brand: str
    category: str
    price: float
    image_url: str
    rating: float
    reviews_count: int
    fragrance_free: bool
    vegan: bool
    cruelty_free: bool
    key_ingredients: List[str]
    match_score: int
    score_breakdown: ProductScoreBreakdown
    why_recommended: List[str]
    why_not_reasons: List[str] = Field(default_factory=list)
    usage_slot: str  # AM, PM, or BOTH

class AlternativeProduct(BaseModel):
    product: ProductRecommendation
    alternative_type: str  # "budget_friendly", "gentler_sensitive", "higher_evidence"
    trade_off: str

class RoutineGroup(BaseModel):
    cleanser: Optional[ProductRecommendation] = None
    treatment: Optional[ProductRecommendation] = None
    moisturizer: Optional[ProductRecommendation] = None
    sunscreen: Optional[ProductRecommendation] = None
    total_price: float = 0.0

class ConstraintStatus(BaseModel):
    budget_satisfied: bool
    budget_limit: float
    total_cost: float
    fragrance_satisfied: bool
    exclusions_satisfied: bool
    no_active_conflicts: bool
    details: List[str]

class FailureResolution(BaseModel):
    failed: bool
    reason: Optional[str] = None
    conflict_type: Optional[str] = None # "budget_shortfall", "empty_candidates", "active_conflict"
    current_budget: Optional[float] = None
    minimum_required_budget: Optional[float] = None
    shortfall: Optional[float] = None
    actionable_suggestions: List[str] = Field(default_factory=list)

class RecommendationResponse(BaseModel):
    status: str # "success" or "constraint_violation"
    overall_match_percentage: int
    total_routine_price: float
    constraint_status: ConstraintStatus
    morning_routine: List[ProductRecommendation]
    evening_routine: List[ProductRecommendation]
    all_recommended_products: List[ProductRecommendation]
    alternatives: List[AlternativeProduct]
    failure_resolution: Optional[FailureResolution] = None
