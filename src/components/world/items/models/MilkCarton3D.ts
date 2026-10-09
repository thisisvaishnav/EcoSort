import * as THREE from 'three';
import { ItemMeshOptions } from '../types';
import { getMilkCartonTexture } from '../textures/proceduralTextures';

/**
 * Creates a detailed 3D model of a gable-top Milk Carton.
 * Features a rectangular carton body with pitched roof,
 * front panel artwork ("MILK", cow face, rolling hills),
 * side nutrition/barcode panel, and a plastic twist-off screw cap.
 */
export function createMilkCarton3D(options: ItemMeshOptions = {}): THREE.Group {
  const group = new THREE.Group();
  group.name = 'milk_carton';

  const castShadow = options.castShadow ?? true;
  const receiveShadow = options.receiveShadow ?? true;

  const width = 0.36;
  const depth = 0.36;
  const bodyHeight = 0.44;
  const roofHeight = 0.16;
  const finHeight = 0.05;

  // 1. Main Carton Body Box
  const bodyGeo = new THREE.BoxGeometry(width, bodyHeight, depth);

  // Materials for Box:
  // We use procedural texture on the front and right faces
  const labelTex = getMilkCartonTexture();
  const frontMat = new THREE.MeshStandardMaterial({
    map: labelTex,
    roughness: 0.5,
    metalness: 0.05,
  });

  const plainWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.5,
  });

  // Box faces order in Three.js: +X (right), -X (left), +Y (top), -Y (bottom), +Z (front), -Z (back)
  const bodyMaterials = [
    frontMat,      // +X: side panel (nutrition & barcode)
    plainWhiteMat, // -X: plain side
    plainWhiteMat, // +Y: top
    plainWhiteMat, // -Y: bottom
    frontMat,      // +Z: front panel ("MILK" & cow face)
    plainWhiteMat, // -Z: back
  ];

  const body = new THREE.Mesh(bodyGeo, bodyMaterials);
  body.position.y = bodyHeight / 2;
  body.castShadow = castShadow;
  body.receiveShadow = receiveShadow;
  group.add(body);

  // 2. Gable-top Triangular Pitched Roof
  // Create prism roof using custom BufferGeometry or tilted planes
  const roofGroup = new THREE.Group();
  roofGroup.position.y = bodyHeight;

  const blueRoofMat = new THREE.MeshStandardMaterial({
    color: 0x2563eb, // Rich royal blue carton roof
    roughness: 0.4,
    metalness: 0.05,
  });

  // Front slanted roof panel
  const frontSlopeGeo = new THREE.PlaneGeometry(width, Math.hypot(depth / 2, roofHeight));
  const frontSlope = new THREE.Mesh(frontSlopeGeo, blueRoofMat);
  const slopeAngle = Math.atan2(depth / 2, roofHeight);
  frontSlope.position.set(0, roofHeight / 2, depth / 4);
  frontSlope.rotation.x = slopeAngle;
  frontSlope.castShadow = castShadow;
  roofGroup.add(frontSlope);

  // Back slanted roof panel
  const backSlope = new THREE.Mesh(frontSlopeGeo, blueRoofMat);
  backSlope.position.set(0, roofHeight / 2, -depth / 4);
  backSlope.rotation.x = -slopeAngle;
  backSlope.rotation.y = Math.PI;
  backSlope.castShadow = castShadow;
  roofGroup.add(backSlope);

  // Left & Right Gable triangle ends
  const triangleShape = new THREE.Shape();
  triangleShape.moveTo(-depth / 2, 0);
  triangleShape.lineTo(depth / 2, 0);
  triangleShape.lineTo(0, roofHeight);
  triangleShape.closePath();

  const gableGeo = new THREE.ShapeGeometry(triangleShape);
  const leftGable = new THREE.Mesh(gableGeo, blueRoofMat);
  leftGable.position.set(-width / 2, 0, 0);
  leftGable.rotation.y = -Math.PI / 2;
  roofGroup.add(leftGable);

  const rightGable = new THREE.Mesh(gableGeo, blueRoofMat);
  rightGable.position.set(width / 2, 0, 0);
  rightGable.rotation.y = Math.PI / 2;
  roofGroup.add(rightGable);

  // 3. Top Ridge Fin / Crimp
  const finGeo = new THREE.BoxGeometry(width, finHeight, 0.024);
  const fin = new THREE.Mesh(finGeo, blueRoofMat);
  fin.position.set(0, roofHeight + finHeight / 2, 0);
  fin.castShadow = castShadow;
  roofGroup.add(fin);

  // 4. Twist-off Plastic Screw Cap on front roof slope
  const capGroup = new THREE.Group();
  capGroup.position.set(0, roofHeight * 0.55, depth * 0.28);
  capGroup.rotation.x = slopeAngle;

  // Cap base collar
  const collarGeo = new THREE.CylinderGeometry(0.048, 0.052, 0.015, 20);
  const capMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.3,
  });
  const collar = new THREE.Mesh(collarGeo, capMat);
  capGroup.add(collar);

  // Ribbed cap body
  const capGeo = new THREE.CylinderGeometry(0.046, 0.046, 0.035, 20);
  const cap = new THREE.Mesh(capGeo, capMat);
  cap.position.y = 0.022;
  cap.castShadow = castShadow;
  capGroup.add(cap);

  roofGroup.add(capGroup);
  group.add(roofGroup);

  const scale = options.scale ?? 1.0;
  group.scale.set(scale, scale, scale);
  return group;
}
