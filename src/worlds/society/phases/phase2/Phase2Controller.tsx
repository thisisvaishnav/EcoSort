import React, { useState } from 'react';
import { BinType } from '../../../../types/game';
import { SOCIETY_MANIFEST } from '../../manifest';
import { BinSpotCandidate } from '../../../types';
import { Phase2Step } from './types';
import { Sparkles, MapPin, CheckCircle, HelpCircle, ArrowRight, BookOpen } from 'lucide-react';

export interface Phase2ControllerProps {
  onComplete: () => void;
  onAddScore: (points: number) => void;
  onTriggerRevival?: () => void;
}

interface EducationalCard {
  bin: BinType;
  title: string;
  colorName: string;
  hexBg: string;
  badgeBg: string;
  voiceText: string;
  examples: { icon: string; name: string }[];
  quiz: {
    question: string;
    options: { label: string; isCorrect: boolean }[];
    explanation: string;
  };
}

const BIN_CARDS: EducationalCard[] = [
  {
    bin: 'wet',
    title: 'Green Bin — Wet Waste',
    colorName: 'Green',
    hexBg: 'bg-emerald-600',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    voiceText: 'Food scraps, fruit peels, and dry leaves decompose into rich soil compost.',
    examples: [
      { icon: '🍌', name: 'Banana peel' },
      { icon: '🥬', name: 'Veggie scraps' },
      { icon: '🍎', name: 'Apple core' },
      { icon: '🍂', name: 'Fallen leaves' },
    ],
    quiz: {
      question: 'What happens to organic waste inside the green bin?',
      options: [
        { label: 'Becomes nutrient-rich soil compost', isCorrect: true },
        { label: 'Burned into harmful smoke', isCorrect: false },
        { label: 'Dumped into clean ocean rivers', isCorrect: false },
      ],
      explanation: 'Wet organic matter breaks down into compost for trees and crops.',
    },
  },
  {
    bin: 'dry',
    title: 'Blue Bin — Dry Recyclables',
    colorName: 'Blue',
    hexBg: 'bg-blue-600',
    badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    voiceText: 'Clean cardboard, newspapers, plastic bottles, and metal cans get recycled.',
    examples: [
      { icon: '📦', name: 'Cardboard box' },
      { icon: '📰', name: 'Newspaper' },
      { icon: '🍾', name: 'Plastic bottle' },
      { icon: '🥫', name: 'Soda can' },
    ],
    quiz: {
      question: 'Which condition must dry recyclables satisfy before disposal?',
      options: [
        { label: 'Clean and free of wet food residue', isCorrect: true },
        { label: 'Mixed with oily kitchen gravy', isCorrect: false },
        { label: 'Wet and soggy with muddy water', isCorrect: false },
      ],
      explanation: 'Recycling machinery requires clean, dry materials to process fibers.',
    },
  },
  {
    bin: 'hazardous',
    title: 'Red Bin — Hazardous Waste',
    colorName: 'Red',
    hexBg: 'bg-rose-600',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    voiceText: 'Batteries, broken glass, expired chemicals, and medical items need special handling.',
    examples: [
      { icon: '🔋', name: 'AA Battery' },
      { icon: '💊', name: 'Expired medicine' },
      { icon: '💡', name: 'Fluorescent bulb' },
      { icon: '🩹', name: 'Used bandage' },
    ],
    quiz: {
      question: 'Why must batteries never be placed in normal trash bins?',
      options: [
        { label: 'Heavy acid leaks and poisons ground water', isCorrect: true },
        { label: 'Batteries make trash too heavy to lift', isCorrect: false },
        { label: 'Batteries turn paper into plastic', isCorrect: false },
      ],
      explanation: 'Heavy metals like lead and cadmium contaminate underground water.',
    },
  },
  {
    bin: 'residual',
    title: 'Black Bin — Residual Waste',
    colorName: 'Black',
    hexBg: 'bg-slate-700',
    badgeBg: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    voiceText: 'Floor dirt, ceramic fragments, broken pens, and mixed items that cannot be recycled.',
    examples: [
      { icon: '🧹', name: 'Floor dirt' },
      { icon: '🖊️', name: 'Broken pen' },
      { icon: '☕', name: 'Broken ceramic mug' },
      { icon: '🧻', name: 'Used tissues' },
    ],
    quiz: {
      question: 'What belongs inside the black residual bin?',
      options: [
        { label: 'Non-recyclable items like dust and broken pens', isCorrect: true },
        { label: 'Clean cardboard boxes', isCorrect: false },
        { label: 'Fresh fruit peels', isCorrect: false },
      ],
      explanation: 'Residual waste goes to engineered sanitary landfills.',
    },
  },
];

export const Phase2Controller: React.FC<Phase2ControllerProps> = ({
  onComplete,
  onAddScore,
  onTriggerRevival,
}) => {
  const [step, setStep] = useState<Phase2Step>('REVIVAL_CINEMATIC');
  const [selectedSpot, setSelectedSpot] = useState<BinSpotCandidate | null>(null);
  const [spotFeedback, setSpotFeedback] = useState<string | null>(null);
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [cardQuizAnswered, setCardQuizAnswered] = useState<boolean>(false);
  const [cardFeedback, setCardFeedback] = useState<string | null>(null);

  // Cinematic start
  const handleStartSpotSelection = () => {
    onTriggerRevival?.();
    setStep('SPOT_SELECTION');
  };

  const handleSelectSpot = (spot: BinSpotCandidate) => {
    if (spot.isCorrect) {
      setSelectedSpot(spot);
      onAddScore(spot.scoreBonus);
      setStep('INSTALLATION_POPUP');
    } else {
      setSpotFeedback(spot.explanation);
    }
  };

  const handleAnswerCardQuiz = (isCorrect: boolean, explanation: string) => {
    if (isCorrect) {
      onAddScore(15);
      setCardFeedback(explanation);
      setCardQuizAnswered(true);
    } else {
      setCardFeedback('Incorrect choice. Read the bin guidance above!');
    }
  };

  const handleNextCard = () => {
    setCardQuizAnswered(false);
    setCardFeedback(null);
    if (activeCardIndex + 1 < BIN_CARDS.length) {
      setActiveCardIndex((prev) => prev + 1);
    } else {
      setStep('COMPLETE');
    }
  };

  const currentCard = BIN_CARDS[activeCardIndex];

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-center items-center p-4 z-30 select-none">
      {/* ── 1. Revival Cinematic Card ────────────────────────────────────────── */}
      {step === 'REVIVAL_CINEMATIC' && (
        <div className="pointer-events-auto max-w-md w-full p-6 rounded-3xl bg-slate-900/95 border-2 border-emerald-500/40 shadow-2xl backdrop-blur text-center space-y-5 animate-in fade-in zoom-in-95">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
            <Sparkles className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] tracking-wider font-bold uppercase text-emerald-400">
              MISSION 2: INSTALL DUSTBINS
            </span>
            <h3 className="text-xl font-black font-fun text-white tracking-wide">
              Nature Begins To Heal
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              With the waste pile cleared, grass and saplings revive! Now we must install four permanent dustbins in the society.
            </p>
          </div>

          <button
            onClick={handleStartSpotSelection}
            data-testid="start-spot-selection-btn"
            className="tactile-btn w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-fun font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <span>CHOOSE DUSTBIN LOCATION</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── 2. Candidate Spot Selection ────────────────────────────────────── */}
      {step === 'SPOT_SELECTION' && (
        <div className="pointer-events-auto max-w-lg w-full p-6 rounded-3xl bg-slate-900/95 border-2 border-slate-800 shadow-2xl backdrop-blur space-y-5">
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-2 text-sky-400">
              <MapPin className="w-5 h-5" />
              <h3 className="text-lg font-black font-fun text-white">
                Select Dustbin Station Location
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Choose a location with good accessibility and safety rules.
            </p>
          </div>

          {spotFeedback && (
            <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs text-center font-medium">
              {spotFeedback}
            </div>
          )}

          <div className="space-y-2 max-h-[48vh] overflow-y-auto pr-1">
            {SOCIETY_MANIFEST.binSpots.map((spot) => (
              <button
                key={spot.id}
                onClick={() => handleSelectSpot(spot)}
                data-testid={`bin-spot-${spot.id}`}
                className="w-full p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-sky-400 text-left flex items-center justify-between group transition-all"
              >
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-sky-300">
                    {spot.label}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Coords: X:{spot.position.x}, Z:{spot.position.z}
                  </p>
                </div>
                <span className="text-xs font-bold text-sky-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Install</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── 3. Installation Success Pop-up ──────────────────────────────────── */}
      {step === 'INSTALLATION_POPUP' && selectedSpot && (
        <div className="pointer-events-auto max-w-md w-full p-6 rounded-3xl bg-slate-900/95 border-2 border-emerald-500/40 shadow-2xl backdrop-blur text-center space-y-5 animate-in fade-in zoom-in-95">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-xl font-black font-fun text-white tracking-wide">
              Dustbins Installed!
            </h3>
            <p className="text-xs text-emerald-300 font-semibold">
              Location: {selectedSpot.label} (+{selectedSpot.scoreBonus} pts)
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedSpot.explanation}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 text-left space-y-1">
            <span className="font-bold text-white flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-sky-400" />
              In-World Education Cards
            </span>
            <p className="text-[11px] text-slate-400">
              Learn the 4 bins to help society residents sort properly.
            </p>
          </div>

          <button
            onClick={() => setStep('BIN_CARDS_EDUCATION')}
            data-testid="open-bin-cards-btn"
            className="tactile-btn w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-fun font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <span>LEARN 4 BIN RULES</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── 4. Four In-World Bin Cards with Quiz ────────────────────────────── */}
      {step === 'BIN_CARDS_EDUCATION' && (
        <div className="pointer-events-auto max-w-md w-full p-6 rounded-3xl bg-slate-900/95 border-2 border-slate-800 shadow-2xl backdrop-blur space-y-5 animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${currentCard.badgeBg}`}>
              Card {activeCardIndex + 1} of 4 • {currentCard.colorName} Bin
            </span>
            <span className="text-xs font-mono text-slate-400">
              {activeCardIndex + 1}/4
            </span>
          </div>

          <div>
            <h3 className="text-lg font-black font-fun text-white">
              {currentCard.title}
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {currentCard.voiceText}
            </p>
          </div>

          {/* Examples Grid */}
          <div className="grid grid-cols-2 gap-2">
            {currentCard.examples.map((ex, i) => (
              <div
                key={i}
                className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center gap-2 text-xs text-slate-200"
              >
                <span className="text-base">{ex.icon}</span>
                <span className="font-medium text-[11px]">{ex.name}</span>
              </div>
            ))}
          </div>

          {/* Practice Question */}
          <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/80 space-y-2.5">
            <span className="text-[11px] font-bold text-sky-400 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              Practice Question
            </span>
            <p className="text-xs font-medium text-white">
              {currentCard.quiz.question}
            </p>

            {cardFeedback && (
              <div
                className={`p-2 rounded-xl text-[11px] font-semibold text-center ${
                  cardQuizAnswered
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {cardFeedback}
              </div>
            )}

            {!cardQuizAnswered ? (
              <div className="space-y-1.5">
                {currentCard.quiz.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswerCardQuiz(opt.isCorrect, currentCard.quiz.explanation)}
                    data-testid={`card-quiz-option-${idx}`}
                    className="w-full p-2.5 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-left text-[11px] text-slate-200 font-medium border border-slate-600/60 hover:border-sky-400 transition-colors"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            ) : (
              <button
                onClick={handleNextCard}
                data-testid="next-card-btn"
                className="tactile-btn w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-fun font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
              >
                <span>{activeCardIndex + 1 === BIN_CARDS.length ? 'FINISH MISSION 2' : 'NEXT BIN CARD'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── 5. Complete Mission 2 ───────────────────────────────────────────── */}
      {step === 'COMPLETE' && (
        <div className="pointer-events-auto max-w-md w-full p-6 rounded-3xl bg-slate-900/95 border-2 border-emerald-500/40 shadow-2xl backdrop-blur text-center space-y-5 animate-in fade-in zoom-in-95">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-xl font-black font-fun text-white tracking-wide">
              Mission 2 Complete!
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Dustbins installed and education cards mastered. Residents are now waiting to learn waste sorting habits from you.
            </p>
          </div>

          <button
            onClick={onComplete}
            data-testid="phase2-proceed-btn"
            className="tactile-btn w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-fun font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <span>PROCEED TO MISSION 3</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
