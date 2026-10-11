import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { audio } from '../../../services/audio';

interface SortChoiceModalProps {
  onConfirmSort: () => void;
}

export const SortChoiceModal: React.FC<SortChoiceModalProps> = ({ onConfirmSort }) => {
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  const handleChooseMixed = () => {
    setShowExplanation(true);
    audio.speak('Mixing waste creates landfills. Always sort waste to make compost and recycling.');
  };

  const handleChooseSorted = () => {
    audio.playCelebration();
    onConfirmSort();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#FDFBF7] border-4 border-slate-900 rounded-3xl p-6 sm:p-8 shadow-retro-xl text-slate-900 flex flex-col gap-5">
        <div className="text-center space-y-1">
          <span className="px-3 py-1 bg-amber-300 border-2 border-slate-900 rounded-xl font-fun font-black text-xs uppercase shadow-retro-sm inline-block">
            Decide Your Approach
          </span>
          <h2 className="font-fun text-2xl sm:text-3xl font-black text-slate-950">
            How will you handle the waste?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Think carefully. Your choice determines our society's health.
          </p>
        </div>

        {showExplanation && (
          <div className="p-4 bg-amber-100 border-2 border-amber-600 rounded-2xl flex items-start gap-3 text-amber-950 animate-in zoom-in-95">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-700 mt-0.5" />
            <div className="text-xs sm:text-sm font-medium space-y-1">
              <p className="font-bold">Mixing waste harms the environment!</p>
              <p>
                Mixed waste rots in landfills and poisons soil water. Separating waste lets us make
                compost and recycle clean materials.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Choice A: Mix */}
          <button
            onClick={handleChooseMixed}
            className="p-5 bg-white hover:bg-rose-50 border-3 border-slate-900 rounded-2xl text-left flex flex-col justify-between gap-3 shadow-retro-md transition-all active:translate-x-0.5 active:translate-y-0.5"
          >
            <div>
              <span className="text-2xl">🗑️</span>
              <h3 className="font-fun font-black text-base text-slate-900 mt-2">
                Option A: Throw everything into one bin
              </h3>
              <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                Save time by putting all items into a single container.
              </p>
            </div>
            <span className="text-xs font-black uppercase text-rose-700">Choose Option A</span>
          </button>

          {/* Choice B: Sort */}
          <button
            onClick={handleChooseSorted}
            className="p-5 bg-emerald-100 hover:bg-emerald-200 border-3 border-slate-900 rounded-2xl text-left flex flex-col justify-between gap-3 shadow-retro-md transition-all active:translate-x-0.5 active:translate-y-0.5 ring-2 ring-emerald-500/50"
          >
            <div>
              <span className="text-2xl">♻️</span>
              <h3 className="font-fun font-black text-base text-slate-900 mt-2">
                Option B: Sort waste into correct categories
              </h3>
              <p className="text-xs text-slate-700 font-medium mt-1 leading-relaxed">
                Separate into Green, Blue, Red, and Black bins (+20 Bonus!).
              </p>
            </div>
            <span className="text-xs font-black uppercase text-emerald-800 inline-flex items-center gap-1">
              <span>Choose Option B</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            </span>
          </button>
        </div>

        {showExplanation && (
          <div className="flex justify-end pt-2">
            <button
              onClick={handleChooseSorted}
              className="px-6 py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-fun font-black text-xs rounded-2xl border-2 border-slate-900 shadow-retro-md inline-flex items-center gap-2"
            >
              <span>Switch to Sorting (+20 Pts)</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
