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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-500/20 text-green-400 rounded-2xl">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-fun text-2xl font-bold text-white">Select Mission</h2>
              <p className="text-xs text-slate-400">Choose a location to sort and power up</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-colors"
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
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 ${
                  !isUnlocked
                    ? 'bg-slate-900/40 border-slate-800 opacity-50 cursor-not-allowed'
                    : isCurrent
                    ? 'bg-emerald-950/50 border-emerald-500 shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-900/80 border-slate-700 hover:border-emerald-400/60 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-fun font-bold text-lg ${
                      !isUnlocked
                        ? 'bg-slate-800 text-slate-500'
                        : isCurrent
                        ? 'bg-emerald-500 text-slate-950 shadow-md'
                        : 'bg-slate-700 text-white'
                    }`}
                  >
                    {isUnlocked ? lvl.id : <Lock className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-fun font-bold text-white text-base">{lvl.name}</h4>
                      {lvl.isBonus && (
                        <span className="text-[10px] bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded-full font-bold">
                          BONUS
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mb-1.5">{lvl.place} • {lvl.learningGoal}</p>

                    {/* Bins in this level */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {lvl.bins.map((b) => (
                        <span
                          key={b}
                          className={`text-[9px] px-1.5 py-0.5 rounded text-white font-semibold ${ALL_BINS[b]?.color}`}
                        >
                          {ALL_BINS[b]?.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Stars earned */}
                {isUnlocked && (
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= stars ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'
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
