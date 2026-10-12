import React from 'react';

export interface RetroMeterProps {
  label: string;
  valueText?: string;
  percentage: number;
  barColor?: string;
  icon?: React.ReactNode;
  className?: string;
  'data-testid'?: string;
  fillTestId?: string;
}

export const RetroMeter: React.FC<RetroMeterProps> = ({
  label,
  valueText,
  percentage,
  barColor = 'bg-emerald-400',
  icon,
  className = '',
  'data-testid': testId,
  fillTestId,
}) => {
  const clampedPct = Math.min(100, Math.max(0, percentage));

  return (
    <div
      data-testid={testId}
      className={`pointer-events-auto rounded-2xl px-3 py-2 border-2 border-slate-900 bg-[#FDFBF7] flex flex-col gap-1.5 shadow-retro-xs text-slate-900 ${className}`.trim()}
    >
      <div className="flex items-center justify-between text-[11px] font-fun font-black uppercase tracking-wider text-slate-950">
        <span className="flex items-center gap-1.5">
          {icon}
          {label}
        </span>
        {valueText && (
          <span className="text-slate-950 font-mono font-bold text-xs">{valueText}</span>
        )}
      </div>

      <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden border border-slate-900/30">
        <div
          data-testid={fillTestId}
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${clampedPct}%` }}
        />
      </div>
    </div>
  );
};
