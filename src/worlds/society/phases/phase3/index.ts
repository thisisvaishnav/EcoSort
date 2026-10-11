export * from './types';
export * from './Phase3Controller';

import { SOCIETY_MANIFEST } from '../../manifest';

export function initializePhase3State() {
  return {
    scannedHotspotIds: [],
    taughtResidentIds: [],
    hotspots: SOCIETY_MANIFEST.ecoHotspots,
    residents: SOCIETY_MANIFEST.residents,
  };
}
