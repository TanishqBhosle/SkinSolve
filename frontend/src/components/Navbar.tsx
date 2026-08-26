import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Bookmark, BarChart3, BookOpen } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onStartQuiz: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onStartQuiz }) => {
  return (
    <header className="sticky top-0 z-50 glass-nav border-b border-[#E5E0D7] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div 
          onClick={() => onNavigate('landing')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#1B3B2B] text-[#FAF8F5] flex items-center justify-center shadow-md group-hover:bg-[#264E3A] transition-colors">
            <Sparkles className="w-5 h-5 text-[#E89D75]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-[#1C2826] font-serif">SkinSolve</span>
              <span className="text-[10px] font-semibold bg-[#E6EFE9] text-[#1B3B2B] px-2 py-0.5 rounded-full border border-[#93BCA0]/40">
                Indian Skincare AI
              </span>
            </div>
            <span className="block text-[10px] uppercase tracking-widest text-[#4A7C59] font-bold">
              Multi-Objective Intelligence
            </span>
          </div>
        </div>

        <nav className="hidden lg:flex items-center space-x-7 text-sm font-medium text-[#556864]">
          <button 
            onClick={() => onNavigate('landing')}
            className={`hover:text-[#1B3B2B] transition-colors ${currentView === 'landing' ? 'text-[#1B3B2B] font-bold' : ''}`}
          >
            Overview
          </button>
          <button 
            onClick={() => onNavigate('catalog')}
            className={`flex items-center space-x-1.5 hover:text-[#1B3B2B] transition-colors ${currentView === 'catalog' ? 'text-[#1B3B2B] font-bold' : ''}`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Explore Catalog</span>
          </button>
          <button 
            onClick={() => onNavigate('evaluation')}
            className={`flex items-center space-x-1.5 hover:text-[#1B3B2B] transition-colors ${currentView === 'evaluation' ? 'text-[#1B3B2B] font-bold' : ''}`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Benchmarks</span>
          </button>
          <button 
            onClick={() => onNavigate('saved')}
            className={`flex items-center space-x-1.5 hover:text-[#1B3B2B] transition-colors ${currentView === 'saved' ? 'text-[#1B3B2B] font-bold' : ''}`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved Routines</span>
          </button>
          <button 
            onClick={() => onNavigate('trust')}
            className={`flex items-center space-x-1.5 hover:text-[#1B3B2B] transition-colors ${currentView === 'trust' ? 'text-[#1B3B2B] font-bold' : ''}`}
          >
            <ShieldCheck className="w-4 h-4 text-[#4A7C59]" />
            <span>Trust & Safety</span>
          </button>
        </nav>

        <div className="flex items-center space-x-4">
          <button
            onClick={onStartQuiz}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-[#1B3B2B] hover:bg-[#264E3A] text-white text-sm font-medium shadow-md hover:shadow-lg transition-all group"
          >
            <span>Solve My Skin</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform text-[#E89D75]" />
          </button>
        </div>
      </div>
    </header>
  );
};

