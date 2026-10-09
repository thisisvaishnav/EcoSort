import * as THREE from 'three';
import { ItemMeshOptions } from '../types';

/**
 * Creates a detailed 3D model of a plastic water bottle.
 * Features a translucent contoured PET body with 3 ribbed grip rings,
 * tapered neck, threaded collar, blue screw cap, and petaloid base.
 */
export function createPlasticBottle3D(options: ItemMeshOptions = {}): THREE.Group {
  const group = new THREE.Group();
  group.name = 'plastic_bottle';

  const castShadow = options.castShadow ?? true;
  const receiveShadow = options.receiveShadow ?? true;

  // Translucent PET plastic material
  const petMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8, // Clear sky cyan/blue
    transparent: true,
    opacity: 0.72,
    roughness: 0.15,
    metalness: 0.08,
    transmission: 0.6,
    ior: 1.45,
    reflectivity: 0.8,
  });

  // Construct profiled silhouette using LatheGeometry
  // Profile points from bottom (y=0) to bottle lip (y=0.72)
  const points: THREE.Vector2[] = [];

  // Bottom center to petaloid base rim
  points.push(new THREE.Vector2(0, 0));
  points.push(new THREE.Vector2(0.12, 0.02));
  points.push(new THREE.Vector2(0.14, 0.08));

  // Lower bottle body
  points.push(new THREE.Vector2(0.145, 0.18));

  // 3 Ribbed grip grooves in midsection
  points.push(new THREE.Vector2(0.13, 0.22)); // Groove 1
  points.push(new THREE.Vector2(0.145, 0.26));
  points.push(new THREE.Vector2(0.13, 0.30)); // Groove 2
  points.push(new THREE.Vector2(0.145, 0.34));
  points.push(new THREE.Vector2(0.13, 0.38)); // Groove 3
  points.push(new THREE.Vector2(0.145, 0.42));

  // Upper bottle body
  points.push(new THREE.Vector2(0.145, 0.50));

  // Tapered shoulder curving in
  points.push(new THREE.Vector2(0.13, 0.56));
  points.push(new THREE.Vector2(0.09, 0.62));
  points.push(new THREE.Vector2(0.065, 0.65));

  // Neck collar & threads
  points.push(new THREE.Vector2(0.065, 0.70));
  points.push(new THREE.Vector2(0.07, 0.71));
  points.push(new THREE.Vector2(0.065, 0.72));
  points.push(new THREE.Vector2(0.05, 0.72));

  const bottleGeo = new THREE.LatheGeometry(points, 24);
  const bottleMesh = new THREE.Mesh(bottleGeo, petMaterial);
  bottleMesh.castShadow = castShadow;
  bottleMesh.receiveShadow = receiveShadow;
  group.add(bottleMesh);

  // 2. Plastic Screw Cap on top
  const capGroup = new THREE.Group();
  capGroup.position.y = 0.71;

  const capMat = new THREE.MeshStandardMaterial({
    color: 0x1d4ed8, // Deep royal blue plastic cap
    roughness: 0.35,
    metalness: 0.1,
  });

  // Cap cylinder body
  const capGeo = new THREE.CylinderGeometry(0.068, 0.068, 0.06, 24);
  const capMesh = new THREE.Mesh(capGeo, capMat);
  capMesh.position.y = 0.03;
  capMesh.castShadow = castShadow;
  capGroup.add(capMesh);

  // Tamper evident ring under cap
  const ringGeo = new THREE.TorusGeometry(0.067, 0.008, 8, 24);
  const ringMesh = new THREE.Mesh(ringGeo, capMat);
  ringMesh.rotation.x = Math.PI / 2;
  ringMesh.position.y = -0.005;
  capGroup.add(ringMesh);

  group.add(capGroup);

  // 3. Molded Petaloid Feet on bottom base (5 small bumps)
  for (let f = 0; f < 5; f++) {
    const angle = (f * Math.PI * 2) / 5;
    const footGeo = new THREE.SphereGeometry(0.024, 8, 8);
    const foot = new THREE.Mesh(footGeo, petMaterial);
    foot.position.set(Math.cos(angle) * 0.10, 0.015, Math.sin(angle) * 0.10);
    group.add(foot);
  }

  const scale = options.scale ?? 1.0;
  group.scale.set(scale, scale, scale);
  return group;
}
