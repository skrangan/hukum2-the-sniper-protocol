import React from 'react';
import { Crosshair, Car, Sparkles, Zap } from 'lucide-react';

interface ActionDeckHUDProps {
  onFlipSpecs: () => void;
  isHukumMode: boolean;
  onSniperPing?: () => void;
  onTaxiDrift?: () => void;
  onCameoSummon?: () => void;
}

export const ActionDeckHUD: React.FC<ActionDeckHUDProps> = ({
  onFlipSpecs,
  isHukumMode,
  onSniperPing,
  onTaxiDrift,
  onCameoSummon
}) => {
  return (
    <div className="absolute bottom-6 right-6 z-30 flex flex-col items-end space-y-2 select-none">
      {/* Tactical Hotkeys Deck */}
      <div className="flex items-center space-x-2 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-800">
        <button
          onClick={onSniperPing}
          className="flex items-center space-x-1 px-2.5 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 active:scale-95 text-red-400 rounded-lg border border-red-500/20 transition-all"
          title="Highlight enemy sniper targets"
        >
          <Crosshair className="w-3.5 h-3.5" />
          <span className="font-bold">[1] Ping</span>
        </button>

        <button
          onClick={onTaxiDrift}
          className="flex items-center space-x-1 px-2.5 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 active:scale-95 text-amber-400 rounded-lg border border-amber-500/20 transition-all"
          title="Trigger Vimal's Taxi Hazard"
        >
          <Car className="w-3.5 h-3.5" />
          <span className="font-bold">[2] Taxi</span>
        </button>

        <button
          onClick={onCameoSummon}
          className="flex items-center space-x-1 px-2.5 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 active:scale-95 text-purple-400 rounded-lg border border-purple-500/20 transition-all"
          title="Summon Cameo Syndicate"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="font-bold">[3] Cameo</span>
        </button>
      </div>

      {/* Primary Spectacle Flip Button */}
      <button
        onClick={onFlipSpecs}
        disabled={isHukumMode}
        className={`group relative overflow-hidden px-6 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-300 shadow-2xl active:scale-95 ${
          isHukumMode
            ? 'bg-red-950 border-2 border-red-500 text-red-400 opacity-90 cursor-default'
            : 'bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-600 text-slate-950 hover:brightness-110 shadow-[0_0_25px_rgba(234,179,8,0.5)] border-2 border-yellow-300 animate-pulse-fast'
        }`}
      >
        <div className="flex items-center space-x-2">
          <span className="text-xl">🕶️</span>
          <div className="text-left">
            <div className="leading-none text-xs font-mono font-bold tracking-tight">
              {isHukumMode ? 'HUKUM BULLET-TIME' : 'PRESS [SPACE]'}
            </div>
            <div className="text-sm font-black tracking-widest font-display flex items-center space-x-1">
              <span>{isHukumMode ? 'ACTIVE (x10)' : 'FLIP SPECS'}</span>
              <Zap className="w-3.5 h-3.5 inline" />
            </div>
          </div>
        </div>
      </button>
    </div>
  );
};
