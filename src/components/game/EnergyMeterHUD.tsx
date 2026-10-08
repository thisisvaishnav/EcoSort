import React from 'react';
import { Zap, Flame, Award } from 'lucide-react';

interface EnergyMeterHUDProps {
  score: number;
  streak: number;
  energy: number; // 0 to 100
  itemsSorted: number;
  targetCount: number;
  levelName: string;
}

export const EnergyMeterHUD: React.FC<EnergyMeterHUDProps> = ({
  score,
  streak,
  energy,
  itemsSorted,
  targetCount,
  levelName,
}) => {
  const getPowerStatus = () => {
    if (energy >= 90) return 'Town at Full Power! ⚡️';
    if (energy >= 50) return 'Town Lights are Glowing 💡';
    if (energy >= 20) return 'Generators Warming Up 🔌';
    return 'Town Needs Clean Power 🌙';
  };

  return (
    <div className="bg-slate-800/95 border border-slate-700/80 rounded-2xl p-3 md:p-4 shadow-xl backdrop-blur-md">
      {/* Top Stats Bar */}
      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
        <div>
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
            {levelName}
          </span>
          <span className="text-sm font-fun font-bold text-slate-100">
            Item {Math.min(itemsSorted + 1, targetCount)} of {targetCount}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Streak indicator */}
          {streak >= 2 && (
            <div className="flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-xl text-xs font-fun font-bold animate-bounce">
              <Flame className="w-4 h-4 fill-amber-400" />
              <span>{streak}x Streak!</span>
            </div>
          )}

          {/* Score Badge */}
          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700">
            <Award className="w-4 h-4 text-yellow-400" />
            <span className="font-fun font-bold text-yellow-400 text-sm md:text-base">
              {score} pts
            </span>
          </div>
        </div>
      </div>

      {/* Energy Meter Progress */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <Zap className="w-3.5 h-3.5 fill-emerald-400" />
            <span>Energy Meter: {Math.round(energy)}%</span>
          </span>
          <span className="text-slate-400 text-[11px]">{getPowerStatus()}</span>
        </div>

        {/* Bar */}
        <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-700">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-yellow-400 rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${Math.min(100, Math.max(5, energy))}%` }}
          />
        </div>
      </div>
    </div>
  );
};
