import React from 'react';
import { ShieldCheck, Lock, AlertTriangle, Cpu, CheckCircle2, ArrowRight } from 'lucide-react';

interface TrustSafetyProps {
  onStartQuiz: () => void;
}

export const TrustSafety: React.FC<TrustSafetyProps> = ({ onStartQuiz }) => {
  return (
    <div className="min-h-screen bg-[#FAF8F5] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center space-x-2 bg-[#E6EFE9] text-[#1B3B2B] px-4 py-1.5 rounded-full text-xs font-bold border border-[#93BCA0]/40">
            <ShieldCheck className="w-4 h-4 text-[#4A7C59]" />
            <span>Clinical Transparency & AI Safety Policy</span>
          </div>
          <h1 className="text-4xl font-extrabold text-[#1C2826] font-serif tracking-tight">
            Trust, Safety & Medical Integrity
          </h1>
          <p className="text-base text-[#556864] max-w-2xl mx-auto leading-relaxed">
            SkinSolve is engineered as an objective, constraint-aware recommendation platform to help consumers make safe, clinically grounded skincare choices.
          </p>
        </div>

        {/* Medical Disclaimer Alert */}
        <div className="bg-[#FDF3ED] border-l-4 border-[#E89D75] rounded-2xl p-6 shadow-sm flex items-start space-x-4">
          <AlertTriangle className="w-6 h-6 text-[#E89D75] flex-shrink-0 mt-0.5" />
          <div className="space-y-2 text-sm text-[#1C2826]">
            <h4 className="font-bold text-base text-[#1C2826]">Important Medical Disclaimer</h4>
            <p className="leading-relaxed text-[#556864]">
              SkinSolve recommendations are for informational and educational purposes only. SkinSolve is <strong>not a medical diagnostic tool</strong> nor a substitute for professional dermatological diagnosis, advice, or medical treatment. If you experience severe cystic acne, open wounds, acute eczema flares, or suspected skin infection, please consult a licensed dermatologist.
            </p>
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-[#E5E0D7] rounded-2xl p-6 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#E6EFE9] text-[#1B3B2B] flex items-center justify-center">
              <Cpu className="w-5 h-5 text-[#4A7C59]" />
            </div>
            <h3 className="font-bold text-lg text-[#1C2826] font-serif">Deterministic Constraint Engine</h3>
            <p className="text-sm text-[#556864] leading-relaxed">
              Unlike unpredictable probabilistic LLMs, our candidate filtering engine strictly enforces hard rules for active ingredient contraindications, budget caps, and fragrance/allergen exclusions with 100% mathematical constraint satisfaction.
            </p>
          </div>

          <div className="bg-white border border-[#E5E0D7] rounded-2xl p-6 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#E6EFE9] text-[#1B3B2B] flex items-center justify-center">
              <Lock className="w-5 h-5 text-[#4A7C59]" />
            </div>
            <h3 className="font-bold text-lg text-[#1C2826] font-serif">Data Privacy & Zero Tracking</h3>
            <p className="text-sm text-[#556864] leading-relaxed">
              We never sell your skin profile, budget parameters, or personal data to third-party advertisers. All recommendation sessions are computed locally or on demand with end-to-end privacy.
            </p>
          </div>

          <div className="bg-white border border-[#E5E0D7] rounded-2xl p-6 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#E6EFE9] text-[#1B3B2B] flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-[#4A7C59]" />
            </div>
            <h3 className="font-bold text-lg text-[#1C2826] font-serif">Zero Sponsored Bias</h3>
            <p className="text-sm text-[#556864] leading-relaxed">
              Product rankings are driven purely by multi-objective mathematical optimization scores (Concern Match, Active Ingredient Fit, Skin Compatibility, Preference, Budget, and Evidence Score). Brands cannot pay for higher rank placement.
            </p>
          </div>

          <div className="bg-white border border-[#E5E0D7] rounded-2xl p-6 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#E6EFE9] text-[#1B3B2B] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#4A7C59]" />
            </div>
            <h3 className="font-bold text-lg text-[#1C2826] font-serif">Peer-Reviewed Evidence Base</h3>
            <p className="text-sm text-[#556864] leading-relaxed">
              Active ingredient efficacy tiers are benchmarked against double-blind peer-reviewed dermatological studies (e.g. Journal of Clinical and Aesthetic Dermatology, British Journal of Dermatology).
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-[#1B3B2B] text-white rounded-3xl p-8 text-center space-y-4 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-xl mx-auto space-y-4">
            <h3 className="text-2xl font-bold font-serif">Ready to experience objective skincare intelligence?</h3>
            <p className="text-sm text-[#FAF8F5]/80">
              Build your customized 4-step routine backed by clinical active matching and budget optimization.
            </p>
            <button
              onClick={onStartQuiz}
              className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-full bg-[#E89D75] text-[#1C2826] font-bold text-sm hover:bg-[#F0B291] transition-all shadow-lg"
            >
              <span>Solve My Skin</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
