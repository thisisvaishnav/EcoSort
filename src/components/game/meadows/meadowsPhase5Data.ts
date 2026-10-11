import { ItemData } from '../../../types/game';

/**
 * 10 Authoritative Waste Items for Level 7: Green Meadows Rescue Phase 5
 * Matching India's Solid Waste Management Rules:
 *  - Wet / Organic: Green Bin (banana_peel, veggie_scrap, food_plate)
 *  - Dry / Recyclable: Blue Bin (plastic_bottle_water, newspaper, metal_can, glass_bottle)
 *  - Hazardous: Red Bin (battery_aa, light_bulb)
 *  - Sanitary / Reject: Black Bin (used_diaper)
 */
export const MEADOWS_PHASE5_ITEMS: ItemData[] = [
  {
    id: 'banana_peel',
    name: 'Banana peel',
    bin: 'wet',
    baseWeight: 0.1,
    unlockLevel: 1,
    fact: 'Banana peels break down fast and feed healthy soil.',
    icon: '🍌',
    modelType: 'banana_peel',
    color: '#facc15',
  },
  {
    id: 'veggie_scrap',
    name: 'Vegetable scraps',
    bin: 'wet',
    baseWeight: 0.09,
    unlockLevel: 1,
    fact: 'Vegetable peel makes rich compost in just a few weeks.',
    icon: '🥦',
    modelType: 'veggie_scrap',
    color: '#22c55e',
  },
  {
    id: 'food_plate',
    name: 'Leftover food',
    bin: 'wet',
    baseWeight: 0.22,
    unlockLevel: 1,
    fact: 'Food scraps rot naturally and turn into garden compost.',
    icon: '🍛',
    modelType: 'food_plate',
    color: '#f59e0b',
  },
  {
    id: 'plastic_bottle_water',
    name: 'Plastic bottle',
    bin: 'dry',
    baseWeight: 0.05,
    unlockLevel: 1,
    fact: 'Clean plastic bottles are shredded and spun into new items.',
    icon: '🧴',
    modelType: 'plastic_bottle',
    color: '#38bdf8',
  },
  {
    id: 'newspaper',
    name: 'Old newspaper',
    bin: 'dry',
    baseWeight: 0.12,
    unlockLevel: 1,
    fact: 'Recycled newspaper saves trees and uses much less water.',
    icon: '📰',
    modelType: 'newspaper',
    color: '#cbd5e1',
  },
  {
    id: 'metal_can',
    name: 'Metal can',
    bin: 'dry',
    baseWeight: 0.06,
    unlockLevel: 1,
    fact: 'Metal cans melt down infinitely without losing strength.',
    icon: '🥫',
    modelType: 'metal_can',
    color: '#94a3b8',
  },
  {
    id: 'glass_bottle',
    name: 'Glass bottle',
    bin: 'dry',
    baseWeight: 0.18,
    unlockLevel: 1,
    fact: 'Clean glass bottles melt down into brand new containers.',
    icon: '🍾',
    modelType: 'plastic_bottle',
    color: '#34d399',
  },
  {
    id: 'battery_aa',
    name: 'Used battery',
    bin: 'hazardous',
    baseWeight: 0.05,
    unlockLevel: 1,
    fact: 'Batteries contain acid. Put them in the red bin.',
    icon: '🔋',
    modelType: 'battery',
    color: '#dc2626',
  },
  {
    id: 'light_bulb',
    name: 'Broken CFL bulb',
    bin: 'hazardous',
    baseWeight: 0.08,
    unlockLevel: 1,
    fact: 'CFL bulbs contain mercury. Dispose in the red bin.',
    icon: '💡',
    modelType: 'light_bulb',
    color: '#fef08a',
  },
  {
    id: 'used_diaper',
    name: 'Used diaper',
    bin: 'residual',
    baseWeight: 0.2,
    unlockLevel: 1,
    fact: 'Diapers are sanitary waste. Wrap them well for safe disposal.',
    icon: '🧷',
    modelType: 'tissue',
    color: '#f8fafc',
  },
];

/**
 * Educational hints provided upon wrong bin sorting.
 * Strictly formatted adhering to ASD-STE100 guidelines.
 */
export const MEADOWS_WRONG_BIN_HINTS: Record<string, string> = {
  banana_peel: 'Food peels decompose quickly into compost. Put them in the green bin.',
  veggie_scrap: 'Vegetable scraps become rich compost. They belong in the green bin.',
  food_plate: 'Leftover food is wet organic waste. Put it in the green bin.',
  plastic_bottle_water: 'Plastic bottles can be recycled. Put them in the blue bin.',
  newspaper: 'Clean paper and newsprint are recyclable. Put them in the blue bin.',
  metal_can: 'Metal cans are recyclable. Put them in the blue bin.',
  glass_bottle: 'Glass bottles can be melted and reused. Put them in the blue bin.',
  battery_aa: 'Batteries leak toxic chemicals into soil. Put them in the red bin.',
  light_bulb: 'CFL bulbs contain poisonous mercury vapour. Put them in the red bin.',
  used_diaper: 'Diapers are sanitary waste. Wrap and place in the black bin.',
};

/**
 * Narrator voice lines for Contamination Meter escalation.
 */
export const MEADOWS_CONTAMINATION_SPEECHES: Record<number, string> = {
  1: 'Careful! Wet food waste can soak into paper and make it impossible to recycle.',
  2: 'When hazardous waste mixes with other waste, it can poison the compost and the soil.',
  3: 'Mixed waste ends up in a landfill instead of being recycled. That means more pollution and more disease.',
};
