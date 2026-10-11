import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import {
  createThirdPersonCamera,
  pinchZoomDelta,
  pinchPitchDelta,
} from '../src/components/world/thirdPersonCamera';
import { createLocomotionEngine } from '../src/components/world/locomotion';
import { createPlayerCharacter } from '../src/components/world/playerCharacter';

const settle = (sys: ReturnType<typeof createThirdPersonCamera>, frames = 90) => {
  const target = new THREE.Vector3(0, 0, 0);
  for (let i = 0; i < frames; i++) sys.update(target, 1 / 60);
};

const lookPoint = new THREE.Vector3(0, 1.4, 0);

describe('pinch gesture math', () => {
  it('zooms in when fingers spread apart', () => {
    // spread: previous distance > current distance → camera distance must shrink
    expect(pinchZoomDelta(200, 100)).toBeLessThan(0);
  });

  it('zooms out when fingers pinch together', () => {
    expect(pinchZoomDelta(100, 200)).toBeGreaterThan(0);
  });

  it('is antisymmetric around a stable pinch', () => {
    expect(pinchZoomDelta(150, 150)).toBe(0);
    expect(pinchZoomDelta(200, 100)).toBe(-pinchZoomDelta(100, 200));
  });

  it('raises pitch when two fingers drag down (matches mouse pitch drag)', () => {
    expect(pinchPitchDelta(300, 320)).toBeGreaterThan(0);
    expect(pinchPitchDelta(320, 300)).toBeLessThan(0);
    expect(pinchPitchDelta(300, 300)).toBe(0);
  });
});

describe('camera zoomBy / adjustPitch (touch controls)', () => {
  it('clamps pinch zoom-in to 5 m minimum', () => {
    const sys = createThirdPersonCamera(16 / 9);
    sys.zoomBy(-10_000);
    settle(sys);
    const dist = sys.camera.position.distanceTo(lookPoint);
    expect(dist).toBeGreaterThanOrEqual(4.9);
    expect(dist).toBeLessThanOrEqual(5.2);
  });

  it('clamps pinch zoom-out to 55 m maximum', () => {
    const sys = createThirdPersonCamera(16 / 9);
    sys.zoomBy(10_000);
    settle(sys);
    const dist = sys.camera.position.distanceTo(lookPoint);
    expect(dist).toBeGreaterThanOrEqual(54.7);
    expect(dist).toBeLessThanOrEqual(55.3);
  });

  it('raises the camera on positive pitch drag and clamps the range', () => {
    const base = createThirdPersonCamera(16 / 9);
    settle(base);

    const raised = createThirdPersonCamera(16 / 9);
    raised.adjustPitch(10_000);
    settle(raised);
    expect(raised.camera.position.y).toBeGreaterThan(base.camera.position.y + 1);

    // Clamped: a second huge drag changes nothing
    const yBefore = raised.camera.position.y;
    raised.adjustPitch(10_000);
    settle(raised);
    expect(Math.abs(raised.camera.position.y - yBefore)).toBeLessThan(0.05);

    // Lowering past the floor is also clamped
    const lowered = createThirdPersonCamera(16 / 9);
    lowered.adjustPitch(-10_000);
    settle(lowered);
    expect(lowered.camera.position.y).toBeLessThan(base.camera.position.y - 1);
  });
});

describe('tap-to-move (touch locomotion)', () => {
  const makeWorld = () => {
    const player = createPlayerCharacter();
    const engine = createLocomotionEngine(player, [], new THREE.Vector3(0, 0, 8));
    const camera = new THREE.PerspectiveCamera(50, 800 / 600, 0.1, 400);
    camera.position.set(0, 10, 14);
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();
    const container = {
      getBoundingClientRect: () => ({
        left: 0,
        top: 0,
        width: 800,
        height: 600,
        right: 800,
        bottom: 600,
        x: 0,
        y: 0,
      }),
    } as unknown as HTMLElement;
    return { player, engine, camera, container };
  };

  it('a center tap sets a walk destination and shows the ring', () => {
    const { engine, camera, container } = makeWorld();
    const tap = new MouseEvent('pointerdown', { clientX: 400, clientY: 300 });

    engine.createRaycastHandler(tap, container, camera);

    expect(engine.destinationRing.visible).toBe(true);
    engine.update(1 / 60, 0);
    expect(engine.isMoving).toBe(true);
  });

  it('Kai walks to the tapped point and the ring hides on arrival', () => {
    const { engine, camera, container } = makeWorld();
    const tap = new MouseEvent('pointerdown', { clientX: 400, clientY: 300 });
    engine.createRaycastHandler(tap, container, camera);

    for (let i = 0; i < 120; i++) engine.update(1 / 60, 0);

    // Tapped point ≈ world origin (camera looks at it through screen center)
    const pos = engine.getPosition();
    expect(pos.length()).toBeLessThan(0.6);
    expect(engine.isMoving).toBe(false);
    expect(engine.destinationRing.visible).toBe(false);
  });

  it('keyboard overrides tap-to-move (W clears the destination)', () => {
    const { engine, camera, container } = makeWorld();
    const tap = new MouseEvent('pointerdown', { clientX: 400, clientY: 300 });
    engine.createRaycastHandler(tap, container, camera);
    expect(engine.destinationRing.visible).toBe(true);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
    expect(engine.destinationRing.visible).toBe(false);
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'w' }));
  });
});

describe('trackpad camera panYaw (mobile look around)', () => {
  it('panYaw offsets camera targetYaw and updates azimuth angle', () => {
    const sys = createThirdPersonCamera(16 / 9);
    settle(sys);
    const initialAzimuth = sys.getAzimuthAngle();

    // Pan camera 90 degrees (Math.PI / 2) to the right
    sys.panYaw(Math.PI / 2);
    settle(sys);

    const newAzimuth = sys.getAzimuthAngle();
    // Yaw should have increased by ~PI/2
    const diff = Math.atan2(Math.sin(newAzimuth - initialAzimuth), Math.cos(newAzimuth - initialAzimuth));
    expect(diff).toBeCloseTo(Math.PI / 2, 1);
  });

  it('panYaw prevents automatic facing angle snap unless resetManualYaw is called', () => {
    const sys = createThirdPersonCamera(16 / 9);
    settle(sys);

    // Pan yaw manually
    sys.panYaw(1.2);
    const target = new THREE.Vector3(0, 0, 0);

    // Update with facingAngle 0 for 60 frames
    for (let i = 0; i < 60; i++) sys.update(target, 1 / 60, 0);
    const manualYaw = sys.getAzimuthAngle();

    // Now reset manual yaw
    sys.resetManualYaw();
    for (let i = 0; i < 60; i++) sys.update(target, 1 / 60, 0);
    const snappedYaw = sys.getAzimuthAngle();

    // Snapped yaw should align behind Kai (0 + Math.PI = Math.PI)
    expect(snappedYaw).toBeCloseTo(Math.PI, 1);
    expect(Math.abs(manualYaw - snappedYaw)).toBeGreaterThan(0.5);
  });
});
