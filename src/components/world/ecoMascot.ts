/**
 * ecoMascot.ts
 * ------------
 * Eco is the game mascot: a friendly round-headed character in a green hoodie
 * who stands beside the dining table and reacts to gameplay events.
 *
 * All geometry is built from Three.js primitives (no GLB / GLTF loader needed).
 * Five procedural animations are exposed through the EcoAnimations interface.
 * Call animate(delta) every frame to advance the current animation.
 */

import * as THREE from 'three';

// ─── Public types ─────────────────────────────────────────────────────────────

export type EcoAnimation = 'idle' | 'wave' | 'cheer' | 'tryAgain' | 'pointBin';

export interface EcoAnimations {
  /** Switch to a named animation. Interrupts any currently playing animation. */
  play(name: EcoAnimation, targetWorldPos?: THREE.Vector3): void;
  /** Step the current animation forward. Call once per frame. */
  animate(delta: number): void;
}

export interface EcoMascotResult {
  group: THREE.Group;
  animations: EcoAnimations;
}

// ─── Build the mascot ─────────────────────────────────────────────────────────

export function createEcoMascot(): EcoMascotResult {
  const group = new THREE.Group();
  group.name = 'EcoMascot';

  // ── Materials ──────────────────────────────────────────────────────────────
  const hoodieMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.7 }); // green hoodie
  const darkGreenMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.6 }); // hoodie trim
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.5 }); // warm skin
  const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
  const eyeBlackMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4 });
  const eyeHighlightMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 0.6,
    roughness: 0.1,
  });
  const blushMat = new THREE.MeshStandardMaterial({
    color: 0xfca5a5,
    roughness: 0.6,
    transparent: true,
    opacity: 0.65,
  });
  const mouthMat = new THREE.MeshStandardMaterial({ color: 0x450a0a, roughness: 0.5 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e3a5f, roughness: 0.75 }); // dark blue pants
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55 }); // white trainers
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.5, side: THREE.DoubleSide });

  // ── Proportions ────────────────────────────────────────────────────────────
  const HEAD_R = 0.22;
  const BODY_H = 0.50;
  const BODY_W = 0.28;
  const ARM_LEN = 0.32;
  const ARM_R = 0.065;
  const LEG_H = 0.36;
  const LEG_R = 0.07;
  const SHOULDER_Y = 0.42; // world-space shoulder height (from group origin = feet)

  // ── Feet / root at y = 0 ──────────────────────────────────────────────────

  // Shoes
  [-0.08, 0.08].forEach((sx) => {
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.20), shoeMat);
    shoe.position.set(sx, 0.04, 0.04);
    shoe.castShadow = true;
    group.add(shoe);
  });

  // Legs
  const legGeo = new THREE.CylinderGeometry(LEG_R, LEG_R * 0.9, LEG_H, 12);
  [-0.08, 0.08].forEach((lx) => {
    const leg = new THREE.Mesh(legGeo, pantsMat);
    leg.position.set(lx, 0.08 + LEG_H / 2, 0);
    leg.castShadow = true;
    group.add(leg);
  });

  // ── Body (hoodie) ──────────────────────────────────────────────────────────
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(BODY_W, BODY_W * 0.85, BODY_H, 16),
    hoodieMat
  );
  body.position.y = 0.08 + LEG_H + BODY_H / 2;
  body.castShadow = true;
  group.add(body);

  // Hoodie pocket
  const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.10, 0.02), darkGreenMat);
  pocket.position.set(0, 0.08 + LEG_H + 0.12, BODY_W - 0.005);
  group.add(pocket);

  // ── Head ──────────────────────────────────────────────────────────────────
  const HEAD_Y = 0.08 + LEG_H + BODY_H + HEAD_R + 0.04;

  const head = new THREE.Mesh(new THREE.SphereGeometry(HEAD_R, 24, 18), skinMat);
  head.position.y = HEAD_Y;
  head.castShadow = true;
  group.add(head);

  // Eyes (two sides)
  const eyeGeo = new THREE.SphereGeometry(0.055, 14, 10);
  [-0.085, 0.085].forEach((ex) => {
    // White sclera
    const sclera = new THREE.Mesh(eyeGeo, eyeWhiteMat);
    sclera.position.set(ex, HEAD_Y + 0.04, HEAD_R * 0.88);
    group.add(sclera);

    // Black iris
    const iris = new THREE.Mesh(new THREE.SphereGeometry(0.032, 12, 8), eyeBlackMat);
    iris.position.set(ex, HEAD_Y + 0.04, HEAD_R * 0.97);
    group.add(iris);

    // Tiny specular highlight
    const highlight = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), eyeHighlightMat);
    highlight.position.set(ex + 0.012, HEAD_Y + 0.055, HEAD_R * 0.99);
    group.add(highlight);
  });

  // Rosy cheek blushes
  [-0.12, 0.12].forEach((bx) => {
    const blush = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), blushMat);
    blush.scale.z = 0.35;
    blush.position.set(bx, HEAD_Y - 0.03, HEAD_R * 0.93);
    group.add(blush);
  });

  // Smile (thin torus arc)
  const smileGeo = new THREE.TorusGeometry(0.06, 0.012, 8, 16, Math.PI);
  const smile = new THREE.Mesh(smileGeo, mouthMat);
  smile.rotation.z = Math.PI; // open side faces down
  smile.position.set(0, HEAD_Y - 0.08, HEAD_R * 0.92);
  group.add(smile);

  // Small leaf antenna on top of head
  const leafGeo = new THREE.PlaneGeometry(0.12, 0.16);
  const leaf = new THREE.Mesh(leafGeo, leafMat);
  leaf.position.set(0.04, HEAD_Y + HEAD_R + 0.06, 0);
  leaf.rotation.z = 0.3;
  group.add(leaf);

  // Antenna stem
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.007, 0.007, 0.10, 6),
    darkGreenMat
  );
  stem.position.set(0.04, HEAD_Y + HEAD_R + 0.01, 0);
  group.add(stem);

  // ── Arms (left and right, as separate pivots for animation) ───────────────
  // Left arm (viewer's right — the waving arm)
  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-BODY_W - 0.01, SHOULDER_Y + 0.18, 0);
  const leftArm = new THREE.Mesh(
    new THREE.CylinderGeometry(ARM_R, ARM_R * 0.75, ARM_LEN, 10),
    hoodieMat
  );
  // Arm hangs down from shoulder pivot
  leftArm.position.set(-ARM_LEN / 2, 0, 0);
  leftArm.rotation.z = Math.PI / 2; // horizontal
  leftArmPivot.add(leftArm);
  // Left hand (skin-coloured sphere)
  const leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), skinMat);
  leftHand.position.set(-ARM_LEN, 0, 0);
  leftArmPivot.add(leftHand);
  group.add(leftArmPivot);

  // Right arm (pointing arm)
  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(BODY_W + 0.01, SHOULDER_Y + 0.18, 0);
  const rightArm = new THREE.Mesh(
    new THREE.CylinderGeometry(ARM_R, ARM_R * 0.75, ARM_LEN, 10),
    hoodieMat
  );
  rightArm.position.set(ARM_LEN / 2, 0, 0);
  rightArm.rotation.z = Math.PI / 2;
  rightArmPivot.add(rightArm);
  const rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), skinMat);
  rightHand.position.set(ARM_LEN, 0, 0);
  rightArmPivot.add(rightHand);
  group.add(rightArmPivot);

  // ─────────────────────────────────────────────────────────────────────────
  // ANIMATION ENGINE
  // ─────────────────────────────────────────────────────────────────────────

  let currentAnim: EcoAnimation = 'idle';
  let animTimer = 0; // seconds elapsed in current animation
  let pointTarget: THREE.Vector3 | null = null;

  // Natural rest rotations
  const REST_LEFT_Z = -Math.PI / 12;  // arms hang slightly outward
  const REST_RIGHT_Z = Math.PI / 12;

  const animate = (delta: number) => {
    animTimer += delta;
    const t = animTimer;

    switch (currentAnim) {
      // ── Idle: gentle body bob and arm sway ──────────────────────────────
      case 'idle': {
        const bob = Math.sin(t * 1.8) * 0.012;
        body.position.y = 0.08 + LEG_H + BODY_H / 2 + bob;
        head.position.y = HEAD_Y + bob + Math.sin(t * 0.9) * 0.006;
        leftArmPivot.rotation.z = REST_LEFT_Z + Math.sin(t * 1.4) * 0.08;
        rightArmPivot.rotation.z = REST_RIGHT_Z + Math.sin(t * 1.4 + 1) * 0.08;
        leftArmPivot.rotation.x = 0;
        rightArmPivot.rotation.x = 0;
        break;
      }

      // ── Wave: left arm sweeps up and side-to-side ──────────────────────
      case 'wave': {
        const lift = Math.min(1, t / 0.25); // quick raise
        const swing = Math.sin(t * 5.5) * 0.55;
        leftArmPivot.rotation.z = THREE.MathUtils.lerp(REST_LEFT_Z, -1.2 + swing, lift);
        leftArmPivot.rotation.x = swing * 0.3;
        rightArmPivot.rotation.z = REST_RIGHT_Z;
        rightArmPivot.rotation.x = 0;
        // Gentle head tilt during wave
        head.rotation.z = Math.sin(t * 3) * 0.06;
        if (t > 1.8) play('idle');
        break;
      }

      // ── Cheer: both arms shoot up, body bounces ─────────────────────────
      case 'cheer': {
        const raise = Math.min(1, t / 0.2);
        const bounce = Math.abs(Math.sin(t * 7)) * 0.06;
        leftArmPivot.rotation.z = THREE.MathUtils.lerp(REST_LEFT_Z, -2.0, raise);
        rightArmPivot.rotation.z = THREE.MathUtils.lerp(REST_RIGHT_Z, 2.0, raise);
        leftArmPivot.rotation.x = Math.sin(t * 6) * 0.15;
        rightArmPivot.rotation.x = -Math.sin(t * 6) * 0.15;
        body.position.y = 0.08 + LEG_H + BODY_H / 2 + bounce;
        head.position.y = HEAD_Y + bounce;
        if (t > 1.4) play('idle');
        break;
      }

      // ── Try-again: gentle head shake side-to-side ───────────────────────
      case 'tryAgain': {
        const shakeAmt = Math.sin(t * 8) * 0.14 * Math.max(0, 1 - t / 0.9);
        head.rotation.y = shakeAmt;
        leftArmPivot.rotation.z = REST_LEFT_Z;
        rightArmPivot.rotation.z = REST_RIGHT_Z;
        if (t > 1.0) {
          head.rotation.y = 0;
          play('idle');
        }
        break;
      }

      // ── Point at bin: right arm extends toward target world position ─────
      case 'pointBin': {
        if (pointTarget) {
          const ecoWorldPos = new THREE.Vector3();
          group.getWorldPosition(ecoWorldPos);
          const dir = pointTarget.clone().sub(ecoWorldPos).normalize();
          // Project direction to a simple arm X rotation (forward/back) and Z rotation (up/down)
          const angleX = -Math.atan2(dir.z, Math.abs(dir.x)) * 0.6;
          const angleZ = Math.atan2(dir.x, Math.abs(dir.y)) * 0.5 + REST_RIGHT_Z;
          const raise = Math.min(1, t / 0.3);
          rightArmPivot.rotation.z = THREE.MathUtils.lerp(rightArmPivot.rotation.z, angleZ, raise * 0.15);
          rightArmPivot.rotation.x = THREE.MathUtils.lerp(rightArmPivot.rotation.x, angleX, raise * 0.15);
        }
        leftArmPivot.rotation.z = REST_LEFT_Z;
        if (t > 2.2) play('idle');
        break;
      }
    }
  };

  const play = (name: EcoAnimation, targetWorldPos?: THREE.Vector3) => {
    currentAnim = name;
    animTimer = 0;
    if (name === 'pointBin' && targetWorldPos) {
      pointTarget = targetWorldPos;
    }
    // Reset head rotation when starting a new animation
    if (name !== 'tryAgain') head.rotation.y = 0;
    if (name !== 'wave') head.rotation.z = 0;
  };

  return {
    group,
    animations: { play, animate },
  };
}
