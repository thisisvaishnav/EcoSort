import { WorldRegistryEntry } from './types';
import { isSocietyWorldEnabled } from './featureFlags';

/**
 * Global World Registry
 *
 * Central source of truth for all playable 3D worlds in EcoSort Heroes.
 * Landing page and level-selection modal draw their items from this registry.
 */
export const WORLD_REGISTRY: WorldRegistryEntry[] = [
  {
    id: 'migsun',
    displayName: 'MIGSUN VILASA',
    buttonIcon: 'Building',
    buttonTestId: 'migsun-hero-btn',
    sceneLoader: () => import('../components/world/migsunScene'),
    featureFlag: () => true,
    description: 'Residential complex with waste pile cleanup, van arrival, and 4-bin installation.',
  },
  {
    id: 'meadows',
    displayName: 'MEADOWS WORLD',
    buttonIcon: 'Trees',
    buttonTestId: 'meadows-hero-btn',
    sceneLoader: () => import('../components/world/meadowsScene'),
    featureFlag: () => true,
    description: 'Split residential complex with central paver walkway and garden restoration.',
  },
  {
    id: 'society',
    displayName: 'SOCIETY',
    buttonIcon: 'Sparkles',
    buttonTestId: 'society-hero-btn',
    badgeText: 'NEW',
    sceneLoader: () => import('./society/SocietyWorld').then((m) => m.SocietyWorld),
    featureFlag: isSocietyWorldEnabled,
    description: 'Parallel society complex with waste cleanup, dustbin installation, and resident education.',
  },
];

/**
 * Returns worlds whose feature flags evaluate to true
 */
export function getAvailableWorlds(): WorldRegistryEntry[] {
  return WORLD_REGISTRY.filter((world) => world.featureFlag());
}

/**
 * Look up a world by ID from registry
 */
export function getWorldById(id: string): WorldRegistryEntry | undefined {
  return WORLD_REGISTRY.find((world) => world.id === id);
}
