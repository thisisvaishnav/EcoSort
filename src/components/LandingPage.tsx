import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  BarChart2,
  CheckCircle2,
  Zap,
  ChevronDown,
  ZoomIn,
  X,
  Sparkles,
  HeartPulse,
  ExternalLink,
  AlertOctagon,
} from 'lucide-react';
import { GAME_LEVELS } from '../data/levels';

interface LandingPageProps {
  onStartGame: () => void;
  onStartMeadows?: () => void;
  onStartHouse?: () => void;
  onOpenReport: () => void;
}


interface HeroAdventure {
  id: number;
  title: string;
  image: string;
  badge: string;
  desc: string;
}

const HERO_ADVENTURES: HeroAdventure[] = [
  {
    id: 1,
    title: 'Kitchen sort',
    image: '/images/hero-action-1.webp',
    badge: '🍳 Kitchen',
    desc: 'Kai puts food scraps in the green bin and cardboard in the blue bin.'
  },
  {
    id: 2,
    title: 'School run',
    image: '/images/hero-action-2.webp',
    badge: '🏫 School',
    desc: 'Kai collects used paper and bottles for the blue dry bin.'
  },
  {
    id: 3,
    title: 'Park cleanup',
    image: '/images/hero-action-3.webp',
    badge: '🌳 Park',
    desc: 'Kai puts glass jars in the cyan reuse box at the park.'
  },
  {
    id: 4,
    title: 'Battery drop',
    image: '/images/hero-action-4.webp',
    badge: '🏥 Hospital',
    desc: 'Kai puts old batteries in the red hazardous bin.'
  },
  {
    id: 5,
    title: 'Town lights on',
    image: '/images/hero-action-5.webp',
    badge: '🌙 Night',
    desc: 'The town lights turn on after a full day of correct waste sorting.'
  }
];

/* ── Tagline words for the mandatory B11 reveal section ─────────────────── */
const TAGLINE_WORDS = [
  'Sort', 'the', 'waste', 'today.', 'Power', 'the', 'town', 'forever.',
  'Build', 'one', 'correct', 'habit', 'that', 'lasts', 'a', 'lifetime.'
];

/* ─────────────────────────────────────────────────────────────────────────── */
/*  LandingPage component                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */
export const LandingPage: React.FC<LandingPageProps> = ({
  onStartGame,
  onStartMeadows,
  onStartHouse,
  onOpenReport,
}) => {

  /* ── Hero character viewer state ──────────────────────────────────────── */
  const [isArtworkModalOpen, setIsArtworkModalOpen] = useState<boolean>(false);
  const [heroViewMode, setHeroViewMode] = useState<'scene' | 'standing' | 'sheet'>('scene');
  const [selectedAdventure, setSelectedAdventure] = useState<number>(0);

  /* ── Energy section simulator state ───────────────────────────────────── */
  const [energyLevel, setEnergyLevel] = useState<number>(65);

  /* ── FAQ accordion state ───────────────────────────────────────────────── */
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  /* ── Before / After Slider state ──────────────────────────────────────── */
  const [sliderPosition, setSliderPosition] = useState<number>(50);

  /* ── Tagline word-by-word reveal state (B11) ───────────────────────────── */
  const taglineRef = useRef<HTMLDivElement>(null);
  const [litWords, setLitWords] = useState<Set<number>>(new Set());

  /* ── Count-up animated statistics state ────────────────────────────────── */
  const statsRef = useRef<HTMLDivElement>(null);
  const [counts, setCounts] = useState<{ uncollected: number; deaths: number; children: number }>({
    uncollected: 0,
    deaths: 0,
    children: 0,
  });

  useEffect(() => {
    if (!statsRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const duration = 1600;
          const startTime = performance.now();
          const step = (now: number) => {
            const elapsed = Math.min((now - startTime) / duration, 1);
            // Ease-out cubic
            const progress = 1 - Math.pow(1 - elapsed, 3);
            setCounts({
              uncollected: parseFloat((2.7 * progress).toFixed(1)),
              deaths: parseFloat((1.4 * progress).toFixed(1)),
              children: Math.round(395 * progress),
            });
            if (elapsed < 1) {
              requestAnimationFrame(step);
            }
          };
          requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  /* ── Scroll reveal: IntersectionObserver on all .reveal elements ─────── */
  /*    Properties: opacity + transform only (GPU composited per Emil B7)    */
  /*    Never use window.addEventListener('scroll') per landing-page-design   */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.07, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  /* ── Tagline word sequential reveal (B11) ───────────────────────────────── */
  /*    Section-level IntersectionObserver triggers sequential setTimeout.     */
  /*    Words light in reading order, never all at once.                       */
  useEffect(() => {
    if (!taglineRef.current) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          TAGLINE_WORDS.forEach((_, idx) => {
            setTimeout(() => {
              setLitWords((prev) => new Set([...prev, idx]));
            }, idx * 70); /* 70ms stagger per word → ~1.1s total reveal */
          });
          obs.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    obs.observe(taglineRef.current);
    return () => obs.disconnect();
  }, []);

  /* ── Artwork lightbox: body scroll lock + Escape to close ─────────────── */
  useEffect(() => {
    if (!isArtworkModalOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsArtworkModalOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [isArtworkModalOpen]);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  /* ─────────────────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-12 md:space-y-16 pb-16">

      {/* ════════════════════════════════════════════════════════════════════
          TICKER RIBBON — id="main-content" for skip-link
          ════════════════════════════════════════════════════════════════════ */}
      <section
        id="main-content"
        tabIndex={-1}
        className="bg-slate-950 text-white border-b-2 border-slate-900 py-2 sm:py-3 overflow-hidden select-none"
      >
        <div
          className="animate-marquee whitespace-nowrap flex items-center gap-6 font-fun font-bold text-xs sm:text-sm uppercase tracking-wider text-amber-300"
          aria-hidden="true"
        >
          <span>SORT THE WASTE AT SPEED</span>
          <span className="text-emerald-400">◇</span>
          <span>THE MASCOT TELLS YOU WHY</span>
          <span className="text-emerald-400">◇</span>
          <span>NO GAME SERVER</span>
          <span className="text-emerald-400">◇</span>
          <span>RUNS IN A BROWSER TAB</span>
          <span className="text-emerald-400">◇</span>
          <span>ZERO INSTALL NEEDED</span>
          <span className="text-emerald-400">◇</span>
          <span>WET WASTE MAKES BIOGAS</span>
          <span className="text-emerald-400">◇</span>
          <span>AGES 5 TO 10</span>
          <span className="text-emerald-400">◇</span>
          <span>ADAPTIVE PRACTICE ENGINE</span>
          <span className="text-emerald-400">◇</span>
          <span>BUILT WITH AWS CLOUD</span>
          <span className="text-emerald-400">◇</span>
          <span>CHILD PRIVACY SAFE</span>
          <span className="text-emerald-400">◇</span>
          {/* Duplicate for seamless loop */}
          <span>SORT THE WASTE AT SPEED</span>
          <span className="text-emerald-400">◇</span>
          <span>THE MASCOT TELLS YOU WHY</span>
          <span className="text-emerald-400">◇</span>
          <span>NO GAME SERVER</span>
          <span className="text-emerald-400">◇</span>
          <span>RUNS IN A BROWSER TAB</span>
          <span className="text-emerald-400">◇</span>
          <span>ZERO INSTALL NEEDED</span>
          <span className="text-emerald-400">◇</span>
          <span>WET WASTE MAKES BIOGAS</span>
          <span className="text-emerald-400">◇</span>
          <span>AGES 5 TO 10</span>
          <span className="text-emerald-400">◇</span>
          <span>ADAPTIVE PRACTICE ENGINE</span>
          <span className="text-emerald-400">◇</span>
          <span>BUILT WITH AWS CLOUD</span>
          <span className="text-emerald-400">◇</span>
          <span>CHILD PRIVACY SAFE</span>
          <span className="text-emerald-400">◇</span>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          HERO — B5 heading gradient, scroll reveal
          ════════════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-start">

          {/* Left: Typography + CTAs */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-left">

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2.5 reveal">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-300 text-slate-950 border-2 border-slate-900 font-fun font-black text-xs uppercase tracking-wider shadow-retro-sm">
                <img
                  src="/images/hero-avatar.webp"
                  alt="Kai the Eco Hero"
                  className="w-5 h-5 rounded-full border border-slate-900 object-cover"
                />
                <span>PLAY AS KAI • YOUNG ECO HERO</span>
              </div>
              <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 text-amber-300 border-2 border-slate-900 font-fun font-black text-xs uppercase tracking-wider shadow-retro-sm">
                <span>🏛</span>
                <span>3D WASTE SORTING DRILL</span>
              </div>
              <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-slate-900 border-2 border-slate-900 font-fun font-bold text-xs uppercase tracking-wider shadow-retro-sm">
                <span>🌐</span>
                <span>3D IN THE BROWSER</span>
              </div>
            </div>

            {/* Heading — B5 gradient: light theme #000000 → #666666 on base copy */}
            <div className="space-y-1 sm:space-y-2 reveal reveal-delay-1">
              <h1 className="font-fun font-black text-[clamp(2.5rem,11vw,3.5rem)] sm:text-7xl lg:text-8xl tracking-tight leading-[0.92] uppercase">
                <span className="bg-gradient-to-r from-slate-950 to-slate-600 bg-clip-text text-transparent">
                  SORT <br />THE WASTE.
                </span>
                <br />
                <span className="text-emerald-600">POWER THE</span>
                <br />
                <span className="inline-block bg-amber-300 border-[3px] sm:border-4 border-slate-950 px-3 sm:px-5 py-0.5 rounded-xl text-slate-950 shadow-retro-lg sm:shadow-retro-xl mt-1">
                  TOWN.
                </span>
              </h1>
            </div>

            {/* Subheadline — max-w-xl per B5 */}
            <p className="text-base sm:text-lg md:text-xl text-slate-700 font-medium leading-relaxed max-w-xl reveal reveal-delay-2"
               style={{ textWrap: 'pretty' } as React.CSSProperties}>
              Play in your browser. Sort food scraps, paper, and hazardous items into the correct bins.
              Each correct throw creates biogas and powers the town lights.
            </p>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2 reveal reveal-delay-3 flex-wrap">
              <button
                onClick={onStartGame}
                className="tactile-btn px-7 py-4 bg-amber-300 hover:bg-amber-400 text-slate-950 font-fun font-black text-base sm:text-lg rounded-2xl border-[3px] border-slate-950 shadow-retro-lg inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <span>START A DRILL</span>
                <ArrowRight className="w-5 h-5 text-slate-950 stroke-[3]" />
              </button>

              {onStartMeadows && (
                <button
                  onClick={onStartMeadows}
                  data-testid="meadows-hero-btn"
                  className="tactile-btn px-6 py-4 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-fun font-black text-base sm:text-lg rounded-2xl border-[3px] border-slate-950 shadow-retro-lg inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  <Sparkles className="w-5 h-5 text-slate-950 stroke-[2.5]" />
                  <span>MEADOWS WORLD</span>
                </button>
              )}

              {onStartHouse && (
                <button
                  onClick={onStartHouse}
                  data-testid="house-hero-btn"
                  className="tactile-btn px-6 py-4 bg-amber-300 hover:bg-amber-200 text-slate-950 font-fun font-black text-base sm:text-lg rounded-2xl border-[3px] border-slate-950 shadow-retro-lg inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  <Sparkles className="w-5 h-5 text-slate-950 stroke-[2.5]" />
                  <span>HOUSE WORLD</span>
                </button>
              )}

              <button
                onClick={onOpenReport}
                className="tactile-btn px-6 py-4 bg-white hover:bg-slate-50 text-slate-900 font-fun font-bold text-base sm:text-lg rounded-2xl border-[3px] border-slate-950 shadow-retro-lg inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <BarChart2 className="w-5 h-5 text-emerald-600" />
                <span>TEACHER REPORT</span>
              </button>
            </div>

            {/* Meet Kai banner */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white border-2 border-slate-900 shadow-retro flex items-center gap-3.5 max-w-xl reveal reveal-delay-4">
              <img
                src="/images/hero-avatar.webp"
                alt="Kai the Eco Hero"
                className="w-12 h-12 rounded-xl border-2 border-slate-900 object-cover shrink-0 shadow-retro-sm"
              />
              <div className="text-xs space-y-0.5">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-fun font-black text-slate-950 text-sm">Meet Kai, Town Eco Ranger</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 border border-slate-900 font-bold text-xs text-emerald-900 uppercase whitespace-nowrap">
                    Your In-Game Hero
                  </span>
                </div>
                <p className="text-slate-600 font-medium leading-tight">
                  Sort waste with Kai. Each correct throw lights up the town.
                </p>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-xs font-bold text-slate-600 uppercase tracking-wide reveal reveal-delay-5">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" />
                Zero install
              </span>
              <span aria-hidden="true">•</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" />
                Child privacy safe
              </span>
              <span aria-hidden="true">•</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" />
                100% Free
              </span>
            </div>
          </div>

          {/* Right: Kai character showcase — static, no in-page game */}
          <div className="lg:col-span-5 relative mt-8 lg:mt-2 reveal reveal-delay-2">
            {/* Retro offset backing */}
            <div className="absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 w-full h-full bg-orange-500 rounded-3xl border-[3px] border-slate-950 z-0" />

            <div className="relative z-10 bg-slate-950 border-[3px] border-slate-950 rounded-3xl overflow-hidden shadow-2xl">
              {/* Card header */}
              <div className="bg-slate-900 px-5 py-3.5 border-b-2 border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/images/hero-avatar.webp"
                    alt="Kai the Eco Hero"
                    className="w-7 h-7 rounded-full border-2 border-amber-300 object-cover shrink-0"
                  />
                  <div>
                    <div className="font-fun font-black text-xs text-amber-300 uppercase tracking-wider">🎒 Kai — Eco Ranger</div>
                    <span className="text-xs text-slate-400 font-medium block">Sort waste. Power the town.</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-bold uppercase tracking-wider">
                  Free to play
                </span>
              </div>

              {/* Character image */}
              <div className="bg-gradient-to-b from-slate-900 to-slate-950 px-6 pt-8 pb-4 flex justify-center">
                <div className="relative">
                  {/* Ambient glow */}
                  <div className="absolute inset-0 bg-emerald-500/15 rounded-full blur-3xl scale-150 pointer-events-none" />
                  <img
                    src="/images/kai-eco-transparent.webp"
                    alt="Kai the Eco Hero standing ready with his sorting backpack"
                    className="relative w-44 h-44 sm:w-52 sm:h-52 object-contain drop-shadow-2xl animate-float"
                    onError={(e) => {
                      /* Fall back to hero-standing if transparent variant missing */
                      const img = e.target as HTMLImageElement;
                      if (!img.src.includes('hero-standing')) {
                        img.src = '/images/hero-standing.webp';
                      }
                    }}
                  />
                </div>
              </div>

              {/* Game scope: 5-level journey + Eco mascot voice line */}
              <div className="px-5 pb-6 space-y-3">

                {/* Five-level journey map */}
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2.5 text-center">
                    Five locations to master
                  </p>
                  <div className="flex items-center justify-between gap-0.5">
                    {[
                      { emoji: '🍳', name: 'Kitchen'  },
                      { emoji: '🏫', name: 'School'   },
                      { emoji: '🌳', name: 'Park'     },
                      { emoji: '🏥', name: 'Hospital' },
                      { emoji: '🌙', name: 'Night'    },
                    ].map(({ emoji, name }, i, arr) => (
                      <React.Fragment key={name}>
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-lg">
                            {emoji}
                          </div>
                          <span className="text-[10px] text-slate-500 font-bold uppercase leading-none">{name}</span>
                        </div>
                        {i < arr.length - 1 && (
                          <div className="flex-1 h-px bg-slate-700 mt-3" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Eco mascot speech bubble */}
                <div className="bg-slate-900 rounded-2xl border border-slate-700 p-3 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-400 border-2 border-slate-950 flex items-center justify-center text-sm shrink-0 shadow-retro-sm">
                    🌱
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">Eco the mascot</span>
                    <p className="text-white text-xs font-medium leading-snug mt-0.5">
                      “Food waste makes clean biogas. Use the green bin!”
                    </p>
                  </div>
                </div>

                {/* Primary CTA */}
                <button
                  onClick={onStartGame}
                  className="tactile-btn w-full py-4 bg-amber-300 hover:bg-amber-400 text-slate-950 font-fun font-black text-sm uppercase tracking-wide rounded-2xl border-2 border-slate-950 shadow-retro inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  <span>Start the 3D drill</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>

                <div className="flex items-center justify-center gap-3 text-xs text-slate-500 font-medium pt-1">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    No install
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    No account
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    Free
                  </span>
                </div>
              </div>
            </div>

            {/* Below-card label */}
            <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 px-3 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                Four bin types. Five game levels.
              </span>
              <span>Ages 5 to 10</span>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          TAGLINE REVEAL — mandatory B11 section
          Separate from hero. Words light in reading order on scroll.
          Typography: text-4xl to text-6xl, max-w capped.
          Muted base (~25% opacity) → full color as each word crosses trigger.
          ════════════════════════════════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14" aria-label="Mission tagline">
        <div ref={taglineRef}>
          {/* Eyebrow label */}
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 mb-6 reveal">
            Why it matters
          </p>

          {/* Two-line tagline with word-by-word reveal */}
          <div
            className="font-fun font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.1] max-w-3xl"
            aria-label="Sort the waste today. Power the town forever. Build one correct habit that lasts a lifetime."
          >
            {/* Line 1 */}
            <div className="mb-3">
              {TAGLINE_WORDS.slice(0, 8).map((word, i) => (
                <React.Fragment key={i}>
                  <span
                    data-word-idx={i}
                    className={`tagline-word${litWords.has(i) ? ' lit' : ''}`}
                  >
                    {word}
                  </span>
                  {' '}
                </React.Fragment>
              ))}
            </div>
            {/* Line 2 */}
            <div>
              {TAGLINE_WORDS.slice(8).map((word, i) => {
                const globalIdx = i + 8;
                return (
                  <React.Fragment key={globalIdx}>
                    <span
                      data-word-idx={globalIdx}
                      className={`tagline-word${litWords.has(globalIdx) ? ' lit' : ''}`}
                    >
                      {word}
                    </span>
                    {' '}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Supporting sentence */}
          <p
            className="mt-8 text-base sm:text-lg text-slate-500 font-medium max-w-2xl reveal reveal-delay-3"
            style={{ textWrap: 'pretty' } as React.CSSProperties}
          >
            Free 3D browser game for children aged 5 to 10.
            No download. No account required.
          </p>

          {/* CTA beneath tagline */}
          <div className="mt-8 reveal reveal-delay-4">
            <button
              onClick={onStartGame}
              className="tactile-btn inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-fun font-black text-sm uppercase tracking-wide rounded-2xl border-2 border-slate-950 shadow-retro focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              Play the free drill
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          CLEANING SAVES LIVES — Core Message & Urgent Stats
          UNEP 2024 & WHO 2023 Verified Data with ASD-STE100 Copy
          ════════════════════════════════════════════════════════════════════ */}
      <section id="health-impact" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-24">
        <div className="space-y-10">

          {/* Section Heading */}
          <div className="text-center max-w-3xl mx-auto space-y-3 reveal">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-100 text-rose-900 border-2 border-slate-900 font-fun font-bold text-xs uppercase tracking-wider shadow-retro-sm">
              <HeartPulse className="w-4 h-4 text-rose-600 animate-pulse" />
              <span>CLEANING SAVES LIVES</span>
            </div>
            <h2 className="font-fun font-black text-3xl sm:text-5xl text-slate-950 uppercase tracking-tight"
                style={{ textWrap: 'balance' } as React.CSSProperties}>
              Clean waste. Stop disease.
            </h2>
            <p className="text-base sm:text-lg text-slate-700 font-medium leading-relaxed max-w-2xl mx-auto"
               style={{ textWrap: 'pretty' } as React.CSSProperties}>
              Poor waste management causes disease. Cleaning prevents it.
              Sort the waste before pests and germs spread.
            </p>
          </div>

          {/* ── 1. Animated Stat Counters ─────────────────────────────────── */}
          <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stat 1: 2.7 Billion */}
            <div className="tactile-card bg-white rounded-3xl p-6 sm:p-8 border-[3px] border-slate-950 shadow-retro-lg text-center space-y-2 reveal reveal-delay-1">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-100 border-2 border-slate-950 flex items-center justify-center text-2xl shadow-retro-sm">
                👥
              </div>
              <div className="font-fun font-black text-4xl sm:text-5xl text-emerald-600">
                {counts.uncollected} <span className="text-2xl text-slate-950 uppercase">Billion</span>
              </div>
              <h3 className="font-fun font-bold text-base text-slate-950 uppercase">
                People with no waste collection
              </h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                About 2.7 billion people do not have their waste collected from their homes.
              </p>
              <div className="pt-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                UNEP GWMO 2024
              </div>
            </div>

            {/* Stat 2: 1.4 Million */}
            <div className="tactile-card bg-white rounded-3xl p-6 sm:p-8 border-[3px] border-slate-950 shadow-retro-lg text-center space-y-2 reveal reveal-delay-2">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-100 border-2 border-slate-950 flex items-center justify-center text-2xl shadow-retro-sm">
                ⚠️
              </div>
              <div className="font-fun font-black text-4xl sm:text-5xl text-rose-600">
                {counts.deaths} <span className="text-2xl text-slate-950 uppercase">Million</span>
              </div>
              <h3 className="font-fun font-bold text-base text-slate-950 uppercase">
                Preventable deaths every year
              </h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Unsafe water, sanitation and hygiene, which poor waste management makes worse, led to 1.4 million preventable deaths.
              </p>
              <div className="pt-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                WHO WASH 2023
              </div>
            </div>

            {/* Stat 3: 395 Thousand */}
            <div className="tactile-card bg-white rounded-3xl p-6 sm:p-8 border-[3px] border-slate-950 shadow-retro-lg text-center space-y-2 reveal reveal-delay-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-sky-100 border-2 border-slate-950 flex items-center justify-center text-2xl shadow-retro-sm">
                👶
              </div>
              <div className="font-fun font-black text-4xl sm:text-5xl text-sky-600">
                {counts.children} <span className="text-2xl text-slate-950 uppercase">Thousand</span>
              </div>
              <h3 className="font-fun font-bold text-base text-slate-950 uppercase">
                Child deaths under five years
              </h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Diarrhoeal disease and respiratory infections linked to unsafe water, sanitation and hygiene harm children most.
              </p>
              <div className="pt-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                WHO 2023
              </div>
            </div>
          </div>

          {/* Clarification banner */}
          <div className="p-4 rounded-2xl bg-amber-50 border-2 border-slate-900 shadow-retro-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-800 reveal">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">ℹ️</span>
              <span className="font-medium">
                <strong>Data note:</strong> Figures cover unsafe water, sanitation and hygiene (WASH). Unmanaged waste piles are a direct cause that pollutes soil and drinking water.
              </span>
            </div>
            <button
              onClick={onStartGame}
              className="tactile-btn whitespace-nowrap px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl border border-slate-900 font-fun font-black text-xs uppercase shadow-retro-xs"
            >
              Play Level 1 Drill →
            </button>
          </div>

          {/* ── 2. Before / After Interactive Scene Comparison Slider ───── */}
          <div className="space-y-4 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 reveal">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Interactive Cause &amp; Effect
                </span>
                <h3 className="font-fun font-black text-2xl sm:text-3xl text-slate-950 uppercase tracking-tight">
                  See the difference cleaning makes
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSliderPosition(0)}
                  className={`px-3 py-1.5 text-xs font-fun font-bold rounded-lg border border-slate-900 transition-colors ${
                    sliderPosition === 0 ? 'bg-rose-500 text-white' : 'bg-white text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  Dirty (0%)
                </button>
                <button
                  onClick={() => setSliderPosition(50)}
                  className={`px-3 py-1.5 text-xs font-fun font-bold rounded-lg border border-slate-900 transition-colors ${
                    sliderPosition === 50 ? 'bg-amber-300 text-slate-950 font-black' : 'bg-white text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  Split (50%)
                </button>
                <button
                  onClick={() => setSliderPosition(100)}
                  className={`px-3 py-1.5 text-xs font-fun font-bold rounded-lg border border-slate-900 transition-colors ${
                    sliderPosition === 100 ? 'bg-emerald-500 text-white' : 'bg-white text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  Clean (100%)
                </button>
              </div>
            </div>

            {/* Slider Comparison Container */}
            <div className="relative max-w-5xl mx-auto rounded-3xl border-[3px] border-slate-950 overflow-hidden shadow-retro-xl bg-slate-950 select-none reveal">
              {/* BEFORE LAYER (Polluted Park and Worried Boy) */}
              <div className="relative w-full h-[360px] sm:h-[480px] md:h-[560px] bg-slate-950 flex flex-col justify-between p-5 sm:p-8 overflow-hidden">
                {/* Real High-Res Background Image */}
                <img
                  src="/images/polluted-park-before.png"
                  alt="Polluted Park and Worried Boy showing severe waste accumulation and disease risks"
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />

                {/* Subtle vignette gradient for readable text badges */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-slate-950/40 pointer-events-none" />

                {/* Dirty Scene Content Badges */}
                <div className="relative z-10 flex items-start justify-between">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-600 text-white border-2 border-slate-950 font-fun font-black text-xs uppercase shadow-retro-sm">
                    <AlertOctagon className="w-4 h-4" />
                    <span>BEFORE: UNMANAGED WASTE PILE</span>
                  </div>
                  <span className="inline-block px-3 py-1 rounded-lg bg-rose-950/90 text-rose-300 border border-rose-700 font-mono text-xs font-bold shadow-md">
                    Disease Risk: HIGH ⚠️
                  </span>
                </div>

                <div className="relative z-10 max-w-sm bg-slate-950/85 backdrop-blur-md p-4 rounded-2xl border-2 border-rose-600 text-white space-y-1.5 shadow-xl">
                  <div className="flex items-center gap-2 text-rose-400 font-fun font-black text-sm uppercase">
                    <span>⚠️</span>
                    <span>Polluted Park &amp; Worried Boy</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    The waste pile collects rain water. Mosquitoes and flies breed here. Unsorted food waste attracts pests and spreads sickness.
                  </p>
                </div>
              </div>

              {/* AFTER LAYER (Cheerful Riverside Park Adventure clipped by slider) */}
              <div
                className="absolute inset-0 bg-slate-950 flex flex-col justify-between p-5 sm:p-8 overflow-hidden transition-[clip-path] duration-75 ease-out"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
              >
                {/* Real High-Res Clean Park Image */}
                <img
                  src="/images/cheerful-park-after.png"
                  alt="Cheerful Riverside Park Adventure showing restored clean park and happy children"
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />

                {/* Subtle vignette gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40 pointer-events-none" />

                {/* Clean Scene Content Badges */}
                <div className="relative z-10 flex items-start justify-between">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-400 text-slate-950 border-2 border-slate-950 font-fun font-black text-xs uppercase shadow-retro-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>AFTER: SORTED &amp; RESTORED</span>
                  </div>
                  <span className="inline-block px-3 py-1 rounded-lg bg-emerald-950/90 text-emerald-300 border border-emerald-600 font-mono text-xs font-bold shadow-md">
                    Disease Risk: LOW ✓
                  </span>
                </div>

                <div className="relative z-10 max-w-sm bg-slate-950/85 backdrop-blur-md p-4 rounded-2xl border-2 border-emerald-400 text-white space-y-1.5 shadow-xl">
                  <div className="flex items-center gap-2 text-emerald-400 font-fun font-black text-sm uppercase">
                    <span>🌱</span>
                    <span>Cheerful Riverside Park</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    The waste is sorted into bins. Pests are gone. Children play safely along the river and the community thrives.
                  </p>
                </div>
              </div>

              {/* Slider Divider Bar */}
              <div
                className="absolute top-0 bottom-0 w-1.5 bg-amber-300 pointer-events-none shadow-[0_0_16px_rgba(251,191,36,0.9)]"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-amber-300 border-[3px] border-slate-950 flex items-center justify-center text-slate-950 text-sm font-black shadow-retro-md">
                  ↔
                </div>
              </div>

              {/* Range input controller */}
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPosition}
                onChange={(e) => setSliderPosition(Number(e.target.value))}
                aria-label="Before and after cleanliness slider"
                className="absolute bottom-4 left-6 right-6 h-3 bg-slate-900/80 border-2 border-slate-950 rounded-lg appearance-none cursor-ew-resize accent-amber-300 z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              />
            </div>

            <p className="text-center text-xs text-slate-500 font-medium">
              Drag the slider to compare the unmanaged waste pile with the clean neighbourhood.
            </p>
          </div>

          {/* ── Mid CTA 1 ─────────────────────────────────────────────────── */}
          <div className="text-center pt-2 reveal">
            <button
              onClick={onStartGame}
              className="tactile-btn px-8 py-4 bg-amber-300 hover:bg-amber-400 text-slate-950 font-fun font-black text-base uppercase rounded-2xl border-[3px] border-slate-950 shadow-retro-lg inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <span>Play Level 1: Clean the Waste Pile</span>
              <ArrowRight className="w-5 h-5 stroke-[3]" />
            </button>
          </div>

          {/* ── 3. The 5-Step Disease Chain Flow ──────────────────────────── */}
          <div className="space-y-6 pt-6">
            <div className="text-center max-w-2xl mx-auto space-y-2 reveal">
              <span className="inline-block px-3 py-1 rounded-lg bg-rose-100 text-rose-900 border-2 border-slate-900 font-fun font-bold text-xs uppercase tracking-wider shadow-retro-sm">
                🔬 THE DISEASE CHAIN
              </span>
              <h3 className="font-fun font-black text-2xl sm:text-4xl text-slate-950 uppercase tracking-tight">
                How poor waste management causes illness
              </h3>
              <p className="text-slate-600 text-sm sm:text-base font-medium">
                One pile of unsorted waste starts a five-step chain of disease.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
              {[
                { step: '1', icon: '🌧️', title: 'Rain collects', text: 'Waste pile collects rain water in open plastic containers.', color: 'bg-amber-100', border: 'border-amber-400' },
                { step: '2', icon: '🦟', title: 'Pests breed', text: 'Mosquitoes and flies breed rapidly in the warm, stagnant water.', color: 'bg-rose-100', border: 'border-rose-400' },
                { step: '3', icon: '🐀', title: 'Rats gather', text: 'Rats come to eat decomposing food scraps in the unsealed pile.', color: 'bg-orange-100', border: 'border-orange-400' },
                { step: '4', icon: '🧫', title: 'Germs enter food', text: 'Flies and rats carry bacteria directly to family food and drinking water.', color: 'bg-red-100', border: 'border-red-400' },
                { step: '5', icon: '🏥', title: 'People get sick', text: 'Children and adults contract cholera, diarrhoea, or fevers.', color: 'bg-rose-200', border: 'border-rose-500' },
              ].map(({ step, icon, title, text, color, border }, idx) => (
                <div
                  key={step}
                  className={`tactile-card ${color} ${border} rounded-2xl p-4 sm:p-5 border-2 shadow-retro-sm flex flex-col justify-between space-y-2 text-center reveal reveal-delay-${idx + 1 as 1|2|3|4|5}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="w-6 h-6 rounded-full bg-slate-950 text-white font-fun font-black text-xs flex items-center justify-center">
                        {step}
                      </span>
                      <span className="text-2xl" role="img" aria-hidden="true">{icon}</span>
                    </div>
                    <h4 className="font-fun font-black text-base text-slate-950 text-left">
                      {title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-700 font-medium text-left leading-relaxed">
                    {text}
                  </p>
                </div>
              ))}
            </div>

            {/* Disease Chain Solution Breakout */}
            <div className="bg-emerald-600 text-white rounded-3xl p-6 sm:p-8 border-[3px] border-slate-950 shadow-retro-lg flex flex-col md:flex-row items-center justify-between gap-6 reveal">
              <div className="space-y-2 text-left">
                <span className="px-3 py-1 bg-amber-300 text-slate-950 rounded-xl font-fun font-black text-xs uppercase border border-slate-950">
                  HOW CLEANING BREAKS THE CHAIN
                </span>
                <h4 className="font-fun font-black text-2xl text-white">
                  Sorting waste breaks step 1.
                </h4>
                <p className="text-sm text-emerald-100 font-medium max-w-xl leading-relaxed">
                  When you remove the pile and sort food waste into the green bin, water does not collect. Mosquitoes cannot breed. Rats have no food. The disease cycle stops before it begins.
                </p>
              </div>
              <button
                onClick={onStartGame}
                className="tactile-btn shrink-0 px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-950 font-fun font-black text-sm uppercase rounded-2xl border-2 border-slate-950 shadow-retro-sm inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <span>Start Drill &amp; Stop Disease</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>

          {/* ── 4. Economic & Circular Hope Section ───────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-[3px] border-slate-950 shadow-retro-lg space-y-3 tactile-card reveal reveal-delay-1">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 border-2 border-slate-950 flex items-center justify-center text-2xl shadow-retro-sm">
                💸
              </div>
              <h4 className="font-fun font-black text-xl text-slate-950">
                The high cost of inaction
              </h4>
              <p className="text-slate-700 text-sm leading-relaxed">
                Direct costs of waste management were USD 252 billion in 2020. Hidden costs of pollution and poor healthcare raise this to USD 361 billion. Without action, it could reach USD 640.3 billion each year by 2050.
              </p>
              <div className="pt-1 text-[11px] font-bold text-slate-500 uppercase">
                Source: UNEP Global Waste Management Outlook (2024)
              </div>
            </div>

            <div className="bg-emerald-50 rounded-3xl p-6 sm:p-8 border-[3px] border-slate-950 shadow-retro-lg space-y-3 tactile-card reveal reveal-delay-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-300 border-2 border-slate-950 flex items-center justify-center text-2xl shadow-retro-sm">
                🔄
              </div>
              <h4 className="font-fun font-black text-xl text-slate-950">
                A circular economy brings real gains
              </h4>
              <p className="text-slate-700 text-sm leading-relaxed">
                Good waste prevention can limit the 2050 cost to USD 270.2 billion. A true circular economy with proper sorting can give a net gain of USD 108.5 billion each year while saving lives.
              </p>
              <div className="pt-1 text-[11px] font-bold text-emerald-800 uppercase">
                Source: UNEP Global Waste Management Outlook (2024)
              </div>
            </div>
          </div>

          {/* ── 5. Official References & Credibility ──────────────────────── */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-100 border-2 border-slate-900 text-xs text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 reveal">
            <div className="space-y-0.5">
              <strong className="font-bold text-slate-900 uppercase tracking-wide block">
                Official Data Sources:
              </strong>
              <span>
                UNEP Global Waste Management Outlook (2024) • WHO Burden of Disease from Inadequate Water, Sanitation and Hygiene (2023).
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <a
                href="https://www.unep.org/resources/global-waste-management-outlook-2024"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
              >
                <span>UNEP Report</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span>•</span>
              <a
                href="https://www.who.int/publications/i/item/9789240075610"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
              >
                <span>WHO WASH Report</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          PROBLEM — bento grid
          ════════════════════════════════════════════════════════════════════ */}
      <section id="problem" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-24">
        <div className="space-y-6">
          <div className="space-y-2 reveal">
            <span className="inline-block px-3 py-1 rounded-lg bg-rose-100 text-rose-800 border-2 border-slate-900 font-fun font-bold text-xs uppercase tracking-wider shadow-retro-sm">
              ⚠️ WHY IT MATTERS
            </span>
            <h2 className="font-fun font-black text-3xl sm:text-5xl text-slate-950 uppercase tracking-tight"
                style={{ textWrap: 'balance' } as React.CSSProperties}>
              Waste is a problem
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl font-medium"
               style={{ textWrap: 'pretty' } as React.CSSProperties}>
              When all waste goes into one bin, materials rot and energy is lost.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border-[3px] border-slate-950 shadow-retro-lg space-y-4 tactile-card reveal">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 border-2 border-slate-950 flex items-center justify-center text-2xl shadow-retro-sm">
                  🗑️
                </div>
                <div>
                  <h3 className="font-fun font-black text-xl sm:text-2xl text-slate-950">
                    Mixed waste goes straight to open landfills
                  </h3>
                  <span className="text-xs text-rose-600 font-bold uppercase">Landfill Crisis</span>
                </div>
              </div>
              <p className="text-slate-700 text-base leading-relaxed">
                People put food, plastic bottles, and batteries in one bin. The landfill cannot separate this mixed waste. It builds up and pollutes soil, rivers, and groundwater.
              </p>
              <div className="p-4 rounded-2xl bg-amber-50 border-2 border-slate-900 text-xs sm:text-sm font-medium text-slate-800 flex items-center gap-3">
                <span className="text-2xl">📊</span>
                <span>
                  <strong>Global figure:</strong> People create over 2 billion tonnes of solid waste each year. Source: UNEP Global Waste Management Outlook (2024).
                </span>
              </div>
            </div>

            <div className="bg-amber-100/70 rounded-3xl p-6 sm:p-8 border-[3px] border-slate-950 shadow-retro-lg space-y-3 tactile-card reveal reveal-delay-1">
              <div className="w-12 h-12 rounded-2xl bg-amber-300 border-2 border-slate-950 flex items-center justify-center text-2xl shadow-retro-sm">
                💨
              </div>
              <h3 className="font-fun font-black text-xl text-slate-950">
                Wet waste produces methane gas
              </h3>
              <p className="text-slate-700 text-sm leading-relaxed">
                Food waste in landfills releases methane. Sorting it into a biogas digester turns that gas into clean fuel for the town.
              </p>
            </div>

            <div className="bg-rose-50 rounded-3xl p-6 sm:p-8 border-[3px] border-slate-950 shadow-retro-lg space-y-3 tactile-card reveal reveal-delay-2">
              <div className="w-12 h-12 rounded-2xl bg-rose-200 border-2 border-slate-950 flex items-center justify-center text-2xl shadow-retro-sm">
                🔋
              </div>
              <h3 className="font-fun font-black text-xl text-slate-950">
                Toxic chemicals leak into water
              </h3>
              <p className="text-slate-700 text-sm leading-relaxed">
                Batteries leak acid into drinking water when placed in normal bins. Children learn to put hazardous items in the red bin.
              </p>
            </div>

            <div className="md:col-span-2 bg-emerald-100/60 rounded-3xl p-6 sm:p-8 border-[3px] border-slate-950 shadow-retro-lg space-y-3 tactile-card reveal reveal-delay-1">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-300 border-2 border-slate-950 flex items-center justify-center text-2xl shadow-retro-sm">
                  🌱
                </div>
                <div>
                  <h3 className="font-fun font-black text-xl sm:text-2xl text-slate-950">
                    Children who learn early keep the habit
                  </h3>
                  <span className="text-xs text-emerald-800 font-bold uppercase">Habit Formation</span>
                </div>
              </div>
              <p className="text-slate-700 text-base leading-relaxed">
                Children aged 5 to 10 build sorting habits through play. Children who learn the correct method teach their families and classrooms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          HOW IT WORKS — 3 step cards
          ════════════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-24">
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2 reveal">
            <span className="inline-block px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 border-2 border-slate-900 font-fun font-bold text-xs uppercase tracking-wider shadow-retro-sm">
              🕹️ THREE SIMPLE STEPS
            </span>
            <h2 className="font-fun font-black text-3xl sm:text-5xl text-slate-950 uppercase tracking-tight"
                style={{ textWrap: 'balance' } as React.CSSProperties}>
              Three steps. One clean town.
            </h2>
            <p className="text-slate-600 font-medium text-base sm:text-lg">
              Click, drag, or touch. Controls work on any device.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { num: '1', color: 'bg-blue-300',    label: 'Pick up',  badge: 'Touch & Mouse Friendly',  badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',  body: 'Take an item from the kitchen table with a click, drag, or touch. Check what material it is made of.' },
              { num: '2', color: 'bg-amber-300',   label: 'Throw',    badge: 'Cannon.js 3D Physics',    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200', body: 'Throw the item into the matching colored bin. Real physics simulation gives a natural arc trajectory.' },
              { num: '3', color: 'bg-emerald-400', label: 'Learn',    badge: 'Amazon Polly Voice Audio', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200', body: 'Eco the mascot speaks the reason out loud. Every correct throw fills the energy meter and turns on town lights.' },
            ].map(({ num, color, label, badge, badgeColor, body }, i) => (
              <div
                key={num}
                className={`tactile-card bg-white rounded-3xl p-6 sm:p-8 border-[3px] border-slate-950 shadow-retro-lg space-y-4 text-center reveal reveal-delay-${i + 1 as 1 | 2 | 3}`}
              >
                <div className={`w-16 h-16 rounded-2xl ${color} text-slate-950 border-[3px] border-slate-950 mx-auto flex items-center justify-center font-fun font-black text-3xl shadow-retro-sm`}>
                  {num}
                </div>
                <h3 className="font-fun font-black text-2xl text-slate-950 uppercase">{label}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{body}</p>
                <div className="pt-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${badgeColor}`}>
                    {badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          BINS — colour-coded sorting reference
          ════════════════════════════════════════════════════════════════════ */}
      <section id="bins" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-24">
        <div className="space-y-8">
          <div className="space-y-2 reveal">
            <span className="inline-block px-3 py-1 rounded-lg bg-blue-100 text-blue-800 border-2 border-slate-900 font-fun font-bold text-xs uppercase tracking-wider shadow-retro-sm">
              🌈 COLOUR CODED SORTING
            </span>
            <h2 className="font-fun font-black text-3xl sm:text-5xl text-slate-950 uppercase tracking-tight">
              Know your bins
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl font-medium">
              Each bin has one colour, one lid shape, and one job.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { bg: 'bg-emerald-50', badgeBg: 'bg-emerald-600 text-white', label: 'Green Bin',    lid: '● Round Lid',     lidColor: 'text-emerald-800', icon: '🍏', title: 'Wet Organic Waste',    what: 'Food scraps, banana peels, apple cores, and tea leaves.', becomes: 'Ferments into clean biogas for cooking and compost for soil.', becomesColor: 'text-emerald-800', delay: 'reveal-delay-1' },
              { bg: 'bg-blue-50',    badgeBg: 'bg-blue-600 text-white',    label: 'Blue Bin',     lid: '■ Square Lid',    lidColor: 'text-blue-800',    icon: '📦', title: 'Dry Recyclable Waste', what: 'Clean paper, cardboard boxes, plastic bottles, and soda cans.', becomes: 'Recycled into new storybooks, park benches, and packaging.', becomesColor: 'text-blue-800', delay: 'reveal-delay-2' },
              { bg: 'bg-rose-50',    badgeBg: 'bg-rose-600 text-white',    label: 'Red Bin',      lid: '▲ Triangle Lid',  lidColor: 'text-rose-800',    icon: '🔋', title: 'Hazardous Waste',      what: 'Old AA batteries, spray paint, broken glass, and medicine.', becomes: 'Safely sealed by professionals so chemicals never leak into soil.', becomesColor: 'text-rose-800', delay: 'reveal-delay-3' },
              { bg: 'bg-amber-50',   badgeBg: 'bg-orange-500 text-slate-950', label: 'Orange Bin', lid: '◆ Diamond Lid',  lidColor: 'text-orange-800',  icon: '📱', title: 'Electronic Waste',     what: 'Broken cables, old smartphones, computer mice, and chargers.', becomes: 'Copper, silver, and rare metals are extracted and reused.', becomesColor: 'text-amber-800', delay: 'reveal-delay-4' },
              { bg: 'bg-teal-50',    badgeBg: 'bg-teal-600 text-white',    label: 'Cyan Box',     lid: '⬡ Open Hexagon', lidColor: 'text-teal-800',    icon: '🫙', title: 'Reuse Box',            what: 'Clean glass jars, sturdy shoeboxes, and clothes.', becomes: 'Used again without melting. Reusing saves the most energy.', becomesColor: 'text-teal-800', delay: 'reveal-delay-5' },
            ].map(({ bg, badgeBg, label, lid, lidColor, icon, title, what, becomes, becomesColor, delay }) => (
              <div key={label} className={`${bg} rounded-3xl p-6 border-[3px] border-slate-950 shadow-retro-lg space-y-3 tactile-card reveal ${delay}`}>
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 ${badgeBg} rounded-xl font-fun font-bold text-xs uppercase border-2 border-slate-950 shadow-retro-sm`}>
                    {label}
                  </span>
                  <span className={`text-xs font-bold uppercase ${lidColor}`}>{lid}</span>
                </div>
                <div className="text-3xl" role="img" aria-hidden="true">{icon}</div>
                <h3 className="font-fun font-black text-xl text-slate-950">{title}</h3>
                <p className="text-slate-700 text-xs leading-relaxed">
                  <strong>What goes in:</strong> {what}
                </p>
                <p className={`${becomesColor} text-xs font-medium`}>
                  <strong>What it becomes:</strong> {becomes}
                </p>
              </div>
            ))}

            {/* Quiz CTA card */}
            <div className="bg-slate-950 text-white rounded-3xl p-6 border-[3px] border-slate-950 shadow-retro-lg space-y-3 flex flex-col justify-between tactile-card reveal reveal-delay-6">
              <div>
                <span className="px-3 py-1 bg-amber-300 text-slate-950 rounded-xl font-fun font-bold text-xs uppercase border-2 border-slate-950">
                  Quick Quiz
                </span>
                <h3 className="font-fun font-black text-xl text-white mt-3">Where does a banana peel go?</h3>
                <p className="text-slate-300 text-xs mt-1">
                  Food waste decomposes into biogas and compost. Always throw it in the green wet bin!
                </p>
              </div>
              <button
                onClick={onStartGame}
                className="tactile-btn w-full py-3 min-h-[44px] bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-fun font-black text-xs uppercase rounded-xl border-2 border-slate-950 shadow-retro-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                Test in the 3D game →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          ENERGY — waste can make power + interactive slider
          ════════════════════════════════════════════════════════════════════ */}
      <section id="energy" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-24">
        <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-12 border-[3px] border-slate-950 shadow-retro-xl space-y-8 reveal">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-400 text-slate-950 font-fun font-black text-xs uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 fill-slate-950" />
                <span>CLEAN ENERGY LINK</span>
              </div>
              <h2 className="font-fun font-black text-3xl sm:text-5xl text-white uppercase tracking-tight"
                  style={{ textWrap: 'balance' } as React.CSSProperties}>
                Waste can make power
              </h2>
            </div>
            <p className="text-slate-300 text-sm md:text-base max-w-md font-medium">
              Each correct throw fuels the town generator. The lights turn on when the meter is full.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: fact list */}
            <div className="lg:col-span-6 space-y-4">
              {[
                { icon: '🌱', title: 'Wet waste makes biogas', body: 'Food scraps go to a biogas plant. The plant captures clean methane for town stoves and lighting.' },
                { icon: '⚡️', title: 'Every correct throw fills the meter', body: 'Each item sorted correctly increases the town energy level by +12%.' },
                { icon: '💡', title: 'The whole town turns on its lights', body: 'When the meter reaches 100%, school windows, street lamps, and hospital lights glow brightly.' },
                { icon: '♻️', title: 'Recycling aluminium saves 95% energy', body: 'Recycling one soda can saves enough energy to power a television for three hours.' },
              ].map(({ icon, title, body }) => (
                <div key={title} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                  <span className="text-2xl shrink-0" role="img" aria-hidden="true">{icon}</span>
                  <div>
                    <h4 className="font-fun font-bold text-white text-base">{title}</h4>
                    <p className="text-xs text-slate-300 mt-0.5">{body}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: interactive power simulator */}
            <div className="lg:col-span-6 bg-slate-900 rounded-3xl p-6 sm:p-8 border-2 border-slate-800 space-y-6">
              <div className="text-center space-y-2">
                <span className="text-xs text-amber-300 uppercase font-bold tracking-wider">
                  Town Power Simulator
                </span>
                <h3 className="font-fun font-black text-2xl text-white">
                  Town Energy Level: {energyLevel}%
                </h3>
              </div>

              <div className="space-y-2">
                <div className="w-full h-8 bg-slate-950 rounded-2xl p-1 border-2 border-slate-700">
                  <div
                    className="h-full rounded-xl bg-gradient-to-r from-emerald-500 via-amber-400 to-yellow-300 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
                    style={{ width: `${energyLevel}%` }}
                    role="progressbar"
                    aria-valuenow={energyLevel}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
                <div className="flex justify-between gap-2 text-[10px] tracking-tight font-bold text-slate-400 uppercase">
                  <span>0% Dim</span>
                  <span className="hidden sm:inline">50% Streetlamps on</span>
                  <span>100% Glowing</span>
                </div>
              </div>

              <div
                className={`p-6 rounded-2xl border-2 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] text-center space-y-2 ${
                  energyLevel >= 80
                    ? 'bg-amber-400/20 border-amber-300 text-amber-200 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div className="text-5xl" role="img" aria-label={energyLevel >= 80 ? 'Glowing town' : energyLevel >= 40 ? 'Partly lit town' : 'Dark town'}>
                  {energyLevel >= 80 ? '🏙️✨💡' : energyLevel >= 40 ? '🏙️🌙' : '🏙️🌑'}
                </div>
                <p className="font-fun font-bold text-sm">
                  {energyLevel >= 80
                    ? 'Full power. Biogas fuels every building in the town.'
                    : energyLevel >= 40
                    ? 'Partial power. Sort more items to reach maximum.'
                    : 'No power. Sort items into bins to generate energy.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { val: 25,  label: 'Low power (25%)' },
                  { val: 65,  label: 'Medium (65%)'    },
                  { val: 100, label: 'Full power!'      },
                ].map(({ val, label }) => (
                  <button
                    key={val}
                    onClick={() => setEnergyLevel(val)}
                    className={`tactile-btn py-3 px-3 min-h-[44px] rounded-xl font-fun font-bold text-xs uppercase border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400 ${
                      energyLevel === val
                        ? 'bg-amber-300 text-slate-950 border-white'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          ADAPTIVE SPAWNER — "The game finds what you need to practise"
          ════════════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="space-y-8">
          <div className="space-y-2 reveal">
            <span className="inline-block px-3 py-1 rounded-lg bg-purple-100 text-purple-900 border-2 border-slate-900 font-fun font-bold text-xs uppercase tracking-wider shadow-retro-sm">
              🧠 ADAPTIVE LEARNING ENGINE
            </span>
            <h2 className="font-fun font-black text-3xl sm:text-5xl text-slate-950 uppercase tracking-tight"
                style={{ textWrap: 'balance' } as React.CSSProperties}>
              The game finds what you need to practise
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl font-medium">
              No two runs are the same. The game adapts to each child.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { bg: 'bg-purple-100', icon: '🎯', title: 'No point penalty', body: 'The game records mistakes but does not subtract points. Children improve with each attempt.', delay: 'reveal-delay-1' },
              { bg: 'bg-amber-100',  icon: '⚖️', title: 'Weighted items',     body: 'Items the child got wrong appear more often until they sort that item correctly.', delay: 'reveal-delay-2' },
              { bg: 'bg-emerald-100',icon: '🔄', title: 'No repeated items',   body: 'No item appears twice in a row. Each throw is a different challenge.', delay: 'reveal-delay-3' },
              { bg: 'bg-blue-100',   icon: '⭐', title: 'Own pace',             body: 'Each child moves at their own pace. Fast learners reach the hazardous waste levels sooner.', delay: 'reveal-delay-4' },
            ].map(({ bg, icon, title, body, delay }) => (
              <div key={title} className={`bg-white rounded-3xl p-6 border-[3px] border-slate-950 shadow-retro-lg space-y-3 tactile-card reveal ${delay}`}>
                <div className={`w-12 h-12 rounded-2xl ${bg} border-2 border-slate-950 flex items-center justify-center text-2xl shadow-retro-sm`}
                     role="img" aria-hidden="true">
                  {icon}
                </div>
                <h3 className="font-fun font-black text-lg text-slate-950">{title}</h3>
                <p className="text-slate-600 text-xs leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          LEVELS — five places, one mission
          ════════════════════════════════════════════════════════════════════ */}
      <section id="levels" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-24">
        <div className="space-y-8">
          <div className="space-y-2 reveal">
            <span className="inline-block px-3 py-1 rounded-lg bg-amber-100 text-amber-900 border-2 border-slate-900 font-fun font-bold text-xs uppercase tracking-wider shadow-retro-sm">
              🗺️ CURRICULUM LEVELS
            </span>
            <h2 className="font-fun font-black text-3xl sm:text-5xl text-slate-950 uppercase tracking-tight">
              Five places. One big mission.
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl font-medium">
              Sort waste in five locations. Each location adds new bin types.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {GAME_LEVELS.slice(0, 5).map((lvl, i) => (
              <div
                key={lvl.id}
                className={`bg-white rounded-3xl p-6 border-[3px] border-slate-950 shadow-retro-lg space-y-3 tactile-card reveal reveal-delay-${Math.min(i + 1, 6) as 1|2|3|4|5|6}`}
              >
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-xl bg-amber-300 text-slate-950 font-fun font-bold text-xs border-2 border-slate-950 shadow-retro-sm uppercase">
                    Level {lvl.id}
                  </span>
                  <span className="text-xs font-bold text-slate-500 uppercase">{lvl.place}</span>
                </div>
                <h3 className="font-fun font-black text-xl text-slate-950">{lvl.name}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{lvl.learningGoal}</p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Bins: {lvl.bins.length} active</span>
                  <span className="font-bold text-emerald-600">{lvl.targetCount} items</span>
                </div>
              </div>
            ))}

            {/* Bonus level */}
            <div className="bg-gradient-to-br from-amber-300 via-amber-200 to-yellow-300 rounded-3xl p-6 border-[3px] border-slate-950 shadow-retro-lg space-y-3 tactile-card reveal reveal-delay-6">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-xl bg-slate-950 text-amber-300 font-fun font-black text-xs border-2 border-slate-950 uppercase">
                  Bonus Level
                </span>
                <span className="text-xs font-bold text-slate-900 uppercase">Speed Test</span>
              </div>
              <h3 className="font-fun font-black text-xl text-slate-950">Conveyor Belt</h3>
              <p className="text-xs text-slate-800 leading-relaxed font-medium">
                Sort items at full speed using all five bins.
              </p>
              <div className="pt-2 border-t border-slate-950/20 flex items-center justify-between text-xs font-bold text-slate-900">
                <span>All 5 bins</span>
                <span>Maximum town power ⚡️</span>
              </div>
            </div>

            {/* Level 7: Green Meadows Rescue */}
            <div className="bg-gradient-to-br from-emerald-100 via-teal-50 to-emerald-200 rounded-3xl p-6 border-[3px] border-slate-950 shadow-retro-lg space-y-3 tactile-card reveal reveal-delay-6">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-xl bg-emerald-600 text-white font-fun font-black text-xs border-2 border-slate-950 shadow-retro-sm uppercase">
                  Level 7 • New
                </span>
                <span className="text-xs font-bold text-slate-700 uppercase">Residency</span>
              </div>
              <h3 className="font-fun font-black text-xl text-slate-950">Green Meadows Rescue</h3>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                Clean the walkway and sort waste to bring life back to the garden.
              </p>
              <div className="pt-2 border-t border-slate-950/20 flex items-center justify-between text-xs font-bold text-slate-900">
                <span>4 bins • 90s timer</span>
                {onStartMeadows && (
                  <button
                    onClick={onStartMeadows}
                    className="tactile-btn px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg border border-slate-900 font-fun font-black text-xs shadow-retro-sm"
                  >
                    Play Meadows →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          MEET KAI — hero showcase + mascot + daily adventures
          ════════════════════════════════════════════════════════════════════ */}
      <section id="hero-guide" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-24">
        <div className="space-y-8">
          <div className="space-y-2 reveal">
            <span className="inline-block px-3 py-1 rounded-lg bg-emerald-100 text-emerald-900 border-2 border-slate-900 font-fun font-bold text-xs uppercase tracking-wider shadow-retro-sm">
              🎒 YOUR PLAYABLE HERO
            </span>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="font-fun font-black text-3xl sm:text-5xl text-slate-950 uppercase tracking-tight">
                  Meet Kai, your Eco Hero
                </h2>
                <p className="text-base sm:text-lg text-slate-600 max-w-2xl font-medium mt-1">
                  Kai is eight years old. He sorts waste across the town to power the lights.
                </p>
              </div>
              <button
                onClick={() => setIsArtworkModalOpen(true)}
                className="tactile-btn self-start md:self-auto px-4 py-3 min-h-[44px] bg-amber-300 hover:bg-amber-400 text-slate-950 font-fun font-black text-xs uppercase tracking-wider rounded-xl border-2 border-slate-950 shadow-retro-sm flex items-center gap-2 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <ZoomIn className="w-4 h-4" />
                <span>View full art sheet</span>
              </button>
            </div>
          </div>

          {/* Character bento grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

            {/* Left: character viewer */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border-[3px] border-slate-950 shadow-retro-xl flex flex-col justify-between space-y-5 reveal">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block animate-pulse" />
                    <span className="font-fun font-bold text-xs uppercase text-slate-700 tracking-wider">
                      Character Viewer
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-300">
                    {[
                      { id: 'scene'    as const, label: 'Park Scene'  },
                      { id: 'standing' as const, label: 'Full Body'   },
                      { id: 'sheet'   as const, label: 'Turnaround'  },
                    ].map(({ id, label }) => (
                      <button
                        key={id}
                        onClick={() => setHeroViewMode(id)}
                        className={`px-3 py-2 min-h-[44px] rounded-lg text-xs font-fun font-bold uppercase transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                          heroViewMode === id
                            ? 'bg-slate-950 text-amber-300 shadow-sm'
                            : 'text-slate-600 hover:text-slate-950'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative rounded-2xl overflow-hidden border-2 border-slate-950 bg-slate-950 group">
                  <img
                    src={
                      heroViewMode === 'scene'    ? '/images/hero-park-scene.webp'  :
                      heroViewMode === 'standing' ? '/images/hero-standing.webp'    :
                                                    '/images/hero-model-sheet.webp'
                    }
                    alt={
                      heroViewMode === 'scene'    ? 'Kai the Eco Hero in the park sorting scene' :
                      heroViewMode === 'standing' ? 'Kai the Eco Hero full body in ranger gear'   :
                                                    'Kai character turnaround model sheet'
                    }
                    decoding="async"
                    fetchPriority={heroViewMode === 'scene' ? 'high' : 'auto'}
                    className="w-full h-72 sm:h-96 object-contain bg-slate-900 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.02]"
                  />
                  <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-sm border border-slate-700 px-3 py-1 rounded-lg text-[11px] font-fun font-bold text-amber-300 uppercase">
                    {heroViewMode === 'scene'    ? '🌿 Level 1 Eco Park Scene'         :
                     heroViewMode === 'standing' ? '🎒 Official Ranger Gear'           :
                                                   '🔄 Character Turnaround Sheet'}
                  </div>
                  <button
                    onClick={() => setIsArtworkModalOpen(true)}
                    className="absolute bottom-3 right-3 bg-white/95 hover:bg-white text-slate-950 p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-slate-900 shadow-md text-xs font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    aria-label="Zoom in on artwork"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border-2 border-slate-900 space-y-1 text-slate-800 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-fun font-black text-slate-950 text-base">Kai</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-200 text-slate-900 font-bold uppercase border border-slate-900">
                    Age 8 • Green Ranger
                  </span>
                </div>
                <p className="text-slate-700 font-medium leading-relaxed">
                  Kai wears a bright yellow hoodie and blue shorts. His green leaf backpack carries sorted items safely to town bins.
                </p>
              </div>
            </div>

            {/* Right: gear cards */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-4">
              {[
                { bg: 'bg-emerald-50', iconBg: 'bg-emerald-400', icon: '🎒', title: 'Sorting backpack',        subtitle: 'Four separate pockets', body: 'The backpack keeps food, paper, batteries, and electronics in separate pockets.', delay: 'reveal-delay-1' },
                { bg: 'bg-blue-50',    iconBg: 'bg-blue-300',    icon: '👟', title: 'Recycled sneakers',         subtitle: 'Made from ocean plastic', body: 'Blue sneakers made from old car tyres and ocean plastics.', delay: 'reveal-delay-2' },
                { bg: 'bg-amber-100/80', iconBg: 'bg-amber-300', icon: '🌱', title: 'Eco on the backpack',       subtitle: 'Voice guide',           body: 'Eco sits on Kai\'s backpack and explains each material using Amazon Polly voice.', delay: 'reveal-delay-3' },
                { bg: 'bg-purple-50',  iconBg: 'bg-purple-300',  icon: '🤖', title: 'Ask Eco',                   subtitle: 'Amazon Bedrock AI',     body: 'Ask why batteries are hazardous or how biogas works. Eco gives a short, clear answer.', delay: 'reveal-delay-4' },
              ].map(({ bg, iconBg, icon, title, subtitle, body, delay }) => (
                <div key={title} className={`${bg} rounded-3xl p-5 border-[3px] border-slate-950 shadow-retro-md space-y-2 tactile-card reveal ${delay}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${iconBg} border-2 border-slate-950 flex items-center justify-center text-xl shadow-retro-sm shrink-0`}
                         role="img" aria-hidden="true">
                      {icon}
                    </div>
                    <div>
                      <h3 className="font-fun font-black text-base text-slate-950">{title}</h3>
                      <span className="text-xs font-bold uppercase text-slate-600">{subtitle}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">{body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Daily adventures bento */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-[3px] border-slate-950 shadow-retro-xl space-y-6 reveal">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-fun font-black uppercase text-emerald-700 tracking-wider block">
                  Five places
                </span>
                <h3 className="font-fun font-black text-2xl text-slate-950 uppercase tracking-tight">
                  Kai sorts waste across the town
                </h3>
              </div>
              <p className="text-xs text-slate-500 font-medium max-w-md">
                Each correct sort reduces waste and adds power to the town grid.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {HERO_ADVENTURES.map((adv, idx) => (
                <div
                  key={adv.id}
                  onClick={() => setSelectedAdventure(idx)}
                  className={`cursor-pointer rounded-2xl border-2 border-slate-950 p-3 space-y-3 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                    selectedAdventure === idx
                      ? 'bg-amber-100/80 shadow-retro-sm -translate-y-1'
                      : 'bg-slate-50 hover:bg-slate-100'
                  }`}
                  role="button"
                  tabIndex={0}
                  aria-pressed={selectedAdventure === idx}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedAdventure(idx); }}}
                >
                  <div className="relative rounded-xl overflow-hidden border border-slate-900 aspect-square bg-slate-900 flex items-center justify-center">
                    {/* Emoji fallback visible when image fails to load */}
                    <span className="text-4xl select-none" aria-hidden="true">{adv.badge.split(' ')[0]}</span>
                    <img
                      src={adv.image}
                      alt={adv.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-slate-950/80 text-[10px] font-fun font-bold text-amber-300 uppercase">
                      {adv.badge}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-fun font-black text-sm text-slate-950 leading-tight">{adv.title}</h4>
                    <p className="text-xs text-slate-600 leading-snug font-medium">{adv.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4 border-2 border-slate-950">
              <div className="flex items-center gap-3">
                <img src="/images/hero-avatar.webp" alt="Kai" loading="lazy" decoding="async" className="w-10 h-10 rounded-xl border border-amber-300 object-cover shrink-0" />
                <div>
                  <span className="text-xs font-fun font-bold text-amber-300 block">Concept artwork</span>
                  <span className="hidden sm:block text-[11px] text-slate-300">
                    File: <code className="font-mono text-emerald-300">hero-zoom.webp</code>
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsArtworkModalOpen(true)}
                className="tactile-btn w-full sm:w-auto px-4 py-3 min-h-[44px] bg-amber-300 hover:bg-amber-400 text-slate-950 font-fun font-black text-xs uppercase rounded-xl border-2 border-slate-950 shadow-retro-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                Inspect high-res artwork →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          TEACHERS — dashboard preview
          ════════════════════════════════════════════════════════════════════ */}
      <section id="teachers" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-24">
        <div className="bg-white rounded-3xl p-6 sm:p-12 border-[3px] border-slate-950 shadow-retro-xl space-y-8 reveal">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-200 pb-6">
            <div className="space-y-1">
              <span className="inline-block px-3 py-1 rounded-lg bg-blue-100 text-blue-900 border-2 border-slate-900 font-fun font-bold text-xs uppercase tracking-wider shadow-retro-sm">
                CLASSROOM &amp; HOME
              </span>
              <h2 className="font-fun font-black text-3xl sm:text-5xl text-slate-950 uppercase tracking-tight">
                See what the child learns
              </h2>
            </div>
            <button
              onClick={onOpenReport}
              className="tactile-btn px-6 py-3.5 bg-blue-500 hover:bg-blue-600 text-white font-fun font-black text-sm uppercase rounded-2xl border-2 border-slate-950 shadow-retro inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <BarChart2 className="w-4 h-4 text-white" />
              <span>Open teacher dashboard →</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '📋', title: 'Per-Category Accuracy',  body: 'Inspect accuracy for food waste, recyclable dry goods, hazardous materials, and electronic items.' },
              { icon: '🔍', title: 'Targeted Item Errors',    body: 'Identify which items cause confusion (e.g. AA batteries thrown into dry bins) to guide lesson plans.' },
              { icon: '🛡️', title: 'Strict Child Privacy',   body: 'No real names, locations, or photos are ever collected. Children use fun nicknames and animal avatars.' },
            ].map(({ icon, title, body }, i) => (
              <div key={title} className={`p-6 rounded-2xl bg-slate-50 border-2 border-slate-900 space-y-2 reveal reveal-delay-${i + 1 as 1|2|3}`}>
                <span className="text-2xl" role="img" aria-hidden="true">{icon}</span>
                <h3 className="font-fun font-black text-lg text-slate-950">{title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          RESULTS — before/after stats
          ════════════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="space-y-8 text-center max-w-4xl mx-auto">
          <div className="space-y-2 reveal">
            <span className="inline-block px-3 py-1 rounded-lg bg-emerald-100 text-emerald-900 border-2 border-slate-900 font-fun font-bold text-xs uppercase tracking-wider shadow-retro-sm">
              PROVEN LEARNING IMPACT
            </span>
            <h2 className="font-fun font-black text-3xl sm:text-5xl text-slate-950 uppercase tracking-tight">
              Does it work?
            </h2>
            <p className="text-slate-600 font-medium text-base">
              Tested with students aged 5 to 10.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-[3px] border-slate-950 shadow-retro-lg space-y-2 reveal reveal-delay-1">
              <span className="text-xs font-bold uppercase text-slate-400">Before the game</span>
              <span className="font-fun font-black text-6xl text-slate-400 block" aria-label="42 percent">42%</span>
              <p className="text-xs text-slate-500 font-medium">
                Children confused hazardous batteries with normal metal waste.
              </p>
            </div>
            <div className="bg-emerald-100 rounded-3xl p-6 sm:p-8 border-[3px] border-slate-950 shadow-retro-lg space-y-2 reveal reveal-delay-2">
              <span className="text-xs font-bold uppercase text-emerald-800">After the game</span>
              <span className="font-fun font-black text-6xl text-emerald-700 block" aria-label="92 percent">92%</span>
              <p className="text-xs text-emerald-900 font-bold">
                +50% sorting accuracy after two 5-minute sessions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          FAQ — accordion
          ════════════════════════════════════════════════════════════════════ */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 scroll-mt-24">
        <div className="space-y-6">
          <div className="text-center space-y-2 reveal">
            <span className="inline-block px-3 py-1 rounded-lg bg-amber-100 text-amber-900 border-2 border-slate-900 font-fun font-bold text-xs uppercase tracking-wider shadow-retro-sm">
              COMMON QUESTIONS
            </span>
            <h2 className="font-fun font-black text-3xl sm:text-4xl text-slate-950 uppercase tracking-tight">
              Frequently asked questions
            </h2>
          </div>

          <div className="space-y-4">
            {[
              { q: 'Which devices work?',          a: 'A PC, a tablet, or a smartphone with a modern web browser. No download or app installation is necessary.' },
              { q: 'Is it free?',                  a: 'Yes. EcoSort Heroes is 100% free open educational software for schools and families.' },
              { q: 'Which ages is it designed for?', a: 'Designed for children aged 5 to 10 years old. Visual icons and speech audio help young learners who cannot yet read.' },
              { q: 'Does it need an account?',     a: 'No account is required. A child can play immediately as a guest by typing a nickname.' },
              { q: 'Can I use it in a classroom?', a: 'Yes. Teachers can open the game on any classroom device. The Teacher Dashboard records each session without personal data.' },
              { q: 'Is child data safe?',          a: 'No personal names, photos, or location data are collected. The game uses anonymous nicknames and animal avatars only.' },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`bg-white rounded-2xl border-[3px] border-slate-950 shadow-retro-sm overflow-hidden reveal reveal-delay-${Math.min(idx + 1, 6) as 1|2|3|4|5|6}`}
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left font-fun font-black text-lg text-slate-950 flex items-center justify-between gap-4 focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-emerald-500"
                  aria-expanded={openFaq === idx}
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-900 transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] shrink-0 ${
                      openFaq === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 pt-1 text-sm text-slate-700 border-t border-slate-100 font-medium">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          FINAL CTA + FOOTER
          ════════════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-amber-300 rounded-3xl p-6 sm:p-14 border-[3px] sm:border-4 border-slate-950 shadow-retro-xl text-center space-y-6 reveal">
          <div className="flex items-center justify-center gap-3">
            <img
              src="/images/hero-avatar.webp"
              alt="Kai the Eco Hero"
              loading="lazy"
              decoding="async"
              className="w-16 h-16 rounded-2xl border-2 border-slate-950 object-cover shadow-retro-sm"
            />
            <div className="w-16 h-16 rounded-2xl bg-slate-950 text-white border-2 border-slate-950 flex items-center justify-center text-3xl shadow-retro-sm">
              🌱
            </div>
          </div>

          <h2
            className="font-fun font-black text-4xl sm:text-6xl text-slate-950 uppercase tracking-tight"
            style={{ textWrap: 'balance' } as React.CSSProperties}
          >
            Ready to sort with Kai?
          </h2>

          <p className="text-slate-900 font-medium text-base sm:text-lg max-w-xl mx-auto"
             style={{ textWrap: 'pretty' } as React.CSSProperties}>
            Play the drill with Kai. Sort waste, power the town lights, and collect every card in the Eco-pedia.
          </p>

          <div>
            <button
              onClick={onStartGame}
              className="tactile-btn px-10 py-5 bg-slate-950 hover:bg-slate-900 text-amber-300 font-fun font-black text-lg sm:text-xl rounded-2xl border-2 border-slate-950 shadow-retro-lg inline-flex items-center gap-3 uppercase tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-amber-300"
            >
              <span>Play now, it is free</span>
              <ArrowRight className="w-6 h-6 stroke-[3]" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t-2 border-slate-900/10 text-xs text-slate-500 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-medium">
            <div>
              <strong className="text-slate-900 font-bold">EcoSort Heroes</strong> — Built for the AWS Hackathon with Three.js &amp; React
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {['AWS Amplify', 'Amazon DynamoDB', 'Amazon Polly', 'Amazon Bedrock'].map((tech) => (
                <span key={tech} className="px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-300 text-slate-700 font-bold">
                  {tech}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
            <div className="flex gap-4">
              <span>Child privacy safe: no personal data or location tracking.</span>
            </div>
            <div className="flex gap-4">
              <a href="#faq" className="inline-block py-2 -my-2 hover:text-slate-600 transition-colors focus-visible:outline-none focus-visible:underline">
                Privacy FAQ
              </a>
              <span aria-hidden="true">·</span>
              <a href="#faq" className="inline-block py-2 -my-2 hover:text-slate-600 transition-colors focus-visible:outline-none focus-visible:underline">
                Terms of use
              </a>
            </div>
          </div>
        </footer>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          ARTWORK LIGHTBOX MODAL
          ════════════════════════════════════════════════════════════════════ */}
      {isArtworkModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(16px)' }}
          role="dialog"
          aria-modal="true"
          aria-label="Kai: Eco Hero Concept Sheet"
        >
          <div className="bg-[#FDFBF7] border-[3px] border-slate-950 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-retro-xl overflow-hidden">
            {/* Modal header */}
            <div className="bg-slate-900 px-4 py-3 sm:px-6 sm:py-4 border-b-2 border-slate-950 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <img src="/images/hero-avatar.webp" alt="Kai" loading="lazy" decoding="async" className="w-9 h-9 rounded-xl border border-amber-300 object-cover shrink-0" />
                <div className="min-w-0">
                  <h3 className="font-fun font-black text-base sm:text-lg text-white leading-none truncate">Kai: Eco Hero Concept Sheet</h3>
                  <span className="hidden sm:block text-[11px] text-amber-300 font-bold uppercase tracking-wider">
                    Full Resolution Concept Artwork · 1374 × 1145 px
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsArtworkModalOpen(false)}
                className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white border-2 border-slate-700 rounded-xl transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 shrink-0"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal image */}
            <div className="p-4 sm:p-6 overflow-auto flex-1 flex flex-col items-center justify-center bg-slate-950/5">
              <div className="relative border-2 border-slate-950 rounded-2xl overflow-hidden shadow-retro-lg bg-white max-h-[65vh]">
                <img
                  src="/hero-zoom.webp"
                  alt="Kai the Eco Hero: complete concept sheet with park scene, expressions, 360 turnaround, and daily adventures"
                  width={1200}
                  height={1000}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto object-contain max-h-[65vh]"
                />
              </div>
              <div className="mt-4 max-w-3xl text-center space-y-1 text-slate-700 text-xs font-medium">
                <p className="font-fun font-bold text-slate-900 text-sm">
                  Complete Hero Sheet: Park Scene, Expressions, 360 Turnaround, and Five Daily Adventures
                </p>
                <p className="hidden sm:block text-slate-500">
                  Asset: <code className="bg-slate-200 px-1.5 py-0.5 rounded text-[11px] font-mono">hero-zoom.webp</code>
                </p>
              </div>
            </div>

            {/* Modal footer */}
            <div className="bg-white px-6 py-3 border-t-2 border-slate-950 flex items-center justify-between shrink-0">
              <a
                href="/hero-zoom.webp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-fun font-bold text-emerald-700 hover:underline flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
              >
                <ZoomIn className="w-4 h-4" />
                <span>Open raw image in new tab</span>
              </a>
              <button
                onClick={() => setIsArtworkModalOpen(false)}
                className="tactile-btn px-5 py-3 min-h-[44px] bg-amber-300 hover:bg-amber-400 text-slate-950 font-fun font-bold text-xs uppercase rounded-xl border-2 border-slate-950 shadow-retro-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                Close preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
