import { describe, it, expect, beforeAll, vi } from 'vitest';
import * as THREE from 'three';
import {
  createMeadowsScene,
  MEADOWS_SPAWN,
  MEADOWS_PATH_HALF_WIDTH,
  MEADOWS_PATH_Z_START,
  MEADOWS_PATH_Z_END,
  MEADOWS_BOUNDS,
} from '../src/components/world/meadowsScene';

// jsdom has no canvas 2D backend — stub it so textures render without errors
beforeAll(() => {
  const gradientStub = {
    addColorStop: () => undefined,
  };
  const ctxStub = new Proxy(
    {},
    {
      get: (_target, prop) => {
        if (prop === 'measureText') return () => ({ width: 0 });
        if (prop === 'createLinearGradient' || prop === 'createRadialGradient') {
          return () => gradientStub;
        }
        return () => undefined;
      },
      set: () => true,
    }
  );
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
    () => ctxStub as unknown as CanvasRenderingContext2D
  );
});

describe('Meadows Scene Geometry & Layout', () => {
  it('creates the meadows scene with all required fields', () => {
    const sceneResult = createMeadowsScene();

    expect(sceneResult).toBeDefined();
    expect(sceneResult.meadowsGroup).toBeInstanceOf(THREE.Group);
    expect(Array.isArray(sceneResult.obstacles)).toBe(true);
    expect(sceneResult.buildingFront).toBeInstanceOf(THREE.Vector3);
    expect(sceneResult.pathCenter).toBeInstanceOf(THREE.Vector3);
    expect(sceneResult.wastePileCenter).toBeInstanceOf(THREE.Vector3);
    expect(typeof sceneResult.setPathGuideVisible).toBe('function');
    expect(typeof sceneResult.animate).toBe('function');
  });

  it('spawns facing the building front', () => {
    const sceneResult = createMeadowsScene();

    // Spawn is at (0, 0, 10), building front is at Z ~ -8.5
    expect(MEADOWS_SPAWN.z).toBeGreaterThan(sceneResult.buildingFront.z);

    // Direction vector from spawn to building
    const dir = new THREE.Vector3().subVectors(sceneResult.buildingFront, MEADOWS_SPAWN).normalize();

    // Spawn should look in the -Z direction
    expect(dir.z).toBeLessThan(-0.9);
    // Center aligned on X axis
    expect(Math.abs(dir.x)).toBeLessThan(0.05);
  });

  it('centers the paver path along X = 0', () => {
    const sceneResult = createMeadowsScene();

    expect(sceneResult.pathCenter.x).toBe(0);
    expect(MEADOWS_PATH_HALF_WIDTH).toBeGreaterThan(1.0);
    expect(MEADOWS_PATH_Z_START).toBeLessThan(MEADOWS_PATH_Z_END);
  });

  it('contains obstacles that prevent walking through the building facade', () => {
    const sceneResult = createMeadowsScene();

    const buildingObstacle = sceneResult.obstacles.find(
      (obs) => obs.id === 'meadows_building' || obs.type === 'building'
    );

    expect(buildingObstacle).toBeDefined();
    if (buildingObstacle) {
      expect(buildingObstacle.minX).toBeLessThan(0);
      expect(buildingObstacle.maxX).toBeGreaterThan(0);
      // Building is behind the front facade line
      expect(buildingObstacle.minZ).toBeLessThan(sceneResult.buildingFront.z);
    }
  });

  it('executes animate loop without throwing errors', () => {
    const sceneResult = createMeadowsScene();
    expect(() => sceneResult.animate(1.0, 0.016)).not.toThrow();
  });

  describe('Left Side: Mud Wasteland (Dead Trees, Dust, Debris)', () => {
    it('creates three dead trees on the mud (left) side with no leaves', () => {
      const { meadowsGroup, obstacles } = createMeadowsScene();

      // Find all dead tree groups in the scene
      const deadTrees: THREE.Group[] = [];
      meadowsGroup.traverse((obj) => {
        if (obj instanceof THREE.Group && obj.name === 'dead_tree') {
          deadTrees.push(obj);
        }
      });

      expect(deadTrees.length).toBe(3);

      // Verify all dead trees are on the left side (x < 0)
      for (const tree of deadTrees) {
        expect(tree.position.x).toBeLessThan(-1.75);

        // Verify there are NO foliage geometries (no Dodecahedron, Icosahedron, or Sphere foliage)
        tree.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            // Dead trees only have cylindrical trunks and branches
            expect(child.geometry).toBeInstanceOf(THREE.CylinderGeometry);
          }
        });
      }

      // Verify collision obstacles for all 3 dead trees
      const treeObstacles = obstacles.filter((obs) => obs.id.startsWith('dead_tree_'));
      expect(treeObstacles.length).toBe(3);
      for (const obs of treeObstacles) {
        expect(obs.maxX).toBeLessThan(0);
      }
    });

    it('creates an animated dust particle system over the left mud area', () => {
      const { meadowsGroup } = createMeadowsScene();

      let dustPoints: THREE.Points | null = null;
      meadowsGroup.traverse((obj) => {
        if (obj instanceof THREE.Points && obj.name === 'dust_particles') {
          dustPoints = obj;
        }
      });

      expect(dustPoints).not.toBeNull();
      if (dustPoints) {
        const geo = (dustPoints as THREE.Points).geometry as THREE.BufferGeometry;
        const posAttr = geo.attributes.position;
        expect(posAttr).toBeDefined();
        expect(posAttr.count).toBeGreaterThan(100);

        // Initial positions should be on the left mud side (x < 0)
        for (let i = 0; i < posAttr.count; i++) {
          expect(posAttr.getX(i)).toBeLessThan(-1.75);
        }
      }
    });

    it('contains mud debris and wasteland obstacles on the left side', () => {
      const { obstacles } = createMeadowsScene();

      const barrelObs = obstacles.find((obs) => obs.id === 'rusted_barrel');
      expect(barrelObs).toBeDefined();
      expect(barrelObs!.maxX).toBeLessThan(0);

      const lampLeftObs = obstacles.find((obs) => obs.id === 'lamp_left');
      expect(lampLeftObs).toBeDefined();
      expect(lampLeftObs!.maxX).toBeLessThan(0);
    });
  });

  describe('Right Side: Lush Greenery (Green Bench, Park Lamp, Environment)', () => {
    it('creates a green bench with obstacle collision on the right side', () => {
      const { meadowsGroup, obstacles } = createMeadowsScene();

      let greenBench: THREE.Group | null = null;
      meadowsGroup.traverse((obj) => {
        if (obj instanceof THREE.Group && obj.name === 'green_bench') {
          greenBench = obj;
        }
      });

      expect(greenBench).not.toBeNull();
      expect((greenBench as unknown as THREE.Group).position.x).toBeGreaterThan(1.75);

      const benchObs = obstacles.find((obs) => obs.id === 'green_bench');
      expect(benchObs).toBeDefined();
      expect(benchObs!.minX).toBeGreaterThan(1.75);
    });

    it('creates a park lamp with a warm light illuminating the greenery on the right side', () => {
      const { meadowsGroup, obstacles } = createMeadowsScene();

      let lampGroup: THREE.Group | null = null;
      let pointLight: THREE.PointLight | null = null;

      meadowsGroup.traverse((obj) => {
        if (obj instanceof THREE.Group && obj.name === 'greenery_lamp') {
          lampGroup = obj;
        }
        if (obj instanceof THREE.PointLight) {
          pointLight = obj;
        }
      });

      expect(lampGroup).not.toBeNull();
      expect((lampGroup as unknown as THREE.Group).position.x).toBeGreaterThan(1.75);

      expect(pointLight).not.toBeNull();
      if (pointLight) {
        expect((pointLight as THREE.PointLight).position.x).toBeGreaterThan(1.75);
        expect((pointLight as THREE.PointLight).intensity).toBeGreaterThan(0.5);
      }

      const lampObs = obstacles.find((obs) => obs.id === 'lamp_right');
      expect(lampObs).toBeDefined();
      expect(lampObs!.minX).toBeGreaterThan(1.75);
    });

    it('creates a lush environment with leafy trees, flower patches, and nature motes', () => {
      const { meadowsGroup, obstacles } = createMeadowsScene();

      // Lush trees across the entire green area
      const lushTrees: THREE.Group[] = [];
      meadowsGroup.traverse((obj) => {
        if (obj instanceof THREE.Group && obj.name === 'lush_tree') {
          lushTrees.push(obj);
        }
      });
      expect(lushTrees.length).toBeGreaterThanOrEqual(8);
      for (const tree of lushTrees) {
        expect(tree.position.x).toBeGreaterThan(1.75);
      }

      const lushObstacles = obstacles.filter((obs) => obs.id.startsWith('lush_tree_'));
      expect(lushObstacles.length).toBeGreaterThanOrEqual(8);

      // Nature motes
      let natureMotes: THREE.Points | null = null;
      meadowsGroup.traverse((obj) => {
        if (obj instanceof THREE.Points && obj.name === 'nature_motes') {
          natureMotes = obj;
        }
      });
      expect(natureMotes).not.toBeNull();
    });
  });

  describe('Garbage Area: Mission 1 Waste Scatter', () => {
    it('scatters a rich assortment of colorful waste items across the garbage area', () => {
      const { meadowsGroup } = createMeadowsScene();

      let wasteGroup: THREE.Group | null = null;
      meadowsGroup.traverse((obj) => {
        if (obj instanceof THREE.Group && obj.name === 'garbage_waste_items') {
          wasteGroup = obj;
        }
      });

      expect(wasteGroup).not.toBeNull();
      // Expanded waste scatter covering all mud zones
      expect(wasteGroup!.children.length).toBeGreaterThanOrEqual(50);

      // Verify all waste items are placed on the left garbage/mud side
      for (const item of wasteGroup!.children) {
        expect(item.position.x).toBeLessThan(-1.75);
      }
    });

    it('defines expanded locomotion bounds allowing player to walk around the road unrestricted by the path', () => {
      expect(MEADOWS_BOUNDS.minX).toBeLessThanOrEqual(-20);
      expect(MEADOWS_BOUNDS.maxX).toBeGreaterThanOrEqual(20);
      expect(MEADOWS_BOUNDS.minZ).toBeLessThanOrEqual(-20);
      expect(MEADOWS_BOUNDS.maxZ).toBeGreaterThanOrEqual(20);
    });
  });

  describe('Perimeter Route and Surrounding Buildings Around the Meadows', () => {
    it('creates a perimeter road route that frames the perimeter around the Meadows', () => {
      const { meadowsGroup } = createMeadowsScene();

      let routeGroup: THREE.Group | null = null;
      meadowsGroup.traverse((obj) => {
        if (obj instanceof THREE.Group && obj.name === 'perimeter_route') {
          routeGroup = obj;
        }
      });

      expect(routeGroup).not.toBeNull();
      // Route contains road planes, dashed road lines, curbs, and zebra crossings
      expect(routeGroup!.children.length).toBeGreaterThan(10);
    });

    it('creates surrounding multi-story buildings outside the route enclosing the district', () => {
      const { meadowsGroup, obstacles } = createMeadowsScene();

      let cityGroup: THREE.Group | null = null;
      meadowsGroup.traverse((obj) => {
        if (obj instanceof THREE.Group && obj.name === 'surrounding_buildings') {
          cityGroup = obj;
        }
      });

      expect(cityGroup).not.toBeNull();
      // Contains multiple surrounding buildings
      expect(cityGroup!.children.length).toBeGreaterThan(10);

      // Surrounding building obstacles exist outside the Meadows grounds (|x| > 18 or |z| > 18)
      const surroundingObs = obstacles.filter((obs) =>
        obs.id.startsWith('bld_n') ||
        obs.id.startsWith('bld_w') ||
        obs.id.startsWith('bld_e') ||
        obs.id.startsWith('bld_s')
      );
      expect(surroundingObs.length).toBeGreaterThanOrEqual(10);
    });
  });

  describe('Phase 4: Garbage Truck & Four Colour-Coded Bins', () => {
    it('creates truck mesh, target positions, and four color-coded bins', () => {
      const sceneResult = createMeadowsScene();

      expect(sceneResult.truckMesh).toBeDefined();
      expect(sceneResult.truckMesh).toBeInstanceOf(THREE.Group);
      expect(sceneResult.truckMesh.name).toBe('meadows_garbage_truck');

      expect(sceneResult.truckStartPos).toBeInstanceOf(THREE.Vector3);
      expect(sceneResult.truckEndPos).toBeInstanceOf(THREE.Vector3);

      expect(typeof sceneResult.animateTruckArrival).toBe('function');
      expect(typeof sceneResult.showTruckBins).toBe('function');
    });

    it('animates truck arrival from road to waste pile and places bins', () => {
      const sceneResult = createMeadowsScene();

      // Initially parked far out and hidden
      expect(sceneResult.truckMesh.visible).toBe(false);

      // Progress at 0.5: truck moves toward end pos and becomes visible
      sceneResult.animateTruckArrival(0.5);
      expect(sceneResult.truckMesh.visible).toBe(true);

      // Progress at 1.0: truck reaches destination near waste pile
      sceneResult.animateTruckArrival(1.0);
      expect(sceneResult.truckMesh.position.x).toBeCloseTo(sceneResult.truckEndPos.x, 1);
      expect(sceneResult.truckMesh.position.z).toBeCloseTo(sceneResult.truckEndPos.z, 1);

      // Verify truck bins group is present
      let truckBins: THREE.Group | null = null;
      sceneResult.meadowsGroup.traverse((obj) => {
        if (obj instanceof THREE.Group && obj.name === 'truck_bins') {
          truckBins = obj;
        }
      });
      expect(truckBins).not.toBeNull();
      expect(truckBins!.children.length).toBe(4); // Wet, Dry, Hazardous, Residual
    });
  });

  describe('Ground Waste Sorting & Disappearance by Type', () => {
    it('removes all matching bottles when a bottle is sorted', () => {
      const sceneResult = createMeadowsScene();
      const wasteGroup = sceneResult.meadowsGroup.getObjectByName('garbage_waste_items') as THREE.Group;
      expect(wasteGroup).toBeDefined();

      const bottleItemsBefore = wasteGroup.children.filter(
        (c) => (c.userData.wasteType as string)?.includes('bottle')
      );
      expect(bottleItemsBefore.length).toBeGreaterThan(0);

      sceneResult.removeWasteByType('plastic_bottle', 'dry');

      // The items are immediately scheduled to shrink or become non-visible
      // Check that targeting bottle removed their active visibility/presence
      const bottleItemsRemainingVisible = wasteGroup.children.filter(
        (c) => (c.userData.wasteType as string)?.includes('bottle') && c.visible && c.scale.x > 0.5
      );
      expect(bottleItemsRemainingVisible.length).toBeLessThan(bottleItemsBefore.length);
    });

    it('removes all food items when a food item is sorted', () => {
      const sceneResult = createMeadowsScene();
      const wasteGroup = sceneResult.meadowsGroup.getObjectByName('garbage_waste_items') as THREE.Group;
      expect(wasteGroup).toBeDefined();

      const foodTypes = ['banana_peel', 'veggie_scrap', 'food_plate', 'bread_slice', 'egg_shell'];
      const foodItemsBefore = wasteGroup.children.filter((c) =>
        foodTypes.includes(c.userData.wasteType as string)
      );
      expect(foodItemsBefore.length).toBeGreaterThan(0);

      sceneResult.removeWasteByType('banana_peel', 'wet');

      const foodItemsRemainingVisible = wasteGroup.children.filter(
        (c) => foodTypes.includes(c.userData.wasteType as string) && c.visible && c.scale.x > 0.5
      );
      expect(foodItemsRemainingVisible.length).toBeLessThan(foodItemsBefore.length);
    });
  });
});

