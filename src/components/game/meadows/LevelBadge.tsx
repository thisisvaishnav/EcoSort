import React from 'react';
import { Leaf } from 'lucide-react';

export interface LevelBadgeProps {
  levelNumber: number;
  title: string;
}

/**
 * LevelBadge — dark glass pill with a glowing leaf and the level title.
 * Sits at the top-left of the Meadows HUD.
 */
export const LevelBadge: React.FC<LevelBadgeProps> = ({ levelNumber, title }) => (
  <div
    className="bg-[#FDFBF7] rounded-2xl border-2 border-slate-900 px-2.5 py-1.5 sm:px-3 sm:py-2 flex items-center gap-2 max-w-[170px] sm:max-w-none shadow-retro-xs text-slate-900"
    data-testid="level-badge"
  >
    <span className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-amber-300 border-2 border-slate-900 shadow-retro-2xs">
      <Leaf className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-emerald-800 stroke-[2.5]" />
    </span>
    <div className="leading-tight min-w-0">
      <div className="text-[9px] sm:text-[10px] font-fun font-black uppercase tracking-wider text-emerald-700">
        Level {levelNumber}
      </div>
      <div className="text-xs sm:text-sm font-fun font-black text-slate-950 truncate">{title}</div>
    </div>
  </div>
);
