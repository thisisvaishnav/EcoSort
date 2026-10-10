import * as THREE from 'three';
import { ItemMeshOptions } from '../types';

/**
 * Creates a 3D model of a broken pen (residual waste).
 * A pen body in two pieces, slightly separated.
 */
export function createBrokenPen3D(options: ItemMeshOptions = {}): THREE.Group {
  const group = new THREE.Group();
  group.name = 'broken_pen';

  const castShadow = options.castShadow ?? true;
  const receiveShadow = options.receiveShadow ?? true;

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.35,
    metalness: 0.15,
  });

  const clipMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.2,
    metalness: 0.6,
  });

  const inkMat = new THREE.MeshStandardMaterial({
    color: 0x1e40af,
    roughness: 0.6,
    metalness: 0.0,
  });

  const tipMat = new THREE.MeshStandardMaterial({
    color: 0xc0c0c0,
    roughness: 0.2,
    metalness: 0.8,
  });

  // Upper half of pen body
  const upperGeo = new THREE.CylinderGeometry(0.025, 0.022, 0.22, 10);
  const upper = new THREE.Mesh(upperGeo, bodyMat);
  upper.position.set(-0.03, 0.23, 0);
  upper.rotation.z = 0.18;
  upper.castShadow = castShadow;
  upper.receiveShadow = receiveShadow;
  group.add(upper);

  // Clip on upper
  const clipGeo = new THREE.BoxGeometry(0.008, 0.18, 0.008);
  const clip = new THREE.Mesh(clipGeo, clipMat);
  clip.position.set(-0.056, 0.23, 0.02);
  clip.rotation.z = 0.18;
  group.add(clip);

  // Cap / top
  const capGeo = new THREE.CylinderGeometry(0.028, 0.025, 0.04, 10);
  const cap = new THREE.Mesh(capGeo, clipMat);
  cap.position.set(-0.07, 0.34, 0);
  cap.rotation.z = 0.18;
  group.add(cap);

  // Lower half of pen body (broken, slightly angled differently)
  const lowerGeo = new THREE.CylinderGeometry(0.022, 0.018, 0.18, 10);
  const lower = new THREE.Mesh(lowerGeo, bodyMat);
  lower.position.set(0.04, 0.09, 0.02);
  lower.rotation.z = -0.25;
  lower.castShadow = castShadow;
  lower.receiveShadow = receiveShadow;
  group.add(lower);

  // Ink smear at break point
  const inkGeo = new THREE.SphereGeometry(0.018, 8, 6);
  inkGeo.scale(1, 0.4, 1.2);
  const ink = new THREE.Mesh(inkGeo, inkMat);
  ink.position.set(0.01, 0.14, 0.01);
  group.add(ink);

  // Tip (nib)
  const tipGeo = new THREE.ConeGeometry(0.015, 0.04, 8);
  const tip = new THREE.Mesh(tipGeo, tipMat);
  tip.position.set(0.09, 0.02, 0.03);
  tip.rotation.z = -0.25;
  group.add(tip);

  const scale = options.scale ?? 1.0;
  group.scale.set(scale, scale, scale);
  return group;
}
