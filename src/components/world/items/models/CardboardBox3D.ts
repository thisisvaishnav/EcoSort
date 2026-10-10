import * as THREE from 'three';
import { ItemMeshOptions } from '../types';

/**
 * A flat-packed cardboard box — brown corrugated body, darker score lines,
 * slightly crushed to show it's used. Dry / recycle bin.
 */
export function createCardboardBox3D(options: ItemMeshOptions = {}): THREE.Group {
  const group = new THREE.Group();
  group.name = 'cardboard_box';

  const castShadow = options.castShadow ?? true;
  const receiveShadow = options.receiveShadow ?? true;

  const boxMat = new THREE.MeshStandardMaterial({
    color: 0xd97706, // warm cardboard brown
    roughness: 0.88,
    metalness: 0.0,
  });

  const scoreMat = new THREE.MeshStandardMaterial({
    color: 0x92400e, // darker crease line
    roughness: 0.9,
  });

  const flapMat = new THREE.MeshStandardMaterial({
    color: 0xb45309,
    roughness: 0.85,
  });

  // ── Main box body ──────────────────────────────────────────────────────
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.36, 0.44), boxMat);
  body.position.y = 0.18;
  body.castShadow = castShadow;
  body.receiveShadow = receiveShadow;
  group.add(body);

  // ── Score / fold lines on front and back faces ────────────────────────
  // Vertical centre crease (front face)
  const vCrease = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.34, 0.008), scoreMat);
  vCrease.position.set(0, 0.18, 0.222);
  group.add(vCrease);

  // Horizontal crease (front face, mid-height)
  const hCrease = new THREE.Mesh(new THREE.BoxGeometry(0.53, 0.010, 0.008), scoreMat);
  hCrease.position.set(0, 0.18, 0.222);
  group.add(hCrease);

  // Side vertical crease
  const sCrease = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.34, 0.42), scoreMat);
  sCrease.position.set(0.278, 0.18, 0);
  group.add(sCrease);

  // ── Slightly open top flaps ────────────────────────────────────────────
  // Front flap (tilted open at ~30°)
  const frontFlap = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.008, 0.22), flapMat);
  frontFlap.position.set(0, 0.36 + 0.008, 0.11);
  frontFlap.rotation.x = -0.45; // tilted open
  frontFlap.castShadow = castShadow;
  group.add(frontFlap);

  // Back flap (pushed down a little)
  const backFlap = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.008, 0.22), flapMat);
  backFlap.position.set(0, 0.358, -0.22);
  backFlap.rotation.x = 0.25;
  group.add(backFlap);

  // ── Corrugation texture: thin horizontal ridges on the sides ──────────
  for (let i = 0; i < 6; i++) {
    const ridge = new THREE.Mesh(
      new THREE.BoxGeometry(0.008, 0.015, 0.42),
      scoreMat
    );
    ridge.position.set(-0.275, 0.05 + i * 0.05, 0);
    group.add(ridge);
  }

  const scale = options.scale ?? 1.0;
  group.scale.set(scale, scale, scale);
  return group;
}
