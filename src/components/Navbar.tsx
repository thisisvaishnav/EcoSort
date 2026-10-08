import React from 'react';
import { Play, BarChart2 } from 'lucide-react';

interface NavbarProps {
  currentView: 'landing' | 'game' | 'report';
  onNavigate: (view: 'landing' | 'game' | 'report') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/85 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2.5 text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center text-xl shadow-md group-hover:scale-105 transition-transform">
            🌱
          </div>
          <div>
            <span className="font-fun text-xl font-bold text-white block leading-none">
              EcoSort Heroes
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold tracking-wide">
              Power the town
            </span>
          </div>
        </button>

        {/* Links matching PLAN.md Section 1 */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => onNavigate('landing')}
            className={`hover:text-emerald-400 transition-colors ${
              currentView === 'landing' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            How it works
          </button>
          <button
            onClick={() => onNavigate('game')}
            className={`hover:text-emerald-400 transition-colors ${
              currentView === 'game' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            3D Game
          </button>
          <button
            onClick={() => onNavigate('report')}
            className={`hover:text-emerald-400 transition-colors flex items-center gap-1.5 ${
              currentView === 'report' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5 text-blue-400" />
            <span>For Teachers</span>
          </button>
        </nav>

        {/* Primary CTA */}
        <div className="flex items-center gap-2">
          {currentView !== 'game' ? (
            <button
              onClick={() => onNavigate('game')}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-fun font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Play now</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate('report')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-fun font-semibold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <BarChart2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Teacher Report</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
