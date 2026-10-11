import React from 'react';
import { Leaf } from 'lucide-react';
import { EcoLensState, getLensUsesRemaining } from '../../../systems/ecoLens';

export interface EcoLensAbilityButtonProps {
  lensState: EcoLensState;
  onActivate: () => void;
  disabled?: boolean;
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
    <div className="pointer-events-auto flex flex-col items-center gap-2">
      {/* Segmented energy bar */}
      <div
        className="flex items-center gap-1"
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
              className={`h-2 w-5 rounded-sm border transition-all duration-300 ${
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
        className={`relative flex h-[68px] w-[68px] items-center justify-center rounded-full border-2 transition-all
          ${
            canUse
              ? 'border-teal-300/80 bg-teal-500/25 hover:bg-teal-500/40 active:scale-95'
              : 'border-white/20 bg-slate-950/50 cursor-not-allowed opacity-70'
          }
          ${isActive ? 'animate-pulse border-teal-300 bg-teal-500/40' : ''}
          ${canUse ? 'shadow-[0_0_18px_rgba(45,212,191,0.45)]' : ''}
        `}
      >
        <Leaf
          className={`h-8 w-8 ${canUse || isActive ? 'text-teal-300' : 'text-white/40'}`}
          style={
            canUse || isActive
              ? { filter: 'drop-shadow(0 0 8px rgba(45, 212, 191, 0.95))' }
              : undefined
          }
        />
        {isOnCooldown && (
          <span className="absolute -top-1 -right-1 flex h-6 min-w-6 items-center justify-center rounded-full border border-teal-300/60 bg-slate-950/90 px-1 text-[10px] font-fun font-black text-teal-200">
            {Math.ceil(cooldown)}s
          </span>
        )}
      </button>
    </div>
  );
};
