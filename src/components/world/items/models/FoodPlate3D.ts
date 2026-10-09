import * as THREE from 'three';
import { ItemMeshOptions } from '../types';

/**
 * Creates a detailed 3D model of a plate with leftover food scraps.
 * Features a ceramic plate, fluffy white rice, savory vegetable curry,
 * green peas, and scattered crumbs matching the screenshot.
 */
export function createFoodPlate3D(options: ItemMeshOptions = {}): THREE.Group {
  const group = new THREE.Group();
  group.name = 'food_plate';

  const castShadow = options.castShadow ?? true;
  const receiveShadow = options.receiveShadow ?? true;

  // 1. Ceramic Plate Base
  const plateGeo = new THREE.CylinderGeometry(0.52, 0.38, 0.08, 32);
  const plateMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9, // Crisp glazed off-white porcelain
    roughness: 0.3,
    metalness: 0.1,
  });
  const plate = new THREE.Mesh(plateGeo, plateMat);
  plate.position.y = 0.04;
  plate.castShadow = castShadow;
  plate.receiveShadow = receiveShadow;
  group.add(plate);

  // Recessed inner plate well
  const wellGeo = new THREE.CylinderGeometry(0.44, 0.42, 0.02, 32);
  const wellMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.4,
  });
  const well = new THREE.Mesh(wellGeo, wellMat);
  well.position.y = 0.08;
  group.add(well);

  // 2. White Rice Mound (Left half of plate)
  const riceBaseGeo = new THREE.SphereGeometry(0.24, 16, 12, 0, Math.PI);
  riceBaseGeo.scale(1, 0.45, 0.85);
  const riceBaseMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.7,
  });
  const riceBase = new THREE.Mesh(riceBaseGeo, riceBaseMat);
  riceBase.position.set(-0.16, 0.08, 0);
  riceBase.rotation.x = -Math.PI / 2;
  riceBase.castShadow = castShadow;
  group.add(riceBase);

  // Clustered individual rice grains on the mound
  const grainGeo = new THREE.CapsuleGeometry(0.014, 0.03, 4, 8);
  const grainMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.6,
  });

  const grainOffsets: [number, number, number][] = [
    [-0.24, 0.14, -0.08],
    [-0.18, 0.15, 0.04],
    [-0.12, 0.16, -0.05],
    [-0.22, 0.13, 0.1],
    [-0.28, 0.11, 0.02],
    [-0.15, 0.16, -0.12],
    [-0.08, 0.14, 0.08],
    [-0.26, 0.09, -0.16],
    [-0.32, 0.09, 0.06],
  ];

  grainOffsets.forEach(([gx, gy, gz]) => {
    const grain = new THREE.Mesh(grainGeo, grainMat);
    grain.position.set(gx, gy, gz);
    grain.rotation.set(Math.random() * 0.5, Math.random() * 2, Math.random() * 0.5);
    group.add(grain);
  });

  // 3. Savory Curry Sauce (Right half of plate)
  const curryGeo = new THREE.CylinderGeometry(0.22, 0.24, 0.04, 16);
  curryGeo.scale(1.1, 1, 0.9);
  const curryMat = new THREE.MeshStandardMaterial({
    color: 0xd97706, // Warm rich curry amber
    roughness: 0.25, // Glossy sauce sheen
    metalness: 0.05,
  });
  const curry = new THREE.Mesh(curryGeo, curryMat);
  curry.position.set(0.12, 0.09, 0.02);
  curry.castShadow = castShadow;
  group.add(curry);

  // 4. Green Peas & Veggie Chunks in Curry
  const peaGeo = new THREE.SphereGeometry(0.035, 10, 10);
  const peaMat = new THREE.MeshStandardMaterial({
    color: 0x16a34a, // Vibrant cooked green pea
    roughness: 0.35,
  });

  const peaPositions: [number, number, number][] = [
    [0.08, 0.12, -0.06],
    [0.16, 0.13, 0.02],
    [0.12, 0.12, 0.1],
    [0.22, 0.12, -0.02],
    [0.05, 0.11, 0.04],
  ];

  peaPositions.forEach(([px, py, pz]) => {
    const pea = new THREE.Mesh(peaGeo, peaMat);
    pea.position.set(px, py, pz);
    pea.castShadow = castShadow;
    group.add(pea);
  });

  // 5. Scattered Crumbs on plate edge
  const crumbGeo = new THREE.DodecahedronGeometry(0.016);
  const crumbMat = new THREE.MeshStandardMaterial({
    color: 0xb45309,
    roughness: 0.8,
  });

  const crumbPositions: [number, number, number][] = [
    [-0.38, 0.08, 0.14],
    [-0.32, 0.08, -0.22],
    [0.34, 0.08, 0.18],
    [0.28, 0.08, -0.24],
    [0.02, 0.08, 0.32],
  ];

  crumbPositions.forEach(([cx, cy, cz]) => {
    const crumb = new THREE.Mesh(crumbGeo, crumbMat);
    crumb.position.set(cx, cy, cz);
    group.add(crumb);
  });

  const scale = options.scale ?? 1.0;
  group.scale.set(scale, scale, scale);
  return group;
}
