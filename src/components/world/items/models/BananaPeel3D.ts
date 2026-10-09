import * as THREE from 'three';
import { ItemMeshOptions } from '../types';

/**
 * Creates a detailed 3D model of a discarded Banana Peel.
 * Features 4 curled skin flaps splayed outward, dark stem tip,
 * and realistic inner/outer peel coloring matching the screenshot.
 */
export function createBananaPeel3D(options: ItemMeshOptions = {}): THREE.Group {
  const group = new THREE.Group();
  group.name = 'banana_peel';

  const castShadow = options.castShadow ?? true;
  const receiveShadow = options.receiveShadow ?? true;

  // Materials
  const outerSkinMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15, // Bright banana yellow
    roughness: 0.45,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });

  const innerPulpMat = new THREE.MeshStandardMaterial({
    color: 0xfef9c3, // Soft pale cream
    roughness: 0.6,
    metalness: 0.02,
  });

  const brownTipMat = new THREE.MeshStandardMaterial({
    color: 0x451a03, // Dark organic brown
    roughness: 0.8,
  });

  const brownSpeckleMat = new THREE.MeshStandardMaterial({
    color: 0x78350f,
    roughness: 0.7,
  });

  // 1. Central Stem at top
  const stemGeo = new THREE.CylinderGeometry(0.035, 0.05, 0.16, 8);
  const stem = new THREE.Mesh(stemGeo, brownTipMat);
  stem.position.set(0, 0.48, 0);
  stem.rotation.z = -0.15;
  stem.castShadow = castShadow;
  group.add(stem);

  // Inner center core
  const coreGeo = new THREE.ConeGeometry(0.06, 0.18, 8);
  const core = new THREE.Mesh(coreGeo, innerPulpMat);
  core.position.set(0, 0.35, 0);
  group.add(core);

  // 2. Four Splayed Curled Peels
  // Angles around Y: 0, 90, 180, 270 degrees with slight natural variance
  const peelAngles = [0.1, 1.6, 3.2, 4.8];

  peelAngles.forEach((angle) => {
    const peelGroup = new THREE.Group();
    peelGroup.rotation.y = angle;

    // Use curved tube / extrude or segmented curved ribbon
    const curvePoints = [
      new THREE.Vector3(0, 0.42, 0),
      new THREE.Vector3(0.12, 0.38, 0),
      new THREE.Vector3(0.26, 0.22, 0),
      new THREE.Vector3(0.38, 0.06, 0),
      new THREE.Vector3(0.48, 0.02, 0),
      new THREE.Vector3(0.54, 0.08, 0), // Curled up tip!
    ];

    const curve = new THREE.CatmullRomCurve3(curvePoints);
    // Tapering width peel ribbon
    const peelGeo = new THREE.TubeGeometry(curve, 16, 0.045, 8, false);

    // Scale cross-section along Y/Z to flatten into a ribbon
    peelGeo.scale(1, 0.35, 1.4);

    const peelMesh = new THREE.Mesh(peelGeo, outerSkinMat);
    peelMesh.castShadow = castShadow;
    peelMesh.receiveShadow = receiveShadow;
    peelGroup.add(peelMesh);

    // Brown tip on the curled end
    const tipGeo = new THREE.SphereGeometry(0.035, 8, 8);
    tipGeo.scale(1, 0.6, 1.2);
    const tipMesh = new THREE.Mesh(tipGeo, brownTipMat);
    tipMesh.position.set(0.53, 0.08, 0);
    peelGroup.add(tipMesh);

    // Speckles on skin
    [0.18, 0.32, 0.44].forEach((xDist, sIdx) => {
      const speckle = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.015, 0.03), brownSpeckleMat);
      speckle.position.set(xDist, 0.28 - sIdx * 0.1, (sIdx % 2 === 0 ? 0.02 : -0.02));
      peelGroup.add(speckle);
    });

    group.add(peelGroup);
  });

  const scale = options.scale ?? 1.0;
  group.scale.set(scale, scale, scale);
  return group;
}
