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
      className="hud-glass pointer-events-auto rounded-xl px-3 py-1.5 border border-slate-700/60 flex flex-col gap-1 w-full max-w-[210px] sm:max-w-[240px] shadow-sm backdrop-blur-md"
    >
      <div className="flex items-center justify-between text-[10px] font-fun font-bold uppercase tracking-wider text-slate-300">
        <span className="flex items-center gap-1">
          <AlertCircle className="w-3 h-3 text-amber-400" />
          Contamination
        </span>
        <span className="text-white/90 font-mono">{statusText}</span>
      </div>

      <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50">
        <div
          data-testid="contamination-fill"
          className={`h-full rounded-full transition-all duration-300 ${colorStyle}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
