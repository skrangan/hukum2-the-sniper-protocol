// Advanced Multi-Bus Audio Engine for Hukum 2
// Featuring authentic movie-score synthesizer, bullet-time audio filtering, and independent toggles

class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private bulletTimeFilter: BiquadFilterNode | null = null;

  // Settings state (persisted)
  private isMusicEnabled: boolean = true;
  private isSfxEnabled: boolean = true;
  private musicVolume: number = 0.7;
  private sfxVolume: number = 0.8;

  // Sequencer state
  private isPlayingBgm: boolean = false;
  private bgmTimeoutId: number | null = null;
  private beatStep: number = 0;

  constructor() {
    this.loadSettings();
  }

  private loadSettings() {
    const savedMusic = localStorage.getItem('hukum2_music_enabled');
    const savedSfx = localStorage.getItem('hukum2_sfx_enabled');
    const savedMusicVol = localStorage.getItem('hukum2_music_volume');
    const savedSfxVol = localStorage.getItem('hukum2_sfx_volume');

    if (savedMusic !== null) this.isMusicEnabled = savedMusic === 'true';
    if (savedSfx !== null) this.isSfxEnabled = savedSfx === 'true';
    if (savedMusicVol !== null) this.musicVolume = parseFloat(savedMusicVol);
    if (savedSfxVol !== null) this.sfxVolume = parseFloat(savedSfxVol);
  }

  public saveSettings() {
    localStorage.setItem('hukum2_music_enabled', String(this.isMusicEnabled));
    localStorage.setItem('hukum2_sfx_enabled', String(this.isSfxEnabled));
    localStorage.setItem('hukum2_music_volume', String(this.musicVolume));
    localStorage.setItem('hukum2_sfx_volume', String(this.sfxVolume));
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master output
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

      // Bullet-Time low-pass filter
      this.bulletTimeFilter = this.ctx.createBiquadFilter();
      this.bulletTimeFilter.type = 'lowpass';
      this.bulletTimeFilter.frequency.setValueAtTime(20000, this.ctx.currentTime); // Normal open

      // BGM Bus
      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(this.isMusicEnabled ? this.musicVolume * 0.25 : 0, this.ctx.currentTime);

      // SFX Bus
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.isSfxEnabled ? this.sfxVolume * 0.7 : 0, this.ctx.currentTime);

      // Routing
      this.bgmGain.connect(this.bulletTimeFilter);
      this.bulletTimeFilter.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // --- Settings Toggles & Sliders ---

  public setMusicEnabled(enabled: boolean) {
    this.isMusicEnabled = enabled;
    this.saveSettings();
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setValueAtTime(enabled ? this.musicVolume * 0.25 : 0, this.ctx.currentTime);
    }
    if (enabled && !this.isPlayingBgm) {
      this.startCinematicBgm();
    }
  }

  public getMusicEnabled(): boolean {
    return this.isMusicEnabled;
  }

  public setSfxEnabled(enabled: boolean) {
    this.isSfxEnabled = enabled;
    this.saveSettings();
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(enabled ? this.sfxVolume * 0.7 : 0, this.ctx.currentTime);
    }
  }

  public getSfxEnabled(): boolean {
    return this.isSfxEnabled;
  }

  public setMusicVolume(val: number) {
    this.musicVolume = Math.max(0, Math.min(1, val));
    this.saveSettings();
    if (this.bgmGain && this.ctx && this.isMusicEnabled) {
      this.bgmGain.gain.setValueAtTime(this.musicVolume * 0.25, this.ctx.currentTime);
    }
  }

  public getMusicVolume(): number {
    return this.musicVolume;
  }

  public setSfxVolume(val: number) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    this.saveSettings();
    if (this.sfxGain && this.ctx && this.isSfxEnabled) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume * 0.7, this.ctx.currentTime);
    }
  }

  public getSfxVolume(): number {
    return this.sfxVolume;
  }

  // Legacy convenience toggle
  public setMuted(muted: boolean) {
    this.setMusicEnabled(!muted);
    this.setSfxEnabled(!muted);
  }

  public getMuted(): boolean {
    return !this.isMusicEnabled && !this.isSfxEnabled;
  }

  // --- Bullet-Time Audio Filter ---
  public setBulletTime(active: boolean) {
    this.initCtx();
    if (!this.bulletTimeFilter || !this.ctx) return;
    const t = this.ctx.currentTime;
    if (active) {
      // Muffler sweep like inside the eye of the storm
      this.bulletTimeFilter.frequency.exponentialRampToValueAtTime(380, t + 0.35);
    } else {
      this.bulletTimeFilter.frequency.exponentialRampToValueAtTime(20000, t + 0.3);
    }
  }

  // --- Iconic Anirudh "HUKUM" Theme Sequencer ---
  public startCinematicBgm() {
    if (this.isPlayingBgm) return;
    this.initCtx();
    if (!this.ctx) return;

    this.isPlayingBgm = true;
    this.beatStep = 0;

    const bpm = 124;
    const stepDuration = (60 / bpm) / 4; // 16th notes

    // The iconic Hukum Bass & Brass progression (Key of E Minor)
    // Riff frequencies
    const noteE1 = 41.2;
    const noteE2 = 82.41;
    const noteG2 = 98.0;
    const noteA2 = 110.0;
    const noteB2 = 123.47;
    const noteD3 = 146.83;

    const schedulePattern = () => {
      if (!this.isPlayingBgm || !this.ctx) return;
      const t = this.ctx.currentTime;

      // Every 16 steps = 1 measure (4 beats)
      const step = this.beatStep % 16;

      // 1. Heavy 4-on-the-Floor Kick on beats 0, 4, 8, 12
      if (step % 4 === 0 && this.isMusicEnabled) {
        const kickOsc = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kickOsc.type = 'sine';
        kickOsc.frequency.setValueAtTime(140, t);
        kickOsc.frequency.exponentialRampToValueAtTime(38, t + 0.12);

        kickGain.gain.setValueAtTime(0.5, t);
        kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

        kickOsc.connect(kickGain);
        kickGain.connect(this.bgmGain!);
        kickOsc.start(t);
        kickOsc.stop(t + 0.25);
      }

      // 2. Hukum Syncopated Distorted Bassline
      const bassNotes = [noteE1, 0, noteE1, noteE1, 0, noteG2, 0, noteE1, 0, noteA2, 0, noteG2, noteE1, 0, noteD3, noteB2];
      const currentNote = bassNotes[step];

      if (currentNote > 0 && this.isMusicEnabled) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'sawtooth';
        bassOsc.frequency.setValueAtTime(currentNote, t);

        bassGain.gain.setValueAtTime(0.3, t);
        bassGain.gain.exponentialRampToValueAtTime(0.01, t + stepDuration * 1.5);

        bassOsc.connect(bassGain);
        bassGain.connect(this.bgmGain!);
        bassOsc.start(t);
        bassOsc.stop(t + stepDuration * 1.6);
      }

      // 3. Mass Brass Horn Stabs (on key accents)
      if ((step === 0 || step === 3 || step === 6 || step === 10) && this.isMusicEnabled) {
        [1.0, 1.5, 2.0].forEach((mult) => {
          const brassOsc = this.ctx!.createOscillator();
          const brassGain = this.ctx!.createGain();
          brassOsc.type = 'sawtooth';
          brassOsc.frequency.setValueAtTime(noteE2 * mult, t);

          brassGain.gain.setValueAtTime(0.12, t);
          brassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

          brassOsc.connect(brassGain);
          brassGain.connect(this.bgmGain!);
          brassOsc.start(t);
          brassOsc.stop(t + 0.2);
        });
      }

      this.beatStep++;
      this.bgmTimeoutId = window.setTimeout(schedulePattern, stepDuration * 1000);
    };

    schedulePattern();
  }

  public stopCinematicBgm() {
    this.isPlayingBgm = false;
    if (this.bgmTimeoutId !== null) {
      clearTimeout(this.bgmTimeoutId);
      this.bgmTimeoutId = null;
    }
  }

  // --- Cinematic Movie Sound Effects (SFX) ---

  // 1. The 360° Spectacle Flip Bass Drop
  public playSpectacleFlipBassDrop() {
    if (!this.isSfxEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    this.setBulletTime(true);

    // Deep Sub-drop 808
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(160, t);
    subOsc.frequency.exponentialRampToValueAtTime(28, t + 1.1);

    subGain.gain.setValueAtTime(0.9, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

    subOsc.connect(subGain);
    subGain.connect(this.sfxGain!);
    subOsc.start(t);
    subOsc.stop(t + 1.2);

    // Metallic Aviator Glasses Flip Glint
    const glintOsc = this.ctx.createOscillator();
    const glintGain = this.ctx.createGain();
    glintOsc.type = 'triangle';
    glintOsc.frequency.setValueAtTime(900, t);
    glintOsc.frequency.exponentialRampToValueAtTime(3600, t + 0.12);
    glintOsc.frequency.exponentialRampToValueAtTime(1400, t + 0.35);

    glintGain.gain.setValueAtTime(0.4, t);
    glintGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    glintOsc.connect(glintGain);
    glintGain.connect(this.sfxGain!);
    glintOsc.start(t);
    glintOsc.stop(t + 0.4);

    setTimeout(() => {
      this.setBulletTime(false);
    }, 2800);
  }

  // 2. High-Caliber Rooftop Sniper Shot with Echo Tail
  public playSniperShot() {
    if (!this.isSfxEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Supersonic Crack (Filtered Noise)
    const bufferSize = this.ctx.sampleRate * 0.45;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.08));
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1600, t);
    filter.Q.setValueAtTime(3.5, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.9, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain!);
    whiteNoise.start(t);

    // Deep Bullet Thud Punch
    const punchOsc = this.ctx.createOscillator();
    const punchGain = this.ctx.createGain();
    punchOsc.type = 'triangle';
    punchOsc.frequency.setValueAtTime(190, t);
    punchOsc.frequency.exponentialRampToValueAtTime(40, t + 0.2);

    punchGain.gain.setValueAtTime(0.7, t);
    punchGain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

    punchOsc.connect(punchGain);
    punchGain.connect(this.sfxGain!);
    punchOsc.start(t);
    punchOsc.stop(t + 0.25);
  }

  // 3. Diwali Crackers Explosive Cascade
  public playExplosion() {
    if (!this.isSfxEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 1.1;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.4));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, t);
    filter.frequency.linearRampToValueAtTime(80, t + 1.0);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(1.0, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 1.1);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain!);
    noise.start(t);

    // Rapid secondary crackles
    for (let c = 0; c < 6; c++) {
      setTimeout(() => {
        if (!this.ctx || !this.isSfxEnabled) return;
        const popOsc = this.ctx.createOscillator();
        const popGain = this.ctx.createGain();
        const pt = this.ctx.currentTime;
        popOsc.type = 'sawtooth';
        popOsc.frequency.setValueAtTime(300 + Math.random() * 400, pt);
        popGain.gain.setValueAtTime(0.2, pt);
        popGain.gain.exponentialRampToValueAtTime(0.01, pt + 0.08);
        popOsc.connect(popGain);
        popGain.connect(this.sfxGain!);
        popOsc.start(pt);
        popOsc.stop(pt + 0.08);
      }, 100 + c * 110);
    }
  }

  // 4. Coconut Kick Thump
  public playCoconutKick() {
    if (!this.isSfxEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.12);

    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start(t);
    osc.stop(t + 0.14);
  }

  // 5. Auto-Rickshaw Engine Rev & Crash
  public playRickshawRoll() {
    if (!this.isSfxEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(65, t);
    osc.frequency.linearRampToValueAtTime(150, t + 0.7);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.8);

    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start(t);
    osc.stop(t + 0.8);
  }

  // 6. Suspicion Alert Ping
  public playAlert() {
    if (!this.isSfxEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(920, t);
    osc.frequency.setValueAtTime(1240, t + 0.08);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start(t);
    osc.stop(t + 0.22);
  }

  // 7. Iconic Jailer Mass Victory Anthem (Hukum Theme by Anirudh Ravichander)
  public playJailerThemeVictory() {
    // If both music and SFX are explicitly turned off, respect the user's setting
    if (!this.isMusicEnabled && !this.isSfxEnabled) return;

    this.initCtx();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    // Stop background tension BGM so the triumphant Hukum anthem takes full stage
    this.stopCinematicBgm();

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
    subGain.connect(this.masterGain!);
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
      const startTime = t + delay;

      // Layer A: Fat French Horn / Low Brass (Sawtooth + Low-pass)
      const hornOsc = this.ctx!.createOscillator();
      const hornGain = this.ctx!.createGain();
      hornOsc.type = 'sawtooth';
      hornOsc.frequency.setValueAtTime(note, startTime);

      hornGain.gain.setValueAtTime(0.32 * volScale, startTime);
      hornGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      hornOsc.connect(hornGain);
      hornGain.connect(this.masterGain!);
      hornOsc.start(startTime);
      hornOsc.stop(startTime + duration);

      // Layer B: Punchy Trumpet Lead (Square wave + slight detune for stadium brass thickness)
      const trumOsc = this.ctx!.createOscillator();
      const trumGain = this.ctx!.createGain();
      trumOsc.type = 'square';
      trumOsc.frequency.setValueAtTime(note * (octave2 ? 2.0 : 1.0) * 1.004, startTime);

      trumGain.gain.setValueAtTime(0.18 * volScale, startTime);
      trumGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.95);

      trumOsc.connect(trumGain);
      trumGain.connect(this.masterGain!);
      trumOsc.start(startTime);
      trumOsc.stop(startTime + duration * 0.95);
    });

    // 3. Driving Anirudh 808 Sub Kick & Trap Clap Rhythm (0 to 9 seconds)
    const kickTimes = [
      0.0, 0.28, 0.74, 1.0, 1.63, 2.0, 2.22, 2.72, 3.24,
      4.0, 4.47, 4.96, 5.72, 6.25, 6.75, 7.01, 7.78, 8.2, 8.6
    ];

    kickTimes.forEach((delay) => {
      const kt = t + delay;
      const kickOsc = this.ctx!.createOscillator();
      const kickGain = this.ctx!.createGain();
      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(155, kt);
      kickOsc.frequency.exponentialRampToValueAtTime(40, kt + 0.16);

      kickGain.gain.setValueAtTime(0.6 * volScale, kt);
      kickGain.gain.exponentialRampToValueAtTime(0.001, kt + 0.24);

      kickOsc.connect(kickGain);
      kickGain.connect(this.masterGain!);
      kickOsc.start(kt);
      kickOsc.stop(kt + 0.25);
    });

    // Snare / Stadium Claps on off-beats
    const clapTimes = [0.5, 1.38, 2.46, 2.96, 4.25, 5.2, 6.51, 7.46, 8.4];
    clapTimes.forEach((delay) => {
      const ct = t + delay;
      const clapOsc = this.ctx!.createOscillator();
      const clapGain = this.ctx!.createGain();
      clapOsc.type = 'triangle';
      clapOsc.frequency.setValueAtTime(420, ct);
      clapOsc.frequency.exponentialRampToValueAtTime(180, ct + 0.12);

      clapGain.gain.setValueAtTime(0.25 * volScale, ct);
      clapGain.gain.exponentialRampToValueAtTime(0.001, ct + 0.14);

      clapOsc.connect(clapGain);
      clapGain.connect(this.masterGain!);
      clapOsc.start(ct);
      clapOsc.stop(ct + 0.15);
    });
  }

  public playVictoryFanfare() {
    this.playJailerThemeVictory();
  }
}

export const soundManager = new SoundManager();
