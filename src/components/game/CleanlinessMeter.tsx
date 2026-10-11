import React from 'react';
import { Sparkles } from 'lucide-react';

interface CleanlinessMeterProps {
  collected: number;
  total: number;
}

/**
 * CleanlinessMeter — shows how much of the society has been cleaned up.
 * Formula: (collected / total) × 100
 */
export const CleanlinessMeter: React.FC<CleanlinessMeterProps> = ({ collected, total }) => {
  const pct = total > 0 ? Math.round((collected / total) * 100) : 0;

  let barColor = 'bg-rose-500';
  if (pct >= 80) barColor = 'bg-emerald-500';
  else if (pct >= 50) barColor = 'bg-amber-400';
  else if (pct >= 25) barColor = 'bg-orange-500';

  return (
    <div
      className="flex items-center gap-1 sm:gap-1.5 bg-[#FDFBF7]/95 border-2 border-slate-900 rounded-lg sm:rounded-xl px-1.5 py-0.5 sm:px-2 sm:py-1 shadow-retro-xs"
      title={`Society cleanliness: ${pct}%`}
    >
      <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600 shrink-0" />
      <div className="flex flex-col gap-0.5 min-w-[38px] sm:min-w-[50px]">
        <span className="text-[9px] sm:text-[10px] font-fun font-black text-slate-700 leading-none">
          Clean {pct}%
        </span>
        <div className="w-10 sm:w-12 h-1.5 sm:h-2 bg-slate-200 rounded-full overflow-hidden border border-slate-400">
          <div
            className={`h-full ${barColor} rounded-full transition-all duration-500`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <span className="text-[9px] sm:text-[10px] font-fun font-black text-slate-600">
        {collected}/{total}
      </span>
    </div>
  );
};
