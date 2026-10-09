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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#FDFBF7] border-2 border-slate-900 rounded-3xl p-6 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-retro-xl text-slate-900 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-300 border-2 border-slate-900 text-slate-950 rounded-2xl shadow-retro-sm">
              <BookOpen className="w-6 h-6 stroke-slate-950" />
            </div>
            <div>
              <h2 className="font-fun text-2xl font-black text-slate-950">Eco-pedia</h2>
              <p className="text-xs font-bold text-slate-600">
                Unlocked {unlockedIds.length} of {GAME_ITEMS.length} waste cards
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-white hover:bg-slate-100 text-slate-900 border-2 border-slate-900 rounded-xl shadow-retro-sm transition-transform active:translate-x-[1px] active:translate-y-[1px]"
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
                  className="bg-slate-100 border-2 border-dashed border-slate-400 rounded-2xl p-4 flex items-center gap-3 opacity-75"
                >
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-300 flex items-center justify-center text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-bold block">Secret Waste Card</span>
                    <p className="text-xs text-slate-600 font-medium">Sort correctly in Level {item.unlockLevel} to unlock</p>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={item.id}
                className="bg-white border-2 border-slate-900 rounded-2xl p-4 flex flex-col justify-between shadow-retro-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl drop-shadow-sm">{item.icon}</span>
                    <span
                      className={`text-[10px] font-fun font-black px-2.5 py-0.5 rounded-full text-white border border-slate-900 ${bin?.color}`}
                    >
                      {bin?.label}
                    </span>
                  </div>
                  <h4 className="font-fun font-black text-slate-950 text-base mb-1">{item.name}</h4>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed mb-3">{item.fact}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500">Weight: ~{item.baseWeight} kg</span>
                  <button
                    onClick={() => handleReadFact(`${item.name}. ${item.fact}`)}
                    className="p-1.5 bg-teal-100 hover:bg-teal-200 text-teal-900 border border-slate-900 rounded-xl transition-all shadow-sm active:translate-x-[1px] active:translate-y-[1px]"
                    title="Listen to fact"
                  >
                    <Volume2 className="w-4 h-4 text-slate-950" />
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
