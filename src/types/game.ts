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

export type MigsunPhase =
  | 'CHARACTER_INTRO'
  | 'MISSION_SELECT'
  | 'SORT_CHOICE'
  | 'SORTING_GAMEPLAY'
  | 'TRUCK_ARRIVAL'
  | 'AREA_RESTORED'
  | 'BIN_LOCATION_CHOICE'
  | 'BIN_EDUCATION'
  | 'ECO_LENS_SCAN'
  | 'HEALTH_DASHBOARD'
  | 'TEACH_RESIDENT'
  | 'LEVEL_COMPLETE';

export interface LevelConfig {
  id: number;
  name: string;
  place: string;
  bins: BinType[];
  learningGoal: string;
  energyLink: string;
  targetCount: number;
  isBonus?: boolean;
  sceneType?: 'SOCIETY' | 'TOWN' | 'MEADOWS' | 'MIGSUN';
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

export interface ObservabilityMetrics {
  namespace: string;
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  uptime: string;
  lambdaMetrics: {
    invocations24h: number;
    avgLatencyMs: number;
    p95LatencyMs: number;
    errorRatePercent: number;
  };
  dynamoDbMetrics: {
    tableStatus: string;
    billingMode: string;
    consumedReadUnits: number;
    consumedWriteUnits: number;
    itemCount: number;
  };
  aiMascotMetrics: {
    bedrockInvocations: number;
    avgBedrockLatencyMs: number;
    pollySyntheses: number;
    avgPollyLatencyMs: number;
  };
  liveSortingStats: {
    avgAccuracyPercent: number;
    avgScorePoints: number;
    totalErrorsObserved: number;
    mistakesByBin: Record<string, number>;
  };
  cloudWatchAlarms: {
    alarmName: string;
    status: 'OK' | 'ALARM' | 'INSUFFICIENT_DATA';
    threshold: string;
  }[];
  timestamp: string;
}

