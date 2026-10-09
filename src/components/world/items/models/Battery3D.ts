import * as THREE from 'three';
import { ItemMeshOptions } from '../types';
import { getBatteryTexture } from '../textures/proceduralTextures';

/**
 * Creates a detailed 3D model of a heavy-duty battery.
 * Features a cylindrical cell with golden-orange positive half,
 * dark industrial negative casing, bold "+" sign,
 * raised metallic positive terminal pip, and bottom contact disc.
 */
export function createBattery3D(options: ItemMeshOptions = {}): THREE.Group {
  const group = new THREE.Group();
  group.name = 'battery';

  const castShadow = options.castShadow ?? true;
  const receiveShadow = options.receiveShadow ?? true;

  const radius = 0.16;
  const height = 0.48;

  // 1. Main Casing Cylinder
  const bodyGeo = new THREE.CylinderGeometry(radius, radius, height, 28);
  const batteryTex = getBatteryTexture();

  const bodyMat = new THREE.MeshStandardMaterial({
    map: batteryTex,
    roughness: 0.35,
    metalness: 0.45,
  });

  const shinyMetalMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0, // Polished nickel silver
    metalness: 0.9,
    roughness: 0.2,
  });

  // Multi-material for cylinder: [side, top, bottom]
  const cylinderMaterials = [
    bodyMat,       // 0: Side wrap with + symbol & rust
    shinyMetalMat, // 1: Top metallic face
    shinyMetalMat, // 2: Bottom metallic negative disc
  ];

  const body = new THREE.Mesh(bodyGeo, cylinderMaterials);
  body.position.y = height / 2;
  body.castShadow = castShadow;
  body.receiveShadow = receiveShadow;
  group.add(body);

  // 2. Raised Positive Terminal Pip on top
  const pipGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.05, 20);
  const pip = new THREE.Mesh(pipGeo, shinyMetalMat);
  pip.position.y = height + 0.025;
  pip.castShadow = castShadow;
  group.add(pip);

  // 3. Top Metal Crimp Ring
  const crimpGeo = new THREE.TorusGeometry(radius * 0.96, 0.012, 8, 28);
  const crimp = new THREE.Mesh(crimpGeo, shinyMetalMat);
  crimp.rotation.x = Math.PI / 2;
  crimp.position.y = height;
  group.add(crimp);

  // 4. Bottom Insulator Rim
  const bottomRim = new THREE.Mesh(crimpGeo, shinyMetalMat);
  bottomRim.rotation.x = Math.PI / 2;
  bottomRim.position.y = 0.01;
  group.add(bottomRim);

  const scale = options.scale ?? 1.0;
  group.scale.set(scale, scale, scale);
  return group;
}
