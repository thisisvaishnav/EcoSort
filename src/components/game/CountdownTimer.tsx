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
    // Dark-glass skin for the Meadows HUD — color signals urgency, no retro chrome
    const tone = isExpired
      ? 'border-slate-500/60 text-slate-400'
      : isUrgent
      ? 'border-rose-400/70 text-rose-300 animate-pulse'
      : isWarning
      ? 'border-amber-400/70 text-amber-300 animate-pulse'
      : 'border-teal-400/60 text-teal-200';

    return (
      <div
        className={`hud-glass flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 border font-fun font-black text-xs sm:text-sm ${tone}`}
        title={isExpired ? 'Time is up!' : `${timeLeft} seconds remaining`}
      >
        <Timer className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
        <span>{formatted}</span>
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
      className={`flex items-center gap-1 sm:gap-1.5 px-1.5 py-0.5 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl border border-slate-900 sm:border-2 shadow-retro-xs sm:shadow-retro-sm font-fun font-black text-[11px] sm:text-sm ${bg} ${textColor} ${pulse}`}
      title={isExpired ? 'Time is up!' : `${timeLeft} seconds remaining`}
    >
      <Timer className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
      <span>{formatted}</span>
    </div>
  );
};
