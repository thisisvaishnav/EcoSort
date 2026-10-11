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
        className="hud-glass pointer-events-auto flex items-center justify-center w-7 h-16 sm:w-9 sm:h-24 rounded-l-xl border border-r-0 border-teal-400/60 text-teal-300 transition-all active:translate-x-[1px] shadow-sm"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    );
  }

  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <div
      className="hud-glass pointer-events-auto relative rounded-xl sm:rounded-2xl border border-teal-400/60 px-2.5 py-2 sm:px-3.5 sm:py-3 w-[185px] sm:w-[240px] shadow-sm"
      data-testid="mission-panel"
    >
      <button
        onClick={() => setCollapsed(true)}
        title="Hide mission"
        aria-label="Hide mission"
        data-testid="mission-collapse"
        className="absolute -left-2.5 sm:-left-3 top-1/2 -translate-y-1/2 w-5 h-8 sm:w-6 sm:h-10 flex items-center justify-center hud-glass rounded-l-lg border border-r-0 border-teal-400/60 text-teal-300"
      >
        <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>

      <div className="flex items-center justify-between gap-2 mb-2.5">
        <span className="text-[10px] font-fun font-black uppercase tracking-widest text-teal-300/90">
          Your Mission
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
        <span className="text-[11px] font-fun font-bold text-white/80">
          {doneCount} / {tasks.length} done
        </span>
        <div className="h-1.5 flex-1 mx-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-400 to-emerald-400 transition-all duration-500"
            style={{ width: `${tasks.length > 0 ? (doneCount / tasks.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      <ul className="space-y-1.5">
        {tasks.map((task) => (
          <li key={task.id} className="flex items-center gap-2">
            {task.done ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <Circle className="w-4 h-4 shrink-0 text-white/35" />
            )}
            <span
              className={`text-[11px] font-fun font-bold leading-tight ${
                task.done ? 'text-emerald-300 line-through' : 'text-white/85'
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
