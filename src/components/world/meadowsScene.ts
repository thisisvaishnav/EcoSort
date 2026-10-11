/**
 * Meadows Scene — Level 7 "Green Meadows Rescue"
 *
 * Stylized split world with perimeter road route and surrounding city buildings:
 *   - Left side: Polluted mud wasteland with dead leafless trees, swirling dust particles,
 *     mud puddles, rough rocks, fallen logs, discarded tires/barrel, and a rich scatter
 *     of colorful, visible waste items (sourced from Mission 1 / Society map).
 *   - Central paver path: Leading to GREEN MEADOWS RESIDENCY.
 *   - Right side: Lush greenery with a green park bench, glowing street lamp,
 *     8 vibrant leafy trees across the entire green area, colorful wildflower patches,
 *     bushes, and sparkling nature motes.
 *   - Perimeter route: Asphalt road circuit with curbs, sidewalks, and road markings
 *     framing the perimeter around Green Meadows.
 *   - Surrounding buildings: Multi-story residential blocks, apartment towers, and
 *     townhouses enclosing the outside of the route (framing the district).
 *
 * Scene layout (top-down):
 *   Z = -12.5 → Building rear
 *   Z =  -8.5 → Building front face / entrance canopy
 *   Z =  -7.5 → Path start (building end)
 *   Z =  +3   → Path midpoint (player spawn area)
 *   Z = +14   → Path end (behind the player)
 *   Perimeter road routes at |X| ~ 19 and |Z| ~ 19.
 *   Surrounding buildings at |X| > 24 and |Z| > 24.
 */

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { BinType } from '../../types/game';
import { WorldObstacle } from './types';
import { createItemMesh } from './items/createItemMesh';

export interface MeadowsSceneResult {
  meadowsGroup: THREE.Group;
  obstacles: WorldObstacle[];
  /** Front face of the building on the ground plane — spawn faces this. */
  buildingFront: THREE.Vector3;
  /** Midpoint of the central path — asserts the path is centred on x = 0. */
  pathCenter: THREE.Vector3;
  /** Waste pile center hotspot position on left mud zone */
  wastePileCenter: THREE.Vector3;
  /** Controls visibility of the green glowing ground trail and floating waypoint arrow */
  setPathGuideVisible: (visible: boolean) => void;
  /** Garbage truck mesh group */
  truckMesh: THREE.Group;
  /** Truck starting position on the road */
  truckStartPos: THREE.Vector3;
  /** Truck parked target position near the waste pile */
  truckEndPos: THREE.Vector3;
  /** Animate truck driving in from the road to the waste pile (0 to 1 progress) */
  animateTruckArrival: (progress: number) => void;
  /** Animate truck lifting bins and driving away after sorting (0 to 1 progress) */
  animateTruckDeparture: (progress: number) => void;
  /** Set four color-coded bins visibility beside the truck */
  showTruckBins: (visible: boolean) => void;
  /** Phase 6 cleanup transformation: blends ground to cleaner earth, fades trash/dust (0 to 1 progress) */
  animateCleanup: (progress: number) => void;
  /** Four color-coded bin meshes for Mission 1 style sorting */
  binMeshes: Map<BinType, THREE.Mesh>;
  binTriggers: Map<BinType, THREE.Mesh>;
  binGlowRings: Map<BinType, THREE.Mesh>;
  binRowCenter: THREE.Vector3;
  triggerBinAnimation: (bin: BinType) => void;
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
  // Props
  benchGreen: 0x277435,
  benchIron: 0x1d2620,
  deadWood: 0x483a2d,
  deadBarkDark: 0x382c22,
  dustParticle: 0xc89e70,
  dustHaze: 0xb48b5d,
  puddleMud: 0x2d1e14,
  leafLight: 0x58b834,
  leafMid: 0x429626,
  leafDark: 0x31741d,
  flowerRed: 0xdd3838,
  flowerYellow: 0xffce3a,
  flowerWhite: 0xf4f7f2,
  flowerPurple: 0x9362c9,
  flowerPink: 0xec4899,
  flowerStem: 0x3d7b27,
  lampPole: 0x223227,
  lampGlow: 0xffe28a,
  // Perimeter Route & City
  roadAsphalt: 0x2d343f,
  roadCurb: 0x94a3b8,
  roadLineYellow: 0xfbbf24,
  roadLineWhite: 0xf8fafc,
  outerGround: 0x475543,
};

// Path / ground constants (mirrored in tests/meadowsScene.test.ts)
export const MEADOWS_PATH_HALF_WIDTH = 1.75;
export const MEADOWS_PATH_Z_START = -7.5;
export const MEADOWS_PATH_Z_END = 14;
export const MEADOWS_SPAWN = new THREE.Vector3(0, 0, 10);
export const MEADOWS_WASTE_PILE_CENTER = new THREE.Vector3(-6.0, 0.05, 4.0);
// Player locomotion bounds: freely roam across the central path, mud yard, green park, and perimeter road routes
export const MEADOWS_BOUNDS = { minX: -22.5, maxX: 22.5, minZ: -22.5, maxZ: 22.5 };

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

/** White bin icon on transparent background for Mission 1 dustbins */
function makeMeadowsBinIconTexture(binType: BinType): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.clearRect(0, 0, 256, 256);
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (binType === 'wet') {
    // Leaf
    ctx.beginPath();
    ctx.moveTo(128, 48);
    ctx.bezierCurveTo(70, 70, 60, 160, 128, 208);
    ctx.bezierCurveTo(196, 160, 186, 70, 128, 48);
    ctx.fill();
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(128, 65);
    ctx.lineTo(128, 195);
    ctx.stroke();
    ctx.restore();
  } else if (binType === 'hazardous') {
    // Caution triangle
    ctx.beginPath();
    ctx.moveTo(128, 52);
    ctx.lineTo(214, 196);
    ctx.lineTo(42, 196);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(128, 95);
    ctx.lineTo(128, 148);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(128, 172, 7, 0, Math.PI * 2);
    ctx.fill();
  } else if (binType === 'residual') {
    // Dustbin outline
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(72, 70);
    ctx.lineTo(184, 70);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(112, 52);
    ctx.lineTo(144, 52);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(86, 88);
    ctx.lineTo(98, 204);
    ctx.lineTo(158, 204);
    ctx.lineTo(170, 88);
    ctx.stroke();
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(116, 104);
    ctx.lineTo(119, 186);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(140, 104);
    ctx.lineTo(137, 186);
    ctx.stroke();
  } else {
    // Recycle loop (dry)
    ctx.save();
    ctx.translate(128, 128);
    for (let i = 0; i < 3; i++) {
      ctx.rotate((Math.PI * 2) / 3);
      ctx.beginPath();
      ctx.arc(0, -60, 36, -Math.PI * 0.4, Math.PI * 0.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(35, -72);
      ctx.lineTo(46, -42);
      ctx.lineTo(20, -50);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ─────────────────────────────────────────────────────────────────────────────
// Prop Builders
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a bare, dead tree with crooked branches and strictly NO leaves.
 */
function createDeadTree(x: number, z: number, scale = 1, rotY = 0): THREE.Group {
  const tree = new THREE.Group();
  tree.name = 'dead_tree';
  tree.position.set(x, 0, z);
  tree.rotation.y = rotY;
  tree.scale.setScalar(scale);

  const deadWoodMat = new THREE.MeshStandardMaterial({
    color: COL.deadWood,
    roughness: 0.95,
    metalness: 0.05,
  });

  // Main crooked trunk
  const trunkGeo = new THREE.CylinderGeometry(0.18, 0.32, 3.2, 8);
  const trunk = new THREE.Mesh(trunkGeo, deadWoodMat);
  trunk.position.set(0, 1.6, 0);
  trunk.rotation.z = -0.09;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  tree.add(trunk);

  // Upper bare trunk extension
  const upperGeo = new THREE.CylinderGeometry(0.1, 0.18, 2.1, 7);
  const upper = new THREE.Mesh(upperGeo, deadWoodMat);
  upper.position.set(-0.16, 3.8, 0.06);
  upper.rotation.z = 0.16;
  upper.castShadow = true;
  tree.add(upper);

  // Bare gnarled branches reaching upward and outward (no leaves / foliage)
  const branches = [
    { len: 1.9, rTop: 0.035, rBot: 0.1, px: 0.1, py: 2.7, pz: 0.12, rotX: 0.45, rotY: 0.7, rotZ: -0.7 },
    { len: 2.2, rTop: 0.03, rBot: 0.09, px: -0.22, py: 3.2, pz: -0.1, rotX: -0.5, rotY: -0.6, rotZ: 0.82 },
    { len: 1.6, rTop: 0.025, rBot: 0.08, px: 0.06, py: 4.2, pz: 0.16, rotX: 0.7, rotY: 2.1, rotZ: -0.55 },
    { len: 1.5, rTop: 0.025, rBot: 0.07, px: -0.12, py: 4.5, pz: -0.16, rotX: -0.6, rotY: -1.8, rotZ: 0.65 },
    { len: 1.1, rTop: 0.02, rBot: 0.05, px: 0.75, py: 3.5, pz: 0.65, rotX: 0.35, rotY: 1.2, rotZ: -0.42 },
    { len: 1.0, rTop: 0.02, rBot: 0.05, px: -0.85, py: 4.0, pz: -0.55, rotX: -0.4, rotY: -0.9, rotZ: 0.52 },
  ];

  for (const b of branches) {
    const branchGeo = new THREE.CylinderGeometry(b.rTop, b.rBot, b.len, 6);
    const branch = new THREE.Mesh(branchGeo, deadWoodMat);
    branch.position.set(b.px, b.py, b.pz);
    branch.rotation.set(b.rotX, b.rotY, b.rotZ);
    branch.castShadow = true;
    tree.add(branch);
  }

  return tree;
}

/**
 * Creates a healthy, lush tree with rich green leafy foliage.
 */
function createLushTree(x: number, z: number, scale = 1, rotY = 0): THREE.Group {
  const tree = new THREE.Group();
  tree.name = 'lush_tree';
  tree.position.set(x, 0, z);
  tree.rotation.y = rotY;
  tree.scale.setScalar(scale);

  const trunkMat = new THREE.MeshStandardMaterial({
    color: 0x5a3e28,
    roughness: 0.85,
  });
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.36, 3.4, 8), trunkMat);
  trunk.position.set(0, 1.7, 0);
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  tree.add(trunk);

  // Healthy green leafy canopy lobes
  const leafMat1 = new THREE.MeshStandardMaterial({ color: COL.leafMid, roughness: 0.75 });
  const leafMat2 = new THREE.MeshStandardMaterial({ color: COL.leafDark, roughness: 0.8 });
  const leafMat3 = new THREE.MeshStandardMaterial({ color: COL.leafLight, roughness: 0.7 });

  const lobes = [
    { geo: new THREE.DodecahedronGeometry(1.65, 1), mat: leafMat1, pos: [0, 4.0, 0] },
    { geo: new THREE.DodecahedronGeometry(1.25, 1), mat: leafMat2, pos: [-0.95, 3.6, 0.4] },
    { geo: new THREE.DodecahedronGeometry(1.3, 1), mat: leafMat3, pos: [0.9, 3.7, -0.3] },
    { geo: new THREE.DodecahedronGeometry(1.15, 1), mat: leafMat2, pos: [0.2, 4.85, 0.3] },
    { geo: new THREE.DodecahedronGeometry(1.05, 1), mat: leafMat1, pos: [-0.3, 4.5, -0.7] },
  ];

  for (const l of lobes) {
    const lobe = new THREE.Mesh(l.geo, l.mat);
    lobe.position.set(l.pos[0], l.pos[1], l.pos[2]);
    lobe.castShadow = true;
    lobe.receiveShadow = true;
    tree.add(lobe);
  }

  return tree;
}

/**
 * Creates a green park bench with green painted wooden slats and dark cast-iron frame.
 */
function createGreenBench(x: number, z: number, rotY = 0): THREE.Group {
  const bench = new THREE.Group();
  bench.name = 'green_bench';
  bench.position.set(x, 0, z);
  bench.rotation.y = rotY;

  const greenWoodMat = new THREE.MeshStandardMaterial({
    color: COL.benchGreen,
    roughness: 0.55,
    metalness: 0.05,
  });

  const ironMat = new THREE.MeshStandardMaterial({
    color: COL.benchIron,
    roughness: 0.4,
    metalness: 0.75,
  });

  const slatW = 1.9;
  const slatD = 0.12;
  const slatH = 0.035;

  // Seat slats
  for (let i = 0; i < 4; i++) {
    const seatSlat = new THREE.Mesh(new THREE.BoxGeometry(slatW, slatH, slatD), greenWoodMat);
    seatSlat.position.set(0, 0.52, -0.18 + i * 0.14);
    seatSlat.castShadow = true;
    seatSlat.receiveShadow = true;
    bench.add(seatSlat);
  }

  // Backrest slats (angled back)
  for (let i = 0; i < 3; i++) {
    const backSlat = new THREE.Mesh(new THREE.BoxGeometry(slatW, 0.11, slatH), greenWoodMat);
    backSlat.position.set(0, 0.78 + i * 0.14, -0.28 - i * 0.04);
    backSlat.rotation.x = -0.18;
    backSlat.castShadow = true;
    backSlat.receiveShadow = true;
    bench.add(backSlat);
  }

  // Cast iron legs and armrests
  for (const sideX of [-0.85, 0.85]) {
    const frontLeg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.52, 0.06), ironMat);
    frontLeg.position.set(sideX, 0.26, 0.24);
    frontLeg.castShadow = true;
    bench.add(frontLeg);

    const rearLeg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.05, 0.06), ironMat);
    rearLeg.position.set(sideX, 0.52, -0.28);
    rearLeg.rotation.x = -0.15;
    rearLeg.castShadow = true;
    bench.add(rearLeg);

    const seatBar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.55), ironMat);
    seatBar.position.set(sideX, 0.49, 0.02);
    seatBar.castShadow = true;
    bench.add(seatBar);

    const armrest = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.04, 0.48), ironMat);
    armrest.position.set(sideX, 0.72, 0.04);
    armrest.castShadow = true;
    bench.add(armrest);
  }

  return bench;
}

/**
 * Creates an ornate park lamp for the greenery area with warm light.
 */
function createGreeneryLamp(x: number, z: number): { group: THREE.Group; light: THREE.PointLight } {
  const lampGroup = new THREE.Group();
  lampGroup.name = 'greenery_lamp';
  lampGroup.position.set(x, 0, z);

  const metalMat = new THREE.MeshStandardMaterial({
    color: COL.lampPole,
    roughness: 0.4,
    metalness: 0.65,
  });

  // Base pedestal
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.32, 0.45, 10), metalMat);
  base.position.set(0, 0.225, 0);
  base.castShadow = true;
  lampGroup.add(base);

  // Main column
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.13, 3.6, 10), metalMat);
  pole.position.set(0, 2.05, 0);
  pole.castShadow = true;
  lampGroup.add(pole);

  // Decorative collar & arched arm
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.15, 10), metalMat);
  collar.position.set(0, 3.85, 0);
  lampGroup.add(collar);

  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.09, 0.09), metalMat);
  arm.position.set(-0.4, 3.9, 0);
  lampGroup.add(arm);

  // Lantern cap and cage
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.35, 6), metalMat);
  cap.position.set(-0.8, 4.15, 0);
  lampGroup.add(cap);

  // Glowing bulb / lantern glass
  const bulbMat = new THREE.MeshStandardMaterial({
    color: 0xfff6cf,
    emissive: COL.lampGlow,
    emissiveIntensity: 1.4,
    roughness: 0.2,
  });
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), bulbMat);
  bulb.position.set(-0.8, 3.85, 0);
  lampGroup.add(bulb);

  // Warm PointLight illuminating the green bench and garden
  const light = new THREE.PointLight(COL.lampGlow, 1.25, 13, 2);
  light.position.set(x - 0.8, 3.85, z);
  light.castShadow = true;

  return { group: lampGroup, light };
}

/**
 * Creates a damaged, rusted pole for the neglected mud side.
 */
function createDamagedLamp(x: number, z: number): THREE.Group {
  const group = new THREE.Group();
  group.name = 'damaged_lamp';
  group.position.set(x, 0, z);

  const rustMat = new THREE.MeshStandardMaterial({
    color: 0x583e2e,
    roughness: 0.95,
    metalness: 0.2,
  });

  // Tilted, rusted pole
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 3.2, 8), rustMat);
  pole.position.set(0, 1.55, 0);
  pole.rotation.z = -0.18; // bent/leaning into the mud
  pole.castShadow = true;
  group.add(pole);

  // Broken arm
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.08, 0.08), rustMat);
  arm.position.set(0.35, 3.0, 0);
  arm.rotation.z = -0.35;
  group.add(arm);

  // Dead unlit broken bulb housing
  const deadCap = new THREE.Mesh(
    new THREE.ConeGeometry(0.24, 0.25, 6),
    new THREE.MeshStandardMaterial({ color: 0x3d3128, roughness: 0.9 })
  );
  deadCap.position.set(0.65, 2.85, 0);
  deadCap.rotation.z = 0.4;
  group.add(deadCap);

  return group;
}

/**
 * Creates a cluster of wildflowers on the green lawn.
 */
function createFlowerPatch(
  x: number,
  z: number,
  count: number,
  colorHex: number
): THREE.Group {
  const patch = new THREE.Group();
  patch.position.set(x, 0, z);

  const stemMat = new THREE.MeshStandardMaterial({ color: COL.flowerStem, roughness: 0.8 });
  const petalMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.5 });
  const centerMat = new THREE.MeshStandardMaterial({ color: 0xffdd44, roughness: 0.4 });

  const stemGeo = new THREE.CylinderGeometry(0.015, 0.02, 0.28, 5);
  const petalGeo = new THREE.DodecahedronGeometry(0.07, 0);
  const centerGeo = new THREE.SphereGeometry(0.04, 6, 6);

  for (let i = 0; i < count; i++) {
    const fx = (Math.sin(i * 1.7) * 0.5 + Math.cos(i * 3.1) * 0.25);
    const fz = (Math.cos(i * 1.9) * 0.5 + Math.sin(i * 2.7) * 0.25);
    const stemH = 0.2 + (i % 3) * 0.05;

    const stem = new THREE.Mesh(stemGeo, stemMat);
    stem.position.set(fx, stemH / 2, fz);
    stem.rotation.z = (Math.sin(i) * 0.1);
    patch.add(stem);

    const petal = new THREE.Mesh(petalGeo, petalMat);
    petal.position.set(fx, stemH + 0.04, fz);
    patch.add(petal);

    if (colorHex !== COL.flowerYellow) {
      const center = new THREE.Mesh(centerGeo, centerMat);
      center.position.set(fx, stemH + 0.06, fz);
      patch.add(center);
    }
  }

  return patch;
}

/**
 * Creates a round lush green shrub/bush.
 */
function createBush(x: number, z: number, r = 0.7, colorHex: number = COL.leafMid): THREE.Group {
  const bush = new THREE.Group();
  bush.position.set(x, 0, z);
  const mat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.8 });

  const main = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 1), mat);
  main.position.set(0, r * 0.75, 0);
  main.castShadow = true;
  bush.add(main);

  const side1 = new THREE.Mesh(new THREE.DodecahedronGeometry(r * 0.75, 1), mat);
  side1.position.set(r * 0.6, r * 0.55, 0.2);
  side1.castShadow = true;
  bush.add(side1);

  const side2 = new THREE.Mesh(new THREE.DodecahedronGeometry(r * 0.7, 1), mat);
  side2.position.set(-r * 0.55, r * 0.5, -0.15);
  side2.castShadow = true;
  bush.add(side2);

  return bush;
}

// ─────────────────────────────────────────────────────────────────────────────
// Perimeter Route & Surrounding Buildings Builders
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a perimeter road circuit that encircles the Green Meadows area.
 */
function createPerimeterRoute(): THREE.Group {
  const routeGroup = new THREE.Group();
  routeGroup.name = 'perimeter_route';

  // Expansive outer terrain base
  const outerTerrainGeo = new THREE.PlaneGeometry(130, 130);
  const outerTerrainMat = new THREE.MeshStandardMaterial({
    color: COL.outerGround,
    roughness: 0.95,
  });
  const outerTerrain = new THREE.Mesh(outerTerrainGeo, outerTerrainMat);
  outerTerrain.rotation.x = -Math.PI / 2;
  outerTerrain.position.set(0, -0.01, 0);
  outerTerrain.receiveShadow = true;
  routeGroup.add(outerTerrain);

  const roadMat = new THREE.MeshStandardMaterial({ color: COL.roadAsphalt, roughness: 0.82 });
  const curbMat = new THREE.MeshStandardMaterial({ color: COL.roadCurb, roughness: 0.65 });
  const yellowLineMat = new THREE.MeshBasicMaterial({ color: COL.roadLineYellow });
  const whiteLineMat = new THREE.MeshBasicMaterial({ color: COL.roadLineWhite });

  const ROAD_W = 5.2;
  const HALF_W = ROAD_W / 2;
  const ROAD_Y = 0.015;
  const CURB_H = 0.14;

  // 1. West Road (running along X = -19.0, Z from -22.5 to +22.5)
  const westRoadGeo = new THREE.PlaneGeometry(ROAD_W, 45);
  const westRoad = new THREE.Mesh(westRoadGeo, roadMat);
  westRoad.rotation.x = -Math.PI / 2;
  westRoad.position.set(-19.0, ROAD_Y, 0);
  westRoad.receiveShadow = true;
  routeGroup.add(westRoad);

  // West Road dashed center line
  const westLineGeo = new THREE.PlaneGeometry(0.24, 44);
  const westLine = new THREE.Mesh(westLineGeo, yellowLineMat);
  westLine.rotation.x = -Math.PI / 2;
  westLine.position.set(-19.0, ROAD_Y + 0.005, 0);
  routeGroup.add(westLine);

  // 2. East Road (running along X = +19.0, Z from -22.5 to +22.5)
  const eastRoadGeo = new THREE.PlaneGeometry(ROAD_W, 45);
  const eastRoad = new THREE.Mesh(eastRoadGeo, roadMat);
  eastRoad.rotation.x = -Math.PI / 2;
  eastRoad.position.set(19.0, ROAD_Y, 0);
  eastRoad.receiveShadow = true;
  routeGroup.add(eastRoad);

  const eastLine = new THREE.Mesh(westLineGeo, yellowLineMat);
  eastLine.rotation.x = -Math.PI / 2;
  eastLine.position.set(19.0, ROAD_Y + 0.005, 0);
  routeGroup.add(eastLine);

  // 3. North Road (behind the building, Z = -19.0, X from -21.6 to +21.6)
  const northRoadGeo = new THREE.PlaneGeometry(43.2, ROAD_W);
  const northRoad = new THREE.Mesh(northRoadGeo, roadMat);
  northRoad.rotation.x = -Math.PI / 2;
  northRoad.position.set(0, ROAD_Y, -19.0);
  northRoad.receiveShadow = true;
  routeGroup.add(northRoad);

  const northLineGeo = new THREE.PlaneGeometry(42, 0.24);
  const northLine = new THREE.Mesh(northLineGeo, yellowLineMat);
  northLine.rotation.x = -Math.PI / 2;
  northLine.position.set(0, ROAD_Y + 0.005, -19.0);
  routeGroup.add(northLine);

  // 4. South Road (in front / approach, Z = +19.0, X from -21.6 to +21.6)
  const southRoadGeo = new THREE.PlaneGeometry(43.2, ROAD_W);
  const southRoad = new THREE.Mesh(southRoadGeo, roadMat);
  southRoad.rotation.x = -Math.PI / 2;
  southRoad.position.set(0, ROAD_Y, 19.0);
  southRoad.receiveShadow = true;
  routeGroup.add(southRoad);

  const southLine = new THREE.Mesh(northLineGeo, yellowLineMat);
  southLine.rotation.x = -Math.PI / 2;
  southLine.position.set(0, ROAD_Y + 0.005, 19.0);
  routeGroup.add(southLine);

  // Concrete curbs framing the road circuit edges
  const curbSpecs: { size: [number, number, number]; pos: [number, number, number] }[] = [
    // Outer border curbs
    { size: [0.35, CURB_H, 46], pos: [-19.0 - HALF_W - 0.175, CURB_H / 2, 0] },
    { size: [0.35, CURB_H, 46], pos: [19.0 + HALF_W + 0.175, CURB_H / 2, 0] },
    { size: [46, CURB_H, 0.35], pos: [0, CURB_H / 2, -19.0 - HALF_W - 0.175] },
    { size: [46, CURB_H, 0.35], pos: [0, CURB_H / 2, 19.0 + HALF_W + 0.175] },
    // Inner boundary curbs bordering the Meadows lot
    { size: [0.3, CURB_H, 34], pos: [-16.2, CURB_H / 2, 0] },
    { size: [0.3, CURB_H, 34], pos: [16.2, CURB_H / 2, 0] },
    { size: [32.4, CURB_H, 0.3], pos: [0, CURB_H / 2, -16.2] },
    { size: [32.4, CURB_H, 0.3], pos: [0, CURB_H / 2, 16.2] },
  ];

  for (const cs of curbSpecs) {
    const curbMesh = new THREE.Mesh(new THREE.BoxGeometry(...cs.size), curbMat);
    curbMesh.position.set(...cs.pos);
    curbMesh.receiveShadow = true;
    routeGroup.add(curbMesh);
  }

  // Pedestrian zebra crossing on South Road aligned with path
  for (let zx = -1.5; zx <= 1.5; zx += 0.6) {
    const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 4.4), whiteLineMat);
    stripe.rotation.x = -Math.PI / 2;
    stripe.position.set(zx, ROAD_Y + 0.006, 19.0);
    routeGroup.add(stripe);
  }

  return routeGroup;
}

/**
 * Creates multi-story perimeter buildings enclosing the area around the Meadows.
 */
function createSurroundingBuildings(obstacles: WorldObstacle[]): THREE.Group {
  const cityGroup = new THREE.Group();
  cityGroup.name = 'surrounding_buildings';

  const windowMat = new THREE.MeshStandardMaterial({
    color: 0x8bb6d8,
    roughness: 0.18,
    metalness: 0.35,
    emissive: 0x22364a,
    emissiveIntensity: 0.3,
  });
  const roofLipMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.7 });

  interface BuildingDef {
    id: string;
    pos: [number, number, number];
    size: [number, number, number];
    color: number;
    floors: number;
    cols: number;
  }

  const buildingDefs: BuildingDef[] = [
    // ── North Skyline (Behind Green Meadows Residency) ──────────────────────
    { id: 'bld_n1', pos: [-14, 0, -28], size: [12, 18, 8], color: 0xc8967b, floors: 6, cols: 4 },
    { id: 'bld_n2', pos: [0, 0, -31], size: [15, 25, 9], color: 0xa8b8cc, floors: 8, cols: 5 },
    { id: 'bld_n3', pos: [14, 0, -28], size: [12, 19, 8], color: 0xd9b48f, floors: 6, cols: 4 },
    { id: 'bld_n4', pos: [28, 0, -26], size: [11, 15, 7], color: 0x9fa8a3, floors: 5, cols: 3 },
    { id: 'bld_n5', pos: [-28, 0, -26], size: [11, 16, 7], color: 0xb5826d, floors: 5, cols: 3 },

    // ── West City Blocks (Past West Route) ──────────────────────────────────
    { id: 'bld_w1', pos: [-29, 0, -12], size: [9, 14, 11], color: 0xb38268, floors: 4, cols: 3 },
    { id: 'bld_w2', pos: [-30, 0, 0], size: [9, 18, 12], color: 0x8b949e, floors: 6, cols: 4 },
    { id: 'bld_w3', pos: [-29, 0, 12], size: [9, 13, 11], color: 0xc29b7f, floors: 4, cols: 3 },

    // ── East Parkside Residences (Past East Route) ──────────────────────────
    { id: 'bld_e1', pos: [29, 0, -12], size: [9, 15, 11], color: 0xe2c4a6, floors: 5, cols: 3 },
    { id: 'bld_e2', pos: [30, 0, 0], size: [9, 20, 12], color: 0x9db899, floors: 7, cols: 4 },
    { id: 'bld_e3', pos: [29, 0, 12], size: [9, 14, 11], color: 0xd1a58c, floors: 4, cols: 3 },

    // ── South Avenue Blocks (Past South Route) ──────────────────────────────
    { id: 'bld_s1', pos: [-13, 0, 29], size: [12, 14, 8], color: 0xb89578, floors: 4, cols: 4 },
    { id: 'bld_s2', pos: [13, 0, 29], size: [12, 15, 8], color: 0x9fa5ad, floors: 5, cols: 4 },
    { id: 'bld_s3', pos: [27, 0, 26], size: [10, 13, 7], color: 0xb98f79, floors: 4, cols: 3 },
    { id: 'bld_s4', pos: [-27, 0, 26], size: [10, 13, 7], color: 0x8d9aa6, floors: 4, cols: 3 },
  ];

  for (const b of buildingDefs) {
    const [w, h, d] = b.size;
    const [x, , z] = b.pos;

    const bMat = new THREE.MeshStandardMaterial({ color: b.color, roughness: 0.82 });
    const bMesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), bMat);
    bMesh.position.set(x, h / 2, z);
    bMesh.castShadow = true;
    bMesh.receiveShadow = true;
    cityGroup.add(bMesh);

    // Roof cornice / lip
    const roofLip = new THREE.Mesh(new THREE.BoxGeometry(w + 0.35, 0.45, d + 0.35), roofLipMat);
    roofLip.position.set(x, h + 0.225, z);
    cityGroup.add(roofLip);

    // Rooftop elevator penthouse / mechanical unit
    const mech = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.35, 1.6, d * 0.35),
      new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.7 })
    );
    mech.position.set(x + (Math.sin(x) * 1.5), h + 0.8, z);
    mech.castShadow = true;
    cityGroup.add(mech);

    // Window grid on inward-facing facade
    const facingZ = z < 0; // facing towards Meadows center
    const winGeo = new THREE.BoxGeometry(0.85, 1.1, 0.08);
    const winHOffset = h / (b.floors + 1);
    const winWOffset = (w * 0.75) / Math.max(1, b.cols - 1);

    for (let f = 1; f <= b.floors; f++) {
      for (let c = 0; c < b.cols; c++) {
        const wx = x - (w * 0.375) + (c * winWOffset);
        const wy = f * winHOffset;
        const wz = facingZ ? z + d / 2 + 0.04 : z - d / 2 - 0.04;

        const win = new THREE.Mesh(winGeo, windowMat);
        win.position.set(wx, wy, wz);
        cityGroup.add(win);
      }
    }

    // Register perimeter obstacles
    obstacles.push({
      id: b.id,
      type: 'building',
      minX: x - w / 2 - 0.5,
      maxX: x + w / 2 + 0.5,
      minZ: z - d / 2 - 0.5,
      maxZ: z + d / 2 + 0.5,
    });
  }

  return cityGroup;
}

// ─────────────────────────────────────────────────────────────────────────────
// Scene Factory
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

  // ─────────────────────────────────────────────────────────────────────────
  // LEFT SIDE: Mud Wasteland — Dead Leafless Trees, Dust, Debris & Colorful Waste
  // ─────────────────────────────────────────────────────────────────────────

  // 1. Three dead trees with bare branches and NO leaves
  const deadTreeConfigs = [
    { x: -5.8, z: 3.8, scale: 1.05, rotY: 0.3, id: 'dead_tree_1' },
    { x: -8.2, z: 8.2, scale: 0.95, rotY: 1.7, id: 'dead_tree_2' },
    { x: -6.8, z: -2.5, scale: 1.15, rotY: -0.9, id: 'dead_tree_3' },
  ];

  for (const cfg of deadTreeConfigs) {
    const deadTree = createDeadTree(cfg.x, cfg.z, cfg.scale, cfg.rotY);
    group.add(deadTree);

    obstacles.push({
      id: cfg.id,
      type: 'prop',
      minX: cfg.x - 0.45 * cfg.scale,
      maxX: cfg.x + 0.45 * cfg.scale,
      minZ: cfg.z - 0.45 * cfg.scale,
      maxZ: cfg.z + 0.45 * cfg.scale,
    });
  }

  // 2. Swirling Dust Particle System across the left mud zone
  const DUST_COUNT = 220;
  const dustGeo = new THREE.BufferGeometry();
  const dustPosArray = new Float32Array(DUST_COUNT * 3);
  const dustVelocities: { vx: number; vy: number; vz: number }[] = [];

  for (let i = 0; i < DUST_COUNT; i++) {
    dustPosArray[i * 3] = -2.0 - Math.random() * 11.5;
    dustPosArray[i * 3 + 1] = 0.15 + Math.random() * 4.0;
    dustPosArray[i * 3 + 2] = -6.0 + Math.random() * 19.5;

    dustVelocities.push({
      vx: (Math.random() - 0.48) * 0.35,
      vy: (Math.random() - 0.5) * 0.12,
      vz: (Math.random() - 0.5) * 0.3,
    });
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPosArray, 3));

  const dustMat = new THREE.PointsMaterial({
    color: COL.dustParticle,
    size: 0.18,
    transparent: true,
    opacity: 0.65,
    depthWrite: false,
  });
  const dustPoints = new THREE.Points(dustGeo, dustMat);
  dustPoints.name = 'dust_particles';
  group.add(dustPoints);

  // 3. Low-lying ground dust haze discs (slowly rotating fog clouds)
  const hazeMat = new THREE.MeshBasicMaterial({
    color: COL.dustHaze,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
  });
  const hazeDisks: THREE.Mesh[] = [];
  for (const [hx, hz, hr] of [
    [-5.5, 3.2, 3.2],
    [-8.5, 7.8, 3.8],
    [-7.0, -1.8, 3.4],
    [-4.2, 9.2, 2.6],
  ] as const) {
    const disk = new THREE.Mesh(new THREE.CircleGeometry(hr, 16), hazeMat);
    disk.rotation.x = -Math.PI / 2;
    disk.position.set(hx, 0.04, hz);
    group.add(disk);
    hazeDisks.push(disk);
  }

  // 4. Slick mud puddles
  const puddleMat = new THREE.MeshStandardMaterial({
    color: COL.puddleMud,
    roughness: 0.15,
    metalness: 0.25,
  });
  for (const [px, pz, rx, rz] of [
    [-4.6, 2.0, 1.4, 0.9],
    [-7.5, 5.2, 1.7, 1.2],
    [-5.2, 8.8, 1.3, 0.8],
    [-8.8, 1.5, 1.5, 1.1],
  ] as const) {
    const puddle = new THREE.Mesh(new THREE.PlaneGeometry(rx * 2, rz * 2), puddleMat);
    puddle.rotation.x = -Math.PI / 2;
    puddle.position.set(px, 0.025, pz);
    puddle.receiveShadow = true;
    group.add(puddle);
  }

  // 5. Fallen dead logs & broken branches
  const logMat = new THREE.MeshStandardMaterial({ color: COL.deadBarkDark, roughness: 0.9 });
  const log1 = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 2.6, 7), logMat);
  log1.position.set(-7.0, 0.18, 1.2);
  log1.rotation.set(Math.PI / 2, 0, 0.4);
  log1.castShadow = true;
  group.add(log1);

  const log2 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 1.8, 6), logMat);
  log2.position.set(-4.5, 0.14, 5.6);
  log2.rotation.set(Math.PI / 2, 0, -0.6);
  log2.castShadow = true;
  group.add(log2);

  // 6. Rough dry rocks and boulders
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x564d45, roughness: 0.95 });
  for (const [rx, rz, scale, rot] of [
    [-3.8, 0.8, 0.45, 0.8],
    [-6.2, 6.5, 0.65, 2.1],
    [-9.2, 2.5, 0.8, -1.2],
    [-4.2, 10.5, 0.4, 1.5],
  ] as const) {
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(scale, 1), rockMat);
    rock.position.set(rx, scale * 0.65, rz);
    rock.rotation.set(rot, rot * 0.7, rot * 0.4);
    rock.castShadow = true;
    rock.receiveShadow = true;
    group.add(rock);
  }

  // 7. Neglected debris: Discarded tire & Rusted barrel
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x1c1c1c, roughness: 0.95 });
  const tire1 = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.16, 8, 16), tireMat);
  tire1.position.set(-4.2, 0.16, 7.2);
  tire1.rotation.set(Math.PI / 2, 0, 0.2);
  tire1.castShadow = true;
  group.add(tire1);

  const barrelMat = new THREE.MeshStandardMaterial({ color: 0x7c3f25, roughness: 0.8, metalness: 0.4 });
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 1.1, 10), barrelMat);
  barrel.position.set(-5.2, 0.48, 9.8);
  barrel.rotation.set(0.15, 0, -0.2);
  barrel.castShadow = true;
  group.add(barrel);
  obstacles.push({
    id: 'rusted_barrel',
    type: 'prop',
    minX: -5.7,
    maxX: -4.7,
    minZ: 9.3,
    maxZ: 10.3,
  });

  // 8. Damaged tilted street lamp on the left side
  const damagedLamp = createDamagedLamp(-3.6, 4.0);
  group.add(damagedLamp);
  obstacles.push({
    id: 'lamp_left',
    type: 'prop',
    minX: -3.95,
    maxX: -3.25,
    minZ: 3.65,
    maxZ: 4.35,
  });

  // 9. Mission 1 Waste Templates: Diverse, Highly Visible & Colorful Waste Scatter
  const wasteGroup = new THREE.Group();
  wasteGroup.name = 'garbage_waste_items';

  const wastePlacements: {
    type: string;
    pos: [number, number, number];
    rot?: [number, number, number];
    scale?: number;
  }[] = [
    // Near rusted barrel (Z ~ 9-10)
    { type: 'metal_can', pos: [-4.6, 0.08, 9.2], rot: [Math.PI / 2, 0, 0.5], scale: 0.95 },
    { type: 'plastic_bottle', pos: [-5.8, 0.08, 10.2], rot: [0.2, 0.8, Math.PI / 2], scale: 0.9 },
    { type: 'wrapper', pos: [-4.2, 0.04, 10.0], rot: [0, 1.2, 0], scale: 1.1 },
    { type: 'battery', pos: [-5.0, 0.05, 9.1], rot: [Math.PI / 2, 0, -0.4], scale: 1.0 },

    // Near discarded tires (Z ~ 6-8)
    { type: 'toy_car', pos: [-3.8, 0.08, 6.8], rot: [0, 0.6, 0.15], scale: 0.85 },
    { type: 'milk_carton', pos: [-4.8, 0.12, 7.6], rot: [Math.PI / 2, 0.3, -0.8], scale: 0.9 },
    { type: 'newspaper', pos: [-3.5, 0.04, 7.8], rot: [0, -0.5, 0], scale: 0.9 },
    { type: 'medicine_bottle', pos: [-4.6, 0.06, 6.2], rot: [Math.PI / 2, 0, 1.1], scale: 0.95 },

    // In and around mud puddles (Z ~ 4-6)
    { type: 'banana_peel', pos: [-7.2, 0.04, 5.0], rot: [0, 1.8, 0], scale: 0.95 },
    { type: 'plastic_bottle', pos: [-7.8, 0.07, 5.5], rot: [0.1, 0.4, Math.PI / 2], scale: 0.9 },
    { type: 'wrapper', pos: [-6.8, 0.04, 4.6], rot: [0, -1.2, 0], scale: 1.0 },
    { type: 'metal_can', pos: [-8.1, 0.07, 4.8], rot: [Math.PI / 2, 0, -0.6], scale: 0.9 },
    { type: 'broken_pen', pos: [-7.0, 0.03, 5.8], rot: [0, 0.9, 0], scale: 1.1 },

    // Near Dead Tree 1 (Z ~ 3-4)
    { type: 'cardboard_box', pos: [-5.2, 0.18, 3.2], rot: [0, 0.4, 0], scale: 0.8 },
    { type: 'magazine', pos: [-6.4, 0.04, 4.2], rot: [0, -0.8, 0], scale: 0.95 },
    { type: 'food_plate', pos: [-5.0, 0.06, 4.3], rot: [0.1, 0, 0], scale: 0.85 },
    { type: 'light_bulb', pos: [-6.2, 0.06, 3.0], rot: [Math.PI / 2, 0, 0.3], scale: 0.9 },

    // Mid mud wasteland (Z ~ 1-2.5)
    { type: 'veggie_scrap', pos: [-4.4, 0.05, 1.6], rot: [0, 2.1, 0], scale: 1.0 },
    { type: 'plastic_bottle', pos: [-8.5, 0.08, 1.8], rot: [0.2, 1.1, Math.PI / 2], scale: 0.95 },
    { type: 'toy_car', pos: [-7.4, 0.08, 1.2], rot: [0, -1.4, -0.1], scale: 0.85 },
    { type: 'tissue', pos: [-4.0, 0.04, 2.5], rot: [0, 0.3, 0], scale: 1.0 },

    // Near Dead Tree 3 (Z ~ -1.5 to -4)
    { type: 'bread_slice', pos: [-6.2, 0.05, -2.0], rot: [0, 0.7, 0], scale: 0.9 },
    { type: 'egg_shell', pos: [-7.4, 0.04, -2.8], rot: [0, -0.9, 0], scale: 1.0 },
    { type: 'metal_can', pos: [-6.0, 0.08, -3.2], rot: [Math.PI / 2, 0, 1.4], scale: 0.95 },
    { type: 'medicine_bottle', pos: [-7.2, 0.06, -1.8], rot: [Math.PI / 2, 0, -0.5], scale: 0.95 },
    { type: 'battery', pos: [-6.5, 0.05, -3.8], rot: [Math.PI / 2, 0, 0.8], scale: 1.0 },
    { type: 'wrapper', pos: [-5.5, 0.04, -1.5], rot: [0, 1.5, 0], scale: 1.1 },

    // ── Additional waste scatter covering all unsprinkled mud areas ───────────
    // South approach mud zone (Z ~ 11 to 14, X ~ -3 to -12)
    { type: 'plastic_bottle', pos: [-3.5, 0.07, 12.2], rot: [0.1, 0.6, Math.PI / 2], scale: 0.95 },
    { type: 'metal_can', pos: [-6.2, 0.08, 11.5], rot: [Math.PI / 2, 0, -0.7], scale: 0.9 },
    { type: 'cardboard_box', pos: [-8.5, 0.18, 12.0], rot: [0, 0.8, 0], scale: 0.85 },
    { type: 'wrapper', pos: [-4.8, 0.04, 13.1], rot: [0, -1.1, 0], scale: 1.1 },
    { type: 'toy_car', pos: [-10.2, 0.08, 11.8], rot: [0, 1.9, 0], scale: 0.85 },
    { type: 'milk_carton', pos: [-7.0, 0.12, 13.2], rot: [Math.PI / 2, -0.4, 0.6], scale: 0.9 },
    { type: 'newspaper', pos: [-5.5, 0.04, 12.8], rot: [0, 0.4, 0], scale: 0.95 },
    { type: 'broken_pen', pos: [-3.8, 0.03, 11.2], rot: [0, 1.3, 0], scale: 1.05 },

    // Far West outer mud boundary (X ~ -9 to -14, Z ~ -5 to 10)
    { type: 'plastic_bottle', pos: [-11.5, 0.08, 8.5], rot: [0.3, -0.9, Math.PI / 2], scale: 0.95 },
    { type: 'metal_can', pos: [-12.2, 0.08, 5.2], rot: [Math.PI / 2, 0, 1.1], scale: 0.95 },
    { type: 'banana_peel', pos: [-10.8, 0.04, 2.8], rot: [0, 2.3, 0], scale: 1.0 },
    { type: 'battery', pos: [-13.0, 0.05, 0.5], rot: [Math.PI / 2, 0, -1.2], scale: 1.0 },
    { type: 'light_bulb', pos: [-11.0, 0.06, -1.2], rot: [Math.PI / 2, 0, 0.7], scale: 0.9 },
    { type: 'magazine', pos: [-12.4, 0.04, 7.0], rot: [0, -1.5, 0], scale: 0.95 },
    { type: 'wrapper', pos: [-9.8, 0.04, 6.8], rot: [0, 0.5, 0], scale: 1.1 },
    { type: 'medicine_bottle', pos: [-12.8, 0.06, 3.5], rot: [Math.PI / 2, 0, 0.4], scale: 0.95 },

    // Deep North mud zone towards building corner (Z ~ -4.5 to -6.8, X ~ -3 to -13)
    { type: 'milk_carton', pos: [-4.2, 0.12, -4.8], rot: [Math.PI / 2, 0.5, -0.9], scale: 0.9 },
    { type: 'plastic_bottle', pos: [-8.8, 0.08, -5.2], rot: [0.1, 0.7, Math.PI / 2], scale: 0.95 },
    { type: 'cardboard_box', pos: [-11.2, 0.18, -4.5], rot: [0, -0.6, 0], scale: 0.8 },
    { type: 'metal_can', pos: [-9.6, 0.08, -6.0], rot: [Math.PI / 2, 0, 0.2], scale: 0.9 },
    { type: 'veggie_scrap', pos: [-5.0, 0.05, -5.8], rot: [0, 1.4, 0], scale: 0.95 },
    { type: 'food_plate', pos: [-7.8, 0.06, -4.6], rot: [0.1, 0.5, 0], scale: 0.85 },
    { type: 'tissue', pos: [-3.8, 0.04, -5.5], rot: [0, -0.8, 0], scale: 1.0 },
    { type: 'egg_shell', pos: [-12.0, 0.04, -3.2], rot: [0, 1.1, 0], scale: 1.0 },

    // Central mud transitional zone near path edge (X ~ -2.4 to -3.8, Z ~ -1 to 8)
    { type: 'broken_pen', pos: [-2.6, 0.03, 0.2], rot: [0, -1.8, 0], scale: 1.1 },
    { type: 'plastic_bottle', pos: [-2.8, 0.07, 4.8], rot: [0.2, 0.4, Math.PI / 2], scale: 0.9 },
    { type: 'toy_car', pos: [-2.7, 0.08, 8.5], rot: [0, 2.2, 0], scale: 0.85 },
    { type: 'wrapper', pos: [-2.9, 0.04, -3.0], rot: [0, 0.9, 0], scale: 1.1 },
  ];

  for (const w of wastePlacements) {
    const itemMesh = createItemMesh(w.type, {
      scale: w.scale ?? 0.9,
      castShadow: true,
      receiveShadow: true,
    });
    itemMesh.position.set(...w.pos);
    if (w.rot) {
      itemMesh.rotation.set(...w.rot);
    }
    wasteGroup.add(itemMesh);
  }
  group.add(wasteGroup);

  // ─────────────────────────────────────────────────────────────────────────
  // RIGHT SIDE: Lush Greenery — Green Bench, Park Lamp, Trees & Flowers
  // ─────────────────────────────────────────────────────────────────────────

  // 1. Green park bench on the lush green grass
  const greenBench = createGreenBench(4.2, 4.0, -Math.PI / 8);
  group.add(greenBench);
  obstacles.push({
    id: 'green_bench',
    type: 'prop',
    minX: 3.2,
    maxX: 5.2,
    minZ: 3.3,
    maxZ: 4.7,
  });

  // 2. Park lamp in the greenery area with warm light
  const { group: greeneryLamp, light: lampLight } = createGreeneryLamp(3.8, 2.0);
  group.add(greeneryLamp);
  group.add(lampLight);
  obstacles.push({
    id: 'lamp_right',
    type: 'prop',
    minX: 3.45,
    maxX: 4.15,
    minZ: 1.65,
    maxZ: 2.35,
  });

  // 3. 8 Lush leafy healthy trees spanning the whole green area
  const lushTreeConfigs = [
    { x: 7.8, z: 7.5, scale: 1.15, rotY: 0.5, id: 'lush_tree_1' },
    { x: 8.5, z: -1.2, scale: 1.25, rotY: -0.8, id: 'lush_tree_2' },
    { x: 6.8, z: 1.2, scale: 0.95, rotY: 1.2, id: 'lush_tree_3' },
    { x: 10.5, z: 4.2, scale: 1.35, rotY: 0.3, id: 'lush_tree_4' },
    { x: 11.2, z: 8.8, scale: 1.1, rotY: -1.1, id: 'lush_tree_5' },
    { x: 6.2, z: -4.2, scale: 1.15, rotY: 1.7, id: 'lush_tree_6' },
    { x: 10.0, z: -3.5, scale: 1.2, rotY: -0.4, id: 'lush_tree_7' },
    { x: 5.4, z: 11.5, scale: 0.9, rotY: 0.8, id: 'lush_tree_8' },
  ];

  for (const cfg of lushTreeConfigs) {
    const lushTree = createLushTree(cfg.x, cfg.z, cfg.scale, cfg.rotY);
    group.add(lushTree);
    obstacles.push({
      id: cfg.id,
      type: 'prop',
      minX: cfg.x - 0.45 * cfg.scale,
      maxX: cfg.x + 0.45 * cfg.scale,
      minZ: cfg.z - 0.45 * cfg.scale,
      maxZ: cfg.z + 0.45 * cfg.scale,
    });
  }

  // 4. Colorful flower patches across the green lawn
  const flowerPatches = [
    createFlowerPatch(4.5, 5.8, 9, COL.flowerRed),
    createFlowerPatch(5.4, 3.2, 10, COL.flowerYellow),
    createFlowerPatch(3.8, 0.4, 8, COL.flowerWhite),
    createFlowerPatch(6.6, -1.8, 11, COL.flowerPurple),
    createFlowerPatch(7.4, 4.6, 9, COL.flowerRed),
    createFlowerPatch(9.2, 6.5, 10, COL.flowerPink),
    createFlowerPatch(8.0, 1.8, 8, COL.flowerYellow),
    createFlowerPatch(5.2, 9.8, 9, COL.flowerWhite),
  ];
  for (const fp of flowerPatches) {
    group.add(fp);
  }

  // 5. Lush green bushes / shrubs
  const bushes = [
    createBush(3.6, 5.4, 0.65, COL.leafLight),
    createBush(5.6, 4.4, 0.75, COL.leafMid),
    createBush(4.6, 1.2, 0.6, COL.leafDark),
    createBush(6.8, 8.5, 0.8, COL.leafMid),
    createBush(9.5, 2.8, 0.75, COL.leafLight),
    createBush(11.0, 6.2, 0.7, COL.leafDark),
    createBush(7.2, -3.2, 0.65, COL.leafMid),
    createBush(4.8, 12.8, 0.6, COL.leafLight),
  ];
  for (const b of bushes) {
    group.add(b);
  }

  // 6. Clean nature air motes / sparkles floating on the right green side
  const MOTE_COUNT = 80;
  const moteGeo = new THREE.BufferGeometry();
  const motePosArray = new Float32Array(MOTE_COUNT * 3);
  for (let i = 0; i < MOTE_COUNT; i++) {
    motePosArray[i * 3] = 2.2 + Math.random() * 11.0;
    motePosArray[i * 3 + 1] = 0.4 + Math.random() * 3.8;
    motePosArray[i * 3 + 2] = -5.0 + Math.random() * 18.0;
  }
  moteGeo.setAttribute('position', new THREE.BufferAttribute(motePosArray, 3));
  const moteMat = new THREE.PointsMaterial({
    color: 0xedffcf,
    size: 0.12,
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
  });
  const motePoints = new THREE.Points(moteGeo, moteMat);
  motePoints.name = 'nature_motes';
  group.add(motePoints);

  // ─────────────────────────────────────────────────────────────────────────
  // PERIMETER: Route Encircling the Area & Surrounding Buildings
  // ─────────────────────────────────────────────────────────────────────────

  // 1. Perimeter Road Route
  const perimeterRoute = createPerimeterRoute();
  group.add(perimeterRoute);

  // 2. Surrounding Buildings outside the route (framing the district)
  const surroundingBuildings = createSurroundingBuildings(obstacles);
  group.add(surroundingBuildings);

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

  // ── 10. Glowing Green Path Marker & Floating Arrow to Waste Pile ──────────
  const pathGuideGroup = new THREE.Group();
  pathGuideGroup.name = 'waste_path_guide';
  group.add(pathGuideGroup);

  // Curved ground discs along path from MEADOWS_SPAWN (0, 0, 10) to MEADOWS_WASTE_PILE_CENTER (-6, 0.05, 4)
  const markerGeo = new THREE.RingGeometry(0.18, 0.32, 24);
  const markerMat = new THREE.MeshBasicMaterial({
    color: 0x34d399, // vibrant glowing emerald
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85,
  });

  const markerCurvePoints = [
    new THREE.Vector3(0, 0.04, 9.2),
    new THREE.Vector3(-0.8, 0.04, 8.4),
    new THREE.Vector3(-1.8, 0.04, 7.6),
    new THREE.Vector3(-2.8, 0.04, 6.7),
    new THREE.Vector3(-3.8, 0.04, 5.8),
    new THREE.Vector3(-4.8, 0.04, 4.9),
    new THREE.Vector3(-5.8, 0.04, 4.2),
  ];

  const markerMeshes: THREE.Mesh[] = [];
  markerCurvePoints.forEach((pt) => {
    const markerMesh = new THREE.Mesh(markerGeo, markerMat.clone());
    markerMesh.rotation.x = -Math.PI / 2;
    markerMesh.position.copy(pt);
    pathGuideGroup.add(markerMesh);
    markerMeshes.push(markerMesh);

    // Inner glowing solid disc
    const innerDot = new THREE.Mesh(
      new THREE.CircleGeometry(0.1, 16),
      new THREE.MeshBasicMaterial({ color: 0x6ee7b7, side: THREE.DoubleSide, transparent: true, opacity: 0.9 })
    );
    innerDot.rotation.x = -Math.PI / 2;
    innerDot.position.set(pt.x, pt.y + 0.002, pt.z);
    pathGuideGroup.add(innerDot);
  });

  // Floating 3D waypoint arrow hovering above the waste pile hotspot
  const arrowGroup = new THREE.Group();
  arrowGroup.position.set(MEADOWS_WASTE_PILE_CENTER.x, 2.2, MEADOWS_WASTE_PILE_CENTER.z);
  pathGuideGroup.add(arrowGroup);

  // Downward pointing cone
  const arrowCone = new THREE.Mesh(
    new THREE.ConeGeometry(0.38, 0.7, 16),
    new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x10b981,
      emissiveIntensity: 0.75,
      roughness: 0.3,
    })
  );
  arrowCone.rotation.x = Math.PI; // point downwards
  arrowGroup.add(arrowCone);

  // Shaft of arrow
  const arrowShaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 0.45, 12),
    new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.6,
      roughness: 0.3,
    })
  );
  arrowShaft.position.y = 0.5;
  arrowGroup.add(arrowShaft);

  // Glowing ring under the arrow on the ground at waste pile
  const targetRing = new THREE.Mesh(
    new THREE.RingGeometry(0.8, 1.1, 32),
    new THREE.MeshBasicMaterial({ color: 0x34d399, side: THREE.DoubleSide, transparent: true, opacity: 0.75 })
  );
  targetRing.rotation.x = -Math.PI / 2;
  targetRing.position.set(MEADOWS_WASTE_PILE_CENTER.x, 0.04, MEADOWS_WASTE_PILE_CENTER.z);
  pathGuideGroup.add(targetRing);

  // ── 11. Garbage Truck & 4 Color-Coded Bins (Phase 4 Arrival) ──────────────
  // ── 11. Garbage Truck (Arrives on the Road) ──────────────────────────────
  const truckGroup = new THREE.Group();
  truckGroup.name = 'meadows_garbage_truck';

  const truckBodyMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4, metalness: 0.1 });
  const truckAccentMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.35, metalness: 0.15 });
  const truckDarkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x7dd3fc, roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0.8 });
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.7 });

  // Cab
  const cabGeo = new THREE.BoxGeometry(2.2, 2.0, 2.4);
  const cab = new THREE.Mesh(cabGeo, truckBodyMat);
  cab.position.set(0, 1.4, 1.0);
  cab.castShadow = true;
  truckGroup.add(cab);

  // Windshield
  const windGeo = new THREE.BoxGeometry(1.8, 1.0, 0.08);
  const wind = new THREE.Mesh(windGeo, glassMat);
  wind.position.set(0, 1.9, 2.24);
  truckGroup.add(wind);

  // Body / hopper
  const hopperGeo = new THREE.BoxGeometry(2.2, 2.4, 4.2);
  const hopper = new THREE.Mesh(hopperGeo, truckAccentMat);
  hopper.position.set(0, 1.7, -1.8);
  hopper.castShadow = true;
  truckGroup.add(hopper);

  // Hopper top ridge
  const ridgeGeo = new THREE.BoxGeometry(2.3, 0.22, 4.3);
  const ridge = new THREE.Mesh(ridgeGeo, truckBodyMat);
  ridge.position.set(0, 3.0, -1.8);
  truckGroup.add(ridge);

  // Rear compactor panel
  const rearGeo = new THREE.BoxGeometry(2.2, 2.4, 0.2);
  const rear = new THREE.Mesh(rearGeo, truckDarkMat);
  rear.position.set(0, 1.7, -4.0);
  truckGroup.add(rear);

  // Chassis
  const chassisGeo = new THREE.BoxGeometry(2.0, 0.3, 6.2);
  const chassis = new THREE.Mesh(chassisGeo, truckDarkMat);
  chassis.position.set(0, 0.35, -1.4);
  truckGroup.add(chassis);

  // Wheels (4)
  const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.3, 14);
  const wheelPositions: [number, number, number][] = [
    [-1.2, 0.42, 1.6],
    [1.2, 0.42, 1.6],
    [-1.2, 0.42, -2.6],
    [1.2, 0.42, -2.6],
  ];
  wheelPositions.forEach(([wx, wy, wz]) => {
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.position.set(wx, wy, wz);
    wheel.rotation.z = Math.PI / 2;
    wheel.castShadow = true;
    truckGroup.add(wheel);

    // Hubcap
    const hubGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.32, 8);
    const hubMat = new THREE.MeshStandardMaterial({ color: 0x9ca3af, roughness: 0.2, metalness: 0.7 });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    hub.position.set(wx, wy, wz);
    hub.rotation.z = Math.PI / 2;
    truckGroup.add(hub);
  });

  // Exhaust pipe
  const exhaustGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.0, 8);
  const exhaust = new THREE.Mesh(exhaustGeo, truckDarkMat);
  exhaust.position.set(0.9, 3.0, 2.2);
  truckGroup.add(exhaust);

  // Truck arrives along South Road:
  // Starts far west: (-21.0, 0, 19.0)
  // Drives east and stops in front of the park entrance curb: (-4.5, 0, 19.0)
  // Facing East along the road: rotation.y = Math.PI / 2
  const truckStartPos = new THREE.Vector3(-21.0, 0, 19.0);
  const truckEndPos = new THREE.Vector3(-4.5, 0, 19.0);
  truckGroup.position.copy(truckStartPos);
  truckGroup.rotation.y = Math.PI / 2; // facing eastward along South Road
  truckGroup.visible = false;
  group.add(truckGroup);

  // ── 12. Four Color-Coded Bins (At side in park beside where truck stops) ───
  // Positioned inside the park at the curb edge directly adjacent to the parked truck
  // Truck stops at X = -4.5, Z = 19.0 on the road (curb is at Z = 16.2).
  // The bins are placed in a row inside the park side edge (Z = 15.0),
  // running parallel to the curb right beside the truck from X = -6.6 to -1.8,
  // facing toward the park (-Z).
  const binMeshes = new Map<BinType, THREE.Mesh>();
  const binTriggers = new Map<BinType, THREE.Mesh>();
  const binGlowRings = new Map<BinType, THREE.Mesh>();

  const activeBinTypes: BinType[] = ['wet', 'dry', 'hazardous', 'residual'];
  const BIN_PALETTE: Record<BinType, number> = {
    wet: 0x10b981,        // emerald green
    dry: 0x3b82f6,        // blue
    hazardous: 0xef4444,  // red
    residual: 0x1e293b,   // black
    paper: 0x0284c7,
    plastic: 0xf59e0b,
    ewaste: 0xf97316,
    reuse: 0x0d9488,
  };

  const truckBinsGroup = new THREE.Group();
  truckBinsGroup.name = 'truck_bins';
  group.add(truckBinsGroup);

  // Row along the side in the park by the truck stopping spot:
  // Z = 15.0 (park side ground inside curb), spaced across X: -6.6, -5.0, -3.4, -1.8
  const binStartZ = 15.0;
  const binStartX = -6.6;
  const binSpacingX = 1.6;
  const BIN_W = 1.05;
  const BIN_H = 1.45;
  const BIN_D = 0.95;

  activeBinTypes.forEach((binType, idx) => {
    const hexColor = BIN_PALETTE[binType] ?? 0x10b981;
    const bx = binStartX + idx * binSpacingX;
    const bz = binStartZ;

    const singleBinGroup = new THREE.Group();
    singleBinGroup.position.set(bx, 0, bz);
    singleBinGroup.rotation.y = Math.PI; // Face inward into the park (-Z) toward Kai

    // Bin body with rounded corners
    const bodyMat = new THREE.MeshStandardMaterial({
      color: hexColor,
      roughness: 0.45,
      metalness: 0.08,
    });
    const bodyMesh = new THREE.Mesh(new RoundedBoxGeometry(BIN_W, BIN_H, BIN_D, 4, 0.08), bodyMat);
    bodyMesh.position.y = BIN_H / 2;
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    singleBinGroup.add(bodyMesh);
    binMeshes.set(binType, bodyMesh);

    // Dark interior under the lid
    const interior = new THREE.Mesh(
      new THREE.PlaneGeometry(BIN_W - 0.12, BIN_D - 0.12),
      new THREE.MeshBasicMaterial({ color: 0x0a0a0a })
    );
    interior.rotation.x = -Math.PI / 2;
    interior.position.y = BIN_H - 0.02;
    singleBinGroup.add(interior);

    // Front icon (leaf / recycle loop / caution triangle / dustbin)
    const iconMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.68, 0.68),
      new THREE.MeshStandardMaterial({
        map: makeMeadowsBinIconTexture(binType),
        transparent: true,
        alphaTest: 0.05,
        roughness: 0.45,
      })
    );
    iconMesh.position.set(0, BIN_H * 0.55, BIN_D / 2 + 0.008);
    singleBinGroup.add(iconMesh);

    // Hinged lid
    const lidPivot = new THREE.Group();
    lidPivot.position.set(0, BIN_H, -BIN_D / 2);

    const lidMat = new THREE.MeshStandardMaterial({
      color: hexColor,
      roughness: 0.4,
      metalness: 0.05,
    });
    const lidGeo = new RoundedBoxGeometry(BIN_W + 0.1, 0.14, BIN_D + 0.1, 3, 0.05);
    lidGeo.translate(0, 0.07, (BIN_D + 0.1) / 2);
    const lid = new THREE.Mesh(lidGeo, lidMat);
    lid.castShadow = true;
    lidPivot.add(lid);

    singleBinGroup.add(lidPivot);
    bodyMesh.userData.lid = lidPivot;

    // Proximity glow ring on ground
    const ringGeo = new THREE.RingGeometry(0.75, 1.05, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: hexColor,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    singleBinGroup.add(ring);
    binGlowRings.set(binType, ring);

    // Proximity trigger cylinder
    const trigGeo = new THREE.CylinderGeometry(1.2, 1.2, 2.2, 12);
    const trigMat = new THREE.MeshBasicMaterial({ visible: false });
    const trigger = new THREE.Mesh(trigGeo, trigMat);
    trigger.position.y = 1.1;
    singleBinGroup.add(trigger);
    binTriggers.set(binType, trigger);

    truckBinsGroup.add(singleBinGroup);

    // Register obstacle
    obstacles.push({
      id: `meadows_bin_${binType}`,
      type: 'prop',
      minX: bx - 0.7,
      maxX: bx + 0.7,
      minZ: bz - 0.7,
      maxZ: bz + 0.7,
    });
  });

  const binRowCenter = new THREE.Vector3(binStartX + 1.5 * binSpacingX, 0, binStartZ);

  function animateTruckArrival(progress: number) {
    if (progress > 0) {
      truckGroup.visible = true;
    }
    const clamped = Math.max(0, Math.min(1, progress));
    // Smooth ease-out cubic
    const eased = 1 - Math.pow(1 - clamped, 3);
    truckGroup.position.x = THREE.MathUtils.lerp(truckStartPos.x, truckEndPos.x, eased);
    truckGroup.position.z = THREE.MathUtils.lerp(truckStartPos.z, truckEndPos.z, eased);

    // Gentle engine rumble / bounce during travel
    if (clamped < 1.0) {
      truckGroup.position.y = Math.abs(Math.sin(clamped * 35)) * 0.04;
    } else {
      truckGroup.position.y = 0;
    }

    // Wheel spin
    const spinSpeed = (1 - eased) * 0.25;
    truckGroup.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry instanceof THREE.CylinderGeometry) {
        if (child.rotation.z === Math.PI / 2 || Math.abs(child.rotation.z - Math.PI / 2) < 0.01) {
          child.rotation.x += spinSpeed;
        }
      }
    });

    if (clamped >= 0.85) {
      truckBinsGroup.visible = true;
    }
  }

  function animateTruckDeparture(progress: number) {
    const clamped = Math.max(0, Math.min(1, progress));
    // Ease-in-out curve
    const eased = clamped * clamped * (3 - 2 * clamped);

    // In first 25% of departure, bins lift up and fade / load into truck hopper
    if (clamped < 0.25) {
      const lift = (clamped / 0.25);
      truckBinsGroup.position.y = lift * 1.5;
      truckBinsGroup.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.Material) {
          child.material.transparent = true;
          child.material.opacity = 1 - lift * 0.9;
        }
      });
    } else {
      truckBinsGroup.visible = false;
    }

    // Departure target pos along road circuit (drive south-west off-screen: X = -24, Z = -22)
    const departureEndPos = new THREE.Vector3(-24.0, 0, -22.0);
    truckGroup.position.x = THREE.MathUtils.lerp(truckEndPos.x, departureEndPos.x, eased);
    truckGroup.position.z = THREE.MathUtils.lerp(truckEndPos.z, departureEndPos.z, eased);

    // Wheel rotation during departure
    truckGroup.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry instanceof THREE.CylinderGeometry) {
        if (child.rotation.z === Math.PI / 2 || Math.abs(child.rotation.z - Math.PI / 2) < 0.01) {
          child.rotation.x -= 0.18;
        }
      }
    });

    if (clamped >= 0.98) {
      truckGroup.visible = false;
    }
  }

  function animateCleanup(progress: number) {
    const clamped = Math.max(0, Math.min(1, progress));

    // 1. Waste scatter items fade out and disappear
    wasteGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => {
            m.transparent = true;
            m.opacity = Math.max(0, 1 - clamped);
          });
        } else if (child.material) {
          child.material.transparent = true;
          child.material.opacity = Math.max(0, 1 - clamped);
        }
      }
    });
    if (clamped >= 0.98) {
      wasteGroup.visible = false;
    }

    // 2. Mud puddles and dust haze discs fade out
    hazeDisks.forEach((d) => {
      (d.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.22 * (1 - clamped));
    });
    puddleMat.opacity = Math.max(0, 1 - clamped);
    puddleMat.transparent = true;

    // 3. Left mud wasteland ground blends to clean, healthy earth / grass
    const pos = groundGeo.attributes.position;
    const colAttr = groundGeo.attributes.color as THREE.BufferAttribute;
    const cleanEarth = new THREE.Color(0x608044); // warm fertile greener earth
    const curCol = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      if (x < -0.5) {
        curCol.fromBufferAttribute(colAttr, i);
        curCol.lerp(cleanEarth, clamped * 0.035);
        colAttr.setXYZ(i, curCol.r, curCol.g, curCol.b);
      }
    }
    colAttr.needsUpdate = true;

    // 4. Dead trees look healthier / less grim (wood shifts from stark dark to warm living bark)
    const livingBark = new THREE.Color(0x5a4a38);
    deadTreeConfigs.forEach((cfg) => {
      const treeObj = group.getObjectByName(cfg.id) || group.getObjectByName('dead_tree');
      if (treeObj) {
        treeObj.traverse((ch) => {
          if (ch instanceof THREE.Mesh && ch.material instanceof THREE.MeshStandardMaterial) {
            ch.material.color.lerp(livingBark, clamped * 0.03);
          }
        });
      }
    });
  }

  function showTruckBins(visible: boolean) {
    truckBinsGroup.visible = visible;
  }

  // ── Animate ───────────────────────────────────────────────────────────────
  function animate(elapsed: number, delta: number) {
    // 1. Warm lamp gentle flicker
    lampLight.intensity = 1.2 + 0.1 * Math.sin(elapsed * 2.4);

    // 2. Swirling dust particles on the left mud side
    const posAttr = dustGeo.attributes.position as THREE.BufferAttribute;
    const pArray = posAttr.array as Float32Array;
    for (let i = 0; i < DUST_COUNT; i++) {
      const idx = i * 3;
      const v = dustVelocities[i];
      pArray[idx] += (v.vx + Math.sin(elapsed * 1.4 + i) * 0.08) * delta;
      pArray[idx + 1] += (v.vy + Math.cos(elapsed * 1.8 + i) * 0.05) * delta;
      pArray[idx + 2] += (v.vz + Math.cos(elapsed * 1.1 + i) * 0.08) * delta;

      // Wrap boundaries within left mud zone
      if (pArray[idx] > -1.8) pArray[idx] = -13.5;
      if (pArray[idx] < -14.0) pArray[idx] = -2.2;
      if (pArray[idx + 1] > 4.5) pArray[idx + 1] = 0.15;
      if (pArray[idx + 1] < 0.1) pArray[idx + 1] = 4.2;
      if (pArray[idx + 2] > 14.0) pArray[idx + 2] = -6.0;
      if (pArray[idx + 2] < -6.0) pArray[idx + 2] = 13.5;
    }
    posAttr.needsUpdate = true;

    // 3. Ground dust haze slow rotation
    for (let i = 0; i < hazeDisks.length; i++) {
      hazeDisks[i].rotation.z = elapsed * 0.06 * (i % 2 === 0 ? 1 : -1);
    }

    // 4. Clean air nature motes drifting upwards on the right green side
    const moteAttr = moteGeo.attributes.position as THREE.BufferAttribute;
    const mArray = moteAttr.array as Float32Array;
    for (let i = 0; i < MOTE_COUNT; i++) {
      const idx = i * 3;
      mArray[idx + 1] += delta * 0.25;
      mArray[idx] += Math.sin(elapsed * 1.5 + i) * delta * 0.08;
      if (mArray[idx + 1] > 4.2) {
        mArray[idx + 1] = 0.3;
      }
    }
    moteAttr.needsUpdate = true;

    // 5. Waypoint guide animation: pulsating rings and bobbing arrow
    if (pathGuideGroup.visible) {
      arrowGroup.position.y = 2.2 + Math.sin(elapsed * 4.0) * 0.28;
      arrowGroup.rotation.y = elapsed * 2.2;
      const targetScale = 1.0 + Math.sin(elapsed * 3.5) * 0.12;
      targetRing.scale.set(targetScale, targetScale, 1.0);

      markerMeshes.forEach((mesh, idx) => {
        const pulse = 0.5 + 0.45 * Math.sin(elapsed * 4.0 - idx * 0.6);
        (mesh.material as THREE.MeshBasicMaterial).opacity = pulse;
      });
    }

    // 6. Soft glow ring decay for bins
    binGlowRings.forEach((ring) => {
      const mat = ring.material as THREE.MeshBasicMaterial;
      if (mat.opacity > 0.05) {
        mat.opacity = Math.max(0, mat.opacity - delta * 2.0);
      }
    });
  }

  function triggerBinAnimation(bin: BinType) {
    const bodyMesh = binMeshes.get(bin);
    if (!bodyMesh) return;
    const lid = bodyMesh.userData.lid as THREE.Mesh | undefined;
    if (!lid) return;
    const targetAngle = -1.1;
    lid.rotation.x = THREE.MathUtils.lerp(lid.rotation.x, targetAngle, 0.45);
    setTimeout(() => {
      lid.rotation.x = THREE.MathUtils.lerp(lid.rotation.x, 0, 0.4);
      setTimeout(() => {
        lid.rotation.x = 0;
      }, 350);
    }, 450);
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
    wastePileCenter: MEADOWS_WASTE_PILE_CENTER.clone(),
    setPathGuideVisible: (visible: boolean) => {
      pathGuideGroup.visible = visible;
    },
    truckMesh: truckGroup,
    truckStartPos,
    truckEndPos,
    animateTruckArrival,
    animateTruckDeparture,
    showTruckBins,
    animateCleanup,
    binMeshes,
    binTriggers,
    binGlowRings,
    binRowCenter,
    triggerBinAnimation,
    animate,
  };
}
