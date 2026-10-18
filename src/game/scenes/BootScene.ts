import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Generate all isometric textures dynamically using HTML5 Canvas
    this.createIsometricTileTexture();
    this.createTigerTexture();
    this.createVijiTexture();
    this.createGoonTexture();
    this.createRickshawTexture();
    this.createCoconutTexture();
    this.createFireworksCartTexture();
    this.createSniperCrosshairTexture();
  }

  create() {
    this.scene.start('MarketLevelScene');
  }

  private createIsometricTileTexture() {
    // 64x32 isometric diamond tile
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;

    // Ground diamond
    ctx.beginPath();
    ctx.moveTo(32, 0);
    ctx.lineTo(64, 16);
    ctx.lineTo(32, 32);
    ctx.lineTo(0, 16);
    ctx.closePath();

    ctx.fillStyle = '#334155'; // Dark slate street
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.stroke();

    this.textures.addCanvas('iso_ground', canvas);

    // Hazard / Sidewalk tile
    const curbCanvas = document.createElement('canvas');
    curbCanvas.width = 64;
    curbCanvas.height = 32;
    const curbCtx = curbCanvas.getContext('2d')!;
    curbCtx.beginPath();
    curbCtx.moveTo(32, 0);
    curbCtx.lineTo(64, 16);
    curbCtx.lineTo(32, 32);
    curbCtx.lineTo(0, 16);
    curbCtx.closePath();
    curbCtx.fillStyle = '#1e293b';
    curbCtx.fill();
    curbCtx.strokeStyle = '#f59e0b'; // Gold curb border
    curbCtx.lineWidth = 1;
    curbCtx.stroke();
    this.textures.addCanvas('iso_curb', curbCanvas);
  }

  private createTigerTexture() {
    // Tiger Muthuvel Pandian: Silver beard, white linen shirt/veshti, dark aviator glasses
    const canvas = document.createElement('canvas');
    canvas.width = 48;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    // Shadow
    ctx.beginPath();
    ctx.ellipse(24, 60, 16, 6, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fill();

    // Body (White linen shirt)
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(14, 24, 20, 26);

    // Collar
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(18, 24);
    ctx.lineTo(24, 34);
    ctx.lineTo(30, 24);
    ctx.fill();

    // Veshti / Belt
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(14, 46, 20, 14);
    ctx.fillStyle = '#d97706'; // Gold border on veshti
    ctx.fillRect(32, 46, 2, 14);

    // Head
    ctx.fillStyle = '#d4a373';
    ctx.beginPath();
    ctx.arc(24, 16, 10, 0, Math.PI * 2);
    ctx.fill();

    // Silver side-swept hair
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(24, 12, 10, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(14, 12, 6, 8);

    // Silver beard & mustache
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.arc(24, 20, 6, 0, Math.PI);
    ctx.fill();

    // Aviator Sunglasses (Dark black with gold rim)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(18, 14, 5, 4);
    ctx.fillRect(25, 14, 5, 4);
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 1;
    ctx.strokeRect(18, 14, 5, 4);
    ctx.strokeRect(25, 14, 5, 4);
    ctx.beginPath();
    ctx.moveTo(23, 16);
    ctx.lineTo(25, 16);
    ctx.stroke();

    this.textures.addCanvas('tiger_player', canvas);
  }

  private createVijiTexture() {
    // Viji: Traditional saree, holding vegetable bag, scanning vision
    const canvas = document.createElement('canvas');
    canvas.width = 44;
    canvas.height = 60;
    const ctx = canvas.getContext('2d')!;

    // Shadow
    ctx.beginPath();
    ctx.ellipse(22, 56, 14, 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fill();

    // Red/Orange Saree
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(22, 22);
    ctx.lineTo(34, 56);
    ctx.lineTo(10, 56);
    ctx.closePath();
    ctx.fill();

    // Golden Saree border
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(10, 53, 24, 3);

    // Head
    ctx.fillStyle = '#d4a373';
    ctx.beginPath();
    ctx.arc(22, 14, 8, 0, Math.PI * 2);
    ctx.fill();

    // Hair bun
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(22, 12, 8, Math.PI * 0.8, Math.PI * 2.2);
    ctx.fill();
    // Jasmine flowers in hair
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(28, 10, 3, 0, Math.PI * 2);
    ctx.fill();

    // Vegetable basket
    ctx.fillStyle = '#78350f';
    ctx.fillRect(6, 32, 8, 8);

    this.textures.addCanvas('viji_npc', canvas);
  }

  private createGoonTexture() {
    // Thugs with sunglasses, red bandana, denim vest
    const canvas = document.createElement('canvas');
    canvas.width = 44;
    canvas.height = 60;
    const ctx = canvas.getContext('2d')!;

    // Shadow
    ctx.beginPath();
    ctx.ellipse(22, 56, 14, 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fill();

    // Denim vest & black shirt
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(14, 22, 16, 22);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(12, 24, 5, 20);
    ctx.fillRect(27, 24, 5, 20);

    // Trousers
    ctx.fillStyle = '#475569';
    ctx.fillRect(14, 44, 7, 12);
    ctx.fillRect(23, 44, 7, 12);

    // Head
    ctx.fillStyle = '#c68b59';
    ctx.beginPath();
    ctx.arc(22, 14, 8, 0, Math.PI * 2);
    ctx.fill();

    // Red bandana
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(14, 8, 16, 4);

    this.textures.addCanvas('thug_enemy', canvas);
  }

  private createRickshawTexture() {
    // Yellow and black auto-rickshaw
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    // Shadow
    ctx.beginPath();
    ctx.ellipse(32, 56, 26, 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fill();

    // Wheels
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(14, 50, 7, 0, Math.PI * 2);
    ctx.arc(50, 50, 7, 0, Math.PI * 2);
    ctx.fill();

    // Yellow Canopy
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.roundRect(10, 16, 44, 20, 6);
    ctx.fill();

    // Green / Black bottom half
    ctx.fillStyle = '#047857';
    ctx.fillRect(10, 36, 44, 14);

    // Windshield
    ctx.fillStyle = '#bae6fd';
    ctx.fillRect(44, 22, 8, 16);

    // Headlight
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(54, 38, 4, 0, Math.PI * 2);
    ctx.fill();

    this.textures.addCanvas('auto_rickshaw', canvas);
  }

  private createCoconutTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 24;
    canvas.height = 24;
    const ctx = canvas.getContext('2d')!;

    // Green fresh coconut
    ctx.beginPath();
    ctx.arc(12, 12, 9, 0, Math.PI * 2);
    ctx.fillStyle = '#65a30d';
    ctx.fill();
    ctx.strokeStyle = '#365314';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Sprout tip
    ctx.fillStyle = '#a3e635';
    ctx.fillRect(11, 2, 2, 4);

    this.textures.addCanvas('coconut_hazard', canvas);
  }

  private createFireworksCartTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    // Wooden cart body
    ctx.fillStyle = '#78350f';
    ctx.fillRect(8, 28, 48, 22);

    // Wheels
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(18, 52, 9, 0, Math.PI * 2);
    ctx.arc(46, 52, 9, 0, Math.PI * 2);
    ctx.stroke();

    // Colorful firework boxes and rockets
    const colors = ['#ef4444', '#3b82f6', '#eab308', '#10b981', '#a855f7'];
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = colors[i];
      ctx.fillRect(12 + i * 8, 12, 7, 16);
      // Rocket cones
      ctx.beginPath();
      ctx.moveTo(12 + i * 8, 12);
      ctx.lineTo(15.5 + i * 8, 4);
      ctx.lineTo(19 + i * 8, 12);
      ctx.fillStyle = '#f97316';
      ctx.fill();
    }

    // Sparkles
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('DIWALI', 14, 42);

    this.textures.addCanvas('fireworks_cart', canvas);
  }

  private createSniperCrosshairTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 48;
    canvas.height = 48;
    const ctx = canvas.getContext('2d')!;

    ctx.strokeStyle = '#ef4444'; // Bright Red Laser
    ctx.lineWidth = 2;

    // Crosshair rings
    ctx.beginPath();
    ctx.arc(24, 24, 18, 0, Math.PI * 2);
    ctx.arc(24, 24, 8, 0, Math.PI * 2);
    ctx.stroke();

    // Crosshair ticks
    ctx.beginPath();
    ctx.moveTo(24, 2);
    ctx.lineTo(24, 12);
    ctx.moveTo(24, 36);
    ctx.lineTo(24, 46);
    ctx.moveTo(2, 24);
    ctx.lineTo(12, 24);
    ctx.moveTo(36, 24);
    ctx.lineTo(46, 24);
    ctx.stroke();

    // Center laser dot
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(24, 24, 3, 0, Math.PI * 2);
    ctx.fill();

    this.textures.addCanvas('sniper_crosshair', canvas);
  }
}
