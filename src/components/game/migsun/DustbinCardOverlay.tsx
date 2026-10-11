import React, { useState } from 'react';
import { Volume2, CheckCircle2, X } from 'lucide-react';
import { BinType } from '../../../types/game';
import { DUSTBIN_CARDS, DustbinCardData } from '../../../data/migsunData';
import { audio } from '../../../services/audio';

interface DustbinCardOverlayProps {
  binType: BinType;
  onClose: () => void;
  onAnswerCorrect: () => void;
}

export const DustbinCardOverlay: React.FC<DustbinCardOverlayProps> = ({
  binType,
  onClose,
  onAnswerCorrect,
}) => {
  const card: DustbinCardData = DUSTBIN_CARDS[binType];
  const [selectedAnswer, setSelectedAnswer] = useState<BinType | null>(null);
  const [answeredCorrectly, setAnsweredCorrectly] = useState<boolean | null>(null);

  const handleOptionClick = (optionBin: BinType) => {
    setSelectedAnswer(optionBin);
    if (optionBin === card.practiceQuestion.correctBin) {
      setAnsweredCorrectly(true);
      audio.playResidentCorrect();
      audio.speak('Well done! ' + card.practiceQuestion.explanation);
      setTimeout(() => {
        onAnswerCorrect();
      }, 1400);
    } else {
      setAnsweredCorrectly(false);
      audio.playIncorrect();
      audio.speak('Not quite. ' + card.practiceQuestion.explanation);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#FDFBF7] border-4 border-slate-900 rounded-3xl p-6 sm:p-7 shadow-retro-xl text-slate-900 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900">
          <div className="flex items-center gap-2">
            <span
              className="w-4 h-4 rounded-full border border-slate-900"
              style={{ backgroundColor: card.hexColor }}
            />
            <h2 className="font-fun text-xl sm:text-2xl font-black text-slate-950">
              {card.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-white hover:bg-slate-100 border-2 border-slate-900 rounded-xl shadow-retro-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Voice description */}
        <div className="p-4 bg-white border-2 border-slate-900 rounded-2xl flex items-start gap-3 shadow-retro-sm">
          <button
            onClick={() => audio.speak(card.voiceText)}
            className="p-2 bg-amber-300 hover:bg-amber-400 border-2 border-slate-900 rounded-xl flex-shrink-0"
            title="Read description aloud"
          >
            <Volume2 className="w-5 h-5 text-slate-950" />
          </button>
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">
              BIN PURPOSE
            </span>
            <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
              "{card.description}"
            </p>
          </div>
        </div>

        {/* Examples */}
        <div className="space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-slate-700">
            COMMON EXAMPLES
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {card.examples.map((ex, i) => (
              <div
                key={i}
                className="p-2.5 bg-slate-100 border-2 border-slate-900 rounded-xl flex flex-col items-center text-center gap-1 shadow-retro-sm"
              >
                <span className="text-2xl">{ex.icon}</span>
                <span className="text-xs font-bold text-slate-800">{ex.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Practice question */}
        <div className="space-y-3 pt-2 border-t-2 border-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-amber-900">
              PRACTICE QUIZ
            </span>
            {answeredCorrectly === true && (
              <span className="text-xs font-black text-emerald-700 inline-flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Correct!
              </span>
            )}
          </div>

          <p className="text-sm font-bold text-slate-900">
            ❓ {card.practiceQuestion.question}
          </p>

          <div className="grid grid-cols-2 gap-2">
            {card.practiceQuestion.options.map((opt, i) => {
              const isSelected = selectedAnswer === opt.binType;
              const isCorrect = opt.binType === card.practiceQuestion.correctBin;
              return (
                <button
                  key={i}
                  onClick={() => handleOptionClick(opt.binType)}
                  className={`p-3 rounded-xl border-2 border-slate-900 text-xs font-black uppercase transition-all shadow-retro-sm flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? isCorrect
                        ? 'bg-emerald-300 text-slate-950'
                        : 'bg-rose-200 text-slate-950'
                      : 'bg-white hover:bg-slate-50 text-slate-900'
                  }`}
                >
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>

          {answeredCorrectly !== null && (
            <p
              className={`text-xs font-bold p-2.5 rounded-xl border ${
                answeredCorrectly
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                  : 'bg-rose-50 border-rose-400 text-rose-950'
              }`}
            >
              {card.practiceQuestion.explanation}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
