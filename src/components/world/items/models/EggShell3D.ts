import * as THREE from 'three';
import { ItemMeshOptions } from '../types';

/**
 * A cracked egg shell — white outer, pale yellow inner, jagged break edge.
 * Clearly organic waste (wet bin). Two halves, slightly splayed open.
 */
export function createEggShell3D(options: ItemMeshOptions = {}): THREE.Group {
  const group = new THREE.Group();
  group.name = 'egg_shell';

  const castShadow = options.castShadow ?? true;
  const receiveShadow = options.receiveShadow ?? true;

  const shellOuterMat = new THREE.MeshStandardMaterial({
    color: 0xf5f0e8, // off-white eggshell
    roughness: 0.55,
    metalness: 0.0,
    side: THREE.FrontSide,
  });

  const shellInnerMat = new THREE.MeshStandardMaterial({
    color: 0xfef9c3, // pale yellow membrane
    roughness: 0.7,
    side: THREE.BackSide,
  });

  const crackMat = new THREE.MeshStandardMaterial({
    color: 0xe0d5c5,
    roughness: 0.8,
  });

  // ── Helper: half-sphere dome (one egg half) ────────────────────────────
  const makeHalf = (
    radiusTop: number,
    _height: number,
    tiltX: number,
    tiltZ: number,
    offsetX: number,
    offsetY: number
  ) => {
    const halfGroup = new THREE.Group();

    // Outer shell — full half-sphere
    const outerGeo = new THREE.SphereGeometry(radiusTop, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const outer = new THREE.Mesh(outerGeo, shellOuterMat);
    outer.castShadow = castShadow;
    outer.receiveShadow = receiveShadow;
    halfGroup.add(outer);

    // Inner shell (flipped normals give the inside colour)
    const innerGeo = new THREE.SphereGeometry(radiusTop * 0.95, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const inner = new THREE.Mesh(innerGeo, shellInnerMat);
    halfGroup.add(inner);

    // Flat bottom cap so it doesn't look hollow from below
    const capGeo = new THREE.CircleGeometry(radiusTop, 20);
    const cap = new THREE.Mesh(capGeo, shellInnerMat);
    cap.rotation.x = Math.PI / 2;
    halfGroup.add(cap);

    // Jagged crack edge — small rectangular shards around the rim
    const shardCount = 14;
    for (let i = 0; i < shardCount; i++) {
      const a = (i / shardCount) * Math.PI * 2;
      const shardH = 0.018 + (i % 3) * 0.014;
      const shard = new THREE.Mesh(
        new THREE.BoxGeometry(0.028, shardH, 0.016),
        crackMat
      );
      shard.position.set(
        Math.cos(a) * radiusTop * 0.96,
        -shardH / 2,
        Math.sin(a) * radiusTop * 0.96
      );
      shard.rotation.y = a;
      halfGroup.add(shard);
    }

    halfGroup.rotation.x = tiltX;
    halfGroup.rotation.z = tiltZ;
    halfGroup.position.set(offsetX, offsetY, 0);
    return halfGroup;
  };

  // Bottom half — larger, sitting on the floor, slightly tilted
  const bottomHalf = makeHalf(0.22, 0.18, 0, 0.12, 0, 0.04);
  bottomHalf.rotation.x = Math.PI; // flip so opening faces up
  bottomHalf.position.y = 0.22;
  group.add(bottomHalf);

  // Top half — smaller, tilted open to the side
  const topHalf = makeHalf(0.20, 0.16, -0.6, 0.3, 0.08, 0.36);
  group.add(topHalf);

  // Tiny egg yolk splatter on floor (flat yellow disc)
  const yolkMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.4 });
  const yolk = new THREE.Mesh(new THREE.CircleGeometry(0.09, 16), yolkMat);
  yolk.rotation.x = -Math.PI / 2;
  yolk.position.y = 0.004;
  group.add(yolk);

  const scale = options.scale ?? 1.0;
  group.scale.set(scale, scale, scale);
  return group;
}
