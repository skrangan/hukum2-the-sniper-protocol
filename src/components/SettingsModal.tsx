import React, { useState } from 'react';
import { X, Volume2, VolumeX, Music, Sliders, Sparkles, Monitor, Check } from 'lucide-react';
import { soundManager } from '../game/audio/SoundManager';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [musicEnabled, setMusicEnabled] = useState(soundManager.getMusicEnabled());
  const [sfxEnabled, setSfxEnabled] = useState(soundManager.getSfxEnabled());
  const [musicVol, setMusicVol] = useState(Math.round(soundManager.getMusicVolume() * 100));
  const [sfxVol, setSfxVol] = useState(Math.round(soundManager.getSfxVolume() * 100));
  const [subtitleMode, setSubtitleMode] = useState(localStorage.getItem('hukum2_sub_mode') || 'dual');
  const [graphicsPreset, setGraphicsPreset] = useState(localStorage.getItem('hukum2_graphics') || 'ultra');

  if (!isOpen) return null;

  const handleToggleMusic = () => {
    const next = !musicEnabled;
    soundManager.setMusicEnabled(next);
    setMusicEnabled(next);
  };

  const handleToggleSfx = () => {
    const next = !sfxEnabled;
    soundManager.setSfxEnabled(next);
    setSfxEnabled(next);
  };

  const handleMusicVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setMusicVol(val);
    soundManager.setMusicVolume(val / 100);
  };

  const handleSfxVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setSfxVol(val);
    soundManager.setSfxVolume(val / 100);
  };

  const handleSubtitleModeChange = (mode: string) => {
    setSubtitleMode(mode);
    localStorage.setItem('hukum2_sub_mode', mode);
  };

  const handleGraphicsChange = (preset: string) => {
    setGraphicsPreset(preset);
    localStorage.setItem('hukum2_graphics', preset);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-lg bg-slate-900 border border-yellow-500/40 rounded-3xl p-6 shadow-2xl flex flex-col space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-yellow-400" />
            <h3 className="text-xl font-black text-white uppercase tracking-wider font-display">
              SETTINGS // <span className="text-yellow-400">AUDIO & CINEMATICS</span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audio Toggles & Sliders */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-1.5">
            <Volume2 className="w-4 h-4 text-yellow-400" />
            <span>Sound & Music Toggles</span>
          </h4>

          {/* Background Music (BGM) */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-xl ${musicEnabled ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-800 text-slate-500'}`}>
                  <Music className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Movie Theme BGM</div>
                  <div className="text-[11px] text-slate-400">Anirudh Hukum Rhythmic Synth Score</div>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={handleToggleMusic}
                className={`relative w-14 h-7 rounded-full transition-colors duration-200 focus:outline-none ${
                  musicEnabled ? 'bg-yellow-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block w-5 h-5 transform bg-slate-950 rounded-full transition-transform duration-200 shadow-md ${
                    musicEnabled ? 'translate-x-8' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Volume Slider */}
            {musicEnabled && (
              <div className="flex items-center space-x-3 pt-1">
                <span className="text-[10px] text-slate-400 w-12 font-mono">VOL {musicVol}%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={musicVol}
                  onChange={handleMusicVolumeChange}
                  className="flex-1 accent-yellow-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Sound Effects (SFX) */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-xl ${sfxEnabled ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-500'}`}>
                  {sfxEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Action Sound Effects</div>
                  <div className="text-[11px] text-slate-400">Sniper Shots, Bass Drops, Fireworks & Rickshaw</div>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={handleToggleSfx}
                className={`relative w-14 h-7 rounded-full transition-colors duration-200 focus:outline-none ${
                  sfxEnabled ? 'bg-red-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block w-5 h-5 transform bg-slate-950 rounded-full transition-transform duration-200 shadow-md ${
                    sfxEnabled ? 'translate-x-8' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Volume Slider & Test Button */}
            {sfxEnabled && (
              <div className="flex items-center space-x-3 pt-1">
                <span className="text-[10px] text-slate-400 w-12 font-mono">VOL {sfxVol}%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sfxVol}
                  onChange={handleSfxVolumeChange}
                  className="flex-1 accent-red-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
                <button
                  onClick={() => soundManager.playSpectacleFlipBassDrop()}
                  className="text-[10px] px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-yellow-400 rounded-md font-mono font-bold"
                >
                  TEST BASS
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Graphics & Subtitle Options */}
        <div className="space-y-4 pt-2 border-t border-slate-800">
          <div className="grid grid-cols-2 gap-3">
            {/* Visual Fidelity */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1 mb-1.5">
                <Monitor className="w-3 h-3 text-cyan-400" />
                <span>3D Visual Quality</span>
              </span>
              <div className="flex flex-col space-y-1">
                {['ultra', 'high'].map((p) => (
                  <button
                    key={p}
                    onClick={() => handleGraphicsChange(p)}
                    className={`flex items-center justify-between px-3 py-1.5 text-xs font-bold rounded-lg border transition ${
                      graphicsPreset === p
                        ? 'bg-yellow-500/20 border-yellow-500/60 text-yellow-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="capitalize">{p} Cinema</span>
                    {graphicsPreset === p && <Check className="w-3 h-3 text-yellow-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Subtitle Mode */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1 mb-1.5">
                <Sparkles className="w-3 h-3 text-yellow-400" />
                <span>Subtitles</span>
              </span>
              <div className="flex flex-col space-y-1">
                {[
                  { id: 'dual', label: 'Dual (Tanglish + Eng)' },
                  { id: 'english', label: 'English Only' }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSubtitleModeChange(s.id)}
                    className={`flex items-center justify-between px-3 py-1.5 text-xs font-bold rounded-lg border transition ${
                      subtitleMode === s.id
                        ? 'bg-yellow-500/20 border-yellow-500/60 text-yellow-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span>{s.label}</span>
                    {subtitleMode === s.id && <Check className="w-3 h-3 text-yellow-400" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 font-black rounded-xl hover:brightness-110 active:scale-95 transition shadow-lg text-sm uppercase tracking-wider"
        >
          Save & Return to 3D Game
        </button>
      </div>
    </div>
  );
};
