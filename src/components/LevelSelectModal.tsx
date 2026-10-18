import React from 'react';
import { X, Lock, Play, Star, MapPin } from 'lucide-react';
import { LEVELS, LevelConfig } from '../data/levelsConfig';
import { LevelProgress } from '../api/client';

interface LevelSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLevel: (levelId: number) => void;
  highestUnlocked: number;
  progressList: LevelProgress[];
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  isOpen,
  onClose,
  onSelectLevel,
  highestUnlocked,
  progressList
}) => {
  if (!isOpen) return null;

  const getLevelStars = (levelId: number) => {
    const prog = progressList.find(p => p.level_number === levelId);
    return prog?.stars_earned || 0;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-yellow-500/40 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-black text-yellow-400 uppercase tracking-wider font-display">
              CAMPAIGN CHAPTERS <span className="text-white">(LEVELS 1 - 10)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Select an unlocked chapter to deploy Tiger Muthuvel Pandian.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Level Grid */}
        <div className="flex-1 overflow-y-auto my-4 space-y-3 pr-1">
          {LEVELS.map((lvl: LevelConfig) => {
            const isUnlocked = lvl.id <= highestUnlocked;
            const stars = getLevelStars(lvl.id);

            return (
              <div
                key={lvl.id}
                className={`flex items-start justify-between p-4 rounded-2xl border transition-all ${
                  isUnlocked
                    ? 'bg-slate-950/70 border-slate-700/80 hover:border-yellow-500/50 hover:bg-slate-900/90 cursor-pointer'
                    : 'bg-slate-950/30 border-slate-900 opacity-60'
                }`}
                onClick={() => {
                  if (isUnlocked) {
                    onSelectLevel(lvl.id);
                    onClose();
                  }
                }}
              >
                <div className="flex items-start space-x-3 text-left">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm font-mono flex-shrink-0 ${
                    isUnlocked ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' : 'bg-slate-800 text-slate-600'
                  }`}>
                    {isUnlocked ? lvl.id : <Lock className="w-4 h-4 text-slate-600" />}
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-yellow-300 font-dialogue leading-tight">
                      Level {lvl.id}: "{lvl.titleTanglish}"
                    </h4>
                    <p className="text-xs text-slate-300 italic mt-0.5">
                      "{lvl.titleEnglish}"
                    </p>
                    <div className="flex items-center space-x-1 text-[11px] text-slate-400 mt-1">
                      <MapPin className="w-3 h-3 text-red-400" />
                      <span>{lvl.setting}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-2 flex-shrink-0">
                  {/* Star indicators */}
                  <div className="flex space-x-1">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-slate-800'
                        }`}
                      />
                    ))}
                  </div>

                  {isUnlocked && (
                    <button className="flex items-center space-x-1 px-3 py-1 bg-yellow-500 hover:bg-yellow-400 text-slate-950 text-xs font-bold rounded-lg shadow transition">
                      <Play className="w-3 h-3 fill-current" />
                      <span>Play</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
