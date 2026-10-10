import * as THREE from 'three';
import { ItemMeshOptions } from '../types';

/**
 * A small pile of vegetable scraps — carrot top, leafy greens, a bit of
 * onion skin. Instantly recognisable and clearly organic/wet bin.
 */
export function createVeggieScrap3D(options: ItemMeshOptions = {}): THREE.Group {
  const group = new THREE.Group();
  group.name = 'veggie_scrap';

  const castShadow = options.castShadow ?? true;
  const receiveShadow = options.receiveShadow ?? true;

  const carrotMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.6 });
  const leafMat   = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.7, side: THREE.DoubleSide });
  const skinMat   = new THREE.MeshStandardMaterial({ color: 0xfef9c3, roughness: 0.8 });
  const dirtMat   = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });

  // ── Base pile (compressed scraps) ─────────────────────────────────────
  const pileGeo = new THREE.SphereGeometry(0.22, 12, 8);
  pileGeo.scale(1, 0.45, 0.9);
  const pile = new THREE.Mesh(pileGeo, dirtMat);
  pile.position.y = 0.10;
  pile.receiveShadow = receiveShadow;
  group.add(pile);

  // ── Carrot stub (orange cylinder, tapered) ────────────────────────────
  const carrot = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.015, 0.32, 8), carrotMat);
  carrot.position.set(-0.06, 0.20, 0.02);
  carrot.rotation.z = 0.4;
  carrot.castShadow = castShadow;
  group.add(carrot);

  // Carrot ridges
  for (let i = 0; i < 4; i++) {
    const ridge = new THREE.Mesh(
      new THREE.CylinderGeometry(0.042, 0.042, 0.04, 8),
      new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.55 })
    );
    ridge.position.set(-0.06 + Math.sin(0.4) * i * 0.07, 0.10 + i * 0.07, 0.02 + Math.cos(0.4) * i * 0.07);
    ridge.rotation.z = 0.4;
    group.add(ridge);
  }

  // ── Leafy green scraps ────────────────────────────────────────────────
  const leafAngles = [0, 0.9, 1.8, 2.7, 3.6];
  leafAngles.forEach((a, i) => {
    const leafGeo = new THREE.PlaneGeometry(0.18, 0.12);
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    const r = 0.14 + (i % 2) * 0.05;
    leaf.position.set(Math.cos(a) * r, 0.18 + i * 0.03, Math.sin(a) * r * 0.8);
    leaf.rotation.x = -0.5 + Math.random() * 0.6;
    leaf.rotation.z = a + 0.3;
    leaf.castShadow = castShadow;
    group.add(leaf);
  });

  // ── Onion skin scraps (pale crinkled) ─────────────────────────────────
  [0.08, -0.1].forEach((ox) => {
    const skin = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.10), skinMat);
    skin.position.set(ox, 0.13, 0.14);
    skin.rotation.x = -0.35;
    skin.rotation.z = ox * 3;
    group.add(skin);
  });

  const scale = options.scale ?? 1.0;
  group.scale.set(scale, scale, scale);
  return group;
}
