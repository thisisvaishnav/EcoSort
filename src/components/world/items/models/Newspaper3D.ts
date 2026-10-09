import * as THREE from 'three';
import { ItemMeshOptions } from '../types';
import { getNewspaperTexture } from '../textures/proceduralTextures';

/**
 * Creates a detailed 3D model of a folded Newspaper.
 * Features a stacked broadsheet structure, folded spine crease,
 * layered fanned paper pages, and front cover artwork
 * ("NEWS" masthead, color nature photo, column lines).
 */
export function createNewspaper3D(options: ItemMeshOptions = {}): THREE.Group {
  const group = new THREE.Group();
  group.name = 'newspaper';

  const castShadow = options.castShadow ?? true;
  const receiveShadow = options.receiveShadow ?? true;

  const width = 0.58;
  const depth = 0.44;
  const height = 0.055;

  const paperTexture = getNewspaperTexture();

  // 1. Top Cover Page with Printed Masthead & Photo
  const topCoverMat = new THREE.MeshStandardMaterial({
    map: paperTexture,
    roughness: 0.85,
    metalness: 0.02,
  });

  const edgePaperMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.9,
  });

  // Main folded stack
  const bodyGeo = new THREE.BoxGeometry(width, height, depth);
  const materials = [
    edgePaperMat, // +X: layered edge
    edgePaperMat, // -X: folded spine
    topCoverMat,  // +Y: printed front page!
    edgePaperMat, // -Y: bottom back page
    edgePaperMat, // +Z: layered edge
    edgePaperMat, // -Z: layered edge
  ];

  const body = new THREE.Mesh(bodyGeo, materials);
  body.position.y = height / 2;
  body.castShadow = castShadow;
  body.receiveShadow = receiveShadow;
  group.add(body);

  // 2. Folded Spine on left (-X) with rounded crease
  const spineGeo = new THREE.CylinderGeometry(height / 2, height / 2, depth, 16);
  const spineMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.8,
  });
  const spine = new THREE.Mesh(spineGeo, spineMat);
  spine.position.set(-width / 2, height / 2, 0);
  spine.rotation.x = Math.PI / 2;
  group.add(spine);

  // 3. Fanned Underneath Page Layers (give authentic realistic paper stack depth)
  const layer1Geo = new THREE.BoxGeometry(width * 0.96, 0.012, depth * 0.98);
  const layer1 = new THREE.Mesh(layer1Geo, edgePaperMat);
  layer1.position.set(0.015, height * 0.35, 0.012);
  layer1.rotation.y = 0.025;
  group.add(layer1);

  const layer2Geo = new THREE.BoxGeometry(width * 0.98, 0.01, depth * 0.96);
  const layer2 = new THREE.Mesh(layer2Geo, edgePaperMat);
  layer2.position.set(0.02, height * 0.65, -0.01);
  layer2.rotation.y = -0.015;
  group.add(layer2);

  const scale = options.scale ?? 1.0;
  group.scale.set(scale, scale, scale);
  return group;
}
