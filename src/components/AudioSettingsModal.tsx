import React, { useEffect, useState } from 'react';
import { X, Music, Volume2, Sliders, ShieldCheck, Sparkles, Crosshair } from 'lucide-react';
import { soundManager, AudioSettingsState, MusicThemeMode } from '../game/audio/SoundManager';

interface AudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AudioSettingsModal: React.FC<AudioSettingsModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<AudioSettingsState>(soundManager.getSettings());
  const [activeTheme, setActiveTheme] = useState<MusicThemeMode>(soundManager.getTheme());

  useEffect(() => {
    const unsub = soundManager.subscribe((next) => {
      setSettings(next);
      setActiveTheme(soundManager.getTheme());
    });
    return unsub;
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleMusic = () => {
    const next = !settings.musicEnabled;
    soundManager.setMusicEnabled(next);
  };

  const handleToggleSfx = () => {
    const next = !settings.sfxEnabled;
    soundManager.setSfxEnabled(next);
  };

  const handleMusicVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    soundManager.setMusicVolume(parseFloat(e.target.value));
  };

  const handleSfxVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    soundManager.setSfxVolume(parseFloat(e.target.value));
  };

  const handleThemePreview = (theme: MusicThemeMode) => {
    soundManager.startCinematicBgm(theme);
    setActiveTheme(theme);
    soundManager.playUiClick();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
      data-testid="audio-settings-modal"
    >
      <div className="relative w-full max-w-xl bg-gradient-to-b from-slate-900 via-slate-950 to-black border border-amber-500/40 rounded-3xl p-6 shadow-[0_0_60px_rgba(245,158,11,0.2)] text-slate-100">
        {/* Top Brass Accent Trim */}
        <div className="absolute top-0 inset-x-10 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/90">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400/90">
                ACOUSTIC COMMAND CONSOLE // 7.1 ANIRUDH SYNTHESIS
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-wider font-display">
                AUDIO & SOUNDSTAGE <span className="text-amber-400">SETTINGS</span>
              </h3>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playUiClick();
              onClose();
            }}
            data-testid="close-audio-settings"
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Distinct Toggle Switches for Music and Sound Effects */}
        <div className="my-5 space-y-4">
          {/* 1. Background Music (BGM) Toggle Panel */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/30 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3.5">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all ${
                    settings.musicEnabled
                      ? 'bg-amber-500/20 border-amber-400/50 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                      : 'bg-slate-950 border-slate-800 text-slate-600'
                  }`}
                >
                  <Music className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-black uppercase tracking-wider text-white">
                      Cinematic Background Music
                    </span>
                    <span
                      data-testid="music-status-badge"
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                        settings.musicEnabled
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-950/80 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {settings.musicEnabled ? 'ON' : 'OFF'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Anirudh-style pulsing sub-bass score, brass motifs & dynamic chapter themes
                  </p>
                </div>
              </div>

              {/* Accessible Distinct Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={settings.musicEnabled}
                aria-label="Toggle Background Music"
                data-testid="toggle-music-switch"
                onClick={handleToggleMusic}
                className={`relative inline-flex h-8 w-16 flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.musicEnabled
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                    : 'bg-slate-950 border-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out mt-0.5 ${
                    settings.musicEnabled ? 'translate-x-8 bg-slate-950' : 'translate-x-0.5 bg-slate-400'
                  }`}
                />
              </button>
            </div>

            {/* Music Volume Slider + Theme Selector */}
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3 flex-1">
                <span className="text-[11px] font-mono text-slate-400 uppercase w-24">
                  Score Gain: {Math.round(settings.musicVolume * 100)}%
                </span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={settings.musicVolume}
                  onChange={handleMusicVolume}
                  disabled={!settings.musicEnabled}
                  className="flex-1 accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer disabled:opacity-40"
                />
              </div>

              <div className="flex items-center space-x-1.5">
                {(['stealth', 'hukum', 'carnival'] as MusicThemeMode[]).map((theme) => (
                  <button
                    key={theme}
                    onClick={() => handleThemePreview(theme)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase font-bold border transition ${
                      activeTheme === theme
                        ? 'bg-amber-500/25 border-amber-400 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {theme === 'stealth' ? 'Stealth Groove' : theme === 'hukum' ? 'Hukum Brass' : 'Goa Pulse'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Sound Effects (SFX) Toggle Panel */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/30 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3.5">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all ${
                    settings.sfxEnabled
                      ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-[0_0_20px_rgba(56,189,248,0.25)]'
                      : 'bg-slate-950 border-slate-800 text-slate-600'
                  }`}
                >
                  <Volume2 className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-black uppercase tracking-wider text-white">
                      Tactical Sound Effects (SFX)
                    </span>
                    <span
                      data-testid="sfx-status-badge"
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                        settings.sfxEnabled
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-950/80 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {settings.sfxEnabled ? 'ON' : 'OFF'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Suppressed sniper cracks, 808 glasses-flip drop, rickshaw engine & pyrotechnics
                  </p>
                </div>
              </div>

              {/* Accessible Distinct Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={settings.sfxEnabled}
                aria-label="Toggle Sound Effects"
                data-testid="toggle-sfx-switch"
                onClick={handleToggleSfx}
                className={`relative inline-flex h-8 w-16 flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.sfxEnabled
                    ? 'bg-gradient-to-r from-cyan-500 to-sky-400 border-cyan-300 shadow-[0_0_15px_rgba(56,189,248,0.5)]'
                    : 'bg-slate-950 border-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out mt-0.5 ${
                    settings.sfxEnabled ? 'translate-x-8 bg-slate-950' : 'translate-x-0.5 bg-slate-400'
                  }`}
                />
              </button>
            </div>

            {/* SFX Volume Slider + Soundboard Audition Buttons */}
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3 flex-1">
                <span className="text-[11px] font-mono text-slate-400 uppercase w-24">
                  FX Gain: {Math.round(settings.sfxVolume * 100)}%
                </span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={settings.sfxVolume}
                  onChange={handleSfxVolume}
                  disabled={!settings.sfxEnabled}
                  className="flex-1 accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer disabled:opacity-40"
                />
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => soundManager.playSniperShot()}
                  disabled={!settings.sfxEnabled}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase font-bold bg-slate-950 border border-slate-800 text-cyan-300 hover:border-cyan-500/50 disabled:opacity-40 transition"
                >
                  <Crosshair className="w-3 h-3" />
                  <span>Test Sniper</span>
                </button>
                <button
                  onClick={() => soundManager.playSpectacleFlipBassDrop()}
                  disabled={!settings.sfxEnabled}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase font-bold bg-slate-950 border border-slate-800 text-amber-300 hover:border-amber-500/50 disabled:opacity-40 transition"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Test 808 Drop</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Persistence Notice */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800/90 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Preferences apply immediately and persist across sessions</span>
          </div>
          <button
            onClick={() => {
              soundManager.playUiClick();
              onClose();
            }}
            className="px-5 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg hover:brightness-110 transition"
          >
            Confirm & Resume
          </button>
        </div>
      </div>
    </div>
  );
};
