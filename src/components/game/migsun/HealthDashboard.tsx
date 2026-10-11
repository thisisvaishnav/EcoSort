import React from 'react';
import { ShieldCheck, ArrowRight, Info } from 'lucide-react';
import { audio } from '../../../services/audio';

interface HealthDashboardProps {
  cleanlinessScore: number;  // 0 - 100
  sortingAccuracy: number;   // 0 - 100
  preventionScore: number;   // 0 - 100
  onContinue: () => void;
}

export const HealthDashboard: React.FC<HealthDashboardProps> = ({
  cleanlinessScore,
  sortingAccuracy,
  preventionScore,
  onContinue,
}) => {
  const overallAverage = Math.round(
    (cleanlinessScore + sortingAccuracy + preventionScore) / 3
  );

  const getRank = (avg: number) => {
    if (avg >= 85) return { label: '⭐⭐⭐ ECO CHAMPION', color: 'text-emerald-700' };
    if (avg >= 70) return { label: '⭐⭐ GREEN GUARDIAN', color: 'text-amber-700' };
    return { label: '⭐ NATURE HERO', color: 'text-blue-700' };
  };

  const rank = getRank(overallAverage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#FDFBF7] border-4 border-slate-900 rounded-3xl p-6 sm:p-8 shadow-retro-xl text-slate-900 flex flex-col gap-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-300 border-2 border-slate-900 rounded-xl font-fun font-black text-xs uppercase shadow-retro-sm">
            <ShieldCheck className="w-4 h-4 text-slate-950" />
            <span>MIGSUN VILASA STATUS</span>
          </div>
          <h2 className="font-fun text-2xl sm:text-3xl font-black text-slate-950">
            Neighbourhood Health
          </h2>
          <p className="text-xs text-slate-600 font-bold">
            Track our progress restoring society grounds.
          </p>
        </div>

        {/* 3 Metric Gauges */}
        <div className="space-y-4">
          {/* Cleanliness */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-black uppercase">
              <span className="flex items-center gap-1.5">
                <span>🧹 Cleanliness</span>
              </span>
              <span>{cleanlinessScore}%</span>
            </div>
            <div className="h-4 bg-slate-200 rounded-full border-2 border-slate-900 overflow-hidden p-0.5">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, Math.max(5, cleanlinessScore))}%` }}
              />
            </div>
          </div>

          {/* Correct Sorting */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-black uppercase">
              <span className="flex items-center gap-1.5">
                <span>🗑️ Correct Sorting</span>
              </span>
              <span>{sortingAccuracy}%</span>
            </div>
            <div className="h-4 bg-slate-200 rounded-full border-2 border-slate-900 overflow-hidden p-0.5">
              <div
                className="h-full bg-blue-400 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, Math.max(5, sortingAccuracy))}%` }}
              />
            </div>
          </div>

          {/* Prevention */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-black uppercase">
              <span className="flex items-center gap-1.5">
                <span>🛡️ Prevention & Awareness</span>
              </span>
              <span>{preventionScore}%</span>
            </div>
            <div className="h-4 bg-slate-200 rounded-full border-2 border-slate-900 overflow-hidden p-0.5">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, Math.max(5, preventionScore))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Overall Rank Card */}
        <div className="p-4 bg-amber-100 border-2 border-slate-900 rounded-2xl flex items-center justify-between shadow-retro-sm">
          <div>
            <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider">
              OVERALL RATING
            </span>
            <h3 className={`font-fun font-black text-lg ${rank.color}`}>{rank.label}</h3>
          </div>
          <span className="text-3xl font-fun font-black text-slate-950">{overallAverage}%</span>
        </div>

        {/* Legal / Anshu Requirement Note */}
        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-bold bg-slate-100 p-2.5 rounded-xl border border-slate-300">
          <Info className="w-4 h-4 flex-shrink-0 text-slate-600" />
          <span>Note: These are game scores, not real measurements.</span>
        </div>

        {/* Continue to Teach Resident */}
        <button
          onClick={() => {
            audio.playCelebration();
            onContinue();
          }}
          className="w-full py-3.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-fun font-black text-sm rounded-2xl border-2 border-slate-900 shadow-retro-md inline-flex items-center justify-center gap-2 active:translate-x-0.5 active:translate-y-0.5"
        >
          <span>Continue to Mission 3: Teach Residents</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};
