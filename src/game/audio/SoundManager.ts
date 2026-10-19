// Dynamic Web Audio API Cinematic Sound Engine for HUKUM 2: The Sniper Protocol
// Delivers realistic Anirudh-style mass brass/bass score, ambient atmospheric soundscapes,
// and contextual physics/weapon/UI sound effects with independent Music & SFX controls.

export type MusicThemeMode = 'stealth' | 'hukum' | 'port_rain' | 'carnival' | 'mansion' | 'victory';

export interface AudioSettingsState {
  musicEnabled: boolean;
  sfxEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
}

const STORAGE_KEY = 'hukum2_audio_settings_v1';

class SoundManager {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private ambienceGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;

  private musicEnabled: boolean = true;
  private sfxEnabled: boolean = true;
  private musicVolume: number = 0.75;
  private sfxVolume: number = 0.85;

  private isPlayingBgm: boolean = false;
  private currentTheme: MusicThemeMode = 'stealth';
  private stepIndex: number = 0;
  private bgmTimer: number | null = null;
  private ambienceNode: AudioBufferSourceNode | null = null;
  private listeners: Set<(state: AudioSettingsState) => void> = new Set();

  constructor() {
    this.loadSettings();
  }

  private loadSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.musicEnabled === 'boolean') this.musicEnabled = parsed.musicEnabled;
        if (typeof parsed.sfxEnabled === 'boolean') this.sfxEnabled = parsed.sfxEnabled;
        if (typeof parsed.musicVolume === 'number') this.musicVolume = parsed.musicVolume;
        if (typeof parsed.sfxVolume === 'number') this.sfxVolume = parsed.sfxVolume;
      }
    } catch {
      // Fallback to defaults if storage unavailable
    }
  }

  private saveSettings() {
    try {
      const state: AudioSettingsState = {
        musicEnabled: this.musicEnabled,
        sfxEnabled: this.sfxEnabled,
        musicVolume: this.musicVolume,
        sfxVolume: this.sfxVolume
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      this.listeners.forEach((cb) => cb(state));
    } catch {
      // Ignore storage errors
    }
  }

  public subscribe(cb: (state: AudioSettingsState) => void): () => void {
    this.listeners.add(cb);
    cb(this.getSettings());
    return () => {
      this.listeners.delete(cb);
    };
  }

  public getSettings(): AudioSettingsState {
    return {
      musicEnabled: this.musicEnabled,
      sfxEnabled: this.sfxEnabled,
      musicVolume: this.musicVolume,
      sfxVolume: this.sfxVolume
    };
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-18, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(18, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(6, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.2, this.ctx.currentTime);
      this.compressor.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.ambienceGain = this.ctx.createGain();

      this.musicGain.connect(this.compressor);
      this.sfxGain.connect(this.compressor);
      this.ambienceGain.connect(this.compressor);

      this.applyGainValues();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  private applyGainValues() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (this.musicGain) {
      const targetMusic = this.musicEnabled ? this.musicVolume * 0.42 : 0.0001;
      this.musicGain.gain.setTargetAtTime(targetMusic, now, 0.04);
    }
    if (this.sfxGain) {
      const targetSfx = this.sfxEnabled ? this.sfxVolume * 0.9 : 0.0001;
      this.sfxGain.gain.setTargetAtTime(targetSfx, now, 0.02);
    }
    if (this.ambienceGain) {
      const targetAmb = this.sfxEnabled ? this.sfxVolume * 0.18 : 0.0001;
      this.ambienceGain.gain.setTargetAtTime(targetAmb, now, 0.05);
    }
  }

  // Independent Music Toggle
  public setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    this.initCtx();
    this.applyGainValues();
    if (enabled && !this.isPlayingBgm) {
      this.startCinematicBgm(this.currentTheme);
    }
    this.saveSettings();
  }

  public isMusicEnabled(): boolean {
    return this.musicEnabled;
  }

  // Independent SFX Toggle
  public setSfxEnabled(enabled: boolean) {
    this.sfxEnabled = enabled;
    this.initCtx();
    this.applyGainValues();
    this.saveSettings();
    if (enabled) {
      this.playUiClick();
    }
  }

  public isSfxEnabled(): boolean {
    return this.sfxEnabled;
  }

  public setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    this.initCtx();
    this.applyGainValues();
    this.saveSettings();
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    this.initCtx();
    this.applyGainValues();
    this.saveSettings();
  }

  // Backwards-compatible master mute helper
  public setMuted(muted: boolean) {
    this.musicEnabled = !muted;
    this.sfxEnabled = !muted;
    this.initCtx();
    this.applyGainValues();
    this.saveSettings();
  }

  public getMuted(): boolean {
    return !this.musicEnabled && !this.sfxEnabled;
  }

  private getSfxDest(): AudioNode | null {
    if (!this.sfxEnabled) return null;
    this.initCtx();
    return this.sfxGain || (this.ctx ? this.ctx.destination : null);
  }

  private getMusicDest(): AudioNode | null {
    this.initCtx();
    return this.musicGain || (this.ctx ? this.ctx.destination : null);
  }

  // Subtle Tactile UI Click
  public playUiClick() {
    const dest = this.getSfxDest();
    if (!dest || !this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400, t);
    osc.frequency.exponentialRampToValueAtTime(420, t + 0.045);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(t);
    osc.stop(t + 0.055);
  }

  // Metallic Equipment / Loadout Equip Sound
  public playEquipGear() {
    const dest = this.getSfxDest();
    if (!dest || !this.ctx) return;

    const t = this.ctx.currentTime;
    // Metallic slide + lock click
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(320, t);
    osc1.frequency.exponentialRampToValueAtTime(980, t + 0.08);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, t);
    filter.Q.setValueAtTime(4, t);

    gain1.gain.setValueAtTime(0.25, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.11);

    osc1.connect(filter);
    filter.connect(gain1);
    gain1.connect(dest);
    osc1.start(t);
    osc1.stop(t + 0.12);

    // Second lock click
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(2200, t + 0.07);
    osc2.frequency.exponentialRampToValueAtTime(750, t + 0.13);
    gain2.gain.setValueAtTime(0.22, t + 0.07);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc2.connect(gain2);
    gain2.connect(dest);
    osc2.start(t + 0.07);
    osc2.stop(t + 0.15);
  }

  // Footstep Swagger Thud
  public playFootstep() {
    const dest = this.getSfxDest();
    if (!dest || !this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(115, t);
    osc.frequency.exponentialRampToValueAtTime(38, t + 0.07);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(t);
    osc.stop(t + 0.085);
  }

  // Iconic Mass Glasses Flip Bass Drop (Anirudh Hukum style)
  public playSpectacleFlipBassDrop() {
    this.setTheme('hukum');
    const dest = this.getSfxDest();
    if (!dest || !this.ctx) return;

    const t = this.ctx.currentTime;

    // 1. Heavy Pitch-dropping 808 Sub-Bass + Brass Growl
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    const distortion = this.ctx.createWaveShaper();

    subOsc.type = 'sawtooth';
    subOsc.frequency.setValueAtTime(155, t);
    subOsc.frequency.exponentialRampToValueAtTime(32.7, t + 0.95);

    subGain.gain.setValueAtTime(0.8, t);
    subGain.gain.exponentialRampToValueAtTime(0.01, t + 1.45);

    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = (i * 2) / 256 - 1;
      curve[i] = ((Math.PI + 6) * x) / (Math.PI + 6 * Math.abs(x));
    }
    distortion.curve = curve;

    subOsc.connect(distortion);
    distortion.connect(subGain);
    subGain.connect(dest);

    subOsc.start(t);
    subOsc.stop(t + 1.5);

    // 2. Brass Horn Hit ("HUKUM" Motif Chord)
    const brassFreqs = [130.81, 196.0, 261.63, 311.13]; // Cm power chord
    brassFreqs.forEach((f) => {
      if (!this.ctx) return;
      const bOsc = this.ctx.createOscillator();
      const bFilter = this.ctx.createBiquadFilter();
      const bGain = this.ctx.createGain();

      bOsc.type = 'sawtooth';
      bOsc.frequency.setValueAtTime(f * 0.98, t + 0.08);
      bOsc.frequency.linearRampToValueAtTime(f, t + 0.16);

      bFilter.type = 'lowpass';
      bFilter.frequency.setValueAtTime(2200, t + 0.08);
      bFilter.frequency.exponentialRampToValueAtTime(450, t + 1.1);

      bGain.gain.setValueAtTime(0.18, t + 0.08);
      bGain.gain.exponentialRampToValueAtTime(0.001, t + 1.15);

      bOsc.connect(bFilter);
      bFilter.connect(bGain);
      bGain.connect(dest);

      bOsc.start(t + 0.08);
      bOsc.stop(t + 1.2);
    });

    // 3. High Metallic Glasses Flip Zing
    const flipOsc = this.ctx.createOscillator();
    const flipGain = this.ctx.createGain();

    flipOsc.type = 'triangle';
    flipOsc.frequency.setValueAtTime(950, t);
    flipOsc.frequency.exponentialRampToValueAtTime(3600, t + 0.14);
    flipOsc.frequency.exponentialRampToValueAtTime(1480, t + 0.36);

    flipGain.gain.setValueAtTime(0.35, t);
    flipGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    flipOsc.connect(flipGain);
    flipGain.connect(dest);

    flipOsc.start(t);
    flipOsc.stop(t + 0.42);
  }

  // Metallic glasses frame click & lens tap
  public playSpecsClink() {
    const dest = this.getSfxDest();
    if (!dest || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(2800, t);
    osc.frequency.exponentialRampToValueAtTime(1400, t + 0.08);
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  // Glasses shake sound effect (Shake 1: sharp metallic swish; Shake 2: deep 808 sub bass drop)
  public playSpecsShakeHit(shakeNum: 1 | 2 = 1) {
    const dest = this.getSfxDest();
    if (!dest || !this.ctx) return;
    const t = this.ctx.currentTime;
    if (shakeNum === 1) {
      // First shake: metallic swish & punchy mid-tone
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(110, t + 0.16);
      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(t);
      osc.stop(t + 0.2);
    } else {
      // Second shake: heavy 808 sub bass drop + metallic clink (Signals Hill Snipers!)
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(220, t);
      subOsc.frequency.exponentialRampToValueAtTime(34, t + 0.7);
      subGain.gain.setValueAtTime(0.85, t);
      subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.75);
      subOsc.connect(subGain);
      subGain.connect(dest);
      subOsc.start(t);
      subOsc.stop(t + 0.8);

      const highOsc = this.ctx.createOscillator();
      const highGain = this.ctx.createGain();
      highOsc.type = 'triangle';
      highOsc.frequency.setValueAtTime(3200, t);
      highOsc.frequency.exponentialRampToValueAtTime(1800, t + 0.12);
      highGain.gain.setValueAtTime(0.35, t);
      highGain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
      highOsc.connect(highGain);
      highGain.connect(dest);
      highOsc.start(t);
      highOsc.stop(t + 0.15);
    }
  }

  // Rapid synchronized sniper volley (e.g. 6 shots across canyon)
  public playSniperVolley(shots: number = 6) {
    for (let i = 0; i < shots; i++) {
      setTimeout(() => {
        this.playSniperShot();
      }, i * 75);
    }
  }

  // Sniper Rifle Suppressed / High-Caliber Crack + Shell Casing
  public playSniperShot() {
    const dest = this.getSfxDest();
    if (!dest || !this.ctx) return;

    const t = this.ctx.currentTime;

    // Supersonic Crack Noise
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.45);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.09));
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1650, t);
    filter.Q.setValueAtTime(1.8, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.85, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(dest);
    whiteNoise.start(t);

    // Muzzle Thump Body
    const kickOsc = this.ctx.createOscillator();
    const kickGain = this.ctx.createGain();
    kickOsc.type = 'sine';
    kickOsc.frequency.setValueAtTime(260, t);
    kickOsc.frequency.exponentialRampToValueAtTime(42, t + 0.25);

    kickGain.gain.setValueAtTime(0.65, t);
    kickGain.gain.exponentialRampToValueAtTime(0.01, t + 0.28);

    kickOsc.connect(kickGain);
    kickGain.connect(dest);

    kickOsc.start(t);
    kickOsc.stop(t + 0.3);

    // Brass Shell Casing Ping
    const shellOsc = this.ctx.createOscillator();
    const shellGain = this.ctx.createGain();
    shellOsc.type = 'sine';
    shellOsc.frequency.setValueAtTime(4100, t + 0.22);
    shellOsc.frequency.exponentialRampToValueAtTime(3400, t + 0.34);
    shellGain.gain.setValueAtTime(0.12, t + 0.22);
    shellGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    shellOsc.connect(shellGain);
    shellGain.connect(dest);
    shellOsc.start(t + 0.22);
    shellOsc.stop(t + 0.36);
  }

  // Laser Target Lock Ping
  public playSniperPing() {
    const dest = this.getSfxDest();
    if (!dest || !this.ctx) return;

    const t = this.ctx.currentTime;
    [1320, 1760, 2640].forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + i * 0.055);
      gain.gain.setValueAtTime(0.22, t + i * 0.055);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.055 + 0.16);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(t + i * 0.055);
      osc.stop(t + i * 0.055 + 0.17);
    });
  }

  // Explosion (Fireworks cart / Rickshaw crash / Pyro)
  public playExplosion() {
    const dest = this.getSfxDest();
    if (!dest || !this.ctx) return;

    const t = this.ctx.currentTime;
    const bufferSize = Math.floor(this.ctx.sampleRate * 1.2);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.38));
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(520, t);
    filter.frequency.linearRampToValueAtTime(65, t + 1.0);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.95, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 1.15);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    whiteNoise.start(t);

    // Secondary Diwali crackle pops
    for (let p = 0; p < 5; p++) {
      const delay = 0.15 + p * 0.11;
      const popOsc = this.ctx.createOscillator();
      const popGain = this.ctx.createGain();
      popOsc.type = 'square';
      popOsc.frequency.setValueAtTime(900 + p * 240, t + delay);
      popOsc.frequency.exponentialRampToValueAtTime(180, t + delay + 0.06);
      popGain.gain.setValueAtTime(0.22, t + delay);
      popGain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.07);
      popOsc.connect(popGain);
      popGain.connect(dest);
      popOsc.start(t + delay);
      popOsc.stop(t + delay + 0.08);
    }
  }

  // Coconut Kick / Hazard Trigger Thump
  public playCoconutKick() {
    const dest = this.getSfxDest();
    if (!dest || !this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(82, t + 0.14);

    gain.gain.setValueAtTime(0.55, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.16);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(t);
    osc.stop(t + 0.17);
  }

  // Auto Rickshaw 2-Stroke Engine Rev & Horn
  public playRickshawRoll() {
    const dest = this.getSfxDest();
    if (!dest || !this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(68, t);
    osc.frequency.linearRampToValueAtTime(165, t + 0.65);

    gain.gain.setValueAtTime(0.32, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.75);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(t);
    osc.stop(t + 0.78);

    // Classic Indian Auto Bulb Horn ("Paa-Paa!")
    [0.05, 0.22].forEach((offset) => {
      if (!this.ctx) return;
      const horn = this.ctx.createOscillator();
      const hGain = this.ctx.createGain();
      horn.type = 'sawtooth';
      horn.frequency.setValueAtTime(440, t + offset);
      horn.frequency.setValueAtTime(554.37, t + offset + 0.03);
      hGain.gain.setValueAtTime(0.22, t + offset);
      hGain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.13);
      horn.connect(hGain);
      hGain.connect(dest);
      horn.start(t + offset);
      horn.stop(t + offset + 0.14);
    });
  }

  // Syndicate Cameo Summon Roar / Engine
  public playCameoSummon() {
    const dest = this.getSfxDest();
    if (!dest || !this.ctx) return;

    const t = this.ctx.currentTime;
    // Deep V8 Vintage Mercedes + Brass Swell
    const freqs = [65.41, 98.0, 130.81, 196.0];
    freqs.forEach((f) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f * 0.85, t);
      osc.frequency.exponentialRampToValueAtTime(f * 1.15, t + 0.65);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, t);

      gain.gain.setValueAtTime(0.24, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.75);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(dest);
      osc.start(t);
      osc.stop(t + 0.78);
    });
  }

  // Whistle / Alert SFX
  public playAlert() {
    const dest = this.getSfxDest();
    if (!dest || !this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.setValueAtTime(1174.66, t + 0.08);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.26);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(t);
    osc.stop(t + 0.27);
  }

  // Authentic Jailer Mass Victory Anthem (Hukum Theme by Anirudh Ravichander)
  public playJailerThemeVictory() {
    if (!this.musicEnabled && !this.sfxEnabled) return;

    this.initCtx();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.stopCinematicBgm();
    this.setTheme('victory');

    const dest = this.getMusicDest() || this.getSfxDest();
    if (!dest) return;

    const t = this.ctx.currentTime + 0.05;
    const volScale = Math.max(0.4, this.musicVolume);

    // 1. Initial Explosive 808 Sub-Bass Drop Hit (Earth-shattering mass impact)
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(160, t);
    subOsc.frequency.exponentialRampToValueAtTime(32, t + 1.2);
    subGain.gain.setValueAtTime(0.9 * volScale, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 1.4);
    subOsc.connect(subGain);
    subGain.connect(dest);
    subOsc.start(t);
    subOsc.stop(t + 1.4);

    // 2. The Authentic "HUKUM / TIGER KA HUKUM" Mass Brass Theme (composed by Anirudh)
    // Key: E Minor (E - G - A - B - D - E)
    const melody: { note: number; duration: number; delay: number; octave2?: boolean }[] = [
      // Phrase 1: The Building Swagger Riff
      { note: 164.81, duration: 0.28, delay: 0.0 },    // E3
      { note: 164.81, duration: 0.22, delay: 0.28 },   // E3
      { note: 196.00, duration: 0.24, delay: 0.50 },   // G3
      { note: 220.00, duration: 0.26, delay: 0.74 },   // A3
      { note: 246.94, duration: 0.38, delay: 1.00 },   // B3
      { note: 293.66, duration: 0.25, delay: 1.38 },   // D4
      { note: 329.63, duration: 0.55, delay: 1.63, octave2: true }, // E4 (Major Brass Hit!)

      // Phrase 2: The Downward Tiger Walk Stabs
      { note: 293.66, duration: 0.24, delay: 2.22 },   // D4
      { note: 246.94, duration: 0.26, delay: 2.46 },   // B3
      { note: 220.00, duration: 0.24, delay: 2.72 },   // A3
      { note: 196.00, duration: 0.28, delay: 2.96 },   // G3
      { note: 164.81, duration: 0.70, delay: 3.24, octave2: true }, // E3 (Heavy resolve!)

      // Phrase 3: Syncopated Hukum Turn
      { note: 246.94, duration: 0.25, delay: 4.00 },   // B3
      { note: 246.94, duration: 0.22, delay: 4.25 },   // B3
      { note: 293.66, duration: 0.25, delay: 4.47 },   // D4
      { note: 246.94, duration: 0.24, delay: 4.72 },   // B3
      { note: 220.00, duration: 0.24, delay: 4.96 },   // A3
      { note: 196.00, duration: 0.26, delay: 5.20 },   // G3
      { note: 220.00, duration: 0.26, delay: 5.46 },   // A3
      { note: 246.94, duration: 0.45, delay: 5.72 },   // B3

      // Phrase 4: The Climax Screaming Horn (Heroic High Octave Peak)
      { note: 329.63, duration: 0.26, delay: 6.25, octave2: true }, // E4
      { note: 392.00, duration: 0.24, delay: 6.51, octave2: true }, // G4
      { note: 440.00, duration: 0.26, delay: 6.75, octave2: true }, // A4
      { note: 493.88, duration: 0.45, delay: 7.01, octave2: true }, // B4
      { note: 587.33, duration: 0.32, delay: 7.46, octave2: true }, // D5
      { note: 659.25, duration: 1.10, delay: 7.78, octave2: true }  // E5 (Iconic Anirudh Stadium Horn!)
    ];

    melody.forEach(({ note, duration, delay, octave2 }) => {
      if (!this.ctx) return;
      const startTime = t + delay;

      // Layer A: Fat French Horn / Low Brass (Sawtooth + Low-pass)
      const hornOsc = this.ctx.createOscillator();
      const hornGain = this.ctx.createGain();
      hornOsc.type = 'sawtooth';
      hornOsc.frequency.setValueAtTime(note, startTime);

      hornGain.gain.setValueAtTime(0.32 * volScale, startTime);
      hornGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      hornOsc.connect(hornGain);
      hornGain.connect(dest);
      hornOsc.start(startTime);
      hornOsc.stop(startTime + duration);

      // Layer B: Punchy Trumpet Lead (Square wave + slight detune for stadium brass thickness)
      const trumOsc = this.ctx.createOscillator();
      const trumGain = this.ctx.createGain();
      trumOsc.type = 'square';
      trumOsc.frequency.setValueAtTime(note * (octave2 ? 2.0 : 1.0) * 1.004, startTime);

      trumGain.gain.setValueAtTime(0.18 * volScale, startTime);
      trumGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.95);

      trumOsc.connect(trumGain);
      trumGain.connect(dest);
      trumOsc.start(startTime);
      trumOsc.stop(startTime + duration * 0.95);
    });

    // 3. Driving Anirudh 808 Sub Kick & Trap Clap Rhythm (0 to 9 seconds)
    const kickTimes = [
      0.0, 0.28, 0.74, 1.0, 1.63, 2.0, 2.22, 2.72, 3.24,
      4.0, 4.47, 4.96, 5.72, 6.25, 6.75, 7.01, 7.78, 8.2, 8.6
    ];

    kickTimes.forEach((delay) => {
      if (!this.ctx) return;
      const kt = t + delay;
      const kickOsc = this.ctx.createOscillator();
      const kickGain = this.ctx.createGain();
      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(155, kt);
      kickOsc.frequency.exponentialRampToValueAtTime(40, kt + 0.16);

      kickGain.gain.setValueAtTime(0.6 * volScale, kt);
      kickGain.gain.exponentialRampToValueAtTime(0.001, kt + 0.24);

      kickOsc.connect(kickGain);
      kickGain.connect(dest);
      kickOsc.start(kt);
      kickOsc.stop(kt + 0.25);
    });

    // Snare / Stadium Claps on off-beats
    const clapTimes = [0.5, 1.38, 2.46, 2.96, 4.25, 5.2, 6.51, 7.46, 8.4];
    clapTimes.forEach((delay) => {
      if (!this.ctx) return;
      const ct = t + delay;
      const clapOsc = this.ctx.createOscillator();
      const clapGain = this.ctx.createGain();
      clapOsc.type = 'triangle';
      clapOsc.frequency.setValueAtTime(420, ct);
      clapOsc.frequency.exponentialRampToValueAtTime(180, ct + 0.12);

      clapGain.gain.setValueAtTime(0.25 * volScale, ct);
      clapGain.gain.exponentialRampToValueAtTime(0.001, ct + 0.14);

      clapOsc.connect(clapGain);
      clapGain.connect(dest);
      clapOsc.start(ct);
      clapOsc.stop(ct + 0.15);
    });
  }

  // Mass Victory Brass Fanfare
  public playVictoryFanfare() {
    this.playJailerThemeVictory();
  }

  public setTheme(theme: MusicThemeMode) {
    this.currentTheme = theme;
  }

  public getTheme(): MusicThemeMode {
    return this.currentTheme;
  }

  // Multi-layered Movie-Style Procedural Score (Bassline + Brass Motif + Percussion)
  public startCinematicBgm(theme?: MusicThemeMode) {
    if (theme) {
      this.currentTheme = theme;
    }
    this.initCtx();
    this.applyGainValues();

    if (this.isPlayingBgm) return;
    this.isPlayingBgm = true;
    this.stepIndex = 0;

    const scheduleStep = () => {
      if (!this.isPlayingBgm) return;

      const bpm = this.currentTheme === 'hukum' ? 132 : this.currentTheme === 'carnival' ? 126 : 112;
      const stepDurationSec = 60 / bpm / 2; // Eighth-note resolution

      if (this.musicEnabled && this.ctx) {
        const musicDest = this.getMusicDest();
        if (musicDest) {
          this.triggerScoreStep(this.stepIndex, stepDurationSec, musicDest);
        }
      }

      this.stepIndex = (this.stepIndex + 1) % 16;
      this.bgmTimer = window.setTimeout(scheduleStep, stepDurationSec * 1000);
    };

    scheduleStep();
  }

  private triggerScoreStep(step: number, dur: number, dest: AudioNode) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // 1. Driving Sub-Bass Riff (C minor / G phrygian mass cinema progression)
    const bassPatternStealth = [65.41, 0, 65.41, 77.78, 65.41, 0, 58.27, 61.74, 65.41, 0, 65.41, 77.78, 87.31, 77.78, 65.41, 58.27];
    const bassPatternHukum = [65.41, 65.41, 98.0, 65.41, 77.78, 65.41, 116.54, 98.0, 65.41, 65.41, 130.81, 98.0, 87.31, 77.78, 65.41, 61.74];
    const pattern = this.currentTheme === 'hukum' ? bassPatternHukum : bassPatternStealth;
    const freq = pattern[step];

    if (freq > 0) {
      const bassOsc = this.ctx.createOscillator();
      const bassFilter = this.ctx.createBiquadFilter();
      const bassGain = this.ctx.createGain();

      bassOsc.type = this.currentTheme === 'hukum' ? 'sawtooth' : 'triangle';
      bassOsc.frequency.setValueAtTime(freq, t);
      bassOsc.frequency.exponentialRampToValueAtTime(freq * 0.96, t + dur * 0.85);

      bassFilter.type = 'lowpass';
      bassFilter.frequency.setValueAtTime(this.currentTheme === 'hukum' ? 680 : 320, t);

      bassGain.gain.setValueAtTime(this.currentTheme === 'hukum' ? 0.34 : 0.24, t);
      bassGain.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.92);

      bassOsc.connect(bassFilter);
      bassFilter.connect(bassGain);
      bassGain.connect(dest);

      bassOsc.start(t);
      bassOsc.stop(t + dur * 0.95);
    }

    // 2. Cinematic Kick Drum on beats 0, 4, 8, 12 (plus syncopation on 14 in Hukum mode)
    if (step % 4 === 0 || (this.currentTheme === 'hukum' && step === 14)) {
      const kickOsc = this.ctx.createOscillator();
      const kickGain = this.ctx.createGain();
      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(135, t);
      kickOsc.frequency.exponentialRampToValueAtTime(34, t + 0.16);

      kickGain.gain.setValueAtTime(0.42, t);
      kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      kickOsc.connect(kickGain);
      kickGain.connect(dest);
      kickOsc.start(t);
      kickOsc.stop(t + 0.19);
    }

    // 3. Crisp Hi-Hat / Shaker pulse on off-beats
    if (step % 2 === 1) {
      const hatOsc = this.ctx.createOscillator();
      const hatFilter = this.ctx.createBiquadFilter();
      const hatGain = this.ctx.createGain();

      hatOsc.type = 'square';
      hatOsc.frequency.setValueAtTime(5200 + (step % 3) * 600, t);
      hatFilter.type = 'highpass';
      hatFilter.frequency.setValueAtTime(4500, t);

      hatGain.gain.setValueAtTime(0.045, t);
      hatGain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

      hatOsc.connect(hatFilter);
      hatFilter.connect(hatGain);
      hatGain.connect(dest);
      hatOsc.start(t);
      hatOsc.stop(t + 0.05);
    }

    // 4. Iconic "Jailer / Hukum" Brass Lead Stabs on signature accents
    const leadNotes: Record<number, number> =
      this.currentTheme === 'hukum'
        ? { 0: 261.63, 3: 311.13, 6: 392.0, 8: 261.63, 11: 349.23, 12: 311.13, 14: 246.94 }
        : { 0: 196.0, 6: 233.08, 12: 261.63 };

    const leadFreq = leadNotes[step];
    if (leadFreq) {
      const brass = this.ctx.createOscillator();
      const brassFilter = this.ctx.createBiquadFilter();
      const brassGain = this.ctx.createGain();

      brass.type = 'sawtooth';
      brass.frequency.setValueAtTime(leadFreq, t);

      brassFilter.type = 'lowpass';
      brassFilter.frequency.setValueAtTime(this.currentTheme === 'hukum' ? 1900 : 950, t);
      brassFilter.frequency.exponentialRampToValueAtTime(420, t + dur * 1.4);

      brassGain.gain.setValueAtTime(this.currentTheme === 'hukum' ? 0.18 : 0.09, t);
      brassGain.gain.exponentialRampToValueAtTime(0.001, t + dur * 1.45);

      brass.connect(brassFilter);
      brassFilter.connect(brassGain);
      brassGain.connect(dest);

      brass.start(t);
      brass.stop(t + dur * 1.5);
    }
  }

  public stopCinematicBgm() {
    this.isPlayingBgm = false;
    if (this.bgmTimer !== null) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
    if (this.ambienceNode) {
      try {
        this.ambienceNode.stop();
      } catch {}
      this.ambienceNode = null;
    }
  }
}

export const soundManager = new SoundManager();
