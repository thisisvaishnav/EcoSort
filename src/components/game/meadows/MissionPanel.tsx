import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Circle, CheckCircle2 } from 'lucide-react';
import { CountdownTimer } from '../CountdownTimer';

export interface MissionTask {
  id: string;
  label: string;
  done: boolean;
}

export interface MissionPanelProps {
  timeLeft: number;
  isWarning: boolean;
  isUrgent: boolean;
  isExpired: boolean;
  tasks: MissionTask[];
  defaultCollapsed?: boolean;
}

/**
 * MissionPanel — top-right glass card: countdown timer + mission checklist.
 * Collapses to a slim reopen tab on the right edge of the screen.
 */
export const MissionPanel: React.FC<MissionPanelProps> = ({
  timeLeft,
  isWarning,
  isUrgent,
  isExpired,
  tasks,
  defaultCollapsed = false,
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        title="Show mission"
        aria-label="Show mission"
        data-testid="mission-reopen"
        className="pointer-events-auto flex items-center justify-center w-8 h-16 sm:w-9 sm:h-20 rounded-l-2xl border-2 border-r-0 border-slate-900 bg-amber-300 hover:bg-amber-400 text-slate-950 font-fun font-black shadow-retro-sm transition-all active:translate-x-[1px]"
      >
        <ChevronLeft className="w-5 h-5 stroke-[3]" />
      </button>
    );
  }

  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <div
      className="pointer-events-auto relative rounded-3xl border-[2.5px] border-slate-900 bg-[#FDFBF7] px-3.5 py-3 sm:px-4 sm:py-3.5 w-[210px] sm:w-[260px] shadow-retro-md text-slate-900 animate-in zoom-in-95 duration-200"
      data-testid="mission-panel"
    >
      <button
        onClick={() => setCollapsed(true)}
        title="Hide mission"
        aria-label="Hide mission"
        data-testid="mission-collapse"
        className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-9 flex items-center justify-center bg-white hover:bg-slate-100 rounded-l-xl border-2 border-r-0 border-slate-900 text-slate-950 shadow-retro-xs transition-colors"
      >
        <ChevronRight className="w-4 h-4 stroke-[3]" />
      </button>

      <div className="flex items-center justify-between gap-2 mb-2.5">
        <span className="text-[11px] font-fun font-black uppercase tracking-wider text-slate-950">
          YOUR MISSION
        </span>
        <CountdownTimer
          timeLeft={timeLeft}
          isWarning={isWarning}
          isUrgent={isUrgent}
          isExpired={isExpired}
          variant="glass"
        />
      </div>

      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-fun font-black text-slate-700">
          {doneCount} / {tasks.length} done
        </span>
        <div className="h-2 flex-1 mx-2.5 rounded-full bg-slate-200 border border-slate-900/30 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-400 transition-all duration-500"
            style={{ width: `${tasks.length > 0 ? (doneCount / tasks.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      <ul className="space-y-1.5 pt-0.5">
        {tasks.map((task) => (
          <li key={task.id} className="flex items-center gap-2">
            {task.done ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 stroke-[2.5]" />
            ) : (
              <Circle className="w-4 h-4 shrink-0 text-slate-400 stroke-[2]" />
            )}
            <span
              className={`text-xs font-fun font-bold leading-snug ${
                task.done ? 'text-slate-400 line-through' : 'text-slate-950'
              }`}
            >
              {task.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
