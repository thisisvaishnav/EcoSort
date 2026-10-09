import React from 'react';
import { X, MapPin, Star, Lock } from 'lucide-react';
import { GAME_LEVELS } from '../../data/levels';
import { ALL_BINS } from '../../data/bins';

interface LevelSelectModalProps {
  currentLevelId: number;
  starsMap: Record<number, number>;
  onSelectLevel: (levelId: number) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  currentLevelId,
  starsMap,
  onSelectLevel,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#FDFBF7] border-2 border-slate-900 rounded-3xl p-6 max-w-xl w-full max-h-[85vh] flex flex-col shadow-retro-xl text-slate-900 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-400 border-2 border-slate-900 text-slate-950 rounded-2xl shadow-retro-sm">
              <MapPin className="w-6 h-6 stroke-slate-950" />
            </div>
            <div>
              <h2 className="font-fun text-2xl font-black text-slate-950">Select Mission</h2>
              <p className="text-xs font-bold text-slate-600">Pick a place to sort waste and power the town</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-white hover:bg-slate-100 text-slate-900 border-2 border-slate-900 rounded-xl shadow-retro-sm transition-transform active:translate-x-[1px] active:translate-y-[1px]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Level List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
          {GAME_LEVELS.map((lvl, index) => {
            const isUnlocked = index === 0 || starsMap[lvl.id - 1] !== undefined;
            const stars = starsMap[lvl.id] || 0;
            const isCurrent = lvl.id === currentLevelId;

            return (
              <div
                key={lvl.id}
                onClick={() => {
                  if (isUnlocked) {
                    onSelectLevel(lvl.id);
                    onClose();
                  }
                }}
                className={`p-4 rounded-2xl border-2 border-slate-900 transition-all flex items-center justify-between gap-4 ${
                  !isUnlocked
                    ? 'bg-slate-200/60 opacity-60 cursor-not-allowed'
                    : isCurrent
                    ? 'bg-amber-200 shadow-retro cursor-pointer'
                    : 'bg-white hover:bg-amber-50 shadow-retro-sm cursor-pointer hover:translate-x-[-1px] hover:translate-y-[-1px]'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-2xl border-2 border-slate-900 flex items-center justify-center font-fun font-black text-lg ${
                      !isUnlocked
                        ? 'bg-slate-300 text-slate-500'
                        : isCurrent
                        ? 'bg-emerald-400 text-slate-950 shadow-retro-sm'
                        : 'bg-slate-100 text-slate-900'
                    }`}
                  >
                    {isUnlocked ? lvl.id : <Lock className="w-5 h-5 stroke-slate-600" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-fun font-black text-slate-950 text-base">{lvl.name}</h4>
                      {lvl.isBonus && (
                        <span className="text-[10px] bg-amber-400 border border-slate-900 text-slate-950 px-2 py-0.5 rounded-full font-black">
                          BONUS
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-slate-700 mb-1.5">{lvl.place} • {lvl.learningGoal}</p>

                    {/* Bins in this level */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {lvl.bins.map((b) => (
                        <span
                          key={b}
                          className={`text-[9px] px-2 py-0.5 rounded-md text-white font-black border border-slate-900 ${ALL_BINS[b]?.color}`}
                        >
                          {ALL_BINS[b]?.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Stars earned */}
                {isUnlocked && (
                  <div className="flex items-center gap-1 bg-white border border-slate-900 px-2 py-1 rounded-xl shadow-retro-sm">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= stars ? 'fill-yellow-400 text-slate-950' : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
