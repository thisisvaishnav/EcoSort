import { BinType } from '../../../../types/game';
import { BinSpotCandidate } from '../../../types';

export type Phase2Step =
  | 'REVIVAL_CINEMATIC'
  | 'SPOT_SELECTION'
  | 'INSTALLATION_POPUP'
  | 'BIN_CARDS_EDUCATION'
  | 'COMPLETE';

export interface Phase2State {
  step: Phase2Step;
  selectedSpot: BinSpotCandidate | null;
  inspectedCardBin: BinType | null;
  cardsCompleted: BinType[];
  score: number;
}
