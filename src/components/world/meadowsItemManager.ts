import * as THREE from 'three';
import { ItemData } from '../../types/game';
import { createItemMesh, disposeItemMesh } from './items/createItemMesh';
import { MEADOWS_PHASE5_ITEMS } from '../game/meadows/meadowsPhase5Data';
import { MEADOWS_WASTE_PILE_CENTER } from './meadowsScene';

export interface MeadowsGroundItem {
  id: string;
  itemData: ItemData;
  mesh: THREE.Group;
  initialPosition: THREE.Vector3;
  currentPosition: THREE.Vector3;
  isSorted: boolean;
  isPickedUp: boolean;
  wrongAttempts: number;
}

export interface MeadowsItemManager {
  group: THREE.Group;
  items: MeadowsGroundItem[];
  update: (playerPos: THREE.Vector3, elapsed: number, delta: number) => void;
  getNearestItem: (playerPos: THREE.Vector3, maxRadius?: number) => MeadowsGroundItem | null;
  pickUpItem: (itemId: string) => MeadowsGroundItem | null;
  dropItem: (itemId: string) => void;
  sortItem: (itemId: string, binPosition?: THREE.Vector3) => void;
  getHeldItem: () => MeadowsGroundItem | null;
  reset: () => void;
  dispose: () => void;
}

/**
 * Creates and manages the 10 ground waste items scattered around the waste pile in Green Meadows.
 */
export function createMeadowsItemManager(): MeadowsItemManager {
  const group = new THREE.Group();
  group.name = 'meadows_phase5_ground_items';

  const items: MeadowsGroundItem[] = [];

  // 10 offsets around MEADOWS_WASTE_PILE_CENTER (-6.0, 0.05, 4.0)
  // Ensures all 10 items are clustered in the mud pile area but distinguishable
  const offsets = [
    { x: -1.2, z: -0.9 },
    { x: -0.6, z: 0.8 },
    { x: 0.8, z: -0.7 },
    { x: 1.1, z: 0.6 },
    { x: -1.4, z: 0.3 },
    { x: 0.2, z: -1.2 },
    { x: 0.4, z: 1.1 },
    { x: -0.3, z: -0.2 },
    { x: 1.3, z: -0.2 },
    { x: -0.8, z: 1.2 },
  ];

  // Spawn each item
  MEADOWS_PHASE5_ITEMS.forEach((itemData, idx) => {
    const offset = offsets[idx % offsets.length];
    const spawnPos = new THREE.Vector3(
      MEADOWS_WASTE_PILE_CENTER.x + offset.x,
      0.05,
      MEADOWS_WASTE_PILE_CENTER.z + offset.z
    );

    const mesh = createItemMesh(itemData.modelType, {
      scale: 0.9,
      castShadow: true,
      receiveShadow: true,
    });
    mesh.position.copy(spawnPos);
    mesh.rotation.y = Math.random() * Math.PI * 2;
    group.add(mesh);

    // Glowing base ring on ground beneath each item
    const ringGeo = new THREE.RingGeometry(0.2, 0.35, 16);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.name = 'highlight_ring';
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.set(0, 0.01, 0);
    mesh.add(ringMesh);

    items.push({
      id: itemData.id,
      itemData,
      mesh,
      initialPosition: spawnPos.clone(),
      currentPosition: spawnPos.clone(),
      isSorted: false,
      isPickedUp: false,
      wrongAttempts: 0,
    });
  });

  function update(playerPos: THREE.Vector3, elapsed: number, _delta: number) {
    items.forEach((item, idx) => {
      if (item.isSorted || item.isPickedUp) return;

      // Gentle floating bob & slow rotation
      item.mesh.position.y = 0.05 + Math.sin(elapsed * 2.2 + idx * 0.8) * 0.04;
      item.mesh.rotation.y += 0.01;

      // Proximity glow
      const dist = playerPos.distanceTo(item.initialPosition);
      const isNearby = dist <= 1.8;

      const ring = item.mesh.getObjectByName('highlight_ring') as THREE.Mesh | undefined;
      if (ring && ring.material instanceof THREE.MeshBasicMaterial) {
        ring.material.opacity = isNearby ? 0.8 + Math.sin(elapsed * 5) * 0.2 : 0.35;
        ring.material.color.setHex(isNearby ? 0x10b981 : 0xf59e0b);
      }
    });

    // Follow player hand when picked up (like Mission 1 litterScatter)
    if (heldItem) {
      heldItem.mesh.position.set(playerPos.x + 0.35, playerPos.y + 1.1, playerPos.z - 0.25);
      heldItem.mesh.rotation.y += 0.03;
    }
  }

  let heldItem: MeadowsGroundItem | null = null;

  function getHeldItem(): MeadowsGroundItem | null {
    return heldItem;
  }

  function getNearestItem(playerPos: THREE.Vector3, maxRadius = 1.8): MeadowsGroundItem | null {
    let nearest: MeadowsGroundItem | null = null;
    let minDist = maxRadius;

    for (const item of items) {
      if (item.isSorted || item.isPickedUp) continue;
      const dist = playerPos.distanceTo(item.initialPosition);
      if (dist < minDist) {
        minDist = dist;
        nearest = item;
      }
    }
    return nearest;
  }

  function pickUpItem(itemId: string): MeadowsGroundItem | null {
    const item = items.find((i) => i.id === itemId);
    if (!item || item.isSorted || heldItem) return null;
    item.isPickedUp = true;
    item.mesh.visible = true;
    item.mesh.scale.setScalar(1.05);
    const ring = item.mesh.getObjectByName('highlight_ring');
    if (ring) ring.visible = false;
    heldItem = item;
    return item;
  }

  function dropItem(itemId: string) {
    const item = items.find((i) => i.id === itemId);
    if (!item || item.isSorted) return;
    item.isPickedUp = false;
    item.mesh.position.copy(item.initialPosition);
    item.mesh.scale.setScalar(0.9);
    item.mesh.visible = true;
    const ring = item.mesh.getObjectByName('highlight_ring');
    if (ring) ring.visible = true;
    if (heldItem === item) heldItem = null;
  }

  function sortItem(itemId: string, binPosition?: THREE.Vector3) {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    item.isSorted = true;
    item.isPickedUp = false;
    item.mesh.visible = false;
    if (binPosition) {
      item.currentPosition.copy(binPosition);
    }
    if (heldItem === item) heldItem = null;
  }

  function reset() {
    heldItem = null;
    items.forEach((item) => {
      item.isSorted = false;
      item.isPickedUp = false;
      item.wrongAttempts = 0;
      item.mesh.position.copy(item.initialPosition);
      item.mesh.scale.setScalar(0.9);
      item.mesh.visible = true;
      const ring = item.mesh.getObjectByName('highlight_ring');
      if (ring) ring.visible = true;
    });
  }

  function dispose() {
    items.forEach((item) => {
      disposeItemMesh(item.mesh);
    });
    group.clear();
    heldItem = null;
  }

  return {
    group,
    items,
    update,
    getNearestItem,
    pickUpItem,
    dropItem,
    sortItem,
    getHeldItem,
    reset,
    dispose,
  };
}
