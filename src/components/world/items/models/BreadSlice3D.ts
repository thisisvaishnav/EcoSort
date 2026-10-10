import * as THREE from 'three';
import { ItemMeshOptions } from '../types';

/**
 * A thick slice of leftover bread — golden crust, soft cream interior,
 * sesame seeds on top. Wet bin (food waste).
 */
export function createBreadSlice3D(options: ItemMeshOptions = {}): THREE.Group {
  const group = new THREE.Group();
  group.name = 'bread_slice';

  const castShadow = options.castShadow ?? true;
  const receiveShadow = options.receiveShadow ?? true;

  // Crust material — warm toasted golden brown
  const crustMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    roughness: 0.75,
    metalness: 0.0,
  });

  // Interior — soft pale cream
  const interiorMat = new THREE.MeshStandardMaterial({
    color: 0xfef3c7,
    roughness: 0.85,
  });

  // Sesame seed material
  const seedMat = new THREE.MeshStandardMaterial({
    color: 0xfde68a,
    roughness: 0.6,
  });

  // ── Main bread body (slightly rounded box) ──────────────────────────────
  const bodyGeo = new THREE.BoxGeometry(0.54, 0.30, 0.44);
  const body = new THREE.Mesh(bodyGeo, crustMat);
  body.position.y = 0.17;
  body.castShadow = castShadow;
  body.receiveShadow = receiveShadow;
  group.add(body);

  // Dome top — squashed sphere to give the bread a rounded top
  const domeGeo = new THREE.SphereGeometry(0.26, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2);
  domeGeo.scale(1.02, 0.55, 0.84);
  const dome = new THREE.Mesh(domeGeo, crustMat);
  dome.position.y = 0.32;
  dome.castShadow = castShadow;
  group.add(dome);

  // Interior face (the cut side — visible at the front)
  const faceMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.85 });
  const faceGeo = new THREE.PlaneGeometry(0.50, 0.28);
  const face = new THREE.Mesh(faceGeo, faceMat);
  face.position.set(0, 0.17, 0.221);
  group.add(face);

  // Small darker ring on the interior face (air bubbles / crumb texture)
  [
    [-0.10, 0.08],
    [0.12, 0.16],
    [-0.06, 0.24],
    [0.08, 0.06],
  ].forEach(([cx, cy]) => {
    const bubble = new THREE.Mesh(
      new THREE.CircleGeometry(0.025, 8),
      interiorMat
    );
    bubble.position.set(cx, cy, 0.222);
    group.add(bubble);
  });

  // ── Sesame seeds on top ────────────────────────────────────────────────
  for (let i = 0; i < 9; i++) {
    const seed = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 5), seedMat);
    seed.scale.set(1, 0.5, 0.6);
    const angle = (i / 9) * Math.PI * 2;
    const r = 0.08 + (i % 3) * 0.07;
    seed.position.set(Math.cos(angle) * r, 0.47, Math.sin(angle) * r * 0.7);
    group.add(seed);
  }

  const scale = options.scale ?? 1.0;
  group.scale.set(scale, scale, scale);
  return group;
}
