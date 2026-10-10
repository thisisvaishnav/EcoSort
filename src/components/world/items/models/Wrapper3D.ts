import * as THREE from 'three';
import { ItemMeshOptions } from '../types';

/**
 * Creates a 3D model of a crumpled candy wrapper (residual waste).
 * Simple foil-like crinkled appearance with bright color.
 */
export function createWrapper3D(options: ItemMeshOptions = {}): THREE.Group {
  const group = new THREE.Group();
  group.name = 'wrapper';

  const castShadow = options.castShadow ?? true;
  const receiveShadow = options.receiveShadow ?? true;

  const foilMat = new THREE.MeshStandardMaterial({
    color: 0xf472b6,
    roughness: 0.3,
    metalness: 0.5,
  });

  const accentMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    roughness: 0.25,
    metalness: 0.6,
  });

  // Main crumpled body — squished ellipsoid
  const bodyGeo = new THREE.SphereGeometry(0.16, 12, 8);
  bodyGeo.scale(1.6, 0.55, 0.9);
  const body = new THREE.Mesh(bodyGeo, foilMat);
  body.position.set(0, 0.1, 0);
  body.rotation.y = 0.4;
  body.castShadow = castShadow;
  body.receiveShadow = receiveShadow;
  group.add(body);

  // Twisted ends
  const twistGeo = new THREE.CylinderGeometry(0.03, 0.05, 0.1, 6);
  const twistL = new THREE.Mesh(twistGeo, accentMat);
  twistL.position.set(-0.22, 0.1, 0);
  twistL.rotation.z = Math.PI / 2;
  twistL.castShadow = castShadow;
  group.add(twistL);

  const twistR = new THREE.Mesh(twistGeo, accentMat);
  twistR.position.set(0.22, 0.1, 0);
  twistR.rotation.z = Math.PI / 2;
  twistR.castShadow = castShadow;
  group.add(twistR);

  // Stripe detail on body
  const stripeGeo = new THREE.BoxGeometry(0.28, 0.06, 0.18);
  const stripeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
  const stripe = new THREE.Mesh(stripeGeo, stripeMat);
  stripe.position.set(0, 0.13, 0);
  group.add(stripe);

  const scale = options.scale ?? 1.0;
  group.scale.set(scale, scale, scale);
  return group;
}
