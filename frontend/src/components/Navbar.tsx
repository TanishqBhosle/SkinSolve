import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onStartQuiz: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onStartQuiz }) => {
  return (
    <header className="sticky top-0 z-50 bg-[#FAF8F5]/80 backdrop-blur-md border-b border-surface-border transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div 
          onClick={() => onNavigate('landing')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-sage-700 text-white flex items-center justify-center shadow-md group-hover:bg-sage-800 transition-colors">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-charcoal-900 font-serif">SkinSolve</span>
            <span className="block text-[10px] uppercase tracking-widest text-sage-600 font-semibold">Intelligence</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-charcoal-600">
          <button 
            onClick={() => onNavigate('landing')}
            className={`hover:text-sage-700 transition-colors ${currentView === 'landing' ? 'text-sage-700 font-semibold' : ''}`}
          >
            Overview
          </button>
          <button 
            onClick={() => onNavigate('catalog')}
            className={`hover:text-sage-700 transition-colors ${currentView === 'catalog' ? 'text-sage-700 font-semibold' : ''}`}
          >
            Scientific Catalog
          </button>
          <button 
            onClick={() => onNavigate('evaluation')}
            className={`hover:text-sage-700 transition-colors ${currentView === 'evaluation' ? 'text-sage-700 font-semibold' : ''}`}
          >
            Benchmarks & Metrics
          </button>
        </nav>

        <div className="flex items-center space-x-4">
          <button
            onClick={onStartQuiz}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-sage-700 hover:bg-sage-800 text-white text-sm font-medium shadow-sm hover:shadow-md transition-all group"
          >
            <span>Build My Routine</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </header>
  );
};
