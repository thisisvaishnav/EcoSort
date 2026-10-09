import React from 'react';
import { ItemData } from '../../types/game';
import { ALL_BINS } from '../../data/bins';
import { Box } from 'lucide-react';

interface MapItemCardProps {
  item: ItemData;
  onInspect3D?: (item: ItemData) => void;
  className?: string;
}

export const MapItemCard: React.FC<MapItemCardProps> = ({ item, onInspect3D, className = '' }) => {
  const binInfo = ALL_BINS[item.bin];
  const spriteSrc = `/assets/items/${item.modelType.replace(/^(banana|plate|medicine|toy_car)/, (m) => {
    if (m === 'banana') return 'banana_peel';
    if (m === 'plate') return 'food_plate';
    if (m === 'medicine') return 'medicine_bottle';
    if (m === 'toy_car') return 'toy_car';
    return m;
  })}.png`;

  return (
    <div
      className={`relative bg-slate-900/90 rounded-2xl border border-slate-800 p-4 hover:border-slate-700 transition-all shadow-xl flex flex-col justify-between group ${className}`}
    >
      <div>
        {/* Top Header Badge */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span
            className="text-[11px] font-bold px-2 py-0.5 rounded-full border"
            style={{
              backgroundColor: `${binInfo.color}20`,
              borderColor: `${binInfo.color}60`,
              color: binInfo.color,
            }}
          >
            {binInfo.label}
          </span>
          <span className="text-xs text-slate-400 font-mono">{(item.baseWeight * 1000).toFixed(0)}g</span>
        </div>

        {/* Sprite Image Container */}
        <div className="relative w-full h-36 flex items-center justify-center p-2 my-1 bg-slate-950/50 rounded-xl overflow-hidden border border-slate-800/80 group-hover:border-emerald-500/30 transition-colors">
          <img
            src={spriteSrc}
            alt={item.name}
            className="max-h-full max-w-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] transform group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Fallback to emoji if asset path not resolved
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute top-2 right-2 text-xl opacity-80">{item.icon}</div>
        </div>

        {/* Item Title & STE Fact */}
        <h4 className="text-sm font-bold text-slate-100 mt-2 mb-1">{item.name}</h4>
        <p className="text-xs text-slate-400 leading-relaxed min-h-[36px]">{item.fact}</p>
      </div>

      {/* Action Button */}
      {onInspect3D && (
        <button
          onClick={() => onInspect3D(item)}
          className="mt-3 w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-emerald-600/30 border border-slate-700 hover:border-emerald-500/60 text-slate-200 hover:text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
        >
          <Box className="w-3.5 h-3.5 text-emerald-400" />
          <span>Inspect 3D Model</span>
        </button>
      )}
    </div>
  );
};
