import React, { useState, useEffect } from 'react';
import { BinType } from '../../../../types/game';
import { SOCIETY_MANIFEST } from '../../manifest';
import { Phase1Step } from './types';
import { Clock, Truck, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export interface Phase1ControllerProps {
  onComplete: () => void;
  onAddScore: (points: number) => void;
  onVanArrival?: () => void;
}

// 15 Standard items sampled from the 4 bins
const SAMPLE_ITEMS: Array<{ id: string; name: string; bin: BinType }> = [
  { id: 'banana_peel', name: 'Banana Peel', bin: 'wet' },
  { id: 'apple_core', name: 'Apple Core', bin: 'wet' },
  { id: 'veggie_scraps', name: 'Veggie Scraps', bin: 'wet' },
  { id: 'bread_crust', name: 'Bread Crust', bin: 'wet' },
  { id: 'newspaper', name: 'Old Newspaper', bin: 'dry' },
  { id: 'cardboard_box', name: 'Cardboard Box', bin: 'dry' },
  { id: 'plastic_bottle', name: 'Plastic Bottle', bin: 'dry' },
  { id: 'metal_can', name: 'Soda Can', bin: 'dry' },
  { id: 'dry_magazine', name: 'Glossy Magazine', bin: 'dry' },
  { id: 'battery', name: 'AA Battery', bin: 'hazardous' },
  { id: 'medicine_bottle', name: 'Expired Medicine', bin: 'hazardous' },
  { id: 'light_bulb', name: 'Broken Light Bulb', bin: 'hazardous' },
  { id: 'floor_sweepings', name: 'Floor Sweepings', bin: 'residual' },
  { id: 'broken_pen', name: 'Broken Pen', bin: 'residual' },
  { id: 'dusty_rags', name: 'Dirty Dusting Rag', bin: 'residual' },
];

export const Phase1Controller: React.FC<Phase1ControllerProps> = ({
  onComplete,
  onAddScore,
  onVanArrival,
}) => {
  const [step, setStep] = useState<Phase1Step>('SORT_CHOICE');
  const [timerSeconds, setTimerSeconds] = useState<number>(SOCIETY_MANIFEST.timerSeconds);
  const [itemsSorted, setItemsSorted] = useState<number>(0);
  const [currentItemIndex, setCurrentItemIndex] = useState<number>(0);
  const [softFailed, setSoftFailed] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);

  // 120s Countdown timer during SORTING
  useEffect(() => {
    if (step !== 'SORTING') return;

    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step]);

  const handleTimeExpire = () => {
    setSoftFailed(true);
    setStep('VAN_ARRIVING');
    onVanArrival?.();
  };

  const handleChooseSort = () => {
    onAddScore(25);
    setStep('SORTING');
  };

  const handleChooseMix = () => {
    setFeedback({
      isCorrect: false,
      text: 'Mixed waste cannot be recycled. Please sort into sacks.',
    });
  };

  const handleSortItem = (selectedBin: BinType) => {
    const currentItem = SAMPLE_ITEMS[currentItemIndex];
    if (selectedBin === currentItem.bin) {
      onAddScore(10);
      setFeedback({ isCorrect: true, text: `Correct! ${currentItem.name} placed in sack.` });
      const nextCount = itemsSorted + 1;
      setItemsSorted(nextCount);

      if (nextCount >= SAMPLE_ITEMS.length) {
        setStep('VAN_ARRIVING');
        onVanArrival?.();
      } else {
        setCurrentItemIndex((prev) => prev + 1);
      }
    } else {
      setFeedback({
        isCorrect: false,
        text: `Incorrect. Look closely at the sack labels!`,
      });
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-30 select-none">
      {/* ── Top HUD ────────────────────────────────────────────────────────── */}
      <div className="pointer-events-auto flex items-center justify-between max-w-4xl mx-auto w-full">
        {step === 'SORTING' && (
          <div className="flex items-center gap-4 bg-slate-900/90 border border-slate-700/80 px-4 py-2.5 rounded-2xl shadow-xl backdrop-blur">
            <div className="flex items-center gap-2 text-amber-400 font-mono font-bold text-sm">
              <Clock className="w-4 h-4 animate-pulse" />
              <span>{formatTime(timerSeconds)}</span>
            </div>
            <div className="h-4 w-px bg-slate-700" />
            <div className="text-xs font-semibold text-slate-300">
              Items: <span className="text-emerald-400 font-bold">{itemsSorted}</span> / {SAMPLE_ITEMS.length}
            </div>
            <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
              <div
                className="bg-emerald-400 h-full transition-all duration-300"
                style={{ width: `${(itemsSorted / SAMPLE_ITEMS.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Mix-or-Sort Decision Modal ──────────────────────────────────────── */}
      {step === 'SORT_CHOICE' && (
        <div className="pointer-events-auto max-w-md w-full mx-auto my-auto p-6 rounded-3xl bg-slate-900/95 border-2 border-slate-800 shadow-2xl backdrop-blur text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-xl font-black font-fun text-white tracking-wide">
              Waste Pile Decision
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              A large waste pile sits in the service lane. How should we prepare it for collection?
            </p>
          </div>

          {feedback && !feedback.isCorrect && (
            <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {feedback.text}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleChooseMix}
              className="tactile-btn p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-fun font-bold text-xs flex flex-col items-center gap-1.5 transition-colors"
            >
              <span>Mix All Waste</span>
              <span className="text-[10px] text-slate-400 font-normal">Fast, but causes pollution</span>
            </button>

            <button
              onClick={handleChooseSort}
              data-testid="choose-sort-btn"
              className="tactile-btn p-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 border border-emerald-400 text-slate-950 font-fun font-black text-xs flex flex-col items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-colors"
            >
              <span>Sort Into 4 Sacks</span>
              <span className="text-[10px] text-slate-900 font-semibold">+25 Pts Eco Bonus</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Active Sorting Interface ────────────────────────────────────────── */}
      {step === 'SORTING' && currentItemIndex < SAMPLE_ITEMS.length && (
        <div className="pointer-events-auto max-w-md w-full mx-auto my-auto p-5 rounded-3xl bg-slate-900/95 border-2 border-slate-800 shadow-2xl backdrop-blur space-y-4">
          <div className="text-center space-y-1">
            <span className="text-[10px] tracking-wider font-bold uppercase text-slate-400">
              Scattered Waste Item ({currentItemIndex + 1} of {SAMPLE_ITEMS.length})
            </span>
            <h4 className="text-lg font-black text-white font-fun">
              {SAMPLE_ITEMS[currentItemIndex].name}
            </h4>
          </div>

          {feedback && (
            <div
              className={`p-2 rounded-xl text-xs text-center font-medium ${
                feedback.isCorrect
                  ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/20 border border-rose-500/30 text-rose-300'
              }`}
            >
              {feedback.text}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => handleSortItem('wet')}
              data-testid="sort-sack-wet"
              className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-fun font-bold text-xs flex items-center justify-center gap-2 border border-emerald-400 shadow-sm transition-all"
            >
              <span>Green Sack (Wet)</span>
            </button>
            <button
              onClick={() => handleSortItem('dry')}
              data-testid="sort-sack-dry"
              className="p-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-fun font-bold text-xs flex items-center justify-center gap-2 border border-blue-400 shadow-sm transition-all"
            >
              <span>Blue Sack (Dry)</span>
            </button>
            <button
              onClick={() => handleSortItem('hazardous')}
              data-testid="sort-sack-hazardous"
              className="p-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-fun font-bold text-xs flex items-center justify-center gap-2 border border-rose-400 shadow-sm transition-all"
            >
              <span>Red Sack (Danger)</span>
            </button>
            <button
              onClick={() => handleSortItem('residual')}
              data-testid="sort-sack-residual"
              className="p-3 rounded-2xl bg-slate-700 hover:bg-slate-600 text-white font-fun font-bold text-xs flex items-center justify-center gap-2 border border-slate-500 shadow-sm transition-all"
            >
              <span>Black Sack (Rest)</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Van Arrival Sequence Modal ─────────────────────────────────────── */}
      {step === 'VAN_ARRIVING' && (
        <div className="pointer-events-auto max-w-md w-full mx-auto my-auto p-6 rounded-3xl bg-slate-900/95 border-2 border-emerald-500/40 shadow-2xl backdrop-blur text-center space-y-5 animate-in fade-in zoom-in-95">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
            <Truck className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-xl font-black font-fun text-white tracking-wide">
              Garbage Van Arrived!
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {softFailed
                ? 'Time expired! The van loaded what was ready. You can continue to Mission 2.'
                : 'All waste sorted cleanly into sacks! The collection truck drives away.'}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 flex items-center justify-between">
            <span>Mission 1 Status:</span>
            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              CLEANUP COMPLETE
            </span>
          </div>

          <button
            onClick={onComplete}
            data-testid="phase1-next-mission-btn"
            className="tactile-btn w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-fun font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <span>PROCEED TO MISSION 2</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <div />
    </div>
  );
};
