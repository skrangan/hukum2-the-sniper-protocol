import React from 'react';
import { Flame, Eye, Compass, Crosshair, ShieldAlert } from 'lucide-react';
import { GameEventData } from '../game/scenes/MarketLevelScene';

interface AuraMeterHUDProps {
  gameData: GameEventData & {
    sniperStatus?: 'STANDBY' | 'LOCKED' | 'HOLD_FIRE_VIJI' | 'FIRING';
    aiAlertCount?: number;
    aliveEnemies?: number;
  };
  levelTitle: string;
  levelSetting?: string;
  objective: string;
}

export const AuraMeterHUD: React.FC<AuraMeterHUDProps> = ({
  gameData,
  levelTitle,
  levelSetting = "Neighborhood Market & Rithu's School Street",
  objective
}) => {
  const sniperStatus = gameData.sniperStatus || 'STANDBY';
  const aiAlertCount = gameData.aiAlertCount || 0;

  return (
    <div
      className="absolute top-14 sm:top-16 left-3 sm:left-5 z-30 flex flex-col space-y-2 pointer-events-none select-none w-72 sm:w-96 max-w-[92vw]"
      data-testid="aura-meter-hud"
    >
      {/* Muthuvel Pandian Character & Composure Card */}
      <div className="bg-stone-950/90 backdrop-blur-xl border border-amber-600/35 rounded-2xl p-2.5 sm:p-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.85)]">
        <div className="flex items-center space-x-2.5 sm:space-x-3 mb-2">
          {/* Realistic Character Portrait Frame */}
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden border-2 border-amber-500/70 shadow-lg flex-shrink-0 bg-stone-900">
            <img
              src="/assets/portraits/tiger.jpg"
              alt="Muthuvel Pandian"
              className="w-full h-full object-cover object-top filter contrast-115"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-amber-400 truncate">
                &ldquo;TIGER&rdquo; MUTHUVEL PANDIAN
              </span>
              <span
                className={`text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                  gameData.multiplier >= 10
                    ? 'bg-red-700 text-white border border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.6)]'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                {gameData.multiplier >= 10 ? 'HUKUM x10' : `x${gameData.multiplier}`}
              </span>
            </div>

            <div className="flex items-baseline justify-between mt-0.5">
              <span className="text-[11px] sm:text-xs font-bold text-stone-300 uppercase tracking-wide flex items-center space-x-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Composure</span>
              </span>
              <span className="text-base sm:text-lg font-black text-amber-400 font-mono tracking-wider">
                {gameData.aura.toLocaleString()} <span className="text-[9px] text-stone-400">PTS</span>
              </span>
            </div>
          </div>
        </div>

        {/* Composure Bar */}
        <div className="w-full bg-stone-900 h-2 rounded-full overflow-hidden p-0.5 border border-stone-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 transition-all duration-300"
            style={{ width: `${gameData.composure}%` }}
          />
        </div>

        {/* Viji's Attention / Suspicion Meter & Sniper Fire-Discipline Badge */}
        <div className="mt-2 pt-2 border-t border-stone-800/90 flex items-center space-x-2.5">
          <img
            src="/assets/portraits/viji.jpg"
            alt="Viji Pandian"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover object-top border border-rose-500/40 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-[9px] sm:text-[10px] uppercase mb-1">
              <span className="flex items-center space-x-1 text-stone-300 font-bold truncate">
                <Eye
                  className={`w-3 h-3 flex-shrink-0 ${
                    gameData.vijiSuspicion > 50 ? 'text-red-500 animate-bounce' : 'text-amber-400'
                  }`}
                />
                <span>VIJI LOS & SNIPER DISCIPLINE</span>
              </span>
              <span
                data-testid="sniper-discipline-badge"
                className={`font-bold px-1.5 py-0.2 rounded text-[8px] sm:text-[9px] ${
                  sniperStatus === 'HOLD_FIRE_VIJI'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : gameData.vijiSuspicion > 50
                    ? 'text-red-400'
                    : 'text-emerald-400'
                }`}
              >
                {sniperStatus === 'HOLD_FIRE_VIJI'
                  ? 'HOLD FIRE — VIJI WATCHING'
                  : sniperStatus === 'LOCKED' || sniperStatus === 'FIRING'
                  ? 'SNIPERS LOCKED'
                  : `${gameData.vijiSuspicion}% CLEAR`}
              </span>
            </div>
            <div className="w-full bg-stone-900 h-1.5 rounded-full overflow-hidden border border-stone-800">
              <div
                className={`h-full rounded-full transition-all duration-200 ${
                  gameData.vijiSuspicion > 75
                    ? 'bg-red-500'
                    : gameData.vijiSuspicion > 40
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.max(4, gameData.vijiSuspicion)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Chapter Scene, AI Status & Motive Card */}
      <div className="bg-stone-950/88 backdrop-blur-lg border border-stone-800/90 rounded-2xl p-2.5 sm:p-3 text-left shadow-xl">
        <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-amber-400 uppercase tracking-wider">
          <span className="flex items-center space-x-1 font-bold truncate">
            <Compass className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span className="truncate max-w-[170px] sm:max-w-[220px]">{levelSetting}</span>
          </span>
          <span className="flex items-center space-x-1.5">
            {aiAlertCount > 0 && (
              <span className="flex items-center space-x-0.5 text-amber-300 font-mono font-bold bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/40">
                <ShieldAlert className="w-2.5 h-2.5 text-amber-400" />
                <span>AI:{aiAlertCount}</span>
              </span>
            )}
            <span className="flex items-center space-x-1 text-red-400 font-bold">
              <Crosshair className="w-3 h-3" />
              <span>{gameData.phase}</span>
            </span>
          </span>
        </div>
        <div className="text-[11px] sm:text-xs font-bold text-amber-200 font-dialogue italic mt-1 leading-tight truncate">
          &ldquo;{levelTitle}&rdquo;
        </div>
        <p className="text-[10px] sm:text-[11px] text-stone-300 font-medium leading-snug mt-0.5 line-clamp-2 sm:line-clamp-3">
          {objective}
        </p>
      </div>
    </div>
  );
};
