export * from './createSocietyMap';
import { SOCIETY_MANIFEST } from '../manifest';

export function buildSocietyMapPlaceholder() {
  return {
    bounds: SOCIETY_MANIFEST.bounds,
    collisionShapes: SOCIETY_MANIFEST.collision,
  };
}
