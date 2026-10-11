import React from 'react';
import { Sparkles, Lock, ArrowRight } from 'lucide-react';

interface MissionSelectPanelProps {
  completedMissions: number[]; // e.g. [1, 2]
  onSelectMission: (missionId: number) => void;
}

export const MissionSelectPanel: React.FC<MissionSelectPanelProps> = ({
  completedMissions,
  onSelectMission,
}) => {
  const missions = [
    {
      id: 1,
      title: 'Clean the Waste',
      icon: '🧹',
      badge: 'Mission 1',
      description: 'Sort scattered waste piles before the garbage truck arrives.',
      unlocked: true,
    },
    {
      id: 2,
      title: 'Install Dustbins',
      icon: '🗑️',
      badge: 'Mission 2',
      description: 'Choose the best spot for bins and learn what goes inside.',
      unlocked: completedMissions.includes(1),
    },
    {
      id: 3,
      title: 'Teach Residents',
      icon: '📚',
      badge: 'Mission 3',
      description: 'Help neighbours segregate correctly to protect nature.',
      unlocked: completedMissions.includes(2),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#FDFBF7] border-4 border-slate-900 rounded-3xl p-6 sm:p-8 shadow-retro-xl text-slate-900 flex flex-col gap-6">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-300 border-2 border-slate-900 rounded-xl font-fun font-black text-xs uppercase shadow-retro-sm">
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>MIGSUN VILASA MISSIONS</span>
          </div>
          <h2 className="font-fun text-2xl sm:text-3xl font-black text-slate-950">
            Choose Your Goal
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Complete each mission to restore our residential society.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {missions.map((m) => {
            const isCompleted = completedMissions.includes(m.id);
            return (
              <div
                key={m.id}
                className={`p-5 rounded-2xl border-3 border-slate-900 flex flex-col justify-between gap-4 transition-all ${
                  !m.unlocked
                    ? 'bg-slate-200/60 opacity-60'
                    : isCompleted
                    ? 'bg-emerald-100/80 shadow-retro-sm'
                    : 'bg-white hover:bg-amber-50 shadow-retro-md'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{m.icon}</span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border border-slate-900 bg-amber-200">
                      {m.badge}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-fun font-black text-base text-slate-900">{m.title}</h3>
                    <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                      {m.description}
                    </p>
                  </div>
                </div>

                {m.unlocked ? (
                  <button
                    onClick={() => onSelectMission(m.id)}
                    className="w-full py-2.5 px-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-fun font-black text-xs rounded-xl border-2 border-slate-900 shadow-retro-sm inline-flex items-center justify-center gap-1.5 active:translate-x-0.5 active:translate-y-0.5"
                  >
                    <span>{isCompleted ? 'Replay' : 'Start'}</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                ) : (
                  <div className="w-full py-2 px-3 bg-slate-300 text-slate-600 font-fun font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-1">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Locked</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
