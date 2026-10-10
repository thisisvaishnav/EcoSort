/**
 * Society Scene — Level 1 "Waste Detective"
 *
 * Procedural Three.js scene: Indian residential society with scattered litter,
 * 4 color-coded bins, a garbage collection area, and an animated garbage truck.
 *
 * Scene layout (top-down):
 *   Z = -12  → Building façade (top)
 *   Z = -8   → Building façade
 *   Z = -3.8 → Bin row, straight along the building front (openings face +Z)
 *   Z =  0   → Open compound / scattered litter
 *   Z =  6   → Society entrance gate
 *   Z = 11   → Road + truck path (bottom, opposite side)
 */

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { BinType } from '../../types/game';
import { WorldObstacle } from './types';

export interface SocietySceneResult {
  societyGroup: THREE.Group;
  obstacles: WorldObstacle[];
  binMeshes: Map<BinType, THREE.Mesh>;
  binTriggers: Map<BinType, THREE.Mesh>;
  binGlowRings: Map<BinType, THREE.Mesh>;
  litterSpawnPoints: THREE.Vector3[];   // 12 visible positions
  hiddenSpawnPoints: THREE.Vector3[];   // 3 behind bench / plants
  truckMesh: THREE.Group;
  truckStartPos: THREE.Vector3;
  truckEndPos: THREE.Vector3;
  animate: (elapsed: number, delta: number) => void;
  triggerBinAnimation: (bin: BinType) => void;
  animateTruckArrival: (progress: number) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Colour constants
// ─────────────────────────────────────────────────────────────────────────────
const BIN_COLORS: Record<BinType, number> = {
  wet: 0x10b981,        // emerald green
  dry: 0x3b82f6,        // blue
  hazardous: 0xe11d48,  // rose
  residual: 0x1e293b,   // near-black
  paper: 0x0284c7,
  plastic: 0xf59e0b,
  ewaste: 0xf97316,
  reuse: 0x0d9488,
};

// ─────────────────────────────────────────────────────────────────────────────
// Canvas texture helpers
// ─────────────────────────────────────────────────────────────────────────────
/** White bin icon on a transparent background (matches the home-base artwork) */
function makeBinIconTexture(binType: BinType): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

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
    // Cut the central vein out of the leaf
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(128, 65);
    ctx.lineTo(128, 195);
    ctx.stroke();
    ctx.restore();
  } else if (binType === 'hazardous') {
    // Caution triangle with exclamation point
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
  } else if (binType === 'ewaste') {
    // Computer monitor
    ctx.lineWidth = 12;
    ctx.strokeRect(58, 68, 140, 96);
    ctx.beginPath();
    ctx.moveTo(128, 166);
    ctx.lineTo(128, 196);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(96, 196);
    ctx.lineTo(160, 196);
    ctx.stroke();
  } else if (binType === 'residual') {
    // Simple dustbin outline (lid + tapered body)
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
    // Recycle loop (dry, paper, plastic, reuse)
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

function makeConcreteTex(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#b0a898';
  ctx.fillRect(0, 0, 256, 256);

  // Rough texture
  for (let i = 0; i < 1800; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const brightness = 100 + Math.floor(Math.random() * 80);
    ctx.fillStyle = `rgb(${brightness},${brightness - 10},${brightness - 20})`;
    ctx.fillRect(x, y, 2, 2);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 6);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeWallTex(base: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 256, 256);

  // Subtle brick pattern
  ctx.strokeStyle = 'rgba(0,0,0,0.08)';
  ctx.lineWidth = 1.5;
  for (let row = 0; row < 8; row++) {
    const offset = row % 2 === 0 ? 0 : 16;
    for (let col = 0; col < 8; col++) {
      ctx.strokeRect(col * 32 + offset - 16, row * 32, 30, 28);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main factory
// ─────────────────────────────────────────────────────────────────────────────
export function createSocietyScene(activeBins: BinType[] = ['wet', 'dry', 'hazardous', 'residual']): SocietySceneResult {
  const group = new THREE.Group();
  group.name = 'society_scene';

  const obstacles: WorldObstacle[] = [];
  const binMeshes = new Map<BinType, THREE.Mesh>();
  const binTriggers = new Map<BinType, THREE.Mesh>();
  const binGlowRings = new Map<BinType, THREE.Mesh>();

  // ── Lighting ──────────────────────────────────────────────────────────────
  const ambient = new THREE.AmbientLight(0xfff8ec, 0.9);
  group.add(ambient);

  const sun = new THREE.DirectionalLight(0xfff4d6, 1.4);
  sun.position.set(8, 18, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 60;
  sun.shadow.camera.left = -18;
  sun.shadow.camera.right = 18;
  sun.shadow.camera.top = 18;
  sun.shadow.camera.bottom = -18;
  group.add(sun);

  // Soft fill from opposite side
  const fill = new THREE.DirectionalLight(0xddeeff, 0.35);
  fill.position.set(-6, 10, -4);
  group.add(fill);

  // Street lamp point light near bins
  const lampLight = new THREE.PointLight(0xfff3b0, 1.2, 12);
  lampLight.position.set(-6.5, 4.5, -2);
  group.add(lampLight);

  // ── Ground ────────────────────────────────────────────────────────────────
  const concreteTex = makeConcreteTex();
  const groundGeo = new THREE.PlaneGeometry(24, 24);
  const groundMat = new THREE.MeshStandardMaterial({
    map: concreteTex,
    roughness: 0.9,
    metalness: 0.0,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, 0, 0);
  ground.receiveShadow = true;
  group.add(ground);

  // ── Road (bottom strip — opposite side of the scene) ──────────────────────
  const roadGeo = new THREE.PlaneGeometry(24, 4);
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.95 });
  const road = new THREE.Mesh(roadGeo, roadMat);
  road.rotation.x = -Math.PI / 2;
  road.position.set(0, 0.01, 11);
  road.receiveShadow = true;
  group.add(road);

  // Road lane markings
  for (let i = -4; i <= 4; i += 2) {
    const lineGeo = new THREE.PlaneGeometry(0.18, 1.2);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    const line = new THREE.Mesh(lineGeo, lineMat);
    line.rotation.x = -Math.PI / 2;
    line.position.set(i * 1.2, 0.02, 11);
    group.add(line);
  }

  // ── Residential Building ──────────────────────────────────────────────────
  const wallTex = makeWallTex('#f5e6c8');
  const wallMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.8 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0xc77741, roughness: 0.7 });
  const windowMat = new THREE.MeshStandardMaterial({ color: 0x93c5fd, roughness: 0.1, metalness: 0.2 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.6 });

  // Main building block (3 floors)
  const buildW = 11;
  const buildH = 7.5;
  const buildD = 3.5;
  const buildGeo = new THREE.BoxGeometry(buildW, buildH, buildD);
  const building = new THREE.Mesh(buildGeo, wallMat);
  building.position.set(0, buildH / 2, -8.5);
  building.castShadow = true;
  building.receiveShadow = true;
  group.add(building);

  // Roof lip
  const roofGeo = new THREE.BoxGeometry(buildW + 0.4, 0.4, buildD + 0.4);
  const roofMesh = new THREE.Mesh(roofGeo, roofMat);
  roofMesh.position.set(0, buildH + 0.2, -8.5);
  group.add(roofMesh);

  // Building obstacle
  obstacles.push({ id: 'building', type: 'building', minX: -buildW / 2 - 0.3, maxX: buildW / 2 + 0.3, minZ: -10.5, maxZ: -6.5 });

  // Windows — 3 floors × 4 columns
  for (let floor = 0; floor < 3; floor++) {
    for (let col = -1; col <= 1; col++) {
      const winGeo = new THREE.BoxGeometry(0.9, 1.1, 0.08);
      const win = new THREE.Mesh(winGeo, windowMat);
      win.position.set(col * 2.5, 1.6 + floor * 2.4, -6.76);
      group.add(win);

      // Window frame
      const frameGeo = new THREE.BoxGeometry(1.0, 1.2, 0.06);
      const frameMesh = new THREE.Mesh(frameGeo, accentMat);
      frameMesh.position.set(col * 2.5, 1.6 + floor * 2.4, -6.74);
      group.add(frameMesh);
    }
  }

  // Balconies (floor 2 and 3)
  for (let floor = 1; floor <= 2; floor++) {
    for (let col = -1; col <= 1; col++) {
      const balGeo = new THREE.BoxGeometry(1.4, 0.12, 0.8);
      const balMesh = new THREE.Mesh(balGeo, accentMat);
      balMesh.position.set(col * 2.5, floor * 2.4 + 0.9, -6.4);
      group.add(balMesh);

      // Railing
      const railGeo = new THREE.BoxGeometry(1.4, 0.6, 0.06);
      const railMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
      const rail = new THREE.Mesh(railGeo, railMat);
      rail.position.set(col * 2.5, floor * 2.4 + 1.2, -6.04);
      group.add(rail);
    }
  }

  // Entrance arch
  const archW = 2.4;
  const archGeo = new THREE.BoxGeometry(archW, 3.2, 0.4);
  const archMesh = new THREE.Mesh(archGeo, accentMat);
  archMesh.position.set(0, 1.6, -6.6);
  group.add(archMesh);

  // Arch cut-out (door area — slightly darker inset)
  const doorGeo = new THREE.BoxGeometry(1.4, 2.4, 0.5);
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.9 });
  const door = new THREE.Mesh(doorGeo, doorMat);
  door.position.set(0, 1.2, -6.5);
  group.add(door);

  // Building name text sprite
  const nameCanvas = document.createElement('canvas');
  nameCanvas.width = 256;
  nameCanvas.height = 64;
  const nc = nameCanvas.getContext('2d')!;
  nc.fillStyle = '#c77741';
  nc.fillRect(0, 0, 256, 64);
  nc.fillStyle = '#ffffff';
  nc.font = 'bold 20px sans-serif';
  nc.textAlign = 'center';
  nc.textBaseline = 'middle';
  nc.fillText('ECO SOCIETY', 128, 32);
  const nameTex = new THREE.CanvasTexture(nameCanvas);
  const nameSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: nameTex }));
  nameSprite.position.set(0, 8.4, -8.0);
  nameSprite.scale.set(3.5, 0.9, 1);
  group.add(nameSprite);

  // ── Compound Perimeter Walls ──────────────────────────────────────────────
  const wallH = 2.2;
  const wallMat2 = new THREE.MeshStandardMaterial({ color: 0xe8d5b4, roughness: 0.85 });

  // Left wall
  const wallL = new THREE.Mesh(new THREE.BoxGeometry(0.3, wallH, 20), wallMat2);
  wallL.position.set(-12, wallH / 2, -2);
  wallL.castShadow = true;
  group.add(wallL);
  obstacles.push({ id: 'wall_left', type: 'fence', minX: -12.4, maxX: -11.7, minZ: -12, maxZ: 8 });

  // Right wall
  const wallR = new THREE.Mesh(new THREE.BoxGeometry(0.3, wallH, 20), wallMat2);
  wallR.position.set(12, wallH / 2, -2);
  wallR.castShadow = true;
  group.add(wallR);
  obstacles.push({ id: 'wall_right', type: 'fence', minX: 11.7, maxX: 12.4, minZ: -12, maxZ: 8 });

  // Front gate wall sections (left of gate opening)
  const gateWallMat = new THREE.MeshStandardMaterial({ color: 0xc9a87c, roughness: 0.7 });
  const gateWallL = new THREE.Mesh(new THREE.BoxGeometry(4, wallH, 0.3), gateWallMat);
  gateWallL.position.set(-8, wallH / 2, 7);
  group.add(gateWallL);

  const gateWallR = new THREE.Mesh(new THREE.BoxGeometry(4, wallH, 0.3), gateWallMat);
  gateWallR.position.set(8, wallH / 2, 7);
  group.add(gateWallR);

  // Gate pillars
  for (const px of [-5.5, 5.5]) {
    const pillarGeo = new THREE.BoxGeometry(0.5, wallH + 0.6, 0.5);
    const pillar = new THREE.Mesh(pillarGeo, accentMat);
    pillar.position.set(px, (wallH + 0.6) / 2, 7);
    pillar.castShadow = true;
    group.add(pillar);
  }

  // ── Garbage Collection Area ────────────────────────────────────────────────────
  // Raised platform running along the building front, centred on the entrance axis
  const BIN_ROW_X = 0; // aligned with the building centre + entrance arch
  const BIN_ROW_Z = -3.8;
  const platformGeo = new THREE.BoxGeometry(10, 0.12, 3.5);
  const platformMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.7 });
  const platform = new THREE.Mesh(platformGeo, platformMat);
  platform.position.set(BIN_ROW_X, 0.06, BIN_ROW_Z);
  platform.receiveShadow = true;
  group.add(platform);

  // "WASTE COLLECTION" marking on platform
  const markCanvas = document.createElement('canvas');
  markCanvas.width = 256;
  markCanvas.height = 64;
  const mc = markCanvas.getContext('2d')!;
  mc.fillStyle = '#fbbf24';
  mc.fillRect(0, 0, 256, 64);
  mc.fillStyle = '#1e293b';
  mc.font = 'bold 13px sans-serif';
  mc.textAlign = 'center';
  mc.textBaseline = 'middle';
  mc.fillText('WASTE COLLECTION', 128, 32);
  const markTex = new THREE.CanvasTexture(markCanvas);
  const markSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: markTex }));
  // Lying flat on the platform, just in front of the bin row so it stays visible
  markSprite.position.set(BIN_ROW_X, 0.15, BIN_ROW_Z + 1.1);
  markSprite.scale.set(4.5, 1.1, 1);
  markSprite.rotation.x = -Math.PI / 2;
  group.add(markSprite);

  // ── 4 Color-coded Bins — straight row along the building front ──────────────
  // Openings / icons face +Z: toward the player spawn and the compound entrance.
  const binSpacing = 2.4;
  const binStartX = BIN_ROW_X - ((activeBins.length - 1) * binSpacing) / 2;
  const BIN_W = 1.15;
  const BIN_H = 1.55;
  const BIN_D = 1.0;

  activeBins.forEach((binType, idx) => {
    const hexColor = BIN_COLORS[binType] ?? 0x334155;
    const xPos = binStartX + idx * binSpacing;
    const zPos = BIN_ROW_Z;

    const binGroup = new THREE.Group();

    // Bin body — soft rounded box, matte finish
    const bodyMat = new THREE.MeshStandardMaterial({
      color: hexColor,
      roughness: 0.45,
      metalness: 0.05,
    });
    const bodyMesh = new THREE.Mesh(new RoundedBoxGeometry(BIN_W, BIN_H, BIN_D, 4, 0.08), bodyMat);
    bodyMesh.position.y = BIN_H / 2;
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    binGroup.add(bodyMesh);
    binMeshes.set(binType, bodyMesh);

    // Dark interior under the lid so the open bin looks deep
    const interior = new THREE.Mesh(
      new THREE.PlaneGeometry(BIN_W - 0.12, BIN_D - 0.12),
      new THREE.MeshBasicMaterial({ color: 0x0a0a0a })
    );
    interior.rotation.x = -Math.PI / 2;
    interior.position.y = BIN_H - 0.02;
    binGroup.add(interior);

    // Large white front icon (leaf / recycle / monitor / hazard / dustbin)
    const icon = new THREE.Mesh(
      new THREE.PlaneGeometry(0.72, 0.72),
      new THREE.MeshStandardMaterial({
        map: makeBinIconTexture(binType),
        transparent: true,
        alphaTest: 0.05,
        roughness: 0.45,
        metalness: 0,
      })
    );
    icon.position.set(0, BIN_H * 0.55, BIN_D / 2 + 0.008);
    binGroup.add(icon);

    // Hinged lid in the same colour as the body (swings open on a successful throw)
    const lidPivot = new THREE.Group();
    lidPivot.position.set(0, BIN_H, -BIN_D / 2);

    const lidMat = new THREE.MeshStandardMaterial({
      color: hexColor,
      roughness: 0.4,
      metalness: 0.05,
    });
    const lidGeo = new RoundedBoxGeometry(BIN_W + 0.1, 0.14, BIN_D + 0.1, 3, 0.05);
    lidGeo.translate(0, 0.07, (BIN_D + 0.1) / 2); // hinge sits at the back edge
    const lid = new THREE.Mesh(lidGeo, lidMat);
    lid.castShadow = true;
    lidPivot.add(lid);

    // Handle bar across the lid front, slightly darker for contrast
    const handleMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(hexColor).multiplyScalar(0.72),
      roughness: 0.5,
    });
    const handle = new THREE.Mesh(new RoundedBoxGeometry(0.4, 0.08, 0.12, 2, 0.03), handleMat);
    handle.position.set(0, 0.14, (BIN_D + 0.1) / 2 + 0.02);
    lidPivot.add(handle);

    binGroup.add(lidPivot);
    bodyMesh.userData.lid = lidPivot;

    // Glow ring on floor
    const ringGeo = new THREE.RingGeometry(0.8, 1.05, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: hexColor,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    binGroup.add(ring);
    binGlowRings.set(binType, ring);

    // Invisible trigger cylinder (proximity detection)
    const trigGeo = new THREE.CylinderGeometry(1.2, 1.2, 2.2, 12);
    const trigMat = new THREE.MeshBasicMaterial({ visible: false });
    const trigger = new THREE.Mesh(trigGeo, trigMat);
    trigger.position.y = 1.1;
    binGroup.add(trigger);
    binTriggers.set(binType, trigger);

    binGroup.position.set(xPos, 0, zPos);
    group.add(binGroup);

    // Obstacle box for each bin
    obstacles.push({ id: `bin_${binType}`, type: 'prop', minX: xPos - 0.85, maxX: xPos + 0.85, minZ: zPos - 0.85, maxZ: zPos + 0.85 });
  });

  // ── Street Lamp ───────────────────────────────────────────────────────────
  const poleGeo = new THREE.CylinderGeometry(0.06, 0.06, 5.2, 8);
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.3, metalness: 0.7 });
  const pole = new THREE.Mesh(poleGeo, poleMat);
  pole.position.set(-6.5, 2.6, -2);
  pole.castShadow = true;
  group.add(pole);

  const armGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.2, 8);
  const arm = new THREE.Mesh(armGeo, poleMat);
  arm.position.set(-5.9, 5.0, -2);
  arm.rotation.z = Math.PI / 2;
  group.add(arm);

  const lampGeo = new THREE.SphereGeometry(0.18, 12, 10);
  const lampMat = new THREE.MeshStandardMaterial({
    color: 0xfff9c4,
    emissive: 0xfff3b0,
    emissiveIntensity: 1.4,
  });
  const lampMesh = new THREE.Mesh(lampGeo, lampMat);
  lampMesh.position.set(-5.3, 5.0, -2);
  group.add(lampMesh);

  // ── Bench ─────────────────────────────────────────────────────────────────
  const benchMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.7 });
  const seatGeo = new THREE.BoxGeometry(2.2, 0.1, 0.7);
  const seat = new THREE.Mesh(seatGeo, benchMat);
  seat.position.set(6.5, 0.55, 0.5);
  seat.castShadow = true;
  seat.receiveShadow = true;
  group.add(seat);

  const backGeo = new THREE.BoxGeometry(2.2, 0.8, 0.1);
  const back = new THREE.Mesh(backGeo, benchMat);
  back.position.set(6.5, 0.95, 0.85);
  back.castShadow = true;
  group.add(back);

  // Legs
  const legMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6, metalness: 0.2 });
  [[-0.9, 0.2], [0.9, 0.2], [-0.9, 0.8], [0.9, 0.8]].forEach(([x, z]) => {
    const legGeo = new THREE.BoxGeometry(0.1, 0.55, 0.1);
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(6.5 + x, 0.275, z);
    group.add(leg);
  });

  // Bench obstacle
  obstacles.push({ id: 'bench', type: 'prop', minX: 5.3, maxX: 7.7, minZ: 0.0, maxZ: 1.1 });

  // ── Decorative Trees / Plants ─────────────────────────────────────────────
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.7 });
  const leafMat2 = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.7 });

  const treePositions: [number, number][] = [[-9, -5], [-8, 1.5], [8.5, -1], [8, -6]];
  treePositions.forEach(([tx, tz]) => {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 1.6, 8), trunkMat);
    trunk.position.set(tx, 0.8, tz);
    trunk.castShadow = true;
    group.add(trunk);

    const leaves = new THREE.Mesh(new THREE.ConeGeometry(0.9, 2.4, 8), leafMat);
    leaves.position.set(tx, 2.8, tz);
    leaves.castShadow = true;
    group.add(leaves);

    const leaves2 = new THREE.Mesh(new THREE.ConeGeometry(0.65, 1.8, 8), leafMat2);
    leaves2.position.set(tx, 3.8, tz);
    leaves2.castShadow = true;
    group.add(leaves2);

    // Tree obstacle
    obstacles.push({ id: `tree_${tx}_${tz}`, type: 'prop', minX: tx - 0.5, maxX: tx + 0.5, minZ: tz - 0.5, maxZ: tz + 0.5 });
  });

  // Bush near bench (hides items behind it)
  const bushMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.85 });
  const bush = new THREE.Mesh(new THREE.SphereGeometry(0.8, 10, 8), bushMat);
  bush.position.set(5.5, 0.6, 2.2);
  bush.scale.set(1, 0.7, 1);
  bush.castShadow = true;
  group.add(bush);

  obstacles.push({ id: 'bush', type: 'prop', minX: 4.8, maxX: 6.2, minZ: 1.6, maxZ: 2.8 });

  // ── Garbage Truck ─────────────────────────────────────────────────────────
  const truckGroup = new THREE.Group();

  const truckBodyMat = new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.4, metalness: 0.1 });
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

  // Start truck parked far right off-screen (on the road at Z = +11)
  const truckStartPos = new THREE.Vector3(22, 0, 11);
  const truckEndPos = new THREE.Vector3(6, 0, 11);
  truckGroup.position.copy(truckStartPos);
  truckGroup.visible = false;
  group.add(truckGroup);

  // ── Spawn Points ──────────────────────────────────────────────────────────
  // 12 visible spawn points across the compound
  const litterSpawnPoints: THREE.Vector3[] = [
    new THREE.Vector3(-6, 0.05, -1),
    new THREE.Vector3(-4.5, 0.05, 1.5),
    new THREE.Vector3(-3, 0.05, 3.5),
    new THREE.Vector3(-1.5, 0.05, 1),
    new THREE.Vector3(0.5, 0.05, 2.5),
    new THREE.Vector3(2, 0.05, 4.5),
    new THREE.Vector3(3.5, 0.05, 1.5),
    new THREE.Vector3(4.5, 0.05, 3.5),
    new THREE.Vector3(-7, 0.05, 3),
    new THREE.Vector3(-5, 0.05, 5),
    new THREE.Vector3(1, 0.05, -1.5),
    new THREE.Vector3(-2, 0.05, -0.5),
  ];

  // 3 hidden spawn points (behind bench and bush)
  const hiddenSpawnPoints: THREE.Vector3[] = [
    new THREE.Vector3(6.8, 0.05, 1.2),  // behind bench
    new THREE.Vector3(5.3, 0.05, 2.4),  // behind bush
    new THREE.Vector3(6.2, 0.05, 0.4),  // beside bench
  ];

  // ── Animate helper ────────────────────────────────────────────────────────
  function animate(elapsed: number, _delta: number) {

    // Gentle lamp light flicker
    lampLight.intensity = 1.1 + 0.1 * Math.sin(elapsed * 2.4);

    // Soft glow ring pulse on bins (base idle animation — proximity overrides opacity)
    binGlowRings.forEach((ring) => {
      const mat = ring.material as THREE.MeshBasicMaterial;
      if (mat.opacity > 0.05) {
        // Only pulse if glow is already visible (triggered by proximity)
        mat.opacity = Math.max(0, mat.opacity - 0.015);
      }
    });
  }

  // Lid animation state
  const lidOpenAngles = new Map<BinType, number>();
  activeBins.forEach((b) => lidOpenAngles.set(b, 0));

  function triggerBinAnimation(bin: BinType) {
    const bodyMesh = binMeshes.get(bin);
    if (!bodyMesh) return;
    const lid = bodyMesh.userData.lid as THREE.Mesh | undefined;
    if (!lid) return;
    // Animate lid open (tilt backward strongly — bigger bin = more theatrical)
    const targetAngle = -1.1;
    lid.rotation.x = THREE.MathUtils.lerp(lid.rotation.x, targetAngle, 0.35);
    setTimeout(() => {
      lid.rotation.x = THREE.MathUtils.lerp(lid.rotation.x, 0, 0.3);
    }, 700);
  }

  function animateTruckArrival(progress: number) {
    if (progress > 0) {
      truckGroup.visible = true;
    }
    // Ease-out curve so truck decelerates as it parks
    const eased = 1 - Math.pow(1 - Math.min(progress, 1), 3);
    truckGroup.position.x = THREE.MathUtils.lerp(truckStartPos.x, truckEndPos.x, eased);
    truckGroup.position.z = truckStartPos.z;
    truckGroup.position.y = truckStartPos.y;

    // Slight bounce when parked
    if (progress >= 0.98) {
      truckGroup.position.y = Math.abs(Math.sin(progress * 40)) * 0.04;
    }

    // Wheel rotation (slows as truck slows)
    const speed = Math.max(0, 1 - eased) * 0.12 + 0.01;
    truckGroup.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry instanceof THREE.CylinderGeometry) {
        if (child.rotation.z === Math.PI / 2 || Math.abs(child.rotation.z - Math.PI / 2) < 0.01) {
          child.rotation.x += speed;
        }
      }
    });
  }

  return {
    societyGroup: group,
    obstacles,
    binMeshes,
    binTriggers,
    binGlowRings,
    litterSpawnPoints,
    hiddenSpawnPoints,
    truckMesh: truckGroup,
    truckStartPos,
    truckEndPos,
    animate,
    triggerBinAnimation,
    animateTruckArrival,
  };
}
