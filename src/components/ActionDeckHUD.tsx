import React, { useState } from 'react';
import { Crosshair, Zap, Briefcase, Flame, Bell } from 'lucide-react';
import { TACTICAL_INVENTORY_ITEMS, InventoryItem } from '../data/inventoryData';
import { soundManager } from '../game/audio/SoundManager';

interface ActionDeckHUDProps {
  onFlipSpecs: () => void;
  isHukumMode: boolean;
  onSniperPing?: () => void;
  onTaxiDrift?: () => void;
  onDistract?: () => void;
  onCameoSummon?: () => void;
  onOpenInventory?: () => void;
  equippedCameoId?: string;
  currentLevel?: number;
  sniperStatus?: 'STANDBY' | 'LOCKED' | 'HOLD_FIRE_VIJI' | 'FIRING';
}

export const ActionDeckHUD: React.FC<ActionDeckHUDProps> = ({
  onFlipSpecs,
  isHukumMode,
  onSniperPing,
  onTaxiDrift,
  onDistract,
  onCameoSummon,
  onOpenInventory,
  equippedCameoId = 'mathew_mercedes',
  currentLevel = 1,
  sniperStatus = 'STANDBY'
}) => {
  const [hoveredItem, setHoveredItem] = useState<InventoryItem | null>(null);

  const sniperItem = TACTICAL_INVENTORY_ITEMS.find((i) => i.id === 'sniper_designator')!;
  const coconutItem = TACTICAL_INVENTORY_ITEMS.find((i) => i.id === 'pollachi_coconut')!;
  const bellItem =
    TACTICAL_INVENTORY_ITEMS.find((i) => i.id === 'temple_bell_whistle') || coconutItem;
  const cameoItem =
    TACTICAL_INVENTORY_ITEMS.find((i) => i.id === equippedCameoId) ||
    TACTICAL_INVENTORY_ITEMS.find((i) => i.id === 'mathew_mercedes')!;
  const specsItem = TACTICAL_INVENTORY_ITEMS.find((i) => i.id === 'gold_aviators')!;

  const getTrapLabel = (lvl: number) => {
    switch (lvl) {
      case 1:
        return 'Kick Coconut';
      case 2:
        return 'Shake Specs';
      case 3:
        return 'Kettle Steam';
      case 4:
        return 'Drop Crane';
      case 5:
        return 'Spin Table';
      case 6:
        return 'Angle Mirror';
      case 7:
        return 'Breach Trap';
      case 8:
        return 'Bass Charge';
      case 9:
        return 'Jet Turbine';
      case 10:
        return 'Sever Tether';
      default:
        return 'Street Trap';
    }
  };

  return (
    <div
      className="absolute bottom-3 right-3 sm:bottom-5 sm:right-5 z-30 flex flex-col items-end space-y-2 select-none max-w-[92vw]"
      data-testid="action-deck-hud"
    >
      {/* Grounded Item Inspection Card on Hover (Desktop) */}
      {hoveredItem && (
        <div className="hidden md:block w-80 bg-stone-950/95 backdrop-blur-xl border border-amber-500/40 rounded-2xl p-3.5 shadow-[0_10px_40px_rgba(0,0,0,0.9)] text-left animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between text-[10px] text-amber-400 uppercase tracking-wider mb-1 font-bold">
            <span>{hoveredItem.code}</span>
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
          <p className="text-[11px] text-stone-300 leading-snug mb-2">
            {hoveredItem.description}
          </p>
          <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-stone-800/80">
            {hoveredItem.stats.slice(0, 2).map((st, idx) => (
              <div key={idx} className="bg-stone-900/90 px-2 py-1 rounded-lg border border-stone-800">
                <div className="text-[9px] text-stone-400 uppercase">{st.label}</div>
                <div className="text-[11px] font-bold text-amber-300">{st.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action & Allies Bar */}
      <div className="bg-stone-950/92 backdrop-blur-xl p-1.5 sm:p-2 rounded-2xl border border-amber-600/35 shadow-[0_10px_35px_rgba(0,0,0,0.85)] flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
        {/* Slot [1] Rooftop Snipers */}
        <button
          onClick={() => {
            soundManager.playSniperPing();
            if (onSniperPing) onSniperPing();
          }}
          onMouseEnter={() => setHoveredItem(sniperItem)}
          onMouseLeave={() => setHoveredItem(null)}
          data-testid="slot-sniper-ping"
          className={`group relative flex items-center space-x-1.5 sm:space-x-2 px-2.5 py-2 sm:px-3 sm:py-2 bg-stone-900/95 hover:bg-stone-800/90 active:scale-95 rounded-xl border transition-all ${
            sniperStatus === 'HOLD_FIRE_VIJI'
              ? 'border-amber-500/70 bg-amber-950/40'
              : 'border-red-500/30 hover:border-red-400'
          }`}
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-red-950/80 border border-red-500/40 flex items-center justify-center text-red-400 group-hover:scale-105 transition">
            <Crosshair className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="text-[8px] sm:text-[9px] font-mono text-red-400 font-bold uppercase tracking-wider">
              {sniperStatus === 'HOLD_FIRE_VIJI' ? 'HOLD FIRE' : '[1] MARKSMEN'}
            </div>
            <div className="text-[11px] sm:text-xs font-black text-stone-100 leading-tight">
              Signal Snipers
            </div>
          </div>
        </button>

        {/* Slot [2] Street Hazard / Chapter Set-Piece Trap */}
        <button
          onClick={() => {
            if (onTaxiDrift) onTaxiDrift();
          }}
          onMouseEnter={() => setHoveredItem(coconutItem)}
          onMouseLeave={() => setHoveredItem(null)}
          data-testid="slot-hazard-trigger"
          className="group relative flex items-center space-x-1.5 sm:space-x-2 px-2.5 py-2 sm:px-3 sm:py-2 bg-stone-900/95 hover:bg-stone-800/90 active:scale-95 rounded-xl border border-amber-500/30 hover:border-amber-400 transition-all"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-105 transition">
            <Flame className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="text-[8px] sm:text-[9px] font-mono text-amber-400 font-bold uppercase tracking-wider">
              [2] STREET TRAP
            </div>
            <div className="text-[11px] sm:text-xs font-black text-stone-100 leading-tight">
              {getTrapLabel(currentLevel)}
            </div>
          </div>
        </button>

        {/* Slot [Q] Acoustic Distraction / Temple Bell / Whistle */}
        <button
          onClick={() => {
            soundManager.playAlert();
            if (onDistract) onDistract();
          }}
          onMouseEnter={() => setHoveredItem(bellItem)}
          onMouseLeave={() => setHoveredItem(null)}
          data-testid="slot-distract-bell"
          className="group relative flex items-center space-x-1.5 sm:space-x-2 px-2.5 py-2 sm:px-3 sm:py-2 bg-stone-900/95 hover:bg-stone-800/90 active:scale-95 rounded-xl border border-cyan-500/30 hover:border-cyan-400 transition-all"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition">
            <Bell className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="text-[8px] sm:text-[9px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
              [Q] DISTRACT
            </div>
            <div className="text-[11px] sm:text-xs font-black text-stone-100 leading-tight">
              {currentLevel === 1 ? 'Temple Bell' : 'Whistle Lure'}
            </div>
          </div>
        </button>

        {/* Slot [3] Call Underworld Ally */}
        <button
          onClick={() => {
            soundManager.playCameoSummon();
            if (onCameoSummon) onCameoSummon();
          }}
          onMouseEnter={() => setHoveredItem(cameoItem)}
          onMouseLeave={() => setHoveredItem(null)}
          data-testid="slot-cameo-summon"
          className="group relative flex items-center space-x-1.5 sm:space-x-2 px-2.5 py-2 sm:px-3 sm:py-2 bg-stone-900/95 hover:bg-stone-800/90 active:scale-95 rounded-xl border border-amber-500/30 hover:border-amber-400 transition-all"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg overflow-hidden border border-amber-400/50 bg-stone-950 flex-shrink-0">
            <img
              src={cameoItem.portrait || '/assets/portraits/mathew.jpg'}
              alt={cameoItem.name}
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div className="text-left">
            <div className="text-[8px] sm:text-[9px] font-mono text-amber-300 font-bold uppercase tracking-wider">
              [3] CALL ALLY
            </div>
            <div className="text-[11px] sm:text-xs font-black text-stone-100 leading-tight">
              {cameoItem.id === 'narasimha_melee'
                ? 'Narasimha'
                : cameoItem.id === 'vimal_taxi'
                ? 'Vimal Taxi'
                : cameoItem.id === 'roddy_helo'
                ? 'Roddy Helo'
                : 'Mathew'}
            </div>
          </div>
        </button>

        {/* Slot [I] Open Inventory & Allies */}
        {onOpenInventory && (
          <button
            onClick={() => {
              soundManager.playUiClick();
              onOpenInventory();
            }}
            data-testid="hud-open-inventory"
            className="flex items-center space-x-1.5 px-2.5 py-2 sm:px-3 sm:py-2 bg-amber-500/15 hover:bg-amber-500/25 active:scale-95 rounded-xl border border-amber-500/40 text-amber-300 transition-all"
            title="Open Inventory & Allies [I]"
          >
            <Briefcase className="w-4 h-4" />
            <div className="text-left hidden sm:block">
              <div className="text-[9px] font-mono font-bold uppercase text-amber-400">[I] BAG</div>
              <div className="text-xs font-black text-white leading-tight">Inventory</div>
            </div>
          </button>
        )}
      </div>

      {/* Primary Spectacle Flip / Double Shake Specs Button (Tiger Ka Hukum) */}
      <button
        onClick={onFlipSpecs}
        onMouseEnter={() => setHoveredItem(specsItem)}
        onMouseLeave={() => setHoveredItem(null)}
        disabled={isHukumMode}
        data-testid="flip-specs-button"
        className={`group relative overflow-hidden px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 shadow-2xl active:scale-95 ${
          isHukumMode
            ? 'bg-red-950/95 border-2 border-red-500 text-red-200 shadow-[0_0_30px_rgba(239,68,68,0.5)] cursor-default'
            : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-stone-950 hover:brightness-110 shadow-[0_0_30px_rgba(245,158,11,0.55)] border-2 border-yellow-200'
        }`}
      >
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden border-2 border-stone-950/40 shadow-md flex-shrink-0 bg-stone-950">
            <img
              src="/assets/portraits/tiger.jpg"
              alt="Tiger Spectacle Flip"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div className="text-left">
            <div className="leading-none text-[9px] sm:text-[10px] font-mono font-bold tracking-widest opacity-85">
              {isHukumMode
                ? 'TIGER KA HUKUM • SNIPERS LOCKED'
                : currentLevel === 2
                ? 'PRESS [SPACE] • WEAR & SHAKE SPECS TWICE'
                : 'PRESS [SPACE] • TIGER STYLE'}
            </div>
            <div className="text-sm sm:text-base font-black tracking-wider font-display flex items-center space-x-1.5 mt-0.5">
              <span>
                {isHukumMode
                  ? 'HUKUM MODE (x10)'
                  : currentLevel === 2
                  ? 'SHAKE AVIATOR SPECS (2x)'
                  : 'FLIP AVIATOR SHADES'}
              </span>
              <Zap className="w-4 h-4 fill-current inline" />
            </div>
          </div>
        </div>
      </button>
    </div>
  );
};
