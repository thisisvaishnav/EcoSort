import * as THREE from 'three';
import { ItemMeshOptions } from '../types';

/**
 * Creates a detailed 3D model of an incandescent Light Bulb.
 * Features a transparent teardrop glass envelope,
 * internal glowing tungsten filament coil with support wires,
 * threaded metallic screw base (Edison E27), and bottom contact bead.
 */
export function createLightBulb3D(options: ItemMeshOptions = {}): THREE.Group {
  const group = new THREE.Group();
  group.name = 'light_bulb';

  const castShadow = options.castShadow ?? true;
  const receiveShadow = options.receiveShadow ?? true;

  // 1. Threaded Metallic Screw Base (Bottom)
  const baseGroup = new THREE.Group();

  const screwMetalMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8, // Brushed aluminum/silver
    metalness: 0.85,
    roughness: 0.3,
  });

  const baseCylinderGeo = new THREE.CylinderGeometry(0.10, 0.10, 0.16, 24);
  const baseCylinder = new THREE.Mesh(baseCylinderGeo, screwMetalMat);
  baseCylinder.position.y = 0.10;
  baseCylinder.castShadow = castShadow;
  baseGroup.add(baseCylinder);

  // Thread rings (3 ridged rings around screw base)
  const threadGeo = new THREE.TorusGeometry(0.102, 0.014, 8, 24);
  for (let t = 0; t < 3; t++) {
    const thread = new THREE.Mesh(threadGeo, screwMetalMat);
    thread.rotation.x = Math.PI / 2;
    thread.position.y = 0.05 + t * 0.05;
    baseGroup.add(thread);
  }

  // Black bottom contact bead
  const contactBeadGeo = new THREE.SphereGeometry(0.045, 12, 12);
  contactBeadGeo.scale(1, 0.4, 1);
  const contactBeadMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.6,
  });
  const contactBead = new THREE.Mesh(contactBeadGeo, contactBeadMat);
  contactBead.position.y = 0.018;
  baseGroup.add(contactBead);

  group.add(baseGroup);

  // 2. Internal Mount & Filament Structure
  const internalGroup = new THREE.Group();
  internalGroup.position.y = 0.18;

  // Central glass stem mount
  const stemGeo = new THREE.CylinderGeometry(0.025, 0.035, 0.14, 12);
  const stemMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.6,
  });
  const stem = new THREE.Mesh(stemGeo, stemMat);
  stem.position.y = 0.07;
  internalGroup.add(stem);

  // 2 Lead Wires (Angling up in a 'V' shape)
  const wireMat = new THREE.MeshStandardMaterial({
    color: 0xd1d5db,
    metalness: 0.9,
    roughness: 0.2,
  });
  const wireGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.15, 6);

  const leftWire = new THREE.Mesh(wireGeo, wireMat);
  leftWire.position.set(-0.03, 0.18, 0);
  leftWire.rotation.z = -0.15;
  internalGroup.add(leftWire);

  const rightWire = new THREE.Mesh(wireGeo, wireMat);
  rightWire.position.set(0.03, 0.18, 0);
  rightWire.rotation.z = 0.15;
  internalGroup.add(rightWire);

  // Glowing Coiled Tungsten Filament
  const filamentCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.04, 0.25, 0),
    new THREE.Vector3(-0.02, 0.28, 0.01),
    new THREE.Vector3(0, 0.29, 0),
    new THREE.Vector3(0.02, 0.28, -0.01),
    new THREE.Vector3(0.04, 0.25, 0),
  ]);
  const filamentGeo = new THREE.TubeGeometry(filamentCurve, 16, 0.008, 6, false);
  const filamentMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xfbbf24,
    emissiveIntensity: 1.4,
    roughness: 0.2,
  });
  const filament = new THREE.Mesh(filamentGeo, filamentMat);
  internalGroup.add(filament);

  // Warm Filament Glow PointLight
  const bulbLight = new THREE.PointLight(0xfef08a, 0.6, 2.5);
  bulbLight.position.set(0, 0.27, 0);
  internalGroup.add(bulbLight);

  group.add(internalGroup);

  // 3. Teardrop Glass Envelope (Lathe Profile)
  const glassPoints: THREE.Vector2[] = [];
  glassPoints.push(new THREE.Vector2(0.10, 0.18));  // neck start
  glassPoints.push(new THREE.Vector2(0.11, 0.24));
  glassPoints.push(new THREE.Vector2(0.15, 0.32));  // flare outward
  glassPoints.push(new THREE.Vector2(0.20, 0.40));
  glassPoints.push(new THREE.Vector2(0.22, 0.48));  // widest bulbous part
  glassPoints.push(new THREE.Vector2(0.20, 0.56));
  glassPoints.push(new THREE.Vector2(0.14, 0.62));
  glassPoints.push(new THREE.Vector2(0.06, 0.66));
  glassPoints.push(new THREE.Vector2(0.0, 0.67));   // rounded apex

  const glassGeo = new THREE.LatheGeometry(glassPoints, 28);
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xf8fafc,
    transparent: true,
    opacity: 0.38,
    roughness: 0.08,
    metalness: 0.05,
    transmission: 0.85,
    ior: 1.5,
    reflectivity: 0.9,
  });

  const glassMesh = new THREE.Mesh(glassGeo, glassMat);
  glassMesh.castShadow = false; // transparent glass lets light through
  glassMesh.receiveShadow = receiveShadow;
  group.add(glassMesh);

  const scale = options.scale ?? 1.0;
  group.scale.set(scale, scale, scale);
  return group;
}
