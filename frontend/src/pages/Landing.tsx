import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Menu, X, Check, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import { parseNaturalLanguageProblem } from '../services/api';
import type { ProblemParseResponse } from '../types/skincare';

/* ═══════════════════════════════════════════════════════════════
   TYPES & PROPS
   ═══════════════════════════════════════════════════════════════ */
interface LandingProps {
  onStartQuiz: () => void;
  onApplyParsedData: (data: ProblemParseResponse) => void;
  onNavigate: (view: string) => void;
}

/* ═══════════════════════════════════════════════════════════════
   HOOK — INTERSECTION OBSERVER for scroll reveals
   ═══════════════════════════════════════════════════════════════ */
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('in-view'); obs.unobserve(el); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return ref;
}

/* ═══════════════════════════════════════════════════════════════
   SCORE COUNTER COMPONENT
   ═══════════════════════════════════════════════════════════════ */
const ScoreCounter: React.FC<{ target: number; duration?: number; className?: string }> = ({
  target, duration = 1600, className = ''
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      obs.unobserve(el);
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        setCount(Math.round(ease * target));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);
  return <span ref={ref} className={className}>{count}</span>;
};

/* ═══════════════════════════════════════════════════════════════
   FLOATING NAV (landing-specific)
   ═══════════════════════════════════════════════════════════════ */
const LandingNav: React.FC<{
  onStartQuiz: () => void;
  onNavigate: (view: string) => void;
  activeSection?: string;
  scrollProgress?: number;
}> = ({ onStartQuiz, onNavigate, activeSection = '', scrollProgress = 0 }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0, left: 0, right: 0,
    zIndex: 100,
    height: '72px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 clamp(16px, 4vw, 56px)',
    background: scrolled ? 'rgba(244, 240, 233, 0.94)' : 'transparent',
    backdropFilter: scrolled ? 'blur(16px)' : 'none',
    WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
    borderBottom: scrolled ? '1px solid rgba(216, 201, 184, 0.35)' : '1px solid transparent',
    transition: 'background 0.5s ease, backdrop-filter 0.5s ease, border-color 0.5s ease',
  };

  const navLinks = [
    { label: 'How it Works', id: 'how-it-works' },
    { label: 'Our Intelligence', id: 'intelligence' },
    { label: 'Routine', id: 'routine' },
    { label: 'Explore', view: 'catalog' },
  ];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <>
      {/* Top Reading Progress Bar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '2.5px',
          width: `${scrollProgress}%`,
          background: 'linear-gradient(90deg, #AAB5A1 0%, #E89D75 50%, #C98D78 100%)',
          zIndex: 101,
          transition: 'width 0.1s linear',
          boxShadow: '0 0 8px rgba(232, 157, 117, 0.5)',
        }}
      />
      <header style={navStyle}>
        {/* Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            background: 'none', border: 'none', padding: 0, cursor: 'pointer',
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '22px', fontWeight: 500, letterSpacing: '0.1em',
            color: scrolled ? '#24352A' : '#F4F0E9',
            textTransform: 'uppercase' as const,
            transition: 'color 0.5s ease',
          }}
        >
          SkinSolve
        </button>

        {/* Desktop Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '36px' }} className="hidden lg:flex">
          {navLinks.map(link => {
            const isActive = link.id === activeSection;
            return (
              <div key={link.label} className="nav-link-item">
                <button
                  onClick={() => link.view ? onNavigate(link.view) : scrollToSection(link.id!)}
                  style={{
                    background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                    fontFamily: "'Manrope', sans-serif",
                    fontSize: '13px', fontWeight: isActive ? 700 : 500, letterSpacing: '0.02em',
                    color: isActive
                      ? (scrolled ? '#24352A' : '#F4F0E9')
                      : (scrolled ? '#6B7C74' : 'rgba(244, 240, 233, 0.75)'),
                    transition: 'color 0.3s ease',
                  }}
                  onMouseEnter={e => ((e.target as HTMLElement).style.color = scrolled ? '#24352A' : '#F4F0E9')}
                  onMouseLeave={e => ((e.target as HTMLElement).style.color = isActive ? (scrolled ? '#24352A' : '#F4F0E9') : (scrolled ? '#6B7C74' : 'rgba(244, 240, 233, 0.75)'))}
                >
                  {link.label}
                </button>
                <span className={`nav-link-dot ${isActive ? 'active' : ''}`} />
              </div>
            );
          })}
        </nav>

        {/* Right Side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={onStartQuiz}
            className="hidden sm:inline-flex btn-primary"
            style={{
              padding: '10px 22px',
              fontSize: '12px',
              background: scrolled ? '#24352A' : 'rgba(244, 240, 233, 0.15)',
              border: scrolled ? 'none' : '1px solid rgba(244, 240, 233, 0.35)',
              color: '#F4F0E9',
              backdropFilter: scrolled ? 'none' : 'blur(4px)',
              transition: 'all 0.5s ease',
            }}
          >
            <span>Solve My Skin Problem</span>
            <ArrowRight size={13} className="btn-arrow" />
          </button>

          <button
            className="lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: scrolled ? '#24352A' : '#F4F0E9',
              transition: 'color 0.3s ease',
            }}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div style={{
            position: 'absolute', top: '72px', left: 0, right: 0,
            background: 'rgba(244, 240, 233, 0.98)',
            backdropFilter: 'blur(24px)',
            borderBottom: '1px solid rgba(216, 201, 184, 0.4)',
            padding: '16px 24px 24px',
            display: 'flex', flexDirection: 'column', gap: '0',
          }}>
            {navLinks.map(link => (
              <button
                key={link.label}
                onClick={() => link.view ? onNavigate(link.view) : scrollToSection(link.id!)}
                style={{
                  background: 'none', border: 'none', textAlign: 'left',
                  fontFamily: "'Manrope', sans-serif", fontSize: '15px',
                  fontWeight: link.id === activeSection ? 700 : 500,
                  color: link.id === activeSection ? '#C98D78' : '#24352A', cursor: 'pointer',
                  padding: '14px 0', borderBottom: '1px solid rgba(216, 201, 184, 0.3)',
                }}
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => { onStartQuiz(); setMobileOpen(false); }}
              className="btn-primary mt-5"
              style={{ justifyContent: 'center' }}
            >
              <span>Solve My Skin Problem</span>
              <ArrowRight size={14} className="btn-arrow" />
            </button>
          </div>
        )}
      </header>
    </>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN LANDING COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export const Landing: React.FC<LandingProps> = ({ onStartQuiz, onApplyParsedData, onNavigate }) => {
  /* ── NLP state ───────────────────────────────────────────── */
  const [query, setQuery] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  /* ── Scroll Tracking & Spy ─────────────────────────────────── */
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<string>('');

  /* ── Hero Card 3D Tilt Interaction ─────────────────────────── */
  const [heroCardTilt, setHeroCardTilt] = useState({ x: 0, y: 0 });

  const handleHeroCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -16;
    setHeroCardTilt({ x, y });
  };

  const handleHeroCardMouseLeave = () => {
    setHeroCardTilt({ x: 0, y: 0 });
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setScrollY(currentScroll);
      const totalDocHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalDocHeight > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (currentScroll / totalDocHeight) * 100)));
      }
      if (currentScroll < 200) {
        setActiveSection('');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* ── Active Section Intersection Observer ────────────────── */
  useEffect(() => {
    const sectionIds = ['problem-section', 'how-it-works', 'intelligence', 'routine'];
    const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!sections.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, { rootMargin: '-20% 0px -40% 0px', threshold: 0.2 });

    sections.forEach(s => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  /* ── Score counter for hero card ─────────────────────────── */
  const [heroScore, setHeroScore] = useState(0);
  const heroCardRef = useRef<HTMLDivElement>(null);

  /* ── Problem section scroll state ────────────────────────── */
  const [pillsFading, setPillsFading] = useState(false);
  const [showFinalStatement, setShowFinalStatement] = useState(false);
  const problemRef = useRef<HTMLDivElement>(null);

  /* ── Stage section active index ──────────────────────────── */
  const [activeStage, setActiveStage] = useState(0);
  const stageRefs = useRef<(HTMLDivElement | null)[]>([]);

  /* ── Product optimization animation ──────────────────────── */
  const [optPhase, setOptPhase] = useState<0 | 1 | 2>(0);

  /* ── Constraint filter animation ─────────────────────────── */
  const [constraintPhase, setConstraintPhase] = useState<0 | 1>(0);

  const handleNaturalLanguageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsParsing(true); setParseError(null);
    try {
      const parsed = await parseNaturalLanguageProblem(query);
      onApplyParsedData(parsed);
    } catch (err: unknown) {
      setParseError((err as Error).message || 'Failed to analyze your skincare request.');
    } finally {
      setIsParsing(false);
    }
  };

  /* ── Hero score counter ──────────────────────────────────── */
  useEffect(() => {
    const el = heroCardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      obs.unobserve(el);
      const duration = 1600;
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        setHeroScore(Math.round(ease * 91));
        if (p < 1) requestAnimationFrame(tick);
      };
      // Delay to match card animation
      setTimeout(() => requestAnimationFrame(tick), 1100);
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* ── Problem section IntersectionObserver ────────────────── */
  useEffect(() => {
    const el = problemRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => setPillsFading(true), 1200);
        setTimeout(() => setShowFinalStatement(true), 2200);
      }
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* ── Stage intersection tracking ─────────────────────────── */
  useEffect(() => {
    const observers = stageRefs.current.map((el, idx) => {
      if (!el) return null;
      const obs = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) setActiveStage(idx);
      }, { threshold: 0.6, rootMargin: '-20% 0px -20% 0px' });
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach(o => o?.disconnect());
  }, []);

  /* ── Optimization animation trigger ─────────────────────── */
  const optRef = useReveal(0.3);

  /* ── Trigger opt animation on view ──────────────────────── */
  const optSectionRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = optSectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => setOptPhase(1), 600);
        setTimeout(() => setOptPhase(2), 1800);
        obs.unobserve(el);
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* ── Trigger constraint animation on view ────────────────── */
  const constraintSectionRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = constraintSectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => setConstraintPhase(1), 800);
        obs.unobserve(el);
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* ── Reveal refs ─────────────────────────────────────────── */
  const r1 = useReveal(); const r2 = useReveal(); const r3 = useReveal();
  const r4 = useReveal(); const r5 = useReveal(); const r6 = useReveal();
  const r7 = useReveal(); const r8 = useReveal(); const r9 = useReveal();
  const r10 = useReveal(); const r11 = useReveal(); const r12 = useReveal();

  /* ─────────────── DATA ───────────────────────────────────── */
  const stages = [
    {
      num: '01', label: 'TELL US',
      headline: 'Your skin, in your words.',
      body: '"Oily skin. Active acne. Sensitive to fragrance. I need to stay under ₹1,500."',
      accent: '#C98D78',
    },
    {
      num: '02', label: 'UNDERSTAND',
      headline: 'We build your skin profile.',
      body: 'Skin type. Concerns. Sensitivity. Preferences. Budget ceiling. Each parameter becomes part of the constraint set.',
      accent: '#AAB5A1',
    },
    {
      num: '03', label: 'CONSTRAIN',
      headline: 'We apply every rule.',
      body: '₹1,500 maximum. Fragrance-free. Minimal routine. Products that conflict with your skin are eliminated before ranking begins.',
      accent: '#D8C9B8',
    },
    {
      num: '04', label: 'RANK',
      headline: 'Candidates are scored.',
      body: 'Six-dimensional scoring: Concern fit · Ingredient quality · Skin compatibility · Budget efficiency · Evidence rating · Preference match.',
      accent: '#AAB5A1',
    },
    {
      num: '05', label: 'OPTIMIZE',
      headline: 'Routine assembles itself.',
      body: 'The algorithm finds the highest-utility combination of AM + PM steps that satisfies every constraint simultaneously.',
      accent: '#C98D78',
    },
    {
      num: '06', label: 'EXPLAIN',
      headline: 'We show our work.',
      body: 'Every product has a reason. Every rejection has an explanation. No black boxes. No mystery.',
      accent: '#D8C9B8',
    },
  ];

  const allProducts12 = [
    'Salicylic 2% Cleanser', 'Niacinamide 10%', 'Hyaluronic SPF', 'Vit B5 Gel',
    'Azelaic Acid 10%', 'Retinol 0.2%', 'BHA Exfoliant', 'Centella Toner',
    'Ceramide Moisturizer', 'Tranexamic Serum', 'Glycolic 7%', 'Peptide Cream',
  ];
  const invalidProducts = [3, 5, 6, 8]; // indices that fail constraints
  const finalProducts = [0, 1, 2, 4];   // the 4 that make the routine

  const constraintProducts = [
    { name: 'Salicylic 2% Cleanser', brand: 'Minimalist', valid: true, price: '₹299' },
    { name: 'Niacinamide 10% + Zinc', brand: 'Minimalist', valid: true, price: '₹599' },
    { name: 'Fragrance Toner', brand: 'Brand X', valid: false, reason: 'Contains fragrance' },
    { name: 'Aqua SPF 50', brand: 'The Derma Co', valid: true, price: '₹449' },
    { name: 'Rose Water Essence', brand: 'Brand Y', valid: false, reason: '₹620 — over budget' },
    { name: 'Vit B5 Moisturizer', brand: 'Minimalist', valid: true, price: '₹349' },
  ];

  /* ─────────────────────────────────────────────────────────────
     RENDER
     ───────────────────────────────────────────────────────────── */
  return (
    <div style={{ background: '#F4F0E9', fontFamily: "'Manrope', sans-serif" }}>

      {/* ── Landing-specific floating navbar ── */}
      <LandingNav
        onStartQuiz={onStartQuiz}
        onNavigate={onNavigate}
        activeSection={activeSection}
        scrollProgress={scrollProgress}
      />

      {/* ══════════════════════════════════════════════════════════
          SECTION 01 — HERO
          ══════════════════════════════════════════════════════════ */}
      <section
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'flex-end',
          overflow: 'hidden',
          background: '#191A17',
        }}
      >
        {/* Background Image with Scroll Parallax */}
        <img
          src="/hero-portrait.jpg"
          alt="Editorial skincare portrait"
          className="hero-img"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '115%',
            objectFit: 'cover',
            objectPosition: 'center top',
            transform: `translate3d(0, ${Math.min(scrollY * 0.38, 280)}px, 0) scale(${1 + Math.min(scrollY * 0.0004, 0.12)})`,
            willChange: 'transform',
          }}
        />

        {/* Gradient overlays */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(25,26,23,0.15) 0%, rgba(25,26,23,0.05) 30%, rgba(25,26,23,0.55) 65%, rgba(25,26,23,0.92) 100%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, rgba(25,26,23,0.65) 0%, transparent 60%)',
        }} />

        {/* ── Hero Content with Scroll Fade & Upward Shift ── */}
        <div
          className="section-container"
          style={{
            position: 'relative',
            zIndex: 10,
            width: '100%',
            paddingBottom: 'clamp(60px, 8vh, 100px)',
            paddingTop: '120px',
            opacity: Math.max(0, 1 - scrollY / 650),
            transform: `translate3d(0, ${Math.min(scrollY * -0.16, 0)}px, 0)`,
            willChange: 'opacity, transform',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px', alignItems: 'flex-end' }}>

            {/* LEFT — Typography */}
            <div style={{ gridColumn: 'span 12' }} className="lg:col-span-7">

              {/* Label */}
              <div className="hero-label label-upper" style={{ color: '#AAB5A1', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ display: 'inline-block', width: '32px', height: '1px', background: '#AAB5A1' }} />
                Indian BeautyTech · AI-Powered Intelligence
              </div>

              {/* Main headline */}
              <h1 style={{ margin: 0 }}>
                <span
                  className="hero-line-1"
                  style={{
                    display: 'block',
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: 'clamp(64px, 10vw, 130px)',
                    fontWeight: 300,
                    lineHeight: 0.9,
                    letterSpacing: '-0.02em',
                    color: '#F4F0E9',
                  }}
                >
                  YOUR SKIN
                </span>
                <span
                  className="hero-line-2"
                  style={{
                    display: 'block',
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: 'clamp(64px, 10vw, 130px)',
                    fontWeight: 300,
                    lineHeight: 0.9,
                    letterSpacing: '-0.02em',
                    color: '#F4F0E9',
                    marginBottom: '32px',
                  }}
                >
                  PROBLEM.
                </span>
              </h1>

              {/* Subheadline */}
              <p
                className="hero-line-3"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 'clamp(24px, 3.5vw, 44px)',
                  fontWeight: 300,
                  fontStyle: 'italic',
                  lineHeight: 1.2,
                  color: 'rgba(244, 240, 233, 0.75)',
                  margin: '0 0 40px',
                  maxWidth: '520px',
                }}
              >
                A smarter way to solve it.
              </p>

              {/* Supporting tags */}
              <div
                className="hero-label"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap' as const,
                  gap: '8px',
                  marginBottom: '36px',
                }}
              >
                {['Personalized', 'Constraint-aware', 'Explainable'].map(tag => (
                  <span key={tag} style={{
                    padding: '6px 14px',
                    borderRadius: '100px',
                    border: '1px solid rgba(170, 181, 161, 0.35)',
                    color: '#AAB5A1',
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase' as const,
                  }}>
                    {tag}
                  </span>
                ))}
              </div>

              {/* Natural Language AI Input Form */}
              <form
                onSubmit={handleNaturalLanguageSubmit}
                style={{
                  marginBottom: '28px',
                  maxWidth: '560px',
                  background: 'rgba(25, 26, 23, 0.75)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(216, 201, 184, 0.3)',
                  borderRadius: '20px',
                  padding: '8px 8px 8px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
                }}
              >
                <Sparkles size={18} style={{ color: '#E89D75', flexShrink: 0 }} />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Oily skin, breakouts, no fragrance, under ₹1500..."
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#F4F0E9',
                    fontFamily: "'Manrope', sans-serif",
                    fontSize: '13px',
                    letterSpacing: '0.02em',
                  }}
                />
                <button
                  type="submit"
                  disabled={isParsing || !query.trim()}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 18px',
                    borderRadius: '14px',
                    background: query.trim() ? '#E89D75' : 'rgba(232, 157, 117, 0.3)',
                    color: '#191A17',
                    fontWeight: 700,
                    fontSize: '12px',
                    border: 'none',
                    cursor: query.trim() ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isParsing ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Parsing...</span>
                    </>
                  ) : (
                    <>
                      <span>AI Parse</span>
                      <ArrowRight size={13} />
                    </>
                  )}
                </button>
              </form>

              {parseError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FF7B72', fontSize: '12px', marginBottom: '20px' }}>
                  <AlertCircle size={14} />
                  <span>{parseError}</span>
                </div>
              )}

              {/* CTAs */}
              <div className="hero-cta" style={{ display: 'flex', flexWrap: 'wrap' as const, alignItems: 'center', gap: '16px' }}>
                <button
                  onClick={onStartQuiz}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '10px',
                    padding: '16px 32px',
                    background: '#F4F0E9', color: '#24352A',
                    fontFamily: "'Manrope', sans-serif",
                    fontSize: '13px', fontWeight: 700, letterSpacing: '0.04em',
                    borderRadius: '100px', border: 'none', cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    boxShadow: '0 8px 32px rgba(25, 26, 23, 0.3)',
                  }}
                  onMouseEnter={e => {
                    const t = e.currentTarget;
                    t.style.background = '#FFFFFF';
                    t.style.transform = 'translateY(-2px)';
                    t.style.boxShadow = '0 16px 40px rgba(25, 26, 23, 0.4)';
                    const arrow = t.querySelector('.btn-arrow') as HTMLElement;
                    if (arrow) arrow.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={e => {
                    const t = e.currentTarget;
                    t.style.background = '#F4F0E9';
                    t.style.transform = 'translateY(0)';
                    t.style.boxShadow = '0 8px 32px rgba(25, 26, 23, 0.3)';
                    const arrow = t.querySelector('.btn-arrow') as HTMLElement;
                    if (arrow) arrow.style.transform = 'translateX(0)';
                  }}
                >
                  <span>Solve My Skin Problem</span>
                  <ArrowRight size={14} className="btn-arrow" style={{ transition: 'transform 0.25s ease' }} />
                </button>

                <button
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '16px 24px', background: 'transparent', color: 'rgba(244, 240, 233, 0.7)',
                    fontFamily: "'Manrope', sans-serif",
                    fontSize: '13px', fontWeight: 500, letterSpacing: '0.03em',
                    borderRadius: '100px', border: '1px solid rgba(244, 240, 233, 0.2)', cursor: 'pointer',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={e => {
                    const t = e.currentTarget;
                    t.style.color = '#F4F0E9';
                    t.style.borderColor = 'rgba(244, 240, 233, 0.5)';
                  }}
                  onMouseLeave={e => {
                    const t = e.currentTarget;
                    t.style.color = 'rgba(244, 240, 233, 0.7)';
                    t.style.borderColor = 'rgba(244, 240, 233, 0.2)';
                  }}
                >
                  <span>See how it works</span>
                  <span style={{ fontSize: '10px' }}>○</span>
                </button>
              </div>
            </div>

            {/* RIGHT — Floating AI card with dynamic parallax & 3D tilt */}
            <div
              ref={heroCardRef}
              className="hero-card hero-float"
              style={{
                gridColumn: 'span 12',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'flex-end',
                transform: `translate3d(0, ${Math.min(scrollY * -0.1, 0)}px, 0)`,
                transition: 'transform 0.1s linear',
              }}
            >
              <div
                className="hidden lg:block hero-tilt-card"
                style={{
                  width: '100%',
                  maxWidth: '280px',
                  transform: `perspective(1000px) rotateX(${heroCardTilt.y}deg) rotateY(${heroCardTilt.x}deg)`,
                }}
                onMouseMove={handleHeroCardMouseMove}
                onMouseLeave={handleHeroCardMouseLeave}
              >
                <div className="ai-match-card" style={{ cursor: 'pointer' }}>
                  {/* Card header */}
                  <div style={{ marginBottom: '16px' }}>
                    <p className="label-upper" style={{ color: '#AAB5A1', margin: '0 0 8px' }}>AI Routine Match</p>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                      <span style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '52px', fontWeight: 300, lineHeight: 1,
                        color: '#F4F0E9',
                      }}>
                        {heroScore}
                      </span>
                      <span style={{ color: '#AAB5A1', fontSize: '20px', marginBottom: '6px' }}>%</span>
                    </div>
                  </div>

                  {/* Constraints */}
                  <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '6px', marginBottom: '16px' }}>
                    {['Oily skin', 'Acne', 'Fragrance-free', '₹1,500'].map(tag => (
                      <span key={tag} style={{
                        padding: '4px 10px', borderRadius: '100px',
                        background: 'rgba(170, 181, 161, 0.15)',
                        border: '1px solid rgba(170, 181, 161, 0.25)',
                        fontSize: '11px', color: 'rgba(244, 240, 233, 0.8)',
                        fontFamily: "'Manrope', sans-serif", fontWeight: 500,
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Divider */}
                  <div style={{ height: '1px', background: 'rgba(216, 201, 184, 0.15)', marginBottom: '14px' }} />

                  {/* Products summary */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ margin: 0, fontFamily: "'Manrope', sans-serif", fontSize: '12px', color: 'rgba(244, 240, 233, 0.5)', fontWeight: 500 }}>
                        4 products
                      </p>
                      <p style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: 400, color: '#F4F0E9' }}>
                        ₹1,420
                      </p>
                    </div>
                    <div style={{
                      padding: '6px 14px',
                      background: 'rgba(170, 181, 161, 0.2)',
                      borderRadius: '100px',
                      fontSize: '11px', color: '#AAB5A1',
                      fontFamily: "'Manrope', sans-serif", fontWeight: 700,
                      letterSpacing: '0.06em',
                    }}>
                      ₹80 remaining
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll cue with interactive click */}
        <button
          onClick={() => {
            const nextEl = document.getElementById('problem-section') || document.getElementById('brand-bar') || document.getElementById('how-it-works');
            if (nextEl) nextEl.scrollIntoView({ behavior: 'smooth' });
          }}
          style={{
            position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
            background: 'none', border: 'none', padding: '8px 16px',
            cursor: 'pointer', userSelect: 'none', zIndex: 10,
            opacity: Math.max(0, 1 - scrollY / 300),
            transition: 'opacity 0.2s ease, transform 0.2s ease',
          }}
          aria-label="Scroll to discover more"
        >
          <span className="label-upper" style={{ color: 'rgba(244, 240, 233, 0.45)', fontSize: '10px' }}>Discover</span>
          <div className="scroll-track" />
        </button>
      </section>

      {/* ══════════════════════════════════════════════════════════
          BRAND BAR — INFINITE MARQUEE TICKER
          ══════════════════════════════════════════════════════════ */}
      <section id="brand-bar" style={{ padding: '24px 0 28px', background: '#EDE9E0', borderBottom: '1px solid rgba(216, 201, 184, 0.4)', overflow: 'hidden' }}>
        <div className="section-container" style={{ marginBottom: '16px' }}>
          <p className="label-upper" style={{ color: '#AAB5A1', textAlign: 'center', margin: 0 }}>
            Indexed Indian & Global Clinical Skincare Brands
          </p>
        </div>
        <div className="brand-marquee-container">
          <div className="brand-marquee-track">
            {['Minimalist', 'The Derma Co', 'Dot & Key', 'Plum', 'Chemist at Play', 'Foxtale', "Re'equil", 'Aqualogica', 'CeraVe', 'COSRX', 'Minimalist', 'The Derma Co', 'Dot & Key', 'Plum', 'Chemist at Play', 'Foxtale', "Re'equil", 'Aqualogica', 'CeraVe', 'COSRX'].map((b, idx) => (
              <span key={`${b}-${idx}`} style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: '13px', fontWeight: 600, letterSpacing: '0.04em',
                color: '#6B7C74',
                whiteSpace: 'nowrap',
                transition: 'color 0.2s ease, transform 0.2s ease',
                display: 'inline-block',
                cursor: 'default',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget;
                el.style.color = '#24352A';
                el.style.transform = 'scale(1.06)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget;
                el.style.color = '#6B7C74';
                el.style.transform = 'scale(1)';
              }}
              >{b}</span>
            ))}
          </div>
          <div className="brand-marquee-track" aria-hidden="true">
            {['Minimalist', 'The Derma Co', 'Dot & Key', 'Plum', 'Chemist at Play', 'Foxtale', "Re'equil", 'Aqualogica', 'CeraVe', 'COSRX', 'Minimalist', 'The Derma Co', 'Dot & Key', 'Plum', 'Chemist at Play', 'Foxtale', "Re'equil", 'Aqualogica', 'CeraVe', 'COSRX'].map((b, idx) => (
              <span key={`${b}-dup-${idx}`} style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: '13px', fontWeight: 600, letterSpacing: '0.04em',
                color: '#6B7C74',
                whiteSpace: 'nowrap',
                transition: 'color 0.2s ease, transform 0.2s ease',
                display: 'inline-block',
                cursor: 'default',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget;
                el.style.color = '#24352A';
                el.style.transform = 'scale(1.06)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget;
                el.style.color = '#6B7C74';
                el.style.transform = 'scale(1)';
              }}
              >{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 02 — THE PROBLEM
          ══════════════════════════════════════════════════════════ */}
      <section
        id="problem-section"
        ref={problemRef}
        style={{ padding: 'clamp(80px, 12vh, 140px) 0', background: '#191A17', overflow: 'hidden' }}
      >
        <div className="section-container">

          {/* Big statement */}
          <div ref={r1} className="reveal" style={{ marginBottom: 'clamp(40px, 6vw, 80px)' }}>
            <p className="label-upper reveal reveal-delay-1" style={{ color: '#AAB5A1', marginBottom: '24px' }}>
              The Problem
            </p>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(48px, 7vw, 100px)',
              fontWeight: 300, lineHeight: 0.95,
              letterSpacing: '-0.02em', color: '#F4F0E9',
              margin: 0,
            }}>
              Skincare became<br />
              <em>too complicated.</em>
            </h2>
          </div>

          {/* Product pills */}
          <div style={{
            display: 'flex', flexWrap: 'wrap' as const,
            gap: '10px', marginBottom: '48px',
            transition: 'all 0.6s ease',
          }}>
            {[
              'Vitamin C Serum', 'Retinol Night Cream', 'Niacinamide 10%', 'Glycolic Acid Toner',
              'Hyaluronic Acid', 'AHA BHA Peel', 'Ceramide Moisturizer', 'Salicylic Cleanser',
              'Tranexamic Serum', 'Peptide Complex', 'Centella Toner', 'SPF 50',
            ].map((p, i) => (
              <span
                key={p}
                className="product-pill"
                style={{
                  opacity: pillsFading ? 0 : 1,
                  transform: pillsFading ? 'scale(0.8)' : 'scale(1)',
                  transitionDelay: `${i * 60}ms`,
                  transition: 'opacity 0.6s ease, transform 0.6s ease',
                }}
              >
                {p}
              </span>
            ))}
          </div>

          {/* Supporting copy */}
          <div ref={r2} className="reveal reveal-delay-2" style={{ maxWidth: '640px', marginBottom: '48px' }}>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(22px, 3vw, 36px)',
              fontWeight: 300, fontStyle: 'italic',
              color: 'rgba(244, 240, 233, 0.55)', lineHeight: 1.4, margin: 0,
            }}>
              "Thousands of products.<br />
              Hundreds of opinions.<br />
              Very little clarity."
            </p>
          </div>

          {/* Final statement */}
          <div style={{
            opacity: showFinalStatement ? 1 : 0,
            transform: showFinalStatement ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.8s ease, transform 0.8s ease',
          }}>
            <div style={{ height: '1px', background: 'rgba(216, 201, 184, 0.2)', marginBottom: '40px', width: '80px' }} />
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(32px, 5vw, 72px)',
              fontWeight: 300, lineHeight: 1.0,
              letterSpacing: '-0.02em', color: '#F4F0E9',
              margin: '0 0 12px',
            }}>
              Maybe you don't need<br /><em>more products.</em>
            </p>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(32px, 5vw, 72px)',
              fontWeight: 300, lineHeight: 1.0,
              letterSpacing: '-0.02em', color: '#C98D78',
              margin: 0,
            }}>
              You need the <em>right ones.</em>
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 03 — THE SKINSOLVE IDEA
          ══════════════════════════════════════════════════════════ */}
      <section style={{ padding: 'clamp(80px, 10vh, 120px) 0', background: '#F4F0E9', overflow: 'hidden' }}>
        <div className="section-container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: 'clamp(40px, 5vw, 80px)',
            alignItems: 'center',
          }}>

            {/* LEFT — Image */}
            <div
              ref={r3}
              className="reveal-left"
              style={{ gridColumn: 'span 5', position: 'relative', borderRadius: '16px', overflow: 'hidden' }}
            >
              <img
                src="/product-flatlay.jpg"
                alt="Skincare products editorial"
                style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover', display: 'block' }}
              />
              <div style={{
                position: 'absolute', bottom: '24px', left: '24px',
                padding: '12px 18px',
                background: 'rgba(244, 240, 233, 0.92)',
                backdropFilter: 'blur(12px)',
                borderRadius: '12px',
                border: '1px solid rgba(216, 201, 184, 0.5)',
              }}>
                <p className="label-upper" style={{ color: '#24352A', margin: 0, fontSize: '10px' }}>
                  The SkinSolve Method
                </p>
              </div>
            </div>

            {/* RIGHT — Copy */}
            <div
              ref={r4}
              className="reveal-right"
              style={{ gridColumn: 'span 7' }}
            >
              <div>
                <p className="label-upper" style={{ color: '#C98D78', marginBottom: '24px' }}>
                  The SkinSolve Idea
                </p>
                <h2 style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 'clamp(42px, 5vw, 80px)',
                  fontWeight: 300, lineHeight: 1.0,
                  letterSpacing: '-0.02em', color: '#191A17',
                  margin: '0 0 32px',
                }}>
                  Don't recommend<br />everything.<br /><br />
                  <em style={{ color: '#24352A' }}>Solve the problem.</em>
                </h2>

                <p style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: '16px', fontWeight: 400, lineHeight: 1.7,
                  color: '#6B7C74', marginBottom: '28px',
                }}>
                  SkinSolve understands your complete picture — not just your skin type — and finds
                  the smallest routine that makes sense.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '14px', marginBottom: '36px' }}>
                  {['Your skin', 'Your concerns', 'Your preferences', 'Your budget', 'Your existing products'].map((item, i) => (
                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '13px', fontWeight: 400, color: '#AAB5A1',
                        minWidth: '28px',
                      }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div style={{ flex: 1, height: '1px', background: 'rgba(170, 181, 161, 0.3)' }} />
                      <span style={{
                        fontFamily: "'Manrope', sans-serif",
                        fontSize: '14px', fontWeight: 500, color: '#24352A',
                      }}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>

                <p style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 'clamp(20px, 2.5vw, 30px)',
                  fontStyle: 'italic', fontWeight: 300,
                  color: '#24352A', lineHeight: 1.4,
                }}>
                  "and finds the smallest routine that makes sense."
                </p>
              </div>

              {/* Mobile version */}
              <div className="lg:hidden">
                <p className="label-upper" style={{ color: '#C98D78', marginBottom: '24px' }}>The SkinSolve Idea</p>
                <h2 style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 'clamp(42px, 8vw, 64px)',
                  fontWeight: 300, lineHeight: 1.05,
                  letterSpacing: '-0.02em', color: '#191A17', margin: '0 0 24px',
                }}>
                  Don't recommend everything.<br /><em style={{ color: '#24352A' }}>Solve the problem.</em>
                </h2>
                <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: '15px', lineHeight: 1.7, color: '#6B7C74' }}>
                  SkinSolve understands your complete picture and finds the smallest routine that makes sense for you.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 04 — HOW SKINSOLVE THINKS
          ══════════════════════════════════════════════════════════ */}
      <section id="how-it-works" style={{ padding: 'clamp(80px, 10vh, 120px) 0', background: '#24352A' }}>
        <div className="section-container">

          <div ref={r5} className="reveal" style={{ marginBottom: '64px' }}>
            <p className="label-upper" style={{ color: '#AAB5A1', marginBottom: '16px' }}>How SkinSolve Thinks</p>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(40px, 5.5vw, 72px)',
              fontWeight: 300, lineHeight: 1.05,
              letterSpacing: '-0.02em', color: '#F4F0E9', margin: 0,
            }}>
              The intelligence<br /><em>behind the routine.</em>
            </h2>
          </div>

          {/* Stages */}
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0' }}>
            {stages.map((stage, idx) => (
              <div
                key={stage.num}
                ref={el => { stageRefs.current[idx] = el; }}
                className="stage-item"
                style={{
                  opacity: activeStage === idx ? 1 : 0.25,
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr',
                  gap: '32px',
                  padding: 'clamp(32px, 4vh, 48px) 0',
                  borderBottom: '1px solid rgba(244, 240, 233, 0.08)',
                  alignItems: 'center',
                  transition: 'opacity 0.6s ease',
                  cursor: 'default',
                }}
              >
                {/* Giant number */}
                <div style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 'clamp(72px, 10vw, 140px)',
                  fontWeight: 300, lineHeight: 0.85,
                  color: activeStage === idx ? stage.accent : 'rgba(216, 201, 184, 0.2)',
                  minWidth: 'clamp(90px, 12vw, 160px)',
                  transition: 'color 0.6s ease',
                  letterSpacing: '-0.04em',
                }}>
                  {stage.num}
                </div>

                {/* Stage content */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '40px', flexWrap: 'wrap' as const }}>
                  <div style={{ minWidth: '120px' }}>
                    <p className="label-upper" style={{ color: stage.accent, margin: '0 0 8px', fontSize: '11px' }}>
                      {stage.label}
                    </p>
                    <h3 style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 'clamp(22px, 3vw, 36px)',
                      fontWeight: 400, lineHeight: 1.2,
                      color: '#F4F0E9', margin: 0,
                    }}>
                      {stage.headline}
                    </h3>
                  </div>
                  <p style={{
                    fontFamily: "'Manrope', sans-serif",
                    fontSize: 'clamp(13px, 1.5vw, 16px)',
                    fontWeight: 400, lineHeight: 1.7,
                    color: 'rgba(244, 240, 233, 0.55)',
                    maxWidth: '480px', margin: 0,
                    fontStyle: idx === 0 ? 'italic' : 'normal',
                  }}>
                    {stage.body}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 05 — AI RECOMMENDATION VISUALIZATION
          ══════════════════════════════════════════════════════════ */}
      <section id="intelligence" style={{ padding: 'clamp(80px, 10vh, 120px) 0', background: '#F4F0E9' }}>
        <div className="section-container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: 'clamp(40px, 5vw, 80px)',
            alignItems: 'center',
          }}>

            {/* LEFT — AI panel */}
            <div
              ref={r6}
              className="reveal-left"
              style={{ gridColumn: 'span 6' }}
            >
              <div>
                <div style={{
                  background: '#191A17',
                  borderRadius: '20px',
                  padding: 'clamp(24px, 3vw, 40px)',
                  border: '1px solid rgba(216, 201, 184, 0.12)',
                }}>

                  {/* Header */}
                  <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid rgba(244, 240, 233, 0.08)' }}>
                    <p className="label-upper" style={{ color: '#AAB5A1', margin: '0 0 12px' }}>Your Skin Goal</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <div>
                        <p style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: 'clamp(20px, 2.5vw, 30px)',
                          fontWeight: 400, color: '#F4F0E9',
                          margin: '0 0 6px',
                        }}>
                          Acne + Oil Control
                        </p>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const }}>
                          {['Oily skin', 'Fragrance-free'].map(t => (
                            <span key={t} style={{
                              padding: '4px 10px', borderRadius: '100px',
                              background: 'rgba(170, 181, 161, 0.15)',
                              border: '1px solid rgba(170, 181, 161, 0.2)',
                              fontSize: '11px', color: '#AAB5A1',
                              fontFamily: "'Manrope', sans-serif",
                            }}>{t}</span>
                          ))}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: '48px', fontWeight: 300, color: '#F4F0E9', lineHeight: 1,
                        }}>
                          <ScoreCounter target={91} />
                        </span>
                        <span style={{ color: '#AAB5A1', fontSize: '18px' }}>%</span>
                        <p className="label-upper" style={{ color: '#AAB5A1', margin: '4px 0 0', fontSize: '9px' }}>Routine Match</p>
                      </div>
                    </div>
                  </div>

                  {/* AM */}
                  <div style={{ marginBottom: '20px' }}>
                    <p className="label-upper" style={{ color: '#C98D78', margin: '0 0 12px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C98D78', display: 'inline-block' }} />
                      Morning (AM)
                    </p>
                    {[
                      { name: 'Salicylic Acid 2% Cleanser', brand: 'Minimalist', price: '₹299', match: '94%' },
                      { name: 'Niacinamide 10% + Zinc 1%', brand: 'Minimalist', price: '₹599', match: '96%' },
                      { name: 'Hyaluronic Sunscreen SPF 50', brand: 'The Derma Co', price: '₹449', match: '92%' },
                    ].map(item => (
                      <div key={item.name} className="routine-step" style={{ marginBottom: '8px' }}>
                        <div style={{
                          width: '28px', height: '28px', borderRadius: '8px',
                          background: 'rgba(201, 141, 120, 0.15)', border: '1px solid rgba(201, 141, 120, 0.25)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#C98D78' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#F4F0E9', fontFamily: "'Manrope', sans-serif" }}>{item.name}</p>
                          <p style={{ margin: 0, fontSize: '11px', color: 'rgba(244, 240, 233, 0.45)', fontFamily: "'Manrope', sans-serif" }}>{item.brand} · {item.price}</p>
                        </div>
                        <span style={{ fontSize: '11px', color: '#AAB5A1', fontWeight: 700, fontFamily: "'Manrope', sans-serif" }}>{item.match}</span>
                      </div>
                    ))}
                  </div>

                  {/* PM */}
                  <div style={{ marginBottom: '20px' }}>
                    <p className="label-upper" style={{ color: '#AAB5A1', margin: '0 0 12px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#AAB5A1', display: 'inline-block' }} />
                      Evening (PM)
                    </p>
                    <div className="routine-step">
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '8px',
                        background: 'rgba(170, 181, 161, 0.15)', border: '1px solid rgba(170, 181, 161, 0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#AAB5A1' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#F4F0E9', fontFamily: "'Manrope', sans-serif" }}>Vitamin B5 Oil-Free Gel Moisturizer</p>
                        <p style={{ margin: 0, fontSize: '11px', color: 'rgba(244, 240, 233, 0.45)', fontFamily: "'Manrope', sans-serif" }}>Minimalist · ₹349</p>
                      </div>
                      <span style={{ fontSize: '11px', color: '#AAB5A1', fontWeight: 700, fontFamily: "'Manrope', sans-serif" }}>Safe</span>
                    </div>
                  </div>

                  {/* Budget bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: '11px', color: 'rgba(244, 240, 233, 0.5)' }}>Budget</span>
                      <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: '11px', color: '#AAB5A1', fontWeight: 600 }}>₹1,420 / ₹1,500</span>
                    </div>
                    <div className="budget-bar">
                      <div className="budget-bar-fill" style={{ width: '94.7%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT — Copy */}
            <div
              ref={r7}
              className="reveal-right"
              style={{ gridColumn: 'span 6' }}
            >
              <div>
                <p className="label-upper" style={{ color: '#AAB5A1', marginBottom: '24px' }}>
                  AI Recommendation
                </p>
                <h2 style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 'clamp(40px, 5.5vw, 76px)',
                  fontWeight: 300, lineHeight: 1.05,
                  letterSpacing: '-0.02em', color: '#191A17',
                  margin: '0 0 28px',
                }}>
                  Not just a product.<br /><br />
                  <em>A routine that<br />makes sense.</em>
                </h2>
                <p style={{
                  fontFamily: "'Manrope', sans-serif", fontSize: '16px', lineHeight: 1.7,
                  color: '#6B7C74', marginBottom: '36px', maxWidth: '440px',
                }}>
                  SkinSolve assembles the complete AM/PM routine — not individual products —
                  then checks that the total stays within your budget.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '16px', marginBottom: '36px' }}>
                  {[
                    'Routine-level budget constraint',
                    'AM/PM step sequencing',
                    'Ingredient conflict detection',
                    'Multi-objective match scoring',
                  ].map(item => (
                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '20px', height: '20px', borderRadius: '50%',
                        background: 'rgba(170, 181, 161, 0.2)', border: '1px solid rgba(170, 181, 161, 0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <Check size={10} color="#AAB5A1" />
                      </div>
                      <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: '14px', color: '#24352A' }}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>

                <button onClick={onStartQuiz} className="btn-primary">
                  <span>Build My Routine</span>
                  <ArrowRight size={14} className="btn-arrow" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 06 — EXPLAINABILITY
          ══════════════════════════════════════════════════════════ */}
      <section style={{ padding: 'clamp(80px, 10vh, 120px) 0', background: '#191A17', overflow: 'hidden' }}>
        <div className="section-container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: 'clamp(40px, 5vw, 80px)',
            alignItems: 'center',
          }}>

            {/* LEFT — Image */}
            <div
              ref={r8}
              className="reveal-left"
              style={{ gridColumn: 'span 5' }}
            >
              <div>
                <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden' }}>
                  <img
                    src="/serum-closeup.jpg"
                    alt="Serum product close-up"
                    style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }}
                  />
                </div>
              </div>
            </div>

            {/* RIGHT — Explanation cards */}
            <div
              ref={r9}
              className="reveal-right"
              style={{ gridColumn: 'span 7' }}
            >
              <div>
                <p className="label-upper" style={{ color: '#AAB5A1', marginBottom: '24px' }}>
                  Explainability
                </p>
                <h2 style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 'clamp(36px, 5vw, 64px)',
                  fontWeight: 300, lineHeight: 1.1,
                  letterSpacing: '-0.02em', color: '#F4F0E9',
                  margin: '0 0 40px',
                }}>
                  Every recommendation<br /><em>has a reason.</em>
                </h2>

                {/* WHY THIS */}
                <div style={{
                  marginBottom: '20px', padding: '24px',
                  background: 'rgba(244, 240, 233, 0.05)',
                  border: '1px solid rgba(244, 240, 233, 0.1)',
                  borderRadius: '16px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <p className="label-upper" style={{ color: '#AAB5A1', margin: '0 0 4px', fontSize: '10px' }}>Why this product?</p>
                      <p style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '20px', fontWeight: 400, color: '#F4F0E9', margin: 0,
                      }}>
                        Niacinamide 10% + Zinc 1%
                      </p>
                    </div>
                    <span style={{
                      padding: '6px 14px', borderRadius: '100px',
                      background: 'rgba(170, 181, 161, 0.2)',
                      border: '1px solid rgba(170, 181, 161, 0.3)',
                      fontSize: '13px', fontWeight: 700, color: '#AAB5A1',
                      fontFamily: "'Manrope', sans-serif",
                    }}>
                      92% Match
                    </span>
                  </div>
                  {[
                    'Addresses selected concern (acne, oil control)',
                    'Ideal for oily skin type',
                    'Completely fragrance-free',
                    'Within budget at ₹599',
                    'No conflicts with routine',
                  ].map(reason => (
                    <div key={reason} className="explain-check">
                      <div className="explain-check-icon"><Check size={10} /></div>
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>

                {/* WHY NOT */}
                <div style={{
                  padding: '20px 24px',
                  background: 'rgba(201, 141, 120, 0.06)',
                  border: '1px solid rgba(201, 141, 120, 0.2)',
                  borderRadius: '16px',
                  opacity: 0.7,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                      <p className="label-upper" style={{ color: '#C98D78', margin: '0 0 4px', fontSize: '10px' }}>Why not this?</p>
                      <p style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '18px', fontWeight: 400,
                        color: 'rgba(244, 240, 233, 0.5)',
                        textDecoration: 'line-through',
                        margin: 0,
                      }}>
                        Fragrance Rose Toner
                      </p>
                    </div>
                    <AlertCircle size={18} color="#C98D78" />
                  </div>
                  <p style={{
                    fontFamily: "'Manrope', sans-serif", fontSize: '13px',
                    color: '#C98D78', margin: 0, fontStyle: 'italic',
                  }}>
                    Contains fragrance — violates your stated preference.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 07 — ROUTINE OPTIMIZATION
          ══════════════════════════════════════════════════════════ */}
      <section id="routine" ref={optSectionRef} style={{ padding: 'clamp(80px, 10vh, 120px) 0', background: '#F4F0E9' }}>
        <div className="section-container">

          <div ref={r10} className="reveal" style={{ marginBottom: '64px', textAlign: 'center' }}>
            <p className="label-upper" style={{ color: '#AAB5A1', marginBottom: '20px' }}>Routine Optimization</p>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(52px, 8vw, 110px)',
              fontWeight: 300, lineHeight: 0.95,
              letterSpacing: '-0.03em', color: '#191A17',
              margin: '0 auto',
            }}>
              Less.<br /><em style={{ color: '#24352A' }}>But better.</em>
            </h2>
          </div>

          {/* Product grid animation */}
          <div ref={optRef} className="reveal" style={{ marginBottom: '56px' }}>
            <div style={{
              display: 'flex', justifyContent: 'center',
              gap: '6px', flexWrap: 'wrap' as const,
              maxWidth: '800px', margin: '0 auto',
            }}>
              {allProducts12.map((product, i) => {
                const isInvalid = invalidProducts.includes(i);
                const isFinal = finalProducts.includes(i);
                const show = optPhase === 0 || (optPhase === 1 && !isInvalid) || (optPhase === 2 && isFinal);
                return (
                  <div
                    key={product}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '100px',
                      border: `1px solid ${optPhase === 2 && isFinal ? '#AAB5A1' : 'rgba(216, 201, 184, 0.6)'}`,
                      background: optPhase === 2 && isFinal ? 'rgba(170, 181, 161, 0.12)' : '#FFFFFF',
                      fontSize: '12px', fontFamily: "'Manrope', sans-serif", fontWeight: 500,
                      color: optPhase === 2 && isFinal ? '#24352A' : '#6B7C74',
                      opacity: show ? 1 : 0,
                      transform: show ? 'scale(1)' : 'scale(0.7)',
                      transition: `opacity 0.5s ease ${i * 50}ms, transform 0.5s ease ${i * 50}ms, border-color 0.4s ease, background 0.4s ease`,
                      cursor: 'default',
                    }}
                  >
                    {product}
                  </div>
                );
              })}
            </div>

            {/* Phase indicators */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginTop: '32px', flexWrap: 'wrap' as const }}>
              {[
                { phase: 0, label: '12 candidates', active: optPhase >= 0 },
                { phase: 1, label: '→  8 after filtering', active: optPhase >= 1 },
                { phase: 2, label: '→  4 essential', active: optPhase >= 2 },
              ].map(({ label, active }) => (
                <span key={label} style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: '13px', fontWeight: active ? 700 : 400,
                  color: active ? '#24352A' : '#AAB5A1',
                  transition: 'all 0.4s ease',
                }}>
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Final assembled routine */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            maxWidth: '720px', margin: '0 auto',
            opacity: optPhase >= 2 ? 1 : 0,
            transform: optPhase >= 2 ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.8s ease 0.3s, transform 0.8s ease 0.3s',
          }}>
            {/* AM */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid rgba(216, 201, 184, 0.5)',
              borderRadius: '16px', padding: '24px',
            }}>
              <p className="label-upper" style={{ color: '#C98D78', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C98D78', display: 'inline-block' }} />
                Morning — AM
              </p>
              {['Cleanser', 'Serum', 'SPF 50'].map((step, i) => (
                <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: i < 2 ? '1px solid rgba(216, 201, 184, 0.3)' : 'none' }}>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '13px', color: '#AAB5A1', minWidth: '24px' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: '14px', fontWeight: 500, color: '#24352A' }}>{step}</span>
                </div>
              ))}
            </div>

            {/* PM */}
            <div style={{
              background: '#24352A', borderRadius: '16px', padding: '24px',
            }}>
              <p className="label-upper" style={{ color: '#AAB5A1', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#AAB5A1', display: 'inline-block' }} />
                Evening — PM
              </p>
              {['Cleanser', 'Moisturizer'].map((step, i) => (
                <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: i < 1 ? '1px solid rgba(244, 240, 233, 0.1)' : 'none' }}>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '13px', color: 'rgba(170, 181, 161, 0.5)', minWidth: '24px' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: '14px', fontWeight: 500, color: '#F4F0E9' }}>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Budget summary */}
          <div style={{
            textAlign: 'center', marginTop: '40px',
            opacity: optPhase >= 2 ? 1 : 0,
            transition: 'opacity 0.8s ease 0.5s',
          }}>
            <span style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(32px, 4vw, 52px)',
              fontWeight: 300, color: '#191A17',
            }}>₹1,420</span>
            <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: '14px', color: '#AAB5A1', marginLeft: '12px' }}>
              ₹80 remaining
            </span>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 08 — CONSTRAINTS
          ══════════════════════════════════════════════════════════ */}
      <section ref={constraintSectionRef} style={{ padding: 'clamp(80px, 10vh, 120px) 0', background: '#EDE9E0' }}>
        <div className="section-container">

          <div ref={r11} className="reveal" style={{ marginBottom: '56px' }}>
            <p className="label-upper" style={{ color: '#C98D78', marginBottom: '20px' }}>Constraint Intelligence</p>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(36px, 5vw, 70px)',
              fontWeight: 300, lineHeight: 1.1,
              letterSpacing: '-0.02em', color: '#191A17', margin: 0,
              maxWidth: '700px',
            }}>
              Your preferences aren't filters.<br />
              <em>They're part of the problem.</em>
            </h2>
          </div>

          {/* Constraint tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '10px', marginBottom: '48px' }}>
            {['₹1,500 MAX', 'FRAGRANCE-FREE', 'SENSITIVE SKIN', 'MINIMAL ROUTINE', 'OILY SKIN'].map((tag, i) => (
              <span
                key={tag}
                className="constraint-tag"
                style={{
                  opacity: constraintPhase >= 1 ? 1 : 0,
                  transform: constraintPhase >= 1 ? 'translateY(0)' : 'translateY(12px)',
                  transition: `opacity 0.5s ease ${i * 100}ms, transform 0.5s ease ${i * 100}ms`,
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Products */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
            {constraintProducts.map((product, i) => (
              <div
                key={product.name}
                style={{
                  padding: '16px 20px',
                  borderRadius: '12px',
                  background: product.valid ? '#FFFFFF' : 'rgba(201, 141, 120, 0.06)',
                  border: `1px solid ${product.valid ? 'rgba(216, 201, 184, 0.5)' : 'rgba(201, 141, 120, 0.25)'}`,
                  opacity: constraintPhase >= 1 ? (product.valid ? 1 : 0.35) : 0,
                  transform: constraintPhase >= 1 ? 'scale(1)' : 'scale(0.9)',
                  transition: `opacity 0.6s ease ${i * 80}ms, transform 0.6s ease ${i * 80}ms`,
                  filter: constraintPhase >= 1 && !product.valid ? 'grayscale(0.3)' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <p style={{
                    fontFamily: "'Manrope', sans-serif",
                    fontSize: '13px', fontWeight: 600,
                    color: product.valid ? '#24352A' : '#AAB5A1',
                    margin: 0,
                    textDecoration: !product.valid ? 'line-through' : 'none',
                  }}>
                    {product.name}
                  </p>
                  {product.valid
                    ? <Check size={14} color="#AAB5A1" style={{ flexShrink: 0, marginLeft: '8px' }} />
                    : <AlertCircle size={14} color="#C98D78" style={{ flexShrink: 0, marginLeft: '8px' }} />
                  }
                </div>
                <p style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: '11px',
                  color: product.valid ? '#AAB5A1' : '#C98D78',
                  margin: 0,
                  fontStyle: !product.valid ? 'italic' : 'normal',
                }}>
                  {product.valid ? `${product.brand} · ${product.price}` : product.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 09 — NO PERFECT ANSWER
          ══════════════════════════════════════════════════════════ */}
      <section style={{ padding: 'clamp(80px, 10vh, 120px) 0', background: '#F4F0E9' }}>
        <div className="section-container">
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>

            <div ref={r12} className="reveal">
              <p className="label-upper" style={{ color: '#AAB5A1', marginBottom: '20px' }}>Honest Intelligence</p>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'clamp(40px, 6vw, 84px)',
                fontWeight: 300, lineHeight: 1.05,
                letterSpacing: '-0.02em', color: '#191A17',
                margin: '0 0 48px',
              }}>
                Sometimes,<br />
                there isn't a<br />
                <em>perfect answer.</em>
              </h2>
            </div>

            {/* Budget scenario */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '24px',
              alignItems: 'center', marginBottom: '48px',
              padding: '32px',
              background: '#FFFFFF', borderRadius: '20px',
              border: '1px solid rgba(216, 201, 184, 0.5)',
            }}>
              <div style={{ textAlign: 'center' }}>
                <p className="label-upper" style={{ color: '#C98D78', marginBottom: '8px', fontSize: '10px' }}>Your Budget</p>
                <p style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 300,
                  color: '#C98D78', margin: 0,
                }}>₹500</p>
              </div>

              <div style={{ textAlign: 'center', color: '#D8C9B8' }}>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '32px', margin: 0 }}>→</p>
              </div>

              <div style={{ textAlign: 'center' }}>
                <p className="label-upper" style={{ color: '#AAB5A1', marginBottom: '8px', fontSize: '10px' }}>Minimum Feasible</p>
                <p style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 300,
                  color: '#191A17', margin: 0,
                }}>₹745</p>
              </div>
            </div>

            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(22px, 3vw, 34px)',
              fontStyle: 'italic', fontWeight: 300,
              color: '#6B7C74', marginBottom: '36px', lineHeight: 1.4,
            }}>
              "Instead of pretending, SkinSolve tells you why."
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '12px', justifyContent: 'center' }}>
              {[
                { label: 'Increase budget', icon: '↑' },
                { label: 'Simplify routine', icon: '↓' },
                { label: 'Relax one preference', icon: '≈' },
              ].map(option => (
                <div key={option.label} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '14px 22px',
                  background: '#FFFFFF',
                  border: '1px solid rgba(216, 201, 184, 0.5)',
                  borderRadius: '100px',
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: '13px', fontWeight: 500,
                  color: '#24352A',
                }}>
                  <span style={{ color: '#AAB5A1', fontWeight: 600 }}>{option.icon}</span>
                  <span>{option.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 10 — INDIA
          ══════════════════════════════════════════════════════════ */}
      <section style={{ padding: 'clamp(80px, 10vh, 120px) 0', background: '#24352A' }}>
        <div className="section-container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: 'clamp(40px, 5vw, 80px)',
            alignItems: 'center',
          }}>
            {/* Copy */}
            <div style={{ gridColumn: 'span 6' }}>
              <p className="label-upper" style={{ color: '#AAB5A1', marginBottom: '24px' }}>Built for India</p>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'clamp(38px, 5vw, 68px)',
                fontWeight: 300, lineHeight: 1.1,
                letterSpacing: '-0.02em', color: '#F4F0E9',
                margin: '0 0 28px',
              }}>
                Built for the way<br />
                <em>India shops skincare.</em>
              </h2>
              <p style={{
                fontFamily: "'Manrope', sans-serif", fontSize: '16px', lineHeight: 1.7,
                color: 'rgba(244, 240, 233, 0.6)', marginBottom: '40px',
              }}>
                Budget-first. INR pricing. Local brands. Context that actually matters.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {[
                  { icon: '₹', label: 'INR Pricing', desc: 'Budget in rupees, not guesswork' },
                  { icon: '🇮🇳', label: 'Indian Brands', desc: 'Minimalist, Dot & Key, Foxtale & more' },
                  { icon: '⚡', label: 'Budget-Aware', desc: 'Every routine respects your limit' },
                  { icon: '🌐', label: 'Regional Ready', desc: 'Hindi & Hinglish support coming' },
                ].map(item => (
                  <div key={item.label} style={{
                    padding: '20px',
                    background: 'rgba(244, 240, 233, 0.05)',
                    border: '1px solid rgba(244, 240, 233, 0.08)',
                    borderRadius: '14px',
                  }}>
                    <p style={{ margin: '0 0 6px', fontSize: '20px' }}>{item.icon}</p>
                    <p style={{
                      fontFamily: "'Manrope', sans-serif",
                      fontSize: '13px', fontWeight: 700, color: '#F4F0E9', margin: '0 0 4px',
                    }}>{item.label}</p>
                    <p style={{
                      fontFamily: "'Manrope', sans-serif",
                      fontSize: '12px', color: 'rgba(244, 240, 233, 0.45)', margin: 0,
                    }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Image */}
            <div style={{ gridColumn: 'span 6' }}>
              <div style={{ borderRadius: '20px', overflow: 'hidden' }}>
                <img
                  src="/india-lifestyle.jpg"
                  alt="Indian skincare lifestyle"
                  style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 11 — PRODUCT DISCOVERY
          ══════════════════════════════════════════════════════════ */}
      <section id="explore" style={{ padding: 'clamp(80px, 10vh, 120px) 0', background: '#F4F0E9' }}>
        <div className="section-container">
          <div style={{ marginBottom: '56px' }}>
            <p className="label-upper" style={{ color: '#AAB5A1', marginBottom: '16px' }}>Product Intelligence</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap' as const, gap: '20px' }}>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'clamp(40px, 5.5vw, 72px)',
                fontWeight: 300, lineHeight: 1.05,
                letterSpacing: '-0.02em', color: '#191A17', margin: 0,
              }}>
                500+ products,<br /><em>scored for you.</em>
              </h2>
              <button onClick={() => onNavigate('catalog')} className="btn-forest-outline">
                Explore Catalog <ArrowRight size={13} className="btn-arrow" />
              </button>
            </div>
          </div>

          {/* Asymmetric editorial grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gridTemplateRows: 'auto',
            gap: '12px',
          }}>
            {/* Large card */}
            <div className="product-card" style={{ gridColumn: 'span 7', gridRow: 'span 2', minHeight: '420px' }}>
              <img src="/product-flatlay.jpg" alt="Skincare product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div className="product-card-overlay" />
              <div className="product-card-info">
                <p className="label-upper" style={{ color: 'rgba(244, 240, 233, 0.6)', marginBottom: '4px', fontSize: '10px' }}>Serum</p>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: 400, color: '#F4F0E9', margin: '0 0 8px' }}>Niacinamide 10% + Zinc 1%</p>
                <span style={{
                  padding: '5px 12px', borderRadius: '100px',
                  background: 'rgba(170, 181, 161, 0.25)',
                  border: '1px solid rgba(170, 181, 161, 0.4)',
                  fontSize: '11px', color: '#AAB5A1', fontFamily: "'Manrope', sans-serif", fontWeight: 700,
                }}>96% match</span>
              </div>
            </div>

            {/* Small top right */}
            <div className="product-card" style={{ gridColumn: 'span 5', minHeight: '200px' }}>
              <img src="/serum-closeup.jpg" alt="Serum close-up" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div className="product-card-overlay" />
              <div className="product-card-info">
                <p className="label-upper" style={{ color: 'rgba(244, 240, 233, 0.6)', marginBottom: '4px', fontSize: '10px' }}>Cleanser</p>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', color: '#F4F0E9', margin: '0 0 8px' }}>Salicylic Acid 2%</p>
                <span style={{ padding: '4px 10px', borderRadius: '100px', background: 'rgba(170, 181, 161, 0.25)', border: '1px solid rgba(170, 181, 161, 0.4)', fontSize: '10px', color: '#AAB5A1', fontFamily: "'Manrope', sans-serif", fontWeight: 700 }}>94% match</span>
              </div>
            </div>

            {/* Small bottom right */}
            <div className="product-card" style={{ gridColumn: 'span 5', minHeight: '200px', background: '#24352A' }}>
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' as const, gap: '12px', padding: '24px' }}>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '32px', color: '#F4F0E9', margin: 0, textAlign: 'center' }}>500+<br /><em style={{ fontSize: '18px', color: '#AAB5A1' }}>products indexed</em></p>
                <button onClick={() => onNavigate('catalog')} style={{
                  background: 'none', border: '1px solid rgba(244, 240, 233, 0.25)',
                  color: '#F4F0E9', padding: '8px 18px', borderRadius: '100px',
                  fontFamily: "'Manrope', sans-serif", fontSize: '12px', cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}>
                  Browse all →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 12 — TRUST
          ══════════════════════════════════════════════════════════ */}
      <section style={{ padding: 'clamp(80px, 10vh, 120px) 0', background: '#EDE9E0' }}>
        <div className="section-container">
          <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ width: '40px', height: '1px', background: '#AAB5A1', margin: '0 auto 32px' }} />
            <p className="label-upper" style={{ color: '#AAB5A1', marginBottom: '20px' }}>A Note on Safety</p>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(36px, 5vw, 64px)',
              fontWeight: 300, lineHeight: 1.1,
              letterSpacing: '-0.02em', color: '#191A17',
              margin: '0 0 32px',
            }}>
              Recommendation,<br /><em>not diagnosis.</em>
            </h2>

            <p style={{
              fontFamily: "'Manrope', sans-serif", fontSize: '16px', lineHeight: 1.8,
              color: '#6B7C74', marginBottom: '24px',
            }}>
              SkinSolve provides cosmetic skincare recommendations based on the information you share.
              We do not diagnose medical conditions or replace professional medical advice.
            </p>

            <p style={{
              fontFamily: "'Manrope', sans-serif", fontSize: '15px', lineHeight: 1.7,
              color: '#AAB5A1',
            }}>
              For severe, persistent, or medical skin concerns — please consult a qualified dermatologist.
            </p>

            <div style={{ height: '1px', background: 'rgba(170, 181, 161, 0.3)', margin: '40px auto', maxWidth: '120px' }} />

            <button onClick={() => onNavigate('trust')} className="btn-forest-outline" style={{ margin: '0 auto' }}>
              Read our safety guidelines
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 13 — FINAL CTA
          ══════════════════════════════════════════════════════════ */}
      <section style={{
        position: 'relative', minHeight: '80vh',
        display: 'flex', alignItems: 'center',
        overflow: 'hidden', background: '#191A17',
      }}>
        <img
          src="/india-lifestyle.jpg"
          alt="Ready to solve your skin problem"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center 30%',
            opacity: 0.35,
          }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(25,26,23,0.5), rgba(25,26,23,0.85))',
        }} />

        <div className="section-container" style={{ position: 'relative', zIndex: 10, textAlign: 'center', width: '100%' }}>
          <p className="label-upper" style={{ color: '#AAB5A1', marginBottom: '24px' }}>
            Get Started Today
          </p>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(52px, 8vw, 120px)',
            fontWeight: 300, lineHeight: 0.95,
            letterSpacing: '-0.03em', color: '#F4F0E9',
            margin: '0 0 24px',
          }}>
            Ready to solve<br />
            your skin problem?
          </h2>

          <p style={{
            fontFamily: "'Manrope', sans-serif", fontSize: '16px', lineHeight: 1.7,
            color: 'rgba(244, 240, 233, 0.6)', marginBottom: '48px',
            maxWidth: '480px', margin: '0 auto 48px',
          }}>
            Tell us what you're dealing with.<br />
            We'll help you figure out what actually matters.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '16px', justifyContent: 'center', marginBottom: '32px' }}>
            <button
              onClick={onStartQuiz}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                padding: '18px 40px',
                background: '#F4F0E9', color: '#24352A',
                fontFamily: "'Manrope', sans-serif",
                fontSize: '14px', fontWeight: 700, letterSpacing: '0.04em',
                borderRadius: '100px', border: 'none', cursor: 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: '0 12px 40px rgba(25, 26, 23, 0.4)',
              }}
              onMouseEnter={e => {
                const t = e.currentTarget;
                t.style.background = '#FFFFFF';
                t.style.transform = 'translateY(-2px)';
                const arrow = t.querySelector('.btn-arrow') as HTMLElement;
                if (arrow) arrow.style.transform = 'translateX(4px)';
              }}
              onMouseLeave={e => {
                const t = e.currentTarget;
                t.style.background = '#F4F0E9';
                t.style.transform = 'translateY(0)';
                const arrow = t.querySelector('.btn-arrow') as HTMLElement;
                if (arrow) arrow.style.transform = 'translateX(0)';
              }}
            >
              <span>Solve My Skin Problem</span>
              <ArrowRight size={15} className="btn-arrow" style={{ transition: 'transform 0.25s ease' }} />
            </button>
          </div>

          <p className="label-upper" style={{ color: 'rgba(170, 181, 161, 0.5)', fontSize: '10px' }}>
            Personalized skincare intelligence
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FOOTER
          ══════════════════════════════════════════════════════════ */}
      <footer style={{ background: '#191A17', padding: 'clamp(48px, 7vh, 80px) 0 clamp(32px, 4vh, 48px)' }}>
        <div className="section-container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '40px', marginBottom: '56px',
          }}>
            {/* Brand */}
            <div>
              <p style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '22px', fontWeight: 500,
                letterSpacing: '0.1em', textTransform: 'uppercase' as const,
                color: '#F4F0E9', margin: '0 0 12px',
              }}>
                SkinSolve
              </p>
              <p style={{
                fontFamily: "'Manrope', sans-serif", fontSize: '13px',
                color: 'rgba(244, 240, 233, 0.4)', lineHeight: 1.6, margin: 0,
                maxWidth: '200px',
              }}>
                AI-powered, constraint-aware skincare recommendations.
              </p>
            </div>

            {/* Navigation */}
            <div>
              <p className="label-upper" style={{ color: '#AAB5A1', marginBottom: '20px', fontSize: '10px' }}>Navigate</p>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '12px' }}>
                {[
                  { label: 'How it Works', action: () => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }) },
                  { label: 'Explore Products', action: () => onNavigate('catalog') },
                  { label: 'Saved Routines', action: () => onNavigate('saved') },
                ].map(item => (
                  <button key={item.label} onClick={item.action} style={{
                    background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', padding: 0,
                    fontFamily: "'Manrope', sans-serif", fontSize: '13px', fontWeight: 400,
                    color: 'rgba(244, 240, 233, 0.5)',
                    transition: 'color 0.2s ease',
                  }}
                    onMouseEnter={e => ((e.target as HTMLElement).style.color = '#F4F0E9')}
                    onMouseLeave={e => ((e.target as HTMLElement).style.color = 'rgba(244, 240, 233, 0.5)')}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Legal */}
            <div>
              <p className="label-upper" style={{ color: '#AAB5A1', marginBottom: '20px', fontSize: '10px' }}>Legal</p>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '12px' }}>
                {['Trust & Safety', 'Privacy', 'Contact'].map(label => (
                  <button key={label}
                    onClick={() => label === 'Trust & Safety' ? onNavigate('trust') : undefined}
                    style={{
                      background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', padding: 0,
                      fontFamily: "'Manrope', sans-serif", fontSize: '13px',
                      color: 'rgba(244, 240, 233, 0.5)',
                      transition: 'color 0.2s ease',
                    }}
                    onMouseEnter={e => ((e.target as HTMLElement).style.color = '#F4F0E9')}
                    onMouseLeave={e => ((e.target as HTMLElement).style.color = 'rgba(244, 240, 233, 0.5)')}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div style={{ display: 'flex', flexDirection: 'column' as const, justifyContent: 'flex-end' }}>
              <button
                onClick={onStartQuiz}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '12px 22px',
                  background: 'rgba(244, 240, 233, 0.08)',
                  border: '1px solid rgba(244, 240, 233, 0.15)',
                  color: '#F4F0E9',
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: '12px', fontWeight: 600,
                  borderRadius: '100px', cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  alignSelf: 'flex-start' as const,
                }}
                onMouseEnter={e => {
                  const t = e.currentTarget;
                  t.style.background = 'rgba(244, 240, 233, 0.15)';
                  t.style.borderColor = 'rgba(244, 240, 233, 0.35)';
                }}
                onMouseLeave={e => {
                  const t = e.currentTarget;
                  t.style.background = 'rgba(244, 240, 233, 0.08)';
                  t.style.borderColor = 'rgba(244, 240, 233, 0.15)';
                }}
              >
                <span>Solve My Skin Problem</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{
            paddingTop: '28px',
            borderTop: '1px solid rgba(244, 240, 233, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap' as const, gap: '12px',
          }}>
            <p style={{
              fontFamily: "'Manrope', sans-serif", fontSize: '12px',
              color: 'rgba(244, 240, 233, 0.25)', margin: 0,
            }}>
              © 2025 SkinSolve. All rights reserved.
            </p>
            <p style={{
              fontFamily: "'Manrope', sans-serif", fontSize: '12px',
              color: 'rgba(244, 240, 233, 0.25)', margin: 0,
            }}>
              Premium Indian BeautyTech · AI-Powered
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
};
