import React, { useState } from 'react';
import type { RecommendationResponse, UserProfileRequest, ProductRecommendation } from '../types/skincare';
import { CheckCircle2, AlertTriangle, Sparkles, Sun, Moon, RefreshCw, ShieldCheck, X, ChevronRight, HelpCircle } from 'lucide-react';

interface ResultsProps {
  data: RecommendationResponse;
  userProfile: UserProfileRequest;
  onModifyProfile: () => void;
}

export const Results: React.FC<ResultsProps> = ({ data, userProfile, onModifyProfile }) => {
  const [activeTab, setActiveTab] = useState<'routine' | 'breakdown' | 'alternatives'>('routine');
  const [routinePeriod, setRoutinePeriod] = useState<'AM' | 'PM'>('AM');
  const [selectedProductForDrawer, setSelectedProductForDrawer] = useState<ProductRecommendation | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveRoutine = () => {
    try {
      const stored = localStorage.getItem('skinsolve_saved_routines');
      const savedItems = stored ? JSON.parse(stored) : [];
      const newItem = {
        id: `routine_${Date.now()}`,
        timestamp: new Date().toISOString(),
        profile: userProfile,
        recommendation: data
      };
      savedItems.unshift(newItem);
      localStorage.setItem('skinsolve_saved_routines', JSON.stringify(savedItems));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (e) {
      console.error("Failed to save routine", e);
    }
  };

  // Handle Failure State cleanly
  if (data.status === 'constraint_violation' && data.failure_resolution) {
    const res = data.failure_resolution;
    const isNoProductsInRange = res.conflict_type === 'no_products_in_range';
    const isBudgetShortfall = res.conflict_type === 'budget_shortfall';

    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className={`bg-white p-8 sm:p-10 rounded-3xl border shadow-xl ${
          isNoProductsInRange ? 'border-amber-200' : 'border-red-200'
        }`}>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm ${
            isNoProductsInRange ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
          }`}>
            <AlertTriangle className="w-7 h-7" />
          </div>

          <div className={`inline-flex items-center space-x-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 border ${
            isNoProductsInRange
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            <span>{isNoProductsInRange ? 'NO PRODUCTS IN THIS PRICE RANGE' : isBudgetShortfall ? 'BUDGET TOO LOW FOR COMPLETE ROUTINE' : 'CONSTRAINT CONFLICT DIAGNOSED'}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#1C2826] mb-3">
            {isNoProductsInRange
              ? `No products found under ₹${res.current_budget ?? userProfile.budget}`
              : isBudgetShortfall
              ? `Your ₹${res.current_budget ?? userProfile.budget} budget is below the minimum`
              : "We couldn't find a 100% compliant routine."}
          </h2>

          <p className={`text-sm text-[#556864] mb-6 leading-relaxed p-4 rounded-xl border font-sans ${
            isNoProductsInRange ? 'bg-amber-50/50 border-amber-100' : 'bg-red-50/50 border-red-100'
          }`}>
            {res.reason}
          </p>

          {/* Budget Shortfall breakdown if applicable */}
          {isBudgetShortfall && res.shortfall && res.shortfall > 0 && (
            <div className="grid grid-cols-3 gap-4 p-5 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D7] mb-8 text-center">
              <div>
                <span className="text-[11px] text-[#556864] block uppercase font-bold tracking-wider">Your Budget</span>
                <span className="text-xl font-bold text-[#1C2826] font-serif">₹{res.current_budget}</span>
              </div>
              <div>
                <span className="text-[11px] text-[#556864] block uppercase font-bold tracking-wider">Min Required</span>
                <span className="text-xl font-bold text-[#1B3B2B] font-serif">₹{res.minimum_required_budget}</span>
              </div>
              <div>
                <span className="text-[11px] text-red-600 block uppercase font-bold tracking-wider">Shortfall</span>
                <span className="text-xl font-bold text-red-600 font-serif">+₹{Math.round(res.shortfall)}</span>
              </div>
            </div>
          )}

          {/* Closest Products Above Budget (if budget_shortfall with products) */}
          {isBudgetShortfall && data.all_recommended_products.length > 0 && (
            <div className="mb-8">
              <span className="text-xs font-bold text-[#1C2826] uppercase tracking-wider block font-serif mb-3">Closest Available Products (Above Budget):</span>
              <div className="space-y-2">
                {data.all_recommended_products.map((p) => (
                  <div key={p.product_id} className="flex items-center justify-between p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E5E0D7]">
                    <div>
                      <span className="text-sm font-bold text-[#1C2826]">{p.name}</span>
                      <span className="text-xs text-[#556864] ml-2">{p.brand} • {p.category}</span>
                    </div>
                    <span className="text-sm font-bold text-[#1B3B2B] font-serif">₹{p.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3 mb-8">
            <span className="text-xs font-bold text-[#1C2826] uppercase tracking-wider block font-serif">What You Can Do:</span>
            {res.actionable_suggestions.map((sug, idx) => (
              <div key={idx} className="flex items-start space-x-3 text-sm text-[#2C3C39] bg-white p-3.5 rounded-xl border border-[#E5E0D7] shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-[#4A7C59] mt-0.5 shrink-0" />
                <span>{sug}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              onClick={onModifyProfile}
              className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-full bg-[#1B3B2B] hover:bg-[#264E3A] text-white text-sm font-bold transition-all shadow-md cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-[#E89D75]" />
              <span>{isNoProductsInRange ? 'Adjust Budget' : 'Adjust Budget / Constraints'}</span>
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
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E5E0D7] shadow-md mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#E6EFE9] text-[#1B3B2B] text-xs font-bold uppercase tracking-wider mb-2 border border-[#93BCA0]/40">
              <Sparkles className="w-3.5 h-3.5 text-[#E89D75]" />
              <span>Engineered Skincare Protocol</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#1C2826]">
              Your Personalized Skincare Routine
            </h1>
            <p className="text-xs sm:text-sm text-[#556864] mt-1 font-sans">
              Engineered for <span className="font-semibold text-[#1B3B2B]">{userProfile.skin_type} skin</span> targeting <span className="font-semibold text-[#1B3B2B]">{userProfile.concerns.join(', ')}</span> under a strict ₹{userProfile.budget} ceiling.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right mr-2 hidden sm:block">
              <span className="text-[10px] text-[#556864] block uppercase font-bold tracking-wider">Routine Match</span>
              <span className="text-2xl font-bold text-[#1B3B2B] font-serif">{data.overall_match_percentage}%</span>
            </div>

            <button
              onClick={handleSaveRoutine}
              className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer ${
                isSaved
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#E6EFE9] text-[#1B3B2B] hover:bg-[#93BCA0]/40 border border-[#93BCA0]/40'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#E89D75]" />
              <span>{isSaved ? 'Routine Saved!' : 'Save Routine'}</span>
            </button>

            <button
              onClick={onModifyProfile}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-full border border-[#E5E0D7] text-[#556864] text-xs font-bold hover:bg-[#FAF8F5] transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>
        </div>

        {/* Constraint satisfaction summary */}
        <div className="mt-6 pt-6 border-t border-[#E5E0D7] flex flex-wrap gap-3 text-xs font-semibold text-[#1B3B2B]">
          <div className="inline-flex items-center space-x-1.5 bg-[#F4F8F5] px-3 py-1.5 rounded-lg border border-[#93BCA0]/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#4A7C59]" />
            <span>Budget Ceiling Respected (₹{data.total_routine_price} ≤ ₹{userProfile.budget})</span>
          </div>
          <div className="inline-flex items-center space-x-1.5 bg-[#F4F8F5] px-3 py-1.5 rounded-lg border border-[#93BCA0]/30">
            <ShieldCheck className="w-3.5 h-3.5 text-[#4A7C59]" />
            <span>Zero Active Ingredient Conflicts</span>
          </div>
          {userProfile.fragrance_free && (
            <div className="inline-flex items-center space-x-1.5 bg-[#F4F8F5] px-3 py-1.5 rounded-lg border border-[#93BCA0]/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#4A7C59]" />
              <span>100% Fragrance-Free Guarantee</span>
            </div>
          )}
        </div>
      </div>


      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-surface-border mb-8">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('routine')}
            className={`pb-4 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'routine'
                ? 'border-sage-700 text-sage-800'
                : 'border-transparent text-charcoal-500 hover:text-charcoal-800'
            }`}
          >
            Routine Steps ({data.all_recommended_products.length})
          </button>
          <button
            onClick={() => setActiveTab('breakdown')}
            className={`pb-4 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'breakdown'
                ? 'border-sage-700 text-sage-800'
                : 'border-transparent text-charcoal-500 hover:text-charcoal-800'
            }`}
          >
            Algorithm Score Matrix
          </button>
          <button
            onClick={() => setActiveTab('alternatives')}
            className={`pb-4 text-sm font-bold border-b-2 transition-all ${
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
          className="text-xs text-sage-700 font-bold hover:underline"
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
              className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                routinePeriod === 'AM'
                  ? 'bg-sage-700 text-white shadow-sm'
                  : 'bg-white border border-surface-border text-charcoal-600 hover:bg-sage-50'
              }`}
            >
              <Sun className="w-4 h-4" />
              <span>Morning Routine (AM)</span>
            </button>

            <button
              onClick={() => setRoutinePeriod('PM')}
              className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                routinePeriod === 'PM'
                  ? 'bg-sage-700 text-white shadow-sm'
                  : 'bg-white border border-surface-border text-charcoal-600 hover:bg-sage-50'
              }`}
            >
              <Moon className="w-4 h-4" />
              <span>Evening Routine (PM)</span>
            </button>
          </div>

          {currentRoutine.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-surface-border text-center">
              <Moon className="w-8 h-8 text-charcoal-400 mx-auto mb-3" />
              <p className="text-sm font-bold text-charcoal-700 mb-1">
                No {routinePeriod === 'AM' ? 'morning' : 'evening'} routine steps
              </p>
              <p className="text-xs text-charcoal-500">
                {routinePeriod === 'PM'
                  ? 'All recommended products are for daytime use. Switch to AM to view your routine.'
                  : 'All recommended products are for nighttime use. Switch to PM to view your routine.'}
              </p>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentRoutine.map((product, idx) => (
              <div
                key={product.product_id}
                className="bg-white rounded-2xl border border-surface-border p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
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
                  <div className="space-y-1.5 my-4 bg-sage-50/60 p-3.5 rounded-xl border border-sage-100">
                    <span className="text-[11px] font-bold text-sage-900 uppercase tracking-wider block mb-1">Why Recommended:</span>
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
                        <span key={iIdx} className="text-[11px] px-2.5 py-0.5 bg-surface-muted rounded-md text-charcoal-700 border border-surface-border font-medium">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-surface-border flex items-center justify-between">
                  <span className="text-xs text-charcoal-500 font-medium">Slot: {product.usage_slot === 'BOTH' ? 'AM & PM' : product.usage_slot}</span>
                  <button
                    onClick={() => setSelectedProductForDrawer(product)}
                    className="text-xs font-bold text-sage-700 hover:text-sage-900 inline-flex items-center space-x-1"
                  >
                    <span>Why This? (Deep Breakdown)</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      )}

      {/* Tab 2: Algorithm Breakdown */}
      {activeTab === 'breakdown' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-border shadow-xs">
          <h2 className="text-xl font-bold font-serif text-charcoal-900 mb-2">Multi-Objective Score Breakdown</h2>
          <p className="text-xs sm:text-sm text-charcoal-600 mb-6">
            Score breakdown across 6 objective weights: Concern Match (30%), Ingredient Match (20%), Skin Compatibility (15%), Preference Match (15%), Budget Fit (10%), Evidence Score (10%).
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-surface-border text-charcoal-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-2">Concern (30%)</th>
                  <th className="py-3 px-2">Ingredient (20%)</th>
                  <th className="py-3 px-2">Skin (15%)</th>
                  <th className="py-3 px-2">Pref (15%)</th>
                  <th className="py-3 px-2">Budget (10%)</th>
                  <th className="py-3 px-2">Evidence (10%)</th>
                  <th className="py-3 px-4 text-right">Composite Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {data.all_recommended_products.map((p) => (
                  <tr key={p.product_id} className="hover:bg-surface-muted/40">
                    <td className="py-3.5 px-4 font-bold text-charcoal-900">{p.name} <span className="text-xs text-charcoal-400 font-normal">({p.brand})</span></td>
                    <td className="py-3.5 px-2 text-sage-800 font-semibold">{p.score_breakdown.concern_match}/30</td>
                    <td className="py-3.5 px-2 text-sage-800 font-semibold">{p.score_breakdown.ingredient_match}/20</td>
                    <td className="py-3.5 px-2 text-sage-800 font-semibold">{p.score_breakdown.skin_compatibility}/15</td>
                    <td className="py-3.5 px-2 text-sage-800 font-semibold">{p.score_breakdown.preference_match}/15</td>
                    <td className="py-3.5 px-2 text-sage-800 font-semibold">{p.score_breakdown.budget_fit}/10</td>
                    <td className="py-3.5 px-2 text-sage-800 font-semibold">{p.score_breakdown.evidence_score}/10</td>
                    <td className="py-3.5 px-4 text-right font-bold text-sage-700 font-serif text-base">{p.match_score}/100</td>
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
            <div key={idx} className="bg-white p-6 rounded-2xl border border-surface-border shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sage-800 bg-sage-100 px-2.5 py-1 rounded-md mb-3 inline-block">
                  {alt.alternative_type === 'budget_friendly' ? 'Budget Alternative' : 'Gentler Alternative'}
                </span>
                <h3 className="font-bold text-charcoal-900 text-sm">{alt.product.name}</h3>
                <span className="text-xs text-charcoal-500 block mb-2">{alt.product.brand} ({alt.product.category})</span>
                <span className="text-lg font-bold text-charcoal-900 font-serif">₹{alt.product.price}</span>

                <div className="mt-4 p-3.5 bg-surface-muted rounded-xl text-xs text-charcoal-700 border border-surface-border">
                  <span className="font-bold block text-charcoal-900 mb-1">Trade-off & Reasoning:</span>
                  {alt.trade_off}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* WHY THIS? SIDE DRAWER MODAL */}
      {selectedProductForDrawer && (
        <div className="fixed inset-0 bg-charcoal-900/50 backdrop-blur-xs z-50 flex justify-end">
          <div className="bg-white w-full max-w-lg h-full overflow-y-auto p-6 sm:p-8 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-surface-border mb-6">
                <div>
                  <span className="text-[10px] font-bold text-sage-700 uppercase tracking-widest block">EXPLAINABILITY DRAWER</span>
                  <h3 className="text-xl font-bold font-serif text-charcoal-900">{selectedProductForDrawer.name}</h3>
                  <span className="text-xs text-charcoal-500">{selectedProductForDrawer.brand} • {selectedProductForDrawer.category}</span>
                </div>
                <button
                  onClick={() => setSelectedProductForDrawer(null)}
                  className="w-8 h-8 rounded-full bg-surface-muted hover:bg-sage-100 flex items-center justify-center text-charcoal-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Match Score Gauge */}
              <div className="bg-sage-50 p-4 rounded-2xl border border-sage-200 mb-6 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-sage-800 uppercase tracking-wider block">Overall Fit Score</span>
                  <span className="text-3xl font-extrabold text-sage-800 font-serif">{selectedProductForDrawer.match_score} / 100</span>
                </div>
                <div className="text-right text-xs text-sage-700">
                  <span className="font-bold block">Allocated Price: ₹{selectedProductForDrawer.price}</span>
                  <span>Usage: {selectedProductForDrawer.usage_slot}</span>
                </div>
              </div>

              {/* Multi-Factor Score Bars */}
              <div className="mb-6 space-y-3">
                <h4 className="text-xs font-bold text-charcoal-900 uppercase tracking-wider">Multi-Objective Factor Scores</h4>
                
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-charcoal-700">Concern Match (30%)</span>
                    <span className="font-bold text-sage-800">{selectedProductForDrawer.score_breakdown.concern_match} / 30 pts</span>
                  </div>
                  <div className="w-full bg-surface-muted h-2 rounded-full overflow-hidden">
                    <div className="bg-sage-700 h-full rounded-full" style={{ width: `${(selectedProductForDrawer.score_breakdown.concern_match / 30) * 100}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-charcoal-700">Ingredient Active Match (20%)</span>
                    <span className="font-bold text-sage-800">{selectedProductForDrawer.score_breakdown.ingredient_match} / 20 pts</span>
                  </div>
                  <div className="w-full bg-surface-muted h-2 rounded-full overflow-hidden">
                    <div className="bg-sage-700 h-full rounded-full" style={{ width: `${(selectedProductForDrawer.score_breakdown.ingredient_match / 20) * 100}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-charcoal-700">Skin Compatibility (15%)</span>
                    <span className="font-bold text-sage-800">{selectedProductForDrawer.score_breakdown.skin_compatibility} / 15 pts</span>
                  </div>
                  <div className="w-full bg-surface-muted h-2 rounded-full overflow-hidden">
                    <div className="bg-sage-700 h-full rounded-full" style={{ width: `${(selectedProductForDrawer.score_breakdown.skin_compatibility / 15) * 100}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-charcoal-700">Preference Match (15%)</span>
                    <span className="font-bold text-sage-800">{selectedProductForDrawer.score_breakdown.preference_match} / 15 pts</span>
                  </div>
                  <div className="w-full bg-surface-muted h-2 rounded-full overflow-hidden">
                    <div className="bg-sage-700 h-full rounded-full" style={{ width: `${(selectedProductForDrawer.score_breakdown.preference_match / 15) * 100}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-charcoal-700">Budget Ratio Fit (10%)</span>
                    <span className="font-bold text-sage-800">{selectedProductForDrawer.score_breakdown.budget_fit} / 10 pts</span>
                  </div>
                  <div className="w-full bg-surface-muted h-2 rounded-full overflow-hidden">
                    <div className="bg-sage-700 h-full rounded-full" style={{ width: `${(selectedProductForDrawer.score_breakdown.budget_fit / 10) * 100}%` }}></div>
                  </div>
                </div>
              </div>

              {/* WHY THIS Section */}
              <div className="mb-6">
                <h4 className="text-xs font-bold text-sage-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-sage-700" />
                  <span>Why We Recommended This</span>
                </h4>
                <div className="space-y-2 bg-sage-50/60 p-3.5 rounded-xl border border-sage-200">
                  {selectedProductForDrawer.why_recommended.map((reason, rIdx) => (
                    <p key={rIdx} className="text-xs text-charcoal-700 flex items-start gap-2">
                      <span className="text-sage-700 font-bold">•</span>
                      <span>{reason}</span>
                    </p>
                  ))}
                </div>
              </div>

              {/* WHY NOT ALTERNATIVES Section */}
              {selectedProductForDrawer.why_not_reasons && selectedProductForDrawer.why_not_reasons.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-charcoal-500" />
                    <span>Why Not Other Alternatives?</span>
                  </h4>
                  <div className="space-y-2 bg-surface-muted p-3.5 rounded-xl border border-surface-border">
                    {selectedProductForDrawer.why_not_reasons.map((notReason: string, nrIdx: number) => (
                      <p key={nrIdx} className="text-xs text-charcoal-600 flex items-start gap-2">
                        <span className="text-charcoal-400 font-bold">•</span>
                        <span>{notReason}</span>
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedProductForDrawer(null)}
              className="mt-6 w-full py-3 bg-sage-700 hover:bg-sage-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              Close Explainability Drawer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

