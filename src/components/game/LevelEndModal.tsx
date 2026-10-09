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
  // Stars formula: 3 stars for >=90%, 2 stars for >=70%, 1 star for completion
  const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : 1;

  useEffect(() => {
    audio.playCelebration();
    audio.speak(`Mission complete! You earned ${stars} stars!`);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#FDFBF7] border-2 border-slate-900 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-retro-xl text-center text-slate-900 animate-in zoom-in-95 duration-200">
        <h2 className="font-fun text-3xl font-black text-slate-950 mb-1">
          Mission {levelId} Complete!
        </h2>
        <p className="text-slate-600 font-bold text-sm mb-6">
          You sorted waste and brought clean power to town!
        </p>

        {/* Stars Display */}
        <div className="flex justify-center items-center gap-3 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`p-3 rounded-2xl border-2 border-slate-900 transition-all duration-300 ${
                s <= stars
                  ? 'bg-amber-300 text-slate-950 scale-110 shadow-retro-sm'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              <Star
                className={`w-10 h-10 stroke-slate-950 ${s <= stars ? 'fill-yellow-400' : ''}`}
              />
            </div>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-amber-100 p-3.5 rounded-2xl border-2 border-slate-900 shadow-retro-sm">
            <span className="text-xs text-slate-700 block font-black uppercase tracking-wider">Final Score</span>
            <span className="font-fun text-2xl font-black text-slate-950">{score} PTS</span>
          </div>
          <div className="bg-emerald-100 p-3.5 rounded-2xl border-2 border-slate-900 shadow-retro-sm">
            <span className="text-xs text-slate-700 block font-black uppercase tracking-wider">Accuracy</span>
            <span className="font-fun text-2xl font-black text-emerald-900">{accuracy}%</span>
          </div>
        </div>

        {/* Unlocked Eco-pedia Card Alert */}
        {unlockedItem && (
          <div className="bg-teal-100 border-2 border-slate-900 rounded-2xl p-3.5 mb-6 flex items-center gap-3 text-left shadow-retro-sm">
            <div className="text-3xl p-2 bg-white border border-slate-900 rounded-xl">{unlockedItem.icon}</div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-black text-teal-900 uppercase tracking-wide block">
                New Waste Card Unlocked!
              </span>
              <p className="font-fun font-black text-slate-950 text-sm truncate">{unlockedItem.name}</p>
              <p className="text-xs text-slate-700 font-medium truncate">{unlockedItem.fact}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={onNextLevel}
            className="w-full py-3.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-fun font-black text-lg rounded-2xl border-2 border-slate-900 shadow-retro transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-2"
          >
            <span>Next Mission</span>
            <ArrowRight className="w-5 h-5 stroke-slate-950" />
          </button>

          <div className="flex gap-2">
            <button
              onClick={onRetry}
              className="flex-1 py-3 bg-white hover:bg-slate-50 text-slate-900 font-fun font-black rounded-xl border-2 border-slate-900 shadow-retro-sm transition-all flex items-center justify-center gap-1.5 text-sm active:translate-x-[1px] active:translate-y-[1px]"
            >
              <RotateCcw className="w-4 h-4 stroke-slate-950" />
              <span>Retry</span>
            </button>
            <button
              onClick={onOpenEcopedia}
              className="flex-1 py-3 bg-white hover:bg-slate-50 text-slate-900 font-fun font-black rounded-xl border-2 border-slate-900 shadow-retro-sm transition-all flex items-center justify-center gap-1.5 text-sm active:translate-x-[1px] active:translate-y-[1px]"
            >
              <BookOpen className="w-4 h-4 text-teal-700 stroke-slate-950" />
              <span>Eco-pedia</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
