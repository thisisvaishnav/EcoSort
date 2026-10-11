import { BinType } from '../../../types/game';

export interface SocietyResidentQuiz {
  id: string;
  name: string;
  role: string;
  avatar: string;
  statement: string;      // 10 words or fewer (ASD-STE100)
  guidance: string;       // 10 words or fewer
  question: string;
  options: { label: string; binType: BinType }[];
  correctBin: BinType;
  hint: string;           // 10 words or fewer
  voiceLineId: string;
  caption: string;
}

export interface SocietyHotspotContent {
  id: string;
  title: string;
  shortDesc: string;      // 10 words or fewer
  impactText: string;     // 10 words or fewer
  solutionText: string;   // 10 words or fewer
  voiceLineId: string;
}

/**
 * Society World English Strings (ASD-STE100 Compliant)
 * All dialogue lines contain 10 words or fewer.
 */
export const SOCIETY_STRINGS = {
  narrative: {
    welcome: 'Welcome to Society. Clean the area together.',
    mission1: 'Clean the scattered waste before the van arrives.',
    mission2: 'Select safe locations and install four dustbins.',
    mission3: 'Scan hotspots and teach all eight residents.',
    complete: 'Society is clean and healthy. Great job hero!',
  },
  van: {
    arrival: 'The garbage van arrives. Load sorted sacks now.',
    finish: 'All waste loaded safely. The truck leaves clean.',
  },
  hotspots: {
    foodWaste: {
      id: 'hotspot_food_waste',
      title: 'Rotting Food Pile',
      shortDesc: 'Old food scraps attract flies and pests.',
      impactText: 'Rotting food creates foul smell and sickness.',
      solutionText: 'Put food waste into the green wet bin.',
      voiceLineId: 'society_voice_hotspot_food',
    },
    standingWater: {
      id: 'hotspot_standing_water',
      title: 'Stagnant Water Puddle',
      shortDesc: 'Dirty water collects inside discarded plastic bags.',
      impactText: 'Standing water breeds mosquitoes and dangerous fevers.',
      solutionText: 'Clear the trash so water drains safely.',
      voiceLineId: 'society_voice_hotspot_water',
    },
    damagedPlants: {
      id: 'hotspot_damaged_plants',
      title: 'Damaged Garden Plants',
      shortDesc: 'Old leaking batteries poison soil and plant roots.',
      impactText: 'Toxic acid stops flowers and bushes from growing.',
      solutionText: 'Place all batteries in the red hazardous bin.',
      voiceLineId: 'society_voice_hotspot_plants',
    },
    litteredDrain: {
      id: 'hotspot_littered_drain',
      title: 'Blocked Street Drain',
      shortDesc: 'Discarded bottles and cans choke the drain grate.',
      impactText: 'Blocked grates flood roads during heavy rain.',
      solutionText: 'Recycle clean bottles into the blue dry bin.',
      voiceLineId: 'society_voice_hotspot_drain',
    },
  } as Record<string, SocietyHotspotContent>,

  residents: [
    {
      id: 'resident_sharma',
      name: 'Mr. Sharma',
      role: 'Senior Resident',
      avatar: '👴',
      statement: 'I have many wet vegetable peels every morning.',
      guidance: 'Vegetable peels make rich soil compost for plants.',
      question: 'Which bin should Mr. Sharma use for vegetable peels?',
      options: [
        { label: 'Green Wet Bin', binType: 'wet' },
        { label: 'Blue Dry Bin', binType: 'dry' },
        { label: 'Black Residual Bin', binType: 'residual' },
      ],
      correctBin: 'wet',
      hint: 'Food scraps belong in the green wet bin.',
      voiceLineId: 'society_voice_res_sharma',
      caption: 'Vegetable peels belong in the green wet bin.',
    },
    {
      id: 'resident_priya',
      name: 'Priya',
      role: 'College Student',
      avatar: '👩‍🎓',
      statement: 'My old notebooks are full of school notes.',
      guidance: 'Paper can be recycled into new books cleanly.',
      question: 'Where should Priya place old paper notebooks?',
      options: [
        { label: 'Green Wet Bin', binType: 'wet' },
        { label: 'Blue Dry Bin', binType: 'dry' },
        { label: 'Red Hazardous Bin', binType: 'hazardous' },
      ],
      correctBin: 'dry',
      hint: 'Dry clean paper belongs in the blue bin.',
      voiceLineId: 'society_voice_res_priya',
      caption: 'Put clean paper notebooks in the blue bin.',
    },
    {
      id: 'resident_verma',
      name: 'Mrs. Verma',
      role: 'Home Maker',
      avatar: '👩',
      statement: 'My wall clock battery stopped working today.',
      guidance: 'Old batteries contain dangerous chemicals that harm earth.',
      question: 'Which bin is safe for discarded batteries?',
      options: [
        { label: 'Red Hazardous Bin', binType: 'hazardous' },
        { label: 'Green Wet Bin', binType: 'wet' },
        { label: 'Blue Dry Bin', binType: 'dry' },
      ],
      correctBin: 'hazardous',
      hint: 'Chemicals and batteries belong in the red bin.',
      voiceLineId: 'society_voice_res_verma',
      caption: 'Discard old batteries in the red hazardous bin.',
    },
    {
      id: 'resident_arjun',
      name: 'Arjun',
      role: 'School Kid',
      avatar: '👦',
      statement: 'I finished my juice from this plastic bottle.',
      guidance: 'Empty plastic bottles can be melted into threads.',
      question: 'Where does an empty clean plastic bottle go?',
      options: [
        { label: 'Blue Dry Bin', binType: 'dry' },
        { label: 'Green Wet Bin', binType: 'wet' },
        { label: 'Black Residual Bin', binType: 'residual' },
      ],
      correctBin: 'dry',
      hint: 'Recyclable plastics belong in the blue dry bin.',
      voiceLineId: 'society_voice_res_arjun',
      caption: 'Place empty plastic bottles in the blue bin.',
    },
    {
      id: 'resident_gupta',
      name: 'Mr. Gupta',
      role: 'Grocery Store Owner',
      avatar: '👨‍💼',
      statement: 'I swept up dusty floor sweepings and dirt.',
      guidance: 'Dust and floor sweepings cannot be recycled.',
      question: 'Where should non-recyclable floor dirt go?',
      options: [
        { label: 'Black Residual Bin', binType: 'residual' },
        { label: 'Green Wet Bin', binType: 'wet' },
        { label: 'Blue Dry Bin', binType: 'dry' },
      ],
      correctBin: 'residual',
      hint: 'Mixed dust goes into the black residual bin.',
      voiceLineId: 'society_voice_res_gupta',
      caption: 'Put mixed sweepings in the black residual bin.',
    },
    {
      id: 'resident_ananya',
      name: 'Ananya',
      role: 'Nature Club Volunteer',
      avatar: '👧',
      statement: 'Someone threw expired cough medicine in the yard.',
      guidance: 'Expired medicine is toxic and pollutes groundwater.',
      question: 'Where should discarded medicine bottles go?',
      options: [
        { label: 'Red Hazardous Bin', binType: 'hazardous' },
        { label: 'Blue Dry Bin', binType: 'dry' },
        { label: 'Green Wet Bin', binType: 'wet' },
      ],
      correctBin: 'hazardous',
      hint: 'Medicine contains chemicals for the red bin.',
      voiceLineId: 'society_voice_res_ananya',
      caption: 'Send expired medicines to the red hazardous bin.',
    },
    {
      id: 'resident_rohit',
      name: 'Rohit',
      role: 'Courier Agent',
      avatar: '🚚',
      statement: 'I unpacked many brown cardboard delivery cartons.',
      guidance: 'Clean flattened boxes make great recycled packing material.',
      question: 'Which bin receives clean cardboard shipping boxes?',
      options: [
        { label: 'Blue Dry Bin', binType: 'dry' },
        { label: 'Green Wet Bin', binType: 'wet' },
        { label: 'Black Residual Bin', binType: 'residual' },
      ],
      correctBin: 'dry',
      hint: 'Cardboard is recyclable into the blue dry bin.',
      voiceLineId: 'society_voice_res_rohit',
      caption: 'Recycle flattened cardboard boxes in the blue bin.',
    },
    {
      id: 'resident_meera',
      name: 'Meera',
      role: 'Community Gardener',
      avatar: '🧑‍🌾',
      statement: 'I pruned dry branches and collected fallen leaves.',
      guidance: 'Garden leaves break down naturally into plant food.',
      question: 'Where do dry leaves and twigs belong?',
      options: [
        { label: 'Green Wet Bin', binType: 'wet' },
        { label: 'Black Residual Bin', binType: 'residual' },
        { label: 'Red Hazardous Bin', binType: 'hazardous' },
      ],
      correctBin: 'wet',
      hint: 'Organic leaves belong in the green wet bin.',
      voiceLineId: 'society_voice_res_meera',
      caption: 'Put fallen leaves in the green wet bin.',
    },
  ] as SocietyResidentQuiz[],
};
