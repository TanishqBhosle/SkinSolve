import React, { useState, useEffect } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onStartQuiz: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onStartQuiz }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Only show the sticky navbar for non-landing views
  // The landing page has its own floating nav built into it
  const isLanding = currentView === 'landing';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Landing view: floating nav is rendered by Landing.tsx itself
  if (isLanding) return null;

  const navLinks = [
    { label: 'How it Works', view: 'landing' },
    { label: 'Explore', view: 'catalog' },
    { label: 'Saved Routines', view: 'saved' },
    { label: 'Trust & Safety', view: 'trust' },
  ];

  return (
    <header
      className={`ss-nav ${scrolled ? 'scrolled' : ''}`}
      style={{ position: 'sticky' }}
    >
      {/* Logo */}
      <button
        onClick={() => onNavigate('landing')}
        className="flex items-center gap-3 cursor-pointer group"
        style={{ background: 'none', border: 'none', padding: 0 }}
      >
        <span
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '22px',
            fontWeight: 500,
            letterSpacing: '0.08em',
            color: '#24352A',
            textTransform: 'uppercase',
          }}
        >
          SkinSolve
        </span>
      </button>

      {/* Desktop Nav */}
      <nav className="hidden lg:flex items-center gap-8">
        {navLinks.map(({ label, view }) => (
          <button
            key={view}
            onClick={() => onNavigate(view)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              fontFamily: "'Manrope', sans-serif",
              fontSize: '13px',
              fontWeight: currentView === view ? 700 : 500,
              color: currentView === view ? '#24352A' : '#6B7C74',
              cursor: 'pointer',
              letterSpacing: '0.02em',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={e => ((e.target as HTMLElement).style.color = '#24352A')}
            onMouseLeave={e => ((e.target as HTMLElement).style.color = currentView === view ? '#24352A' : '#6B7C74')}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <button
          onClick={onStartQuiz}
          className="btn-primary hidden sm:inline-flex"
          style={{ padding: '10px 20px', fontSize: '12px' }}
        >
          <span>Solve My Skin Problem</span>
          <ArrowRight size={14} className="btn-arrow" />
        </button>

        {/* Mobile menu toggle */}
        <button
          className="lg:hidden p-2 rounded-lg"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#24352A' }}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          style={{
            position: 'absolute',
            top: '72px',
            left: 0,
            right: 0,
            background: 'rgba(244, 240, 233, 0.98)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(216, 201, 184, 0.4)',
            padding: '16px 24px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          {navLinks.map(({ label, view }) => (
            <button
              key={view}
              onClick={() => { onNavigate(view); setMobileOpen(false); }}
              style={{
                background: 'none',
                border: 'none',
                textAlign: 'left',
                fontFamily: "'Manrope', sans-serif",
                fontSize: '15px',
                fontWeight: 500,
                color: '#24352A',
                cursor: 'pointer',
                padding: '12px 0',
                borderBottom: '1px solid rgba(216, 201, 184, 0.3)',
              }}
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => { onStartQuiz(); setMobileOpen(false); }}
            className="btn-primary mt-4"
            style={{ justifyContent: 'center' }}
          >
            <span>Solve My Skin Problem</span>
            <ArrowRight size={14} className="btn-arrow" />
          </button>
        </div>
      )}
    </header>
  );
};
