import * as THREE from 'three';
import { ItemMeshOptions } from '../types';
import { getMagazineTexture } from '../textures/proceduralTextures';

/**
 * Creates a detailed 3D model of a glossy Magazine.
 * Features a thick bound booklet, glossy front cover with
 * red header ("MAGAZINE"), mountain/river landscape art,
 * yellow callout boxes, staple bindings, and page edge layers.
 */
export function createMagazine3D(options: ItemMeshOptions = {}): THREE.Group {
  const group = new THREE.Group();
  group.name = 'magazine';

  const castShadow = options.castShadow ?? true;
  const receiveShadow = options.receiveShadow ?? true;

  const width = 0.48;
  const depth = 0.58;
  const height = 0.048;

  const coverTex = getMagazineTexture();

  // 1. Glossy Front Cover Material
  const coverMat = new THREE.MeshStandardMaterial({
    map: coverTex,
    roughness: 0.2, // Glossy publication finish
    metalness: 0.05,
  });

  const pageEdgeMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.85,
  });

  const spineMat = new THREE.MeshStandardMaterial({
    color: 0xef4444, // Red bound spine matching header
    roughness: 0.4,
  });

  // Box faces: [+X, -X, +Y (cover), -Y (back), +Z, -Z]
  const materials = [
    pageEdgeMat, // +X: page edge stack
    spineMat,    // -X: bound spine
    coverMat,    // +Y: glossy front cover!
    pageEdgeMat, // -Y: back page
    pageEdgeMat, // +Z: bottom page edge
    pageEdgeMat, // -Z: top page edge
  ];

  const bodyGeo = new THREE.BoxGeometry(width, height, depth);
  const body = new THREE.Mesh(bodyGeo, materials);
  body.position.y = height / 2;
  body.castShadow = castShadow;
  body.receiveShadow = receiveShadow;
  group.add(body);

  // 2. Rounded Spine Crease on left (-X)
  const spineGeo = new THREE.CylinderGeometry(height / 2, height / 2, depth, 16);
  const spine = new THREE.Mesh(spineGeo, spineMat);
  spine.position.set(-width / 2, height / 2, 0);
  spine.rotation.x = Math.PI / 2;
  group.add(spine);

  // 3. Metallic Binding Staples along spine
  const stapleGeo = new THREE.BoxGeometry(0.012, 0.006, 0.06);
  const stapleMat = new THREE.MeshStandardMaterial({
    color: 0xd1d5db,
    metalness: 0.9,
    roughness: 0.2,
  });

  [-depth * 0.3, depth * 0.3].forEach((zPos) => {
    const staple = new THREE.Mesh(stapleGeo, stapleMat);
    staple.position.set(-width / 2 + 0.015, height + 0.003, zPos);
    group.add(staple);
  });

  // 4. Subtle Page Flare (Bottom right pages slightly curled/offset)
  const flareGeo = new THREE.BoxGeometry(width * 0.95, 0.008, depth * 0.95);
  const flare = new THREE.Mesh(flareGeo, pageEdgeMat);
  flare.position.set(0.015, height * 0.5, 0.012);
  flare.rotation.y = 0.02;
  group.add(flare);

  const scale = options.scale ?? 1.0;
  group.scale.set(scale, scale, scale);
  return group;
}
