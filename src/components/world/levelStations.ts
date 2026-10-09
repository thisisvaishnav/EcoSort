import * as THREE from 'three';
import { LevelStation } from './types';

export const LEVEL_STATIONS: LevelStation[] = [
  {
    id: 1,
    name: 'Home Kitchen',
    place: 'Home Base',
    position: new THREE.Vector3(0, 0, 0),
    tablePosition: new THREE.Vector3(0, 0, 3.2),
    cameraPosition: new THREE.Vector3(0, 3.8, 8.5),
    bins: ['wet', 'dry'],
    targetCount: 6,
    description: 'Sort organic food waste to generate clean biogas.',
    markerColor: '#22c55e', // Green
  },
  {
    id: 2,
    name: 'Living Room',
    place: 'Neighborhood Parkway',
    position: new THREE.Vector3(0, 0, -26),
    tablePosition: new THREE.Vector3(0, 0, -22.8),
    cameraPosition: new THREE.Vector3(0, 3.8, -17.5),
    bins: ['wet', 'dry', 'hazardous'],
    targetCount: 8,
    description: 'Separate hazardous battery chemicals from dry waste.',
    markerColor: '#ef4444', // Red
  },
  {
    id: 3,
    name: 'Sunny School',
    place: 'Classroom & Yard',
    position: new THREE.Vector3(34, 0, -32),
    tablePosition: new THREE.Vector3(34, 0, -28.8),
    cameraPosition: new THREE.Vector3(34, 3.8, -23.5),
    bins: ['paper', 'plastic', 'wet'],
    targetCount: 9,
    description: 'Classify clean paper and plastic bottles in the school yard.',
    markerColor: '#3b82f6', // Blue
  },
  {
    id: 4,
    name: 'Park & River',
    place: 'Community Nature Reserve',
    position: new THREE.Vector3(-34, 0, -36),
    tablePosition: new THREE.Vector3(-34, 0, -32.8),
    cameraPosition: new THREE.Vector3(-34, 3.8, -27.5),
    bins: ['wet', 'dry', 'hazardous', 'ewaste'],
    targetCount: 10,
    description: 'Collect e-waste and keep waterways clean for wildlife.',
    markerColor: '#f97316', // Orange
  },
  {
    id: 5,
    name: 'Recycling Plant',
    place: 'Eco Innovation Hub',
    position: new THREE.Vector3(-28, 0, -72),
    tablePosition: new THREE.Vector3(-28, 0, -68.8),
    cameraPosition: new THREE.Vector3(-28, 3.8, -63.5),
    bins: ['wet', 'dry', 'hazardous', 'ewaste', 'reuse'],
    targetCount: 12,
    description: 'Sort recyclable materials and rescue reusable goods.',
    markerColor: '#14b8a6', // Teal
  },
  {
    id: 6,
    name: 'Town Conveyor Hub',
    place: 'Central Town Plaza',
    position: new THREE.Vector3(0, 0, -88),
    tablePosition: new THREE.Vector3(0, 0, -84.8),
    cameraPosition: new THREE.Vector3(0, 3.8, -79.5),
    bins: ['wet', 'dry', 'hazardous', 'ewaste', 'reuse'],
    targetCount: 15,
    description: 'Power the entire town skyline in the central clock square!',
    markerColor: '#eab308', // Amber
  },
];
