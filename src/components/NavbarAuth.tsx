import React, { useEffect, useState } from 'react';
import {
  Trophy,
  Shield,
  ShieldCheck,
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
  onOpenAuth: () => void;
  currentLevel: number;
}

export const NavbarAuth: React.FC<NavbarAuthProps> = ({
  profile,
  onOpenLeaderboard,
  onOpenLevelSelect,
  onOpenIntroVideo,
  onOpenInventory,
  onOpenAudioSettings,
  onOpenAuth,
  currentLevel
}) => {
  const [audioState, setAudioState] = useState<AudioSettingsState>(soundManager.getSettings());

  useEffect(() => {
    return soundManager.subscribe(setAudioState);
  }, []);

  return (
    <header className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-2.5 sm:px-5 py-2 bg-stone-950/92 backdrop-blur-xl border-b border-amber-600/30 shadow-[0_4px_30px_rgba(0,0,0,0.85)]">
      {/* Left: Character Emblem & Film Title */}
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
        <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg overflow-hidden border border-amber-500/60 shadow-md bg-stone-900 flex-shrink-0">
          <img
            src="/assets/portraits/poster.jpg"
            alt="Jailer 2: Hukum Poster"
            className="w-full h-full object-cover object-top"
          />
        </div>
        <div className="min-w-0">
          <h1 className="text-xs sm:text-base md:text-lg font-black tracking-wider text-amber-400 uppercase font-display leading-none truncate">
            JAILER 2: <span className="text-stone-100">HUKUM</span>
          </h1>
          <p className="text-[9px] sm:text-[10px] text-stone-400 uppercase tracking-widest mt-0.5 truncate">
            Muthuvel Pandian • Ch.{currentLevel}/10
          </p>
        </div>
      </div>

      {/* Center: Navigation Controls */}
      <div className="flex items-center space-x-1 sm:space-x-2">
        <button
          onClick={() => {
            soundManager.playUiClick();
            onOpenIntroVideo();
          }}
          data-testid="nav-watch-intro"
          className="flex items-center space-x-1 px-2 sm:px-3 py-1.5 text-xs font-bold bg-red-950/75 hover:bg-red-900/80 border border-red-600/40 text-red-200 rounded-lg transition-all"
          title="Watch Story Prologue"
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
          className="flex items-center space-x-1 px-2 sm:px-3 py-1.5 text-xs font-bold bg-stone-900/90 hover:bg-stone-800 border border-stone-700/80 hover:border-amber-500/40 text-amber-300 rounded-lg transition-all"
        >
          <Map className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Chapters (1-10)</span>
          <span className="sm:hidden">Ch.{currentLevel}</span>
        </button>

        <button
          onClick={() => {
            soundManager.playUiClick();
            onOpenInventory();
          }}
          data-testid="nav-inventory"
          className="flex items-center space-x-1 px-2 sm:px-3 py-1.5 text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 rounded-lg transition-all"
        >
          <Briefcase className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Inventory & Allies</span>
        </button>

        <button
          onClick={() => {
            soundManager.playUiClick();
            onOpenLeaderboard();
          }}
          data-testid="nav-leaderboard"
          className="flex items-center space-x-1 px-2 sm:px-3 py-1.5 text-xs font-bold bg-stone-900/90 hover:bg-stone-800 border border-stone-700/80 text-stone-200 rounded-lg transition-all"
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
          className="flex items-center space-x-1.5 px-2 sm:px-3 py-1.5 text-xs font-bold bg-stone-900/95 hover:bg-stone-800 border border-stone-700/90 hover:border-amber-500/40 text-stone-200 rounded-lg transition-all"
          title="Audio Settings (Music & SFX Toggles)"
        >
          <Sliders className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">Audio Settings</span>
          <div className="hidden sm:flex items-center space-x-1 text-[9px] font-mono">
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

      {/* Right: Character Profile & Google OAuth Login Trigger */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => {
            soundManager.playUiClick();
            onOpenAuth();
          }}
          data-testid="nav-google-auth-trigger"
          className="group relative flex items-center space-x-2 bg-stone-900/95 hover:bg-stone-800 active:scale-95 border border-stone-800 hover:border-amber-500/50 px-2 sm:px-3 py-1 rounded-full transition-all shadow-md"
          title={
            profile && profile.id && (profile.id.startsWith('g_') || (!profile.id.startsWith('guest_') && profile.email && !profile.email.includes('@hukum2.local')))
              ? 'Google Account Connected • Click to manage'
              : 'Sign In with Google Account'
          }
        >
          <div className="relative w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden border border-amber-500/60 bg-stone-950 flex-shrink-0">
            <img
              src={
                profile && profile.avatar_url && (profile.id.startsWith('g_') || !profile.id.startsWith('guest_'))
                  ? profile.avatar_url
                  : '/assets/portraits/tiger.jpg'
              }
              alt={profile?.display_name || 'Muthuvel Pandian'}
              className="w-full h-full object-cover object-top"
            />
            {profile && profile.id && profile.id.startsWith('g_') && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border border-stone-950 flex items-center justify-center">
                <ShieldCheck className="w-2 h-2 text-white" />
              </div>
            )}
          </div>

          <div className="text-left hidden sm:block">
            <div className="text-xs font-bold text-stone-100 flex items-center space-x-1 leading-tight">
              <span className="truncate max-w-[110px]">
                {profile?.display_name || 'Tiger Recruit'}
              </span>
              {profile && profile.id && profile.id.startsWith('g_') ? (
                <ShieldCheck className="w-3 h-3 text-emerald-400 inline flex-shrink-0" />
              ) : (
                <Shield className="w-3 h-3 text-amber-400 inline flex-shrink-0" />
              )}
            </div>
            <div className="text-[10px] text-amber-400 font-mono flex items-center space-x-1 leading-tight">
              {profile && profile.id && profile.id.startsWith('g_') ? (
                <span className="text-emerald-400 font-sans font-semibold">Google Linked</span>
              ) : (
                <>
                  <Award className="w-2.5 h-2.5 inline" />
                  <span>{Number(profile?.total_aura_score || 0).toLocaleString()} RESPECT</span>
                </>
              )}
            </div>
          </div>

          {/* Quick Sign In Badge if not logged in with Google */}
          {(!profile || !profile.id || profile.id.startsWith('guest_')) && (
            <div className="flex items-center space-x-1 px-1.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-[9px] font-bold">
              {/* Google G icon */}
              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Sign In</span>
            </div>
          )}
        </button>
      </div>
    </header>
  );
};
