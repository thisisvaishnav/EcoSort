import { BinType } from '../types/game';

/**
 * 3D Coordinate triplet (serializable, Three.js compatible)
 */
export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

/**
 * Walkable or bounding rectangle in metres
 */
export interface WorldBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

/**
 * Fixed camera position and look-at target
 */
export interface CameraAnchor {
  position: Vector3D;
  target: Vector3D;
  fov?: number;
}

/**
 * Player spawn point and orientation
 */
export interface PlayerStartAnchor {
  position: Vector3D;
  rotationY: number; // Y-axis rotation in radians
}

/**
 * Waste pile location and scattering bounds
 */
export interface WastePileAnchor {
  center: Vector3D;
  radius: number;
}

export interface ItemSpawnRegion {
  center: Vector3D;
  radius: number;
  scatterCount: number;
  customPoints?: Vector3D[];
}

/**
 * 4 temporary sorting sack anchors
 */
export interface SackPositions {
  wet: Vector3D;
  dry: Vector3D;
  hazardous: Vector3D;
  residual: Vector3D;
}

/**
 * Dustbin installation candidate spot with validation metadata
 */
export interface BinSpotCandidate {
  id: string;
  label: string;
  position: Vector3D;
  isCorrect: boolean;
  scoreBonus: number;
  explanation: string;
}

/**
 * Eco Lens scanning hotspot
 */
export interface EcoHotspotAnchor {
  id: string;
  title: string;
  position: Vector3D;
  description: string;
  impact: string;
  action: string;
}

/**
 * Resident NPC anchor for Mission 3
 */
export interface ResidentAnchor {
  id: string;
  name: string;
  role: string;
  entryPosition: Vector3D;
  standPosition: Vector3D;
  dialogueKey: string;
}

/**
 * Collision volume definition
 */
export interface CollisionShape {
  id: string;
  type: 'building' | 'fence' | 'water' | 'prop';
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

/**
 * Visual states hook configuration (Dirty, Clean, Revived)
 */
export interface VisualStatesAnchor {
  state0Dirty: {
    groundColor: string | number;
    pestDensity: number;
  };
  state1Clean: {
    groundColor: string | number;
    pestDensity: number;
  };
  state2Revived: {
    groundColor: string | number;
    flowerBloom: boolean;
    butterflies: boolean;
  };
}

/**
 * Frozen World Manifest Contract (Eco Hero Kai / Society World Specification)
 */
export interface WorldManifest {
  id: string;
  name: string;
  version: string;
  bounds: WorldBounds;
  playerStart: PlayerStartAnchor;
  introCamera: CameraAnchor;
  cinematicCamera: CameraAnchor;
  pile: WastePileAnchor;
  itemSpawnRegion: ItemSpawnRegion;
  sackPositions: SackPositions;
  truckSpawn: Vector3D;
  truckRoute: Vector3D[];
  truckStop: Vector3D;
  gardenBounds: WorldBounds;
  plantSlots: Vector3D[];
  binSpots: BinSpotCandidate[];
  ecoHotspots: EcoHotspotAnchor[];
  residentEntry: Vector3D;
  residentStandPoint: Vector3D;
  residents: ResidentAnchor[];
  collision: CollisionShape[];
  visualStates: VisualStatesAnchor;
  timerSeconds: number;
  activeBins: BinType[];
  contentNamespace: string;
  audioPrefix: string;
  saveNamespace: string;
}

/**
 * World Registry item contract
 */
export interface WorldRegistryEntry {
  id: string;
  displayName: string;
  buttonIcon: string;
  buttonTestId: string;
  badgeText?: string;
  sceneLoader: () => Promise<unknown>;
  featureFlag: () => boolean;
  description: string;
}
