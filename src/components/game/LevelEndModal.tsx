import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, RotateCcw, ArrowRight, BookOpen } from 'lucide-react';
import { audio } from '../../services/audio';
import { ItemData } from '../../types/game';

interface LevelEndModalProps {
  levelId: number;
  score: number;
  accuracy: number;
  unlockedItem: ItemData | null;
  onNextLevel: () => void;
  onRetry: () => void;
  onOpenEcopedia: () => void;
}

export const LevelEndModal: React.FC<LevelEndModalProps> = ({
  levelId,
  score,
  accuracy,
  unlockedItem,
  onNextLevel,
  onRetry,
  onOpenEcopedia,
}) => {
  // Stars formula from PLAN.md: 3 stars for >=90%, 2 stars for >=70%, 1 star for completion
  const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : 1;

  useEffect(() => {
    audio.playCelebration();
    audio.speak(`Level complete! You earned ${stars} stars!`);

    // Confetti cannon
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // pass
    }
  }, [stars]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-800 border-2 border-yellow-500/50 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl text-center animate-in zoom-in-95 duration-200">
        <h2 className="font-fun text-3xl font-extrabold text-white mb-2">
          Level {levelId} Complete!
        </h2>
        <p className="text-slate-300 text-sm mb-6">
          You helped sort the waste and bring clean energy to town!
        </p>

        {/* Stars Display */}
        <div className="flex justify-center items-center gap-3 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`p-3 rounded-2xl transition-all duration-300 ${
                s <= stars
                  ? 'bg-yellow-500/20 text-yellow-400 scale-110 shadow-lg shadow-yellow-500/20'
                  : 'bg-slate-700/40 text-slate-600'
              }`}
            >
              <Star
                className={`w-10 h-10 ${s <= stars ? 'fill-yellow-400 animate-pulse' : ''}`}
              />
            </div>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-700">
            <span className="text-xs text-slate-400 block font-medium">Final Score</span>
            <span className="font-fun text-2xl font-bold text-yellow-400">{score}</span>
          </div>
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-700">
            <span className="text-xs text-slate-400 block font-medium">Accuracy</span>
            <span className="font-fun text-2xl font-bold text-emerald-400">{accuracy}%</span>
          </div>
        </div>

        {/* Unlocked Eco-pedia Card Alert */}
        {unlockedItem && (
          <div className="bg-gradient-to-r from-teal-900/40 to-emerald-900/40 border border-teal-500/40 rounded-2xl p-4 mb-6 flex items-center gap-3 text-left">
            <div className="text-3xl p-2 bg-slate-900 rounded-xl">{unlockedItem.icon}</div>
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wide block">
                New Eco-pedia Card Unlocked!
              </span>
              <p className="font-fun font-bold text-white text-sm truncate">{unlockedItem.name}</p>
              <p className="text-xs text-slate-300 truncate">{unlockedItem.fact}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={onNextLevel}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-fun font-bold text-lg rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span>Next Mission</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="flex gap-2">
            <button
              onClick={onRetry}
              className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-fun font-bold rounded-2xl transition-all flex items-center justify-center gap-1.5 text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry</span>
            </button>
            <button
              onClick={onOpenEcopedia}
              className="flex-1 py-3 bg-teal-700/50 hover:bg-teal-600/50 text-teal-200 border border-teal-500/30 font-fun font-bold rounded-2xl transition-all flex items-center justify-center gap-1.5 text-sm"
            >
              <BookOpen className="w-4 h-4" />
              <span>Eco-pedia</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
