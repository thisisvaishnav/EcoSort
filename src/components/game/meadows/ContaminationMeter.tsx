import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface ContaminationMeterProps {
  contaminationLevel: number; // 0, 1, 2, 3
  maxLevel?: number; // default 3
}

import { RetroMeter } from '../../ui';

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
    <div className="w-full max-w-[210px] sm:max-w-[260px]">
      <RetroMeter
        data-testid="contamination-meter"
        fillTestId="contamination-fill"
        label="Contamination"
        valueText={statusText}
        percentage={percentage}
        barColor={colorStyle}
        icon={<AlertCircle className="w-3.5 h-3.5 text-amber-500 stroke-[2.5]" />}
      />
    </div>
  );
};
