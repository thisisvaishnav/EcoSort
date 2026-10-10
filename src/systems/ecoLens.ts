import { BinType } from '../types/game';

export interface EcoLensState {
  energy: number;           // 0–100, starts at 100
  maxEnergy: number;        // 100
  cooldown: number;         // seconds remaining before next use
  cooldownDuration: number; // 8 seconds
  energyCostPerUse: number; // 20 (so 5 uses max)
  isActive: boolean;
  activeItemId: string | null;
  activeBinType: BinType | null;
}

export const INITIAL_ECO_LENS_STATE: EcoLensState = {
  energy: 100,
  maxEnergy: 100,
  cooldown: 0,
  cooldownDuration: 8,
  energyCostPerUse: 20,
  isActive: false,
  activeItemId: null,
  activeBinType: null,
};

/**
 * Eco Lens reducer-style helpers.
 * Use these in WorldPage state to manage lens transitions.
 */

/** Activate the lens for a specific item → bin mapping. Returns updated state or null if unavailable. */
export function activateLens(
  state: EcoLensState,
  itemId: string,
  correctBin: BinType
): EcoLensState | null {
  if (state.isActive) return null;
  if (state.energy < state.energyCostPerUse) return null;
  if (state.cooldown > 0) return null;

  return {
    ...state,
    isActive: true,
    energy: state.energy - state.energyCostPerUse,
    activeItemId: itemId,
    activeBinType: correctBin,
  };
}

/** Called every second during cooldown tick. */
export function tickLensCooldown(state: EcoLensState, deltaSec: number): EcoLensState {
  if (state.cooldown <= 0) return state;
  return { ...state, cooldown: Math.max(0, state.cooldown - deltaSec) };
}

/** Deactivate the lens (after 3-second auto-off). Starts cooldown. */
export function deactivateLens(state: EcoLensState): EcoLensState {
  return {
    ...state,
    isActive: false,
    activeItemId: null,
    activeBinType: null,
    cooldown: state.cooldownDuration,
  };
}

/** Returns how many uses remain based on current energy. */
export function getLensUsesRemaining(state: EcoLensState): number {
  return Math.floor(state.energy / state.energyCostPerUse);
}
