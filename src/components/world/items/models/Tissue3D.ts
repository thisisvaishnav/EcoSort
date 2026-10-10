import * as THREE from 'three';
import { ItemMeshOptions } from '../types';

/**
 * Creates a 3D model of a crumpled used tissue (residual waste).
 * Soft, scrunched paper look.
 */
export function createTissue3D(options: ItemMeshOptions = {}): THREE.Group {
  const group = new THREE.Group();
  group.name = 'tissue';

  const castShadow = options.castShadow ?? true;
  const receiveShadow = options.receiveShadow ?? true;

  const paperMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.85,
    metalness: 0.0,
  });

  const shadowMat = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    roughness: 0.9,
    metalness: 0.0,
  });

  // Crumpled main lump
  const mainGeo = new THREE.SphereGeometry(0.14, 10, 7);
  mainGeo.scale(1.2, 0.7, 1.1);
  const main = new THREE.Mesh(mainGeo, paperMat);
  main.position.set(0, 0.1, 0);
  main.castShadow = castShadow;
  main.receiveShadow = receiveShadow;
  group.add(main);

  // Fold bumps — small overlapping spheres to show crinkled paper
  const foldPositions: [number, number, number][] = [
    [0.08, 0.16, 0.05],
    [-0.07, 0.14, -0.04],
    [0.0, 0.2, 0.07],
    [0.1, 0.09, -0.06],
  ];

  foldPositions.forEach(([x, y, z]) => {
    const foldGeo = new THREE.SphereGeometry(0.06, 7, 6);
    const fold = new THREE.Mesh(foldGeo, shadowMat);
    fold.position.set(x, y, z);
    fold.castShadow = castShadow;
    group.add(fold);
  });

  const scale = options.scale ?? 1.0;
  group.scale.set(scale, scale, scale);
  return group;
}
