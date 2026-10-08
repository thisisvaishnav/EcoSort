import React from 'react';
import { X, BookOpen, Lock, Volume2 } from 'lucide-react';
import { GAME_ITEMS } from '../../data/items';
import { ALL_BINS } from '../../data/bins';
import { audio } from '../../services/audio';

interface EcopediaModalProps {
  unlockedIds: string[];
  onClose: () => void;
}

export const EcopediaModal: React.FC<EcopediaModalProps> = ({ unlockedIds, onClose }) => {
  const handleReadFact = (fact: string) => {
    audio.speak(fact);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-800 border border-teal-500/30 rounded-3xl p-6 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-500/20 text-teal-400 rounded-2xl">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-fun text-2xl font-bold text-white">Eco-pedia</h2>
              <p className="text-xs text-slate-400">
                Unlocked {unlockedIds.length} of {GAME_ITEMS.length} waste discovery cards
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cards Grid */}
        <div className="flex-1 overflow-y-auto py-4 pr-1 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {GAME_ITEMS.map((item) => {
            const isUnlocked = unlockedIds.includes(item.id);
            const bin = ALL_BINS[item.bin];

            if (!isUnlocked) {
              return (
                <div
                  key={item.id}
                  className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center gap-3 opacity-60"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-semibold block">Locked Card</span>
                    <p className="text-sm text-slate-400 font-fun">Play Level {item.unlockLevel} to unlock</p>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={item.id}
                className="bg-slate-900/90 border border-slate-700 hover:border-teal-500/50 rounded-2xl p-4 flex flex-col justify-between shadow-lg transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl">{item.icon}</span>
                    <span
                      className={`text-[10px] font-fun font-bold px-2 py-0.5 rounded-full text-white ${bin?.color}`}
                    >
                      {bin?.label}
                    </span>
                  </div>
                  <h4 className="font-fun font-bold text-white text-base mb-1">{item.name}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">{item.fact}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <span className="text-[11px] text-slate-400">Weight: ~{item.baseWeight} kg</span>
                  <button
                    onClick={() => handleReadFact(`${item.name}. ${item.fact}`)}
                    className="p-1.5 hover:bg-slate-800 text-teal-400 hover:text-teal-300 rounded-lg transition-colors"
                    title="Listen to fact"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
