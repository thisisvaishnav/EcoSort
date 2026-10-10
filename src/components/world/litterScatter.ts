/**
 * Litter Scatter System — Level 1 "Waste Detective"
 *
 * Places 3D item meshes around the Society scene, handles proximity-based
 * pickup detection, item carry state, and bin-drop interactions.
 */

import * as THREE from 'three';
import { ItemData } from '../../types/game';
import { createItemMesh, disposeItemMesh } from './items/createItemMesh';

export interface ScatteredItem {
  itemData: ItemData;
  mesh: THREE.Group;
  position: THREE.Vector3;
  isHidden: boolean;      // behind bench or plant
  isPickedUp: boolean;
  isInBin: boolean;
  wrongAttempts: number;  // count of wrong bin attempts for this item
}

export interface LitterScatterSystem {
  items: ScatteredItem[];
  group: THREE.Group;
  update: (playerPos: THREE.Vector3, elapsed: number, delta: number) => void;
  getNearestPickupItem: (pos: THREE.Vector3, radius: number) => ScatteredItem | null;
  pickUp: (item: ScatteredItem) => void;
  dropToGround: (item: ScatteredItem) => void;
  markInBin: (item: ScatteredItem) => void;
  getHeldItem: () => ScatteredItem | null;
  getRemainingCount: () => number;
  getCollectedCount: () => number;
  dispose: () => void;
}

/**
 * Shuffle array in place (Fisher-Yates).
 */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Create the litter scatter system.
 *
 * @param itemPool        – Level 1 items to scatter (will be randomly sampled)
 * @param visiblePoints   – THREE.Vector3 positions for visible litter
 * @param hiddenPoints    – THREE.Vector3 positions for hidden litter
 * @param parentGroup     – THREE.Group to add item meshes into
 * @param totalCount      – How many items to scatter (default 12)
 */
export function createLitterScatter(
  itemPool: ItemData[],
  visiblePoints: THREE.Vector3[],
  hiddenPoints: THREE.Vector3[],
  parentGroup: THREE.Group,
  totalCount = 12
): LitterScatterSystem {
  const itemsGroup = new THREE.Group();
  itemsGroup.name = 'litter_scatter';
  parentGroup.add(itemsGroup);

  const scattered: ScatteredItem[] = [];
  let heldItem: ScatteredItem | null = null;

  // ── Sample items from pool ensuring each bin type appears ──────────────
  const pool = shuffle([...itemPool]);
  const selected = pool.slice(0, totalCount);

  // ── Spread across visible + hidden spawn points ─────────────────────────
  const visPoints = shuffle([...visiblePoints]);
  const hidPoints = shuffle([...hiddenPoints]);

  const hiddenCount = Math.min(hidPoints.length, 3);
  const visibleCount = totalCount - hiddenCount;

  selected.forEach((itemData, i) => {
    const isHidden = i >= visibleCount;
    const spawnPos = isHidden
      ? (hidPoints[i - visibleCount] ?? visPoints[i] ?? new THREE.Vector3(0, 0.05, 0))
      : (visPoints[i] ?? new THREE.Vector3(i * 1.5 - 5, 0.05, 0));

    const mesh = createItemMesh(itemData.modelType, {
      scale: 0.85,
      castShadow: true,
      receiveShadow: true,
    });

    // Flatten onto ground
    mesh.position.copy(spawnPos);
    mesh.position.y = 0.05;

    // Random rotation for natural scatter look
    mesh.rotation.y = Math.random() * Math.PI * 2;
    mesh.rotation.x = (Math.random() - 0.5) * 0.3;
    mesh.rotation.z = (Math.random() - 0.5) * 0.3;

    if (isHidden) {
      // Reduce opacity for hidden items until discovered
      mesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => {
              m.transparent = true;
              m.opacity = 0.15;
            });
          } else {
            child.material.transparent = true;
            child.material.opacity = 0.15;
          }
        }
      });
    }

    itemsGroup.add(mesh);

    scattered.push({
      itemData,
      mesh,
      position: spawnPos.clone(),
      isHidden,
      isPickedUp: false,
      isInBin: false,
      wrongAttempts: 0,
    });
  });

  // ── Hover/rotation animation state ────────────────────────────────────────
  const baseY = scattered.map((s) => s.mesh.position.y);

  function update(playerPos: THREE.Vector3, elapsed: number, _delta: number) {
    scattered.forEach((item, idx) => {
      if (item.isPickedUp || item.isInBin) return;

      // Hover + rotation idle animation
      item.mesh.position.y = baseY[idx] + 0.06 * Math.sin(elapsed * 1.8 + idx * 0.7);
      item.mesh.rotation.y += 0.012;

      const dist = playerPos.distanceTo(item.position);

      // Reveal hidden items on approach
      if (item.isHidden) {
        const revealOpacity = dist < 2.0 ? 1.0 : dist < 3.5 ? THREE.MathUtils.lerp(0.15, 1.0, (3.5 - dist) / 1.5) : 0.15;
        item.mesh.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (Array.isArray(child.material)) {
              child.material.forEach((m) => { m.opacity = revealOpacity; });
            } else {
              child.material.opacity = revealOpacity;
            }
          }
        });
      }

      // Glow outline when close enough to pick up
      const glowColor = dist < 1.5 ? 0xfbbf24 : null;
      item.mesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach((m) => {
            if (m instanceof THREE.MeshStandardMaterial) {
              m.emissive = new THREE.Color(glowColor ?? 0x000000);
              m.emissiveIntensity = glowColor ? 0.35 + 0.15 * Math.sin(elapsed * 4) : 0;
            }
          });
        }
      });
    });

    // Follow player when picked up (attach to hand position)
    if (heldItem) {
      const handPos = playerPos.clone().add(new THREE.Vector3(0.4, 1.1, -0.3));
      heldItem.mesh.position.lerp(handPos, 0.18);
      heldItem.mesh.rotation.y += 0.04;
    }
  }

  function getNearestPickupItem(pos: THREE.Vector3, radius: number): ScatteredItem | null {
    let nearest: ScatteredItem | null = null;
    let minDist = radius;

    for (const item of scattered) {
      if (item.isPickedUp || item.isInBin) continue;
      const dist = pos.distanceTo(item.position);
      if (dist < minDist) {
        minDist = dist;
        nearest = item;
      }
    }
    return nearest;
  }

  function pickUp(item: ScatteredItem) {
    if (item.isPickedUp || item.isInBin) return;
    item.isPickedUp = true;
    heldItem = item;

    // Scale up slightly when picked up
    item.mesh.scale.setScalar(1.05);

    // Fully reveal (in case hidden)
    item.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => { m.opacity = 1; });
        } else {
          child.material.opacity = 1;
        }
      }
    });
  }

  function dropToGround(item: ScatteredItem) {
    item.isPickedUp = false;
    // Return to original position
    item.mesh.position.copy(item.position);
    item.mesh.position.y = baseY[scattered.indexOf(item)] ?? 0.05;
    item.mesh.scale.setScalar(0.85);
    if (heldItem === item) heldItem = null;
  }

  function markInBin(item: ScatteredItem) {
    item.isPickedUp = false;
    item.isInBin = true;
    if (heldItem === item) heldItem = null;

    // Fly into bin — just hide it
    item.mesh.visible = false;
  }

  function getHeldItem() {
    return heldItem;
  }

  function getRemainingCount() {
    return scattered.filter((i) => !i.isInBin).length;
  }

  function getCollectedCount() {
    return scattered.filter((i) => i.isInBin).length;
  }

  function dispose() {
    scattered.forEach((item) => {
      itemsGroup.remove(item.mesh);
      disposeItemMesh(item.mesh);
    });
    parentGroup.remove(itemsGroup);
  }

  return {
    items: scattered,
    group: itemsGroup,
    update,
    getNearestPickupItem,
    pickUp,
    dropToGround,
    markInBin,
    getHeldItem,
    getRemainingCount,
    getCollectedCount,
    dispose,
  };
}
