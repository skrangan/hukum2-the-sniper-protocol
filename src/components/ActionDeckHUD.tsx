import React, { useState } from 'react';
import { Crosshair, Zap, Briefcase, Flame } from 'lucide-react';
import { TACTICAL_INVENTORY_ITEMS, InventoryItem } from '../data/inventoryData';
import { soundManager } from '../game/audio/SoundManager';

interface ActionDeckHUDProps {
  onFlipSpecs: () => void;
  isHukumMode: boolean;
  onSniperPing?: () => void;
  onTaxiDrift?: () => void;
  onCameoSummon?: () => void;
  onOpenInventory?: () => void;
  equippedCameoId?: string;
}

export const ActionDeckHUD: React.FC<ActionDeckHUDProps> = ({
  onFlipSpecs,
  isHukumMode,
  onSniperPing,
  onTaxiDrift,
  onCameoSummon,
  onOpenInventory,
  equippedCameoId = 'mathew_mercedes'
}) => {
  const [hoveredItem, setHoveredItem] = useState<InventoryItem | null>(null);

  const sniperItem = TACTICAL_INVENTORY_ITEMS.find((i) => i.id === 'sniper_designator')!;
  const coconutItem = TACTICAL_INVENTORY_ITEMS.find((i) => i.id === 'pollachi_coconut')!;
  const cameoItem =
    TACTICAL_INVENTORY_ITEMS.find((i) => i.id === equippedCameoId) ||
    TACTICAL_INVENTORY_ITEMS.find((i) => i.id === 'mathew_mercedes')!;
  const specsItem = TACTICAL_INVENTORY_ITEMS.find((i) => i.id === 'gold_aviators')!;

  return (
    <div
      className="absolute bottom-5 right-5 z-30 flex flex-col items-end space-y-2.5 select-none"
      data-testid="action-deck-hud"
    >
      {/* Dynamic Hover Inspection Tooltip */}
      {hoveredItem && (
        <div className="w-80 bg-slate-950/95 backdrop-blur-xl border border-amber-500/40 rounded-2xl p-3.5 shadow-[0_10px_40px_rgba(0,0,0,0.9)] text-left animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between text-[10px] font-mono text-amber-400 uppercase tracking-widest mb-1">
            <span>{hoveredItem.code}</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30">
              {hoveredItem.rarity}
            </span>
          </div>
          <div className="flex items-center space-x-2.5 mb-1.5">
            <img
              src={hoveredItem.portrait || '/assets/portraits/tiger.jpg'}
              alt={hoveredItem.name}
              className="w-10 h-10 rounded-lg object-cover object-top border border-amber-500/40"
            />
            <div>
              <div className="text-xs font-black text-white uppercase leading-tight">
                {hoveredItem.name}
              </div>
              <div className="text-[11px] text-amber-300 font-dialogue italic">
                {hoveredItem.subtitleTanglish}
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-300 leading-snug mb-2">
            {hoveredItem.description}
          </p>
          <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-800/80">
            {hoveredItem.stats.slice(0, 2).map((st, idx) => (
              <div key={idx} className="bg-slate-900/90 px-2 py-1 rounded-lg border border-slate-800">
                <div className="text-[9px] text-slate-400 uppercase">{st.label}</div>
                <div className="text-[11px] font-mono font-bold text-amber-300">{st.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tactical Inventory & Quick-Deploy Belt */}
      <div className="bg-slate-950/90 backdrop-blur-xl p-2 rounded-2xl border border-amber-500/30 shadow-[0_10px_35px_rgba(0,0,0,0.85)] flex items-center space-x-2">
        {/* Slot [1] Laser Overwatch */}
        <button
          onClick={() => {
            soundManager.playSniperPing();
            if (onSniperPing) onSniperPing();
          }}
          onMouseEnter={() => setHoveredItem(sniperItem)}
          onMouseLeave={() => setHoveredItem(null)}
          data-testid="slot-sniper-ping"
          className="group relative flex items-center space-x-2 px-3 py-2 bg-slate-900/95 hover:bg-slate-800/90 active:scale-95 rounded-xl border border-red-500/30 hover:border-red-400 transition-all"
        >
          <div className="w-8 h-8 rounded-lg bg-red-950/80 border border-red-500/40 flex items-center justify-center text-red-400 group-hover:scale-105 transition">
            <Crosshair className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="text-[9px] font-mono text-red-400 font-bold uppercase tracking-wider">
              [1] OVERWATCH
            </div>
            <div className="text-xs font-black text-slate-100 leading-tight">Laser Lock</div>
          </div>
        </button>

        {/* Slot [2] Kinetic Hazard / Coconut & Auto Trigger */}
        <button
          onClick={() => {
            if (onTaxiDrift) onTaxiDrift();
          }}
          onMouseEnter={() => setHoveredItem(coconutItem)}
          onMouseLeave={() => setHoveredItem(null)}
          data-testid="slot-hazard-trigger"
          className="group relative flex items-center space-x-2 px-3 py-2 bg-slate-900/95 hover:bg-slate-800/90 active:scale-95 rounded-xl border border-amber-500/30 hover:border-amber-400 transition-all"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-105 transition">
            <Flame className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="text-[9px] font-mono text-amber-400 font-bold uppercase tracking-wider">
              [2] KINETIC TRAP
            </div>
            <div className="text-xs font-black text-slate-100 leading-tight">Rickshaw Trap</div>
          </div>
        </button>

        {/* Slot [3] Syndicate Cameo Summon */}
        <button
          onClick={() => {
            soundManager.playCameoSummon();
            if (onCameoSummon) onCameoSummon();
          }}
          onMouseEnter={() => setHoveredItem(cameoItem)}
          onMouseLeave={() => setHoveredItem(null)}
          data-testid="slot-cameo-summon"
          className="group relative flex items-center space-x-2 px-3 py-2 bg-slate-900/95 hover:bg-slate-800/90 active:scale-95 rounded-xl border border-purple-500/30 hover:border-purple-400 transition-all"
        >
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-purple-400/50 bg-purple-950 flex-shrink-0">
            <img
              src={cameoItem.portrait || '/assets/portraits/mathew.jpg'}
              alt={cameoItem.name}
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div className="text-left">
            <div className="text-[9px] font-mono text-purple-300 font-bold uppercase tracking-wider">
              [3] SYNDICATE
            </div>
            <div className="text-xs font-black text-slate-100 leading-tight">
              {cameoItem.id === 'narasimha_melee'
                ? 'Narasimha'
                : cameoItem.id === 'vimal_taxi'
                ? 'Vimal Taxi'
                : 'Mathew W123'}
            </div>
          </div>
        </button>

        {/* Slot [I] Open Full Armory & Loadout Dossier */}
        {onOpenInventory && (
          <button
            onClick={() => {
              soundManager.playUiClick();
              onOpenInventory();
            }}
            data-testid="hud-open-inventory"
            className="flex items-center space-x-1.5 px-3 py-2 bg-amber-500/15 hover:bg-amber-500/25 active:scale-95 rounded-xl border border-amber-500/40 text-amber-300 transition-all"
            title="Open Tactical Inventory & Loadout [I]"
          >
            <Briefcase className="w-4 h-4" />
            <div className="text-left hidden sm:block">
              <div className="text-[9px] font-mono font-bold uppercase text-amber-400">[I] ARMORY</div>
              <div className="text-xs font-black text-white leading-tight">Inventory</div>
            </div>
          </button>
        )}
      </div>

      {/* Primary Spectacle Flip Button (24K Aviator Shades) */}
      <button
        onClick={onFlipSpecs}
        onMouseEnter={() => setHoveredItem(specsItem)}
        onMouseLeave={() => setHoveredItem(null)}
        disabled={isHukumMode}
        data-testid="flip-specs-button"
        className={`group relative overflow-hidden px-6 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-300 shadow-2xl active:scale-95 ${
          isHukumMode
            ? 'bg-red-950/95 border-2 border-red-500 text-red-300 shadow-[0_0_30px_rgba(239,68,68,0.5)] cursor-default'
            : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 hover:brightness-110 shadow-[0_0_30px_rgba(245,158,11,0.55)] border-2 border-yellow-200'
        }`}
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-slate-950/40 shadow-md flex-shrink-0 bg-slate-950">
            <img
              src="/assets/portraits/tiger.jpg"
              alt="Tiger Spectacle Flip"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div className="text-left">
            <div className="leading-none text-[10px] font-mono font-bold tracking-widest opacity-85">
              {isHukumMode ? 'BULLET-TIME OVERWATCH ENGAGED' : 'OPT-01 // PRESS [SPACE]'}
            </div>
            <div className="text-base font-black tracking-wider font-display flex items-center space-x-1.5 mt-0.5">
              <span>{isHukumMode ? 'HUKUM PROTOCOL (x10)' : 'FLIP AVIATOR SPECS'}</span>
              <Zap className="w-4 h-4 fill-current inline" />
            </div>
          </div>
        </div>
      </button>
    </div>
  );
};
