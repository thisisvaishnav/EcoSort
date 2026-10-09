import * as THREE from 'three';
import { MapItemConfig } from './types';

/**
 * Default curated placement coordinates for all 10 items scattered
 * across the EcoSort town map. Each placement corresponds to thematic
 * story locations (school, park, river, rowhouses, recycling plant, plaza).
 */
export const DEFAULT_MAP_ITEM_PLACEMENTS: MapItemConfig[] = [
  // 1. Food Leftover Plate - Home Cottage Porch
  {
    id: 'map_item_food_plate',
    modelType: 'food_plate',
    position: new THREE.Vector3(2.4, 0, 2.0),
    placementMode: 'collectible',
    scale: 1.1,
    interactionRadius: 2.5,
  },

  // 2. Banana Peel - Home Garden Lawn
  {
    id: 'map_item_banana_peel',
    modelType: 'banana_peel',
    position: new THREE.Vector3(-3.2, 0, 4.2),
    placementMode: 'collectible',
    scale: 1.1,
    interactionRadius: 2.5,
  },

  // 3. Folded Newspaper - Neighborhood Parkway Sidewalk
  {
    id: 'map_item_newspaper',
    modelType: 'newspaper',
    position: new THREE.Vector3(-5.8, 0, -20.0),
    placementMode: 'collectible',
    scale: 1.1,
    interactionRadius: 2.5,
  },

  // 4. Used Battery - Rowhouses Parkway Street
  {
    id: 'map_item_battery',
    modelType: 'battery',
    position: new THREE.Vector3(5.8, 0, -24.0),
    placementMode: 'collectible',
    scale: 1.1,
    interactionRadius: 2.5,
  },

  // 5. Milk Carton - Sunny School Courtyard
  {
    id: 'map_item_milk_carton',
    modelType: 'milk_carton',
    position: new THREE.Vector3(28.0, 0, -29.0),
    placementMode: 'collectible',
    scale: 1.1,
    interactionRadius: 2.5,
  },

  // 6. Broken Toy Car - School Yard Playground
  {
    id: 'map_item_toy_car',
    modelType: 'toy_car',
    position: new THREE.Vector3(38.0, 0, -26.0),
    placementMode: 'collectible',
    scale: 1.1,
    interactionRadius: 2.5,
  },

  // 7. Plastic Water Bottle - River Canal Footbridge
  {
    id: 'map_item_plastic_bottle',
    modelType: 'plastic_bottle',
    position: new THREE.Vector3(-14.5, 0, -43.0),
    placementMode: 'collectible',
    scale: 1.1,
    interactionRadius: 2.5,
  },

  // 8. Glossy Magazine - Community Nature Park Lawn
  {
    id: 'map_item_magazine',
    modelType: 'magazine',
    position: new THREE.Vector3(-31.0, 0, -39.0),
    placementMode: 'collectible',
    scale: 1.1,
    interactionRadius: 2.5,
  },

  // 9. Light Bulb - Eco Recycling Plant Yard
  {
    id: 'map_item_light_bulb',
    modelType: 'light_bulb',
    position: new THREE.Vector3(-23.0, 0, -69.0),
    placementMode: 'collectible',
    scale: 1.1,
    interactionRadius: 2.5,
  },

  // 10. Medicine Bottle & Pills - Central Town Plaza
  {
    id: 'map_item_medicine_bottle',
    modelType: 'medicine_bottle',
    position: new THREE.Vector3(4.8, 0, -84.0),
    placementMode: 'collectible',
    scale: 1.1,
    interactionRadius: 2.5,
  },
];
