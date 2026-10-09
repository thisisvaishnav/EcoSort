import * as THREE from 'three';
import { BinType } from '../../types/game';
import { WorldObstacle } from './types';

export interface HomeKitchenSceneResult {
  kitchenGroup: THREE.Group;
  obstacles: WorldObstacle[];
  binPositions: Map<BinType, THREE.Vector3>;
  binMeshes: Map<BinType, THREE.Group>;
  tableCenter: THREE.Vector3;
  referenceCameraPosition: THREE.Vector3;
  referenceCameraLookAt: THREE.Vector3;
  sortCameraPosition: THREE.Vector3;
  sortCameraLookAt: THREE.Vector3;
  pendantLight: THREE.PointLight;
  sunLight: THREE.DirectionalLight;
  triggerBinAnimation: (binType: BinType) => void;
  animate: (time: number, delta: number) => void;
}

// ============================================================================
// PROCEDURAL CANVAS TEXTURE GENERATORS
// ============================================================================

/** Generates high-resolution gingham / checkered fabric texture */
function createCheckeredTexture(
  color1: string,
  color2: string,
  tileSize = 64,
  repeat = 4
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = tileSize * repeat;
  canvas.height = tileSize * repeat;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    for (let r = 0; r < repeat; r++) {
      for (let c = 0; c < repeat; c++) {
        ctx.fillStyle = (r + c) % 2 === 0 ? color1 : color2;
        ctx.fillRect(c * tileSize, r * tileSize, tileSize, tileSize);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Generates warm wood parquet / terracotta floor tile texture */
function createParquetFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#b45309'; // warm amber wood base
    ctx.fillRect(0, 0, 512, 512);

    const gridSize = 64;
    for (let y = 0; y < 512; y += gridSize) {
      for (let x = 0; x < 512; x += gridSize) {
        // Wood plank variation
        const brightness = 0.85 + Math.random() * 0.25;
        ctx.fillStyle = `rgb(${Math.floor(217 * brightness)}, ${Math.floor(119 * brightness)}, ${Math.floor(6 * brightness)})`;
        ctx.fillRect(x + 2, y + 2, gridSize - 4, gridSize - 4);

        // Fine woodgrain lines
        ctx.strokeStyle = 'rgba(120, 53, 15, 0.3)';
        ctx.lineWidth = 1;
        for (let i = 8; i < gridSize - 8; i += 12) {
          ctx.beginPath();
          ctx.moveTo(x + 2, y + i);
          ctx.lineTo(x + gridSize - 2, y + i + (Math.random() * 4 - 2));
          ctx.stroke();
        }
      }
    }

    // Grout lines
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 3;
    for (let i = 0; i <= 512; i += gridSize) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Generates clean subway tile backsplash texture */
function createBacksplashTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#f8fafc'; // glossy off-white tile
    ctx.fillRect(0, 0, 256, 256);

    const tileSize = 32;
    ctx.strokeStyle = '#cbd5e1'; // subtle grout lines
    ctx.lineWidth = 2;

    for (let i = 0; i <= 256; i += tileSize) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 256);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(256, i);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 3);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Generates scenic outdoor window backdrop texture matching the screenshot */
function createWindowBackdropTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // 1. Summer Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 360);
    skyGrad.addColorStop(0, '#38bdf8');
    skyGrad.addColorStop(0.6, '#93c5fd');
    skyGrad.addColorStop(1, '#e0f2fe');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 1024, 512);

    // 2. Fluffy Cumulus Clouds
    ctx.fillStyle = '#ffffff';
    const drawCloud = (cx: number, cy: number, r: number) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.7, cy - r * 0.2, r * 0.8, 0, Math.PI * 2);
      ctx.arc(cx + r * 1.4, cy, r * 0.7, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.7, cy + r * 0.2, r * 0.6, 0, Math.PI * 2);
      ctx.fill();
    };

    drawCloud(180, 140, 55);
    drawCloud(460, 120, 65);
    drawCloud(780, 150, 60);
    drawCloud(920, 170, 45);

    // 3. Distant Mountain Silhouette
    ctx.fillStyle = '#60a5fa';
    ctx.beginPath();
    ctx.moveTo(0, 320);
    ctx.lineTo(150, 240);
    ctx.lineTo(320, 290);
    ctx.lineTo(500, 220);
    ctx.lineTo(720, 280);
    ctx.lineTo(890, 230);
    ctx.lineTo(1024, 290);
    ctx.lineTo(1024, 512);
    ctx.lineTo(0, 512);
    ctx.closePath();
    ctx.fill();

    // 4. Distant City Skyline & River Bridge
    ctx.fillStyle = '#3b82f6';
    // City towers
    const towers = [
      { x: 440, w: 22, h: 70 },
      { x: 470, w: 18, h: 95 },
      { x: 495, w: 26, h: 110 },
      { x: 530, w: 20, h: 80 },
      { x: 740, w: 24, h: 90 },
      { x: 770, w: 30, h: 120 },
    ];
    towers.forEach((t) => {
      ctx.fillRect(t.x, 330 - t.h, t.w, t.h);
    });

    // River water
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(0, 330, 1024, 50);

    // 5. Lush Foreground Tree Canopy
    ctx.fillStyle = '#15803d';
    for (let x = 0; x <= 1040; x += 65) {
      ctx.beginPath();
      ctx.arc(x, 420, 80, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#22c55e';
    for (let x = 20; x <= 1040; x += 65) {
      ctx.beginPath();
      ctx.arc(x, 410, 65, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Generates icons for the 4 recycling bins */
function createBinIconTexture(binType: BinType): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext ? canvas.getContext('2d') : null;
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const bgColors: Record<BinType, string> = {
    wet: '#16a34a', // green
    dry: '#2563eb', // blue
    ewaste: '#eab308', // yellow
    hazardous: '#dc2626', // red
    paper: '#3b82f6',
    plastic: '#0284c7',
    reuse: '#14b8a6',
  };

  ctx.fillStyle = bgColors[binType] || '#16a34a';
  ctx.fillRect(0, 0, 256, 256);

  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (binType === 'wet') {
    // Leaf Icon
    ctx.beginPath();
    ctx.moveTo(128, 48);
    ctx.bezierCurveTo(70, 70, 60, 160, 128, 208);
    ctx.bezierCurveTo(196, 160, 186, 70, 128, 48);
    ctx.fill();
    // Leaf central vein
    ctx.strokeStyle = bgColors[binType];
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(128, 65);
    ctx.lineTo(128, 195);
    ctx.stroke();
  } else if (binType === 'dry' || binType === 'plastic' || binType === 'paper') {
    // 3 Chasing Arrows (Recycle loop)
    ctx.save();
    ctx.translate(128, 128);
    for (let i = 0; i < 3; i++) {
      ctx.rotate((Math.PI * 2) / 3);
      ctx.beginPath();
      ctx.arc(0, -60, 36, -Math.PI * 0.4, Math.PI * 0.2);
      ctx.stroke();

      // Arrow head
      ctx.beginPath();
      ctx.moveTo(35, -72);
      ctx.lineTo(46, -42);
      ctx.lineTo(20, -50);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  } else if (binType === 'ewaste') {
    // Computer Monitor Icon
    ctx.lineWidth = 12;
    ctx.strokeRect(58, 68, 140, 96);
    // Stand
    ctx.beginPath();
    ctx.moveTo(128, 166);
    ctx.lineTo(128, 196);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(96, 196);
    ctx.lineTo(160, 196);
    ctx.stroke();
  } else if (binType === 'hazardous') {
    // Caution Triangle with Exclamation Point
    ctx.beginPath();
    ctx.moveTo(128, 52);
    ctx.lineTo(214, 196);
    ctx.lineTo(42, 196);
    ctx.closePath();
    ctx.stroke();

    // Exclamation point
    ctx.beginPath();
    ctx.moveTo(128, 95);
    ctx.lineTo(128, 148);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(128, 172, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Generates cute magnets and checklist texture for the refrigerator */
function createFridgeDoorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext ? canvas.getContext('2d') : null;
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Clean enamel off-white base
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(0, 0, 512, 512);

  // 1. Cute Bunny Magnet (Matches reference image)
  ctx.save();
  ctx.translate(340, 130);
  // White face
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, 0, 42, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Ears
  ctx.fillStyle = '#fed7aa';
  ctx.beginPath();
  ctx.ellipse(-20, -48, 12, 26, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(20, -48, 12, 26, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Brown spots on ears
  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.arc(22, -60, 8, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(-14, -4, 4, 0, Math.PI * 2);
  ctx.arc(14, -4, 4, 0, Math.PI * 2);
  ctx.fill();

  // Pink cheeks
  ctx.fillStyle = '#f472b6';
  ctx.beginPath();
  ctx.arc(-24, 10, 7, 0, Math.PI * 2);
  ctx.arc(24, 10, 7, 0, Math.PI * 2);
  ctx.fill();

  // Mouth
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 10, 6, 0, Math.PI);
  ctx.stroke();
  ctx.restore();

  // 2. Green Leaf Badge Magnet
  ctx.save();
  ctx.translate(220, 80);
  ctx.fillStyle = '#fef08a'; // yellow sticky square
  ctx.fillRect(-35, -45, 70, 90);
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 2;
  ctx.strokeRect(-35, -45, 70, 90);

  ctx.fillStyle = '#16a34a'; // green leaf in center
  ctx.beginPath();
  ctx.moveTo(0, -25);
  ctx.bezierCurveTo(-22, -15, -18, 20, 0, 32);
  ctx.bezierCurveTo(18, 20, 22, -15, 0, -25);
  ctx.fill();
  ctx.restore();

  // 3. Pinned Paper Memo Checklist
  ctx.save();
  ctx.translate(180, 280);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-60, -90, 120, 180);
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-60, -90, 120, 180);

  // Magnet pin on top
  ctx.fillStyle = '#16a34a';
  ctx.beginPath();
  ctx.arc(0, -82, 7, 0, Math.PI * 2);
  ctx.fill();

  // Handwritten list lines
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2.5;
  for (let y = -55; y <= 65; y += 24) {
    // Checkbox
    ctx.strokeRect(-48, y - 6, 12, 12);
    // Line text
    ctx.beginPath();
    ctx.moveTo(-28, y);
    ctx.lineTo(44, y);
    ctx.stroke();
  }
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// ============================================================================
// HOME KITCHEN 3D SCENE BUILDER
// ============================================================================

export function createHomeKitchenScene(): HomeKitchenSceneResult {
  const kitchenGroup = new THREE.Group();
  kitchenGroup.name = 'HomeKitchenScene';

  const obstacles: WorldObstacle[] = [];
  const binPositions = new Map<BinType, THREE.Vector3>();
  const binMeshes = new Map<BinType, THREE.Group>();
  const binLidPivots = new Map<BinType, THREE.Group>();
  const binAnimTimers = new Map<BinType, number>();

  const addObstacle = (id: string, minX: number, maxX: number, minZ: number, maxZ: number, type: WorldObstacle['type'] = 'building') => {
    obstacles.push({ id, minX, maxX, minZ, maxZ, type });
  };

  // Outer Room Boundaries (Walls)
  addObstacle('wall_north', -5.0, 5.0, -4.6, -4.2);
  addObstacle('wall_south', -5.0, 5.0, 4.2, 4.6);
  addObstacle('wall_west', -5.2, -4.8, -4.6, 4.6);
  addObstacle('wall_east', 4.8, 5.2, -4.6, 4.6);

  // -------------------------------------------------------------------------
  // 1. FLOOR & WALL ARCHITECTURE
  // -------------------------------------------------------------------------
  // Floor: Terracotta/Parquet Wood Tiles
  const floorGeo = new THREE.PlaneGeometry(10.0, 9.0);
  const floorMat = new THREE.MeshStandardMaterial({
    map: createParquetFloorTexture(),
    roughness: 0.45,
    metalness: 0.1,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  kitchenGroup.add(floor);

  // Walls Material: Warm Soft Butter Cream
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0xfef9ee,
    roughness: 0.85,
  });

  // North (Back) Wall
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(10.0, 4.8, 0.2), wallMat);
  backWall.position.set(0, 2.4, -4.4);
  backWall.receiveShadow = true;
  kitchenGroup.add(backWall);

  // Backsplash: White Subway Tile (lower half of back wall and right wall)
  const backsplashMat = new THREE.MeshStandardMaterial({
    map: createBacksplashTexture(),
    roughness: 0.3,
  });
  const backsplashMesh = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 1.8), backsplashMat);
  backsplashMesh.position.set(2.0, 1.7, -4.28);
  kitchenGroup.add(backsplashMesh);

  // West (Left) Wall
  const westWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 4.8, 9.0), wallMat);
  westWall.position.set(-4.9, 2.4, 0);
  kitchenGroup.add(westWall);

  // East (Right) Wall
  const eastWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 4.8, 9.0), wallMat);
  eastWall.position.set(4.9, 2.4, 0);
  kitchenGroup.add(eastWall);

  // Ceiling
  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(10.0, 9.0),
    new THREE.MeshStandardMaterial({ color: 0xfffbeb, roughness: 0.9 })
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 4.8;
  kitchenGroup.add(ceiling);

  // Wooden Crown Molding and Baseboards
  const woodTrimMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 });
  const baseboardBack = new THREE.Mesh(new THREE.BoxGeometry(10.0, 0.2, 0.08), woodTrimMat);
  baseboardBack.position.set(0, 0.1, -4.28);
  kitchenGroup.add(baseboardBack);

  // -------------------------------------------------------------------------
  // 2. THE BIG SCENIC WINDOW & OUTSIDE VIEW (Center-Left of Back Wall)
  // -------------------------------------------------------------------------
  const windowGroup = new THREE.Group();
  windowGroup.position.set(-1.2, 2.7, -4.3);

  // Outdoor Backdrop Plane (Visible through window glass)
  const backdropGeo = new THREE.PlaneGeometry(4.8, 2.8);
  const backdropMat = new THREE.MeshBasicMaterial({
    map: createWindowBackdropTexture(),
  });
  const backdrop = new THREE.Mesh(backdropGeo, backdropMat);
  backdrop.position.set(0, 0, -0.2);
  windowGroup.add(backdrop);

  // Wooden Window Frame
  const frameMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.6 });
  const frameOuter = new THREE.Mesh(new THREE.BoxGeometry(4.4, 2.6, 0.15), frameMat);
  windowGroup.add(frameOuter);

  // Clear Glass Pane
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x93c5fd,
    transparent: true,
    opacity: 0.2,
    roughness: 0.1,
    metalness: 0.8,
  });
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(4.1, 2.3), glassMat);
  glass.position.z = 0.02;
  windowGroup.add(glass);

  // Horizontal & Vertical Wooden Window Mullions
  const horizBar = new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.08, 0.08), frameMat);
  horizBar.position.z = 0.04;
  windowGroup.add(horizBar);

  const vertBar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.3, 0.08), frameMat);
  vertBar.position.z = 0.04;
  windowGroup.add(vertBar);

  // Window Sill Shelf
  const sill = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.14, 0.35), frameMat);
  sill.position.set(0, -1.35, 0.12);
  sill.castShadow = true;
  windowGroup.add(sill);

  // Plants & Daisy Pots on Windowsill
  const terraMat = new THREE.MeshStandardMaterial({ color: 0xc2410c, roughness: 0.7 });
  const plantLeafMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.6 });
  const daisyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
  const daisyCenterMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 });

  [-1.4, -0.6, 0.7, 1.5].forEach((xPos, idx) => {
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.09, 0.2, 12), terraMat);
    pot.position.set(xPos, -1.2, 0.12);
    windowGroup.add(pot);

    const bush = new THREE.Mesh(new THREE.DodecahedronGeometry(0.14), plantLeafMat);
    bush.position.set(xPos, -1.02, 0.12);
    windowGroup.add(bush);

    if (idx % 2 === 0) {
      // Little daisy flowers
      for (let f = 0; f < 3; f++) {
        const daisy = new THREE.Mesh(new THREE.CircleGeometry(0.035, 8), daisyMat);
        daisy.position.set(xPos + (f - 1) * 0.06, -0.92, 0.14);
        windowGroup.add(daisy);

        const center = new THREE.Mesh(new THREE.CircleGeometry(0.015, 8), daisyCenterMat);
        center.position.set(xPos + (f - 1) * 0.06, -0.92, 0.145);
        windowGroup.add(center);
      }
    }
  });

  // Green Gingham Curtains (Checkered fabric draped on sides)
  const curtainMat = new THREE.MeshStandardMaterial({
    map: createCheckeredTexture('#16a34a', '#ffffff', 32, 8),
    roughness: 0.7,
  });

  // Curtain Rod
  const curtainRod = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 4.8), woodTrimMat);
  curtainRod.rotation.z = Math.PI / 2;
  curtainRod.position.set(0, 1.45, 0.15);
  windowGroup.add(curtainRod);

  // Left & Right Draped Curtains
  [-1.9, 1.9].forEach((xPos) => {
    const curtain = new THREE.Mesh(new THREE.BoxGeometry(0.7, 2.7, 0.08), curtainMat);
    curtain.position.set(xPos, 0.05, 0.12);
    curtain.castShadow = true;
    windowGroup.add(curtain);

    // Tie-back sash
    const tie = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.1, 0.12), woodTrimMat);
    tie.position.set(xPos, -0.3, 0.14);
    windowGroup.add(tie);
  });

  kitchenGroup.add(windowGroup);

  // -------------------------------------------------------------------------
  // 3. REFRIGERATOR & PANTRY CUPBOARD (Left Wall)
  // -------------------------------------------------------------------------
  const fridgeGroup = new THREE.Group();
  fridgeGroup.position.set(-4.1, 0, -3.2);

  // Refrigerator Body (Cream/Off-White Enamel)
  const fridgeMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.35,
    metalness: 0.15,
  });
  const fridgeBody = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.6, 1.1), fridgeMat);
  fridgeBody.position.y = 1.3;
  fridgeBody.castShadow = true;
  fridgeBody.receiveShadow = true;
  fridgeGroup.add(fridgeBody);

  // Fridge Door Texture (Bunny magnet, Leaf sticky note, Memo checklist)
  const fridgeDoorMat = new THREE.MeshStandardMaterial({
    map: createFridgeDoorTexture(),
    roughness: 0.35,
  });
  const fridgeFront = new THREE.Mesh(new THREE.PlaneGeometry(1.18, 2.56), fridgeDoorMat);
  fridgeFront.position.set(0, 1.3, 0.56);
  fridgeGroup.add(fridgeFront);

  // Chrome Vertical Handles
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.2 });
  [1.0, 2.0].forEach((yPos) => {
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.45), chromeMat);
    handle.position.set(0.48, yPos, 0.62);
    fridgeGroup.add(handle);
  });

  // Hanging Ivy Plant on Top of Fridge
  const ivyPot = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.35, 12), terraMat);
  ivyPot.position.set(-0.2, 2.8, 0);
  fridgeGroup.add(ivyPot);

  const ivyCluster = new THREE.Mesh(new THREE.DodecahedronGeometry(0.32), plantLeafMat);
  ivyCluster.position.set(-0.2, 3.05, 0);
  fridgeGroup.add(ivyCluster);

  // Cascading Vines draped down the side of the fridge
  for (let v = 0; v < 4; v++) {
    const vine = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.7 + v * 0.2, 5), plantLeafMat);
    vine.position.set(0.35 - v * 0.15, 2.5 - v * 0.15, 0.56);
    vine.rotation.z = Math.PI - 0.2;
    fridgeGroup.add(vine);
  }

  kitchenGroup.add(fridgeGroup);
  addObstacle('refrigerator', -4.8, -3.4, -3.9, -2.5);

  // -------------------------------------------------------------------------
  // 4. THE 4 WASTE SORTING BINS (Lined up neatly beside fridge under window)
  // -------------------------------------------------------------------------
  // Green (Wet/Compost), Blue (Dry/Recycle), Yellow (E-Waste), Red (Hazardous)
  const binTypes: BinType[] = ['wet', 'dry', 'ewaste', 'hazardous'];
  const binSpacing = 0.68;
  const startBinX = -3.1;
  const binZ = -3.8;

  binTypes.forEach((type, idx) => {
    const binGroup = new THREE.Group();
    const xPos = startBinX + idx * binSpacing;
    binGroup.position.set(xPos, 0, binZ);
    binGroup.name = `Bin_${type}`;

    const iconTex = createBinIconTexture(type);
    const binColor =
      type === 'wet'
        ? 0x16a34a
        : type === 'dry'
        ? 0x2563eb
        : type === 'ewaste'
        ? 0xeab308
        : 0xdc2626;

    const binBodyMat = new THREE.MeshStandardMaterial({
      color: binColor,
      roughness: 0.35,
      metalness: 0.1,
    });

    // Bin Body (Tapered rectangular bin)
    const bodyGeo = new THREE.BoxGeometry(0.52, 0.88, 0.52);
    const body = new THREE.Mesh(bodyGeo, binBodyMat);
    body.position.y = 0.44;
    body.castShadow = true;
    body.receiveShadow = true;
    binGroup.add(body);

    // Front Face Icon Decal
    const iconMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.36, 0.36),
      new THREE.MeshStandardMaterial({ map: iconTex, roughness: 0.3 })
    );
    iconMesh.position.set(0, 0.52, 0.265);
    binGroup.add(iconMesh);

    // Hinged Lid Pivot
    const lidPivot = new THREE.Group();
    lidPivot.position.set(0, 0.88, -0.26); // hinge at back edge

    const lidMat = new THREE.MeshStandardMaterial({ color: binColor, roughness: 0.3 });
    const lidGeo = new THREE.BoxGeometry(0.56, 0.08, 0.56);
    lidGeo.translate(0, 0.04, 0.28); // center relative to hinge
    const lid = new THREE.Mesh(lidGeo, lidMat);
    lid.castShadow = true;
    lidPivot.add(lid);

    // Lid Handle
    const lidHandle = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.06), woodTrimMat);
    lidHandle.position.set(0, 0.1, 0.48);
    lidPivot.add(lidHandle);

    binGroup.add(lidPivot);
    binLidPivots.set(type, lidPivot);
    binAnimTimers.set(type, 0);

    kitchenGroup.add(binGroup);
    binMeshes.set(type, binGroup);
    binPositions.set(type, new THREE.Vector3(xPos, 0, binZ));
  });

  addObstacle('sorting_bins', -3.4, -0.8, -4.1, -3.5);

  // -------------------------------------------------------------------------
  // 5. DINING TABLE & CHAIRS (Center Foreground)
  // -------------------------------------------------------------------------
  const tableGroup = new THREE.Group();
  const tableCenter = new THREE.Vector3(0.5, 0, 0.5);
  tableGroup.position.copy(tableCenter);

  // Green Checkered Woven Rug Under Table
  const rugMat = new THREE.MeshStandardMaterial({
    map: createCheckeredTexture('#15803d', '#ffffff', 48, 8),
    roughness: 0.9,
  });
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.8), rugMat);
  rug.rotation.x = -Math.PI / 2;
  rug.position.y = 0.02;
  rug.receiveShadow = true;
  tableGroup.add(rug);

  // Honey-Oak Dining Tabletop
  const tableMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.55 });
  const tabletop = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.14, 1.4), tableMat);
  tabletop.position.y = 0.92;
  tabletop.castShadow = true;
  tabletop.receiveShadow = true;
  tableGroup.add(tabletop);

  // 4 Table Legs
  const legGeo = new THREE.BoxGeometry(0.12, 0.92, 0.12);
  [
    [-1.05, -0.55],
    [1.05, -0.55],
    [-1.05, 0.55],
    [1.05, 0.55],
  ].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(legGeo, tableMat);
    leg.position.set(lx, 0.46, lz);
    leg.castShadow = true;
    tableGroup.add(leg);
  });

  // Blue & White Checkered Table Runner
  const runnerMat = new THREE.MeshStandardMaterial({
    map: createCheckeredTexture('#2563eb', '#ffffff', 32, 6),
    roughness: 0.6,
  });
  const runner = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.6), runnerMat);
  runner.rotation.x = -Math.PI / 2;
  runner.position.set(0, 1.0, 0);
  tableGroup.add(runner);

  // Potted White Daisies on Table
  const potTable = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.28, 16), daisyMat);
  potTable.position.set(-0.35, 1.14, 0);
  potTable.castShadow = true;
  tableGroup.add(potTable);

  const daisyCluster = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22), plantLeafMat);
  daisyCluster.position.set(-0.35, 1.34, 0);
  tableGroup.add(daisyCluster);

  // Fresh Fruit Bowl (Bananas & Red Apples)
  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.16, 0.16, 16), woodTrimMat);
  bowl.position.set(0.35, 1.08, 0);
  bowl.castShadow = true;
  tableGroup.add(bowl);

  // Red Apples
  const appleMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });
  [-0.08, 0.08].forEach((ax) => {
    const apple = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), appleMat);
    apple.position.set(0.35 + ax, 1.2, 0.04);
    tableGroup.add(apple);
  });

  // Bananas
  const bananaMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.5 });
  const banana = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.24, 8), bananaMat);
  banana.rotation.z = Math.PI / 3;
  banana.position.set(0.35, 1.22, -0.06);
  tableGroup.add(banana);

  // 4 Dining Chairs with Green Cushions
  const chairMat = tableMat;
  const cushionMat = new THREE.MeshStandardMaterial({ color: 0x4d7c0f, roughness: 0.7 });

  const createChair = (cx: number, cz: number, rotY: number) => {
    const chair = new THREE.Group();
    chair.position.set(cx, 0, cz);
    chair.rotation.y = rotY;

    // Seat Cushion
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.08, 0.52), cushionMat);
    seat.position.y = 0.54;
    seat.castShadow = true;
    chair.add(seat);

    // 4 Chair Legs
    const cLegGeo = new THREE.BoxGeometry(0.06, 0.54, 0.06);
    [
      [-0.22, -0.21],
      [0.22, -0.21],
      [-0.22, 0.21],
      [0.22, 0.21],
    ].forEach(([lx, lz]) => {
      const cLeg = new THREE.Mesh(cLegGeo, chairMat);
      cLeg.position.set(lx, 0.27, lz);
      cLeg.castShadow = true;
      chair.add(cLeg);
    });

    // Backrest
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.65, 0.06), chairMat);
    back.position.set(0, 0.9, -0.23);
    back.castShadow = true;
    chair.add(back);

    tableGroup.add(chair);
  };

  createChair(-0.6, 1.1, 0); // Front Left chair
  createChair(0.6, 1.1, 0); // Front Right chair
  createChair(-0.6, -1.1, Math.PI); // Back Left chair
  createChair(0.6, -1.1, Math.PI); // Back Right chair

  kitchenGroup.add(tableGroup);
  addObstacle('dining_table', -0.8, 1.8, -0.6, 1.6);

  // -------------------------------------------------------------------------
  // 6. KITCHEN COUNTERS, SINK, STOVE & RANGE HOOD (Right Wall & Corner)
  // -------------------------------------------------------------------------
  const counterGroup = new THREE.Group();
  counterGroup.position.set(2.4, 0, -3.6);

  const cabinetMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.6 });
  const counterTopMat = new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.45 });

  // Main Counter Base Cabinets along Back Wall
  const backCounterBase = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.9, 0.9), cabinetMat);
  backCounterBase.position.set(0, 0.45, 0);
  backCounterBase.castShadow = true;
  backCounterBase.receiveShadow = true;
  counterGroup.add(backCounterBase);

  // Polished Wooden Countertop
  const backCounterTop = new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.08, 0.95), counterTopMat);
  backCounterTop.position.set(0, 0.94, 0);
  backCounterTop.castShadow = true;
  backCounterTop.receiveShadow = true;
  counterGroup.add(backCounterTop);

  // Stainless Steel Double Sink & Gooseneck Faucet
  const sinkMat = chromeMat;
  const sinkBasin = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.02, 0.5), sinkMat);
  sinkBasin.position.set(-0.8, 0.98, 0);
  counterGroup.add(sinkBasin);

  const faucetPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.35), chromeMat);
  faucetPipe.position.set(-0.8, 1.16, -0.22);
  counterGroup.add(faucetPipe);

  // Dish Drying Rack with White Plates
  const dishRack = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.35), chromeMat);
  dishRack.position.set(-1.4, 1.05, 0);
  counterGroup.add(dishRack);

  for (let p = 0; p < 4; p++) {
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.02, 16), daisyMat);
    plate.rotation.z = Math.PI / 2;
    plate.position.set(-1.5 + p * 0.08, 1.16, 0);
    counterGroup.add(plate);
  }

  // Cooking Stove with 4 Burners
  const stoveMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.7 });
  const stoveBase = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.92, 0.92), stoveMat);
  stoveBase.position.set(0.9, 0.46, 0.01);
  stoveBase.castShadow = true;
  counterGroup.add(stoveBase);

  // Soup Pot on Stove
  const potMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 });
  const potMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.22, 16), potMat);
  potMesh.position.set(0.8, 1.08, 0.12);
  counterGroup.add(potMesh);

  // Frying Pan
  const panMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
  const pan = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 0.06, 16), panMat);
  pan.position.set(1.05, 1.0, -0.12);
  counterGroup.add(pan);

  // Green Checkered Oven Towel hanging on stove handle
  const towelMat = new THREE.MeshStandardMaterial({
    map: createCheckeredTexture('#16a34a', '#ffffff', 32, 4),
    roughness: 0.8,
  });
  const towel = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.42, 0.04), towelMat);
  towel.position.set(0.9, 0.55, 0.48);
  counterGroup.add(towel);

  // Stainless Steel Range Hood Overhead
  const hoodMat = chromeMat;
  const hood = new THREE.Mesh(new THREE.ConeGeometry(0.65, 0.7, 4), hoodMat);
  hood.rotation.y = Math.PI / 4;
  hood.position.set(0.9, 2.7, 0);
  hood.castShadow = true;
  counterGroup.add(hood);

  const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.4), hoodMat);
  chimney.position.set(0.9, 3.6, 0);
  counterGroup.add(chimney);

  // Side Counter Along East (Right) Wall with Microwave
  const rightCounterBase = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 2.4), cabinetMat);
  rightCounterBase.position.set(1.8, 0.45, 1.2);
  rightCounterBase.castShadow = true;
  counterGroup.add(rightCounterBase);

  const rightCounterTop = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.08, 2.45), counterTopMat);
  rightCounterTop.position.set(1.8, 0.94, 1.2);
  counterGroup.add(rightCounterTop);

  // Microwave Oven
  const microMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
  const microwave = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.38, 0.45), microMat);
  microwave.position.set(1.8, 1.18, 0.6);
  microwave.castShadow = true;
  counterGroup.add(microwave);

  kitchenGroup.add(counterGroup);
  addObstacle('counter_back', 0.4, 4.6, -4.2, -3.0);
  addObstacle('counter_side', 3.6, 4.6, -3.0, 0.5);

  // -------------------------------------------------------------------------
  // 7. WALL SHELVES & HANGING GREEN PENDANT LAMP
  // -------------------------------------------------------------------------
  // Floating Wall Shelves above counter
  const shelfMat = woodTrimMat;
  [2.4, 3.2].forEach((yPos) => {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 0.32), shelfMat);
    shelf.position.set(2.4, yPos, -4.15);
    shelf.castShadow = true;
    kitchenGroup.add(shelf);

    // Spice & Glass Jars on Shelves
    for (let j = 0; j < 5; j++) {
      const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.16, 12), daisyMat);
      jar.position.set(1.6 + j * 0.38, yPos + 0.12, -4.15);
      kitchenGroup.add(jar);
    }
  });

  // Hanging Green Enamel Pendant Lamp
  const lampGroup = new THREE.Group();
  lampGroup.position.set(0.6, 4.8, -1.2);

  // Cord / Brass Rod
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.6), woodTrimMat);
  cord.position.y = -0.8;
  lampGroup.add(cord);

  // Forest Green Enamel Dome Shade
  const shadeMat = new THREE.MeshStandardMaterial({
    color: 0x15803d, // dark green enamel
    roughness: 0.25,
    metalness: 0.2,
  });
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.32, 24, 1, true), shadeMat);
  shade.position.y = -1.6;
  shade.castShadow = true;
  lampGroup.add(shade);

  // Glowing Bulb
  const bulbMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xfef08a,
    emissiveIntensity: 0.9,
    roughness: 0.1,
  });
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), bulbMat);
  bulb.position.y = -1.65;
  lampGroup.add(bulb);

  // Cozy Point Light from the lamp
  const pendantLight = new THREE.PointLight(0xfef08a, 1.2, 8);
  pendantLight.position.set(0.6, 3.0, -1.2);
  pendantLight.castShadow = true;
  pendantLight.shadow.bias = -0.002;
  kitchenGroup.add(lampGroup);
  kitchenGroup.add(pendantLight);

  // -------------------------------------------------------------------------
  // 8. WARM SUNLIGHT STREAMING THROUGH THE WINDOW
  // -------------------------------------------------------------------------
  // Directional sun beam matching the lighting angle of the screenshot
  const sunLight = new THREE.DirectionalLight(0xfffaed, 1.8);
  sunLight.position.set(-6, 8, -8);
  sunLight.target.position.set(0.5, 0.8, 0.5);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 25;
  sunLight.shadow.camera.left = -6;
  sunLight.shadow.camera.right = 6;
  sunLight.shadow.camera.top = 6;
  sunLight.shadow.camera.bottom = -6;
  sunLight.shadow.bias = -0.001;
  kitchenGroup.add(sunLight);
  kitchenGroup.add(sunLight.target);

  // Soft Ambient Fill Light
  const ambientLight = new THREE.AmbientLight(0xfffaed, 0.7);
  kitchenGroup.add(ambientLight);

  // -------------------------------------------------------------------------
  // 9. ANIMATION & INTERACTION DISPATCHERS
  // -------------------------------------------------------------------------
  const triggerBinAnimation = (binType: BinType) => {
    binAnimTimers.set(binType, 0.6); // 0.6 second bounce & lid open
  };

  const animate = (_time: number, delta: number) => {
    // Animate Bin Lids opening / closing on throw
    binLidPivots.forEach((pivot, type) => {
      const timer = binAnimTimers.get(type) || 0;
      if (timer > 0) {
        binAnimTimers.set(type, Math.max(0, timer - delta));
        const progress = 1 - timer / 0.6;
        const openAngle = Math.sin(progress * Math.PI) * 0.9;
        pivot.rotation.x = -openAngle;
      } else {
        pivot.rotation.x = THREE.MathUtils.lerp(pivot.rotation.x, 0, 0.2);
      }
    });
  };

  // -------------------------------------------------------------------------
  // 10. CAMERA PRESETS
  // -------------------------------------------------------------------------
  // Reference Camera: Recreates the exact screenshot perspective!
  const referenceCameraPosition = new THREE.Vector3(0.5, 2.7, 4.4);
  const referenceCameraLookAt = new THREE.Vector3(0.0, 1.4, -1.2);

  // Sort Camera: Zoomed in for rapid tabletop & bin sorting
  const sortCameraPosition = new THREE.Vector3(-1.2, 2.8, -1.2);
  const sortCameraLookAt = new THREE.Vector3(-1.8, 0.8, -3.8);

  return {
    kitchenGroup,
    obstacles,
    binPositions,
    binMeshes,
    tableCenter,
    referenceCameraPosition,
    referenceCameraLookAt,
    sortCameraPosition,
    sortCameraLookAt,
    pendantLight,
    sunLight,
    triggerBinAnimation,
    animate,
  };
}
