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
      className="fixed inset-0 z-50 pointer-events-auto flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-300"
    >
      <div className="relative w-full max-w-[340px] sm:max-w-md bg-[#FDFBF7] border-[3px] border-slate-950 rounded-3xl p-5 sm:p-7 shadow-retro-xl text-slate-900 flex flex-col gap-3 sm:gap-4 animate-in zoom-in-95 duration-200">
        {/* Floating Trophy Icon Badge */}
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-amber-300 border-[3px] border-slate-950 rounded-2xl p-2 sm:p-2.5 shadow-retro">
          <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-slate-950 stroke-[2.5]" />
        </div>

        {/* Header */}
        <div className="pt-2 text-center">
          <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-900 font-fun font-bold text-xs border border-slate-900 uppercase">
            Green Meadows • Level Complete
          </span>
          <h2 className="text-2xl sm:text-3xl font-fun font-black text-slate-950 mt-1.5">
            Waste Cleared!
          </h2>

          {/* Star Display */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-2" data-testid="star-rating">
            {[1, 2, 3].map((s) => {
              const active = s <= stars;
              return (
                <div
                  key={s}
                  className={`p-1.5 rounded-xl border-2 border-slate-950 transition-all duration-300 ${
                    active
                      ? 'bg-amber-300 shadow-retro-xs scale-105 sm:scale-110'
                      : 'bg-slate-200 opacity-50'
                  }`}
                >
                  <Star
                    className={`w-5 h-5 sm:w-6 sm:h-6 ${
                      active ? 'fill-slate-950 text-slate-950' : 'text-slate-400 fill-slate-300'
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats Table / Card Grid */}
        <div className="bg-white border-2 border-slate-950 rounded-2xl p-3 sm:p-4 divide-y-2 divide-slate-100 shadow-retro-sm">
          {/* Row 1: Items sorted correctly */}
          <div className="flex items-center justify-between py-2 first:pt-0">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 font-sans font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />
              <span>Items sorted correctly</span>
            </div>
            <span className="font-fun font-black text-sm sm:text-base text-emerald-700">
              {sortedCount}/{totalCount}
            </span>
          </div>

          {/* Row 2: Time taken */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 font-sans font-bold">
              <Clock className="w-4 h-4 text-sky-600 shrink-0 stroke-[2.5]" />
              <span>Time taken</span>
            </div>
            <span className="font-fun font-black text-sm sm:text-base text-slate-950 font-mono">
              {timeTakenFormatted}
            </span>
          </div>

          {/* Row 3: Contamination */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 font-sans font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 stroke-[2.5]" />
              <span>Contamination</span>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-lg border-2 border-slate-900 text-xs font-fun font-black ${
                contaminationLevel <= 1
                  ? 'bg-emerald-200 text-emerald-950'
                  : contaminationLevel === 2
                  ? 'bg-amber-200 text-amber-950'
                  : 'bg-rose-200 text-rose-950'
              }`}
            >
              {contamination.label}
            </span>
          </div>

          {/* Row 4: Stars */}
          <div className="flex items-center justify-between py-2 last:pb-0">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 font-sans font-bold">
              <Star className="w-4 h-4 text-amber-500 shrink-0 stroke-[2.5]" />
              <span>Stars</span>
            </div>
            <span className="font-fun font-black text-sm sm:text-base text-slate-950">
              {'⭐'.repeat(stars)}
            </span>
          </div>
        </div>

        {/* Narrator Quote Box */}
        {narratorLine && (
          <div className="bg-emerald-50 border-2 border-slate-900 rounded-2xl p-3 flex items-start gap-2.5 shadow-retro-xs">
            <span className="text-lg shrink-0">🌿</span>
            <p className="text-xs font-sans font-semibold text-emerald-950 leading-relaxed italic">
              “{narratorLine}”
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <button
            onClick={onPlayAgain}
            data-testid="meadows-play-again-btn"
            className="tactile-btn flex-1 py-3 px-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-950 font-fun font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border-2 border-slate-900 shadow-retro-sm active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-slate-900" />
            <span>Play Again</span>
          </button>
          <button
            onClick={onNextMission}
            data-testid="meadows-next-mission-btn"
            className="tactile-btn flex-1 py-3 px-3 rounded-2xl bg-amber-300 hover:bg-amber-400 text-slate-950 font-fun font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border-2 border-slate-950 shadow-retro active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
          >
            <span>NEXT MISSION: Restore the Garden</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
};
