import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, Shield, IndianRupee, Layers, ArrowRight, Zap,
  AlertCircle, CheckCircle2, ChevronRight, Beaker, Brain,
  TrendingUp, Star, Activity, Lock
} from 'lucide-react';
import { parseNaturalLanguageProblem } from '../services/api';
import type { ProblemParseResponse } from '../types/skincare';


interface LandingProps {
  onStartQuiz: () => void;
  onApplyParsedData: (data: ProblemParseResponse) => void;
  onNavigate: (view: string) => void;
}

/* ─── Floating particle component ─────────────────────────────────────── */
interface Particle {
  id: number; x: number; size: number; duration: number; delay: number; opacity: number;
}
const HeroParticles: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  useEffect(() => {
    setParticles(Array.from({ length: 22 }, (_, i) => ({
      id: i, x: Math.random() * 100,
      size: 2 + Math.random() * 4,
      duration: 8 + Math.random() * 14,
      delay: Math.random() * 10,
      opacity: 0.15 + Math.random() * 0.45,
    })));
  }, []);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map(p => (
        <div key={p.id} className="absolute rounded-full bg-[#93BCA0]"
          style={{ left: `${p.x}%`, bottom: '-10px', width: p.size, height: p.size, opacity: p.opacity,
            animation: `particleDrift ${p.duration}s ease-in-out ${p.delay}s infinite` }} />
      ))}
    </div>
  );
};

/* ─── Grid background ─────────────────────────────────────────────────── */
const GridBackground: React.FC = () => (
  <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
    style={{ backgroundImage: `linear-gradient(rgba(147,188,160,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(147,188,160,0.06) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
);

/* ─── Stat Pill ────────────────────────────────────────────────────────── */
interface StatPillProps { icon: React.ReactNode; label: string; value: string; delay?: string; floatClass?: string; }
const StatPill: React.FC<StatPillProps> = ({ icon, label, value, delay = '0s', floatClass = 'hero-float-1' }) => (
  <div className={`glass-card-dark rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xl ${floatClass}`} style={{ animationDelay: delay }}>
    <div className="w-9 h-9 rounded-xl bg-[#93BCA0]/20 flex items-center justify-center shrink-0">{icon}</div>
    <div>
      <div className="text-[10px] font-bold text-[#93BCA0] uppercase tracking-widest leading-none mb-0.5">{label}</div>
      <div className="text-sm font-extrabold text-white leading-none font-serif">{value}</div>
    </div>
  </div>
);

/* ─── Main Component ───────────────────────────────────────────────────── */
export const Landing: React.FC<LandingProps> = ({ onStartQuiz, onApplyParsedData }) => {
  const [query, setQuery] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      setMousePos({ x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height });
    };
    const el = heroRef.current;
    el?.addEventListener('mousemove', handleMove, { passive: true });
    return () => el?.removeEventListener('mousemove', handleMove);
  }, []);

  const parallaxX = (mousePos.x - 0.5) * 18;
  const parallaxY = (mousePos.y - 0.5) * 10;

  const handleNaturalLanguageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsParsing(true); setParseError(null);
    try { const parsed = await parseNaturalLanguageProblem(query); onApplyParsedData(parsed); }
    catch (err: any) { setParseError(err.message || 'Failed to analyze your skincare request.'); }
    finally { setIsParsing(false); }
  };

  const samplePrompts = [
    "Oily skin with active acne & dark spots, budget ₹1500, fragrance-free",
    "Sensitive redness & damaged skin barrier, ₹1800 budget",
    "Dry skin looking for anti-aging and hydration, ₹2200 budget",
  ];

  const brandLogos = [
    "Minimalist", "The Derma Co", "Dot & Key", "Plum", "Chemist at Play",
    "Foxtale", "Re'equil", "Aqualogica", "CeraVe", "Cetaphil", "COSRX", "Paula's Choice"
  ];

  return (
    <div className="relative overflow-hidden bg-[#FAF8F5]">

      {/* ═══════════ HERO — full-viewport cinematic opening ═══════════ */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col justify-center overflow-hidden"
        style={{ background: `radial-gradient(ellipse 80% 60% at 20% 10%, rgba(27,59,43,0.88) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 90%, rgba(18,41,30,0.70) 0%, transparent 55%), radial-gradient(ellipse 100% 80% at 50% 50%, rgba(12,28,20,0.95) 0%, #0D1F17 100%)` }}>

        <GridBackground />
        <HeroParticles />

        {/* Ghost wordmark */}
        <div className="absolute bottom-0 left-0 select-none pointer-events-none" aria-hidden="true"
          style={{ fontSize: 'clamp(80px, 18vw, 240px)', fontWeight: 800, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.03)', fontFamily: 'Playfair Display, Georgia, serif', lineHeight: 0.85 }}>
          SKINSOLVE
        </div>

        {/* Floor light pool */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] pointer-events-none" aria-hidden="true"
          style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(147,188,160,0.12) 0%, rgba(147,188,160,0.04) 45%, transparent 70%)' }} />

        {/* Column guides */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {[20, 50, 80].map(p => (
            <div key={p} className="absolute top-0 bottom-0 w-px" style={{ left: `${p}%`, background: 'linear-gradient(180deg, transparent 0%, rgba(147,188,160,0.07) 15%, rgba(147,188,160,0.07) 80%, transparent 100%)' }} />
          ))}
        </div>

        {/* ── Content grid ─────────────────────────────────────────────── */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 pt-28 pb-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            {/* LEFT */}
            <div className="lg:col-span-7 flex flex-col gap-6">

              {/* Eyebrow badge */}
              <div className="hero-animate-1 inline-flex self-start items-center gap-2.5 px-4 py-1.5 rounded-full glass-card border border-[#93BCA0]/30 text-xs font-bold tracking-widest uppercase text-[#93BCA0]">
                <Sparkles className="w-3.5 h-3.5 text-[#E89D75] animate-pulse" />
                Indian Beautytech · Multi-Objective Intelligence
              </div>

              {/* Headline */}
              <h1 className="hero-animate-2"
                style={{ fontSize: 'clamp(38px, 6vw, 76px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.06, fontFamily: 'Playfair Display, Georgia, serif', color: '#FFFFFF', transform: `translate(${parallaxX * -0.3}px, ${parallaxY * -0.2}px)`, transition: 'transform 0.3s ease-out' }}>
                Your skin problem.{' '}
                <span className="shimmer-text italic block">A smarter way<br />to solve it.</span>
              </h1>

              {/* Lede */}
              <p className="hero-animate-3 text-base sm:text-lg text-[#93BCA0]/90 max-w-xl leading-relaxed font-sans">
                Stop guessing skincare. SkinSolve analyzes your dermal concerns, strict budget, and ingredient preferences to assemble a minimal, 100% constraint-safe AM/PM routine.
              </p>

              {/* NLP Search Box */}
              <div className="hero-animate-4 glass-card-dark rounded-2xl p-1 shadow-2xl" style={{ animation: 'glowPulse 4s ease-in-out infinite' }}>
                <form onSubmit={handleNaturalLanguageSubmit} className="flex flex-col sm:flex-row gap-1.5">
                  <input type="text" value={query} onChange={e => setQuery(e.target.value)}
                    placeholder="Describe your skin (e.g. 'Oily skin with acne, fragrance-free under ₹1500')..."
                    className="flex-1 px-4 py-3.5 text-sm text-white bg-transparent border-0 focus:outline-none placeholder:text-[#93BCA0]/50 font-sans" />
                  <button type="submit" disabled={isParsing || !query.trim()}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#93BCA0] hover:bg-[#E6EFE9] disabled:opacity-50 text-[#0D1F17] text-sm font-bold transition-all shadow-lg shrink-0 cursor-pointer">
                    {isParsing ? <><Zap className="w-4 h-4 animate-spin" /><span>Analyzing…</span></> : <><span>Solve My Skin</span><ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>
                {parseError && <p className="text-xs text-red-400 mt-2 px-4 pb-2">{parseError}</p>}
                <div className="px-3 pb-3 pt-1 border-t border-[#93BCA0]/10 mt-1 flex flex-wrap gap-2">
                  <span className="text-[10px] font-bold text-[#93BCA0]/60 uppercase tracking-widest self-center">Try:</span>
                  {samplePrompts.map((p, i) => (
                    <button key={i} type="button" onClick={() => setQuery(p)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-[#93BCA0]/10 hover:bg-[#93BCA0]/20 text-[#93BCA0] font-medium border border-[#93BCA0]/15 transition-colors cursor-pointer text-left">
                      "{p}"
                    </button>
                  ))}
                </div>
              </div>

              {/* CTAs */}
              <div className="hero-animate-5 flex flex-wrap items-center gap-4">
                <button onClick={onStartQuiz}
                  className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-[#E6EFE9] hover:bg-white text-[#1B3B2B] font-bold shadow-xl hover:shadow-2xl transition-all text-sm cursor-pointer"
                  style={{ transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)' }}>
                  <span>Take Guided Skin Assessment</span>
                  <ChevronRight className="w-4 h-4 text-[#4A7C59]" />
                </button>
                <div className="text-xs text-[#93BCA0]/70 flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-[#93BCA0]/50" />
                  <span>Zero sponsored bias · 100% Deterministic</span>
                </div>
              </div>
            </div>

            {/* RIGHT — glassmorphism showcase card */}
            <div className="lg:col-span-5 relative flex justify-center lg:justify-end"
              style={{ transform: `translate(${parallaxX * 0.5}px, ${parallaxY * 0.3}px)`, transition: 'transform 0.35s ease-out' }}>

              <div className="relative w-full max-w-sm hero-float-2">
                <div className="glass-card-dark rounded-3xl p-5 shadow-2xl">

                  {/* Card header */}
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#93BCA0]/15">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#93BCA0]/20 border border-[#93BCA0]/30 flex items-center justify-center font-extrabold text-base text-white font-serif">91%</div>
                      <div>
                        <div className="text-[10px] font-extrabold text-[#93BCA0] uppercase tracking-wider">Multi-Objective Score</div>
                        <div className="text-sm font-bold text-white font-serif">Acne + Sebum Target</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-[#93BCA0]/70 uppercase tracking-wider font-semibold">Cost</div>
                      <div className="text-sm font-bold text-white">₹1,420 <span className="text-xs font-normal text-[#93BCA0]/60">/ ₹1,500</span></div>
                    </div>
                  </div>

                  {/* AM steps */}
                  <div className="text-[10px] font-bold text-[#93BCA0]/70 uppercase tracking-widest flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E89D75] inline-block" />Morning Protocol (AM)
                    <span className="ml-auto px-2 py-0.5 rounded-full bg-[#E89D75]/15 text-[#E89D75] font-bold">3 Steps</span>
                  </div>
                  <div className="space-y-2 mb-4">
                    {[
                      { step: '01', name: 'Salicylic Acid 2% Cleanser', brand: 'Minimalist', price: '₹299', match: '94%' },
                      { step: '02', name: 'Niacinamide 10% + Zinc 1%',  brand: 'Minimalist', price: '₹599', match: '96%' },
                      { step: '03', name: 'Hyaluronic Sunscreen Aqua',  brand: 'The Derma Co', price: '₹449', match: '92%' },
                    ].map(item => (
                      <div key={item.step} className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2.5 border border-[#93BCA0]/12">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-[#93BCA0]/20 text-[#93BCA0] font-bold flex items-center justify-center text-[9px] shrink-0">{item.step}</span>
                          <div>
                            <div className="text-xs font-bold text-white leading-tight">{item.name}</div>
                            <div className="text-[10px] text-[#93BCA0]/60">{item.brand} · {item.price}</div>
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#4A7C59]/30 text-[#93BCA0] font-bold border border-[#93BCA0]/20 shrink-0">{item.match}</span>
                      </div>
                    ))}
                  </div>

                  {/* PM step */}
                  <div className="text-[10px] font-bold text-[#93BCA0]/70 uppercase tracking-widest flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4A7C59] inline-block" />Evening Protocol (PM)
                    <span className="ml-auto px-2 py-0.5 rounded-full bg-[#4A7C59]/20 text-[#4A7C59] font-bold">1 Step</span>
                  </div>
                  <div className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2.5 border border-[#93BCA0]/12 mb-4">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-[#93BCA0]/20 text-[#93BCA0] font-bold flex items-center justify-center text-[9px] shrink-0">04</span>
                      <div>
                        <div className="text-xs font-bold text-white leading-tight">Vitamin B5 Oil-Free Gel Moisturizer</div>
                        <div className="text-[10px] text-[#93BCA0]/60">Minimalist · ₹349</div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#4A7C59]/30 text-[#93BCA0] font-bold border border-[#93BCA0]/20 shrink-0">Safe</span>
                  </div>

                  {/* Footer badges */}
                  <div className="flex items-center justify-between text-[10px] pt-3 border-t border-[#93BCA0]/10">
                    <span className="flex items-center gap-1 font-semibold text-[#93BCA0]"><CheckCircle2 className="w-3.5 h-3.5" />100% Fragrance-Free</span>
                    <span className="flex items-center gap-1 font-semibold text-[#E89D75]"><Shield className="w-3.5 h-3.5" />Conflict Shield Active</span>
                  </div>
                </div>

                {/* Floating orbital stats (visible ≥ xl) */}
                <div className="absolute -left-20 top-8 hidden xl:block">
                  <StatPill icon={<Brain className="w-4 h-4 text-[#93BCA0]" />} label="Brands Indexed" value="12+" floatClass="hero-float-1" />
                </div>
                <div className="absolute -right-16 bottom-20 hidden xl:block">
                  <StatPill icon={<Activity className="w-4 h-4 text-[#E89D75]" />} label="Avg. Match Score" value="91%" delay="-2s" floatClass="hero-float-3" />
                </div>
                <div className="absolute -left-14 bottom-2 hidden xl:block">
                  <StatPill icon={<TrendingUp className="w-4 h-4 text-[#93BCA0]" />} label="Products Indexed" value="500+" delay="-4s" floatClass="hero-float-2" />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom metrics bar */}
          <div className="mt-16 pt-8 border-t border-[#93BCA0]/10 grid grid-cols-2 sm:grid-cols-4 gap-6 hero-animate-5">
            {[
              { icon: <Beaker className="w-4 h-4 text-[#93BCA0]" />, value: '500+', label: 'Clinical Products' },
              { icon: <Star className="w-4 h-4 text-[#E89D75]" />,  value: '12+',  label: 'Indian Brands' },
              { icon: <Shield className="w-4 h-4 text-[#93BCA0]" />, value: '6',   label: 'Score Dimensions' },
              { icon: <Lock className="w-4 h-4 text-[#E89D75]" />,   value: '100%',label: 'Budget Guarantee' },
            ].map(stat => (
              <div key={stat.label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#93BCA0]/10 flex items-center justify-center shrink-0">{stat.icon}</div>
                <div>
                  <div className="text-lg font-extrabold text-white leading-none font-serif">{stat.value}</div>
                  <div className="text-[10px] font-semibold text-[#93BCA0]/60 uppercase tracking-widest">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-[#93BCA0]/40 pointer-events-none select-none" aria-hidden="true">
          <span>Discover</span>
          <div className="relative w-px h-10 bg-[#93BCA0]/15 overflow-hidden">
            <div className="scroll-track" />
          </div>
        </div>
      </section>

      {/* ═══════════ BRAND CATALOG BAR ═══════════ */}
      <section className="py-8 bg-white border-y border-[#E5E0D7]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs font-bold text-[#829590] uppercase tracking-widest mb-4">Indexed Indian &amp; Global Clinical Skincare Brands</p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {brandLogos.map((brand, i) => (
              <span key={i} className="text-sm font-bold text-[#2C3C39] tracking-wide font-sans hover:text-[#1B3B2B] transition-colors">{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-[#4A7C59] uppercase tracking-widest">4-Step Intelligence Pipeline</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1C2826] font-serif mt-2">How SkinSolve Assembles Your Routine</h2>
          <p className="mt-3 text-base text-[#556864]">From natural language prompt parsing to combinatorial budget optimization.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { n: '01', title: 'Dermal Profiling', body: 'Extracts skin type, active concerns (acne, pigmentation), sensitivity level, and budget ceiling.' },
            { n: '02', title: 'Constraint Hard Filter', body: 'Filters out fragrance, alcohol denat, excluded ingredients, and owned product categories.' },
            { n: '03', title: 'Multi-Objective Scoring', body: 'Scores candidates across Concern, Ingredient, Skin, Preference, Budget, and Evidence fit.' },
            { n: '04', title: 'Routine Optimization', body: 'Finds highest utility AM/PM routine combination satisfying total budget ceiling.' },
          ].map(step => (
            <div key={step.n} className="bg-white border border-[#E5E0D7] rounded-2xl p-6 shadow-sm space-y-3 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <span className="w-8 h-8 rounded-xl bg-[#E6EFE9] text-[#1B3B2B] font-bold text-sm flex items-center justify-center">{step.n}</span>
              <h3 className="font-bold text-base text-[#1C2826] font-serif">{step.title}</h3>
              <p className="text-xs text-[#556864] leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ DIFFERENTIATOR ═══════════ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl font-extrabold text-[#1C2826] font-serif">Why SkinSolve is Different</h2>
          <p className="mt-3 text-base text-[#556864]">Traditional recommenders optimize for selling individual products. SkinSolve optimizes for solving your skin problem under strict mathematical constraints.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="p-8 rounded-3xl bg-white border border-red-200 shadow-sm">
            <div className="inline-block px-3 py-1 rounded-full bg-red-50 text-red-700 font-bold text-xs uppercase mb-4">Generic Quizzes &amp; E-Commerce Recommenders</div>
            <ul className="space-y-4 text-sm text-[#556864]">
              {['Recommends standalone popular products based on sales commission','Ignores overall routine budget ceilings (promotes overpriced items)','Causes dermal irritation by recommending conflicting actives (BHA + Retinoids)','Opaque scoring algorithms ("You might also like...")'].map(txt => (
                <li key={txt} className="flex items-start gap-3"><AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" /><span>{txt}</span></li>
              ))}
            </ul>
          </div>
          <div className="p-8 rounded-3xl bg-[#1B3B2B] text-white shadow-xl">
            <div className="inline-block px-3 py-1 rounded-full bg-[#3D6A4D] text-[#FAF8F5] font-bold text-xs uppercase mb-4 border border-[#93BCA0]/40">SkinSolve Decision Engine</div>
            <ul className="space-y-4 text-sm text-[#FAF8F5]/90">
              {['Optimizes minimal 4-step coherent routine (AM/PM slotting)','Strict hard constraint guarantee: Routine total ≤ budget limit','Active Conflict Shield prevents skin barrier breakdown','100% Transparent multi-factor score breakdown + "Why NOT" rejection reasons'].map(txt => (
                <li key={txt} className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-[#E89D75] shrink-0 mt-0.5" /><span>{txt}</span></li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURE CARDS ═══════════ */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { Icon: IndianRupee, title: 'Budget Fit Guarantee', body: 'We guarantee total routine cost strictly respects your specified budget ceiling. If no routine fits, our failure handler provides actionable budget/step recommendations.' },
            { Icon: Shield,      title: 'Active Conflict Shield', body: 'Our contraindication rules evaluate active ingredients across products to avoid severe chemical irritation or barrier damage (e.g. BHA + Retinoid overlap).' },
            { Icon: Layers,      title: 'Minimal Routine Philosophy', body: 'We recommend the smallest effective routine (Cleanser, Treatment, Moisturizer, Sunscreen) to eliminate skincare clutter and focus on dermal results.' },
          ].map(({ Icon, title, body }) => (
            <div key={title} className="p-8 rounded-2xl bg-white border border-[#E5E0D7] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-[#E6EFE9] text-[#1B3B2B] flex items-center justify-center mb-5"><Icon className="w-6 h-6 text-[#4A7C59]" /></div>
              <h3 className="text-lg font-bold text-[#1C2826] mb-2 font-serif">{title}</h3>
              <p className="text-sm text-[#556864] leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

