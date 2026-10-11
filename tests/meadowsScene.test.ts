import { describe, it, expect, beforeAll, vi } from 'vitest';
import * as THREE from 'three';
import {
  createMeadowsScene,
  MEADOWS_SPAWN,
  MEADOWS_PATH_HALF_WIDTH,
  MEADOWS_PATH_Z_START,
  MEADOWS_PATH_Z_END,
} from '../src/components/world/meadowsScene';

// jsdom has no canvas 2D backend — stub it so textures render without errors
beforeAll(() => {
  const ctxStub = new Proxy(
    {},
    {
      get: (_target, prop) => (prop === 'measureText' ? () => ({ width: 0 }) : () => undefined),
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
});
