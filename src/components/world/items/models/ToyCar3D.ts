import * as THREE from 'three';
import { ItemMeshOptions } from '../types';

/**
 * Creates a detailed 3D model of a broken/weathered cartoon Toy Car.
 * Features a retro sky-blue rounded body, curved cabin with tinted windows,
 * yellow headlights, red front bumper, roof antenna with yellow ball,
 * 4 chunky yellow wheels with red hubcaps, and weathered rust/mud spots.
 */
export function createToyCar3D(options: ItemMeshOptions = {}): THREE.Group {
  const group = new THREE.Group();
  group.name = 'toy_car';

  const castShadow = options.castShadow ?? true;
  const receiveShadow = options.receiveShadow ?? true;

  // Materials
  const carBodyMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8, // Retro bright sky-blue car paint
    roughness: 0.45,
    metalness: 0.15,
  });

  const carDarkBlueMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.5,
  });

  const rustMat = new THREE.MeshStandardMaterial({
    color: 0xb45309, // Brown rust / mud weathering
    roughness: 0.85,
    metalness: 0.1,
  });

  const tintedGlassMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.15,
    metalness: 0.4,
  });

  const wheelTireMat = new THREE.MeshStandardMaterial({
    color: 0xeab308, // Chunky yellow toy wheels
    roughness: 0.4,
    metalness: 0.05,
  });

  const hubcapMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626, // Red center hubcap
    roughness: 0.3,
  });

  const bumperMat = new THREE.MeshStandardMaterial({
    color: 0xef4444, // Red bumper
    roughness: 0.4,
  });

  const headlightMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    emissive: 0xfef08a,
    emissiveIntensity: 0.5,
    roughness: 0.2,
  });

  // 1. Lower Body / Chassis (Elevated for wheels)
  const chassisGeo = new THREE.BoxGeometry(0.36, 0.14, 0.56);
  const chassis = new THREE.Mesh(chassisGeo, carBodyMat);
  chassis.position.y = 0.16;
  chassis.castShadow = castShadow;
  chassis.receiveShadow = receiveShadow;
  group.add(chassis);

  // Curved front hood nose
  const hoodNoseGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.14, 16, 1, false, 0, Math.PI);
  const hoodNose = new THREE.Mesh(hoodNoseGeo, carBodyMat);
  hoodNose.rotation.y = -Math.PI / 2;
  hoodNose.position.set(0, 0.16, 0.28);
  hoodNose.castShadow = castShadow;
  group.add(hoodNose);

  // 2. Cabin / Passenger Compartment
  const cabinGeo = new THREE.BoxGeometry(0.32, 0.18, 0.32);
  const cabin = new THREE.Mesh(cabinGeo, carDarkBlueMat);
  cabin.position.set(0, 0.29, -0.04);
  cabin.castShadow = castShadow;
  group.add(cabin);

  // Front Windshield (Tilted glass)
  const windshieldGeo = new THREE.PlaneGeometry(0.26, 0.14);
  const windshield = new THREE.Mesh(windshieldGeo, tintedGlassMat);
  windshield.position.set(0, 0.28, 0.125);
  windshield.rotation.x = -0.35;
  group.add(windshield);

  // Rear Window
  const rearWin = new THREE.Mesh(windshieldGeo, tintedGlassMat);
  rearWin.position.set(0, 0.28, -0.205);
  rearWin.rotation.x = 0.35;
  rearWin.rotation.y = Math.PI;
  group.add(rearWin);

  // Side Windows (Left & Right)
  const sideWinGeo = new THREE.PlaneGeometry(0.24, 0.11);
  const leftWin = new THREE.Mesh(sideWinGeo, tintedGlassMat);
  leftWin.position.set(-0.165, 0.29, -0.04);
  leftWin.rotation.y = -Math.PI / 2;
  group.add(leftWin);

  const rightWin = new THREE.Mesh(sideWinGeo, tintedGlassMat);
  rightWin.position.set(0.165, 0.29, -0.04);
  rightWin.rotation.y = Math.PI / 2;
  group.add(rightWin);

  // 3. Roof Antenna with Yellow Ball Tip
  const antennaGroup = new THREE.Group();
  antennaGroup.position.set(0.08, 0.38, -0.12);
  antennaGroup.rotation.z = -0.2;
  antennaGroup.rotation.x = -0.2;

  // Thin silver rod
  const rodGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.22, 8);
  const rodMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.8 });
  const rod = new THREE.Mesh(rodGeo, rodMat);
  rod.position.y = 0.11;
  rod.castShadow = castShadow;
  antennaGroup.add(rod);

  // Yellow sphere on top
  const ballGeo = new THREE.SphereGeometry(0.042, 14, 14);
  const ballMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    roughness: 0.3,
  });
  const ball = new THREE.Mesh(ballGeo, ballMat);
  ball.position.y = 0.22;
  ball.castShadow = castShadow;
  antennaGroup.add(ball);

  group.add(antennaGroup);

  // 4. Front Details: Round Headlights, Grille, and Red Bumper
  // 2 Round Yellow Headlights
  const headGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.02, 16);
  [-0.10, 0.10].forEach((hx) => {
    const head = new THREE.Mesh(headGeo, headlightMat);
    head.rotation.x = Math.PI / 2;
    head.position.set(hx, 0.16, 0.36);
    group.add(head);
  });

  // Black radiator grille slots
  const grilleGeo = new THREE.BoxGeometry(0.08, 0.04, 0.01);
  const grilleMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
  const grille = new THREE.Mesh(grilleGeo, grilleMat);
  grille.position.set(0, 0.16, 0.365);
  group.add(grille);

  // Red Front Bumper
  const bumperGeo = new THREE.BoxGeometry(0.38, 0.06, 0.05);
  const bumper = new THREE.Mesh(bumperGeo, bumperMat);
  bumper.position.set(0, 0.08, 0.32);
  bumper.castShadow = castShadow;
  group.add(bumper);

  // Rear Bumper
  const rearBumper = new THREE.Mesh(bumperGeo, bumperMat);
  rearBumper.position.set(0, 0.08, -0.30);
  rearBumper.castShadow = castShadow;
  group.add(rearBumper);

  // 5. Four Chunky Yellow Wheels with Red Hubcaps
  const wheelRadius = 0.095;
  const wheelWidth = 0.055;
  const wheelGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 20);
  const hubcapGeo = new THREE.CylinderGeometry(0.035, 0.035, wheelWidth + 0.01, 16);

  const wheelPositions: [number, number, number][] = [
    [-0.19, wheelRadius, 0.18],  // Front Left
    [0.19, wheelRadius, 0.18],   // Front Right
    [-0.19, wheelRadius, -0.18], // Rear Left
    [0.19, wheelRadius, -0.18],  // Rear Right
  ];

  wheelPositions.forEach(([wx, wy, wz]) => {
    const wheelGroup = new THREE.Group();
    wheelGroup.position.set(wx, wy, wz);

    const tire = new THREE.Mesh(wheelGeo, wheelTireMat);
    tire.rotation.z = Math.PI / 2;
    tire.castShadow = castShadow;
    wheelGroup.add(tire);

    const hub = new THREE.Mesh(hubcapGeo, hubcapMat);
    hub.rotation.z = Math.PI / 2;
    wheelGroup.add(hub);

    group.add(wheelGroup);
  });

  // 6. Weathering: Rust / Mud Spots on hood and fenders
  const rustSpots: [number, number, number, number, number][] = [
    [0.05, 0.235, 0.18, 0.08, 0.06],   // Hood patch
    [-0.08, 0.235, 0.22, 0.05, 0.04],  // Hood patch 2
    [0.165, 0.17, 0.04, 0.06, 0.08],   // Right fender
    [-0.165, 0.17, -0.06, 0.05, 0.07], // Left door
  ];

  rustSpots.forEach(([rx, ry, rz, sx, sz]) => {
    const spot = new THREE.Mesh(new THREE.PlaneGeometry(sx, sz), rustMat);
    spot.position.set(rx, ry, rz);
    spot.rotation.x = -Math.PI / 2;
    group.add(spot);
  });

  const scale = options.scale ?? 1.0;
  group.scale.set(scale, scale, scale);
  return group;
}
