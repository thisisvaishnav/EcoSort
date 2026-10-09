import * as THREE from 'three';
import { MapItemConfig, MapItemState, PlacementMode } from './types';
import { createItemMesh, disposeItemMesh } from './createItemMesh';

/**
 * Production 3D Map Item Instance.
 * Encapsulates a 3D model placed in the EcoSort city map,
 * with ground contact shadow, collectible floating animations,
 * proximity detection to the player character, and pickup transitions.
 */
export class MapItemInstance {
  public readonly config: MapItemConfig;
  public readonly group: THREE.Group;
  public readonly itemMesh: THREE.Group;
  private contactShadowMesh: THREE.Mesh | null = null;
  private auraRingMesh: THREE.Mesh | null = null;

  private state: MapItemState = {
    isCollected: false,
    isNearPlayer: false,
    distanceToPlayer: Infinity,
    respawnTimer: 0,
  };

  private basePosition: THREE.Vector3;
  private floatOffset = 0;
  private pickupAnimProgress = -1; // -1 = not picking up, 0..1 = pickup animation

  constructor(config: MapItemConfig) {
    this.config = {
      interactionRadius: 2.4,
      respawnTimeSeconds: 0, // 0 = no automatic respawn
      placementMode: 'collectible',
      ...config,
    };

    this.group = new THREE.Group();
    this.group.name = `map_item_${this.config.id}`;

    // Set position
    if (this.config.position instanceof THREE.Vector3) {
      this.basePosition = this.config.position.clone();
    } else {
      this.basePosition = new THREE.Vector3(...this.config.position);
    }
    this.group.position.copy(this.basePosition);

    // Set rotation
    if (this.config.rotation) {
      if (this.config.rotation instanceof THREE.Euler) {
        this.group.rotation.copy(this.config.rotation);
      } else {
        this.group.rotation.set(...this.config.rotation);
      }
    }

    // Set scale
    const scale = this.config.scale ?? 1.0;

    // Create the 3D model
    this.itemMesh = createItemMesh(this.config.modelType, {
      scale,
      castShadow: true,
      receiveShadow: true,
    });
    this.group.add(this.itemMesh);

    // Setup placement enhancements (shadows, beacons, prompts)
    this.setupPlacementMode(this.config.placementMode || 'collectible');
  }

  private setupPlacementMode(mode: PlacementMode) {
    if (mode === 'ground' || mode === 'table') {
      // Soft ambient contact shadow disc under item
      const shadowGeo = new THREE.CircleGeometry(0.28, 20);
      const shadowMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.28,
        depthWrite: false,
      });
      this.contactShadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
      this.contactShadowMesh.rotation.x = -Math.PI / 2;
      this.contactShadowMesh.position.y = 0.02;
      this.group.add(this.contactShadowMesh);
    } else if (mode === 'collectible') {
      // Elevate slightly for hover effect
      this.floatOffset = 0.45;
      this.itemMesh.position.y = this.floatOffset;

      // Pulsing collectible ground ring underneath
      const ringGeo = new THREE.RingGeometry(0.36, 0.45, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      this.auraRingMesh = new THREE.Mesh(ringGeo, ringMat);
      this.auraRingMesh.rotation.x = -Math.PI / 2;
      this.auraRingMesh.position.y = 0.04;
      this.group.add(this.auraRingMesh);

      // Contact shadow disc on floor
      const shadowGeo = new THREE.CircleGeometry(0.24, 16);
      const shadowMat = new THREE.MeshBasicMaterial({
        color: 0x090d16,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
      });
      this.contactShadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
      this.contactShadowMesh.rotation.x = -Math.PI / 2;
      this.contactShadowMesh.position.y = 0.02;
      this.group.add(this.contactShadowMesh);
    }
  }

  /**
   * Update animation loop (bobbing, spinning, proximity check, pickup transitions)
   */
  public update(time: number, delta: number, playerPos?: THREE.Vector3): void {
    if (this.state.isCollected) {
      // Check respawn timer if configured
      if (this.config.respawnTimeSeconds && this.config.respawnTimeSeconds > 0) {
        this.state.respawnTimer += delta;
        if (this.state.respawnTimer >= this.config.respawnTimeSeconds) {
          this.respawn();
        }
      }
      return;
    }

    // Pickup animation progression
    if (this.pickupAnimProgress >= 0) {
      this.pickupAnimProgress += delta * 3.5; // finishes in ~0.3s
      if (this.pickupAnimProgress >= 1.0) {
        this.pickupAnimProgress = -1;
        this.state.isCollected = true;
        this.group.visible = false;
        if (this.config.onPickup) {
          this.config.onPickup(this.config);
        }
        return;
      }
      // Pickup animation: rise up, spin quickly, scale down
      const t = this.pickupAnimProgress;
      this.itemMesh.position.y = this.floatOffset + t * 1.2;
      this.itemMesh.rotation.y += delta * 12;
      const s = Math.max(0, 1.0 - t * t);
      this.itemMesh.scale.set(s, s, s);
      return;
    }

    // Normal Idle / Collectible Animations
    if (this.config.placementMode === 'collectible') {
      // Gentle sine bobbing
      const bob = Math.sin(time * 2.5 + this.basePosition.x * 0.5) * 0.08;
      this.itemMesh.position.y = this.floatOffset + bob;

      // Slow idle spin
      this.itemMesh.rotation.y += delta * 0.9;

      // Pulse ground ring
      if (this.auraRingMesh) {
        const ringPulse = 1.0 + Math.sin(time * 4) * 0.12;
        this.auraRingMesh.scale.set(ringPulse, ringPulse, ringPulse);
      }
    }

    // Proximity detection if player position provided
    if (playerPos) {
      const dist = this.group.position.distanceTo(playerPos);
      this.state.distanceToPlayer = dist;
      const wasNear = this.state.isNearPlayer;
      const radius = this.config.interactionRadius || 2.4;
      this.state.isNearPlayer = dist <= radius;

      // Visual reaction when player approaches
      if (this.state.isNearPlayer && !wasNear) {
        if (this.auraRingMesh) {
          (this.auraRingMesh.material as THREE.MeshBasicMaterial).color.setHex(0xfacc15); // Turn golden
        }
      } else if (!this.state.isNearPlayer && wasNear) {
        if (this.auraRingMesh) {
          (this.auraRingMesh.material as THREE.MeshBasicMaterial).color.setHex(0x38bdf8); // Return to cyan
        }
      }
    }
  }

  /**
   * Triggers item collection with pickup animation
   */
  public collect(): void {
    if (this.state.isCollected || this.pickupAnimProgress >= 0) return;
    this.pickupAnimProgress = 0;
  }

  /**
   * Respawns the item back into the world
   */
  public respawn(): void {
    this.state.isCollected = false;
    this.state.respawnTimer = 0;
    this.pickupAnimProgress = -1;
    this.group.visible = true;
    const baseScale = this.config.scale ?? 1.0;
    this.itemMesh.scale.set(baseScale, baseScale, baseScale);
    this.itemMesh.position.y = this.floatOffset;
  }

  public getState(): Readonly<MapItemState> {
    return this.state;
  }

  /**
   * Disposes all Three.js geometries and materials
   */
  public dispose(): void {
    disposeItemMesh(this.group);
    if (this.contactShadowMesh) {
      this.contactShadowMesh.geometry.dispose();
      (this.contactShadowMesh.material as THREE.Material).dispose();
    }
    if (this.auraRingMesh) {
      this.auraRingMesh.geometry.dispose();
      (this.auraRingMesh.material as THREE.Material).dispose();
    }
  }
}
