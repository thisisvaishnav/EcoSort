import React from 'react';
import { Timer } from 'lucide-react';

interface CountdownTimerProps {
  timeLeft: number;    // seconds
  isWarning: boolean;  // 30s or fewer
  isUrgent: boolean;   // 10s or fewer
  isExpired: boolean;
  /** 'retro' (default) keeps the Level 1 tactile pill; 'glass' fits the dark Meadows HUD. */
  variant?: 'retro' | 'glass';
}

/**
 * CountdownTimer — HUD component for the Waste Detective level.
 * Displays MM:SS with color states and pulse animations.
 */
export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  timeLeft,
  isWarning,
  isUrgent,
  isExpired,
  variant = 'retro',
}) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formatted = `${minutes}:${String(seconds).padStart(2, '0')}`;

  if (variant === 'glass') {
    // Retro landing page skin with urgency states
    const tone = isExpired
      ? 'bg-slate-200 text-slate-500 border-slate-900'
      : isUrgent
      ? 'bg-rose-400 text-slate-950 border-slate-900 animate-pulse'
      : isWarning
      ? 'bg-amber-300 text-slate-950 border-slate-900 animate-pulse'
      : 'bg-emerald-400 text-slate-950 border-slate-900';

    return (
      <div
        className={`flex items-center gap-1.5 rounded-2xl px-3 py-1.5 border-2 shadow-retro-xs font-fun font-black text-xs sm:text-sm ${tone}`}
        title={isExpired ? 'Time is up!' : `${timeLeft} seconds remaining`}
      >
        <Timer className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-slate-950 stroke-[2.5]" />
        <span className="font-mono tracking-tight">{formatted}</span>
      </div>
    );
  }

  let bg = 'bg-emerald-500';
  let textColor = 'text-white';
  let pulse = '';

  if (isExpired) {
    bg = 'bg-slate-700';
    textColor = 'text-slate-300';
  } else if (isUrgent) {
    bg = 'bg-rose-600';
    textColor = 'text-white';
    pulse = 'animate-pulse';
  } else if (isWarning) {
    bg = 'bg-amber-500';
    textColor = 'text-white';
    pulse = 'animate-pulse';
  }

  return (
    <div
      className={`flex items-center gap-1 sm:gap-1.5 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg border border-slate-900 shadow-retro-xs font-fun font-black text-[10px] sm:text-xs ${bg} ${textColor} ${pulse}`}
      title={isExpired ? 'Time is up!' : `${timeLeft} seconds remaining`}
    >
      <Timer className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 shrink-0" />
      <span>{formatted}</span>
    </div>
  );
};
