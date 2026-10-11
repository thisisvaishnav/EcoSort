import * as THREE from 'three';
import { WorldObstacle } from './types';

// ── Touch gesture math (pure, unit-tested in tests/touchInput.test.ts) ──────
// Spread (prev > next) → negative delta → zoom in (targetDistance shrinks).
export function pinchZoomDelta(prevDist: number, dist: number): number {
  return (dist - prevDist) * 0.06;
}

// Two-finger drag down → positive delta → camera rises (same as mouse pitch drag).
export function pinchPitchDelta(prevMidY: number, midY: number): number {
  return (midY - prevMidY) * 0.004;
}

export interface ThirdPersonCameraSystem {
  camera: THREE.PerspectiveCamera;
  update: (targetPos: THREE.Vector3, delta: number, facingAngle?: number) => void;
  onWheel: (event: WheelEvent) => void;
  onPointerDown: (event: PointerEvent) => void;
  onPointerMove: (event: PointerEvent) => void;
  onPointerUp: (event: PointerEvent) => void;
  zoomBy: (delta: number) => void;
  adjustPitch: (delta: number) => void;
  panYaw: (deltaYaw: number) => void;
  resetManualYaw: () => void;
  getAzimuthAngle: () => number;
  setDistance: (distance: number) => void;
  setOrbit: (yaw: number, pitchOffset?: number) => void;
}

export function createThirdPersonCamera(
  aspect: number,
  obstacles: WorldObstacle[] = []
): ThirdPersonCameraSystem {
  const camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 400);

  // Orbit state — yaw is locked behind the character (facing + π)
  let currentDistance = 14.0; // default initial zoom
  let targetDistance = 14.0;
  let yaw = Math.PI; // start behind Kai (he spawns facing 0)
  let targetYaw = Math.PI;
  let pitchOffset = 0; // user fine pitch adjustment from right-click drag

  let isRightClickDragging = false;
  let lastMouseY = 0;

  const currentLookAt = new THREE.Vector3();

  // Raycaster for occlusion detection
  const raycaster = new THREE.Raycaster();

  // Scratch objects reused every frame — the update loop must not allocate.
  const scratchLookTarget = new THREE.Vector3();
  const desiredCamPos = new THREE.Vector3();
  const rayDir = new THREE.Vector3();
  const obsBox = new THREE.Box3();
  const hitPoint = new THREE.Vector3();

  // Zoom distance clamp strictly between 5.0m and 55.0m
  const clampDistance = (dist: number) => Math.max(5.0, Math.min(55.0, dist));

  // Dynamic elevation calculation based on zoom distance
  const calculateBasePitch = (dist: number) => {
    const t = (dist - 5.0) / (55.0 - 5.0); // 0 to 1
    const minPitch = 22 * (Math.PI / 180); // 22 deg at 5.0m
    const maxPitch = 64 * (Math.PI / 180); // 64 deg at 55.0m
    return minPitch + t * (maxPitch - minPitch);
  };

  const onWheel = (event: WheelEvent) => {
    event.preventDefault();
    const zoomDelta = event.deltaY * 0.035;
    targetDistance = clampDistance(targetDistance + zoomDelta);
  };

  const onPointerDown = (event: PointerEvent) => {
    if (event.button === 2) {
      // Right click (yaw orbit removed: camera always stays behind Kai)
      isRightClickDragging = true;
      lastMouseY = event.clientY;
    }
  };

  const onPointerMove = (event: PointerEvent) => {
    if (isRightClickDragging) {
      const deltaY = event.clientY - lastMouseY;
      lastMouseY = event.clientY;

      pitchOffset = Math.max(-0.25, Math.min(0.35, pitchOffset + deltaY * 0.004));
    }
  };

  let isManualYaw = false;

  const onPointerUp = (event: PointerEvent) => {
    if (event.button === 2) {
      isRightClickDragging = false;
    }
  };

  const update = (targetPos: THREE.Vector3, delta: number, facingAngle?: number) => {
    // Smooth interpolation for distance
    currentDistance = THREE.MathUtils.lerp(currentDistance, targetDistance, Math.min(1.0, delta * 10.0));

    // When moving or not in manual yaw drag, keep the camera aligned behind Kai
    if (facingAngle !== undefined && !isManualYaw) {
      targetYaw = facingAngle + Math.PI;
    }

    // Shortest-path yaw smoothing (handles ±π wrap)
    const yawDelta = Math.atan2(Math.sin(targetYaw - yaw), Math.cos(targetYaw - yaw));
    yaw += yawDelta * Math.min(1.0, delta * 12.0);

    // Dynamic pitch: base elevation + user right-drag offset
    const totalPitch = Math.max(0.18, Math.min(1.25, calculateBasePitch(currentDistance) + pitchOffset));

    // Focus point is player's chest/head height
    scratchLookTarget.set(targetPos.x, targetPos.y + 1.4, targetPos.z);
    currentLookAt.lerp(scratchLookTarget, Math.min(1.0, delta * 14.0));

    // Calculate ideal camera spherical coordinates relative to look target
    const horizontalDist = currentDistance * Math.cos(totalPitch);
    const verticalDist = currentDistance * Math.sin(totalPitch);

    desiredCamPos.set(
      currentLookAt.x + horizontalDist * Math.sin(yaw),
      currentLookAt.y + verticalDist,
      currentLookAt.z + horizontalDist * Math.cos(yaw)
    );

    // Collision Raycast: check if a building obstacle is between look target and camera
    let actualDistance = currentDistance;
    rayDir.copy(desiredCamPos).sub(currentLookAt).normalize();

    // Check simple obstacle line segment intersections to prevent camera clipping inside buildings
    for (const obs of obstacles) {
      if (obs.type === 'building') {
        obsBox.min.set(obs.minX, 0, obs.minZ);
        obsBox.max.set(obs.maxX, 8, obs.maxZ);
        raycaster.set(currentLookAt, rayDir);
        const hit = raycaster.ray.intersectBox(obsBox, hitPoint);
        if (hit) {
          const hitDist = currentLookAt.distanceTo(hit);
          if (hitDist > 1.5 && hitDist < actualDistance) {
            actualDistance = Math.max(3.5, hitDist - 0.5);
          }
        }
      }
    }

    const finalHorizontal = actualDistance * Math.cos(totalPitch);
    const finalVertical = actualDistance * Math.sin(totalPitch);

    camera.position.set(
      currentLookAt.x + finalHorizontal * Math.sin(yaw),
      currentLookAt.y + finalVertical,
      currentLookAt.z + finalHorizontal * Math.cos(yaw)
    );

    camera.lookAt(currentLookAt);
  };

  return {
    camera,
    update,
    onWheel,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    zoomBy: (delta: number) => {
      targetDistance = clampDistance(targetDistance + delta);
    },
    adjustPitch: (delta: number) => {
      pitchOffset = Math.max(-0.25, Math.min(0.35, pitchOffset + delta));
    },
    panYaw: (deltaYaw: number) => {
      isManualYaw = true;
      targetYaw += deltaYaw;
    },
    resetManualYaw: () => {
      isManualYaw = false;
    },
    getAzimuthAngle: () => yaw,
    setDistance: (dist: number) => {
      targetDistance = clampDistance(dist);
    },
    setOrbit: (newYaw: number, newPitchOffset = 0) => {
      targetYaw = newYaw;
      yaw = newYaw;
      pitchOffset = newPitchOffset;
    },
  };
}
