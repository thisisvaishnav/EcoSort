
export type Phase3Step = 'ECO_LENS_SCAN' | 'RESIDENTS_TEACH' | 'FINALE_DASHBOARD';

export interface Phase3State {
  step: Phase3Step;
  scannedHotspotIds: string[];
  currentResidentIndex: number;
  completedResidents: string[];
  score: number;
  stars: number;
}
