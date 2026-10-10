import * as THREE from 'three';
import { ItemData } from '../../../types/game';

export type MapItemModelType =
  // Original 10 models
  | 'banana_peel'
  | 'food_plate'
  | 'milk_carton'
  | 'plastic_bottle'
  | 'newspaper'
  | 'battery'
  | 'light_bulb'
  | 'medicine_bottle'
  | 'magazine'
  | 'toy_car'
  // Level 1 additions
  | 'bread_slice'
  | 'veggie_scrap'
  | 'egg_shell'
  | 'cardboard'
  | 'metal_can'
  | 'soda_can'
  // Level 1 residual additions
  | 'wrapper'
  | 'tissue'
  | 'broken_pen';

export type PlacementMode = 'ground' | 'collectible' | 'table';

export interface ItemMeshOptions {
  scale?: number;
  castShadow?: boolean;
  receiveShadow?: boolean;
  useTextures?: boolean;
  emissiveIntensity?: number;
  highlight?: boolean;
}

export interface MapItemConfig {
  id: string;
  modelType: MapItemModelType;
  position: THREE.Vector3 | [number, number, number];
  rotation?: THREE.Euler | [number, number, number];
  scale?: number;
  placementMode?: PlacementMode;
  itemData?: ItemData;
  interactionRadius?: number;
  respawnTimeSeconds?: number;
  onPickup?: (item: MapItemConfig) => void;
}

export interface MapItemState {
  isCollected: boolean;
  isNearPlayer: boolean;
  distanceToPlayer: number;
  respawnTimer: number;
}
