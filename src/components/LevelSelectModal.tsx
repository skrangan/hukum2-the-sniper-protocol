import React from 'react';
import { X, Play, Star, MapPin } from 'lucide-react';
import { LEVELS, LevelConfig } from '../data/levelsConfig';
import { LevelProgress } from '../api/client';
import { soundManager } from '../game/audio/SoundManager';

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
    const prog = progressList.find((p) => p.level_number === levelId);
    return prog?.stars_earned || 0;
  };

  const getChapterPortrait = (levelId: number) => {
    switch (levelId) {
      case 1:
        return '/assets/portraits/viji.jpg';
      case 2:
      case 6:
      case 8:
        return '/assets/portraits/vimal.jpg';
      case 4:
      case 7:
        return '/assets/portraits/narasimha.jpg';
      case 5:
      case 9:
        return '/assets/portraits/mathew.jpg';
      case 10:
        return '/assets/portraits/poster.jpg';
      default:
        return '/assets/portraits/tiger.jpg';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
      data-testid="level-select-modal"
    >
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-slate-900 via-slate-950 to-black border border-amber-500/40 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[86vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
              OPERATIONAL THEATRE SELECTION // 10-CHAPTER DOSSIER
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider font-display">
              CAMPAIGN LOCATIONS <span className="text-amber-400">& CHAPTERS</span>
            </h3>
          </div>
          <button
            onClick={() => {
              soundManager.playUiClick();
              onClose();
            }}
            data-testid="close-level-select"
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Level Grid */}
        <div className="flex-1 overflow-y-auto my-4 grid grid-cols-1 md:grid-cols-2 gap-3.5 pr-1">
          {LEVELS.map((lvl: LevelConfig) => {
            const isUnlocked = lvl.id <= Math.max(highestUnlocked, 10); // Allow previewing all 10 atmospheric environments
            const stars = getLevelStars(lvl.id);

            return (
              <div
                key={lvl.id}
                data-testid={`chapter-card-${lvl.id}`}
                className={`group relative flex items-stretch justify-between p-3.5 rounded-2xl border transition-all ${
                  isUnlocked
                    ? 'bg-slate-900/75 border-slate-800 hover:border-amber-400/60 hover:bg-slate-900 cursor-pointer shadow-lg'
                    : 'bg-slate-950/40 border-slate-900 opacity-60'
                }`}
                onClick={() => {
                  if (isUnlocked) {
                    soundManager.playEquipGear();
                    onSelectLevel(lvl.id);
                    onClose();
                  }
                }}
              >
                <div className="flex items-start space-x-3.5 text-left min-w-0 flex-1">
                  {/* Realistic Chapter Portrait Thumbnail */}
                  <div className="relative w-16 h-20 rounded-xl overflow-hidden border border-amber-500/40 flex-shrink-0 bg-slate-950">
                    <img
                      src={getChapterPortrait(lvl.id)}
                      alt={lvl.setting}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-mono font-black text-amber-400 border border-amber-500/30">
                      CH.{lvl.id}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-1 text-[10px] font-mono text-amber-400 uppercase tracking-wider">
                      <MapPin className="w-3 h-3 text-red-400 flex-shrink-0" />
                      <span className="truncate">{lvl.setting}</span>
                    </div>

                    <h4 className="text-sm font-bold text-white font-dialogue leading-snug mt-0.5 truncate">
                      "{lvl.titleTanglish}"
                    </h4>
                    <p className="text-[11px] text-slate-400 italic truncate">
                      "{lvl.titleEnglish}"
                    </p>
                    <p className="text-[10px] text-slate-300 line-clamp-2 mt-1 leading-tight">
                      {lvl.motive}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between pl-2 flex-shrink-0">
                  {/* Star indicators */}
                  <div className="flex space-x-0.5">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= stars ? 'text-amber-400 fill-amber-400' : 'text-slate-800'
                        }`}
                      />
                    ))}
                  </div>

                  <button className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 text-[11px] font-black uppercase rounded-xl shadow transition">
                    <Play className="w-3 h-3 fill-current" />
                    <span>Deploy</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
