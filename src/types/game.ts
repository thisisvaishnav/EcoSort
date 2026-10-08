export type BinType = 'wet' | 'dry' | 'paper' | 'plastic' | 'hazardous' | 'ewaste' | 'reuse';

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
  modelType: 'apple' | 'banana' | 'paper_sheet' | 'plastic_bottle' | 'soda_can' | 'battery' | 'medicine' | 'phone' | 'charger' | 'glass_jar' | 'shirt' | 'cardboard';
  color: string;
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
