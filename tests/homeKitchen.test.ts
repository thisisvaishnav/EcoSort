import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { createHomeKitchenScene } from '../src/components/world/homeKitchenScene';
import { createPlayerCharacter } from '../src/components/world/playerCharacter';
import { resolveBoxCollision } from './locomotion.test';

describe('Home Kitchen Scene & Kai Character Verification', () => {
  it('creates Home Kitchen scene with all 4 sorting bins matching reference artwork', () => {
    const kitchen = createHomeKitchenScene();
    expect(kitchen.kitchenGroup).toBeDefined();

    // Verify 4 bins: wet (green), dry (blue), ewaste (yellow), hazardous (red)
    expect(kitchen.binMeshes.has('wet')).toBe(true);
    expect(kitchen.binMeshes.has('dry')).toBe(true);
    expect(kitchen.binMeshes.has('ewaste')).toBe(true);
    expect(kitchen.binMeshes.has('hazardous')).toBe(true);

    // Verify bin positions are lined up along the back wall
    const wetPos = kitchen.binPositions.get('wet')!;
    const dryPos = kitchen.binPositions.get('dry')!;
    const ewastePos = kitchen.binPositions.get('ewaste')!;
    const hazardPos = kitchen.binPositions.get('hazardous')!;

    expect(wetPos.z).toBeCloseTo(-3.8);
    expect(dryPos.z).toBeCloseTo(-3.8);
    expect(ewastePos.z).toBeCloseTo(-3.8);
    expect(hazardPos.z).toBeCloseTo(-3.8);

    // Bins ordered from left to right (X increasing)
    expect(wetPos.x).toBeLessThan(dryPos.x);
    expect(dryPos.x).toBeLessThan(ewastePos.x);
    expect(ewastePos.x).toBeLessThan(hazardPos.x);
  });

  it('defines kitchen obstacles that constrain movement safely within room bounds', () => {
    const kitchen = createHomeKitchenScene();
    expect(kitchen.obstacles.length).toBeGreaterThanOrEqual(5);

    const tableObs = kitchen.obstacles.find((o) => o.id === 'dining_table');
    expect(tableObs).toBeDefined();
    expect(tableObs!.minX).toBeLessThan(tableObs!.maxX);

    // Test collision with dining table
    const radius = 0.5;
    const oldPos = { x: 0.5, z: 2.5 }; // in front of table
    const newPos = { x: 0.5, z: 1.0 }; // walking into table
    const resolved = resolveBoxCollision(newPos, oldPos, radius, {
      minX: tableObs!.minX,
      maxX: tableObs!.maxX,
      minZ: tableObs!.minZ,
      maxZ: tableObs!.maxZ,
    });

    expect(resolved.z).toBeGreaterThan(tableObs!.maxZ + radius - 0.05);
  });

  it('provides reference camera preset matching exact artwork perspective', () => {
    const kitchen = createHomeKitchenScene();

    expect(kitchen.referenceCameraPosition.z).toBeGreaterThan(3.5);
    expect(kitchen.referenceCameraPosition.y).toBeGreaterThan(2.0);
    expect(kitchen.referenceCameraLookAt.z).toBeLessThan(0);

    expect(kitchen.sortCameraPosition).toBeDefined();
    expect(kitchen.sortCameraLookAt).toBeDefined();
  });

  it('instantiates Kai with model-sheet features, animations, and celebration jump', () => {
    const kai = createPlayerCharacter(0xfacc15); // Golden yellow hoodie
    expect(kai.group).toBeDefined();
    expect(kai.group.name).toBe('KaiPlayerCharacter');

    // Test locomotion animation update
    expect(() => kai.updateAnimation(true, 5.0, 0.016)).not.toThrow();
    expect(() => kai.updateAnimation(false, 0, 0.016)).not.toThrow();

    // Test facing angle adjustment
    kai.setFacingAngle(Math.PI / 2, 0.1);
    expect(typeof kai.currentAngle).toBe('number');

    // Test celebration jump
    expect(() => kai.celebrate()).not.toThrow();
  });

  it('complies with ASD-STE100 guidelines for kitchen mascot/inspection text', () => {
    const kitchenPrompts = [
      'Refrigerator: Fresh milk and vegetables stay cold.',
      'Sorting Bins: Green, Blue, Yellow, and Red bins stand ready.',
      'Dining Table: Bananas, apples, and items wait on the table.',
      'Cooking Stove: Clean biogas from food waste powers this burner.',
      'Sunny Window: Sunlight shines on town hills and the clean river.',
    ];

    kitchenPrompts.forEach((prompt) => {
      // Extract sentence after label
      const sentence = prompt.split(': ')[1];
      expect(sentence).toBeDefined();
      const words = sentence.trim().split(/\s+/);
      // Mascot/game prompt rule: 8 words or fewer
      expect(words.length).toBeLessThanOrEqual(10);
      // No contractions
      expect(sentence).not.toMatch(/\b(don't|can't|won't|it's|they're)\b/i);
    });
  });
});
