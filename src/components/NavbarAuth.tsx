import React, { useState } from 'react';
import { Trophy, Volume2, VolumeX, Shield, Award, Map } from 'lucide-react';
import { UserProfile } from '../api/client';
import { soundManager } from '../game/audio/SoundManager';

interface NavbarAuthProps {
  profile: UserProfile | null;
  onOpenLeaderboard: () => void;
  onOpenLevelSelect: () => void;
  currentLevel: number;
}

export const NavbarAuth: React.FC<NavbarAuthProps> = ({
  profile,
  onOpenLeaderboard,
  onOpenLevelSelect,
  currentLevel
}) => {
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());

  const toggleSound = () => {
    const next = !isMuted;
    soundManager.setMuted(next);
    setIsMuted(next);
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-3 bg-slate-950/80 backdrop-blur-md border-b border-yellow-500/20">
      {/* Title & Brand */}
      <div className="flex items-center space-x-3">
        <span className="text-2xl">🕶️</span>
        <div>
          <h1 className="text-lg font-black tracking-wider text-yellow-400 uppercase font-display leading-none">
            HUKUM 2: <span className="text-white">THE SNIPER PROTOCOL</span>
          </h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest">
            Tactical Action-Puzzle • Level {currentLevel}
          </p>
        </div>
      </div>

      {/* Center Controls */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenLevelSelect}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-yellow-300 rounded-lg transition-all"
        >
          <Map className="w-3.5 h-3.5" />
          <span>Chapters (1-10)</span>
        </button>

        <button
          onClick={onOpenLeaderboard}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-yellow-400 rounded-lg transition-all"
        >
          <Trophy className="w-3.5 h-3.5 text-yellow-400" />
          <span>Leaderboard</span>
        </button>

        <button
          onClick={toggleSound}
          className="p-1.5 text-xs bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 rounded-lg transition-all"
          title={isMuted ? 'Unmute BGM & SFX' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>
      </div>

      {/* Right User Profile / Database badge */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-800 px-3 py-1 rounded-full">
          <img
            src={profile?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=tiger'}
            alt="Avatar"
            className="w-6 h-6 rounded-full border border-yellow-500/40"
          />
          <div className="text-left">
            <div className="text-xs font-bold text-white flex items-center space-x-1">
              <span>{profile?.display_name || 'Tiger Recruit'}</span>
              <Shield className="w-3 h-3 text-yellow-400 inline" />
            </div>
            <div className="text-[10px] text-yellow-400 font-mono flex items-center space-x-1">
              <Award className="w-2.5 h-2.5 inline" />
              <span>{Number(profile?.total_aura_score || 0).toLocaleString()} AURA</span>
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Render DB Sync</span>
        </div>
      </div>
    </header>
  );
};
