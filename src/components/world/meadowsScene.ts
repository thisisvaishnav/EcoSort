/**
 * Meadows Scene — Level 7 "Green Meadows Rescue"
 *
 * Stylized split world: a central paver path runs from the player spawn to the
 * GREEN MEADOWS RESIDENCY building. The left half is dry and polluted (dirt),
 * the right half is lush (grass). Full prop detail (dumpster, trash piles,
 * trees, bench, flowers) lands in a later pass — this is the scaffold the HUD
 * sits on.
 *
 * Scene layout (top-down):
 *   Z = -12.5 → Building rear
 *   Z =  -8.5 → Building front face / entrance canopy
 *   Z =  -7.5 → Path start (building end)
 *   Z =  +3   → Path midpoint (player spawn area)
 *   Z = +14   → Path end (behind the player)
 */

import * as THREE from 'three';
import { WorldObstacle } from './types';

export interface MeadowsSceneResult {
  meadowsGroup: THREE.Group;
  obstacles: WorldObstacle[];
  /** Front face of the building on the ground plane — spawn faces this. */
  buildingFront: THREE.Vector3;
  /** Midpoint of the central path — asserts the path is centred on x = 0. */
  pathCenter: THREE.Vector3;
  animate: (elapsed: number, delta: number) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Palette
// ─────────────────────────────────────────────────────────────────────────────
const COL = {
  dirt: new THREE.Color('#6b4a32'),
  grass: new THREE.Color('#5fae3a'),
  path: '#c9b08a',
  curb: '#b9a284',
  brick: '#b5654a',
  wall: '#d9a98b',
  accent: '#c77f8f',
  entrance: '#4a3a35',
  window: '#9ec9e8',
  sun: '#ffd9a0',
  skyTop: new THREE.Color('#7fb4e8'),
  skyHorizon: new THREE.Color('#ffd9a0'),
  fog: 0xf3ddc0,
};

// Path / ground constants (mirrored in tests/meadowsScene.test.ts)
export const MEADOWS_PATH_HALF_WIDTH = 1.75;
export const MEADOWS_PATH_Z_START = -7.5;
export const MEADOWS_PATH_Z_END = 14;
export const MEADOWS_SPAWN = new THREE.Vector3(0, 0, 10);

// ─────────────────────────────────────────────────────────────────────────────
// Canvas texture helpers (jsdom-safe: every getContext call is guarded)
// ─────────────────────────────────────────────────────────────────────────────
function makePaverTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = COL.path;
  ctx.fillRect(0, 0, 256, 256);

  // Paver joints — offset rows for a running-bond look
  ctx.strokeStyle = 'rgba(120, 100, 76, 0.55)';
  ctx.lineWidth = 3;
  const rowH = 42;
  for (let row = 0, y = 0; y <= 256; y += rowH, row++) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();

    const offset = row % 2 === 0 ? 0 : 64;
    for (let x = offset; x <= 256; x += 128) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + rowH);
      ctx.stroke();
    }
  }
  return new THREE.CanvasTexture(canvas);
}

function makeNameTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 96;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = 'rgba(58, 46, 42, 0.92)';
  ctx.beginPath();
  const r = 24;
  ctx.moveTo(r, 0);
  ctx.lineTo(512 - r, 0);
  ctx.quadraticCurveTo(512, 0, 512, r);
  ctx.lineTo(512, 96 - r);
  ctx.quadraticCurveTo(512, 96, 512 - r, 96);
  ctx.lineTo(r, 96);
  ctx.quadraticCurveTo(0, 96, 0, 96 - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#ffe9c7';
  ctx.font = 'bold 44px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('GREEN MEADOWS RESIDENCY', 256, 50);
  return new THREE.CanvasTexture(canvas);
}

/** Deterministic 0..1 hash so the ground blend is stable across runs. */
function hashNoise(x: number, y: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

// ─────────────────────────────────────────────────────────────────────────────
// Scene factory
// ─────────────────────────────────────────────────────────────────────────────
export function createMeadowsScene(): MeadowsSceneResult {
  const group = new THREE.Group();
  group.name = 'meadows_scene';

  const obstacles: WorldObstacle[] = [];

  // ── Lighting ──────────────────────────────────────────────────────────────
  const ambient = new THREE.AmbientLight(0xfff2e0, 0.45);
  group.add(ambient);

  // Warm low sun from the back-left — long shadows across the path
  const sun = new THREE.DirectionalLight(COL.sun, 1.7);
  sun.position.set(-14, 9, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 70;
  sun.shadow.camera.left = -22;
  sun.shadow.camera.right = 22;
  sun.shadow.camera.top = 22;
  sun.shadow.camera.bottom = -22;
  group.add(sun);

  // Sky-blue / warm-ground fill
  const hemi = new THREE.HemisphereLight(0xbfd8ff, 0x6b5a3f, 0.7);
  group.add(hemi);

  // ── Ground: dirt (left) ↔ grass (right), blended down the centre ─────────
  const groundGeo = new THREE.PlaneGeometry(32, 30, 32, 30);
  const positions = groundGeo.attributes.position;
  const colors = new Float32Array(positions.count * 3);
  const tmp = new THREE.Color();
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const noise = (hashNoise(x, y) - 0.5) * 0.14;
    // Soft blend band around x = 0 (±0.8 m)
    const t = THREE.MathUtils.clamp((x + 0.8) / 1.6, 0, 1);
    tmp.copy(COL.dirt).lerp(COL.grass, t);
    tmp.offsetHSL(0, 0, noise * 0.5);
    colors[i * 3] = tmp.r;
    colors[i * 3 + 1] = tmp.g;
    colors[i * 3 + 2] = tmp.b;
  }
  groundGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const groundMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.95,
    metalness: 0,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  group.add(ground);

  // ── Central paver path ────────────────────────────────────────────────────
  const paverTex = makePaverTexture();
  paverTex.wrapS = THREE.RepeatWrapping;
  paverTex.wrapT = THREE.RepeatWrapping;
  paverTex.repeat.set(2, 8);
  const pathLen = MEADOWS_PATH_Z_END - MEADOWS_PATH_Z_START;
  const pathGeo = new THREE.PlaneGeometry(MEADOWS_PATH_HALF_WIDTH * 2, pathLen);
  const pathMat = new THREE.MeshStandardMaterial({ map: paverTex, roughness: 0.85 });
  const path = new THREE.Mesh(pathGeo, pathMat);
  path.rotation.x = -Math.PI / 2;
  path.position.set(0, 0.02, (MEADOWS_PATH_Z_START + MEADOWS_PATH_Z_END) / 2);
  path.receiveShadow = true;
  group.add(path);

  // Curbs along both edges — brick tone on the lush (right) side
  const curbGeo = new THREE.BoxGeometry(0.28, 0.14, pathLen);
  const leftCurb = new THREE.Mesh(
    curbGeo,
    new THREE.MeshStandardMaterial({ color: COL.curb, roughness: 0.8 })
  );
  leftCurb.position.set(-MEADOWS_PATH_HALF_WIDTH - 0.16, 0.07, path.position.z);
  leftCurb.receiveShadow = true;
  group.add(leftCurb);

  const rightCurb = new THREE.Mesh(
    curbGeo,
    new THREE.MeshStandardMaterial({ color: COL.brick, roughness: 0.8 })
  );
  rightCurb.position.set(MEADOWS_PATH_HALF_WIDTH + 0.16, 0.07, path.position.z);
  rightCurb.receiveShadow = true;
  group.add(rightCurb);

  // ── GREEN MEADOWS RESIDENCY building ─────────────────────────────────────
  const buildW = 12;
  const buildH = 12;
  const buildD = 4;
  const buildZ = -10.5;
  const frontZ = buildZ + buildD / 2; // -8.5

  const wallMat = new THREE.MeshStandardMaterial({ color: COL.wall, roughness: 0.8 });
  const building = new THREE.Mesh(new THREE.BoxGeometry(buildW, buildH, buildD), wallMat);
  building.position.set(0, buildH / 2, buildZ);
  building.castShadow = true;
  building.receiveShadow = true;
  group.add(building);

  obstacles.push({
    id: 'building',
    type: 'building',
    minX: -buildW / 2 - 0.3,
    maxX: buildW / 2 + 0.3,
    minZ: buildZ - buildD / 2 - 0.3,
    maxZ: frontZ + 0.3,
  });

  // Pink accent bands between floors (6 floors)
  const accentMat = new THREE.MeshStandardMaterial({ color: COL.accent, roughness: 0.6 });
  for (let floor = 1; floor < 6; floor++) {
    const band = new THREE.Mesh(new THREE.BoxGeometry(buildW + 0.15, 0.3, buildD + 0.15), accentMat);
    band.position.set(0, floor * 2, buildZ);
    group.add(band);
  }

  // Window grid: 6 floors × 5 columns on the front face
  const windowMat = new THREE.MeshStandardMaterial({
    color: COL.window,
    roughness: 0.15,
    metalness: 0.25,
    emissive: 0x27415c,
    emissiveIntensity: 0.35,
  });
  const frameMat = new THREE.MeshStandardMaterial({ color: 0xf3e4d4, roughness: 0.7 });
  for (let floor = 0; floor < 6; floor++) {
    for (let col = -2; col <= 2; col++) {
      if (floor === 0 && col === 0) continue; // entrance occupies the middle
      const x = col * 2.2;
      const y = 1.3 + floor * 2;
      const frame = new THREE.Mesh(new THREE.BoxGeometry(1.15, 1.3, 0.1), frameMat);
      frame.position.set(x, y, frontZ + 0.03);
      group.add(frame);

      const win = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.1, 0.12), windowMat);
      win.position.set(x, y, frontZ + 0.06);
      group.add(win);
    }
  }

  // Entrance: dark brown portal + canopy + glass doors
  const entranceMat = new THREE.MeshStandardMaterial({ color: COL.entrance, roughness: 0.7 });
  const portal = new THREE.Mesh(new THREE.BoxGeometry(3.4, 3.4, 0.3), entranceMat);
  portal.position.set(0, 1.7, frontZ + 0.05);
  group.add(portal);

  const canopy = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.35, 1.6), entranceMat);
  canopy.position.set(0, 3.5, frontZ + 0.8);
  canopy.castShadow = true;
  group.add(canopy);

  const doorMat = new THREE.MeshStandardMaterial({
    color: 0x86b6d6,
    roughness: 0.05,
    metalness: 0.6,
    emissive: 0x1c3547,
    emissiveIntensity: 0.5,
  });
  const door = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.6, 0.16), doorMat);
  door.position.set(0, 1.3, frontZ + 0.16);
  group.add(door);

  // Name sign above the entrance
  const nameTex = makeNameTexture();
  const nameSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: nameTex }));
  nameSprite.position.set(0, 4.6, frontZ + 0.35);
  nameSprite.scale.set(6, 1.1, 1);
  group.add(nameSprite);

  // ── Street lamps flanking the path ───────────────────────────────────────
  const lampBulbMat = new THREE.MeshStandardMaterial({
    color: 0xfff3c4,
    emissive: 0xffe08a,
    emissiveIntensity: 1.1,
    roughness: 0.3,
  });
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x3f4a42, roughness: 0.6, metalness: 0.4 });
  const lampLights: THREE.PointLight[] = [];

  for (const [lx, lz] of [
    [-3.6, 4],
    [3.6, 4],
  ] as const) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 3.6, 10), poleMat);
    pole.position.set(lx, 1.8, lz);
    pole.castShadow = true;
    group.add(pole);

    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.1, 0.1), poleMat);
    arm.position.set(lx + (lx < 0 ? 0.45 : -0.45), 3.55, lz);
    group.add(arm);

    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 10), lampBulbMat);
    bulb.position.set(lx + (lx < 0 ? 0.85 : -0.85), 3.45, lz);
    group.add(bulb);

    const light = new THREE.PointLight(0xffe6a8, 0.9, 11, 2);
    light.position.copy(bulb.position);
    group.add(light);
    lampLights.push(light);

    obstacles.push({
      id: `lamp_${lx < 0 ? 'left' : 'right'}`,
      type: 'prop',
      minX: lx - 0.35,
      maxX: lx + 0.35,
      minZ: lz - 0.35,
      maxZ: lz + 0.35,
    });
  }

  // ── Gradient sky dome (blue overhead → warm peach at the horizon) ────────
  const skyGeo = new THREE.SphereGeometry(140, 24, 16);
  const skyPos = skyGeo.attributes.position;
  const skyColors = new Float32Array(skyPos.count * 3);
  const skyTmp = new THREE.Color();
  for (let i = 0; i < skyPos.count; i++) {
    const ny = THREE.MathUtils.clamp(skyPos.getY(i) / 140, -1, 1);
    const t = THREE.MathUtils.smoothstep(ny, -0.1, 0.65);
    skyTmp.copy(COL.skyHorizon).lerp(COL.skyTop, t);
    skyColors[i * 3] = skyTmp.r;
    skyColors[i * 3 + 1] = skyTmp.g;
    skyColors[i * 3 + 2] = skyTmp.b;
  }
  skyGeo.setAttribute('color', new THREE.BufferAttribute(skyColors, 3));
  const sky = new THREE.Mesh(
    skyGeo,
    new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, depthWrite: false })
  );
  sky.name = 'sky_dome';
  group.add(sky);

  // ── Animate ───────────────────────────────────────────────────────────────
  function animate(elapsed: number, _delta: number) {
    // Gentle warm-lamp flicker
    lampLights.forEach((light, i) => {
      light.intensity = 0.85 + 0.08 * Math.sin(elapsed * 2.2 + i * 1.7);
    });
  }

  return {
    meadowsGroup: group,
    obstacles,
    buildingFront: new THREE.Vector3(0, 0, frontZ),
    pathCenter: new THREE.Vector3(
      0,
      0,
      (MEADOWS_PATH_Z_START + MEADOWS_PATH_Z_END) / 2
    ),
    animate,
  };
}
