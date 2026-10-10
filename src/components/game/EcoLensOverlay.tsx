import React, { useEffect } from 'react';
import { Scan } from 'lucide-react';
import { EcoLensState } from '../../systems/ecoLens';
import { ALL_BINS } from '../../data/bins';

interface EcoLensOverlayProps {
  lensState: EcoLensState;
  itemName: string;
  onDeactivate: () => void;
}

/**
 * EcoLensOverlay — full-screen teal tint + hint label when Eco Lens is active.
 * Auto-deactivates after 3 seconds.
 */
export const EcoLensOverlay: React.FC<EcoLensOverlayProps> = ({
  lensState,
  itemName,
  onDeactivate,
}) => {
  const { isActive, activeBinType } = lensState;

  // Auto-deactivate after 3 seconds
  useEffect(() => {
    if (!isActive) return;
    const timer = setTimeout(onDeactivate, 3000);
    return () => clearTimeout(timer);
  }, [isActive, onDeactivate]);

  if (!isActive || !activeBinType) return null;

  const binInfo = ALL_BINS[activeBinType];

  return (
    <>
      {/* Screen tint */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'rgba(20, 184, 166, 0.12)',
          mixBlendMode: 'color',
        }}
      />

      {/* Scan lines effect */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(20,184,166,0.04) 3px, rgba(20,184,166,0.04) 4px)',
        }}
      />

      {/* Center label */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none animate-in fade-in zoom-in-90 duration-200">
        <div className="bg-slate-950/90 border-2 border-teal-400 rounded-2xl px-6 py-4 shadow-2xl flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-teal-400">
            <Scan className="w-5 h-5 animate-pulse" />
            <span className="font-fun font-black text-sm uppercase tracking-wider">Eco Lens Active</span>
          </div>

          <div className="text-center">
            <div className="text-white font-fun font-black text-base">
              {itemName.toUpperCase()}
            </div>
            <div className="text-teal-300 text-xs font-fun font-black mt-1">
              ↓ belongs in ↓
            </div>
            <div
              className="mt-2 px-4 py-1.5 rounded-xl border-2 font-fun font-black text-sm text-white"
              style={{ borderColor: `#${binInfo.hexColor.toString(16).padStart(6, '0')}`, background: `#${binInfo.hexColor.toString(16).padStart(6, '0')}` }}
            >
              {binInfo.label}
            </div>
            <div className="text-slate-400 text-[10px] mt-1">{binInfo.sublabel}</div>
          </div>

          <div className="text-slate-500 text-[10px] font-fun">Auto-closes in 3s</div>
        </div>
      </div>
    </>
  );
};

interface EcoLensButtonProps {
  lensState: EcoLensState;
  onActivate: () => void;
  disabled: boolean;
}

/**
 * EcoLensButton — HUD button with uses remaining and cooldown indicator.
 */
export const EcoLensButton: React.FC<EcoLensButtonProps> = ({ lensState, onActivate, disabled }) => {
  const { energy, energyCostPerUse, cooldown, isActive } = lensState;
  const usesLeft = Math.floor(energy / energyCostPerUse);
  const isOnCooldown = cooldown > 0;
  const canUse = !disabled && !isActive && !isOnCooldown && usesLeft > 0;

  return (
    <button
      onClick={canUse ? onActivate : undefined}
      disabled={!canUse}
      title={
        isOnCooldown
          ? `Eco Lens recharging (${Math.ceil(cooldown)}s)`
          : isActive
          ? 'Eco Lens active'
          : usesLeft === 0
          ? 'No Eco Lens energy left'
          : `Use Eco Lens (${usesLeft} left) — press L`
      }
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-slate-900 shadow-retro-sm font-fun font-black text-xs transition-all
        ${canUse
          ? 'bg-teal-500 hover:bg-teal-400 text-white active:translate-x-[1px] active:translate-y-[1px]'
          : 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-70'
        }
        ${isActive ? 'animate-pulse bg-teal-600' : ''}
      `}
    >
      <Scan className="w-3.5 h-3.5 shrink-0" />
      <span>Lens</span>
      {isOnCooldown ? (
        <span className="bg-slate-900/20 text-[10px] px-1.5 py-0.5 rounded">
          {Math.ceil(cooldown)}s
        </span>
      ) : (
        <span className="bg-slate-900/20 text-[10px] px-1.5 py-0.5 rounded">
          {usesLeft}/5
        </span>
      )}
    </button>
  );
};
