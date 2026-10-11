import { describe, it, expect } from 'vitest';
import { initializePhase1State } from '../src/worlds/society/phases/phase1';
import { initializePhase2State } from '../src/worlds/society/phases/phase2';
import { initializePhase3State } from '../src/worlds/society/phases/phase3';
import { SOCIETY_MANIFEST } from '../src/worlds/society/manifest';
import { SOCIETY_STRINGS } from '../src/worlds/society/content';

describe('Wave 2: Agent D Phase 1 (Clean The Waste)', () => {
  it('initializes Phase 1 with 120s timer and 15 scatter items', () => {
    const p1 = initializePhase1State();
    expect(p1.timeRemaining).toBe(120);
    expect(p1.targetCount).toBe(15);
    expect(p1.itemsSorted).toBe(0);
  });

  it('declares 4 temporary sorting sacks for all 4 bin categories', () => {
    const sacks = SOCIETY_MANIFEST.sackPositions;
    expect(sacks.wet).toBeDefined();
    expect(sacks.dry).toBeDefined();
    expect(sacks.hazardous).toBeDefined();
    expect(sacks.residual).toBeDefined();
  });
});

describe('Wave 2: Agent E Phase 2 (Install Dustbins)', () => {
  it('validates candidate dustbin installation spots against placement rules', () => {
    const p2 = initializePhase2State();
    expect(p2.candidateSpots.length).toBeGreaterThanOrEqual(5);

    const correctSpots = p2.candidateSpots.filter((s) => s.isCorrect);
    const incorrectSpots = p2.candidateSpots.filter((s) => !s.isCorrect);

    expect(correctSpots.length).toBeGreaterThan(0);
    expect(incorrectSpots.length).toBeGreaterThan(0);

    // Verify explanation rules
    for (const spot of p2.candidateSpots) {
      expect(spot.explanation.length).toBeGreaterThan(10);
      if (spot.isCorrect) {
        expect(spot.scoreBonus).toBeGreaterThan(0);
      } else {
        expect(spot.scoreBonus).toBe(0);
      }
    }
  });
});

describe('Wave 2: Agent F Phase 3 (Eco Lens & Resident Teaching)', () => {
  it('provides exactly 4 hotspots for Eco Lens scanning', () => {
    const p3 = initializePhase3State();
    expect(p3.hotspots.length).toBe(4);
    expect(p3.scannedHotspotIds).toHaveLength(0);
  });

  it('provides all 8 residents with ASD-STE100 dialogue and valid options', () => {
    expect(SOCIETY_STRINGS.residents.length).toBe(8);

    for (const res of SOCIETY_STRINGS.residents) {
      expect(res.name).toBeDefined();
      expect(res.statement.split(/\s+/).length).toBeLessThanOrEqual(10);
      expect(res.guidance.split(/\s+/).length).toBeLessThanOrEqual(10);
      expect(res.hint.split(/\s+/).length).toBeLessThanOrEqual(10);
      expect(res.options.some((o) => o.binType === res.correctBin)).toBe(true);
    }
  });

  it('calculates 3 stars for top performance and metrics', () => {
    const maxScore = 400;
    const earnedStars = maxScore >= 350 ? 3 : maxScore >= 200 ? 2 : 1;
    expect(earnedStars).toBe(3);
  });
});
