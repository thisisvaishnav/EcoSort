export * from './createSocietyProps';
import { SOCIETY_MANIFEST } from '../manifest';

export function getSocietyPropsCatalog() {
  return {
    hotspotPropCount: SOCIETY_MANIFEST.ecoHotspots.length,
    plantSlotCount: SOCIETY_MANIFEST.plantSlots.length,
  };
}
