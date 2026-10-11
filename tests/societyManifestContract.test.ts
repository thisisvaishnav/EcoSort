import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SOCIETY_MANIFEST } from '../src/worlds/society/manifest';
import { WORLD_REGISTRY, getAvailableWorlds, getWorldById } from '../src/worlds/registry';
import { isSocietyWorldEnabled, setSocietyWorldEnabled } from '../src/worlds/featureFlags';
import {
  buildSocietyMapPlaceholder,
  getSocietyPropsCatalog,
  initializePhase1State,
  initializePhase2State,
  initializePhase3State,
  SOCIETY_CONTENT,
  SOCIETY_AUDIO_IDS,
} from '../src/worlds/society';

describe('Wave 0: Society World Manifest Contract', () => {
  it('satisfies the frozen manifest contract schema', () => {
    expect(SOCIETY_MANIFEST.id).toBe('society');
    expect(SOCIETY_MANIFEST.name).toBe('Society');
    expect(SOCIETY_MANIFEST.saveNamespace).toBe('ecohero:society:');
    expect(SOCIETY_MANIFEST.contentNamespace).toBe('society');
    expect(SOCIETY_MANIFEST.audioPrefix).toBe('society_');

    // Walkable bounds validation
    expect(SOCIETY_MANIFEST.bounds.minX).toBeLessThan(SOCIETY_MANIFEST.bounds.maxX);
    expect(SOCIETY_MANIFEST.bounds.minZ).toBeLessThan(SOCIETY_MANIFEST.bounds.maxZ);

    // Player spawn within bounds
    const { position } = SOCIETY_MANIFEST.playerStart;
    expect(position.x).toBeGreaterThanOrEqual(SOCIETY_MANIFEST.bounds.minX);
    expect(position.x).toBeLessThanOrEqual(SOCIETY_MANIFEST.bounds.maxX);
    expect(position.z).toBeGreaterThanOrEqual(SOCIETY_MANIFEST.bounds.minZ);
    expect(position.z).toBeLessThanOrEqual(SOCIETY_MANIFEST.bounds.maxZ);
  });

  it('declares 4 temporary sorting sacks for wet, dry, hazardous, and residual', () => {
    const sacks = SOCIETY_MANIFEST.sackPositions;
    expect(sacks.wet).toBeDefined();
    expect(sacks.dry).toBeDefined();
    expect(sacks.hazardous).toBeDefined();
    expect(sacks.residual).toBeDefined();
  });

  it('defines candidate bin spots conforming to rule function constraints', () => {
    expect(SOCIETY_MANIFEST.binSpots.length).toBeGreaterThanOrEqual(5);
    expect(SOCIETY_MANIFEST.binSpots.length).toBeLessThanOrEqual(7);

    const hasCorrectSpot = SOCIETY_MANIFEST.binSpots.some((spot) => spot.isCorrect);
    const hasIncorrectSpot = SOCIETY_MANIFEST.binSpots.some((spot) => !spot.isCorrect);
    expect(hasCorrectSpot).toBe(true);
    expect(hasIncorrectSpot).toBe(true);
  });

  it('defines exactly 4 Eco Lens hotspots matching spec section 5', () => {
    expect(SOCIETY_MANIFEST.ecoHotspots.length).toBe(4);
    const ids = SOCIETY_MANIFEST.ecoHotspots.map((h) => h.id);
    expect(ids).toContain('hotspot_food_waste');
    expect(ids).toContain('hotspot_standing_water');
    expect(ids).toContain('hotspot_damaged_plants');
    expect(ids).toContain('hotspot_littered_drain');
  });

  it('defines 120s timer and the 4 standard bins', () => {
    expect(SOCIETY_MANIFEST.timerSeconds).toBe(120);
    expect(SOCIETY_MANIFEST.activeBins).toEqual(['wet', 'dry', 'hazardous', 'residual']);
  });

  it('defines collision obstacles within world bounds', () => {
    expect(SOCIETY_MANIFEST.collision.length).toBeGreaterThan(0);
    for (const obs of SOCIETY_MANIFEST.collision) {
      expect(obs.minX).toBeLessThan(obs.maxX);
      expect(obs.minZ).toBeLessThan(obs.maxZ);
      expect(obs.minX).toBeGreaterThanOrEqual(SOCIETY_MANIFEST.bounds.minX);
      expect(obs.maxX).toBeLessThanOrEqual(SOCIETY_MANIFEST.bounds.maxX);
    }
  });
});

describe('Wave 0: World Registry & Feature Flags', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('keeps Society World disabled by default', () => {
    expect(isSocietyWorldEnabled()).toBe(false);
    const active = getAvailableWorlds();
    expect(active.some((w) => w.id === 'society')).toBe(false);
  });

  it('enables Society World via localStorage override', () => {
    setSocietyWorldEnabled(true);
    expect(isSocietyWorldEnabled()).toBe(true);
    const active = getAvailableWorlds();
    expect(active.some((w) => w.id === 'society')).toBe(true);

    setSocietyWorldEnabled(false);
    expect(isSocietyWorldEnabled()).toBe(false);
  });

  it('retrieves world by id from registry', () => {
    const entry = getWorldById('society');
    expect(entry).toBeDefined();
    expect(entry?.displayName).toBe('SOCIETY');
    expect(entry?.buttonTestId).toBe('society-hero-btn');
  });
});

describe('Wave 0: Agent Lanes Stubs Compilation & Exports', () => {
  it('instantiates Agent B map placeholder', () => {
    const map = buildSocietyMapPlaceholder();
    expect(map.bounds).toBeDefined();
    expect(map.collisionShapes.length).toBeGreaterThan(0);
  });

  it('instantiates Agent C props catalog', () => {
    const props = getSocietyPropsCatalog();
    expect(props.hotspotPropCount).toBe(4);
    expect(props.plantSlotCount).toBeGreaterThan(0);
  });

  it('instantiates Agent D Phase 1 state', () => {
    const p1 = initializePhase1State();
    expect(p1.timeRemaining).toBe(120);
    expect(p1.targetCount).toBe(15);
  });

  it('instantiates Agent E Phase 2 state', () => {
    const p2 = initializePhase2State();
    expect(p2.candidateSpots.length).toBeGreaterThanOrEqual(5);
    expect(p2.installedSpotId).toBeNull();
  });

  it('instantiates Agent F Phase 3 state', () => {
    const p3 = initializePhase3State();
    expect(p3.hotspots.length).toBe(4);
    expect(p3.residents.length).toBeGreaterThan(0);
  });

  it('exports Agent G English-only content and prefixed audio IDs', () => {
    expect(SOCIETY_CONTENT.narrative.intro).toBeDefined();
    expect(SOCIETY_AUDIO_IDS.bgmLoop.startsWith('society_')).toBe(true);
    expect(SOCIETY_AUDIO_IDS.kaiWelcome.startsWith('society_')).toBe(true);
  });
});
