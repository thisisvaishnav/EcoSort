import React, { useState } from 'react';
import { QuizQuestion } from '../../types/game';
import { ALL_BINS } from '../../data/bins';
import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import { audio } from '../../services/audio';

interface QuizModalProps {
  questions: QuizQuestion[];
  onCompleteQuiz: (quizScore: number) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({ questions, onCompleteQuiz }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const currentQ = questions[currentIndex];

  const handleSelect = (binId: string) => {
    if (isAnswered) return;
    setSelectedOption(binId);
    setIsAnswered(true);

    const isCorrect = binId === currentQ.correctBin;
    if (isCorrect) {
      audio.playCorrect();
      audio.speak(`Correct! ${currentQ.fact}`);
      setCorrectCount((prev) => prev + 1);
    } else {
      audio.playIncorrect();
      audio.speak(`Not quite. ${currentQ.fact}`);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      onCompleteQuiz(correctCount);
    }
  };

  if (!currentQ) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#FDFBF7] border-2 border-slate-900 rounded-3xl p-6 max-w-md w-full shadow-retro-xl text-slate-900 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-300 border-2 border-slate-900 text-slate-950 rounded-xl shadow-retro-sm">
              <HelpCircle className="w-5 h-5 stroke-slate-950" />
            </div>
            <h3 className="font-fun text-xl font-black text-slate-950">Quick Quiz</h3>
          </div>
          <span className="text-xs bg-white border-2 border-slate-900 px-3 py-1 rounded-xl text-slate-900 font-black shadow-retro-sm">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>

        {/* Question Item Card */}
        <div className="bg-white rounded-2xl p-5 mb-5 text-center border-2 border-slate-900 shadow-retro-sm">
          <div className="text-5xl mb-2 drop-shadow-sm">{currentQ.item.icon}</div>
          <p className="font-fun text-lg font-black text-slate-950 mb-1">{currentQ.item.name}</p>
          <p className="text-sm font-bold text-slate-700">{currentQ.question}</p>
        </div>

        {/* Options */}
        <div className="space-y-2.5 mb-5">
          {currentQ.options.map((opt) => {
            const bin = ALL_BINS[opt.bin];
            const isChosen = selectedOption === opt.bin;
            const isThisCorrect = opt.bin === currentQ.correctBin;

            let btnStyle = 'bg-white hover:bg-slate-50 border-2 border-slate-900 shadow-retro-sm text-slate-950';
            if (isAnswered) {
              if (isThisCorrect) {
                btnStyle = 'bg-emerald-300 border-2 border-slate-900 shadow-retro-sm text-slate-950';
              } else if (isChosen) {
                btnStyle = 'bg-rose-300 border-2 border-slate-900 shadow-retro-sm text-slate-950';
              } else {
                btnStyle = 'bg-slate-100 border-2 border-slate-300 text-slate-400 opacity-60';
              }
            }

            return (
              <button
                key={opt.bin}
                disabled={isAnswered}
                onClick={() => handleSelect(opt.bin)}
                className={`w-full p-3.5 rounded-2xl font-fun font-black transition-all flex items-center justify-between text-left active:translate-x-[1px] active:translate-y-[1px] ${btnStyle}`}
              >
                <span>{bin?.label || opt.label}</span>
                {isAnswered && isThisCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-900" />}
                {isAnswered && isChosen && !isThisCorrect && <XCircle className="w-5 h-5 text-rose-900" />}
              </button>
            );
          })}
        </div>

        {/* Feedback & Continue */}
        {isAnswered && (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-3 bg-amber-100 rounded-xl border-2 border-slate-900 text-xs font-bold text-slate-900 shadow-retro-sm">
              💡 {currentQ.fact}
            </div>
            <button
              onClick={handleNext}
              className="w-full py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-fun font-black rounded-xl border-2 border-slate-900 shadow-retro transition-all text-base active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              {currentIndex < questions.length - 1 ? 'Next Question →' : 'See Results 🌟'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
