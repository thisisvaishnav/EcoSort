import * as THREE from 'three';
import { SOCIETY_MANIFEST } from '../manifest';
import { CollisionShape } from '../../types';

export interface SocietyMapResult {
  group: THREE.Group;
  obstacles: CollisionShape[];
  groundMesh: THREE.Mesh;
  plantMeshes: THREE.Mesh[];
  pestParticles: THREE.Points;
  butterflyParticles: THREE.Points;
  setVisualState: (state: 0 | 1 | 2) => void;
  animate: (elapsed: number, delta: number) => void;
}

/**
 * Creates the complete procedural 3D map for Society World.
 */
export function createSocietyMap(): SocietyMapResult {
  const group = new THREE.Group();
  group.name = 'society_map_root';

  const obstacles: CollisionShape[] = [...SOCIETY_MANIFEST.collision];

  // ── Ground Plane ─────────────────────────────────────────────────────────────
  const groundGeo = new THREE.PlaneGeometry(36, 36, 16, 16);
  groundGeo.rotateX(-Math.PI / 2);
  const groundMat = new THREE.MeshStandardMaterial({
    color: SOCIETY_MANIFEST.visualStates.state0Dirty.groundColor,
    roughness: 0.9,
    metalness: 0.1,
  });
  const groundMesh = new THREE.Mesh(groundGeo, groundMat);
  groundMesh.name = 'society_ground';
  groundMesh.receiveShadow = true;
  group.add(groundMesh);

  // ── Roads & Driveways (East internal driveway, X = 14) ────────────────────────
  const drivewayGeo = new THREE.PlaneGeometry(5, 36);
  drivewayGeo.rotateX(-Math.PI / 2);
  const drivewayMat = new THREE.MeshStandardMaterial({
    color: 0x334155, // dark slate asphalt
    roughness: 0.8,
  });
  const drivewayMesh = new THREE.Mesh(drivewayGeo, drivewayMat);
  drivewayMesh.position.set(14, 0.01, 0);
  drivewayMesh.receiveShadow = true;
  group.add(drivewayMesh);

  // Road markings
  for (let z = -15; z <= 15; z += 5) {
    const dashGeo = new THREE.PlaneGeometry(0.3, 2.5);
    dashGeo.rotateX(-Math.PI / 2);
    const dashMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const dash = new THREE.Mesh(dashGeo, dashMat);
    dash.position.set(14, 0.02, z);
    group.add(dash);
  }

  // ── Central Park Paver Walkway (Z = 0 to 12) ──────────────────────────────────
  const pathGeo = new THREE.PlaneGeometry(3, 16);
  pathGeo.rotateX(-Math.PI / 2);
  const pathMat = new THREE.MeshStandardMaterial({
    color: 0xd6d3d1, // stone paver grey
    roughness: 0.7,
  });
  const pathMesh = new THREE.Mesh(pathGeo, pathMat);
  pathMesh.position.set(0, 0.01, 6);
  pathMesh.receiveShadow = true;
  group.add(pathMesh);

  // ── Buildings ────────────────────────────────────────────────────────────────

  // Helper to create building block
  function createBuilding(
    name: string,
    x: number,
    z: number,
    width: number,
    height: number,
    depth: number,
    color: number,
    windowColor = 0x93c5fd
  ): THREE.Group {
    const bGroup = new THREE.Group();
    bGroup.name = name;

    // Main body
    const bodyGeo = new THREE.BoxGeometry(width, height, depth);
    const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.set(0, height / 2, 0);
    body.castShadow = true;
    body.receiveShadow = true;
    bGroup.add(body);

    // Flat roof ledge
    const roofGeo = new THREE.BoxGeometry(width + 0.4, 0.4, depth + 0.4);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(0, height + 0.2, 0);
    bGroup.add(roof);

    // Decorative window strips
    const floors = Math.floor(height / 2.5);
    const winGeo = new THREE.PlaneGeometry(width * 0.7, 0.8);
    const winMat = new THREE.MeshStandardMaterial({
      color: windowColor,
      roughness: 0.2,
      metalness: 0.6,
    });
    for (let f = 1; f <= floors; f++) {
      const winFront = new THREE.Mesh(winGeo, winMat);
      winFront.position.set(0, f * 2.5 - 0.4, depth / 2 + 0.02);
      bGroup.add(winFront);

      const winBack = new THREE.Mesh(winGeo, winMat);
      winBack.position.set(0, f * 2.5 - 0.4, -depth / 2 - 0.02);
      winBack.rotation.y = Math.PI;
      bGroup.add(winBack);
    }

    bGroup.position.set(x, 0, z);
    group.add(bGroup);
    return bGroup;
  }

  // Tower A (North-West residential block)
  createBuilding('society_tower_a', -7, -12, 10, 16, 8, 0xf1f5f9);

  // Tower B (North-East residential block)
  createBuilding('society_tower_b', 7, -13.5, 10, 14, 5, 0xe2e8f0);

  // Clubhouse (West community block)
  createBuilding('society_clubhouse', -12, 0, 8, 5, 8, 0xfef08a, 0x38bdf8);

  // Security Cabin (South-West near entrance)
  createBuilding('society_security_cabin', -2.5, 14.5, 3, 3, 3, 0xf8fafc);

  // Entrance Archway Gate (South, Z = 14)
  const gateGroup = new THREE.Group();
  gateGroup.name = 'society_main_gate';
  const pillarGeo = new THREE.BoxGeometry(0.8, 4.5, 0.8);
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
  const pLeft = new THREE.Mesh(pillarGeo, pillarMat);
  pLeft.position.set(-2, 2.25, 14);
  const pRight = new THREE.Mesh(pillarGeo, pillarMat);
  pRight.position.set(2, 2.25, 14);
  const archGeo = new THREE.BoxGeometry(4.8, 0.6, 0.8);
  const arch = new THREE.Mesh(archGeo, pillarMat);
  arch.position.set(0, 4.25, 14);
  gateGroup.add(pLeft, pRight, arch);
  group.add(gateGroup);

  // Perimeter boundary walls
  function createBoundaryWall(x: number, z: number, w: number, d: number) {
    const wallGeo = new THREE.BoxGeometry(w, 2.2, d);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(x, 1.1, z);
    wall.castShadow = true;
    group.add(wall);
  }
  createBoundaryWall(0, -18, 36, 0.6); // North wall
  createBoundaryWall(-18, 0, 0.6, 36); // West wall
  createBoundaryWall(18, 0, 0.6, 36);  // East wall
  createBoundaryWall(-10, 18, 16, 0.6); // South wall left
  createBoundaryWall(10, 18, 16, 0.6);  // South wall right

  // ── Flora & Plant Slots (Revival System) ──────────────────────────────────────
  const plantMeshes: THREE.Mesh[] = [];
  const wiltedPlantMat = new THREE.MeshStandardMaterial({ color: 0x785338, roughness: 0.9 });

  for (let i = 0; i < SOCIETY_MANIFEST.plantSlots.length; i++) {
    const slot = SOCIETY_MANIFEST.plantSlots[i];
    const stemGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.8, 6);
    const bushGeo = new THREE.DodecahedronGeometry(0.5);
    const bush = new THREE.Mesh(bushGeo, wiltedPlantMat.clone());
    bush.position.set(slot.x, 0.6, slot.z);
    bush.name = `plant_slot_${i}`;
    bush.castShadow = true;

    const stem = new THREE.Mesh(stemGeo, new THREE.MeshStandardMaterial({ color: 0x4a3728 }));
    stem.position.set(slot.x, 0.4, slot.z);

    group.add(stem, bush);
    plantMeshes.push(bush);
  }

  // ── Pest Particle Swarm (Hovering over waste pile) ───────────────────────────
  const pestCount = 60;
  const pestGeo = new THREE.BufferGeometry();
  const pestPositions = new Float32Array(pestCount * 3);
  for (let i = 0; i < pestCount; i++) {
    pestPositions[i * 3 + 0] = SOCIETY_MANIFEST.pile.center.x + (Math.random() - 0.5) * 4;
    pestPositions[i * 3 + 1] = 0.5 + Math.random() * 2;
    pestPositions[i * 3 + 2] = SOCIETY_MANIFEST.pile.center.z + (Math.random() - 0.5) * 4;
  }
  pestGeo.setAttribute('position', new THREE.BufferAttribute(pestPositions, 3));
  const pestMat = new THREE.PointsMaterial({
    color: 0x1f2937,
    size: 0.12,
    transparent: true,
    opacity: 0.8,
  });
  const pestParticles = new THREE.Points(pestGeo, pestMat);
  pestParticles.name = 'society_pest_particles';
  group.add(pestParticles);

  // ── Butterfly Particles (Revival state) ───────────────────────────────────────
  const butterflyCount = 30;
  const bfGeo = new THREE.BufferGeometry();
  const bfPositions = new Float32Array(butterflyCount * 3);
  for (let i = 0; i < butterflyCount; i++) {
    bfPositions[i * 3 + 0] = (Math.random() - 0.5) * 12;
    bfPositions[i * 3 + 1] = 1.0 + Math.random() * 2;
    bfPositions[i * 3 + 2] = (Math.random() - 0.5) * 12;
  }
  bfGeo.setAttribute('position', new THREE.BufferAttribute(bfPositions, 3));
  const bfMat = new THREE.PointsMaterial({
    color: 0xf59e0b, // glowing golden amber butterflies
    size: 0.25,
    transparent: true,
    opacity: 0.0, // hidden initially
  });
  const butterflyParticles = new THREE.Points(bfGeo, bfMat);
  butterflyParticles.name = 'society_butterfly_particles';
  group.add(butterflyParticles);

  // ── Lighting ─────────────────────────────────────────────────────────────────
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  const sunLight = new THREE.DirectionalLight(0xfffbeb, 1.2);
  sunLight.position.set(16, 25, 20);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 1024;
  sunLight.shadow.mapSize.height = 1024;
  group.add(ambientLight, sunLight);

  // ── Visual State Switcher ───────────────────────────────────────────────────
  function setVisualState(state: 0 | 1 | 2) {
    if (state === 0) {
      (groundMesh.material as THREE.MeshStandardMaterial).color.set(
        SOCIETY_MANIFEST.visualStates.state0Dirty.groundColor
      );
      pestParticles.visible = true;
      (pestParticles.material as THREE.PointsMaterial).opacity = 0.8;
      (butterflyParticles.material as THREE.PointsMaterial).opacity = 0.0;
      for (const plant of plantMeshes) {
        (plant.material as THREE.MeshStandardMaterial).color.set(0x785338);
      }
    } else if (state === 1) {
      (groundMesh.material as THREE.MeshStandardMaterial).color.set(
        SOCIETY_MANIFEST.visualStates.state1Clean.groundColor
      );
      pestParticles.visible = false;
      (pestParticles.material as THREE.PointsMaterial).opacity = 0.0;
      (butterflyParticles.material as THREE.PointsMaterial).opacity = 0.0;
      for (const plant of plantMeshes) {
        (plant.material as THREE.MeshStandardMaterial).color.set(0x4a7c59);
      }
    } else if (state === 2) {
      (groundMesh.material as THREE.MeshStandardMaterial).color.set(
        SOCIETY_MANIFEST.visualStates.state2Revived.groundColor
      );
      pestParticles.visible = false;
      (pestParticles.material as THREE.PointsMaterial).opacity = 0.0;
      (butterflyParticles.material as THREE.PointsMaterial).opacity = 0.9;
      for (const plant of plantMeshes) {
        (plant.material as THREE.MeshStandardMaterial).color.set(0x22c55e);
      }
    }
  }

  // ── Animation Loop Tick ──────────────────────────────────────────────────────
  function animate(elapsed: number, _delta: number) {
    // Pest particle jitter
    if (pestParticles.visible) {
      const pos = pestGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < pestCount; i++) {
        pos[i * 3 + 1] += Math.sin(elapsed * 4 + i) * 0.01;
        pos[i * 3 + 0] += Math.cos(elapsed * 3 + i) * 0.008;
      }
      pestGeo.attributes.position.needsUpdate = true;
    }

    // Butterfly fluttering
    if ((butterflyParticles.material as THREE.PointsMaterial).opacity > 0) {
      const pos = bfGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < butterflyCount; i++) {
        pos[i * 3 + 1] += Math.sin(elapsed * 2 + i) * 0.015;
        pos[i * 3 + 0] += Math.cos(elapsed * 1.5 + i) * 0.012;
      }
      bfGeo.attributes.position.needsUpdate = true;
    }
  }

  return {
    group,
    obstacles,
    groundMesh,
    plantMeshes,
    pestParticles,
    butterflyParticles,
    setVisualState,
    animate,
  };
}
