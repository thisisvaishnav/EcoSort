import React, { useState } from 'react';
import { Play, BarChart2 } from 'lucide-react';

interface NavbarProps {
  currentView: 'landing' | 'game' | 'report';
  onNavigate: (view: 'landing' | 'game' | 'report') => void;
}

const NAV_LINKS = [
  { id: 'how-it-works', label: 'How it works' },
  { id: 'bins',         label: 'Bins'         },
  { id: 'levels',       label: 'Levels'       },
  { id: 'energy',       label: 'Energy'       },
  { id: 'hero-guide',   label: 'Eco Hero'     },
  { id: 'teachers',     label: 'Teachers'     },
  { id: 'faq',          label: 'FAQ'          },
];

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const isLanding = currentView === 'landing';

  const scrollToSection = (id: string) => {
    setMenuOpen(false);
    if (!isLanding) {
      onNavigate('landing');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 120);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  /* ── Game view: minimal dark top bar so users can exit ── */
  if (currentView === 'game') {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-5 pointer-events-none">
        <nav className="pointer-events-auto bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-full shadow-lg px-6 h-14 flex items-center justify-between gap-6 w-full max-w-5xl text-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-xl bg-emerald-500 border border-emerald-400 shadow-sm">
              🌱
            </div>
            <span className="font-fun font-black text-base text-white tracking-tight">EcoSort Heroes</span>
          </div>
          <button
            onClick={() => onNavigate('landing')}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-full text-xs font-bold border border-slate-700 tactile-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-900"
          >
            Exit to menu
          </button>
        </nav>
      </header>
    );
  }

  /* ── Landing / Report views: floating glass island pill (B7 fluid dynamics) ── */
  return (
    <>
      {/* ── Floating island nav ────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-3 sm:px-4 pt-4 sm:pt-5 pointer-events-none">
        <nav
          className="nav-pill pointer-events-auto bg-[#FDFBF7]/92 backdrop-blur-xl border-2 border-slate-900 rounded-full shadow-retro px-4 sm:px-5 h-14 flex items-center justify-between gap-3 sm:gap-4 w-full max-w-5xl"
          aria-label="Main navigation"
        >
          {/* Brand logo */}
          <button
            onClick={() => { setMenuOpen(false); onNavigate('landing'); }}
            className="flex items-center gap-2 sm:gap-2.5 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 rounded-full shrink-0"
            aria-label="EcoSort Heroes — home"
          >
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-xl bg-amber-300 border-2 border-slate-900 shadow-retro-sm transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-110">
              🌱
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center font-fun text-base font-black tracking-tight leading-none">
                <span className="text-slate-950">ECO</span>
                <span className="text-emerald-600">SORT</span>
                <span className="text-slate-600 ml-1 text-xs font-bold hidden md:inline">HEROES</span>
              </div>
            </div>
          </button>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-0.5 text-xs font-bold uppercase tracking-wider flex-1 justify-center">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="px-3 py-1.5 rounded-full text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 whitespace-nowrap"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => { setMenuOpen(false); onNavigate('report'); }}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full font-bold text-xs uppercase tracking-wider text-slate-900 bg-white border-2 border-slate-900 shadow-retro-sm tactile-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              aria-label="Open teacher report"
            >
              <BarChart2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="hidden md:inline">Teacher</span>
            </button>

            <button
              onClick={() => { setMenuOpen(false); onNavigate('game'); }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-fun font-black text-sm uppercase tracking-wide bg-amber-300 text-slate-950 border-2 border-slate-900 shadow-retro tactile-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950 stroke-slate-950 shrink-0" />
              <span>Play</span>
            </button>

            {/* Hamburger — morphs to X on open (B7: lines must never disappear) */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`lg:hidden relative w-9 h-9 rounded-full border-2 border-slate-900 bg-white flex flex-col items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 shrink-0 ${menuOpen ? 'ham-open' : ''}`}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              <span className="ham-line ham-top" />
              <span className="ham-line ham-mid" />
              <span className="ham-line ham-bot" />
            </button>
          </div>
        </nav>
      </header>

      {/* ── Mobile fullscreen overlay (B7 staggered mask reveal) ────────────── */}
      <div
        className={`fixed inset-0 z-40 lg:hidden mobile-overlay ${
          menuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        style={{
          background: 'rgba(253, 251, 247, 0.97)',
          backdropFilter: 'blur(28px)',
        }}
        aria-hidden={!menuOpen}
      >
        <div className={`flex flex-col items-center justify-center h-full gap-5 ${menuOpen ? 'mobile-menu-open' : ''}`}>
          {NAV_LINKS.map((link, i) => (
            <button
              key={link.id}
              onClick={() => scrollToSection(link.id)}
              tabIndex={menuOpen ? 0 : -1}
              className="mobile-nav-link font-fun font-black text-3xl sm:text-4xl text-slate-950 uppercase tracking-tight hover:text-emerald-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg"
              /* B7 stagger: 50ms per link, starting after 100ms */
              style={menuOpen ? { transitionDelay: `${100 + i * 50}ms` } : { transitionDelay: '0ms' }}
            >
              {link.label}
            </button>
          ))}

          <div
            className="flex flex-col sm:flex-row gap-3 mt-4 mobile-nav-link"
            style={menuOpen ? { transitionDelay: `${100 + NAV_LINKS.length * 50}ms` } : { transitionDelay: '0ms' }}
          >
            <button
              tabIndex={menuOpen ? 0 : -1}
              onClick={() => { setMenuOpen(false); onNavigate('report'); }}
              className="px-7 py-3.5 rounded-2xl border-2 border-slate-900 font-bold text-sm uppercase bg-white text-slate-900 shadow-retro tactile-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              Teacher report
            </button>
            <button
              tabIndex={menuOpen ? 0 : -1}
              onClick={() => { setMenuOpen(false); onNavigate('game'); }}
              className="px-7 py-3.5 rounded-2xl border-2 border-slate-900 font-fun font-black text-sm uppercase bg-amber-300 text-slate-950 shadow-retro tactile-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              ▶ Play now
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
