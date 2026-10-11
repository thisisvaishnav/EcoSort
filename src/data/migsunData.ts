import { BinType } from '../types/game';

export interface MigsunDialogueLine {
  text: string;
  emotion: 'happy' | 'concerned' | 'serious' | 'determined';
}

export const MIGSUN_INTRO_DIALOGUE: MigsunDialogueLine[] = [
  { text: 'Welcome to Migsun Vilasa!', emotion: 'happy' },
  { text: 'Look around us. One side has waste, but one side has life.', emotion: 'concerned' },
  { text: 'The waste brings pests. The waste harms our shared plants.', emotion: 'serious' },
  { text: 'Clean the area. Sort the waste. Restore our home!', emotion: 'determined' },
];

export const MIGSUN_LEVEL_TITLE = 'LEVEL 1: The Waste Pile Problem';
export const MIGSUN_OBJECTIVE = 'Objective: Clean. Sort. Restore.';
export const MIGSUN_HINT = 'Hint: Use your Eco Lens to discover nature.';

export interface BinInstallLocation {
  id: string;
  label: string;
  description: string;
  isCorrect: boolean;
  scoreBonus: number;
  explanation: string;
}

export const BIN_INSTALL_LOCATIONS: BinInstallLocation[] = [
  {
    id: 'entrance',
    label: 'Main Entrance',
    description: 'Beside the main society entrance gate',
    isCorrect: true,
    scoreBonus: 20,
    explanation: 'Good choice! Residents and collectors reach the bins easily.',
  },
  {
    id: 'garden',
    label: 'Near Garden',
    description: 'Directly next to the flower beds',
    isCorrect: true,
    scoreBonus: 10,
    explanation: 'This works. But bins near plants can attract pests.',
  },
  {
    id: 'walkway',
    label: 'Center Walkway',
    description: 'In the middle of the walking path',
    isCorrect: false,
    scoreBonus: 0,
    explanation: 'Bins on the walkway block people. Try again.',
  },
];

export interface DustbinCardData {
  binType: BinType;
  title: string;
  colorName: string;
  hexColor: string;
  voiceText: string;
  description: string;
  examples: { icon: string; name: string }[];
  practiceQuestion: {
    question: string;
    options: { label: string; binType: BinType }[];
    correctBin: BinType;
    explanation: string;
  };
}

export const DUSTBIN_CARDS: Record<BinType, DustbinCardData> = {
  wet: {
    binType: 'wet',
    title: 'GREEN BIN — Wet & Food Waste',
    colorName: 'Green',
    hexColor: '#10b981',
    voiceText: 'Food scraps and leaves go here. They become rich compost.',
    description: 'Food scraps, fruit peels, and leaves go here. They become compost and biogas.',
    examples: [
      { icon: '🍌', name: 'Banana peel' },
      { icon: '🍎', name: 'Apple core' },
      { icon: '🥬', name: 'Veggie scraps' },
      { icon: '🍞', name: 'Bread' },
    ],
    practiceQuestion: {
      question: 'Where do leftover vegetable scraps go?',
      options: [
        { label: 'Green Bin', binType: 'wet' },
        { label: 'Blue Bin', binType: 'dry' },
        { label: 'Red Bin', binType: 'hazardous' },
        { label: 'Black Bin', binType: 'residual' },
      ],
      correctBin: 'wet',
      explanation: 'Vegetables rot into compost. Use the green bin!',
    },
  },
  dry: {
    binType: 'dry',
    title: 'BLUE BIN — Recyclable Dry Waste',
    colorName: 'Blue',
    hexColor: '#3b82f6',
    voiceText: 'Clean paper, plastic bottles, and metal cans go here.',
    description: 'Clean paper, plastic bottles, and metal cans go here. They become new products.',
    examples: [
      { icon: '📰', name: 'Newspaper' },
      { icon: '🍶', name: 'Plastic bottle' },
      { icon: '🥫', name: 'Metal can' },
      { icon: '📦', name: 'Cardboard box' },
    ],
    practiceQuestion: {
      question: 'Where does a clean cereal box go?',
      options: [
        { label: 'Green Bin', binType: 'wet' },
        { label: 'Blue Bin', binType: 'dry' },
        { label: 'Red Bin', binType: 'hazardous' },
        { label: 'Black Bin', binType: 'residual' },
      ],
      correctBin: 'dry',
      explanation: 'Clean cardboard is recyclable. Use the blue bin!',
    },
  },
  hazardous: {
    binType: 'hazardous',
    title: 'RED BIN — Hazardous Waste',
    colorName: 'Red',
    hexColor: '#ef4444',
    voiceText: 'Old batteries and medicine go here. They have chemicals.',
    description: 'Old batteries and medicine go here. They have dangerous chemicals.',
    examples: [
      { icon: '🔋', name: 'Battery' },
      { icon: '💡', name: 'Light bulb' },
      { icon: '💊', name: 'Old medicine' },
      { icon: '🧪', name: 'Chemical bottle' },
    ],
    practiceQuestion: {
      question: 'Where does an old flashlight battery go?',
      options: [
        { label: 'Green Bin', binType: 'wet' },
        { label: 'Blue Bin', binType: 'dry' },
        { label: 'Red Bin', binType: 'hazardous' },
        { label: 'Black Bin', binType: 'residual' },
      ],
      correctBin: 'hazardous',
      explanation: 'Batteries contain acid. Always use the red bin!',
    },
  },
  residual: {
    binType: 'residual',
    title: 'BLACK BIN — Residual Waste',
    colorName: 'Black',
    hexColor: '#1e293b',
    voiceText: 'Items that cannot be recycled or composted go here.',
    description: 'Items that cannot be recycled or composted go here.',
    examples: [
      { icon: '🧻', name: 'Used tissue' },
      { icon: '✏️', name: 'Broken pen' },
      { icon: '🍬', name: 'Soiled wrapper' },
      { icon: '🩹', name: 'Used bandage' },
    ],
    practiceQuestion: {
      question: 'Where does a dirty candy wrapper go?',
      options: [
        { label: 'Green Bin', binType: 'wet' },
        { label: 'Blue Bin', binType: 'dry' },
        { label: 'Red Bin', binType: 'hazardous' },
        { label: 'Black Bin', binType: 'residual' },
      ],
      correctBin: 'residual',
      explanation: 'Dirty wrappers cannot be recycled. Black bin!',
    },
  },
  paper: {
    binType: 'paper',
    title: 'PAPER BIN',
    colorName: 'Cyan',
    hexColor: '#0284c7',
    voiceText: 'Clean paper goes here.',
    description: 'Paper waste',
    examples: [],
    practiceQuestion: {
      question: 'Paper goes here.',
      options: [{ label: 'Paper', binType: 'paper' }],
      correctBin: 'paper',
      explanation: 'Correct',
    },
  },
  plastic: {
    binType: 'plastic',
    title: 'PLASTIC BIN',
    colorName: 'Yellow',
    hexColor: '#f59e0b',
    voiceText: 'Clean plastic goes here.',
    description: 'Plastic waste',
    examples: [],
    practiceQuestion: {
      question: 'Plastic goes here.',
      options: [{ label: 'Plastic', binType: 'plastic' }],
      correctBin: 'plastic',
      explanation: 'Correct',
    },
  },
  ewaste: {
    binType: 'ewaste',
    title: 'E-WASTE BIN',
    colorName: 'Orange',
    hexColor: '#f97316',
    voiceText: 'Electronics go here.',
    description: 'Electronic waste',
    examples: [],
    practiceQuestion: {
      question: 'Electronics go here.',
      options: [{ label: 'E-waste', binType: 'ewaste' }],
      correctBin: 'ewaste',
      explanation: 'Correct',
    },
  },
  reuse: {
    binType: 'reuse',
    title: 'REUSE BIN',
    colorName: 'Teal',
    hexColor: '#0d9488',
    voiceText: 'Reusable items go here.',
    description: 'Reusable items',
    examples: [],
    practiceQuestion: {
      question: 'Reusable items go here.',
      options: [{ label: 'Reuse', binType: 'reuse' }],
      correctBin: 'reuse',
      explanation: 'Correct',
    },
  },
};

export interface EcoScanCauseEffect {
  id: string;
  name: string;
  icon: string;
  cause: string;
  effect: string;
  solution: string;
  voiceText: string;
}

export const ECO_SCAN_TARGETS: EcoScanCauseEffect[] = [
  {
    id: 'food_waste_pile',
    name: 'Food Waste Heap',
    icon: '🍌',
    cause: 'Food waste sits in the hot sun.',
    effect: 'Rotting food creates methane gas and pests.',
    solution: 'Sort food scraps into the green compost bin.',
    voiceText: 'Food waste rots in the open. It creates methane gas. Composting fixes this.',
  },
  {
    id: 'standing_water',
    name: 'Open Water Cans',
    icon: '🦟',
    cause: 'Discarded empty cans collect rain water.',
    effect: 'Standing dirty water breeds dangerous mosquitoes.',
    solution: 'Empty all containers before throwing them in bins.',
    voiceText: 'Open cans collect rain. Standing water breeds mosquitoes. Empty cans before bins.',
  },
  {
    id: 'damaged_plants',
    name: 'Choked Flower Bed',
    icon: '🌱',
    cause: 'Plastic wrappers block sunlight and soil rain.',
    effect: 'Plant roots cannot breathe. Growth stops.',
    solution: 'Clear litter so plants receive air and light.',
    voiceText: 'Litter blocks sunshine and soil. Clear waste so plants can grow strong.',
  },
  {
    id: 'blocked_drain',
    name: 'Littered Drain',
    icon: '🚰',
    cause: 'Plastic waste clogs the rain water drain.',
    effect: 'Dirty water overflows across walking paths.',
    solution: 'Keep all drains clear from plastic waste.',
    voiceText: 'Waste blocks the drain. Water overflows. Keep drains clear of waste.',
  },
];

export interface ResidentQuiz {
  id: string;
  residentName: string;
  avatar: string;
  question: string;
  options: { label: string; isCorrect: boolean }[];
  explanation: string;
}

export const RESIDENT_QUESTIONS: ResidentQuiz[] = [
  {
    id: 'res_1',
    residentName: 'Mrs. Sharma',
    avatar: '👵',
    question: 'Where should I put this banana peel?',
    options: [
      { label: '🟢 Green Bin (Wet)', isCorrect: true },
      { label: '🔵 Blue Bin (Dry)', isCorrect: false },
      { label: '🔴 Red Bin (Hazard)', isCorrect: false },
      { label: '⚫ Black Bin (Residual)', isCorrect: false },
    ],
    explanation: 'Banana peels decompose into compost in the green bin.',
  },
  {
    id: 'res_2',
    residentName: 'Mr. Verma',
    avatar: '👨',
    question: 'I have an old leaky battery. Which bin?',
    options: [
      { label: '🟢 Green Bin', isCorrect: false },
      { label: '🔵 Blue Bin', isCorrect: false },
      { label: '🔴 Red Bin (Hazard)', isCorrect: true },
      { label: '⚫ Black Bin', isCorrect: false },
    ],
    explanation: 'Batteries hold acid. Always put them in the red bin.',
  },
  {
    id: 'res_3',
    residentName: 'Aarav (Kid)',
    avatar: '👦',
    question: 'This clean newspaper is dry. Where does it go?',
    options: [
      { label: '🟢 Green Bin', isCorrect: false },
      { label: '🔵 Blue Bin (Dry)', isCorrect: true },
      { label: '🔴 Red Bin', isCorrect: false },
      { label: '⚫ Black Bin', isCorrect: false },
    ],
    explanation: 'Clean paper is recyclable. It goes in the blue bin.',
  },
  {
    id: 'res_4',
    residentName: 'Pooja',
    avatar: '👩',
    question: 'There is water in this old can. What should I do?',
    options: [
      { label: 'Empty the water and sort it', isCorrect: true },
      { label: 'Throw it with water inside', isCorrect: false },
      { label: 'Leave it in the garden', isCorrect: false },
      { label: 'Bury it in the dirt', isCorrect: false },
    ],
    explanation: 'Empty containers before sorting to prevent mosquito breeding.',
  },
  {
    id: 'res_5',
    residentName: 'Uncle Gupta',
    avatar: '👴',
    question: 'Where does a used medical bandage go?',
    options: [
      { label: '🟢 Green Bin', isCorrect: false },
      { label: '🔵 Blue Bin', isCorrect: false },
      { label: '🔴 Red Bin', isCorrect: false },
      { label: '⚫ Black Bin (Residual)', isCorrect: true },
    ],
    explanation: 'Used bandages cannot be recycled or composted. Use black bin.',
  },
];
