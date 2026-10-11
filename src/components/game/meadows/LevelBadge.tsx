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
    className="hud-glass rounded-2xl border border-teal-400/60 px-3 py-2 flex items-center gap-2.5"
    data-testid="level-badge"
  >
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-500/20">
      <Leaf
        className="h-5 w-5 text-teal-300"
        style={{ filter: 'drop-shadow(0 0 6px rgba(45, 212, 191, 0.9))' }}
      />
    </span>
    <div className="leading-tight min-w-0">
      <div className="text-[10px] font-fun font-black uppercase tracking-widest text-teal-300/90">
        Level {levelNumber}
      </div>
      <div className="text-xs font-fun font-black text-white truncate">{title}</div>
    </div>
  </div>
);
