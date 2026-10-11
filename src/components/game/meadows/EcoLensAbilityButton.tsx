import React from 'react';
import { Leaf } from 'lucide-react';
import { EcoLensState, getLensUsesRemaining } from '../../../systems/ecoLens';

export interface EcoLensAbilityButtonProps {
  lensState: EcoLensState;
  onActivate: () => void;
  disabled?: boolean;
  /** When true, button glows brightly to draw attention */
  glowing?: boolean;
  /** Optional hint text tooltip or bubble above button */
  hintText?: string | null;
}

const SEGMENTS = 5;

/**
 * EcoLensAbilityButton — circular glowing leaf button with a segmented
 * energy bar (one segment per remaining use). Bottom-right of the Meadows HUD.
 */
export const EcoLensAbilityButton: React.FC<EcoLensAbilityButtonProps> = ({
  lensState,
  onActivate,
  disabled = false,
  glowing = false,
  hintText = null,
}) => {
  const { energy, maxEnergy, cooldown, isActive } = lensState;
  const usesLeft = getLensUsesRemaining(lensState);
  const isOnCooldown = cooldown > 0;
  const canUse = !disabled && !isActive && !isOnCooldown && usesLeft > 0;

  const title = isOnCooldown
    ? `Eco Lens recharging (${Math.ceil(cooldown)}s)`
    : isActive
    ? 'Eco Lens active'
    : usesLeft === 0
    ? 'No Eco Lens energy left'
    : disabled
    ? 'Find waste to use Eco Lens'
    : `Use Eco Lens (${usesLeft} left)`;

  return (
    <div className="pointer-events-auto flex flex-col items-center gap-2 relative">
      {/* Tip bubble */}
      {hintText && (
        <div
          data-testid="lens-hint-bubble"
          className="absolute -top-16 right-0 max-w-xs px-3 py-1.5 rounded-xl bg-slate-900/95 border-2 border-teal-400 text-teal-200 text-xs font-fun font-bold shadow-[0_0_16px_rgba(45,212,191,0.5)] animate-bounce whitespace-nowrap z-40"
        >
          {hintText}
          <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-slate-900 border-r-2 border-b-2 border-teal-400 rotate-45" />
        </div>
      )}

      {/* Segmented energy bar */}
      <div
        className="flex items-center gap-0.5 sm:gap-1"
        role="progressbar"
        aria-label="Eco Lens energy"
        aria-valuemin={0}
        aria-valuemax={maxEnergy}
        aria-valuenow={energy}
        data-testid="lens-energy-bar"
      >
        {Array.from({ length: SEGMENTS }, (_, i) => {
          const filled = i < usesLeft;
          return (
            <span
              key={i}
              className={`h-1.5 sm:h-2 w-3.5 sm:w-5 rounded-sm border transition-all duration-300 ${
                filled
                  ? 'bg-teal-400 border-teal-300 shadow-[0_0_6px_rgba(45,212,191,0.7)]'
                  : 'bg-white/10 border-white/20'
              }`}
            />
          );
        })}
      </div>

      <button
        onClick={canUse ? onActivate : undefined}
        disabled={!canUse}
        title={title}
        aria-label={title}
        data-testid="eco-lens-button"
        className={`relative flex h-[52px] w-[52px] sm:h-[68px] sm:w-[68px] items-center justify-center rounded-full border-2 transition-all
          ${
            canUse
              ? 'border-teal-300/80 bg-teal-500/25 hover:bg-teal-500/40 active:scale-95'
              : 'border-white/20 bg-slate-950/50 cursor-not-allowed opacity-70'
          }
          ${isActive ? 'animate-pulse border-teal-300 bg-teal-500/40' : ''}
          ${glowing ? 'ring-3 sm:ring-4 ring-teal-400 ring-offset-2 sm:ring-offset-4 ring-offset-slate-950 shadow-[0_0_24px_rgba(45,212,191,0.9)] animate-pulse' : ''}
          ${canUse && !glowing ? 'shadow-[0_0_15px_rgba(45,212,191,0.45)]' : ''}
        `}
      >
        <Leaf
          className={`h-6 w-6 sm:h-8 sm:w-8 ${canUse || isActive || glowing ? 'text-teal-300' : 'text-white/40'}`}
          style={
            canUse || isActive || glowing
              ? { filter: 'drop-shadow(0 0 6px rgba(45, 212, 191, 0.95))' }
              : undefined
          }
        />
        {isOnCooldown && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 sm:h-6 sm:min-w-6 items-center justify-center rounded-full border border-teal-300/60 bg-slate-950/90 px-1 text-[9px] sm:text-[10px] font-fun font-black text-teal-200">
            {Math.ceil(cooldown)}s
          </span>
        )}
      </button>
    </div>
  );
};
