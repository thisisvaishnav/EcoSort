/**
 * Migsun Vilasa Scene — Level 8
 *
 * Procedural Three.js scene: Migsun Vilasa residential complex with:
 * - Left side: Waste pile with brown ground, debris, pest particle swarms
 * - Right side: Lush garden with flowers, trees, butterflies
 * - Building facade: Warm cream with blue balconies and "MIGSUN VILASA" sign
 * - 3 Bin installation spots (dashed outlines on ground)
 * - 4 Color-coded bins (installed during Phase 2)
 * - Plant revival transitions (gray -> green materials)
 * - Garbage truck with road at Z = -14
 */

import * as THREE from 'three';
import { BinType } from '../../types/game';
import { WorldObstacle, PinnedLitterSpot } from './types';

export interface MigsunSceneResult {
  migsunGroup: THREE.Group;
  obstacles: WorldObstacle[];
  wastePileGroup: THREE.Group;
  cleanGardenGroup: THREE.Group;
  revivalPlants: THREE.Mesh[];
  pestParticles: THREE.Points;
  binMeshes: Map<BinType, THREE.Mesh>;
  binTriggers: Map<BinType, THREE.Mesh>;
  binGlowRings: Map<BinType, THREE.Mesh>;
  binInstallLocations: { id: string; label: string; position: THREE.Vector3; isCorrect: boolean }[];
  litterSpawnPoints: THREE.Vector3[];
  hiddenSpawnPoints: THREE.Vector3[];
  pinnedLitterSpots: PinnedLitterSpot[];
  truckMesh: THREE.Group;
  truckStartPos: THREE.Vector3;
  truckEndPos: THREE.Vector3;
  spawnPoint: THREE.Vector3;
  animate: (elapsed: number, delta: number) => void;
  triggerBinAnimation: (bin: BinType) => void;
  animateTruckArrival: (progress: number) => void;
  triggerPlantRevival: () => void;
  showBinsAtLocation: (locationId: string) => void;
  removePests: () => void;
}

const BIN_COLORS: Record<BinType, number> = {
  wet: 0x10b981,        // emerald green
  dry: 0x3b82f6,        // blue
  hazardous: 0xef4444,  // red
  residual: 0x1e293b,   // black
  paper: 0x0284c7,
  plastic: 0xf59e0b,
  ewaste: 0xf97316,
  reuse: 0x0d9488,
};

export function createMigsunScene(activeBins: BinType[] = ['wet', 'dry', 'hazardous', 'residual']): MigsunSceneResult {
  const group = new THREE.Group();
  group.name = 'migsun_vilasa_scene';

  const obstacles: WorldObstacle[] = [];
  const binMeshes = new Map<BinType, THREE.Mesh>();
  const binTriggers = new Map<BinType, THREE.Mesh>();
  const binGlowRings = new Map<BinType, THREE.Mesh>();
  const revivalPlants: THREE.Mesh[] = [];

  // ── Lighting & Atmosphere ──────────────────────────────────────────────────
  const ambient = new THREE.AmbientLight(0xfff8ee, 1.0);
  group.add(ambient);

  const sun = new THREE.DirectionalLight(0xffedd5, 1.5);
  sun.position.set(10, 20, 10);
  sun.castShadow = true;
  group.add(sun);

  // ── Ground: Split Plane ────────────────────────────────────────────────────
  // Total size 36m wide x 30m deep
  // Left half (Waste side, x < 0): Dirty brownish soil
  // Right half (Garden side, x > 0): Vibrant green lawn
  const groundGeo = new THREE.PlaneGeometry(36, 26, 32, 32);
  groundGeo.rotateX(-Math.PI / 2);

  // Vertex colors for smooth gradient across x = 0
  const colors: number[] = [];
  const posAttr = groundGeo.attributes.position;
  const dirtyColor = new THREE.Color(0x785a44);
  const gardenColor = new THREE.Color(0x4ade80);

  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    if (x < -1.5) {
      colors.push(dirtyColor.r, dirtyColor.g, dirtyColor.b);
    } else if (x > 1.5) {
      colors.push(gardenColor.r, gardenColor.g, gardenColor.b);
    } else {
      const alpha = (x + 1.5) / 3.0;
      const c = dirtyColor.clone().lerp(gardenColor, alpha);
      colors.push(c.r, c.g, c.b);
    }
  }
  groundGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const groundMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.9,
    metalness: 0.05,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.receiveShadow = true;
  group.add(ground);

  // ── Road at top (Z = -14) ──────────────────────────────────────────────────
  const roadGeo = new THREE.PlaneGeometry(42, 6);
  roadGeo.rotateX(-Math.PI / 2);
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
  const road = new THREE.Mesh(roadGeo, roadMat);
  road.position.set(0, 0.01, -14);
  road.receiveShadow = true;
  group.add(road);

  // Road markings
  for (let rx = -18; rx <= 18; rx += 4.5) {
    const markGeo = new THREE.PlaneGeometry(2.0, 0.2);
    markGeo.rotateX(-Math.PI / 2);
    const markMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const mark = new THREE.Mesh(markGeo, markMat);
    mark.position.set(rx, 0.02, -14);
    group.add(mark);
  }

  // ── Migsun Vilasa Building Facade ──────────────────────────────────────────
  const buildingGroup = new THREE.Group();
  buildingGroup.position.set(0, 0, -9.5);

  const wallMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.7 }); // warm cream
  const accentMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.5 }); // sky blue balconies
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.6 });

  // Main block: 26m wide, 9m tall, 4m deep
  const mainBlock = new THREE.Mesh(new THREE.BoxGeometry(26, 9, 4), wallMat);
  mainBlock.position.set(0, 4.5, 0);
  mainBlock.castShadow = true;
  mainBlock.receiveShadow = true;
  buildingGroup.add(mainBlock);

  // Roof cornice
  const cornice = new THREE.Mesh(new THREE.BoxGeometry(26.6, 0.5, 4.4), roofMat);
  cornice.position.set(0, 9.25, 0);
  buildingGroup.add(cornice);

  // Balconies (Blue residential railings)
  for (const bx of [-9, -4.5, 4.5, 9]) {
    for (const by of [3.5, 6.5]) {
      const balcony = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.9, 0.8), accentMat);
      balcony.position.set(bx, by, 2.2);
      balcony.castShadow = true;
      buildingGroup.add(balcony);

      const windowPane = new THREE.Mesh(
        new THREE.PlaneGeometry(2.4, 2.0),
        new THREE.MeshStandardMaterial({ color: 0x93c5fd, roughness: 0.2, metalness: 0.4 })
      );
      windowPane.position.set(bx, by + 0.8, 2.01);
      buildingGroup.add(windowPane);
    }
  }

  // "MIGSUN VILASA" Society Sign Board
  const signCanvas = document.createElement('canvas');
  signCanvas.width = 512;
  signCanvas.height = 128;
  const sCtx = signCanvas.getContext('2d');
  if (sCtx) {
    sCtx.fillStyle = '#0369a1';
    sCtx.fillRect(0, 0, 512, 128);
    sCtx.strokeStyle = '#38bdf8';
    sCtx.lineWidth = 8;
    sCtx.strokeRect(4, 4, 504, 120);
    sCtx.fillStyle = '#ffffff';
    sCtx.font = '900 42px sans-serif';
    sCtx.textAlign = 'center';
    sCtx.textBaseline = 'middle';
    sCtx.fillText('MIGSUN VILASA', 256, 64);
  }
  const signTex = new THREE.CanvasTexture(signCanvas);
  const signMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(6.4, 1.6),
    new THREE.MeshBasicMaterial({ map: signTex })
  );
  signMesh.position.set(0, 7.5, 2.02);
  buildingGroup.add(signMesh);

  group.add(buildingGroup);
  obstacles.push({ id: 'migsun_facade', type: 'building', minX: -13.5, maxX: 13.5, minZ: -11.5, maxZ: -7.5 });

  // ── Entrance Gate at South (Z = 8) ─────────────────────────────────────────
  const gateGroup = new THREE.Group();
  gateGroup.position.set(0, 0, 8);
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.6 });
  for (const px of [-4.5, 4.5]) {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.8, 3.5, 0.8), pillarMat);
    pillar.position.set(px, 1.75, 0);
    pillar.castShadow = true;
    gateGroup.add(pillar);
  }
  const gateArch = new THREE.Mesh(new THREE.BoxGeometry(9.8, 0.6, 0.6), pillarMat);
  gateArch.position.set(0, 3.5, 0);
  gateGroup.add(gateArch);
  group.add(gateGroup);

  // ── Left Side: Waste Pile Group (Unmanaged Waste) ──────────────────────────
  const wastePileGroup = new THREE.Group();
  wastePileGroup.name = 'waste_pile';
  wastePileGroup.position.set(-6, 0, 0);

  // Waste heap mounds (dirt & decaying scrap)
  const moundMat = new THREE.MeshStandardMaterial({ color: 0x543d2b, roughness: 0.95 });
  const mound1 = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 2.8, 0.6, 12), moundMat);
  mound1.position.set(0, 0.3, 0);
  wastePileGroup.add(mound1);

  const mound2 = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 2.0, 0.45, 10), moundMat);
  mound2.position.set(1.5, 0.22, 1.2);
  wastePileGroup.add(mound2);

  // Decorative debris blocks in heap
  const debrisColors = [0xd97706, 0xef4444, 0x3b82f6, 0x475569];
  for (let i = 0; i < 8; i++) {
    const dMat = new THREE.MeshStandardMaterial({ color: debrisColors[i % debrisColors.length], roughness: 0.7 });
    const dMesh = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.25, 0.4), dMat);
    dMesh.position.set(
      (Math.random() - 0.5) * 3,
      0.35 + Math.random() * 0.2,
      (Math.random() - 0.5) * 3
    );
    dMesh.rotation.set(Math.random(), Math.random(), Math.random());
    wastePileGroup.add(dMesh);
  }

  // Gray dying plants near waste pile (will revive later)
  const dyingMat = new THREE.MeshStandardMaterial({ color: 0x6b7280, roughness: 0.9 });
  for (let i = 0; i < 4; i++) {
    const plantGeo = new THREE.ConeGeometry(0.4, 1.1, 6);
    const plant = new THREE.Mesh(plantGeo, dyingMat.clone());
    plant.position.set(-2.5 + i * 1.5, 0.55, -2.5 + (i % 2) * 1.0);
    wastePileGroup.add(plant);
    revivalPlants.push(plant);
  }

  group.add(wastePileGroup);

  // ── Pest Particle Swarm (Flies over waste pile) ─────────────────────────────
  const pestCount = 60;
  const pestGeo = new THREE.BufferGeometry();
  const pestPositions = new Float32Array(pestCount * 3);
  for (let i = 0; i < pestCount; i++) {
    pestPositions[i * 3] = -6 + (Math.random() - 0.5) * 4.5;
    pestPositions[i * 3 + 1] = 0.5 + Math.random() * 1.8;
    pestPositions[i * 3 + 2] = (Math.random() - 0.5) * 4.5;
  }
  pestGeo.setAttribute('position', new THREE.BufferAttribute(pestPositions, 3));
  const pestMat = new THREE.PointsMaterial({
    color: 0x1c1917,
    size: 0.12,
    transparent: true,
    opacity: 0.85,
  });
  const pestParticles = new THREE.Points(pestGeo, pestMat);
  group.add(pestParticles);

  // ── Right Side: Clean Garden Group ─────────────────────────────────────────
  const cleanGardenGroup = new THREE.Group();
  cleanGardenGroup.position.set(6, 0, 0);

  // Flower beds
  const flowerBedMat = new THREE.MeshStandardMaterial({ color: 0x3f6212, roughness: 0.8 });
  const bed = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.2, 5.0), flowerBedMat);
  bed.position.set(0, 0.1, 0);
  cleanGardenGroup.add(bed);

  // Trees and flowers
  const treeTrunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
  const treeFoliageMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });
  for (const [tx, tz] of [[-1.5, -1.5], [1.5, 1.5], [-1.0, 1.8]]) {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 1.8, 8), treeTrunkMat);
    trunk.position.set(tx, 0.9, tz);
    cleanGardenGroup.add(trunk);

    const foliage = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.8, 8), treeFoliageMat);
    foliage.position.set(tx, 2.2, tz);
    cleanGardenGroup.add(foliage);
  }

  // Colorful flower heads
  const flwColors = [0xf43f5e, 0xfacc15, 0xa855f7, 0x38bdf8];
  for (let i = 0; i < 12; i++) {
    const flwMat = new THREE.MeshStandardMaterial({ color: flwColors[i % flwColors.length] });
    const flw = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), flwMat);
    flw.position.set((Math.random() - 0.5) * 4.2, 0.28, (Math.random() - 0.5) * 4.2);
    cleanGardenGroup.add(flw);
  }

  group.add(cleanGardenGroup);

  // ── 3 Bin Installation Location Markers ────────────────────────────────────
  const binInstallLocations = [
    {
      id: 'entrance',
      label: 'Main Entrance',
      position: new THREE.Vector3(-0.5, 0.05, 5.0),
      isCorrect: true,
    },
    {
      id: 'garden',
      label: 'Near Garden',
      position: new THREE.Vector3(4.0, 0.05, -3.0),
      isCorrect: true,
    },
    {
      id: 'walkway',
      label: 'Center Walkway',
      position: new THREE.Vector3(0, 0.05, 0),
      isCorrect: false,
    },
  ];

  const markerGroup = new THREE.Group();
  markerGroup.name = 'bin_install_markers';
  binInstallLocations.forEach((loc) => {
    const ringGeo = new THREE.RingGeometry(0.9, 1.15, 24);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.copy(loc.position);
    ringMesh.userData = { locationId: loc.id };
    markerGroup.add(ringMesh);
  });
  group.add(markerGroup);

  // ── 4 Color-coded Bins (Initially hidden until installed) ───────────────────
  const binContainer = new THREE.Group();
  binContainer.name = 'bin_container';
  binContainer.position.set(-0.5, 0, 5.0); // default at entrance
  binContainer.visible = true; // visible for standard sorting, can reposition

  const binSpacing = 1.6;
  const binStartX = -((activeBins.length - 1) * binSpacing) / 2;

  activeBins.forEach((binType, idx) => {
    const xPos = binStartX + idx * binSpacing;
    const binColor = BIN_COLORS[binType] ?? 0x10b981;

    // Cylinder bin body
    const binGeo = new THREE.CylinderGeometry(0.42, 0.36, 1.1, 16);
    const binMat = new THREE.MeshStandardMaterial({
      color: binColor,
      roughness: 0.4,
      metalness: 0.1,
    });
    const binMesh = new THREE.Mesh(binGeo, binMat);
    binMesh.position.set(xPos, 0.55, 0);
    binMesh.castShadow = true;
    binMesh.receiveShadow = true;
    binMesh.userData = { binType };

    // Lid
    const lidGeo = new THREE.CylinderGeometry(0.46, 0.44, 0.15, 16);
    const lidMat = new THREE.MeshStandardMaterial({
      color: binColor,
      roughness: 0.3,
      metalness: 0.1,
    });
    const lid = new THREE.Mesh(lidGeo, lidMat);
    lid.position.set(0, 0.6, 0);
    binMesh.add(lid);
    binMesh.userData.lid = lid;

    binMeshes.set(binType, binMesh);
    binContainer.add(binMesh);

    // Glow ring
    const glowGeo = new THREE.RingGeometry(0.55, 0.8, 24);
    glowGeo.rotateX(-Math.PI / 2);
    const glowMat = new THREE.MeshBasicMaterial({
      color: binColor,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    glowMesh.position.set(xPos, 0.04, 0);
    binGlowRings.set(binType, glowMesh);
    binContainer.add(glowMesh);

    // Trigger mesh
    const trigGeo = new THREE.CylinderGeometry(0.9, 0.9, 1.4, 12);
    const trigMat = new THREE.MeshBasicMaterial({ visible: false });
    const trigMesh = new THREE.Mesh(trigGeo, trigMat);
    trigMesh.position.set(xPos, 0.7, 0);
    trigMesh.userData = { binType, isBinTrigger: true };
    binTriggers.set(binType, trigMesh);
    binContainer.add(trigMesh);

    obstacles.push({
      id: `bin_${binType}`,
      type: 'prop',
      minX: binContainer.position.x + xPos - 0.6,
      maxX: binContainer.position.x + xPos + 0.6,
      minZ: binContainer.position.z - 0.6,
      maxZ: binContainer.position.z + 0.6,
    });
  });

  group.add(binContainer);

  // ── Garbage Truck ──────────────────────────────────────────────────────────
  const truckGroup = new THREE.Group();
  truckGroup.name = 'garbage_truck';
  truckGroup.visible = false;

  const truckBodyMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });
  const truckGreenMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.3 });
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.8 });

  // Cab
  const cab = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.9, 2.2), truckBodyMat);
  cab.position.set(0, 1.4, 1.1);
  cab.castShadow = true;
  truckGroup.add(cab);

  // Body / compactor
  const hopper = new THREE.Mesh(new THREE.BoxGeometry(2.3, 2.4, 4.2), truckGreenMat);
  hopper.position.set(0, 1.7, -1.8);
  hopper.castShadow = true;
  truckGroup.add(hopper);

  // Wheels
  [[-1.15, 0.45, 1.1], [1.15, 0.45, 1.1], [-1.15, 0.45, -1.8], [1.15, 0.45, -1.8]].forEach(([wx, wy, wz]) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.3, 16), wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(wx, wy, wz);
    wheel.castShadow = true;
    truckGroup.add(wheel);
  });

  const truckStartPos = new THREE.Vector3(22, 0, -14);
  const truckEndPos = new THREE.Vector3(0, 0, -14);
  truckGroup.position.copy(truckStartPos);
  group.add(truckGroup);

  // ── Litter Spawn Points ────────────────────────────────────────────────────
  const litterSpawnPoints: THREE.Vector3[] = [
    new THREE.Vector3(-6.5, 0.05, -1.2),
    new THREE.Vector3(-5.0, 0.05, 0.8),
    new THREE.Vector3(-7.2, 0.05, 1.5),
    new THREE.Vector3(-4.0, 0.05, -2.0),
    new THREE.Vector3(-6.0, 0.05, 2.8),
    new THREE.Vector3(-3.0, 0.05, 0.5),
    new THREE.Vector3(-5.5, 0.05, -3.2),
    new THREE.Vector3(-7.8, 0.05, -0.5),
    new THREE.Vector3(-3.5, 0.05, 2.2),
  ];

  const hiddenSpawnPoints: THREE.Vector3[] = [
    new THREE.Vector3(-8.2, 0.05, -2.5),
    new THREE.Vector3(-7.5, 0.05, 3.2),
    new THREE.Vector3(-4.5, 0.05, -4.0),
  ];

  const pinnedLitterSpots: PinnedLitterSpot[] = [
    { position: new THREE.Vector3(-6.2, 0.05, 0.2), itemId: 'banana_peel' },
    { position: new THREE.Vector3(-5.1, 0.05, -1.5), itemId: 'plastic_bottle_water' },
    { position: new THREE.Vector3(-4.5, 0.05, 1.8), itemId: 'battery_aa' },
    { position: new THREE.Vector3(-6.8, 0.05, 2.2), itemId: 'used_tissue' },
  ];

  // ── Functions & Animation ──────────────────────────────────────────────────
  function animate(elapsed: number, _delta: number) {
    // Pest particle jitter
    if (pestParticles.visible) {
      const pPos = pestParticles.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pestCount; i++) {
        pPos.setY(i, 0.6 + Math.sin(elapsed * 5.0 + i) * 0.4 + Math.random() * 0.05);
      }
      pPos.needsUpdate = true;
    }

    // Glow ring soft breath
    binGlowRings.forEach((ring) => {
      const mat = ring.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.25 + 0.15 * Math.sin(elapsed * 3.0);
    });
  }

  function triggerBinAnimation(bin: BinType) {
    const bodyMesh = binMeshes.get(bin);
    if (!bodyMesh) return;
    const lid = bodyMesh.userData.lid as THREE.Mesh | undefined;
    if (!lid) return;
    lid.rotation.x = -1.0;
    setTimeout(() => {
      lid.rotation.x = 0;
    }, 600);
  }

  function animateTruckArrival(progress: number) {
    if (progress > 0) truckGroup.visible = true;
    const eased = 1 - Math.pow(1 - Math.min(progress, 1), 3);
    truckGroup.position.x = THREE.MathUtils.lerp(truckStartPos.x, truckEndPos.x, eased);
  }

  function triggerPlantRevival() {
    // Transition gray dying plants to vibrant green
    const greenColor = new THREE.Color(0x22c55e);
    revivalPlants.forEach((p) => {
      if (p.material instanceof THREE.MeshStandardMaterial) {
        p.material.color.lerp(greenColor, 0.85);
      }
    });

    // Fade out waste mounds
    wastePileGroup.traverse((child) => {
      if (child instanceof THREE.Mesh && !revivalPlants.includes(child)) {
        child.visible = false;
      }
    });
  }

  function showBinsAtLocation(locationId: string) {
    const loc = binInstallLocations.find((l) => l.id === locationId);
    if (loc) {
      binContainer.position.copy(loc.position);
    }
  }

  function removePests() {
    pestParticles.visible = false;
  }

  return {
    migsunGroup: group,
    obstacles,
    wastePileGroup,
    cleanGardenGroup,
    revivalPlants,
    pestParticles,
    binMeshes,
    binTriggers,
    binGlowRings,
    binInstallLocations,
    litterSpawnPoints,
    hiddenSpawnPoints,
    pinnedLitterSpots,
    truckMesh: truckGroup,
    truckStartPos,
    truckEndPos,
    spawnPoint: new THREE.Vector3(0, 0, 6.0), // Kai faces camera/society
    animate,
    triggerBinAnimation,
    animateTruckArrival,
    triggerPlantRevival,
    showBinsAtLocation,
    removePests,
  };
}
