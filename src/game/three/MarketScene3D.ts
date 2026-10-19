import * as THREE from 'three';
import { soundManager } from '../audio/SoundManager';

export interface Game3DState {
  aura: number;
  multiplier: number;
  composure: number;
  vijiSuspicion: number;
  hukumMode: boolean;
  phase: 'STEALTH' | 'HUKUM' | 'VICTORY' | 'BUSTED';
  coconutKicked: boolean;
  rickshawRolling: boolean;
  fireworksExploded: boolean;
}

export class MarketScene3D {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;

  // Characters & Entities
  public tigerGroup: THREE.Group = new THREE.Group();
  public vijiGroup: THREE.Group = new THREE.Group();
  public rickshawGroup: THREE.Group = new THREE.Group();
  public coconutMesh!: THREE.Mesh;
  public fireworksGroup: THREE.Group = new THREE.Group();
  public cameoVehicleGroup: THREE.Group = new THREE.Group();
  public environmentGroup: THREE.Group = new THREE.Group();

  public thugs: {
    group: THREE.Group;
    alive: boolean;
    vel: THREE.Vector3;
    rotVel: THREE.Vector3;
    initialPos: THREE.Vector3;
  }[] = [];
  public sniperBeams: THREE.Line[] = [];
  public sniperReticles: THREE.Mesh[] = [];
  public fireworkParticles: { mesh: THREE.Mesh; vel: THREE.Vector3; life: number }[] = [];
  public embers: THREE.Points | null = null;

  // Lighting refs for dynamic chapter atmospheres
  private ambientLight!: THREE.HemisphereLight;
  private sunLight!: THREE.DirectionalLight;
  private rimLight!: THREE.DirectionalLight;
  private streetLights: THREE.PointLight[] = [];

  // Vision Cone
  private vijiVisionMesh!: THREE.Mesh;
  private vijiAngle: number = 0;
  private vijiTurnTimer: number = 0;

  // State
  public state: Game3DState = {
    aura: 0,
    multiplier: 1,
    composure: 100,
    vijiSuspicion: 0,
    hukumMode: false,
    phase: 'STEALTH',
    coconutKicked: false,
    rickshawRolling: false,
    fireworksExploded: false
  };

  private currentLevelId: number = 1;
  private startTime: number = 0;
  private walkTime: number = 0;
  private footstepTimer: number = 0;
  private tigerGlassesGroup!: THREE.Group;
  private tigerArmL!: THREE.Group;
  private tigerArmR!: THREE.Group;
  private tigerLegL!: THREE.Group;
  private tigerLegR!: THREE.Group;
  private tigerTorsoMesh!: THREE.Mesh;

  // Texture Loader & Procedural PBR Maps
  private texLoader: THREE.TextureLoader = new THREE.TextureLoader();
  private asphaltTex!: THREE.CanvasTexture;
  private asphaltBumpTex!: THREE.CanvasTexture;
  private cobblestoneTex!: THREE.CanvasTexture;
  private stoneTempleTex!: THREE.CanvasTexture;
  private brickFacadeTex!: THREE.CanvasTexture;
  private woodBarkTex!: THREE.CanvasTexture;
  private fabricSilkTex!: THREE.CanvasTexture;
  private neonSignTex!: THREE.CanvasTexture;
  private skyBackdropTex!: THREE.CanvasTexture;

  // Callbacks
  public onStateUpdate?: (state: Game3DState) => void;
  public onDialogue?: (key: string) => void;
  public onVictory?: (summary: any) => void;

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x160d08);
    this.scene.fog = new THREE.FogExp2(0x1c100b, 0.011);

    // Cinematic 35mm Low-Angle Action Camera (Over-the-shoulder / Street-level drama)
    this.camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(-10.5, 9.2, 16.5);
    this.camera.lookAt(0, 1.8, 2);

    this.generateRealisticTextures();
    this.initLights();
    this.scene.add(this.environmentGroup);
    this.buildRichMarketEnvironment();
    this.buildTigerCharacter();
    this.buildVijiCharacter();
    this.buildAutoRickshaw();
    this.buildCoconutHazard();
    this.buildFireworksCart();
    this.buildThugs();
    this.buildAtmosphericEmbers();

    this.startTime = Date.now();
  }

  private createCharacterPortraitStandee(
    portraitPath: string,
    nameLabel: string,
    roleColorHex: string,
    width: number = 1.65,
    height: number = 2.25
  ): THREE.Group {
    const cardGroup = new THREE.Group();

    const portraitTex = this.texLoader.load(portraitPath);
    portraitTex.colorSpace = THREE.SRGBColorSpace;

    // Metallic Gold/Crimson Outer Frame Backing
    const frameGeo = new THREE.BoxGeometry(width + 0.14, height + 0.14, 0.08);
    const frameMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(roleColorHex),
      metalness: 0.85,
      roughness: 0.2
    });
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    frameMesh.position.y = height / 2 + 0.35;
    frameMesh.castShadow = true;
    cardGroup.add(frameMesh);

    // High-Resolution Photographic Character Plane (Front & Back visible)
    const photoGeo = new THREE.PlaneGeometry(width, height);
    const photoMat = new THREE.MeshBasicMaterial({
      map: portraitTex,
      side: THREE.DoubleSide
    });
    const photoMesh = new THREE.Mesh(photoGeo, photoMat);
    photoMesh.position.set(0, height / 2 + 0.35, 0.05);
    cardGroup.add(photoMesh);

    // Nameplate Banner at Base of Standee
    const plateCanvas = document.createElement('canvas');
    plateCanvas.width = 256;
    plateCanvas.height = 64;
    const pctx = plateCanvas.getContext('2d')!;
    pctx.fillStyle = '#090d16';
    pctx.fillRect(0, 0, 256, 64);
    pctx.strokeStyle = roleColorHex;
    pctx.lineWidth = 4;
    pctx.strokeRect(2, 2, 252, 60);
    pctx.fillStyle = '#f8fafc';
    pctx.font = 'bold 26px sans-serif';
    pctx.textAlign = 'center';
    pctx.fillText(nameLabel, 128, 41);
    const plateTex = new THREE.CanvasTexture(plateCanvas);

    const plateMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(width * 0.92, 0.38),
      new THREE.MeshBasicMaterial({ map: plateTex, side: THREE.DoubleSide })
    );
    plateMesh.position.set(0, 0.32, 0.07);
    cardGroup.add(plateMesh);

    return cardGroup;
  }

  private generateRealisticTextures() {
    // 1. Wet Rain-Slicked Asphalt with Specular Puddles & Weathered Aggregate
    const aspCanvas = document.createElement('canvas');
    aspCanvas.width = 512;
    aspCanvas.height = 512;
    const actx = aspCanvas.getContext('2d')!;
    actx.fillStyle = '#141820';
    actx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 14000; i++) {
      const v = 18 + Math.floor(Math.random() * 34);
      actx.fillStyle = `rgb(${v},${v + 2},${v + 6})`;
      actx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
    }
    // Warm golden reflection streaks on wet road
    const grad = actx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, 'rgba(245, 158, 11, 0.06)');
    grad.addColorStop(0.5, 'rgba(15, 23, 42, 0.25)');
    grad.addColorStop(1, 'rgba(239, 68, 68, 0.05)');
    actx.fillStyle = grad;
    actx.fillRect(0, 0, 512, 512);

    this.asphaltTex = new THREE.CanvasTexture(aspCanvas);
    this.asphaltTex.wrapS = THREE.RepeatWrapping;
    this.asphaltTex.wrapT = THREE.RepeatWrapping;
    this.asphaltTex.repeat.set(6, 6);
    this.asphaltBumpTex = this.asphaltTex;

    // 2. Heritage Stone Sidewalk Flagstones with Moss & Mortar Grout
    const cobCanvas = document.createElement('canvas');
    cobCanvas.width = 256;
    cobCanvas.height = 256;
    const cctx = cobCanvas.getContext('2d')!;
    cctx.fillStyle = '#2b2623';
    cctx.fillRect(0, 0, 256, 256);
    cctx.strokeStyle = '#141210';
    cctx.lineWidth = 3;
    for (let y = 0; y < 256; y += 32) {
      for (let x = 0; x < 256; x += 64) {
        const offset = (y / 32) % 2 === 0 ? 0 : 32;
        cctx.fillStyle = (x + y) % 64 === 0 ? '#3d352e' : '#332c26';
        cctx.fillRect((x + offset) % 256, y, 62, 30);
        cctx.strokeRect((x + offset) % 256, y, 62, 30);
      }
    }
    this.cobblestoneTex = new THREE.CanvasTexture(cobCanvas);
    this.cobblestoneTex.wrapS = THREE.RepeatWrapping;
    this.cobblestoneTex.wrapT = THREE.RepeatWrapping;
    this.cobblestoneTex.repeat.set(3, 12);

    // 3. Carved Dravidian Temple Granite Pillar Texture
    const stCanvas = document.createElement('canvas');
    stCanvas.width = 256;
    stCanvas.height = 256;
    const sctx = stCanvas.getContext('2d')!;
    sctx.fillStyle = '#574c3f';
    sctx.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 256; y += 32) {
      sctx.fillStyle = '#2e2820';
      sctx.fillRect(0, y, 256, 6);
      sctx.fillStyle = '#786856';
      sctx.fillRect(10, y + 8, 236, 16);
      sctx.fillStyle = '#d97706';
      sctx.fillRect(24, y + 13, 208, 4);
    }
    this.stoneTempleTex = new THREE.CanvasTexture(stCanvas);

    // 4. Weathered South Indian Colonial Terracotta & Plaster Facade Texture
    const brCanvas = document.createElement('canvas');
    brCanvas.width = 512;
    brCanvas.height = 512;
    const bctx = brCanvas.getContext('2d')!;
    bctx.fillStyle = '#4a2c1d';
    bctx.fillRect(0, 0, 512, 512);
    // Horizontal architectural molding bands
    for (let y = 0; y < 512; y += 64) {
      bctx.fillStyle = '#361f14';
      bctx.fillRect(0, y, 512, 8);
      bctx.fillStyle = '#6b3e26';
      bctx.fillRect(0, y + 8, 512, 6);
    }
    // Warm recessed arched windows with wooden louvers
    for (let wy = 80; wy < 420; wy += 150) {
      for (let wx = 48; wx < 460; wx += 140) {
        bctx.fillStyle = '#1c120c';
        bctx.fillRect(wx - 6, wy - 6, 84, 112);
        const wGrad = bctx.createLinearGradient(wx, wy, wx, wy + 100);
        wGrad.addColorStop(0, '#f59e0b');
        wGrad.addColorStop(1, '#7c2d12');
        bctx.fillStyle = wGrad;
        bctx.fillRect(wx, wy, 72, 100);
        // Window mullions
        bctx.strokeStyle = '#29170e';
        bctx.lineWidth = 4;
        bctx.strokeRect(wx, wy, 72, 100);
        bctx.beginPath();
        bctx.moveTo(wx + 36, wy);
        bctx.lineTo(wx + 36, wy + 100);
        bctx.moveTo(wx, wy + 50);
        bctx.lineTo(wx + 72, wy + 50);
        bctx.stroke();
      }
    }
    this.brickFacadeTex = new THREE.CanvasTexture(brCanvas);

    // 5. Aged Teak Wood & Crate Texture
    const wdCanvas = document.createElement('canvas');
    wdCanvas.width = 256;
    wdCanvas.height = 256;
    const wctx = wdCanvas.getContext('2d')!;
    wctx.fillStyle = '#5c3419';
    wctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 64; i++) {
      wctx.fillStyle = i % 2 === 0 ? 'rgba(40,20,5,0.32)' : 'rgba(140,85,40,0.22)';
      wctx.fillRect(0, i * 4, 256, 2);
    }
    this.woodBarkTex = new THREE.CanvasTexture(wdCanvas);

    // 6. Kanchipuram Maroon & Gold Zari Silk Texture
    const silkCanvas = document.createElement('canvas');
    silkCanvas.width = 128;
    silkCanvas.height = 128;
    const kctx = silkCanvas.getContext('2d')!;
    kctx.fillStyle = '#7f1d1d';
    kctx.fillRect(0, 0, 128, 128);
    kctx.fillStyle = '#f59e0b';
    kctx.fillRect(0, 96, 128, 24);
    this.fabricSilkTex = new THREE.CanvasTexture(silkCanvas);

    // 7. Authentic Bazaar Illuminated Signboard Texture
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 128;
    const nctx = signCanvas.getContext('2d')!;
    nctx.fillStyle = '#140c08';
    nctx.fillRect(0, 0, 512, 128);
    nctx.strokeStyle = '#f59e0b';
    nctx.lineWidth = 6;
    nctx.strokeRect(6, 6, 500, 116);
    nctx.fillStyle = '#fbbf24';
    nctx.font = 'bold 34px sans-serif';
    nctx.fillText('SRI MUTHUVEL BAZAAR & TEA', 22, 56);
    nctx.fillStyle = '#fde68a';
    nctx.font = 'bold 20px monospace';
    nctx.fillText('MYLAPORE HERITAGE MARKET • CHENNAI', 26, 96);
    this.neonSignTex = new THREE.CanvasTexture(signCanvas);

    // 8. Sunset Golden-Hour Sky & City Skyline Backdrop CanvasTexture
    const skyCanvas = document.createElement('canvas');
    skyCanvas.width = 1024;
    skyCanvas.height = 512;
    const skctx = skyCanvas.getContext('2d')!;
    const skyGrad = skctx.createLinearGradient(0, 0, 0, 512);
    skyGrad.addColorStop(0, '#090d16');
    skyGrad.addColorStop(0.45, '#3b1510');
    skyGrad.addColorStop(0.78, '#9a3412');
    skyGrad.addColorStop(1, '#f59e0b');
    skctx.fillStyle = skyGrad;
    skctx.fillRect(0, 0, 1024, 512);

    // Distant Gopuram & Suspension Bridge Silhouette on Horizon
    skctx.fillStyle = '#120907';
    for (let x = 0; x < 1024; x += 55) {
      const h = 60 + ((x * 37) % 130);
      skctx.fillRect(x, 512 - h, 48, h);
    }
    this.skyBackdropTex = new THREE.CanvasTexture(skyCanvas);
  }

  private initLights() {
    this.ambientLight = new THREE.HemisphereLight(0xffd8a8, 0x1e1b18, 1.05);
    this.scene.add(this.ambientLight);

    // Warm Golden-Hour Cinema Sun Light
    this.sunLight = new THREE.DirectionalLight(0xffa94d, 2.2);
    this.sunLight.position.set(-16, 24, 16);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 75;
    this.sunLight.shadow.camera.left = -28;
    this.sunLight.shadow.camera.right = 28;
    this.sunLight.shadow.camera.top = 28;
    this.sunLight.shadow.camera.bottom = -28;
    this.sunLight.shadow.bias = -0.0004;
    this.scene.add(this.sunLight);

    // Cool Teal Cinema Rim Backlight
    this.rimLight = new THREE.DirectionalLight(0x38bdf8, 0.85);
    this.rimLight.position.set(16, 14, -18);
    this.scene.add(this.rimLight);

    const lampCoords = [
      new THREE.Vector3(2.5, 6.2, 4),
      new THREE.Vector3(-4.5, 6.2, -7),
      new THREE.Vector3(8.5, 6.2, 9)
    ];
    lampCoords.forEach((pos) => {
      const pLight = new THREE.PointLight(0xffb703, 2.6, 24);
      pLight.position.copy(pos);
      pLight.castShadow = true;
      this.scene.add(pLight);
      this.streetLights.push(pLight);
    });
  }

  private buildRichMarketEnvironment() {
    while (this.environmentGroup.children.length > 0) {
      this.environmentGroup.remove(this.environmentGroup.children[0]);
    }

    // 0. Panoramic Golden-Hour Horizon Sky Dome Backdrop + Movie Poster Billboard
    const skyDome = new THREE.Mesh(
      new THREE.CylinderGeometry(48, 48, 36, 32, 1, true, Math.PI * 0.55, Math.PI * 1.1),
      new THREE.MeshBasicMaterial({ map: this.skyBackdropTex, side: THREE.BackSide })
    );
    skyDome.position.set(0, 14, -10);
    this.environmentGroup.add(skyDome);

    // Giant Cinema Hoarding Billboard overlooking the Bazaar (Authentic South Indian Cutout Hoarding Culture)
    const posterTex = this.texLoader.load('/assets/portraits/poster.jpg');
    posterTex.colorSpace = THREE.SRGBColorSpace;
    const billboardGroup = new THREE.Group();
    const boardFrame = new THREE.Mesh(
      new THREE.BoxGeometry(11.5, 6.8, 0.35),
      new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.8, roughness: 0.3 })
    );
    boardFrame.position.y = 8.8;
    billboardGroup.add(boardFrame);

    const boardPoster = new THREE.Mesh(
      new THREE.PlaneGeometry(11.0, 6.3),
      new THREE.MeshBasicMaterial({ map: posterTex })
    );
    boardPoster.position.set(0, 8.8, 0.2);
    billboardGroup.add(boardPoster);

    // Steel truss legs for hoarding
    for (const lx of [-4.2, 4.2]) {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.22, 6.5, 10),
        new THREE.MeshStandardMaterial({ color: 0x27272a, metalness: 0.8 })
      );
      leg.position.set(lx, 3.25, 0);
      billboardGroup.add(leg);
    }
    billboardGroup.position.set(3.5, 0, -14.5);
    billboardGroup.rotation.y = -0.18;
    this.environmentGroup.add(billboardGroup);

    // 1. Textured Wet Asphalt Street Surface with Specular Sheen
    const groundGeo = new THREE.PlaneGeometry(80, 80);
    const groundMat = new THREE.MeshStandardMaterial({
      map: this.asphaltTex,
      bumpMap: this.asphaltBumpTex,
      bumpScale: 0.04,
      roughness: 0.38,
      metalness: 0.35
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.environmentGroup.add(ground);

    // Reflective Wet Puddle Patches on Asphalt
    const puddleMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.05,
      metalness: 0.9,
      transparent: true,
      opacity: 0.55
    });
    for (const [px, pz, pr] of [
      [-1.5, 2.5, 2.2],
      [4.2, 8.0, 2.6],
      [1.0, -5.5, 1.9]
    ]) {
      const puddle = new THREE.Mesh(new THREE.CircleGeometry(pr, 24), puddleMat);
      puddle.rotation.x = -Math.PI / 2;
      puddle.position.set(px, 0.015, pz);
      this.environmentGroup.add(puddle);
    }

    // Road Divider & School Crossing Stripes
    const lineMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 });
    for (const offset of [-0.2, 0.2]) {
      const roadLine = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 48), lineMat);
      roadLine.rotation.x = -Math.PI / 2;
      roadLine.position.set(offset, 0.02, 0);
      this.environmentGroup.add(roadLine);
    }

    const whiteStripeMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.65 });
    for (let i = -4; i <= 4; i++) {
      const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 2.2), whiteStripeMat);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(i * 1.1 + 3.5, 0.025, 5.5);
      this.environmentGroup.add(stripe);
    }

    // 2. Heritage Stone Sidewalks & Curbs
    const sidewalkMat = new THREE.MeshStandardMaterial({
      map: this.cobblestoneTex,
      roughness: 0.72
    });
    const leftSidewalk = new THREE.Mesh(new THREE.BoxGeometry(11, 0.35, 52), sidewalkMat);
    leftSidewalk.position.set(-9.5, 0.175, 0);
    leftSidewalk.receiveShadow = true;
    this.environmentGroup.add(leftSidewalk);

    const rightSidewalk = new THREE.Mesh(new THREE.BoxGeometry(11, 0.35, 52), sidewalkMat);
    rightSidewalk.position.set(13.5, 0.175, 0);
    rightSidewalk.receiveShadow = true;
    this.environmentGroup.add(rightSidewalk);

    for (let z = -20; z <= 20; z += 2) {
      const isYellow = Math.abs(z / 2) % 2 === 0;
      const curbMat = new THREE.MeshStandardMaterial({
        color: isYellow ? 0xd97706 : 0x18181b,
        roughness: 0.55
      });
      const curbBlock = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.38, 1.95), curbMat);
      curbBlock.position.set(-4.0, 0.19, z);
      curbBlock.castShadow = true;
      this.environmentGroup.add(curbBlock);
    }

    // 3. Dravidian Stone Temple Mandapam & Brass Deepam Pillar
    this.buildTempleMandapam(-11.5, 0.35, 6.5);

    // 4. Textured Colonial & Bazaar Shopfront Buildings
    this.buildColonialShopfront(-13.2, 0.35, -5.5, true);
    this.buildColonialShopfront(15.5, 0.35, -3.0, false);
    this.buildColonialShopfront(15.5, 0.35, 9.0, false);

    // 5. Authentic Indian Market Stalls with Produce, Spice Sacks & Brass Tea Samovar
    this.createDetailedMarketStall(-7.8, 0.35, -6.5, 0x991b1b, 'coconut_bazaar');
    this.createDetailedMarketStall(-7.8, 0.35, 1.5, 0x92400e, 'spice_silk');
    this.createDetailedMarketStall(-7.8, 0.35, 10.5, 0x065f46, 'tea_stall');

    // 6. Lush Tropical Coconut Palms
    this.createCoconutPalm(-11.0, 0.35, -12.0, 1.15);
    this.createCoconutPalm(11.5, 0.35, -10.5, 1.0);
    this.createCoconutPalm(12.0, 0.35, 14.5, 1.2);

    // 7. Street Lamps & Overhead Lights
    this.createStreetLamp(2.5, 0, 4);
    this.createStreetLamp(-4.2, 0, -7);
    this.createStreetLamp(8.2, 0, 9);
    this.createOverheadCablesAndBunting();

    // 8. Vimal's Premier Padmini Tourist Taxi with Vimal Photographic Portrait Badge
    this.buildVimalPremierTaxi(-1.5, 0, -10.5);
  }

  private buildTempleMandapam(x: number, y: number, z: number) {
    const temple = new THREE.Group();
    const stoneMat = new THREE.MeshStandardMaterial({
      map: this.stoneTempleTex,
      bumpMap: this.stoneTempleTex,
      bumpScale: 0.05,
      roughness: 0.8,
      metalness: 0.12
    });

    const plinth = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.6, 6.2), stoneMat);
    plinth.position.y = 0.3;
    plinth.castShadow = true;
    plinth.receiveShadow = true;
    temple.add(plinth);

    const pillarCoords = [
      [-1.9, 2.4, -2.2],
      [1.9, 2.4, -2.2],
      [-1.9, 2.4, 2.2],
      [1.9, 2.4, 2.2]
    ];
    pillarCoords.forEach(([px, py, pz]) => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.38, 3.8, 16), stoneMat);
      col.position.set(px, py, pz);
      col.castShadow = true;
      temple.add(col);

      const cap = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.35, 1.05), stoneMat);
      cap.position.set(px, py + 1.95, pz);
      temple.add(cap);
    });

    const roofBase = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.6, 6.6), stoneMat);
    roofBase.position.y = 4.6;
    temple.add(roofBase);

    const gopuramTier1 = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.2, 4.8), stoneMat);
    gopuramTier1.position.y = 5.5;
    temple.add(gopuramTier1);

    const kalasamMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.15 });
    for (const kz of [-1.2, 0, 1.2]) {
      const kalasam = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.7, 14), kalasamMat);
      kalasam.position.set(0, 6.45, kz);
      temple.add(kalasam);
    }

    // Brass Kuthuvilakku Oil Lamp
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 });
    const lampStand = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.32, 1.5, 14), brassMat);
    lampStand.position.set(2.2, 1.35, 0);
    temple.add(lampStand);

    const flame = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xfef08a })
    );
    flame.position.set(2.2, 2.15, 0);
    temple.add(flame);

    temple.position.set(x, y, z);
    this.environmentGroup.add(temple);
  }

  private buildColonialShopfront(x: number, y: number, z: number, hasSignboard: boolean) {
    const bldg = new THREE.Group();
    const wallMat = new THREE.MeshStandardMaterial({
      map: this.brickFacadeTex,
      bumpMap: this.brickFacadeTex,
      bumpScale: 0.04,
      roughness: 0.78
    });
    const trimMat = new THREE.MeshStandardMaterial({
      map: this.stoneTempleTex,
      roughness: 0.7
    });

    const mainBlock = new THREE.Mesh(new THREE.BoxGeometry(5.6, 8.8, 9.6), wallMat);
    mainBlock.position.y = 4.4;
    mainBlock.castShadow = true;
    mainBlock.receiveShadow = true;
    bldg.add(mainBlock);

    const cornice = new THREE.Mesh(new THREE.BoxGeometry(6.1, 0.55, 10.1), trimMat);
    cornice.position.y = 8.85;
    bldg.add(cornice);

    if (hasSignboard) {
      const faceX = x < 0 ? 2.85 : -2.85;
      const sign = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 1.45, 7.2),
        new THREE.MeshBasicMaterial({ map: this.neonSignTex })
      );
      sign.position.set(faceX, 3.8, 0);
      bldg.add(sign);
    }

    bldg.position.set(x, y, z);
    this.environmentGroup.add(bldg);
  }

  private createDetailedMarketStall(x: number, y: number, z: number, canopyColor: number, type: string) {
    const stall = new THREE.Group();

    const tableMat = new THREE.MeshStandardMaterial({
      map: this.woodBarkTex,
      roughness: 0.75
    });
    const table = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.15, 4.2), tableMat);
    table.position.y = 0.58;
    table.castShadow = true;
    table.receiveShadow = true;
    stall.add(table);

    const poleMat = new THREE.MeshStandardMaterial({ color: 0x27272a, metalness: 0.7, roughness: 0.35 });
    for (const [px, py, pz] of [
      [-1.4, 1.5, -1.9],
      [1.4, 1.5, -1.9],
      [-1.4, 1.5, 1.9],
      [1.4, 1.5, 1.9]
    ]) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3.1, 10), poleMat);
      p.position.set(px, py + 0.55, pz);
      stall.add(p);
    }

    const awning = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 0.18, 4.6),
      new THREE.MeshStandardMaterial({ color: canopyColor, roughness: 0.6 })
    );
    awning.position.y = 3.15;
    awning.rotation.z = -0.12;
    awning.castShadow = true;
    stall.add(awning);

    if (type === 'coconut_bazaar') {
      const cocoMat = new THREE.MeshStandardMaterial({ color: 0x4d7c0f, roughness: 0.7 });
      for (let i = 0; i < 9; i++) {
        const c = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), cocoMat);
        c.position.set(-0.6 + (i % 3) * 0.52, 1.32 + Math.floor(i / 6) * 0.35, -0.8 + Math.floor(i / 3) * 0.55);
        stall.add(c);
      }
    } else if (type === 'tea_stall') {
      const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.88, roughness: 0.2 });
      const boiler = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 0.95, 16), brassMat);
      boiler.position.set(0.4, 1.62, -0.5);
      stall.add(boiler);
    } else {
      const silkStack = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.45, 1.6),
        new THREE.MeshStandardMaterial({ map: this.fabricSilkTex, roughness: 0.5 })
      );
      silkStack.position.set(0, 1.38, 0);
      stall.add(silkStack);
    }

    stall.position.set(x, y, z);
    this.environmentGroup.add(stall);
  }

  private createCoconutPalm(x: number, y: number, z: number, scale: number) {
    const palm = new THREE.Group();
    const trunkMat = new THREE.MeshStandardMaterial({ map: this.woodBarkTex, roughness: 0.88 });

    for (let i = 0; i < 7; i++) {
      const seg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28 - i * 0.02, 0.32 - i * 0.02, 1.25, 10),
        trunkMat
      );
      seg.position.set(Math.sin(i * 0.18) * 0.35, 0.6 + i * 1.15, 0);
      seg.rotation.z = -i * 0.04;
      seg.castShadow = true;
      palm.add(seg);
    }

    const frondMat = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.6,
      side: THREE.DoubleSide
    });
    for (let f = 0; f < 8; f++) {
      const angle = (f / 8) * Math.PI * 2;
      const frond = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.06, 2.8), frondMat);
      frond.position.set(0.35 + Math.cos(angle) * 1.2, 8.2, Math.sin(angle) * 1.2);
      frond.rotation.y = -angle + Math.PI / 2;
      frond.rotation.x = 0.35;
      palm.add(frond);
    }

    palm.position.set(x, y, z);
    palm.scale.setScalar(scale);
    this.environmentGroup.add(palm);
  }

  private createStreetLamp(x: number, y: number, z: number) {
    const lampGroup = new THREE.Group();
    const ironMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.88, roughness: 0.25 });

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.32, 0.8, 12), ironMat);
    base.position.y = 0.4;
    lampGroup.add(base);

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.13, 5.8, 12), ironMat);
    pole.position.y = 3.1;
    pole.castShadow = true;
    lampGroup.add(pole);

    const arm = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.1, 0.1), ironMat);
    arm.position.set(0.45, 5.95, 0);
    lampGroup.add(arm);

    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.26, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xfef08a })
    );
    bulb.position.set(0.9, 5.8, 0);
    lampGroup.add(bulb);

    lampGroup.position.set(x, y, z);
    this.environmentGroup.add(lampGroup);
  }

  private createOverheadCablesAndBunting() {
    for (const zPos of [-4, 4, 11]) {
      const cablePts = [
        new THREE.Vector3(-10, 6.8, zPos),
        new THREE.Vector3(0, 6.2, zPos),
        new THREE.Vector3(12, 6.8, zPos)
      ];
      const curve = new THREE.QuadraticBezierCurve3(cablePts[0], cablePts[1], cablePts[2]);
      const pts = curve.getPoints(20);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.Line(
        lineGeo,
        new THREE.LineBasicMaterial({ color: 0x27272a })
      );
      this.environmentGroup.add(line);

      // Warm Glowing Festival String Bulbs along Overhead Wires
      for (let i = 2; i < 18; i += 3) {
        const pt = pts[i];
        const bulb = new THREE.Mesh(
          new THREE.SphereGeometry(0.11, 8, 8),
          new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0xfbbf24 : 0xf97316 })
        );
        bulb.position.copy(pt).add(new THREE.Vector3(0, -0.12, 0));
        this.environmentGroup.add(bulb);
      }
    }
  }

  private buildVimalPremierTaxi(x: number, y: number, z: number) {
    const taxi = new THREE.Group();
    const blackBodyMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      metalness: 0.75,
      roughness: 0.25
    });
    const yellowRoofMat = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      metalness: 0.45,
      roughness: 0.3
    });
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.1
    });

    const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.85, 4.4), blackBodyMat);
    lowerBody.position.y = 0.75;
    lowerBody.castShadow = true;
    taxi.add(lowerBody);

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.78, 2.3), yellowRoofMat);
    cabin.position.set(0, 1.52, -0.15);
    cabin.castShadow = true;
    taxi.add(cabin);

    const grille = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.35, 0.12), chromeMat);
    grille.position.set(0, 0.75, 2.22);
    taxi.add(grille);

    for (const hx of [-0.75, 0.75]) {
      const hLight = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xfef08a })
      );
      hLight.position.set(hx, 0.85, 2.22);
      taxi.add(hLight);
    }

    // Vimal Photographic Standee Card above Taxi
    const vimalStandee = this.createCharacterPortraitStandee(
      '/assets/portraits/vimal.jpg',
      'VIMAL // GETAWAY TAXI',
      '#eab308',
      1.35,
      1.75
    );
    vimalStandee.position.set(0, 1.9, 0);
    taxi.add(vimalStandee);

    taxi.position.set(x, y, z);
    taxi.rotation.y = 0.35;
    this.environmentGroup.add(taxi);
  }

  private buildAtmosphericEmbers() {
    const count = 110;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 36;
      positions[i * 3 + 1] = 0.5 + Math.random() * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 36;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xf59e0b,
      size: 0.15,
      transparent: true,
      opacity: 0.7
    });
    this.embers = new THREE.Points(geo, mat);
    this.scene.add(this.embers);
  }

  // Photographic + Sculpted 3D Portrayal: "Tiger" Muthuvel Pandian
  private buildTigerCharacter() {
    this.tigerGroup = new THREE.Group();

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.18
    });
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.55 });

    // Golden Aura Pedestal Base under Tiger
    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 0.95, 0.14, 28),
      new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.8, roughness: 0.25 })
    );
    pedestal.position.y = 0.07;
    this.tigerGroup.add(pedestal);

    const auraRing = new THREE.Mesh(
      new THREE.RingGeometry(0.88, 1.05, 32),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide })
    );
    auraRing.rotation.x = -Math.PI / 2;
    auraRing.position.y = 0.08;
    this.tigerGroup.add(auraRing);

    // High-Resolution Photographic Character Standee of Tiger Muthuvel Pandian
    const tigerStandee = this.createCharacterPortraitStandee(
      '/assets/portraits/tiger.jpg',
      'TIGER PANDIAN',
      '#f59e0b',
      1.75,
      2.45
    );
    tigerStandee.position.y = 0.1;
    this.tigerGroup.add(tigerStandee);

    // Keep articulated 3D glasses & torso references for Spectacle Flip & Attire animations
    this.tigerTorsoMesh = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), shirtMat);
    this.tigerTorsoMesh.visible = false;
    this.tigerGroup.add(this.tigerTorsoMesh);

    this.tigerGlassesGroup = new THREE.Group();
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.03, 8, 20), goldMat);
    this.tigerGlassesGroup.add(rim);
    this.tigerGlassesGroup.position.set(0, 2.2, 0.15);
    this.tigerGroup.add(this.tigerGlassesGroup);

    this.tigerArmL = new THREE.Group();
    this.tigerArmR = new THREE.Group();
    this.tigerLegL = new THREE.Group();
    this.tigerLegR = new THREE.Group();
    this.tigerGroup.add(this.tigerArmL, this.tigerArmR, this.tigerLegL, this.tigerLegR);

    this.tigerGroup.position.set(-5.2, 0, 0.5);
    this.scene.add(this.tigerGroup);
  }

  public setTigerAttire(attireId: string) {
    if (!this.tigerTorsoMesh) return;
    const mat = this.tigerTorsoMesh.material as THREE.MeshStandardMaterial;
    if (attireId === 'jailer_overcoat') {
      mat.color.setHex(0x3f4f3a);
    } else {
      mat.color.setHex(0xf8fafc);
    }
  }

  // Photographic + Volumetric Vision Cone Portrayal: Viji
  private buildVijiCharacter() {
    this.vijiGroup = new THREE.Group();

    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.75, 0.85, 0.14, 24),
      new THREE.MeshStandardMaterial({ color: 0x450a0a, metalness: 0.7, roughness: 0.3 })
    );
    pedestal.position.y = 0.07;
    this.vijiGroup.add(pedestal);

    const vijiStandee = this.createCharacterPortraitStandee(
      '/assets/portraits/viji.jpg',
      'VIJI // PATROL',
      '#e11d48',
      1.55,
      2.2
    );
    vijiStandee.position.y = 0.1;
    this.vijiGroup.add(vijiStandee);

    // Volumetric Vision Cone on the Street
    const coneGeo = new THREE.ConeGeometry(4.8, 9.5, 24, 1, true);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide
    });
    this.vijiVisionMesh = new THREE.Mesh(coneGeo, coneMat);
    this.vijiVisionMesh.rotation.x = -Math.PI / 2;
    this.vijiVisionMesh.position.set(0, 0.12, 4.8);
    this.vijiGroup.add(this.vijiVisionMesh);

    this.vijiGroup.position.set(-5.5, 0, 6.2);
    this.scene.add(this.vijiGroup);
  }

  // Detailed 3D Model: Chennai/Goa Green-and-Yellow Auto-Rickshaw
  private buildAutoRickshaw() {
    this.rickshawGroup = new THREE.Group();

    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x065f46,
      metalness: 0.55,
      roughness: 0.3
    });
    const hoodMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.4
    });
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.9,
      roughness: 0.15
    });

    const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.15, 3.4), chassisMat);
    chassis.position.y = 0.95;
    chassis.castShadow = true;
    this.rickshawGroup.add(chassis);

    const hood = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.92, 2.65), hoodMat);
    hood.position.set(0, 1.98, -0.2);
    hood.castShadow = true;
    this.rickshawGroup.add(hood);

    const glass = new THREE.Mesh(
      new THREE.PlaneGeometry(1.9, 0.82),
      new THREE.MeshStandardMaterial({
        color: 0xbae6fd,
        roughness: 0.1,
        metalness: 0.85,
        transparent: true,
        opacity: 0.72
      })
    );
    glass.position.set(0, 1.96, 1.15);
    this.rickshawGroup.add(glass);

    const fender = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.22, 0.25), chromeMat);
    fender.position.set(0, 0.65, 1.78);
    this.rickshawGroup.add(fender);

    const light = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 14, 14),
      new THREE.MeshBasicMaterial({ color: 0xfef08a })
    );
    light.position.set(0, 1.05, 1.75);
    this.rickshawGroup.add(light);

    const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.3, 18);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.85 });

    for (const [wx, wy, wz] of [
      [0, 0.42, 1.25],
      [-1.12, 0.42, -0.85],
      [1.12, 0.42, -0.85]
    ]) {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(wx, wy, wz);
      w.castShadow = true;
      this.rickshawGroup.add(w);
    }

    this.rickshawGroup.position.set(-1.0, 0, -2.2);
    this.rickshawGroup.rotation.y = 0.4;
    this.scene.add(this.rickshawGroup);
  }

  private buildCoconutHazard() {
    const coconutGeo = new THREE.SphereGeometry(0.4, 20, 20);
    const coconutMat = new THREE.MeshStandardMaterial({
      color: 0x4d7c0f,
      roughness: 0.65,
      metalness: 0.1
    });
    this.coconutMesh = new THREE.Mesh(coconutGeo, coconutMat);
    this.coconutMesh.scale.set(1.0, 1.18, 1.0);
    this.coconutMesh.position.set(-3.2, 0.42, -1.2);
    this.coconutMesh.castShadow = true;

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.5, 0.66, 24),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -0.34;
    this.coconutMesh.add(ring);

    this.scene.add(this.coconutMesh);
  }

  private buildFireworksCart() {
    this.fireworksGroup = new THREE.Group();

    const cartMat = new THREE.MeshStandardMaterial({ map: this.woodBarkTex, roughness: 0.8 });
    const cart = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.85, 4.1), cartMat);
    cart.position.y = 0.85;
    cart.castShadow = true;
    this.fireworksGroup.add(cart);

    const colors = [0xdc2626, 0xd97706, 0xfacc15, 0x059669, 0x7c3aed];
    for (let i = 0; i < 10; i++) {
      const cHex = colors[i % colors.length];
      const tubeGroup = new THREE.Group();
      const tube = new THREE.Mesh(
        new THREE.CylinderGeometry(0.13, 0.13, 1.25, 12),
        new THREE.MeshStandardMaterial({ color: cHex, roughness: 0.4 })
      );
      const nose = new THREE.Mesh(
        new THREE.ConeGeometry(0.16, 0.35, 12),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b })
      );
      nose.position.y = 0.78;
      tubeGroup.add(tube, nose);
      tubeGroup.position.set(-0.85 + (i % 5) * 0.42, 1.68, -1.1 + Math.floor(i / 5) * 1.6);
      this.fireworksGroup.add(tubeGroup);
    }

    this.fireworksGroup.position.set(6.8, 0, 9.5);
    this.scene.add(this.fireworksGroup);
  }

  // Photographic + 3D Enforcer Portrayals for the 4 Syndicate Bike Thugs
  private buildThugs() {
    const thugConfigs = [
      { pos: new THREE.Vector3(3.2, 0, 3.8), portrait: '/assets/portraits/narasimha.jpg', label: 'ENFORCER #1' },
      { pos: new THREE.Vector3(5.2, 0, 4.8), portrait: '/assets/portraits/mathew.jpg', label: 'ENFORCER #2' },
      { pos: new THREE.Vector3(2.8, 0, 6.4), portrait: '/assets/portraits/narasimha.jpg', label: 'ENFORCER #3' },
      { pos: new THREE.Vector3(5.8, 0, 7.2), portrait: '/assets/portraits/mathew.jpg', label: 'SYNDICATE BOSS' }
    ];

    thugConfigs.forEach((cfg) => {
      const group = new THREE.Group();

      // Crimson Hostile Base Ring
      const baseRing = new THREE.Mesh(
        new THREE.RingGeometry(0.7, 0.86, 24),
        new THREE.MeshBasicMaterial({ color: 0xdc2626, side: THREE.DoubleSide })
      );
      baseRing.rotation.x = -Math.PI / 2;
      baseRing.position.y = 0.05;
      group.add(baseRing);

      // Photographic Enforcer Standee
      const standee = this.createCharacterPortraitStandee(
        cfg.portrait,
        cfg.label,
        '#dc2626',
        1.45,
        2.05
      );
      standee.position.y = 0.08;
      group.add(standee);

      // Detailed Street Motorcycle beside each Enforcer
      const bikeFrame = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 0.72, 1.65),
        new THREE.MeshStandardMaterial({ color: 0x450a0a, metalness: 0.8, roughness: 0.25 })
      );
      bikeFrame.position.set(-0.9, 0.55, 0);
      bikeFrame.castShadow = true;
      group.add(bikeFrame);

      group.position.copy(cfg.pos);
      this.scene.add(group);

      this.thugs.push({
        group,
        alive: true,
        vel: new THREE.Vector3(),
        rotVel: new THREE.Vector3(),
        initialPos: cfg.pos.clone()
      });
    });
  }

  public setChapterAtmosphere(levelId: number) {
    this.currentLevelId = levelId;
    if (!this.sunLight || !this.ambientLight) return;

    switch (levelId) {
      case 1:
      case 3:
        this.scene.background = new THREE.Color(0x160d08);
        this.scene.fog = new THREE.FogExp2(0x1c100b, 0.011);
        this.sunLight.color.setHex(0xffa94d);
        this.sunLight.intensity = 2.2;
        soundManager.setTheme('stealth');
        break;
      case 4:
      case 7:
        this.scene.background = new THREE.Color(0x050b16);
        this.scene.fog = new THREE.FogExp2(0x050b16, 0.016);
        this.sunLight.color.setHex(0x38bdf8);
        this.sunLight.intensity = 1.5;
        soundManager.setTheme('port_rain');
        break;
      case 6:
      case 8:
        this.scene.background = new THREE.Color(0x160724);
        this.scene.fog = new THREE.FogExp2(0x160724, 0.014);
        this.sunLight.color.setHex(0xe879f9);
        this.sunLight.intensity = 1.75;
        soundManager.setTheme('carnival');
        break;
      case 9:
      case 10:
        this.scene.background = new THREE.Color(0x1c0a08);
        this.scene.fog = new THREE.FogExp2(0x1c0a08, 0.012);
        this.sunLight.color.setHex(0xf97316);
        this.sunLight.intensity = 2.3;
        soundManager.setTheme('hukum');
        break;
      default:
        this.scene.background = new THREE.Color(0x140d09);
        this.scene.fog = new THREE.FogExp2(0x140d09, 0.012);
        this.sunLight.color.setHex(0xfbbf24);
        this.sunLight.intensity = 2.0;
        soundManager.setTheme('stealth');
        break;
    }
  }

  public pingSniperTargets() {
    soundManager.playSniperPing();

    this.sniperBeams.forEach((b) => this.scene.remove(b));
    this.sniperBeams = [];
    this.sniperReticles.forEach((r) => this.scene.remove(r));
    this.sniperReticles = [];

    this.thugs.forEach((thug) => {
      if (!thug.alive) return;
      const beamMat = new THREE.LineBasicMaterial({ color: 0xff1e1e, linewidth: 2 });
      const pts = [
        new THREE.Vector3(thug.group.position.x - 11, 20, thug.group.position.z - 14),
        thug.group.position.clone().add(new THREE.Vector3(0, 1.85, 0))
      ];
      const beamGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const beam = new THREE.Line(beamGeo, beamMat);
      this.scene.add(beam);
      this.sniperBeams.push(beam);

      const ret = new THREE.Mesh(
        new THREE.RingGeometry(0.65, 0.85, 24),
        new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide })
      );
      ret.rotation.x = -Math.PI / 2;
      ret.position.copy(thug.group.position).add(new THREE.Vector3(0, 0.09, 0));
      this.scene.add(ret);
      this.sniperReticles.push(ret);
    });
  }

  public summonCameo(cameoId: string = 'mathew_mercedes') {
    soundManager.playCameoSummon();
    this.state.aura += 2500 * this.state.multiplier;

    if (this.onDialogue) {
      if (cameoId === 'narasimha_melee') {
        this.onDialogue('lvl7_cameo_narasimha');
      } else {
        this.onDialogue('lvl7_cameo_mathew');
      }
    }

    if (!this.state.coconutKicked) {
      this.kickCoconut();
    } else if (!this.state.hukumMode) {
      this.triggerSpectacleFlip();
    }
    this.notifyState();
  }

  public kickCoconut() {
    if (this.state.coconutKicked) return;
    this.state.coconutKicked = true;

    soundManager.playCoconutKick();

    const target = this.rickshawGroup.position.clone().add(new THREE.Vector3(0, 0.35, 0));
    const start = this.coconutMesh.position.clone();
    let progress = 0;

    const interval = setInterval(() => {
      progress += 0.08;
      this.coconutMesh.position.lerpVectors(start, target, progress);
      this.coconutMesh.rotation.x += 0.45;

      if (progress >= 1) {
        clearInterval(interval);
        this.releaseRickshawHandbrake();
      }
    }, 16);

    if (this.onDialogue) this.onDialogue('lvl1_rickshaw_ready');
  }

  private releaseRickshawHandbrake() {
    if (this.state.rickshawRolling) return;
    this.state.rickshawRolling = true;

    if (!this.state.hukumMode) {
      this.triggerSpectacleFlip();
    }

    soundManager.playRickshawRoll();
  }

  public triggerSpectacleFlip() {
    if (this.state.hukumMode) return;
    this.state.hukumMode = true;
    this.state.phase = 'HUKUM';
    this.state.multiplier = 10;

    soundManager.playSpectacleFlipBassDrop();

    let flipAngle = 0;
    const flipInterval = setInterval(() => {
      flipAngle += 0.6;
      if (this.tigerGlassesGroup) {
        this.tigerGlassesGroup.rotation.x = flipAngle;
      }
      if (flipAngle >= Math.PI * 4) {
        clearInterval(flipInterval);
        if (this.tigerGlassesGroup) this.tigerGlassesGroup.rotation.x = 0;
      }
    }, 16);

    this.pingSniperTargets();

    if (this.onDialogue) this.onDialogue('lvl1_spec_flip');
    this.notifyState();
  }

  public update(delta: number, keys: { left: boolean; right: boolean; up: boolean; down: boolean }) {
    if (this.state.phase === 'VICTORY' || this.state.phase === 'BUSTED') return;

    this.handleMovement(delta, keys);
    this.updateVijiPatrol(delta);

    if (this.embers) {
      this.embers.rotation.y += delta * 0.06;
    }

    if (this.state.rickshawRolling && !this.state.fireworksExploded) {
      this.rickshawGroup.position.x += 0.18;
      this.rickshawGroup.position.z += 0.32;
      this.rickshawGroup.rotation.y = 0.65;

      this.thugs.forEach((thug) => {
        if (thug.alive) {
          const dist = this.rickshawGroup.position.distanceTo(thug.group.position);
          if (dist < 2.6) {
            thug.alive = false;
            soundManager.playSniperShot();
            this.state.aura += 1250 * this.state.multiplier;

            thug.vel.set(
              (Math.random() - 0.5) * 8 + 4,
              12 + Math.random() * 5,
              (Math.random() - 0.5) * 8 + 6
            );
            thug.rotVel.set(Math.random() * 8, Math.random() * 8, Math.random() * 8);
          }
        }
      });

      const distToCart = this.rickshawGroup.position.distanceTo(this.fireworksGroup.position);
      if (distToCart < 3.2) {
        this.triggerFireworksExplosion();
      }
    }

    this.thugs.forEach((thug) => {
      if (!thug.alive) {
        thug.group.position.addScaledVector(thug.vel, delta);
        thug.group.rotation.x += thug.rotVel.x * delta;
        thug.group.rotation.y += thug.rotVel.y * delta;
        thug.vel.y -= 25 * delta;

        if (thug.group.position.y < 0.2) {
          thug.group.position.y = 0.2;
          thug.vel.set(0, 0, 0);
          thug.rotVel.set(0, 0, 0);
        }
      }
    });

    for (let i = this.fireworkParticles.length - 1; i >= 0; i--) {
      const p = this.fireworkParticles[i];
      p.mesh.position.addScaledVector(p.vel, delta);
      p.vel.y -= 12 * delta;
      p.life -= delta;
      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        this.fireworkParticles.splice(i, 1);
      }
    }

    // Smooth Low-Angle Cinema Camera Follow
    const targetCamX = this.tigerGroup.position.x - 5.5;
    const targetCamZ = this.tigerGroup.position.z + 15.5;
    this.camera.position.x += (targetCamX - this.camera.position.x) * 0.05;
    this.camera.position.z += (targetCamZ - this.camera.position.z) * 0.05;
    this.camera.lookAt(
      this.tigerGroup.position.x + 3.5,
      2.2,
      this.tigerGroup.position.z + 1.0
    );
  }

  private handleMovement(delta: number, keys: { left: boolean; right: boolean; up: boolean; down: boolean }) {
    const speed = this.state.hukumMode ? 3.5 : 5.5;
    const move = new THREE.Vector3();

    if (keys.left) move.x -= 1;
    if (keys.right) move.x += 1;
    if (keys.up) move.z -= 1;
    if (keys.down) move.z += 1;

    if (move.lengthSq() > 0) {
      move.normalize();
      this.tigerGroup.position.addScaledVector(move, speed * delta);
      this.walkTime += delta * 8;
      this.tigerGroup.position.y = Math.abs(Math.sin(this.walkTime)) * 0.09;

      this.footstepTimer += delta;
      if (this.footstepTimer > 0.38) {
        this.footstepTimer = 0;
        soundManager.playFootstep();
      }
    } else {
      this.tigerGroup.position.y = 0;
    }
  }

  private updateVijiPatrol(delta: number) {
    this.vijiTurnTimer += delta;
    if (this.vijiTurnTimer > 3.5) {
      this.vijiTurnTimer = 0;
      this.vijiAngle = (this.vijiAngle + Math.PI / 2) % (Math.PI * 2);
      this.vijiGroup.rotation.y = this.vijiAngle;
    }

    const toTiger = this.tigerGroup.position.clone().sub(this.vijiGroup.position);
    const dist = toTiger.length();

    const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.vijiAngle);
    const dot = forward.dot(toTiger.normalize());

    if (dist < 9 && dot > 0.707) {
      if (this.state.coconutKicked && !this.state.fireworksExploded) {
        this.state.vijiSuspicion = Math.min(100, this.state.vijiSuspicion + 40 * delta);
      } else {
        this.state.vijiSuspicion = Math.max(0, this.state.vijiSuspicion - 10 * delta);
      }

      if (this.state.vijiSuspicion >= 100) {
        this.triggerBusted();
      }
    } else {
      this.state.vijiSuspicion = Math.max(0, this.state.vijiSuspicion - 8 * delta);
    }

    const coneColor = this.state.vijiSuspicion > 50 ? 0xef4444 : 0xfacc15;
    (this.vijiVisionMesh.material as THREE.MeshBasicMaterial).color.setHex(coneColor);

    this.notifyState();
  }

  private triggerFireworksExplosion() {
    if (this.state.fireworksExploded) return;
    this.state.fireworksExploded = true;

    soundManager.playExplosion();

    this.sniperBeams.forEach((b) => this.scene.remove(b));
    this.sniperBeams = [];
    this.sniperReticles.forEach((r) => this.scene.remove(r));
    this.sniperReticles = [];

    const colors = [0xef4444, 0x3b82f6, 0xfacc15, 0x10b981, 0xa855f7, 0xffffff];
    for (let i = 0; i < 75; i++) {
      const pGeo = new THREE.SphereGeometry(0.12 + Math.random() * 0.12, 8, 8);
      const pMat = new THREE.MeshBasicMaterial({ color: colors[i % colors.length] });
      const p = new THREE.Mesh(pGeo, pMat);
      p.position.copy(this.fireworksGroup.position).add(new THREE.Vector3(0, 1.5, 0));
      this.scene.add(p);

      this.fireworkParticles.push({
        mesh: p,
        vel: new THREE.Vector3(
          (Math.random() - 0.5) * 18,
          9 + Math.random() * 14,
          (Math.random() - 0.5) * 18
        ),
        life: 1.3 + Math.random() * 0.9
      });
    }

    this.thugs.forEach((thug) => {
      if (thug.alive) {
        thug.alive = false;
        thug.vel.set((Math.random() - 0.5) * 8, 10 + Math.random() * 6, (Math.random() - 0.5) * 8);
        thug.rotVel.set(Math.random() * 8, Math.random() * 8, Math.random() * 8);
      }
    });

    setTimeout(() => {
      this.triggerVictory();
    }, 1500);
  }

  private triggerVictory() {
    this.state.phase = 'VICTORY';
    this.state.aura += 5000 * this.state.multiplier;
    soundManager.playVictoryFanfare();

    if (this.onDialogue) this.onDialogue('lvl1_victory');

    if (this.onVictory) {
      this.onVictory({
        levelNumber: this.currentLevelId,
        auraScore: this.state.aura,
        starsEarned: 3,
        clearTimeMs: Date.now() - this.startTime,
        spectacleFlipsUsed: 1,
        cameosUsed: ['vimal_taxi']
      });
    }

    this.notifyState();
  }

  private triggerBusted() {
    this.state.phase = 'BUSTED';
    soundManager.playAlert();
    if (this.onDialogue) this.onDialogue('lvl1_viji_warning');
    this.notifyState();
  }

  public retry() {
    this.state = {
      aura: 0,
      multiplier: 1,
      composure: 100,
      vijiSuspicion: 0,
      hukumMode: false,
      phase: 'STEALTH',
      coconutKicked: false,
      rickshawRolling: false,
      fireworksExploded: false
    };

    this.tigerGroup.position.set(-5.2, 0, 0.5);
    this.rickshawGroup.position.set(-1.0, 0, -2.2);
    this.rickshawGroup.rotation.y = 0.4;
    this.coconutMesh.position.set(-3.2, 0.42, -1.2);

    this.thugs.forEach((thug) => {
      thug.alive = true;
      thug.group.rotation.set(0, 0, 0);
      thug.group.position.copy(thug.initialPos);
    });

    this.sniperBeams.forEach((b) => this.scene.remove(b));
    this.sniperBeams = [];
    this.sniperReticles.forEach((r) => this.scene.remove(r));
    this.sniperReticles = [];

    this.startTime = Date.now();
    this.notifyState();
  }

  private notifyState() {
    if (this.onStateUpdate) {
      this.onStateUpdate({ ...this.state });
    }
  }
}
