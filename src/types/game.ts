export type BinType = 'wet' | 'dry' | 'paper' | 'plastic' | 'hazardous' | 'ewaste' | 'reuse' | 'residual';

export interface BinInfo {
  id: BinType;
  label: string;
  sublabel: string;
  color: string;
  hexColor: number;
  iconName: string;
  shape: 'cylinder' | 'cube' | 'hex' | 'rounded';
  description: string;
}

export interface ItemData {
  id: string;
  name: string;
  bin: BinType;
  baseWeight: number; // e.g. 0.12
  unlockLevel: number;
  fact: string;
  icon: string;
  modelType:
    | 'apple'
    | 'banana'
    | 'banana_peel'
    | 'food_plate'
    | 'milk_carton'
    | 'plastic_bottle'
    | 'newspaper'
    | 'paper_sheet'
    | 'soda_can'
    | 'battery'
    | 'light_bulb'
    | 'medicine'
    | 'medicine_bottle'
    | 'magazine'
    | 'toy_car'
    | 'phone'
    | 'charger'
    | 'glass_jar'
    | 'shirt'
    | 'cardboard'
    // Level 1 additions
    | 'bread_slice'
    | 'veggie_scrap'
    | 'egg_shell'
    | 'metal_can'
    // Level 1 residual additions
    | 'wrapper'
    | 'tissue'
    | 'broken_pen';
  color: string;
  isAmbiguous?: boolean;
}

export interface LevelConfig {
  id: number;
  name: string;
  place: string;
  bins: BinType[];
  learningGoal: string;
  energyLink: string;
  targetCount: number;
  isBonus?: boolean;
  sceneType?: 'KITCHEN' | 'SOCIETY' | 'TOWN';
  timeLimit?: number; // seconds
}

export interface QuizQuestion {
  id: string;
  question: string;
  imageUrl?: string;
  item: ItemData;
  options: { label: string; bin: BinType }[];
  correctBin: BinType;
  fact: string;
}

export interface PlayerProfile {
  userId: string;
  nickname: string;
  avatar: string;
  totalScore: number;
  unlockedCards: string[]; // item IDs
  stars: Record<number, number>; // levelId -> stars (1-3)
  highScores: Record<number, number>; // levelId -> score
  itemStats: Record<string, { attempts: number; errors: number }>;
}

export interface TeacherReportStats {
  classId: string;
  studentCount: number;
  avgScore: number;
  avgAccuracy: number;
  categoryErrors: Record<string, number>;
  topMistakes: { itemId: string; count: number }[];
  evaluation: {
    preTestAccuracy: string;
    postTestAccuracy: string;
    learningDelta: string;
  };
}
