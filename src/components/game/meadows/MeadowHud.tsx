import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { EcoLensState } from '../../../systems/ecoLens';
import { LevelBadge } from './LevelBadge';
import { NarrativeBanner, NarrativeToken } from './NarrativeBanner';
import { MissionPanel, MissionTask } from './MissionPanel';
import { VirtualJoystick } from './VirtualJoystick';
import { EcoLensAbilityButton } from './EcoLensAbilityButton';

export interface MeadowHudProps {
  levelNumber: number;
  levelTitle: string;
  narrative: NarrativeToken[];
  timeLeft: number;
  isWarning: boolean;
  isUrgent: boolean;
  isExpired: boolean;
  tasks: MissionTask[];
  lensState: EcoLensState;
  onActivateLens: () => void;
  lensDisabled?: boolean;
  /** Touch devices only — hides the stick on desktop. */
  showJoystick?: boolean;
  onJoystickMove?: (x: number, y: number) => void;
  onExit?: () => void;
}

/**
 * MeadowHud — dark-glass overlay for the Green Meadows world.
 * Root is click-through; interactive children opt back in.
 */
export const MeadowHud: React.FC<MeadowHudProps> = ({
  levelNumber,
  levelTitle,
  narrative,
  timeLeft,
  isWarning,
  isUrgent,
  isExpired,
  tasks,
  lensState,
  onActivateLens,
  lensDisabled = false,
  showJoystick = false,
  onJoystickMove,
  onExit,
}) => (
  <div className="absolute inset-0 z-30 pointer-events-none" data-testid="meadow-hud">
    {/* Top-left: exit + level badge */}
    <div className="absolute top-2 sm:top-3 left-3 flex items-center gap-2">
      {onExit && (
        <button
          onClick={onExit}
          title="Exit to menu"
          aria-label="Exit to menu"
          className="hud-glass pointer-events-auto flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-white/90 transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
      )}
      <LevelBadge levelNumber={levelNumber} title={levelTitle} />
    </div>

    {/* Top-center: narrative */}
    <div className="absolute top-2 sm:top-3 left-1/2 -translate-x-1/2 hidden sm:block">
      <NarrativeBanner tokens={narrative} />
    </div>

    {/* Top-right: timer + mission checklist */}
    <div className="absolute top-2 sm:top-3 right-3">
      <MissionPanel
        timeLeft={timeLeft}
        isWarning={isWarning}
        isUrgent={isUrgent}
        isExpired={isExpired}
        tasks={tasks}
        defaultCollapsed={showJoystick}
      />
    </div>

    {/* Bottom-left: movement joystick (touch only) */}
    {showJoystick && onJoystickMove && (
      <div className="absolute bottom-5 left-5">
        <VirtualJoystick onMove={onJoystickMove} />
      </div>
    )}

    {/* Bottom-right: Eco Lens ability */}
    <div className="absolute bottom-5 right-5">
      <EcoLensAbilityButton
        lensState={lensState}
        onActivate={onActivateLens}
        disabled={lensDisabled}
      />
    </div>
  </div>
);
