import { describe, it, expect } from 'vitest';
import { AdaptiveSpawner } from '../src/services/spawner';
import { BinType } from '../src/types/game';

describe('AdaptiveSpawner', () => {
  it('should initialize with available bins and items', () => {
    const bins: BinType[] = ['wet', 'dry'];
    const spawner = new AdaptiveSpawner(bins);
    const item = spawner.getNextItem();
    expect(item).toBeDefined();
    expect(bins).toContain(item.bin);
  });

  it('should never spawn the exact same item twice in a row', () => {
    const bins: BinType[] = ['wet', 'dry', 'hazardous'];
    const spawner = new AdaptiveSpawner(bins);
    let previousItem = spawner.getNextItem();

    for (let i = 0; i < 50; i++) {
      const nextItem = spawner.getNextItem();
      expect(nextItem.id).not.toBe(previousItem.id);
      previousItem = nextItem;
    }
  });

  it('should prioritize items with error history', () => {
    const bins: BinType[] = ['hazardous', 'wet'];
    const spawner = new AdaptiveSpawner(bins);

    // Record 10 errors for a specific item
    const targetItemId = 'battery_aa';
    for (let i = 0; i < 10; i++) {
      spawner.recordAttempt(targetItemId, false);
    }

    let targetCount = 0;
    const totalSpawns = 60;
    for (let i = 0; i < totalSpawns; i++) {
      const item = spawner.getNextItem();
      if (item.id === targetItemId) {
        targetCount++;
      }
    }

    // Since battery_aa has high error count, it should be spawned frequently
    expect(targetCount).toBeGreaterThan(10);
  });

  it('guarantees each open bin is represented in early items', () => {
    const bins: BinType[] = ['wet', 'dry', 'hazardous', 'ewaste'];
    const spawner = new AdaptiveSpawner(bins);
    const firstSixBins: BinType[] = [];

    for (let i = 0; i < 6; i++) {
      firstSixBins.push(spawner.getNextItem().bin);
    }

    // Every bin in the allowedBins set should be represented in the first 6 items
    bins.forEach((bin) => {
      expect(firstSixBins).toContain(bin);
    });
  });
});
