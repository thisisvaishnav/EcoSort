import React, { useState } from 'react';
import { MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { BIN_INSTALL_LOCATIONS, BinInstallLocation } from '../../../data/migsunData';
import { audio } from '../../../services/audio';

interface BinLocationChoiceProps {
  onLocationSelected: (locationId: string, bonus: number) => void;
}

export const BinLocationChoice: React.FC<BinLocationChoiceProps> = ({ onLocationSelected }) => {
  const [selectedLocation, setSelectedLocation] = useState<BinInstallLocation | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSelect = (loc: BinInstallLocation) => {
    setSelectedLocation(loc);
    setFeedback(loc.explanation);
    audio.speak(loc.explanation);

    if (loc.isCorrect) {
      audio.playBinInstall();
      setTimeout(() => {
        onLocationSelected(loc.id, loc.scoreBonus);
      }, 1500);
    } else {
      audio.playIncorrect();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#FDFBF7] border-4 border-slate-900 rounded-3xl p-6 sm:p-8 shadow-retro-xl text-slate-900 flex flex-col gap-6">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-300 border-2 border-slate-900 rounded-xl font-fun font-black text-xs uppercase shadow-retro-sm">
            <MapPin className="w-4 h-4 text-slate-950" />
            <span>MISSION 2: INSTALLATION</span>
          </div>
          <h2 className="font-fun text-2xl sm:text-3xl font-black text-slate-950">
            Where should we install the bins?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-lg mx-auto">
            Pick a spot that is easy for residents to reach without blocking walking paths or
            sitting beside delicate plants.
          </p>
        </div>

        {feedback && selectedLocation && (
          <div
            className={`p-4 rounded-2xl border-2 flex items-start gap-3 animate-in zoom-in-95 ${
              selectedLocation.isCorrect
                ? 'bg-emerald-100 border-emerald-600 text-emerald-950'
                : 'bg-rose-100 border-rose-600 text-rose-950'
            }`}
          >
            {selectedLocation.isCorrect ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-700 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-700 mt-0.5" />
            )}
            <p className="text-xs sm:text-sm font-bold">{feedback}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {BIN_INSTALL_LOCATIONS.map((loc) => {
            const isSelected = selectedLocation?.id === loc.id;
            return (
              <button
                key={loc.id}
                onClick={() => handleSelect(loc)}
                className={`p-5 rounded-2xl border-3 border-slate-900 text-left flex flex-col justify-between gap-3 shadow-retro-md transition-all active:translate-x-0.5 active:translate-y-0.5 ${
                  isSelected
                    ? loc.isCorrect
                      ? 'bg-emerald-200 ring-2 ring-emerald-600'
                      : 'bg-rose-100 ring-2 ring-rose-500'
                    : 'bg-white hover:bg-amber-50'
                }`}
              >
                <div className="space-y-1">
                  <h3 className="font-fun font-black text-base text-slate-900">{loc.label}</h3>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {loc.description}
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs font-bold pt-2 border-t border-slate-200">
                  <span className="text-emerald-700">+{loc.scoreBonus} pts</span>
                  <span className="text-slate-900 uppercase">Install Here</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
