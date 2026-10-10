import React from 'react';
import { Trophy, RotateCcw, ArrowRight, Star } from 'lucide-react';
import { ALL_BINS } from '../../data/bins';
import { BinType } from '../../types/game';

export interface MissionError {
  itemId: string;
  itemName: string;
  triedBin: BinType;
  correctBin: BinType;
  fact: string;
}

interface MissionResultsModalProps {
  totalItems: number;
  sortedItems: number;
  correctFirstTry: number;
  incorrectAttempts: number;
  litterLeft: number;
  ecoLensUses: number;
  timeRemaining: number;
  errors: MissionError[];
  onPlayAgain: () => void;
  onNextLevel: () => void;
}

type Rating = 'beginner' | 'warrior' | 'champion';

function getRating(accuracy: number, litterLeft: number): Rating {
  if (accuracy >= 90 && litterLeft === 0) return 'champion';
  if (accuracy >= 60 && litterLeft <= 2) return 'warrior';
  return 'beginner';
}

const RATING_CONFIG = {
  beginner: {
    emoji: '🌱',
    label: 'Eco Beginner',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    stars: 1,
  },
  warrior: {
    emoji: '⚔️',
    label: 'Waste Warrior',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    stars: 2,
  },
  champion: {
    emoji: '🏆',
    label: 'Eco Champion',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    stars: 3,
  },
};

/**
 * MissionResultsModal — detailed end-of-level results for the Society scene.
 * Shows sorted count, accuracy, errors, learning summary, and rating.
 */
export const MissionResultsModal: React.FC<MissionResultsModalProps> = ({
  totalItems,
  sortedItems,
  correctFirstTry,
  incorrectAttempts,
  litterLeft,
  ecoLensUses,
  timeRemaining,
  errors,
  onPlayAgain,
  onNextLevel,
}) => {
  const accuracy = sortedItems > 0 ? Math.round((correctFirstTry / sortedItems) * 100) : 0;
  const rating = getRating(accuracy, litterLeft);
  const cfg = RATING_CONFIG[rating];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative bg-[#FDFBF7] border-2 border-slate-900 rounded-3xl shadow-retro-xl w-full max-w-md max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="bg-emerald-500 rounded-t-3xl px-6 pt-6 pb-4 text-center border-b-2 border-slate-900">
          <div className="text-4xl mb-1">🏆</div>
          <h2 className="text-xl font-fun font-black text-white">Mission Complete!</h2>
          <p className="text-emerald-100 text-xs font-fun mt-0.5">Eco Society — Waste Detective</p>
        </div>

        <div className="p-5 space-y-4">

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-2">
            <StatCard label="Items Sorted" value={`${sortedItems} / ${totalItems}`} emoji="🗑️" />
            <StatCard label="Correct First Try" value={String(correctFirstTry)} emoji="✅" />
            <StatCard label="Wrong Attempts" value={String(incorrectAttempts)} emoji="❌" highlight={incorrectAttempts > 3} />
            <StatCard label="Litter Left" value={String(litterLeft)} emoji="⚠️" highlight={litterLeft > 0} />
            <StatCard label="Eco Lens Uses" value={`${ecoLensUses} / 5`} emoji="🔍" />
            <StatCard label="Time Remaining" value={`${timeRemaining}s`} emoji="⏱️" />
          </div>

          {/* Rating */}
          <div className={`flex items-center gap-3 p-3 rounded-2xl border-2 border-slate-200 ${cfg.bg}`}>
            <span className="text-3xl">{cfg.emoji}</span>
            <div>
              <div className={`font-fun font-black text-base ${cfg.color}`}>{cfg.label}</div>
              <div className="flex gap-0.5 mt-0.5">
                {[1, 2, 3].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${s <= cfg.stars ? 'fill-amber-400 text-amber-400' : 'text-slate-300 fill-slate-300'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* What you learned */}
          {errors.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-fun font-black text-sm text-slate-700">What You Learned</h3>
              {errors.slice(0, 4).map((err, i) => (
                <div key={i} className="bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 text-xs">
                  <div className="flex items-center gap-1.5 font-fun font-black text-rose-700">
                    <span>❌</span>
                    <span>{err.itemName}</span>
                    <span className="text-slate-400">→ tried</span>
                    <span className="px-1 rounded" style={{ background: `#${ALL_BINS[err.triedBin]?.hexColor.toString(16).padStart(6, '0')}22` }}>
                      {ALL_BINS[err.triedBin]?.label ?? err.triedBin}
                    </span>
                  </div>
                  <div className="text-slate-600 mt-0.5 flex items-center gap-1">
                    <span className="text-emerald-600 font-black">✓ Correct:</span>
                    <span>{ALL_BINS[err.correctBin]?.label ?? err.correctBin}</span>
                  </div>
                  <div className="text-slate-500 italic mt-0.5">💡 {err.fact}</div>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onPlayAgain}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-slate-100 text-slate-900 border-2 border-slate-900 shadow-retro-sm rounded-2xl font-fun font-black text-sm transition-all active:translate-x-[1px] active:translate-y-[1px]"
            >
              <RotateCcw className="w-4 h-4" />
              Play Again
            </button>
            <button
              onClick={onNextLevel}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-white border-2 border-slate-900 shadow-retro rounded-2xl font-fun font-black text-sm transition-all active:translate-x-[1px] active:translate-y-[1px]"
            >
              Next Level
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Trophy icon decorative */}
        <div className="absolute -top-4 -right-4">
          <div className="bg-amber-400 border-2 border-slate-900 rounded-full p-2 shadow-retro-sm">
            <Trophy className="w-6 h-6 text-slate-950" />
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string;
  emoji: string;
  highlight?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, emoji, highlight }) => (
  <div className={`flex items-center gap-2 p-2.5 rounded-xl border ${highlight ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'}`}>
    <span className="text-lg">{emoji}</span>
    <div>
      <div className="text-[10px] text-slate-500 font-fun font-black leading-none">{label}</div>
      <div className={`text-sm font-fun font-black ${highlight ? 'text-rose-700' : 'text-slate-900'}`}>{value}</div>
    </div>
  </div>
);
