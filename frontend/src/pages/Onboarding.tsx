import React, { useState } from 'react';
import type { UserProfileRequest } from '../types/skincare';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';

interface OnboardingProps {
  initialProfile?: Partial<UserProfileRequest>;
  onSubmit: (profile: UserProfileRequest) => void;
  onCancel: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ initialProfile, onSubmit, onCancel }) => {
  const [step, setStep] = useState(1);
  const [skinType, setSkinType] = useState<string>(initialProfile?.skin_type || 'combination');
  const [concerns, setConcerns] = useState<string[]>(initialProfile?.concerns || ['acne']);
  const [sensitivity, setSensitivity] = useState<string>(initialProfile?.sensitivity || 'medium');
  const [budget, setBudget] = useState<number>(initialProfile?.budget || 1500);
  const [fragranceFree, setFragranceFree] = useState<boolean>(initialProfile?.fragrance_free ?? true);
  const [vegan, setVegan] = useState<boolean>(initialProfile?.vegan ?? false);
  const [crueltyFree] = useState<boolean>(initialProfile?.cruelty_free ?? false);
  const [existingProducts, setExistingProducts] = useState<string[]>(initialProfile?.existing_products || []);
  const [excludedIngredients] = useState<string[]>(initialProfile?.excluded_ingredients || []);

  const totalSteps = 5;

  const skinTypeOptions = [
    { id: 'oily', title: 'Oily', desc: 'Excess sebum across entire face, shiny by midday.' },
    { id: 'dry', title: 'Dry', desc: 'Tight, flaky, or rough texture needing deep nourishment.' },
    { id: 'combination', title: 'Combination', desc: 'Oily T-zone (forehead, nose) with normal/dry cheeks.' },
    { id: 'sensitive', title: 'Sensitive / Reactive', desc: 'Easily turns red, burns, or reacts to fragrance.' },
    { id: 'normal', title: 'Balanced / Normal', desc: 'Evenly hydrated with minimal breakouts or oiliness.' },
  ];

  const concernOptions = [
    { id: 'acne', label: 'Active Acne & Breakouts' },
    { id: 'hyperpigmentation', label: 'Dark Spots & Hyperpigmentation' },
    { id: 'redness', label: 'Redness & Rosacea' },
    { id: 'dryness', label: 'Dryness & Dehydration' },
    { id: 'barrier_repair', label: 'Damaged Skin Barrier' },
    { id: 'anti_aging', label: 'Fine Lines & Aging' },
    { id: 'dullness', label: 'Dull Complexion & Radiance' },
    { id: 'enlarged_pores', label: 'Enlarged Pores & Blackheads' },
    { id: 'oiliness', label: 'Excess Shine & Sebum' },
  ];

  const categoryOptions = ['Cleanser', 'Treatment', 'Moisturizer', 'Sunscreen'];

  const toggleConcern = (id: string) => {
    if (concerns.includes(id)) {
      setConcerns(concerns.filter(c => c !== id));
    } else {
      setConcerns([...concerns, id]);
    }
  };

  const toggleExisting = (cat: string) => {
    if (existingProducts.includes(cat)) {
      setExistingProducts(existingProducts.filter(c => c !== cat));
    } else {
      setExistingProducts([...existingProducts, cat]);
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onSubmit({
        skin_type: skinType,
        concerns,
        sensitivity,
        budget,
        fragrance_free: fragranceFree,
        vegan,
        cruelty_free: crueltyFree,
        existing_products: existingProducts,
        excluded_ingredients: excludedIngredients,
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-2">
          <span>Step {step} of {totalSteps}</span>
          <span>{Math.round((step / totalSteps) * 100)}% Completed</span>
        </div>
        <div className="w-full bg-surface-muted h-2 rounded-full overflow-hidden">
          <div 
            className="bg-sage-700 h-full transition-all duration-300 rounded-full"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-surface-card p-8 rounded-3xl border border-surface-border shadow-sm min-h-[420px] flex flex-col justify-between">
        {/* Step 1: Skin Type */}
        {step === 1 && (
          <div>
            <span className="text-xs font-bold text-sage-700 tracking-wider uppercase">01 / Profile</span>
            <h2 className="text-2xl font-bold font-serif text-charcoal-900 mt-1 mb-2">What is your primary skin type?</h2>
            <p className="text-sm text-charcoal-600 mb-6">Select the option that best describes your baseline skin behavior.</p>

            <div className="space-y-3">
              {skinTypeOptions.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setSkinType(opt.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                    skinType === opt.id
                      ? 'border-sage-700 bg-sage-50/50 shadow-sm'
                      : 'border-surface-border hover:border-sage-300 bg-surface-card'
                  }`}
                >
                  <div>
                    <h3 className="font-semibold text-charcoal-900 text-sm">{opt.title}</h3>
                    <p className="text-xs text-charcoal-500 mt-0.5">{opt.desc}</p>
                  </div>
                  {skinType === opt.id && (
                    <div className="w-5 h-5 rounded-full bg-sage-700 text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Primary Concerns */}
        {step === 2 && (
          <div>
            <span className="text-xs font-bold text-sage-700 tracking-wider uppercase">02 / Goals</span>
            <h2 className="text-2xl font-bold font-serif text-charcoal-900 mt-1 mb-2">What are you looking to improve?</h2>
            <p className="text-sm text-charcoal-600 mb-6">Choose priority skin goals for your routine.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {concernOptions.map((opt) => {
                const isSelected = concerns.includes(opt.id);
                return (
                  <div
                    key={opt.id}
                    onClick={() => toggleConcern(opt.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-sm ${
                      isSelected
                        ? 'border-sage-700 bg-sage-50/50 text-sage-900 font-semibold'
                        : 'border-surface-border hover:border-sage-300 text-charcoal-700'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-sage-700 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Sensitivity & Fragrance */}
        {step === 3 && (
          <div>
            <span className="text-xs font-bold text-sage-700 tracking-wider uppercase">03 / Sensitivity</span>
            <h2 className="text-2xl font-bold font-serif text-charcoal-900 mt-1 mb-2">How sensitive is your skin?</h2>
            <p className="text-sm text-charcoal-600 mb-6">We avoid harsh acids and high-strength actives for sensitive profiles.</p>

            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { id: 'low', label: 'Resilient', desc: 'Rarely stings or turns red' },
                { id: 'medium', label: 'Moderate', desc: 'Occasionally reactive' },
                { id: 'high', label: 'High / Reactive', desc: 'Flushes or burns easily' },
              ].map((tier) => (
                <div
                  key={tier.id}
                  onClick={() => setSensitivity(tier.id)}
                  className={`p-4 rounded-xl border cursor-pointer text-center transition-all ${
                    sensitivity === tier.id
                      ? 'border-sage-700 bg-sage-50 text-sage-900 font-semibold'
                      : 'border-surface-border hover:border-sage-300'
                  }`}
                >
                  <div className="text-sm font-bold">{tier.label}</div>
                  <div className="text-xs text-charcoal-500 mt-1">{tier.desc}</div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-surface-muted border border-surface-border space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={fragranceFree}
                  onChange={(e) => setFragranceFree(e.target.checked)}
                  className="rounded border-surface-border text-sage-700 focus:ring-sage-700 w-4 h-4"
                />
                <span className="text-sm font-medium text-charcoal-900">Strictly Fragrance-Free Formulations</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={vegan}
                  onChange={(e) => setVegan(e.target.checked)}
                  className="rounded border-surface-border text-sage-700 focus:ring-sage-700 w-4 h-4"
                />
                <span className="text-sm font-medium text-charcoal-900">100% Vegan Formulations</span>
              </label>
            </div>
          </div>
        )}

        {/* Step 4: Budget */}
        {step === 4 && (
          <div>
            <span className="text-xs font-bold text-sage-700 tracking-wider uppercase">04 / Budget</span>
            <h2 className="text-2xl font-bold font-serif text-charcoal-900 mt-1 mb-2">What is your total routine budget?</h2>
            <p className="text-sm text-charcoal-600 mb-8">SkinSolve guarantees your routine total will not exceed this limit.</p>

            <div className="text-center py-6 bg-sage-50/60 rounded-2xl border border-sage-200 mb-8">
              <span className="text-4xl font-extrabold text-sage-800 font-serif">₹{budget.toLocaleString()}</span>
              <span className="block text-xs text-sage-600 mt-1 uppercase font-semibold">Total Budget Ceiling (INR)</span>
            </div>

            <input
              type="range"
              min="500"
              max="3500"
              step="100"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full h-2 bg-surface-muted rounded-lg appearance-none cursor-pointer accent-sage-700"
            />
            <div className="flex justify-between text-xs text-charcoal-400 mt-2">
              <span>₹500 (Budget)</span>
              <span>₹2,000 (Standard)</span>
              <span>₹3,500 (Premium)</span>
            </div>
          </div>
        )}

        {/* Step 5: Existing Products */}
        {step === 5 && (
          <div>
            <span className="text-xs font-bold text-sage-700 tracking-wider uppercase">05 / Inventory</span>
            <h2 className="text-2xl font-bold font-serif text-charcoal-900 mt-1 mb-2">Do you already own any of these?</h2>
            <p className="text-sm text-charcoal-600 mb-6">Select products you already have so we don't duplicate them in your budget.</p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {categoryOptions.map((cat) => {
                const isOwned = existingProducts.includes(cat);
                return (
                  <div
                    key={cat}
                    onClick={() => toggleExisting(cat)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-sm ${
                      isOwned
                        ? 'border-sage-700 bg-sage-50 text-sage-900 font-semibold'
                        : 'border-surface-border hover:border-sage-300 text-charcoal-700'
                    }`}
                  >
                    <span>I own a {cat}</span>
                    {isOwned && (
                      <div className="w-4 h-4 rounded-full bg-sage-700 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="p-4 rounded-xl bg-surface-muted border border-surface-border text-xs text-charcoal-600">
              <span className="font-semibold block text-charcoal-800 mb-1">💡 Smart Optimization Note:</span>
              Categories you own will be excluded from the recommended routine shopping cart, allowing your full budget to be focused on targeted active steps.
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 pt-6 border-t border-surface-border flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-charcoal-600 hover:text-charcoal-900 text-sm font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <button
              onClick={onCancel}
              className="text-xs text-charcoal-400 hover:text-charcoal-700 transition-colors"
            >
              Cancel
            </button>
          )}

          <button
            onClick={handleNext}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-sage-700 hover:bg-sage-800 text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all"
          >
            <span>{step === totalSteps ? 'Generate Routine' : 'Next Step'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
