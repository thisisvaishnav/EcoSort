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
    className="hud-glass rounded-xl sm:rounded-2xl border border-teal-400/60 px-2 py-1 sm:px-3 sm:py-2 flex items-center gap-1.5 sm:gap-2.5 max-w-[140px] sm:max-w-none shadow-sm"
    data-testid="level-badge"
  >
    <span className="flex h-6 w-6 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-teal-500/20">
      <Leaf
        className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-teal-300"
        style={{ filter: 'drop-shadow(0 0 6px rgba(45, 212, 191, 0.9))' }}
      />
    </span>
    <div className="leading-tight min-w-0">
      <div className="text-[9px] sm:text-[10px] font-fun font-black uppercase tracking-wider text-teal-300/90">
        Lvl {levelNumber}
      </div>
      <div className="text-[11px] sm:text-xs font-fun font-black text-white truncate">{title}</div>
    </div>
  </div>
);
