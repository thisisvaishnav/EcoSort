import React, { useState } from 'react';
import { BinType, MigsunPhase } from '../../../types/game';
import { CharacterIntroOverlay } from './CharacterIntroOverlay';
import { MissionSelectPanel } from './MissionSelectPanel';
import { SortChoiceModal } from './SortChoiceModal';
import { BinLocationChoice } from './BinLocationChoice';
import { DustbinCardOverlay } from './DustbinCardOverlay';
import { EcoLensScanOverlay } from './EcoLensScanOverlay';
import { audio } from '../../../services/audio';

export interface MigsunGameControllerProps {
  currentPhase: MigsunPhase;
  onSetPhase: (phase: MigsunPhase) => void;
  completedMissions: number[];
  onCompleteMission: (missionId: number) => void;
  score: number;
  onAddScore: (amount: number) => void;
  itemsSorted: number;
  totalItems: number;
  accuracy: number;
  onTriggerPlantRevival?: () => void;
  onShowBinsAtLocation?: (locationId: string) => void;
  onRemovePests?: () => void;
  onPlayAgain?: () => void;
  onHome?: () => void;
}

export const MigsunGameController: React.FC<MigsunGameControllerProps> = ({
  currentPhase,
  onSetPhase,
  completedMissions,
  onCompleteMission,
  onAddScore,
  onTriggerPlantRevival,
  onShowBinsAtLocation,
  onRemovePests,
}) => {
  const [selectedDustbinCard, setSelectedDustbinCard] = useState<BinType | null>(null);

  switch (currentPhase) {
    case 'CHARACTER_INTRO':
      return (
        <CharacterIntroOverlay
          onComplete={() => {
            onSetPhase('MISSION_SELECT');
          }}
        />
      );

    case 'MISSION_SELECT':
      return (
        <MissionSelectPanel
          completedMissions={completedMissions}
          onSelectMission={(missionId) => {
            if (missionId === 1) {
              onSetPhase('SORT_CHOICE');
            } else if (missionId === 2) {
              onSetPhase('BIN_LOCATION_CHOICE');
            } else if (missionId === 3) {
              onSetPhase('ECO_LENS_SCAN');
            }
          }}
        />
      );

    case 'SORT_CHOICE':
      return (
        <SortChoiceModal
          onConfirmSort={() => {
            onSetPhase('SORTING_GAMEPLAY');
          }}
        />
      );

    case 'AREA_RESTORED':
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200 pointer-events-auto">
          <div className="w-full max-w-md bg-[#FDFBF7] border-4 border-slate-900 rounded-3xl p-6 sm:p-8 shadow-retro-xl text-slate-900 text-center flex flex-col gap-5">
            <span className="text-4xl">🌱✨</span>
            <h2 className="font-fun text-2xl font-black text-slate-950">
              Waste Cleared! Nature Revives!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              The waste truck collected all litter. Fresh plants are growing back into the soil.
            </p>
            <button
              onClick={() => {
                onTriggerPlantRevival?.();
                onRemovePests?.();
                onCompleteMission(1);
                onSetPhase('BIN_LOCATION_CHOICE');
              }}
              className="px-5 py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-fun font-black rounded-2xl border-2 border-slate-900 shadow-retro transition-all active:translate-x-0.5 active:translate-y-0.5"
            >
              Start Mission 2: Install Bins
            </button>
          </div>
        </div>
      );

    case 'BIN_LOCATION_CHOICE':
      return (
        <BinLocationChoice
          onLocationSelected={(locationId, bonus) => {
            onAddScore(bonus);
            onShowBinsAtLocation?.(locationId);
            onCompleteMission(2);
            onSetPhase('BIN_EDUCATION');
          }}
        />
      );

    case 'BIN_EDUCATION':
      return (
        <>
          {selectedDustbinCard && (
            <DustbinCardOverlay
              binType={selectedDustbinCard}
              onClose={() => setSelectedDustbinCard(null)}
              onAnswerCorrect={() => {
                onAddScore(15);
                setSelectedDustbinCard(null);
              }}
            />
          )}
          <div className="absolute top-16 right-4 z-40 bg-[#FDFBF7] border-2 border-slate-900 rounded-2xl p-3 shadow-retro flex flex-col gap-2">
            <div className="text-xs font-fun font-black text-slate-900">Learn 4 Bins</div>
            <div className="flex gap-1.5">
              {(['wet', 'dry', 'hazardous', 'residual'] as BinType[]).map((b) => (
                <button
                  key={b}
                  onClick={() => setSelectedDustbinCard(b)}
                  className="px-2 py-1 text-xs font-fun font-bold bg-white hover:bg-slate-100 border border-slate-900 rounded-lg capitalize"
                >
                  {b}
                </button>
              ))}
            </div>
            <button
              onClick={() => onSetPhase('ECO_LENS_SCAN')}
              className="mt-1 px-3 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-fun font-black text-xs rounded-xl border border-slate-900 shadow-retro-sm"
            >
              Next: Eco Lens Scan →
            </button>
          </div>
        </>
      );

    case 'ECO_LENS_SCAN':
      return (
        <EcoLensScanOverlay
          onScanComplete={() => {
            onCompleteMission(3);
            audio.playCelebration();
            onSetPhase('LEVEL_COMPLETE');
          }}
        />
      );

    case 'LEVEL_COMPLETE':
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200 pointer-events-auto">
          <div className="w-full max-w-lg bg-[#FDFBF7] border-4 border-slate-900 rounded-3xl p-6 sm:p-8 shadow-retro-xl text-slate-900 text-center flex flex-col gap-5">
            <span className="text-5xl">🏆</span>
            <h2 className="font-fun text-3xl font-black text-slate-950">
              Migsun Vilasa Restored!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              You cleaned the waste, installed bins, and scanned environmental impact. You are a true Eco Hero!
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => onSetPhase('MISSION_SELECT')}
                className="px-5 py-2.5 bg-amber-300 hover:bg-amber-200 text-slate-950 font-fun font-black rounded-xl border-2 border-slate-900 shadow-retro transition-all"
              >
                Missions
              </button>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
};
