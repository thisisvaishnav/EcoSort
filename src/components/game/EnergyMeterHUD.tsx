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
    <div className="bg-[#FDFBF7] border-2 border-slate-900 rounded-2xl p-3 md:p-4 shadow-retro text-slate-900">
      {/* Top Stats Bar */}
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <div className="bg-white border-2 border-slate-900 px-3 py-1.5 rounded-xl shadow-retro-sm">
          <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider block">
            {levelName}
          </span>
          <span className="text-sm font-fun font-black text-slate-900">
            Item {Math.min(itemsSorted + 1, targetCount)} / {targetCount}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Streak indicator */}
          {streak >= 2 && (
            <div className="flex items-center gap-1.5 bg-orange-400 text-slate-950 border-2 border-slate-900 px-3 py-1 rounded-xl text-xs font-fun font-black shadow-retro-sm animate-bounce">
              <Flame className="w-4 h-4 fill-amber-300 stroke-slate-950" />
              <span>{streak}x Streak!</span>
            </div>
          )}

          {/* Score Badge */}
          <div className="flex items-center gap-2 bg-amber-300 text-slate-950 px-3.5 py-1.5 rounded-xl border-2 border-slate-900 shadow-retro-sm">
            <Award className="w-4 h-4 text-slate-950" />
            <span className="font-fun font-black text-slate-950 text-sm md:text-base">
              {score} PTS
            </span>
          </div>
        </div>
      </div>

      {/* Energy Meter Progress */}
      <div className="space-y-1.5 bg-white p-2.5 rounded-xl border-2 border-slate-900 shadow-retro-sm">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-emerald-700 font-fun font-black">
            <Zap className="w-4 h-4 fill-emerald-500 stroke-slate-950" />
            <span>Clean Energy: {Math.round(energy)}%</span>
          </span>
          <span className="text-slate-600 font-bold text-[11px]">{getPowerStatus()}</span>
        </div>

        {/* Tactile Progress Bar */}
        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden p-0.5 border-2 border-slate-900 relative">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 via-amber-300 to-yellow-400 rounded-full border border-slate-900 transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(6, energy))}%` }}
          />
        </div>
      </div>
    </div>
  );
};
