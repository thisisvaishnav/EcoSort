import React, { useState } from 'react';
import { Eye, Volume2, CheckCircle2, ArrowRight } from 'lucide-react';
import { ECO_SCAN_TARGETS, EcoScanCauseEffect } from '../../../data/migsunData';
import { audio } from '../../../services/audio';

interface EcoLensScanOverlayProps {
  onScanComplete: () => void;
}

export const EcoLensScanOverlay: React.FC<EcoLensScanOverlayProps> = ({ onScanComplete }) => {
  const [scannedIds, setScannedIds] = useState<string[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<EcoScanCauseEffect | null>(
    ECO_SCAN_TARGETS[0]
  );

  const handleScanTarget = (target: EcoScanCauseEffect) => {
    setSelectedTarget(target);
    audio.playEcoScan();
    audio.speak(target.voiceText);

    if (!scannedIds.includes(target.id)) {
      const next = [...scannedIds, target.id];
      setScannedIds(next);
      if (next.length === ECO_SCAN_TARGETS.length) {
        audio.playCelebration();
      }
    }
  };

  const allScanned = scannedIds.length === ECO_SCAN_TARGETS.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-teal-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#FDFBF7] border-4 border-slate-900 rounded-3xl p-6 sm:p-8 shadow-retro-xl text-slate-900 flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-slate-900 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-400 border-2 border-slate-900 rounded-xl shadow-retro-sm">
              <Eye className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h2 className="font-fun text-xl sm:text-2xl font-black text-slate-950">
                Eco Lens Environmental Scan
              </h2>
              <p className="text-xs text-slate-600 font-bold">
                Scan waste causes to see how they affect society nature.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-amber-300 border-2 border-slate-900 rounded-xl font-fun font-black text-xs">
            {scannedIds.length} / {ECO_SCAN_TARGETS.length} SCANNED
          </span>
        </div>

        {/* Target Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {ECO_SCAN_TARGETS.map((t) => {
            const isScanned = scannedIds.includes(t.id);
            const isSelected = selectedTarget?.id === t.id;
            return (
              <button
                key={t.id}
                onClick={() => handleScanTarget(t)}
                className={`p-3 rounded-2xl border-3 border-slate-900 flex flex-col items-center text-center gap-1.5 transition-all shadow-retro-sm ${
                  isSelected
                    ? 'bg-teal-200 ring-2 ring-teal-600'
                    : isScanned
                    ? 'bg-emerald-100'
                    : 'bg-white hover:bg-slate-50'
                }`}
              >
                <span className="text-3xl">{t.icon}</span>
                <span className="text-xs font-black text-slate-900">{t.name}</span>
                {isScanned && (
                  <span className="text-[10px] font-bold text-emerald-800 flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Scanned
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Cause-Effect Card */}
        {selectedTarget && (
          <div className="p-5 bg-teal-50 border-3 border-teal-700 rounded-2xl space-y-3 shadow-retro-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedTarget.icon}</span>
                <h3 className="font-fun font-black text-lg text-teal-950">
                  {selectedTarget.name}
                </h3>
              </div>
              <button
                onClick={() => audio.speak(selectedTarget.voiceText)}
                className="p-1.5 bg-white hover:bg-slate-100 border-2 border-slate-900 rounded-xl shadow-retro-sm"
              >
                <Volume2 className="w-4 h-4 text-slate-900" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div className="p-3 bg-white border-2 border-slate-900 rounded-xl space-y-1">
                <span className="font-black uppercase text-amber-700 text-[10px]">⚠️ CAUSE</span>
                <p className="font-bold text-slate-900">{selectedTarget.cause}</p>
              </div>
              <div className="p-3 bg-white border-2 border-slate-900 rounded-xl space-y-1">
                <span className="font-black uppercase text-rose-700 text-[10px]">⚡ EFFECT</span>
                <p className="font-bold text-slate-900">{selectedTarget.effect}</p>
              </div>
            </div>

            <div className="p-3 bg-emerald-100 border-2 border-emerald-700 rounded-xl text-xs sm:text-sm font-bold text-emerald-950">
              💡 Solution: {selectedTarget.solution}
            </div>
          </div>
        )}

        {/* Footer / Continue button */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-600 font-medium">
            {allScanned
              ? 'All 4 environmental causes unlocked!'
              : 'Click each item above to analyze cause and effect.'}
          </p>

          <button
            onClick={onScanComplete}
            disabled={!allScanned}
            className={`px-6 py-3 font-fun font-black text-xs rounded-2xl border-2 border-slate-900 shadow-retro-md inline-flex items-center gap-2 transition-all ${
              allScanned
                ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 active:translate-x-0.5 active:translate-y-0.5'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed border-slate-400'
            }`}
          >
            <span>View Dashboard</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
};
