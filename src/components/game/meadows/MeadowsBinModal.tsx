import React from 'react';
import { BinType, ItemData } from '../../../types/game';
import { Apple, Package, AlertTriangle, Trash2, X } from 'lucide-react';

export interface MeadowsBinModalProps {
  item: ItemData;
  onSelectBin: (bin: BinType) => void;
  onCancel: () => void;
}

const BIN_OPTIONS: { bin: BinType; name: string; subtitle: string; colorClass: string; icon: React.ReactNode }[] = [
  {
    bin: 'wet',
    name: 'Wet / Organic',
    subtitle: 'Food scraps, peels, leaves',
    colorClass: 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.35)]',
    icon: <Apple className="w-6 h-6 shrink-0" />,
  },
  {
    bin: 'dry',
    name: 'Dry / Recyclable',
    subtitle: 'Plastic, paper, metal, glass',
    colorClass: 'bg-blue-600 hover:bg-blue-500 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.35)]',
    icon: <Package className="w-6 h-6 shrink-0" />,
  },
  {
    bin: 'hazardous',
    name: 'Hazardous',
    subtitle: 'Batteries, bulbs, chemicals',
    colorClass: 'bg-rose-600 hover:bg-rose-500 border-rose-400 text-white shadow-[0_0_15px_rgba(225,29,72,0.35)]',
    icon: <AlertTriangle className="w-6 h-6 shrink-0" />,
  },
  {
    bin: 'residual',
    name: 'Sanitary / Reject',
    subtitle: 'Diapers, masks, wrappers',
    colorClass: 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-white shadow-[0_0_15px_rgba(30,41,59,0.5)]',
    icon: <Trash2 className="w-6 h-6 shrink-0" />,
  },
];

export const MeadowsBinModal: React.FC<MeadowsBinModalProps> = ({
  item,
  onSelectBin,
  onCancel,
}) => {
  return (
    <div
      data-testid="meadows-bin-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200 pointer-events-auto"
    >
      <div className="relative w-full max-w-md p-5 rounded-3xl bg-slate-900/95 border-2 border-emerald-500/50 shadow-2xl text-slate-100 flex flex-col items-center gap-4">
        {/* Cancel button */}
        <button
          onClick={onCancel}
          data-testid="bin-modal-close"
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          title="Put back on ground"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Selected Item Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-400/40 flex items-center justify-center text-3xl shadow-inner mb-2 animate-bounce">
            {item.icon}
          </div>
          <h3 className="text-xl font-fun font-black text-white">
            Where does <span className="text-emerald-300">{item.name}</span> go?
          </h3>
          <p className="text-xs text-slate-300 font-sans mt-0.5">
            Select the correct colour-coded bin to sort this item.
          </p>
        </div>

        {/* 4 Large Coloured Bin Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full mt-1">
          {BIN_OPTIONS.map((opt) => (
            <button
              key={opt.bin}
              data-testid={`bin-select-${opt.bin}`}
              onClick={() => onSelectBin(opt.bin)}
              className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all transform active:scale-95 text-left font-fun ${opt.colorClass}`}
            >
              <div className="p-2 rounded-xl bg-black/20 shrink-0">
                {opt.icon}
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-sm tracking-wide">{opt.name}</span>
                <span className="text-[10px] opacity-80 font-sans font-normal mt-0.5">
                  {opt.subtitle}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
