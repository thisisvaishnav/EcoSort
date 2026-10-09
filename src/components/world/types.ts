import * as THREE from 'three';
import { BinType } from '../../types/game';

export interface WorldObstacle {
  id: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  type: 'building' | 'fence' | 'water' | 'prop';
}

export interface LevelStation {
  id: number;
  name: string;
  place: string;
  position: THREE.Vector3;
  tablePosition: THREE.Vector3;
  cameraPosition: THREE.Vector3;
  bins: BinType[];
  targetCount: number;
  description: string;
  markerColor: string;
}

export type WorldMode = 'EXPLORE' | 'STATION_SORT';

export interface LocomotionState {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  targetHeading: number;
  currentHeading: number;
  isMoving: boolean;
  destination: THREE.Vector3 | null;
}

export interface CameraOrbitState {
  distance: number;
  yaw: number;
  pitch: number;
}
