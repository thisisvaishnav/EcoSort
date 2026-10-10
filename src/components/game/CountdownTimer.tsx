import React from 'react';
import { Timer } from 'lucide-react';

interface CountdownTimerProps {
  timeLeft: number;    // seconds
  isWarning: boolean;  // 30s or fewer
  isUrgent: boolean;   // 10s or fewer
  isExpired: boolean;
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
}) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formatted = `${minutes}:${String(seconds).padStart(2, '0')}`;

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
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-slate-900 shadow-retro-sm font-fun font-black text-sm ${bg} ${textColor} ${pulse}`}
      title={isExpired ? 'Time is up!' : `${timeLeft} seconds remaining`}
    >
      <Timer className="w-4 h-4" />
      <span>{formatted}</span>
    </div>
  );
};
