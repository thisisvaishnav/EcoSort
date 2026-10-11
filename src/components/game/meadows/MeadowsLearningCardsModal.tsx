import React, { useState } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  Flame,
  Droplets,
  Sparkles,
  ArrowRight,
  Home,
  Check,
} from 'lucide-react';

export interface LearningCardData {
  id: string;
  badge: string;
  title: string;
  description: string;
  bullets?: string[];
  icon: React.ReactNode;
  theme: 'emerald' | 'amber' | 'rose' | 'blue' | 'purple';
}

export interface MeadowsLearningCardsModalProps {
  isOpen: boolean;
  sortedCount: number;
  totalCount: number;
  onFinish: () => void;
}

export const MEADOWS_LEARNING_CARDS: (sortedCount: number, totalCount: number) => LearningCardData[] = (
  sortedCount,
  totalCount
) => [
  {
    id: 'card-1',
    badge: 'Card 1 of 6 • Achievement',
    title: 'What You Just Did',
    description: `You sorted ${sortedCount} of ${totalCount} items correctly. Waste sorting protects your neighborhood.`,
    bullets: [
      'Wet waste turns into rich soil compost.',
      'Dry waste goes to recycling factories.',
      'Hazardous waste gets safe disposal.',
    ],
    icon: <CheckCircle className="w-8 h-8 text-emerald-400" />,
    theme: 'emerald',
  },
  {
    id: 'card-2',
    badge: 'Card 2 of 6 • Science',
    title: 'Why Mixing Waste Is Bad',
    description: 'Mixed waste cannot be recycled or composted easily.',
    bullets: [
      'Wet food waste damages dry paper.',
      'Wet paper cannot be recycled.',
      'Dangerous chemicals in batteries poison organic waste.',
    ],
    icon: <AlertTriangle className="w-8 h-8 text-amber-400" />,
    theme: 'amber',
  },
  {
    id: 'card-3',
    badge: 'Card 3 of 6 • Health Impact',
    title: 'Disease from Waste Piles',
    description: 'Piles of waste collect dirty water and attract pests.',
    bullets: [
      'Mosquitoes breed in open cans and plastic bottles.',
      'Mosquitoes cause dengue and malaria fever.',
      'Flies and rats carry dirt and disease germs.',
    ],
    icon: <Droplets className="w-8 h-8 text-rose-400" />,
    theme: 'rose',
  },
  {
    id: 'card-4',
    badge: 'Card 4 of 6 • Environment',
    title: 'Health and Nature Risks',
    description: 'Unsorted waste harms clean water, clean air, and living trees.',
    bullets: [
      'Burning waste makes thick smoke that harms breathing.',
      'Rotting waste pollutes fresh underground water.',
      'Broken glass causes injury to hands and feet.',
    ],
    icon: <Flame className="w-8 h-8 text-amber-500" />,
    theme: 'amber',
  },
  {
    id: 'card-5',
    badge: 'Card 5 of 6 • Journey',
    title: 'Where Does the Waste Go?',
    description: 'Each sorted stream travels to a dedicated recovery center.',
    bullets: [
      '🟢 Green bin waste goes to local compost beds.',
      '🔵 Blue bin waste goes to recycling factories.',
      '🔴 Red bin waste goes to hazardous treatment plants.',
      '⚫ Black bin waste goes to safe sanitary storage.',
    ],
    icon: <Sparkles className="w-8 h-8 text-blue-400" />,
    theme: 'blue',
  },
  {
    id: 'card-6',
    badge: 'Card 6 of 6 • Action',
    title: 'Take Action at Home',
    description: 'Sort your waste at home every day.',
    bullets: [
      'Use a green bin for food scraps.',
      'Use a blue bin for clean paper and plastic.',
      'Tell your friends to separate their waste.',
    ],
    icon: <Home className="w-8 h-8 text-emerald-400" />,
    theme: 'emerald',
  },
];

export const MeadowsLearningCardsModal: React.FC<MeadowsLearningCardsModalProps> = ({
  isOpen,
  sortedCount,
  totalCount,
  onFinish,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen) return null;

  const cards = MEADOWS_LEARNING_CARDS(sortedCount, totalCount);
  const currentCard = cards[currentIndex];
  const isLast = currentIndex === cards.length - 1;

  const handleNext = () => {
    if (isLast) {
      onFinish();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  return (
    <div
      data-testid="meadows-learning-modal"
      className="fixed inset-0 z-50 pointer-events-auto flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-300"
    >
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-2xl text-white flex flex-col gap-4 animate-in zoom-in-95 duration-250">
        {/* Top Progress Indicators */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-1.5">
            {cards.map((c, idx) => (
              <div
                key={c.id}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? 'w-8 bg-emerald-400'
                    : idx < currentIndex
                    ? 'w-4 bg-emerald-600/70'
                    : 'w-4 bg-slate-700'
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] font-fun font-bold text-slate-400 uppercase tracking-wider">
            {currentCard.badge}
          </span>
        </div>

        {/* Card Content Header */}
        <div className="flex items-start gap-4 pt-1">
          <div className="p-3 rounded-2xl bg-slate-800 border border-slate-700 shadow-md shrink-0">
            {currentCard.icon}
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-fun font-bold text-white tracking-tight">
              {currentCard.title}
            </h3>
            <p className="text-xs sm:text-sm font-sans text-slate-300 mt-1 leading-relaxed">
              {currentCard.description}
            </p>
          </div>
        </div>

        {/* Bullets List */}
        {currentCard.bullets && (
          <div className="bg-slate-950/50 rounded-2xl p-4 border border-slate-800 flex flex-col gap-2.5 my-1">
            {currentCard.bullets.map((bullet, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                <span className="text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
                <span className="leading-snug">{bullet}</span>
              </div>
            ))}
          </div>
        )}

        {/* Bottom CTA Button */}
        <div className="pt-2 flex items-center justify-end">
          <button
            onClick={handleNext}
            data-testid="learning-card-next-btn"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-fun font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-95 transition-all cursor-pointer"
          >
            <span>{isLast ? 'View Results' : 'Next Fact'}</span>
            {isLast ? <Check className="w-4 h-4 stroke-[3]" /> : <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
