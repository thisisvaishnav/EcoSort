import * as THREE from 'three';
import { SOCIETY_MANIFEST } from '../manifest';

export interface SocietyPropsResult {
  group: THREE.Group;
  hotspotMeshes: Map<string, THREE.Group>;
  sackMeshes: Map<string, THREE.Mesh>;
  decorMeshes: THREE.Group[];
}

/**
 * Creates 3D props for Society World:
 * - 4 Eco Lens narrative hotspots
 * - 4 Temporary Sorting Sacks
 * - Park benches, street lamps, and playground equipment
 */
export function createSocietyProps(): SocietyPropsResult {
  const group = new THREE.Group();
  group.name = 'society_props_root';

  const hotspotMeshes = new Map<string, THREE.Group>();
  const sackMeshes = new Map<string, THREE.Mesh>();
  const decorMeshes: THREE.Group[] = [];

  // ── 1. Park Benches ─────────────────────────────────────────────────────────
  function createBench(x: number, z: number, rotationY = 0): THREE.Group {
    const bench = new THREE.Group();
    bench.name = 'society_bench';

    // Wood seat
    const seatGeo = new THREE.BoxGeometry(2.0, 0.1, 0.5);
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.8 });
    const seat = new THREE.Mesh(seatGeo, woodMat);
    seat.position.set(0, 0.45, 0);

    // Backrest
    const backGeo = new THREE.BoxGeometry(2.0, 0.4, 0.08);
    const back = new THREE.Mesh(backGeo, woodMat);
    back.position.set(0, 0.8, -0.22);

    // Metal legs
    const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.45);
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
    const leg1 = new THREE.Mesh(legGeo, metalMat);
    leg1.position.set(-0.8, 0.225, -0.18);
    const leg2 = new THREE.Mesh(legGeo, metalMat);
    leg2.position.set(0.8, 0.225, -0.18);
    const leg3 = new THREE.Mesh(legGeo, metalMat);
    leg3.position.set(-0.8, 0.225, 0.18);
    const leg4 = new THREE.Mesh(legGeo, metalMat);
    leg4.position.set(0.8, 0.225, 0.18);

    bench.add(seat, back, leg1, leg2, leg3, leg4);
    bench.position.set(x, 0, z);
    bench.rotation.y = rotationY;
    group.add(bench);
    decorMeshes.push(bench);
    return bench;
  }

  createBench(-2.5, 6, Math.PI / 2);
  createBench(2.5, 6, -Math.PI / 2);
  createBench(-8, 3, 0);

  // ── 2. Street Lamps ─────────────────────────────────────────────────────────
  function createLampPost(x: number, z: number): THREE.Group {
    const lamp = new THREE.Group();
    lamp.name = 'society_lamp_post';

    const poleGeo = new THREE.CylinderGeometry(0.08, 0.12, 3.8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.set(0, 1.9, 0);

    const headGeo = new THREE.SphereGeometry(0.35, 12, 8);
    const headMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(0, 3.8, 0);

    const pointLight = new THREE.PointLight(0xfef08a, 0.8, 8);
    pointLight.position.set(0, 3.8, 0);

    lamp.add(pole, head, pointLight);
    lamp.position.set(x, 0, z);
    group.add(lamp);
    decorMeshes.push(lamp);
    return lamp;
  }

  createLampPost(12, 10);
  createLampPost(12, -4);
  createLampPost(-3, 10);

  // ── 3. Temporary Sorting Sacks (4 Sacks for Mission 1) ───────────────────────
  const sackColors: Record<string, number> = {
    wet: 0x10b981,        // emerald green
    dry: 0x3b82f6,        // blue
    hazardous: 0xef4444,  // red
    residual: 0x334155,   // slate
  };

  for (const [binKey, pos] of Object.entries(SOCIETY_MANIFEST.sackPositions)) {
    const sackGeo = new THREE.CylinderGeometry(0.4, 0.5, 0.7, 10);
    const sackMat = new THREE.MeshStandardMaterial({
      color: sackColors[binKey] ?? 0x64748b,
      roughness: 0.8,
    });
    const sack = new THREE.Mesh(sackGeo, sackMat);
    sack.position.set(pos.x, 0.35, pos.z);
    sack.name = `society_sack_${binKey}`;
    sack.castShadow = true;
    group.add(sack);
    sackMeshes.set(binKey, sack);
  }

  // ── 4. Eco Lens Narrative Hotspot Props ───────────────────────────────────────
  // 1. Food Waste Heap
  const foodHotspot = new THREE.Group();
  foodHotspot.name = 'hotspot_food_waste_mesh';
  const foodHeapGeo = new THREE.DodecahedronGeometry(0.6);
  const foodHeapMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
  const foodHeap = new THREE.Mesh(foodHeapGeo, foodHeapMat);
  foodHeap.position.set(0, 0.3, 0);
  foodHotspot.add(foodHeap);
  foodHotspot.position.set(
    SOCIETY_MANIFEST.ecoHotspots[0].position.x,
    SOCIETY_MANIFEST.ecoHotspots[0].position.y,
    SOCIETY_MANIFEST.ecoHotspots[0].position.z
  );
  group.add(foodHotspot);
  hotspotMeshes.set('hotspot_food_waste', foodHotspot);

  // 2. Standing Water Puddle
  const waterHotspot = new THREE.Group();
  waterHotspot.name = 'hotspot_standing_water_mesh';
  const puddleGeo = new THREE.CircleGeometry(0.9, 12);
  puddleGeo.rotateX(-Math.PI / 2);
  const puddleMat = new THREE.MeshStandardMaterial({
    color: 0x0369a1,
    roughness: 0.1,
    metalness: 0.8,
  });
  const puddle = new THREE.Mesh(puddleGeo, puddleMat);
  puddle.position.set(0, 0.02, 0);
  waterHotspot.add(puddle);
  waterHotspot.position.set(
    SOCIETY_MANIFEST.ecoHotspots[1].position.x,
    SOCIETY_MANIFEST.ecoHotspots[1].position.y,
    SOCIETY_MANIFEST.ecoHotspots[1].position.z
  );
  group.add(waterHotspot);
  hotspotMeshes.set('hotspot_standing_water', waterHotspot);

  // 3. Damaged Plants & Battery Leachate
  const plantHotspot = new THREE.Group();
  plantHotspot.name = 'hotspot_damaged_plants_mesh';
  const dryBushGeo = new THREE.ConeGeometry(0.4, 0.8, 6);
  const dryBushMat = new THREE.MeshStandardMaterial({ color: 0x854d0e });
  const dryBush = new THREE.Mesh(dryBushGeo, dryBushMat);
  dryBush.position.set(0, 0.4, 0);
  plantHotspot.add(dryBush);
  plantHotspot.position.set(
    SOCIETY_MANIFEST.ecoHotspots[2].position.x,
    SOCIETY_MANIFEST.ecoHotspots[2].position.y,
    SOCIETY_MANIFEST.ecoHotspots[2].position.z
  );
  group.add(plantHotspot);
  hotspotMeshes.set('hotspot_damaged_plants', plantHotspot);

  // 4. Littered Drain
  const drainHotspot = new THREE.Group();
  drainHotspot.name = 'hotspot_littered_drain_mesh';
  const grateGeo = new THREE.BoxGeometry(0.9, 0.08, 0.9);
  const grateMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 });
  const grate = new THREE.Mesh(grateGeo, grateMat);
  grate.position.set(0, 0.04, 0);
  drainHotspot.add(grate);
  drainHotspot.position.set(
    SOCIETY_MANIFEST.ecoHotspots[3].position.x,
    SOCIETY_MANIFEST.ecoHotspots[3].position.y,
    SOCIETY_MANIFEST.ecoHotspots[3].position.z
  );
  group.add(drainHotspot);
  hotspotMeshes.set('hotspot_littered_drain', drainHotspot);

  return {
    group,
    hotspotMeshes,
    sackMeshes,
    decorMeshes,
  };
}
