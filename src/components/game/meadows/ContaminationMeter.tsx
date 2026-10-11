import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface ContaminationMeterProps {
  contaminationLevel: number; // 0, 1, 2, 3
  maxLevel?: number; // default 3
}

export const ContaminationMeter: React.FC<ContaminationMeterProps> = ({
  contaminationLevel,
  maxLevel = 3,
}) => {
  const percentage = Math.min(100, Math.max(0, (contaminationLevel / maxLevel) * 100));

  let colorStyle = 'bg-emerald-400';
  let statusText = 'Clean (0/3)';
  if (contaminationLevel === 1) {
    colorStyle = 'bg-amber-400';
    statusText = 'Low (1/3)';
  } else if (contaminationLevel === 2) {
    colorStyle = 'bg-orange-500';
    statusText = 'High (2/3)';
  } else if (contaminationLevel >= 3) {
    colorStyle = 'bg-rose-500 animate-pulse';
    statusText = 'Critical (3/3)';
  }

  return (
    <div
      data-testid="contamination-meter"
      className="pointer-events-auto rounded-2xl px-3 py-2 border-2 border-slate-900 bg-[#FDFBF7] flex flex-col gap-1.5 w-full max-w-[210px] sm:max-w-[260px] shadow-retro-xs text-slate-900"
    >
      <div className="flex items-center justify-between text-[11px] font-fun font-black uppercase tracking-wider text-slate-950">
        <span className="flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-amber-500 stroke-[2.5]" />
          Contamination
        </span>
        <span className="text-slate-950 font-mono font-bold text-xs">{statusText}</span>
      </div>

      <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden border border-slate-900/30">
        <div
          data-testid="contamination-fill"
          className={`h-full rounded-full transition-all duration-300 ${colorStyle}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
