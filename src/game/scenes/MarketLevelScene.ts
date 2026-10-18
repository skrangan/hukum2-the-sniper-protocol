import Phaser from 'phaser';
import { soundManager } from '../audio/SoundManager';

export interface GameEventData {
  aura: number;
  multiplier: number;
  composure: number;
  vijiSuspicion: number;
  hukumMode: boolean;
  phase: 'STEALTH' | 'HUKUM' | 'VICTORY' | 'BUSTED';
  activeDialogueKey: string | null;
}

export class MarketLevelScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite;
  private viji!: Phaser.GameObjects.Sprite;
  private vijiVisionCone!: Phaser.GameObjects.Graphics;
  private coconut!: Phaser.GameObjects.Sprite;
  private rickshaw!: Phaser.GameObjects.Sprite;
  private fireworksCart!: Phaser.GameObjects.Sprite;
  private thugs: Phaser.GameObjects.Sprite[] = [];
  private sniperCrosshairs: Phaser.GameObjects.Sprite[] = [];

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    SPACE: Phaser.Input.Keyboard.Key;
  };

  // State
  private composure: number = 100;
  private auraScore: number = 0;
  private multiplier: number = 1;
  private vijiSuspicion: number = 0;
  private isHukumMode: boolean = false;
  private gamePhase: 'STEALTH' | 'HUKUM' | 'VICTORY' | 'BUSTED' = 'STEALTH';
  private vijiFacingAngle: number = 0;
  private vijiTurnTimer: number = 0;
  private coconutKicked: boolean = false;
  private rickshawRolling: boolean = false;
  private fireworksExploded: boolean = false;
  private startTime: number = 0;

  constructor() {
    super({ key: 'MarketLevelScene' });
  }

  create() {
    this.startTime = Date.now();
    soundManager.startCinematicBgm();

    // Build Isometric Grid
    this.createIsometricGround();

    // Create Interactive Hazards
    this.createMarketEnvironment();

    // Create Characters
    this.createActors();

    // Setup Keyboard Controls
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = {
        W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        SPACE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
      };

      this.wasd.SPACE.on('down', () => {
        this.triggerSpectacleFlip();
      });
    }

    // Click to move or interact
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.handlePointerDown(pointer);
    });

    // Notify React of initial state
    this.emitState();

    // Dialogue intro
    this.game.events.emit('show-dialogue', 'lvl1_intro');
  }

  private createIsometricGround() {
    // 20x15 Isometric street grid
    const startX = 400;
    const startY = 100;
    const tileW = 64;
    const tileH = 32;

    for (let r = 0; r < 14; r++) {
      for (let c = 0; c < 12; c++) {
        const isoX = startX + (c - r) * (tileW / 2);
        const isoY = startY + (c + r) * (tileH / 2);

        const isSidewalk = (r === 0 || r === 13 || c === 0 || c === 11);
        const tile = this.add.image(isoX, isoY, isSidewalk ? 'iso_curb' : 'iso_ground');
        tile.setOrigin(0.5, 0.5);
        tile.setDepth(0);
      }
    }
  }

  private createMarketEnvironment() {
    // 1. Coconut hazard (placed near Tiger's starting alley)
    this.coconut = this.add.sprite(360, 240, 'coconut_hazard');
    this.coconut.setInteractive({ useHandCursor: true });
    this.coconut.setDepth(240);
    this.addInteractivePrompt(this.coconut, 'Kick Coconut [E / Click]');

    // 2. Auto-rickshaw on incline
    this.rickshaw = this.add.sprite(460, 260, 'auto_rickshaw');
    this.rickshaw.setDepth(260);

    // 3. 4 Bike Thugs blocking the school crossing
    const thugPositions = [
      { x: 570, y: 320 },
      { x: 610, y: 340 },
      { x: 550, y: 360 },
      { x: 630, y: 380 }
    ];

    thugPositions.forEach((pos, idx) => {
      const thug = this.add.sprite(pos.x, pos.y, 'thug_enemy');
      thug.setDepth(pos.y);
      thug.setData('alive', true);
      thug.setData('id', idx);
      this.thugs.push(thug);

      // Add speech bubble over lead thug
      if (idx === 0) {
        const bubble = this.add.text(pos.x - 30, pos.y - 45, 'Haha! Yaarum pogakoodathu!', {
          fontSize: '11px',
          color: '#f87171',
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          padding: { x: 4, y: 2 }
        });
        bubble.setDepth(pos.y + 1);
      }
    });

    // 4. Diwali Fireworks Cart (at the bottom of the slope)
    this.fireworksCart = this.add.sprite(690, 420, 'fireworks_cart');
    this.fireworksCart.setDepth(420);
  }

  private addInteractivePrompt(target: Phaser.GameObjects.Sprite, label: string) {
    const text = this.add.text(target.x, target.y - 25, label, {
      fontFamily: 'sans-serif',
      fontSize: '11px',
      color: '#fef08a',
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: { x: 4, y: 2 }
    }).setOrigin(0.5).setDepth(1000);

    this.tweens.add({
      targets: text,
      y: target.y - 30,
      duration: 800,
      yoyo: true,
      repeat: -1
    });
  }

  private createActors() {
    // Tiger Muthuvel Pandian (Protagonist)
    this.player = this.add.sprite(280, 200, 'tiger_player');
    this.player.setDepth(200);

    // Viji (Wife patrolling vegetable stall)
    this.viji = this.add.sprite(320, 360, 'viji_npc');
    this.viji.setDepth(360);

    // Viji's dynamic vision cone graphics
    this.vijiVisionCone = this.add.graphics();
    this.vijiVisionCone.setDepth(100);
  }

  update(_time: number, delta: number) {
    if (this.gamePhase === 'VICTORY' || this.gamePhase === 'BUSTED') return;

    this.handlePlayerMovement(delta);
    this.updateVijiPatrol(delta);
    this.checkVisionDetection();
  }

  private handlePlayerMovement(delta: number) {
    const speed = this.isHukumMode ? 0.08 : 0.16; // Swagger walk speed
    let vx = 0;
    let vy = 0;

    if (this.cursors.left?.isDown || this.wasd.A?.isDown) vx -= 1;
    if (this.cursors.right?.isDown || this.wasd.D?.isDown) vx += 1;
    if (this.cursors.up?.isDown || this.wasd.W?.isDown) vy -= 1;
    if (this.cursors.down?.isDown || this.wasd.S?.isDown) vy += 1;

    if (vx !== 0 && vy !== 0) {
      vx *= 0.7071;
      vy *= 0.7071;
    }

    if (vx !== 0 || vy !== 0) {
      this.player.x += vx * speed * delta;
      this.player.y += vy * speed * delta;
      this.player.setDepth(this.player.y);

      // Keep Tiger inside playable market boundaries
      this.player.x = Phaser.Math.Clamp(this.player.x, 200, 680);
      this.player.y = Phaser.Math.Clamp(this.player.y, 140, 480);
    }
  }

  private updateVijiPatrol(delta: number) {
    this.vijiTurnTimer += delta;

    // Viji rotates every 3.5 seconds
    if (this.vijiTurnTimer > 3500) {
      this.vijiTurnTimer = 0;
      this.vijiFacingAngle = (this.vijiFacingAngle + Math.PI / 2) % (Math.PI * 2);
    }

    // Draw Viji's vision cone
    this.vijiVisionCone.clear();

    const coneRange = 130;
    const coneFov = Math.PI / 3; // 60 degrees

    const startAngle = this.vijiFacingAngle - coneFov / 2;
    const endAngle = this.vijiFacingAngle + coneFov / 2;

    this.vijiVisionCone.beginPath();
    this.vijiVisionCone.moveTo(this.viji.x, this.viji.y);
    this.vijiVisionCone.arc(this.viji.x, this.viji.y, coneRange, startAngle, endAngle);
    this.vijiVisionCone.closePath();

    // Color changes if suspicion rises
    const coneColor = this.vijiSuspicion > 50 ? 0xef4444 : 0xfacc15;
    this.vijiVisionCone.fillStyle(coneColor, 0.22);
    this.vijiVisionCone.fill();
    this.vijiVisionCone.lineStyle(1.5, coneColor, 0.6);
    this.vijiVisionCone.stroke();
  }

  private checkVisionDetection() {
    const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.viji.x, this.viji.y);
    const angleToTiger = Phaser.Math.Angle.Between(this.viji.x, this.viji.y, this.player.x, this.player.y);

    const diff = Phaser.Math.Angle.Wrap(angleToTiger - this.vijiFacingAngle);

    // If Tiger is inside Viji's vision cone
    if (dist < 130 && Math.abs(diff) < Math.PI / 6) {
      // If Tiger is performing aggressive actions (kicking or hukum mode in front of her)
      if (this.coconutKicked && !this.fireworksExploded) {
        this.vijiSuspicion = Math.min(100, this.vijiSuspicion + 0.6);
      } else {
        this.vijiSuspicion = Math.max(0, this.vijiSuspicion - 0.2);
      }

      if (this.vijiSuspicion >= 100) {
        this.triggerBusted();
      }
    } else {
      this.vijiSuspicion = Math.max(0, this.vijiSuspicion - 0.1);
    }

    this.emitState();
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer) {
    if (this.gamePhase === 'VICTORY' || this.gamePhase === 'BUSTED') return;

    // Check click on coconut
    const distToCoconut = Phaser.Math.Distance.Between(pointer.worldX, pointer.worldY, this.coconut.x, this.coconut.y);
    const tigerToCoconut = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.coconut.x, this.coconut.y);

    if (distToCoconut < 30) {
      if (tigerToCoconut < 90) {
        this.kickCoconut();
      } else {
        // Move Tiger closer first
        this.tweens.add({
          targets: this.player,
          x: this.coconut.x - 30,
          y: this.coconut.y,
          duration: 600,
          onComplete: () => this.kickCoconut()
        });
      }
    }
  }

  public kickCoconut() {
    if (this.coconutKicked) return;
    this.coconutKicked = true;

    soundManager.playCoconutKick();

    // Kick animation
    this.tweens.add({
      targets: this.coconut,
      x: this.rickshaw.x - 15,
      y: this.rickshaw.y + 10,
      duration: 350,
      ease: 'Power2',
      onComplete: () => {
        // Coconut hits the rickshaw handbrake!
        soundManager.playRickshawRoll();
        this.coconut.setVisible(false);
        this.releaseRickshawHandbrake();
      }
    });

    this.game.events.emit('show-dialogue', 'lvl1_rickshaw_ready');
  }

  private releaseRickshawHandbrake() {
    if (this.rickshawRolling) return;
    this.rickshawRolling = true;

    // Trigger The Spectacle Flip if not already active
    if (!this.isHukumMode) {
      this.triggerSpectacleFlip();
    }

    // Rickshaw rolls down the isometric slope
    this.tweens.add({
      targets: this.rickshaw,
      x: 640,
      y: 380,
      angle: 15,
      duration: 1800,
      ease: 'Cubic.easeIn',
      onUpdate: () => {
        this.rickshaw.setDepth(this.rickshaw.y);
        this.checkRickshawCollisions();
      },
      onComplete: () => {
        // Crash into Fireworks Cart
        this.triggerFireworksExplosion();
      }
    });
  }

  private checkRickshawCollisions() {
    this.thugs.forEach((thug) => {
      if (thug.getData('alive')) {
        const d = Phaser.Math.Distance.Between(this.rickshaw.x, this.rickshaw.y, thug.x, thug.y);
        if (d < 45) {
          thug.setData('alive', false);
          this.knockoutThug(thug);
        }
      }
    });
  }

  private knockoutThug(thug: Phaser.GameObjects.Sprite) {
    this.auraScore += 1250 * this.multiplier;
    soundManager.playSniperShot();

    // Ragdoll flying knockback
    this.tweens.add({
      targets: thug,
      x: thug.x + Phaser.Math.Between(40, 80),
      y: thug.y - Phaser.Math.Between(30, 60),
      angle: 180,
      alpha: 0.6,
      duration: 400,
      ease: 'Back.easeOut'
    });
  }

  // The Iconic Spectacle Flip (Hukum Mode)
  public triggerSpectacleFlip() {
    if (this.isHukumMode) return;
    this.isHukumMode = true;
    this.gamePhase = 'HUKUM';
    this.multiplier = 10; // HUKUM x10

    soundManager.playSpectacleFlipBassDrop();
    this.cameras.main.flash(250, 255, 215, 0); // Golden flash
    this.cameras.main.shake(400, 0.015);

    // Call Rooftop Sniper Red Lasers onto all thugs
    this.thugs.forEach((thug) => {
      const crosshair = this.add.sprite(thug.x, thug.y - 10, 'sniper_crosshair');
      crosshair.setDepth(1000);
      crosshair.setScale(1.5);
      this.tweens.add({
        targets: crosshair,
        scale: 1,
        duration: 300,
        ease: 'Quad.easeOut'
      });
      this.sniperCrosshairs.push(crosshair);
    });

    this.game.events.emit('show-dialogue', 'lvl1_spec_flip');
    this.emitState();
  }

  private triggerFireworksExplosion() {
    if (this.fireworksExploded) return;
    this.fireworksExploded = true;

    soundManager.playExplosion();
    this.cameras.main.shake(600, 0.025);

    // Explode fireworks cart in dazzling particle burst
    for (let i = 0; i < 30; i++) {
      const p = this.add.circle(
        this.fireworksCart.x,
        this.fireworksCart.y,
        Phaser.Math.Between(3, 7),
        Phaser.Utils.Array.GetRandom([0xef4444, 0x3b82f6, 0xfacc15, 0x10b981, 0xa855f7])
      );
      p.setDepth(1500);

      this.tweens.add({
        targets: p,
        x: p.x + Phaser.Math.Between(-120, 120),
        y: p.y + Phaser.Math.Between(-100, 60),
        alpha: 0,
        scale: 0.2,
        duration: Phaser.Math.Between(600, 1200),
        onComplete: () => p.destroy()
      });
    }

    this.fireworksCart.setAlpha(0.4);

    // All remaining thugs eliminated
    this.thugs.forEach((thug) => {
      if (thug.getData('alive')) {
        thug.setData('alive', false);
        this.knockoutThug(thug);
      }
    });

    // Cleanup sniper crosshairs
    this.sniperCrosshairs.forEach(c => c.destroy());

    // Check Victory
    this.time.delayedCall(1500, () => {
      this.triggerVictory();
    });
  }

  private triggerVictory() {
    this.gamePhase = 'VICTORY';
    const clearTimeMs = Date.now() - this.startTime;
    this.auraScore += 5000 * this.multiplier;

    soundManager.playVictoryFanfare();
    this.game.events.emit('show-dialogue', 'lvl1_victory');

    // Notify React component of victory
    this.game.events.emit('level-completed', {
      levelNumber: 1,
      auraScore: this.auraScore,
      starsEarned: 3,
      clearTimeMs,
      spectacleFlipsUsed: 1,
      cameosUsed: ['vimal_taxi']
    });

    this.emitState();
  }

  private triggerBusted() {
    this.gamePhase = 'BUSTED';
    soundManager.playAlert();
    this.game.events.emit('show-dialogue', 'lvl1_viji_warning');
    this.game.events.emit('player-busted');
    this.emitState();
  }

  public retryLevel() {
    this.scene.restart();
  }

  private emitState() {
    const data: GameEventData = {
      aura: this.auraScore,
      multiplier: this.multiplier,
      composure: this.composure,
      vijiSuspicion: Math.round(this.vijiSuspicion),
      hukumMode: this.isHukumMode,
      phase: this.gamePhase,
      activeDialogueKey: null
    };
    this.game.events.emit('hud-update', data);
  }
}
