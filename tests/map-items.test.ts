import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import {
  createBananaPeel3D,
  createFoodPlate3D,
  createMilkCarton3D,
  createPlasticBottle3D,
  createNewspaper3D,
  createBattery3D,
  createLightBulb3D,
  createMedicineBottle3D,
  createMagazine3D,
  createToyCar3D,
  createItemMesh,
  disposeItemMesh,
  MapItemInstance,
  MapItemManager,
  DEFAULT_MAP_ITEM_PLACEMENTS,
  MapItemModelType,
} from '../src/components/world/items';
import { GAME_ITEMS } from '../src/data/items';

describe('Production 3D Map Items Component Suite', () => {
  const modelTypes: MapItemModelType[] = [
    'banana_peel',
    'food_plate',
    'milk_carton',
    'plastic_bottle',
    'newspaper',
    'battery',
    'light_bulb',
    'medicine_bottle',
    'magazine',
    'toy_car',
  ];

  describe('Individual 3D Model Factories', () => {
    it('creates Banana Peel with curled flaps and brown stem', () => {
      const mesh = createBananaPeel3D();
      expect(mesh).toBeInstanceOf(THREE.Group);
      expect(mesh.name).toBe('banana_peel');
      expect(mesh.children.length).toBeGreaterThanOrEqual(4);
    });

    it('creates Food Plate with rice mound, curry, and peas', () => {
      const mesh = createFoodPlate3D();
      expect(mesh).toBeInstanceOf(THREE.Group);
      expect(mesh.name).toBe('food_plate');
      expect(mesh.children.length).toBeGreaterThanOrEqual(5);
    });

    it('creates Milk Carton with gable roof and cap', () => {
      const mesh = createMilkCarton3D();
      expect(mesh).toBeInstanceOf(THREE.Group);
      expect(mesh.name).toBe('milk_carton');
      expect(mesh.children.length).toBeGreaterThanOrEqual(2);
    });

    it('creates Plastic Water Bottle with contoured PET body', () => {
      const mesh = createPlasticBottle3D();
      expect(mesh).toBeInstanceOf(THREE.Group);
      expect(mesh.name).toBe('plastic_bottle');
      expect(mesh.children.length).toBeGreaterThanOrEqual(2);
    });

    it('creates Folded Newspaper with layered sheets', () => {
      const mesh = createNewspaper3D();
      expect(mesh).toBeInstanceOf(THREE.Group);
      expect(mesh.name).toBe('newspaper');
      expect(mesh.children.length).toBeGreaterThanOrEqual(3);
    });

    it('creates Heavy Duty Battery with + terminal pip', () => {
      const mesh = createBattery3D();
      expect(mesh).toBeInstanceOf(THREE.Group);
      expect(mesh.name).toBe('battery');
      expect(mesh.children.length).toBeGreaterThanOrEqual(3);
    });

    it('creates Light Bulb with teardrop envelope and filament', () => {
      const mesh = createLightBulb3D();
      expect(mesh).toBeInstanceOf(THREE.Group);
      expect(mesh.name).toBe('light_bulb');
      expect(mesh.children.length).toBeGreaterThanOrEqual(3);
    });

    it('creates Medicine Bottle with red cross label, loose cap, and pills', () => {
      const mesh = createMedicineBottle3D();
      expect(mesh).toBeInstanceOf(THREE.Group);
      expect(mesh.name).toBe('medicine_bottle');
      expect(mesh.children.length).toBeGreaterThanOrEqual(4);
    });

    it('creates Glossy Magazine with bound spine', () => {
      const mesh = createMagazine3D();
      expect(mesh).toBeInstanceOf(THREE.Group);
      expect(mesh.name).toBe('magazine');
      expect(mesh.children.length).toBeGreaterThanOrEqual(3);
    });

    it('creates Cartoon Toy Car with headlights, antenna, and 4 wheels', () => {
      const mesh = createToyCar3D();
      expect(mesh).toBeInstanceOf(THREE.Group);
      expect(mesh.name).toBe('toy_car');
      expect(mesh.children.length).toBeGreaterThanOrEqual(6);
    });
  });

  describe('Master Factory createItemMesh', () => {
    it('creates all 10 production models with userData metadata', () => {
      modelTypes.forEach((type) => {
        const mesh = createItemMesh(type);
        expect(mesh).toBeInstanceOf(THREE.Group);
        expect(mesh.userData.isEcoSortItem).toBe(true);
        expect(mesh.userData.modelType).toBe(type);
        expect(typeof mesh.userData.dispose).toBe('function');
      });
    });

    it('handles legacy model types gracefully', () => {
      const apple = createItemMesh('apple');
      expect(apple).toBeInstanceOf(THREE.Group);
      const soda = createItemMesh('soda_can');
      expect(soda).toBeInstanceOf(THREE.Group);
      const box = createItemMesh('cardboard');
      expect(box).toBeInstanceOf(THREE.Group);
    });

    it('disposes geometries and materials without throwing', () => {
      const mesh = createItemMesh('milk_carton');
      expect(() => disposeItemMesh(mesh)).not.toThrow();
    });
  });

  describe('MapItemInstance Life Cycle', () => {
    it('positions item and configures collectible placement mode', () => {
      const instance = new MapItemInstance({
        id: 'test_item_1',
        modelType: 'toy_car',
        position: new THREE.Vector3(10, 0, -20),
        placementMode: 'collectible',
      });

      expect(instance.group.position.x).toBe(10);
      expect(instance.group.position.z).toBe(-20);
      expect(instance.getState().isCollected).toBe(false);

      // Animation loop updates
      instance.update(1.0, 0.016, new THREE.Vector3(10.5, 0, -20));
      expect(instance.getState().isNearPlayer).toBe(true);
      expect(instance.getState().distanceToPlayer).toBeCloseTo(0.5, 1);

      // Collection
      instance.collect();
      // Tick through pickup animation
      instance.update(1.5, 0.4);
      expect(instance.getState().isCollected).toBe(true);

      // Respawn
      instance.respawn();
      expect(instance.getState().isCollected).toBe(false);

      // Disposal
      expect(() => instance.dispose()).not.toThrow();
    });
  });

  describe('MapItemManager', () => {
    it('spawns 10 default city items across the map', () => {
      const manager = new MapItemManager({ autoSpawnDefaults: true });
      const stats = manager.getStats();

      expect(stats.total).toBe(10);
      expect(stats.collected).toBe(0);
      expect(stats.remaining).toBe(10);
      expect(manager.itemsGroup.children.length).toBe(10);

      // Spatial query for nearest item
      const playerNearSchool = new THREE.Vector3(28, 0, -29); // Milk carton position
      const nearest = manager.getNearestItem(playerNearSchool, 3.0);
      expect(nearest).not.toBeNull();
      expect(nearest?.config.modelType).toBe('milk_carton');

      // Collect item
      const collected = manager.collectItem(nearest!.config.id);
      expect(collected).toBe(true);

      // Tick update
      manager.update(2.0, 0.5, playerNearSchool);
      expect(nearest!.getState().isCollected).toBe(true);
      expect(manager.getStats().collected).toBe(1);

      // Cleanup
      expect(() => manager.dispose()).not.toThrow();
    });
  });

  describe('Default Placements and Game Database Integration', () => {
    it('verifies all 10 items in DEFAULT_MAP_ITEM_PLACEMENTS have valid model types', () => {
      expect(DEFAULT_MAP_ITEM_PLACEMENTS.length).toBe(10);
      DEFAULT_MAP_ITEM_PLACEMENTS.forEach((placement) => {
        expect(modelTypes).toContain(placement.modelType);
        expect(placement.position).toBeDefined();
      });
    });

    it('verifies all 10 screenshot items are in GAME_ITEMS database', () => {
      const itemModelTypesInDb = GAME_ITEMS.map((it) => it.modelType);
      modelTypes.forEach((type) => {
        // either exact match or alias
        const found = itemModelTypesInDb.some((t) => t === type || (type === 'battery' && t === 'battery'));
        expect(found).toBe(true);
      });
    });
  });
});
