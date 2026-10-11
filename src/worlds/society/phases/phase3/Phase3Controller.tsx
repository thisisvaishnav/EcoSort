import React, { useState } from 'react';
import { SOCIETY_STRINGS, SocietyResidentQuiz } from '../../content';
import { BinType } from '../../../../types/game';
import { Phase3Step } from './types';
import {
  Search,
  Users,
  CheckCircle2,
  Star,
  Award,
  ArrowRight,
  HelpCircle,
  Activity,
  Heart,
  ShieldCheck,
  RotateCcw,
  Home,
} from 'lucide-react';

export interface Phase3ControllerProps {
  score: number;
  onComplete: () => void;
  onAddScore: (points: number) => void;
  onHome?: () => void;
}

export const Phase3Controller: React.FC<Phase3ControllerProps> = ({
  score,
  onComplete,
  onAddScore,
  onHome,
}) => {
  const [step, setStep] = useState<Phase3Step>('ECO_LENS_SCAN');

  // Eco Lens Scan state
  const hotspotList = Object.values(SOCIETY_STRINGS.hotspots);
  const [scannedHotspots, setScannedHotspots] = useState<Set<string>>(new Set());
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);

  // Teach Residents state
  const residents = SOCIETY_STRINGS.residents;
  const [residentIndex, setResidentIndex] = useState<number>(0);
  const [showGuidance, setShowGuidance] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [quizFeedback, setQuizFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [residentCompletedCount, setResidentCompletedCount] = useState<number>(0);

  // ── Eco Lens Handlers ───────────────────────────────────────────────────────
  const handleScanHotspot = (id: string) => {
    setActiveHotspotId(id);
    if (!scannedHotspots.has(id)) {
      setScannedHotspots((prev) => new Set([...prev, id]));
      onAddScore(20);
    }
  };

  const handleFinishEcoLens = () => {
    setStep('RESIDENTS_TEACH');
  };

  // ── Resident Quiz Handlers ─────────────────────────────────────────────────
  const currentResident: SocietyResidentQuiz = residents[residentIndex];

  const handleAnswerResidentQuiz = (selectedBin: BinType) => {
    if (selectedBin === currentResident.correctBin) {
      onAddScore(25);
      setQuizFeedback({
        isCorrect: true,
        text: `Correct! ${currentResident.name} learned proper waste sorting.`,
      });
      setResidentCompletedCount((prev) => prev + 1);
    } else {
      setQuizFeedback({
        isCorrect: false,
        text: 'Incorrect bin. Click Hint below for help!',
      });
    }
  };

  const handleNextResident = () => {
    setQuizFeedback(null);
    setShowGuidance(false);
    setShowHint(false);
    if (residentIndex + 1 < residents.length) {
      setResidentIndex((prev) => prev + 1);
    } else {
      setStep('FINALE_DASHBOARD');
      onComplete();
    }
  };

  // Star calculation
  const totalScore = score + (residentCompletedCount * 25) + (scannedHotspots.size * 20);
  const earnedStars = totalScore >= 350 ? 3 : totalScore >= 200 ? 2 : 1;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-center items-center p-4 z-30 select-none">
      {/* ── 1. Eco Lens Scanning ────────────────────────────────────────────── */}
      {step === 'ECO_LENS_SCAN' && (
        <div className="pointer-events-auto max-w-lg w-full p-6 rounded-3xl bg-slate-900/95 border-2 border-emerald-500/40 shadow-2xl backdrop-blur space-y-5 animate-in fade-in zoom-in-95">
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-2 text-emerald-400">
              <Search className="w-5 h-5" />
              <h3 className="text-lg font-black font-fun text-white">
                Eco Lens: Scan 4 Hotspots
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Identify environmental hazards in the society before meeting residents.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {hotspotList.map((h) => {
              const isScanned = scannedHotspots.has(h.id);
              return (
                <button
                  key={h.id}
                  onClick={() => handleScanHotspot(h.id)}
                  data-testid={`scan-hotspot-${h.id}`}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    isScanned
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                      : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{h.title}</span>
                    {isScanned ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Search className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 leading-tight">
                    {isScanned ? '+20 pts scanned' : 'Click to scan'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active scanned detail view */}
          {activeHotspotId && (
            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs space-y-1.5 animate-in fade-in">
              {(() => {
                const active = hotspotList.find((h) => h.id === activeHotspotId);
                if (!active) return null;
                return (
                  <>
                    <h4 className="font-bold text-emerald-400">{active.title}</h4>
                    <p className="text-slate-300 text-[11px]">{active.shortDesc}</p>
                    <p className="text-slate-400 text-[11px]">
                      <span className="text-rose-400 font-semibold">Impact: </span>
                      {active.impactText}
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      <span className="text-sky-400 font-semibold">Action: </span>
                      {active.solutionText}
                    </p>
                  </>
                );
              })()}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-semibold text-slate-400">
              Scanned: {scannedHotspots.size} / 4
            </span>
            <button
              onClick={handleFinishEcoLens}
              disabled={scannedHotspots.size < 4}
              data-testid="proceed-to-residents-btn"
              className={`tactile-btn py-2.5 px-4 rounded-xl font-fun font-bold text-xs flex items-center gap-1.5 transition-all ${
                scannedHotspots.size >= 4
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <span>TEACH RESIDENTS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── 2. Teach The 8 Residents ────────────────────────────────────────── */}
      {step === 'RESIDENTS_TEACH' && currentResident && (
        <div className="pointer-events-auto max-w-md w-full p-6 rounded-3xl bg-slate-900/95 border-2 border-slate-800 shadow-2xl backdrop-blur space-y-5 animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{currentResident.avatar}</span>
              <div>
                <h4 className="text-sm font-black text-white font-fun">
                  {currentResident.name}
                </h4>
                <p className="text-[11px] text-slate-400">{currentResident.role}</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold font-mono">
              Resident {residentIndex + 1} of 8
            </span>
          </div>

          {/* Dialogue steps */}
          <div className="space-y-2">
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs text-slate-200">
              <span className="font-bold text-slate-400 text-[10px] block mb-0.5">
                {currentResident.name.toUpperCase()} SAYS:
              </span>
              "{currentResident.statement}"
            </div>

            {!showGuidance ? (
              <button
                onClick={() => setShowGuidance(true)}
                data-testid="show-guidance-btn"
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 font-fun font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Explain Sorting Rule</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="p-3 rounded-2xl bg-sky-950/40 border border-sky-500/30 text-xs text-sky-300 animate-in fade-in">
                <span className="font-bold text-sky-400 text-[10px] block mb-0.5">
                  KAI'S GUIDANCE:
                </span>
                "{currentResident.guidance}"
              </div>
            )}
          </div>

          {/* Practice Quiz */}
          {showGuidance && (
            <div className="space-y-3 pt-1 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">
                  {currentResident.question}
                </span>
                {!showHint ? (
                  <button
                    onClick={() => setShowHint(true)}
                    className="text-[10px] text-amber-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <HelpCircle className="w-3 h-3" />
                    Hint
                  </button>
                ) : null}
              </div>

              {showHint && (
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px]">
                  Hint: {currentResident.hint}
                </div>
              )}

              {quizFeedback && (
                <div
                  className={`p-2 rounded-xl text-[11px] font-semibold text-center ${
                    quizFeedback.isCorrect
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {quizFeedback.text}
                </div>
              )}

              {!quizFeedback?.isCorrect ? (
                <div className="space-y-1.5">
                  {currentResident.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleAnswerResidentQuiz(opt.binType)}
                      data-testid={`resident-option-${opt.binType}`}
                      className="w-full p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-left text-xs text-slate-200 font-medium border border-slate-700 hover:border-emerald-400 transition-colors"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              ) : (
                <button
                  onClick={handleNextResident}
                  data-testid="next-resident-btn"
                  className="tactile-btn w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-fun font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
                >
                  <span>
                    {residentIndex + 1 === residents.length ? 'VIEW FINAL DASHBOARD' : 'NEXT RESIDENT'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── 3. Neighbourhood Health Dashboard & Finale ──────────────────────── */}
      {step === 'FINALE_DASHBOARD' && (
        <div className="pointer-events-auto max-w-lg w-full p-6 rounded-3xl bg-slate-900/95 border-2 border-emerald-500/40 shadow-2xl backdrop-blur text-center space-y-6 animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
            <Award className="w-9 h-9" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black font-fun text-white tracking-wide">
              Neighbourhood Health Dashboard
            </h2>
            <p className="text-xs text-slate-300">
              Society has achieved complete ecological harmony!
            </p>
          </div>

          {/* Stars */}
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3].map((star) => (
              <Star
                key={star}
                className={`w-8 h-8 ${
                  star <= earnedStars
                    ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                    : 'text-slate-700 fill-slate-800'
                }`}
              />
            ))}
          </div>

          {/* Metrics Bento Grid */}
          <div className="grid grid-cols-3 gap-2.5 text-left">
            <div className="p-3 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                <Activity className="w-3 h-3 text-emerald-400" />
                Segregation
              </span>
              <p className="text-base font-black text-emerald-400 font-mono">100%</p>
              <p className="text-[9px] text-slate-400">4 Sacks Sorted</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                <Users className="w-3 h-3 text-sky-400" />
                Awareness
              </span>
              <p className="text-base font-black text-sky-400 font-mono">8 / 8</p>
              <p className="text-[9px] text-slate-400">Residents Taught</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                <Heart className="w-3 h-3 text-rose-400" />
                Eco Score
              </span>
              <p className="text-base font-black text-amber-400 font-mono">+{totalScore}</p>
              <p className="text-[9px] text-slate-400">Total Points</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-300 text-left">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              All 3 Missions Complete! Society is now an accredited Green Housing Community.
            </span>
          </div>

          <div className="flex items-center gap-3 pt-2">
            {onHome && (
              <button
                onClick={onHome}
                data-testid="society-dashboard-home-btn"
                className="tactile-btn flex-1 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-fun font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>RETURN HOME</span>
              </button>
            )}
            <button
              onClick={() => {
                setStep('ECO_LENS_SCAN');
                setResidentIndex(0);
                setResidentCompletedCount(0);
              }}
              data-testid="society-play-again-btn"
              className="tactile-btn flex-1 py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-fun font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>PLAY AGAIN</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
