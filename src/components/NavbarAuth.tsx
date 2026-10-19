import React, { useEffect, useState } from 'react';
import {
  Trophy,
  Shield,
  Award,
  Map,
  Briefcase,
  Sliders,
  Film
} from 'lucide-react';
import { UserProfile } from '../api/client';
import { soundManager, AudioSettingsState } from '../game/audio/SoundManager';

interface NavbarAuthProps {
  profile: UserProfile | null;
  onOpenLeaderboard: () => void;
  onOpenLevelSelect: () => void;
  onOpenIntroVideo: () => void;
  onOpenInventory: () => void;
  onOpenAudioSettings: () => void;
  currentLevel: number;
}

export const NavbarAuth: React.FC<NavbarAuthProps> = ({
  profile,
  onOpenLeaderboard,
  onOpenLevelSelect,
  onOpenIntroVideo,
  onOpenInventory,
  onOpenAudioSettings,
  currentLevel
}) => {
  const [audioState, setAudioState] = useState<AudioSettingsState>(soundManager.getSettings());

  useEffect(() => {
    return soundManager.subscribe(setAudioState);
  }, []);

  return (
    <header className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-5 py-2.5 bg-stone-950/92 backdrop-blur-xl border-b border-amber-600/30 shadow-[0_4px_30px_rgba(0,0,0,0.85)]">
      {/* Left: Character Emblem & Film Title */}
      <div className="flex items-center space-x-3">
        <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-amber-500/60 shadow-md bg-stone-900 flex-shrink-0">
          <img
            src="/assets/portraits/poster.jpg"
            alt="Jailer 2: Hukum Poster"
            className="w-full h-full object-cover object-top"
          />
        </div>
        <div>
          <h1 className="text-base sm:text-lg font-black tracking-wider text-amber-400 uppercase font-display leading-none">
            JAILER 2: <span className="text-stone-100">HUKUM — THE SNIPER PROTOCOL</span>
          </h1>
          <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-0.5">
            Muthuvel Pandian • Chapter {currentLevel} of 10
          </p>
        </div>
      </div>

      {/* Center: Navigation Controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => {
            soundManager.playUiClick();
            onOpenIntroVideo();
          }}
          data-testid="nav-watch-intro"
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold bg-red-950/75 hover:bg-red-900/80 border border-red-600/40 text-red-200 rounded-lg transition-all"
        >
          <Film className="w-3.5 h-3.5 text-red-400" />
          <span className="hidden md:inline">Story Prologue</span>
        </button>

        <button
          onClick={() => {
            soundManager.playUiClick();
            onOpenLevelSelect();
          }}
          data-testid="nav-chapters"
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold bg-stone-900/90 hover:bg-stone-800 border border-stone-700/80 hover:border-amber-500/40 text-amber-300 rounded-lg transition-all"
        >
          <Map className="w-3.5 h-3.5 text-amber-400" />
          <span>Chapters (1-10)</span>
        </button>

        <button
          onClick={() => {
            soundManager.playUiClick();
            onOpenInventory();
          }}
          data-testid="nav-inventory"
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 rounded-lg transition-all"
        >
          <Briefcase className="w-3.5 h-3.5 text-amber-400" />
          <span>Inventory & Allies</span>
        </button>

        <button
          onClick={() => {
            soundManager.playUiClick();
            onOpenLeaderboard();
          }}
          data-testid="nav-leaderboard"
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold bg-stone-900/90 hover:bg-stone-800 border border-stone-700/80 text-stone-200 rounded-lg transition-all"
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden lg:inline">Standings</span>
        </button>

        {/* Audio Settings Button with Live Music / SFX Status Pills */}
        <button
          onClick={() => {
            soundManager.playUiClick();
            onOpenAudioSettings();
          }}
          data-testid="nav-audio-settings"
          className="flex items-center space-x-2 px-3 py-1.5 text-xs font-bold bg-stone-900/95 hover:bg-stone-800 border border-stone-700/90 hover:border-amber-500/40 text-stone-200 rounded-lg transition-all"
          title="Audio Settings (Music & SFX Toggles)"
        >
          <Sliders className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Audio Settings</span>
          <div className="flex items-center space-x-1 text-[9px] font-mono">
            <span
              className={`px-1.5 py-0.5 rounded ${
                audioState.musicEnabled
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-stone-950 text-stone-500 border border-stone-800'
              }`}
            >
              Music:{audioState.musicEnabled ? 'ON' : 'OFF'}
            </span>
            <span
              className={`px-1.5 py-0.5 rounded ${
                audioState.sfxEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-stone-950 text-stone-500 border border-stone-800'
              }`}
            >
              SFX:{audioState.sfxEnabled ? 'ON' : 'OFF'}
            </span>
          </div>
        </button>
      </div>

      {/* Right: Character Profile Badge */}
      <div className="flex items-center space-x-2.5">
        <div className="flex items-center space-x-2.5 bg-stone-900/95 border border-stone-800 px-3 py-1 rounded-full">
          <img
            src="/assets/portraits/tiger.jpg"
            alt="Muthuvel Pandian"
            className="w-7 h-7 rounded-full object-cover object-top border border-amber-500/60"
          />
          <div className="text-left">
            <div className="text-xs font-bold text-stone-100 flex items-center space-x-1 leading-tight">
              <span>{profile?.display_name || 'Muthuvel Pandian'}</span>
              <Shield className="w-3 h-3 text-amber-400 inline" />
            </div>
            <div className="text-[10px] text-amber-400 font-mono flex items-center space-x-1 leading-tight">
              <Award className="w-2.5 h-2.5 inline" />
              <span>{Number(profile?.total_aura_score || 0).toLocaleString()} RESPECT</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
