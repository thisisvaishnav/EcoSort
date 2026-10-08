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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-800 border-2 border-emerald-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="font-fun text-xl font-bold text-white">Quick Quiz</h3>
          </div>
          <span className="text-xs bg-slate-700 px-3 py-1 rounded-full text-slate-300 font-semibold">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>

        {/* Question Item Card */}
        <div className="bg-slate-900 rounded-2xl p-5 mb-5 text-center border border-slate-700/60">
          <div className="text-5xl mb-2">{currentQ.item.icon}</div>
          <p className="font-fun text-lg font-bold text-white mb-1">{currentQ.item.name}</p>
          <p className="text-sm text-slate-300">{currentQ.question}</p>
        </div>

        {/* Options */}
        <div className="space-y-2.5 mb-5">
          {currentQ.options.map((opt) => {
            const bin = ALL_BINS[opt.bin];
            const isChosen = selectedOption === opt.bin;
            const isThisCorrect = opt.bin === currentQ.correctBin;

            let btnStyle = 'bg-slate-700/80 hover:bg-slate-700 border-slate-600 text-white';
            if (isAnswered) {
              if (isThisCorrect) {
                btnStyle = 'bg-emerald-600 border-emerald-400 text-white ring-2 ring-emerald-400/50';
              } else if (isChosen) {
                btnStyle = 'bg-rose-600 border-rose-400 text-white';
              } else {
                btnStyle = 'bg-slate-800/50 border-slate-700 text-slate-500 opacity-60';
              }
            }

            return (
              <button
                key={opt.bin}
                disabled={isAnswered}
                onClick={() => handleSelect(opt.bin)}
                className={`w-full p-3.5 rounded-2xl font-fun font-bold border-2 transition-all flex items-center justify-between text-left ${btnStyle}`}
              >
                <span>{bin?.label || opt.label}</span>
                {isAnswered && isThisCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-200" />}
                {isAnswered && isChosen && !isThisCorrect && <XCircle className="w-5 h-5 text-rose-200" />}
              </button>
            );
          })}
        </div>

        {/* Feedback & Continue */}
        {isAnswered && (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700 text-xs text-slate-300">
              💡 {currentQ.fact}
            </div>
            <button
              onClick={handleNext}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-fun font-bold rounded-2xl shadow-lg transition-all text-base"
            >
              {currentIndex < questions.length - 1 ? 'Next Question →' : 'See Results 🌟'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
