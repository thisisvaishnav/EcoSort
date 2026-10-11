import React, { useState } from 'react';
import { ArrowRight, Volume2 } from 'lucide-react';
import {
  MIGSUN_INTRO_DIALOGUE,
  MIGSUN_LEVEL_TITLE,
  MIGSUN_OBJECTIVE,
  MIGSUN_HINT,
} from '../../../data/migsunData';
import { audio } from '../../../services/audio';

interface CharacterIntroOverlayProps {
  onComplete: () => void;
}

export const CharacterIntroOverlay: React.FC<CharacterIntroOverlayProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  const handleNext = () => {
    if (currentStep < MIGSUN_INTRO_DIALOGUE.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      audio.speak(MIGSUN_INTRO_DIALOGUE[nextStep].text);
    } else {
      onComplete();
    }
  };

  const currentDialogue = MIGSUN_INTRO_DIALOGUE[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#FDFBF7] border-4 border-slate-900 rounded-3xl p-6 sm:p-8 shadow-retro-xl text-slate-900 flex flex-col gap-5">
        {/* Title Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-slate-900 pb-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-amber-300 border-2 border-slate-900 rounded-xl font-fun font-black text-xs uppercase shadow-retro-sm">
              {MIGSUN_LEVEL_TITLE}
            </span>
            <span className="px-2.5 py-1 bg-emerald-300 border-2 border-slate-900 rounded-xl font-fun font-bold text-xs uppercase shadow-retro-sm">
              🏘️ Migsun Vilasa
            </span>
          </div>
          <button
            onClick={() => audio.speak(currentDialogue.text)}
            className="p-1.5 bg-white hover:bg-slate-100 border-2 border-slate-900 rounded-xl shadow-retro-sm"
            title="Read aloud"
          >
            <Volume2 className="w-4 h-4 text-slate-800" />
          </button>
        </div>

        {/* Mascot / Kai Dialogue Bubble */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-300 border-3 border-slate-900 flex-shrink-0 flex items-center justify-center shadow-retro-sm text-3xl">
            🧒
          </div>
          <div className="flex-1 space-y-1">
            <h4 className="font-fun font-black text-sm text-emerald-800 uppercase tracking-wide">
              Kai says:
            </h4>
            <p className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              "{currentDialogue.text}"
            </p>
          </div>
        </div>

        {/* Narrative Objective & Hint */}
        {currentStep >= 2 && (
          <div className="p-3 bg-emerald-50 border-2 border-emerald-600 rounded-2xl space-y-1 text-xs font-medium text-emerald-950">
            <div className="font-bold">{MIGSUN_OBJECTIVE}</div>
            <div className="text-emerald-700">{MIGSUN_HINT}</div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-1.5">
            {MIGSUN_INTRO_DIALOGUE.map((_, idx) => (
              <span
                key={idx}
                className={`w-2.5 h-2.5 rounded-full border border-slate-900 transition-all ${
                  idx === currentStep ? 'bg-amber-400 w-6' : 'bg-slate-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="px-6 py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-fun font-black text-sm rounded-2xl border-2 border-slate-900 shadow-retro-md inline-flex items-center gap-2 active:translate-x-0.5 active:translate-y-0.5"
          >
            <span>{currentStep === MIGSUN_INTRO_DIALOGUE.length - 1 ? 'Start Mission' : 'Continue'}</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
};
