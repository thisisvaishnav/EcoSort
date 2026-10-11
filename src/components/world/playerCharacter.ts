import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface PlayerCharacter {
  group: THREE.Group;
  updateAnimation: (isMoving: boolean, speed: number, delta: number) => void;
  setFacingAngle: (targetAngle: number, delta: number) => void;
  setFacingCamera?: (camera: THREE.Camera) => void;
  celebrate: () => void;
  currentAngle: number;
  readonly isGlbLoaded?: boolean;
}

/**
 * Creates a simple flat-color Kai character model:
 * - Golden yellow hoodie with folded hood
 * - Olive green backpack with plain flap
 * - Brown hair with bangs and side locks
 * - Plain peach face with no painted features
 * - Blue denim shorts with rolled cuffs
 * - White athletic ankle socks
 * - Blue and white sneakers
 */
export function createPlayerCharacter(shirtColor = 0xfacc15): PlayerCharacter {
  const group = new THREE.Group();
  group.name = 'KaiPlayerCharacter';

  // Root pivot for the avatar body
  const bodyRoot = new THREE.Group();
  bodyRoot.name = 'KaiBodyRoot';
  group.add(bodyRoot);

  // -------------------------------------------------------------------------
  // 1. MATERIALS (Flat colors only. The face stays plain.)
  // -------------------------------------------------------------------------
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xfde2c7,
    roughness: 0.55,
    metalness: 0.0,
  });

  const hoodieMat = new THREE.MeshStandardMaterial({
    color: shirtColor,
    roughness: 0.65,
    metalness: 0.05,
  });

  const hoodieTrimMat = new THREE.MeshStandardMaterial({
    color: 0xeab308,
    roughness: 0.7,
  });

  const whiteUndershirtMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.6,
  });

  const hairMat = new THREE.MeshStandardMaterial({
    color: 0x451a03,
    roughness: 0.85,
  });

  const backpackMat = new THREE.MeshStandardMaterial({
    color: 0x3f6212, // rich olive green
    roughness: 0.75,
  });

  const denimMat = new THREE.MeshStandardMaterial({
    color: 0x2563eb, // blue denim
    roughness: 0.8,
  });

  const denimCuffMat = new THREE.MeshStandardMaterial({
    color: 0x3b82f6,
    roughness: 0.8,
  });

  const sockMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.6,
  });

  const sneakerBlueMat = new THREE.MeshStandardMaterial({
    color: 0x1d4ed8,
    roughness: 0.5,
  });

  const sneakerWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.35,
  });

  // -------------------------------------------------------------------------
  // 2. TORSO & HOODIE
  // -------------------------------------------------------------------------
  const torsoGroup = new THREE.Group();
  torsoGroup.position.set(0, 1.35, 0);
  bodyRoot.add(torsoGroup);

  // Main Hoodie Body
  const torsoGeo = new THREE.BoxGeometry(0.72, 0.88, 0.46);
  const torso = new THREE.Mesh(torsoGeo, hoodieMat);
  torso.castShadow = true;
  torso.receiveShadow = true;
  torsoGroup.add(torso);

  // White Undershirt Collar at Neck
  const collar = new THREE.Mesh(
    new THREE.BoxGeometry(0.26, 0.1, 0.08),
    whiteUndershirtMat
  );
  collar.position.set(0, 0.44, 0.22);
  torsoGroup.add(collar);

  // Folded Hood Resting on Back of Neck
  const hoodFold = new THREE.Mesh(
    new THREE.BoxGeometry(0.62, 0.22, 0.24),
    hoodieMat
  );
  hoodFold.position.set(0, 0.4, -0.2);
  hoodFold.rotation.x = -0.3;
  hoodFold.castShadow = true;
  torsoGroup.add(hoodFold);

  // Hem Band at Waist
  const waistRib = new THREE.Mesh(
    new THREE.BoxGeometry(0.74, 0.1, 0.48),
    hoodieTrimMat
  );
  waistRib.position.set(0, -0.44, 0);
  torsoGroup.add(waistRib);

  // -------------------------------------------------------------------------
  // 3. BACKPACK (Plain olive green bag)
  // -------------------------------------------------------------------------
  const backpackGroup = new THREE.Group();
  backpackGroup.position.set(0, 0.02, -0.32);

  // Main Bag Body
  const packBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.56, 0.64, 0.24),
    backpackMat
  );
  packBody.castShadow = true;
  backpackGroup.add(packBody);

  // Top Flap
  const packFlap = new THREE.Mesh(
    new THREE.BoxGeometry(0.58, 0.26, 0.26),
    backpackMat
  );
  packFlap.position.set(0, 0.22, 0.01);
  packFlap.rotation.x = 0.1;
  backpackGroup.add(packFlap);

  // Shoulder Straps over Kai's Shoulders
  [-0.24, 0.24].forEach((xOffset) => {
    const shoulderStrap = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.65, 0.46),
      backpackMat
    );
    shoulderStrap.position.set(xOffset, 0.06, 0.22);
    backpackGroup.add(shoulderStrap);
  });

  torsoGroup.add(backpackGroup);

  // -------------------------------------------------------------------------
  // 4. HEAD, HAIR & EARS
  // -------------------------------------------------------------------------
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 2.08, 0);
  bodyRoot.add(headGroup);

  // Head Base Cube (plain face, no painted features)
  const headGeo = new THREE.BoxGeometry(0.56, 0.54, 0.52);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  // Ears
  [-0.3, 0.3].forEach((x) => {
    const ear = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, 0.08), skinMat);
    ear.position.set(x, 0, -0.02);
    headGroup.add(ear);
  });

  // Hair Group (Simple layered clumps)
  const hairGroup = new THREE.Group();

  // Top Hair Cap
  const hairTop = new THREE.Mesh(
    new THREE.BoxGeometry(0.62, 0.24, 0.6),
    hairMat
  );
  hairTop.position.set(0, 0.26, -0.02);
  hairTop.castShadow = true;
  hairGroup.add(hairTop);

  // Back Hair Curtain
  const hairBack = new THREE.Mesh(
    new THREE.BoxGeometry(0.62, 0.46, 0.16),
    hairMat
  );
  hairBack.position.set(0, -0.02, -0.26);
  hairBack.castShadow = true;
  hairGroup.add(hairBack);

  // Front Bangs
  const bangs = [
    { x: -0.2, y: 0.18, z: 0.28, rotZ: 0.2, sx: 0.14, sy: 0.24 },
    { x: -0.07, y: 0.22, z: 0.29, rotZ: -0.1, sx: 0.16, sy: 0.28 },
    { x: 0.08, y: 0.2, z: 0.29, rotZ: 0.15, sx: 0.16, sy: 0.26 },
    { x: 0.21, y: 0.17, z: 0.28, rotZ: -0.22, sx: 0.14, sy: 0.24 },
  ];
  bangs.forEach((b) => {
    const bang = new THREE.Mesh(
      new THREE.ConeGeometry(b.sx * 0.7, b.sy, 4),
      hairMat
    );
    bang.rotation.z = Math.PI + b.rotZ;
    bang.rotation.x = -0.2;
    bang.position.set(b.x, b.y, b.z);
    hairGroup.add(bang);
  });

  // Sideburn Locks
  [-0.31, 0.31].forEach((x, idx) => {
    const lock = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.3, 0.2),
      hairMat
    );
    lock.position.set(x, 0.05, 0.08);
    lock.rotation.z = idx === 0 ? 0.1 : -0.1;
    hairGroup.add(lock);
  });

  headGroup.add(hairGroup);

  // -------------------------------------------------------------------------
  // 5. ARMS (Yellow Hoodie Sleeves, Cuffs, & Hands)
  // -------------------------------------------------------------------------
  const armGeo = new THREE.BoxGeometry(0.22, 0.52, 0.22);
  armGeo.translate(0, -0.26, 0);

  const createArm = (isLeft: boolean) => {
    const shoulderPivot = new THREE.Group();
    shoulderPivot.position.set(isLeft ? -0.48 : 0.48, 1.74, 0);

    // Upper sleeve
    const sleeve = new THREE.Mesh(armGeo, hoodieMat);
    sleeve.castShadow = true;
    shoulderPivot.add(sleeve);

    // Wrist cuff
    const cuff = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.1, 0.24),
      hoodieTrimMat
    );
    cuff.position.set(0, -0.52, 0);
    shoulderPivot.add(cuff);

    // Hand
    const hand = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.2, 0.16),
      skinMat
    );
    hand.position.set(0, -0.66, 0);
    shoulderPivot.add(hand);

    bodyRoot.add(shoulderPivot);
    return shoulderPivot;
  };

  const leftArmPivot = createArm(true);
  const rightArmPivot = createArm(false);

  // -------------------------------------------------------------------------
  // 6. LEGS (Blue Denim Shorts, White Socks, & Blue/White Sneakers)
  // -------------------------------------------------------------------------
  const legGeo = new THREE.BoxGeometry(0.24, 0.4, 0.24);
  legGeo.translate(0, -0.2, 0);

  const createLeg = (isLeft: boolean) => {
    const hipPivot = new THREE.Group();
    hipPivot.position.set(isLeft ? -0.2 : 0.2, 0.9, 0);

    // Denim shorts upper
    const shorts = new THREE.Mesh(legGeo, denimMat);
    shorts.castShadow = true;
    hipPivot.add(shorts);

    // Rolled Denim Cuff
    const cuff = new THREE.Mesh(
      new THREE.BoxGeometry(0.27, 0.1, 0.27),
      denimCuffMat
    );
    cuff.position.set(0, -0.38, 0);
    hipPivot.add(cuff);

    // Bare Lower Leg
    const lowerLeg = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.35, 0.2),
      skinMat
    );
    lowerLeg.position.set(0, -0.55, 0);
    hipPivot.add(lowerLeg);

    // White Sock
    const sock = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.16, 0.22),
      sockMat
    );
    sock.position.set(0, -0.72, 0);
    hipPivot.add(sock);

    // Blue & White Sneaker
    const sneakerGroup = new THREE.Group();
    sneakerGroup.position.set(0, -0.84, 0.08);

    // Blue Canvas Body
    const shoeBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, 0.16, 0.38),
      sneakerBlueMat
    );
    shoeBody.castShadow = true;
    sneakerGroup.add(shoeBody);

    // White Rubber Sole
    const sole = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.06, 0.42),
      sneakerWhiteMat
    );
    sole.position.set(0, -0.09, 0.01);
    sneakerGroup.add(sole);

    // White Toe Bumper
    const toeCap = new THREE.Mesh(
      new THREE.BoxGeometry(0.27, 0.1, 0.12),
      sneakerWhiteMat
    );
    toeCap.position.set(0, -0.03, 0.14);
    sneakerGroup.add(toeCap);

    hipPivot.add(sneakerGroup);
    bodyRoot.add(hipPivot);
    return hipPivot;
  };

  const leftLegPivot = createLeg(true);
  const rightLegPivot = createLeg(false);

  // -------------------------------------------------------------------------
  // 7. GLB MODEL ASSET LOADER (Flat-color Kai model)
  // -------------------------------------------------------------------------
  let isGlbLoaded = false;
  let gltfBodyRoot: THREE.Object3D | null = null;
  let gltfLeftArmPivot: THREE.Object3D | null = null;
  let gltfRightArmPivot: THREE.Object3D | null = null;
  let gltfLeftLegPivot: THREE.Object3D | null = null;
  let gltfRightLegPivot: THREE.Object3D | null = null;
  let gltfHeadPivot: THREE.Object3D | null = null;

  // Asynchronously load the flat-color GLB model
  if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
    try {
      let modelUrl = '/models/kai.glb';
      if (window.location && window.location.origin && window.location.origin !== 'null' && window.location.origin !== 'about:blank') {
        try {
          modelUrl = new URL('/models/kai.glb', window.location.origin).href;
        } catch {
          // ignore
        }
      }

      const gltfLoader = new GLTFLoader();
      gltfLoader.load(
        modelUrl,
        (gltf) => {
          const glbModel = gltf.scene;
          glbModel.name = 'KaiGlbPhotoCharacter';

          glbModel.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          gltfBodyRoot = glbModel.getObjectByName('BodyRoot') || null;
          gltfLeftArmPivot = glbModel.getObjectByName('LeftArmPivot') || null;
          gltfRightArmPivot = glbModel.getObjectByName('RightArmPivot') || null;
          gltfLeftLegPivot = glbModel.getObjectByName('LeftLegPivot') || null;
          gltfRightLegPivot = glbModel.getObjectByName('RightLegPivot') || null;
          gltfHeadPivot = glbModel.getObjectByName('HeadPivot') || null;

          // Transition from procedural to GLB model
          bodyRoot.visible = false;
          group.add(glbModel);
          isGlbLoaded = true;
        },
        undefined,
        () => {
          // Procedural model remains visible and functional
        }
      );
    } catch {
      // In non-browser / headless test environments without full HTTP server,
      // the procedural fallback remains seamlessly active
    }
  }

  // -------------------------------------------------------------------------
  // 8. LOCOMOTION, IDLE BREATHING & CELEBRATION ANIMATIONS
  // -------------------------------------------------------------------------
  let animTime = 0;
  let currentAngle = 0;
  let celebrateTimer = 0;

  const updateAnimation = (isMoving: boolean, speed: number, delta: number) => {
    // If celebrating (e.g. scored a point in sorting)
    if (celebrateTimer > 0) {
      celebrateTimer -= delta;
      const jumpPhase = Math.sin((1 - celebrateTimer / 0.8) * Math.PI);

      // Kai hops into the air
      const hopY = jumpPhase * 0.45;
      bodyRoot.position.y = hopY;
      if (gltfBodyRoot) gltfBodyRoot.position.y = hopY;

      // Arms raised high in victory!
      const armX = -Math.PI * 0.85;
      leftArmPivot.rotation.x = armX;
      rightArmPivot.rotation.x = armX;
      leftArmPivot.rotation.z = -0.3;
      rightArmPivot.rotation.z = 0.3;

      if (gltfLeftArmPivot) {
        gltfLeftArmPivot.rotation.x = armX;
        gltfLeftArmPivot.rotation.z = -0.3;
      }
      if (gltfRightArmPivot) {
        gltfRightArmPivot.rotation.x = armX;
        gltfRightArmPivot.rotation.z = 0.3;
      }

      // Legs tuck slightly
      leftLegPivot.rotation.x = -0.3;
      rightLegPivot.rotation.x = -0.3;
      if (gltfLeftLegPivot) gltfLeftLegPivot.rotation.x = -0.3;
      if (gltfRightLegPivot) gltfRightLegPivot.rotation.x = -0.3;
      return;
    }

    animTime += delta * (isMoving ? Math.max(speed * 2.4, 8.5) : 2.6);

    if (isMoving) {
      // Reciprocal walking stride
      const stride = Math.sin(animTime);
      leftLegPivot.rotation.x = stride * 0.75;
      rightLegPivot.rotation.x = -stride * 0.75;
      if (gltfLeftLegPivot) gltfLeftLegPivot.rotation.x = stride * 0.75;
      if (gltfRightLegPivot) gltfRightLegPivot.rotation.x = -stride * 0.75;

      // Reciprocal arm swing
      leftArmPivot.rotation.x = -stride * 0.65;
      rightArmPivot.rotation.x = stride * 0.65;
      leftArmPivot.rotation.z = 0.08;
      rightArmPivot.rotation.z = -0.08;
      if (gltfLeftArmPivot) {
        gltfLeftArmPivot.rotation.x = -stride * 0.65;
        gltfLeftArmPivot.rotation.z = 0.08;
      }
      if (gltfRightArmPivot) {
        gltfRightArmPivot.rotation.x = stride * 0.65;
        gltfRightArmPivot.rotation.z = -0.08;
      }

      // Vertical bounce & torso roll
      const bounce = Math.abs(Math.sin(animTime * 2)) * 0.09;
      const roll = Math.sin(animTime) * 0.04;
      const headTurn = Math.sin(animTime) * 0.05;

      bodyRoot.position.y = bounce;
      bodyRoot.rotation.z = roll;
      headGroup.rotation.y = headTurn;

      if (gltfBodyRoot) {
        gltfBodyRoot.position.y = bounce;
        gltfBodyRoot.rotation.z = roll;
      }
      if (gltfHeadPivot) {
        gltfHeadPivot.rotation.y = headTurn;
      }
    } else {
      // Idle breathing
      const breath = Math.sin(animTime);
      leftLegPivot.rotation.x = THREE.MathUtils.lerp(leftLegPivot.rotation.x, 0, 0.15);
      rightLegPivot.rotation.x = THREE.MathUtils.lerp(rightLegPivot.rotation.x, 0, 0.15);
      if (gltfLeftLegPivot) gltfLeftLegPivot.rotation.x = THREE.MathUtils.lerp(gltfLeftLegPivot.rotation.x, 0, 0.15);
      if (gltfRightLegPivot) gltfRightLegPivot.rotation.x = THREE.MathUtils.lerp(gltfRightLegPivot.rotation.x, 0, 0.15);

      leftArmPivot.rotation.x = THREE.MathUtils.lerp(leftArmPivot.rotation.x, 0.06, 0.15);
      rightArmPivot.rotation.x = THREE.MathUtils.lerp(rightArmPivot.rotation.x, 0.06, 0.15);
      leftArmPivot.rotation.z = THREE.MathUtils.lerp(leftArmPivot.rotation.z, 0.08, 0.15);
      rightArmPivot.rotation.z = THREE.MathUtils.lerp(rightArmPivot.rotation.z, -0.08, 0.15);
      if (gltfLeftArmPivot) {
        gltfLeftArmPivot.rotation.x = THREE.MathUtils.lerp(gltfLeftArmPivot.rotation.x, 0.06, 0.15);
        gltfLeftArmPivot.rotation.z = THREE.MathUtils.lerp(gltfLeftArmPivot.rotation.z, 0.08, 0.15);
      }
      if (gltfRightArmPivot) {
        gltfRightArmPivot.rotation.x = THREE.MathUtils.lerp(gltfRightArmPivot.rotation.x, 0.06, 0.15);
        gltfRightArmPivot.rotation.z = THREE.MathUtils.lerp(gltfRightArmPivot.rotation.z, -0.08, 0.15);
      }

      const breathY = THREE.MathUtils.lerp(bodyRoot.position.y, breath * 0.03, 0.12);
      bodyRoot.position.y = breathY;
      bodyRoot.rotation.z = 0;
      headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, 0, 0.1);

      if (gltfBodyRoot) {
        gltfBodyRoot.position.y = breathY;
        gltfBodyRoot.rotation.z = 0;
      }
      if (gltfHeadPivot) {
        gltfHeadPivot.rotation.y = THREE.MathUtils.lerp(gltfHeadPivot.rotation.y, 0, 0.1);
      }
    }
  };

  const setFacingAngle = (targetAngle: number, delta: number) => {
    let diff = targetAngle - currentAngle;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;

    currentAngle += diff * Math.min(1.0, delta * 12.0);
    group.rotation.y = currentAngle;
  };

  const setFacingCamera = (camera: THREE.Camera) => {
    const dx = camera.position.x - group.position.x;
    const dz = camera.position.z - group.position.z;
    currentAngle = Math.atan2(dx, dz);
    group.rotation.y = currentAngle;
  };

  const celebrate = () => {
    celebrateTimer = 0.8; // 0.8 second celebration jump
  };

  return {
    group,
    updateAnimation,
    setFacingAngle,
    setFacingCamera,
    celebrate,
    get currentAngle() {
      return currentAngle;
    },
    get isGlbLoaded() {
      return isGlbLoaded;
    },
  };
}

/**
 * Async helper to load Kai 3D GLB model directly
 */
export async function loadPlayerCharacterGlb(url = '/models/kai.glb'): Promise<THREE.Group> {
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(url);
  return gltf.scene;
}
