import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, Loader2, ShieldCheck, Filter, Cpu, Layers } from 'lucide-react';

interface AnalysisModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({ isOpen, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { label: "Parsing dermal skin profile & target concerns", icon: Cpu },
    { label: "Checking active ingredient contraindication rules", icon: ShieldCheck },
    { label: "Filtering fragrance, alcohol & allergen hard constraints", icon: Filter },
    { label: "Optimizing multi-objective utility routine across slots", icon: Layers },
    { label: "Preparing evidence-backed explanations & trade-offs", icon: Sparkles }
  ];

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 600);
          return prev;
        }
      });
    }, 700);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C2826]/70 backdrop-blur-md animate-fade-in">
      <div className="bg-[#FAF8F5] border border-[#E5E0D7] rounded-3xl max-w-lg w-full p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#E89D75]/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-[#4A7C59]/20 rounded-full blur-3xl animate-pulse-glow" />

        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#1B3B2B] text-[#FAF8F5] shadow-lg mb-4">
            <Sparkles className="w-8 h-8 text-[#E89D75] animate-spin-slow" />
          </div>
          <h3 className="text-2xl font-bold text-[#1C2826] font-serif">SkinSolve Intelligence</h3>
          <p className="text-sm text-[#556864] mt-1">Analyzing catalog with constraint-aware multi-objective optimization...</p>
        </div>

        <div className="space-y-4 relative z-10">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isDone = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <div
                key={idx}
                className={`flex items-center space-x-3.5 p-3.5 rounded-xl border transition-all duration-300 ${
                  isCurrent
                    ? 'bg-white border-[#4A7C59] shadow-md scale-[1.02]'
                    : isDone
                    ? 'bg-[#E6EFE9]/60 border-[#93BCA0]/40'
                    : 'bg-white/40 border-[#E5E0D7]/60 opacity-50'
                }`}
              >
                <div className="flex-shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-[#4A7C59]" />
                  ) : isCurrent ? (
                    <Loader2 className="w-5 h-5 text-[#1B3B2B] animate-spin" />
                  ) : (
                    <Icon className="w-5 h-5 text-[#829590]" />
                  )}
                </div>
                <span className={`text-sm font-medium ${isCurrent ? 'text-[#1B3B2B] font-semibold' : isDone ? 'text-[#2C3C39]' : 'text-[#829590]'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center text-xs text-[#829590] relative z-10">
          Evaluating 270+ clinical products across Indian & International brands
        </div>
      </div>
    </div>
  );
};
