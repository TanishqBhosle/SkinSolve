export interface ProductScoreBreakdown {
  concern_match: number;
  ingredient_match: number;
  skin_compatibility: number;
  preference_match: number;
  budget_fit: number;
  evidence_score: number;
  total_score: number;
}

export interface ProductRecommendation {
  product_id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  image_url: string;
  rating: number;
  reviews_count: number;
  fragrance_free: boolean;
  vegan: boolean;
  cruelty_free: boolean;
  key_ingredients: string[];
  match_score: number;
  score_breakdown: ProductScoreBreakdown;
  why_recommended: string[];
  usage_slot: 'AM' | 'PM' | 'BOTH';
}

export interface AlternativeProduct {
  product: ProductRecommendation;
  alternative_type: string;
  trade_off: string;
}

export interface ConstraintStatus {
  budget_satisfied: boolean;
  budget_limit: number;
  total_cost: number;
  fragrance_satisfied: boolean;
  exclusions_satisfied: boolean;
  no_active_conflicts: boolean;
  details: string[];
}

export interface FailureResolution {
  failed: boolean;
  reason?: string;
  conflict_type?: string;
  current_budget?: number;
  minimum_required_budget?: number;
  shortfall?: number;
  actionable_suggestions: string[];
}

export interface RecommendationResponse {
  status: 'success' | 'constraint_violation';
  overall_match_percentage: number;
  total_routine_price: number;
  constraint_status: ConstraintStatus;
  morning_routine: ProductRecommendation[];
  evening_routine: ProductRecommendation[];
  all_recommended_products: ProductRecommendation[];
  alternatives: AlternativeProduct[];
  failure_resolution?: FailureResolution | null;
}

export interface UserProfileRequest {
  skin_type: string;
  concerns: string[];
  sensitivity: string;
  budget: number;
  fragrance_free: boolean;
  vegan: boolean;
  cruelty_free: boolean;
  existing_products: string[];
  excluded_ingredients: string[];
}

export interface ProblemParseResponse {
  raw_query: string;
  skin_type?: string;
  concerns: string[];
  sensitivity: string;
  budget?: number;
  fragrance_free: boolean;
  vegan: boolean;
  cruelty_free: boolean;
  excluded_ingredients: string[];
  explanation: string;
}
