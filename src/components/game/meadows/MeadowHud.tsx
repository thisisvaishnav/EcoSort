import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { EcoLensState } from '../../../systems/ecoLens';
import { LevelBadge } from './LevelBadge';
import { NarrativeBanner, NarrativeToken } from './NarrativeBanner';
import { MissionPanel, MissionTask } from './MissionPanel';
import { VirtualJoystick } from './VirtualJoystick';
import { EcoLensAbilityButton } from './EcoLensAbilityButton';
import { ContaminationMeter } from './ContaminationMeter';
import { Hand } from 'lucide-react';

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
  /** Phase 1 & 2 guides */
  joystickPulsing?: boolean;
  lensGlowing?: boolean;
  lensHintText?: string | null;
  instructionBanner?: string | null;
  narratorSpeech?: string | null;
  onSkipIntro?: () => void;
  /** Phase 5: Sorting Challenge */
  contaminationLevel?: number;
  nearbyItemName?: string | null;
  onPickupItem?: () => void;
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
  joystickPulsing = false,
  lensGlowing = false,
  lensHintText = null,
  instructionBanner = null,
  narratorSpeech = null,
  onSkipIntro,
  contaminationLevel = 0,
  nearbyItemName = null,
  onPickupItem,
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

    {/* Top-center: narrative or instruction banner */}
    <div className="absolute top-2 sm:top-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
      {instructionBanner ? (
        <div
          data-testid="instruction-banner"
          className="hud-glass pointer-events-auto rounded-2xl px-5 py-2.5 max-w-[85vw] sm:max-w-lg border border-emerald-400/80 shadow-[0_0_20px_rgba(52,211,153,0.35)] animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <div className="flex items-center gap-2 text-xs sm:text-sm font-fun font-black text-emerald-300">
            <span className="text-base animate-bounce">👉</span>
            <span>{instructionBanner}</span>
          </div>
        </div>
      ) : (
        <div className="hidden sm:block">
          <NarrativeBanner tokens={narrative} />
        </div>
      )}

      {/* Narrator Voice Speech Banner / Subtitle */}
      {narratorSpeech && (
        <div
          data-testid="narrator-speech"
          className="pointer-events-auto relative rounded-2xl bg-slate-950/85 backdrop-blur-md border-2 border-teal-400 px-4 py-2.5 max-w-[90vw] sm:max-w-xl text-center shadow-2xl animate-in fade-in zoom-in-95 duration-300"
        >
          <div className="text-[10px] font-fun font-bold uppercase tracking-widest text-teal-300/90 mb-0.5">
            Narrator
          </div>
          <p className="text-xs sm:text-sm font-fun font-bold text-white leading-relaxed">
            "{narratorSpeech}"
          </p>
          {onSkipIntro && (
            <button
              onClick={onSkipIntro}
              className="mt-1.5 px-2.5 py-0.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-[10px] font-fun font-bold text-teal-200 border border-teal-400/50 transition-all pointer-events-auto"
            >
              Skip Intro ⏩
            </button>
          )}
        </div>
      )}
    </div>

    {/* Top-right: timer + mission checklist + contamination meter */}
    <div className="absolute top-2 sm:top-3 right-3 flex flex-col items-end gap-2">
      <MissionPanel
        timeLeft={timeLeft}
        isWarning={isWarning}
        isUrgent={isUrgent}
        isExpired={isExpired}
        tasks={tasks}
        defaultCollapsed={showJoystick}
      />
      {contaminationLevel > 0 && (
        <ContaminationMeter contaminationLevel={contaminationLevel} />
      )}
    </div>

    {/* Center-bottom Interaction Prompt: Pick Up Item */}
    {nearbyItemName && onPickupItem && (
      <div className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 pointer-events-auto animate-in zoom-in-95 fade-in duration-200">
        <button
          onClick={onPickupItem}
          data-testid="pickup-item-btn"
          className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-fun font-black text-sm shadow-[0_0_25px_rgba(16,185,129,0.5)] border-2 border-emerald-300 transform active:scale-95 transition-all"
        >
          <Hand className="w-5 h-5 animate-pulse text-slate-950" />
          <span>Pick up {nearbyItemName}</span>
        </button>
      </div>
    )}

    {/* Bottom-left: movement joystick (touch only) */}
    {showJoystick && onJoystickMove && (
      <div className="absolute bottom-5 left-5">
        <VirtualJoystick onMove={onJoystickMove} pulsing={joystickPulsing} />
      </div>
    )}

    {/* Bottom-right: Eco Lens ability */}
    <div className="absolute bottom-5 right-5">
      <EcoLensAbilityButton
        lensState={lensState}
        onActivate={onActivateLens}
        disabled={lensDisabled}
        glowing={lensGlowing}
        hintText={lensHintText}
      />
    </div>
  </div>
);
