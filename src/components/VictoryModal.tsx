import React from 'react';
import { Star, Trophy, Clock, RotateCcw, ArrowRight, CheckCircle2 } from 'lucide-react';
import { soundManager } from '../game/audio/SoundManager';

interface VictoryModalProps {
  score: number;
  stars: number;
  clearTimeMs: number;
  onNextLevel: () => void;
  onRetry: () => void;
  dbSaved: boolean;
  currentLevel?: number;
  currentLevelTitle?: string;
  nextLevelTitle?: string;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  score,
  stars,
  clearTimeMs,
  onNextLevel,
  onRetry,
  dbSaved,
  currentLevel = 1,
  currentLevelTitle = "Amaithiya Irukkurathu Bayam Illa, Athu En Style",
  nextLevelTitle = "Moorthy Sir Udane Paakkanumam"
}) => {
  const seconds = (clearTimeMs / 1000).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-amber-500/60 rounded-3xl p-6 text-center shadow-[0_0_60px_rgba(245,158,11,0.3)]">
        {/* Realistic Character Portrait Medallion */}
        <div className="w-20 h-20 mx-auto -mt-14 rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-300 bg-slate-950">
          <img
            src="/assets/portraits/tiger.jpg"
            alt="Tiger Muthuvel Pandian"
            className="w-full h-full object-cover object-top"
          />
        </div>

        <div className="text-[10px] font-mono text-amber-400 uppercase tracking-widest mt-3">
          VERDICT DELIVERED // HUKUM PROTOCOL
        </div>
        <h2 className="text-2xl font-black text-white font-display uppercase tracking-wider mt-0.5">
          MISSION <span className="text-amber-400">ACCOMPLISHED</span>
        </h2>
        <p className="text-xs text-amber-200/90 font-dialogue italic mt-0.5">
          "Amaithiya Irukkurathu Bayam Illa, Athu En Style"
        </p>

        {/* Stars */}
        <div className="flex justify-center space-x-2 my-4">
          {[1, 2, 3].map((star) => (
            <Star
              key={star}
              className={`w-8 h-8 ${
                star <= stars
                  ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]'
                  : 'text-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 my-4 bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
          <div className="text-left">
            <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center space-x-1">
              <Trophy className="w-3 h-3 text-amber-400" />
              <span>AURA SCORE</span>
            </span>
            <div className="text-xl font-black text-amber-400 font-mono">
              +{score.toLocaleString()}
            </div>
          </div>

          <div className="text-left">
            <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center space-x-1">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>CLEAR TIME</span>
            </span>
            <div className="text-xl font-black text-white font-mono">
              {seconds}s
            </div>
          </div>
        </div>

        {/* Render PostgreSQL Status */}
        <div className="flex items-center justify-center space-x-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 py-1.5 px-3 rounded-xl mb-6">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{dbSaved ? 'Synced with Render PostgreSQL Database' : 'Syncing Dossier...'}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={() => {
              soundManager.playUiClick();
              onRetry();
            }}
            className="flex-1 flex items-center justify-center space-x-2 py-3 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold rounded-xl transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Replay Chapter</span>
          </button>

          <button
            onClick={() => {
              soundManager.playUiClick();
              onNextLevel();
            }}
            className="flex-1 flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 active:scale-95 text-slate-950 font-black rounded-xl shadow-lg transition-all"
          >
            <span>{currentLevel < 10 ? `Next: Chapter ${currentLevel + 1} - ${nextLevelTitle}` : 'Campaign Victory! 🏆'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
