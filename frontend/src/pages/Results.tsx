import React, { useState } from 'react';
import type { RecommendationResponse, UserProfileRequest, ProductRecommendation } from '../types/skincare';
import { CheckCircle2, AlertTriangle, Sparkles, Sun, Moon, Info, RefreshCw, ShieldCheck } from 'lucide-react';

interface ResultsProps {
  data: RecommendationResponse;
  userProfile: UserProfileRequest;
  onModifyProfile: () => void;
}

export const Results: React.FC<ResultsProps> = ({ data, userProfile, onModifyProfile }) => {
  const [activeTab, setActiveTab] = useState<'routine' | 'breakdown' | 'alternatives'>('routine');
  const [routinePeriod, setRoutinePeriod] = useState<'AM' | 'PM'>('AM');
  const [selectedProductForModal, setSelectedProductForModal] = useState<ProductRecommendation | null>(null);

  // Handle Failure State cleanly
  if (data.status === 'constraint_violation' && data.failure_resolution) {
    const res = data.failure_resolution;
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-surface-card p-8 sm:p-10 rounded-3xl border border-red-200 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-6">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <h2 className="text-2xl font-bold font-serif text-charcoal-900 mb-2">
            We couldn't build a complete routine within all your constraints.
          </h2>

          <p className="text-sm text-charcoal-600 mb-6 leading-relaxed">
            {res.reason}
          </p>

          {/* Budget Shortfall breakdown if applicable */}
          {res.shortfall && res.shortfall > 0 && (
            <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl bg-surface-muted border border-surface-border mb-8 text-center">
              <div>
                <span className="text-xs text-charcoal-500 block uppercase font-medium">Your Budget</span>
                <span className="text-lg font-bold text-charcoal-900 font-serif">₹{res.current_budget}</span>
              </div>
              <div>
                <span className="text-xs text-charcoal-500 block uppercase font-medium">Min Required</span>
                <span className="text-lg font-bold text-sage-800 font-serif">₹{res.minimum_required_budget}</span>
              </div>
              <div>
                <span className="text-xs text-red-600 block uppercase font-medium">Shortfall</span>
                <span className="text-lg font-bold text-red-600 font-serif">+₹{Math.round(res.shortfall)}</span>
              </div>
            </div>
          )}

          <div className="space-y-3 mb-8">
            <span className="text-xs font-bold text-charcoal-800 uppercase tracking-wider block">Recommended Next Steps:</span>
            {res.actionable_suggestions.map((sug, idx) => (
              <div key={idx} className="flex items-start space-x-3 text-sm text-charcoal-700 bg-surface-card p-3 rounded-xl border border-surface-border">
                <CheckCircle2 className="w-4 h-4 text-sage-700 mt-0.5 shrink-0" />
                <span>{sug}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              onClick={onModifyProfile}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-sage-700 hover:bg-sage-800 text-white text-sm font-semibold transition-all shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Adjust Constraints & Retry</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentRoutine = routinePeriod === 'AM' ? data.morning_routine : data.evening_routine;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header Banner */}
      <div className="bg-surface-card p-6 sm:p-8 rounded-3xl border border-surface-border shadow-sm mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sage-100 text-sage-800 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personalized Routine Engineered</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-charcoal-900">
              Your Customized Routine is Ready
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-600 mt-1">
              Engineered for <span className="font-semibold text-sage-800">{userProfile.skin_type} skin</span> targeting <span className="font-semibold text-sage-800">{userProfile.concerns.join(', ')}</span> under a strict ₹{userProfile.budget} budget.
            </p>
          </div>

          <div className="flex items-center gap-6 border-t sm:border-t-0 sm:border-l border-surface-border pt-4 sm:pt-0 sm:pl-8">
            <div>
              <span className="text-xs text-charcoal-500 block uppercase font-medium">Match Fit</span>
              <span className="text-3xl font-bold text-sage-700 font-serif">{data.overall_match_percentage}%</span>
            </div>
            <div>
              <span className="text-xs text-charcoal-500 block uppercase font-medium">Total Cost</span>
              <span className="text-3xl font-bold text-charcoal-900 font-serif">₹{data.total_routine_price}</span>
            </div>
          </div>
        </div>

        {/* Constraint satisfaction summary */}
        <div className="mt-6 pt-6 border-t border-surface-border/60 flex flex-wrap gap-4 text-xs font-medium text-sage-800">
          <div className="inline-flex items-center space-x-1.5 bg-sage-50 px-3 py-1.5 rounded-lg border border-sage-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-sage-700" />
            <span>Budget Ceiling Respected (₹{data.total_routine_price} ≤ ₹{userProfile.budget})</span>
          </div>
          <div className="inline-flex items-center space-x-1.5 bg-sage-50 px-3 py-1.5 rounded-lg border border-sage-200">
            <ShieldCheck className="w-3.5 h-3.5 text-sage-700" />
            <span>Zero Conflicting Actives</span>
          </div>
          {userProfile.fragrance_free && (
            <div className="inline-flex items-center space-x-1.5 bg-sage-50 px-3 py-1.5 rounded-lg border border-sage-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-sage-700" />
              <span>100% Fragrance-Free Formulations</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-surface-border mb-8">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('routine')}
            className={`pb-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'routine'
                ? 'border-sage-700 text-sage-800'
                : 'border-transparent text-charcoal-500 hover:text-charcoal-800'
            }`}
          >
            Routine Steps
          </button>
          <button
            onClick={() => setActiveTab('breakdown')}
            className={`pb-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'breakdown'
                ? 'border-sage-700 text-sage-800'
                : 'border-transparent text-charcoal-500 hover:text-charcoal-800'
            }`}
          >
            Algorithm Score Breakdown
          </button>
          <button
            onClick={() => setActiveTab('alternatives')}
            className={`pb-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'alternatives'
                ? 'border-sage-700 text-sage-800'
                : 'border-transparent text-charcoal-500 hover:text-charcoal-800'
            }`}
          >
            Smart Alternatives ({data.alternatives.length})
          </button>
        </div>

        <button
          onClick={onModifyProfile}
          className="text-xs text-sage-700 font-semibold hover:underline"
        >
          Edit Preferences
        </button>
      </div>

      {/* Tab 1: Routine */}
      {activeTab === 'routine' && (
        <div>
          {/* AM / PM Toggle */}
          <div className="flex items-center space-x-3 mb-6">
            <button
              onClick={() => setRoutinePeriod('AM')}
              className={`inline-flex items-center space-x-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                routinePeriod === 'AM'
                  ? 'bg-sage-700 text-white shadow-sm'
                  : 'bg-surface-card border border-surface-border text-charcoal-600 hover:bg-sage-50'
              }`}
            >
              <Sun className="w-4 h-4" />
              <span>Morning Routine (AM)</span>
            </button>

            <button
              onClick={() => setRoutinePeriod('PM')}
              className={`inline-flex items-center space-x-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                routinePeriod === 'PM'
                  ? 'bg-sage-700 text-white shadow-sm'
                  : 'bg-surface-card border border-surface-border text-charcoal-600 hover:bg-sage-50'
              }`}
            >
              <Moon className="w-4 h-4" />
              <span>Evening Routine (PM)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentRoutine.map((product, idx) => (
              <div
                key={product.product_id}
                className="bg-surface-card rounded-2xl border border-surface-border p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-sage-100 text-sage-800 flex items-center justify-center font-bold text-sm font-serif shrink-0">
                      0{idx + 1}
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] font-bold text-sage-700 uppercase tracking-wider">{product.category}</span>
                      <h3 className="text-base font-bold text-charcoal-900 leading-snug">{product.name}</h3>
                      <span className="text-xs text-charcoal-500 font-medium">{product.brand}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-bold text-charcoal-900 font-serif">₹{product.price}</span>
                      <span className="block text-[11px] font-semibold text-sage-700">{product.match_score}% Match</span>
                    </div>
                  </div>

                  {/* Why recommended bullets */}
                  <div className="space-y-1.5 my-4 bg-surface-muted/60 p-3 rounded-xl">
                    <span className="text-[11px] font-bold text-charcoal-800 uppercase block mb-1">Why Recommended:</span>
                    {product.why_recommended.map((why, wIdx) => (
                      <div key={wIdx} className="flex items-center space-x-2 text-xs text-charcoal-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-sage-700 shrink-0" />
                        <span>{why}</span>
                      </div>
                    ))}
                  </div>

                  {/* Active ingredients */}
                  <div className="mt-3">
                    <span className="text-[10px] uppercase font-bold text-charcoal-400 block mb-1">Key Actives:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {product.key_ingredients.slice(0, 4).map((ing, iIdx) => (
                        <span key={iIdx} className="text-[11px] px-2 py-0.5 bg-surface-muted rounded-md text-charcoal-700 border border-surface-border">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-surface-border flex items-center justify-between">
                  <span className="text-xs text-charcoal-500 font-medium">Slot: {product.usage_slot === 'BOTH' ? 'AM & PM' : product.usage_slot}</span>
                  <button
                    onClick={() => setSelectedProductForModal(product)}
                    className="text-xs font-semibold text-sage-700 hover:text-sage-900 inline-flex items-center space-x-1"
                  >
                    <span>View Score Breakdown</span>
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Algorithm Breakdown */}
      {activeTab === 'breakdown' && (
        <div className="bg-surface-card p-6 sm:p-8 rounded-3xl border border-surface-border">
          <h2 className="text-xl font-bold font-serif text-charcoal-900 mb-2">Transparent Scoring Matrix</h2>
          <p className="text-xs sm:text-sm text-charcoal-600 mb-6">
            Detailed breakdown of how each product scored across the multi-objective objective function.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-surface-border text-charcoal-400 font-semibold uppercase text-[10px]">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-2">Concern (30%)</th>
                  <th className="py-3 px-2">Ingredient (20%)</th>
                  <th className="py-3 px-2">Skin Type (15%)</th>
                  <th className="py-3 px-2">Pref (15%)</th>
                  <th className="py-3 px-2">Budget (10%)</th>
                  <th className="py-3 px-2">Evidence (10%)</th>
                  <th className="py-3 px-4 text-right">Total Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {data.all_recommended_products.map((p) => (
                  <tr key={p.product_id} className="hover:bg-surface-muted/40">
                    <td className="py-3 px-4 font-semibold text-charcoal-900">{p.name}</td>
                    <td className="py-3 px-2 text-sage-800 font-medium">{p.score_breakdown.concern_match}/30</td>
                    <td className="py-3 px-2 text-sage-800 font-medium">{p.score_breakdown.ingredient_match}/20</td>
                    <td className="py-3 px-2 text-sage-800 font-medium">{p.score_breakdown.skin_compatibility}/15</td>
                    <td className="py-3 px-2 text-sage-800 font-medium">{p.score_breakdown.preference_match}/15</td>
                    <td className="py-3 px-2 text-sage-800 font-medium">{p.score_breakdown.budget_fit}/10</td>
                    <td className="py-3 px-2 text-sage-800 font-medium">{p.score_breakdown.evidence_score}/10</td>
                    <td className="py-3 px-4 text-right font-bold text-sage-700 font-serif">{p.match_score}/100</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Alternatives */}
      {activeTab === 'alternatives' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.alternatives.map((alt, idx) => (
            <div key={idx} className="bg-surface-card p-6 rounded-2xl border border-surface-border flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sage-700 bg-sage-100 px-2.5 py-1 rounded-md mb-3 inline-block">
                  {alt.alternative_type === 'budget_friendly' ? 'Budget Alternative' : 'Gentler Alternative'}
                </span>
                <h3 className="font-bold text-charcoal-900 text-sm">{alt.product.name}</h3>
                <span className="text-xs text-charcoal-500 block mb-2">{alt.product.brand} ({alt.product.category})</span>
                <span className="text-lg font-bold text-charcoal-900 font-serif">₹{alt.product.price}</span>

                <div className="mt-4 p-3 bg-surface-muted rounded-xl text-xs text-charcoal-700">
                  <span className="font-semibold block text-charcoal-900 mb-1">Trade-off:</span>
                  {alt.trade_off}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Score Modal */}
      {selectedProductForModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-card max-w-md w-full p-6 rounded-3xl shadow-xl border border-surface-border">
            <h3 className="text-lg font-bold font-serif text-charcoal-900">{selectedProductForModal.name}</h3>
            <p className="text-xs text-charcoal-500 mb-4">{selectedProductForModal.brand} • Match: {selectedProductForModal.match_score}/100</p>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-surface-border">
                <span className="text-charcoal-600">Concern Match (30%)</span>
                <span className="font-bold text-sage-800">{selectedProductForModal.score_breakdown.concern_match} pts</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-surface-border">
                <span className="text-charcoal-600">Ingredient Clinical Match (20%)</span>
                <span className="font-bold text-sage-800">{selectedProductForModal.score_breakdown.ingredient_match} pts</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-surface-border">
                <span className="text-charcoal-600">Skin Compatibility (15%)</span>
                <span className="font-bold text-sage-800">{selectedProductForModal.score_breakdown.skin_compatibility} pts</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-surface-border">
                <span className="text-charcoal-600">Preference Adherence (15%)</span>
                <span className="font-bold text-sage-800">{selectedProductForModal.score_breakdown.preference_match} pts</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-surface-border">
                <span className="text-charcoal-600">Budget Ratio Fit (10%)</span>
                <span className="font-bold text-sage-800">{selectedProductForModal.score_breakdown.budget_fit} pts</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-surface-border">
                <span className="text-charcoal-600">Clinical Evidence Tier (10%)</span>
                <span className="font-bold text-sage-800">{selectedProductForModal.score_breakdown.evidence_score} pts</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedProductForModal(null)}
              className="mt-6 w-full py-2.5 bg-sage-700 text-white text-xs font-semibold rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
