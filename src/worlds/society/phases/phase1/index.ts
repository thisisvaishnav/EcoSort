export * from './types';
export * from './Phase1Controller';

import { SOCIETY_MANIFEST } from '../../manifest';

export function initializePhase1State() {
  return {
    isTimerRunning: false,
    timeRemaining: SOCIETY_MANIFEST.timerSeconds,
    itemsSorted: 0,
    targetCount: SOCIETY_MANIFEST.itemSpawnRegion.scatterCount,
  };
}
