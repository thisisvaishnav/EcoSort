import { describe, it, expect } from 'vitest';

/**
 * Math utilities for locomotion, camera zoom, and click-to-move logic
 */
export function calculateCameraRelativeDirection(
  inputX: number,
  inputZ: number,
  cameraAzimuthAngle: number
): { x: number; z: number } {
  if (inputX === 0 && inputZ === 0) return { x: 0, z: 0 };
  const sin = Math.sin(cameraAzimuthAngle);
  const cos = Math.cos(cameraAzimuthAngle);
  // inputZ: -1 for W (forward), +1 for S (backward)
  // inputX: -1 for A (left), +1 for D (right)
  // Camera offset is (sin(yaw), cos(yaw)); camera forward (camera → player)
  // is therefore (-sin, -cos) and camera right is (cos, -sin).
  const dirX = inputX * cos + inputZ * sin;
  const dirZ = -inputX * sin + inputZ * cos;
  const len = Math.hypot(dirX, dirZ);
  return { x: dirX / len, z: dirZ / len };
}

export function clampCameraDistance(dist: number, min = 5.0, max = 55.0): number {
  return Math.max(min, Math.min(max, dist));
}

export function calculateCameraPitchForDistance(
  dist: number,
  minDist = 5.0,
  maxDist = 55.0,
  minPitchDeg = 20,
  maxPitchDeg = 65
): number {
  const t = (clampCameraDistance(dist, minDist, maxDist) - minDist) / (maxDist - minDist);
  // Linear or eased elevation: as distance increases, camera rises higher
  return minPitchDeg + t * (maxPitchDeg - minPitchDeg);
}

export function isArrivedAtDestination(
  currentPos: { x: number; z: number },
  targetPos: { x: number; z: number },
  threshold = 0.4
): boolean {
  const dist = Math.hypot(currentPos.x - targetPos.x, currentPos.z - targetPos.z);
  return dist <= threshold;
}

export function resolveBoxCollision(
  newPos: { x: number; z: number },
  oldPos: { x: number; z: number },
  radius: number,
  box: { minX: number; maxX: number; minZ: number; maxZ: number }
): { x: number; z: number } {
  // Expand box by avatar radius
  const expandedMinX = box.minX - radius;
  const expandedMaxX = box.maxX + radius;
  const expandedMinZ = box.minZ - radius;
  const expandedMaxZ = box.maxZ + radius;

  // Check if inside expanded box
  const insideX = newPos.x > expandedMinX && newPos.x < expandedMaxX;
  const insideZ = newPos.z > expandedMinZ && newPos.z < expandedMaxZ;

  if (!insideX || !insideZ) {
    return newPos; // No collision
  }

  // Slide along axis that was not collided previously
  const oldInsideX = oldPos.x > expandedMinX && oldPos.x < expandedMaxX;
  const oldInsideZ = oldPos.z > expandedMinZ && oldPos.z < expandedMaxZ;

  let resolvedX = newPos.x;
  let resolvedZ = newPos.z;

  if (!oldInsideX) {
    // Came from outside on X axis; stop X
    resolvedX = oldPos.x;
  }
  if (!oldInsideZ) {
    // Came from outside on Z axis; stop Z
    resolvedZ = oldPos.z;
  }

  // If both were already somehow inside or diagonally penetrating, push to nearest edge
  if (resolvedX === newPos.x && resolvedZ === newPos.z) {
    const distLeft = Math.abs(newPos.x - expandedMinX);
    const distRight = Math.abs(newPos.x - expandedMaxX);
    const distTop = Math.abs(newPos.z - expandedMinZ);
    const distBottom = Math.abs(newPos.z - expandedMaxZ);
    const minDist = Math.min(distLeft, distRight, distTop, distBottom);

    if (minDist === distLeft) resolvedX = expandedMinX;
    else if (minDist === distRight) resolvedX = expandedMaxX;
    else if (minDist === distTop) resolvedZ = expandedMinZ;
    else resolvedZ = expandedMaxZ;
  }

  return { x: resolvedX, z: resolvedZ };
}

describe('Locomotion & Camera Math', () => {
  it('correctly calculates camera-relative movement vector', () => {
    // When camera is facing straight north (angle 0)
    // Pressing W (inputZ = -1) moves in -Z
    const northDir = calculateCameraRelativeDirection(0, -1, 0);
    expect(northDir.x).toBeCloseTo(0);
    expect(northDir.z).toBeCloseTo(-1);

    // Pressing D (inputX = 1) moves in +X
    const eastDir = calculateCameraRelativeDirection(1, 0, 0);
    expect(eastDir.x).toBeCloseTo(1);
    expect(eastDir.z).toBeCloseTo(0);

    // When camera is rotated 90 degrees (Math.PI / 2) it sits east of the
    // player and looks west — so W must move west (-X), away from the camera.
    const rotatedW = calculateCameraRelativeDirection(0, -1, Math.PI / 2);
    expect(rotatedW.x).toBeCloseTo(-1);
    expect(rotatedW.z).toBeCloseTo(0);

    // D moves along camera right: (cos, -sin) = (0, -1) at azimuth π/2
    const rotatedD = calculateCameraRelativeDirection(1, 0, Math.PI / 2);
    expect(rotatedD.x).toBeCloseTo(0);
    expect(rotatedD.z).toBeCloseTo(-1);
  });

  it('clamps camera distance strictly between 5.0m and 55.0m', () => {
    expect(clampCameraDistance(2.0)).toBe(5.0);
    expect(clampCameraDistance(15.0)).toBe(15.0);
    expect(clampCameraDistance(60.0)).toBe(55.0);
    expect(clampCameraDistance(5.0)).toBe(5.0);
    expect(clampCameraDistance(55.0)).toBe(55.0);
  });

  it('dynamically elevates camera pitch based on zoom distance', () => {
    const minPitch = calculateCameraPitchForDistance(5.0);
    const maxPitch = calculateCameraPitchForDistance(55.0);
    const midPitch = calculateCameraPitchForDistance(30.0);

    expect(minPitch).toBe(20);
    expect(maxPitch).toBe(65);
    expect(midPitch).toBeGreaterThan(minPitch);
    expect(midPitch).toBeLessThan(maxPitch);
  });

  it('determines arrival at click-to-move destination within threshold', () => {
    const target = { x: 10, z: -20 };
    expect(isArrivedAtDestination({ x: 10.2, z: -20.1 }, target, 0.4)).toBe(true);
    expect(isArrivedAtDestination({ x: 11.5, z: -20 }, target, 0.4)).toBe(false);
  });

  it('prevents avatar from entering building bounding boxes and allows sliding', () => {
    const building = { minX: 10, maxX: 20, minZ: 10, maxZ: 20 };
    const radius = 0.5;
    const oldPos = { x: 8, z: 15 };
    const newPos = { x: 10.2, z: 15 }; // Trying to walk into building from left

    const resolved = resolveBoxCollision(newPos, oldPos, radius, building);
    // Should stop X progression before the building boundary
    expect(resolved.x).toBeLessThan(10);
    // Z coordinate should remain intact for sliding
    expect(resolved.z).toBe(15);
  });
});
