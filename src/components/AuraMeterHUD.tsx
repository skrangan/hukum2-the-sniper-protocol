import React from 'react';
import { Flame, Eye, Compass } from 'lucide-react';
import { GameEventData } from '../game/scenes/MarketLevelScene';

interface AuraMeterHUDProps {
  gameData: GameEventData;
  levelTitle: string;
  objective: string;
}

export const AuraMeterHUD: React.FC<AuraMeterHUDProps> = ({
  gameData,
  levelTitle,
  objective
}) => {
  return (
    <div className="absolute top-16 left-6 z-30 flex flex-col space-y-2 pointer-events-none select-none max-w-sm">
      {/* Composure & Aura Score Panel */}
      <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-2xl">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1">
            <Flame className="w-3.5 h-3.5 text-yellow-400" />
            <span>TIGER COMPOSURE</span>
          </span>
          <span className={`text-xs font-black px-2 py-0.5 rounded-full font-mono ${
            gameData.multiplier >= 10
              ? 'bg-red-600 text-white animate-pulse-fast'
              : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
          }`}>
            {gameData.multiplier >= 10 ? '🔥 HUKUM x10' : `x${gameData.multiplier} MULT`}
          </span>
        </div>

        {/* Composure Bar */}
        <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-300 transition-all duration-300 shadow-[0_0_12px_rgba(250,204,21,0.5)]"
            style={{ width: `${gameData.composure}%` }}
          />
        </div>

        {/* Aura Points Display */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800">
          <span className="text-[11px] text-slate-400">Score</span>
          <span className="text-base font-black text-yellow-400 font-mono tracking-wider">
            {gameData.aura.toLocaleString()} PTS
          </span>
        </div>
      </div>

      {/* Viji Suspicion Gauge */}
      <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-xl p-2.5 shadow-xl">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 mb-1">
          <span className="flex items-center space-x-1">
            <Eye className={`w-3.5 h-3.5 ${gameData.vijiSuspicion > 50 ? 'text-red-500 animate-bounce' : 'text-slate-400'}`} />
            <span>VIJI VISION DETECTION</span>
          </span>
          <span className={`font-mono text-xs ${gameData.vijiSuspicion > 50 ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
            {gameData.vijiSuspicion}%
          </span>
        </div>
        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-200 ${
              gameData.vijiSuspicion > 75
                ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]'
                : gameData.vijiSuspicion > 40
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${gameData.vijiSuspicion}%` }}
          />
        </div>
      </div>

      {/* Objective Card */}
      <div className="bg-slate-900/70 backdrop-blur-sm border border-slate-800 rounded-lg p-2 text-left">
        <div className="flex items-center space-x-1 text-[10px] text-yellow-400 font-bold uppercase">
          <Compass className="w-3 h-3" />
          <span>{levelTitle}</span>
        </div>
        <p className="text-[11px] text-slate-300 font-medium leading-tight mt-0.5">
          {objective}
        </p>
      </div>
    </div>
  );
};
