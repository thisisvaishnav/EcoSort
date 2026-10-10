import * as THREE from 'three';
import { WorldObstacle } from './types';
import { PlayerCharacter } from './playerCharacter';

export interface LocomotionEngine {
  update: (delta: number, cameraAzimuthAngle: number) => void;
  createRaycastHandler: (event: MouseEvent | PointerEvent, container: HTMLElement, camera: THREE.Camera) => void;
  destinationRing: THREE.Group;
  getPosition: () => THREE.Vector3;
  setPosition: (pos: THREE.Vector3) => void;
  setObstacles: (newObstacles: WorldObstacle[]) => void;
  setBounds: (minX: number, maxX: number, minZ: number, maxZ: number) => void;
  isMoving: boolean;
  dispose: () => void;
}

export function createLocomotionEngine(
  player: PlayerCharacter,
  obstacles: WorldObstacle[],
  initialPosition = new THREE.Vector3(0, 0, 8)
): LocomotionEngine {
  const currentPos = initialPosition.clone();
  player.group.position.copy(currentPos);

  const keysDown = new Set<string>();
  let clickDestination: THREE.Vector3 | null = null;
  let isMoving = false;
  const avatarRadius = 0.55;
  const moveSpeed = 7.0; // meters per second

  let activeObstacles = [...obstacles];
  let bounds = { minX: -75, maxX: 75, minZ: -105, maxZ: 22 };

  // 1. Animated Destination Ring
  const destinationRing = new THREE.Group();
  destinationRing.visible = false;

  const ringGeo = new THREE.RingGeometry(0.35, 0.55, 32);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8, // vibrant cyan
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9,
  });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringMesh.rotation.x = -Math.PI / 2;
  ringMesh.position.y = 0.04;
  destinationRing.add(ringMesh);

  // Outer pulse ring
  const outerRingGeo = new THREE.RingGeometry(0.65, 0.75, 32);
  const outerRingMat = new THREE.MeshBasicMaterial({
    color: 0x0284c7,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.6,
  });
  const outerRingMesh = new THREE.Mesh(outerRingGeo, outerRingMat);
  outerRingMesh.rotation.x = -Math.PI / 2;
  outerRingMesh.position.y = 0.04;
  destinationRing.add(outerRingMesh);

  // 2. Keyboard Event Listeners
  const onKeyDown = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
      keysDown.add(key);
      clickDestination = null; // Keyboard overrides click-to-move
      destinationRing.visible = false;
    }
    if (e.code === 'Space') {
      player.celebrate();
    }
  };

  const onKeyUp = (e: KeyboardEvent) => {
    keysDown.delete(e.key.toLowerCase());
  };

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  // 3. Click-to-Move Raycast Handler (Disabled per tap-and-go removal)
  const createRaycastHandler = (_event: MouseEvent | PointerEvent, _container: HTMLElement, _camera: THREE.Camera) => {
    // Tap-and-go feature disabled
  };

  // 4. Collision Resolution
  const resolveCollisions = (newX: number, newZ: number, oldX: number, oldZ: number): { x: number; z: number } => {
    let resolvedX = newX;
    let resolvedZ = newZ;

    for (const obs of activeObstacles) {
      const minX = obs.minX - avatarRadius;
      const maxX = obs.maxX + avatarRadius;
      const minZ = obs.minZ - avatarRadius;
      const maxZ = obs.maxZ + avatarRadius;

      if (resolvedX > minX && resolvedX < maxX && resolvedZ > minZ && resolvedZ < maxZ) {
        // Slide resolution: check if old position was outside on X or Z
        const oldOutsideX = oldX <= minX || oldX >= maxX;
        const oldOutsideZ = oldZ <= minZ || oldZ >= maxZ;

        if (oldOutsideX && !oldOutsideZ) {
          resolvedX = oldX; // Block X, slide on Z
        } else if (oldOutsideZ && !oldOutsideX) {
          resolvedZ = oldZ; // Block Z, slide on X
        } else {
          // Block both or push to closest outside edge
          resolvedX = oldX;
          resolvedZ = oldZ;
        }
      }
    }

    return { x: resolvedX, z: resolvedZ };
  };

  // 5. Update Loop
  let ringAnimTime = 0;

  const update = (delta: number, cameraAzimuthAngle: number) => {
    let moveDirX = 0;
    let moveDirZ = 0;
    let isBackwardInput = false;

    // Check keyboard input
    const isW = keysDown.has('w') || keysDown.has('arrowup');
    const isS = keysDown.has('s') || keysDown.has('arrowdown');
    const isA = keysDown.has('a') || keysDown.has('arrowleft');
    const isD = keysDown.has('d') || keysDown.has('arrowright');

    const inputX = (isD ? 1 : 0) - (isA ? 1 : 0);
    const inputZ = (isS ? 1 : 0) - (isW ? 1 : 0); // -1 is forward (North)

    if (inputX !== 0 || inputZ !== 0) {
      // Camera-relative direction: W = camera forward, D = camera right
      // (matches camera offset (sin(yaw), cos(yaw)) so W always moves away from camera)
      const sin = Math.sin(cameraAzimuthAngle);
      const cos = Math.cos(cameraAzimuthAngle);
      moveDirX = inputX * cos + inputZ * sin;
      moveDirZ = -inputX * sin + inputZ * cos;

      const len = Math.hypot(moveDirX, moveDirZ);
      moveDirX /= len;
      moveDirZ /= len;
      isMoving = true;
      isBackwardInput = inputZ > 0; // S held: walk backward without turning around
    } else if (clickDestination) {
      // Move toward click destination
      const dx = clickDestination.x - currentPos.x;
      const dz = clickDestination.z - currentPos.z;
      const dist = Math.hypot(dx, dz);

      if (dist > 0.45) {
        moveDirX = dx / dist;
        moveDirZ = dz / dist;
        isMoving = true;
      } else {
        // Arrived at destination
        clickDestination = null;
        destinationRing.visible = false;
        isMoving = false;
      }
    } else {
      isMoving = false;
    }

    // Apply movement & collisions
    if (isMoving) {
      const stepDist = moveSpeed * delta;
      const targetX = currentPos.x + moveDirX * stepDist;
      const targetZ = currentPos.z + moveDirZ * stepDist;

      const resolved = resolveCollisions(targetX, targetZ, currentPos.x, currentPos.z);
      currentPos.x = Math.max(bounds.minX, Math.min(bounds.maxX, resolved.x));
      currentPos.z = Math.max(bounds.minZ, Math.min(bounds.maxZ, resolved.z));

      player.group.position.copy(currentPos);

      // Facing angle (Three.js 0 is +Z, so atan2(moveDirX, moveDirZ)).
      // Backward input keeps the current facing so Kai walks backward
      // instead of spinning to face the camera.
      if (!isBackwardInput) {
        const targetAngle = Math.atan2(moveDirX, moveDirZ);
        player.setFacingAngle(targetAngle, delta);
      }
    }

    // Update avatar procedural animation
    player.updateAnimation(isMoving, moveSpeed, delta);

    // Animate destination ring pulse
    if (destinationRing.visible) {
      ringAnimTime += delta * 6;
      const scale = 1.0 + Math.sin(ringAnimTime) * 0.15;
      ringMesh.scale.set(scale, scale, scale);
      outerRingMesh.scale.set(1.0 + Math.cos(ringAnimTime) * 0.1, 1.0 + Math.cos(ringAnimTime) * 0.1, 1);
    }
  };

  const dispose = () => {
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
  };

  return {
    update,
    createRaycastHandler,
    destinationRing,
    getPosition: () => currentPos,
    setPosition: (pos: THREE.Vector3) => {
      currentPos.copy(pos);
      player.group.position.copy(pos);
      clickDestination = null;
      destinationRing.visible = false;
    },
    setObstacles: (newObstacles: WorldObstacle[]) => {
      activeObstacles = [...newObstacles];
    },
    setBounds: (minX: number, maxX: number, minZ: number, maxZ: number) => {
      bounds = { minX, maxX, minZ, maxZ };
    },
    get isMoving() {
      return isMoving;
    },
    dispose,
  };
}
