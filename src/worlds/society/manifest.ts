import { WorldManifest } from '../types';

/**
 * Society World Manifest — Wave 0 Frozen Contract
 *
 * Provides initial placeholder anchors matching the proposed layout:
 * - Entrance gate and security cabin (South, Z = +14)
 * - Internal road with van access (East, X = +12)
 * - Two residential tower blocks (North, Z = -16 to -8)
 * - Central park and garden (Center, X = -2 to +8, Z = -4 to +6)
 * - Clubhouse and playground (West, X = -14 to -6)
 * - Rear service lane for waste pile (North-East, X = +6, Z = -10)
 * - Dustbin station candidate spots (5-7 spots evaluated via distance/clearance rules)
 */
export const SOCIETY_MANIFEST: WorldManifest = {
  id: 'society',
  name: 'Society',
  version: '1.0.0-wave0',

  // Walkable boundary in metres
  bounds: {
    minX: -18,
    maxX: 18,
    minZ: -18,
    maxZ: 18,
  },

  // Kai spawn: at main entrance path, facing towards central park (+Z to -Z)
  playerStart: {
    position: { x: 0, y: 0, z: 12 },
    rotationY: 0, // Faces forward into the compound
  },

  // Fixed camera positions
  introCamera: {
    position: { x: 0, y: 4, z: 16 },
    target: { x: 0, y: 1.2, z: 12 },
    fov: 50,
  },
  cinematicCamera: {
    position: { x: 12, y: 14, z: 16 },
    target: { x: 0, y: 0, z: 0 },
    fov: 45,
  },

  // Waste pile: situated in rear service lane
  pile: {
    center: { x: 6, y: 0, z: -10 },
    radius: 3.5,
  },

  // Item scatter region surrounding the pile
  itemSpawnRegion: {
    center: { x: 6, y: 0, z: -10 },
    radius: 5.0,
    scatterCount: 15,
  },

  // 4 temporary sorting sacks placed near the waste pile clearing
  sackPositions: {
    wet: { x: 3.5, y: 0, z: -7.5 },
    dry: { x: 5.5, y: 0, z: -7.5 },
    hazardous: { x: 7.5, y: 0, z: -7.5 },
    residual: { x: 9.5, y: 0, z: -7.5 },
  },

  // Van path along the eastern service road
  truckSpawn: { x: 14, y: 0, z: 24 },
  truckRoute: [
    { x: 14, y: 0, z: 18 },
    { x: 14, y: 0, z: 6 },
    { x: 14, y: 0, z: -4 },
  ],
  truckStop: { x: 14, y: 0, z: -8 },

  // Central garden area with wilted/reviving flora
  gardenBounds: {
    minX: -2,
    maxX: 8,
    minZ: -4,
    maxZ: 6,
  },
  plantSlots: [
    { x: -1, y: 0, z: -2 },
    { x: 1, y: 0, z: -1 },
    { x: 3, y: 0, z: 0 },
    { x: 5, y: 0, z: 2 },
    { x: 7, y: 0, z: 4 },
    { x: 0, y: 0, z: 4 },
  ],

  // 6 Candidate bin installation spots
  binSpots: [
    {
      id: 'main_gate',
      label: 'Main Gate & Security',
      position: { x: 3, y: 0, z: 12 },
      isCorrect: true,
      scoreBonus: 25,
      explanation: 'Optimal access for all entering residents and truck collectors.',
    },
    {
      id: 'central_park_entry',
      label: 'Central Park Walkway',
      position: { x: -3, y: 0, z: 2 },
      isCorrect: true,
      scoreBonus: 20,
      explanation: 'Convenient for park visitors without blocking the path.',
    },
    {
      id: 'clubhouse_plaza',
      label: 'Clubhouse Plaza',
      position: { x: -8, y: 0, z: -2 },
      isCorrect: true,
      scoreBonus: 20,
      explanation: 'High pedestrian traffic area near community amenities.',
    },
    {
      id: 'flower_bed_center',
      label: 'Inside Flower Bed',
      position: { x: 2, y: 0, z: 1 },
      isCorrect: false,
      scoreBonus: 0,
      explanation: 'Placing bins directly on garden plants attracts pests and tramples flora.',
    },
    {
      id: 'narrow_driveway',
      label: 'Middle of Driveway',
      position: { x: 14, y: 0, z: 4 },
      isCorrect: false,
      scoreBonus: 0,
      explanation: 'Blocks vehicles and collection vans.',
    },
    {
      id: 'service_lane_corner',
      label: 'Service Lane Corner',
      position: { x: 10, y: 0, z: -8 },
      isCorrect: true,
      scoreBonus: 15,
      explanation: 'Designated utility area close to the collection point.',
    },
  ],

  // 4 Hotspots for Mission 3 Eco Lens scanning
  ecoHotspots: [
    {
      id: 'hotspot_food_waste',
      title: 'Decomposing Food Waste',
      position: { x: 5.5, y: 0.5, z: -9.5 },
      description: 'Rotting food scraps attract flies and pests.',
      impact: 'Spreads bacteria and foul odors across the residential yard.',
      action: 'Segregate into the green wet bin for compost.',
    },
    {
      id: 'hotspot_standing_water',
      title: 'Stagnant Puddle in Drain',
      position: { x: -6, y: 0.2, z: 8 },
      description: 'Litter in gutters stops clean water drainage.',
      impact: 'Creates mosquito breeding conditions within 48 hours.',
      action: 'Clear plastic wrappers and ensure drainage flows freely.',
    },
    {
      id: 'hotspot_damaged_plants',
      title: 'Chemical Leachate on Soil',
      position: { x: 0.5, y: 0.3, z: 0 },
      description: 'Discarded batteries leaking acid onto flower roots.',
      impact: 'Poisons soil and causes young saplings to wither.',
      action: 'Dispose of toxic chemicals in the red hazardous bin.',
    },
    {
      id: 'hotspot_littered_drain',
      title: 'Blocked Overflow Grate',
      position: { x: 12, y: 0.2, z: -6 },
      description: 'Single-use plastic bottles lodged in the storm drain.',
      impact: 'Causes street flooding during rainfall.',
      action: 'Recycle bottles in the blue dry bin.',
    },
  ],

  // Resident NPCs for Mission 3
  residentEntry: { x: 0, y: 0, z: 14 },
  residentStandPoint: { x: 0, y: 0, z: 4 },
  residents: [
    {
      id: 'resident_uncle_sharma',
      name: 'Mr. Sharma',
      role: 'Society Resident',
      entryPosition: { x: 0, y: 0, z: 14 },
      standPosition: { x: 0, y: 0, z: 4 },
      dialogueKey: 'society.resident.sharma',
    },
    {
      id: 'resident_priya',
      name: 'Priya',
      role: 'Student & Youth Club',
      entryPosition: { x: -4, y: 0, z: 12 },
      standPosition: { x: -2, y: 0, z: 3 },
      dialogueKey: 'society.resident.priya',
    },
  ],

  // Collision solids (Towers, clubhouse, gate)
  collision: [
    {
      id: 'tower_block_a',
      type: 'building',
      minX: -12,
      maxX: -2,
      minZ: -16,
      maxZ: -8,
    },
    {
      id: 'tower_block_b',
      type: 'building',
      minX: 2,
      maxX: 12,
      minZ: -16,
      maxZ: -11,
    },
    {
      id: 'clubhouse',
      type: 'building',
      minX: -16,
      maxX: -8,
      minZ: -4,
      maxZ: 4,
    },
    {
      id: 'security_cabin',
      type: 'building',
      minX: -4,
      maxX: -1,
      minZ: 13,
      maxZ: 16,
    },
  ],

  // Visual state progression
  visualStates: {
    state0Dirty: {
      groundColor: 0x5a4838, // Parched / dirty ground
      pestDensity: 1.0,
    },
    state1Clean: {
      groundColor: 0x4a7c59, // Clean ground
      pestDensity: 0.0,
    },
    state2Revived: {
      groundColor: 0x2e8b57, // Lush emerald grass
      flowerBloom: true,
      butterflies: true,
    },
  },

  timerSeconds: 120,
  activeBins: ['wet', 'dry', 'hazardous', 'residual'],
  contentNamespace: 'society',
  audioPrefix: 'society_',
  saveNamespace: 'ecohero:society:',
};
