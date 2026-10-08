import { BinType, ItemData } from '../types/game';
import { GAME_ITEMS } from '../data/items';

export class AdaptiveSpawner {
  private availableItems: ItemData[];
  private allowedBins: BinType[];
  private lastItemId: string | null = null;
  private recentItemHistory: string[] = [];
  private itemErrorCounts: Record<string, number> = {};
  private currentBatchBinsRemaining: Set<BinType>;

  constructor(allowedBins: BinType[], playerErrors: Record<string, { attempts: number; errors: number }> = {}) {
    this.allowedBins = allowedBins;
    // Filter items to only those matching current level bins
    this.availableItems = GAME_ITEMS.filter((item) => allowedBins.includes(item.bin));

    // Seed error counts
    Object.entries(playerErrors).forEach(([id, stat]) => {
      this.itemErrorCounts[id] = stat.errors;
    });

    this.currentBatchBinsRemaining = new Set(allowedBins);
  }

  public recordAttempt(itemId: string, isCorrect: boolean): void {
    if (!isCorrect) {
      this.itemErrorCounts[itemId] = (this.itemErrorCounts[itemId] || 0) + 2;
    } else {
      if (this.itemErrorCounts[itemId] && this.itemErrorCounts[itemId] > 0) {
        this.itemErrorCounts[itemId] = Math.max(0, this.itemErrorCounts[itemId] - 1);
      }
    }
  }

  public getNextItem(): ItemData {
    // Condition 1: Each set of 6 items has at least one item for each open bin
    let candidatePool = this.availableItems;

    if (this.currentBatchBinsRemaining.size > 0) {
      const requiredBin = Array.from(this.currentBatchBinsRemaining)[0];
      const binItems = candidatePool.filter((i) => i.bin === requiredBin && i.id !== this.lastItemId);
      if (binItems.length > 0) {
        const selected = this.pickWeighted(binItems);
        this.currentBatchBinsRemaining.delete(requiredBin);
        this.lastItemId = selected.id;
        return selected;
      }
    } else {
      // Reset the batch requirement
      this.currentBatchBinsRemaining = new Set(this.allowedBins);
    }

    // Filter out item that appeared last (No item appears twice in a row)
    const eligiblePool = candidatePool.filter((item) => item.id !== this.lastItemId);
    const poolToUse = eligiblePool.length > 0 ? eligiblePool : candidatePool;

    const selected = this.pickWeighted(poolToUse);
    this.lastItemId = selected.id;
    this.recentItemHistory.push(selected.id);
    if (this.recentItemHistory.length > 6) {
      this.recentItemHistory.shift();
    }

    return selected;
  }

  private pickWeighted(items: ItemData[]): ItemData {
    if (items.length === 1) return items[0];

    // Calculate weights: base weight + mistake count boost
    const weights = items.map((item) => {
      const errorBoost = (this.itemErrorCounts[item.id] || 0) * 1.5;
      return Math.max(0.1, item.baseWeight + errorBoost);
    });

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let randomVal = Math.random() * totalWeight;

    for (let i = 0; i < items.length; i++) {
      randomVal -= weights[i];
      if (randomVal <= 0) {
        return items[i];
      }
    }

    return items[items.length - 1];
  }
}
