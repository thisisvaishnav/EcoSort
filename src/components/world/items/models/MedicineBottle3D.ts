import * as THREE from 'three';
import { ItemMeshOptions } from '../types';
import { getMedicineLabelTexture } from '../textures/proceduralTextures';

/**
 * Creates a detailed 3D model of a Medicine Bottle with pills.
 * Features an amber-brown translucent pharmaceutical bottle,
 * white label with a bold red medical cross,
 * loose open white screw cap, and 3 loose pills
 * (red/white capsule, blue/white capsule, and white tablet).
 */
export function createMedicineBottle3D(options: ItemMeshOptions = {}): THREE.Group {
  const group = new THREE.Group();
  group.name = 'medicine_bottle';

  const castShadow = options.castShadow ?? true;
  const receiveShadow = options.receiveShadow ?? true;

  // 1. Amber Glass Bottle Body
  const bottleGroup = new THREE.Group();

  const amberMat = new THREE.MeshStandardMaterial({
    color: 0x92400e, // Warm amber pharmacy glass
    transparent: true,
    opacity: 0.82,
    roughness: 0.25,
    metalness: 0.1,
  });

  const bodyRadius = 0.15;
  const bodyHeight = 0.32;
  const bodyGeo = new THREE.CylinderGeometry(bodyRadius, bodyRadius, bodyHeight, 28);
  const body = new THREE.Mesh(bodyGeo, amberMat);
  body.position.y = bodyHeight / 2;
  body.castShadow = castShadow;
  body.receiveShadow = receiveShadow;
  bottleGroup.add(body);

  // Bottle Shoulder taper
  const shoulderGeo = new THREE.CylinderGeometry(0.10, bodyRadius, 0.05, 28);
  const shoulder = new THREE.Mesh(shoulderGeo, amberMat);
  shoulder.position.y = bodyHeight + 0.025;
  bottleGroup.add(shoulder);

  // Bottle Threaded Neck
  const neckGeo = new THREE.CylinderGeometry(0.10, 0.10, 0.08, 28);
  const neck = new THREE.Mesh(neckGeo, amberMat);
  neck.position.y = bodyHeight + 0.09;
  bottleGroup.add(neck);

  // Neck Lip
  const lipGeo = new THREE.TorusGeometry(0.105, 0.012, 8, 28);
  const lip = new THREE.Mesh(lipGeo, amberMat);
  lip.rotation.x = Math.PI / 2;
  lip.position.y = bodyHeight + 0.13;
  bottleGroup.add(lip);

  // 2. White Prescription Label with Bold Red Cross
  const labelTex = getMedicineLabelTexture();
  const labelMat = new THREE.MeshStandardMaterial({
    map: labelTex,
    roughness: 0.6,
  });

  // Cylindrical curved sleeve for the label
  const labelGeo = new THREE.CylinderGeometry(
    bodyRadius * 1.01,
    bodyRadius * 1.01,
    bodyHeight * 0.68,
    28,
    1,
    true,
    -Math.PI * 0.4,
    Math.PI * 0.8
  );
  const label = new THREE.Mesh(labelGeo, labelMat);
  label.position.y = bodyHeight * 0.5;
  bottleGroup.add(label);

  group.add(bottleGroup);

  // 3. Open White Ribbed Screw Cap (lying next to bottle)
  const capGroup = new THREE.Group();
  capGroup.position.set(-0.25, 0.04, 0.15);
  capGroup.rotation.set(0.2, 0.3, -0.4); // tilted naturally on table

  const whiteCapMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.4,
  });

  const capCylinderGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.06, 24);
  const capMesh = new THREE.Mesh(capCylinderGeo, whiteCapMat);
  capMesh.castShadow = castShadow;
  capGroup.add(capMesh);

  // Ribbed cap ridges
  const capRimGeo = new THREE.TorusGeometry(0.108, 0.01, 8, 24);
  const capRim = new THREE.Mesh(capRimGeo, whiteCapMat);
  capRim.rotation.x = Math.PI / 2;
  capRim.position.y = 0.03;
  capGroup.add(capRim);

  group.add(capGroup);

  // 4. Three Loose Pills on ground
  // Pill 1: Red and White Capsule
  const redMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });
  const whitePillMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
  const blueMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.3 });

  const capsuleGeo = new THREE.CapsuleGeometry(0.032, 0.07, 8, 16);

  const cap1Group = new THREE.Group();
  cap1Group.position.set(0.22, 0.032, 0.12);
  cap1Group.rotation.set(Math.PI / 2, 0, 0.6);

  // Two-tone capsule: top red, bottom white
  const cap1Top = new THREE.Mesh(capsuleGeo, redMat);
  cap1Top.scale.set(1, 1, 1);
  cap1Top.castShadow = castShadow;
  cap1Group.add(cap1Top);

  const cap1WhiteHalf = new THREE.Mesh(new THREE.CylinderGeometry(0.0325, 0.0325, 0.06, 16), whitePillMat);
  cap1WhiteHalf.position.y = -0.025;
  cap1Group.add(cap1WhiteHalf);
  group.add(cap1Group);

  // Pill 2: Blue and White Capsule
  const cap2Group = new THREE.Group();
  cap2Group.position.set(0.28, 0.032, -0.06);
  cap2Group.rotation.set(Math.PI / 2, 0, -0.3);

  const cap2Top = new THREE.Mesh(capsuleGeo, blueMat);
  cap2Top.castShadow = castShadow;
  cap2Group.add(cap2Top);

  const cap2WhiteHalf = new THREE.Mesh(new THREE.CylinderGeometry(0.0325, 0.0325, 0.06, 16), whitePillMat);
  cap2WhiteHalf.position.y = -0.025;
  cap2Group.add(cap2WhiteHalf);
  group.add(cap2Group);

  // Pill 3: Round White Scored Tablet
  const tabletGroup = new THREE.Group();
  tabletGroup.position.set(0.12, 0.02, 0.24);

  const tabletGeo = new THREE.CylinderGeometry(0.048, 0.048, 0.025, 20);
  const tablet = new THREE.Mesh(tabletGeo, whitePillMat);
  tablet.castShadow = castShadow;
  tabletGroup.add(tablet);

  // Center score line on tablet
  const scoreGeo = new THREE.BoxGeometry(0.08, 0.005, 0.008);
  const scoreMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1 });
  const score = new THREE.Mesh(scoreGeo, scoreMat);
  score.position.y = 0.013;
  tabletGroup.add(score);
  group.add(tabletGroup);

  const scale = options.scale ?? 1.0;
  group.scale.set(scale, scale, scale);
  return group;
}
