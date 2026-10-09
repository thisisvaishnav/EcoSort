import * as THREE from 'three';
import { MapItemConfig } from './types';
import { MapItemInstance } from './MapItemInstance';
import { DEFAULT_MAP_ITEM_PLACEMENTS } from './defaultMapPlacements';

export interface MapItemManagerOptions {
  onItemCollected?: (item: MapItemConfig) => void;
  autoSpawnDefaults?: boolean;
}

/**
 * Manages all 3D items scattered across the EcoSort town map.
 * Handles batched animation loops, spatial queries for player proximity,
 * interactive pickups, and memory cleanup.
 */
export class MapItemManager {
  public readonly itemsGroup: THREE.Group;
  private items = new Map<string, MapItemInstance>();
  private onItemCollected?: (item: MapItemConfig) => void;

  constructor(options: MapItemManagerOptions = {}) {
    this.itemsGroup = new THREE.Group();
    this.itemsGroup.name = 'map_items_manager';
    this.onItemCollected = options.onItemCollected;

    if (options.autoSpawnDefaults) {
      this.spawnPresetCityItems();
    }
  }

  /**
   * Spawns a single item into the city map
   */
  public addItem(config: MapItemConfig): MapItemInstance {
    // If item already exists with this ID, remove it first
    if (this.items.has(config.id)) {
      this.removeItem(config.id);
    }

    const instance = new MapItemInstance({
      ...config,
      onPickup: (collectedConfig) => {
        if (config.onPickup) config.onPickup(collectedConfig);
        if (this.onItemCollected) this.onItemCollected(collectedConfig);
      },
    });

    this.items.set(config.id, instance);
    this.itemsGroup.add(instance.group);
    return instance;
  }

  /**
   * Spawns the default set of all 10 items across the town map
   */
  public spawnPresetCityItems(customPlacements?: MapItemConfig[]): void {
    const placements = customPlacements || DEFAULT_MAP_ITEM_PLACEMENTS;
    placements.forEach((placement) => {
      this.addItem(placement);
    });
  }

  /**
   * Removes and disposes an item by ID
   */
  public removeItem(id: string): boolean {
    const instance = this.items.get(id);
    if (!instance) return false;

    this.itemsGroup.remove(instance.group);
    instance.dispose();
    this.items.delete(id);
    return true;
  }

  /**
   * Update animation loop for all active map items
   */
  public update(time: number, delta: number, playerPos?: THREE.Vector3): void {
    this.items.forEach((instance) => {
      instance.update(time, delta, playerPos);
    });
  }

  /**
   * Finds the nearest active item within a given radius
   */
  public getNearestItem(playerPos: THREE.Vector3, maxRadius = 3.0): MapItemInstance | null {
    let nearest: MapItemInstance | null = null;
    let minDist = maxRadius;

    this.items.forEach((instance) => {
      const state = instance.getState();
      if (state.isCollected) return;

      const dist = instance.group.position.distanceTo(playerPos);
      if (dist < minDist) {
        minDist = dist;
        nearest = instance;
      }
    });

    return nearest;
  }

  /**
   * Collect an item by ID (e.g. when player presses interaction key [E] or taps)
   */
  public collectItem(id: string): boolean {
    const instance = this.items.get(id);
    if (!instance) return false;
    instance.collect();
    return true;
  }

  /**
   * Get all active (uncollected) items
   */
  public getActiveItems(): MapItemInstance[] {
    const list: MapItemInstance[] = [];
    this.items.forEach((item) => {
      if (!item.getState().isCollected) {
        list.push(item);
      }
    });
    return list;
  }

  /**
   * Returns total item count and collected item count
   */
  public getStats(): { total: number; collected: number; remaining: number } {
    let collected = 0;
    this.items.forEach((item) => {
      if (item.getState().isCollected) collected++;
    });
    return {
      total: this.items.size,
      collected,
      remaining: this.items.size - collected,
    };
  }

  /**
   * Disposes all items and clears the group
   */
  public dispose(): void {
    this.items.forEach((instance) => {
      instance.dispose();
    });
    this.items.clear();
    while (this.itemsGroup.children.length > 0) {
      this.itemsGroup.remove(this.itemsGroup.children[0]);
    }
  }
}
