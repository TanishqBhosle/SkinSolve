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
  const [crueltyFree, setCrueltyFree] = useState<boolean>(initialProfile?.cruelty_free ?? false);
  const [existingProducts, setExistingProducts] = useState<string[]>(initialProfile?.existing_products || []);
  const [excludedIngredients, setExcludedIngredients] = useState<string[]>(initialProfile?.excluded_ingredients || []);

  const totalSteps = 4;

  const commonExclusions = ["Niacinamide", "Salicylic Acid", "Retinoid", "Vitamin C", "Glycolic Acid"];

  const toggleExclusion = (ing: string) => {
    if (excludedIngredients.includes(ing)) {
      setExcludedIngredients(excludedIngredients.filter(i => i !== ing));
    } else {
      setExcludedIngredients([...excludedIngredients, ing]);
    }
  };

  const skinTypeOptions = [
    { id: 'oily', title: 'Oily', desc: 'Excess sebum across entire face, shiny by midday.' },
    { id: 'dry', title: 'Dry', desc: 'Tight, flaky, or rough texture needing deep nourishment.' },
    { id: 'combination', title: 'Combination', desc: 'Oily T-zone (forehead, nose) with normal/dry cheeks.' },
    { id: 'sensitive', title: 'Sensitive / Reactive', desc: 'Easily turns red, burns, or reacts to active ingredients.' },
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
        excluded_ingredients: excludedIngredients
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-2xl mx-auto w-full bg-white border border-[#E5E0D7] rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
        {/* Progress Header */}
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-[#E5E0D7]">
          <div className="flex items-center space-x-3">
            <span className="w-10 h-10 rounded-2xl bg-[#1B3B2B] text-white flex items-center justify-center font-bold text-sm font-serif">
              0{step}
            </span>
            <div>
              <span className="text-xs font-extrabold text-[#4A7C59] uppercase tracking-wider block">SkinSolve Assessment</span>
              <span className="text-sm font-bold text-[#1C2826]">Step 0{step} of 0{totalSteps}</span>
            </div>
          </div>
          <div className="w-32 bg-[#E6EFE9] h-2 rounded-full overflow-hidden">
            <div 
              className="bg-[#1B3B2B] h-full transition-all duration-300 rounded-full"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Skin Type & Sensitivity */}
        {step === 1 && (
          <div className="space-y-6 animate-slide-up">
            <div>
              <h2 className="text-2xl font-bold text-[#1C2826] font-serif">What is your primary skin type?</h2>
              <p className="text-sm text-[#556864] mt-1">Select the classification that best describes your baseline dermal behavior.</p>
            </div>

            <div className="space-y-3">
              {skinTypeOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSkinType(opt.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    skinType === opt.id
                      ? 'border-[#4A7C59] bg-[#F4F8F5] shadow-sm'
                      : 'border-[#E5E0D7] hover:border-[#93BCA0] bg-white'
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-sm text-[#1C2826]">{opt.title}</h4>
                    <p className="text-xs text-[#556864] mt-0.5">{opt.desc}</p>
                  </div>
                  {skinType === opt.id && (
                    <div className="w-6 h-6 rounded-full bg-[#1B3B2B] text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-[#E5E0D7]">
              <label className="block text-sm font-bold text-[#1C2826] mb-2 font-serif">Sensitivity Level</label>
              <div className="grid grid-cols-3 gap-3">
                {['low', 'medium', 'high'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSensitivity(lvl)}
                    className={`py-2.5 px-4 rounded-xl border text-xs font-bold capitalize transition-all cursor-pointer ${
                      sensitivity === lvl
                        ? 'border-[#4A7C59] bg-[#1B3B2B] text-white shadow-sm'
                        : 'border-[#E5E0D7] text-[#556864] hover:bg-[#F4F8F5]'
                    }`}
                  >
                    {lvl} Sensitivity
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Skin Concerns & Excluded Ingredients */}
        {step === 2 && (
          <div className="space-y-6 animate-slide-up">
            <div>
              <h2 className="text-2xl font-bold text-[#1C2826] font-serif">Select your skin concerns</h2>
              <p className="text-sm text-[#556864] mt-1">Choose all active dermal targets you wish to address.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {concernOptions.map((c) => {
                const isSelected = concerns.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleConcern(c.id)}
                    className={`p-3 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-[#4A7C59] bg-[#E6EFE9] text-[#1B3B2B] shadow-xs'
                        : 'border-[#E5E0D7] text-[#556864] hover:bg-[#F4F8F5]'
                    }`}
                  >
                    <span>{c.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-[#1B3B2B]" />}
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-[#E5E0D7]">
              <label className="block text-sm font-bold text-[#1C2826] mb-2 font-serif">Exclude Specific Ingredients (Optional)</label>
              <div className="flex flex-wrap gap-2">
                {commonExclusions.map((ing) => {
                  const isExcluded = excludedIngredients.includes(ing);
                  return (
                    <button
                      key={ing}
                      type="button"
                      onClick={() => toggleExclusion(ing)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                        isExcluded
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-[#E5E0D7] text-[#556864] hover:bg-[#F4F8F5]'
                      }`}
                    >
                      {isExcluded ? `✕ Avoid ${ing}` : `+ Exclude ${ing}`}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Budget & Formulative Preferences */}
        {step === 3 && (
          <div className="space-y-6 animate-slide-up">
            <div>
              <h2 className="text-2xl font-bold text-[#1C2826] font-serif">Set your total routine budget</h2>
              <p className="text-sm text-[#556864] mt-1">SkinSolve guarantees your recommended 4-step routine total will not exceed this limit.</p>
            </div>

            <div className="bg-[#F4F8F5] border border-[#93BCA0]/30 rounded-2xl p-6 text-center space-y-4">
              <div className="text-xs uppercase font-extrabold text-[#4A7C59] tracking-wider">Routine Budget Ceiling</div>
              <div className="text-4xl font-extrabold text-[#1B3B2B] font-serif">₹{budget}</div>
              <input
                type="range"
                min="400"
                max="5000"
                step="100"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full accent-[#1B3B2B] cursor-pointer"
              />
              <div className="flex justify-between text-xs text-[#556864] font-semibold">
                <span>₹400 (Student)</span>
                <span>₹2,500 (Mid-Range)</span>
                <span>₹5,000 (Premium)</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5E0D7] space-y-3">
              <label className="block text-sm font-bold text-[#1C2826] font-serif">Formulative Constraints</label>
              
              <button
                type="button"
                onClick={() => setFragranceFree(!fragranceFree)}
                className={`w-full p-3.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                  fragranceFree ? 'border-[#4A7C59] bg-[#E6EFE9] text-[#1B3B2B]' : 'border-[#E5E0D7] text-[#556864]'
                }`}
              >
                <span>100% Fragrance-Free & Essential-Oil Free</span>
                {fragranceFree && <Check className="w-4 h-4 text-[#1B3B2B]" />}
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setVegan(!vegan)}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                    vegan ? 'border-[#4A7C59] bg-[#E6EFE9] text-[#1B3B2B]' : 'border-[#E5E0D7] text-[#556864]'
                  }`}
                >
                  <span>Vegan Only</span>
                  {vegan && <Check className="w-4 h-4 text-[#1B3B2B]" />}
                </button>

                <button
                  type="button"
                  onClick={() => setCrueltyFree(!crueltyFree)}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                    crueltyFree ? 'border-[#4A7C59] bg-[#E6EFE9] text-[#1B3B2B]' : 'border-[#E5E0D7] text-[#556864]'
                  }`}
                >
                  <span>Cruelty-Free Only</span>
                  {crueltyFree && <Check className="w-4 h-4 text-[#1B3B2B]" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Existing Products to Keep */}
        {step === 4 && (
          <div className="space-y-6 animate-slide-up">
            <div>
              <h2 className="text-2xl font-bold text-[#1C2826] font-serif">Do you already own products to keep?</h2>
              <p className="text-sm text-[#556864] mt-1">Select any steps you already have. SkinSolve will exclude recommending redundant items and reallocate budget.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {categoryOptions.map((cat) => {
                const isSelected = existingProducts.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleExisting(cat)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-[#4A7C59] bg-[#E6EFE9] text-[#1B3B2B] shadow-xs'
                        : 'border-[#E5E0D7] text-[#556864] hover:bg-[#F4F8F5]'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-sm block">{cat}</span>
                      <span className="text-[11px] text-[#556864]">Already own a {cat.toLowerCase()}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#1B3B2B]" />}
                  </button>
                );
              })}
            </div>

            <div className="bg-[#FDF3ED] border border-[#E89D75]/40 rounded-2xl p-4 text-xs text-[#1C2826]">
              <span className="font-bold text-[#E89D75] block mb-1">Minimal Routine Philosophy:</span>
              SkinSolve recommends at most 1 product per core category to prevent redundant active overloading.
            </div>
          </div>
        )}

        {/* Wizard Action Buttons */}
        <div className="mt-10 pt-6 border-t border-[#E5E0D7] flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full border border-[#E5E0D7] text-[#556864] text-sm font-semibold hover:bg-[#F4F8F5] transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs font-semibold text-[#556864] hover:text-[#1C2826] cursor-pointer"
            >
              Cancel
            </button>
          )}

          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center space-x-2 px-7 py-3 rounded-full bg-[#1B3B2B] hover:bg-[#264E3A] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <span>{step === totalSteps ? 'Generate Routine' : 'Next Step'}</span>
            <ArrowRight className="w-4 h-4 text-[#E89D75]" />
          </button>
        </div>
      </div>
    </div>
  );
};

