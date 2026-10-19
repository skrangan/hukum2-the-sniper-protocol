import React, { useState } from 'react';
import {
  X,
  Briefcase,
  Crosshair,
  Car,
  CheckCircle2,
  Zap,
  Flame,
  Shirt,
  Compass
} from 'lucide-react';
import { TACTICAL_INVENTORY_ITEMS, InventoryItem, InventoryCategory } from '../data/inventoryData';
import { soundManager } from '../game/audio/SoundManager';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  equippedGearId: string;
  equippedCameoId: string;
  equippedAttireId: string;
  onEquipItem: (item: InventoryItem) => void;
  onDeployAction?: (item: InventoryItem) => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  onClose,
  equippedGearId,
  equippedCameoId,
  equippedAttireId,
  onEquipItem,
  onDeployAction
}) => {
  const [activeCategory, setActiveCategory] = useState<'ALL' | InventoryCategory>('ALL');
  const [selectedItem, setSelectedItem] = useState<InventoryItem>(TACTICAL_INVENTORY_ITEMS[0]);

  if (!isOpen) return null;

  const filteredItems =
    activeCategory === 'ALL'
      ? TACTICAL_INVENTORY_ITEMS
      : TACTICAL_INVENTORY_ITEMS.filter((item) => item.category === activeCategory);

  const isEquipped = (item: InventoryItem) => {
    return (
      item.id === equippedGearId ||
      item.id === equippedCameoId ||
      item.id === equippedAttireId ||
      item.id === 'gold_aviators'
    );
  };

  const getCategoryIcon = (category: InventoryCategory) => {
    switch (category) {
      case 'GEAR':
        return <Crosshair className="w-4 h-4 text-amber-400" />;
      case 'CAMEO':
        return <Car className="w-4 h-4 text-amber-300" />;
      case 'HAZARD':
        return <Flame className="w-4 h-4 text-emerald-400" />;
      case 'ATTIRE':
        return <Shirt className="w-4 h-4 text-amber-200" />;
    }
  };

  const getRarityBadge = (rarity: InventoryItem['rarity']) => {
    switch (rarity) {
      case 'SIGNATURE':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      case 'SYNDICATE':
        return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'TACTICAL':
        return 'bg-stone-700/60 text-stone-200 border-stone-500/50';
      case 'COVERT':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
      data-testid="inventory-modal"
    >
      <div className="relative w-full max-w-5xl bg-gradient-to-b from-stone-900 via-stone-950 to-black border border-amber-600/40 rounded-3xl p-6 shadow-[0_0_70px_rgba(0,0,0,0.95)] flex flex-col max-h-[88vh] text-stone-100">
        {/* Top Brass Accent Trim */}
        <div className="absolute top-0 inset-x-12 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800/90">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/25 to-yellow-600/10 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-lg">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-amber-400/90 font-bold">
                MUTHUVEL PANDIAN • PERSONAL EFFECTS & UNDERWORLD ALLIES
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider font-display">
                INVENTORY <span className="text-amber-400">& SYNDICATE CONTACTS</span>
              </h3>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center space-x-1.5 bg-stone-950/90 p-1.5 rounded-2xl border border-stone-800">
            {(
              [
                { id: 'ALL', label: 'All Items' },
                { id: 'GEAR', label: 'Shades & Rifles' },
                { id: 'HAZARD', label: 'Street Traps' },
                { id: 'CAMEO', label: 'Allies' },
                { id: 'ATTIRE', label: 'Wardrobe' }
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  soundManager.playUiClick();
                  setActiveCategory(tab.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  activeCategory === tab.id
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 shadow'
                    : 'text-stone-400 hover:text-white hover:bg-stone-900'
                }`}
              >
                {tab.label}
              </button>
            ))}

            <button
              onClick={() => {
                soundManager.playUiClick();
                onClose();
              }}
              data-testid="close-inventory"
              className="p-1.5 ml-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition"
              title="Close Inventory"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Split Body */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 my-4 overflow-hidden">
          {/* Left Column: Item Cards Grid */}
          <div className="lg:col-span-7 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-3 content-start">
            {filteredItems.map((item) => {
              const selected = selectedItem.id === item.id;
              const equipped = isEquipped(item);

              return (
                <div
                  key={item.id}
                  data-testid={`inventory-item-${item.id}`}
                  onClick={() => {
                    soundManager.playUiClick();
                    setSelectedItem(item);
                  }}
                  className={`group relative rounded-2xl p-3.5 border text-left cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                    selected
                      ? 'bg-gradient-to-br from-stone-800/95 via-stone-900 to-stone-950 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.2)]'
                      : 'bg-stone-900/70 border-stone-800/90 hover:border-stone-600 hover:bg-stone-900'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold text-stone-400 tracking-wide truncate">
                        {item.code}
                      </span>
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${getRarityBadge(
                          item.rarity
                        )}`}
                      >
                        {item.rarity}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-amber-500/40 bg-stone-950 flex-shrink-0">
                        <img
                          src={item.portrait || '/assets/portraits/tiger.jpg'}
                          alt={item.name}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute bottom-1 right-1 bg-stone-950/90 p-1 rounded-md border border-stone-700">
                          {getCategoryIcon(item.category)}
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-black text-white leading-snug truncate">
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-amber-300/90 font-dialogue italic truncate mt-0.5">
                          {item.subtitleTanglish}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-stone-800/80 text-[10px] font-mono">
                    {item.hotkey ? (
                      <span className="px-2 py-0.5 rounded bg-stone-950 border border-stone-700 text-amber-300">
                        KEY [{item.hotkey}]
                      </span>
                    ) : (
                      <span className="text-stone-500">ATTIRE</span>
                    )}

                    {equipped ? (
                      <span className="flex items-center space-x-1 text-emerald-400 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>SELECTED</span>
                      </span>
                    ) : (
                      <span className="text-stone-400 group-hover:text-amber-300">VIEW DETAILS ▸</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Detailed Character / Item Dossier */}
          <div className="lg:col-span-5 bg-stone-950/95 border border-stone-800 rounded-2xl p-5 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="relative h-44 rounded-2xl overflow-hidden border border-amber-500/40 mb-4 bg-stone-900">
                <img
                  src={selectedItem.portrait || '/assets/portraits/tiger.jpg'}
                  alt={selectedItem.name}
                  className="w-full h-full object-cover object-top filter contrast-115"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

                <div className="absolute top-3 left-3 flex items-center space-x-2">
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border backdrop-blur-md ${getRarityBadge(
                      selectedItem.rarity
                    )}`}
                  >
                    {selectedItem.rarity}
                  </span>
                </div>

                {selectedItem.hotkey && (
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/80 border border-amber-500/40 text-[10px] font-mono text-amber-300 font-bold">
                    KEY [{selectedItem.hotkey}]
                  </div>
                )}

                <div className="absolute bottom-3 left-3 right-3">
                  <div className="text-[10px] text-amber-400 uppercase tracking-wider font-bold">
                    {selectedItem.code}
                  </div>
                  <h4 className="text-lg font-black text-white leading-tight font-display uppercase tracking-wide">
                    {selectedItem.name}
                  </h4>
                </div>
              </div>

              <div className="bg-stone-900/90 border-l-4 border-amber-400 px-3.5 py-2 rounded-r-xl mb-3">
                <div className="text-xs font-bold text-amber-300 font-dialogue">
                  {selectedItem.subtitleTanglish}
                </div>
              </div>

              <p className="text-xs text-stone-300 leading-relaxed mb-3">
                {selectedItem.description}
              </p>

              <div className="space-y-2.5 bg-stone-900/70 p-3.5 rounded-xl border border-stone-800/90 mb-3">
                <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  CHARACTER & ITEM PROFILE
                </div>
                {selectedItem.stats.map((st, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-stone-400 font-medium">{st.label}</span>
                      <span className="font-bold text-amber-300">{st.value}</span>
                    </div>
                    <div className="w-full h-1.5 bg-stone-950 rounded-full overflow-hidden border border-stone-800">
                      <div
                        className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 rounded-full"
                        style={{ width: `${st.barPercent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-start space-x-2 text-[11px] text-stone-400 bg-stone-900/40 p-2.5 rounded-xl border border-stone-800/60">
                <Compass className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="italic">{selectedItem.loreNote}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-4 mt-4 border-t border-stone-800">
              <button
                onClick={() => {
                  soundManager.playEquipGear();
                  onEquipItem(selectedItem);
                }}
                data-testid="equip-selected-item"
                className={`flex-1 py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition flex items-center justify-center space-x-2 ${
                  isEquipped(selectedItem)
                    ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300'
                    : 'bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 hover:brightness-110 shadow-lg'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isEquipped(selectedItem) ? 'Currently Active' : 'Select for Scene'}</span>
              </button>

              {onDeployAction && (
                <button
                  onClick={() => {
                    soundManager.playEquipGear();
                    onDeployAction(selectedItem);
                    onClose();
                  }}
                  className="py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 border border-amber-500/30 text-amber-300 font-bold text-xs uppercase tracking-wider transition flex items-center space-x-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Use Now</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
