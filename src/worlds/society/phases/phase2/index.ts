export * from './types';
export * from './Phase2Controller';

import { SOCIETY_MANIFEST } from '../../manifest';

export function initializePhase2State() {
  return {
    candidateSpots: SOCIETY_MANIFEST.binSpots,
    installedSpotId: null,
    activeCardsViewed: 0,
  };
}
