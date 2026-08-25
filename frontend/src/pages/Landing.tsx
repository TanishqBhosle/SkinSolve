import React, { useState } from 'react';
import { Sparkles, Shield, IndianRupee, Layers, ArrowRight, Zap } from 'lucide-react';
import { parseNaturalLanguageProblem } from '../services/api';
import type { ProblemParseResponse } from '../types/skincare';

interface LandingProps {
  onStartQuiz: () => void;
  onApplyParsedData: (data: ProblemParseResponse) => void;
}

export const Landing: React.FC<LandingProps> = ({ onStartQuiz, onApplyParsedData }) => {
  const [query, setQuery] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const handleNaturalLanguageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsParsing(true);
    setParseError(null);
    try {
      const parsed = await parseNaturalLanguageProblem(query);
      onApplyParsedData(parsed);
    } catch (err: any) {
      setParseError(err.message || 'Failed to analyze your skincare request.');
    } finally {
      setIsParsing(false);
    }
  };

  const samplePrompts = [
    "Oily skin with acne and blackheads, budget ₹1500, fragrance-free",
    "Sensitive skin with redness and broken barrier, ₹1800 budget",
    "Dry skin looking for anti-aging and hydration, ₹2200 budget",
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="pt-16 pb-24 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-sage-100 text-sage-800 text-xs font-semibold tracking-wide uppercase mb-6">
            <Sparkles className="w-3.5 h-3.5 text-sage-600" />
            <span>AI-Powered Skincare Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-charcoal-900 tracking-tight leading-[1.15] font-serif">
            Your skin. <br />
            Your constraints. <br />
            <span className="text-sage-700 italic">Your routine.</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-charcoal-600 max-w-2xl mx-auto leading-relaxed">
            SkinSolve calculates the <strong>smallest coherent skincare routine</strong> tailored to your exact skin type, sensitivity, ingredient tolerances, and budget ceiling.
          </p>

          {/* Quick NLP Box */}
          <div className="mt-10 max-w-2xl mx-auto bg-surface-card p-3 rounded-2xl shadow-lg border border-surface-border">
            <form onSubmit={handleNaturalLanguageSubmit} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Describe your skin (e.g. 'Oily skin with acne, fragrance-free under ₹1500')..."
                className="flex-1 px-4 py-3 text-sm text-charcoal-900 bg-transparent border-0 focus:outline-none focus:ring-0 placeholder:text-charcoal-400"
              />
              <button
                type="submit"
                disabled={isParsing || !query.trim()}
                className="inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-sage-700 hover:bg-sage-800 disabled:opacity-50 text-white text-sm font-semibold transition-all shadow-sm"
              >
                {isParsing ? (
                  <>
                    <Zap className="w-4 h-4 animate-spin" />
                    <span>Parsing...</span>
                  </>
                ) : (
                  <>
                    <span>Instant Parse</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
            
            {parseError && (
              <p className="text-xs text-red-600 mt-2 px-2 text-left">{parseError}</p>
            )}

            {/* Prompt pills */}
            <div className="mt-3 pt-3 border-t border-surface-border/50 flex flex-wrap gap-2 items-center justify-start text-xs text-charcoal-500">
              <span className="font-medium text-sage-800">Try asking:</span>
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setQuery(p)}
                  className="bg-surface-muted hover:bg-sage-100 hover:text-sage-800 px-2.5 py-1 rounded-md transition-colors text-left"
                >
                  "{p}"
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={onStartQuiz}
              className="inline-flex items-center space-x-2 px-8 py-4 rounded-full bg-sage-700 hover:bg-sage-800 text-white font-semibold shadow-md hover:shadow-lg transition-all"
            >
              <span>Build My Routine (Guided Flow)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-surface-card border border-surface-border shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-sage-100 text-sage-800 flex items-center justify-center mb-5">
              <IndianRupee className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-charcoal-900 mb-2">Strict Budget Optimization</h3>
            <p className="text-sm text-charcoal-600 leading-relaxed">
              We guarantee the total routine cost will never exceed your specified budget ceiling. No surprise add-ons.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-surface-card border border-surface-border shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-sage-100 text-sage-800 flex items-center justify-center mb-5">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-charcoal-900 mb-2">Active Conflict Prevention</h3>
            <p className="text-sm text-charcoal-600 leading-relaxed">
              Our safety matrix checks cross-product interactions to prevent chemical burns or barrier damage (e.g. BHA + Retinoid overlap).
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-surface-card border border-surface-border shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-sage-100 text-sage-800 flex items-center justify-center mb-5">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-charcoal-900 mb-2">Minimal Coherent Routine</h3>
            <p className="text-sm text-charcoal-600 leading-relaxed">
              We recommend the smallest effective routine (Cleanser, Treatment, Moisturizer, Sunscreen) to minimize clutter and maximize efficacy.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
