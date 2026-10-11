import React from 'react';
import { Trophy, RotateCcw, ArrowRight, Star, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

export interface MeadowsResultsModalProps {
  sortedCount: number;
  totalCount: number;
  timeTakenSeconds: number;
  contaminationLevel: number; // 0, 1, 2, 3+
  narratorLine?: string;
  onPlayAgain: () => void;
  onNextMission: () => void;
}

/**
 * Format elapsed seconds into mm:ss (e.g. 65s -> "01:05")
 */
export function formatTimeTaken(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Star rating rule:
 * - 3 stars for 9-10 correct
 * - 2 stars for 6-8 correct
 * - 1 star for fewer than 6
 */
export function calculateMeadowsStars(sortedCount: number): 1 | 2 | 3 {
  if (sortedCount >= 9) return 3;
  if (sortedCount >= 6) return 2;
  return 1;
}

/**
 * Contamination label:
 * 0 errors -> "Low"
 * 1 error  -> "Low"
 * 2 errors -> "Medium"
 * 3+ errors -> "High"
 */
export function getContaminationLabel(contaminationLevel: number): {
  label: 'Low' | 'Medium' | 'High';
  color: string;
  badgeBg: string;
} {
  if (contaminationLevel <= 1) {
    return {
      label: 'Low',
      color: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/20 border-emerald-500/40',
    };
  }
  if (contaminationLevel === 2) {
    return {
      label: 'Medium',
      color: 'text-amber-400',
      badgeBg: 'bg-amber-500/20 border-amber-500/40',
    };
  }
  return {
    label: 'High',
    color: 'text-rose-400',
    badgeBg: 'bg-rose-500/20 border-rose-500/40',
  };
}

/**
 * MeadowsResultsModal — Phase 8 Level End Results Screen.
 * Displays Items sorted correctly, Time taken, Contamination, and Star rating.
 */
export const MeadowsResultsModal: React.FC<MeadowsResultsModalProps> = ({
  sortedCount,
  totalCount,
  timeTakenSeconds,
  contaminationLevel,
  narratorLine = 'The waste pile is gone, but the land is still bare. Next, let’s bring this side back to life.',
  onPlayAgain,
  onNextMission,
}) => {
  const stars = calculateMeadowsStars(sortedCount);
  const contamination = getContaminationLabel(contaminationLevel);
  const timeTakenFormatted = formatTimeTaken(timeTakenSeconds);

  return (
    <div
      data-testid="meadows-results-modal"
      className="fixed inset-0 z-50 pointer-events-auto flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300"
    >
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(16,185,129,0.25)] text-white flex flex-col gap-5 animate-in zoom-in-95 duration-250">
        {/* Floating Trophy Icon Badge */}
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-br from-amber-400 to-amber-600 border-2 border-slate-900 rounded-2xl p-2.5 shadow-lg shadow-amber-500/30">
          <Trophy className="w-7 h-7 text-slate-950 stroke-[2.5]" />
        </div>

        {/* Header */}
        <div className="pt-3 text-center">
          <span className="text-[11px] font-fun font-bold uppercase tracking-widest text-emerald-400">
            Green Meadows • Level Complete
          </span>
          <h2 className="text-2xl font-fun font-black text-white mt-1">
            Waste Cleared!
          </h2>

          {/* Star Display */}
          <div className="flex items-center justify-center gap-2 mt-3" data-testid="star-rating">
            {[1, 2, 3].map((s) => {
              const active = s <= stars;
              return (
                <div
                  key={s}
                  className={`p-1.5 rounded-xl border transition-all duration-300 ${
                    active
                      ? 'bg-amber-400/20 border-amber-400/60 shadow-[0_0_15px_rgba(251,191,36,0.4)] scale-110'
                      : 'bg-slate-800/50 border-slate-700/60 opacity-40'
                  }`}
                >
                  <Star
                    className={`w-6 h-6 ${
                      active ? 'fill-amber-400 text-amber-400' : 'text-slate-500 fill-slate-700'
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats Table / Card Grid */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 divide-y divide-slate-800/80">
          {/* Row 1: Items sorted correctly */}
          <div className="flex items-center justify-between py-2.5 first:pt-1">
            <div className="flex items-center gap-2.5 text-xs text-slate-300 font-sans">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Items sorted correctly</span>
            </div>
            <span className="font-fun font-black text-sm text-emerald-400">
              {sortedCount}/{totalCount}
            </span>
          </div>

          {/* Row 2: Time taken */}
          <div className="flex items-center justify-between py-2.5">
            <div className="flex items-center gap-2.5 text-xs text-slate-300 font-sans">
              <Clock className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Time taken</span>
            </div>
            <span className="font-fun font-black text-sm text-white font-mono">
              {timeTakenFormatted}
            </span>
          </div>

          {/* Row 3: Contamination */}
          <div className="flex items-center justify-between py-2.5">
            <div className="flex items-center gap-2.5 text-xs text-slate-300 font-sans">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Contamination</span>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-lg border text-xs font-fun font-black ${contamination.badgeBg} ${contamination.color}`}
            >
              {contamination.label}
            </span>
          </div>

          {/* Row 4: Stars */}
          <div className="flex items-center justify-between py-2.5 last:pb-1">
            <div className="flex items-center gap-2.5 text-xs text-slate-300 font-sans">
              <Star className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Stars</span>
            </div>
            <span className="font-fun font-black text-sm text-amber-400">
              {'⭐'.repeat(stars)}
            </span>
          </div>
        </div>

        {/* Narrator Quote Box */}
        {narratorLine && (
          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-3.5 flex items-start gap-3">
            <span className="text-xl shrink-0">🌿</span>
            <p className="text-xs font-sans text-emerald-200/90 leading-relaxed italic">
              “{narratorLine}”
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <button
            onClick={onPlayAgain}
            data-testid="meadows-play-again-btn"
            className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-300 font-fun font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-700 active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>
          <button
            onClick={onNextMission}
            data-testid="meadows-next-mission-btn"
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-fun font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.4)] active:scale-95 transition-all cursor-pointer"
          >
            <span>NEXT MISSION: Restore the Garden</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
};
