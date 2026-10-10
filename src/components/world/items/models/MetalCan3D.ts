import * as THREE from 'three';
import { ItemMeshOptions } from '../types';

/**
 * A metal food tin / soda can — silver body, coloured label band,
 * ridge rings top and bottom, pull-ring on lid. Dry / recycle bin.
 */
export function createMetalCan3D(options: ItemMeshOptions = {}): THREE.Group {
  const group = new THREE.Group();
  group.name = 'metal_can';

  const castShadow = options.castShadow ?? true;
  const receiveShadow = options.receiveShadow ?? true;

  // Brushed aluminium silver
  const silverMat = new THREE.MeshStandardMaterial({
    color: 0xd1d5db,
    roughness: 0.25,
    metalness: 0.82,
  });

  // Coloured label band — tomato red (classic food tin look)
  const labelMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    roughness: 0.55,
    metalness: 0.05,
  });

  // White stripe on label
  const stripeMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.5,
  });

  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x9ca3af,
    roughness: 0.3,
    metalness: 0.7,
  });

  const RADIUS = 0.13;
  const HEIGHT = 0.38;

  // ── Main cylindrical body ──────────────────────────────────────────────
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(RADIUS, RADIUS, HEIGHT, 24),
    silverMat
  );
  body.position.y = HEIGHT / 2;
  body.castShadow = castShadow;
  body.receiveShadow = receiveShadow;
  group.add(body);

  // ── Coloured label band (sits in the middle 60% of the can height) ─────
  const labelHeight = HEIGHT * 0.60;
  const label = new THREE.Mesh(
    new THREE.CylinderGeometry(RADIUS + 0.002, RADIUS + 0.002, labelHeight, 24),
    labelMat
  );
  label.position.y = HEIGHT / 2;
  group.add(label);

  // White stripe on the label
  const stripe = new THREE.Mesh(
    new THREE.CylinderGeometry(RADIUS + 0.003, RADIUS + 0.003, 0.028, 24),
    stripeMat
  );
  stripe.position.y = HEIGHT / 2 + 0.06;
  group.add(stripe);

  // Second thinner stripe
  const stripe2 = new THREE.Mesh(
    new THREE.CylinderGeometry(RADIUS + 0.003, RADIUS + 0.003, 0.014, 24),
    stripeMat
  );
  stripe2.position.y = HEIGHT / 2 - 0.06;
  group.add(stripe2);

  // ── Ridge rings at top and bottom (structural look) ────────────────────
  [0.04, HEIGHT - 0.04].forEach((y) => {
    const ridge = new THREE.Mesh(
      new THREE.TorusGeometry(RADIUS + 0.008, 0.012, 8, 24),
      darkMat
    );
    ridge.rotation.x = Math.PI / 2;
    ridge.position.y = y;
    group.add(ridge);
  });

  // ── Top lid disc ───────────────────────────────────────────────────────
  const lid = new THREE.Mesh(
    new THREE.CylinderGeometry(RADIUS - 0.01, RADIUS - 0.01, 0.014, 24),
    silverMat
  );
  lid.position.y = HEIGHT + 0.007;
  group.add(lid);

  // ── Pull ring tab ──────────────────────────────────────────────────────
  const tabMat = new THREE.MeshStandardMaterial({ color: 0xb0b8c1, metalness: 0.85, roughness: 0.2 });

  // Tab base rectangle
  const tabBase = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.008, 0.032), tabMat);
  tabBase.position.set(0.04, HEIGHT + 0.02, 0);
  group.add(tabBase);

  // Pull ring (torus)
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.024, 0.006, 8, 16),
    tabMat
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.set(0.08, HEIGHT + 0.026, 0);
  group.add(ring);

  const scale = options.scale ?? 1.0;
  group.scale.set(scale, scale, scale);
  return group;
}
