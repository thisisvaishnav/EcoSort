import { BinType } from '../../../../types/game';

export type Phase1Step = 'INTRO' | 'SORT_CHOICE' | 'SORTING' | 'VAN_ARRIVING' | 'COMPLETE';

export interface Phase1LitterItem {
  id: string;
  name: string;
  bin: BinType;
  points: number;
  isSorted: boolean;
  position: { x: number; y: number; z: number };
}

export interface Phase1State {
  step: Phase1Step;
  timerSeconds: number;
  isTimerRunning: boolean;
  items: Phase1LitterItem[];
  itemsSortedCount: number;
  totalItemsCount: number;
  score: number;
  hasSoftFailed: boolean;
}
