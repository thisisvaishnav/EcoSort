import React, { useState } from 'react';
import { ItemData } from '../../types/game';
import { MapItemModelType } from '../world/items/types';
import { MapItemPreview } from './MapItemPreview';
import { MapItemCard } from './MapItemCard';
import { ALL_BINS } from '../../data/bins';
import { X, Box, Info } from 'lucide-react';

interface MapItemGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ItemData[];
}

export const MapItemGalleryModal: React.FC<MapItemGalleryModalProps> = ({
  isOpen,
  onClose,
  items,
}) => {
  const [selectedItem, setSelectedItem] = useState<ItemData>(items[0] || null);
  const [filterBin, setFilterBin] = useState<string>('all');

  if (!isOpen) return null;

  const filteredItems = items.filter((item) => {
    if (filterBin === 'all') return true;
    return item.bin === filterBin;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>3D Map Item Components</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                  Production Ready
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                10 interactive waste sorting items for open world map placement and sorting tables.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Left 3D Turntable, Right Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: 3D Live Turntable Inspector (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {selectedItem && (
              <>
                <MapItemPreview
                  modelType={selectedItem.modelType as MapItemModelType}
                  title={`${selectedItem.name} (3D View)`}
                  height={300}
                />

                <div className="bg-slate-950/60 rounded-2xl border border-slate-800 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-100">{selectedItem.name}</span>
                    <span
                      className="text-xs font-semibold px-2.5 py-0.5 rounded-full border"
                      style={{
                        backgroundColor: `${ALL_BINS[selectedItem.bin]?.color}20`,
                        borderColor: `${ALL_BINS[selectedItem.bin]?.color}60`,
                        color: ALL_BINS[selectedItem.bin]?.color,
                      }}
                    >
                      {ALL_BINS[selectedItem.bin]?.label}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex items-start gap-2">
                    <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{selectedItem.fact}</span>
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                    <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                      <span className="block text-[10px] text-slate-500 uppercase font-mono">Weight</span>
                      <span className="font-semibold text-slate-200 font-mono">
                        {(selectedItem.baseWeight * 1000).toFixed(0)} grams
                      </span>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                      <span className="block text-[10px] text-slate-500 uppercase font-mono">Unlock Level</span>
                      <span className="font-semibold text-slate-200 font-mono">
                        Level {selectedItem.unlockLevel}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Column: Filter Tabs + Grid of Items (7 cols) */}
          <div className="lg:col-span-7 flex flex-col">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 mb-4">
              {['all', 'wet', 'dry', 'hazardous', 'paper', 'plastic', 'ewaste'].map((b) => (
                <button
                  key={b}
                  onClick={() => setFilterBin(b)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium transition-colors ${
                    filterBin === b
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {b === 'all' ? 'All (10)' : ALL_BINS[b as keyof typeof ALL_BINS]?.label || b}
                </button>
              ))}
            </div>

            {/* Grid of Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto max-h-[520px] pr-1">
              {filteredItems.map((item) => (
                <MapItemCard
                  key={item.id}
                  item={item}
                  onInspect3D={(it) => setSelectedItem(it)}
                  className={selectedItem?.id === item.id ? 'ring-2 ring-emerald-500/80 border-emerald-500/60' : ''}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between text-xs text-slate-400">
          <span>ASD-STE100 compliant pedagogical waste sorting items.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
