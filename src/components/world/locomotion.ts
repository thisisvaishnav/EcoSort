import * as THREE from 'three';
import { WorldObstacle } from './types';
import { PlayerCharacter } from './playerCharacter';

export interface LocomotionEngine {
  update: (delta: number, cameraAzimuthAngle: number) => void;
  createRaycastHandler: (event: MouseEvent | PointerEvent, container: HTMLElement, camera: THREE.Camera) => void;
  /** Virtual joystick input: x = right+, y = down+ (screen space), clamped to unit circle. */
  setJoystickVector: (x: number, y: number) => void;
  destinationRing: THREE.Group;
  getPosition: () => THREE.Vector3;
  setPosition: (pos: THREE.Vector3) => void;
  setObstacles: (newObstacles: WorldObstacle[]) => void;
  setBounds: (minX: number, maxX: number, minZ: number, maxZ: number) => void;
  isMoving: boolean;
  dispose: () => void;
}

/** Joystick values closer to centre than this are treated as "centered". */
export const JOYSTICK_DEAD_ZONE = 0.15;

export interface JoystickMoveDir {
  x: number;
  z: number;
  /** Stick pushed down → walk backward without turning around (matches S key). */
  backward: boolean;
}

/**
 * Map a joystick vector to a camera-relative move direction.
 * Same camera-relative math as the WASD branch in update():
 * stick right = camera right, stick up = camera forward.
 * Returns null inside the dead zone (no movement).
 */
export function joystickToMoveDir(
  x: number,
  y: number,
  cameraAzimuthAngle: number
): JoystickMoveDir | null {
  const magnitude = Math.hypot(x, y);
  if (magnitude < JOYSTICK_DEAD_ZONE) return null;

  // Normalize so any deflection past the dead zone walks at full speed
  const inputX = x / magnitude;
  const inputZ = y / magnitude;

  const sin = Math.sin(cameraAzimuthAngle);
  const cos = Math.cos(cameraAzimuthAngle);
  const moveDirX = inputX * cos + inputZ * sin;
  const moveDirZ = -inputX * sin + inputZ * cos;
  const len = Math.hypot(moveDirX, moveDirZ) || 1;

  return {
    x: moveDirX / len,
    z: moveDirZ / len,
    backward: inputZ > 0,
  };
}

/**
 * True when focus is inside a text field (Ask Eco chat, modals, etc.).
 * Game keys must stand down while the player is typing.
 */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return true;
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const attr = target.getAttribute('contenteditable');
  return attr !== null && attr !== 'false';
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

  // Virtual joystick state (MEADOWS HUD) — {0,0} means centered/idle
  const joystick = { x: 0, y: 0 };

  const setJoystickVector = (x: number, y: number) => {
    joystick.x = x;
    joystick.y = y;
    if (Math.hypot(x, y) >= JOYSTICK_DEAD_ZONE) {
      // Joystick overrides click-to-move (same precedence as the keyboard)
      clickDestination = null;
      destinationRing.visible = false;
    }
  };

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
    if (isTypingTarget(e.target)) return; // typing in a field — don't walk
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

  // 3. Tap-to-Move Raycast Handler (touch: tap the ground to walk there)
  const raycaster = new THREE.Raycaster();
  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

  const createRaycastHandler = (event: MouseEvent | PointerEvent, container: HTMLElement, camera: THREE.Camera) => {
    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const ndcX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const ndcY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);

    const hit = new THREE.Vector3();
    if (!raycaster.ray.intersectPlane(groundPlane, hit)) return;

    clickDestination = new THREE.Vector3(
      Math.max(bounds.minX, Math.min(bounds.maxX, hit.x)),
      0,
      Math.max(bounds.minZ, Math.min(bounds.maxZ, hit.z))
    );
    destinationRing.position.set(clickDestination.x, 0, clickDestination.z);
    destinationRing.visible = true;
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
    // Drop any held key the moment focus lands in a text field, so Kai stops
    // mid-stride instead of walking while the player types.
    if (isTypingTarget(document.activeElement)) {
      keysDown.clear();
      clickDestination = null;
      destinationRing.visible = false;
    }

    let moveDirX = 0;
    let moveDirZ = 0;
    let isBackwardInput = false;

    // Joystick beats keys beats click-destination
    const joystickDir = joystickToMoveDir(joystick.x, joystick.y, cameraAzimuthAngle);

    // Check keyboard input
    const isW = keysDown.has('w') || keysDown.has('arrowup');
    const isS = keysDown.has('s') || keysDown.has('arrowdown');
    const isA = keysDown.has('a') || keysDown.has('arrowleft');
    const isD = keysDown.has('d') || keysDown.has('arrowright');

    const inputX = (isD ? 1 : 0) - (isA ? 1 : 0);
    const inputZ = (isS ? 1 : 0) - (isW ? 1 : 0); // -1 is forward (North)

    if (joystickDir) {
      moveDirX = joystickDir.x;
      moveDirZ = joystickDir.z;
      isMoving = true;
      isBackwardInput = joystickDir.backward;
    } else if (inputX !== 0 || inputZ !== 0) {
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
    setJoystickVector,
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
